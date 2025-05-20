<template>
	<view class="container" style="padding: 0 20rpx">
		<!-- 引入外部 顶部导航栏 -->
		<navigation-bars 
			color="#171717" 
			font-size-30 
			title="小红书封面图生成助手" 
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
			
			<!-- 处理数据的组件 -->
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
				placeholder="输入您想要生成的内容..." 
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
			initialBotMessage: '请在下方输入您想要的图片描述',
			currentResponse: null,
			lastProcessedTimestamp: 0
		}
	},
	methods: {
		backPage() {
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack({
					delta: 1
				});
			} else {
				uni.switchTab({
					url: '/pages/table/index/index'
				});
			}
		},
		
		async handleSendMessage() {
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
			this.prompt = '';
			
			this.conversationMessages.push({
				type: 'user',
				content: message,
				timestamp: Date.now()
			});
			
			this.conversationMessages.push({
				type: 'loading',
				content: '正在生成中...'
			});
			
			setTimeout(() => {
				this.scrollToBottom();
			}, 100);
			
			try {
				// 调用 coze_request 云函数创建任务
				const result = await wx.cloud.callFunction({
					name: 'coze_request',
					data: {
						token: 'pat_tu253KJPlSsaCx1YFunZ00wr8VmJUd3z7hujxXd79Ag7JIgNtHw0pC6G58i63F8S',
						workflowId: '7501891695815786548',
						parameters: {
							prompt: this.savedPrompt
						}
					}
				});
				
				if (result.result.code === 0) {
					this.taskId = result.result.data.execute_id;
					// 开始轮询任务状态
					this.startCheckingStatus();
				} else {
					throw new Error(result.result.msg || '创建任务失败');
				}
			} catch (error) {
				console.error('生成失败:', error);
				this.removeLoadingMessage();
				this.conversationMessages.push({
					type: 'bot',
					content: `生成失败，请稍后重试`,
					timestamp: Date.now()
				});
				
				this.loading = false;
			}
		},
		
		removeLoadingMessage() {
			this.conversationMessages = this.conversationMessages.filter(msg => msg.type !== 'loading');
		},
		
		startCheckingStatus() {
			if (this.checkStatusInterval) {
				clearInterval(this.checkStatusInterval);
			}
			
			this.checkStatusInterval = setInterval(async () => {
				try {
					const result = await wx.cloud.callFunction({
						name: 'coze_worker',
						data: {
							token: 'pat_tu253KJPlSsaCx1YFunZ00wr8VmJUd3z7hujxXd79Ag7JIgNtHw0pC6G58i63F8S',
							workflowId: '7501891695815786548',
							execute_id: this.taskId
						}
					});
					
					if (result.result.code === 0) {
						const task = result.result.data;
						console.log('任务状态:', task.status);
						console.log('Token值:', task.token);
						
						if (task.status === 'Success') {
							clearInterval(this.checkStatusInterval);
							this.loading = false;
							
							this.removeLoadingMessage();
							
							try {
								let rawData = task.rawOutput?.output || task.rawOutput || task.originalData?.output || task.originalData || '';
								console.log('获取到原始数据类型:', typeof rawData, rawData);
								
								this.saveToHistory(rawData);
								
								this.currentResponse = rawData;
								
								this.$nextTick(() => {
									if (this.$refs.responseFormatter) {
										this.$refs.responseFormatter.processResponse(rawData);
										
										uni.showToast({
											title: '生成成功',
											icon: 'success'
										});
									} else {
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
							clearInterval(this.checkStatusInterval);
							this.loading = false;
							this.removeLoadingMessage();
							this.conversationMessages.push({
								type: 'bot',
								content: '很抱歉，生成失败，请调整您的描述或稍后再试',
								timestamp: Date.now()
							});
						}
					} else {
						console.error('获取任务状态失败:', result.result.msg);
						clearInterval(this.checkStatusInterval);
						this.loading = false;
						this.removeLoadingMessage();
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
					this.removeLoadingMessage();
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
			this.$nextTick(() => {
				if (this.$refs.responseFormatter) {
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
			
			// 检查是否有coze短链接图片
			if (result.originalData && typeof result.originalData === 'string' && 
				(result.originalData.includes('s.coze.cn/t/') || result.originalData.includes('coze.cn/t/'))) {
				
				console.log('检测到Coze短链接图片:', result.originalData);
				const imageUrl = result.originalData.trim();
				
				// 添加图片消息
				this.conversationMessages.push({
					type: 'bot',
					content: textContent || '生成的图片：',
					mediaType: 'image',
					mediaUrl: imageUrl,
					timestamp: timestamp,
					showCopyButton: true
				});
				
				// 更新历史记录中的图片URL
				if (!result.imageUrls) {
					result.imageUrls = [imageUrl];
				} else if (Array.isArray(result.imageUrls)) {
					result.imageUrls.push(imageUrl);
				}
				
				console.log('添加了图片消息:', imageUrl);
			}
			else if (result.videoUrl) {
				
				console.log('检测到视频URL:', result.videoUrl);
				
				let videoUrl = result.videoUrl;
				
				if (typeof videoUrl === 'object') {
					videoUrl = JSON.stringify(videoUrl);
				}
				
				// 清理视频URL，确保去除引号等字符
				videoUrl = videoUrl.replace(/^["']+|["']+$/g, '');
				
				// 使用mediaType进行视频显示
				this.conversationMessages.push({
					type: 'bot',
					content: textContent || '视频内容：',
					mediaType: 'video',
					mediaUrl: videoUrl,
					timestamp: timestamp,
					showCopyButton: true
				});
				
				// 添加一条纯文本消息以便于复制链接
				this.conversationMessages.push({
					type: 'bot',
					content: `视频链接：${videoUrl}`,
					timestamp: timestamp + 1,
					showCopyButton: true
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
		
		handleSaveMedia({ url, type }) {
			console.log('保存媒体:', url, type);
			if (type === 'image' && url) {
				this.saveImage(url);
			}
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
		
		// 保存图片
		saveImage(url) {
			if (!url) return;
			
			// 先检查是否有保存到相册的权限
			uni.getSetting({
				success: (res) => {
					// 如果没有权限，或者未曾询问过用户
					if (!res.authSetting['scope.writePhotosAlbum']) {
						uni.authorize({
							scope: 'scope.writePhotosAlbum',
							success: () => {
								// 用户同意授权，继续下载并保存图片
								this.downloadAndSaveImage(url);
							},
							fail: (err) => {
								console.error('授权失败:', err);
								// 如果用户拒绝授权，提示用户前往设置页面开启权限
								uni.showModal({
									title: '提示',
									content: '保存图片需要您授权使用相册权限，请在设置中开启',
									confirmText: '去设置',
									cancelText: '取消',
									success: (modalRes) => {
										if (modalRes.confirm) {
											// 打开设置页面
											uni.openSetting({
												success: (settingRes) => {
													// 如果用户在设置页面开启了权限，再次尝试保存
													if (settingRes.authSetting['scope.writePhotosAlbum']) {
														this.downloadAndSaveImage(url);
													}
												}
											});
										}
									}
								});
							}
						});
					} else {
						// 已有权限，直接下载保存
						this.downloadAndSaveImage(url);
					}
				},
				fail: (err) => {
					console.error('获取设置失败:', err);
					uni.showToast({
						title: '获取权限信息失败',
						icon: 'none'
					});
				}
			});
		},
		
		// 下载并保存图片
		downloadAndSaveImage(url) {
			uni.showLoading({
				title: '保存中...'
			});
			
			uni.downloadFile({
				url: url,
				success: (res) => {
					if (res.statusCode === 200) {
						uni.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success: () => {
								uni.hideLoading();
								uni.showToast({
									title: '保存成功',
									icon: 'success'
								});
							},
							fail: (err) => {
								uni.hideLoading();
								console.error('保存图片失败:', err);
								uni.showToast({
									title: '保存失败: ' + (err.errMsg || '未知错误'),
									icon: 'none',
									duration: 2000
								});
							}
						});
					} else {
						uni.hideLoading();
						uni.showToast({
							title: '图片下载失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					uni.hideLoading();
					console.error('下载图片失败:', err);
					uni.showToast({
						title: '下载失败: ' + (err.errMsg || '未知错误'),
						icon: 'none'
					});
				}
			});
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
		
		this.conversationMessages = [];
		
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



