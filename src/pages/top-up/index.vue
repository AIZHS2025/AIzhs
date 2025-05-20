<template>
  <view class="type">
    <navigation-bars
      color="black"
      viscosity="true"
      title="充值"
      :backgroundColor="color"
      :image="images"
      @pack="onPackClick"
    />
    <!-- 会员 -->
    <view class="user">
      <view class="user-center">
        <view class="user-center-top">
          <view style="padding-top: 40rpx">
            <image
              v-if="user.avatar"
              style="width: 160rpx; height: 160rpx; border-radius: 50%"
              :src="user.avatar"
              mode="scaleToFill"
            />
            <image
              v-else
              style="width: 160rpx; height: 160rpx"
              src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/toptx.png"
              mode="scaleToFill"
            />
          </view>
          <view class="user-center-center">
            <view>
              <view>
                <text>{{ user.nickname }}</text>
                <image
                  v-if="grade === true"
                  style="width: 30rpx; height: 30rpx; margin-left: 20rpx"
                  src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/微信图片_20250506115505.png"
                  mode="scaleToFill"
                />
                <text v-if="grade === true">{{ user.is_VIP }}</text>
              </view>
              <view style="color: #f5b052; font-size: 32rpx; margin-top: 20rpx">
                当前我的钱包余额
              </view>
            </view>
            <view style="color: #f5b052; font-size: 50rpx"
              >{{ formatPrice(user.tokenBalance) }}
            </view>
          </view>
          <view>
            <image
              style="width: 160rpx; height: 160rpx"
              src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/price.png"
              mode="scaleToFill"
            />
          </view>
        </view>
        <view class="user-center-button">
          <view class="user-center-button-left">
            <image
              style="width: 80rpx; height: 80rpx"
              src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/user-pricce.png"
              mode="scaleToFill"
            />
            <view class="user-center-button-left-item" v-if="grade">
              <text style="font-size: 32rpx; font-weight: bold">会员中心</text>
              <text style="color: #666666">距离下次升级100</text>
            </view>
            <view class="user-center-button-left-item" v-else>
              <text style="font-size: 32rpx; font-weight: bold">会员中心</text>
              <text style="color: #666666">开通立享多重特权</text>
            </view>
          </view>
          <view class="user-center-button-right" v-if="grade === false">
            <view
              class="user-center-button-right-item"
              @click="activateNowClick"
              >立即开通
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 充值 -->
    <view style="margin-top: 30rpx; padding: 0 20rpx">
      <view>
        <text style="font-size: 32rpx; font-weight: bold; color: black"
          >请选择充值面额</text
        >
        <text style="font-size: 26rpx; color: #d33844; margin-left: 20rpx"
          >显示itoken数值：{{ tokenRecharge.price }}元等于{{
            tokenRecharge.name
          }}</text
        >
      </view>
      <view class="price">
        <view
          v-for="item in list"
          :key="item.id"
          class="price-item"
          :class="{ active: item.id === indexId }"
          @click="hander(item)"
        >
          <image
            style="width: 60rpx; height: 60rpx"
            src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/price.png"
            mode="scaleToFill"
          />
          <text style="margin-left: 20rpx">{{ item.price }}</text>
        </view>
      </view>
      <!-- <view class="input">
        <input
          style="height: 60rpx"
          v-model="price"
          placeholder="自定义"
          placeholder-class="input-placeholder"
          @input=""
        />
      </view> -->
    </view>
    <!-- 选择 -->
    <view style="margin-top: 30rpx; padding: 0 20rpx">
      <view class="topup">
        <view style="color: black; font-weight: bold">请选择充值方式</view>
        <view
          v-for="item in topUp"
          :key="item.id"
          class="topup-item"
          @click="choose(item)"
        >
          <view class="topup-item-left">
            <image
              style="width: 40rpx; height: 40rpx"
              :src="item.images"
              mode="scaleToFill"
            />
            <text style="margin-left: 20rpx; color: black">{{
              item.name
            }}</text>
          </view>
          <view class="topup-item-right">
            <view class="rounded" v-if="item.id === id"></view>
          </view>
        </view>
      </view>
      <view class="step">
        <view style="width: 100rpx">备注：</view>
        <view style="width: 100%; word-wrap: break-word; word-break: break-all">
          <input
            v-model="center"
            placeholder="输入内容"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>
    </view>
    <!-- 按钮 -->
    <view style="display: flex; justify-content: center; margin-top: 30rpx">
      <view class="btn" @click="payClick">立即充值</view>
    </view>
  </view>
</template>

