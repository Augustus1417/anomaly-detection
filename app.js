// Anomaly Detection Lab - Client-side Logic
// Handles data input, communicates with backend, and renders interactive D3.js visualizations
// Supports CSV, JSON, and manual numeric input

const fileInput = document.getElementById('fileInput');
const pasteInput = document.getElementById('pasteInput');
const runBtn = document.getElementById('runBtn');
const loading = document.getElementById('loading');
const resultsSummary = document.getElementById('resultsSummary');
const chartDiv = document.getElementById('chart');
const thresholdRange = document.getElementById('thresholdRange');
const thresholdDisplay = document.getElementById('thresholdDisplay');
const loadSampleBtn = document.getElementById('loadSampleBtn');

let lastData = [];
let lastResponse = null;

// Update threshold display when slider changes
thresholdRange.addEventListener('input', e => {
  thresholdDisplay.textContent = parseFloat(e.target.value).toFixed(1);
});

// Load file and display in textarea
fileInput.addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  const text = await f.text();
  pasteInput.value = text;
});

// Load sample dataset
loadSampleBtn.addEventListener('click', async () => {
  try {
    const resp = await fetch('data/transaction_anomalies_dataset.csv');
    if (!resp.ok) {
      // Try alternative sample
      const resp2 = await fetch('data/sample.csv');
      if (!resp2.ok) throw new Error('No sample data available');
      const text = await resp2.text();
      pasteInput.value = text;
      return;
    }
    const text = await resp.text();
    pasteInput.value = text;
  } catch (e) {
    resultsSummary.innerHTML = '<div style="color: #e74c3c;">⚠️ Could not load sample dataset</div>';
  }
});

// Parse numeric values from input text (supports comma/newline separated values)
function parseValues(text) {
  return text.split(/[,\n\r]+/)
    .map(s => s.trim())
    .filter(s => s !== '')
    .map(Number)
    .filter(n => !isNaN(n));
}

// Send data to backend for Z-score anomaly detection
async function runDetection(values, threshold) {
  loading.style.display = 'block';
  try {
    const form = new FormData();
    form.append('data', JSON.stringify(values));
    form.append('threshold', threshold);

    const resp = await fetch('detect.php', { method: 'POST', body: form });
    if (!resp.ok) throw new Error('Server error ' + resp.status);
    const json = await resp.json();
    
    if (json.error) throw new Error(json.error);
    
    lastResponse = json;
    renderResults(json);
    renderChart(json.results);
  } catch (err) {
    resultsSummary.innerHTML = `<div style="color: #e74c3c;">❌ Error: ${err.message}</div>`;
    console.error(err);
  } finally {
    loading.style.display = 'none';
  }
}

// Run detection when button clicked
runBtn.addEventListener('click', () => {
  const text = pasteInput.value.trim();
  if (!text) {
    resultsSummary.innerHTML = '<div style="color: #e74c3c;">⚠️ Please enter or upload data first.</div>';
    return;
  }
  
  const values = parseValues(text);
  if (values.length === 0) {
    resultsSummary.innerHTML = '<div style="color: #e74c3c;">⚠️ No numeric values found in input.</div>';
    return;
  }
  
  lastData = values;
  runDetection(values, parseFloat(thresholdRange.value));
});

// Display detection results summary with statistics
function renderResults(json) {
  const total = json.results.length;
  const anomalies = json.results.filter(r => r.anomaly).length;
  const anomalyPercent = ((anomalies / total) * 100).toFixed(1);
  
  resultsSummary.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div><strong style="color: #667eea;">Total Points:</strong> ${total}</div>
      <div><strong style="color: #e74c3c;">Anomalies Found:</strong> ${anomalies} (${anomalyPercent}%)</div>
    </div>
    <div style="background: #f0f4ff; padding: 12px; border-radius: 6px; font-size: 0.85rem;">
      <div><strong>Mean:</strong> ${json.mean.toFixed(2)}</div>
      <div><strong>Std Dev:</strong> ${json.std.toFixed(2)}</div>
      <div><strong>Z-Threshold:</strong> ±${json.threshold.toFixed(1)}</div>
    </div>
  `;
}

// Render D3.js visualization with line chart and highlighted anomalies
function renderChart(points) {
  chartDiv.innerHTML = '';
  const margin = { top: 20, right: 30, bottom: 50, left: 70 };
  const width = chartDiv.clientWidth - margin.left - margin.right;
  const height = chartDiv.clientHeight - margin.top - margin.bottom;

  const svg = d3.select(chartDiv).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const data = points.map((d, i) => ({ index: i, value: d.value, z: d.z, anomaly: d.anomaly }));

  // Scales
  const x = d3.scaleLinear()
    .domain([0, Math.max(d3.max(data, d => d.index), 1)])
    .range([0, width]);
  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.value), d3.max(data, d => d.value)])
    .nice()
    .range([height, 0]);

  // Axes
  const xAxis = d3.axisBottom(x).ticks(Math.min(data.length, 10));
  const yAxis = d3.axisLeft(y).ticks(6);

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .append('text')
    .attr('x', width)
    .attr('y', 40)
    .attr('fill', '#2c3e50')
    .attr('text-anchor', 'end')
    .attr('font-weight', '600')
    .text('Data Point Index');

  svg.append('g')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -50)
    .attr('x', -height / 2)
    .attr('fill', '#2c3e50')
    .attr('text-anchor', 'middle')
    .attr('font-weight', '600')
    .text('Value');

  // Line path
  const line = d3.line()
    .x(d => x(d.index))
    .y(d => y(d.value));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#667eea')
    .attr('stroke-width', 2.5)
    .attr('opacity', 0.7)
    .attr('d', line);

  // Data points
  svg.selectAll('.pt')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'pt')
    .attr('cx', d => x(d.index))
    .attr('cy', d => y(d.value))
    .attr('r', d => d.anomaly ? 5.5 : 3.5)
    .attr('fill', d => d.anomaly ? '#e74c3c' : '#667eea')
    .attr('opacity', d => d.anomaly ? 0.9 : 0.7)
    .on('mouseover', function (event, d) {
      d3.select(this).attr('r', d => d.anomaly ? 7 : 5);
      
      const tooltip = d3.select('#chart').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('left', (event.pageX - chartDiv.getBoundingClientRect().left + 10) + 'px')
        .style('top', (event.pageY - chartDiv.getBoundingClientRect().top - 10) + 'px');
      
      tooltip.html(`
        <div style="font-size: 0.9rem;">
          <div><strong>Index:</strong> ${d.index}</div>
          <div><strong>Value:</strong> ${d.value.toFixed(2)}</div>
          <div><strong>Z-Score:</strong> ${d.z.toFixed(3)}</div>
          <div><strong style="color: ${d.anomaly ? '#e74c3c' : '#667eea'};">${d.anomaly ? '🚨 Anomaly' : '✓ Normal'}</strong></div>
        </div>
      `);
    })
    .on('mouseout', function (d) {
      d3.select(this).attr('r', d => d.anomaly ? 5.5 : 3.5);
      d3.select('#chart').selectAll('.tooltip').remove();
    });
}

// Re-run detection when threshold slider changes (live update)
thresholdRange.addEventListener('change', () => {
  if (!lastData || lastData.length === 0) return;
  runDetection(lastData, parseFloat(thresholdRange.value));
});
