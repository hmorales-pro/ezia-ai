"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  X,
  Sparkles,
  Target,
  TrendingUp,
  Globe,
  Calendar,
  BarChart3,
  MessageSquare
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  actionType?: string;
  isStreaming?: boolean;
}

interface EziaChatProps {
  businessId: string;
  businessName: string;
  context?: string;
  actionType?: string;
  onActionComplete?: (result: { type: string; message: string; url?: string }) => void;
  onClose?: () => void;
  className?: string;
}

const actionPrompts = {
  create_website: {
    icon: Globe,
    title: "Créer un site web",
    initialPrompt: "Je vais t'aider à créer un site web professionnel pour {businessName}. Dis-moi quel style tu préfères et quelles sections tu souhaites inclure."
  },
  market_analysis: {
    icon: Target,
    title: "Analyse de marché",
    initialPrompt: "Je vais analyser le marché pour {businessName}. Parle-moi de tes clients cibles et de tes concurrents principaux."
  },
  marketing_strategy: {
    icon: TrendingUp,
    title: "Stratégie marketing",
    initialPrompt: "Développons ensemble une stratégie marketing efficace pour {businessName}. Quels sont tes objectifs de croissance ?"
  },
  content_calendar: {
    icon: Calendar,
    title: "Calendrier de contenu",
    initialPrompt: "Je vais créer un calendrier de contenu pour {businessName}. Sur quels réseaux sociaux es-tu présent ?"
  },
  competitor_analysis: {
    icon: BarChart3,
    title: "Analyse concurrentielle",
    initialPrompt: "Analysons tes concurrents pour {businessName}. Qui sont tes 3 principaux concurrents ?"
  },
  branding: {
    icon: Sparkles,
    title: "Identité de marque",
    initialPrompt: "Créons une identité de marque forte pour {businessName}. Quelles valeurs veux-tu transmettre ?"
  },
  social_media: {
    icon: MessageSquare,
    title: "Stratégie réseaux sociaux",
    initialPrompt: "Développons ta stratégie sur les réseaux sociaux pour {businessName}. Quelle est ton audience cible ?"
  },
  general: {
    icon: Sparkles,
    title: "Assistant Ezia",
    initialPrompt: "Bonjour ! Je suis Ezia, ton assistante IA pour {businessName}. Comment puis-je t'aider aujourd'hui ?"
  }
};

export function EziaChat({ 
  businessId, 
  businessName,
  context = "",
  actionType = "general",
  onActionComplete,
  onClose,
  className
}: EziaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const action = actionPrompts[actionType as keyof typeof actionPrompts] || actionPrompts.general;
  const ActionIcon = action.icon;

  useEffect(() => {
    // Initial message from Ezia
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: action.initialPrompt.replace("{businessName}", businessName),
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [actionType, businessName, action.initialPrompt]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create streaming message placeholder
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      actionType
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch("/api/ezia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          })),
          businessId,
          businessName,
          actionType,
          context
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: fullContent, isStreaming: true }
                      : msg
                  )
                );
              }
              if (data.done) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
                
                // Save interaction to business
                if (actionType !== "general") {
                  await saveInteraction(fullContent);
                }
                
                if (data.result && onActionComplete) {
                  onActionComplete(data.result);
                }
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      const err = error as Error;
      if (err.name !== 'AbortError') {
        console.error("Chat error:", error);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { 
                  ...msg, 
                  content: "Désolé, une erreur s'est produite. Veuillez réessayer.", 
                  isStreaming: false 
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const saveInteraction = async (summary: string) => {
    try {
      await api.post(`/api/me/business/${businessId}/interactions`, {
        agent: "Ezia",
        interaction_type: actionType,
        summary: summary.substring(0, 200) + (summary.length > 200 ? "..." : ""),
        recommendations: []
      });
    } catch (error) {
      console.error("Error saving interaction:", error);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("flex flex-col h-[600px] w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ActionIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">{action.title}</h3>
            <p className="text-sm text-gray-500">Assistant IA pour {businessName}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
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
                <div className="p-2 bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%]",
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.isStreaming && (
                  <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
                )}
              </div>
              {message.role === "user" && (
                <div className="p-2 bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={isLoading}
            className="flex-1"
          />
          {isLoading ? (
            <Button type="button" onClick={handleStop} variant="destructive">
              <Loader2 className="w-4 h-4 animate-spin" />
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}