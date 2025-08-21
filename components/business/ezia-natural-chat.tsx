"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface EziaNaturalChatProps {
  businessId: string;
  businessData: any;
  onDataCollected: (data: any) => void;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'personas';
  content: string;
  timestamp: Date;
  metadata?: {
    dataExtracted?: any;
    suggestions?: string[];
    calculations?: any;
    personas?: any;
  };
}

// Les prompts sont maintenant gérés côté serveur

// Fonction pour fusionner les données business en profondeur
function mergeBusinessData(current: any, extracted: any): any {
  const merged = { ...current };
  
  Object.keys(extracted).forEach(key => {
    if (key === 'offerings' && Array.isArray(extracted[key])) {
      // Pour les offerings, ajouter ou mettre à jour
      merged.offerings = [...(current.offerings || []), ...extracted.offerings];
    } else if (typeof extracted[key] === 'object' && !Array.isArray(extracted[key])) {
      // Pour les objets, fusionner en profondeur
      merged[key] = {
        ...(current[key] || {}),
        ...extracted[key]
      };
    } else if (Array.isArray(extracted[key])) {
      // Pour les arrays (sauf offerings), concaténer en évitant les doublons
      const currentArray = current[key] || [];
      const newItems = extracted[key].filter((item: any) => 
        !currentArray.some((existing: any) => 
          JSON.stringify(existing) === JSON.stringify(item)
        )
      );
      merged[key] = [...currentArray, ...newItems];
    } else {
      // Pour les valeurs simples, remplacer si non vide
      if (extracted[key] !== null && extracted[key] !== undefined && extracted[key] !== '') {
        merged[key] = extracted[key];
      }
    }
  });
  
  return merged;
}

export function EziaNaturalChat({ 
  businessId, 
  businessData, 
  onDataCollected, 
  onClose 
}: EziaNaturalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collectedData, setCollectedData] = useState<any>({
    business_model: {},
    offerings: [],
    customer_insights: {},
    financial_info: {},
    resources: {}
  });
  const [completionScore, setCompletionScore] = useState(0);
  const [lastSavedData, setLastSavedData] = useState<any>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationContext, setConversationContext] = useState("");
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Message initial d'Ezia
    const initialMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Bonjour ! 👋 Je suis Ezia, votre partenaire IA pour développer votre business.

Je suis là pour mieux comprendre votre activité et vous aider à optimiser votre stratégie. Plus j'en saurai sur votre business, mieux je pourrai vous accompagner avec du contenu personnalisé et des recommandations pertinentes.

