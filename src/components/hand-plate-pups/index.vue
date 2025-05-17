<template>
  <view class="popup" v-show="visible" @click.stop="handleMaskClick">
    <view class="popup-mask"></view>
    <view class="popup-content" @click.stop>
      <!-- 内容显示区 -->
      <view class="content-area">
        <view class="popup-header">
          <text class="popup-title">会员购买</text>
        </view>

        <view class="product-info">
          <view class="product-name">AI智汇社 VIP会员</view>
          <view class="product-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ price }}</text>
            <text class="price-original" v-if="originalPrice > price"
              >¥{{ originalPrice }}</text
            >
          </view>
          <view class="product-desc">
            <text class="benefit-item">✓ 无限AI文案生成</text>
            <text class="benefit-item">✓ 高级AI模型</text>
            <text class="benefit-item">✓ 分佣计划资格</text>
            <text class="benefit-item">✓ 7*24小时技术支持</text>
            <text class="benefit-item highlight">✓ 一次付费，永久使用</text>
          </view>
        </view>

        <view class="payment-options">
          <view class="option-title">支付方式</view>
          <view
            class="option-item"
            :class="{ active: payMethod === 'wxpay' }"
            @tap="selectPayMethod('wxpay')"
          >
            <view class="option-icon wx-icon">
              <text class="icon-text">微信</text>
            </view>
            <view class="option-name">微信支付</view>
            <view class="option-check" v-if="payMethod === 'wxpay'">✓</view>
          </view>
        </view>
      </view>

      <!-- 按钮显示区 -->
      <view class="button-area">
        <button class="pay-button" @tap="handlePayment" :loading="isLoading">
          立即支付 {{ price }}元
        </button>
        <view class="agreement">
          <text class="agreement-text">点击立即支付，表示同意</text>
          <text class="agreement-link" @tap="openAgreement">《用户协议》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "HandPlatePups",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    productId: {
      type: String,
      default: "vip_monthly",
    },
  },
  data() {
    return {
      price: 588,
      originalPrice: 1288,
      payMethod: "wxpay",
      isLoading: false,
      products: {
        vip: {
          name: "AI智汇社 VIP会员",
          price: 588,
          originalPrice: 1288,
          duration: "永久",
        },
      },
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // 加载产品信息
        this.loadProductInfo();
      }
    },
    productId(newVal) {
      if (this.visible && newVal) {
        this.loadProductInfo();
      }
    },
  },
  methods: {
    loadProductInfo() {
      // 加载对应产品信息
      const product = this.products[this.productId];
      if (product) {
        this.price = product.price;
        this.originalPrice = product.originalPrice;
      }
    },
    selectPayMethod(method) {
      this.payMethod = method;
    },
    handleMaskClick() {
      if (!this.isLoading) {
        this.$emit("updateVisible", false);
      }
    },
    openAgreement() {
      uni.navigateTo({
        url: "/pages/agreement/index",
        fail: () => {
          uni.showToast({
            title: "协议页面开发中",
            icon: "none",
          });
        },
      });
    },
    handlePayment() {
      if (this.isLoading) return;

      this.isLoading = true;

      uni.showLoading({
        title: "请求支付中...",
      });

      // 调用云函数创建支付订单
      this.createPayOrder()
        .then((orderInfo) => {
          uni.hideLoading();

          if (!orderInfo || !orderInfo.payParams) {
            throw new Error("创建订单失败");
          }

          // 调起微信支付
          this.callWxPay(orderInfo.payParams);
        })
        .catch((err) => {
          uni.hideLoading();
          this.isLoading = false;

          uni.showToast({
            title: err.message || "创建订单失败，请重试",
            icon: "none",
          });
        });
    },
    // 创建支付订单
    async createPayOrder() {
      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync("userInfo");
        if (!userInfo) {
          throw new Error("请先登录");
        }

        if (!userInfo.openid) {
          throw new Error("用户信息不完整，请重新登录");
        }

        console.log("创建订单，用户信息:", userInfo);

        // 调用云函数创建订单
        const res = await uniCloud.callFunction({
          name: "payment",
          data: {
            action: "createOrder",
            params: {
              productId: this.productId,
              payMethod: this.payMethod,
              openid: userInfo.openid,
            },
          },
        });

        console.log("创建订单结果:", res);

        if (res.result && res.result.code === 0) {
          return res.result.data;
        } else {
          throw new Error(res.result?.message || "创建订单失败");
        }
      } catch (error) {
        console.error("创建订单失败:", error);
        throw error;
      }
    },
    // 调用微信支付
    callWxPay(payParams) {
      uni.requestPayment({
        ...payParams,
        success: (res) => {
          console.log("支付成功:", res);
          this.handlePaySuccess();
        },
        fail: (err) => {
          console.error("支付失败:", err);

          // 判断是用户取消还是真正的失败
          if (err.errMsg.indexOf("cancel") !== -1) {
            uni.showToast({
              title: "支付已取消",
              icon: "none",
            });
          } else {
            uni.showToast({
              title: "支付失败，请重试",
              icon: "none",
            });
          }

          this.isLoading = false;
        },
        complete: () => {
          // 无论成功失败，都要验证订单状态
          // 因为有可能用户支付成功但微信回调通知服务器失败
          setTimeout(() => {
            this.checkOrderStatus();
          }, 1000);
        },
      });
    },
    // 支付成功处理
    handlePaySuccess() {
      uni.showToast({
        title: "支付成功",
        icon: "success",
      });

      // 更新用户状态
      this.updateUserVipStatus();

      // 通知父组件支付成功并关闭弹窗
      this.$emit("paySuccess", {
        productId: this.productId,
        amount: this.price,
      });

      setTimeout(() => {
        this.isLoading = false;
        this.$emit("updateVisible", false);
      }, 1500);
    },
    // 检查订单状态
    async checkOrderStatus() {
      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync("userInfo");
        if (!userInfo || !userInfo._id) {
          return;
        }

        // 调用云函数查询最近订单状态
        const res = await uniCloud.callFunction({
          name: "payment",
          data: {
            action: "checkOrderStatus",
            params: {
              userId: userInfo._id,
            },
          },
        });

        if (res.result && res.result.code === 0 && res.result.data.isPaid) {
          this.handlePaySuccess();
        }
      } catch (error) {
        console.error("检查订单状态失败:", error);
      }
    },
    // 更新用户VIP状态
    async updateUserVipStatus() {
      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync("userInfo");
        if (!userInfo || !userInfo._id) {
          return;
        }

        // 刷新用户信息
        const res = await uniCloud.callFunction({
          name: "user",
          data: {
            action: "refreshUserInfo",
            params: {
              userId: userInfo._id,
            },
          },
        });

        if (res.result && res.result.code === 0 && res.result.data.userInfo) {
          // 更新本地存储的用户信息
          uni.setStorageSync("userInfo", res.result.data.userInfo);

          // 如果使用了Vuex
          if (this.$store && this.$store.commit) {
            this.$store.commit("user/SET_USER_INFO", res.result.data.userInfo);
            this.$store.commit("user/SET_VIP_STATUS", true);
          }
        }
      } catch (error) {
        console.error("更新用户状态失败:", error);
      }
    },
  },
};
</script>

