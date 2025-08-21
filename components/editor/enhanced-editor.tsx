"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { editor } from "monaco-editor";
import { DynamicMonacoEditor as Editor } from "@/components/utils/dynamic-loader";
import { CopyIcon, Save, History, RefreshCw, Loader2, FileText, ArrowLeft } from "lucide-react";
import {
  useCopyToClipboard,
  useEvent,
  useLocalStorage,
  useMount,
  useUnmount,
  useUpdateEffect,
} from "react-use";
import classNames from "classnames";
import { useRouter, useSearchParams } from "next/navigation";

import { Header } from "@/components/editor/header";
import { Footer } from "@/components/editor/footer";
import { defaultHTML } from "@/lib/consts";
import { Preview } from "@/components/editor/preview";
import { useEditor } from "@/hooks/useEditor";
import { AskAI } from "@/components/editor/ask-ai";
import { DeployButton } from "./deploy-button";
import { SaveButton } from "./save-button";
import { LoadProject } from "../my-projects/load-project";
import { isTheSameHtml } from "@/lib/compare-html-diff";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

interface EnhancedEditorProps {
  initialPrompt?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  projectId?: string | null;
  onProjectSaved?: (projectId: string) => void;
}

export const EnhancedEditor = ({ 
  initialPrompt,
  businessId,
  businessName,
  projectId,
  onProjectSaved
}: EnhancedEditorProps) => {
  const [htmlStorage, , removeHtmlStorage] = useLocalStorage("html_content");
  const [, copyToClipboard] = useCopyToClipboard();
  const { html, setHtml, htmlHistory, setHtmlHistory, prompts, setPrompts } =
    useEditor((htmlStorage as string) ?? defaultHTML);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const deploy = searchParams.get("deploy") === "true";

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);

  const [currentTab, setCurrentTab] = useState<"preview" | "chat">("chat");
  const [selectedElement, setSelectedElement] = useState<null | string>(null);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState("");
  
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
        // Mise à jour
        response = await api.put(`/api/user-projects/${project.id}`, {
          ...projectData,
          changeDescription: modificationPrompt || "Modification manuelle"
        });
      } else {
        // Création
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

    // Utiliser le système AskAI existant pour appliquer la modification
    const aiComponent = document.querySelector('[data-ai-component]');
    if (aiComponent) {
      // Déclencher la modification via l'interface AI
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
    if (queryPrompt && !isTheSameHtml(html, defaultHTML)) {
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
    <div className="h-screen flex flex-col">
      <Header 
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        html={html}
        prompts={prompts}
        deploy={deploy}
      />
      
      {/* Actions supplémentaires dans le header */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {project && (
            <>
              <Badge variant="secondary" className="gap-2">
                <FileText className="w-3 h-3" />
                {project.name}
              </Badge>
              <Badge variant="outline">
                Version {project.version}
              </Badge>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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

      {/* Zone de modification rapide */}
      {project && (
        <div className="bg-neutral-800 px-4 py-3 border-b border-neutral-700">
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
              className="flex-1 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-400"
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
      )}

      <main className="bg-neutral-950 flex-1 max-lg:flex-col flex w-full max-lg:h-[calc(100%-82px)] relative">
        {currentTab === "chat" && (
          <>
            <div
              ref={editor}
              className="bg-neutral-900 relative flex-1 overflow-hidden h-full flex flex-col gap-2 pb-3"
            >
              <CopyIcon
                className="size-4 absolute top-2 right-5 text-neutral-500 hover:text-neutral-300 z-2 cursor-pointer"
                onClick={() => {
                  copyToClipboard(html);
                  toast.success("HTML copié!");
                }}
              />
              <Editor
                defaultLanguage="html"
                theme="vs-dark"
                className={classNames(
                  "h-full bg-neutral-900 transition-all duration-200 absolute left-0 top-0",
                  {
                    "pointer-events-none": isAiWorking,
                  }
                )}
                options={{
                  colorDecorators: true,
                  fontLigatures: true,
                  theme: "vs-dark",
                  minimap: { enabled: false },
                  scrollbar: {
                    horizontal: "hidden",
                  },
                  wordWrap: "on",
                }}
                value={html}
                onChange={(value) => {
                  const newValue = value ?? "";
                  setHtml(newValue);
                }}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                }}
                onValidate={handleEditorValidation}
              />
              <div data-ai-component>
                <AskAI
                  html={html}
                  setHtml={(newHtml: string) => {
                    setHtml(newHtml);
                  }}
                  htmlHistory={htmlHistory}
                  initialPrompt={initialPrompt}
                  businessId={businessId}
                  onSuccess={(
                    finalHtml: string,
                    p: string,
                    updatedLines?: number[][]
                  ) => {
                    const currentHistory = [...htmlHistory];
                    currentHistory.unshift({
                      html: finalHtml,
                      createdAt: new Date(),
                      prompt: p,
                    });
                    setHtmlHistory(currentHistory);
                    setSelectedElement(null);
                    if (window.innerWidth <= 1024) {
                      setCurrentTab("preview");
                    }
                    if (updatedLines && updatedLines?.length > 0) {
                      const decorations = updatedLines.map((line) => ({
                        range: new monacoRef.current.Range(
                          line[0],
                          1,
                          line[1],
                          1
                        ),
                        options: {
                          inlineClassName: "matched-line",
                        },
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
                  onNewPrompt={(prompt: string) => {
                    setPrompts((prev) => [...prev, prompt]);
                  }}
                  onScrollToBottom={() => {
                    editorRef.current?.revealLine(
                      editorRef.current?.getModel()?.getLineCount() ?? 0
                    );
                  }}
                />
              </div>
            </div>
            <div
              ref={preview}
              className={classNames(
                "bg-neutral-900 h-full flex flex-col gap-4 flex-1 relative max-lg:hidden"
              )}
            >
              <Preview
                html={html}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                iframeRef={iframeRef}
              />
            </div>
          </>
        )}
        {currentTab === "preview" && (
          <>
            <div
              ref={preview}
              className={classNames(
                "bg-neutral-900 h-full flex flex-col gap-4 flex-1 lg:hidden"
              )}
            >
              <Preview
                html={html}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                iframeRef={iframeRef}
              />
            </div>
          </>
        )}
      </main>
      
      <Footer />

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