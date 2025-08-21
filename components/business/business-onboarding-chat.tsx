"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, ChevronRight, Calculator, Package, Users, TrendingUp, Euro, Clock, Target, Lightbulb, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface BusinessOnboardingChatProps {
  businessId: string;
  currentData?: any;
  onComplete: (data: any) => void;
  onClose: () => void;
}

// Questions contextuelles par catégorie
const QUESTION_FLOW = {
  intro: {
    questions: [
      {
        id: "welcome",
        type: "info",
        message: "👋 Bonjour ! Je suis Ezia, votre partenaire IA pour développer votre business. Plus vous me donnerez d'informations, mieux je pourrai vous aider à créer du contenu pertinent et des stratégies efficaces.",
      },
      {
        id: "business_type",
        type: "select",
        message: "Pour commencer, dites-moi : vendez-vous des produits, des services, ou les deux ?",
        options: [
          { value: "product", label: "Je vends des produits" },
          { value: "service", label: "Je propose des services" },
          { value: "hybrid", label: "Les deux" }
        ],
        field: "business_model.type"
      }
    ]
  },
  
  products: {
    condition: (data: any) => data.business_model?.type === "product" || data.business_model?.type === "hybrid",
    questions: [
      {
        id: "product_description",
        type: "text",
        message: "Parfait ! Parlez-moi de vos produits principaux. Qu'est-ce qui les rend uniques ?",
        field: "temp.product_description",
        hint: "Ex: Nous fabriquons des meubles éco-responsables en bois local, personnalisables..."
      },
      {
        id: "product_pricing",
        type: "number_with_unit",
        message: "Quel est le prix moyen de vos produits ?",
        field: "temp.average_price",
        unit: "€",
        follow_up: true
      },
      {
        id: "product_costs",
        type: "breakdown",
        message: "Pour mieux comprendre vos marges, pouvez-vous me donner une estimation de vos coûts ?",
        fields: {
          raw_materials: "Matières premières",
          labor: "Main d'œuvre",
          overhead: "Frais généraux"
        },
        calculate_margin: true
      }
    ]
  },
  
  services: {
    condition: (data: any) => data.business_model?.type === "service" || data.business_model?.type === "hybrid",
    questions: [
      {
        id: "service_description",
        type: "text",
        message: "Excellent ! Décrivez-moi vos services principaux et leur valeur ajoutée.",
        field: "temp.service_description",
        hint: "Ex: Conseil en transformation digitale pour PME, avec accompagnement personnalisé..."
      },
      {
        id: "service_pricing",
        type: "pricing_model",
        message: "Comment facturez-vous vos services ?",
        options: [
          { value: "hourly", label: "À l'heure", unit: "€/h" },
          { value: "project", label: "Au projet", unit: "€" },
          { value: "subscription", label: "Abonnement", unit: "€/mois" },
          { value: "results", label: "Aux résultats", unit: "%" }
        ]
      }
    ]
  },
  
  customers: {
    questions: [
      {
        id: "ideal_customer",
        type: "text",
        message: "Qui est votre client idéal ? Décrivez-le moi en détail.",
        field: "customer_insights.ideal_customer_profile",
        hint: "Ex: Entrepreneurs de 30-45 ans, PME de 10-50 employés dans le secteur tech..."
      },
      {
        id: "customer_problems",
        type: "multitext",
        message: "Quels sont les 3 principaux problèmes que vous résolvez pour vos clients ?",
        field: "customer_insights.customer_pain_points",
        min: 1,
        max: 5
      },
      {
        id: "customer_value",
        type: "number",
        message: "Quelle est la valeur moyenne d'un client sur sa durée de vie ? (estimation)",
        field: "customer_insights.average_customer_value",
        unit: "€",
        optional: true
      }
    ]
  },
  
  financials: {
    questions: [
      {
        id: "revenue_goal",
        type: "number",
        message: "Quel est votre objectif de chiffre d'affaires mensuel ?",
        field: "financial_info.target_monthly_revenue",
        unit: "€"
      },
      {
        id: "current_revenue",
        type: "number",
        message: "Et votre chiffre d'affaires actuel (mensuel) ?",
        field: "financial_info.monthly_revenue",
        unit: "€",
        optional: true
      },
      {
        id: "pricing_help",
        type: "yesno",
        message: "Souhaitez-vous que je vous aide à optimiser vos prix en fonction de vos objectifs et coûts ?",
        field: "temp.needs_pricing_help"
      }
    ]
  },
  
  strategy: {
    questions: [
      {
        id: "unique_value",
        type: "multitext",
        message: "Qu'est-ce qui vous différencie vraiment de vos concurrents ?",
        field: "business_model.unique_selling_points",
        min: 1,
        max: 5
      },
      {
        id: "growth_channels",
        type: "multiselect",
        message: "Par quels canaux souhaitez-vous développer votre business ?",
        field: "customer_insights.acquisition_channels",
        options: [
          { value: "website", label: "Site web" },
          { value: "social_media", label: "Réseaux sociaux" },
          { value: "email", label: "Email marketing" },
          { value: "partnerships", label: "Partenariats" },
          { value: "advertising", label: "Publicité" },
          { value: "word_of_mouth", label: "Bouche à oreille" },
          { value: "events", label: "Événements" },
          { value: "content", label: "Marketing de contenu" }
        ]
      }
    ]
  }
};

