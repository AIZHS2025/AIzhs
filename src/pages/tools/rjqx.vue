<template>
	<view class="container" style="padding: 0 20rpx">
		<!-- 引入外部 顶部导航栏 -->
		<navigation-bars 
			color="#171717" 
			font-size-30 
			title="爆火人间清醒类视频生成助手" 
			@pack="backPage" 
			:image="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/返回.png'" />

		<!-- 引入外部 智能助手小智 -->
		<intelligent-assistant></intelligent-assistant>

		<!-- 主要内容区域 - 固定高度 -->
		<view class="chat-container">
			<!-- 使用对话组件 -->
			<conversation 
				ref="conversationComp"
				:messages.sync="conversationMessages" 
				:user-avatar="userAvatar"
				:bot-avatar="botAvatar"
				:initial-message="initialBotMessage"
				:show-initial-message="true"
				@copy="copyText"
				@media-detected="handleMediaDetected"
				@save-media="handleSaveMedia"
			/>
			
			<!-- 处理数据的组件 - 显示在页面上以便正确处理图片 -->
			<response-formatter
				ref="responseFormatter"
				:responseData="currentResponse"
				@response-processed="handleResponseProcessed"
				@json-processed="handleJsonProcessed"
				@media-detected="handleMediaDetected"
				@links-detected="handleLinksDetected"
			/>
		</view>
		
		<!-- 底部输入框区域 -->
		<view class="input-area">
			<input 
				type="text" 
				v-model="prompt" 
				:disabled="loading" 
				placeholder="请描述您想要的内容..." 
				placeholder-class="placeholder-style"
				@confirm="handleSendMessage" 
			/>
			<button class="send-btn" :disabled="loading || !prompt.trim()" @tap="handleSendMessage">
				<image src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/跳转 (1).png" mode="aspectFit" class="send-icon"></image>
			</button>
		</view>
	</view>
</template>


<script>
// 引入外部组件
import NavigationBars from "../../components/navigation-bars/index.vue";
import IntelligentAssistant from "../table/tools/components/Intelligent-assistant.vue";
import Conversation from "../table/tools/components/conversation.vue";
import ResponseFormatter from "../table/tools/components/ResponseFormatter.vue";

