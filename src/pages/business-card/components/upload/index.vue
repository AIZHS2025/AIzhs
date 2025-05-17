<template>
  <view class="picktwo" v-if="isShow">
    <image
      style="width: 100%; height: 100%; border-radius: 30rpx"
      :src="card"
      mode="scaleToFill"
    />
  </view>
  <view class="pick" v-else>
    <view
      @click="uploadClick"
      style="
        width: 300rpx;
        height: 200rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      "
    >
      <text style="font-size: 100rpx; color: #7c7a6b">+</text>
      <text style="font-size: 34rpx; color: #7c7a6b">点击上传图片</text>
    </view>
  </view>
</template>

<script>
import { uploadPictures } from "@/utils/uploadImage.js";
export default {
  name: "Upload",
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    card: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      avatarUrl: "",
    };
  },

  methods: {
    uploadClick() {
      uploadPictures()
        .then((res) => {
          this.avatarUrl = res;
          this.$emit("upload", this.avatarUrl);
        })
        .catch((err) => {
          console.error("读取Base64失败", err);
        });
    },
  },
};
</script>

<style>
.pick {
  margin-top: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  border-radius: 30rpx;
  background: linear-gradient(180deg, #68d0dc 0%, #89ebd2 100%);
}
.picktwo {
  margin-top: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  border-radius: 30rpx;
  background: linear-gradient(180deg, #68d0dc 0%, #89ebd2 100%);
}
</style>
