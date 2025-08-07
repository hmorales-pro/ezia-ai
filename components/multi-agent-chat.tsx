"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Users, User, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
}

interface Message {
  id: string;
  agent: Agent;
  content: string;
  timestamp: Date;
}

interface MultiAgentChatProps {
  projectContext?: string;
  onProjectUpdate?: (update: any) => void;
  className?: string;
}

export function MultiAgentChat({ 
  projectContext = "", 
  onProjectUpdate,
  className 
}: MultiAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      agent: {
        id: "ezia",
        name: "Ezia",
        emoji: "👩‍💼",
        role: "Cheffe de projet"
      },
      content: "Bonjour ! Je suis Ezia, votre cheffe de projet digitale. Je suis accompagnée de mon équipe d'experts : Kiko (développement), Milo (branding), Yuna (UX) et Vera (contenu/SEO). Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [multiAgentMode, setMultiAgentMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Ajouter le message utilisateur
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      agent: {
        id: "user",
        name: "Vous",
        emoji: "👤",
        role: "Client"
      },
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await api.post("/api/agents/chat", {
        message: userMessage,
        projectContext,
        multiAgent: multiAgentMode || userMessage.toLowerCase().includes("projet complet")
      });

      if (response.data.conversation) {
        // Mode multi-agents
        for (const item of response.data.conversation) {
          const agentMessage: Message = {
            id: `${item.agent.id}-${Date.now()}-${Math.random()}`,
            agent: item.agent,
            content: item.message,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, agentMessage]);
          
          // Petit délai entre les messages pour un effet plus naturel
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } else {
        // Mode agent unique
        const agentMessage: Message = {
          id: `${response.data.agent.id}-${Date.now()}`,
          agent: response.data.agent,
          content: response.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);
      }

      // Callback pour les mises à jour du projet
      if (onProjectUpdate && response.data.projectUpdate) {
        onProjectUpdate(response.data.projectUpdate);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        agent: {
          id: "ezia",
          name: "Ezia",
          emoji: "👩‍💼",
          role: "Cheffe de projet"
        },
        content: "Désolée, une erreur s'est produite. Pouvez-vous reformuler votre demande ?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentColor = (agentId: string) => {
    const colors: Record<string, string> = {
      ezia: "bg-[#6D3FC8] text-white",
      kiko: "bg-blue-500 text-white",
      milo: "bg-pink-500 text-white",
      yuna: "bg-green-500 text-white",
      vera: "bg-orange-500 text-white",
      user: "bg-gray-200 text-gray-800"
    };
    return colors[agentId] || "bg-gray-400 text-white";
  };

  return (
    <Card className={cn("flex flex-col h-[600px] bg-white", className)}>
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">Équipe Ezia</h3>
          <p className="text-sm text-gray-500">Votre équipe de projet digitale</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMultiAgentMode(!multiAgentMode)}
          className={multiAgentMode ? "bg-[#6D3FC8] text-white" : ""}
        >
          {multiAgentMode ? <Users className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
          {multiAgentMode ? "Mode équipe" : "Mode simple"}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.agent.id === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className={cn("flex-shrink-0", getAgentColor(message.agent.id))}>
                <AvatarFallback className={getAgentColor(message.agent.id)}>
                  {message.agent.emoji}
                </AvatarFallback>
              </Avatar>
              
              <div className={cn(
                "flex flex-col gap-1 max-w-[80%]",
                message.agent.id === "user" ? "items-end" : "items-start"
              )}>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{message.agent.name}</span>
                  <span className="text-gray-500 text-xs">{message.agent.role}</span>
                </div>
                <div className={cn(
                  "rounded-lg px-4 py-2",
                  message.agent.id === "user" 
                    ? "bg-[#6D3FC8] text-white" 
                    : "bg-gray-100 text-gray-800"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">L'équipe réfléchit...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={multiAgentMode 
              ? "Décrivez votre projet complet..." 
              : "Posez votre question..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="bg-[#6D3FC8] hover:bg-[#5d35a8] text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {multiAgentMode 
            ? "Mode équipe : tous les experts participent à la conversation"
            : "Mode simple : l'expert approprié vous répond directement"}
        </p>
      </form>
    </Card>
  );
}