<template>
  <view class="type" style="color: white">
    <navigation-bars
      color="black"
      viscosity="true"
      title="知识星球"
      :backgroundColor="color"
    />
    <view style="padding: 0 20rpx">
      <title-switch :information="information" :aiData="aiData"></title-switch>
    </view>
  </view>
</template>

<script>
import NavigationBars from "@/components/navigation-bars/index.vue";
import { getKnowledgePlanetInfo } from "@/service/knowledgePlanet.js";
import TitleSwitch from "./components/title-switch/index.vue";
export default {
  components: {
    NavigationBars,
    TitleSwitch,
  },
  data() {
    return {
      index: 1,
      color: "",
      information: {},
      aiData: {},
    };
  },
  mounted() {
    getKnowledgePlanetInfo(1).then((res) => {
      this.information = res.data;
      getKnowledgePlanetInfo(3).then((res) => {
        this.aiData = res.data;
      });
    });
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
    this.color = e.scrollTop > 20 ? "white" : "transparent";
  },
  methods: {
    getKnowledgePlanetInfo(type) {
      getKnowledgePlanetInfo(type).then((res) => {
        return res.data;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.type {
  min-height: 100vh;
  background: linear-gradient(180deg, #cbeaf1 0%, #f6f7f7 100%);
}
</style>
