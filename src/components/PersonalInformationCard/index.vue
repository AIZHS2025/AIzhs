<template>
  <view class="personal-card">
    <view class="personal-card-title">
      <view
        style="
          height: 100rpx;
          display: flex;
          width: 100%;
          justify-content: flex-end;
          padding: 20rpx 20rpx;
        "
      >
        <image
          v-if="user.avatar"
          :src="user.avatar"
          mode="scaleToFill"
          style="width: 60rpx; height: 60rpx"
        />
        <image
          v-else
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/act.png"
          mode="scaleToFill"
          style="width: 60rpx; height: 60rpx"
        />
      </view>
      <view
        class="income-box"
        style="height: 40rpx; display: flex; align-items: center"
      >
        <view>累计收入(元)</view>
        <view style="margin-left: 40rpx">{{
          formatPrice(user.total_earnings)
        }}</view>
      </view>
      <view class="button_max_box">
        <view style="width: 400rpx; line-height: 46rpx"
          >可提现金额：{{ formatPrice(user.balance) }}</view
        >
        <view class="button_box" @click="withdrawalClick">
          <image
            src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/按钮2 1@2x.png"
            mode="scaleToFill"
            style="width: 100%; height: 100%"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { formatPrice } from "@/utils/time.js";
export default {
  name: "PersonalInformationCard",
  props: {
    user: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {};
  },
  methods: {
    formatPrice,
    withdrawalClick() {
      uni.navigateTo({
        url: "/pages/withdrawal/index",
      });
    },
  },
};
</script>

<style lang="less" scoped>
.personal-card {
  width: 95%;
  height: 314rpx;
  margin: 0 auto;
  background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/bjcsp.png");
  background-size: 100% 100%;
  border-radius: 40rpx;
  .personal-card-title {
    width: 97%;
    height: 314rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .income-box {
      margin-top: 30rpx;
      display: flex;
      align-items: center;
    }
    .button_max_box {
      width: 100%;
      margin-top: 44rpx;
      display: flex;
      padding-left: 340rpx;
      .button_box {
        width: 100rpx;
        height: 46rpx;
        font-size: 28rpx;
        text-align: center;
        line-height: 46rpx;
        border-radius: 20rpx;
      }
    }
  }
}
</style>
