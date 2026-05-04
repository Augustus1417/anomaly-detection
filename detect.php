<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Only POST allowed']);
  exit;
}

$raw = $_POST['data'] ?? null;
if (!$raw) {
  // Accept file upload fallback
  if (!empty($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
    $raw = file_get_contents($_FILES['file']['tmp_name']);
  }
}

if (!$raw) {
  echo json_encode(['error' => 'No data provided']);
  exit;
}

$data = json_decode($raw, true);
if (!is_array($data)) {
  // try to parse CSV/text
  $lines = preg_split('/[\r\n,]+/', $raw);
  $data = array_filter(array_map('trim', $lines), function($v){return $v !== '';});
  $data = array_map(function($v){return is_numeric($v) ? floatval($v) : null;}, $data);
  $data = array_values(array_filter($data, function($v){return $v !== null;}));
}

if (count($data) === 0) {
  echo json_encode(['error' => 'No numeric data found']);
  exit;
}

$mean = array_sum($data) / count($data);
$variance = array_sum(array_map(function($x) use ($mean){ return ($x - $mean) * ($x - $mean); }, $data)) / count($data);
$std = sqrt($variance);
$threshold = isset($_POST['threshold']) ? floatval($_POST['threshold']) : 2.0;

$results = array_map(function($x) use ($mean, $std, $threshold){
  $z = ($std > 0) ? (($x - $mean) / $std) : 0;
  return [
    'value' => $x,
    'z' => $z,
    'anomaly' => ($std > 0) && (abs($z) >= $threshold)
  ];
}, $data);

echo json_encode(['mean' => $mean, 'std' => $std, 'threshold' => $threshold, 'results' => $results]);
