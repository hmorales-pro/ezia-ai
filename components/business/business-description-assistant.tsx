"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, CheckCircle, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BusinessDescriptionAssistantProps {
  open: boolean;
  onClose: () => void;
  onComplete: (description: string) => void;
  businessName: string;
  industry: string;
  currentDescription?: string;
}

export function BusinessDescriptionAssistant({
  open,
  onClose,
  onComplete,
  businessName,
  industry,
  currentDescription = ""
}: BusinessDescriptionAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialiser la conversation quand le modal s'ouvre
  useEffect(() => {
    if (open && messages.length === 0) {
      initConversation();
    }
  }, [open]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus sur l'input après chaque message
  useEffect(() => {
    if (!loading && !isComplete) {
      inputRef.current?.focus();
    }
  }, [loading, isComplete, messages]);

  const initConversation = () => {
    const initialMessage: Message = {
      role: "assistant",
      content: `Bonjour ! 👋 Je suis **Ezia**, votre assistante IA pour vous aider à créer une description complète de "${businessName}".

Je vais vous poser quelques questions pour bien comprendre votre projet dans le secteur ${industry}.

Pour commencer, dites-moi en quelques mots : **quel est votre business et qui sont vos clients ?**`
    };
    setMessages([initialMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat-mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            businessName,
            industry,
            currentDescription,
            task: "business_description_assistant"
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Détecter si la description finale est générée
        if (data.finalDescription) {
          setGeneratedDescription(data.finalDescription);
          setIsComplete(true);
        }
      } else {
        toast.error("Erreur lors de la communication avec l'assistant");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Entrée seule = envoyer, Shift+Entrée = nouvelle ligne
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleValidate = () => {
    onComplete(generatedDescription);
    toast.success("Description validée et insérée !");
    onClose();
    resetConversation();
  };

  const handleRegenerate = () => {
    setIsComplete(false);
    setGeneratedDescription("");
    const regenerateMessage: Message = {
      role: "assistant",
      content: "D'accord, reprenons ! Qu'aimeriez-vous modifier ou préciser ?"
    };
    setMessages(prev => [...prev, regenerateMessage]);
  };

  const resetConversation = () => {
    setMessages([]);
    setInput("");
    setGeneratedDescription("");
    setIsComplete(false);
  };

  const handleClose = () => {
    onClose();
    // Petit délai avant de reset pour éviter le flash
    setTimeout(resetConversation, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
            Assistant Description Business
          </DialogTitle>
          <DialogDescription>
            Répondez aux questions pour créer une description complète et optimale pour l'analyse IA
          </DialogDescription>
        </DialogHeader>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[#6D3FC8] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-strong:font-semibold">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="my-1">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {/* Description finale générée */}
          {isComplete && generatedDescription && (
            <div className="border-2 border-[#6D3FC8] rounded-lg p-4 bg-[#6D3FC8]/5">
              <div className="flex items-start gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#6D3FC8] mb-2">
                    Description complète générée :
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {generatedDescription}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleValidate}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valider et utiliser
                </Button>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="flex-1"
                >
                  Modifier
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#6D3FC8]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        {!isComplete && (
          <div className="border-t px-6 py-4">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tapez votre réponse..."
                disabled={loading}
                className="flex-1 resize-none min-h-[44px] max-h-[150px]"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '44px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-[#6D3FC8] hover:bg-[#5A35A5] h-[44px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
