import { DEFAULT_CONFIG } from './protractor-config.js';

export class ProtractorRender {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Base dimensions
    this.width = 400;
    this.height = 220;
    this.cx = 200; // Center X
    this.cy = 200; // Center Y (reference point)
    this.radius = this.config.radius || 150;
  }

  /**
  * Initialize DOM structure (adapted for ProtractorComponent)
   * @param {SVGElement} svgRoot 
   * @param {Object} config 
   */
  initBase(svgRoot, config) {
    this.svgRoot = svgRoot;
    if (config) {
      this.config = { ...this.config, ...config };
      if (config.radius) this.radius = config.radius;
    }

    // Dynamically update dimensions to match radius changes
    this.cx = this.radius;
    this.cy = this.radius;
    this.width = this.radius * 2;
    this.height = this.radius + 20;

    // Keep viewBox in sync
    if (this.svgRoot) {
      this.svgRoot.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
      this.svgRoot.style.maxWidth = `${this.width}px`;
    }

    let mainGroup = this.svgRoot.querySelector('[data-name="main-group"]');
    if (!mainGroup) {
      mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      mainGroup.setAttribute('data-name', 'main-group');
      this.svgRoot.appendChild(mainGroup);
    }
    this.mainGroup = mainGroup;

    // Build layer structure and render static parts
    // Clear existing content and explicitly create layers to ensure correct SVG structure
    this.mainGroup.innerHTML = '';
    ['body', 'ticks', 'item', 'sector', 'center', 'text'].forEach(layer => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-layer', layer);
      this.mainGroup.appendChild(g);
    });

    // Render static layer contents
    const ticksLayer = this.mainGroup.querySelector('g[data-layer="ticks"]');
    if (ticksLayer) ticksLayer.innerHTML = this._renderTicks();

    const centerLayer = this.mainGroup.querySelector('g[data-layer="center"]');
    if (centerLayer) centerLayer.innerHTML = this._renderCenterPoint();
  }

  /**
  * Update view state
   * @param {Object} state 
   */
  update(state) {
    // Fix: stronger reference checks. If mainGroup is missing/disconnected, try to re-acquire it.
    // Also check svgRoot connection status to ensure we can find a valid mainGroup.
    if (this.svgRoot) {
      if (!this.mainGroup || !this.mainGroup.isConnected) {
        this.mainGroup = this.svgRoot.querySelector('[data-name="main-group"]');
      }
    }

    if (!this.mainGroup) return;

    const { isHovering } = state.data;
  // Ensure measurementValue is numeric (avoid string math issues)
    const measurementValue = parseFloat(state.computed.measurementValue);

    const updateLayer = (name, html) => {
      let layer = this.mainGroup.querySelector(`g[data-layer="${name}"]`);
      // Fix: if a layer is missing unexpectedly, rebuild it to ensure rendering
      if (!layer) {
        layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        layer.setAttribute('data-layer', name);
        this.mainGroup.appendChild(layer);
      }
      layer.innerHTML = html;
    };

    updateLayer('body', this._renderBody(isHovering));
    updateLayer('item', this._renderMeasuredItem(state));
    updateLayer('sector', this._renderSector(measurementValue));
    updateLayer('text', this._renderMeasurementText(measurementValue));
  }

  /**
  * Core render method that returns the complete HTML string
  * @param {Object} state Current component state
  * @returns {string} HTML/SVG string
   */
  renderComplete(state) {
    const { isHovering } = state.data;
    const { measurementValue } = state.computed;

  // Compute CSS classes
    const containerClass = `protractor-container ${isHovering ? 'is-hovering' : ''}`;

    return `
      <div id="protractor-wrapper" class="${containerClass}" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
        <svg 
          id="protractor-svg"
          data-name="protractor-svg"
          viewBox="0 0 ${this.width} ${this.height}" 
          xmlns="http://www.w3.org/2000/svg"
          style="width: 100%; max-width: ${this.width}px; user-select: none; overflow: visible;">
          
          <defs>
            <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- 1. Protractor body background -->
          ${this._renderBody(isHovering)}

          <!-- 2. Tick marks and numbers -->
          ${this._renderTicks()}

          <!-- 3. Measured item (above body, below sector) -->
          ${this._renderMeasuredItem(state)}

          <!-- 4. Measurement sector (semi-transparent overlay) -->
          ${this._renderSector(measurementValue)}

          <!-- 5. Bottom reference point -->
          ${this._renderCenterPoint()}

          <!-- 6. Measurement readout -->
          ${this._renderMeasurementText(measurementValue)}
          
        </svg>
      </div>
    `;
  }

  /**
  * Render the protractor semicircle body
   */
  _renderBody(isHovering) {
    const { colors } = this.config;
    const fillColor = isHovering ? '#D1E5FF' : (colors.body || '#E6F2FF');
    const strokeColor = isHovering ? '#2196F3' : '#B0BEC5';

  // Semicircle path
    // M: Move to left corner
    // A: Arc to right corner
    // L: Line to center
    // Z: Close path
    const pathD = `
      M ${this.cx - this.radius},${this.cy} 
      A ${this.radius},${this.radius} 0 0,1 ${this.cx + this.radius},${this.cy} 
      L ${this.cx},${this.cy} 
      Z
    `;

    return `
      <g id="protractor-body-group" data-name="protractor-body-group">
        <path 
          id="protractor-body" 
          data-name="protractor-body"
          d="${pathD}" 
          fill="${fillColor}" 
          stroke="${strokeColor}" 
          stroke-width="1"
          filter="url(#drop-shadow)"
          style="transition: fill 0.3s ease;"
        />
  <!-- Inner cutout (adds realism) -->
        <path
          id="protractor-inner-cutout"
          data-name="protractor-inner-cutout"
          d="M ${this.cx - this.radius * 0.4},${this.cy} A ${this.radius * 0.4},${this.radius * 0.4} 0 0,1 ${this.cx + this.radius * 0.4},${this.cy} Z"
          fill="rgba(255,255,255,0.3)"
          stroke="none"
        />
      </g>
    `;
  }

  /**
  * Render tick marks and tick labels
   */
  _renderTicks() {
    const { tickIntervalMajor, tickIntervalMinor, colors } = this.config;
    const ticks = [];
    const color = colors.mark || '#333';

    for (let angle = 0; angle <= 180; angle++) {
      // Only render ticks for configured intervals
      const isMajor = angle % tickIntervalMajor === 0;
      const isMinor = angle % tickIntervalMinor === 0;

      if (!isMajor && !isMinor) continue;

  // Degrees to radians (SVG coord fix: 0° is on the right; rotate CCW; Y axis points down)
    // 0°: (cx + r, cy)
    // 90°: (cx, cy - r)
    // 180°: (cx - r, cy)
  // Formula: x = cx + r * cos(-rad), y = cy + r * sin(-rad)
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);

  // Compute tick endpoints
    const outerR = this.radius - 2; // Slightly inward
      const innerR = isMajor ? this.radius - 15 : this.radius - 8;

      const x1 = this.cx + outerR * cos;
      const y1 = this.cy + outerR * sin;
      const x2 = this.cx + innerR * cos;
      const y2 = this.cy + innerR * sin;

  // Add tick line
      ticks.push(`
        <line 
          id="protractor-tick-${angle}"
          data-name="${isMajor ? 'tick-major' : 'tick-minor'}"
          x1="${x1}" y1="${y1}" 
          x2="${x2}" y2="${y2}" 
          stroke="${color}" 
          stroke-width="${isMajor ? 1.5 : 0.5}" 
        />
      `);

  // Add major tick label
      if (isMajor) {
        const textR = this.radius - 28;
        const tx = this.cx + textR * cos;
        const ty = this.cy + textR * sin;

        ticks.push(`
          <text 
            id="protractor-tick-text-${angle}"
            data-name="tick-text"
            x="${tx}" y="${ty}" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            font-size="10" 
            fill="${color}" 
            font-family="Arial, sans-serif"
            style="pointer-events: none;">
            ${angle}
          </text>
        `);
      }
    }

    return `
      <g id="protractor-ticks" data-name="protractor-ticks">
        ${ticks.join('')}
      </g>
    `;
  }

  /**
  * Render the measurement sector
   */
  _renderSector(angle) {
    if (typeof angle !== 'number' || isNaN(angle) || angle <= 0) return '';

    const colors = this.config.colors || {};
    const highlightColor = colors.highlight || 'rgba(244, 67, 54, 0.3)';

  // Compute sector endpoint
    const rad = (angle * Math.PI) / 180;
    const endX = this.cx + this.radius * Math.cos(-rad);
    const endY = this.cy + this.radius * Math.sin(-rad);

  // Large-arc flag (if > 180 then 1; max is 180 so usually 0)
    const largeArcFlag = angle > 180 ? 1 : 0;

  // Path: move to center -> line to 0° point -> arc to angle point -> close to center
  // 0° is on the right (cx + r, cy)
    const d = `
      M ${this.cx},${this.cy} 
      L ${this.cx + this.radius},${this.cy} 
      A ${this.radius},${this.radius} 0 ${largeArcFlag},0 ${endX},${endY} 
      Z
    `;

    return `
      <g id="measurement-sector-group" data-name="measurement-sector-group">
        <path 
          id="measurement-sector" 
          data-name="measurement-sector"
          d="${d}" 
          fill="${highlightColor}" 
          stroke="none"
          style="pointer-events: none;"
        />
  <!-- Angle arc indicator -->
        <path
          id="measurement-arc-indicator"
          data-name="measurement-arc-indicator"
          d="M ${this.cx + 30},${this.cy} A 30,30 0 ${largeArcFlag},0 ${this.cx + 30 * Math.cos(-rad)},${this.cy + 30 * Math.sin(-rad)}"
          fill="none"
          stroke="#F44336"
          stroke-width="2"
        />
      </g>
    `;
  }

  /**
   * Render the measured item.
   * Prefer showing ItemDataProtocol.image; if not present, do not render it (shape is too complex to infer).
   */
  _renderMeasuredItem(state) {
    // Requirement: do not show item images (e.g., apple/bird/book); keep only the angle measurement sector.
    // Therefore, return an empty string.
    return '';
  }

  /**
   * Render center reference point
   */
  _renderCenterPoint() {
    return `
      <g id="center-point-group" data-name="center-point-group">
        <!-- Crosshair -->
        <line x1="${this.cx - 10}" y1="${this.cy}" x2="${this.cx + 10}" y2="${this.cy}" stroke="#333" stroke-width="1" />
        <line x1="${this.cx}" y1="${this.cy - 10}" x2="${this.cx}" y2="${this.cy + 10}" stroke="#333" stroke-width="1" />
        
        <!-- Ring -->
        <circle 
          id="center-point" 
          data-name="center-point"
          cx="${this.cx}" cy="${this.cy}" r="6" 
          fill="none" 
          stroke="#333" 
          stroke-width="2"
        />
      </g>
    `;
  }

  /**
  * Render measurement value text
   */
  _renderMeasurementText(angle) {
    if (angle === null || angle === undefined || angle === 0) return '';

    return `
      <g id="measurement-text-group" data-name="measurement-text-group">
        <text 
          id="measurement-text" 
          data-name="measurement-text"
          x="${this.cx}" 
          y="${this.cy - (this.radius * 0.25)}" 
          text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-weight="bold" 
          font-size="32" 
          fill="#333"
          style="text-shadow: 0px 2px 4px rgba(255,255,255,0.8);">
          ${angle}°
        </text>
      </g>
    `;
  }
}