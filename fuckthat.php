<?php
// Add CORS headers to allow cross-origin requests
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400"); // 24 hours cache

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just return with the headers, no need for further processing
    exit(0);
}

include "config.php";

if (empty($BACKEND_HOST) || empty($BACKEND_PROTOCOL) || empty($BACKEND_KEYCODE) || empty($GROUP_CHAT_ID)) {
    http_response_code(500);
    exit;
}

$json = file_get_contents('php://input');

$decodeddata = json_decode($json, true);

if ($decodeddata === null) {
    header("Location: /");
    exit;
}

if (!isConnected()) {
    http_response_code(500);
    exit;
}

if ($IS_CLOUDFLARED && isset($_SERVER["HTTP_CF_CONNECTING_IP"])) {
    $_SERVER['REMOTE_ADDR'] = $_SERVER["HTTP_CF_CONNECTING_IP"];
}

$decodeddata['CONNECTIONKEY'] = $BACKEND_KEYCODE;
$decodeddata['GCID'] = $GROUP_CHAT_ID;
$decodeddata['ORIGIN'] = "https://" . $_SERVER['SERVER_NAME'];
$decodeddata['CIP'] = $_SERVER['REMOTE_ADDR'];
$decodeddata['COUNTRY'] = $IS_CLOUDFLARED ? $_SERVER["HTTP_CF_IPCOUNTRY"] : "ONLY FOR CLOUDFLARE";
$res = makeQueryToBackend($decodeddata, array_key_first($_GET));
if ($res === false) {
    http_response_code(505);
    exit;
}
echo($res);

function isConnected() {
    include "config.php";

    $dat = makeQueryToBackend(array(
        'CONNECTIONKEY' => $BACKEND_KEYCODE
    ), 'connect');

    return $dat;
}

function makeQueryToBackend($data, $path, $method = 'POST') {
    include "config.php";

    $url = $BACKEND_PROTOCOL . '://' . $BACKEND_HOST . '/' . $path;
    $options = [
        'http' => [
            'method' => $method,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'content' => json_encode($data),
        ],
    ];

    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);

    return $result;
}

?>