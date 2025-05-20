/** * Ripple_Yu * 个人中心路由页面 */
<template>
  <view class="container">
    <view class="user-info">
      <view class="user-info-top">
        <!-- 顶部用户信息 -->
        <view class="user-header">
          <image
            v-if="userInfo.avatar"
            class="avatar"
            :src="userInfo.avatar"
            mode="aspectFill"
          ></image>
          <image
            v-else
            class="avatar"
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/act.png'"
            mode="aspectFill"
          ></image>
          <view class="login-section">
            <view class="login-section-top">
              <view class="login-section-left">
                <text
                  v-if="userInfo.isLogin == false"
                  class="login-text"
                  @click="showLoginPopup = true"
                  >请绑定登录</text
                >
                <text v-else class="login-text">{{ userInfo.nickname }}</text>
              </view>
              <view class="login-section-right">
                <view
                  v-if="userInfo.isLogin"
                  class="user-type"
                  @click="modifyInformationClick"
                  >修改资料</view
                >
              </view>
            </view>
            <text v-if="userInfo.vipJudgment" class="user-type"
              >已开通会员</text
            >
            <text v-else class="user-type">未开通会员</text>

            <text class="user-id">ID:{{ userInfo.id }}</text>
          </view>
        </view>
      </view>

      <view class="user-info-bottom">
        <view>
          <!-- VIP会员中心 -->
          <view class="vip-card">
            <view
              class="vip-left"
              :style="{ width: vipJudgment ? '100%' : '60%' }"
            >
              <image
                class="vip-icon"
                :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/vip-icon.png'"
                mode="aspectFit"
              ></image>
              <view class="vip-text-box" v-if="vipJudgment">
                <text class="vip-text">VIP会员等级：{{ userInfo.is_VIP }}</text>
                <text class="vip-text-sub">距离下一个等级差100</text>
              </view>
              <view class="vip-text-box" v-else>
                <text class="vip-text">VIP会员中心</text>
                <text class="vip-text-sub">开通立享多重特权</text>
              </view>
            </view>
            <button
              class="open-vip-btn"
              @click="paytest"
              v-if="vipJudgment === false"
            >
              立即开通
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 用户数据统计 -->
    <!-- <view class="user-stats">
      <view class="stat-item">
        <text class="stat-num">{{ userInfo.focusOn }}</text>
        <text class="stat-label">我的关注</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ userInfo.fans }}</text>
        <text class="stat-label">我的粉丝</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ userInfo.message }}</text>
        <text class="stat-label">我的消息</text>
      </view>
    </view> -->

    <!-- 功能区域 -->
    <view class="function-area">
      <view class="function-row">
        <view class="function-item" @click="handleOrder">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/order.png'"
            mode="aspectFit"
          ></image>
          <text>我的订单</text>
        </view>
        <view class="function-item" @click="handleWallet">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/wallet.png'"
            mode="aspectFit"
          ></image>
          <text>我的钱包</text>
        </view>
      </view>
    </view>

    <!-- 会员特权 -->
    <view class="vip-privileges">
      <view class="privileges-title">会员享受权益</view>
      <view class="privileges-list">
        <view class="privilege-item">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/ai-icon.png'"
            mode="aspectFit"
          ></image>
          <text>AI助手免费使用</text>
        </view>
        <view class="privilege-item">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/course-icon.png'"
            mode="aspectFit"
          ></image>
          <text>部分课程免费学习</text>
        </view>
        <view class="privilege-item">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/knowledge-icon.png'"
            mode="aspectFit"
          ></image>
          <text>建立专属知识库</text>
        </view>
      </view>
      <view class="detail-btn" @click="handleDetail">
        <text>点击查看详情</text>
      </view>
    </view>

    <view
      class="distribution_box"
      style="margin-bottom: 20rpx"
      @click="todistribution"
    >
      <view class="image_box22">
        <image
          :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/文档 1@2x.png'"
          style="width: 100%; height: 100%"
        ></image>
      </view>
      <text>操盘手数据中心</text>
    </view>
    <!-- <view class="distribution_box">
      <view class="image_box22">
        <image
          :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/管理技术 1@2x.png'"
          style="width: 100%; height: 100%"
        ></image>
      </view>

      <text>我的操盘手名片</text>
    </view> -->

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item">
        <view class="menu-left">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/course.png'"
            mode="aspectFit"
          ></image>
          <text>我的课程</text>
        </view>
        <image
          class="arrow-right"
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/right-arrow.png"
          mode="aspectFit"
        ></image>
      </view>
      <view class="menu-item">
        <view class="menu-left">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/knowledge.png'"
            mode="asp<strong></strong>ectFit"
          ></image>
          <text>我的知识库</text>
        </view>
        <image
          class="arrow-right"
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/right-arrow.png"
          mode="aspectFit"
        ></image>
      </view>
      <!-- <view class="menu-item">
        <view class="menu-left">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/member.png'"
            mode="aspectFit"
          ></image>
          <text>我的会员</text>
        </view>
        <image
          class="arrow-right"
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/right-arrow.png"
          mode="aspectFit"
        ></image>
      </view> -->
      <view class="menu-item" @click="setClick">
        <view class="menu-left">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/settings.png'"
            mode="aspectFit"
          ></image>
          <text>设置</text>
        </view>
        <image
          class="arrow-right"
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/right-arrow.png"
          mode="aspectFit"
        ></image>
      </view>
      <!-- <view class="menu-item" @click="orderClick">
        <view class="menu-left">
          <image
            :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/service.png'"
            mode="aspectFit"
          ></image>
          <text>我的客服</text>
        </view>
        <image
          class="arrow-right"
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/zhong/right-arrow.png"
          mode="aspectFit"
        ></image>
      </view> -->
    </view>
    <login-pop-up
      @login="onLogin"
      @close="showLoginPopup = false"
      v-if="showLoginPopup"
    />
  </view>
