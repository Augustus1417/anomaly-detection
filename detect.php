<?php
// AI Anomaly Detection Backend - Z-score based anomaly detection
// Accepts both simple numeric arrays and tabular CSV data with headers
// Returns statistical analysis and anomaly flags for each data point

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Only POST allowed']);
  exit;
}

// Get raw data from POST or file upload
$raw = $_POST['data'] ?? null;
if (!$raw && !empty($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
  $raw = file_get_contents($_FILES['file']['tmp_name']);
}

if (!$raw) {
  echo json_encode(['error' => 'No data provided']);
  exit;
}

// Parse input data - handle both JSON arrays and CSV
$data = json_decode($raw, true);
if (!is_array($data)) {
  // Parse as CSV - check if it has headers and extract numeric column
  $lines = preg_split('/\r?\n/', trim($raw));
  $data = [];
  $headers = [];
  $selectedColumn = isset($_POST['column']) ? $_POST['column'] : null;
  
  foreach ($lines as $idx => $line) {
    if (trim($line) === '') continue;
    $cells = str_getcsv($line);
    
    if ($idx === 0) {
      // First line - could be header
      $hasHeader = false;
      foreach ($cells as $cell) {
        if (!is_numeric(trim($cell))) {
          $hasHeader = true;
          break;
        }
      }
      
      if ($hasHeader) {
        $headers = array_map('trim', $cells);
        continue;
      }
    }
    
    // Extract numeric value from selected column or first numeric value
    foreach ($cells as $i => $cell) {
      $val = floatval(trim($cell));
      if (is_numeric(trim($cell))) {
        $data[] = $val;
        break;
      }
    }
  }
}

if (count($data) === 0) {
  echo json_encode(['error' => 'No numeric data found']);
  exit;
}

// Compute Z-score based anomaly detection
// Z-score = (value - mean) / standard_deviation
// Points with |z| >= threshold are flagged as anomalies

$mean = array_sum($data) / count($data);
$variance = array_sum(array_map(function($x) use ($mean) { return ($x - $mean) * ($x - $mean); }, $data)) / count($data);
$std = sqrt($variance);
$threshold = isset($_POST['threshold']) ? floatval($_POST['threshold']) : 2.0;

$results = array_map(function($x) use ($mean, $std, $threshold) {
  $z = ($std > 0) ? (($x - $mean) / $std) : 0;
  return [
    'value' => $x,
    'z' => $z,
    'anomaly' => ($std > 0) && (abs($z) >= $threshold)
  ];
}, $data);

echo json_encode(['mean' => $mean, 'std' => $std, 'threshold' => $threshold, 'results' => $results]);
