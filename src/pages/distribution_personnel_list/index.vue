<template>
  <view class="main-container">
    <view
      style="
        width: 95%;
        height: 60rpx;
        border-radius: 40rpx;
        background: #e8e8e8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 20rpx auto;
      "
    >
      <img
        src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/coursePlanet/ss.png"
        alt="aspectFill"
        style="width: 40rpx; height: 40rpx; margin-left: 20rpx"
      />
      <input
        style="height: 100%; width: 100%; color: black"
        placeholder="搜索我的团友"
        v-model="searchKeyword"
        @input="handleSearch"
      />
    </view>

    <view class="sort-tabs">
      <view
        class="tab-item"
        :class="{ active: activeTab === '成交订单数' }"
        @click="switchTab('成交订单数')"
        >成交订单数</view
      >
      <view
        class="tab-item"
        :class="{ active: activeTab === '最近下单时间' }"
        @click="switchTab('最近下单时间')"
        >最近下单时间</view
      >
    </view>

    <view class="user-list">
      <view class="no-result" v-if="filteredTeamList.length === 0">
        <image
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/empty.png"
          mode="aspectFit"
        ></image>
        <text>没有找到相关用户</text>
      </view>

      <view
        class="user-card"
        v-for="(member, index) in filteredTeamList"
        :key="member.id"
      >
        <view class="user-rank">
          <!-- 前三名显示奖牌，其他显示数字 -->
          <view
            class="medal"
            :class="'medal-' + index"
            v-if="index <= 2"
          ></view>
          <text class="rank-number" v-else>{{ member.rank }}</text>
        </view>
        <view class="user-avatar">
          <image
            :src="member.avatar"
            mode="aspectFill"
            v-if="member.avatar"
          ></image>
          <image
            v-else
            src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/act.png"
            mode="aspectFill"
          ></image>
        </view>

        <view class="user-info">
          <view class="user-name-row">
            <text class="user-name">{{ member.nickname }}</text>
            <view class="vip-tag">{{ member.vipLevel }}</view>
          </view>
          <view class="transaction-row">
            <text class="transaction-label">成交额：</text>
            <text class="transaction-value">{{ member.total_amount }}</text>
            <text class="transaction-label margin-left">获取佣金：</text>
            <text class="transaction-value">{{ member.total_earnings }}</text>
          </view>
          <view class="order-row">
            <text class="transaction-label">成交订单数：</text>
            <text class="transaction-value">{{ member.order_count }}</text>
          </view>
          <view class="time-row">
            <text class="transaction-label">最近下单时间：</text>
            <text class="time-value">{{
              happenTimeFun(member.latest_time)
            }}</text>
            <view class="contact-btn" @click="contactMember(member.id)"
              >联系</view
            >
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInviteeOrderStats } from "@/service/trader.js";
import { happenTimeFun, formatFullTime } from "@/utils/time.js";
export default {
  components: {},
  data() {
    return {
      activeTab: "成交订单数",
      showDatePicker: false,
      startDate: "",
      endDate: "",
      searchKeyword: "",
      originalTeamList: [
        // {
        //   id: 1,
        //   rank: 1,
        //   name: "yinying",
        //   avatar:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/圆形头像-小尺寸 1 Copy 3@2x.png",
        //   vipLevel: "会员等级",
        //   transactionAmount: 300,
        //   commission: 100,
        //   orderCount: 42,
        //   lastOrderDate: "2025-05-14",
        // },
        // {
        //   id: 2,
        //   rank: 2,
        //   name: "嘿嘿",
        //   avatar:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/圆形头像-小尺寸 1 Copy 3@2x.png",
        //   vipLevel: "会员等级",
        //   transactionAmount: 300,
        //   commission: 100,
        //   orderCount: 32,
        //   lastOrderDate: "2025-03-14",
        // },
        // {
        //   id: 3,
        //   rank: 3,
        //   name: "皇帝",
        //   avatar:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/圆形头像-小尺寸 1 Copy 3@2x.png",
        //   vipLevel: "会员等级",
        //   transactionAmount: 300,
        //   commission: 100,
        //   orderCount: 4,
        //   lastOrderDate: "2025-03-14",
        // },
        // {
        //   id: 4,
        //   rank: 4,
        //   name: "把兔兔吃掉",
        //   avatar:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/圆形头像-小尺寸 1 Copy 3@2x.png",
        //   vipLevel: "会员等级",
        //   transactionAmount: 300,
        //   commission: 100,
        //   orderCount: 3,
        //   lastOrderDate: "2022-03-14",
        // },
        // {
        //   id: 5,
        //   rank: 5,
        //   name: "把兔兔吃掉",
        //   avatar:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/圆形头像-小尺寸 1 Copy 3@2x.png",
        //   vipLevel: "会员等级",
        //   transactionAmount: 300,
        //   commission: 100,
        //   orderCount: 3,
        //   lastOrderDate: "2025-03-14",
        // },
        // {
        //   id: 6,
        //   rank: 6,
        //   name: "把兔兔吃掉",
        //   avatar:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/圆形头像-小尺寸 1 Copy 3@2x.png",
        //   vipLevel: "会员等级",
        //   transactionAmount: 300,
        //   commission: 100,
        //   orderCount: 3,
        //   lastOrderDate: "2025-03-14",
        // },
        // {
        //   id: 7,
        //   rank: 7,
        //   name: "把兔兔吃掉",
        //   avatar:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/圆形头像-小尺寸 1 Copy 3@2x.png",
        //   vipLevel: "会员等级",
        //   transactionAmount: 300,
        //   commission: 100,
        //   orderCount: 300,
        //   lastOrderDate: "2025-03-14",
        // },
      ],
      teamList: [],
      orders: [],
    };
  },
  computed: {
    filteredTeamList() {
      if (!this.searchKeyword) {
        return this.teamList;
      }

      const keyword = this.searchKeyword.toLowerCase();
      return this.teamList.filter((member) => {
        return (
          member.name.toLowerCase().includes(keyword) ||
          String(member.orderCount).includes(keyword) ||
          String(member.transactionAmount).includes(keyword) ||
          String(member.commission).includes(keyword) ||
          member.lastOrderDate.includes(keyword)
        );
      });
    },
  },
  created() {
    // 初始化时复制原始数据并排序
    this.listOrder();
    // this.teamList = [...this.originalTeamList];
    this.sortTeamList();
  },
  methods: {
    happenTimeFun,
    formatFullTime,
    // 处理搜索
    handleSearch() {
      // 搜索处理已经通过计算属性实现，无需额外代码
      // 如果需要在搜索时重新排序，可以在这里调用sortTeamList
    },
    // 切换排序标签
    switchTab(tab) {
      this.activeTab = tab;
      this.sortTeamList();
    },
    // 打开日期选择器
    openDatePicker() {
      this.showDatePicker = true;
    },
    // 关闭日期选择器
    closeDatePicker() {
      this.showDatePicker = false;
    },
    // 应用日期筛选
    applyDateFilter() {
      if (!this.startDate || !this.endDate) {
        uni.showToast({
          title: "请选择完整的日期范围",
          icon: "none",
        });
        return;
      }

      const startTimestamp = new Date(this.startDate).getTime();
      const endTimestamp = new Date(this.endDate).getTime();

      if (startTimestamp > endTimestamp) {
        uni.showToast({
          title: "开始日期不能大于结束日期",
          icon: "none",
        });
        return;
      }

      // 根据日期筛选团队列表
      this.teamList = this.originalTeamList.filter((member) => {
        const orderDate = new Date(member.lastOrderDate).getTime();
        return orderDate >= startTimestamp && orderDate <= endTimestamp;
      });

      // 排序筛选后的列表
      this.sortTeamList();
      this.closeDatePicker();
    },
    // 根据当前标签排序团队列表
    sortTeamList() {
      if (this.activeTab === "成交订单数") {
        // 按订单数量降序排列
        this.teamList.sort((a, b) => b.orderCount - a.orderCount);
      } else if (this.activeTab === "最近下单时间") {
        // 按下单时间排序，最近的在前
        this.teamList.sort(
          (a, b) => new Date(b.latest_time) - new Date(a.latest_time)
        );
      }

      // 更新排名
      this.teamList.forEach((item, index) => {
        item.rank = index + 1;
      });
    },
    // 联系团队成员
    contactMember(id) {
      // 在这里实现联系功能
      console.log("联系会员ID:", id);
      uni.showToast({
        title: "正在连接...",
        icon: "none",
      });
    },
    // 重置搜索
    resetSearch() {
      this.searchKeyword = "";
      this.teamList = [...this.originalTeamList];
      this.sortTeamList();
    },
    listOrder() {
      const { id } = uni.getStorageSync("data");
      console.log("00000", id);
      getUserInviteeOrderStats(id).then((res) => {
        this.orders = res.data;
        this.teamList = res.data;
        console.log("获取列表数据", res.data);
      });
    },
  },
};
</script>

