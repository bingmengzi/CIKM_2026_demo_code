import { DEFAULT_CONFIG } from './analog-clock-config.js';

export class AnalogClockRender {
  /**
   * 构造函数
   * @param {Object} config - 组件配置对象
   */
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // 基础尺寸计算
    // 确保 radius 是数字，防止字符串拼接导致 viewBox 计算错误
    this.radius = parseFloat(this.config.radius) || 150;
    this.diameter = this.radius * 2;
    // 留出边缘内边距，防止描边被裁剪
    this.padding = 20;
    this.totalSize = this.diameter + this.padding * 2;

    // 缓存静态部分HTML，避免每次渲染都重新计算
    this._staticFaceCache = null;
  }

  createTemplate() {
    return this.renderComplete({ computed: { hourAngle: 0, minuteAngle: 0, secondAngle: 0 } });
  }

  attachElements(svgElement) {
    if (!svgElement) return;
    this.hands = {
      hour: svgElement.querySelector('#hand-hour'),
      minute: svgElement.querySelector('#hand-minute'),
      second: svgElement.querySelector('#hand-second')
    };
  }

  updateHands(state, skipTransition = null) {
    if (!this.hands || !state || !state.computed) return;
    const { hourAngle, minuteAngle, secondAngle } = state.computed;

    // 确保角度是有效数字
    const hAngle = isNaN(hourAngle) ? 0 : hourAngle;
    const mAngle = isNaN(minuteAngle) ? 0 : minuteAngle;
    const sAngle = isNaN(secondAngle) ? 0 : secondAngle;

    // 检测是否越过12点边界（跨越 0°/360°）
    const isCrossingBoundary = (lastAngle, newAngle) => {
      if (lastAngle === undefined) return false;
      // 顺时针或逆时针跨越边界
      return (lastAngle > 270 && newAngle < 90) || (lastAngle < 90 && newAngle > 270);
    };

    // 更新指针，检测边界跨越时禁用 transition
    const updateHand = (hand, angle, key) => {
      if (!hand) return;

      const lastAngle = this._lastRenderAngles?.[key];
      const crossing = isCrossingBoundary(lastAngle, angle);
      // 检查是否需要跳过 transition（边界跨越 或 被联动进位）
      const shouldSkip = crossing || (skipTransition && skipTransition[key]);

      if (shouldSkip) {
        // 禁用 transition，防止抖动
        hand.style.transition = 'none';
      }

      hand.setAttribute('transform', `rotate(${angle})`);

      if (shouldSkip) {
        // 强制重绘确保变换应用
        hand.getBoundingClientRect();
        // 使用 requestAnimationFrame 延迟恢复 transition，确保变换完全应用后再恢复动画
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            hand.style.transition = '';
          });
        });
      }
    };

    // 初始化/更新上次渲染角度记录
    if (!this._lastRenderAngles) {
      this._lastRenderAngles = {};
    }

    updateHand(this.hands.hour, hAngle, 'hour');
    updateHand(this.hands.minute, mAngle, 'minute');
    updateHand(this.hands.second, sAngle, 'second');

    // 保存当前角度供下次比较
    this._lastRenderAngles.hour = hAngle;
    this._lastRenderAngles.minute = mAngle;
    this._lastRenderAngles.second = sAngle;
  }

  /**
   * 渲染完整组件
   * @param {Object} state - 当前状态 { data: {time}, computed: {angles...} }
   * @returns {String} HTML/SVG 字符串
   */
  renderComplete(state) {
    const { hourAngle, minuteAngle, secondAngle } = state.computed || { hourAngle: 0, minuteAngle: 0, secondAngle: 0 };

    // SVG viewBox 设置为以 (0,0) 为中心，方便旋转计算
    // 范围从 -radius - padding 到 +radius + padding
    const viewBoxStart = -(this.radius + this.padding);
    const viewBoxSize = this.totalSize;

    return `
      <div id="analog-clock-wrapper" class="analog-clock-wrapper" style="width: 100%; height: 100%;" data-name="clock-wrapper">
        <svg 
          id="analog-clock-svg"
          data-name="clock-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="${viewBoxStart} ${viewBoxStart} ${viewBoxSize} ${viewBoxSize}"
          style="width: 100%; height: 100%; display: block;"
        >
          <style>
            .clock-text { font-family: Arial, sans-serif; font-weight: bold; user-select: none; }
            .clock-hand { cursor: grab; } /* 移除 CSS transform 相关设置，改用 SVG 属性控制以确保坐标正确 */
            .clock-hand:active { cursor: grabbing; }
            /* 秒针通常不需要拖拽，或者拖拽交互不同，这里保持统一 */
            .clock-hand-second { cursor: pointer; } 
          </style>

          <!-- 1. 静态表盘 (背景、刻度、数字) -->
          ${this._renderStaticFace()}

          <!-- 2. 动态指针 -->
          <g id="clock-hands-group" data-name="hands-group">
            ${this._renderHourHand(hourAngle)}
            ${this._renderMinuteHand(minuteAngle)}
            ${this._renderSecondHand(secondAngle)}
          </g>

          <!-- 3. 中心装饰盖帽 -->
          ${this._renderCenterCap()}
        </svg>
      </div>
    `;
  }

  /**
   * 渲染静态表盘部分 (背景、刻度、数字)
   * 第一次运行时生成并缓存
   */
  _renderStaticFace() {
    if (this._staticFaceCache) {
      return this._staticFaceCache;
    }

    const { colors } = this.config;
    const faceColor = colors?.face || '#FFFFFF';
    const borderColor = colors?.border || '#333333';

    this._staticFaceCache = `
      <g id="clock-static-elements" data-name="static-elements">
        <!-- 表盘背景 -->
        <circle 
          id="clock-face-bg" 
          data-name="face-background"
          cx="0" cy="0" r="${this.radius}" 
          fill="${faceColor}" 
          stroke="${borderColor}" 
          stroke-width="4"
        />
        
        <!-- 刻度线 -->
        <g id="clock-ticks" data-name="ticks-group">
          ${this._generateTicks()}
        </g>

        <!-- 数字 -->
        <g id="clock-numbers" data-name="numbers-group">
          ${this._generateNumbers()}
        </g>
      </g>
    `;

    return this._staticFaceCache;
  }

  /**
   * 生成刻度线
   */
  _generateTicks() {
    let ticksHtml = '';
    const r = this.radius;

    for (let i = 0; i < 60; i++) {
      const isHour = i % 5 === 0;
      const length = isHour ? r * 0.15 : r * 0.05; // 小时刻度长，分钟刻度短
      const width = isHour ? 4 : 1.5;
      const angle = i * 6; // 6度一个刻度

      // 刻度线起点 (圆周边缘) 和 终点 (向圆心延伸)
      // 使用 transform 旋转，线段定义在 Y 轴负方向 (上方)
      // y1 是圆周内侧边缘，y2 是向圆心方向
      const y1 = -r + 10; // 稍微离边缘一点距离
      const y2 = y1 + length;

      ticksHtml += `
        <line 
          id="clock-tick-${i}"
          data-name="${isHour ? 'hour-tick' : 'minute-tick'}"
          x1="0" y1="${y1}" 
          x2="0" y2="${y2}" 
          stroke="#000000" 
          stroke-width="${width}"
          transform="rotate(${angle})"
          stroke-linecap="round"
        />
      `;
    }
    return ticksHtml;
  }

  /**
   * 生成表盘数字 (1-12)
   */
  _generateNumbers() {
    let numbersHtml = '';
    const r = this.radius;
    const numberRadius = r * 0.75; // 数字所在的半径圆环

    for (let i = 1; i <= 12; i++) {
      const angle = i * 30 * (Math.PI / 180); // 转换为弧度
      // SVG坐标系：X向右，Y向下。0度在3点钟方向。
      // 需要校正计算：12点(i=12) -> -90度 或 270度
      // 简单的三角函数：x = r * sin(a), y = -r * cos(a) (a为0在12点顺时针)
      const x = numberRadius * Math.sin(angle);
      const y = -numberRadius * Math.cos(angle);

      numbersHtml += `
        <text 
          id="clock-number-${i}"
          data-name="clock-number"
          x="${x}" y="${y}" 
          fill="${this.config.colors?.numbers || '#000'}" 
          font-size="${r * 0.15}" 
          text-anchor="middle" 
          dominant-baseline="central"
          class="clock-text"
        >
          ${i}
        </text>
      `;
    }
    return numbersHtml;
  }

  /**
   * 渲染时针
   * @param {Number} angle 
   */
  _renderHourHand(angle) {
    const handLength = this.radius * 0.55;
    const tailLength = this.radius * 0.15; // 尾部长度

    // 为了方便交互，增加一个透明的宽线作为点击热区
    return `
      <g id="hand-hour" class="clock-hand" data-name="hour-hand" transform="rotate(${angle})">
        <!-- 交互热区 (透明粗线) -->
        <line x1="0" y1="${tailLength}" x2="0" y2="${-handLength}" stroke="transparent" stroke-width="20" />
        
        <!-- 可视指针 -->
        <path 
          d="M -4 ${tailLength} L -4 ${-handLength} L 0 ${-handLength - 5} L 4 ${-handLength} L 4 ${tailLength} Z" 
          fill="${this.config.colors?.hourHand || '#000000'}" 
        />
      </g>
    `;
  }

  /**
   * 渲染分针
   * @param {Number} angle 
   */
  _renderMinuteHand(angle) {
    const handLength = this.radius * 0.8;
    const tailLength = this.radius * 0.15;

    return `
      <g id="hand-minute" class="clock-hand" data-name="minute-hand" transform="rotate(${angle})">
        <!-- 交互热区 -->
        <line x1="0" y1="${tailLength}" x2="0" y2="${-handLength}" stroke="transparent" stroke-width="16" />
        
        <!-- 可视指针 -->
        <path 
          d="M -3 ${tailLength} L -2 ${-handLength} L 0 ${-handLength - 4} L 2 ${-handLength} L 3 ${tailLength} Z" 
          fill="${this.config.colors?.minuteHand || '#000000'}" 
        />
      </g>
    `;
  }

  /**
   * 渲染秒针
   * @param {Number} angle 
   */
  _renderSecondHand(angle) {
    const handLength = this.radius * 0.85;
    const tailLength = this.radius * 0.2;
    const color = this.config.colors?.secondHand || '#FF0000';

    return `
      <g id="hand-second" class="clock-hand" data-name="second-hand" transform="rotate(${angle})">
        <!-- 交互热区 -->
        <line x1="0" y1="${tailLength}" x2="0" y2="${-handLength}" stroke="transparent" stroke-width="12" />
        
        <!-- 可视指针 (细线 + 尾部圆环) -->
        <line x1="0" y1="${tailLength}" x2="0" y2="${-handLength}" stroke="${color}" stroke-width="2" />
        <circle cx="0" cy="0" r="3" fill="${color}" />
      </g>
    `;
  }

  /**
   * 渲染中心盖帽
   */
  _renderCenterCap() {
    return `
      <g id="clock-center-group" data-name="center-group">
        <circle 
          id="clock-center-cap" 
          data-name="center-cap"
          cx="0" cy="0" r="6" 
          fill="#000000" 
          stroke="#FFFFFF" 
          stroke-width="2"
        />
      </g>
    `;
  }
}