export function BusinessOnboardingChat({ 
  businessId, 
  currentData, 
  onComplete, 
  onClose 
}: BusinessOnboardingChatProps) {
  const [currentSection, setCurrentSection] = useState("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [inputValue, setInputValue] = useState("");
  const [multiInputValues, setMultiInputValues] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSection, currentQuestionIndex]);

  const getCurrentQuestion = () => {
    const section = QUESTION_FLOW[currentSection as keyof typeof QUESTION_FLOW];
    if (!section) return null;
    
    if ('condition' in section && !section.condition(answers)) {
      // Skip this section if condition not met
      moveToNextSection();
      return null;
    }
    
    return section.questions[currentQuestionIndex];
  };

  const moveToNextSection = () => {
    const sections = Object.keys(QUESTION_FLOW);
    const currentIndex = sections.indexOf(currentSection);
    
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1]);
      setCurrentQuestionIndex(0);
      setProgress((currentIndex + 1) / sections.length * 100);
    } else {
      // Onboarding terminé
      handleComplete();
    }
  };

  const handleAnswer = async () => {
    const question = getCurrentQuestion();
    if (!question || !question.field) return;

    // Sauvegarder la réponse
    const newAnswers = { ...answers };
    
    if (question.type === "multitext") {
      setNestedValue(newAnswers, question.field, multiInputValues.filter(v => v.trim()));
      setMultiInputValues([""]);
    } else if (question.type === "breakdown") {
      // Calculer la marge si nécessaire
      const breakdown = newAnswers.temp?.cost_breakdown || {};
      const totalCost = Object.values(breakdown).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
      const price = newAnswers.temp?.average_price || 0;
      
      if (price > 0 && totalCost > 0) {
        const margin = ((price - totalCost) / price * 100).toFixed(2);
        newAnswers.temp = { ...newAnswers.temp, calculated_margin: margin };
      }
    } else {
      setNestedValue(newAnswers, question.field, inputValue);
      setInputValue("");
    }
    
    setAnswers(newAnswers);

    // Passer à la question suivante
    const section = QUESTION_FLOW[currentSection as keyof typeof QUESTION_FLOW];
    if (currentQuestionIndex < section.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      moveToNextSection();
    }
  };

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Transformer les réponses temporaires en données structurées
      const processedData = processAnswers(answers);
      
      // Sauvegarder les données
      await api.patch(`/api/me/business/${businessId}/update`, processedData);
      
      // Lancer une analyse enrichie avec toutes ces nouvelles données
      await api.post(`/api/me/business/${businessId}/enrich-analysis`, {
        newData: processedData
      });
      
      toast.success("Merci pour toutes ces informations ! Je vais maintenant analyser votre business en profondeur.");
      
      onComplete(processedData);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const processAnswers = (rawAnswers: any) => {
    // Transformer les données temporaires en structure finale
    const processed: any = {
      business_model: rawAnswers.business_model || {},
      customer_insights: rawAnswers.customer_insights || {},
      financial_info: rawAnswers.financial_info || {},
      offerings: []
    };
    
    // Créer les offres à partir des données temporaires
    if (rawAnswers.temp?.product_description) {
      processed.offerings.push({
        id: `prod-${Date.now()}`,
        name: "Produit principal",
        description: rawAnswers.temp.product_description,
        type: "product",
        price: rawAnswers.temp.average_price || 0,
        currency: "EUR",
        cost_breakdown: rawAnswers.temp.cost_breakdown,
        margin: rawAnswers.temp.calculated_margin
      });
    }
    
    if (rawAnswers.temp?.service_description) {
      processed.offerings.push({
        id: `serv-${Date.now()}`,
        name: "Service principal",
        description: rawAnswers.temp.service_description,
        type: "service",
        price: rawAnswers.temp.service_price || 0,
        currency: "EUR",
        unit: rawAnswers.temp.service_unit
      });
    }
    
    return processed;
  };

  const renderQuestionInput = () => {
    const question = getCurrentQuestion();
    if (!question || question.type === "info") return null;

    switch (question.type) {
      case "select":
        return (
          <div className="space-y-3">
            <Select value={inputValue} onValueChange={setInputValue}>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez une option..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAnswer} 
              disabled={!inputValue}
              className="w-full"
            >
              Continuer
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case "multitext":
        return (
          <div className="space-y-3">
            {multiInputValues.map((value, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={value}
                  onChange={(e) => {
                    const newValues = [...multiInputValues];
                    newValues[index] = e.target.value;
                    setMultiInputValues(newValues);
                  }}
                  placeholder={`Point ${index + 1}`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && value.trim() && index === multiInputValues.length - 1) {
                      setMultiInputValues([...multiInputValues, ""]);
                    }
                  }}
                />
                {index === multiInputValues.length - 1 && multiInputValues.length < (question.max || 5) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMultiInputValues([...multiInputValues, ""])}
                  >
                    +
                  </Button>
                )}
              </div>
            ))}
            <Button 
              onClick={handleAnswer} 
              disabled={!multiInputValues.some(v => v.trim())}
              className="w-full"
            >
              Continuer
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case "number":
      case "number_with_unit":
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Montant"
              />
              {question.unit && (
                <span className="flex items-center px-3 bg-gray-100 rounded-md">
                  {question.unit}
                </span>
              )}
            </div>
            <Button 
              onClick={handleAnswer} 
              disabled={!inputValue && !question.optional}
              className="w-full"
            >
              {question.optional && !inputValue ? "Passer" : "Continuer"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case "breakdown":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Calculateur de coûts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(question.fields || {}).map(([key, label]) => (
                  <div key={key}>
                    <Label>{label as string}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        onChange={(e) => {
                          const breakdown = answers.temp?.cost_breakdown || {};
                          breakdown[key] = Number(e.target.value) || 0;
                          setAnswers({
                            ...answers,
                            temp: { ...answers.temp, cost_breakdown: breakdown }
                          });
                        }}
                      />
                      <span className="flex items-center px-3 bg-gray-100 rounded-md">€</span>
                    </div>
                  </div>
                ))}
                
                {answers.temp?.average_price && answers.temp?.cost_breakdown && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Coût total:</span>
                      <span className="font-medium">
                        {Object.values(answers.temp.cost_breakdown).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)}€
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Prix de vente:</span>
                      <span className="font-medium">{answers.temp.average_price}€</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Marge estimée:</span>
                      <span className="font-bold text-green-600">
                        {(() => {
                          const totalCost = Object.values(answers.temp.cost_breakdown).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
                          const margin = ((answers.temp.average_price - totalCost) / answers.temp.average_price * 100).toFixed(2);
                          return `${margin}%`;
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Button 
              onClick={handleAnswer} 
              className="w-full"
            >
              Continuer
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            {question.hint && (
              <p className="text-sm text-gray-500">{question.hint}</p>
            )}
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Votre réponse..."
              rows={3}
            />
            <Button 
              onClick={handleAnswer} 
              disabled={!inputValue && !question.optional}
              className="w-full"
            >
              {question.optional && !inputValue ? "Passer" : "Continuer"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );
    }
  };

  const question = getCurrentQuestion();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6D3FC8]" />
            <CardTitle>Discussion avec Ezia</CardTitle>
          </div>
          <Badge variant="outline">{Math.round(progress)}% complété</Badge>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {/* Messages */}
        <div className="space-y-4">
          {question && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6D3FC8] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-sm">{question.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Zone de saisie */}
        {question && question.type !== "info" && (
          <div className="pt-4">
            {renderQuestionInput()}
          </div>
        )}
        
        {question && question.type === "info" && (
          <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="w-full">
            Commencer
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>
    </Card>
  );
}