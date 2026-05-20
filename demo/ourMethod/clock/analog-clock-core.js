import { DEFAULT_CONFIG } from './analog-clock-config.js';

export class AnalogClockCore {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.listeners = [];

    // 初始化状态
    // 根据接口文档 data 包含 time 对象
    const defaultTime = this.config.defaultTime || { h: 10, m: 10, s: 30 };

    this.state = {
      data: {
        time: {
          hour: defaultTime.h,
          minute: defaultTime.m,
          second: defaultTime.s
        }
      },
      computed: {
        hourAngle: 0,
        minuteAngle: 0,
        secondAngle: 0,
        formattedTime: ''
      }
    };

    this._recompute();
  }

  /**
   * 添加状态变更监听器
   * @param {Function} callback 
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
   * 通知所有监听器状态已变更
   */
  _notifyChange() {
    // 传递状态副本，防止外部直接修改
    const stateSnapshot = this.getState();
    this.listeners.forEach(listener => listener(stateSnapshot));
  }

  /**
   * 获取当前完整状态的快照
   * @returns {Object} Deep copy of state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * 外部设置状态（通常用于回溯或同步）
   * @param {Object} newState 
   */
  setState(newState) {
    if (newState && newState.data && newState.data.time) {
      this.state.data.time = { ...this.state.data.time, ...newState.data.time };
      this._recompute();
      this._notifyChange();
    }
  }

  /**
   * 重新计算 computed 属性
   * 根据当前 time 计算指针角度
   */
  _recompute() {
    const { hour, minute, second } = this.state.data.time;

    // 规范化时间数值确保计算准确，强制转换为数字防止字符串运算错误或NaN传播
    const h = (Number(hour) || 0) % 12;
    const m = Number(minute) || 0;
    const s = Number(second) || 0; // 防止 s 为 undefined/NaN 导致整个角度计算失败

    // 计算角度 (0-360度)
    // 时针角度：每小时30度 + 每分钟0.5度 + 每秒(1/120)度
    // 公式: (hour + minute/60 + second/3600) * 30
    const hourAngle = (h + m / 60 + s / 3600) * 30;

    // 分针角度：每分钟6度 + 每秒0.1度
    // 公式: minute * 6 + second * 0.1
    const minuteAngle = m * 6 + s * 0.1;

    // 秒针角度：每秒6度
    const secondAngle = s * 6;

    // 格式化时间字符串 HH:mm:ss
    // 注意：显示用的小时保持原始值（可能是24小时制），但补零
    const pad = (num) => String(Math.floor(num)).padStart(2, '0');
    const formattedTime = `${pad(hour)}:${pad(minute)}:${pad(second)}`;

    this.state.computed = {
      hourAngle,
      minuteAngle,
      secondAngle,
      formattedTime
    };
  }

  /**
   * 设置时间
   * @param {Object|String} value - {h, m, s} 对象 或 "HH:mm:ss" 字符串
   */
  setTime(value) {
    let newHour = this.state.data.time.hour;
    let newMinute = this.state.data.time.minute;
    let newSecond = this.state.data.time.second;

    if (typeof value === 'string') {
      const parts = value.split(':').map(p => parseInt(p, 10));
      if (parts.length > 0 && !isNaN(parts[0])) newHour = parts[0];
      if (parts.length > 1 && !isNaN(parts[1])) newMinute = parts[1];
      if (parts.length > 2 && !isNaN(parts[2])) newSecond = parts[2];
    } else if (typeof value === 'object' && value !== null) {
      if (value.h !== undefined) newHour = value.h;
      if (value.m !== undefined) newMinute = value.m;
      if (value.s !== undefined) newSecond = value.s;
    }

    this._updateTime(newHour, newMinute, newSecond);
  }

  /**
   * 内部更新时间并触发变更
   */
  _updateTime(h, m, s) {
    // 限制范围
    const hour = Math.max(0, Math.min(23, h));
    const minute = Math.max(0, Math.min(59, m));
    const second = Math.max(0, Math.min(59, s));

    this.state.data.time = { hour, minute, second };
    this._recompute();

    // 同步更新 _lastAngles，确保后续拖拽时使用正确的初始角度
    this._lastAngles = {
      second: second * 6,
      minute: minute * 6,
      hour: (hour % 12) * 30 + minute * 0.5  // 时针角度需要考虑分钟的影响
    };

    this._notifyChange();
  }

  /**
   * 根据指针拖拽交互计算并更新时间
   * @param {String} handType - 'hour', 'minute', 'second'
   * @param {Number} angle - 鼠标相对于圆心的角度 (0度为12点方向，顺时针)
   */
  setFromHandInteraction(handType, angle) {
    // 确保角度在 0-360 之间
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;

    let { hour, minute, second } = this.state.data.time;

    // 初始化上次角度跟踪（用于检测进位）
    if (!this._lastAngles) {
      this._lastAngles = {
        second: second * 6,
        minute: minute * 6,
        hour: (hour % 12) * 30
      };
    }

    // 重置跳过 transition 标记
    this._skipTransition = { hour: false, minute: false, second: false };

    if (handType === 'second') {
      // 计算新的秒针值
      let newSecond = Math.round(normalizedAngle / 6) % 60;

      // 检测是否需要进位/退位
      const oldSecond = second;

      // 更新 _lastAngles
      this._lastAngles.second = normalizedAngle;

      // 进位条件：从高秒(>50)跳到低秒(<10)
      if (oldSecond > 50 && newSecond < 10) {
        minute = (minute + 1) % 60;
        this._skipTransition.second = true;
        this._skipTransition.minute = true;
        this._lastAngles.minute = minute * 6;
        if (minute === 0) {
          hour = (hour + 1) % 24;
          this._skipTransition.hour = true;
        }
      }
      // 退位条件：从低秒(<10)跳到高秒(>50)
      else if (oldSecond < 10 && newSecond > 50) {
        minute = minute - 1;
        if (minute < 0) {
          minute = 59;
          hour = hour - 1;
          if (hour < 0) hour = 23;
          this._skipTransition.hour = true;
        }
        this._skipTransition.second = true;
        this._skipTransition.minute = true;
        this._lastAngles.minute = minute * 6;
      }

      second = newSecond;

    } else if (handType === 'minute') {
      // 计算新的分钟值
      let newMinute = Math.round(normalizedAngle / 6) % 60;

      // 检测是否需要进位/退位
      // 通过比较新旧分钟值来判断是否跨越了边界
      const oldMinute = minute;

      // 更新 _lastAngles
      this._lastAngles.minute = normalizedAngle;

      // 进位条件：从高分钟(>50)跳到低分钟(<10)
      if (oldMinute > 50 && newMinute < 10) {
        hour = (hour + 1) % 24;
        this._skipTransition.minute = true;
        this._skipTransition.hour = true;
        this._lastAngles.hour = (hour % 12) * 30;
      }
      // 退位条件：从低分钟(<10)跳到高分钟(>50)
      else if (oldMinute < 10 && newMinute > 50) {
        hour = hour - 1;
        if (hour < 0) hour = 23;
        this._skipTransition.minute = true;
        this._skipTransition.hour = true;
        this._lastAngles.hour = (hour % 12) * 30;
      }

      minute = newMinute;

    } else if (handType === 'hour') {
      // 时针：每30度1小时，分针应该根据时针的小数部分跟随旋转
      // 时针角度 = hour * 30 + minute * 0.5
      // 反推：hour = floor(angle / 30), minute = (angle % 30) * 2

      // 检测时针是否越过12点（AM/PM切换）
      const lastHourAngle = this._lastAngles.hour;
      const crossedForward = lastHourAngle > 270 && normalizedAngle < 90;
      const crossedBackward = lastHourAngle < 90 && normalizedAngle > 270;

      this._lastAngles.hour = normalizedAngle;

      // 时针越过12点时，标记需要跳过 transition
      if (crossedForward || crossedBackward) {
        this._skipTransition.hour = true;
        this._skipTransition.minute = true; // 分针也需要跳过
      }

      // 保持当前的 AM/PM 状态
      let isPM = hour >= 12;

      // 如果越过12点，切换AM/PM
      if (crossedForward || crossedBackward) {
        isPM = !isPM;
      }

      // 从角度计算小时和分钟
      // 时针每30度1小时，每0.5度1分钟
      let newHour12 = Math.floor(normalizedAngle / 30);
      if (newHour12 >= 12) newHour12 = 0;

      // 从角度的小数部分计算分钟：(角度 % 30) * 2
      const angleRemainder = normalizedAngle % 30;
      minute = Math.round(angleRemainder * 2) % 60;

      // 更新分针的 lastAngle 以避免误检测跨越
      this._lastAngles.minute = minute * 6;

      hour = newHour12;

      // 根据AM/PM状态调整小时
      if (isPM && hour < 12) {
        hour += 12;
      }

      // 最终取模保证安全
      hour = hour % 24;
    }

    this._updateTime(hour, minute, second);
  }

  /**
   * 获取需要跳过 transition 的指针标记
   */
  getSkipTransition() {
    return this._skipTransition || { hour: false, minute: false, second: false };
  }

  /**
   * 设置配置
   */
  setConfig(config) {
    // 深度合并 colors 配置，防止部分更新导致其他颜色配置丢失
    const newConfig = { ...this.config, ...config };
    if (config.colors && this.config.colors) {
      newConfig.colors = { ...this.config.colors, ...config.colors };
    }
    this.config = newConfig;
  }

  /**
   * 重置为默认时间
   */
  reset() {
    const defaultTime = this.config.defaultTime || { h: 10, m: 10, s: 30 };
    this._updateTime(defaultTime.h, defaultTime.m, defaultTime.s);
  }
}