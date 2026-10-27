<?php
// ==============================================================================
// SAFE JOURNEYS - BREVO EMAIL DISPATCHER (PHP / CPANEL / APACHE DEPLOYMENTS)
// ==============================================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, api-key");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple .env parser for PHP
$envFile = __DIR__ . '/../.env';
$env = [];
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $env[trim($key)] = trim($val);
        }
    }
}

$apiKey = getenv('BREVO_API_KEY') ?: ($env['BREVO_API_KEY'] ?? '');
$ownerEmail = getenv('OWNER_EMAIL') ?: ($env['OWNER_EMAIL'] ?? 'naminathtravels22@gmail.com');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'online',
        'service' => 'Safe Journeys PHP Brevo Email Service',
        'configured' => !empty($apiKey)
    ]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['to'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required field: "to".']);
    exit();
}

$to = is_array($input['to']) ? $input['to'] : [['email' => $input['to'], 'name' => $input['toName'] ?? 'Customer']];
$senderName = $input['senderName'] ?? 'Safe Journeys Happy Memories';
$senderEmail = $input['senderEmail'] ?? $ownerEmail;
$subject = $input['subject'] ?? 'Safe Journeys - Booking Update';
$htmlContent = $input['htmlContent'] ?? nl2br(htmlspecialchars($input['textContent'] ?? ''));

$payload = [
    'sender' => ['name' => $senderName, 'email' => $senderEmail],
    'to' => $to,
    'subject' => $subject,
    'htmlContent' => $htmlContent
];

if (!empty($input['replyTo'])) {
    $payload['replyTo'] = ['email' => $input['replyTo']];
}

$ch = curl_init('https://api.brevo.com/v3/smtp/email');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'accept: application/json',
    'api-key: ' . $apiKey,
    'content-type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $curlErr]);
    exit();
}

http_response_code($httpCode);
echo $response;
?>
