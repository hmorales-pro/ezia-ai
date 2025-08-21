"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { editor } from "monaco-editor";
import { DynamicMonacoEditor as Editor } from "@/components/utils/dynamic-loader";
import { 
  CopyIcon, Save, History, RefreshCw, Loader2, FileText, 
  ArrowLeft, Globe, Sparkles, Eye, Code, MessageSquare,
  CheckCircle, Clock, Zap, Settings
} from "lucide-react";
import {
  useCopyToClipboard,
  useEvent,
  useLocalStorage,
  useMount,
  useUnmount,
  useUpdateEffect,
} from "react-use";
import classNames from "classnames";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { defaultHTML } from "@/lib/consts";
import { ResponsivePreview } from "@/components/editor/responsive-preview";
import { useEditor } from "@/hooks/useEditor";
import { AskAI } from "@/components/editor/ask-ai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { AI_AGENTS } from "@/lib/ai-agents";

interface EziaIntegratedEditorProps {
  initialPrompt?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  projectId?: string | null;
  onProjectSaved?: (projectId: string) => void;
}

export const EziaIntegratedEditor = ({ 
  initialPrompt,
  businessId,
  businessName,
  projectId,
  onProjectSaved
}: EziaIntegratedEditorProps) => {
  const [htmlStorage, , removeHtmlStorage] = useLocalStorage("html_content");
  const [, copyToClipboard] = useCopyToClipboard();
  const { html, setHtml, htmlHistory, setHtmlHistory, prompts, setPrompts } =
    useEditor((htmlStorage as string) ?? defaultHTML);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);

  const [viewMode, setViewMode] = useState<"split" | "code" | "preview">("split");
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState("");
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [activeAgent, setActiveAgent] = useState<string>("vera");
  
  const [saveData, setSaveData] = useState({
    name: businessName ? `Site web de ${businessName}` : "Mon site web",
    description: "Site web généré avec Ezia",
  });

  // Charger le projet si projectId est fourni
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  // Lancer la génération initiale si prompt fourni
  useEffect(() => {
    if (initialPrompt && !projectId) {
      // Déclencher la génération automatique
      setTimeout(() => {
        const submitButton = document.querySelector("#ai-chat-form button[type='submit']");
        if (submitButton instanceof HTMLButtonElement) {
          submitButton.click();
        }
      }, 1000);
    }
  }, [initialPrompt, projectId]);

  const loadProject = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/user-projects/${id}`);
      if (response.data.ok) {
        const loadedProject = response.data.project;
        setProject(loadedProject);
        setHtml(loadedProject.html);
        setSaveData({
          name: loadedProject.name,
          description: loadedProject.description
        });
        toast.success("Projet chargé avec succès");
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Erreur lors du chargement du projet");
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      const projectData = {
        businessId,
        businessName,
        name: saveData.name,
        description: saveData.description,
        html,
        css: extractCSSFromHTML(html),
        js: extractJSFromHTML(html),
        prompt: initialPrompt || prompts[prompts.length - 1] || "Site généré",
        generatedBy: "ezia-ai",
        industry: "general",
        targetAudience: "tous publics",
        features: ["responsive", "modern", "seo-friendly"]
      };

      let response;
      if (project?.id) {
        response = await api.put(`/api/user-projects/${project.id}`, {
          ...projectData,
          changeDescription: modificationPrompt || "Modification manuelle"
        });
      } else {
        response = await api.post("/api/user-projects", projectData);
      }

      if (response.data.ok) {
        setProject(response.data.project);
        toast.success(project?.id ? "Projet mis à jour" : "Projet sauvegardé");
        setShowSaveDialog(false);
        if (onProjectSaved) {
          onProjectSaved(response.data.project.id);
        }
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const applyModification = async () => {
    if (!modificationPrompt.trim()) {
      toast.error("Veuillez entrer une modification");
      return;
    }

    const aiComponent = document.querySelector('[data-ai-component]');
    if (aiComponent) {
      const event = new CustomEvent('ai-modify', { 
        detail: { prompt: modificationPrompt } 
      });
      aiComponent.dispatchEvent(event);
      setModificationPrompt("");
    }
  };

  const extractCSSFromHTML = (html: string): string => {
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatch) {
      return styleMatch.map(style => 
        style.replace(/<\/?style[^>]*>/gi, '')
      ).join('\n');
    }
    return '';
  };

  const extractJSFromHTML = (html: string): string => {
    const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatch) {
      return scriptMatch.map(script => 
        script.replace(/<\/?script[^>]*>/gi, '')
      ).join('\n');
    }
    return '';
  };

  const loadVersion = (version: any) => {
    setHtml(version.html);
    setShowVersionHistory(false);
    toast.success(`Version ${version.version} chargée`);
  };

  useUpdateEffect(() => {
    localStorage.setItem("html_content", html);
  }, [html]);

  const handleEditorValidation = (markers: editor.IMarker[]) => {
    markers.forEach((marker) => console.log("onValidate:", marker.message));
  };

  const handleOnChange = () => {
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = html;
      }
    }, 300);
  };

  useUpdateEffect(() => {
    handleOnChange();
  }, [html]);

  useMount(() => {
    const queryPrompt = searchParams.get("prompt");
    if (queryPrompt) {
      removeHtmlStorage();
      setHtml(defaultHTML);
    }
  });

  useUnmount(() => {
    editorRef.current?.dispose();
    monacoRef.current = null;
  });

  useEvent("keydown", (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const submitButton = document.querySelector(
        "#ai-chat-form button[type='submit']"
      );
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.click();
      }
    }
  });

  return (
    <div className="h-screen flex flex-col bg-[#FAF9F5]">
      {/* Header Ezia intégré */}
      <header className="bg-white border-b border-[#E0E0E0] shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
                <h1 className="text-xl font-semibold text-[#1E1E1E]">
                  Éditeur de site Ezia
                </h1>
              </div>

              {businessName && (
                <Badge variant="secondary" className="gap-2">
                  <Globe className="w-3 h-3" />
                  {businessName}
                </Badge>
              )}
              
              {project && (
                <Badge variant="outline">
                  Version {project.version}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgentPanel(!showAgentPanel)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Agents
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionHistory(true)}
                disabled={!project || !project.versions || project.versions.length <= 1}
              >
                <History className="w-4 h-4 mr-2" />
                Historique
              </Button>
              
              <Button
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={saving}
                className="bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {project ? "Mettre à jour" : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </div>

        {/* Barre de modification rapide */}
        <div className="bg-gray-50 px-4 py-3 border-t border-[#E0E0E0]">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Input
              placeholder="Décrivez la modification souhaitée (ex: changer la couleur du header en bleu)"
              value={modificationPrompt}
              onChange={(e) => setModificationPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  applyModification();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={applyModification}
              disabled={!modificationPrompt.trim() || isAiWorking}
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* Contrôles de vue */}
        <div className="bg-white px-4 py-2 border-t border-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="split" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Vue partagée
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code className="w-4 h-4" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Aperçu
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              {isAiWorking && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Génération en cours...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex overflow-hidden">
        {/* Panel des agents */}
        {showAgentPanel && (
          <div className="w-80 bg-white border-r border-[#E0E0E0] flex flex-col">
            <div className="p-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-lg mb-2">Équipe d'agents Ezia</h3>
              <p className="text-sm text-gray-600">
                Sélectionnez un agent pour obtenir de l'aide spécialisée
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {Object.values(AI_AGENTS).slice(1).map((agent) => (
                <Card
                  key={agent.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:shadow-md",
                    activeAgent === agent.id && "border-[#6D3FC8] bg-purple-50"
                  )}
                  onClick={() => setActiveAgent(agent.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{agent.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{agent.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{agent.role}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agent.expertise.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Status de génération */}
            <div className="p-4 border-t border-[#E0E0E0] bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Statut</span>
                {isAiWorking ? (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    En cours
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Prêt
                  </Badge>
                )}
              </div>
              {prompts.length > 0 && (
                <p className="text-xs text-gray-600">
                  {prompts.length} modification{prompts.length > 1 ? 's' : ''} effectuée{prompts.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Zone d'édition */}
        <div className="flex-1 flex">
          {/* Éditeur de code */}
          {(viewMode === "split" || viewMode === "code") && (
            <div className={cn(
              "bg-[#1e1e1e] relative overflow-hidden flex flex-col",
              viewMode === "split" ? "w-1/2" : "flex-1"
            )}>
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    copyToClipboard(html);
                    toast.success("Code copié!");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </div>
              
              <Editor
                defaultLanguage="html"
                theme="vs-dark"
                className="h-full"
                options={{
                  colorDecorators: true,
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollbar: { horizontal: "hidden" },
                  wordWrap: "on",
                }}
                value={html}
                onChange={(value) => setHtml(value ?? "")}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                }}
                onValidate={handleEditorValidation}
              />
              
              {/* Chat AI intégré */}
              <div data-ai-component className="absolute bottom-0 left-0 right-0">
                <AskAI
                  html={html}
                  setHtml={setHtml}
                  htmlHistory={htmlHistory}
                  initialPrompt={initialPrompt}
                  businessId={businessId}
                  onSuccess={(finalHtml, p, updatedLines) => {
                    const currentHistory = [...htmlHistory];
                    currentHistory.unshift({
                      html: finalHtml,
                      createdAt: new Date(),
                      prompt: p,
                    });
                    setHtmlHistory(currentHistory);
                    
                    if (updatedLines && updatedLines?.length > 0) {
                      const decorations = updatedLines.map((line) => ({
                        range: new monacoRef.current.Range(
                          line[0], 1, line[1], 1
                        ),
                        options: { inlineClassName: "matched-line" },
                      }));
                      setTimeout(() => {
                        editorRef?.current
                          ?.getModel()
                          ?.deltaDecorations([], decorations);
                        editorRef.current?.revealLine(updatedLines[0][0]);
                      }, 100);
                    }
                  }}
                  isAiWorking={isAiWorking}
                  setisAiWorking={setIsAiWorking}
                  onNewPrompt={(prompt) => setPrompts((prev) => [...prev, prompt])}
                  onScrollToBottom={() => {
                    editorRef.current?.revealLine(
                      editorRef.current?.getModel()?.getLineCount() ?? 0
                    );
                  }}
                />
              </div>
            </div>
          )}

          {/* Aperçu */}
          {(viewMode === "split" || viewMode === "preview") && (
            <div className={cn(
              "bg-white relative overflow-hidden",
              viewMode === "split" ? "w-1/2" : "flex-1"
            )}>
              <ResponsivePreview
                html={html}
                iframeRef={iframeRef}
                className="h-full"
              />
            </div>
          )}
        </div>
      </main>

      {/* Dialog de sauvegarde */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {project ? "Mettre à jour le projet" : "Sauvegarder le projet"}
            </DialogTitle>
            <DialogDescription>
              Donnez un nom et une description à votre projet
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du projet</Label>
              <Input
                id="name"
                value={saveData.name}
                onChange={(e) => setSaveData({ ...saveData, name: e.target.value })}
                placeholder="Mon site web"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={saveData.description}
                onChange={(e) => setSaveData({ ...saveData, description: e.target.value })}
                placeholder="Description du projet..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annuler
            </Button>
            <Button onClick={saveProject} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {project ? "Mettre à jour" : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog historique des versions */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique des versions</DialogTitle>
            <DialogDescription>
              Sélectionnez une version pour la restaurer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            {project?.versions?.map((version: any) => (
              <Card
                key={version.version}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => loadVersion(version)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Version {version.version}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(version.createdAt).toLocaleString('fr-FR')}
                    </p>
                    {version.changeDescription && (
                      <p className="text-sm text-gray-500 mt-1">
                        {version.changeDescription}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Par {version.createdBy}
                    </p>
                  </div>
                  {version.version === project.version && (
                    <Badge>Actuelle</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};