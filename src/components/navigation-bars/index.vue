/* 顶部导航栏 通用组件 */

<template>
  <view
    v-if="viscosity === true"
    style="position: sticky; top: 0; z-index: 999; padding: 0 20rpx"
    :style="{ height: topBarHeight, backgroundColor: backgroundColor }"
  >
    <view :style="{ height: statusBarHeight }"></view>
    <view
      style="display: flex; justify-content: space-between; align-items: center"
      :style="{ height: titleBarHeight, paddingRight: paddingRightWidth }"
    >
      <view :style="{ width: paddingRightWidth }">
        <image
          v-if="image"
          mode="aspectFill"
          style="width: 30rpx; height: 30rpx"
          :src="image"
          @click="packClick"
        ></image>
        <image
          v-else="image"
          mode="aspectFill"
          style="width: 50rpx; height: 50rpx"
          :src="image"
        ></image>
      </view>
      <view
        style="width: 100%; text-align: center; font-size: 32rpx"
        :style="{ color: color }"
        >{{ title }}</view
      >
    </view>
  </view>
  <view v-else :style="{ height: topBarHeight }">
    <view :style="{ height: statusBarHeight }"></view>
    <view
      style="display: flex; justify-content: space-between; align-items: center"
      :style="{ height: titleBarHeight, paddingRight: paddingRightWidth }"
    >
      <view :style="{ width: paddingRightWidth }">
        <image
          v-if="image"
          mode="aspectFill"
          style="width: 30rpx; height: 30rpx"
          :src="image"
          @click="packClick"
        ></image>
        <image
          v-else="image"
          mode="aspectFill"
          style="width: 50rpx; height: 50rpx"
          :src="image"
        ></image>
      </view>
      <view
        style="width: 100%; text-align: center; font-size: 32rpx"
        :style="{ color: color }"
        >{{ title }}</view
      >
    </view>
  </view>
</template>

<script>
export default {
  name: "NavigationBars",
  props: {
    image: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "标题",
    },
    color: {
      type: String,
      default: "#ffffff",
    },
    viscosity: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: "transparent",
    },
  },

  data() {
    return {};
  },
  methods: {
    /**返回 */
    packClick() {
      uni.navigateBack({
        delta: 1,
      });
      this.$emit("pack");
    },
  },
  computed: {
    topBarHeight() {
      return this.$styleVariables["--app-top-bar-height"];
    },
    titleBarHeight() {
      return this.$styleVariables["--app-nav-bar-height"];
    },

    statusBarHeight() {
      return this.$styleVariables["--app-status-bar-height"];
    },
    paddingRightWidth() {
      return this.$styleVariables["--app-nav-bar-width"];
    },
  },
};
</script>

<style scoped></style>
