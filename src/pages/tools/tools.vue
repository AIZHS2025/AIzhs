<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input type="text" placeholder="搜索模板/案例" v-model="searchKey" @input="handleSearch" />
    </view>

    <!-- 功能分类 -->
    <view class="category-tabs">
      <view 
        class="tab-item" 
        v-for="(item, index) in categories" 
        :key="index"
        :class="{ active: currentCategory === item.id }"
        @tap="switchCategory(item.id)"
      >
        {{item.name}}
      </view>
    </view>

    <!-- 内容列表 -->
    <scroll-view scroll-y class="content-container" @scrolltolower="loadMore">
      <view class="list-item" v-for="(item, index) in contentList" :key="index" @tap="navigateToDetail(item)">
        <image :src="item.cover" mode="aspectFill" class="item-image"></image>
        <view class="item-info">
          <text class="item-title">{{item.title}}</text>
          <text class="item-desc">{{item.description}}</text>
          <view class="item-meta">
            <text class="item-category">{{item.category}}</text>
            <text class="item-date">{{item.date}}</text>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="loading-more" v-if="hasMore">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchKey: '',
      currentCategory: 'all',
      categories: [
        { id: 'all', name: '全部' },
        { id: 'diagnosis', name: '账号诊断' },
        { id: 'template', name: '模板库' },
        { id: 'case', name: '案例拆解' }
      ],
      contentList: [],
      page: 1,
      hasMore: true
    }
  },
  onLoad() {
    this.loadContent()
    document.body.style.overflow = 'hidden';
  },
  beforeDestroy() {
    document.body.style.overflow = '';
  },
  methods: {
    switchCategory(category) {
      this.currentCategory = category
      this.page = 1
      this.contentList = []
      this.loadContent()
    },
    handleSearch() {
      this.page = 1
      this.contentList = []
      this.loadContent()
    },
    loadContent() {
      // 模拟加载数据
      const mockData = [
        {
          id: 1,
          title: '抖音账号诊断报告',
          description: '基于AI的账号数据分析与优化建议',
          cover: '/static/tools/diagnosis1.jpg',
          category: '账号诊断',
          date: '2024-03-25'
        },
        {
          id: 2,
          title: '餐饮行业引流文案模板',
          description: '10+套高转化文案模板',
          cover: '/static/tools/template1.jpg',
          category: '模板库',
          date: '2024-03-24'
        }
      ]
      
      setTimeout(() => {
        this.contentList = [...this.contentList, ...mockData]
        this.hasMore = this.page < 3
        this.page++
      }, 500)
    },
    loadMore() {
      if (this.hasMore) {
        this.loadContent()
      }
    },
    navigateToDetail(item) {
      uni.navigateTo({
        url: `/pages/tools/detail?id=${item.id}&type=${this.currentCategory}`
      })
    },
    scrollToBottom() {
      requestAnimationFrame(() => {
        const container = document.querySelector('.content-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }
}
</script>

<style lang="scss">
.container {
  padding: 0;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.search-bar {
  padding: $spacing-base;
  background-color: #FFFFFF;
  
  input {
    background-color: $background-color;
    height: 72rpx;
    border-radius: $border-radius-base;
    padding: 0 $spacing-base;
    font-size: $font-size-base;
  }
}

.category-tabs {
  display: flex;
  background-color: #FFFFFF;
  padding: $spacing-base;
  border-bottom: 1rpx solid $border-color;
  
  .tab-item {
    padding: $spacing-small $spacing-base;
    margin-right: $spacing-base;
    font-size: $font-size-base;
    color: $text-color-light;
    border-radius: $border-radius-base;
    
    &.active {
      color: $accent-color;
      background-color: rgba($accent-color, 0.1);
    }
  }
}

.content-container {
  height: calc(100vh - 240rpx);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.list-item {
  display: flex;
  background-color: #FFFFFF;
  border-radius: $border-radius-base;
  margin-bottom: $spacing-base;
  overflow: hidden;
  box-shadow: $box-shadow;
  
  .item-image {
    width: 200rpx;
    height: 200rpx;
  }
  
  .item-info {
    flex: 1;
    padding: $spacing-base;
    
    .item-title {
      font-size: $font-size-large;
      color: $text-color;
      margin-bottom: $spacing-mini;
    }
    
    .item-desc {
      font-size: $font-size-base;
      color: $text-color-light;
      margin-bottom: $spacing-base;
      @include text-ellipsis;
    }
    
    .item-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .item-category {
        font-size: $font-size-small;
        color: $accent-color;
        background-color: rgba($accent-color, 0.1);
        padding: 4rpx 12rpx;
        border-radius: $border-radius-small;
      }
      
      .item-date {
        font-size: $font-size-small;
        color: $text-color-light;
      }
    }
  }
}

.loading-more {
  text-align: center;
  padding: $spacing-base;
  color: $text-color-light;
  font-size: $font-size-small;
}
</style> 