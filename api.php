<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) mkdir($dataDir, 0755, true);

$action = $_GET['action'] ?? '';
$validPlayers = ['sebas', 'jonathan', 'benjamin'];

switch ($action) {
    case 'getPlayer':
        $id = $_GET['id'] ?? '';
        if (!in_array($id, $validPlayers)) { echo 'null'; break; }
        $file = "$dataDir/player_$id.json";
        echo file_exists($file) ? file_get_contents($file) : 'null';
        break;

    case 'savePlayer':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['id']) || !in_array($data['id'], $validPlayers)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid player data']);
            break;
        }
        $file = "$dataDir/player_{$data['id']}.json";
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['ok' => true]);
        break;

    case 'getAllPlayers':
        $players = [];
        foreach ($validPlayers as $id) {
            $file = "$dataDir/player_$id.json";
            if (file_exists($file)) {
                $p = json_decode(file_get_contents($file), true);
                if ($p) $players[] = $p;
            }
        }
        echo json_encode($players);
        break;

    case 'saveSession':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['playerId'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid session data']);
            break;
        }
        $file = "$dataDir/sessions.json";
        $sessions = [];
        if (file_exists($file)) {
            $sessions = json_decode(file_get_contents($file), true) ?: [];
        }
        $data['id'] = count($sessions) + 1;
        $sessions[] = $data;
        file_put_contents($file, json_encode($sessions, JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['ok' => true]);
        break;

    case 'getPlayerSessions':
        $id = $_GET['id'] ?? '';
        $file = "$dataDir/sessions.json";
        if (!file_exists($file)) { echo '[]'; break; }
        $sessions = json_decode(file_get_contents($file), true) ?: [];
        $filtered = array_values(array_filter($sessions, fn($s) => ($s['playerId'] ?? '') === $id));
        echo json_encode($filtered);
        break;

    case 'getAllSessions':
        $file = "$dataDir/sessions.json";
        echo file_exists($file) ? file_get_contents($file) : '[]';
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action']);
}