<style lang="less" scoped>
.main-container {
  width: 100vw;
  //height: calc(100vh - 85rpx);
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #fff;
  background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/矩形 2@2x.png");
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sort-tabs {
  display: flex;
  height: 80rpx;
  justify-content: space-around;
  align-items: center;
  padding: 0 20rpx;
}

.tab-item {
  font-size: 28rpx;
  color: #666;
  padding: 10rpx 20rpx;
  position: relative;

  &.active {
    color: #3a88fb;
    font-weight: bold;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 20%;
      width: 60%;
      height: 4rpx;
      background-color: #3a88fb;
    }
  }

  &.time-selector {
    display: flex;
    align-items: center;
  }
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
  margin-left: 8rpx;
}

.user-list {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx;
}

.no-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }

  text {
    font-size: 28rpx;
    color: #999;
  }
}

.user-card {
  display: flex;
  background-color: white;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.user-rank {
  width: 80rpx;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20rpx;
}

.medal {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 30rpx;
  position: relative;
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    top: -10rpx;
    left: -15rpx;
    width: 80rpx;
    height: 80rpx;
    background-repeat: no-repeat;
    background-size: contain;
    z-index: -1;
  }

  &.medal-0::before {
    background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/图标 1@2x.png");
  }

  &.medal-1::before {
    background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/图标 2@2x.png");
  }

  &.medal-2::before {
    background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/personnel/图标 3@2x.png");
  }
}

