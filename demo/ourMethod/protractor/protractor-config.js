export const DEFAULT_CONFIG = {
  // ========== Public config (user-editable) ==========
  // Visual style config
  colors: {
    body: '#E6F2FF',             // Protractor body background (semi-transparent light blue)
    border: '#B3D4FC',           // Body border color
    mark: '#333333',             // Tick marks and numbers
    highlight: 'rgba(244, 67, 54, 0.4)', // Measurement sector fill (semi-transparent red)
    highlightStroke: '#F44336',  // Measurement sector stroke
    centerPoint: '#000000',      // Center reference point
    text: '#000000'              // Readout text color
  },

  // Size config
  radius: 150,                   // Protractor radius (default component size)
  width: '100%',                 // Container width
  height: 'auto',                // Container height
  
  // Feature flags
  showValue: true,               // Whether to show the measurement value at the center
  showUnit: true,                // Whether to show the unit symbol (°)
  
  // ========== Internal config (component logic; not part of the public API) ==========
  // SVG viewport settings
  padding: 20,                   // Padding from SVG canvas edge
  baseStrokeWidth: 2,            // Base stroke width
  
  // Tick settings
  tickIntervalMajor: 10,         // Major tick interval (degrees)
  tickIntervalMinor: 5,          // Minor tick interval (degrees) (Prompt requires 5)
  tickIntervalMicro: 1,          // Micro tick interval (degrees) (optional, for higher precision)
  
  // Tick lengths (relative to radius)
  majorTickLengthRatio: 0.10,    // Major tick length ratio
  minorTickLengthRatio: 0.06,    // Minor tick length ratio
  microTickLengthRatio: 0.03,    // Micro tick length ratio
  
  // Text label settings
  labelRadiusRatio: 0.78,        // Number label radius ratio
  fontSizeRatio: 0.08,           // Tick label font size ratio
  valueFontSizeRatio: 0.25,      // Center readout font size ratio
  
  // Center point settings
  centerPointRadius: 5,          // Center dot radius (px)
  crosshairSize: 12,             // Crosshair size (px)
  
  // Angle range (physical protractor properties)
  minAngle: 0,                   // Minimum angle
  maxAngle: 180,                 // Maximum angle
  startAngleOffset: 180,         // Start offset for SVG rendering (SVG 0° is typically at 3 o'clock; rotate to match protractor layout)
  
  // Animation settings
  animationDuration: 400,        // Transition duration when measurement appears (ms)
  animationEasing: 'ease-out',   // Easing function
  
  // Interaction settings
  validDropTypes: ['application/json'], // Allowed drop data types
  hoverOpacity: 0.9,             // Opacity while hovering during drag
};