# AI Anomaly Detector — Lab Project

This small web app demonstrates anomaly detection (Z-score method) with a D3.js visualization and a PHP backend.

Files:
- `index.php` — Frontend UI (Bootstrap + D3)
- `app.js` — JavaScript client logic
- `detect.php` — PHP endpoint implementing Z-score detection
- `style.css` — Small styling tweaks
- `data/sample.csv` — Example dataset with one outlier

How it works:
- The user pastes numeric values or uploads a CSV.
- The frontend sends the numeric array to `detect.php` with a threshold (Z-score).
- The backend computes mean, standard deviation, z-score for each point, and flags anomalies where |z| >= threshold.
- The frontend renders a line + points chart with anomalies highlighted in red. A slider updates the threshold live.

Run locally:
- Start a PHP-enabled server in the project folder (XAMPP, WAMP, or PHP built-in server):

```bash
cd /path/to/anomaly
php -S localhost:8000
```

Open `http://localhost:8000` in your browser.

Notes for demo:
- Use `data/sample.csv` to show a clear outlier.
- Slide the threshold to see how detections change.

Algorithm:
- Z-score: z = (x - mean) / std. Points with |z| >= threshold are marked anomalous.
