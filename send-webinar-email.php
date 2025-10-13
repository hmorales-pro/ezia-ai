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
// CHARGEMENT CONFIGURATION DEPUIS .env
// ========================================
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception('.env file not found at: ' . $path);
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignorer les commentaires
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        // Parser KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Supprimer les guillemets si présents
            $value = trim($value, '"\'');

            // Définir la constante
            if (!defined($key)) {
                define($key, $value);
            }
        }
    }
}

// Charger le fichier .env (au même emplacement que ce script)
loadEnv(__DIR__ . '/.env');

// Vérifier que les variables requises sont présentes
$required = ['BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'ADMIN_EMAIL', 'SECRET_KEY'];
foreach ($required as $var) {
    if (!defined($var) || empty(constant($var))) {
        http_response_code(500);
        echo json_encode(['error' => "Configuration error: $var not set"]);
        exit;
    }
}

// Définir les constantes optionnelles avec valeurs par défaut
if (!defined('BREVO_SENDER_NAME')) {
    define('BREVO_SENDER_NAME', 'Ezia.ai');
}

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
    $curlError = curl_error($ch);
    curl_close($ch);

    $success = $httpCode >= 200 && $httpCode < 300;
    $responseData = json_decode($response, true);

    // Log les erreurs pour debug
    if (!$success) {
        error_log("Brevo API Error - HTTP $httpCode: " . $response);
        if ($curlError) {
            error_log("cURL Error: " . $curlError);
        }
    }

    return [
        'success' => $success,
        'httpCode' => $httpCode,
        'response' => $responseData,
        'error' => !$success ? $response : null,
        'curlError' => $curlError ?: null
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

    $templatePath = __DIR__ . '/email-template-confirmation.html';

    // Vérifier que le template existe
    if (!file_exists($templatePath)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Template email manquant',
            'path' => $templatePath,
            'files_in_dir' => scandir(__DIR__)
        ]);
        exit;
    }

    $htmlContent = file_get_contents($templatePath);

    if ($htmlContent === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Impossible de lire le template email'
        ]);
        exit;
    }

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

    // Retourner plus de détails sur l'erreur
    if (!$success) {
        $message = 'Erreur Brevo API (HTTP ' . $result['httpCode'] . ')';
        if (isset($result['error'])) {
            $message .= ': ' . substr($result['error'], 0, 200);
        }
    } else {
        $message = 'Email de confirmation envoyé';
    }

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
