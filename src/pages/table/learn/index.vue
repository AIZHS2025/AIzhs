<template>
  <view class="main-container">
    <view
      style="
        width: 100%;
        height: 60rpx;
        border-radius: 40rpx;
        background: #e8e8e8;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <img
        :src="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/coursePlanet/ss.png'"
        alt="aspectFill"
        style="width: 40rpx; height: 40rpx; margin-left: 20rpx"
      />
      <input
        style="height: 100%; width: 100%; color: black"
        placeholder="请输入你需要输入的课程内容"
      />
    </view>
    <CourseCarousel @item-click="onCarouselItemClick" />
    <MoreTitles :images="images" title="推荐课程" />
    <Menu />

    <MoreTitles
      images="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/coursePlanet/6.png"
      title="课程赛道"
    />
    <CourseCarouselList
      :CourseList1="CourseList1"
      :CourseList2="CourseList2"
      @oncourses="oncourseClick"
    />
    <MoreTitles
      images="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/coursePlanet/9.png"
      title="最新课程"
    />
    <UpToDate :list="list" @upToDate="upToDateClick" />
  </view>
</template>

<script>
import courseCarousel from "@/components/CourseCarousel/index.vue";
import BottomFigure from "@/components/BottomFigure/index.vue";
import MoreTitles from "@/components/MoreTitles/index.vue";
import CourseCarouselList from "@/components/CourseCarousel/list.vue";
import Menu from "@/components/Menu/index.vue";
import UpToDate from "@/components/CourseCarousel/UpToDate.vue";
import { postPopularCourses } from "@/service/index.js";
import { getCoursePlanet } from "@/service/coursePlanet.js";
import { pay } from "@/utils/pay/index.js";

export default {
  components: {
    courseCarousel,
    MoreTitles,
    CourseCarouselList,
    Menu,
    UpToDate,
    BottomFigure,
  },
  data() {
    return {
      id: "1",
      CourseList1: [],
      CourseList2: [],
      list: [],
      images:
        "https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/coursePlanet/1.png",
      showModal: false,
    };
  },
  onLoad() {
    this.coursePlanet();
    // this.popularCourses();
  },
  methods: {
    //数据获取方法
    // popularCourses() {
    //   postPopularCourses()
    //     .then((res) => {
    //       if (res.data) {
    //         console.log("首页课程", res.data);
    //         this.list = res.data;
    //         this.CourseList1 = res.data
    //           .filter((item) => item.type === 1)
    //           .slice(0, 3);
    //         this.CourseList2 = res.data
    //           .filter((item) => item.type === 2)
    //           .slice(0, 3);
    //       }
    //     })
    //     .catch((err) => {
    //       console.error("首页课程", err);
    //     });
    // },

    onCarouselItemClick(item) {
      // 处理轮播图点击事件
      console.log("父组件收到点击事件，轮播图ID：", item.id);
    },

    handerServiceClick(item) {
      if (item.id === 1) {
        this.showModal = true;
      }
      console.log("从子组件接收到的ID:", item.id);
    },
    oncourseClick(item) {
      if (item.type === 1) {
        const vip = uni.getStorageSync("vip");
        if (vip === true) {
          uni.showToast({
            title: "用户已是会员",
            icon: "none",
          });
        } else {
          uni.showToast({
            title: "请充值会员",
            icon: "none",
          });
        }
        console.log("vip", vip);
      } else {
        pay(item.id, 3).then((res) => {
          console.log("执行了购买");
        });
      }
      console.log("父组件", item);
    },
    close() {
      this.showModal = false;
    },
    coursePlanet() {
      getCoursePlanet().then((res) => {
        this.CourseList1 = res.data.beginner_courses;
        this.CourseList2 = res.data.selected_courses;
        this.list = res.data.hot_courses;
        console.log("课程数据");
      });
    },
    upToDateClick(item) {
      if (item.type === 1) {
        const vip = uni.getStorageSync("vip");
        if (vip === true) {
          uni.showToast({
            title: "用户已是会员",
            icon: "none",
          });
        } else {
          uni.showToast({
            title: "请充值会员",
            icon: "none",
          });
        }
        console.log("vip", vip);
      } else {
        pay(item.id, 3).then((res) => {
          console.log("执行了购买");
        });
      }
    },
    // handleLongPress(){
    // 	  uni.showToast({
    // 	        title: '长按识别二维码',
    // 	        icon: 'none'
    // 	      });
    // },

    handleFeatureClick(type) {
      uni.vibrateShort();

      if (type === "ai-copywriting") {
        uni.navigateTo({
          url: "/pages/tools/ai_wenan",
        });
        return;
      }

      if (type === "ai-image") {
        uni.navigateTo({
          url: "/pages/tools/ai_photo",
        });
        return;
      }

      if (type === "marketing") {
        uni.navigateTo({
          url: "/pages/tools/ai-marketing",
        });
        return;
      }

      uni.showToast({
        title: "功能开发中",
        icon: "none",
      });
    },
    handleCourseClick(course) {
      uni.vibrateShort();
      uni.showToast({
        title: "课程详情开发中",
        icon: "none",
      });
    },
    handleNewsClick(news) {
      uni.vibrateShort();
      uni.showToast({
        title: "资讯详情开发中",
        icon: "none",
      });
    },
    handleViewAll(type) {
      uni.vibrateShort();
      uni.showToast({
        title: "更多内容开发中",
        icon: "none",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.main-container {
  padding: 20rpx 20rpx 0 20rpx;
  // height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #fafcff 0%, #81b5ff 100%);
}
</style>
