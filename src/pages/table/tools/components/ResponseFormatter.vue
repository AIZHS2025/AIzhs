<template>
  <view style="display:none">
    <!-- 文本内容 -->
    <view class="message-text" v-if="formattedText" v-html="formattedText"></view>
    
    <!-- 图片内容 -->
    <view class="image-container" v-if="imageUrls && imageUrls.length > 0">
      <view v-for="(url, index) in imageUrls" :key="index" class="image-item">
        <image 
          :src="url" 
          mode="widthFix" 
          class="content-image"
          @tap="previewImage(url)"
          @error="handleImageError(url)"
        ></image>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ResponseFormatter',
  props: {
    // 原始响应文本或JSON字符串
    responseData: {
      type: [String, Object],
      default: ''
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      formattedText: '',
      videoUrl: '',
      imageUrls: [],
      processedJson: null,
      urlPattern: /https?:\/\/[^\s"]+\.[^\s"]+/g
    }
  },
  watch: {
    responseData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.processResponse(newVal);
        }
      }
    }
  },
  methods: {
    // 处理API响应
    processResponse(data) {
      if (!data) return;
      
      let responseText = '';
      let videoUrl = '';
      let imageUrls = [];
      let processedData = null;
      
      try {
        // 首先尝试处理可能的JSON对象或数组
        if (this.isJsonData(data)) {
          // 处理JSON格式数据
          const result = this.processJsonData(data);
          
          // 保存处理结果
          processedData = result.data;
          this.processedJson = processedData;
          
          // 设置视频URL
          if (result.videoUrl) {
            videoUrl = result.videoUrl;
            // 不再将视频URL添加到文本中，只保存URL信息
            this.$emit('media-detected', {
              type: 'video',
              url: videoUrl
            });
          }
          
          // 设置图片URL
          if (result.imageUrls && result.imageUrls.length > 0) {
            imageUrls = result.imageUrls;
            this.imageUrls = imageUrls;
            this.$emit('media-detected', {
              type: 'image',
              urls: imageUrls
            });
          }
          
          // 设置文本内容
          if (result.textContent) {
            responseText = result.textContent;
          } else if (processedData) {
            const extractedText = this.extractTextFromObject(processedData);
            if (extractedText.trim()) {
              responseText = extractedText;
            } else if (!responseText) {
              responseText = JSON.stringify(processedData, null, 2);
            }
          }
          
          this.$emit('json-processed', processedData);
        } else {
          // 处理非JSON格式
          let output = data;
          if (typeof data === 'string') {
            // 提取Output字段
            try {
              const jsonObj = JSON.parse(data);
              if (jsonObj.Output || jsonObj.output) {
                output = jsonObj.Output || jsonObj.output;
              }
            } catch (e) {
              // 不是有效JSON，继续使用原始字符串
              output = data;
            }
          } else if (typeof data === 'object') {
            output = data.Output || data.output || JSON.stringify(data);
          }
          
          // 处理文本输出
          if (typeof output === 'string') {
            // 检查是否是视频URL
            if (output.includes('.mp4') || 
                output.includes('.mov') || 
                output.includes('video')) {
              
              videoUrl = output.replace(/^"/, '').replace(/"$/, '')
                           .replace(/\\"/g, '"')
                           .replace(/\\\\/g, '\\');
              
          
              
              this.$emit('media-detected', {
                type: 'video',
                url: videoUrl
              });
            } else {
              // 检查是否包含图片URL
              const imgMatches = this.extractAllImageUrls(output);
              if (imgMatches && imgMatches.length > 0) {
                imageUrls = imgMatches;
                this.imageUrls = imageUrls;
                
                // 从文本中移除图片URL
                let pureText = output;
                imgMatches.forEach(url => {
                  pureText = pureText.replace(url, '');
                });
                
                responseText = pureText.replace(/\n+/g, '\n').trim();
                
                this.$emit('media-detected', {
                  type: 'image',
                  urls: imageUrls
                });
              } else {
                // 处理纯文本
                responseText = output;
                
                // 清除格式为["output":" 或 {"Output":" 的前缀
                responseText = responseText.replace(/^\s*\[?"[Oo]utput":\s*"/, '')
                  .replace(/^\s*\{?"[Oo]utput":\s*"/, '')
                  .replace(/^\s*"[Oo]utput":\s*"/, '');
                
                // 清除尾部引号和括号
                responseText = responseText.replace(/"\s*\}?\s*\]?\s*$/, '')
                  .replace(/"\s*\}?\s*$/, '');
                
                // 替换转义字符
                responseText = responseText.replace(/\\n/g, '\n')
                             .replace(/\\"/g, '"')
                             .replace(/\\\\/g, '\\');
                
                // 检测URL链接
                const urlMatches = responseText.match(this.urlPattern);
                if (urlMatches && urlMatches.length > 0) {
                  this.$emit('links-detected', urlMatches);
                  
                  // 检查图片链接
                  const imageLinks = urlMatches.filter(url => 
                    url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i)
                  );
                  
                  if (imageLinks.length > 0) {
                    imageUrls = [...imageUrls, ...imageLinks];
                    this.imageUrls = imageUrls;
                    
                    this.$emit('media-detected', {
                      type: 'image',
                      urls: imageLinks
                    });
                  }
                  
                  // 检查视频链接
                  const videoLinks = urlMatches.filter(url => 
                    url.match(/\.(mp4|mov|webm|ogg|avi)(\?.*)?$/i) || url.includes('video')
                  );
                  
                  if (videoLinks.length > 0) {
                    // 不再将URL添加到文本中，只发送事件通知
                    videoUrl = videoLinks[0]; // 保存第一个视频链接
                    
                    this.$emit('media-detected', {
                      type: 'video',
                      url: videoLinks[0]
                    });
                  }
                }
                
                // 格式化文本
                responseText = this.formatContentWithHighlight(responseText);
              }
            }
          }
        }
      } catch (error) {
        console.error('处理响应失败:', error);
        // 失败时使用原始数据
        responseText = typeof data === 'string' ? data : JSON.stringify(data);
        responseText = this.formatContentWithHighlight(responseText);
      }
      
      this.formattedText = responseText;
      
      // 更新状态
      this.videoUrl = videoUrl;
      
      // 发送处理完成事件
      this.$emit('response-processed', {
        text: this.formattedText,
        videoUrl: this.videoUrl,
        imageUrls: this.imageUrls,
        originalData: data,
        processedData: processedData
      });
    },
    
    // 从对象中提取文本内容
    extractTextFromObject(obj) {
      if (!obj) return '';
      
      // 优先从这些字段提取文本
      const textFields = [
        'text', 'content', 'message', 'description', 'wenan', 
        'title', 'body', 'note', 'summary', 'detail'
      ];
      
      let result = '';
      
      // 字符串直接返回
      if (typeof obj === 'string') {
        return obj;
      }
      
      // 数组提取每个元素的文本
      if (Array.isArray(obj)) {
        return obj.map(item => this.extractTextFromObject(item)).filter(Boolean).join('\n\n');
      }
      
      // 对象提取指定字段
      if (typeof obj === 'object' && obj !== null) {
        // 优先检查特定字段
        for (const field of textFields) {
          if (obj[field]) {
            const extracted = this.extractTextFromObject(obj[field]);
            if (extracted) {
              result += (result ? '\n\n' : '') + extracted;
            }
          }
        }
        
        // 找不到特定字段则尝试提取所有可能的文本
        if (!result) {
          for (const key in obj) {
            // 忽略非内容字段
            if (['id', 'timestamp', 'type', 'date', 'status', 'code'].includes(key)) {
              continue;
            }
            
            if (typeof obj[key] === 'string' || 
                Array.isArray(obj[key]) || 
                (typeof obj[key] === 'object' && obj[key] !== null)) {
              
              const extracted = this.extractTextFromObject(obj[key]);
              if (extracted) {
                result += (result ? '\n\n' : '') + extracted;
              }
            }
          }
        }
      }
      
      return result;
    },
    
    // 检查数据是否为JSON格式
    isJsonData(data) {
      if (typeof data === 'object' && data !== null) {
        return true;
      }
      
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return typeof parsed === 'object' && parsed !== null;
        } catch (e) {
          return false;
        }
      }
      
      return false;
    },
    
    // 处理JSON数据
    processJsonData(data) {
      // 初始化结果
      const result = {
        data: null,
        videoUrl: null,
        textContent: '',
        imageUrls: []
      };
      
      // 确保处理的是对象
      let jsonData = data;
      if (typeof data === 'string') {
        try {
          jsonData = JSON.parse(data);
        } catch (e) {
          // 解析失败，返回原始结果
          result.textContent = data;
          return result;
        }
      }
      
      // 保存原始数据
      result.data = jsonData;
      
      // 提取媒体和文本内容
      this.extractContentFromJson(jsonData, result);
      
      return result;
    },
    
    // 从JSON提取内容
    extractContentFromJson(json, result) {
      // 处理数组
      if (Array.isArray(json)) {
        json.forEach(item => {
          if (typeof item === 'string') {
            // 检查是否是视频或图片链接
            if (this.isVideoUrl(item)) {
              result.videoUrl = item;
            } else if (this.isImageUrl(item)) {
              result.imageUrls.push(item);
            } else {
              // 文本内容
              if (result.textContent) result.textContent += '\n\n';
              result.textContent += item;
            }
          } else if (typeof item === 'object' && item !== null) {
            this.extractContentFromJson(item, result);
          }
        });
        return;
      }
      
      // 处理对象
      if (typeof json === 'object' && json !== null) {
        // 检查常见的字段
        if (json.Output || json.output) {
          const output = json.Output || json.output;
          if (typeof output === 'string') {
            if (this.isVideoUrl(output)) {
              result.videoUrl = output;
            } else if (this.isImageUrl(output)) {
              result.imageUrls.push(output);
            } else {
              if (result.textContent) result.textContent += '\n\n';
              result.textContent += output;
            }
          } else {
            this.extractContentFromJson(output, result);
          }
        }
        
        // 遍历对象的所有字段
        for (const key in json) {
          const value = json[key];
          
          // 检查是否是媒体URL或内容字段
          if (typeof value === 'string') {
            if (key.includes('video') || this.isVideoUrl(value)) {
              result.videoUrl = value;
            } else if (key.includes('image') || this.isImageUrl(value)) {
              result.imageUrls.push(value);
            } else if (
              key.includes('text') || 
              key.includes('content') || 
              key.includes('message')
            ) {
              if (result.textContent) result.textContent += '\n\n';
              result.textContent += value;
            }
          } else if (typeof value === 'object' && value !== null) {
            this.extractContentFromJson(value, result);
          }
        }
      }
    },
    
    // 检查是否是图片URL
    isImageUrl(url) {
      if (typeof url !== 'string') return false;
      return url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i) !== null || 
             url.includes('image') || 
             url.includes('/img/') ||
             url.includes('/images/');
    },
    
    // 检查是否是视频URL
    isVideoUrl(url) {
      if (typeof url !== 'string') return false;
      return url.match(/\.(mp4|mov|webm|ogg|avi)(\?.*)?$/i) !== null || 
             url.includes('video');
    },
    
    // 格式化文本内容
    formatContentWithHighlight(text) {
      if (!text) return '';
      
      // 确保text是字符串
      if (typeof text !== 'string') {
        text = String(text);
      }
      
      // 将URL转换为可点击的链接
      text = this.convertUrlsToLinks(text);
      
      return text;
    },
    
    // 转换URL为链接
    convertUrlsToLinks(text) {
      return text.replace(this.urlPattern, url => {
        if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i)) {
          return `<a href="${url}" class="link image-link">${url}</a>`;
        } else if (url.match(/\.(mp4|mov|webm|ogg|avi)(\?.*)?$/i)) {
          return `<a href="${url}" class="link video-link">${url}</a>`;
        } else {
          return `<a href="${url}" class="link">${url}</a>`;
        }
      });
    },
    
    // 预览图片
    previewImage(url) {
      uni.previewImage({
        urls: [url],
        current: url,
        indicator: 'default',
        loop: false
      });
      
      this.$emit('preview-image', url);
    },
    
    // 图片错误处理
    handleImageError(url) {
      console.error('图片加载失败:', url);
      
      // 触发媒体错误事件，让上层组件处理
      this.$emit('media-error', url);
      
      // 移除失败的图片URL
      this.imageUrls = this.imageUrls.filter(item => item !== url);
      
      // 尝试使用图片代理重写URL
      const tryPrefixes = ['https://images.weserv.nl/?url='];
      
      // 尝试修复图片
      tryPrefixes.forEach(prefix => {
        if (!url.startsWith(prefix)) {
          const newUrl = prefix + encodeURIComponent(url);
          // 替换原来的URL
          const index = this.imageUrls.indexOf(url);
          if (index !== -1) {
            this.imageUrls.splice(index, 1, newUrl);
          } else {
            // 图片已被移除，重新添加
            this.imageUrls.push(newUrl);
          }
          
          // 通知处理了修复
          this.$emit('media-fixed', {
            originalUrl: url,
            newUrl: newUrl
          });
        }
      });
    },
    
    // 提取图片URL
    extractAllImageUrls(text) {
      if (!text || typeof text !== 'string') return [];
      
      // 检查图片URL模式
      const imgPattern = /(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s"']*)?)/gi;
      const imgMatches = text.match(imgPattern) || [];
      
      return [...new Set(imgMatches)]; // 去重
    }
  }
}
</script>

<style lang="scss">
.message-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: #333;
  
  a.link {
    color: #42A5F5;
    text-decoration: underline;
    word-break: break-all;
    
    &.image-link {
      color: #4CAF50;
    }
    
    &.video-link {
      color: #F44336;
    }
  }
}

.image-container {
  margin: 20rpx 0;
  width: 100%;
  
  .image-item {
    margin-bottom: 30rpx;
    width: 100%;
    
    .content-image {
      width: 100% !important;
      height: auto !important;
      border-radius: 12rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    }
  }
}

.video-url-display {
  margin: 10rpx 0;
  padding: 15rpx;
  background-color: rgba(0,0,0,0.05);
  border-radius: 10rpx;
  word-break: break-all;
  
  .url-text {
    color: #F44336;
  }
}
</style> 