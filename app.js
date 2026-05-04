// Front-end logic for anomaly lab
const fileInput = document.getElementById('fileInput');
const pasteInput = document.getElementById('pasteInput');
const runBtn = document.getElementById('runBtn');
const loading = document.getElementById('loading');
const resultsSummary = document.getElementById('resultsSummary');
const chartDiv = document.getElementById('chart');
const thresholdRange = document.getElementById('thresholdRange');
const thresholdNumber = document.getElementById('thresholdNumber');

let lastData = [];
let lastResponse = null;

thresholdRange.addEventListener('input', e => {
  thresholdNumber.value = e.target.value;
});
thresholdNumber.addEventListener('change', e => {
  thresholdRange.value = e.target.value;
});

fileInput.addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  const text = await f.text();
  pasteInput.value = text;
});

function parseValues(text) {
  // Split by comma/newline and parse floats, ignore empty
  return text.split(/[,\n\r]+/).map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
}

async function runDetection(values, threshold) {
  loading.style.display = 'block';
  try {
    const form = new FormData();
    form.append('data', JSON.stringify(values));
    form.append('threshold', threshold);

    const resp = await fetch('detect.php', { method: 'POST', body: form });
    if (!resp.ok) throw new Error('Server error ' + resp.status);
    const json = await resp.json();
    lastResponse = json;
    renderResults(json);
    renderChart(json.results);
  } catch (err) {
    resultsSummary.innerText = 'Error: ' + err.message;
    console.error(err);
  } finally {
    loading.style.display = 'none';
  }
}

runBtn.addEventListener('click', () => {
  const text = pasteInput.value;
  const values = parseValues(text);
  if (values.length === 0) {
    resultsSummary.innerText = 'No numeric values provided.';
    return;
  }
  lastData = values;
  runDetection(values, parseFloat(thresholdNumber.value));
});

function renderResults(json) {
  const total = json.results.length;
  const anomalies = json.results.filter(r => r.anomaly).length;
  resultsSummary.innerHTML = `<div>Total points: ${total}</div><div>Anomalies: <strong>${anomalies}</strong></div><div>Mean: ${json.mean.toFixed(3)} | Std: ${json.std.toFixed(3)} | Threshold: ${json.threshold}</div>`;
}

function renderChart(points) {
  // points: [{value, z, anomaly}...]
  chartDiv.innerHTML = '';
  const margin = {top:20, right:20, bottom:40, left:50};
  const width = chartDiv.clientWidth - margin.left - margin.right;
  const height = chartDiv.clientHeight - margin.top - margin.bottom;

  const svg = d3.select(chartDiv).append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
    .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const data = points.map((d,i) => ({index:i, value:d.value, z:d.z, anomaly:d.anomaly}));

  const x = d3.scaleLinear().domain([0, d3.max(data, d => d.index)]).range([0, width]);
  const y = d3.scaleLinear().domain([d3.min(data, d => d.value), d3.max(data, d => d.value)]).nice().range([height, 0]);

  const xAxis = d3.axisBottom(x).ticks(Math.min(data.length, 10));
  const yAxis = d3.axisLeft(y).ticks(6);

  svg.append('g').attr('transform', `translate(0,${height})`).call(xAxis).append('text').attr('x', width).attr('y', 35).attr('fill', '#000').attr('text-anchor','end').text('Index');
  svg.append('g').call(yAxis).append('text').attr('transform','rotate(-90)').attr('y',-40).attr('x',-10).attr('fill','#000').attr('text-anchor','end').text('Value');

  // line
  const line = d3.line().x(d => x(d.index)).y(d => y(d.value));
  svg.append('path').datum(data).attr('fill','none').attr('stroke','#2c7fb8').attr('stroke-width',1.5).attr('d', line);

  // points
  svg.selectAll('.pt').data(data).enter().append('circle').attr('class','pt')
    .attr('cx', d => x(d.index)).attr('cy', d => y(d.value)).attr('r', d => d.anomaly ? 6 : 3)
    .attr('fill', d => d.anomaly ? '#d73027' : '#1f77b4')
    .on('mouseover', function(event,d){
      const tooltip = d3.select('#chart').append('div').attr('class','tooltip').style('position','absolute').style('background','#fff').style('padding','6px').style('border','1px solid #ccc').style('border-radius','4px');
      tooltip.html(`Index: ${d.index}<br>Value: ${d.value}<br>Z: ${d.z.toFixed(3)}<br>Anomaly: ${d.anomaly}`);
      const [mx,my] = d3.pointer(event);
      tooltip.style('left', (mx + 20) + 'px').style('top', (my + 20) + 'px');
    })
    .on('mouseout', () => { d3.select('#chart').selectAll('.tooltip').remove(); });

}

// Re-run when threshold slider changes (if we have previous results)
thresholdRange.addEventListener('change', () => {
  thresholdNumber.value = thresholdRange.value;
  if (!lastData || lastData.length === 0) return;
  runDetection(lastData, parseFloat(thresholdNumber.value));
});

// Auto-load sample CSV if present
(async function tryLoadSample(){
  try {
    const resp = await fetch('data/sample.csv');
    if (!resp.ok) return;
    const txt = await resp.text();
    pasteInput.value = txt;
  } catch(e){}
})();