<style lang="scss">
.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  .popup-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .popup-content {
    position: relative;
    width: 650rpx;
    background-color: #1a1a20;
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.4);
  }

  .popup-header {
    padding: 30rpx 0;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .popup-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #ffffff;
      text-shadow: 0 0 10rpx rgba(0, 242, 255, 0.5);
    }
  }

  .content-area {
    flex: 1;
    padding: 30rpx;
  }

  .product-info {
    margin-bottom: 40rpx;

    .product-name {
      font-size: 34rpx;
      color: #ffffff;
      font-weight: bold;
      margin-bottom: 20rpx;
      text-align: center;
    }

    .product-price {
      text-align: center;
      margin-bottom: 30rpx;

      .price-symbol {
        font-size: 32rpx;
        color: #00f2ff;
        font-weight: bold;
      }

      .price-value {
        font-size: 60rpx;
        color: #00f2ff;
        font-weight: bold;
      }

      .price-original {
        font-size: 30rpx;
        color: rgba(255, 255, 255, 0.5);
        text-decoration: line-through;
        margin-left: 20rpx;
      }
    }

    .product-desc {
      display: flex;
      flex-direction: column;
      padding: 20rpx;
      background: rgba(0, 242, 255, 0.05);
      border-radius: 16rpx;

      .benefit-item {
        font-size: 26rpx;
        color: #333;
        line-height: 1.6;
        margin-bottom: 10rpx;
      }

      .benefit-item.highlight {
        color: #ff5722;
        font-weight: bold;
      }
    }
  }

  .payment-options {
    margin-bottom: 40rpx;

    .option-title {
      font-size: 30rpx;
      color: #ffffff;
      margin-bottom: 20rpx;
    }

    .option-item {
      display: flex;
      align-items: center;
      padding: 20rpx;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16rpx;
      margin-bottom: 15rpx;

      &.active {
        background: rgba(0, 242, 255, 0.1);
        border: 1px solid rgba(0, 242, 255, 0.3);
      }

      .option-icon {
        width: 70rpx;
        height: 70rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;

        &.wx-icon {
          background: #09bb07;

          .icon-text {
            color: #ffffff;
            font-size: 24rpx;
            font-weight: bold;
          }
        }
      }

      .option-name {
        flex: 1;
        font-size: 30rpx;
        color: #ffffff;
      }

      .option-check {
        font-size: 30rpx;
        color: #00f2ff;
        font-weight: bold;
      }
    }
  }

  .button-area {
    padding: 30rpx;

    .pay-button {
      width: 100%;
      height: 90rpx;
      line-height: 90rpx;
      background: linear-gradient(135deg, #0550d0, #057aff);
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
      border-radius: 45rpx;
      box-shadow: 0 5rpx 15rpx rgba(5, 122, 255, 0.4);
      margin-bottom: 20rpx;

      &:active {
        opacity: 0.9;
        transform: scale(0.98);
      }
    }

    .agreement {
      text-align: center;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.5);

      .agreement-link {
        color: #00f2ff;
        margin-left: 5rpx;
      }
    }
  }
}
</style>
