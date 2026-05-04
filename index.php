<?php
// Front-end page for the Anomaly Detection Lab
// Provides interactive interface for uploading datasets and detecting anomalies
// Uses Bootstrap for responsive design and D3.js for visualizations
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI Anomaly Detector - Z-score Detection</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">🔍 AI Anomaly Detector</a>
      </div>
    </nav>

    <main class="container my-5">
      <div class="row g-4">
        <!-- Input Controls Panel -->
        <div class="col-lg-4">
          <!-- Data Input Card -->
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">📤 Load Data</h5>
              <div class="mb-3">
                <label class="form-label">Upload CSV File</label>
                <input class="form-control" type="file" id="fileInput" accept=".csv,.json" />
                <div class="form-text">Upload a CSV or JSON file with numeric data.</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Or paste values</label>
                <textarea id="pasteInput" class="form-control" rows="4" placeholder="e.g., 12, 15, 13, 120, 14"></textarea>
                <div class="form-text">Comma or newline separated numeric values.</div>
              </div>

              <button id="loadSampleBtn" class="btn btn-outline-primary btn-sm w-100">
                📊 Load Sample Dataset
              </button>
            </div>
          </div>

          <!-- Detection Settings Card -->
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">⚙️ Detection Settings</h5>
              <div class="mb-3">
                <label class="form-label">Z-score Threshold</label>
                <input type="range" class="form-range" min="0.5" max="5" step="0.1" id="thresholdRange" value="2">
                <div class="d-flex justify-content-between align-items-center mt-2">
                  <small class="text-muted">Value: <strong id="thresholdDisplay">2.0</strong></small>
                  <button id="runBtn" class="btn btn-primary btn-sm">🚀 Run Detection</button>
                </div>
              </div>

              <div id="loading" class="text-center" style="display:none;">
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                <div class="mt-2" style="font-size: 0.9rem;">Analyzing data...</div>
              </div>
            </div>
          </div>

          <!-- Results Summary Card -->
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">📈 Results</h5>
              <div id="resultsSummary">Waiting for data...</div>
            </div>
          </div>
        </div>

        <!-- Visualization Panel -->
        <div class="col-lg-8">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">📊 Anomaly Visualization</h5>
              <div id="chart" style="width:100%; height:500px;"></div>
              <small class="text-muted d-block mt-3">
                <strong>Legend:</strong> 
                <span style="display: inline-block; width: 12px; height: 12px; background: #667eea; border-radius: 50%; margin-right: 4px;"></span> Normal Data | 
                <span style="display: inline-block; width: 12px; height: 12px; background: #e74c3c; border-radius: 50%; margin-right: 4px;"></span> Anomalies
              </small>
            </div>
          </div>
        </div>
      </div>
    </main>

    <script src="app.js"></script>
  </body>
</html>
