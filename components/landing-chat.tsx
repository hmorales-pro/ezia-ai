"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Send, 
  Sparkles, 
  User, 
  Building2, 
  TrendingUp,
  Globe,
  Users,
  Loader2,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ezia';
  timestamp: Date;
  options?: Array<{
    label: string;
    value: string;
    icon?: any;
  }>;
}

const QUICK_ACTIONS = [
  {
    label: "Je veux développer ma présence en ligne",
    value: "online_presence",
    icon: Globe,
    description: "Site web, réseaux sociaux, outils digitaux..."
  },
  {
    label: "J'ai besoin d'aide marketing",
    value: "marketing_help",
    icon: TrendingUp,
    description: "Stratégie, contenu, réseaux sociaux..."
  },
  {
    label: "Je démarre mon entreprise",
    value: "new_business",
    icon: Building2,
    description: "Accompagnement complet de A à Z"
  },
  {
    label: "Je veux développer ma clientèle",
    value: "grow_customers",
    icon: Users,
    description: "Acquisition, fidélisation, croissance"
  }
];

const EZIA_RESPONSES: Record<string, string> = {
  online_presence: "Excellente décision ! Développer votre présence en ligne est essentiel aujourd'hui. Je peux vous aider avec : création de site web, stratégie réseaux sociaux, outils de productivité, et bien plus. Par quoi souhaitez-vous commencer ?",
  marketing_help: "Excellent choix ! Je vais vous accompagner dans votre stratégie marketing. Qu'est-ce qui vous préoccupe le plus actuellement ? L'acquisition de nouveaux clients, votre présence sur les réseaux sociaux, ou la création de contenu ?",
  new_business: "Félicitations pour ce nouveau projet ! 🎉 Je vais vous guider étape par étape. Commençons par le début : pouvez-vous me décrire votre idée d'entreprise en quelques mots ?",
  grow_customers: "Je comprends, développer sa clientèle est crucial. Pour vous proposer les meilleures stratégies, pouvez-vous me dire dans quel secteur vous êtes et combien de clients vous avez actuellement ?",
  default: "Je suis là pour vous aider ! Mon équipe et moi pouvons vous accompagner dans tous vos projets digitaux. Que puis-je faire pour vous aujourd'hui ?"
};

