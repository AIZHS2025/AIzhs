/**
 * Ripple_Yu
 * 悬浮主页的分佣小图标
 * 点击跳转至 分佣计划 路由页面
 *
 */
<template>
  <movable-area class="floating-icon-container">
    <movable-view
      class="floating-icon"
      direction="all"
      :x="iconX"
      :y="iconY"
      @change="onPositionChange"
      @tap="navigateToEarnCommission"
    >
      <image class="icon-floating-image" :src="iconSrc"></image>
    </movable-view>
  </movable-area>
</template>

<script>
export default {
  name: 'CommissionFloatingIcon',
  data() {
    return {
      iconSrc: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/xia/commission.png', 
      iconX: uni.getSystemInfoSync().windowWidth - 60, // 初始X位置(右侧)
      iconY: uni.getSystemInfoSync().windowHeight / 2 - 24, // 初始Y位置(中部)
    }
  },
  created() {
    try {
      const savedPosition = uni.getStorageSync('floatingIconPosition');
      if (savedPosition) {
        const position = JSON.parse(savedPosition);
        this.iconX = position.x;
        this.iconY = position.y;
      }
    } catch (e) {
      console.error('读取悬浮图标位置失败', e);
    }
  },
  methods: {
    onPositionChange(e) {
      // 保存当前位置到本地存储
      const position = {
        x: e.detail.x,
        y: e.detail.y
      };
      uni.setStorageSync('floatingIconPosition', JSON.stringify(position));
    },
    navigateToEarnCommission() {
      // 先尝试使用switchTab跳转（因为分佣计划是tabBar页面）
      uni.switchTab({
        url: '/pages/earn_commission/index',
        fail: (err) => {
          console.error('switchTab跳转失败', err);
          // 如果switchTab失败，再尝试使用navigateTo
          uni.navigateTo({
            url: '/pages/earn_commission/index',
            fail: (error) => {
              console.error('navigateTo也失败了', error);
              uni.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        }
      });
    }
  }
}
</script>

<style scoped lang="scss">
.floating-icon-container {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 999;
}

.floating-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.6);
}

.icon-floating-image {
  width: 60%;
  height: 60%;
}
</style>
