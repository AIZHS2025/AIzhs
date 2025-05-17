<template>
  <view class="main-container">
    <view class="search-bar">
      <img
        :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/coursePlanet/ss.png'"
        alt="aspectFill"
        style="width: 40rpx; height: 40rpx; margin-left: 20rpx"
      />
      <input
        style="height: 100%; width: 100%; color: black"
        placeholder="搜索我的分销订单，订单号或名称"
      />
    </view>

    <view class="tab-container">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </view>
      <view class="tab-indicator" :style="indicatorStyle"></view>
    </view>

    <view class="order-list">
      <!-- 订单列表 -->
      <template v-if="filteredOrders.length > 0">
        <view
          class="order-item"
          v-for="(order, index) in filteredOrders"
          :key="index"
        >
          <view class="order-header">
            <text class="order-number"
              >关联订单号：{{ order.orderNumber }}</text
            >
            <view class="order-status" :class="'status-' + order.status">
              {{ statusText(order.status) }}
            </view>
          </view>
          <view class="order-user">
            <text>买家用户：{{ order.userName }}</text>
          </view>
          <view class="order-product">
            <image
              class="product-image"
              :src="order.productImage"
              mode="aspectFill"
            />
            <view class="product-info">
              <text class="product-name">{{ order.productName }}</text>
              <view class="product-date">{{ order.orderDate }}</view>
            </view>
            <view class="product-price">￥{{ order.price }}</view>
          </view>
          <view class="order-footer">
            <text class="order-commission"
              >本单佣金 ￥{{ order.commission }}</text
            >
            <button
              v-if="order.status === 'pending'"
              class="pay-pending-button pay-button"
            >
              待付款
            </button>
            <button
              v-if="order.status === 'settled'"
              class="pay-settled-button pay-button"
            >
              待收货
            </button>
            <button
              v-if="order.status === 'canceled'"
              class="pay-canceled-button pay-button"
            >
              已完成
            </button>
          </view>
        </view>
      </template>

      <view v-else class="empty-state">
        <text>暂无订单数据</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInviteeOrderStats } from "@/service/trader.js";
export default {
  data() {
    return {
      currentTab: "all",
      tabs: [
        {
          label: "全部",
          value: "all",
        },
        {
          label: "待结算",
          value: "pending",
        },
        {
          label: "已结算",
          value: "settled",
        },
        {
          label: "取消结算",
          value: "canceled",
        },
      ],
      orders: [
        {
          orderNumber: "YI24102118390763981",
          userName: "子柳朝",
          productName: "AI视频创作软件，即梦AI",
          productImage:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/ai-video.png",
          orderDate: "2025-10-21 18:32",
          price: "995.00",
          commission: "4.80",
          status: "pending",
        },
        {
          orderNumber: "YI24102118390763981",
          userName: "子柳朝",
          productName: "AI视频创作软件，即梦AI",
          productImage:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/ai-video.png",
          orderDate: "2025-10-21 18:32",
          price: "995.00",
          commission: "4.80",
          status: "settled",
        },
        {
          orderNumber: "YI24102118390763981",
          userName: "子柳朝",
          productName: "AI视频创作软件，即梦AI",
          productImage:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/ai-video.png",
          orderDate: "2025-10-21 18:32",
          price: "995.00",
          commission: "4.80",
          status: "canceled",
        },
        {
          orderNumber: "YI24102118390763981",
          userName: "子柳朝",
          productName: "AI视频创作软件，即梦AI",
          productImage:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/ai-video.png",
          orderDate: "2025-10-21 18:32",
          price: "995.00",
          commission: "4.80",
          status: "pending",
        },
        {
          orderNumber: "YI24102118390763981",
          userName: "子柳朝",
          productName: "AI视频创作软件，即梦AI",
          productImage:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/ai-video.png",
          orderDate: "2025-10-21 18:32",
          price: "995.00",
          commission: "4.80",
          status: "settled",
        },
        {
          orderNumber: "YI24102118390763981",
          userName: "子柳朝",
          productName: "AI视频创作软件，即梦AI",
          productImage:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/ai-video.png",
          orderDate: "2025-10-21 18:32",
          price: "995.00",
          commission: "4.80",
          status: "canceled",
        },
      ],
    };
  },
  computed: {
    indicatorStyle() {
      const index = this.tabs.findIndex((tab) => tab.value === this.currentTab);
      const width = 100 / this.tabs.length;
      return {
        width: width + "%",
        transform: `translateX(${index * 100}%)`,
      };
    },
    filteredOrders() {
      if (this.currentTab === "all") {
        return this.orders;
      }
      return this.orders.filter((order) => order.status === this.currentTab);
    },
  },
  onMounted() {},
  methods: {
    switchTab(tabValue) {
      this.currentTab = tabValue;
    },
    statusText(status) {
      const statusMap = {
        pending: "待结算",
        settled: "已结算",
        canceled: "取消结算",
      };
      return statusMap[status] || "未知状态";
    },
    statusClass(status) {
      return `status-${status}`;
    },
    list() {
      getUserInviteeOrderStats().then((res) => {
        this.orders = res.data;
        console.log("获取列表数据");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.main-container {
  width: 100vw;
  // height: calc(100vh - 85rpx);
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #fff;
  background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/矩形 2@2x.png");
  background-size: 100% 100%;
}

.search-bar {
  width: 95%;
  height: 60rpx;
  border-radius: 40rpx;
  background: #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx auto;
}

.tab-container {
  display: flex;
  width: 95%;
  border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  background-color: #f6f6f6;
  height: 80rpx;
  margin: 20rpx auto;
  font-weight: bolder;
}

.tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 28rpx;
  color: #666;
  position: relative;
  z-index: 1;
  color: #93d2f3;
}

.tab-item.active {
  color: #fff;
  font-weight: bold;
  background-color: #93d2f3;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 80rpx;
  background-color: #93d2f3;
  border-radius: 0;
  transition: transform 0.3s ease;
  z-index: 0;
}

.order-list {
  //height: calc(100vh - 85rpx - 230rpx);
  height: calc(100vh - 200rpx);
  flex: 1;
  overflow-y: auto;
  padding: 0 20rpx;
}

.order-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.order-number {
  font-size: 24rpx;
  color: #666;
}

.order-status {
  font-size: 24rpx;
}

.status-pending {
  color: #3b7cf6;
}

.status-settled {
  color: #52c41a;
}

.status-canceled {
  color: #ff4d4f;
}

.order-user {
  font-size: 26rpx;
  margin-bottom: 16rpx;
  color: #333;
}

.order-product {
  display: flex;
  margin-bottom: 16rpx;
}

.product-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 28rpx;
  color: #333;
}

.product-date {
  font-size: 24rpx;
  color: #999;
}

.product-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  align-self: center;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 16rpx;
}

.order-commission {
  font-size: 26rpx;
  color: #ff6d6d;
}

.pay-button {
  font-size: 24rpx;
  color: #fff;
  border: 1px solid #ddd;
  border-radius: 30rpx;
  margin-right: 1rpx;
  // padding: 6rpx;
}

.pay-canceled-button {
  background-color: #4ea153;
}

.pay-settled-button {
  background-color: #ffaa36;
}

.pay-pending-button {
  background-color: #a4adb3;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  color: #999;
}
</style>