export default {
	components: {
		NavigationBars,
		IntelligentAssistant,
		Conversation,
		ResponseFormatter
	},

	data() {
		return {
			prompt: '',
			loading: false,
			completedResponses: [],
			taskId: null,
			checkStatusInterval: null,
			savedPrompt: '',
			conversationMessages: [],
			userAvatar: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/user-avatar.png',
			botAvatar: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/jiqiren-big.png',
			initialBotMessage: '请问有什么我可以帮助您的吗？',
			currentResponse: null,
			lastProcessedTimestamp: 0
		}
	},
	methods: {
		// 导航栏 返回上一页
		backPage() {
			// 直接调用 uni.navigateBack 可能存在问题，尝试先判断页面栈
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack({
					delta: 1
				});
			} else {
				// 如果没有上一级页面，则跳转到首页
				uni.switchTab({
					url: '/pages/table/index/index'
				});
			}
		},
		
		// 处理发送消息
		async handleSendMessage() {
			// 如果是搜索框触发，可能没有直接通过prompt传递
			const message = this.prompt;
			if (!message || !message.trim()) {
				uni.showToast({
					title: '请输入描述',
					icon: 'none'
				});
				return;
			}
			
			if (this.loading) {
				uni.showToast({
					title: '请等待当前请求完成',
					icon: 'none'
				});
				return;
			}
			
			this.savedPrompt = message;
			this.loading = true;
			this.taskId = null;
			
			// 清空输入框
			this.prompt = '';
			
			// 添加用户消息到对话中
			this.conversationMessages.push({
				type: 'user',
				content: message,
				timestamp: Date.now()
			});
			
			// 添加加载中消息
			this.conversationMessages.push({
				type: 'loading',
				content: '正在生成中...'
			});
			
			// 延迟滚动到底部，确保DOM已更新
			setTimeout(() => {
				this.scrollToBottom();
			}, 100);
			
			try {
				console.log('准备调用云函数coze_request...');
				const result = await wx.cloud.callFunction({
					name: 'coze_request',
					data: {
						token: 'pat_tu253KJPlSsaCx1YFunZ00wr8VmJUd3z7hujxXd79Ag7JIgNtHw0pC6G58i63F8S',
						workflowId: '7502367499623710755',
						parameters: {
							prompt: this.savedPrompt
						}
					}
				});
				
				console.log('云函数返回结果:', result);
				
				if (result && result.result && result.result.code === 0) {
					this.taskId = result.result.data.execute_id;
					// 开始轮询任务状态
					this.startCheckingStatus();
				} else {
					throw new Error(result && result.result ? (result.result.msg || '创建任务失败') : '创建任务失败: 返回结果格式异常');
				}
			} catch (error) {
				console.error('生成失败:', error);
				
				// 移除加载消息
				this.removeLoadingMessage();
				
				// 添加错误消息
				this.conversationMessages.push({
					type: 'bot',
					content: `生成失败，请稍后重试`,
					timestamp: Date.now()
				});
				
				this.loading = false;
			}
		},
		
		// 移除加载消息
		removeLoadingMessage() {
			this.conversationMessages = this.conversationMessages.filter(msg => msg.type !== 'loading');
		},
		
		// 开始检查任务状态
		startCheckingStatus() {
			// 清除可能存在的旧定时器
			if (this.checkStatusInterval) {
				clearInterval(this.checkStatusInterval);
			}
			
			// 设置新的定时器，每3秒检查一次
			this.checkStatusInterval = setInterval(async () => {
				try {
					console.log('准备调用云函数coze_worker检查状态...');
					const result = await wx.cloud.callFunction({
						name: 'coze_worker', // 使用原始的worker函数检查状态
						data: {
							token: 'pat_tu253KJPlSsaCx1YFunZ00wr8VmJUd3z7hujxXd79Ag7JIgNtHw0pC6G58i63F8S',
							workflowId: '7502367499623710755',
							execute_id: this.taskId
						}
					});
					
					console.log('状态检查结果:', result);
					
					if (result && result.result && result.result.code === 0) {
						const task = result.result.data;
						console.log('任务状态:', task.status);
						
						if (task.status === 'Success') {
							// 任务完成
							clearInterval(this.checkStatusInterval);
							this.loading = false;
							
							// 移除加载消息
							this.removeLoadingMessage();
							
							// 获取响应数据
							try {
								// 尝试获取原始输出
								let rawData = task.rawOutput?.output || task.rawOutput || task.originalData?.output || task.originalData || '';
								console.log('获取到原始数据类型:', typeof rawData, rawData);
								
								// 保存到历史记录
								this.saveToHistory(rawData);
								
								// 处理响应数据 - 直接使用ResponseFormatter组件
								this.currentResponse = rawData;
								
								// 调用ResponseFormatter组件处理数据
								this.$nextTick(() => {
									if (this.$refs.responseFormatter) {
										this.$refs.responseFormatter.processResponse(rawData);
										
										// 显示成功消息
										uni.showToast({
											title: '生成成功',
											icon: 'success'
										});
									} else {
										// 保险起见，直接添加原始消息
										this.removeLoadingMessage();
										this.conversationMessages.push({
											type: 'bot',
											content: typeof rawData === 'string' ? rawData : JSON.stringify(rawData),
											timestamp: Date.now(),
											showCopyButton: true
										});
									}
								});
							} catch (error) {
								console.error('处理响应数据失败:', error);
								this.removeLoadingMessage();
								this.conversationMessages.push({
									type: 'bot',
									content: '处理返回内容出错，请重试',
									timestamp: Date.now()
								});
							}
						} else if (task.status === 'Failed') {
							// 任务失败
							clearInterval(this.checkStatusInterval);
							this.loading = false;
							
							// 移除加载消息
							this.removeLoadingMessage();
							
							// 添加错误消息
							this.conversationMessages.push({
								type: 'bot',
								content: '很抱歉，生成失败，请调整您的描述或稍后再试',
								timestamp: Date.now()
							});
						}
					} else {
						// 获取状态失败
						console.error('获取任务状态失败:', result.result.msg);
						clearInterval(this.checkStatusInterval);
						this.loading = false;
						
						// 移除加载消息
						this.removeLoadingMessage();
						
						// 添加错误消息
						this.conversationMessages.push({
							type: 'bot',
							content: '获取任务状态失败，请重试',
							timestamp: Date.now()
						});
					}
				} catch (error) {
					console.error('检查任务状态失败:', error);
					clearInterval(this.checkStatusInterval);
					this.loading = false;
					
					// 移除加载消息
					this.removeLoadingMessage();
					
					// 添加错误消息
					this.conversationMessages.push({
						type: 'bot',
						content: '检查任务状态失败，请重试',
						timestamp: Date.now()
					});
				}
			}, 3000);
		},
		
		processCozeBotResponse(data) {
			console.log('处理Coze响应:', typeof data);
			
			this.currentResponse = data;
			
			// 延迟调用，确保组件已经挂载
			this.$nextTick(() => {
				if (this.$refs.responseFormatter) {
					// 主动触发组件处理
					this.$refs.responseFormatter.processResponse(data);
				} else {
					console.error('未找到ResponseFormatter组件引用');
					this.conversationMessages.push({
						type: 'bot',
						content: typeof data === 'string' ? data : JSON.stringify(data),
						timestamp: Date.now(),
						showCopyButton: true
					});
				}
			});
			
			return {
				title: '',
				text: '',
				imageUrls: []
			};
		},
		
		isImageUrl(url) {
			if (typeof url !== 'string') return false;
			return url.includes('http') && 
				(url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i) !== null || 
				url.includes('image') || 
				url.includes('coze.cn/t-') || 
				url.includes('s.coze.cn/'));
		},
		
		handleResponseProcessed(result) {
			console.log('响应处理完成:', result);
			
			const currentTimestamp = Date.now();
			if (currentTimestamp - this.lastProcessedTimestamp < 500) {
				console.log('忽略重复处理');
				return;
			}
			this.lastProcessedTimestamp = currentTimestamp;
			
			this.removeLoadingMessage();
			
			const timestamp = Date.now();
			const title = result.title || ''; 
			const textContent = result.text || '';

			if (result.videoUrl) {
				
				console.log('检测到视频URL:', result.videoUrl);
				
				let videoUrl = result.videoUrl;
				
				if (typeof videoUrl === 'object') {
					videoUrl = JSON.stringify(videoUrl);
				}
				
				const videoUrlPattern = /(https?:\/\/[^\s"']+\.(mp4|webm|ogg|mov|m3u8)(\?[^&\s]*)?)/i;
				const match = videoUrl.match(videoUrlPattern);
				if (match && match[0]) {
					videoUrl = match[0];
				}
				
				videoUrl = videoUrl.replace(/^\[+|\]+$/g, '');
				videoUrl = videoUrl.replace(/^["']+|["']+$/g, '');
				
				const videoContent = textContent ? textContent.replace(videoUrl, '').replace(/\[\]/, '').trim() : '';
				
				let cleanContent = videoContent || '';
				cleanContent = cleanContent.replace(/\[".*?"\]/g, '').replace(/\['.*?'\]/g, '').replace(/\[\s*\]/g, '');
				cleanContent = cleanContent.replace(/["'].*?["']/g, '');
				cleanContent = cleanContent.replace(/\[|\]/g, '');
				cleanContent = cleanContent.replace(/[,;:]/g, '');
				cleanContent = cleanContent.trim();
				this.conversationMessages.push({
					type: 'bot',
					content: cleanContent, 
					mediaType: 'video',
					mediaUrl: videoUrl,
					timestamp: timestamp,
					showCopyButton: !!cleanContent,
					videoLoading: true,
					initialized: false,
					useSimplePlayer: true
				});
				
				console.log('添加了视频消息:', videoUrl);
			} else if (result.imageUrls && result.imageUrls.length > 0) {
			
				result.imageUrls.forEach((imageUrl, index) => {
					if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('http')) {
						const message = {
							type: 'bot',
							mediaType: 'image',
							mediaUrl: imageUrl,
							timestamp: timestamp
						};
					
						if (index === 0 && textContent) {
							message.content = textContent; 
							message.showCopyButton = true; 
						}
						this.conversationMessages.push(message);
					}
				});
			} else if (textContent) {
				// 处理纯文本内容
				this.conversationMessages.push({
					type: 'bot',
					content: textContent, 
					timestamp: timestamp,
					showCopyButton: true
				});
			} else {
				// 处理异常情况 - 没有任何内容
				this.conversationMessages.push({
					type: 'bot',
					content: '未能获取到有效内容，请重试',
					timestamp: timestamp
				});
			}
			
			setTimeout(() => {
				this.scrollToBottom();
			}, 200);
		},
		
		handleJsonProcessed(processedData) {
			console.log('JSON数据处理完成:', processedData);
		},
		
		copyText(text) {
			if (!text) return;
			
			uni.setClipboardData({
				data: text,
				success: function() {
					uni.showToast({
						title: '已复制',
						icon: 'success'
					});
				}
			});
		},
		
		// 清除历史记录
		clearHistory() {
			uni.showModal({
				title: '确认清除',
				content: '确定要清除所有历史记录吗？',
				success: (res) => {
					if (res.confirm) {
						this.completedResponses = [];
						this.conversationMessages = [];
						uni.showToast({
							title: '已清除历史记录',
							icon: 'success'
						});
					}
				}
			});
		},
		
		// 滚动到底部 - 整体页面滚动
		scrollToBottom() {
			requestAnimationFrame(() => {
				const container = document.querySelector('.content-container');
				if (container) {
					container.scrollTop = container.scrollHeight;
				}
			});
		},
		
		handleMediaDetected(media) {
			console.log('检测到媒体:', media);
		},
		
		handleLinksDetected(links) {
			console.log('检测到链接:', links);
		},
		
		saveToHistory(responseData) {
			const responseItem = {
				prompt: this.savedPrompt,
				timestamp: Date.now(),
				text: responseData
			};
			
			if (!this.completedResponses) {
				this.completedResponses = [];
			}
			this.completedResponses.unshift(responseItem);
		},
		
		handleSaveMedia(media) {
			console.log('保存媒体:', media);
			if (!media || !media.url) return;
			
			if (media.type === 'video') {
				// 针对H5平台
				// #ifdef H5
				uni.setClipboardData({
					data: media.url,
					success: () => {
						uni.showToast({
							title: '视频链接已复制，请手动下载',
							icon: 'none',
							duration: 2000
						});
					}
				});
				// #endif
				
				// 针对APP和小程序平台
				// #ifdef APP-PLUS || MP-WEIXIN
				uni.showLoading({
					title: '准备下载...'
				});
				
				// 先下载视频文件
				uni.downloadFile({
					url: media.url,
					success: (res) => {
						uni.hideLoading();
						if (res.statusCode === 200) {
							// 调用系统文件选择器选择保存路径
							// 注意：在某些平台可能不支持选择保存路径
							// 在APP环境下，使用plus API
							// #ifdef APP-PLUS
							plus.io.resolveLocalFileSystemURL('_doc', (entry) => {
								// 生成随机文件名避免重复
								const fileName = 'video_' + new Date().getTime() + '.mp4';
								entry.getDirectory('downloads', {
									create: true
								}, (dirEntry) => {
									dirEntry.getFile(fileName, {
										create: true
									}, (fileEntry) => {
										fileEntry.createWriter((writer) => {
											// 将下载的临时文件写入选择的位置
											writer.write(res.tempFilePath);
											uni.showToast({
												title: '视频已保存到 Downloads 文件夹',
												icon: 'success'
											});
										}, (error) => {
											console.error('写入文件失败:', error);
											uni.showToast({
												title: '保存失败',
												icon: 'none'
											});
										});
									});
								});
							});
							// #endif
							
							// 在小程序环境，使用小程序的保存方法
							// #ifdef MP-WEIXIN
							uni.saveVideoToPhotosAlbum({
								filePath: res.tempFilePath,
								success: () => {
									uni.showToast({
										title: '视频已保存到相册',
										icon: 'success'
									});
								},
								fail: (err) => {
									console.error('保存视频失败:', err);
									uni.showToast({
										title: '保存失败',
										icon: 'none'
									});
								}
							});
							// #endif
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
				// #endif
			} else if (media.type === 'image') {
				// 处理图片保存
				// #ifdef H5
				uni.showModal({
					title: '提示',
					content: 'H5环境下请长按图片保存',
					showCancel: false
				});
				// #endif
				
				// #ifdef APP-PLUS || MP-WEIXIN
				uni.downloadFile({
					url: media.url,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveImageToPhotosAlbum({
								filePath: res.tempFilePath,
								success: () => {
									uni.showToast({
										title: '图片已保存到相册',
										icon: 'success'
									});
								},
								fail: (err) => {
									console.error('保存图片失败:', err);
									uni.showToast({
										title: '保存失败',
										icon: 'none'
									});
								}
							});
						}
					},
					fail: () => {
						uni.showToast({
							title: '下载失败',
							icon: 'none'
						});
					}
				});
				// #endif
			}
		}
	},

	mounted() {
		if (this.conversationMessages.length > 0) {
			setTimeout(() => {
				this.scrollToBottom();
			}, 500);
		}
		document.body.style.overflow = 'hidden';
	},

	beforeDestroy() {
		document.body.style.overflow = '';
	},

	onLoad() {
		console.log('========= AI初始化 =========');
		
		// 确保微信云开发已初始化
		// #ifdef MP-WEIXIN
		if (!wx.cloud) {
			console.error('请使用 2.2.3 或以上的基础库以使用云能力');
			uni.showToast({
				title: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
				icon: 'none',
				duration: 3000
			});
			return;
		}
		// 云开发环境已在app.js中初始化
		// #endif
		
		this.conversationMessages = [];
		
		// 初始化完成后延迟滚动到底部
		setTimeout(() => {
			this.scrollToBottom();
		}, 800);
		
		// 确保初始消息能显示
		setTimeout(() => {
			if (this.conversationMessages.length === 0 && this.$refs.conversationComp) {
				console.log('尝试强制处理初始消息');
				this.$refs.conversationComp.handleInitialMessage();
			}
		}, 1000);
	}
}
</script>

<style lang="scss">
.container {
	background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/背景和logo.png");
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	min-height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	
	.chat-container {
		flex: 1;
		padding: 20rpx 0;
		margin-bottom: 120rpx; 
		box-sizing: border-box;
		height: calc(100vh - 240rpx);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.input-area {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		border-top: 1px solid rgba(0, 242, 255, 0.15);
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

		input {
			flex: 1;
			height: 80rpx;
			padding: 0 30rpx;
			background-color: #E6F3FA;
			border-radius: 40rpx;
			font-size: 28rpx;
			color: #333333;
		}

		.placeholder-style {
			color: #999999;
			font-size: 28rpx;
		}

		.send-btn {
			width: 100rpx;
			height: 100rpx;
			padding: 0;
			margin: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: transparent;
			border-radius: 40rpx;
			border: none;

			&::after {
				border: none;
			}

			.send-icon {
				width: 200rpx;
				height: 200rpx;
			}

			&:disabled {
				opacity: 0.6;
			}
		}
	}
}
</style>



