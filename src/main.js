import Vue from "vue";
import App from "./App";
import store from "./store";
import * as utils from "./utils";
import * as mixins from "./mixins";

// 引入全局组件
import NavBar from "./components/nav-bar.vue";
import Loading from "./components/common/Loading.vue";
import Empty from "./components/common/Empty.vue";
import { styleVariables } from "./constants/style";

// 注册全局组件
Vue.component("nav-bar", NavBar);
Vue.component("Loading", Loading);
Vue.component("Empty", Empty);

// 注册全局混入
Object.keys(mixins).forEach((key) => {
  Vue.mixin(mixins[key]);
});

// 注册全局方法
Object.keys(utils).forEach((key) => {
  Vue.prototype[`$${key}`] = utils[key];
});

// 检查是否已登录，恢复用户状态
function checkLoginStatus() {
  try {
    const token = uni.getStorageSync("token");
    const userInfo = uni.getStorageSync("userInfo");

    if (token && userInfo) {
      if (store && store.commit) {
        store.commit("user/SET_TOKEN", token);
        store.commit("user/SET_USER_INFO", userInfo);
        store.commit("user/SET_VIP_STATUS", userInfo.isVip || false);
      }
      return true;
    }
  } catch (e) {
    console.error("检查登录状态失败:", e);
  }
  return false;
}

// 初始化检查
function initApp() {
  // 检查登录状态
  const isLoggedIn = checkLoginStatus();
  console.log("登录状态:", isLoggedIn ? "已登录" : "未登录");
}

// 初始化
initApp();

Vue.config.productionTip = false;

App.mpType = "app";
// 注册全局样式变量
Vue.prototype.$styleVariables = styleVariables;

// 初始化微信云开发环境
// #ifdef MP-WEIXIN
if (wx.cloud) {
  wx.cloud.init({
    env: 'cloud1-5gszljn762dc4719', //云环境ID
    traceUser: true
  });
  console.log('云开发环境初始化成功');
  
  // 检测云环境是否同步
  if(wx.cloud.env){
    console.log('云环境ID:', wx.cloud.env)
  } else {
    console.error('云环境未正确注入')
  }
} else {
  console.error('请使用 2.2.3 或以上的基础库以使用云能力');
}
// #endif

const app = new Vue({
  store,
  ...App,
});
app.$mount();
