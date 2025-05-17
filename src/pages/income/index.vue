<!-- 我的佣金 -->
<template>
  <view class="type">
    <navigation-bars
      :image="image"
      title="我的佣金"
      color="black"
      viscosity="true"
    />
    <view>
      <accumulation
        :today_commission="today_commission"
        :total_earnings="total_earnings"
        :balance="balance"
        :lists="list"
      ></accumulation>
    </view>
  </view>
</template>

<script>
import NavigationBars from "@/components/navigation-bars/index.vue";
import Accumulation from "@/pages/income/components/accumulation/index.vue";
import { getUserCommissionDetail } from "@/service/trader.js";

export default {
  components: {
    NavigationBars,
    Accumulation,
  },
  data() {
    return {
      today_commission: "",
      total_earnings: "",
      balance: "",
      list: [],
      isShow: false,
      image:
        "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/user/左.png",
    };
  },
  onLoad() {
    this.getUserCommissionDetail();
  },
  methods: {
    getUserCommissionDetail() {
      const { id } = uni.getStorageSync("data");
      getUserCommissionDetail(id).then((res) => {
        this.total_earnings = res.data.total_earnings;
        this.today_commission = res.data.today_commission;
        this.balance = res.data.balance;
        this.list = res.data.commission_list;
        console.log("获取操盘手获取佣金页面信息", res.data);
      });
    },
  },
  computed: {
    topBarHeight() {
      return this.$styleVariables["--app-top-bar-height"];
    },
  },
};
</script>

<style lang="scss" scoped>
.type {
  min-height: 100vh;
  background: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/yongjin/picture1@2x.png");
}
</style>
