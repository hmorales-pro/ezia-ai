import { NextRequest, NextResponse } from "next/server";
import { SiteOrchestrator } from "@/lib/agents/site-orchestrator";

export async function POST(request: NextRequest) {
  try {
    const { businessName, industry, description } = await request.json();

    if (!businessName || !industry) {
      return NextResponse.json(
        { error: "Nom du business et industrie requis" },
        { status: 400 }
      );
    }

    // Create orchestrator with business context
    const orchestrator = new SiteOrchestrator({
      businessName,
      industry,
      description: description || `${businessName} est une entreprise dans le secteur ${industry}.`,
      targetAudience: getTargetAudience(industry),
      goals: getBusinessGoals(industry)
    });

    // Generate the complete site
    const result = await orchestrator.generateSite();

    return NextResponse.json({
      html: result.html,
      metadata: {
        agents: result.agentOutputs,
        validationScores: result.validationScores,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error generating POC site:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du site" },
      { status: 500 }
    );
  }
}

function getTargetAudience(industry: string): string {
  const audiences: Record<string, string> = {
    restaurant: "Amateurs de bonne cuisine, familles, couples",
    ecommerce: "Acheteurs en ligne, millennials, personnes recherchant la commodité",
    consulting: "Entreprises, décideurs, PME en croissance",
    health: "Patients, personnes soucieuses de leur santé",
    education: "Étudiants, professionnels en reconversion, parents",
    tech: "Startups, développeurs, entreprises digitales",
    realestate: "Acheteurs, vendeurs, investisseurs immobiliers",
    fitness: "Sportifs, personnes actives, débutants en fitness",
    beauty: "Femmes 25-45 ans, passionnés de beauté",
    travel: "Voyageurs, aventuriers, familles"
  };
  return audiences[industry] || "Grand public";
}

function getBusinessGoals(industry: string): string[] {
  const goals: Record<string, string[]> = {
    restaurant: [
      "Attirer de nouveaux clients",
      "Présenter le menu et l'ambiance",
      "Faciliter les réservations"
    ],
    ecommerce: [
      "Augmenter les ventes en ligne",
      "Présenter les produits de manière attractive",
      "Simplifier le processus d'achat"
    ],
    consulting: [
      "Établir la crédibilité",
      "Générer des leads qualifiés",
      "Présenter l'expertise"
    ],
    health: [
      "Informer sur les services",
      "Faciliter la prise de rendez-vous",
      "Établir la confiance"
    ],
    education: [
      "Présenter les formations",
      "Faciliter les inscriptions",
      "Montrer les résultats"
    ],
    tech: [
      "Démontrer l'innovation",
      "Attirer des clients B2B",
      "Présenter les solutions"
    ],
    realestate: [
      "Présenter les biens",
      "Générer des contacts",
      "Établir la confiance"
    ],
    fitness: [
      "Attirer de nouveaux membres",
      "Présenter les programmes",
      "Motiver à l'action"
    ],
    beauty: [
      "Présenter les services",
      "Faciliter les réservations",
      "Montrer les résultats"
    ],
    travel: [
      "Inspirer les voyageurs",
      "Faciliter les réservations",
      "Présenter les destinations"
    ]
  };
  return goals[industry] || ["Augmenter la visibilité", "Générer des leads", "Établir la crédibilité"];
}