"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Globe, 
  Target, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Sparkles,
  Send,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  actionType?: string;
  error?: boolean;
}

interface EziaChatV2Props {
  businessId: string;
  businessName: string;
  actionType?: string;
  onActionComplete?: (result: any) => void;
  onClose?: () => void;
}

const actionConfigs = {
  create_website: {
    icon: Globe,
    title: "Créer un site web",
    description: "Je vais coordonner mon équipe pour créer votre site web professionnel",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10"
  },
  market_analysis: {
    icon: Target,
    title: "Analyse de marché",
    description: "Je vais analyser votre marché cible et identifier les opportunités",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  marketing_strategy: {
    icon: TrendingUp,
    title: "Stratégie marketing",
    description: "Je vais créer une stratégie marketing complète pour votre business",
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  competitor_analysis: {
    icon: BarChart3,
    title: "Analyse concurrentielle",
    description: "Je vais analyser vos concurrents et identifier vos avantages",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  content_calendar: {
    icon: Calendar,
    title: "Calendrier de contenu",
    description: "Je vais créer un calendrier éditorial pour vos réseaux sociaux",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  branding: {
    icon: Sparkles,
    title: "Identité de marque",
    description: "Je vais développer votre identité de marque unique",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10"
  },
  social_media: {
    icon: MessageSquare,
    title: "Stratégie réseaux sociaux",
    description: "Je vais créer votre stratégie sur les réseaux sociaux",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10"
  }
};

export function EziaChatV2({ // Component name kept for compatibility
  businessId,
  businessName,
  actionType = "market_analysis",
  onActionComplete,
  onClose
}: EziaChatV2Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const config = actionConfigs[actionType as keyof typeof actionConfigs] || actionConfigs.market_analysis;
  const ActionIcon = config.icon;

  useEffect(() => {
    // Message initial de l'agence
    const initialMessage: Message = {
      id: "initial",
      role: "assistant",
      content: `Bonjour ! Je suis l'agent spécialisé d'Ezia. ${config.description} pour **${businessName}**.

Souhaitez-vous que je commence l'analyse ou avez-vous des questions spécifiques ?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [businessName, config.description]);

  useEffect(() => {
    // Auto-scroll
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const startAnalysis = async (userPrompt?: string) => {
    setIsAnalyzing(true);
    
    const analysisMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true
    };
    setMessages(prev => [...prev, analysisMessage]);

    try {
      const response = await api.post("/api/ezia/analyze", {
        businessId,
        actionType,
        userPrompt
      });

      if (response.data.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === analysisMessage.id 
              ? { ...msg, content: response.data.content, isStreaming: false }
              : msg
          )
        );

        // Ajouter un message de confirmation
        const confirmMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "✅ L'analyse a été sauvegardée dans votre dashboard. Avez-vous d'autres questions ?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmMessage]);

        if (onActionComplete) {
          onActionComplete({
            type: actionType,
            content: response.data.content,
            interaction: response.data.interaction,
            project: response.data.project
          });
        }
        
        // Si c'est une création de site web, proposer de voir le site
        if (actionType === "create_website" && response.data.project) {
          const viewSiteMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: `🌐 [Cliquez ici pour voir votre nouveau site web](${response.data.project.preview_url})`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, viewSiteMessage]);
        }
      } else {
        throw new Error(response.data.error || "Erreur lors de l'analyse");
      }
    } catch (error: any) {
      console.error("Erreur analyse:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === analysisMessage.id 
            ? { 
                ...msg, 
                content: "❌ Désolé, une erreur s'est produite lors de l'analyse. Veuillez réessayer.", 
                isStreaming: false,
                error: true
              }
            : msg
        )
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isAnalyzing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Si l'utilisateur demande de commencer l'analyse
    if (input.toLowerCase().includes("commence") || 
        input.toLowerCase().includes("analyse") ||
        input.toLowerCase().includes("oui") ||
        input.toLowerCase().includes("vas-y")) {
      await startAnalysis();
    } else {
      // Sinon, utiliser la demande spécifique de l'utilisateur
      await startAnalysis(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#E0E0E0] p-4 bg-[#FAF9F5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <ActionIcon className={cn("w-6 h-6", config.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-[#1E1E1E]">{config.title}</h3>
              <p className="text-sm text-[#666666]">{businessName}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.role === "user"
                    ? "bg-[#6D3FC8] text-white"
                    : "bg-[#F5F5F5] border border-[#E0E0E0] text-[#1E1E1E]",
                  message.error && "border-red-500/50"
                )}
              >
                {message.isStreaming ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">L'agent analyse...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-[#E0E0E0] p-4 bg-[#FAF9F5]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAnalyzing ? "Analyse en cours..." : "Posez votre question ou tapez 'commence' pour démarrer"}
            disabled={isLoading || isAnalyzing}
            className="flex-1 bg-white border-[#E0E0E0] text-[#1E1E1E]"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading || isAnalyzing}
            className="bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Actions rapides */}
        {messages.length === 1 && !isAnalyzing && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => startAnalysis()}
              className="text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Commencer l'analyse
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInput("J'aimerais me concentrer sur ")}
              className="text-xs"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Question spécifique
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}