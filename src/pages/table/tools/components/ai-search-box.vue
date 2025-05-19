/* 智能体页面 输入框：支持文本输入和语音输入两种方式
*  @author: TONG
*  @date: 2025-04-29
*/

<template>
    <view class="ai-search-box">
      <view class="search-container">
        <!-- 输入框 -->
        <input
          class="search-input"
          type="text"
          v-model="searchText"
          :placeholder="placeholder"
          placeholder-class="placeholder-style"
          @input="onInput"
          @confirm="onSearch"
        />
        
        <!-- 跳转按钮 -->
        <view class="navigate-btn" @tap="onNavigate">
          <image 
            src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/home/跳转.png"
            mode="aspectFit"
            class="navigate-icon"
          />
        </view>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    name: 'AISearchBox',
    
    data() {
      return {
        searchText: '',
        isRecording: false,
        voiceIcon: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/home/话筒语音.png',
        voiceActiveIcon: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/home/话筒语音.png',
        recorderManager: null
      }
    },
  
    props: {
      placeholder: {
        type: String,
        default: '请输入产品或服务需求'
      }
    },
  
    created() {
      // 初始化录音管理器
      this.recorderManager = uni.getRecorderManager();
      this.initVoiceRecognition();
    },
  
    methods: {
      // 输入事件
      onInput(e) {
        this.searchText = e.detail.value;
        this.$emit('input', this.searchText);
      },
  
      // 搜索事件
      onSearch() {
        this.$emit('search', this.searchText);
      },
  
      // 跳转按钮点击事件
      onNavigate() {
        this.$emit('navigate', this.searchText);
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .ai-search-box {
    padding: 20rpx;
    
    .search-container {
      display: flex;
      align-items: center;
      background-color: #E6F3FA;
      border-radius: 40rpx;
      padding: 10rpx 20rpx;
      height: 80rpx;
    }
  
    .search-input {
      flex: 1;
      height: 100%;
      font-size: 28rpx;
      color: #333;
      padding: 0 20rpx;
    }
  
    .placeholder-style {
      color: #999;
      font-size: 28rpx;
    }
  
    .navigate-btn {
      .navigate-icon {
        width: 36rpx;
        height: 36rpx;
      }
    }
  }
  
  </style>