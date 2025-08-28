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
  const [showCode, setShowCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [modificationHistory, setModificationHistory] = useState<string[]>([]);
  const [useEnhancedGeneration, setUseEnhancedGeneration] = useState(false); // Désactivé pour le moment
  
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

  // Lancer la génération automatique si prompt initial
  useEffect(() => {
    if (initialPrompt && !projectId && !hasGenerated) {
      generateWebsite();
    }
  }, [initialPrompt, projectId, hasGenerated]);

  const loadProject = async (id: string) => {
    try {
      console.log("Loading project with ID:", id);
      const response = await api.get(`/api/user-projects/${id}`);
      console.log("Project response:", response.data);
      
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
      } else {
        console.error("Project not found:", response.data);
        toast.error("Projet non trouvé");
        // Si le projet n'existe pas, permettre de voir quand même l'éditeur
        setHasGenerated(true);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error("Erreur lors du chargement du projet");
      // En cas d'erreur, permettre de voir quand même l'éditeur
      setHasGenerated(true);
    }
  };

  const generateWebsite = async () => {
    if (!initialPrompt && !modificationPrompt) return;
    
    setIsGenerating(true);
    toast.info("Génération en cours...");
    
    try {
      const promptToUse = modificationPrompt || initialPrompt || "";
      console.log("Generating with prompt:", promptToUse);
      
      let response;
      
      if (!hasGenerated && useEnhancedGeneration) {
        // Première génération avec Mixtral pour une meilleure qualité
        console.log("Using enhanced generation with Mixtral");
        response = await api.post("/api/generate-website-v2", {
          businessInfo: {
            name: businessName || "Mon entreprise",
            description: promptToUse,
            industry: businessId ? "Services professionnels" : undefined
          }
        });
        
        if (response.data.ok && response.data.html) {
          const newHtml = response.data.html;
          setHtml(newHtml);
          setHasGenerated(true);
          toast.success("Site généré avec succès !");
          
          // Mettre à jour l'historique
          const currentHistory = [...htmlHistory];
          currentHistory.unshift({
            html: newHtml,
            createdAt: new Date(),
            prompt: promptToUse,
          });
          setHtmlHistory(currentHistory);
          setPrompts((prev) => [...prev, promptToUse]);
        } else {
          throw new Error("Erreur dans la génération améliorée");
        }
      } else {
        // Modifications avec l'API standard
        response = await api.put("/api/ask-ai", {
          prompt: promptToUse,
          provider: "novita",
          model: "deepseek-ai/DeepSeek-V3-0324",
          html: html,
          businessId: businessId,
          isFollowUp: true
        });
        
        if (response.data.html || response.data.finalHtml) {
          const newHtml = response.data.html || response.data.finalHtml;
          setHtml(newHtml);
          setHasGenerated(true);
          toast.success("Modification appliquée avec succès !");
          
          // Mettre à jour l'historique
          const currentHistory = [...htmlHistory];
          currentHistory.unshift({
            html: newHtml,
            createdAt: new Date(),
            prompt: promptToUse,
          });
          setHtmlHistory(currentHistory);
          setPrompts((prev) => [...prev, promptToUse]);
          
          if (modificationPrompt) {
            setModificationHistory(prev => [...prev, modificationPrompt]);
          }
        } else {
          console.error("No HTML in response:", response.data);
          toast.error("Erreur lors de la génération");
        }
      }
      
      // Mettre à jour l'iframe immédiatement
      if (iframeRef.current && html) {
        iframeRef.current.srcdoc = html;
      }
    } catch (error) {
      console.error("Error generating website:", error);
      toast.error("Erreur lors de la génération du site");
    } finally {
      setIsGenerating(false);
      setHasGenerated(true);
      setModificationPrompt("");
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

                {/* Option de génération améliorée - Désactivée pour le moment */}
                {/* <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">Génération améliorée</p>
                      <p className="text-sm text-purple-700">Utilise Mixtral pour une meilleure qualité</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useEnhancedGeneration}
                      onChange={(e) => setUseEnhancedGeneration(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div> */}

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
                
                {/* Bouton pour passer à l'éditeur si un projet existe */}
                {projectId && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setHasGenerated(true)}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Voir le site existant
                  </Button>
                )}
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
                    <h2 className="text-lg font-semibold">
                      {isGenerating ? "Modification en cours..." : "Votre site est prêt !"}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showCode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCode(!showCode)}
                        disabled={isGenerating}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        {showCode ? "Masquer" : "Voir"} le code
                      </Button>
                    </div>
                  </div>
                  
                  {/* Zone de modification simplifiée */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 max-w-md">
                        <Input
                          placeholder="Ex: Changer la couleur en bleu, ajouter une section contact..."
                          value={modificationPrompt}
                          onChange={(e) => setModificationPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && modificationPrompt && !isGenerating) {
                              generateWebsite();
                            }
                          }}
                          disabled={isGenerating}
                          className="pr-10"
                        />
                        {modificationPrompt && (
                          <button
                            onClick={() => setModificationPrompt("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={generateWebsite}
                        disabled={!modificationPrompt || isGenerating}
                        className={cn(
                          "min-w-[120px]",
                          isGenerating && "animate-pulse"
                        )}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            En cours...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Modifier
                          </>
                        )}
                      </Button>
                    </div>
                    {/* Suggestions de modifications */}
                    {!modificationPrompt && !isGenerating && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Essayez:</span>
                        {[
                          "Changer les couleurs",
                          "Ajouter des animations",
                          "Modifier le texte",
                          "Ajouter une section"
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => setModificationPrompt(suggestion)}
                            className="text-xs text-[#6D3FC8] hover:text-[#5A35A5] hover:underline"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Historique des modifications */}
                    {modificationHistory.length > 0 && !isGenerating && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">Modifications récentes:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {modificationHistory.slice(-3).map((mod, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                "shadow-lg overflow-hidden relative",
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
                  {/* Overlay de chargement pendant la génération */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-[#6D3FC8] mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Application des modifications...
                          </h3>
                          <p className="text-gray-600 max-w-sm">
                            Notre équipe d'agents travaille sur vos demandes
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Info className="w-4 h-4" />
                          <span>Cela peut prendre quelques secondes</span>
                        </div>
                      </div>
                    </div>
                  )}
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