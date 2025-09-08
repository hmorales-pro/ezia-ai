"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Sparkles, 
  Loader2, 
  Bot,
  User,
  Maximize2,
  Minimize2,
  X,
  MessageSquare,
  History,
  Plus,
  Brain,
  Target,
  TrendingUp,
  Globe,
  FileText,
  Calendar
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  metadata?: {
    agent?: string;
    actionType?: string;
    status?: 'success' | 'error' | 'pending';
  };
}

export interface ChatSession {
  id: string;
  businessId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: string;
}

export type ChatMode = 'general' | 'analysis' | 'content' | 'strategy' | 'website' | 'onboarding';

interface EziaUnifiedChatProps {
  businessId: string;
  businessName: string;
  mode?: ChatMode;
  initialContext?: string;
  onActionComplete?: (result: any) => void;
  className?: string;
  onMinimize?: () => void;
  onClose?: () => void;
}

// Quick actions par mode
const quickActionsByMode: Record<ChatMode, Array<{icon: any, label: string, prompt: string}>> = {
  general: [
    { icon: Brain, label: "Analyser mon business", prompt: "Peux-tu analyser mon business et me donner des recommandations ?" },
    { icon: Target, label: "Définir des objectifs", prompt: "Aide-moi à définir des objectifs SMART pour mon entreprise" },
    { icon: TrendingUp, label: "Stratégie de croissance", prompt: "Quelles stratégies de croissance recommandes-tu ?" },
  ],
  analysis: [
    { icon: TrendingUp, label: "Analyse de marché", prompt: "Fais une analyse approfondie de mon marché" },
    { icon: Target, label: "Analyse concurrentielle", prompt: "Analyse mes principaux concurrents" },
    { icon: Brain, label: "Opportunités", prompt: "Quelles sont les opportunités pour mon business ?" },
  ],
  content: [
    { icon: FileText, label: "Idée d'article", prompt: "Donne-moi des idées d'articles de blog" },
    { icon: Calendar, label: "Planning éditorial", prompt: "Aide-moi à créer un planning éditorial" },
    { icon: Sparkles, label: "Optimiser SEO", prompt: "Comment optimiser mon contenu pour le SEO ?" },
  ],
  strategy: [
    { icon: Target, label: "Stratégie marketing", prompt: "Développe une stratégie marketing complète" },
    { icon: TrendingUp, label: "Plan d'action", prompt: "Crée un plan d'action pour les 3 prochains mois" },
    { icon: Brain, label: "KPIs", prompt: "Quels KPIs devrais-je suivre ?" },
  ],
  website: [
    { icon: Globe, label: "Améliorer mon site", prompt: "Comment améliorer mon site web ?" },
    { icon: Sparkles, label: "Nouvelles fonctionnalités", prompt: "Quelles fonctionnalités ajouter à mon site ?" },
    { icon: Target, label: "Optimiser la conversion", prompt: "Comment optimiser mon taux de conversion ?" },
  ],
  onboarding: [
    { icon: Sparkles, label: "Commencer", prompt: "Je veux te parler de mon business" },
    { icon: Target, label: "Mes objectifs", prompt: "Voici mes objectifs business" },
    { icon: Brain, label: "Mes défis", prompt: "J'ai besoin d'aide avec certains défis" },
  ]
};

