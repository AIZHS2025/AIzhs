/** * Ripple_Yu * 轮播图组件 * 可接入点击跳转至 路由页面 * */
<template>
  <view class="carousel-container">
    <swiper
      class="carousel"
      :indicator-dots="false"
      :autoplay="true"
      :interval="3000"
      :duration="500"
      :circular="true"
      @change="onSwiperChange"
    >
      <swiper-item
        v-for="(item, index) in banner"
        :key="index"
        @click="handleItemClick(index)"
      >
        <image :src="item.img" class="carousel-image" mode="aspectFill"></image>
      </swiper-item>
    </swiper>
    <view class="indicator">
      <view
        v-for="(item, index) in banner"
        :key="index"
        class="dot"
        :class="{ active: current === index }"
      >
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "Carousel",
  props: {
    banner: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      current: 0,
    };
  },
  methods: {
    onSwiperChange(e) {
      this.current = e.detail.current;
    },
    handleItemClick(index) {
      // 这里可以添加其他处理逻辑打开导航
      this.$emit("item-click", this.banner[index]);
    },
  },
};
</script>

<style scoped>
.carousel-container {
  margin: 32rpx auto 0 auto;
  position: relative;
  width: 100%;
  height: 288rpx;
  /* margin-top: 180rpx; */
}

.carousel {
  width: 100%;
  height: 100%;
  border-radius: 60rpx;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  border-radius: 60rpx;
}

.indicator {
  position: absolute;
  bottom: 30rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  margin: 0 10rpx;
  transition: all 0.3s;
}

.dot.active {
  width: 32rpx;
  background-color: #ffffff;
  border-radius: 8rpx;
}
</style>
