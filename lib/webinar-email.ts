import { getBrevoApiKey, getBrevoSenderEmail, getAdminNotificationEmail } from './env-loader';

interface WebinarRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  position?: string;
}

/**
 * Génère un fichier .ics pour ajouter le webinaire au calendrier
 */
export function generateICSFile(): string {
  const event = {
    title: 'Webinaire Ezia.ai - Automatisez votre Business avec l\'IA',
    description: 'Découvrez comment Ezia.ai peut transformer votre façon de travailler et vous faire gagner des heures chaque semaine.\\n\\nAu programme :\\n- Création de projet guidée par IA\\n- Analyse de marché automatique\\n- Stratégie marketing sur mesure\\n- Génération de contenu optimisé\\n- Et bien plus encore !\\n\\nLien de connexion : [sera envoyé quelques jours avant]',
    location: 'En ligne (lien envoyé par email)',
    start: '2025-11-04T19:30:00',
    end: '2025-11-04T21:00:00',
    organizer: {
      name: 'Hugo Morales - Ezia.ai',
      email: getBrevoSenderEmail() || 'noreply@ezia.ai'
    }
  };

  // Convertir les dates en format UTC pour le fichier ICS
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ezia.ai//Webinar//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:webinar-${Date.now()}@ezia.ai`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    `ORGANIZER;CN=${event.organizer.name}:mailto:${event.organizer.email}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Rappel: Webinaire Ezia.ai demain à 19h30',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

/**
 * Génère un lien Google Calendar
 */
export function generateGoogleCalendarLink(): string {
  const event = {
    title: 'Webinaire Ezia.ai - Automatisez votre Business avec l\'IA',
    description: 'Découvrez comment Ezia.ai peut transformer votre façon de travailler et vous faire gagner des heures chaque semaine.\n\nAu programme :\n- Création de projet guidée par IA\n- Analyse de marché automatique\n- Stratégie marketing sur mesure\n- Génération de contenu optimisé\n- Et bien plus encore !\n\nLien de connexion : [sera envoyé quelques jours avant]',
    location: 'En ligne',
    start: '20251104T183000Z', // 19:30 Paris = 18:30 UTC en hiver
    end: '20251104T200000Z'    // 21:00 Paris = 20:00 UTC en hiver
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${event.start}/${event.end}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Envoie un email via l'API Brevo
 */
async function sendBrevoEmail(payload: any): Promise<boolean> {
  const apiKey = getBrevoApiKey();

  if (!apiKey) {
    console.error('❌ BREVO_API_KEY non configurée - email non envoyé');
    console.error('Variables disponibles:', {
      hasBrevoKey: !!getBrevoApiKey(),
      hasSenderEmail: !!getBrevoSenderEmail(),
      hasAdminEmail: !!getAdminNotificationEmail()
    });
    return false;
  }

  try {
    console.log('📤 Envoi email via Brevo à:', payload.to?.[0]?.email);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur Brevo API (status ' + response.status + '):', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Email envoyé avec succès, messageId:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'appel à Brevo:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    return false;
  }
}

/**
 * Envoie l'email de confirmation avec le fichier ICS en pièce jointe
 */
export async function sendWebinarConfirmationEmail(data: WebinarRegistrationData): Promise<boolean> {
  try {
    const icsContent = generateICSFile();
    const icsBase64 = Buffer.from(icsContent).toString('base64');
    const googleCalendarLink = generateGoogleCalendarLink();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header avec gradient violet -->
          <tr>
            <td style="background: linear-gradient(135deg, #6D3FC8 0%, #5A35A5 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">✅ Inscription confirmée !</h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">Vous êtes inscrit au webinaire Ezia.ai</p>
            </td>
          </tr>

          <!-- Corps principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1e1e1e; font-size: 16px; line-height: 1.6;">
                Bonjour <strong>${data.firstName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; color: #1e1e1e; font-size: 16px; line-height: 1.6;">
                Merci pour votre inscription au webinaire <strong>"Automatisez votre Business avec l'IA"</strong>. Nous sommes ravis de vous compter parmi nous ! 🚀
              </p>

              <!-- Encadré date/heure -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f3e8ff 0%, #e0d4f7 100%); border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6D3FC8; font-size: 18px; margin-right: 10px;">📅</span>
                          <span style="color: #1e1e1e; font-size: 16px; font-weight: 600;">Mardi 4 novembre 2025</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6D3FC8; font-size: 18px; margin-right: 10px;">🕐</span>
                          <span style="color: #1e1e1e; font-size: 16px; font-weight: 600;">19h30 (heure de Paris)</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6D3FC8; font-size: 18px; margin-right: 10px;">⏱️</span>
                          <span style="color: #1e1e1e; font-size: 16px; font-weight: 600;">Durée : 45 min à 1h30</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6D3FC8; font-size: 18px; margin-right: 10px;">💻</span>
                          <span style="color: #1e1e1e; font-size: 16px; font-weight: 600;">En ligne (lien envoyé quelques jours avant)</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Boutons Calendrier -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 15px 0; color: #1e1e1e; font-size: 16px; font-weight: 600;">📆 Ajoutez-le à votre calendrier :</p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="${googleCalendarLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6D3FC8 0%, #5A35A5 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                            Google Calendar
                          </a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="https://outlook.live.com/calendar/0/deeplink/compose?subject=Webinaire%20Ezia.ai&startdt=2025-11-04T18:30:00Z&enddt=2025-11-04T20:00:00Z" target="_blank" style="display: inline-block; background: #0078d4; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                            Outlook
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 15px 0 0 0; color: #666; font-size: 13px;">Un fichier .ics est également joint à cet email</p>
                  </td>
                </tr>
              </table>

              <!-- Au programme -->
              <h2 style="margin: 0 0 20px 0; color: #1e1e1e; font-size: 20px; font-weight: 600;">Au programme :</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #6D3FC8; margin-right: 10px;">✓</span>
                    <span style="color: #1e1e1e; font-size: 15px;">Voir Ezia en action avec une démo en direct</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #6D3FC8; margin-right: 10px;">✓</span>
                    <span style="color: #1e1e1e; font-size: 15px;">Créer et structurer un projet business en quelques minutes</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #6D3FC8; margin-right: 10px;">✓</span>
                    <span style="color: #1e1e1e; font-size: 15px;">Générer une analyse de marché complète automatiquement</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #6D3FC8; margin-right: 10px;">✓</span>
                    <span style="color: #1e1e1e; font-size: 15px;">Concevoir une stratégie marketing personnalisée</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #6D3FC8; margin-right: 10px;">✓</span>
                    <span style="color: #1e1e1e; font-size: 15px;">Produire un mois de contenu en quelques clics</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 20px 0;">
                    <span style="color: #6D3FC8; margin-right: 10px;">✓</span>
                    <span style="color: #1e1e1e; font-size: 15px;">Session Q&A pour répondre à toutes vos questions</span>
                  </td>
                </tr>
              </table>

              <!-- Intervenant -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9fb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 10px 0; color: #1e1e1e; font-size: 16px; font-weight: 600;">🎤 Votre intervenant</h3>
                    <p style="margin: 0; color: #1e1e1e; font-size: 14px; line-height: 1.6;">
                      <strong style="color: #6D3FC8;">Hugo Morales</strong>, fondateur d'Eziom et concepteur d'Ezia.ai.<br/>
                      Plus de 10 ans d'expérience en transformation digitale et 3 ans d'expertise en IA appliquée au business.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Prochaines étapes -->
              <p style="margin: 0 0 10px 0; color: #1e1e1e; font-size: 16px; line-height: 1.6;">
                <strong>Prochaines étapes :</strong>
              </p>
              <p style="margin: 0 0 30px 0; color: #666; font-size: 15px; line-height: 1.6;">
                • Vous recevrez un email de rappel <strong>48h avant</strong> le webinaire<br/>
                • Le <strong>lien de connexion</strong> vous sera envoyé <strong>quelques jours avant</strong><br/>
                • N'hésitez pas à préparer vos questions !
              </p>

              <!-- CTA Découvrir Ezia -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ezia.ai'}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6D3FC8 0%, #5A35A5 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Découvrir Ezia dès maintenant
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                À très bientôt,<br/>
                <strong>L'équipe Ezia.ai</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9fb; padding: 30px; text-align: center; border-top: 1px solid #e5e5e7;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">
                Vous recevez cet email car vous vous êtes inscrit au webinaire Ezia.ai
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © 2025 Ezia.ai - Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const payload = {
      to: [{ email: data.email, name: `${data.firstName} ${data.lastName}` }],
      sender: {
        email: getBrevoSenderEmail() || 'noreply@ezia.ai',
        name: 'Ezia.ai'
      },
      subject: '✅ Inscription confirmée - Webinaire Ezia.ai le 4 novembre',
      htmlContent: htmlContent,
      attachment: [{
        name: 'webinaire-ezia.ics',
        content: icsBase64
      }]
    };

    const success = await sendBrevoEmail(payload);
    if (success) {
      console.log('✅ Email de confirmation envoyé à:', data.email);
    }
    return success;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
}

/**
 * Envoie une notification admin pour chaque nouvelle inscription
 */
export async function sendAdminNotification(data: WebinarRegistrationData & {
  mainChallenge?: string;
  projectDescription?: string;
  expectations?: string;
  interests?: string[];
}): Promise<boolean> {
  try {
    const adminEmail = getAdminNotificationEmail() || 'hugo.morales.pro+waitlist@gmail.com';

    const challengeLabels: Record<string, string> = {
      time: 'Manque de temps',
      content: 'Création de contenu',
      market_analysis: 'Analyse de marché',
      marketing_strategy: 'Stratégie marketing',
      other: 'Autre'
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #6D3FC8; margin-top: 0;">🎯 Nouvelle inscription au webinaire</h2>

    <div style="background-color: #f9f9fb; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e1e1e;">Informations du participant</h3>
      <p><strong>Nom :</strong> ${data.firstName} ${data.lastName}</p>
      <p><strong>Email :</strong> ${data.email}</p>
      ${data.company ? `<p><strong>Entreprise :</strong> ${data.company}</p>` : ''}
      ${data.position ? `<p><strong>Fonction :</strong> ${data.position}</p>` : ''}
    </div>

    ${data.mainChallenge || data.projectDescription || data.expectations ? `
    <div style="background-color: #fff7ed; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #fb923c;">
      <h3 style="margin-top: 0; color: #1e1e1e;">Informations qualitatives</h3>
      ${data.mainChallenge ? `<p><strong>Défi principal :</strong> ${challengeLabels[data.mainChallenge] || data.mainChallenge}</p>` : ''}
      ${data.projectDescription ? `<p><strong>Projet :</strong><br/>${data.projectDescription}</p>` : ''}
      ${data.expectations ? `<p><strong>Attentes :</strong><br/>${data.expectations}</p>` : ''}
    </div>
    ` : ''}

    ${data.interests && data.interests.length > 0 ? `
    <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e1e1e;">Centres d'intérêt</h3>
      <p>${data.interests.map(i => i.replace(/_/g, ' ')).join(', ')}</p>
    </div>
    ` : ''}

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      Date d'inscription : ${new Date().toLocaleString('fr-FR')}
    </p>
  </div>
</body>
</html>
    `.trim();

    const payload = {
      to: [{ email: adminEmail }],
      sender: {
        email: getBrevoSenderEmail() || 'noreply@ezia.ai',
        name: 'Ezia Webinar System'
      },
      subject: `🎯 Nouvelle inscription : ${data.firstName} ${data.lastName}`,
      htmlContent: htmlContent
    };

    const success = await sendBrevoEmail(payload);
    if (success) {
      console.log('✅ Notification admin envoyée');
    }
    return success;
  } catch (error) {
    console.error('❌ Erreur notification admin:', error);
    return false;
  }
}
