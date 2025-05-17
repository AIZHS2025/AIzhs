/* 不同卡片渲染不同智能体类别 * @author: TONG * @date: 2025-04-30 */

<template>
  <view class="ai-list">
    <!-- 智能体类别按钮 -->
    <view class="ai-card-row">
      <view
        v-for="(item, idx) in visibleTools"
        :key="idx"
        class="ai-card"
        :style="{ backgroundImage: item.bg }"
        @click="navigateTo(item.path)"
      >
        <view class="ai-card-content">
          <view>
            <text class="ai-card-title">{{ item.title }}</text>
            <text class="ai-card-desc">{{ item.desc }}</text>
            <view class="ai-card-author">{{ item.author }}</view>
          </view>
          <image class="ai-card-img" :src="item.img" mode="aspectFill"></image>
        </view>
      </view>
    </view>

    <!-- 展开/收起按钮 -->
    <view class="expand-button" @click="toggleExpand">
      <text>{{ expanded ? "收起" : "查看更多" }}</text>
      <view class="expand-icon" :class="{ expanded: expanded }">
        <text>▼</text>
      </view>
    </view>

    <!-- ai定制服务 -->
    <view class="service-banner">
      <image
        src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/11.png"
        mode="aspectFit"
        class="service-icon"
      ></image>
      <text class="service-text"> AI定制服务，满足您个性化的服务需求 </text>
    </view>

    <!-- 底部工具获取提示 -->
    <view class="ai-bottom-banner ai-bottom-banner-text">
      <image
        class="ai-bottom-banner-img"
        src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/s tool.png"
        mode="aspectFit"
      ></image>
      <text>获取平台独家精选的AI工具</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      expanded: false,
      aiList: [
        {
          title: "AI文案创作",
          desc: "为您轻松生成文案帮你降本增效",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r1.png",
          bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 187, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
          path: "/pages/tools/ai_wenan",
        },
        {
          title: "AI图片创作",
          desc: "为您轻松制作图片帮你生成智能图片",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r2.png",
          bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 146, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
          path: "/pages/tools/ai_photo",
        },
        {
          title: "AI视频创作",
          desc: "为您轻松生成文案帮你降本增效",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r3.png",
          bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 9%, rgba(242, 194, 223, 1) 45%, rgba(250, 248, 245, 1) 93%);",
          path: "/pages/tools/ai_video",
        },
        {
          title: "AI自动剪辑",
          desc: "为您轻松生成文案帮你降本增效",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r4.png",
          bg: " linear-gradient(0deg,rgba(255, 255, 255, 1) 4%, rgba(175, 237, 202, 1) 29%, rgba(199, 215, 235, 1) 66%, rgba(242, 242, 237, 1) 96%);",
          path: "/pages/tools/sptq",
        },
        {
          title: "抖音爆款文案",
          desc: "为您轻松生成文案帮你降本增效",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r1.png",
          bg: "linear-gradient(0deg,rgba(240, 240, 240, 1) 5%, rgba(242, 242, 203, 1) 56%, rgba(240, 242, 201, 1) 48%, rgba(250, 254, 255, 1) 93%);",
          path: "/pages/tools/douyinbaokuanwenan",
        },
        {
          title: "小红书文案",
          desc: "为您轻松制作图片帮你生成智能图片",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r2.png",
          bg: "linear-gradient(0deg,rgba(245, 245, 242, 1) 3%, rgba(237, 209, 227, 1) 30%, rgba(255, 207, 232, 1) 74%, rgba(244, 237, 241, 1) 94%);",
          path: "/pages/tools/xiaohongshu_wenan",
        },
        {
          title: "AI数字人",
          desc: "为您轻松生成文案帮你降本增效",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r3.png",
          bg: "linear-gradient(0deg,rgba(240, 240, 240, 1) 5%, rgba(191, 245, 237, 1) 51%, rgba(199, 242, 234, 1) 48%, rgba(250, 254, 255, 1) 93%);",
          path: "/pages/tools/shuziren",
        },
        {
          title: "海报制作",
          desc: "为您轻松制作高质量海报",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r4.png",
          bg: "linear-gradient(0deg,rgba(240, 237, 237, 1) 4%, rgba(242, 213, 150, 1) 23%, rgba(252, 229, 207, 1) 81%, rgba(242, 235, 235, 1) 89%);",
          path: "/pages/tools/haibao",
        },
        // 所有其他的智能体类别按钮
        {
          title: "视频提取",
          desc: "轻松生成专业的实验报告",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r1.png",
          bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 187, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
          path: "/pages/tools/shiyanbaogao",
        },
        {
          title: "养生指南",
          desc: "专业的养生知识与建议",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r2.png",
          bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 146, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
          path: "/pages/tools/yangsheng",
        },
        {
          title: "育儿百科",
          desc: "专业的育儿知识指导",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r3.png",
          bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 9%, rgba(242, 194, 223, 1) 45%, rgba(250, 248, 245, 1) 93%);",
          path: "/pages/tools/yuer_station",
        },
        {
          title: "AI营销助手",
          desc: "智能营销方案生成",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r4.png",
          bg: "linear-gradient(0deg,rgba(255, 255, 255, 1) 4%, rgba(175, 237, 202, 1) 29%, rgba(199, 215, 235, 1) 66%, rgba(242, 242, 237, 1) 96%);",
          path: "/pages/tools/ai-marketing",
        },
        {
          title: "古诗创作",
          desc: "智能生成古诗词作品",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r1.png",
          bg: "linear-gradient(0deg,rgba(222, 222, 211, 1) 4%, rgba(248, 250, 225, 1) 30%, rgba(225, 236, 247, 1) 55%, rgba(243, 245, 208, 1) 76%, rgba(245, 244, 242, 1) 97%);",
          path: "/pages/tools/gushihua",
        },
        {
          title: "Markdown",
          desc: "专业文档编辑工具",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r2.png",
          bg: "linear-gradient(0deg,rgba(245, 245, 242, 1) 3%, rgba(237, 209, 227, 1) 30%, rgba(255, 207, 232, 1) 74%, rgba(244, 237, 241, 1) 94%);",
          path: "/pages/tools/Markdown",
        },
        {
          title: "AI数字人",
          desc: "为您轻松生成文案帮你降本增效",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r3.png",
          bg: "linear-gradient(0deg,rgba(240, 240, 240, 1) 5%, rgba(191, 245, 237, 1) 51%, rgba(199, 242, 234, 1) 48%, rgba(250, 254, 255, 1) 93%);",
          path: "/pages/tools/shuziren",
        },
        {
          title: "海报制作",
          desc: "为您轻松制作高质量海报",
          author: "@作者名称",
          img: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/r4.png",
          bg: "linear-gradient(0deg,rgba(240, 237, 237, 1) 4%, rgba(242, 213, 150, 1) 23%, rgba(252, 229, 207, 1) 81%, rgba(242, 235, 235, 1) 89%);",
          path: "/pages/tools/haibao",
        },
      ],
    };
  },
  computed: {
    visibleTools() {
      return this.expanded ? this.aiList : this.aiList.slice(0, 8);
    },
  },
  methods: {
    navigateTo(path) {
      if (!path) {
        uni.showToast({
          title: "功能开发中",
          icon: "none",
        });
        return;
      }

      uni.navigateTo({
        url: path,
        fail: (err) => {
          console.error("导航失败:", err);
          uni.showToast({
            title: "导航失败",
            icon: "none",
          });
        },
      });
    },
    toggleExpand() {
      this.expanded = !this.expanded;
    },
  },
};
</script>

