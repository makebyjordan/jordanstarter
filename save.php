<?php
/**
 * save.php
 * Script backend simple y seguro para persistir los cambios del Backoffice.
 * No requiere bases de datos pesadas ni configuraciones de puertos.
 */

// Cabeceras CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Manejo de peticiones preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Obtener datos de la petición
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No se recibieron datos o el formato no es válido."]);
    exit;
}

// CONFIGURACIÓN DE LA CONTRASEÑA DE BACKOFFICE
// Por seguridad, cambia esta contraseña por la tuya personal.
$correct_password = "jordanstarter_secure_pass";

// Validar la contraseña enviada
if (!isset($data['password']) || $data['password'] !== $correct_password) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Contraseña de Backoffice incorrecta."]);
    exit;
}

// Validar estructura de los datos a guardar (payload)
$payload = $data['payload'] ?? null;
if (!$payload || 
    !isset($payload['posts']) || 
    !isset($payload['projects']) || 
    !isset($payload['startups']) || 
    !isset($payload['news']) || 
    !isset($payload['historia'])) {
    
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "La estructura del contenido es inválida o está incompleta."]);
    exit;
}

// Guardar en el archivo data.json
$file_path = __DIR__ . "/data.json";

// Intentar guardar con bloqueo de archivo para evitar corrupción en escrituras simultáneas
if (file_put_contents($file_path, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false) {
    echo json_encode(["status" => "success", "message" => "Cambios guardados correctamente en data.json."]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error al escribir en data.json. Asegúrate de que el servidor tenga permisos de escritura en la carpeta del proyecto."]);
}
