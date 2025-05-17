<template>
  <view class="function-block-container">
    <view
      v-for="(item, index) in functionList"
      :key="index"
      class="function-card"
      @tap="navigateTo(item.url, item.title)"
    >
      <view class="card-content">
        <view class="icon-container" :class="item.iconClass">
          <image :src="item.iconSrc" mode="aspectFit" class="icon"></image>
        </view>
        <view class="text-container">
          <text class="title">{{ item.title }}</text>
          <text class="subtitle">{{ item.subtitle }}</text>
        </view>
        <view class="arrow-container">
          <image
            src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/right-arrow.png"
            mode="aspectFit"
            class="arrow-icon"
          ></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "FunctionBlockColumn",
  data() {
    return {
      functionList: [
        {
          title: "我的分销订单",
          subtitle: "查看分销订单",
          iconSrc:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/图标 4@2x.png",
          iconClass: "blue",
          url: "/pages/distribution_order_list/index",
        },
        {
          title: "我的佣金",
          subtitle: "查看我的收入",
          iconSrc:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/图标 5@2x.png",
          iconClass: "dark-blue",
          url: "/pages/income/index",
        },
        {
          title: "我的团队",
          subtitle: "查看我的团队",
          iconSrc:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/图标 6@2x.png",
          iconClass: "purple",
          url: "/pages/distribution_personnel_list/index",
        },
        {
          title: "我的业绩",
          subtitle: "查看我的业绩",
          iconSrc:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/图标 7@2x.png",
          iconClass: "orange",
          url: "/pages/performance/index",
        },
        {
          title: "个人名片",
          subtitle: "查看我的名片",
          iconSrc:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/图标 8@2x.png",
          iconClass: "blue",
          url: "/pages/business-card/index",
        },
        {
          title: "我的二维码",
          subtitle: "查看我的二维码",
          iconSrc:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/图标 8@2x.png",
          iconClass: "blue",
          url: "/pages/personal-card/index",
        },
      ],
    };
  },
  methods: {
    navigateTo(url, title) {
      if (title === "我的二维码") {
        console.log("二维码");
        this.$emit("pack");
      } else {
        uni.navigateTo({
          url: url,
        });
      }
    },
  },
};
</script>

<style>
.function-block-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.function-card {
  background-color: #f7fcfd;
  border-radius: 16px;
  margin-bottom: 15px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.card-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icon-container {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.blue {
  background-color: #3a86ff;
}

.dark-blue {
  background-color: #3f51b5;
}

.purple {
  background-color: #6366f1;
}

.orange {
  background-color: #ff9f43;
}

.icon {
  width: 24px;
  height: 24px;
}

.text-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 12px;
  color: #999;
}

.arrow-container {
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}
</style>
