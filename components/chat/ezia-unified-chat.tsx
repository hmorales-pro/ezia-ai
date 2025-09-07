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
  className
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
      const response = await fetch(`/api/me/business/${businessId}/chat-history`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
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

    // Message de chargement animé
    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      metadata: { agent: 'Ezia' }
    };
    setMessages(prev => [...prev, loadingMessage]);

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

      // Finaliser le message
      setMessages(prev => 
        prev.map(m => 
          m.id === 'loading' 
            ? { ...m, id: Date.now().toString(), isStreaming: false }
            : m
        )
      );

      // Sauvegarder dans l'historique
      if (currentSessionId) {
        await fetch(`/api/me/business/${businessId}/chat-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            messages: [userMessage, {
              role: 'assistant',
              content: accumulatedContent
            }]
          })
        });
      }

      // Callback si action complétée
      if (onActionComplete && accumulatedContent.includes('[ACTION_COMPLETE]')) {
        onActionComplete({ success: true });
      }

    } catch (error) {
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

  const startNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      businessId,
      title: `Chat du ${new Date().toLocaleDateString('fr-FR')}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      context: mode
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setShowHistory(false);
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
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src="/ezia-avatar.png" />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Ezia
              <Badge variant="secondary" className="text-xs">
                {mode === 'onboarding' ? 'Onboarding' : 
                 mode === 'analysis' ? 'Analyse' :
                 mode === 'content' ? 'Contenu' :
                 mode === 'strategy' ? 'Stratégie' :
                 mode === 'website' ? 'Site Web' : 'Assistant'}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              {businessName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={startNewSession}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onActionComplete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onActionComplete({ cancelled: true })}
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
                      <p className="text-xs text-muted-foreground">
                        {session.messages.length} messages
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString('fr-FR')}
                      </p>
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
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    {message.isStreaming ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-sm animate-pulse">
                          {message.content || "Ezia réfléchit..."}
                        </span>
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
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