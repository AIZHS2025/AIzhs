<template>
  <view class="payment-test-container">
    <view class="header">
      <text class="title">支付测试页面</text>
    </view>

    <view class="info-card">
      <view class="info-item">
        <text class="label">OpenID:</text>
        <text class="value">{{ openid || "正在获取..." }}</text>
      </view>

      <view class="goods-item">
        <text class="goods-title">测试商品</text>
        <text class="goods-price">¥0.01</text>
      </view>
    </view>

    <view class="action-area">
      <button class="pay-btn" @click="handlePay" :disabled="!openid || loading">
        <text v-if="loading">处理中...</text>
        <text v-else>立即支付</text>
      </button>
    </view>

    <view class="result-area" v-if="payResult">
      <view class="result-title">支付结果</view>
      <view class="result-content">
        <text>{{ payResult }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      openid: "",
      loading: false,
      payResult: "",
      orderInfo: {
        goods_name: "测试商品",
        price: 0.01,
        order_no: "",
      },
    };
  },
  onLoad() {
    // 页面加载时立即获取openid
    this.getOpenid();
  },
  methods: {
    // 获取微信小程序OpenID
    getOpenid() {
      const { open_id } = uni.getStorageSync("data");
      this.openid = open_id;
      // this.loading = true;

      // // 调用微信登录获取code
      // uni.login({
      // 	provider: 'weixin',
      // 	success: (loginRes) => {
      // 		if (loginRes.code) {
      // 			console.log('获取微信登录code成功:', loginRes.code);

      // 			// 使用code换取openid
      // 			uni.request({
      // 				url: 'http://test12.cc/index.php/getOpenid',
      // 				method: 'POST',
      // 				data: {
      // 					code: loginRes.code
      // 				},
      // 				success: (res) => {
      // 					console.log('获取openid响应:', res);
      // 					if (res.data && res.data.openid) {
      // 						this.openid = res.data.openid;
      // 						// 生成一个随机订单号
      // 						this.orderInfo.order_no = 'TEST' + Date.now() + Math.floor(Math.random() * 1000);
      // 						console.log('获取openid成功:', this.openid);
      // 					} else {
      // 						uni.showToast({
      // 							title: '获取openid失败',
      // 							icon: 'none'
      // 						});
      // 					}
      // 				},
      // 				fail: (err) => {
      // 					console.error('请求获取openid失败:', err);
      // 					uni.showToast({
      // 						title: '获取openid失败，请检查网络',
      // 						icon: 'none'
      // 					});
      // 				},
      // 				complete: () => {
      // 					this.loading = false;
      // 				}
      // 			});
      // 		} else {
      // 			this.loading = false;
      // 			console.error('微信登录失败:', loginRes);
      // 			uni.showToast({
      // 				title: '微信登录失败',
      // 				icon: 'none'
      // 			});
      // 		}
      // 	},
      // 	fail: (err) => {
      // 		this.loading = false;
      // 		console.error('调用微信登录接口失败:', err);
      // 		uni.showToast({
      // 			title: '微信登录失败',
      // 			icon: 'none'
      // 		});
      // 	}
      // });
    },

    // 处理支付
    handlePay() {
      if (!this.openid) {
        uni.showToast({
          title: "OpenID未获取，无法支付",
          icon: "none",
        });
        return;
      }

      this.loading = true;
      this.payResult = "";

      // 调用统一下单接口
      uni.request({
        url: "http://test12.cc/index.php/unifiedOrder",
        method: "POST",
        data: {
          openid: this.openid,
          out_trade_no: this.orderInfo.order_no,
          body: this.orderInfo.goods_name,
          total_fee: this.orderInfo.price * 100, // 转换为分
          attach: "测试支付", // 附加数据
        },
        success: (res) => {
          console.log("统一下单接口返回:", res);
          if (res.data && res.data.code === 0) {
            const payParams = res.data.data;

            // 调用微信支付
            uni.requestPayment({
              provider: "wxpay",
              timeStamp: payParams.timeStamp,
              nonceStr: payParams.nonceStr,
              package: payParams.package,
              signType: payParams.signType,
              paySign: payParams.paySign,
              success: (res) => {
                console.log("支付成功:", res);
                this.payResult = "支付成功！订单号：" + this.orderInfo.order_no;
                uni.showToast({
                  title: "支付成功",
                  icon: "success",
                });
              },
              fail: (err) => {
                console.log("支付失败:", err);
                this.payResult =
                  "支付失败：" + (err.errMsg || JSON.stringify(err));
                uni.showToast({
                  title: "支付失败",
                  icon: "none",
                });
              },
              complete: () => {
                this.loading = false;
              },
            });
          } else {
            this.loading = false;
            this.payResult =
              "统一下单失败：" + (res.data.msg || JSON.stringify(res.data));
            uni.showToast({
              title: res.data.msg || "统一下单失败",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          this.loading = false;
          console.error("统一下单请求失败:", err);
          this.payResult =
            "统一下单请求失败：" + (err.errMsg || JSON.stringify(err));
          uni.showToast({
            title: "统一下单失败，请检查网络",
            icon: "none",
          });
        },
      });
    },
  },
};
</script>

<style>
.payment-test-container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  margin-bottom: 30rpx;
  padding: 20rpx 0;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.info-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

.label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.value {
  font-size: 30rpx;
  color: #333;
  word-break: break-all;
}

.goods-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.goods-title {
  font-size: 32rpx;
  color: #333;
}

.goods-price {
  font-size: 34rpx;
  font-weight: bold;
  color: #ff5500;
}

.action-area {
  margin: 50rpx 0;
}

.pay-btn {
  background-color: #07c160;
  color: #fff;
  font-size: 32rpx;
  padding: 20rpx 0;
  border-radius: 12rpx;
  width: 100%;
}

.pay-btn[disabled] {
  background-color: #aaa;
}

.result-area {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-top: 50rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.result-content {
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
}
</style>