<style lang="scss" scoped>
.ai-list {
  .ai-card-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 32rpx 0;
  }
  .ai-card {
    width: 48%;
    // margin-bottom: 32rpx;
    border-radius: 32rpx;
    padding: 19rpx 2rpx 18rpx 30rpx;
    box-sizing: border-box;
    position: relative;
    min-height: 180rpx;
    display: flex;
    align-items: flex-end;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  }
  .ai-card-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .ai-card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #068ce3;
    margin-bottom: 12rpx;
    display: block;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
  .ai-card-desc {
    font-size: 24rpx;
    color: #068ce3;
    margin-bottom: 8rpx;
    display: block;
    opacity: 0.9;
  }
  .ai-card-author {
    font-size: 24rpx;
    color: #068ce3;
    opacity: 0.7;
    display: block;
  }
  .ai-card-img {
    width: 160rpx;
    height: 100rpx;
    border-radius: 50%;
    object-fit: cover;
    margin-left: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }

  /* 展开/收起按钮样式 */
  .expand-button {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20rpx 0;
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #1684fc;
    position: relative;
  }

  .expand-icon {
    margin-left: 10rpx;
    transition: transform 0.3s ease;
  }

  .expand-icon.expanded {
    transform: rotate(180deg);
  }

  // ai 定制服务
  .service-banner {
    margin: 30rpx 2rpx;
    background: white;
    border-radius: 40rpx;
    padding: 13rpx 2rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);

    .service-icon {
      width: 130rpx;
      height: 100rpx;
      margin-right: 2rpx;
    }

    .service-text {
      font-size: 32rpx;
      color: #3dceefc5;
      font-family: "Roboto";
      font-weight: 700;
    }
  }

  // 底部工具获取提示

  .special-tools {
    margin: 0 20rpx;
  }

  .special-row {
    display: flex;
    gap: 20rpx;
    margin-bottom: 20rpx;

    .special-item {
      flex: 1;
      background: linear-gradient(
        179deg,
        rgba(184, 225, 255, 1) 0%,
        #ffffff 100%
      );
      border-radius: 40rpx;
      padding: 20rpx 30rpx;
      display: flex;
      flex-direction: row;
      align-items: center;

      .special-icon {
        width: 85rpx;
        height: 80rpx;
        margin-right: 15rpx;
      }

      .special-text-container {
        display: flex;
        flex-direction: column;
      }

      .special-name {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 5rpx;
        font-weight: 500;
      }

      .special-desc {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  // 获取ai工具
  .ai-bottom-banner {
    display: flex;
    align-items: center;
    margin: 40rpx 0 0 0;
    padding: 0 20rpx;
  }

  .ai-bottom-banner-img {
    width: 180rpx;
    height: 110rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  .ai-bottom-banner-text {
    position: relative;
    background: #b6c8f7;
    border-radius: 24rpx;
    padding: 18rpx 48rpx 18rpx 32rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    min-width: 420rpx;
    letter-spacing: 2rpx;
  }
}
</style>
