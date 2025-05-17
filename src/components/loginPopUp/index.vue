/** * Ripple_Yu * 登录绑定弹窗 */
<template>
  <transition name="fade">
    <view class="login-popup" @click.stop="handleMaskClick" @touchmove.prevent>
      <transition name="slide-fade">
        <view class="login-container" @click.stop>
          <view class="login-title">绑定登录</view>

          <!-- 头像上传区域 -->
          <view class="avatar-upload">
            <image
              :src="
                avatarUrl ||
                'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/act.png'
              "
              class="avatar-image"
              @click="chooseAvatar"
            >
            </image>
            <text class="upload-text">点击上传头像</text>
          </view>

          <!-- 输入区域 -->
          <view class="input-group">
            <input
              type="text"
              v-model="nickname"
              placeholder="请输入昵称"
              class="input-field"
            />
            <input
              type="number"
              v-model="phone"
              placeholder="请输入手机号码"
              class="input-field"
              maxlength="11"
            />
          </view>

          <!-- 登录按钮 -->
          <button class="login-button" @click="handleLogin">绑定登录</button>
        </view>
      </transition>
    </view>
  </transition>
</template>

<script>
import { uploadPictures } from "@/utils/uploadImage.js";
export default {
  name: "LoginPopup",
  data() {
    return {
      avatarUrl: "",
      nickname: "",
      phone: "",
    };
  },

  methods: {
    // 处理遮罩层点击
    handleMaskClick(e) {
      this.$emit("close");
    },

    chooseAvatar() {
      uploadPictures()
        .then((res) => {
          this.avatarUrl = res;
        })
        .catch((err) => {
          console.error("读取Base64失败", err);
        });
    },

    handleLogin() {
      // 在这里处理登录逻辑
      if (!this.avatarUrl) {
        uni.showToast({
          title: "请上传头像",
          icon: "none",
        });
        return;
      }
      if (!this.nickname) {
        uni.showToast({
          title: "请输入昵称",
          icon: "none",
        });
        return;
      }
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({
          title: "请输入正确的手机号码",
          icon: "none",
        });
        return;
      }

      // 触发登录事件
      this.$emit("login", {
        avatar: this.avatarUrl,
        nickname: this.nickname,
        phone: this.phone,
      });
    },
  },

  // 在组件挂载时禁止页面滚动
  mounted() {
    document.body.style.overflow = "hidden";
  },

  // 在组件销毁时恢复页面滚动
  beforeDestroy() {
    document.body.style.overflow = "auto";
  },
};
</script>

<style lang="scss" scoped>
.login-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  touch-action: none;
  /* 禁止触摸事件 */
}

.login-container {
  width: 90vw;
  background-color: #d4f0ff;
  border-radius: 60rpx;
  padding: 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: 90vh;
  /* 限制最大高度 */
  overflow-y: auto;
  /* 内容过多时可滚动 */
}

.login-title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  color: #333;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;

  .avatar-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 80rpx;
    background-color: #fff;
    margin-bottom: 20rpx;
  }

  .upload-text {
    font-size: 28rpx;
    color: #666;
  }
}

.input-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
  color: #000;

  .input-field {
    height: 104rpx;
    background-color: #fff;
    border-radius: 60rpx;
    padding: 0 40rpx;
    font-size: 32rpx;
    box-sizing: border-box;
  }
}

.login-button {
  width: 100%;
  height: 104rpx;
  background-color: #022e57;
  color: #fff;
  font-size: 36rpx;
  border-radius: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  margin-top: 20rpx;

  &:active {
    opacity: 0.9;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
