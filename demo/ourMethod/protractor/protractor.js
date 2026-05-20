import { DEFAULT_CONFIG } from './protractor-config.js';
import { ProtractorCore } from './protractor-core.js';
import { ProtractorRender } from './protractor-render.js?v=no-icon';

export class ProtractorComponent extends HTMLElement {
  static get observedAttributes() {
    return ['radius', 'width', 'height'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    // Initialize core logic
    this.core = new ProtractorCore(DEFAULT_CONFIG);

    // Listen to state changes and drive view updates
    this.core.addListener((state) => {
      this.updateView();
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: state.computed.measurementValue,
          currentItem: state.data.currentItem,
          state: state
        },
        bubbles: true,
        composed: true
      }));
    });

    // Initialize renderer
    this.renderer = new ProtractorRender();

    // Bind context
    this._handleDrop = this._handleDrop.bind(this);
    this._handleDragOver = this._handleDragOver.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._handleClearClick = this._handleClearClick.bind(this);
  }

  connectedCallback() {
    this.render();
    this.setupInteractions();
    this.enableResponsive();

    // Initialize base renderer parts
    const svgRoot = this.shadow.querySelector('#protractor-svg-0');
    if (svgRoot) {
      this.renderer.initBase(svgRoot, this.core.config);
      this.updateView();
    }

    console.log('[EXPECT] Waiting for drag-and-drop | Drag an angle item onto the protractor | Expect the user to drop an external item into protractor-dropzone-0');
  }

  disconnectedCallback() {
    const container = this.shadow.querySelector('#protractor-dropzone-0');
    if (container) {
      container.removeEventListener('dragover', this._handleDragOver);
      container.removeEventListener('dragleave', this._handleDragLeave);
      container.removeEventListener('drop', this._handleDrop);
    }

    const clearBtn = this.shadow.querySelector('#protractor-clear-btn-0');
    if (clearBtn) {
      clearBtn.removeEventListener('click', this._handleClearClick);
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      const configUpdate = {};
      if (name === 'radius') configUpdate.radius = parseFloat(newValue);

      // Update config and re-render
      if (Object.keys(configUpdate).length > 0) {
        this.setConfig(configUpdate);
      }
    }
  }

  /**
   * Parse public configuration
   */
  parseConfigFromAttrsAndCSS() {
    const css = getComputedStyle(this);
    const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
    const attrOr = (attr, fallback) => {
      const val = this.getAttribute(attr);
      return val !== null ? val : fallback;
    };

    const userConfig = {
      // Size configuration
      width: attrOr('width', v('--component-width', undefined)),
      height: attrOr('height', v('--component-height', undefined)),
      radius: attrOr('radius', undefined)
    };

    return Object.fromEntries(
      Object.entries(userConfig).filter(([, val]) => val !== undefined && val !== '')
    );
  }

  /**
  * Render the component DOM structure
   */
  render() {
    const styles = this.getStyles();
    const config = this.parseConfigFromAttrsAndCSS();

    // If attributes/CSS provide config, update the core config
    if (config.radius) {
      this.core.updateConfig({ radius: parseFloat(config.radius) });
    }

    this.shadow.innerHTML = `
      <style>${styles}</style>
      <div id="protractor-wrapper-0" class="protractor-wrapper" data-name="wrapper">
        <div id="protractor-toolbar-0" class="toolbar" data-name="toolbar">
           <button id="protractor-clear-btn-0" class="icon-btn" data-name="clear-button" title="Clear measurement">
             ✕ Clear
           </button>
        </div>
        
        <div id="protractor-dropzone-0" class="protractor-container protractor-dropzone" data-name="dropzone">
          <svg id="protractor-svg-0" class="protractor-svg" data-name="svg-root" 
               viewBox="0 0 400 220" preserveAspectRatio="xMidYMax meet">
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
            <!-- The renderer will inject SVG elements here -->
            <g id="protractor-group-0" data-name="main-group"></g>
          </svg>
          
          <div id="protractor-feedback-0" class="drop-feedback" data-name="feedback-overlay">
            <span>Release to measure</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
  * Get CSS styles
   */
  getStyles() {
    return `
      :host {
        display: block;
        width: 100%;
        max-width: 600px;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        --primary-color: #2196F3;
        --bg-color: #f5f5f5;
      }
      
      .protractor-wrapper {
        position: relative;
        width: 100%;
        background: var(--bg-color);
        border-radius: 8px;
        padding: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        user-select: none;
      }

      .toolbar {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
        position: relative;
        z-index: 10;
      }

      .icon-btn {
        background: none;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 12px;
        color: #666;
        transition: all 0.2s;
      }

      .icon-btn:hover {
        background: #e0e0e0;
        color: #333;
      }

      .protractor-container {
        position: relative;
        width: 100%;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        border: 2px dashed transparent;
        border-radius: 8px;
        transition: border-color 0.3s;
      }
      
      .protractor-container.drag-over {
        border-color: var(--primary-color);
        background-color: rgba(33, 150, 243, 0.05);
      }

      .protractor-svg {
        width: 100%;
        max-width: 400px; /* Default max width; can be overridden by CSS variables */
        height: auto;
        overflow: visible;
        pointer-events: none; /* Let pointer events pass through to the container, or handle them inside the SVG */
      }

      /* Restore interactivity for elements inside the SVG */
      .protractor-svg g, .protractor-svg path {
        pointer-events: auto;
      }

      .drop-feedback {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(255, 255, 255, 0.8);
        color: var(--primary-color);
        font-weight: bold;
        font-size: 1.2rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        border-radius: 8px;
      }

      .protractor-container.drag-over .drop-feedback {
        opacity: 1;
      }
    `;
  }

  /**
  * Set up interaction events
   */
  setupInteractions() {
    const container = this.shadow.querySelector('#protractor-dropzone-0');
    const clearBtn = this.shadow.querySelector('#protractor-clear-btn-0');

    if (container) {
      container.addEventListener('dragover', this._handleDragOver);
      container.addEventListener('dragleave', this._handleDragLeave);
      container.addEventListener('drop', this._handleDrop);
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', this._handleClearClick);
    }
  }

  /**
  * Responsive layout support
   */
  enableResponsive() {
    this._resizeObserver = new ResizeObserver(() => {
      this._handleResize();
    });
    this._resizeObserver.observe(this);
  }

  _handleResize() {
    // If you need to adjust the SVG viewBox or radius based on container size, do it here.
    // Currently scaling relies on preserveAspectRatio.
  }

  /**
   * Handle DragOver event
   */
  _handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }

    const container = this.shadow.querySelector('#protractor-dropzone-0');
    if (container && !container.classList.contains('drag-over')) {
      container.classList.add('drag-over');
      this.core.setHovering(true);
    }
  }

  /**
  * Handle DragLeave event
   */
  _handleDragLeave(e) {
    // Make sure we actually left the container itself (not just entered a child).
    // With the overlay, a simple check is usually enough.
    const container = this.shadow.querySelector('#protractor-dropzone-0');
    if (container) {
      container.classList.remove('drag-over');
      this.core.setHovering(false);
    }
  }

  /**
  * Handle Drop event (core interaction)
   */
  _handleDrop(e) {
    e.preventDefault();
    const container = this.shadow.querySelector('#protractor-dropzone-0');
    if (container) {
      container.classList.remove('drag-over');
    }
    this.core.setHovering(false);

    try {
      const json = e.dataTransfer.getData('application/json');
      if (!json) return;

      const itemData = JSON.parse(json);

      // Must pass the full object to the Core
      this.core.setMeasuredItem(itemData);

      // View updates and event emitting are handled via addListener

      // Log using core state to ensure it stays in sync with the UI
      const currentItem = this.core.getState().data.currentItem;
      if (currentItem) {
        console.log(`[RESULT] Drag-and-drop | Success | Measured item: ${currentItem.name || 'Unknown'}, Angle: ${currentItem.angle}°`);
      }

    } catch (err) {
      console.log(`[ERROR] Drop failed | Data parse error: ${err.message} | Please make sure you dragged a valid data source`);
    }
  }

  /**
   * Handle Clear button click
   */
  _handleClearClick(e) {
    this.clearMeasurement();
    console.log('[EXPECT] Waiting for drag-and-drop | Measurement cleared | Expect user to drag an item again');
  }

  /**
   * Update view
   */
  updateView() {
    const state = this.core.getState();
    this.renderer.update(state);

    // Keep the button always clickable. Avoid state-sync delays causing it to become unavailable.
    // if (clearBtn) {
    //   clearBtn.disabled = !state.currentItem;
    // }
  }

  // ==========================================
  // Public API
  // ==========================================

  /**
   * Programmatically measure an element
   * @param {HTMLElement} element - DOM element containing dataset data
   */
  measureElement(element) {
    if (!element) return;

    // Try to build ItemDataProtocol
    // Prefer dataset JSON, otherwise combine dataset attributes
    let itemData = null;

    if (element.dataset.itemData) {
      try {
        itemData = JSON.parse(element.dataset.itemData);
      } catch (e) {
        console.log('[ERROR] Data parsing | Failed | dataset.itemData is not valid JSON');
      }
    } else {
      // Fallback: read distributed attributes
      itemData = {
        id: element.id || 'unknown-' + Date.now(),
        name: element.getAttribute('title') || 'Unknown Item',
        angle: parseFloat(element.dataset.angle || 0),
        image: element.getAttribute('src'),
        color: element.style.color || '#000'
      };
    }

    if (itemData && typeof itemData.angle === 'number') {
      this.core.setMeasuredItem(itemData);
      this.updateView();
      console.log(`[RESULT] Programmatic call | Success | Measured element: ${itemData.name}`);
    } else {
      console.log('[ERROR] Programmatic call | Failed | Element is missing angle data');
    }
  }

  /**
   * Clear the measurement
   */
  clearMeasurement() {
    this.core.clearMeasurement();
    this.updateView();
  }

  /**
  * Reset the component
   */
  reset() {
    this.core.reset();
    this.updateView();
  }

  /**
  * Get current state
   */
  getState() {
    return this.core.getState();
  }

  /**
   * Set state (for replay or tests)
   */
  setState(state) {
    // Simple implementation; deep merge in Core is usually needed for complex cases
    if (state.currentItem) {
      this.core.setMeasuredItem(state.currentItem);
    } else {
      this.core.clearMeasurement();
    }
    this.updateView();
  }

  /**
   * Set config (only public config keys are allowed)
   */
  setConfig(config) {
    const allowedKeys = ['radius', 'width', 'height', 'colors'];
    const filteredConfig = {};
    for (const key of allowedKeys) {
      if (key in config) {
        filteredConfig[key] = config[key];
      }
    }
    this.core.updateConfig(filteredConfig);

    // Re-initialize base rendering (radius may have changed)
    const svgRoot = this.shadow.querySelector('#protractor-svg-0');
    if (svgRoot) {
      this.renderer.initBase(svgRoot, this.core.config);
      this.updateView();
    }
  }

  // ==========================================
  // AI Query API
  // ==========================================

  getComponentInfo() {
    return {
      componentId: this.getAttribute('id') || 'protractor-component',
      componentName: 'protractor',
      currentState: this.core.getState(),
      interactiveElements: this.getInteractiveElements(),
      availableOperations: this.getAvailableOperations(),
      status: 'ready'
    };
  }

  getInteractiveElements() {
    const elements = [];
    this.shadow.querySelectorAll('[id][data-name]').forEach(el => {
      // Simple visibility check
      const isVisible = el.style.display !== 'none' && el.style.visibility !== 'hidden';

      elements.push({
        id: el.id,
        name: el.getAttribute('data-name'),
        disabled: el.disabled || false,
        visible: isVisible
      });
    });
    return elements;
  }

  getAvailableOperations() {
    return [
      { name: 'drag-drop', description: 'Drag an item with angle data onto the protractor' },
      { name: 'clear', description: 'Click clear button to reset measurement' },
      { name: 'measureElement', description: 'Programmatic measurement via API' }
    ];
  }

  printInfo() {
    console.log(JSON.stringify(this.getComponentInfo(), null, 2));
  }
}

// Register Web Component
customElements.define('protractor-component', ProtractorComponent);