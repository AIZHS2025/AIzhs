<template>
	<view class="conversation-container">
		<view class="messages-container">
			<view v-for="(message, index) in messages" :key="index" class="conversation-item">
				<view v-if="message.type === 'user'" class="user-message">
					<view class="message-bubble user-bubble">
						<view class="message-text">{{ formatContent(message.content) }}</view>
					</view>
					<view class="user-avatar">
						<image :src="userAvatar" mode="aspectFit" @error="handleImageError($event, 'user')"></image>
					</view>
				</view>
				<view v-else-if="message.type === 'bot'" class="robot-message">
					<view class="robot-avatar">
						<image :src="botAvatar" mode="aspectFit" @error="handleImageError($event, 'bot')"></image>
					</view>
					<view class="message-bubble" :class="{'loading-bubble': message.type === 'loading', 'has-video': message.mediaType === 'video'}">
						<view class="message-title" v-if="message.title">{{ message.title }}</view>
						<view v-if="!message.mediaType || message.mediaType === 'text'" class="message-text">
							<rich-text :nodes="generateRichTextNodes(message.content)"></rich-text>
						</view>
						<view v-else-if="message.mediaType === 'image'" class="media-container image-container large-image-container">

							
							<image 
								class="media-image" 
								:src="parseMediaUrl(message.mediaUrl)" 
								:mode="message.imageMode || 'widthFix'" 
								@tap="previewImage(parseMediaUrl(message.mediaUrl))"
								@error="handleMediaError($event, 'image', message)"
							></image>
							
							<view v-if="message.loadError" class="error-message">
								<text>{{ message.errorMessage || '图片加载失败' }}</text>
							</view>
							
							<view class="media-actions">
								<button class="action-btn" @tap="saveMedia(parseMediaUrl(message.mediaUrl), 'image')">保存图片</button>
							</view>
						</view>
						<view v-else-if="message.mediaType === 'video'" class="media-container video-container">
							<view class="video-player-container">
								<video 
									:src="message.parsedUrl || parseMediaUrl(message.mediaUrl)" 
									class="simple-video" 
									controls 
									@error="handleMediaError($event, 'video', message)"
									@play="onVideoPlay"
									@loadedmetadata="onVideoLoaded($event, message)"
									@waiting="message.videoLoading = true"
									@timeupdate="message.videoLoading = false"
									>
								</video>
								<view v-if="message.loadError" class="error-message">
									{{ message.errorMessage || '视频加载失败，请检查链接是否有效' }}
									<button class="action-btn retry-btn" @tap="retryMedia(message)">重试</button>
								</view>
								<view v-if="message.videoLoading" class="video-loading">
									<text>视频加载中...</text>
								</view>
							</view>
							<view class="message-actions video-actions">
								<button class="action-btn save-video-btn" @tap="saveMedia(parseMediaUrl(message.mediaUrl), 'video')">
									保存视频
								</button>
							</view>
							<view v-if="message.content && message.content.trim() && message.content !== '[]'" class="message-content">
								{{ message.content }}
							</view>
						</view>
						<view v-else-if="message.mediaType === 'audio'" class="media-container audio-container">
							<audio :src="message.mediaUrl" controls></audio>
						</view>
						<view class="message-actions" v-if="message.showCopyButton && (!message.mediaType || message.mediaType === 'text')">
							<button class="action-btn" @tap="copyText(message.content)">复制内容</button>
						</view>
						<view class="message-time" v-if="message.timestamp">{{ formatTime(message.timestamp) }}</view>
					</view>
				</view>
				
		
				<view v-else-if="message.type === 'loading'" class="robot-message">
					<view class="robot-avatar">
						<image :src="botAvatar" mode="aspectFit" @error="handleImageError($event, 'bot')"></image>
					</view>
					<view class="message-bubble loading-bubble">
						<view class="message-text loading-text">
							{{ message.content || '正在思考中' }}<text class="loading-dots">...</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'ConversationComponent',
	
	props: {
		// { 
		//   type: 'user'|'bot'|'loading', 
		//   content: '', 
		//   timestamp: Date, 
		//   title: '', 
		//   showCopyButton: boolean,
		//   mediaType: 'text'|'image'|'audio'|'video'|'file',  // 媒体类型
		//   mediaUrl: ''  // 媒体URL，图片、音频、视频
		// }
		messages: {
			type: Array,
			default: () => []
		},
		
		userAvatar: {
			type: String,
			default: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/user-avatar.png'
		},
		
		botAvatar: {
			type: String,
			default: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/jiqiren-big.png'
		},
		
		initialMessage: {
			type: [String, Object],
			default: ''
		},
		
		showInitialMessage: {
			type: Boolean,
			default: true
		}
	},
	
	data() {
		return {
			defaultUserAvatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEO0lEQVR4nO2aSWhVVxjHf3ls1KiJGqNxCKKiOIIzVhQnRHBCUXEAxSEgKIgL24oLQXFhwIUDKFYrWLBiBBWl4IJDUVwUFReiRkXUaARjNP7yDnkPHlDXnlDXnFuHn+PDX+/O8u5oT3Tf7x2yf+/e87vuef8Ajzm1ajT/I9oCvYGJwNfAd8BooEm1J9YYmApsAP4F7gJZ9T9PgI3Ap0Djak28L7AR+MP5/RUwDxgFfAEMAcYDq4GHoT4O8UlA3WpJvB4wHfjLSWQLMBxoUKBfA+ALYLeb4DXgaCcD9ARTrQ/sVZDQOzCPBGWKCtAE1AfeEwcHd9yKTgIO2fWzVuZTpuT6x3TgiZPESmC3okGdcN3Y/7F53rP5LHDuGQmMBSYAF4AnQN9i/ewCfG/JvEdtRw+MaRXQ0lzS1iIKPQHsAkaKAoMNHOgaO9AZvxUULLRG6I6e6GNpNsA1oJtt7rVyj8Vy6zhwBfgd+BGYBwwG3gOalB0KvYCvgHP2/QSYbHpYCDI6QZXG+RnIWPnH4uaFiTQGfnMK4Tiwk/0BLYgjYhGbZ+VH5vnz2a2RUFYBRUqVcCnwG/CluaGocD9wO0YZ3fAjxYaIIrbUzgNNYxDZBHxbcLFCVVZHZ38F8LSTZwRlsZl5g3iYbHu6Lc9JGSt4Lh+7bZN2xCC/D1hjeU5eQoXaBpTbbK7bvPYxDX2DuLhswf4e5SYUONdhb7FS9TN3FdwJ0iFtQXwrMM9IqZJGfZXw3bnvyOaEL5QiOhtlh18HdCrSr5mR2GkXp+IfJrK/aLC8K55/ALdMRu9NXLQ1sJkG/Lfrx4Buefp9AOx2ct+8cgJLSeCyLe5CRMLNwL1OL74WXksvdbW0DKszRaxNWbH30j7M+H22/xtH5F1gnfO9c5yNTTfTlmfZYzz5ieBeu94WWK/tMctoUkVkl9jmphQQibvd2nqHHD8aboTXqRcK7HoT4B/Lg/2ddOcXJLLWudmTl9E1y4EvWtZZcJ+o2F6cJo59xVlvuLNnp4A+cUViHAQmIeH1YRZJLnMEXVtT5e+i+3NwX2Ynn0w2CxLTxITHIbZwn+BQnMPgNedM0d3pU1lzEJPIW857zndZeBH3rOLIcQIBu5QRuWHnHfemE+NUn/WTDphrrpw5CTw0Oc2Jz523SBSIxM+Blx5qvYEJpsnHnAF1u3PQqtk1nrdDe5zkh4BDMO2DnAVOT/PFN1zHdIjRUafO1cCrDLx0QUorV6WUbBnScf8LZ/y8TA7ZiJCOGtSZ0s2RK2v5QC2X3Opu5QU5ZbPr+fIZ1Z/61uuV8+E65gq5YWBVx/3N1IeCL05JX5d0c/KQsLzfxD0yDqj+UdfzCvlBX/Kl9+2nh1Sb93ZEV24TjPXqvfxnjQE1RnRaVAU32E+d/wGzEa5oaXBrSQAAAABJRU5ErkJggg==',
			defaultBotAvatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFEElEQVR4nO2aeYhVVRTGf46WE5qVlS2klZK2UGEtRlFmUVmRVJZlC1QUZftCG5UVRfuCRRG0UVRaVFBRfkWlRUW0L5ZFZYttVpaV7fPBJ7iMd+a9O/e9efPeDPxguLx7z73n++495zvn3guNNNJIIw1EPWAccDJwGzAfWAp8D3wFvALMBKYARwIDgdb/h/DbA08CvwLZan6/AE8A+9dLhNHAAuAPoBKYDxwO9AJ2AdratxvQH5gIzANWODFfAqPyFWIU8IUb9EngUKBNDd7TAZgMLHIifgIOrKsIXYCXnADPAwPKnP0DgOcckV+AA8oVYTywzA36ObAwBu9swFIbKB82BNirFBHmGvldwGnAljGJAGxnIVga2wwcUowQvYHfjPh2YKtU5BuwDfCW8f8C7FnbAHcbaa1D90RkCbCb8c8Nf2iHrpnAGyHIrwO2SzRlGwcA3YFhRQixg4VnmUVlYGrRCXjbiM9PIrhJ9H/RyI8KsacgZljQ+AYYnopkA9YF3nfLrMPGVnw8meS9ATeCitltJnV6JRkG9DJ+NX34ZN2GvfzUiM6zE1G7OmQxUY0sHpO+FvASaE4Xw8MMtJ+bu8X/B8ErIkUFzw2CdgstWnVZHy7vWBbO6B6IfqbZ06wIlz2WS/g8BDXJ1YjRJBvEhkLrMw520uMaFKwrfuZwY2qwTOHmQl+CGxZxDL7NTxfU6JLfStXAW+Gwu46V7gNcGJ0DFH5JStYNZuOCPnmEVfCZIo4V7QzE1CAXaXe4QW4JOTLnUIerM10/BpCb53ZrA7FJwM3uzXezznvaEuCi0qoZk8HXrJ9lYF8pmEEsNpEGASw0BRtZXs9YKStMZ8PVoWl5sWQVGqm0/BOWOiaCQ3QBvNJhKJ8MPCP8+pqQhxnNpUFDnVC9A+2dVko+3wsXq5E+L/7XGnOu7SU0yDsxb5hma0OR5T5V1hdaVWXYZubtZuBt8NxYnUZQuwQnldv9goHKe8dLWbXOiGeLE+AaiS9WXjXeXNXvVJPa3f60m3J7SoEwWnVRZ3iYZ41JqoQYkeXY24Pzw+qK5Xvh3eHuX00X0FudRO0KD8RGkdvAc9aHSgxLomJLkSC+9J2pzpvX1iNp3Vp38XqTL86Z7iPTKE+pRxtNbVvTRpEGBia4qrT11WhEFLYVVP3lVNc8Yl1uP/J1ZZ5fTXcX5YlwG0u24+qzXBVrB/DltKBSl3vwWHjJJcQp1QZ65OShehoDXtl8oNK6YVcH4byPOTahfMqHOuweqIrrv2m9V+N7+rKSCIUOc2jlTfkzSX2Ynu7G8H19TnQDCNS/vhQPVdN4RPCI6lG9LfCHJEPj1uFqyR5YjliTHJN8tH5PqScwvl11wrT4QnrApzuRmkZdMrvZTqCDC5FBHlDJfvzVsjmVr4ok/uw2YmiBFGBqtavG7DuVkPdYWa1pshFxdbYCiibOqGeRCQYpV7zEtfANzdRdCvxr/OQ6zxHPaMXeVahcCvl+kQ5mYXYRoQlwMXWrR9Tl80eBxdG9FO/i15sVZ/wVUmkm9VHr1qB672T7+kqg5EWXpKqxBbFXJHuYl8p5VZKdnWR3aPRGPVe9DP7VBnNQnzXt/q5oqs1G/Vpxbwou7JQrG2IpYnulkuG28dxYXP+ZLPU/+uibzHq6pW9ldZ5/1qTYLXkTltOCvcSteEaXu41TF9vB9uGWEj9Vz2q/kqP1Ei9kUYaaaR++Bf4klVZiLDL2QAAAABJRU5ErkJggg==',
			showDebugInfo: false, 
			useSimplePlayerFlag: true, 
			localMessages: [] 
		}
	},
	
	created() {
		console.log('会话组件创建，初始消息:', this.initialMessage);
		this.localMessages = [...this.messages];
		
		this.$nextTick(() => {
			this.handleInitialMessage();
		});
	},
	
	mounted() {
		console.log('会话组件挂载完成，消息数:', this.messages.length);
		this.initVideoMessages();
		
		if (this.messages.length === 0 && this.showInitialMessage && this.initialMessage) {
			console.log('mounted阶段处理初始消息');
			this.handleInitialMessage();
		}
	},
	
	watch: {
		messages: {
			handler(newMessages) {
				this.localMessages = [...newMessages];
			},
			deep: true
		},
		
		initialMessage: {
			handler() {
				this.handleInitialMessage();
			},
			immediate: true 
		}
	},
	
	methods: {
		handleInitialMessage() {
			console.log('处理初始消息', this.initialMessage, '当前消息数:', this.messages.length, '显示初始消息:', this.showInitialMessage);
			
			if (!this.showInitialMessage) {
				return;
			}
			
			if (!this.initialMessage) {
				return;
			}
			
			if (typeof this.initialMessage === 'string') {
				// 创建初始消息对象
				const initialMsg = {
					type: 'bot',
					content: this.initialMessage,
					timestamp: Date.now()
				};
				
				// 如果消息列表为空，添加新消息
				if (this.messages.length === 0) {
					this.$emit('update:messages', [initialMsg]);
					console.log('添加字符串形式的初始消息，当前消息数为0');
				} else {
					// 如果已有消息，添加到第一位
					console.log('已有消息，不添加初始消息');
				}
			} 
			// 如果初始消息是对象
			else if (typeof this.initialMessage === 'object') {
				// 确保有类型属性，默认为bot
				const messageObj = {
					type: this.initialMessage.type || 'bot',
					content: this.initialMessage.content || '',
					timestamp: this.initialMessage.timestamp || Date.now()
				};
				
				// 复制其它属性
				for (const key in this.initialMessage) {
					if (key !== 'type' && key !== 'content' && key !== 'timestamp') {
						messageObj[key] = this.initialMessage[key];
					}
				}
				
				// 如果消息列表为空，添加新消息
				if (this.messages.length === 0) {
					this.$emit('update:messages', [messageObj]);
					console.log('添加对象形式的初始消息，当前消息数为0');
				} else {
					console.log('已有消息，不添加初始消息');
				}
			}
		},
		
		handleImageError(event, type) {
			console.log(`图片加载失败: ${type}`);
			if (type === 'user') {
				event.target.src = this.defaultUserAvatar;
			} else if (type === 'bot') {
				event.target.src = this.defaultBotAvatar;
			}
		},
		
		handleMediaError(e, type, message) {
			console.error(`${type} 加载失败:`, e);
			if (message) {
				message.loadError = true;
				message.errorMessage = `${type === 'video' ? '视频' : '媒体'}加载失败，请检查链接是否有效`;
				// 重置加载状态
				if (type === 'video') {
					message.videoLoading = false;
				}
			}
		},
		
		getFileName(url) {
			if (!url) return '未知文件';
			const parts = url.split('/');
			return parts[parts.length - 1];
		},
		
		getFileType(url) {
			if (!url) return '未知类型';
			const parts = url.split('.');
			if (parts.length > 1) {
				return parts[parts.length - 1].toUpperCase();
			}
			return '未知类型';
		},
		
		copyMediaLink(url) {
			if (!url) return;
			
			uni.setClipboardData({
				data: url,
				success: () => {
					uni.showToast({
						title: '链接已复制',
						icon: 'success'
					});
					this.$emit('copy-media-link', url);
				}
			});
		},
		
		saveMedia(url, type) {
			if (!url) return;
			
			// 只通过事件触发，由父组件处理
			this.$emit('save-media', { url, type });
			
			// 判断设备平台，进行相应处理
			// #ifdef APP-PLUS || MP-WEIXIN
			if (type === 'video') {
				uni.showLoading({
					title: '保存中...'
				});
				
				uni.downloadFile({
					url: url,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveFile({
								tempFilePath: res.tempFilePath,
								success: (result) => {
									uni.hideLoading();
									uni.showToast({
										title: '视频已保存到本地',
										icon: 'success'
									});
								},
								fail: (err) => {
									console.error('保存视频失败:', err);
									uni.hideLoading();
									uni.showToast({
										title: '保存失败',
										icon: 'none'
									});
								}
							});
						}
					},
					fail: (err) => {
						console.error('下载视频失败:', err);
						uni.hideLoading();
						uni.showToast({
							title: '下载失败',
							icon: 'none'
						});
					}
				});
				return;
			}
			// #endif
			
			if (type === 'video') {
				uni.setClipboardData({
					data: url,
					success: () => {
						uni.showToast({
							title: '视频链接已复制，请手动下载',
							icon: 'none',
							duration: 2000
						});
					}
				});
			} else if (type !== 'image') {
				uni.showToast({
					title: '请在相册中查看',
					icon: 'none'
				});
			}
		},
		
		previewImage(url) {
			if (!url) return;
			
			uni.previewImage({
				urls: [url],
				current: url,
				indicator: 'default',
				loop: false
			});
			
			this.$emit('preview-image', url);
		},
		
		copyText(text) {
			if (!text) return;
			
			uni.setClipboardData({
				data: text,
				success: () => {
					uni.showToast({
						title: '内容已复制',
						icon: 'success'
					});
					
					this.$emit('copy', text);
				}
			});
		},

		formatContent(content) {
			if (!content) return '<div class="text-paragraph">无内容</div>';
			
			if (typeof content !== 'string') {
				try {
					content = JSON.stringify(content);
				} catch(e) {
					content = String(content) || '';
				}
			}
			
			if (this.looksLikeImageUrlList && this.looksLikeImageUrlList(content)) {
				return this.convertImageUrlsToImages(content);
			}
			
			if (content.includes('"content_type"') && content.includes('"data"')) {
				try {
					const contentObj = JSON.parse(content);
					if (contentObj.content_type && contentObj.data) {
					
						return this.formatStructuredContent(contentObj);
					}
				} catch (e) {
					console.log('直接解析content_type格式失败:', e);
					
				}
			}
			
			let cleanedContent = content;
			
			cleanedContent = cleanedContent
				.replace(/^[\s\n]*\{\s*"[oO]utput":\s*"/, '')
				.replace(/"\s*\}[\s\n]*$/, '')
				.replace(/\\n/g, '\n')
				.replace(/\\"/g, '"')
				.replace(/\\\\/g, '\\');
			
			try {
				if ((content.startsWith('{') && content.endsWith('}')) || 
					(content.startsWith('[') && content.endsWith(']')) ||
					content.includes('"Output":') || 
					content.includes('"content_type":')) {
					
					let parsedContent;
					if (content.includes('"Output":')) {
						const outerJson = JSON.parse(content);
						if (outerJson.Output) {
							try {
								parsedContent = JSON.parse(outerJson.Output);
							} catch (e) {
								return this.formatTextContent(outerJson.Output);
							}
						} else if (outerJson.output) {
							try {
								parsedContent = JSON.parse(outerJson.output);
							} catch (e) {
								return this.formatTextContent(outerJson.output);
							}
						}
					} else {
						parsedContent = JSON.parse(content);
					}
					
					if (parsedContent) {
						if (parsedContent.content_type && parsedContent.data) {
							return this.formatStructuredContent(parsedContent);
						}
						
						if (parsedContent.output) {
							return this.formatTextContent(parsedContent.output);
						}
						
						if (parsedContent.Output) {
							return this.formatTextContent(parsedContent.Output);
						}
						
						return this.formatJsonContent(parsedContent);
					}
				}
			} catch (e) {
				console.log('JSON解析失败，使用清理后的文本处理', e);
				content = cleanedContent;
			}
			
			const imageUrlPattern = /(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s"']*)?)/gi;
			const imageUrls = content.match(imageUrlPattern);
			
			if (imageUrls && imageUrls.length > 0) {
				let titleSection = '';
				const titleMatch = content.match(/标题[：:]\s*(.*?)(?=\n|$)/);
				if (titleMatch && titleMatch[1]) {
					titleSection = `<div class="content-section">
						<div class="section-title">标题：</div>
						<div class="section-content">
							<h3>${this.formatTextContent(titleMatch[1])}</h3>
						</div>
					</div>`;
				}
				
				// 创建图片区域
				let imageSection = `<div class="content-section">
					<div class="section-title">图片：</div>
					<div class="section-content">`;
				
				// 添加所有图片
				imageUrls.forEach(url => {
					imageSection += `<view class="image-container">
						<image 
							src="${url}" 
							class="content-image" 
							mode="widthFix" 
							@tap="previewImage('${url}')" 
							@error="handleMediaError($event, 'image', message)"
						></image>
						<view class="image-actions">
							<button class="action-btn" @tap="saveMedia('${url}', 'image')">保存图片</button>
						</view>
					</view>`;
				});
				
				imageSection += `</div></div>`;
				
				let textContent = content;
				imageUrls.forEach(url => {
					textContent = textContent.replace(url, '');
				});
				
				textContent = textContent.replace(/标题[：:]\s*(.*?)(?=\n|$)/, '')
									.replace(/图片[：:]\s*/g, '')
									.replace(/\n+/g, '\n')
									.trim();
				
				let textSection = '';
				if (textContent) {
					textSection = `<div class="content-section">
						<div class="section-title">内容：</div>
						<div class="section-content">
							<view class="text-paragraph">${this.formatTextContent(textContent)}</view>
						</div>
					</div>`;
				}
			
				// 组合内容
				return `<div class="structured-content">
					${titleSection}
					${textSection}
					${imageSection}
				</div>`;
			}
			
			if (/<\/?(?:div|p|span|h[1-6]|ul|ol|li|table|tr|td|th|img|a|br|strong|em|code|pre|blockquote)(?:\s+[^>]*)?>/i.test(cleanedContent)) {
				return cleanedContent;
			}
			
			return this.formatTextContent(cleanedContent);
		},
		
		formatTextContent(text) {

			let content = String(text || '');
			
			// 处理JSON字符串
			if (content.startsWith('{') && content.includes('"output"')) {
				try {
					const jsonObj = JSON.parse(content);
					if (jsonObj.output || jsonObj.Output) {
						content = jsonObj.output || jsonObj.Output;
					}
				} catch (e) {
					// 解析失败，保持原文本
				}
			}
			
			const imageUrls = [];
			const imageUrlPattern = /(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s"']*)?)/gi;
			let match;
			
			while ((match = imageUrlPattern.exec(content)) !== null) {
				imageUrls.push(match[0]);
			}
			
			// 如果内容主要是图片URL（大于70%的文本是URL），
			// 则通知父组件并将文本中的URL转换为链接
			if (imageUrls.length > 0) {
				// 通过事件通知父组件有图片
				this.$emit('media-detected', {
					type: 'image',
					urls: imageUrls
				});
				
				// 对于每个URL，将其替换为一个链接
				imageUrls.forEach(url => {
					const escapedUrl = url.replace(/&/g, '&amp;')
									 .replace(/</g, '&lt;')
									 .replace(/>/g, '&gt;')
									 .replace(/"/g, '&quot;')
									 .replace(/'/g, '&#039;');
				
				});
				
				// 处理剩余文本
				return content;
			}
			
			// 处理特殊字符转义，防止XSS
			content = content
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#039;');
			
			// 处理换行符
			return content.replace(/\n/g, '<br>');
		},
		
		// 处理JSON对象为HTML显示
		formatJsonContent(jsonObj) {
			// 如果是数组，展示为列表
			if (Array.isArray(jsonObj)) {
				try {
					let html = '<div class="json-array">';
					jsonObj.forEach((item, index) => {
						html += `<div class="json-array-item">${index + 1}. ${
							typeof item === 'object' ? this.formatJsonContent(item) : this.formatTextContent(item)
						}</div>`;
					});
					html += '</div>';
					return html;
				} catch (e) {
					console.error('格式化JSON数组失败:', e);
					return this.formatTextContent(JSON.stringify(jsonObj));
				}
			}
			
			// 如果是对象，展示为表格或键值对
			if (!jsonObj || typeof jsonObj !== 'object') {
				return this.formatTextContent(String(jsonObj));
			}
			
			let html = '<div class="json-object">';
			try {
				for (const key in jsonObj) {
					if (jsonObj.hasOwnProperty(key)) {
						const value = jsonObj[key];
						html += `<div class="json-property">
							<span class="json-key">${this.formatTextContent(key)}:</span>
							<span class="json-value">${
								typeof value === 'object' ? this.formatJsonContent(value) : this.formatTextContent(value)
							}</span>
						</div>`;
					}
				}
				html += '</div>';
				return html;
			} catch (e) {
				console.error('格式化JSON对象失败:', e);
				html += `<div class="json-property">
					<span class="json-value">${this.formatTextContent(JSON.stringify(jsonObj))}</span>
				</div>`;
				html += '</div>';
				return html;
			}
		},
		
		// 格式化结构化内容(content_type格式)
		formatStructuredContent(content) {
			if (!content || !content.content_type || content.data === undefined) {
				return '<div class="text-paragraph">无效的结构化内容</div>';
			}
			
			const contentType = content.content_type;
			const data = content.data;
			
			// 根据content_type处理不同类型的内容
			switch (contentType) {
				case 'text':
					return this.formatTextContent(data);
					
				case 'json':
					return this.formatJsonContent(data);
					
				case 'image':
				case 'image_url':
					if (typeof data === 'string') {
						return `<div class="structured-image-container"><img src="${data}" class="structured-image" /></div>`;
					} else if (Array.isArray(data)) {
						return this.convertImageUrlsToImages(data.join('\n'));
					}
					return '<div class="text-paragraph">无效的图片数据</div>';
					
				case 'video':
				case 'video_url':
					if (typeof data === 'string') {
						return `<div class="structured-video-container"><video src="${data}" controls class="structured-video"></video></div>`;
					}
					return '<div class="text-paragraph">无效的视频数据</div>';
					
				default:
					// 对于未知类型，尝试以文本形式显示
					if (typeof data === 'string') {
						return this.formatTextContent(data);
					} else if (typeof data === 'object' && data !== null) {
						return this.formatJsonContent(data);
				} else {
						return `<div class="text-paragraph">${String(data)}</div>`;
					}
			}
		},
		
		looksLikeImageUrlList(content) {
			const lines = content.split('\n');
			const imageUrlPattern = /https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s"']*)?/i;
			
			let imageUrlLineCount = 0;
			for (const line of lines) {
				if (imageUrlPattern.test(line)) {
					imageUrlLineCount++;
				}
			}
			return imageUrlLineCount > 0 && imageUrlLineCount >= lines.length * 0.5;
		},
		
		// 将图片URL列表转换为图片显示
		convertImageUrlsToImages(content) {
			const lines = content.split('\n');
			const imageUrlPattern = /(https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s"']*)?)/gi;
			
			let html = '<div class="structured-content">';
			html += '<div class="content-section">';
			html += '<div class="section-title">图片：</div>';
			html += '<div class="section-content">';
				
			// 提取所有图片URL并转换为图片元素
			const allImages = [];
			let textContent = '';
			
			for (const line of lines) {
				const matches = line.match(imageUrlPattern);
				if (matches && matches.length > 0) {
					// 添加所有匹配的URL
					matches.forEach(url => {
						allImages.push(url);
					});
					
					// 保存任何非URL的文本
					let remainingText = line;
					matches.forEach(url => {
						remainingText = remainingText.replace(url, '');
					});
					
					if (remainingText.trim()) {
						textContent += remainingText.trim() + '\n';
					}
				} else if (line.trim()) {
					// 保存非图片URL的文本行
					textContent += line.trim() + '\n';
				}
			}
			
			// 先显示文本内容（如果有）
			if (textContent.trim()) {
				html += `<view class="text-paragraph">${this.formatTextContent(textContent.trim())}</view>`;
			}
				
			// 显示所有图片
			allImages.forEach(url => {
				html += `<view class="image-container">
									<image 
						src="${url}" 
										class="content-image" 
										mode="widthFix" 
						@tap="previewImage('${url}')" 
						@error="handleMediaError($event, 'image', message)"
									></image>
					<view class="image-actions">
						<button class="action-btn" @tap="saveMedia('${url}', 'image')">保存图片</button>
					</view>
				</view>`;
			});
			
			html += '</div></div></div>';
			return html;
		},
		
		formatTime(timestamp) {
			if (!timestamp) return '';
			
			const date = new Date(timestamp);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hour = String(date.getHours()).padStart(2, '0');
			const minute = String(date.getMinutes()).padStart(2, '0');
			
			return `${year}-${month}-${day} ${hour}:${minute}`;
		},
		
		// 解析可能包含在 ["..."] 中的URL
		parseMediaUrl(url) {
			if (!url || typeof url !== 'string') {
				console.warn('无效的媒体URL:', url);
				return '';
			}
			
			try {
				console.log('解析前的媒体URL:', url);
				
				// 检查是否是抖音链接
				if (url.includes('douyinpic.com') || url.includes('tplv-dy')) {
					return this.handleDouyinImage(url);
				}
				
				// 火山方舟API链接需要特殊处理
				if (url.includes('ark-content-generation') || 
				    url.includes('tos-cn-beijing.volces.com') || 
				    url.includes('wan2-1-14b')) {
					// 检查是否完整链接或是否需要从内容中提取
					const regex = /(https?:\/\/[^\s"'<>]+ark-content-generation[^\s"'<>]+\.mp4[^\s"'<>]*)/i;
					const match = url.match(regex);
					if (match && match[1]) {
						return match[1]; // 返回提取出的完整链接
					}
					// 如果是直接链接，不需要进一步处理
					if (url.endsWith('.mp4') || url.includes('X-Tos-Algorithm=')) {
						return url;
					}
				}
				
				// 尝试清理URL中的转义字符
				let cleanUrl = url.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
				
				// 检查是否是 ["..."] 格式
				if ((cleanUrl.startsWith('["') && cleanUrl.endsWith('"]')) || 
					(cleanUrl.startsWith('[\'') && cleanUrl.endsWith('\']'))) {
					const parsedArray = JSON.parse(cleanUrl);
					if (Array.isArray(parsedArray) && parsedArray.length > 0) {
						console.log('从数组中提取URL:', parsedArray[0]);
						return parsedArray[0];
					}
				}
				
				// 检查是否是完整的JSON对象
				if ((cleanUrl.startsWith('{') && cleanUrl.endsWith('}')) || 
					(cleanUrl.startsWith('[') && cleanUrl.endsWith(']'))) {
					const parsed = JSON.parse(cleanUrl);
					if (typeof parsed === 'string') {
						console.log('从JSON字符串提取URL:', parsed);
						return parsed;
					} else if (Array.isArray(parsed) && parsed.length > 0) {
						console.log('从JSON数组提取URL:', parsed[0]);
						return parsed[0];
					} else if (parsed && parsed.url) {
						console.log('从JSON对象提取URL:', parsed.url);
						return parsed.url;
					} else if (parsed && parsed.data) {
						// 处理 {data: "url"} 格式
						if (typeof parsed.data === 'string') {
							console.log('从data字段提取URL:', parsed.data);
							return parsed.data;
						} else if (Array.isArray(parsed.data) && parsed.data.length > 0) {
							console.log('从data数组提取URL:', parsed.data[0]);
							return parsed.data[0];
						}
					}
				}
				
				// 如果URL是"http..."前后有引号的情况
				if ((cleanUrl.startsWith('"http') && cleanUrl.endsWith('"')) || 
					(cleanUrl.startsWith('\'http') && cleanUrl.endsWith('\''))) {
					let extracted = cleanUrl.substring(1, cleanUrl.length - 1);
					console.log('从引号中提取URL:', extracted);
					return extracted;
				}
			} catch (e) {
				console.warn('解析mediaUrl失败:', url, e);
			}
			
			// 保证URL不包含多余的引号
			if (url.startsWith('"') && url.endsWith('"')) {
				url = url.substring(1, url.length - 1);
			}
			
			console.log('使用原始URL:', url);
			return url;
		},
		
		handleDouyinImage(url) {
			console.log('处理抖音图片URL:', url);
		
			if (!url || (!url.includes('douyinpic.com') && !url.includes('tplv-dy'))) {
				return url;
			}
			
			let cleanUrl = url;
			
			cleanUrl = cleanUrl.replace(/~/g, '%7E');
			
			try {
				const decoded = decodeURIComponent(cleanUrl);
				cleanUrl = encodeURIComponent(decoded);
			} catch (e) {
				console.error('URL编码处理失败:', e);
			}
			
			if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
				cleanUrl = cleanUrl.substring(1, cleanUrl.length - 1);
			}
			
			console.log('处理后的抖音URL:', cleanUrl);
			
			this.$emit('douyin-image-processed', {
				originalUrl: url,
				processedUrl: cleanUrl
			});
			
			return cleanUrl;
		},
		
		getVideoPoster(videoUrl) {
			return ''; 
		},
		
		generateRichTextNodes(content) {
			let text = content;
			if (!text) return [];
			if (typeof text !== 'string') {
				text = String(text);
			}

			text = text.replace(/\n/g, '\n');
			
			
			const lines = text.split('\n');
			const nodes = [];

			lines.forEach(line => {
				if (line) { 
					nodes.push({
						name: 'p', 
						attrs: { class: 'text-paragraph' }, 
						children: [{
							type: 'text',
							text: line
						}]
					});
				}
			});

			// 如果没有有效行，至少返回一个空占位符，避免 rich-text 出错
			if (nodes.length === 0) {
				return [{ name: 'div', children: [{ type: 'text', text: '' }] }];
			}

			console.log('Generated Nodes:', JSON.stringify(nodes)); // 调试用
			return nodes;
		},

		// 重试加载媒体
		retryMedia(message) {
			if (!message) return;
			
			// 重置错误状态
			message.loadError = false;
			message.errorMessage = '';
			
			// 如果是视频，设置加载状态
			if (message.mediaType === 'video') {
				message.videoLoading = true;
			}
			
			// 触发重新渲染
			this.$forceUpdate();
		},
		
		// 处理视频加载完成事件
		onVideoLoaded(event, message) {
			console.log('视频加载完成:', event.target.src);
			if (message) {
				message.videoLoading = false;
				message.loadError = false;
			}
		},
		
		// 获取直接的视频URL（尝试所有可能的格式）
		getDirectVideoUrl(url) {
			if (!url) return '';
			
			// 如果是字符串但包含了http://或https://，直接返回
			if (typeof url === 'string' && 
				(url.includes('http://') || url.includes('https://'))) {
				
				// 如果URL被引号包裹，去掉引号
				if ((url.startsWith('"') && url.endsWith('"')) || 
					(url.startsWith("'") && url.endsWith("'"))) {
					return url.substring(1, url.length - 1);
				}
				
				// 支持火山方舟API返回的视频链接格式
				if (url.includes('tos-cn-beijing.volces.com') || 
				    url.includes('ark-content-generation') || 
				    url.includes('wan2-1-14b') || 
				    url.includes('.mp4')) {
					return url;
				}
				
				if (!url.includes('"') && !url.includes("'")) {
					return url;
				}
			}
			
			// 尝试检测URL中的视频链接
			if (typeof url === 'string') {
				const videoUrlPattern = /(https?:\/\/[^\s"']+\.(mp4|webm|ogg|mov))/i;
				const match = url.match(videoUrlPattern);
				if (match && match[0]) {
					return match[0];
				}
			}
			
			// 最终尝试解析URL
			return this.parseMediaUrl(url);
		},
		
		// 视频错误日志
		logVideoError(event) {
			console.error('视频播放错误:', event);
		},
		
		// 视频开始播放
		onVideoPlay(event) {
			console.log('视频开始播放:', event.target.src);
		},
		
		// 是否使用简化播放器
		useSimplePlayer(message) {
			if (!message) return this.useSimplePlayerFlag;
			if (message.useSimplePlayer !== undefined) {
				return message.useSimplePlayer;
			}
			return this.useSimplePlayerFlag;
		},
		
		// 切换视频播放器类型
		toggleVideoPlayer(message) {
			if (!message) return;
			
			message.useSimplePlayer = !this.useSimplePlayer(message);
			message.loadError = false;
			message.videoLoading = false;
			
			// 重新渲染
			this.$forceUpdate();
		},
		
		// 初始化视频消息状态
		initVideoMessages() {
			if (!this.messages || this.messages.length === 0) return;
			
			console.log('初始化视频消息，总消息数:', this.messages.length);
			this.messages.forEach((message, index) => {
				if (message.mediaType === 'video') {
					console.log(`处理第${index}条视频消息:`, message.mediaUrl);
					
					// 设置初始状态
					if (!message.initialized) {
						message.videoLoading = true;
						message.initialized = true;
						message.useSimplePlayer = true; // 默认使用简单播放器
						message.loadError = false;
						
						// 尝试自动检测真实视频URL
						this.tryDetectVideoUrl(message);
					}
					
					// 即使已初始化过的视频也再次检查，以防URL变更
					if (message.mediaUrl) {
						// 强制触发视频解析和渲染更新
						this.$nextTick(() => {
							const url = this.parseMediaUrl(message.mediaUrl);
							console.log('解析后的视频URL:', url);
							message.parsedUrl = url;
							this.$forceUpdate();
						});
					}
				}
			});
		},
		
		// 尝试检测真实视频URL
		tryDetectVideoUrl(message) {
			if (!message || !message.mediaUrl) return;
			
			// 首先尝试直接获取URL
			let url = this.getDirectVideoUrl(message.mediaUrl);
			message.detectedUrl = url;
			
			console.log('检测到视频URL:', url);
		},
		
		// 添加图片模式切换功能
		toggleImageMode(message) {
			if (!message) return;
			
			if (!message.imageMode) {
				message.imageMode = 'aspectFit';
			} else {
				// 轮换不同的模式
				const modes = ['aspectFit', 'widthFix', 'scaleToFill', 'aspectFill'];
				const currentIndex = modes.indexOf(message.imageMode);
				const nextIndex = (currentIndex + 1) % modes.length;
				message.imageMode = modes[nextIndex];
			}
			console.log(`图片模式已切换为: ${message.imageMode}`);
			this.$forceUpdate(); // 强制更新视图
			
			// 添加模式切换后的调试信息
			uni.showToast({
				title: `图片模式: ${message.imageMode}`,
				icon: 'none',
				duration: 1500
			});
		},
		
		// 切换视频播放器
		toggleSimplePlayer() {
			this.useSimplePlayerFlag = !this.useSimplePlayerFlag;
			console.log('切换视频播放器:', this.useSimplePlayerFlag ? '简单播放器' : '标准播放器');
		},
		
		// 控制是否使用简单视频播放器
		useSimplePlayer(message) {
			return this.useSimplePlayerFlag;
		},
		
		// 处理调试信息显示
		toggleDebugInfo() {
			this.showDebugInfo = !this.showDebugInfo;
		}
	}
}
</script>

<style lang="scss" scoped>
.conversation-container {
	display: flex;
	flex-direction: column;
	width: 100%;
	
	.messages-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding: 20rpx 0;
		box-sizing: border-box;
	}
	
	.conversation-item {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-bottom: 40rpx;
		animation: fadeInUp 0.3s ease-in-out;
	}
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.user-message {
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		padding: 0 20rpx;
		
		.user-avatar {
			width: 80rpx;
			height: 80rpx;
			flex-shrink: 0;
			margin-left: 20rpx;
			
			image {
				width: 100%;
				height: 100%;
				border-radius: 30%;
			}
		}
		
		.message-bubble {
			// background-color: #DCF8C6;
			background-color: rgba(220, 248, 198, 0.65);
			border-radius: 30rpx;
			padding: 20rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
			position: relative;
			max-width: 70%;
			
			&:after {
				content: '';
				position: absolute;
				right: -16rpx;
				top: 20rpx;
				border-width: 8rpx;
				border-style: solid;
				border-color: transparent transparent transparent rgba(220, 248, 198, 0.65);
			}
			
			.message-text {
				font-size: 28rpx;
				color: #333;
				line-height: 1.5;
			}
		}
	}
	
	.robot-message {
		display: flex;
		align-items: flex-start;
		padding: 0 20rpx;
		
		.robot-avatar {
			width: 80rpx;
			height: 80rpx;
			flex-shrink: 0;
			margin-right: 20rpx;
			
			image {
				width: 100%;
				height: 100%;
				border-radius: 30%;
			}
		}
		
		.message-bubble {
			// background-color: #fff;
			background-color: rgba(255, 255, 255, 0.65);
			border-radius: 30rpx;
			padding: 20rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
			position: relative;
			max-width: 90%;
			// opacity: 0.65;
			
			&:before {
				content: '';
				position: absolute;
				left: -16rpx;
				top: 20rpx;
				border-width: 8rpx;
				border-style: solid;
				// border-color: transparent #fff transparent transparent;
				border-color: transparent rgba(255, 255, 255, 0.65) transparent transparent;
			}
			
			&.loading-bubble {
				// background-color: #f2f2f2;
				background-color: rgba(242, 242, 242, 0.65);
				
				&:before {
					border-color: transparent #f2f2f2 transparent transparent;
				}
			}
			
			&.has-video {
				padding: 10rpx;
				max-width: 95%;  // 让视频消息气泡更宽
			}
			
			.message-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #4A90E2;
				margin-bottom: 10rpx;
			}
			
			.message-text {
				font-size: 28rpx;
				color: #333;
				line-height: 1.5;
				margin-bottom: 15rpx;
				width: 100%;
				word-break: break-all;
				word-wrap: break-word;
				
				&.loading-text {
					color: #666;
					font-style: italic;
					
					.loading-dots {
						display: inline-block;
						animation: loadingDots 1.5s infinite;
					}
				}
				
				// 新增样式：文本中的链接样式
				.text-link {
					color: #4A90E2;
					text-decoration: underline;
				}
				
				// 新增样式：代码块
				.code-block {
					background-color: #f5f5f5;
					border-radius: 8rpx;
					padding: 16rpx;
					margin: 12rpx 0;
					max-width: 100%;
					overflow-x: auto;
					font-family: Monaco, Consolas, 'Courier New', monospace;
					font-size: 24rpx;
					line-height: 1.4;
					white-space: pre-wrap;
					word-break: break-all;
					color: #333;
					border-left: 4rpx solid #4A90E2;
				}
			}
			
			@keyframes loadingDots {
				0% { opacity: 0.3; }
				50% { opacity: 1; }
				100% { opacity: 0.3; }
			}
			
			.media-container {
				margin: 10rpx 0;
				width: 100%;
				
				&.image-container {
					margin: 15rpx 0 25rpx 0;
					
					.media-image, image {
						width: 100% !important;
						max-width: 100%;
						border-radius: 12rpx;
						box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
					}
				}
				
				&.audio-container {
					audio {
						width: 100%;
					}
				}
				
				&.video-container {
					padding: 0;
					margin: 0 auto;
					width: 100%;
					max-width: 700rpx; // 限制最大宽度，适应大屏幕
				}
			}
			
			.media-actions {
				display: flex;
				justify-content: flex-end;
				margin-top: 15rpx;
				gap: 10rpx;
				
				.action-btn {
					font-size: 26rpx;
					padding: 8rpx 20rpx;
					line-height: 1.5;
					background-color: #e0e0e0;
					color: #333;
					border: none;
					border-radius: 30rpx;
				}
			}
			
			.message-actions {
				display: flex;
				justify-content: flex-end;
				margin-top: 15rpx;
				
				.action-btn {
					padding: 6rpx 20rpx;
					background-color: #4A90E2;
					color: #ffffff;
					border-radius: 30rpx;
					font-size: 24rpx;
					border: none;
				}
			}
			
			.message-time {
				font-size: 22rpx;
				color: #999;
				margin-top: 10rpx;
				text-align: right;
			}
		}
	}
	
	// 媒体标题样式
	.media-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #333;
		margin-bottom: 10rpx;
		line-height: 1.4;
		word-break: break-word;
	}
	
	// 结构化内容的样式
	.structured-content {
		margin: 10rpx 0;
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}
	
	.text-paragraph {
		margin: 8rpx 0;
		line-height: 1.5;
	}
	
	// JSON内容展示样式
	.json-object, .json-array {
		margin: 5rpx 0;
		
		.json-property {
			margin: 5rpx 0;
			display: flex;
			flex-wrap: wrap;
			
			.json-key {
				font-weight: bold;
				color: #4A90E2;
				margin-right: 5rpx;
			}
			
			.json-value {
				color: #333;
			}
		}
		
		.json-array-item {
			margin: 5rpx 0;
			padding-left: 10rpx;
		}
	}
	
	// 新增样式：JSON相关样式
	.json-code {
		background-color: rgba(74, 144, 226, 0.1);
		border-radius: 8rpx;
		padding: 16rpx;
		font-family: Monaco, Consolas, 'Courier New', monospace;
		font-size: 24rpx;
		line-height: 1.4;
		white-space: pre-wrap;
		word-break: break-all;
		color: #333;
	}
	
	.json-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #4A90E2;
		margin-bottom: 10rpx;
		padding-bottom: 6rpx;
		border-bottom: 1px solid rgba(74, 144, 226, 0.2);
	}
	
	.json-text {
		margin: 10rpx 0;
	}
	
	// 新增样式：结构化图片、视频容器
	.structured-image-container, .structured-video-container {
		margin: 10rpx 0;
		width: 100%;
		
		.structured-image, .structured-video {
			width: 100% !important;
			max-width: 100%;
			border-radius: 8rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		}
	}
	
	// 标签容器
	.tag-container {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		margin: 10rpx 0;
	}
	
	.topic-tag {
		display: inline-block;
		background-color: rgba(74, 144, 226, 0.1);
		color: #4A90E2;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		margin: 4rpx;
		font-size: 24rpx;
	}
	
	.content-section {
		margin: 20rpx 0;
		padding: 16rpx;
		background-color: rgba(74, 144, 226, 0.05);
		border-radius: 12rpx;
		border-left: 6rpx solid #4A90E2;
		
		.section-title {
			font-weight: bold;
			font-size: 28rpx;
			color: #4A90E2;
			margin-bottom: 10rpx;
		}
		
		.section-content {
			margin-left: 10rpx;
			
			h3 {
				font-size: 30rpx;
				font-weight: bold;
				margin: 10rpx 0;
				color: #333;
			}
			
			.image-container {
				margin: 10rpx 0;
				width: 100%;
				
				.content-image, image {
					width: 100% !important;
					max-width: 100%;
					border-radius: 8rpx;
					margin: 8rpx 0;
				}
				
				.image-actions {
					display: flex;
					gap: 10rpx;
					margin-top: 10rpx;
					
					.action-btn {
						flex: 1;
						padding: 6rpx 20rpx;
						background-color: #F5F5F5;
						color: #333;
						border-radius: 30rpx;
						font-size: 24rpx;
						border: none;
					}
				}
			}
			
			.video-container {
				margin: 10rpx 0;
				width: 100%;
				
				.content-video {
					width: 100% !important;
					max-width: 100%;
					border-radius: 8rpx;
				}
				
				.video-actions {
					display: flex;
					gap: 10rpx;
					margin-top: 10rpx;
					
					.action-btn {
						flex: 1;
						padding: 6rpx 20rpx;
						background-color: #F5F5F5;
						color: #333;
						border-radius: 30rpx;
						font-size: 24rpx;
						border: none;
					}
				}
			}
		}
	}
}

// 确保媒体容器和图片自适应
.media-container {
	margin: 10rpx 0;
	width: 100%;
	
	&.image-container {
		margin: 15rpx 0 25rpx 0;
		
		.media-image, image {
			width: 100% !important;
			max-width: 100%;
			border-radius: 12rpx;
			box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
		}
	}
	
	&.audio-container {
		audio {
			width: 100%;
		}
	}
	
	&.video-container {
		padding: 0;
		margin: 0 auto;
		width: 100%;
		max-width: 700rpx; // 限制最大宽度，适应大屏幕
	}
}

// 确保机器人气泡内的所有内容不会溢出
.robot-message .message-bubble {
	.message-text {
		width: 100%;
		word-break: break-all;
		word-wrap: break-word;
		
		img, image, video {
			max-width: 100% !important;
			width: 100% !important;
		}
	}
}

/* 添加代码块和结构化内容的样式 */
:deep(.code-block) {
  background-color: #f5f5f5;
  border-radius: 8rpx;
  padding: 16rpx;
  margin: 10rpx 0;
  overflow-x: auto;
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 26rpx;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
}

:deep(.inline-code) {
  background-color: #f5f5f5;
  border-radius: 4rpx;
  padding: 0 6rpx;
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  font-size: 26rpx;
}

:deep(.structured-content) {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

:deep(.content-section) {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

:deep(.section-title) {
  font-weight: bold;
  font-size: 28rpx;
  color: #444;
}

:deep(.section-content) {
  padding-left: 10rpx;
}

:deep(.content-image) {
  max-width: 100%;
  border-radius: 10rpx;
  margin: 10rpx 0;
}

:deep(.image-container) {
  margin: 10rpx 0;
  display: flex;
  flex-direction: column;
}

:deep(.image-actions) {
  display: flex;
  justify-content: flex-end;
  margin-top: 10rpx;
  gap: 10rpx;
}

:deep(.json-object),
:deep(.json-array) {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 10rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
  margin: 8rpx 0;
}

:deep(.json-property) {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 6rpx;
}

:deep(.json-key) {
  font-weight: bold;
  color: #555;
}

:deep(.json-value) {
  color: #333;
}

:deep(.text-paragraph) {
  margin: 10rpx 0;
  line-height: 1.5;
}

/* 添加视频容器和视频样式 */
:deep(.video-container) {
	margin: 10rpx 0;
	display: flex;
	flex-direction: column;
}

:deep(.media-video) {
	width: 100%;
	max-height: 400rpx;
	border-radius: 12rpx;
	margin-bottom: 12rpx;
	background-color: #f0f0f0;
	position: relative;
}

.video-loading {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.1);
}

/* 调整媒体操作按钮 */
:deep(.media-actions) {
	display: flex;
	justify-content: flex-end;
	margin-top: 15rpx;
	gap: 10rpx;
}

:deep(.action-btn) {
	font-size: 26rpx;
	padding: 8rpx 20rpx;
	line-height: 1.5;
	background-color: #e0e0e0;
	color: #333;
	border: none;
	border-radius: 20rpx;
	transition: background-color 0.2s;
	
	&:active {
		background-color: #ccc;
	}
}

:deep(.image-container) {
	margin: 10rpx 0;
}

.error-message {
	width: 100%;
	height: 150rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #f5f5f5;
	border-radius: 12rpx;
	color: #ff4d4f;
	font-size: 28rpx;
	margin-bottom: 12rpx;
}

.video-player-container {
	width: 100%;
	margin: 0 0 15rpx 0;
	position: relative;
	background-color: #f0f0f0;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
}

.simple-video {
    width: 100%;
    height: 520rpx;
    border-radius: 12rpx;
    background-color: #f0f0f0;
    object-fit: contain;
}

.message-content {
    margin: 12rpx 0;
    padding: 10rpx;
    font-size: 28rpx;
    line-height: 1.5;
    color: #333;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 8rpx;
}

/* 在style标签内添加 */
.large-image-container {
	margin: -5rpx -10rpx !important;
	width: calc(100% + 20rpx) !important;
	
	.media-image {
		border-radius: 16rpx !important;
		box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.2) !important;
		transform: scale(1.02);
		transition: transform 0.2s ease;
		
		&:active {
			transform: scale(1);
		}
	}
}

.retry-btn {
	margin-left: 10rpx;
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	background-color: #4CAF50;
	color: white;
    border-radius: 6rpx;
}

.video-loading {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.1);
	color: #333;
	font-size: 28rpx;
}

.error-message {
	width: 100%;
	padding: 15rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #f5f5f5;
	border-radius: 12rpx;
	color: #ff4d4f;
	font-size: 28rpx;
	margin: 10rpx 0;
}

.message-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12rpx;
    gap: 15rpx;
}

.video-container {
    display: flex;
    flex-direction: column;
    border-radius: 16rpx;
    overflow: hidden;
    margin: 15rpx 0 25rpx 0;
    width: 100%;
}

.save-video-btn {
    background-color: #43a047;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15rpx 30rpx;
    font-size: 28rpx;
    border-radius: 30rpx;
    
    &:active {
        background-color: #2e7d32;
    }
}

.video-actions {
    display: flex;
    justify-content: center;
    margin: 15rpx auto 10rpx;
    width: 100%;
}
</style>
