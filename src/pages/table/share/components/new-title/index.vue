<!-- 标题 -->
<template>
  <view>
    <!-- 新闻 -->
    <view class="news">
      <view>
        <image
          style="width: 100%; height: 240rpx; border-radius: 20rpx"
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/carousel4-footer1/carousel1.jpg"
          mode="scaleToFill"
        />
      </view>
      <view class="news-title">爆炸性新闻,deepseek再次创新新AI万向!</view>
      <view
        class="new-center"
        v-for="_ in centerTitle"
        :key="_.id"
        @click="newclick(_)"
      >
        <view
          style="
            width: 20rpx;
            height: 20rpx;
            background-color: #9f9f9f;
            border-radius: 50%;
          "
        ></view>
        <text style="margin-left: 20rpx; color: black">{{ _.title }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "NewTitle",
  props: {
    centerTitle: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {};
  },
  methods: {
    newclick(item) {
      this.$emit("new", item);
    },
  },
};
</script>

<style scoped>
.news {
  padding: 20rpx 30rpx 0rpx 30rpx;
  border-radius: 30rpx;
  border: 1rpx solid #9f9f9f;
}
.news-title {
  font-size: 32rpx;
  height: 60rpx;
  line-height: 60rpx;
  margin-top: 20rpx;
  color: black;
  font-weight: bold;
}
.new-center {
  display: flex;
  align-items: center;
  height: 60rpx;
  line-height: 60rpx;
  border-top: 1rpx solid #9f9f9f;
}
</style>
