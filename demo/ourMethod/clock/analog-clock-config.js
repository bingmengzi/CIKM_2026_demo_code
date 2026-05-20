/**
 * Analog Clock Configuration
 * 定义时钟的尺寸、外观颜色、初始状态及内部渲染参数
 */
export const DEFAULT_CONFIG = {
  // ==================================================================================
  // 公开配置（Public Config）- 用户可通过属性或API修改
  // ==================================================================================

  // 1. 尺寸与基础配置
  radius: 150,                   // 表盘半径 (决定组件的基础大小，内部计算的基准)
  width: '100%',                 // 容器宽度 (CSS样式)
  height: 'auto',                // 容器高度 (CSS样式)

  // 2. 初始状态
  defaultTime: {                 // 默认显示时间
    h: 10,
    m: 10,
    s: 30
  },

  // 3. 交互开关
  enableInteraction: true,       // 是否允许用户拖拽指针
  showSecondHand: true,          // 是否显示秒针
  smoothSecondHand: false,       // 秒针是否平滑移动 (false为跳秒，true为扫秒)

  // 4. 颜色配置 (外观主题)
  colors: {
    face: '#FFFFFF',             // 表盘背景色
    border: '#333333',           // 表盘边框色
    ticks: '#000000',            // 刻度线颜色
    numbers: '#000000',          // 数字颜色
    hourHand: '#000000',         // 时针颜色
    minuteHand: '#000000',       // 分针颜色
    secondHand: '#D40000',       // 秒针颜色 (红色)
    centerCap: '#D40000',        // 中心盖帽颜色
    hoverHighlight: 'rgba(0, 0, 0, 0.1)' // 指针交互时的悬停高亮背景
  },

  // ==================================================================================
  // 内部配置（Internal Config）- 组件内部渲染逻辑与物理参数，不对外暴露
  // ==================================================================================

  // 1. 布局比例 (所有数值基于 radius 的百分比，确保响应式缩放)
  paddingRatio: 0.05,            // 表盘边缘留白比例
  borderWidthRatio: 0.04,        // 表盘外框宽度比例

  // 2. 刻度线配置
  majorTickLength: 0.12,         // 小时刻度(长)长度比例
  majorTickWidth: 0.025,         // 小时刻度宽度比例
  minorTickLength: 0.06,         // 分钟刻度(短)长度比例
  minorTickWidth: 0.01,          // 分钟刻度宽度比例

  // 3. 数字配置
  numberPositionRatio: 0.82,     // 数字距离圆心的距离比例 (0-1)
  fontSizeRatio: 0.15,           // 数字字体大小比例

  // 4. 指针几何参数 (长度、宽度、尾部长度)
  hourHandConfig: {
    length: 0.55,                // 时针长度 (相对于半径)
    width: 0.05,                 // 时针宽度
    tail: 0.0                    // 时针尾部长度
  },
  minuteHandConfig: {
    length: 0.85,                // 分针长度
    width: 0.03,                 // 分针宽度
    tail: 0.0                    // 分针尾部长度
  },
  secondHandConfig: {
    length: 0.90,                // 秒针长度
    width: 0.01,                 // 秒针宽度
    tail: 0.2,                   // 秒针尾部延伸长度
    counterWeightRadius: 0.03    // 秒针尾部配重圆半径
  },
  
  // 5. 中心装饰配置
  centerCapRadius: 0.04,         // 中心圆点半径比例

  // 6. 交互参数
  dragSensitivity: 1.0,          // 拖拽灵敏度系数
  snapToMinutes: false,          // 拖拽释放时是否自动吸附到最近的分钟刻度 (教学常用)
  cursorStyle: {
    default: 'default',
    hover: 'pointer',
    grabbing: 'grabbing'
  },

  // 7. 动画参数
  transitionDuration: 100,       // 指针非拖拽状态下的更新过渡时间 (ms)
  bounceEffect: false            // 秒针跳动时的弹性效果开关
};