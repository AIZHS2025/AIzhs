//工具页面 弹窗 --- 选择兴趣赛道1
<template>
  <view class="modal-overlay" v-if="visible">
    <view class="modal-content">
      <view class="modal-close" @click="$emit('close')">×</view>
      <view class="modal-body">
        <view class="modal-text-container">
          <text class="modal-text">请选择自己的兴趣赛道</text>
          <view class="interest-grid">
            <view
              class="interest-row"
              v-for="(row, rowIndex) in interestTracks"
              :key="rowIndex"
            >
              <view
                class="interest-item"
                :class="{ active: selectedInterest === item }"
                v-for="(item, index) in row"
                :key="index"
                @click="selectInterest(item)"
              >
                <text>{{ item }}</text>
              </view>
            </view>
          </view>

          <view class="modal-footer">
            <view class="modal-button" @click="confirmSelection">确认</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "InterestTrackModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    interestTracks: {
      type: Array,
      default: () => [],
    },
    interestPages: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      selectedInterest: "",
    };
  },
  methods: {
    selectInterest(interest) {
      this.selectedInterest = interest;
    },
    confirmSelection() {
      if (!this.selectedInterest) {
        uni.showToast({
          title: "请选择自己的兴趣赛道",
          icon: "none",
        });
        return;
      }

      this.$emit("confirm", this.selectedInterest);
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-overlay {
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
}

.modal-content {
  width: 720rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
  z-index: 2;
}

.modal-body {
  padding: 60rpx 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-text-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.modal-text {
  font-size: 34rpx;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
  font-weight: bold;
}

.interest-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 20rpx;
  border-bottom: none;
}

.interest-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.interest-item {
  flex: 1;
  padding: 15rpx 0;
  background-color: #f5f7fa;
  border-radius: 10rpx;
  text-align: center;
  margin: 0 10rpx;
  font-size: 28rpx;
  color: #333;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
  border: 1px solid #e8e8e8;
}

.interest-item.active {
  background: linear-gradient(
    176deg,
    rgba(117, 197, 236, 1) 0%,
    rgba(255, 255, 255, 1) 100%
  );
  color: black;
  border: 1px solid #eef4f8;
}

.modal-footer {
  padding: 20rpx 0;
  display: flex;
  justify-content: center;
  margin-top: 10rpx;
}

.modal-button {
  width: 170rpx;
  height: 70rpx;
  background-color: #f5f7fa;
  border: 1px solid #e8e8e8;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  font-size: 30rpx;
}

.modal-button.active {
  background: linear-gradient(
    176deg,
    rgba(117, 197, 236, 1) 0%,
    rgba(255, 255, 255, 1) 100%
  );
  color: black;
  border: 1px solid #eef4f8;
}
</style>
