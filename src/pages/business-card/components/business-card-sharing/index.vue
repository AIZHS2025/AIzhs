<template>
  <!-- 按钮 -->
  <view style="display: flex; justify-content: space-between">
    <view
      v-for="item in title"
      :key="item.id"
      @click="hander(item)"
      :style="{ with: `calc(100% / ${title.length})` }"
    >
      <button open-type="share" class="custom-share-btn" v-if="item.id === 1">
        <image
          style="width: 50rpx; height: 50rpx"
          :src="item.url"
          mode="scaleToFill"
        />
        <text style="margin-left: 20rpx">{{ item.name }}</text>
      </button>
      <button class="custom-share-btn" v-else>
        <image
          style="width: 50rpx; height: 50rpx"
          :src="item.url"
          mode="scaleToFill"
        />
        <text style="margin-left: 20rpx">{{ item.name }}</text>
      </button>
    </view>
  </view>
</template>

<script>
import { uploadPictures } from "@/utils/uploadImage.js";
import { saveAlbum } from "@/utils/saveAlbum.js";
export default {
  name: "BusinessCardSharing",
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
      title: [
        {
          id: 1,
          url: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/wx.png",
          name: "微信",
        },
        // {
        //   id: 2,
        //   url: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/pyq.png",
        //   name: "朋友圈",
        // },
        {
          id: 3,
          url: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/xc.png",
          name: "保存相册",
        },
        {
          id: 4,
          url: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/mp.png",
          name: "修改名片",
        },
      ],
      avatarUrl: "",
    };
  },

  methods: {
    hander(item) {
      if (item.name === "微信") {
        this.$emit("wx");
        console.log("点击了微信");
      } else if (item.name === "朋友圈") {
        this.$emit("pyq");
        console.log("点击了朋友圈");
      } else if (item.name === "保存相册") {
        saveAlbum(this.card);
      } else {
        uploadPictures()
          .then((res) => {
            this.avatarUrl = res;
            this.$emit("upload", this.avatarUrl);
          })
          .catch((err) => {
            console.error("读取Base64失败", err);
          });
        this.$emit(upload);
      }
    },
  },
};
</script>

<style>
.custom-share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 自定义按钮样式 */
  padding: 0 0;
  /* display: inline-block; */
  color: white;
  border-radius: 10rpx;
  background-color: transparent;
}
</style>
