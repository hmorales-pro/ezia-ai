import { BrevoService } from '../lib/brevo';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Configuration des templates
const templates = [
  {
    name: 'Ezia Waitlist Startup - Confirmation',
    subject: '{{params.name}}, bienvenue chez Ezia ! 🚀 Position #{{params.position}}',
    sender: {
      name: 'Ezia Team',
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@ezia.ai'
    },
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6D3FC8 0%, #8B5FE7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .position-badge { display: inline-block; background: #6D3FC8; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; margin: 20px 0; }
    h1 { margin: 0 0 10px 0; }
    h3 { color: #6D3FC8; margin-top: 25px; }
    ul { padding-left: 20px; }
    li { margin: 10px 0; }
    .cta-button { display: inline-block; background: #6D3FC8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    a { color: #6D3FC8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue chez Ezia ! 🎉</h1>
      <p>Ton partenaire business propulsé par l'IA</p>
    </div>
    
    <div class="content">
      <p>Salut {{params.name}} !</p>
      
      <p>Merci de rejoindre l'aventure Ezia ! Tu es officiellement inscrit(e) sur notre liste d'attente.</p>
      
      <div style="text-align: center;">
        <span class="position-badge">Position #{{params.position}}</span>
      </div>
      
      <h3>Ce qui t'attend avec Ezia :</h3>
      <ul>
        <li>💡 <strong>Un partenaire IA</strong> qui comprend vraiment ton business</li>
        <li>🎯 <strong>Des stratégies personnalisées</strong> pour ta croissance</li>
        <li>⚡ <strong>Des outils simples</strong> pour gagner du temps au quotidien</li>
        <li>📈 <strong>Des analyses concrètes</strong> pour prendre les bonnes décisions</li>
      </ul>
      
      <h3>Prochaines étapes :</h3>
      <p>On travaille dur pour te donner accès le plus vite possible. En attendant :</p>
      <ul>
        <li>📱 Suis-nous sur <a href="https://linkedin.com/company/ezia">LinkedIn</a> pour les dernières news</li>
        <li>💬 Réponds à cet email si tu as des questions</li>
        <li>🤝 Partage Ezia avec d'autres entrepreneurs qui pourraient être intéressés</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="https://ezia.ai" class="cta-button">Découvrir Ezia</a>
      </div>
      
      <p>On a hâte de t'accompagner dans ton aventure entrepreneuriale !</p>
      
      <p>À très vite,<br>
      <strong>L'équipe Ezia</strong></p>
    </div>
    
    <div class="footer">
      <p>Tu reçois cet email car tu t'es inscrit(e) sur ezia.ai</p>
      <p><a href="{{{unsubscribe}}}">Se désinscrire</a> | <a href="https://ezia.ai/privacy">Politique de confidentialité</a></p>
    </div>
  </div>
</body>
</html>
    `
  },
  {
    name: 'Ezia Waitlist Enterprise - Confirmation',
    subject: '{{params.name}}, votre demande d\'accès Ezia Enterprise est confirmée - Position #{{params.position}}',
    sender: {
      name: 'Ezia Enterprise',
      email: process.env.BREVO_SENDER_EMAIL || 'enterprise@ezia.ai'
    },
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1E1E1E 0%, #3A3A3A 100%); color: white; padding: 40px; text-align: center; }
    .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .content { background: white; padding: 40px; border: 1px solid #e0e0e0; }
    .position-badge { display: inline-block; background: #6D3FC8; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600; margin: 20px 0; }
    h1 { margin: 0; font-size: 24px; }
    h3 { color: #1E1E1E; margin-top: 30px; border-bottom: 2px solid #6D3FC8; padding-bottom: 10px; }
    ul { padding-left: 0; list-style: none; }
    li { margin: 12px 0; padding-left: 25px; position: relative; }
    li:before { content: "✓"; position: absolute; left: 0; color: #6D3FC8; font-weight: bold; }
    .cta-section { background: #f8f9fa; padding: 25px; margin: 30px 0; border-radius: 8px; }
    .cta-button { display: inline-block; background: #6D3FC8; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-weight: 600; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
    a { color: #6D3FC8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">EZIA ENTERPRISE</div>
      <p style="margin: 0; opacity: 0.9;">Solution IA pour les entreprises ambitieuses</p>
    </div>
    
    <div class="content">
      <p>Bonjour {{params.name}},</p>
      
      <p>Nous avons bien reçu votre demande d'accès à <strong>Ezia Enterprise</strong>.</p>
      
      <div style="text-align: center;">
        <span class="position-badge">Position #{{params.position}}</span>
      </div>
      
      <h3>Pourquoi Ezia Enterprise ?</h3>
      <ul>
        <li>🔐 <strong>Sécurité renforcée</strong> et conformité RGPD</li>
        <li>👥 <strong>Gestion multi-équipes</strong> avec permissions granulaires</li>
        <li>🤖 <strong>IA personnalisée</strong> entraînée sur votre secteur d'activité</li>
        <li>📊 <strong>Analytics avancés</strong> et tableaux de bord sur mesure</li>
        <li>🎯 <strong>Intégrations</strong> avec vos outils existants</li>
      </ul>
      
      <h3>Notre équipe va vous contacter</h3>
      <p>Un de nos experts Enterprise prendra contact avec vous dans les <strong>48 prochaines heures</strong> pour :</p>
      <ul>
        <li>Comprendre vos besoins spécifiques</li>
        <li>Vous présenter une démonstration personnalisée</li>
        <li>Discuter de votre roadmap de déploiement</li>
      </ul>
      
      <div class="cta-section">
        <h3 style="margin-top: 0; border: none; padding: 0;">En attendant</h3>
        <p>Découvrez comment d'autres entreprises utilisent Ezia pour transformer leur activité :</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://ezia.ai/home-enterprise" class="cta-button">Découvrir Ezia Enterprise</a>
        </div>
      </div>
      
      <p>Des questions ? Répondez directement à cet email ou contactez-nous à <a href="mailto:enterprise@ezia.ai">enterprise@ezia.ai</a>.</p>
      
      <p>Cordialement,<br>
      <strong>L'équipe Ezia Enterprise</strong></p>
    </div>
    
    <div class="footer">
      <p>Cet email fait suite à votre inscription sur ezia.ai/waitlist-enterprise</p>
      <p><a href="{{{unsubscribe}}}">Se désinscrire</a> | <a href="https://ezia.ai/privacy">Politique de confidentialité</a></p>
    </div>
  </div>
</body>
</html>
    `
  }
];

async function createBrevoTemplates() {
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY non configurée');
    return;
  }

  console.log('🚀 Création des templates Brevo...\n');

  for (const template of templates) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: template.sender,
          templateName: template.name,
          subject: template.subject,
          htmlContent: template.htmlContent,
          isActive: true
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`❌ Erreur pour "${template.name}":`, error);
      } else {
        const result = await response.json();
        console.log(`✅ Template créé: "${template.name}" (ID: ${result.id})`);
        console.log(`   👉 Mettez à jour .env.local avec cet ID\n`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour "${template.name}":`, error);
    }
  }

  console.log('\n📝 N\'oubliez pas de mettre à jour votre .env.local avec les IDs des templates créés !');
}

// Exécuter le script
createBrevoTemplates();