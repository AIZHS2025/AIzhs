<!-- 标题 -->
<template>
  <view class="carousel-container" style="padding: 20rpx 0">
    <view style="height: 60rpx; display: flex; align-items: center">
      <image
        style="width: 60rpx; height: 60rpx"
        :src="center.images || defaultImg"
        class="carousel-image"
      />
      <text
        style="
          color: black;
          font-size: 28rpx;
          font-weight: bold;
          margin-left: 20rpx;
        "
        >{{ center.name }}</text
      >
    </view>
  </view>
</template>

<script>
export default {
  name: "MoreTitles",
  props: {
    center: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      defaultImg: "https://yourdomain.com/default.jpg",
    };
  },
  methods: {
    MoreClick() {
      this.$emit("pack");
    },
  },
};
</script>

<style scoped>
.carousel-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.carousel-image {
  width: 100px;
  height: 100px;
}
.carousel-title {
  margin-left: 10px;
}
.arrow {
  margin-left: auto;
}
</style>