Pour commencer, pouvez-vous me dire ce que vous vendez ? Produits, services, ou les deux ?`,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sauvegarde automatique quand les données changent
  useEffect(() => {
    // Ne pas sauvegarder si pas de changements significatifs
    if (JSON.stringify(collectedData) === JSON.stringify(lastSavedData)) {
      return;
    }

    // Annuler le timeout précédent
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Programmer une nouvelle sauvegarde dans 3 secondes
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveData();
    }, 3000);

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [collectedData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const autoSaveData = async () => {
    // Ne pas sauvegarder si les données sont vides
    const hasData = Object.values(collectedData).some(value => 
      value && (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)
    );

    if (!hasData) return;

    setAutoSaving(true);
    try {
      // Sauvegarder les données
      await api.put(`/api/me/business/${businessId}`, collectedData);
      
      // Sauvegarder aussi l'historique de conversation pour référence future
      await api.post(`/api/me/business/${businessId}/save-conversation`, {
        messages: messages,
        extractedData: collectedData,
        timestamp: new Date()
      });
      
      setLastSavedData(collectedData);
      console.log("[Auto-save] Données sauvegardées automatiquement");
    } catch (error) {
      console.error("[Auto-save] Erreur:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  const calculateCompletionScore = (data: any) => {
    let score = 0;
    const checkpoints = [
      data.business_model?.type,
      data.offerings?.length > 0,
      data.customer_insights?.ideal_customer_profile,
      data.customer_insights?.customer_pain_points?.length > 0,
      data.financial_info?.target_monthly_revenue,
      data.business_model?.unique_selling_points?.length > 0
    ];
    
    checkpoints.forEach(checkpoint => {
      if (checkpoint) score += 100 / checkpoints.length;
    });
    
    return Math.round(score);
  };

  const extractDataFromMessage = async (userMessage: string, aiResponse: string) => {
    // L'extraction sera faite côté serveur
    return null;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Construire le contexte de conversation
      const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      // Appeler l'API chat
      const response = await api.post(`/api/me/business/${businessId}/chat`, {
        message: input,
        conversationHistory,
        collectedData,
        completionScore
      });

      if (response.data.success) {
        const aiMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Traiter les données extraites
        if (response.data.extractedData) {
          // Valider et corriger les offerings avant la fusion
          if (response.data.extractedData.offerings) {
            response.data.extractedData.offerings = response.data.extractedData.offerings.map((offer: any) => ({
              ...offer,
              // S'assurer que les champs requis sont présents
              name: offer.name || "Offre principale",
              description: offer.description || "Description à compléter",
              type: offer.type || "product",
              price: offer.price || 0,
              currency: offer.currency || "EUR"
            }));
          }
          
          // Fusionner avec les données existantes
          const updatedData = mergeBusinessData(collectedData, response.data.extractedData);
          setCollectedData(updatedData);
          
          // Mettre à jour le score
          const newScore = calculateCompletionScore(updatedData);
          setCompletionScore(newScore);
        }

        // Ajouter les suggestions si disponibles
        if (response.data.suggestions && response.data.suggestions.length > 0) {
          const suggestMessage: Message = {
            id: `msg-${Date.now()}-suggest`,
            role: 'system',
            content: "💡 Suggestions pour continuer :",
            timestamp: new Date(),
            metadata: {
              suggestions: response.data.suggestions
            }
          };
          setTimeout(() => setMessages(prev => [...prev, suggestMessage]), 1500);
        }
        
        // Ajouter les personas suggérés si disponibles
        if (response.data.personaSuggestions?.personas) {
          const personaMessage: Message = {
            id: `msg-${Date.now()}-personas`,
            role: 'personas',
            content: "🎯 J'ai analysé nos échanges et voici 3 profils de clients potentiels pour votre business. Lequel correspond le mieux à votre vision ?",
            timestamp: new Date(),
            metadata: {
              personas: response.data.personaSuggestions.personas
            }
          };
          setTimeout(() => setMessages(prev => [...prev, personaMessage]), 2000);
        }
      } else {
        throw new Error("API response not successful");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const mergeDeep = (target: any, source: any): any => {
    const output = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (key in output) {
          output[key] = mergeDeep(output[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else if (Array.isArray(source[key])) {
        if (Array.isArray(output[key])) {
          // Fusionner les tableaux en évitant les doublons
          output[key] = [...new Set([...output[key], ...source[key]])];
        } else {
          output[key] = source[key];
        }
      } else if (source[key] !== null && source[key] !== undefined && source[key] !== "") {
        output[key] = source[key];
      }
    });
    
    return output;
  };

  // Fonction appelée quand l'utilisateur ferme le chat
  const handleCloseChat = async () => {
    // Sauvegarder une dernière fois si nécessaire
    if (JSON.stringify(collectedData) !== JSON.stringify(lastSavedData)) {
      await autoSaveData();
    }
    
    // Si on a collecté suffisamment de données, déclencher une réanalyse
    if (completionScore >= 60) {
      try {
        await api.post(`/api/me/business/${businessId}/rerun-analysis`);
      } catch (error) {
        console.error("Error launching analysis:", error);
      }
    }
    
    onDataCollected(collectedData);
    onClose();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };
  
  const handlePersonaSelect = (persona: any, action: 'select' | 'modify') => {
    if (action === 'select') {
      setInput(`J'aime beaucoup le profil de ${persona.name} (${persona.title}). C'est exactement le type de client que je cible.`);
    } else {
      setInput(`Le profil de ${persona.name} est proche, mais j'aimerais ajouter que...`);
    }
    // Sauvegarder le persona sélectionné temporairement
    setCollectedData(prev => ({
      ...prev,
      customer_insights: {
        ...prev.customer_insights,
        selected_persona_base: persona
      }
    }));
  };

  return (
    <div className="h-full w-full flex flex-col bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
            <h2 className="text-lg font-semibold">Discussion avec Ezia</h2>
          </div>
          <div className="flex items-center gap-3">
            {autoSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Sauvegarde...</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Progress value={completionScore} className="w-32 h-2" />
              <span className="text-sm text-gray-600">{completionScore}%</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCloseChat}
              className="hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Messages area - cette div DOIT avoir une hauteur définie pour que le scroll fonctionne */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#6D3FC8] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-[#6D3FC8] text-white rounded-2xl rounded-tr-sm' 
                    : message.role === 'system'
                    ? 'bg-yellow-50 text-yellow-900 rounded-lg border border-yellow-200'
                    : 'bg-gray-100 rounded-2xl rounded-tl-sm'
                } p-4`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.metadata?.suggestions && (
                    <div className="mt-3 space-y-2">
                      {message.metadata.suggestions.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          className="block w-full text-left"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {message.role === 'personas' && message.metadata?.personas && (
                    <div className="mt-4 space-y-4">
                      {message.metadata.personas.personas?.map((persona: any) => (
                        <div 
                          key={persona.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:border-[#6D3FC8] transition-colors"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{persona.name}</h4>
                              <p className="text-sm text-gray-600">{persona.title}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {persona.age}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Situation:</span>
                              <p className="text-gray-600">{persona.situation}</p>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Problèmes principaux:</span>
                              <ul className="list-disc list-inside text-gray-600 ml-2">
                                {persona.problems?.map((problem: string, idx: number) => (
                                  <li key={idx}>{problem}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Motivations:</span>
                              <ul className="list-disc list-inside text-gray-600 ml-2">
                                {persona.motivations?.map((motivation: string, idx: number) => (
                                  <li key={idx}>{motivation}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Budget:</span>
                              <span className="text-gray-600 ml-2">{persona.budget}</span>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Canaux préférés:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {persona.channels?.map((channel: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {channel}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 bg-[#6D3FC8] hover:bg-[#5A35A5]"
                              onClick={() => handlePersonaSelect(persona, 'select')}
                            >
                              Sélectionner ce persona
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handlePersonaSelect(persona, 'modify')}
                            >
                              Adapter ce persona
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">U</span>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6D3FC8] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="flex-none p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Écrivez votre message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-[#6D3FC8] hover:bg-[#5A35A5]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {completionScore > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {completionScore < 60 
              ? `Continuez la discussion pour débloquer plus de fonctionnalités (${60 - completionScore}% restant)`
              : "✅ Données suffisantes collectées - L'analyse approfondie sera lancée à la fermeture"
            }
          </p>
        )}
      </div>
    </div>
  );
}