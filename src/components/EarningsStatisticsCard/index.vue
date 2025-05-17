/** * Ripple_Yu * 时间区间切换栏 */
<template>
  <view class="earnings-card">
    <view class="tab-switcher">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'today' }"
        @click="switchTab('today')"
        >今日</view
      >
      <view
        class="tab-item"
        :class="{ active: currentTab === 'month' }"
        @click="switchTab('month')"
        >本月</view
      >
      <view
        class="tab-item"
        :class="{ active: currentTab === 'total' }"
        @click="switchTab('total')"
        >累计</view
      >
    </view>

    <view class="status-tabs">
      <view
        class="status-item"
        :class="{ active: currentStatus === 'income' }"
        @click="switchStatus('income')"
        >收益</view
      >
      <!-- <view class="status-item" :class="{ active: currentStatus === 'pending' }" @click="switchStatus('pending')">待结算</view>
      <view class="status-item" :class="{ active: currentStatus === 'settled' }" @click="switchStatus('settled')">已结算</view> -->
    </view>

    <view class="amount-display">{{ displayAmount }}</view>

    <view class="bottom-stats">
      <view class="stat-item">
        <view class="stat-value">{{ currentBottomStats }}</view>
        <view class="stat-label">{{ getStatLabel("promotionOrders") }}</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ currentinvitedUserStats }}</view>
        <view class="stat-label">{{ getStatLabel("newTeamMembers") }}</view>
      </view>
      <view class="stat-item">
        <view class="stat-value">{{ currentWithdrawal }}</view>
        <view class="stat-label">{{ getStatLabel("cashAmount") }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "EarningsStatisticsCard",
  props: {
    earningsData: {
      type: Object,
      default: () => ({
        today: {
          income: "11889.56",
          pending: "7.12",
          settled: "110.56",
        },
        month: {
          income: "25000.00",
          pending: "500.00",
          settled: "20000.00",
        },
        total: {
          income: "100000.00",
          pending: "1000.00",
          settled: "80000.00",
        },
      }),
    },
    commission: {
      type: Object,
      default: {},
    },
    orderStats: {
      type: Object,
      default: "",
    },
    invitedUserStats: {
      type: Object,
      default: "",
    },
    withdrawal: {
      type: Object,
      default: "",
    },
    defaultTab: {
      type: String,
      default: "today",
      validator: (value) => ["today", "month", "total"].includes(value),
    },

    defaultStatus: {
      type: String,
      default: "income",
      validator: (value) => ["income", "pending", "settled"].includes(value),
    },
  },
  data() {
    return {
      currentTab: this.defaultTab,
      currentStatus: this.defaultStatus,
    };
  },
  computed: {
    displayAmount() {
      return this.commission[this.currentTab];
    },
    currentBottomStats() {
      return this.orderStats[this.currentTab].status;
    },
    currentinvitedUserStats() {
      return this.invitedUserStats[this.currentTab];
    },
    currentWithdrawal() {
      return this.withdrawal[this.currentTab];
    },
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab;
      this.$emit("tab-change", tab);
    },
    switchStatus(status) {
      this.currentStatus = status;
      this.$emit("status-change", status);
    },
    getStatLabel(type) {
      const prefixMap = {
        today: "日",
        month: "月",
        total: "总",
      };

      const labelMap = {
        promotionOrders: "推广订单",
        newTeamMembers: "团队新增人数",
        cashAmount: "提现金额",
      };

      return prefixMap[this.currentTab] + labelMap[type];
    },
  },
};
</script>

<style lang="scss" scoped>
.earnings-card {
  width: 95%;
  margin: 25rpx auto 0 auto;
  background-color: #f9faed;
  border-radius: 16rpx;
  padding: 20rpx;
  box-sizing: border-box;

  // Tab Switcher - Light blue background with white active tab
  .tab-switcher {
    display: flex;
    justify-content: space-between;
    background-color: #d6ebf9;
    border-radius: 12rpx;
    padding: 6rpx;
    margin-bottom: 20rpx;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 10rpx 0;
      font-size: 28rpx;
      color: #333;
      border-radius: 8rpx;

      &.active {
        background-color: #ffffff;
        color: #333;
        font-weight: bold;
      }
    }
  }

  // Status Tabs
  .status-tabs {
    display: flex;
    justify-content: space-around;
    padding: 10rpx 0 20rpx;

    .status-item {
      font-size: 28rpx;
      color: #666;
      padding: 0 10rpx;
      position: relative;

      &.active {
        color: #333;
        font-weight: bold;

        &::after {
          content: "";
          position: absolute;
          bottom: -6rpx;
          left: 50%;
          transform: translateX(-50%);
          width: 30rpx;
          height: 4rpx;
          background-color: #555;
          border-radius: 2rpx;
        }
      }
    }
  }

  // Amount Display
  .amount-display {
    font-size: 64rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    padding: 20rpx 0;
  }

  // Bottom Stats
  .bottom-stats {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    padding-top: 20rpx;

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-value {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 6rpx;
      }

      .stat-label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>