</template>

<script>
import LoginPopUp from "@/components/loginPopUp/index.vue";
import { login, bindUser } from "@/service/login.js";
import { pay } from "@/utils/pay/index.js";
import { selectsGoods } from "@/service/shop.js";
export default {
  components: {
    LoginPopUp,
  },
  data() {
    return {
      order_type: 1,
      product_id: "",
      vip: [],
      vipJudgment: false, //是否开通VIP
      userInfo: {
        isLogin: false, //是否登录
        id: "34567", //用户ID
        userName: "未登录用户", //用户名
        avatar:
          "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/act.png", //头像
        focusOn: 10, //我的关注
        fans: 0, //我的粉丝
        message: 0, //我的消息
      },
      showLoginPopup: false,
    };
  },

  onLoad() {
    //检查是否已有登录信息
    // this.autoLogin();
  },
  mounted() {
    // 会员
    this.paySelectsGoods("0").then((data) => {
      this.vip = data.find((item) => item.type === 0);
      console.log("this.vip", this.vip);
    });
    this.vipJudgment = uni.getStorageSync("vip");
    this.stablePay = this.stabilization(
      () => pay(this.product_id, this.order_type),
      500
    );
  },

  methods: {
    //修改资料
    modifyInformationClick() {
      this.showLoginPopup = true;
    },
    //绑定信息
    onLogin(event) {
      bindUser(this.userInfo.open_id, event.nickname, event.phone, event.avatar)
        .then((res) => {
          console.log("执行了");
          //重新获取用户信息
          const qml = "";
          login(this.userInfo.open_id, qml).then((res) => {
            this.userInfo = {
              ...res.data,
              isLogin: true,
            };
            this.showLoginPopup = false;
            uni.setStorageSync("data", data);
          });
        })
        .catch((err) => console.error("失败", err));
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
    //订单
    orderClick() {},

    // 处理登录
    handleLogin() {
      uni.navigateTo({
        url: "/pages/login/login",
      });
    },
    todistribution() {
      uni.navigateTo({
        url: "/pages/distribution/index",
      });
    },
    // 处理开通VIP
    // handleOpenVip() {
    //   uni.navigateTo({
    //     url: "/pages/vip/index",
    //   });
    // },
    // 处理订单
    handleOrder() {
      alert("点击查看订单");
      // uni.navigateTo({
      //   url: '/pages/vip/detail'
      // })
    },
    // 处理钱包
    handleWallet() {
      alert("点击查看钱包");
      // uni.navigateTo({
      //   url: '/pages/vip/detail'
      // })
    },
    // 处理详情
    handleDetail() {
      // uni.navigateTo({
      //   url: '/pages/vip/detail'
      // })
    },
    // 设置
    setClick() {
      console.log("点击了数字");
      uni.navigateTo({
        url: "/pages/set/index",
      });
    },
    paytest() {
      this.order_type = 1;
      console.log(this.vip.id);
      this.product_id = this.vip.id;
      this.stablePay().then((res) => {
        this.user = uni.getStorageSync("data");
        this.vipJudgment = uni.getStorageSync("vip");
      });
      // uni.navigateTo({
      //   url: "/pages/pay/index",
      // });
    },
  },

  onShow() {
    // 从本地存储恢复用户信息
    const datas = uni.getStorageSync("data");
    if (datas) {
      this.userInfo = {
        ...datas,
        isLogin: true,
      };
    }
  },
};
</script>

<style lang="less" scoped>
.container {
  min-height: 100vh;
  background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/WechatIMG032f010ce4ee6be32aca6623cde9de09.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-bottom: 40rpx;
  overflow: hidden;
}

.user-info {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 10rpx;
  width: 90%;
  margin: 160rpx auto 20rpx auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .user-info-left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .user-info-left-item {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}

.user-header {
  position: relative;
  padding: 40rpx 30rpx;
  // background: linear-gradient(to bottom, #93C1F3, #FFFFFF);
  display: flex;
  // justify-content: space-between;
  align-items: center;

  .login-section {
    margin-left: 70rpx;

    .login-text {
      font-size: 44rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 10rpx;
      display: block;
    }

    .login-section-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .login-section-left {
        width: 220rpx;
      }
    }

    .login-section-right {
      width: 170rpx;
      height: 50rpx;
      font-size: 24rpx;
      text-align: center;
      line-height: 50rpx;
    }
  }

  .user-type {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 6rpx;
    display: block;
  }

  .user-id {
    font-size: 24rpx;
    color: #999;
  }
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: #eee;
}

// }

.vip-card {
  margin: 20rpx;
  background: linear-gradient(to right, #ffd700, #ffa500);
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .vip-left {
    display: flex;
    align-items: center;
    width: 60%;

    .vip-icon {
      width: 108rpx;
      height: 132rpx;
      margin-right: 20rpx;
    }

    .vip-text-box {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .vip-text {
      color: #fff;
      font-size: 36rpx;
      font-weight: bold;
    }

    .vip-text-sub {
      color: #666666;
      font-size: 24rpx;
    }
  }

  .open-vip-btn {
    background-color: #fff;
    color: #ffa500;
    font-size: 28rpx;
    padding: 5rpx 30rpx;
    border-radius: 30rpx;
    border: none;
  }
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 0;
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;

  .stat-item {
    text-align: center;

    .stat-num {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      display: block;
      margin-bottom: 10rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.function-area {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;

  .function-row {
    display: flex;
    justify-content: space-around;

    .function-item {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;

      image {
        width: 100rpx;
        height: 90rpx;
        margin-bottom: 15rpx;
      }

      text {
        font-size: 26rpx;
        color: #333;
      }
    }
  }
}

.vip-privileges {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;

  .privileges-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
  }

  .privileges-list {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .privilege-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;

      flex: 1;

      image {
        width: 100rpx;
        height: 100rpx;
        margin-bottom: 15rpx;
      }

      text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }

  .detail-btn {
    text-align: center;
    padding-top: 20rpx;
    border-top: 1px solid #eee;

    text {
      color: #999;
      font-size: 26rpx;
    }
  }
}

.menu-list {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .menu-left {
      display: flex;
      align-items: center;
      line-height: 80rpx;

      image {
        width: 80rpx;
        height: 76rpx;
        margin-right: 20rpx;
      }

      text {
        font-size: 28rpx;
        color: #333;
      }
    }

    .arrow-right {
      width: 32rpx;
      height: 32rpx;
    }
  }
}

.distribution_box {
  width: 95%;
  margin: 0 auto;
  height: 174rpx;
  border-radius: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  color: #333;
  font-size: 28rpx;
  font-weight: bold;

  .image_box22 {
    width: 174rpx;
    height: 174rpx;
    margin-right: 15rpx;
  }
}
</style>
