<script>
import { openId, login, recharge } from "@/service/login.js";
export default {
  globalData: {
    userInfo: null,
    cloudConnected: false,
    // 添加全局图片预加载方法
    preloadImage: null,
  },

  onLaunch: function () {
    console.log("App Launch");
    // 初始化全局预加载方法
    this.globalData.preloadImage = this.preloadImage;
    
    uni.login({
      provider: "weixin", // 微信小程序登录
      success: function (res) {
        if (res.code) {
          // 拿到登录凭证 code
          console.log("code:", res.code);
          openId(res.code).then((res) => {
            const yqm = "";
            login(res.openid, yqm)
              .then((res) => {
                const data = res.data;
                uni.setStorageSync("data", data);
                recharge(data.id).then((res) => {
                  if (res.code === 200) {
                    if (res.msg === "非会员页面") {
                      uni.setStorageSync("vip", false);
                    } else {
                      uni.setStorageSync("vip", true);
                    }
                  }
                });
              })
              .catch((err) => console.error("登录失败", err));
          });
          // 这里可以把 code 发送到服务器，换取 openid / session_key
        } else {
          console.log("登录失败：没有code");
        }
      },
      fail: function (err) {
        console.log("登录接口调用失败：", err);
      },
    });

    // 设置云服务连接状态
    this.globalData.cloudConnected = false;

    // 初始化应用
    this.initApp();

    // 动态设置TabBar图标
    this.setDynamicTabBarIcons();

    // 检查更新
    if (uni.canIUse("getUpdateManager")) {
      const updateManager = uni.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            uni.showModal({
              title: "更新提示",
              content: "新版本已经准备好，是否重启应用？",
              success: function (res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              },
            });
          });
        }
      });
    }

    // 初始化全局数据
    if (!this.globalData) {
      this.globalData = {};
    }
    this.globalData.isOfflineMode = false;
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
  methods: {
    /**
     * 全局图片预加载方法
     * @param {string} src - 图片路径
     * @param {Object} options - 配置选项
     * @param {boolean} options.isCloudStorage - 是否为云存储图片
     * @returns {Promise} 返回预加载完成的Promise
     */
    async preloadImage(src, options = {}) {
      const { isCloudStorage = false } = options;
      
      try {
        let imageUrl = src;
        if (isCloudStorage) {
          // 获取云存储图片的临时访问URL
          const urlRes = await uniCloud.getTempFileURL({
            fileList: [src]
          });
          
          if (urlRes.fileList && urlRes.fileList.length > 0) {
            imageUrl = urlRes.fileList[0].tempFileURL;
          }
        }

        return new Promise((resolve, reject) => {
          uni.getImageInfo({
            src: imageUrl,
            success: () => {
              console.log(`图片预加载成功: ${src}`);
              resolve(imageUrl);
            },
            fail: (err) => {
              console.error(`图片预加载失败: ${src}`, err);
              reject(err);
            }
          });
        });
      } catch (error) {
        console.error('预加载图片时发生错误:', error);
        return Promise.reject(error);
      }
    },

    // 初始化应用
    initApp() {
      // 尝试恢复用户状态
      this.$store
        .dispatch("user/restoreUserState")
        .then((result) => {
          console.log("恢复用户状态结果:", result);

          // 检查云端连接
          this.checkCloudConnection();
        })
        .catch((error) => {
          console.error("恢复用户状态失败:", error);
        });
    },

    // 检查云服务连接
    async checkCloudConnection() {
      try {
        // 尝试调用云函数ping测试连接
        const res = await uniCloud.callFunction({
          name: "login",
          data: {
            action: "ping",
          },
        });

        console.log("云服务连接测试结果:", res);
        if (res.result && res.result.code === 0) {
          console.log("云服务连接成功");
          this.globalData.cloudConnected = true;
          return true;
        } else {
          console.warn("云服务连接失败:", res);
          this.globalData.cloudConnected = false;
          return false;
        }
      } catch (error) {
        console.error("云服务连接失败:", error);
        // 设置全局状态为连接失败
        this.globalData.cloudConnected = false;

        // 错误提示（仅开发环境显示）
        // #ifdef APP-PLUS || H5
        uni.showToast({
          title: "云服务连接失败，将使用本地模式",
          icon: "none",
          duration: 3000,
        });
        // #endif

        return false;
      }
    },

    // 动态设置TabBar图标
    async setDynamicTabBarIcons() {
      try {
        // 1. 获取图标配置 (fileIDs)
        const iconRes = await uniCloud.callFunction({
          name: "common",
          data: { action: "getTabBarIcons" },
        });

        if (iconRes.result.code !== 0 || !iconRes.result.data) {
          console.error("获取TabBar图标配置失败:", iconRes.result.msg);
          return;
        }

        const icons = iconRes.result.data;
        const fileIDs = [
          icons.home,
          icons.homeActive,
          icons.chat,
          icons.chatActive,
          icons.member,
          icons.memberActive,
          icons.settings,
          icons.settingsActive,
        ];

        // 2. 获取图标临时URL
        const urlRes = await uniCloud.getTempFileURL({
          fileList: fileIDs,
        });

        if (urlRes.fileList && urlRes.fileList.length > 0) {
          const tempFileURLs = {};
          urlRes.fileList.forEach((item) => {
            if (item.tempFileURL) {
              tempFileURLs[item.fileID] = item.tempFileURL;
            }
          });

          // 3. 设置TabBar图标
          const tabBarList = [
            { index: 0, icon: icons.home, activeIcon: icons.homeActive },
            { index: 1, icon: icons.chat, activeIcon: icons.chatActive },
            { index: 2, icon: icons.member, activeIcon: icons.memberActive },
            {
              index: 3,
              icon: icons.settings,
              activeIcon: icons.settingsActive,
            },
          ];

          tabBarList.forEach((item) => {
            const iconPath = tempFileURLs[item.icon];
            const selectedIconPath = tempFileURLs[item.activeIcon];

            if (iconPath && selectedIconPath) {
              uni.setTabBarItem({
                index: item.index,
                iconPath: iconPath,
                selectedIconPath: selectedIconPath,
                success: () => {
                  console.log(`TabBar ${item.index} 图标设置成功`);
                },
                fail: (err) => {
                  console.error(`TabBar ${item.index} 图标设置失败:`, err);
                },
              });
            } else {
              console.warn(`TabBar ${item.index} 缺少图标URL，无法设置`);
            }
          });
        } else {
          console.error("获取TabBar图标临时URL失败", urlRes);
        }
      } catch (error) {
        console.error("设置动态TabBar图标时发生错误:", error);
      }
    },
  },
};
</script>

