// Fallback pour les notifications email sans Brevo
// Utilise l'API de logs pour le développement

export async function sendAdminNotificationFallback(
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
  
  console.log('=== NOUVELLE INSCRIPTION WAITLIST ===');
  console.log(`Type: ${isEnterprise ? 'Enterprise' : 'Startup'}`);
  console.log(`Position: #${inscriptionData.position}`);
  console.log('--- Informations du contact ---');
  console.log(`Nom: ${inscriptionData.name}`);
  console.log(`Email: ${inscriptionData.email}`);
  if (inscriptionData.company) {
    console.log(`Entreprise: ${inscriptionData.company}`);
  }
  console.log(`Profil: ${inscriptionData.profile || 'Non spécifié'}`);
  console.log(`Urgence: ${inscriptionData.urgency || 'Non spécifié'}`);
  console.log(`Source: ${inscriptionData.source || 'website'}`);
  console.log('=====================================');
  
  // En production sans Brevo, on pourrait utiliser d'autres services
  // comme SendGrid, AWS SES, ou même un webhook vers Slack/Discord
}