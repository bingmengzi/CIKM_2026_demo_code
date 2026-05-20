import { DEFAULT_CONFIG } from './analog-clock-config.js';
import { AnalogClockCore } from './analog-clock-core.js';
import { AnalogClockRender } from './analog-clock-render.js';

export class AnalogClockComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // 初始化核心逻辑和渲染模块
    this.core = new AnalogClockCore(DEFAULT_CONFIG);
    this.renderModule = new AnalogClockRender();

    // 交互状态
    this._draggingHand = null;
    this._resizeObserver = null;
    this._timer = null;

    // 绑定方法
    this._handlePointerDown = this._handlePointerDown.bind(this);
    this._handlePointerMove = this._handlePointerMove.bind(this);
    this._handlePointerUp = this._handlePointerUp.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  // 监听公开配置属性
  static get observedAttributes() {
    return ['width', 'height', 'radius', 'color', 'show-controls'];
  }

  connectedCallback() {
    // 1. 解析配置并应用到Core
    const config = this.parseConfigFromAttrsAndCSS();
    this.core.setConfig(config);

    // 更新渲染模块配置
    this.renderModule = new AnalogClockRender(this.core.config);

    // 2. 初始化DOM结构
    this.render();

    // 3. 启用响应式布局
    this.enableResponsive();

    // 4. 绑定交互事件
    this.setupInteractions();

    // 5. 初始绘制
    this.updateView();
    // this._startTicking(); // 禁用自动走动

    console.log('[EXPECT] 等待移动_点击_拖拽型 | 拖动时针、分针或秒针调整时间 | 期待用户按住指针并旋转');
  }

  disconnectedCallback() {
    this._stopTicking();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    const svg = this.shadowRoot.querySelector('svg');
    if (svg) {
      svg.removeEventListener('pointerdown', this._handlePointerDown);
      window.removeEventListener('pointermove', this._handlePointerMove);
      window.removeEventListener('pointerup', this._handlePointerUp);
    }
  }

  _startTicking() {
    this._stopTicking();
    this._timer = setInterval(() => {
      if (!this._draggingHand) {
        const { hour, minute, second } = this.core.getState().data.time;
        let s = second + 1;
        let m = minute;
        let h = hour;
        if (s >= 60) { s = 0; m++; if (m >= 60) { m = 0; h = (h + 1) % 24; } }
        this.core.setTime({ h, m, s });
        this.updateView();
      }
    }, 1000);
  }

  _stopTicking() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      const config = this.parseConfigFromAttrsAndCSS();
      this.core.setConfig(config);
      // 某些属性可能需要重新渲染整个表盘（如颜色、半径）
      if (['color', 'radius'].includes(name)) {
        this.renderModule = new AnalogClockRender(this.core.config);
        this.render();
      }
      this.updateView();
    }
  }

  /**
   * 解析公开配置
   * 只解析允许通过CSS/Attribute修改的配置
   */
  parseConfigFromAttrsAndCSS() {
    const css = getComputedStyle(this);
    const v = (name) => css.getPropertyValue(name).trim();
    const attr = (name) => this.getAttribute(name);

    const userConfig = {};

    // 1. 尺寸配置：优先使用属性，其次CSS变量
    const w = attr('width') || v('--component-width');
    if (w) userConfig.width = w;

    const h = attr('height') || v('--component-height');
    if (h) userConfig.height = h;

    // 2. 半径配置：仅当属性存在时才覆盖
    const r = attr('radius');
    if (r !== null) {
      userConfig.radius = parseFloat(r);
    } else if (!this.core || !this.core.config.radius) {
      // 仅在初始化且无内部状态时使用默认值，避免覆盖setConfig设置的值
      userConfig.radius = 140;
    }

    // 3. 颜色配置
    userConfig.colors = {};
    const face = attr('face-color');
    if (face) userConfig.colors.face = face;

    const nums = attr('color');
    if (nums) userConfig.colors.numbers = nums;

    const sec = attr('accent-color');
    if (sec) userConfig.colors.secondHand = sec;

    return userConfig;
  }

  /**
   * 渲染组件结构
   */
  render() {
    // 获取样式
    const styles = this.getStyles();

    // 初始化渲染模块生成的SVG结构
    // 注意：这里假设Render模块有一个init方法返回SVG元素，或者构建innerHTML
    // 根据Render模块职责，它负责创建具体的SVG元素
    const svgContent = this.renderModule.createTemplate();

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div id="analog-clock-container" class="clock-container" data-name="clock-container">
        ${svgContent}
      </div>
    `;

    // 确保渲染模块获取到由于innerHTML重建后的DOM引用
    const svgElement = this.shadowRoot.querySelector('svg');
    this.renderModule.attachElements(svgElement);

    // 重新绑定交互事件（因为DOM已重建）
    this.setupInteractions();
  }

  /**
   * 设置交互事件
   */
  setupInteractions() {
    const svg = this.shadowRoot.querySelector('svg');
    if (!svg) return;

    // 使用Pointer Events处理跨平台交互
    svg.addEventListener('pointerdown', this._handlePointerDown);
    // Move和Up绑定到Window以处理拖拽出界的情况
    window.addEventListener('pointermove', this._handlePointerMove);
    window.addEventListener('pointerup', this._handlePointerUp);

    // 防止触摸滚动
    svg.addEventListener('touchmove', (e) => {
      if (this._draggingHand) e.preventDefault();
    }, { passive: false });
  }

  _handlePointerDown(e) {
    // 识别点击的目标
    // 修复：点击可能落在path或line子元素上，需向上查找所在的group
    const target = e.target.closest('g') || e.target;
    // 假设Render模块生成的指针ID遵循：hand-hour, hand-minute, hand-second
    const id = target.getAttribute('id');

    let handType = null;
    if (id && id.includes('hand-')) {
      if (id.includes('hour')) handType = 'hour';
      else if (id.includes('minute')) handType = 'minute';
      else if (id.includes('second')) handType = 'second';
    }

    if (handType) {
      e.preventDefault();
      this._draggingHand = handType;
      // 设置捕获，确保移动事件流畅
      if (target.setPointerCapture) {
        target.setPointerCapture(e.pointerId);
      }
      console.log(`[EXPECT] 等待移动_点击_拖拽型 | 正在拖拽${handType}指针 | 期待用户旋转指针`);
    }
  }

  _handlePointerMove(e) {
    if (!this._draggingHand) return;

    e.preventDefault();

    // 1. 计算鼠标相对于圆心的角度
    const svg = this.shadowRoot.querySelector('svg');
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    // atan2 返回 -PI 到 PI，对应 -180 到 180 度
    // 0度是3点钟方向 (X轴正向)
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);

    // 转换为时钟坐标系：0度在12点钟方向
    // Math: 0 deg = 3 o'clock. Clock: 0 deg = 12 o'clock.
    // transform: angle + 90
    let clockAngle = angleDeg + 90;

    // 规范化到 0-360
    if (clockAngle < 0) {
      clockAngle += 360;
    }

    // 2. 调用核心逻辑处理数据流
    // Pointer Event → Angle → Time {h,m,s} → Computed Angles
    this.core.setFromHandInteraction(this._draggingHand, clockAngle);

    // 3. 触发更新
    this.updateView();
  }

  _handlePointerUp(e) {
    if (this._draggingHand) {
      const target = e.target;
      if (target.releasePointerCapture && e.pointerId) {
        try {
          target.releasePointerCapture(e.pointerId);
        } catch (err) {
          // 忽略捕获释放错误
        }
      }

      console.log(`[RESULT] 交互完成 | 指针拖拽结束 | 当前时间: ${this.getValue()}`);
      this._draggingHand = null;
    }
  }

  /**
   * 更新视图与状态分发
   */
  updateView() {
    const state = this.core.getState();

    // 获取需要跳过 transition 的指针（进位时避免抖动）
    const skipTransition = this.core.getSkipTransition();

    // 1. 调用Render模块更新指针SVG transform
    this.renderModule.updateHands(state, skipTransition);

    // 2. 分发Change事件
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: {
        value: state.computed.formattedTime,
        state: state.data.time
      }
    }));
  }

  enableResponsive() {
    this._resizeObserver = new ResizeObserver(() => {
      this.updateDimensions();
    });
    this._resizeObserver.observe(this);
  }

  updateDimensions() {
    const rect = this.getBoundingClientRect();
    // 可以在这里调整SVG的viewBox或大小，如果不是100%自适应的话
    // 对于本组件，SVG通常设为width/height 100%，由容器控制大小
  }

  getStyles() {
    const size = this.renderModule ? this.renderModule.totalSize : 300;
    return `
      :host {
        display: block;
        width: ${size}px;
        height: ${size}px;
        position: relative;
        user-select: none;
        --clock-hand-cursor: grab;
      }
      .clock-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      /* 指针交互样式 */
      #hand-hour, #hand-minute, #hand-second {
        cursor: var(--clock-hand-cursor);
        transition: transform 0.1s ease-out;
        /* 移除 CSS transform 以避免坐标系原点问题，改用 SVG 属性控制 */
      }
      :host([dragging]) #hand-hour, 
      :host([dragging]) #hand-minute, 
      :host([dragging]) #hand-second {
        cursor: grabbing;
      }
    `;
  }

  // =================================================================
  // 公共 API
  // =================================================================

  /**
   * 设置时间
   * @param {String|Object} value - "10:30:00" 或 {h, m, s}
   */
  setValue(value) {
    try {
      this.core.setTime(value);
      this.updateView();
      console.log(`[RESULT] 设置时间 | 成功 | 新时间: ${this.getValue()}`);
    } catch (e) {
      console.log(`[ERROR] 设置时间失败 | 无效的格式 | ${e.message}`);
    }
  }

  /**
   * 获取当前时间字符串
   * @returns {String} "HH:mm:ss"
   */
  getValue() {
    return this.core.getState().computed.formattedTime;
  }

  /**
   * 获取完整状态对象
   */
  getState() {
    return this.core.getState();
  }

  /**
   * 重置时钟
   */
  reset() {
    this.core.reset();
    this.updateView();
    console.log('[EXPECT] 重置完成 | 时间已恢复初始状态');
  }

  /**
   * 设置公开配置
   */
  setConfig(config) {
    // 只允许修改公开配置
    const allowedKeys = ['radius', 'colors'];
    const filteredConfig = {};
    for (const key of allowedKeys) {
      if (key in config) {
        filteredConfig[key] = config[key];
      }
    }
    this.core.setConfig(filteredConfig);
    // 强制重新渲染DOM结构（因为半径或颜色可能改变）
    this.renderModule = new AnalogClockRender(this.core.config);
    this.render();
    this.updateView();
  }

  // =================================================================
  // AI 测试与查询接口
  // =================================================================

  /**
   * 获取组件当前完整状态（供AI查询）
   */
  getComponentInfo() {
    return {
      componentId: this.getAttribute('id') || 'analog-clock-unknown',
      componentName: 'analog-clock',
      currentState: this.core.getState(),
      interactiveElements: this.getInteractiveElements(),
      availableOperations: this.getAvailableOperations(),
      status: 'ready'
    };
  }

  /**
   * 获取所有可交互元素信息
   */
  getInteractiveElements() {
    const elements = [];
    // 查询Shadow DOM中的关键交互元素
    // 注意：ID必须由Render模块生成且保持一致
    const selectors = ['#hand-hour', '#hand-minute', '#hand-second', '#clock-face'];

    selectors.forEach(sel => {
      const el = this.shadowRoot.querySelector(sel);
      if (el) {
        elements.push({
          id: el.id,
          name: el.getAttribute('data-name') || el.id,
          disabled: false,
          visible: true
        });
      }
    });
    return elements;
  }

  /**
   * 获取可用操作
   */
  getAvailableOperations() {
    return [
      { name: 'setTime', description: '设置绝对时间', params: ['value'] },
      { name: 'reset', description: '重置为默认时间' },
      { name: 'dragHand', description: '拖拽时针/分针/秒针调整时间' }
    ];
  }

  printInfo() {
    console.log(JSON.stringify(this.getComponentInfo(), null, 2));
  }
}

// 注册自定义元素
customElements.define('analog-clock-component', AnalogClockComponent);