<script>
import NavigationBars from "@/components/navigation-bars/index.vue";
import { pay } from "@/utils/pay/index.js";
import { selectsGoods } from "@/service/shop.js";
import { happenTimeFun, formatFullTime } from "@/utils/time.js";
import { getTokenCount } from "@/service/pay.js";
import { payToken } from "@/utils/token/index.js";
import { formatPrice } from "@/utils/time.js";
export default {
  components: {
    NavigationBars,
  },
  data() {
    return {
      images:
        "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/pack.png",
      color: "transparent",
      id: 1,
      quantity: "",
      token: "",
      price: "",
      indexId: 0,
      center: "",
      product_id: "1",
      order_type: "",
      list: [],
      vip: [],
      user: {
        tokenBalance: "",
      },
      grade: false,
      showCalculator: false,
      calculatedTokens: null,
      topUp: [
        {
          id: 1,
          name: "微信",
          images:
            "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/wxfb.png",
        },
        // {
        //   id: 2,
        //   name: "支付宝",
        //   images:
        //     "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/zfb.png",
        // },
      ],
      tokenRecharge: {},
      timestamp: 1710000000,
    };
  },
  onPageScroll(e) {
    this.color = e.scrollTop > 20 ? "white" : "transparent";
  },
  onLoad() {
    // 页面加载时获取token余额
    // this.fetchTokenBalance(this.id);
  },
  mounted() {
    this.user = uni.getStorageSync("data");
    if (!this.user.tokenBalance) {
      this.user.tokenBalance = this.user.token_quantity || 0;
    }
    this.grade = uni.getStorageSync("vip");
    //充值
    this.paySelectsGoods("1").then((data) => {
      this.list = data.sort((a, b) => a.price - b.price);
      this.order_type = 2;
      this.indexId = this.list[0].id;
      this.product_id = this.list[0].id;
      this.tokenRecharge = this.list[0];
      console.log("this.list", this.list);
    });
    // 会员
    this.paySelectsGoods("0").then((data) => {
      this.vip = data.find((item) => item.type === 0);
      console.log("this.vip", this.vip);
    });
    this.stablePay = this.stabilization(
      () => pay(this.product_id, this.order_type),
      500
    );

    // 获取最新的token余额
    this.$nextTick(() => {
      this.fetchTokenBalance(this.id);
    });
  },
  methods: {
    formatPrice,
    happenTimeFun,
    formatFullTime,
    hander(item) {
      this.order_type = 2;
      this.indexId = item.id;
      this.product_id = item.id;
      this.tokenRecharge = item;
    },
    choose(item) {
      this.id = item.id;
    },
    // 充值会员购买
    payClick() {
      this.stablePay().then((res) => {
        this.user = uni.getStorageSync("data");
        this.grade = uni.getStorageSync("vip");
        uni.navigateTo({
          url: "/pages/topup-fail/index",
        });
      });
    },
    onPackClick() {
      uni.navigateBack({
        delta: 1,
      });
      console.log("返回");
    },
    stabilization(fn, wait) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        return new Promise((resolve) => {
          timer = setTimeout(() => {
            resolve(fn(...args));
          }, wait);
        });
      };
    },
    paySelectsGoods(type) {
      return selectsGoods(type)
        .then((res) => {
          if (res.data) {
            return res.data;
          }
          return null;
        })
        .catch((err) => {
          console.error(err);
          return null;
        });
    },
    // 立即开通
    activateNowClick() {
      this.order_type = 1;
      this.product_id = this.vip.id;
      this.stablePay().then((res) => {
        this.user = uni.getStorageSync("data");
        this.grade = uni.getStorageSync("vip");
        uni.navigateTo({
          url: "/pages/topup-success/index",
        });
      });
    },
    // 获取Token余额
    fetchTokenBalance(id) {
      getTokenCount(id)
        .then((res) => {
          if (res.code === 200) {
            // 更新显示的token余额
            this.user.tokenBalance = res.data;
            console.log("Token API response:", res);
          } else {
            console.log("获取Token信息失败:", res);
          }
        })
        .catch((err) => {
          console.error("获取Token信息失败:", err);
        });
    },
    tokenClick() {
      console.log("123");
      payToken(this.id, 10)
        .then((res) => {
          const newUser = { ...this.user, tokenBalance: res };
          this.user = newUser;
        })
        .catch((err) => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.type {
  width: 100vw;
  background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/topup.png");
  height: 150vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #fff;
}

.topup-image {
  width: 100%;
  display: block;
}
.user {
  margin-top: 20rpx;
  padding: 0 20rpx;
}
.user-center {
  border-radius: 30rpx;
  padding: 30rpx 20rpx;
  background: linear-gradient(180deg, #9cc6f4 0%, rgba(216, 216, 216, 0) 100%);
}
.user-center-top {
  display: flex;
  justify-content: space-between;
}
.user-center-center {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.user-center-button {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 20rpx;
  border-radius: 30rpx;
  background: linear-gradient(180deg, #efe0cc 0%, #f5b052 100%);
}
.user-center-button-left {
  display: flex;
  align-items: center;
}
.user-center-button-left-item {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.user-center-button-right-item {
  border-radius: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  padding: 10rpx 20rpx;
  background: linear-gradient(180deg, #f0bc6f 0%, #98d1ee 50%, #eeb781 100%);
}
// 价格
.price {
  padding-top: 20rpx;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.price-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30%;
  height: 80rpx;
  border-radius: 30rpx;
  background: linear-gradient(180deg, #a0d8f5 0%, #fbfdff 100%);
  margin-bottom: 20rpx;
}
.active {
  background: linear-gradient(180deg, #ffb44e 0%, #fff8ef 100%);
}
//input
.input {
  color: white;
  padding: 0 20rpx;
  border-radius: 30rpx;
  height: 60rpx;
  background-color: #a8d6f7;
}

.topup {
  padding: 20rpx 30rpx;
  border-radius: 30rpx;
  background: linear-gradient(270deg, #dee4fd 0%, rgba(216, 216, 216, 0) 100%);
}
.topup-item {
  height: 80rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.topup-item-left {
  display: flex;
  align-items: center;
}
.topup-item-right {
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

// 步骤
.step {
  border-radius: 30rpx;
  color: black;
  margin-top: 30rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  background: linear-gradient(270deg, #dee4fd 0%, rgba(216, 216, 216, 0) 100%);
}
.btn {
  border-radius: 20rpx;
  width: 200rpx;
  background: linear-gradient(180deg, #f0bc6f 0%, #98d1ee 50%, #eeb781 100%);
}
</style>
