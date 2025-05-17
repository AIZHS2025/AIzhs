<template>
  <view class="commission-container">
    <!-- 佣金总额 -->
    <view class="commission-total">
      <view class="total-amount">
        <text class="label">累积佣金(元)</text>
        <text class="amount">{{ total_earnings }}</text>
      </view>
      <view class="today-amount">
        <text class="label">今日佣金</text>
        <text class="amount">{{ today_commission }}元</text>
      </view>
    </view>

    <!-- 提现信息 -->
    <view class="withdraw-info">
      <text class="available">可提现佣金 {{ balance }}元</text>
      <view class="withdraw-buttons">
        <button class="detail-btn" @click="handleDetail">提现明细</button>
        <!-- 提现 -->
        <button class="withdraw-btn" @click="handleWithdraw">提现</button>
      </view>
    </view>

    <!-- 佣金明细选项卡 -->
    <!-- <view class="tabs">
      <text class="tab">佣金明细</text>
      <text class="tab active">全部</text>
      <text class="tab">待结算</text>
      <text class="tab">已结算</text>
      <text class="tab">取消结算</text>
      <image
        class="status-icon"
        src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/yongjin/icon1.png"
      />
    </view> -->

    <!-- 佣金明细选项卡 -->
    <view class="tabs-container">
      <view class="tabs">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          style="text-align: center"
          class="tab"
          :class="{ active: index === activeTabIndex }"
          @click="switchTab(index)"
        >
          {{ tab.name }}
          <!-- <image :src="tab.icon" class="status-icon" /> -->
        </view>
      </view>
      <!-- <view class="tab-content">
        <view
          v-for="(tab, index) in tabs"
          :key="index"
          v-show="index == activeTabIndex"
        >
          {{ tab.content }}
        </view>
      </view> -->
    </view>

    <!-- 佣金明细列表 -->
    <view class="commission-list">
      <view class="list-item" v-for="item in lists" :key="item.id">
        <view class="item-left">
          <text class="status pending"
            ><text>佣金</text><text style="margin-left: 20rpx">待结算</text>
            <text style="position: obsolute; margin-left: 370rpx"
              >¥{{ item.amount }}</text
            >
          </text>
          <text class="order-user">下单人：{{ item.buyer_nickname }}</text>
          <text class="order-id">下单时间:{{ happenTimeFun(item.time) }}</text>
          <text class="order-id">关联订单：{{ item.out_trade_no }}</text>
        </view>
        <button class="copy-btn" @click="copyOrderId(item.order_id)">
          复制
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { happenTimeFun, formatFullTime } from "@/utils/time.js";
export default {
  props: {
    today_commission: {
      type: Number,
      default: "",
    },
    total_earnings: {
      type: Number,
      default: "",
    },
    balance: {
      type: Number,
      default: "",
    },
    lists: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      isShow: true,
      activeTabIndex: 0,
      center: [
        {
          id: 1,
          price: 6470.68,
          name: "王丽丽",
          order: "Y1241022141153950429dd",
        },
        {
          id: 2,
          price: 6470.68,
          name: "王丽丽",
          order: "Y1241022141153950429ss",
        },
        {
          id: 3,
          price: 6470.68,
          name: "王丽丽",
          order: "Y1241022141153950429tt",
        },
        {
          id: 4,
          price: 6470.68,
          name: "王丽丽",
          order: "Y12410221411539504291sds",
        },
        {
          id: 5,
          price: 6470.68,
          name: "王丽丽",
          order: "Y1241022141153950429sq",
        },
      ],
      tabs: [
        { name: "全部", content: "佣金明细", active: true },
        // { name: "全部", content: "全部", active: true },
        { name: "待结算", content: "待结算", active: true },
        { name: "已结算", content: "已结算", active: true },
        {
          name: "取消结算",
          icon: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/yongjin/icon1.png",
          content: "取消结算",
          active: true,
        },

        // icon: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/yongjin/icon1.png",
      ],
      activeTab: 0, //当前激活的选项卡索引
    };
  },
  methods: {
    happenTimeFun,
    formatFullTime,
    handleWithdraw() {
      // 处理提现逻辑
      uni.showToast({
        title: "提现申请已提交",
        icon: "success",
      });
    },
    handleDetail() {
      // 处理查看明细逻辑
      uni.navigateTo({
        url: "/pages/income/withdraw/index",
      });
    },
    copyOrderId(orderId) {
      // 复制订单号
      uni.setClipboardData({
        data: String(orderId),
        success: () => {
          uni.showToast({ title: "已复制订单号" });
        },
        fail: (err) => {
          console.error("复制失败:", err);
        },
      });
    },
    switchTab(index) {
      this.activeTabIndex = index;
      //可选:重置所有选项卡状态,并设置当前选项卡为激活状态
      this.tabs.forEach((tab, i) => {
        tab.active = i === index;
      });
    },
  },
};
</script>

<style>
.commission-container {
  /* background-color: #f5f5f5; */
  height: 100%;
  /* min-height: 100vh; */
  padding: 20rpx 20rpx 40rpx 20rpx;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.time {
  font-size: 28rpx;
  color: #333;
}

.status-icons {
  display: flex;
  gap: 15rpx;
}

.status-icon {
  width: 30rpx;
  height: 30rpx;
  margin-left: 10rpx;
  margin-top: -10rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin: 30rpx 0;
}

.commission-total {
  background: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/yongjin/juxing5@2x.png");
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
}

.total-amount .label {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.total-amount .amount {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.today-amount {
  text-align: right;
}

.today-amount .label {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.today-amount .amount {
  font-size: 32rpx;
  color: #333;
}

.withdraw-info {
  background: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/yongjin/yellow.png");
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.available {
  font-size: 28rpx;
  color: #333;
}

.withdraw-buttons {
  display: flex;
  gap: 20rpx;
}

.detail-btn {
  background-color: #eee;
  color: #333;
  font-size: 28rpx;
  padding: 0 30rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  border: none;
}

.withdraw-btn {
  background-color: #ff9900;
  color: #101010;
  font-size: 28rpx;
  padding: 0 30rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  border: none;
}

.commission-summary {
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  background: linear-gradient(180deg, #f9fbff 0%, #bfd9ff 100%);
}

.withdrawn,
.pending {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.tabs {
  display: flex;
  justify-content: space-between;
  background: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/yongjin/juxing5Copy2@2x.png");
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.tab {
  width: 25%;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
}

.tab.active {
  text-align: center;
  color: #fff;
  color: #2979ff;
  border-radius: 16rpx;
}

.commission-list {
  /* background-color: #fff; */
  border-radius: 16rpx;
  /* padding: 30rpx 30rpx 0 30rpx; */
  padding: 10rpx 0 0 0;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.total-summary {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  background: linear-gradient(180deg, #f9fbff 4%, #bfd9ff 65%, #9cc4ff 100%);
}

.item-left {
  flex: 1;
}

.status {
  font-size: 28rpx;
  margin-bottom: 10rpx;
  display: block;
}

.status.pending {
  color: #ff9900;
}

.status.completed {
  color: #19be6b;
}

.status.canceled {
  color: #ed3f14;
}

.order-user,
.order-id {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 5rpx;
}

.copy-btn {
  background-color: #f5f5f5;
  color: #333;
  font-size: 24rpx;
  padding: 0 20rpx;
  height: 50rpx;
  line-height: 50rpx;
  border-radius: 25rpx;
  border: none;
  position: absolute;
  margin-top: 125rpx;
  margin-left: 410rpx;
}
.status-icon {
  height: 45rpx;
  width: 45rpx;
  margin-right: 10rpx;
}
</style>
