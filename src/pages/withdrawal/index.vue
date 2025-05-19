<template>
  <view class="center" style="padding: 0 20rpx">
    <navigation-bars title="提现" @pack="onPackClick" :image="image" />
    <!-- 提现内容 -->
    <view style="margin-top: 40rpx; padding-left: 20rpx">
      <view style="font-size: 32rpx; color: #676768">可提现金额(元)</view>
      <view
        style="
          font-size: 46rpx;
          font-weight: bold;
          margin-top: 30rpx;
          color: black;
        "
        >{{ availableWithdrawalAmount }}</view
      >
    </view>
    <view class="withdrawalMethods">
      <view class="colors">提现金额</view>
      <view class="withdrawalMethods-item">
        <view class="withdrawalMethods-item-price">
          <input type="text" v-model="price" placeholder="输入提现金额" />
        </view>
        <view class="withdrawalMethods-item-text" @click="withdrawAll">
          全部提现
        </view>
      </view>
      <view class="withdrawalMethods-pay">
        <view class="colors">提款方式</view>
        <view style="display: flex; align-items: center">
          <image
            style="width: 50rpx; height: 50rpx; margin-right: 20rpx"
            :src="select.image"
            mode="scaleToFill"
          />
          <view class="withdrawalMethods-money">{{ select.name }}</view>
          <image
            style="width: 50rpx; height: 50rpx"
            src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/right.png"
            mode="scaleToFill"
          />
        </view>
      </view>
    </view>
    <!-- 请选择充值方式 -->
    <view
      class="withdrawalMethods-tip"
      style="margin-top: 40rpx; padding: 0 20rpx"
    >
      <text style="font-size: 32rpx; font-weight: bold; color: black"
        >请选择充值方式</text
      >
      <view
        v-for="item in radio"
        :key="item.id"
        class="radio-item"
        @click="choose(item)"
      >
        <view class="radio-item-left">
          <image
            style="width: 40rpx; height: 40rpx"
            :src="item.image"
            mode="scaleToFill"
          ></image>
          <text style="margin-left: 20rpx; color: black">{{ item.name }}</text>
        </view>
        <view class="radio-item-right">
          <view class="rounded" v-if="item.id === id"></view>
        </view>
      </view>
    </view>
    <!-- 提现按钮 -->
    <view style="margin-top: 40rpx; display: flex; justify-content: center">
      <view
        class="btnbj"
        style="width: 400rpx; height: 80rpx; line-height: 80rpx"
        @click="withdrawDepositClick"
        >提交</view
      >
    </view>
  </view>
</template>

<script>
import NavigationBars from "@/components/navigation-bars/index.vue";
import { withdraw } from "@/service/pay.js";
import { formatPrice } from "@/utils/time.js";
export default {
  components: {
    NavigationBars,
  },
  data() {
    return {
      image:
        "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/pack.png",
      isShow: false,
      color: "transparent",
      id: 1,
      select: {},
      radio: [
        {
          id: 1,
          value: 1,
          name: "微信",
          image:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/wxfb.png",
        },
        // {
        //   id: 2,
        //   value: 2,
        //   name: "支付宝",
        //   image:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/zfb.png",
        // },
      ],
      price: "",
      availableWithdrawalAmount: 0,
    };
  },
  onLoad() {
    const { balance } = uni.getStorageSync("data");
    this.availableWithdrawalAmount = formatPrice(balance);
    console.log(balance);
    this.select = this.radio[0];
  },
  methods: {
    formatPrice,
    onPackClick() {
      uni.navigateBack({
        delta: 1,
      });
    },
    withdrawAll() {
      this.price = formatPrice(this.availableWithdrawalAmount.toString());
    },
    choose(item) {
      this.select = item;
      console.log("item000", item);
      this.id = item.id;
    },
    //用户提现
    withdrawDepositClick() {
      if (this.availableWithdrawalAmount >= this.price) {
        uni.showLoading({
          title: "提现中...",
          mask: true,
        });
        const { id } = uni.getStorageSync("data");
        const amount = Math.round(this.price * 100);
        withdraw(id, amount)
          .then((res) => {
            uni.hideLoading();
            uni.showToast({
              title: "提现成功",
              icon: "none",
            });
          })
          .catch((err) => {
            uni.hideLoading();
            uni.showToast({
              title: "提现失败: ",
              icon: "none",
            });
          });
      } else {
        uni.showToast({
          title: "超过可提现金额",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss">
.center {
  height: 100vh;
  background: linear-gradient(180deg, #a1c9fd 0%, #cce6ec 49%, #f8f8f8 100%);
}
.withdrawalMethods {
  margin-top: 30rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background-color: #d5eefc;
  .withdrawalMethods-item {
    margin-top: 30rpx;
    color: black;
    display: flex;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #676768;
    justify-content: space-between;
    .withdrawalMethods-item-price {
      font-size: 46rpx;
    }
    .withdrawalMethods-item-text {
      color: #fab24d;
      text-decoration: underline;
    }
  }
  .withdrawalMethods-pay {
    margin-top: 20rpx;
    height: 100rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .colors {
    color: #676768;
  }
  .withdrawalMethods-money {
    color: #676768;
  }
}
.withdrawalMethods-choose {
  margin-top: 40rpx;
  padding-left: 20rpx;
}
.radio-item {
  height: 80rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.radio-item-left {
  display: flex;
  align-items: center;
}
.radio-item-right {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #1684fc;
}
.rounded {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #1684fc;
}
.btnbj {
  text-align: center;
  border-radius: 40rpx;
  background: linear-gradient(180deg, #f7ba62 0%, #e2dfcb 100%);
}
</style>
