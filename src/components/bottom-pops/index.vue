<template>
  <view class="pops" v-show="isShow">
    <!-- 使用 v-show 而不是 v-if -->
    <view class="pops-item" :class="{ show: showPopup, hide: !showPopup }">
      <view class="item-center">
        <view style="width: 20rpx"></view>
        <view style="font-weight: bold; font-size: 34rpx">{{ title }}</view>
        <view @click.self="close">
          <image
            style="width: 40rpx; height: 40rpx"
            src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/删除.png"
            mode="scaleToFill"
          />
        </view>
      </view>
      <slot name="center"> </slot>
      <slot name="bottom"> </slot>
    </view>
  </view>
</template>

<script>
export default {
  name: "BottomPops",
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      showPopup: false,
    };
  },
  watch: {
    isShow(val) {
      if (val) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.showPopup = true;
          }, 20);
        });
      } else {
        this.showPopup = false;
      }
    },
  },
  methods: {
    close() {
      this.showPopup = false;
      setTimeout(() => {
        this.$emit("close");
      }, 300); // 动画持续300ms
    },
  },
};
</script>

<style>
.pops {
  position: fixed;
  z-index: 500;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.pops-item {
  display: flex;
  padding-bottom: 50rpx;
  flex-direction: column;
  justify-content: space-between;
  z-index: 999;
  width: 100%;
  background-color: white;
  border-radius: 20rpx 20rpx 0 0;
  overflow-y: hidden;
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out;
}

.pops-item.show {
  transform: translateY(0); /* 弹出动画 */
}

.pops-item.hide {
  transform: translateY(100%); /* 隐藏动画 */
}

.item-center {
  padding: 30rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: black;
}
</style>
