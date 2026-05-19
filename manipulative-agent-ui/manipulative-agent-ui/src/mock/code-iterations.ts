import type { CodeIteration } from '@/types'

export const codeIterations: CodeIteration[] = [
  {
    version: 1,
    label: 'v1 — Basic',
    description: 'Core fraction bars with sliders and comparison',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fraction Comparison</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 700px; width: 100%; }
    h1 { text-align: center; color: #1e293b; margin-bottom: 24px; font-size: 22px; }
    .fractions { display: flex; gap: 32px; justify-content: center; align-items: flex-start; }
    .fraction-panel { flex: 1; text-align: center; }
    .fraction-label { font-size: 28px; font-weight: bold; color: #334155; margin-bottom: 12px; }
    .bar-container { height: 48px; border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden; position: relative; margin-bottom: 16px; }
    .bar-fill-left { height: 100%; background: #3b82f6; transition: width 0.3s ease; }
    .bar-fill-right { height: 100%; background: #f97316; transition: width 0.3s ease; }
    .controls { display: flex; flex-direction: column; gap: 8px; }
    .control-row { display: flex; align-items: center; gap: 8px; justify-content: center; }
    .control-row label { font-size: 12px; color: #64748b; min-width: 80px; text-align: right; }
    .control-row input[type="range"] { width: 120px; }
    .control-row .value { font-size: 14px; font-weight: 600; color: #1e293b; min-width: 20px; }
    .compare-btn { display: block; margin: 24px auto 0; padding: 12px 32px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .compare-btn:hover { background: #4f46e5; }
    .result { text-align: center; margin-top: 20px; font-size: 32px; font-weight: bold; color: #6366f1; min-height: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Compare Fractions</h1>
    <div class="fractions">
      <div class="fraction-panel">
        <div class="fraction-label"><span id="num1">1</span>/<span id="den1">2</span></div>
        <div class="bar-container"><div class="bar-fill-left" id="bar1"></div></div>
        <div class="controls">
          <div class="control-row">
            <label>Numerator:</label>
            <input type="range" id="slider-num1" min="1" max="12" value="1">
            <span class="value" id="val-num1">1</span>
          </div>
          <div class="control-row">
            <label>Denominator:</label>
            <input type="range" id="slider-den1" min="1" max="12" value="2">
            <span class="value" id="val-den1">2</span>
          </div>
        </div>
      </div>
      <div class="fraction-panel">
        <div class="fraction-label"><span id="num2">1</span>/<span id="den2">4</span></div>
        <div class="bar-container"><div class="bar-fill-right" id="bar2"></div></div>
        <div class="controls">
          <div class="control-row">
            <label>Numerator:</label>
            <input type="range" id="slider-num2" min="1" max="12" value="1">
            <span class="value" id="val-num2">1</span>
          </div>
          <div class="control-row">
            <label>Denominator:</label>
            <input type="range" id="slider-den2" min="1" max="12" value="4">
            <span class="value" id="val-den2">4</span>
          </div>
        </div>
      </div>
    </div>
    <button class="compare-btn" onclick="compare()">Compare!</button>
    <div class="result" id="result"></div>
  </div>
  <script>
    function update(side) {
      const num = document.getElementById('slider-num' + side).value;
      const den = document.getElementById('slider-den' + side).value;
      document.getElementById('num' + side).textContent = num;
      document.getElementById('den' + side).textContent = den;
      document.getElementById('val-num' + side).textContent = num;
      document.getElementById('val-den' + side).textContent = den;
      const pct = (num / den) * 100;
      document.getElementById('bar' + side).style.width = Math.min(pct, 100) + '%';
    }
    ['slider-num1','slider-den1'].forEach(id => document.getElementById(id).addEventListener('input', () => update('1')));
    ['slider-num2','slider-den2'].forEach(id => document.getElementById(id).addEventListener('input', () => update('2')));
    update('1'); update('2');
    function compare() {
      const f1 = document.getElementById('slider-num1').value / document.getElementById('slider-den1').value;
      const f2 = document.getElementById('slider-num2').value / document.getElementById('slider-den2').value;
      const n1 = document.getElementById('num1').textContent;
      const d1 = document.getElementById('den1').textContent;
      const n2 = document.getElementById('num2').textContent;
      const d2 = document.getElementById('den2').textContent;
      let symbol = f1 > f2 ? '>' : f1 < f2 ? '<' : '=';
      document.getElementById('result').textContent = n1+'/'+d1 + ' ' + symbol + ' ' + n2+'/'+d2;
    }
  </script>
</body>
</html>`,
  },
  {
    version: 2,
    label: 'v2 — Accessible',
    description: 'Added aria-labels, equal state styling, misconception prompt',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fraction Comparison</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #f0f4f8; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 700px; width: 100%; }
    h1 { text-align: center; color: #1e293b; margin-bottom: 8px; font-size: 22px; }
    .subtitle { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .fractions { display: flex; gap: 32px; justify-content: center; align-items: flex-start; }
    .fraction-panel { flex: 1; text-align: center; }
    .fraction-label { font-size: 28px; font-weight: bold; color: #334155; margin-bottom: 12px; }
    .bar-container { height: 48px; border: 2px solid #e2e8f0; border-radius: 8px; overflow: hidden; position: relative; margin-bottom: 16px; display: flex; }
    .bar-segment { height: 100%; border-right: 1px solid rgba(255,255,255,0.3); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .bar-fill-left .bar-segment { background: #3b82f6; }
    .bar-fill-right .bar-segment { background: #f97316; }
    .bar-empty { background: #f1f5f9; flex: 1; }
    .controls { display: flex; flex-direction: column; gap: 8px; }
    .control-row { display: flex; align-items: center; gap: 8px; justify-content: center; }
    .control-row label { font-size: 12px; color: #64748b; min-width: 80px; text-align: right; }
    .control-row input[type="range"] { width: 120px; accent-color: #6366f1; }
    .control-row .value { font-size: 14px; font-weight: 600; color: #1e293b; min-width: 20px; }
    .compare-btn { display: block; margin: 24px auto 0; padding: 12px 32px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .compare-btn:hover { background: #4f46e5; transform: translateY(-1px); }
    .result { text-align: center; margin-top: 20px; font-size: 28px; font-weight: bold; min-height: 48px; padding: 8px; border-radius: 8px; transition: all 0.3s; }
    .result.greater { color: #3b82f6; background: #eff6ff; }
    .result.less { color: #f97316; background: #fff7ed; }
    .result.equal { color: #10b981; background: #ecfdf5; }
    .misconception-hint { text-align: center; margin-top: 12px; padding: 10px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #92400e; display: none; }
    .misconception-hint.visible { display: block; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <div class="container">
    <h1>Compare Fractions</h1>
    <p class="subtitle">Adjust the sliders to create two fractions, then compare them!</p>
    <div class="fractions">
      <div class="fraction-panel">
        <div class="fraction-label"><span id="num1">1</span>/<span id="den1">2</span></div>
        <div class="bar-container" role="img" aria-label="Fraction bar showing 1/2" id="bar-container1">
          <div class="bar-fill-left" id="bar1" style="display:flex; width:50%"></div>
          <div class="bar-empty"></div>
        </div>
        <div class="controls">
          <div class="control-row">
            <label for="slider-num1">Numerator:</label>
            <input type="range" id="slider-num1" min="1" max="12" value="1" aria-label="Left fraction numerator">
            <span class="value" id="val-num1">1</span>
          </div>
          <div class="control-row">
            <label for="slider-den1">Denominator:</label>
            <input type="range" id="slider-den1" min="1" max="12" value="2" aria-label="Left fraction denominator">
            <span class="value" id="val-den1">2</span>
          </div>
        </div>
      </div>
      <div class="fraction-panel">
        <div class="fraction-label"><span id="num2">1</span>/<span id="den2">4</span></div>
        <div class="bar-container" role="img" aria-label="Fraction bar showing 1/4" id="bar-container2">
          <div class="bar-fill-right" id="bar2" style="display:flex; width:25%"></div>
          <div class="bar-empty"></div>
        </div>
        <div class="controls">
          <div class="control-row">
            <label for="slider-num2">Numerator:</label>
            <input type="range" id="slider-num2" min="1" max="12" value="1" aria-label="Right fraction numerator">
            <span class="value" id="val-num2">1</span>
          </div>
          <div class="control-row">
            <label for="slider-den2">Denominator:</label>
            <input type="range" id="slider-den2" min="1" max="12" value="4" aria-label="Right fraction denominator">
            <span class="value" id="val-den2">4</span>
          </div>
        </div>
      </div>
    </div>
    <button class="compare-btn" onclick="compare()">Compare!</button>
    <div class="result" id="result" aria-live="polite"></div>
    <div class="misconception-hint" id="hint">
      Think about it: a larger denominator means each piece is SMALLER. So 1/4 of a pizza is less than 1/2!
    </div>
  </div>
  <script>
    function update(side) {
      const num = parseInt(document.getElementById('slider-num' + side).value);
      const den = parseInt(document.getElementById('slider-den' + side).value);
      document.getElementById('num' + side).textContent = num;
      document.getElementById('den' + side).textContent = den;
      document.getElementById('val-num' + side).textContent = num;
      document.getElementById('val-den' + side).textContent = den;
      const pct = Math.min((num / den) * 100, 100);
      document.getElementById('bar' + side).style.width = pct + '%';
      const container = document.getElementById('bar-container' + side);
      container.setAttribute('aria-label', 'Fraction bar showing ' + num + '/' + den);
    }
    ['slider-num1','slider-den1'].forEach(id => document.getElementById(id).addEventListener('input', () => { update('1'); clearResult(); }));
    ['slider-num2','slider-den2'].forEach(id => document.getElementById(id).addEventListener('input', () => { update('2'); clearResult(); }));
    update('1'); update('2');

    function clearResult() {
      const r = document.getElementById('result');
      r.textContent = '';
      r.className = 'result';
      document.getElementById('hint').classList.remove('visible');
    }

    function compare() {
      const n1 = parseInt(document.getElementById('slider-num1').value);
      const d1 = parseInt(document.getElementById('slider-den1').value);
      const n2 = parseInt(document.getElementById('slider-num2').value);
      const d2 = parseInt(document.getElementById('slider-den2').value);
      const f1 = n1 / d1;
      const f2 = n2 / d2;
      const r = document.getElementById('result');
      let symbol, cls;
      if (f1 > f2) { symbol = '>'; cls = 'greater'; }
      else if (f1 < f2) { symbol = '<'; cls = 'less'; }
      else { symbol = '='; cls = 'equal'; }
      r.textContent = n1 + '/' + d1 + ' ' + symbol + ' ' + n2 + '/' + d2;
      r.className = 'result ' + cls;
      // Show misconception hint for specific cases
      if ((n1 === 1 && n2 === 1 && d1 < d2 && f1 > f2) || (n1 === 1 && n2 === 1 && d1 > d2 && f1 < f2)) {
        document.getElementById('hint').classList.add('visible');
      } else {
        document.getElementById('hint').classList.remove('visible');
      }
    }
  </script>
</body>
</html>`,
  },
  {
    version: 3,
    label: 'v3 — Enhanced',
    description: 'Added partition segments, smooth animation, pie model toggle',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fraction Comparison</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { background: white; border-radius: 20px; padding: 36px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); max-width: 750px; width: 100%; }
    h1 { text-align: center; color: #1e293b; margin-bottom: 4px; font-size: 24px; }
    .subtitle { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 20px; }
    .mode-toggle { display: flex; justify-content: center; gap: 4px; margin-bottom: 20px; background: #f1f5f9; border-radius: 8px; padding: 4px; width: fit-content; margin-left: auto; margin-right: auto; }
    .mode-btn { padding: 6px 16px; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; background: transparent; color: #64748b; transition: all 0.2s; }
    .mode-btn.active { background: white; color: #6366f1; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .fractions { display: flex; gap: 32px; justify-content: center; align-items: flex-start; }
    .fraction-panel { flex: 1; text-align: center; }
    .fraction-label { font-size: 32px; font-weight: bold; color: #334155; margin-bottom: 12px; }
    .bar-container { height: 52px; border: 2px solid #e2e8f0; border-radius: 10px; overflow: hidden; position: relative; margin-bottom: 16px; display: flex; background: #f8fafc; }
    .bar-segment { height: 100%; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-right: 1px solid rgba(255,255,255,0.4); }
    .bar-segment.filled-left { background: linear-gradient(180deg, #60a5fa, #3b82f6); }
    .bar-segment.filled-right { background: linear-gradient(180deg, #fb923c, #f97316); }
    .bar-segment.empty { background: transparent; }
    .pie-container { width: 120px; height: 120px; margin: 0 auto 16px; position: relative; display: none; }
    .pie-container canvas { width: 100%; height: 100%; }
    .controls { display: flex; flex-direction: column; gap: 10px; }
    .control-row { display: flex; align-items: center; gap: 8px; justify-content: center; }
    .control-row label { font-size: 12px; color: #64748b; min-width: 80px; text-align: right; }
    .control-row input[type="range"] { width: 120px; accent-color: #6366f1; }
    .control-row .value { font-size: 14px; font-weight: 600; color: #1e293b; min-width: 20px; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }
    .compare-btn { display: block; margin: 28px auto 0; padding: 14px 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .compare-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
    .result { text-align: center; margin-top: 20px; font-size: 28px; font-weight: bold; min-height: 52px; padding: 10px; border-radius: 10px; transition: all 0.3s; }
    .result.greater { color: #3b82f6; background: #eff6ff; }
    .result.less { color: #f97316; background: #fff7ed; }
    .result.equal { color: #10b981; background: #ecfdf5; }
    .misconception-hint { text-align: center; margin-top: 12px; padding: 12px 16px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 10px; font-size: 13px; color: #92400e; display: none; border: 1px solid #fcd34d; }
    .misconception-hint.visible { display: block; animation: bounceIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.95) translateY(-4px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
    .success-ring { display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Fraction Comparison</h1>
    <p class="subtitle">Explore how fractions compare using visual models</p>
    <div class="mode-toggle">
      <button class="mode-btn active" onclick="setMode('bar')">Bar Model</button>
      <button class="mode-btn" onclick="setMode('pie')">Pie Model</button>
    </div>
    <div class="fractions">
      <div class="fraction-panel">
        <div class="fraction-label"><span id="num1">1</span>&frasl;<span id="den1">2</span></div>
        <div class="bar-container" role="img" aria-label="Fraction bar showing 1/2" id="bar-container1"></div>
        <div class="pie-container" id="pie-container1"><canvas id="pie1" width="240" height="240"></canvas></div>
        <div class="controls">
          <div class="control-row">
            <label for="slider-num1">Numerator:</label>
            <input type="range" id="slider-num1" min="1" max="12" value="1" aria-label="Left fraction numerator">
            <span class="value" id="val-num1">1</span>
          </div>
          <div class="control-row">
            <label for="slider-den1">Denominator:</label>
            <input type="range" id="slider-den1" min="1" max="12" value="2" aria-label="Left fraction denominator">
            <span class="value" id="val-den1">2</span>
          </div>
        </div>
      </div>
      <div class="fraction-panel">
        <div class="fraction-label"><span id="num2">1</span>&frasl;<span id="den2">4</span></div>
        <div class="bar-container" role="img" aria-label="Fraction bar showing 1/4" id="bar-container2"></div>
        <div class="pie-container" id="pie-container2"><canvas id="pie2" width="240" height="240"></canvas></div>
        <div class="controls">
          <div class="control-row">
            <label for="slider-num2">Numerator:</label>
            <input type="range" id="slider-num2" min="1" max="12" value="1" aria-label="Right fraction numerator">
            <span class="value" id="val-num2">1</span>
          </div>
          <div class="control-row">
            <label for="slider-den2">Denominator:</label>
            <input type="range" id="slider-den2" min="1" max="12" value="4" aria-label="Right fraction denominator">
            <span class="value" id="val-den2">4</span>
          </div>
        </div>
      </div>
    </div>
    <button class="compare-btn" onclick="compare()">Compare!</button>
    <div class="result" id="result" aria-live="polite"></div>
    <div class="misconception-hint" id="hint">
      Remember: A larger denominator means each piece is SMALLER. Think of cutting a pizza — more cuts means smaller slices!
    </div>
  </div>
  <script>
    let mode = 'bar';
    function setMode(m) {
      mode = m;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      document.querySelectorAll('.bar-container').forEach(el => el.style.display = m === 'bar' ? 'flex' : 'none');
      document.querySelectorAll('.pie-container').forEach(el => el.style.display = m === 'pie' ? 'block' : 'none');
      update('1'); update('2');
    }

    function drawPie(canvasId, num, den, color1, color2) {
      const canvas = document.getElementById(canvasId);
      const ctx = canvas.getContext('2d');
      const cx = 120, cy = 120, r = 100;
      ctx.clearRect(0, 0, 240, 240);
      // Draw segments
      for (let i = 0; i < den; i++) {
        const startAngle = (i / den) * Math.PI * 2 - Math.PI / 2;
        const endAngle = ((i + 1) / den) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = i < num ? color1 : '#f1f5f9';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Border
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    function renderBar(side, num, den) {
      const container = document.getElementById('bar-container' + side);
      container.innerHTML = '';
      const colorClass = side === '1' ? 'filled-left' : 'filled-right';
      for (let i = 0; i < den; i++) {
        const seg = document.createElement('div');
        seg.className = 'bar-segment ' + (i < num ? colorClass : 'empty');
        seg.style.width = (100 / den) + '%';
        container.appendChild(seg);
      }
    }

    function update(side) {
      const num = parseInt(document.getElementById('slider-num' + side).value);
      const den = parseInt(document.getElementById('slider-den' + side).value);
      document.getElementById('num' + side).textContent = num;
      document.getElementById('den' + side).textContent = den;
      document.getElementById('val-num' + side).textContent = num;
      document.getElementById('val-den' + side).textContent = den;
      if (mode === 'bar') {
        renderBar(side, num, den);
      } else {
        const colors = side === '1' ? ['#3b82f6', '#bfdbfe'] : ['#f97316', '#fed7aa'];
        drawPie('pie' + side, num, den, colors[0], colors[1]);
      }
      const container = document.getElementById('bar-container' + side);
      container.setAttribute('aria-label', 'Fraction showing ' + num + '/' + den);
    }

    ['slider-num1','slider-den1'].forEach(id => document.getElementById(id).addEventListener('input', () => { update('1'); clearResult(); }));
    ['slider-num2','slider-den2'].forEach(id => document.getElementById(id).addEventListener('input', () => { update('2'); clearResult(); }));
    update('1'); update('2');

    function clearResult() {
      const r = document.getElementById('result');
      r.textContent = '';
      r.className = 'result';
      document.getElementById('hint').classList.remove('visible');
    }

    function compare() {
      const n1 = parseInt(document.getElementById('slider-num1').value);
      const d1 = parseInt(document.getElementById('slider-den1').value);
      const n2 = parseInt(document.getElementById('slider-num2').value);
      const d2 = parseInt(document.getElementById('slider-den2').value);
      const f1 = n1 / d1, f2 = n2 / d2;
      const r = document.getElementById('result');
      let symbol, cls;
      if (Math.abs(f1 - f2) < 0.0001) { symbol = '='; cls = 'equal'; }
      else if (f1 > f2) { symbol = '>'; cls = 'greater'; }
      else { symbol = '<'; cls = 'less'; }
      r.textContent = n1 + '/' + d1 + ' ' + symbol + ' ' + n2 + '/' + d2;
      r.className = 'result ' + cls;
      // Misconception detection
      if (n1 === 1 && n2 === 1 && d1 !== d2) {
        document.getElementById('hint').classList.add('visible');
      } else {
        document.getElementById('hint').classList.remove('visible');
      }
    }
  </script>
</body>
</html>`,
  },
]
