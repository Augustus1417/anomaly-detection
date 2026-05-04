<?php
// Simple front-end page for the Anomaly Detection lab
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI Anomaly Detector</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">AI Anomaly Detector</a>
      </div>
    </nav>

    <main class="container my-4">
      <div class="row">
        <div class="col-lg-4">
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">Input Data</h5>
              <div class="mb-3">
                <label class="form-label">Upload CSV</label>
                <input class="form-control" type="file" id="fileInput" accept=".csv" />
                <div class="form-text">CSV with a numeric column. Header optional.</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Or paste values (comma/newline separated)</label>
                <textarea id="pasteInput" class="form-control" rows="5" placeholder="e.g. 12, 15, 13, 120, 14"></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Threshold (Z-score)</label>
                <input type="range" class="form-range" min="0" max="5" step="0.1" id="thresholdRange" value="2">
                <div class="d-flex justify-content-between align-items-center">
                  <input type="number" id="thresholdNumber" class="form-control me-2" value="2" step="0.1" style="width:6rem;" />
                  <button id="runBtn" class="btn btn-primary ms-auto">Run Detection</button>
                </div>
              </div>

              <div id="loading" class="text-center" style="display:none;">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
                <div>Detecting...</div>
              </div>

            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <h6>Results</h6>
              <div id="resultsSummary">No detection run yet.</div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Visualization</h5>
              <div id="chart" style="width:100%; height:500px;"></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <script src="app.js"></script>
  </body>
</html>
