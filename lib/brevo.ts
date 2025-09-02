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
    // Vous devrez créer ces templates dans Brevo
    const templateId = isEnterprise 
      ? parseInt(process.env.BREVO_TEMPLATE_WAITLIST_ENTERPRISE || '1')
      : parseInt(process.env.BREVO_TEMPLATE_WAITLIST_STARTUP || '2');

    return this.sendTransactionalEmail({
      to: [{ email, name }],
      templateId,
      params: {
        name,
        position,
        waitlist_type: isEnterprise ? 'Entreprise' : 'Startup',
      },
    });
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