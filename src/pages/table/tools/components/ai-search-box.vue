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
        
        <!-- 语音识别按钮 -->
        <view class="voice-btn" @tap="startVoiceRecognition">
          <image 
            :src="isRecording ? voiceActiveIcon : voiceIcon"
            mode="aspectFit"
            class="voice-icon"
          />
        </view>
        
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
  
      // 初始化语音识别
      initVoiceRecognition() {
        // 监听录音结束事件
        this.recorderManager.onStop((res) => {
          this.isRecording = false;
          // 发送录音文件到语音识别服务
          this.recognizeVoice(res.tempFilePath);
        });
  
        // 监听录音错误事件
        this.recorderManager.onError((err) => {
          this.isRecording = false;
          uni.showToast({
            title: '录音失败',
            icon: 'none'
          });
        });
      },
  
      // 开始语音识别
      startVoiceRecognition() {
        if (this.isRecording) {
          this.recorderManager.stop();
          return;
        }
  
        // 请求录音权限
        uni.authorize({
          scope: 'scope.record',
          success: () => {
            this.isRecording = true;
            // 开始录音
            this.recorderManager.start({
              duration: 60000, // 最长录音时间，单位ms
              sampleRate: 16000, // 采样率
              numberOfChannels: 1, // 录音通道数
              encodeBitRate: 96000, // 编码码率
              format: 'mp3' // 音频格式
            });
  
            uni.showToast({
              title: '开始录音',
              icon: 'none'
            });
          },
          fail: () => {
            uni.showToast({
              title: '请授权录音权限',
              icon: 'none'
            });
          }
        });
      },
  
      // 语音识别处理
      async recognizeVoice(tempFilePath) {
        try {
          uni.showLoading({
            title: '识别中...'
          });
  
          // 这里需要对接实际的语音识别服务
          // 示例：上传录音文件到服务器进行识别
          const result = await this.uploadVoiceFile(tempFilePath);
          
          // 将识别结果显示在输入框中
          this.searchText = result.text;
          this.$emit('input', this.searchText);
  
          uni.hideLoading();
        } catch (error) {
          uni.hideLoading();
          uni.showToast({
            title: '识别失败，请重试',
            icon: 'none'
          });
        }
      },
  
      // 上传语音文件（示例方法）
      async uploadVoiceFile(tempFilePath) {
        // 这里需要实现实际的文件上传和语音识别逻辑
        // 返回格式示例：{ text: '识别的文字内容' }
        return new Promise((resolve) => {
          // 模拟识别过程
          setTimeout(() => {
            resolve({ text: '示例识别文本' });
          }, 1000);
        });
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
  
    .voice-btn,
    .navigate-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80rpx;
      height: 100%;
      
      .voice-icon,
      .navigate-icon {
        width: 44rpx;
        height: 44rpx;
      }
    }
  
    .voice-btn {
      border-right: 1px solid rgba(0, 0, 0, 0.1);
    }
  
    .navigate-btn {
      .navigate-icon {
        width: 36rpx;
        height: 36rpx;
      }
    }
  }
  
  // 录音动画效果
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .voice-icon.recording {
    animation: pulse 1.5s infinite;
  }
  </style>