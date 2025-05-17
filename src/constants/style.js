// src/constants/style.js

// 判断是否在微信小程序环境
const isMpWeixin =
  typeof wx !== "undefined" && wx.getMenuButtonBoundingClientRect;

// 安全获取菜单按钮信息
const getSafeMenuButtonRect = () => {
  try {
    return isMpWeixin
      ? wx.getMenuButtonBoundingClientRect()
      : { height: 0, top: 0, width: 0 };
  } catch (e) {
    return { height: 0, top: 0, width: 0 };
  }
};

// 安全获取系统信息
const getSafeSystemInfo = () => {
  try {
    return uni.getSystemInfoSync() || {};
  } catch (e) {
    return {};
  }
};

const menuButtonBoundingClientRect = getSafeMenuButtonRect();
const systemInfo = getSafeSystemInfo();
const statusBarHeight = systemInfo.statusBarHeight || 0;

// 计算导航栏高度
const navBarHeight = isMpWeixin
  ? menuButtonBoundingClientRect.height +
    (menuButtonBoundingClientRect.top - statusBarHeight) * 2
  : 44;

// 定义样式变量
export const styleVariables = {
  "--app-status-bar-height": `${statusBarHeight}px`,
  "--app-nav-bar-height": `${navBarHeight}px`, //状态栏
  "--app-nav-bar-width": `${menuButtonBoundingClientRect.width}px`,
  "--app-top-bar-height": `${statusBarHeight + navBarHeight}px`, //整体
  "--app-brand-color-primary": "#5088fa",
  "--app-brand-color-secondary": "#d2e1fc",
  "--app-price-color-primary": "#F6260A",
  "--app-price-color-secondary": "#00000080",
};

// 开发环境调试输出
if (process.env.NODE_ENV === "development") {
  console.log("当前环境:", isMpWeixin ? "微信小程序" : "其他环境");
  console.log("样式变量:", styleVariables);
}
