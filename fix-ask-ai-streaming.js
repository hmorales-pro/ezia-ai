#!/usr/bin/env node

/**
 * Script pour corriger le support du mode non-streaming dans ask-ai
 */

const fs = require('fs');

console.log('🔧 CORRECTION DU SUPPORT STREAMING DANS ASK-AI\n');

const askAiFile = './app/api/ask-ai/route.ts';
const backupFile = './app/api/ask-ai/route.backup.ts';

// 1. Faire un backup
console.log('1. Création du backup...');
fs.copyFileSync(askAiFile, backupFile);
console.log('✅ Backup créé:', backupFile);

// 2. Lire le fichier
console.log('\n2. Lecture du fichier...');
let content = fs.readFileSync(askAiFile, 'utf8');

// 3. Appliquer les modifications
console.log('\n3. Application des modifications...');

// Modification 1: Extraire stream du body
const bodyExtractPattern = /const { prompt, provider, model, redesignMarkdown, html, businessId } = body;/;
const bodyExtractReplace = 'const { prompt, provider, model, redesignMarkdown, html, businessId, stream = true } = body;';

if (content.includes(bodyExtractPattern.source)) {
  content = content.replace(bodyExtractPattern, bodyExtractReplace);
  console.log('✅ Ajout de l\'extraction du paramètre stream');
} else {
  console.log('⚠️  Pattern d\'extraction du body non trouvé');
}

// Modification 2: Ajouter une condition pour le mode non-streaming
const streamStartPattern = /\/\/ Create a stream response\n\s+const encoder = new TextEncoder\(\);/;
const nonStreamingCode = `    // Handle non-streaming mode for website generation
    if (!stream) {
      console.log("AI Request - Non-streaming mode");
      
      try {
        const client = new InferenceClient(token);
        const chatCompletion = await client.chatCompletion(
          {
            model: selectedModel.value,
            provider: selectedProvider.id as any,
            messages: [
              {
                role: "system",
                content: businessId ? 
                  \`\${INITIAL_SYSTEM_PROMPT}\\n\\nIMPORTANT: Tu dois créer un site web professionnel en français.\\nUtilise des couleurs et un design adaptés à l'industrie mentionnée.\\nLe site doit inclure: header avec navigation, hero section, services, à propos, contact, footer.\\nLe contenu doit être pertinent et personnalisé selon les informations du business fournies.\` :
                  INITIAL_SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: businessId
                  ? \`Génère un site web professionnel en français basé sur ces informations:\\n\\n\${prompt}\\n\\nCrée un site moderne et responsive qui correspond parfaitement au business décrit.\`
                  : prompt,
              },
            ],
            max_tokens: selectedProvider.max_tokens,
          },
          billTo ? { billTo } : {}
        );
        
        const responseContent = chatCompletion.choices[0]?.message?.content;
        
        if (!responseContent) {
          return NextResponse.json(
            { ok: false, message: "No content returned from the model" },
            { status: 400 }
          );
        }
        
        console.log("AI Response length:", responseContent.length);
        
        return NextResponse.json({
          ok: true,
          content: responseContent,
          model: selectedModel.value,
          provider: selectedProvider.id
        });
        
      } catch (error: any) {
        console.error("AI non-streaming error:", error);
        
        if (error.message?.includes("exceeded your monthly included credits")) {
          return NextResponse.json(
            {
              ok: false,
              openProModal: true,
              message: error.message,
            },
            { status: 402 }
          );
        }
        
        // Try fallback for non-streaming mode
        if (error.message?.includes("Failed to perform inference") || error.message?.includes("HTTP error")) {
          console.log("Trying fallback in non-streaming mode");
          try {
            const fallbackResponse = await generateWithFallback(
              token,
              businessId
                ? \`Génère un site web professionnel en français basé sur ces informations:\\n\\n\${prompt}\\n\\nCrée un site moderne et responsive qui correspond parfaitement au business décrit.\`
                : prompt,
              INITIAL_SYSTEM_PROMPT
            );
            
            return NextResponse.json({
              ok: true,
              content: fallbackResponse,
              model: "fallback",
              provider: "huggingface"
            });
          } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
          }
        }
        
        return NextResponse.json(
          {
            ok: false,
            message: error.message || "An error occurred while processing your request.",
          },
          { status: 500 }
        );
      }
    }
    
    // Create a stream response
    const encoder = new TextEncoder();`;

// Chercher et remplacer
const streamStartIndex = content.search(streamStartPattern);
if (streamStartIndex !== -1) {
  const beforeStream = content.substring(0, streamStartIndex);
  const afterStream = content.substring(streamStartIndex);
  content = beforeStream + nonStreamingCode + afterStream.substring(afterStream.indexOf('const encoder = new TextEncoder();'));
  console.log('✅ Ajout du support non-streaming');
} else {
  console.log('⚠️  Pattern de création du stream non trouvé');
}

// 4. Écrire le fichier modifié
console.log('\n4. Écriture du fichier modifié...');
fs.writeFileSync(askAiFile, content);
console.log('✅ Fichier modifié avec succès');

console.log('\n✨ CORRECTION APPLIQUÉE !');
console.log('\nLes changements appliqués:');
console.log('- Extraction du paramètre "stream" du body (défaut: true)');
console.log('- Support du mode non-streaming quand stream=false');
console.log('- Retour d\'un JSON simple au lieu d\'un stream');
console.log('- Gestion des erreurs et fallback en mode non-streaming');

console.log('\nPour revenir en arrière:');
console.log(`cp ${backupFile} ${askAiFile}`);