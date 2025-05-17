/* 智能助手小智 通用组件 * @author: TONG * @date: 2025-04-28 */

<template>
  <view class="intelligent-assistant">
    <!-- 悬浮装饰图片（机器人） -->
    <image
      class="floating-decoration"
      src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/2511745914218_.pic_hd.jpg"
      mode="aspectFit"
    ></image>

    <view class="welcome-card">
      <view class="welcome-content">
        <view class="welcome-message">
          <text class="welcome-intro">Hi, 我是您的智能助手小智</text>
          <text class="welcome-action font-size-30"
            >下方选择您所需要的智能体</text
          >
        </view>
      </view>
      <view class="limit-info">
        <view class="limit-content">
          <view class="limit-text">
            <text>当前还可免费使用{{ freeTimes }}次</text>
            <text>您的钱包余额: {{ walletBalance }}</text>
            <text>次数或余额用完请充值token值</text>
          </view>
          <view class="recharge-action">
            <view class="token-button">
              <image
                @click="topupClick"
                src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/token.png"
                mode="widthFix"
                class="token-button-image"
              ></image>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getTokenCount } from "@/service/pay.js";
import { payToken } from "@/utils/token/index.js";

export default {
  name: "IntelligentAssistant",
  data() {
    return {
        freeTimes: 1,
        walletBalance: 999,
    };
  },
  mounted() {
     // 获取最新的token余额
      this.user = uni.getStorageSync("data");

      this.$nextTick(() => {
          this.fetchTokenBalance(this.id);
    });
  },

  methods: {
    topupClick() {
      uni.navigateTo({
        url: "/pages/top-up/index",
      });
    },
   // 获取Token余额
   fetchTokenBalance(id) {
      getTokenCount(id)
        .then((res) => {
          if (res.code === 200) {
            // 更新显示的token余额
            this.walletBalance = res.data;
            console.log("Token API response:", res);
          } else {
            console.log("获取Token信息失败:", res);
          }
        })
        .catch((err) => {
          console.error("获取Token信息失败:", err);
        });
    },

  },
};
</script>

<style lang="scss" scoped>
.intelligent-assistant {
  position: relative;
  width: 100%;
}

/* 悬浮装饰图片 */
.floating-decoration {
  position: absolute;
  top: -30rpx;
  right: 5rpx;
  width: 290rpx;
  height: 250rpx;
  z-index: 10;
  animation: float 1s ease-in-out infinite;
  opacity: 0.85;
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15rpx);
  }
  100% {
    transform: translateY(0);
  }
}

/* 欢迎卡片 */
.welcome-card {
  margin: 30rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/token-backg.png");
  background-size: cover;
  background-position: center;
  position: relative;

  .welcome-content {
    display: flex;
    margin-bottom: 20rpx;
  }

  .welcome-message {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 10rpx;
    background-size: cover;
    background-position: center;

    .welcome-intro {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 8rpx;
    }

    .welcome-action {
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .limit-info {
    display: flex;
    flex-direction: row;
    border-top: 1px solid #f0f0f0;
    padding-top: 20rpx;
    align-items: center;
  }

  .welcome-avatar {
    width: 100rpx;
    height: 120rpx;
    margin-right: 5rpx;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .limit-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .limit-text {
    display: flex;
    flex-direction: column;
    font-size: 28rpx;
    color: #69c0ff;
    margin-bottom: -45rpx;

    text {
      margin-bottom: 5rpx;
    }
  }

  .recharge-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 28rpx;
    color: #000000;

    .token-button {
      color: white;
      padding: 4rpx 10rpx;
      border-radius: 30rpx;
      font-size: 25rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-left: 450rpx;

      .token-button-image {
        width: 155rpx;
        height: 40rpx;
        margin-right: -5rpx;
      }
    }
  }
}
</style>
