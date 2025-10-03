const testSiteGenerator = async () => {
  const baseUrl = 'http://localhost:3000';
  
  const testCases = [
    {
      name: 'Restaurant Français',
      prompt: 'Restaurant gastronomique français à Paris, spécialisé dans la cuisine traditionnelle avec une touche moderne. Ambiance élégante et service impeccable.',
      businessInfo: {
        industry: 'Restaurant',
        tone: 'Élégant',
        keywords: ['gastronomie', 'cuisine française', 'Paris', 'restaurant'],
        colors: {
          primary: '#8B4513',
          secondary: '#DAA520',
          accent: '#F5DEB3'
        }
      }
    },
    {
      name: 'Startup Tech',
      prompt: 'Startup technologique qui développe une solution SaaS pour la gestion de projets. Interface moderne et intuitive, destinée aux équipes créatives.',
      businessInfo: {
        industry: 'Technology',
        tone: 'Moderne',
        keywords: ['SaaS', 'gestion de projets', 'startup', 'productivité'],
        colors: {
          primary: '#6366F1',
          secondary: '#4F46E5',
          accent: '#A5B4FC'
        }
      }
    },
    {
      name: 'Agence Marketing',
      prompt: 'Agence de marketing digital spécialisée dans le branding et la communication pour les PME. Approche créative et résultats mesurables.',
      businessInfo: {
        industry: 'Marketing',
        tone: 'Créatif',
        keywords: ['marketing digital', 'branding', 'communication', 'PME'],
        colors: {
          primary: '#0EA5E9',
          secondary: '#0284C7',
          accent: '#E0F2FE'
        }
      }
    }
  ];

  console.log('🚀 Démarrage des tests du générateur de sites...\n');

  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`📝 Prompt: ${testCase.prompt.substring(0, 100)}...`);
    
    try {
      const response = await fetch(`${baseUrl}/api/test-site-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: testCase.prompt,
          businessInfo: testCase.businessInfo
        })
      });

      const result = await response.json();

      if (result.ok) {
        console.log('✅ Succès!');
        console.log(`📊 Site ID: ${result.site.id}`);
        console.log(`📄 Titre: ${result.site.title}`);
        console.log(`🎨 Thème: ${result.site.theme}`);
        console.log(`📐 Pages: ${result.site.pages}`);
        console.log(`⏱️  Temps de génération: ${result.generationTime}ms`);
        console.log(`🔄 Événements: ${result.events.length}`);
        
        // Vérifier la structure HTML
        if (result.html) {
          const htmlSize = result.html.length;
          console.log(`📦 Taille HTML: ${Math.round(htmlSize / 1024)}KB`);
          
          // Vérifier les éléments clés
          const hasDoctype = result.html.includes('<!DOCTYPE');
          const hasHead = result.html.includes('<head>');
          const hasBody = result.html.includes('<body>');
          const hasTitle = result.html.includes('<title>');
          
          console.log(`🔍 Validation HTML:`);
          console.log(`   - DOCTYPE: ${hasDoctype ? '✅' : '❌'}`);
          console.log(`   - Head: ${hasHead ? '✅' : '❌'}`);
          console.log(`   - Body: ${hasBody ? '✅' : '❌'}`);
          console.log(`   - Title: ${hasTitle ? '✅' : '❌'}`);
          
          // Sauvegarder le HTML pour inspection
          const fs = require('fs');
          const path = require('path');
          const fileName = `test-${testCase.name.toLowerCase().replace(/\s+/g, '-')}.html`;
          const filePath = path.join(__dirname, '..', 'test-output', fileName);
          
          // Créer le dossier si nécessaire
          const outputDir = path.dirname(filePath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          
          fs.writeFileSync(filePath, result.html);
          console.log(`💾 HTML sauvegardé: ${fileName}`);
        }
        
        // Afficher les événements
        console.log(`📈 Événements de génération:`);
        result.events.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.type} - ${event.timestamp || ''}`);
        });
        
      } else {
        console.log('❌ Échec!');
        console.log(`Erreur: ${result.error}`);
        if (result.details) {
          console.log(`Détails: ${result.details}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Erreur de connexion!');
      console.log(`Erreur: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }

  console.log('🏁 Tests terminés!');
  console.log('');
  console.log('📂 Fichiers HTML générés dans le dossier: test-output/');
  console.log('');
  console.log('🔍 Pour inspecter les sites générés:');
  console.log('   1. Ouvrez les fichiers HTML dans votre navigateur');
  console.log('   2. Vérifiez le rendu visuel');
  console.log('   3. Testez la responsivité (mobile/desktop)');
  console.log('   4. Validez le HTML avec un validateur en ligne');
};

// Exécuter les tests
if (require.main === module) {
  testSiteGenerator().catch(console.error);
}

module.exports = { testSiteGenerator };
