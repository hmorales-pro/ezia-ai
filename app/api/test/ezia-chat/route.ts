import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";
// import { streamAIResponse } from "@/lib/ai-stream";
import { nanoid } from "nanoid";

// API de test pour Ezia Chat - Sans authentification requise
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    // Créer un utilisateur de test
    const testUser = {
      id: "test-user-" + nanoid(6),
      name: "Test User",
      email: "test@example.com"
    };
    
    // Créer un business de test
    let testBusiness;
    const businessData = {
      user_id: testUser.id,
      business_id: `biz_test_${nanoid(6)}`,
      name: "Restaurant Gourmet Test",
      description: "Un restaurant gastronomique français innovant",
      industry: "Restauration",
      stage: "growth",
      is_active: true,
      completion_score: 20,
      ezia_interactions: [],
      social_media: {},
      market_analysis: {
        target_audience: "",
        value_proposition: "",
        competitors: [],
        opportunities: [],
        threats: []
      },
      marketing_strategy: {
        positioning: "",
        key_messages: [],
        channels: []
      },
      goals: []
    };
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      testBusiness = await memoryDB.create(businessData);
    } else {
      await dbConnect();
      testBusiness = await Business.create(businessData);
    }
    
    // Simuler différentes actions
    switch (action) {
      case "test_website":
        return testWebsiteCreation(testBusiness, testUser);
      case "test_market":
        return testMarketAnalysis(testBusiness);
      case "test_all":
        return testAllFeatures(testBusiness, testUser);
      default:
        return NextResponse.json({
          message: "Test API Ezia",
          business: testBusiness,
          availableActions: ["test_website", "test_market", "test_all"]
        });
    }
    
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function testWebsiteCreation(business: any, user: any) {
  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simuler la création du site
        const messages = [
          "Je vais créer un site web moderne pour votre restaurant...",
          "Analyse de vos besoins en cours...",
          "Génération du design personnalisé...",
          "Configuration des sections du site...",
          "Site web créé avec succès !"
        ];
        
        for (const msg of messages) {
          const data = encoder.encode(`data: ${JSON.stringify({ content: msg + "\n" })}\n\n`);
          controller.enqueue(data);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Simuler la création du site
        const siteUrl = `https://demo-restaurant-${business.business_id}.vercel.app`;
        
        // Mettre à jour le business
        if (isUsingMemoryDB()) {
          const memoryDB = getMemoryDB();
          await memoryDB.update(
            { business_id: business.business_id },
            { website_url: siteUrl, space_id: `demo-${business.business_id}` }
          );
        } else {
          await Business.findOneAndUpdate(
            { business_id: business.business_id },
            { website_url: siteUrl, space_id: `demo-${business.business_id}` }
          );
        }
        
        const result = {
          type: "website_created",
          url: siteUrl,
          message: "Site web créé avec succès en mode test !"
        };
        
        const doneData = encoder.encode(
          `data: ${JSON.stringify({ done: true, result })}\n\n`
        );
        controller.enqueue(doneData);
        controller.close();
      }
    });
    
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Website test error:", error);
    return NextResponse.json({ error: "Website test failed" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function testMarketAnalysis(business: any) {
  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simuler l'analyse de marché
        const messages = [
          "Analyse du marché de la restauration en cours...",
          "Identification de votre audience cible...",
          "Étude de la concurrence locale...",
          "Analyse des opportunités de croissance...",
          "Rapport d'analyse terminé !"
        ];
        
        for (const msg of messages) {
          const data = encoder.encode(`data: ${JSON.stringify({ content: msg + "\n" })}\n\n`);
          controller.enqueue(data);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Mettre à jour l'analyse
        const analysis = {
          target_audience: "Professionnels 30-50 ans, revenus élevés",
          value_proposition: "Cuisine gastronomique française moderne",
          market_size: "Marché local estimé à 2M€/an",
          competitors: ["Le Bernardin", "Chez Michel", "La Table du Chef"],
          opportunities: ["Livraison premium", "Events privés", "Cours de cuisine"],
          threats: ["Inflation des coûts", "Pénurie de main d'œuvre"],
          last_updated: new Date()
        };
        
        if (isUsingMemoryDB()) {
          const memoryDB = getMemoryDB();
          await memoryDB.update(
            { business_id: business.business_id },
            { market_analysis: analysis }
          );
        } else {
          await Business.findOneAndUpdate(
            { business_id: business.business_id },
            { market_analysis: analysis }
          );
        }
        
        const result = {
          type: "market_analysis_updated",
          message: "Analyse de marché complétée !"
        };
        
        const doneData = encoder.encode(
          `data: ${JSON.stringify({ done: true, result })}\n\n`
        );
        controller.enqueue(doneData);
        controller.close();
      }
    });
    
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Market analysis test error:", error);
    return NextResponse.json({ error: "Market test failed" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function testAllFeatures(business: any, user: any) {
  return NextResponse.json({
    message: "Test complet Ezia",
    business: {
      id: business.business_id,
      name: business.name,
      testUrls: {
        website: `/api/test/ezia-chat?action=test_website`,
        market: `/api/test/ezia-chat?action=test_market`
      }
    },
    instructions: "Utilisez les URLs de test pour simuler chaque fonctionnalité"
  });
}