<style lang="scss">
/* 引入图标字体 */
@import "./static/iconfont.css";

/* 引入全局样式变量 */
@import "./uni.scss";

/* 全局样式 */
page {
  background-color: $background-color;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica,
    Segoe UI, Arial, Roboto, "PingFang SC", "miui", "Hiragino Sans GB",
    "Microsoft Yahei", sans-serif;
  color: $text-color;
  font-size: $font-size-base;
  /* 添加系统原生TabBar顶部光线效果 */
  --tabbar-border-color: rgba(0, 242, 255, 0.5);
}

/* 设置原生TabBar的样式 - 使用CSS变量和微信小程序支持的属性 */
.uni-tabbar {
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2) !important;
}

.uni-tabbar__bd {
  height: 100rpx !important; /* 适当调整TabBar高度 */
}

.uni-tabbar__icon {
  width: 48rpx !important; /* 调整图标尺寸 */
  height: 48rpx !important;
}

/* 设置TabBar边框 */
.uni-tabbar-border {
  background-color: rgba(0, 242, 255, 0.3) !important;
}

/* 去除默认滚动条样式 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 去除按钮默认边框 */
button::after {
  border: none;
}

/* 统一图片默认样式 */
image {
  will-change: transform;
}

/* 统一列表样式 */
.list-cell {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  background-color: $background-color-light;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid $border-color;
  transition: all $animation-duration-fast;

  &:active {
    background-color: $background-color-hover;
  }

  &:last-child {
    border-bottom: none;
  }
}

