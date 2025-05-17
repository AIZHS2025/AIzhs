<template>
  <view class="container">
    <!-- 学习进度概览 -->
    <view class="progress-overview">
      <view class="progress-item">
        <text class="progress-num">{{userProgress.totalCourses}}</text>
        <text class="progress-label">总课程数</text>
      </view>
      <view class="progress-item">
        <text class="progress-num">{{userProgress.completedCourses}}</text>
        <text class="progress-label">已完成</text>
      </view>
      <view class="progress-item">
        <text class="progress-num">{{userProgress.learningHours}}</text>
        <text class="progress-label">学习时长(小时)</text>
      </view>
    </view>

    <!-- 学习路径 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">学习路径</text>
        <text class="more-link" @tap="navigateTo('/pages/learn/paths')">更多</text>
      </view>
      <scroll-view scroll-x class="path-scroll">
        <view class="path-list">
          <view 
            class="path-card" 
            v-for="(item, index) in learningPaths" 
            :key="index"
            @tap="navigateTo(item.path)"
          >
            <image :src="item.cover" mode="aspectFill" class="path-image"></image>
            <view class="path-info">
              <text class="path-title">{{item.title}}</text>
              <text class="path-desc">{{item.description}}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 课程分类 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">课程分类</text>
        <text class="more-link" @tap="navigateTo('/pages/learn/categories')">更多</text>
      </view>
      <view class="category-grid">
        <view 
          class="category-item" 
          v-for="(item, index) in categories" 
          :key="index"
          @tap="navigateTo(item.path)"
        >
          <image :src="item.icon" mode="aspectFit" class="category-icon"></image>
          <text class="category-name">{{item.name}}</text>
        </view>
      </view>
    </view>

    <!-- 推荐课程 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐课程</text>
        <text class="more-link" @tap="navigateTo('/pages/learn/recommended')">更多</text>
      </view>
      <view class="course-list">
        <view 
          class="course-card" 
          v-for="(item, index) in recommendedCourses" 
          :key="index"
          @tap="navigateTo(item.path)"
        >
          <image :src="item.cover" mode="aspectFill" class="course-image"></image>
          <view class="course-info">
            <text class="course-title">{{item.title}}</text>
            <text class="course-desc">{{item.description}}</text>
            <view class="course-meta">
              <text class="course-level">{{item.level}}</text>
              <text class="course-duration">{{item.duration}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userProgress: {
        totalCourses: 50,
        completedCourses: 12,
        learningHours: 36
      },
      learningPaths: [
        {
          title: '新手入门',
          description: '从零开始掌握抖音运营',
          cover: '/static/learn/path1.jpg',
          path: '/pages/learn/path-detail?id=1'
        },
        {
          title: '私域运营',
          description: '打造私域流量池',
          cover: '/static/learn/path2.jpg',
          path: '/pages/learn/path-detail?id=2'
        }
      ],
      categories: [
        { name: '抖音运营', icon: '/static/learn/category1.png', path: '/pages/learn/category?id=1' },
        { name: '私域运营', icon: '/static/learn/category2.png', path: '/pages/learn/category?id=2' },
        { name: '内容创作', icon: '/static/learn/category3.png', path: '/pages/learn/category?id=3' },
        { name: '数据分析', icon: '/static/learn/category4.png', path: '/pages/learn/category?id=4' }
      ],
      recommendedCourses: [
        {
          title: '抖音本地推入门课程',
          description: '快速掌握抖音运营基础',
          cover: '/static/learn/course1.jpg',
          level: '入门',
          duration: '2小时',
          path: '/pages/learn/course-detail?id=1'
        },
        {
          title: '私域运营实战课程',
          description: '提升转化率的实用技巧',
          cover: '/static/learn/course2.jpg',
          level: '进阶',
          duration: '3小时',
          path: '/pages/learn/course-detail?id=2'
        }
      ]
    }
  },
  methods: {
    navigateTo(path) {
      uni.navigateTo({
        url: path
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 0;
}

.progress-overview {
  display: flex;
  justify-content: space-around;
  padding: $spacing-large;
  background-color: #FFFFFF;
  margin-bottom: $spacing-base;
  
  .progress-item {
    text-align: center;
    
    .progress-num {
      font-size: $font-size-xlarge;
      color: $primary-color;
      font-weight: bold;
      display: block;
      margin-bottom: $spacing-mini;
    }
    
    .progress-label {
      font-size: $font-size-small;
      color: $text-color-light;
    }
  }
}

.section {
  background-color: #FFFFFF;
  padding: $spacing-base;
  margin-bottom: $spacing-base;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-base;
}

.more-link {
  color: $text-color-light;
  font-size: $font-size-small;
}

.path-scroll {
  white-space: nowrap;
}

.path-list {
  display: inline-flex;
  padding: $spacing-base 0;
}

.path-card {
  width: 300rpx;
  margin-right: $spacing-base;
  background: #FFFFFF;
  border-radius: $border-radius-base;
  overflow: hidden;
  box-shadow: $box-shadow;
  
  .path-image {
    width: 100%;
    height: 180rpx;
  }
  
  .path-info {
    padding: $spacing-small;
    
    .path-title {
      font-size: $font-size-base;
      color: $text-color;
      @include text-ellipsis;
    }
    
    .path-desc {
      font-size: $font-size-small;
      color: $text-color-light;
      @include text-ellipsis;
    }
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-base;
  padding: $spacing-base 0;
}

.category-item {
  @include flex-center;
  flex-direction: column;
  
  .category-icon {
    width: 80rpx;
    height: 80rpx;
    margin-bottom: $spacing-mini;
  }
  
  .category-name {
    font-size: $font-size-small;
    color: $text-color;
  }
}

.course-list {
  .course-card {
    display: flex;
    margin-bottom: $spacing-base;
    background: #FFFFFF;
    border-radius: $border-radius-base;
    overflow: hidden;
    box-shadow: $box-shadow;
    
    .course-image {
      width: 200rpx;
      height: 200rpx;
    }
    
    .course-info {
      flex: 1;
      padding: $spacing-base;
      
      .course-title {
        font-size: $font-size-large;
        color: $text-color;
        margin-bottom: $spacing-mini;
      }
      
      .course-desc {
        font-size: $font-size-base;
        color: $text-color-light;
        margin-bottom: $spacing-base;
        @include text-ellipsis;
      }
      
      .course-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .course-level {
          font-size: $font-size-small;
          color: $accent-color;
          background-color: rgba($accent-color, 0.1);
          padding: 4rpx 12rpx;
          border-radius: $border-radius-small;
        }
        
        .course-duration {
          font-size: $font-size-small;
          color: $text-color-light;
        }
      }
    }
  }
}
</style> 