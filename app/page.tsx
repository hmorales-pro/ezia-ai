"use client";

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Wand2, Sparkles, Eye, Code, Download, Save, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsivePreview } from '@/components/editor/responsive-preview';
import { cn } from '@/lib/utils';

interface SiteEvent {
  type: 'theme' | 'page' | 'block' | 'assets' | 'site' | 'complete' | 'error';
  payload: any;
}

interface SiteData {
  id: string;
  title: string;
  description: string;
  locale: string;
  theme?: any;
  pages: any[];
  navigation: {
    header: any;
    footer: any;
  };
  assets: any[];
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [html, setHtml] = useState('');
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [events, setEvents] = useState<SiteEvent[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initialize from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const promptParam = params.get('prompt');
    const businessNameParam = params.get('businessName');
    const businessIdParam = params.get('businessId');
    
    if (promptParam) setPrompt(promptParam);
    if (businessNameParam) setBusinessName(businessNameParam);
    if (businessIdParam) setBusinessId(businessIdParam);
  }, []);

  // Handle SSE events
  const handleSSEEvent = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      setEvents(prev => [...prev, data]);
      
      switch (data.type) {
        case 'theme':
          setSiteData(prev => prev ? { ...prev, theme: data.payload } : null);
          break;
          
        case 'page':
          setSiteData(prev => {
            if (!prev) return null;
            return {
              ...prev,
              pages: [...prev.pages, data.payload]
            };
          });
          break;
          
        case 'block':
          setSiteData(prev => {
            if (!prev || prev.pages.length === 0) return prev;
            const lastPage = prev.pages[prev.pages.length - 1];
            const updatedPages = [...prev.pages];
            updatedPages[updatedPages.length - 1] = {
              ...lastPage,
              blocks: [...(lastPage.blocks || []), data.payload]
            };
            return { ...prev, pages: updatedPages };
          });
          break;
          
        case 'site':
          setHtml(data.payload.html);
          setSiteData(data.payload.site);
          setHasGenerated(true);
          toast.success('Site généré avec succès !');
          break;
          
        case 'complete':
          setIsGenerating(false);
          break;
          
        case 'error':
          toast.error(data.payload.message);
          setIsGenerating(false);
          break;
      }
    } catch (error) {
      console.error('Error parsing SSE event:', error);
    }
  };

  // Generate site
  const generateSite = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez entrer une description');
      return;
    }

    setIsGenerating(true);
    setEvents([]);
    setHtml('');
    setSiteData(null);
    setHasGenerated(false);

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Build URL with parameters
      const params = new URLSearchParams({
        prompt: prompt.trim(),
        ...(businessName && { businessName }),
        ...(businessId && { businessId })
      });

      // Create new EventSource connection
      eventSourceRef.current = new EventSource(`/api/generate/stream?${params}`);
      
      eventSourceRef.current.onmessage = handleSSEEvent;
      eventSourceRef.current.onerror = () => {
        toast.error('Erreur de connexion au serveur');
        setIsGenerating(false);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };

    } catch (error) {
      toast.error('Erreur lors de la génération');
      setIsGenerating(false);
    }
  };

  // Update iframe when HTML changes
  useEffect(() => {
    if (iframeRef.current && html) {
      iframeRef.current.srcdoc = html;
    }
  }, [html]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Générateur de Sites Web IA
                </h1>
                <p className="text-sm text-slate-600">
                  Architecture modulaire avec streaming SSE
                </p>
              </div>
            </div>
            
            {hasGenerated && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${siteData?.title || 'site'}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('Site téléchargé !');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!hasGenerated && !isGenerating ? (
          /* Initial Form */
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-slate-900 mb-4">
                  Créez votre site web en temps réel
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Notre architecture modulaire génère des sites web complets avec streaming SSE, validation JSON et rendu dynamique.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* System Info */}
                <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Code className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-2">
                        Architecture Modulaire Avancée
                      </h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Streaming SSE pour preview en temps réel</li>
                        <li>• Validation JSON avec Ajv</li>
                        <li>• Renderer de templates modulaire</li>
                        <li>• Composants extensibles avec spec</li>
                        <li>• Support Mistral AI et OpenAI</li>
                      </ul>
                    </div>
                  </div>
                </Alert>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prompt" className="text-lg font-semibold text-slate-900 mb-2">
                      Décrivez votre projet
                    </Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Agence web créative à Strasbourg, ton pro et chaleureux, pages: home/services/contact..."
                      rows={6}
                      className="text-base resize-none border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName" className="font-medium text-slate-700">
                        Nom de l'entreprise (optionnel)
                      </Label>
                      <Input
                        id="businessName"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Mon entreprise"
                        className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessId" className="font-medium text-slate-700">
                        ID Business (optionnel)
                      </Label>
                      <Input
                        id="businessId"
                        value={businessId}
                        onChange={(e) => setBusinessId(e.target.value)}
                        placeholder="bus_123456"
                        className="border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Examples */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Exemples rapides :</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Restaurant gastronomique à Paris",
                      "Agence digitale créative",
                      "Cabinet de conseil",
                      "E-commerce de mode",
                      "Portfolio photographe"
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setPrompt(example)}
                        className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  size="lg"
                  onClick={generateSite}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Générer le site
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Generated Site View */
          <div className="space-y-6">
            {/* Action Bar */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      {isGenerating ? "Génération en temps réel..." : "Votre site est prêt !"}
                    </h2>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <Eye className="w-3 h-3 mr-1" />
                      {events.length} événements
                    </Badge>
                  </div>
                  
                  {/* Live Events */}
                  <div className="flex items-center gap-2 max-w-md">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                        style={{ width: `${Math.min(100, (events.length / 20) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 min-w-fit">
                      {events.filter(e => ['theme', 'page', 'block'].includes(e.type)).length} blocs
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview and Code */}
            <div className={cn(
              "grid gap-6",
              showCode ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"
            )}>
              {/* Preview */}
              <Card className={cn(
                "shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden",
                !showCode && "col-span-full"
              )} style={{ minHeight: "700px" }}>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center justify-between">
                    <span>Aperçu en direct</span>
                    <Button
                      variant={showCode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCode(!showCode)}
                      disabled={isGenerating}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      {showCode ? "Masquer" : "Voir"} le code
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0" style={{ height: "calc(100% - 80px)" }}>
                  <ResponsivePreview
                    html={html}
                    iframeRef={iframeRef}
                  />
                  
                  {/* Generation Overlay */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white animate-pulse" />
                          </div>
                          <div className="absolute -inset-2 bg-purple-200 rounded-full animate-ping opacity-30" />
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            Génération en temps réel
                          </h3>
                          <p className="text-slate-600 max-w-sm">
                            Les événements SSE arrivent au fur et à mesure...
                          </p>
                        </div>
                        
                        {/* Live Event Counter */}
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Streaming actif</span>
                          </div>
                          <span>{events.length} événements reçus</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Code View */}
              {showCode && (
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Code HTML généré
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[600px] bg-slate-900 overflow-auto">
                      <pre className="p-4 text-sm text-slate-100">
                        <code>{html || '// Le code apparaîtra ici...'}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Event Stream */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Flux d'événements SSE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-auto bg-slate-900 rounded-lg p-4">
                  {events.length > 0 ? (
                    <div className="space-y-2">
                      {events.map((event, index) => (
                        <div key={index} className="text-sm font-mono">
                          <span className="text-purple-400">data: </span>
                          <span className="text-slate-300">{JSON.stringify(event)}</span>
                        </div>
                      ))}
                      {isGenerating && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span>En attente d'autres événements...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      {isGenerating ? "En attente des premiers événements..." : "Aucun événement pour l'instant"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder le projet</DialogTitle>
            <DialogDescription>
              Enregistrez votre site web pour y accéder plus tard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="projectName">Nom du projet</Label>
              <Input
                id="projectName"
                defaultValue={siteData?.title || 'Mon site web'}
                placeholder="Mon site web"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectDesc">Description</Label>
              <Textarea
                id="projectDesc"
                defaultValue={siteData?.description || ''}
                placeholder="Description du projet..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowSaveDialog(false)}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
