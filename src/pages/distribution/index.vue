<!-- 操盘手中心 -->
<template>
  <view class="main-container">
    <PersonalInformationCard :user="user"></PersonalInformationCard>
    <EarningsStatisticsCard
      :commission="commission"
      :orderStats="orderStats"
      :invitedUserStats="invitedUserStats"
      :withdrawal="withdrawal"
    ></EarningsStatisticsCard>
    <FunctionBlockColumn @pack="onPackCick"></FunctionBlockColumn>
    <bottom-pops :isShow="isShow" @close="onClose" title="操盘手二维码">
      <template v-slot:center>
        <view
          style="display: flex; justify-content: center; align-items: center"
        >
          <image
            style="width: 250rpx; height: 250rpx"
            src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/图片 1@2x.png"
            show-menu-by-longpress="true"
            mode="scaleToFill"
          />
        </view>
      </template>
      <template v-slot:bottom>
        <view style="display: flex; justify-content: center">
          <view class="btn" style="border-radius: 40rpx" @click="saveClick">
            保存到相册</view
          >
        </view>
      </template>
    </bottom-pops>
  </view>
</template>

<script>
import PersonalInformationCard from "@/components/PersonalInformationCard/index.vue";
import EarningsStatisticsCard from "@/components/EarningsStatisticsCard/index.vue";
import FunctionBlockColumn from "@/components/FunctionBlockColumn/index.vue";
import BottomPops from "@/components/bottom-pops/index.vue";
import { getWxCode } from "@/service/trader.js";
import { getOperatorDataCardData } from "@/service/trader.js";

export default {
  components: {
    PersonalInformationCard,
    EarningsStatisticsCard,
    FunctionBlockColumn,
    BottomPops,
  },
  data() {
    return {
      showModal: false,
      isShow: false,
      images: "",
      user: {},
      commission: {},
      orderStats: {},
      invitedUserStats: {},
      withdrawal: {},
    };
  },
  created() {
    this.getWxCode();
    this.getOperatorDataCardData();
  },
  methods: {
    /**二维码 */
    onPackCick() {
      this.isShow = true;
      console.log("点击了二维码");
    },
    /**关闭弹窗 */
    onClose() {
      this.isShow = false;
    },
    /**保存图片 */
    saveClick() {
      uni.downloadFile({
        url: "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/图片 1@2x.png",
        success: (downloadRes) => {
          if (downloadRes.statusCode === 200) {
            uni.saveImageToPhotosAlbum({
              filePath: downloadRes.tempFilePath,
              success: () => {
                this.isShow = false;

                uni.showToast({
                  title: "保存成功",
                  icon: "success",
                });
              },
              fail: (err) => {
                this.isShow = false;
                uni.showToast({
                  title: "保存失败",
                  icon: "none",
                });
              },
            });
          }
        },
        fail: (err) => {
          console.error("下载失败", err);
        },
      });
    },
    getWxCode() {
      const { invite_code } = uni.getStorageSync("data");
      getWxCode(invite_code).then((res) => {
        console.log("二维码", res);
      });
    },
    getOperatorDataCardData() {
      const { id } = uni.getStorageSync("data");
      getOperatorDataCardData(id).then((res) => {
        console.log("个人信息", res.data);
        this.user = res.data.user;
        this.commission = res.data.commission;
        this.orderStats = res.data.orderStats; //订单
        this.invitedUserStats = res.data.invitedUserStats; //邀请
        this.withdrawal = res.data.withdrawal; //提现
        console.log("个人信息222", res.data.commission);
      });
    },
  },
};
</script>

<style lang="less" scoped>
.main-container {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  overflow: scroll;
  background-color: #fff;
  background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/distribution/矩形 2@2x.png");
  background-size: 100% 100%;
}
.btn {
  padding: 0 40rpx;
  color: white;
  font-weight: bold;
  background: linear-gradient(180deg, #8aa8f6 0%, #b6d6e2 100%);
}
</style>
