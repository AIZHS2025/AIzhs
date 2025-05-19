<template>
  <view class="main-container" style="color: white">
    <!-- 引入 顶部导航栏 -->
    <navigation-bars
      color="black"
      viscosity="true"
      title="智汇社AI助手集"
      :backgroundColor="color"
      @pack="onPackClick"
    />

    <!-- <view class=" container" style="color:white"> -->
    <!-- 引入弹窗组件 -->
    <interest-track-modal
      :visible="showModal"
      :interest-tracks="interestTracks"
      @close="closeModal"
      @confirm="navigateToInterestPage"
      :backgroundColor="color"
    ></interest-track-modal>

    <!-- 引入 智能助手组件 -->
    <intelligent-assistant></intelligent-assistant>

    <!-- 引入 搜索框组件 -->
    <search-box @input="onInput" @search="onSearch"></search-box>

    <!-- 引入 滑动卡片组件 -->
    <!-- <slide-card @change="onTagChange"></slide-card> -->

    <!-- 一键生成运营内容模块 -->
    <view class="tools-section">
      <view class="row first-row">
        <view class="item large-item" @click="navigateTo('/pages/tools/')">
          <view class="item-image-container">
            <image
              src="cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/14.png"
              mode="aspectFill"
              style="width: 100%; height: 100%"
            ></image>
          </view>
          <view
            style="display: flex; flex-direction: column; margin-left: 30rpx"
          >
            <text class="item-title">一键生成运营内容</text>
            <text class="item-description">文➡图➡视频➡输出一站式服务</text>
            <text class="item-author">@AI | 呼呼呼呼</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 引入 卡片下智能体类别组件 -->
    <view style="padding: 0rpx 20rpx 30rpx 20rpx">
      <ai-list :search-keyword="searchKeyword"></ai-list>
    </view>
  </view>
</template>

<script>
// 引入外部组件
import InterestTrackModal from "./components/Interest-track-modal.vue";
import IntelligentAssistant from "./components/Intelligent-assistant.vue";
import NavigationBars from "@/components/navigation-bars/index.vue";
import SearchBox from "./components/Search-box.vue";
import SlideCard from "./components/Slide-card.vue";
import AiList from "./components/Ai-list.vue";

export default {
  components: {
    // InterestTrackModal,
    IntelligentAssistant,
    NavigationBars,
    SlideCard,
    SearchBox,
    AiList,
  },

  data() {
    return {
      index: 1,
      color: "",
      showModal: true,
      currentBanner: 0,
      searchKeyword:"",
      // 兴趣赛道对应的页面路径
      interestPagePath: "/pages/table/index/interest",

      // 兴趣赛道
      interestTracks: [
        ["人工智能", "电商", "短视频与直播"],
        ["元宇宙", "智能汽车", "互联网医疗"],
        ["在线教育", "社交", "互联网金融"],
        ["物流与供应链", "智能家居", "企业服务"],
        ["游戏", "环保与新能源", "文化创意"],
        ["数字娱乐", "虚拟现实", "区块链"],
      ],
    };
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
    this.color = e.scrollTop > 20 ? "white" : "transparent";
  },
  methods: {
    // AI搜索框 处理输入、搜索、跳转逻辑
    onInput(value) {
      console.log("Input value:", value);
      this.searchKeyword=value;
    },
    onSearch(value) {
      console.log("Search value:", value);
      this.searchKeyword=value;
    },
    onNavigate(value) {
      console.log("Navigate value:", value);
    },

    // 智能体跳转页面
    navigateTo(path) {
      uni.navigateTo({
        url: path,
        success: () => {
          console.log("跳转成功:", path);
        },
        fail: (err) => {
          console.error("跳转失败:", err);
          uni.showToast({
            title: "页面跳转失败",
            icon: "none",
            duration: 2000,
          });
        },
      });
    },

    // 关闭弹窗
    closeModal() {
      this.showModal = false;
    },
    // 滑动卡片 处理标签切换逻辑
    onTagChange(tag) {
      console.log("Selected tag:", tag);
    },

    // 点击兴趣赛道
    navigateToInterestPage(track) {
      uni.navigateTo({
        url: this.interestPagePath,
        // url: this.interestPagePath + '?track=' + encodeURIComponent(track)
        success: () => {
          this.showModal = false; // 跳转成功后关闭弹窗
        },
        fail: (err) => {
          console.error("跳转失败:", err);
          uni.showToast({
            title: "页面跳转失败",
            icon: "none",
          });
        },
      });
    },
    onSwiperChange(e) {
      this.currentBanner = e.detail.current;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./styles/index.scss";
</style>
