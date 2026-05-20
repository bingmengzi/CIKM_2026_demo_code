import { DEFAULT_CONFIG } from './protractor-config.js';

export class ProtractorCore {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.listeners = [];
    
    // Initialize state
    this.state = {
      data: {
        currentItem: null,
        isHovering: false
      },
      computed: {
        measurementValue: 0,
        sectorPath: '',
        displayString: ''
      }
    };

    // Initial compute
    this.recompute();
  }

  /**
  * Add a state change listener
   * @param {Function} callback 
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
  * Remove a listener
   * @param {Function} callback 
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
  * Notify all listeners that state changed
   */
  notifyChange() {
    const snapshot = this.getState();
    this.listeners.forEach(callback => callback(snapshot));
  }

  /**
  * Get a snapshot of current state
   * @returns {Object} Deep copy of state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
  * Set state and recompute
  * @param {Object} newState Partial state update
   */
  setState(newState) {
    if (!newState) return;
    
    let hasChanges = false;
    
    // Update the data section
    if (newState.data) {
      this.state.data = { ...this.state.data, ...newState.data };
      hasChanges = true;
    }

    // If callers pass only top-level properties, we could treat them as part of `data` (compatibility).
    // For now we only handle explicit `data` updates.
    
    if (hasChanges) {
      this.recompute();
      this.notifyChange();
    }
  }

  /**
  * Update configuration
   * @param {Object} newConfig
   */
  updateConfig(newConfig) {
    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
      this.recompute();
      this.notifyChange();
    }
  }

  /**
  * Recompute computed properties
   */
  recompute() {
    const { currentItem } = this.state.data;
    const { radius } = this.config;

    let measurementValue = 0;
    let sectorPath = '';
    let displayString = '';

  // Lenient numeric parsing: accepts stringified numbers for robustness
    const angleVal = currentItem ? parseFloat(currentItem.angle) : NaN;

    if (currentItem && !isNaN(angleVal)) {
      measurementValue = angleVal;
      // Clamp angle to [0, 180]
      measurementValue = Math.max(0, Math.min(180, measurementValue));
      
      sectorPath = this._computeSectorPath(measurementValue, radius);
      displayString = `${measurementValue}°`;
    } else {
      // No measurement
      measurementValue = 0;
      sectorPath = '';
      displayString = '';
    }

    this.state.computed = {
      measurementValue,
      sectorPath,
      displayString
    };
  }

  /**
   * Compute the SVG sector path (d attribute)
   * Assumes the center is at (0,0) and draws from 0° (positive X axis) counterclockwise.
   * In SVG coordinates, Y points downward, so counterclockwise angles have negative Y values.
  * @param {Number} angle Angle in degrees
  * @param {Number} r Radius
   * @returns {String} SVG Path d string
   */
  _computeSectorPath(angle, r) {
    if (angle <= 0) return '';
    if (angle >= 180) {
      // 180° semicircle
      return `M 0 0 L ${r} 0 A ${r} ${r} 0 0 0 -${r} 0 Z`;
    }

    // Convert to radians
    const rad = (angle * Math.PI) / 180;
    
    // Compute end point
    // x = r * cos(theta)
    // y = r * sin(theta) * (-1)  <-- because SVG Y axis points downward
    const x = r * Math.cos(rad);
    const y = -r * Math.sin(rad);

    // Build path
  // M 0 0: move to center
  // L r 0: draw a line to the start point (+X axis)
  // A r r 0 [large-arc-flag] [sweep-flag] x y: draw an arc to the end point
  // Z: close path
    
    // large-arc-flag: 1 if angle > 180, else 0 (for a protractor max is 180, so it's always 0)
    const largeArcFlag = 0;
    
    // sweep-flag: 0 means counterclockwise (in screen coordinates: from +X towards -Y)
    const sweepFlag = 0;

    return `M 0 0 L ${r} 0 A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x} ${y} Z`;
  }

  /**
  * Set the item currently being measured
  * @param {Object} itemData Object that includes an `angle` property
   */
  setMeasuredItem(itemData) {
    if (!itemData) {
      this.clearMeasurement();
      return;
    }

    // Basic validation: must include angle info
    if (typeof itemData.angle === 'undefined') {
      console.error('[ERROR] ProtractorCore: Invalid item data, missing angle property');
      return;
    }

    this.setState({
      data: {
        currentItem: itemData,
        isHovering: false // After drop, it's no longer hovering
      }
    });
  }

  /**
  * Set hovering state
   * @param {Boolean} isHovering 
   */
  setHovering(isHovering) {
    if (this.state.data.isHovering !== isHovering) {
      this.setState({
        data: {
          ...this.state.data,
          isHovering
        }
      });
    }
  }

  /**
  * Clear the current measurement
   */
  clearMeasurement() {
    this.setState({
      data: {
        ...this.state.data,
        currentItem: null
      }
    });
  }

  /**
  * Reset all component state
   */
  reset() {
    this.setState({
      data: {
        currentItem: null,
        isHovering: false
      }
    });
  }
}