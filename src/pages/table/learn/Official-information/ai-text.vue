/* 官方资讯页面 
* 每日推送文字 
*/
<template>
  <view class="ai-news-page">

    <!-- 主按钮 -->
    <view class="main-btn">
      <text class="main-title">
        {{ information.title }}
      </text>
      <view class="tag-btn">{{ information.tag }}</view>
    </view>

    <!-- 信息行 -->
    <view class="meta-row">
      <view></view>
      <view>
        <text class="meta-views">{{ information.view }}浏览</text>
        <text class="meta-date">{{ happenTimeFun(information.date) }}</text>
      </view>
    </view>

    <!-- 内容框 -->
    <view class="content-box">
      <image class="content-img" :src="information.img" mode="widthFix" />
      <view class="content-text">{{ information.content }}</view>
    </view>
  </view>
</template>

<script>
import { happenTimeFun, formatFullTime } from "@/utils/time.js";
export default {
  props: {
    information:{
      type: Object,
      default:{}
    }
  },
  methods:{
    happenTimeFun,
    formatFullTime,
  },
}
	
    // return {
    //   title: 'AI早报｜我国人工智能专利申请量居全球首位；字节启动大模型顶尖人才校招计划',
    //   tag: '人工智能',
    //   img: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/图片 1@2x.png',
    //   views: 345,
    //   date: '2025年4月1日',
    //   content: [
    //     '我国人工智能专利申请量位居全球首位，4月27日，据央视新闻报道，今年以来，我国持续加强人工智能基础研究，同时突出应用导向，新技术正不断向具体应用场景纵深渗透。目前，我国已形成覆盖基础层、框架层、模型层、应用层的完整人工智能产业体系。最新数据显示，截至2025年4月9日，我国人工智能专利申请量达157.64万件，占全球申请量的38.58%，位居全球首位。',
    //     '目前，我国已累计培育400家人工智能领域国家级专精特新"小巨人"企业，占据了全球1/10的人工智能产业规模，形成了完整的人工智能产业体系。',
    //     '字节启动Top Seed大模型顶尖人才计划约2026届校招4月27日，字节跳动Seed正式启动2026届Top Seed大模型顶尖人才校招计划。',
    //     '本届Top Seed大模型顶尖人才计划主要面向2026届应届博士。本届Top Seed研究课题包括大语言模型、机器学习算法和系统、多模态生态、多模态理解、语音等方向，基本覆盖大模型研究各个领域。值得一提的是，本届Top Seed强调不限专业背景，更关注研究潜力，希望寻找有极强技术信仰与热情、具备出色研究能力、富有好奇心和驱动力的年轻研究者。',
    //     '同时，美的也在推进家电机器人化战略，将机器人和AI技术落地适配到空调、洗地机、烘焙等产品，比如说探索扫拖机器人、洗地机和机械臂跨形态的融合创新。',
    //     '4月27日，界面新闻获悉，蚂蚁集团旗下分布式数据库OceanBase发布全员信，宣布启动人才和组织体系升级：CTO杨传辉担任AI战略一号位，新设AI平台与应用部，AI引擎组，打造"DATA×AI"能力。'
    //   ]
    // }
  // }

</script>

<style scoped>
.ai-news-page {
  background: transparent;
  min-height: 100vh;
  padding-bottom: 32rpx;
}

/* 主按钮 */
.main-btn {
  position: relative;
  margin: 480rpx 1rpx 0 1rpx;
  background: linear-gradient(0deg,rgba(255, 255, 255, 1) 1%, rgba(77, 180, 232, 1) 77%);
  border-radius: 80rpx;
  padding: 20rpx 30rpx 20rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.06);
  display: flex;
  align-items: flex-end;
  min-height: 80rpx;
}
.main-title {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  flex: 1;
  line-height: 1.5;
}
.tag-btn {
  position: absolute;
  right: 32rpx;
  bottom: 15rpx;
  background: #f7b500;
  color: #fff;
  border-radius: 60rpx;
  font-size: 18rpx;
  padding: 4rpx 18rpx;
  font-weight: bold;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

/* 信息行 */
.meta-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 18rpx 32rpx 0 32rpx;
  font-size: 22rpx;
  color: black;
}
.meta-views {
  margin-right: 32rpx;
}

/* 内容框 */
.content-box {
  background: #f0f3fb;
  border-radius: 20rpx;
  margin: 24rpx 24rpx 0 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.content-img {
  width: 100%;
  border-radius: 12rpx;
  margin-bottom: 18rpx;
}
.content-text {
  color: #333;
  font-size: 26rpx;
  line-height: 1.8;
  margin-bottom: 12rpx;
  word-break: break-all;
}
</style>