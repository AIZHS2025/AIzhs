<!-- 标题 -->
<template>
  <view>
    <view class="type-title">
      <view
        class="type-title-left"
        :class="{ active: switchs === 1 }"
        @click="officialClick"
      >
        <image
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/blue.png"
          mode="aspectFill"
          style="width: 40rpx; height: 40rpx"
        ></image>
        <text>新闻咨讯</text>
        <image
          src=""
          mode="aspectFill"
          style="width: 30rpx; height: 30rpx"
        ></image>
      </view>
      <view
        class="type-title-right"
        :class="{ active: switchs === 2 }"
        @click="aiClick"
      >
        <image
          src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/red.png"
          mode="aspectFill"
          style="width: 40rpx; height: 40rpx"
        ></image>
        <text>AI交流圈</text>
        <image
          src=""
          mode="aspectFill"
          style="width: 30rpx; height: 30rpx"
        ></image>
      </view>
    </view>
    <!-- 热门 -->
    <view style="margin-top: 20rpx">
      <MoreTitles :center="title"></MoreTitles>
    </view>
    <!-- 新闻 -->
    <new-title
      v-if="switchs === 1"
      :centerTitle="information.hot_data"
      @new="newclick"
    ></new-title>
    <new-title
      v-if="switchs === 2"
      :centerTitle="aiData.hot_data"
      @new="newclick"
    ></new-title>
    <!-- 盒子 -->
    <center-item
      v-if="switchs === 1"
      :center="information.all_data"
      @new="newclick"
    ></center-item>
    <center-item
      v-if="switchs === 2"
      :center="aiData.all_data"
      @new="newclick"
    ></center-item>
  </view>
</template>

<script>
import MoreTitles from "../more-titles/index.vue";
import NewTitle from "../new-title/index.vue";
import CenterItem from "../center-item/index.vue";
export default {
  name: "TitleSwitch",
  components: { MoreTitles, NewTitle, CenterItem },
  props: {
    information: {
      type: Object,
      default() {
        return {
          hot_data: [],
          all_data: [],
        };
      },
    },
    aiData: {
      type: Object,
      default() {
        return {
          hot_data: [],
          all_data: [],
        };
      },
    },
  },
  data() {
    return {
      switchs: 1,
    };
  },
  computed: {
    title() {
      return this.switchs === 1
        ? {
            name: "热门新闻",
            images:
              "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/图标 2@2x.png",
          }
        : {
            name: "AI热门",
            images:
              "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/图标 2@2x.png",
          };
    },
  },
  methods: {
    officialClick() {
      this.switchs = 1;
    },
    aiClick() {
      this.switchs = 2;
    },
    //咨询详情
    newclick(item) {
      uni.navigateTo({
        url: `/pages/coursePlanet/Official-information/index?id=${item.id}`,
      });
    },
  },
};
</script>

<style scoped>
.type-title {
  margin-top: 20rpx;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.type-title-left {
  padding: 0 20rpx;
  width: 50%;
  color: #1985fc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 30rpx 0 0 30rpx;
  background-color: white;
  height: 80rpx;
  line-height: 80rpx;
}
.type-title-right {
  padding: 0 20rpx;
  width: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0 30rpx 30rpx 0;
  background-color: white;
  color: #1985fc;
  height: 80rpx;
  line-height: 80rpx;
}
.active {
  color: white;
  background-color: #93d2f3;
}
</style>
