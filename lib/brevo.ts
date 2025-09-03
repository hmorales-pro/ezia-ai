interface BrevoContactData {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    COMPANY?: string;
    PROFILE?: string;
    SOURCE?: string;
    URGENCY?: string;
    TOOLS?: string;
    PRIORITIES?: string;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

interface BrevoEmailData {
  to: Array<{ email: string; name?: string }>;
  templateId: number;
  params?: {
    [key: string]: string | number;
  };
}

export class BrevoService {
  private apiKey: string;
  private baseUrl = 'https://api.brevo.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, method: string, body?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  // Ajouter ou mettre à jour un contact
  async createOrUpdateContact(data: BrevoContactData) {
    return this.makeRequest('/contacts', 'POST', data);
  }

  // Envoyer un email transactionnel
  async sendTransactionalEmail(data: BrevoEmailData) {
    return this.makeRequest('/smtp/email', 'POST', data);
  }

  // Envoyer un email de confirmation de waitlist
  async sendWaitlistConfirmation(
    email: string,
    name: string,
    position: number,
    isEnterprise: boolean = false
  ) {
    // Si les templates sont configurés, les utiliser
    const templateId = isEnterprise 
      ? process.env.BREVO_TEMPLATE_WAITLIST_ENTERPRISE
      : process.env.BREVO_TEMPLATE_WAITLIST_STARTUP;

    // Si un template existe et n'est pas le placeholder
    if (templateId && !templateId.includes('template')) {
      return this.sendTransactionalEmail({
        to: [{ email, name }],
        templateId: parseInt(templateId),
        params: {
          name,
          position,
          waitlist_type: isEnterprise ? 'Entreprise' : 'Startup',
        },
      });
    }

    // Sinon, envoyer un email HTML direct
    const subject = isEnterprise 
      ? `${name}, votre demande d'accès Ezia Analytics est confirmée - Position #${position}`
      : `${name}, bienvenue chez Ezia ! 🚀 Position #${position}`;

    const htmlContent = isEnterprise 
      ? this.getEnterpriseEmailHTML(name, position)
      : this.getStartupEmailHTML(name, position);

    return this.makeRequest('/smtp/email', 'POST', {
      sender: {
        name: isEnterprise ? 'Ezia Analytics' : 'Ezia - Partenaire Business',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@ezia.ai'
      },
      to: [{ email, name }],
      subject,
      htmlContent,
    });
  }

  // HTML pour email Startup
  private getStartupEmailHTML(name: string, position: number): string {
    return `
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
    .cta-button { display: inline-block; background: #6D3FC8; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
      <p>Salut ${name} !</p>
      
      <p>Merci de rejoindre l'aventure Ezia ! Tu es officiellement inscrit(e) sur notre liste d'attente.</p>
      
      <div style="text-align: center;">
        <span class="position-badge">Position #${position}</span>
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
      <p><a href="https://ezia.ai/privacy">Politique de confidentialité</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // HTML pour email Enterprise
  private getEnterpriseEmailHTML(name: string, position: number): string {
    return `
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
    .cta-button { display: inline-block; background: #6D3FC8; color: white !important; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-weight: 600; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
    a { color: #6D3FC8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">EZIA ANALYTICS</div>
      <p style="margin: 0; opacity: 0.9;">Solution IA pour les entreprises ambitieuses</p>
    </div>
    
    <div class="content">
      <p>Bonjour ${name},</p>
      
      <p>Nous avons bien reçu votre demande d'accès à <strong>Ezia Analytics</strong>.</p>
      
      <div style="text-align: center;">
        <span class="position-badge">Position #${position}</span>
      </div>
      
      <h3>Pourquoi Ezia Analytics ?</h3>
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
          <a href="https://ezia.ai/home-enterprise" class="cta-button">Découvrir Ezia Analytics</a>
        </div>
      </div>
      
      <p>Des questions ? Répondez directement à cet email ou contactez-nous à <a href="mailto:enterprise@ezia.ai">enterprise@ezia.ai</a>.</p>
      
      <p>Cordialement,<br>
      <strong>L'équipe Ezia Analytics</strong></p>
    </div>
    
    <div class="footer">
      <p>Cet email fait suite à votre inscription sur ezia.ai/waitlist-enterprise</p>
      <p><a href="https://ezia.ai/privacy">Politique de confidentialité</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Envoyer une notification admin pour nouvelle inscription
  async sendAdminNotification(
    adminEmail: string,
    inscriptionData: {
      name: string;
      email: string;
      company?: string;
      profile?: string;
      urgency?: string;
      source?: string;
      position: number;
      needs?: string;
    }
  ) {
    const isEnterprise = inscriptionData.source === '/waitlist-enterprise';
    const subject = `Nouvelle inscription waitlist ${isEnterprise ? 'Enterprise' : 'Startup'} - ${inscriptionData.name}`;
    
    const htmlContent = `
      <h2>Nouvelle inscription sur la waitlist Ezia</h2>
      <p><strong>Type:</strong> ${isEnterprise ? 'Enterprise' : 'Startup'}</p>
      <p><strong>Position:</strong> #${inscriptionData.position}</p>
      <hr>
      <h3>Informations du contact:</h3>
      <ul>
        <li><strong>Nom:</strong> ${inscriptionData.name}</li>
        <li><strong>Email:</strong> ${inscriptionData.email}</li>
        ${inscriptionData.company ? `<li><strong>Entreprise:</strong> ${inscriptionData.company}</li>` : ''}
        <li><strong>Profil:</strong> ${inscriptionData.profile || 'Non spécifié'}</li>
        <li><strong>Urgence:</strong> ${inscriptionData.urgency || 'Non spécifié'}</li>
        <li><strong>Source:</strong> ${inscriptionData.source || 'website'}</li>
        <li><strong>Niveau Tech:</strong> ${this.extractTechLevel(inscriptionData.needs) || 'Non spécifié'}</li>
      </ul>
      <hr>
      <p><small>Email automatique envoyé depuis ezia.ai</small></p>
    `;

    // Envoi direct sans template
    return this.makeRequest('/smtp/email', 'POST', {
      sender: {
        name: 'Ezia Waitlist',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@ezia.ai'
      },
      to: [{ email: adminEmail }],
      subject,
      htmlContent,
    });
  }

  // Ajouter à une liste de contacts
  async addToList(email: string, listId: number) {
    return this.makeRequest(`/contacts/lists/${listId}/contacts/add`, 'POST', {
      emails: [email],
    });
  }

  // Helper pour extraire le niveau tech des besoins
  private extractTechLevel(needs?: string): string | null {
    if (!needs) return null;
    const techMatch = needs.match(/Tech:\s*(\w+)/);
    return techMatch ? techMatch[1] : null;
  }
}

// Instance singleton
let brevoInstance: BrevoService | null = null;

export function getBrevoService(): BrevoService | null {
  if (!process.env.BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not configured');
    return null;
  }

  if (!brevoInstance) {
    brevoInstance = new BrevoService(process.env.BREVO_API_KEY);
  }

  return brevoInstance;
}