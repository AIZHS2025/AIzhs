<!-- 个人名片 -->
<template>
  <view class="type">
    <navigation-bars :image="image" title="个人名片" />
    <Upload @upload="onUploadClick" :isShow="isShow" :card="card"></Upload>
    <view style="margin-top: 30rpx">
      <business-card-sharing
        :isShow="isShow"
        :card="card"
        @wx="onWxClick"
        @pyq="onPyqClick"
        @upload="onUploadClick"
      ></business-card-sharing>
    </view>
  </view>
</template>

<script>
import NavigationBars from "@/components/navigation-bars/index.vue";
import Upload from "./components/upload/index.vue";
import BusinessCardSharing from "./components/business-card-sharing/index.vue";
import { uploadBusinessCard } from "@/service/businessCard.js";
export default {
  components: {
    NavigationBars,
    Upload,
    BusinessCardSharing,
  },
  data() {
    return {
      isShow: false,
      card: "",
      image:
        "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/左.png",
    };
  },
  onLoad(options) {
    const { card } = uni.getStorageSync("data");
    if (card) {
      this.isShow = true;
      this.card = card;
    } else {
      this.isShow = false;
    }
  },
  methods: {
    onUploadClick(avatarUrl) {
      this.isShow = true;
      this.avatarUrl = avatarUrl;
      const { id } = uni.getStorageSync("data");
      uploadBusinessCard(id, this.avatarUrl)
        .then((res) => {
          console.log("上传成功", res.data);
          this.card = res.data.card;
          uni.setStorageSync("data", res.data);
        })
        .catch((err) => {});
    },
  },
};
</script>

<style lang="scss">
.type {
  padding: 0 20rpx;
  height: 100vh;
  background: linear-gradient(180deg, #94d2f1 0%, #cbe5ec 44%, #f1f3f2 100%);
}
.custom-share-btn {
  /* 自定义按钮样式 */
  display: inline-block;
  padding: 20rpx 40rpx;
  color: white;
  border-radius: 10rpx;
  text-align: center;
  background-color: transparent;
}
</style>
