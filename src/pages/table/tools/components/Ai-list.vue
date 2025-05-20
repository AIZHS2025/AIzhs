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
          <view class="ai-card-text">
            <text class="ai-card-title">{{ item.title }}</text>
            <text class="ai-card-desc">{{ item.desc }}</text>
            <view class="ai-card-author">{{ item.author }}</view>
          </view>
          <view class="ai-card-img-wrapper">
            <!-- 骨架屏 -->
            <view v-if="!item.imgLoaded" class="skeleton-img"></view>
            <!-- 实际图片 -->
            <image 
              class="ai-card-img" 
              :class="{ 'img-loaded': item.imgLoaded }"
              :src="item.tempUrl || item.img" 
              mode="aspectFill"
              @load="onImageLoad(idx)"
            ></image>
          </view>
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
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/1.png",
				bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 187, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
				path: "/pages/tools/ai_wenan"
			},
			{
				title: "AI图片创作",
				desc: "为您轻松制作图片帮你生成智能图片",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/2.png",
				bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 146, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
				path: "/pages/tools/ai_photo"
			},
			{
				title: "AI视频生成",
				desc: "根据提供的内容生成视频",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/3.png",
				bg:  "linear-gradient(0deg,rgba(250, 250, 250, 1) 9%, rgba(242, 194, 223, 1) 45%, rgba(250, 248, 245, 1) 93%);",
				path: "/pages/tools/ai_video"
			},
			{
				title: "AI营销内容",
				desc: "专注于营销领域的内容创作",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/4.png",
				bg: " linear-gradient(0deg,rgba(255, 255, 255, 1) 4%, rgba(175, 237, 202, 1) 29%, rgba(199, 215, 235, 1) 66%, rgba(242, 242, 237, 1) 96%);",
				path: "/pages/tools/ai-marketing"
			},
			{
				title: "抖音转文字",
				desc: "将抖音视频内容转为文本",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/5.png",
				bg:  "linear-gradient(0deg,rgba(240, 240, 240, 1) 5%, rgba(242, 242, 203, 1) 56%, rgba(240, 242, 201, 1) 48%, rgba(250, 254, 255, 1) 93%);",
				path: "/pages/tools/douyin_zhuanwenzi"
			},
			{
				title: "小红书文案",
				desc: "为您轻松制作图片帮你生成智能图片",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/6.png",
				bg:  "linear-gradient(0deg,rgba(245, 245, 242, 1) 3%, rgba(237, 209, 227, 1) 30%, rgba(255, 207, 232, 1) 74%, rgba(244, 237, 241, 1) 94%);",
				path: "/pages/tools/xiaohongshu_wenan"
			},
			{
				title: "AI数字人",
				desc: "为您轻松生成文案帮你降本增效",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/7.png",
				bg:  "linear-gradient(0deg,rgba(240, 240, 240, 1) 5%, rgba(191, 245, 237, 1) 51%, rgba(199, 242, 234, 1) 48%, rgba(250, 254, 255, 1) 93%);",
				path: "/pages/tools/shuziren"
			},
			{
				title: "海报制作",
				desc: "为您轻松制作高质量海报",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/8.png",   
				bg:  "linear-gradient(0deg,rgba(240, 237, 237, 1) 4%, rgba(242, 213, 150, 1) 23%, rgba(252, 229, 207, 1) 81%, rgba(242, 235, 235, 1) 89%);",
				path: "/pages/tools/haibao"
			},
			// 所有其他的智能体类别按钮
			{
				title: "实验报告",
				desc: "轻松生成专业的实验报告",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/9.png",
				bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 187, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
				path: "/pages/tools/shiyanbaogao"
			},
			{
				title: "养生图文生成",
				desc: "根据提供的养生内容生成图文音频",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/10.png",
				bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 146, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
				path: "/pages/tools/yangsheng"
			},
			{
				title: "育儿图文生成",
				desc: "根据内容生成图文以及音频",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/11.png",
				bg: "linear-gradient(0deg,rgba(250, 250, 250, 1) 9%, rgba(242, 194, 223, 1) 45%, rgba(250, 248, 245, 1) 93%);",
				path: "/pages/tools/yuer_station"
			},
			{
				title: "古诗意境画作",
				desc: "根据口语描述生成诗词绘制图片",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/12.png",
				bg: "linear-gradient(0deg,rgba(255, 255, 255, 1) 4%, rgba(175, 237, 202, 1) 29%, rgba(199, 215, 235, 1) 66%, rgba(242, 242, 237, 1) 96%);",
				path: "/pages/tools/gushihua"
			},
			{
				title: "抖音爆款文案",
				desc: "帮助创作抖音平台热门文案",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/13.png", 
				bg: "linear-gradient(0deg,rgba(222, 222, 211, 1) 4%, rgba(248, 250, 225, 1) 30%, rgba(225, 236, 247, 1) 55%, rgba(243, 245, 208, 1) 76%, rgba(245, 244, 242, 1) 97%);",
				path: "/pages/tools/douyinbaokuanwenan"
			},
			{
				title: "小红书拆解",
				desc: "拆解小红书文本内容",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/14.png",
				bg: "linear-gradient(0deg,rgba(245, 245, 242, 1) 3%, rgba(237, 209, 227, 1) 30%, rgba(255, 207, 232, 1) 74%, rgba(244, 237, 241, 1) 94%);",
				path: "/pages/tools/redbook_chaijie"
			},
			{
				title: "小红书封面制作",
				desc: "生成小红书类型封面图",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/15.png",
				bg:  "linear-gradient(0deg,rgba(240, 240, 240, 1) 5%, rgba(191, 245, 237, 1) 51%, rgba(199, 242, 234, 1) 48%, rgba(250, 254, 255, 1) 93%);",
				path: "/pages/tools/redbook_fengmian"
			},
			{
				title: "公众号文章缩写重构",
				desc: "根据文章链接缩写重构公众号文本内容",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/16.png",
				bg:  "linear-gradient(0deg,rgba(240, 237, 237, 1) 4%, rgba(242, 213, 150, 1) 23%, rgba(252, 229, 207, 1) 81%, rgba(242, 235, 235, 1) 89%);",
				path: "/pages/tools/gzh_sxcg"
			},
			{
				title: "Markdown转换工具",
				desc: "将提供的内容转换为markdown内容",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/17.png",
				bg:  "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 187, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
				path: "/pages/tools/Markdown"
			},
			{
				title: "宠物社群运营",
				desc: "生成专注于宠物社群运营内容",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/18.png",
				bg:  "linear-gradient(0deg,rgba(250, 250, 250, 1) 8%, rgba(122, 146, 240, 1) 51%, rgba(250, 248, 245, 1) 96%);",
				path: "/pages/tools/cwsq"
			},
			{
				title: "市场调研",
				desc: "对提供的内容进行市场调研分析",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/19.png",
				bg:  "linear-gradient(0deg,rgba(250, 250, 250, 1) 9%, rgba(242, 194, 223, 1) 45%, rgba(250, 248, 245, 1) 93%);",
				path: "/pages/tools/scdy"
			},
			{
				title: "视频提取",
				desc: "提取视频内部文案",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/3.png",
				bg:  "linear-gradient(0deg,rgba(255, 255, 255, 1) 4%, rgba(175, 237, 202, 1) 29%, rgba(199, 215, 235, 1) 66%, rgba(242, 242, 237, 1) 96%);",
				path: "/pages/tools/sptq"
			},
			{
				title: "治愈系插画生成",
				desc: "根据用户提供的内容生成治愈系插画",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/4.png",
				bg:  "linear-gradient(0deg,rgba(240, 240, 240, 1) 5%, rgba(242, 242, 203, 1) 56%, rgba(240, 242, 201, 1) 48%, rgba(250, 254, 255, 1) 93%);",
				path: "/pages/tools/zhiyuxichahua"
			},
			{
				title: "人间清醒类视频",
				desc: "根据提供内容生成人间清醒类视频",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/1.png",
				bg:  "linear-gradient(0deg,rgba(245, 245, 242, 1) 3%, rgba(237, 209, 227, 1) 30%, rgba(255, 207, 232, 1) 74%, rgba(244, 237, 241, 1) 94%);",
				path: "/pages/tools/rjqx"
			},
			{
				title: "差旅助手",
				desc: "根据提供的职位｜生成时间规划",
				author: "@作者名称",
				img: "cloud://cloud1-5gszljn762dc4719.636c-cloud1-5gszljn762dc4719-1353421569/cache/ai/2.png",
				bg:  "linear-gradient(0deg,rgba(240, 240, 240, 1) 5%, rgba(191, 245, 237, 1) 51%, rgba(199, 242, 234, 1) 48%, rgba(250, 254, 255, 1) 93%);",
				path: "/pages/tools/clzs"
			},
			
      ],
    };
  },
  props:{
    searchKeyword:{
      type:String,
      default:""
    }
  },
  computed: {
    fliterList(){
      if(!this.searchKeyword)
        return this.aiList;
        const keys=this.searchKeyword.toLowerCase();
        return this.aiList.filter(item =>
          item.title.toLowerCase().includes(keys)||item.desc.toLowerCase().includes(keys)
      );
    },
    visibleTools() {
      const list=this.fliterList;
      return this.expanded ? list : list.slice(0, 8);
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
    // 图片加载完成处理
    onImageLoad(index) {
      this.$set(this.aiList[index], 'imgLoaded', true);
    },
    // 预加载图片
    async preloadImages() {
      const app = getApp();
      const preloadPromises = this.aiList.map(async (item, index) => {
        try {
          const tempUrl = await app.globalData.preloadImage(item.img, { isCloudStorage: true });
          this.$set(this.aiList[index], 'tempUrl', tempUrl);
        } catch (error) {
          console.error(`预加载图片失败: ${item.img}`, error);
        }
      });
      
      await Promise.all(preloadPromises);
    },
  },
  created() {
    // 初始化图片加载状态
    this.aiList.forEach(item => {
      this.$set(item, 'imgLoaded', false);
    });
    // 预加载图片
    this.preloadImages();
  }
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
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
  }
  .ai-card-text {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .ai-card-title,
  .ai-card-desc,
  .ai-card-author {
    width: auto;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ai-card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #6c6c6c;
    margin-bottom: 12rpx;
    display: block;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }
  .ai-card-desc {
    font-size: 24rpx;
    color: #6c6c6c;
    margin-bottom: 8rpx;
    display: block;
    opacity: 0.9;
  }
  .ai-card-author {
    font-size: 24rpx;
    color: #6c6c6c;
    opacity: 0.7;
    display: block;
  }
  .ai-card-img-wrapper {
    width: 130rpx;
    height: 130rpx;
    position: relative;
    margin-left: 12rpx;
    flex-shrink: 0;
  }

  .ai-card-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    position: relative;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    &.img-loaded {
      opacity: 1;
    }
  }

  .skeleton-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(
      90deg,
      rgba(190, 190, 190, 0.2) 25%,
      rgba(129, 129, 129, 0.24) 37%,
      rgba(190, 190, 190, 0.2) 63%
    );
    background-size: 400% 100%;
    animation: skeleton-loading 1.4s ease infinite;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
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
