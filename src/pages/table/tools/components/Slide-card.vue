/* 滑动卡片，关联兴趣赛道
*  @author: TONG
*  @date: 2025-04-29
*/

<template>
    <view class="slide-card">
      <scroll-view 
        class="scroll-view" 
        scroll-x 
        :show-scrollbar="false"
        @scroll="onScroll"
      >
        <view class="tag-list">
          <view 
            v-for="(item, index) in tagList" 
            :key="index"
            class="tag-item"
            :class="{ active: activeIndex === index }"
            @tap="onTagClick(index)"
          >
            <text>{{ item.name }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </template>
  
  <script>
  export default {
    name: 'SlideCard',
    data() {
      return {
        activeIndex: 0,
        tagList: [
          { name: '推荐', id: 'recommend' },
          { name: '人工智能', id: 'ai' },
          { name: '电商', id: 'ecommerce' },
          { name: '智能汽车', id: 'smart_car' },
          { name: '短视频与直播', id: 'short_video' },
          { name: '元宇宙', id: 'metaverse' },
          { name: '互联网医疗', id: 'internet_medical' },
          { name: '在线教育', id: 'online_edu' },
          { name: '社交', id: 'social' },
          { name: '互联网金融', id: 'financial' },
          { name: '物流与供应链', id: 'logistics' },
          { name: '智能家居', id: 'smart_home' },
          { name: '企业服务', id: 'enterprise_service' },
          { name: '游戏', id: 'game' },
          { name: '环保与新能源', id: 'environment_and_energy' },
          { name: '文化创意', id: 'cultural_creative' },
          { name: '数字娱乐', id: 'digital_entertainment' },
        ]
      }
    },
    methods: {
      onTagClick(index) {
        this.activeIndex = index;
        this.$emit('change', this.tagList[index]);
      },
      onScroll(e) {
        // 可以添加滚动事件处理
        this.$emit('scroll', e);
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .slide-card {
    width: 100%;
    margin: 30rpx 0;
    
    .scroll-view {
      width: 100%;
      white-space: nowrap;
    }
  
    .tag-list {
      display: inline-flex;
      padding: 0 2rpx;
    }
  
    .tag-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64rpx;
      padding: 0 32rpx;
      margin-right: 20rpx;
      background: #FFFFFF;
      border-radius: 32rpx;
      font-size: 28rpx;
      color: #666666;
      transition: all 0.3s;
      
      &:last-child {
        margin-right: 0;
      }
      
      &.active {
        background: linear-gradient(180deg,rgba(242, 245, 201, 1) 0%, rgba(193, 229, 246, 1) 66%);
        color: #333333;
        font-weight: 500;
      }
    }
  }
  
  // 隐藏滚动条
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    color: transparent;
  }
  </style>