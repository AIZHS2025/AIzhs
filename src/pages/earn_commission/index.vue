/** * Ripple_Yu * 分佣计划详细介绍页面 */
<template>
  <view class="earn-commission">
    <!-- 顶部导航栏 -->
    <view class="header">
      <text class="title">分佣计划</text>
    </view>

    <!-- 滚动区域 -->
    <scroll-view scroll-y class="scroll-area">
      <!-- 介绍区域 -->
      <view class="intro-section">
        <view class="intro-title">邀请好友，赚取佣金</view>
        <view class="intro-desc"
          >加入我们的分佣计划，邀请好友注册成为会员，您将获得会员费20%的佣金收益</view
        >

        <view class="stats-area">
          <view class="stats-item">
            <text class="stats-value">¥0.00</text>
            <text class="stats-label">累计收益</text>
          </view>
          <view class="stats-item">
            <text class="stats-value">0</text>
            <text class="stats-label">邀请人数</text>
          </view>
        </view>
      </view>

      <!-- 规则说明 -->
      <view class="rules-section">
        <view class="section-title">分佣规则</view>
        <view class="rule-item">
          <text class="rule-num">1</text>
          <text class="rule-text">成为VIP会员后可参与分佣计划</text>
        </view>
        <view class="rule-item">
          <text class="rule-num">2</text>
          <text class="rule-text"
            >邀请好友成为会员，您将获得会员费20%的佣金</text
          >
        </view>
        <view class="rule-item">
          <text class="rule-num">3</text>
          <text class="rule-text"
            >佣金将在好友支付成功后24小时内自动结算到您的账户</text
          >
        </view>
        <view class="rule-item">
          <text class="rule-num">4</text>
          <text class="rule-text">账户余额满100元可申请提现到微信或支付宝</text>
        </view>
      </view>
    </scroll-view>

    <!-- 固定底部按钮区域 -->
    <view class="bottom-area">
      <button class="commission-btn" @tap="openPopup">
        开通VIP会员 参与分佣计划
      </button>
    </view>

    <ConfirmPurchasePopUp :visible="showPopup" @updateVisible="handlePayment" />
  </view>
</template>

<script>
import ConfirmPurchasePopUp from "@/components/ConfirmPurchasePopUp/index.vue";

export default {
  name: "EarnCommission",
  data() {
    return {
      showPopup: false,
    };
  },
  components: {
    ConfirmPurchasePopUp,
  },
  methods: {
    openPopup() {
      this.showPopup = true;
    },
    handlePayment(val) {
      this.showPopup = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.earn-commission {
  padding: 0 20rpx 20rpx 20rpx;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #121217;

  .header {
    height: 90rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding-top: var(--status-bar-height);

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #ffffff;
      text-shadow: 0 0 10rpx rgba(0, 242, 255, 0.5);
    }
  }

  .scroll-area {
    width: 100%;
    flex: 1;
    height: 0; // 配合flex:1使用，确保正确滚动
  }

  .intro-section {
    padding: 30rpx;
    margin-bottom: 40rpx;
    background: rgba(30, 35, 50, 0.6);
    backdrop-filter: blur(5px);
    border-radius: 20rpx;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .intro-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 20rpx;
      text-align: center;
    }

    .intro-desc {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 40rpx;
      text-align: center;
    }

    .stats-area {
      display: flex;
      justify-content: space-around;
      margin-top: 30rpx;

      .stats-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .stats-value {
          font-size: 48rpx;
          font-weight: bold;
          color: #00f2ff;
          margin-bottom: 10rpx;
        }

        .stats-label {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }

  .rules-section {
    padding: 30rpx;
    background: rgba(30, 35, 50, 0.6);
    backdrop-filter: blur(5px);
    border-radius: 20rpx;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 30rpx;
      text-align: center;
    }

    .rule-item {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .rule-num {
        width: 40rpx;
        height: 40rpx;
        background: linear-gradient(135deg, #00f2ff, #0057ff);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        color: #ffffff;
        margin-right: 20rpx;
        flex-shrink: 0;
      }

      .rule-text {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
      }
    }
  }

  .bottom-area {
    height: 200rpx;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(18, 18, 23, 0.8);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);

    .commission-btn {
      width: 80%;
      height: 88rpx;
      line-height: 88rpx;
      background: linear-gradient(135deg, #0550d0, #057aff);
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
      border-radius: 44rpx;
      box-shadow: 0 5rpx 15rpx rgba(5, 122, 255, 0.4);

      &:active {
        opacity: 0.9;
        transform: scale(0.98);
      }
    }
  }
}
</style>
