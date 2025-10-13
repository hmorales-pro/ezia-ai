<?php
/**
 * Script PHP pour envoyer les emails de webinaire via Brevo
 *
 * Usage: POST request avec JSON payload
 * URL: https://votre-hebergement.com/send-webinar-email.php
 *
 * Déployer ce fichier sur votre hébergement PHP séparé
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://ezia.ai');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ========================================
// CONFIGURATION BREVO (À PERSONNALISER)
// ========================================
define('BREVO_API_KEY', 'VOTRE_CLE_BREVO_API_ICI');
define('BREVO_SENDER_EMAIL', 'noreply@ezia.ai');
define('BREVO_SENDER_NAME', 'Ezia.ai');
define('ADMIN_EMAIL', 'hugo.morales.pro+waitlist@gmail.com');

// Clé de sécurité partagée entre Ezia et ce script
define('SECRET_KEY', 'ezia-webhook-secret-2025-change-this');

// ========================================
// VÉRIFICATION DE SÉCURITÉ
// ========================================
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if ($authHeader !== 'Bearer ' . SECRET_KEY) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// ========================================
// RÉCUPÉRATION DES DONNÉES
// ========================================
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Valider les champs requis
$requiredFields = ['firstName', 'lastName', 'email', 'type'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

// ========================================
// FONCTION : GÉNÉRER FICHIER .ICS
// ========================================
function generateICS() {
    $event = [
        'title' => 'Webinaire Ezia.ai - Automatisez votre Business avec l\'IA',
        'description' => 'Découvrez comment Ezia.ai peut transformer votre façon de travailler et vous faire gagner des heures chaque semaine.\n\nAu programme :\n- Création de projet guidée par IA\n- Analyse de marché automatique\n- Stratégie marketing sur mesure\n- Génération de contenu optimisé\n- Et bien plus encore !\n\nLien de connexion : [sera envoyé quelques jours avant]',
        'location' => 'En ligne (lien envoyé par email)',
        'start' => '2025-11-04T18:30:00Z', // UTC
        'end' => '2025-11-04T20:00:00Z'
    ];

    $ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Ezia.ai//Webinar//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        'UID:webinar-' . time() . '@ezia.ai',
        'DTSTAMP:' . gmdate('Ymd\THis\Z'),
        'DTSTART:' . str_replace([':', '-'], '', $event['start']),
        'DTEND:' . str_replace([':', '-'], '', $event['end']),
        'SUMMARY:' . $event['title'],
        'DESCRIPTION:' . str_replace("\n", '\\n', $event['description']),
        'LOCATION:' . $event['location'],
        'ORGANIZER;CN=' . BREVO_SENDER_NAME . ':mailto:' . BREVO_SENDER_EMAIL,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT24H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Rappel: Webinaire Ezia.ai demain à 19h30',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ];

    return implode("\r\n", $ics);
}

// ========================================
// FONCTION : ENVOYER EMAIL VIA BREVO
// ========================================
function sendBrevoEmail($payload) {
    $ch = curl_init('https://api.brevo.com/v3/smtp/email');

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'accept: application/json',
            'api-key: ' . BREVO_API_KEY,
            'content-type: application/json'
        ],
        CURLOPT_POSTFIELDS => json_encode($payload)
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'success' => $httpCode >= 200 && $httpCode < 300,
        'httpCode' => $httpCode,
        'response' => json_decode($response, true)
    ];
}

// ========================================
// TRAITEMENT SELON LE TYPE
// ========================================
$type = $data['type'];
$success = false;
$message = '';

if ($type === 'confirmation') {
    // EMAIL DE CONFIRMATION AU PARTICIPANT
    $icsContent = generateICS();
    $icsBase64 = base64_encode($icsContent);

    $googleCalendarLink = 'https://calendar.google.com/calendar/render?' . http_build_query([
        'action' => 'TEMPLATE',
        'text' => 'Webinaire Ezia.ai - Automatisez votre Business avec l\'IA',
        'details' => 'Découvrez comment Ezia.ai peut transformer votre façon de travailler',
        'location' => 'En ligne',
        'dates' => '20251104T183000Z/20251104T200000Z'
    ]);

    $htmlContent = file_get_contents(__DIR__ . '/email-template-confirmation.html');

    // Remplacer les placeholders
    $htmlContent = str_replace('{{firstName}}', htmlspecialchars($data['firstName']), $htmlContent);
    $htmlContent = str_replace('{{googleCalendarLink}}', $googleCalendarLink, $htmlContent);
    $htmlContent = str_replace('{{appUrl}}', 'https://ezia.ai', $htmlContent);

    $payload = [
        'to' => [['email' => $data['email'], 'name' => $data['firstName'] . ' ' . $data['lastName']]],
        'sender' => ['email' => BREVO_SENDER_EMAIL, 'name' => BREVO_SENDER_NAME],
        'subject' => '✅ Inscription confirmée - Webinaire Ezia.ai le 4 novembre',
        'htmlContent' => $htmlContent,
        'attachment' => [
            [
                'name' => 'webinaire-ezia.ics',
                'content' => $icsBase64
            ]
        ]
    ];

    $result = sendBrevoEmail($payload);
    $success = $result['success'];
    $message = $success ? 'Email de confirmation envoyé' : 'Erreur lors de l\'envoi';

} elseif ($type === 'admin') {
    // NOTIFICATION ADMIN
    $htmlContent = '<h2>🎯 Nouvelle inscription au webinaire</h2>';
    $htmlContent .= '<p><strong>Nom :</strong> ' . htmlspecialchars($data['firstName'] . ' ' . $data['lastName']) . '</p>';
    $htmlContent .= '<p><strong>Email :</strong> ' . htmlspecialchars($data['email']) . '</p>';

    if (!empty($data['company'])) {
        $htmlContent .= '<p><strong>Entreprise :</strong> ' . htmlspecialchars($data['company']) . '</p>';
    }
    if (!empty($data['position'])) {
        $htmlContent .= '<p><strong>Fonction :</strong> ' . htmlspecialchars($data['position']) . '</p>';
    }

    $payload = [
        'to' => [['email' => ADMIN_EMAIL]],
        'sender' => ['email' => BREVO_SENDER_EMAIL, 'name' => 'Ezia Webinar System'],
        'subject' => '🎯 Nouvelle inscription : ' . $data['firstName'] . ' ' . $data['lastName'],
        'htmlContent' => $htmlContent
    ];

    $result = sendBrevoEmail($payload);
    $success = $result['success'];
    $message = $success ? 'Notification admin envoyée' : 'Erreur lors de l\'envoi admin';

} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid type']);
    exit;
}

// ========================================
// RÉPONSE
// ========================================
http_response_code($success ? 200 : 500);
echo json_encode([
    'success' => $success,
    'message' => $message,
    'timestamp' => date('c')
]);