export default function LandingChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Bonjour ! Je suis Ezia, votre partenaire business IA.\n\nJe dirige une équipe d'experts pour vous aider à développer votre présence en ligne et faire grandir votre entreprise.\n\nComment puis-je vous aider aujourd'hui ?",
      sender: 'ezia',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Scroll uniquement à l'intérieur du conteneur du chat
    const chatContainer = messagesEndRef.current?.parentElement;
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useEffect(() => {
    // Petit délai pour s'assurer que le DOM est mis à jour
    setTimeout(scrollToBottom, 50);
  }, [messages]);

  const handleQuickAction = async (action: typeof QUICK_ACTIONS[0]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: action.label,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setShowQuickActions(false);
    setIsTyping(true);

    try {
      // Appel à l'API Mistral pour les quick actions aussi
      const response = await fetch('/api/chat-mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: action.label,
          conversationHistory: messages.slice(-4)
        })
      });

      const data = await response.json();
      
      const eziaResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content || EZIA_RESPONSES[action.value] || EZIA_RESPONSES.default,
        sender: 'ezia',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, eziaResponse]);
      
      // Vérifier si la réponse contient une invitation à créer un compte
      const mentionsSignup = data.content && (
        data.content.toLowerCase().includes('compte') ||
        data.content.toLowerCase().includes('gratuit') ||
        data.content.toLowerCase().includes('inscription')
      );
      
      if (mentionsSignup || action.value === 'online_presence' || action.value === 'new_business') {
        setShowSignupPrompt(true);
      }
    } catch (error) {
      // En cas d'erreur, utiliser les réponses par défaut
      const eziaResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: EZIA_RESPONSES[action.value] || EZIA_RESPONSES.default,
        sender: 'ezia',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, eziaResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setShowQuickActions(false);

    try {
      // Appel à l'API Mistral
      const response = await fetch('/api/chat-mistral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-6) // Garder les 6 derniers messages pour le contexte
        })
      });

      const data = await response.json();
      
      const eziaResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content || "Je suis là pour vous aider ! Créez votre compte gratuit pour accéder à toutes mes capacités.",
        sender: 'ezia',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, eziaResponse]);
      
      // Vérifier si la réponse mentionne la création de compte
      const mentionsSignup = data.content && (
        data.content.toLowerCase().includes('compte') ||
        data.content.toLowerCase().includes('gratuit') ||
        data.content.toLowerCase().includes('inscription') ||
        data.content.toLowerCase().includes('créez votre')
      );
      
      if (mentionsSignup || (!data.isDefault && (
        input.toLowerCase().includes('site') || 
        input.toLowerCase().includes('créer') || 
        input.toLowerCase().includes('business')
      ))) {
        setShowSignupPrompt(true);
      }
      
    } catch (error) {
      console.error('Erreur chat:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Je suis désolée, j'ai un petit souci technique. 😅\n\nMais je peux quand même vous dire que sur Ezia.ai, vous pouvez créer votre site web, développer votre stratégie marketing et bien plus !\n\nCréez votre compte gratuit pour découvrir tout ce que nous pouvons faire ensemble.",
        sender: 'ezia',
        timestamp: new Date(),
        options: [
          {
            label: "Essayer gratuitement",
            value: "signup",
            icon: Sparkles
          }
        ]
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (option: { value: string }) => {
    if (option.value === 'signup') {
      router.push('/auth/ezia?mode=register');
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Card className="h-[700px] lg:h-[750px] flex flex-col bg-white shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-[#6D3FC8] to-[#8B5CF6] text-white">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/img/mascottes/Ezia.png"
              alt="Ezia"
              fill
              className="object-contain"
              sizes="40px"
              priority
            />
          </div>
          <div>
            <h3 className="font-semibold">Ezia - Votre Partenaire Business IA</h3>
            <p className="text-sm opacity-90">En ligne • Réponse instantanée</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender === 'user' && "flex-row-reverse"
            )}
          >
            {message.sender === 'ezia' ? (
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/img/mascottes/Ezia.png"
                  alt="Ezia"
                  fill
                  className="object-contain"
                  sizes="32px"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] space-y-2",
              message.sender === 'user' && "items-end"
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-2",
                message.sender === 'ezia'
                  ? "bg-gray-100 text-gray-800"
                  : "bg-[#6D3FC8] text-white"
              )}>
                {message.sender === 'ezia' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-800">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      a: ({ href, children }) => (
                        <a href={href} className="text-[#6D3FC8] hover:underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                      code: ({ children }) => (
                        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">{children}</code>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-[#6D3FC8] pl-3 italic">{children}</blockquote>
                      )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-line">{message.content}</span>
                )}
              </div>
              
              {message.options && (
                <div className="space-y-2 mt-2">
                  {message.options.map((option, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      className="w-full bg-[#6D3FC8] hover:bg-[#5A35A5] text-white"
                    >
                      {option.label}
                      {option.icon && <option.icon className="ml-2 w-4 h-4" />}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/img/mascottes/Ezia.png"
                alt="Ezia"
                fill
                className="object-contain"
                sizes="32px"
                loading="lazy"
              />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {showQuickActions && messages.length === 1 && (
          <div className="space-y-3 mt-6">
            <p className="text-sm text-gray-600 text-center">Choisissez un sujet pour commencer :</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.value}
                  onClick={() => handleQuickAction(action)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#6D3FC8] hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-[#6D3FC8] transition-colors">
                      <action.icon className="w-5 h-5 text-[#6D3FC8] group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{action.label}</h4>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t space-y-3">
        {/* Signup Prompt - Désactivé car on utilise les waitlists */}
        {/* {showSignupPrompt && (
          <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-gradient-to-r from-[#6D3FC8]/10 to-[#8B5CF6]/10 rounded-full px-4 py-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6D3FC8]" />
              <span className="text-sm text-[#6D3FC8] font-medium">Prêt à commencer ?</span>
              <Button
                onClick={() => router.push('/auth/ezia?mode=register')}
                size="sm"
                variant="ghost"
                className="text-[#6D3FC8] hover:bg-[#6D3FC8]/10 px-3 py-1 h-auto"
              >
                Créer mon compte
                <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </div>
        )} */}
        
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question à Ezia..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-[#6D3FC8] hover:bg-[#5A35A5]"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
    </div>
  );
}