/* 统一卡片样式 */
.card {
  background-color: $background-color-card;
  border-radius: $border-radius-large;
  box-shadow: $box-shadow;
  padding: $spacing-large;
  margin-bottom: $spacing-large;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &.card-neon {
    box-shadow: $box-shadow-neon;
    border: 1px solid rgba($primary-color, 0.3);
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 60%;
      height: 3px;
      background: linear-gradient(to right, $primary-color, transparent);
    }

    &::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 0;
      width: 3px;
      height: 30%;
      background: linear-gradient(to bottom, $primary-color, transparent);
    }
  }

  &.cyber-card {
    border: 1px solid rgba($primary-color, 0.2);
    background: $background-color-card;
    position: relative;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: linear-gradient(
        to right,
        transparent,
        rgba($primary-color, 0.8),
        transparent
      );
      box-shadow: 0 0 5px rgba($primary-color, 0.5);
    }
  }

  &.tech-card {
    background-color: $background-color-card;
    border: 1px solid rgba($accent-color, 0.2);

    &::before {
      content: "";
      position: absolute;
      top: -2px;
      right: 20px;
      width: 30px;
      height: 5px;
      background-color: $accent-color;
      border-radius: 0 0 3px 3px;
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

/* 统一按钮样式 */
.btn {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: $border-radius-large;
  font-size: $font-size-base;
  transition: all $animation-duration-fast;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: all 0.6s;
  }

  &:active {
    transform: scale(0.95);
  }

  &:active::after {
    left: 100%;
  }

  &.btn-primary {
    background: linear-gradient(
      90deg,
      $primary-color,
      lighten($primary-color, 10%)
    );
    color: $background-color;
    box-shadow: 0 5rpx 15rpx rgba($primary-color, 0.4);

    &:active {
      background: linear-gradient(
        90deg,
        darken($primary-color, 5%),
        $primary-color
      );
      box-shadow: 0 2rpx 8rpx rgba($primary-color, 0.3);
    }
  }

  &.btn-accent {
    background: linear-gradient(
      90deg,
      $accent-color,
      lighten($accent-color, 10%)
    );
    color: #fff;
    box-shadow: 0 5rpx 15rpx rgba($accent-color, 0.4);

    &:active {
      background: linear-gradient(
        90deg,
        darken($accent-color, 5%),
        $accent-color
      );
      box-shadow: 0 2rpx 8rpx rgba($accent-color, 0.3);
    }
  }

  &.btn-outline {
    background-color: transparent;
    border: 1px solid $primary-color;
    color: $primary-color;
    box-shadow: 0 0 8rpx rgba($primary-color, 0.3);

    &:active {
      background-color: rgba($primary-color, 0.05);
      box-shadow: 0 0 15rpx rgba($primary-color, 0.5) inset;
    }
  }

  &.btn-ghost {
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    color: $text-color;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:active {
      background-color: rgba(255, 255, 255, 0.12);
    }
  }

  &.btn-icon {
    width: 88rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont {
      font-size: $font-size-lg;
    }
  }
}

/* 统一文本样式 */
.text-primary {
  color: $primary-color;
}

.text-accent {
  color: $accent-color;
}

.text-light {
  color: $text-color-light;
}

.text-success {
  color: $success-color;
}

.text-warning {
  color: $warning-color;
}

.text-error {
  color: $error-color;
}

.text-info {
  color: $info-color;
}

/* 添加霓虹字效果 */
.text-neon {
  color: $primary-color;
  text-shadow: 0 0 10px rgba($primary-color, 0.8);
}

/* 统一间距类 */
.mt-1 {
  margin-top: $spacing-mini;
}
.mt-2 {
  margin-top: $spacing-small;
}
.mt-3 {
  margin-top: $spacing-base;
}
.mt-4 {
  margin-top: $spacing-large;
}
.mt-5 {
  margin-top: $spacing-xlarge;
}

.mb-1 {
  margin-bottom: $spacing-mini;
}
.mb-2 {
  margin-bottom: $spacing-small;
}
.mb-3 {
  margin-bottom: $spacing-base;
}
.mb-4 {
  margin-bottom: $spacing-large;
}
.mb-5 {
  margin-bottom: $spacing-xlarge;
}

.ml-1 {
  margin-left: $spacing-mini;
}
.ml-2 {
  margin-left: $spacing-small;
}
.ml-3 {
  margin-left: $spacing-base;
}
.ml-4 {
  margin-left: $spacing-large;
}
.ml-5 {
  margin-left: $spacing-xlarge;
}

.mr-1 {
  margin-right: $spacing-mini;
}
.mr-2 {
  margin-right: $spacing-small;
}
.mr-3 {
  margin-right: $spacing-base;
}
.mr-4 {
  margin-right: $spacing-large;
}
.mr-5 {
  margin-right: $spacing-xlarge;
}

.pa-1 {
  padding: $spacing-mini;
}
.pa-2 {
  padding: $spacing-small;
}
.pa-3 {
  padding: $spacing-base;
}
.pa-4 {
  padding: $spacing-large;
}
.pa-5 {
  padding: $spacing-xlarge;
}

/* 统一flex布局类 */
.flex {
  display: flex;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-around {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1;
}

.align-center {
  align-items: center;
}

.align-start {
  align-items: flex-start;
}

.align-end {
  align-items: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.justify-around {
  justify-content: space-around;
}

/* 统一文本溢出省略 */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.text-ellipsis-3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* 添加科技感元素 */
.tech-border {
  position: relative;
  border: 1px solid $border-color;
  border-radius: $border-radius-large;

  &::before {
    content: "";
    position: absolute;
    top: -1px;
    left: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border-radius: $border-radius-large;
    border: 1px solid transparent;
    background: linear-gradient(90deg, $primary-color, $accent-color) border-box;
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }
}

.tech-loading {
  position: relative;
  width: 60rpx;
  height: 60rpx;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: $primary-color;
    animation: spin 1s linear infinite;
  }

  &::after {
    border-top-color: transparent;
    border-right-color: $primary-color;
    animation-duration: 1.5s;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 添加玻璃拟态效果 */
.glass {
  background: rgba(30, 31, 37, 0.5);
  backdrop-filter: blur(15px);
  border-radius: $border-radius-large;
  border: 1px solid $border-color;
}

/* 定义渐变效果 */
.gradient-primary {
  background: linear-gradient(135deg, $primary-color, $accent-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 添加科技线框 */
.tech-grid {
  background-image: linear-gradient(
      rgba($primary-color, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba($primary-color, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
