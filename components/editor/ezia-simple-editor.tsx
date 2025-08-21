"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { editor } from "monaco-editor";
import { DynamicMonacoEditor as Editor } from "@/components/utils/dynamic-loader";
import { 
  ArrowLeft, Globe, Sparkles, Eye, Code, MessageSquare,
  CheckCircle, Clock, Wand2, Info, ChevronRight,
  Loader2, Save, Download, Share2, RefreshCw
} from "lucide-react";
import {
  useCopyToClipboard,
  useEvent,
  useLocalStorage,
  useMount,
  useUnmount,
  useUpdateEffect,
} from "react-use";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { defaultHTML } from "@/lib/consts";
import { ResponsivePreview } from "@/components/editor/responsive-preview";
import { useEditor } from "@/hooks/useEditor";
import { AskAI } from "@/components/editor/ask-ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { AI_AGENTS } from "@/lib/ai-agents";
import { cn } from "@/lib/utils";

interface EziaSimpleEditorProps {
  initialPrompt?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  projectId?: string | null;
  onProjectSaved?: (projectId: string) => void;
}

export const EziaSimpleEditor = ({ 
  initialPrompt,
  businessId,
  businessName,
  projectId,
  onProjectSaved
}: EziaSimpleEditorProps) => {
  const [htmlStorage, , removeHtmlStorage] = useLocalStorage("html_content");
  const [, copyToClipboard] = useCopyToClipboard();
  const { html, setHtml, htmlHistory, setHtmlHistory, prompts, setPrompts } =
    useEditor((htmlStorage as string) ?? defaultHTML);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<any>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const [saveData, setSaveData] = useState({
    name: businessName ? `Site web de ${businessName}` : "Mon site web",
    description: "Site web généré avec Ezia",
  });

  // Steps de génération
  const generationSteps = [
    { label: "Analyse du brief", icon: MessageSquare },
    { label: "Création de la structure", icon: Code },
    { label: "Design et mise en page", icon: Wand2 },
    { label: "Optimisation finale", icon: CheckCircle }
  ];

  // Charger le projet si projectId est fourni
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  // Lancer la génération automatique si prompt initial
  useEffect(() => {
    if (initialPrompt && !projectId && !hasGenerated) {
      generateWebsite();
    }
  }, [initialPrompt, projectId, hasGenerated]);

  const loadProject = async (id: string) => {
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
        setHasGenerated(true);
        toast.success("Projet chargé avec succès");
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Erreur lors du chargement du projet");
    }
  };

  const generateWebsite = async () => {
    if (!initialPrompt && !modificationPrompt) return;
    
    setIsGenerating(true);
    setGenerationStep(0);
    
    // Démarrer l'animation des étapes
    const stepAnimation = async () => {
      for (let i = 0; i < generationSteps.length; i++) {
        setGenerationStep(i);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s par étape
      }
    };
    
    // Lancer l'animation et la génération en parallèle
    const animationPromise = stepAnimation();
    
    // Déclencher la génération réelle via AskAI
    const aiComponent = document.querySelector('[data-ai-component]');
    if (aiComponent) {
      const promptToUse = modificationPrompt || initialPrompt;
      // Définir le prompt directement dans le composant AskAI
      const promptInput = aiComponent.querySelector('textarea');
      if (promptInput) {
        (promptInput as HTMLTextAreaElement).value = promptToUse || '';
      }
      
      // Déclencher la soumission du formulaire
      const form = aiComponent.querySelector('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
    
    // Attendre que l'animation soit terminée avant de masquer le loader
    await animationPromise;
    
    // Note: setIsGenerating(false) sera appelé par le callback dans AskAI
    setHasGenerated(true);
    setModificationPrompt("");
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
          changeDescription: "Mise à jour du site"
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

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveData.name || 'site'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Site téléchargé !");
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

  return (
    <div className="min-h-screen bg-[#ebe7e1]">
      {/* Header simplifié */}
      <header className="bg-white border-b border-[#E0E0E0] shadow-sm sticky top-0 z-50">
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
                  Création de site web
                </h1>
              </div>

              {businessName && (
                <Badge variant="secondary" className="gap-2">
                  <Globe className="w-3 h-3" />
                  {businessName}
                </Badge>
              )}
            </div>
            
            {hasGenerated && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
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
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Zone principale */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!hasGenerated && !isGenerating ? (
          /* État initial - Zone de modification unique */
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Créez votre site web en quelques secondes
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Décrivez ce que vous souhaitez et laissez notre équipe d'agents créer votre site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Info sur les agents */}
                <Alert className="bg-purple-50 border-purple-200">
                  <Info className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>Votre équipe :</strong> Vera (contenu), Kiko (code), Milo (design) et Yuna (UX) travailleront ensemble pour créer votre site.
                  </AlertDescription>
                </Alert>

                {/* Zone de prompt unique */}
                <div className="space-y-3">
                  <Label htmlFor="prompt" className="text-lg font-medium">
                    Que souhaitez-vous créer ?
                  </Label>
                  <Textarea
                    id="prompt"
                    value={modificationPrompt || initialPrompt || ""}
                    onChange={(e) => setModificationPrompt(e.target.value)}
                    placeholder="Ex: Un site vitrine moderne pour mon restaurant italien avec un menu, des photos et les horaires d'ouverture..."
                    rows={6}
                    className="text-base"
                  />
                  <p className="text-sm text-gray-600">
                    Soyez précis sur vos besoins : type de site, couleurs préférées, sections souhaitées, style général...
                  </p>
                </div>

                {/* Suggestions rapides */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Suggestions rapides :</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Site vitrine professionnel",
                      "Portfolio créatif",
                      "Landing page produit",
                      "Site e-commerce simple"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setModificationPrompt(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bouton de génération */}
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#6D3FC8] to-[#5A35A5] hover:from-[#5A35A5] hover:to-[#4A2B87] text-white"
                  onClick={generateWebsite}
                  disabled={!modificationPrompt && !initialPrompt}
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Créer mon site
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : isGenerating ? (
          /* État de génération */
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="py-12">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full animate-pulse">
                    <Sparkles className="w-10 h-10 text-[#6D3FC8]" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">
                      Création en cours...
                    </h3>
                    <p className="text-gray-600">
                      Notre équipe d'agents travaille sur votre site
                    </p>
                  </div>

                  {/* Étapes de génération */}
                  <div className="space-y-4 max-w-md mx-auto">
                    {generationSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index === generationStep;
                      const isCompleted = index < generationStep;
                      
                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all",
                            isActive && "bg-purple-50 border border-purple-200",
                            isCompleted && "opacity-60"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            isActive && "bg-[#6D3FC8] text-white",
                            isCompleted && "bg-green-500 text-white",
                            !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                          )}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <span className={cn(
                            "font-medium",
                            isActive && "text-[#6D3FC8]",
                            !isActive && !isCompleted && "text-gray-500"
                          )}>
                            {step.label}
                          </span>
                          {isActive && (
                            <Loader2 className="w-4 h-4 animate-spin ml-auto text-[#6D3FC8]" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Progress value={(generationStep + 1) * 25} className="max-w-md mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* État avec site généré */
          <div className="space-y-6">
            {/* Barre d'actions */}
            <Card className="shadow-md">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <h2 className="text-lg font-semibold">Votre site est prêt !</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showCode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCode(!showCode)}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        {showCode ? "Masquer" : "Voir"} le code
                      </Button>
                    </div>
                  </div>
                  
                  {/* Zone de modification simplifiée */}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Modifier quelque chose..."
                      value={modificationPrompt}
                      onChange={(e) => setModificationPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && modificationPrompt) {
                          generateWebsite();
                        }
                      }}
                      className="w-80"
                    />
                    <Button
                      size="sm"
                      onClick={generateWebsite}
                      disabled={!modificationPrompt}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aperçu et code */}
            <div className={cn(
              "grid gap-6",
              showCode ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"
            )}>
              {/* Aperçu avec contrôles responsive */}
              <Card className={cn(
                "shadow-lg overflow-hidden",
                !showCode && "col-span-full"
              )} style={{ minHeight: "700px" }}>
                <CardHeader>
                  <CardTitle className="text-lg">Aperçu du site</CardTitle>
                </CardHeader>
                <CardContent className="p-0" style={{ height: "calc(100% - 80px)" }}>
                  <ResponsivePreview
                    html={html}
                    iframeRef={iframeRef}
                  />
                </CardContent>
              </Card>

              {/* Code (si visible) */}
              {showCode && (
                <Card className="shadow-lg overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Code HTML
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          copyToClipboard(html);
                          toast.success("Code copié!");
                        }}
                      >
                        Copier
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[600px]">
                      <Editor
                        defaultLanguage="html"
                        theme="vs-dark"
                        value={html}
                        onChange={(value) => setHtml(value ?? "")}
                        onMount={(editor, monaco) => {
                          editorRef.current = editor;
                          monacoRef.current = monaco;
                        }}
                        onValidate={handleEditorValidation}
                        options={{
                          minimap: { enabled: false },
                          scrollbar: { horizontal: "hidden" },
                          wordWrap: "on",
                          readOnly: false,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat AI caché pour la génération */}
      <div data-ai-component className="hidden">
        <AskAI
          html={html}
          setHtml={(newHtml: string) => {
            setHtml(newHtml);
            setIsGenerating(false);
          }}
          htmlHistory={htmlHistory}
          initialPrompt={initialPrompt}
          businessId={businessId}
          onSuccess={(finalHtml, p) => {
            const currentHistory = [...htmlHistory];
            currentHistory.unshift({
              html: finalHtml,
              createdAt: new Date(),
              prompt: p,
            });
            setHtmlHistory(currentHistory);
            setPrompts((prev) => [...prev, p]);
          }}
          isAiWorking={isGenerating}
          setisAiWorking={setIsGenerating}
          onNewPrompt={(prompt) => setPrompts((prev) => [...prev, prompt])}
          onScrollToBottom={() => {}}
        />
      </div>

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
    </div>
  );
};