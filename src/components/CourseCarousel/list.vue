/** * Ripple_Yu * 热门课程 组件 * 点击 课程 提供跳转热门课程详情页 */
<template>
  <view class="popular-courses-container">
    <view class="popular-courses-tab-box">
      <view class="popular-courses-tab-item">
        <view
          class="popular-courses-tab-item-text"
          :class="[selectedTab === 0 ? 'active' : 'normal']"
          @click="handleTabClick(0)"
        >
          <text class="popular-courses-tab-item-text">爆款入门课程</text>
        </view>
        <view
          class="popular-courses-tab-item-text"
          :class="[selectedTab === 1 ? 'active' : 'normal']"
          @click="handleTabClick(1)"
        >
          <text class="popular-courses-tab-item-text">爆款精选课程</text>
        </view>
      </view>
    </view>

    <view class="popular-courses-list">
      <PopularCoursesList1
        v-if="selectedTab === 0"
        :CourseList="CourseList1"
        @course="oncourse"
      />
      <PopularCoursesList2
        v-else
        :CourseList="CourseList2"
        @course="oncourse"
      />
    </view>

    <!-- 占位元素 -->
    <view
      class="placeholder"
      :style="{ height: placeholderHeight + 'px' }"
    ></view>
  </view>
</template>

<script>
import PopularCoursesList1 from "../PopularCourses/PopularCoursesList1.vue";
import PopularCoursesList2 from "../PopularCourses/PopularCoursesList2.vue";
import { postPopularCourses } from "@/service/index.js";

export default {
  name: "PopularCourses",
  props: {
    CourseList1: {
      type: Array,
      default: "",
    },
    CourseList2: {
      type: Array,
      default: "",
    },
  },
  components: {
    PopularCoursesList1,
    PopularCoursesList2,
  },
  data() {
    return {
      selectedTab: 0,
      placeholderHeight: 0,
      isDataLoaded: false, // 添加数据加载状态标记
      title: "爆款入门课程",
    };
  },
  onLoad() {
    // this.popularCourses();
    // 加载页面时自动执行隐形登录
  },

  methods: {
    handleTabClick(index) {
      this.selectedTab = index;
      // 根据 tab 切换 title
      this.title = index === 0 ? "爆款入门课程" : "爆款精选课程";
    },

    handleMoreClick() {
      // 查看全部的处理逻辑，跳转到课程星球页面
      console.log("跳转到更多课程页面");
      console.log("点击了查看全部");
      uni.navigateTo({
        url: "/pages/course/MoreCourse",
      });
    },
    oncourse(item) {
      this.$emit("oncourses", item);
    },

    // popularCourses() {
    //   postPopularCourses()
    //     .then((res) => {
    //       if (res.data) {
    //         console.log("首页课程", res.data);
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

    // 计算占位符高度
    updatePlaceholderHeight() {
      if (!this.isDataLoaded) {
        return;
      }

      const currentList =
        this.selectedTab === 0 ? this.CourseList1 : this.CourseList2;
      if (!currentList || currentList.length === 0) {
        return;
      }

      // 固定高度为3个课程条目的高度加上其他元素高度
      // 每个列表项的高度 + 上边距
      const itemHeight = 174 + 20;
      // 仅计算实际显示的课程数量
      const courseCount = Math.min(currentList.length, 3);
      // 设置占位符高度 = 3个课程条目 + 额外边距
      this.placeholderHeight = courseCount * itemHeight + 60;
    },
  },

  created() {},

  watch: {
    // 监听列表变化，更新高度
    CourseList1: {
      handler() {
        if (this.isDataLoaded && this.selectedTab === 0) {
          this.updatePlaceholderHeight();
        }
      },
      deep: true,
    },
    CourseList2: {
      handler() {
        if (this.isDataLoaded && this.selectedTab === 1) {
          this.updatePlaceholderHeight();
        }
      },
      deep: true,
    },
    selectedTab() {
      this.$nextTick(() => {
        this.updatePlaceholderHeight();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.popular-courses-container {
  // width: 100%;
  // position: relative;
  // margin-bottom: 10rpx; /* 添加底部间距，防止内容贴底 */
  width: 100%;
  position: relative;
  margin-bottom: 0; /* 移除底部间距 */
  height: 730rpx; /* 设置固定高度 */
}

.popular-courses-title {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 确保两端对齐 */
  margin-bottom: 20rpx; /* 添加底部间距 */

  .popular-courses-title-text {
    display: flex;
    align-items: center;

    .popular-courses-title-text-icon {
      width: 62rpx;
      height: 62rpx;
      margin-right: 20rpx;
    }

    .popular-courses-title-text-text {
      font-size: 32rpx;
      font-weight: bold;
      color: #000;
    }
  }
}

.popular-courses-more {
  display: flex;
  align-items: center;

  .popular-courses-more-text {
    margin-left: 40rpx;
    font-size: 28rpx;
    font-weight: bold;
    color: #000;
  }

  .popular-courses-more-arrow {
    width: 30rpx;
    height: 30rpx;
    margin-left: 10rpx;
  }
}

.popular-courses-tab-box {
  margin-top: -20rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 736rpx;
  height: 80rpx;
  // position: absolute;
  // top: -45rpx;
  // left: 0;

  .popular-courses-tab-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10rpx;
    width: 513rpx;
    height: 64rpx;
    border-top-left-radius: 32rpx;
    border-radius: 32rpx;
    background-color: #f5f5f5;
    overflow: hidden;

    .active {
      background-color: #6ab0e5;
      color: #fff;
    }

    .normal {
      background-color: #f5f5f5;
      color: #93d2f3;
    }

    .popular-courses-tab-item-text {
      line-height: 66rpx;
      width: 50%;
      height: 100%;
      font-size: 28rpx;
      font-weight: bold;
      text-align: center;
    }
  }

  .popular-courses-nav-img {
    width: 150rpx;
    height: 160rpx;
    position: absolute;
    top: 80rpx;
    right: 20rpx;
  }
}

.popular-courses-list {
  // position: absolute;
  // top: 200rpx;
  // left: 0;
  margin-top: 30rpx;
  width: 95%;
  border: 2rpx solid #f5f5f5;
  border-radius: 40rpx;
  padding: 0 15rpx 30rpx 15rpx; /* 增加底部padding */
  max-height: 660rpx; /* 限制最大高度为3个课程 */
  overflow: hidden; /* 超出部分隐藏 */
}

/* 占位元素样式 */
.placeholder {
  width: 100%;
  opacity: 0;
  pointer-events: none;
}
</style>