export default function EziaUnifiedChat({
  businessId,
  businessName,
  mode = 'general',
  initialContext,
  onActionComplete,
  className,
  onMinimize,
  onClose
}: EziaUnifiedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Message de bienvenue basé sur le mode
  useEffect(() => {
    const welcomeMessages: Record<ChatMode, string> = {
      general: `Bonjour ! Je suis Ezia, votre assistante IA pour ${businessName}. Comment puis-je vous aider aujourd'hui ?`,
      analysis: `Je suis prête à analyser votre business ${businessName} en profondeur. Que souhaitez-vous explorer ?`,
      content: `Créons du contenu engageant pour ${businessName} ! Quel type de contenu vous intéresse ?`,
      strategy: `Développons ensemble une stratégie gagnante pour ${businessName}. Par où commencer ?`,
      website: `Optimisons votre présence en ligne ! Que souhaitez-vous améliorer sur votre site ?`,
      onboarding: `Bienvenue ! Je suis Ezia, votre partenaire IA. Parlez-moi de ${businessName} pour que je puisse mieux vous aider.`
    };

    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: welcomeMessages[mode],
        timestamp: new Date(),
        metadata: { agent: 'Ezia' }
      }]);
    }
  }, [mode, businessName]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Charger l'historique des sessions
  useEffect(() => {
    loadChatHistory();
  }, [businessId]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/me/business/${businessId}/chat-sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        
        // Si pas de session courante et qu'il y a des sessions, charger la dernière
        if (!currentSessionId && data.sessions?.length > 0) {
          const lastSession = data.sessions[0];
          setCurrentSessionId(lastSession.id);
          setMessages(lastSession.messages || []);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const saveChatHistory = async (newMessages: ChatMessage[]) => {
    try {
      // Si pas de session courante, en créer une nouvelle
      if (!currentSessionId) {
        await startNewSession();
      }

      await fetch(`/api/me/business/${businessId}/chat-sessions/${currentSessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, ...newMessages],
          updatedAt: new Date()
        })
      });

      // Mettre à jour la session locale
      setSessions(prev => 
        prev.map(s => 
          s.id === currentSessionId 
            ? { ...s, messages: [...messages, ...newMessages], updatedAt: new Date() }
            : s
        )
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', error);
    }
  };

  const sendMessage = async (content: string = input) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Message de chargement animé avec statuts progressifs
    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      metadata: { 
        agent: 'Ezia',
        status: "Ezia analyse votre demande..."
      }
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Simuler des messages de statut progressifs
    const statusMessages = [
      "Ezia contacte l'équipe d'agents spécialisés...",
      "Kiko analyse les aspects techniques...",
      "Milo prépare des éléments visuels...",
      "Sophie compile les données du marché...",
      "Ezia synthétise les informations..."
    ];

    let statusIndex = 0;
    const statusInterval = setInterval(() => {
      if (statusIndex < statusMessages.length) {
        setMessages(prev => 
          prev.map(m => 
            m.id === 'loading' 
              ? { ...m, metadata: { ...m.metadata, status: statusMessages[statusIndex] } }
              : m
          )
        );
        statusIndex++;
      }
    }, 2000);

    try {
      const response = await fetch('/api/ezia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          businessId,
          mode,
          context: initialContext,
          sessionId: currentSessionId
        })
      });

      if (!response.ok) throw new Error('Erreur de communication');

      // Gérer le streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  accumulatedContent += data.content;
                  setMessages(prev => 
                    prev.map(m => 
                      m.id === 'loading' 
                        ? { ...m, content: accumulatedContent, isStreaming: true }
                        : m
                    )
                  );
                }
              } catch (e) {
                // Ignorer les erreurs de parsing
              }
            }
          }
        }
      }

      // Nettoyer l'interval de statut
      clearInterval(statusInterval);

      // Finaliser le message
      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: accumulatedContent,
        timestamp: new Date(),
        isStreaming: false,
        metadata: { agent: 'Ezia' }
      };

      setMessages(prev => 
        prev.map(m => 
          m.id === 'loading' 
            ? assistantMessage
            : m
        )
      );

      // Sauvegarder dans l'historique
      await saveChatHistory([userMessage, assistantMessage]);

      // Callback si action complétée
      if (onActionComplete && accumulatedContent.includes('[ACTION_COMPLETE]')) {
        onActionComplete({ success: true });
      }

    } catch (error) {
      clearInterval(statusInterval);
      setMessages(prev => prev.filter(m => m.id !== 'loading'));
      toast({
        title: "Erreur",
        description: "Je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewSession = async () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      businessId,
      title: `Chat du ${new Date().toLocaleDateString('fr-FR')} - ${mode}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      context: mode
    };

    try {
      // Créer la session sur le serveur
      await fetch(`/api/me/business/${businessId}/chat-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });

      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setShowHistory(false);
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      // En cas d'erreur, créer quand même la session localement
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setShowHistory(false);
    }
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setShowHistory(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col h-full bg-background rounded-lg border shadow-lg",
        isExpanded && "fixed inset-4 z-50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-purple-300">
            <AvatarImage src="/img/ezia-email-logo.png" alt="Ezia" />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              Ezia
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                {mode === 'onboarding' ? 'Onboarding' : 
                 mode === 'analysis' ? 'Analyse' :
                 mode === 'content' ? 'Contenu' :
                 mode === 'strategy' ? 'Stratégie' :
                 mode === 'website' ? 'Site Web' : 'Assistant'}
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Assistant IA pour {businessName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            title="Historique des conversations"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={startNewSession}
            title="Nouvelle conversation"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {onMinimize && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              title="Réduire"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Historique des sessions */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r bg-muted/30 overflow-hidden"
            >
              <ScrollArea className="h-full p-3">
                <h4 className="text-sm font-medium mb-3">Historique</h4>
                <div className="space-y-2">
                  {sessions.map(session => (
                    <Card
                      key={session.id}
                      className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => loadSession(session)}
                    >
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {session.messages.length} message{session.messages.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone de chat principale */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' && "justify-end"
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/img/ezia-email-logo.png" alt="Ezia" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <Sparkles className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "rounded-lg",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground px-4 py-3 max-w-[80%]" 
                      : "bg-white dark:bg-gray-800 border shadow-sm p-6 max-w-[90%]"
                  )}>
                    {message.isStreaming ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                          <span className="text-sm font-medium text-purple-600 animate-pulse">
                            {message.metadata?.status || "Ezia analyse votre demande..."}
                          </span>
                        </div>
                        {message.content && (
                          <p className="text-sm text-muted-foreground pl-7">
                            {message.content}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {message.metadata?.agent && (
                          <div className="text-xs text-muted-foreground font-medium">
                            {message.metadata.agent}
                          </div>
                        )}
                        <div className="prose prose-base dark:prose-invert max-w-none 
                          prose-headings:text-lg prose-headings:font-semibold prose-headings:mb-3
                          prose-p:text-base prose-p:leading-relaxed prose-p:mb-4
                          prose-ul:space-y-2 prose-li:text-base
                          prose-strong:text-purple-700 dark:prose-strong:text-purple-400">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                          {message.timestamp.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Actions rapides */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {quickActionsByMode[mode].map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(action.prompt)}
                    className="text-xs"
                  >
                    <action.icon className="h-3 w-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Zone d'input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Ezia est en train d'écrire..." : "Entrée pour envoyer, Shift+Entrée pour nouvelle ligne"}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {messages.filter(m => m.role === 'user').length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}