.rank-number {
  font-size: 32rpx;
  color: #999;
  font-weight: bold;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;

  image {
    width: 100%;
    height: 100%;
  }
}

.user-info {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.user-name {
  width: 150rpx;
  height: 40rpx;
  overflow: hidden;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-right: 15rpx;
}

.vip-tag {
  font-size: 20rpx;
  color: white;
  background-color: #ff9900;
  border-radius: 30rpx;
  padding: 4rpx 12rpx;
}

.transaction-row,
.order-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.transaction-label {
  font-size: 26rpx;
  color: #666;
}

.transaction-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.margin-left {
  margin-left: 30rpx;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}

.time-label {
  font-size: 24rpx;
  color: #999;
}

.time-value {
  font-size: 24rpx;
  color: #333;
}

.contact-btn {
  width: 90rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background-color: #93d2f3;
  color: white;
  border-radius: 40rpx;
  font-size: 24rpx;
}

/* 日期选择器样式 */
.date-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.date-picker-content {
  width: 80%;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.date-picker-header {
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.close-btn {
  font-size: 36rpx;
  color: #999;
}

.date-range-picker {
  padding: 30rpx 20rpx;
}

.date-input {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.date-input text {
  width: 150rpx;
}

.date-input input {
  flex: 1;
  height: 70rpx;
  border: 1px solid #eee;
  border-radius: 6rpx;
  padding: 0 15rpx;
}

.date-picker-footer {
  display: flex;
  padding: 20rpx;
  border-top: 1px solid #eee;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  border-radius: 6rpx;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
  margin-right: 15rpx;
}

.btn-confirm {
  background-color: #93d2f3;
  color: #fff;
}
</style>
