<template>
  <view class="type">
    <!-- 头部 -->
    <view class="header" :style="{ height: topBarHeight }">
      <navigation-bars
        title="AI图片创作助手"
        style="width: 100%"
        @pack="onback"
        image="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/返回.png"
      />
    </view>

    <!-- 中间滚动内容 -->
    <!-- 引入外部 智能助手小智 -->
    <view style="padding: 0 20rpx">
      <intelligent-assistant></intelligent-assistant>
    </view>
    <scroll-view class="content" scroll-y="true">
      <view class="inner-content">
        <slot name="center"></slot>
      </view>
    </scroll-view>

    <!-- 底部 -->
    <view class="footer">
      <slot name="button"></slot>
    </view>
  </view>
</template>

<script>
import NavigationBars from "@/components/navigation-bars/index.vue";
import IntelligentAssistant from "@/pages/table/tools/components/Intelligent-assistant.vue";
export default {
  components: {
    NavigationBars,
    IntelligentAssistant,
  },
  name: "AiTemplate",
  methods: {
    onback() {
      this.$emit("pack");
    },
  },
  computed: {
    topBarHeight() {
      return this.$styleVariables["--app-top-bar-height"];
    },
  },
};
</script>

<style lang="scss" scoped>
.type {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/背景和logo.png");
}
.header {
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content {
  flex: 1;
  overflow-y: auto;
}
.inner-content {
  padding: 20rpx;
}
.item {
  margin-bottom: 10rpx;
  padding: 10rpx;
}
.footer {
  height: 160rpx;
  padding-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
