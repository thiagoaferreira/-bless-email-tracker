<?php
header('Content-Type: image/png');
header('Cache-Control: no-cache');
header('Access-Control-Allow-Origin: *');

// Capturar dados
$data = [
    'timestamp' => date('c'),
    'campaign' => $_GET['campaign'] ?? 'unknown',
    'user' => $_GET['user'] ?? 'anonymous',
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

// Log simples
error_log('Email tracking: ' . json_encode($data));

// Pixel transparente
echo base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
?>
