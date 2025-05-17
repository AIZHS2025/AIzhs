<template>
	<view class="container" style="padding: 0 20rpx">
		<!-- 引入外部 顶部导航栏 -->
		<navigation-bars 
			color="#171717" 
			font-size-30 
			title="古诗话生成助手"
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
				placeholder="输出您的内容..."
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
			initialBotMessage: '您可以试着描述一个画面',
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
						workflowId: '7490809486212005888',
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
							workflowId: '7490583402404839439',
							execute_id: this.taskId
						}
					});
					
					if (result.result.code === 0) {
						const task = result.result.data;
						console.log('任务状态:', task.status);
						
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

			if (result.videoUrl) {
				
				console.log('检测到视频URL:', result.videoUrl);
				
				let videoUrl = result.videoUrl;
				
				if (typeof videoUrl === 'object') {
					videoUrl = JSON.stringify(videoUrl);
				}
				
				处理视频内容
				this.conversationMessages.push({
					type: 'bot',
					content: textContent,
					mediaType: 'video',
					mediaUrl: videoUrl,
					timestamp: timestamp,
					showCopyButton: !!textContent,
					videoLoading: true 
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
			setTimeout(() => {
				uni.pageScrollTo({
					scrollTop: 99999,
					duration: 300
				});
			}, 200);
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
		}
	},

	mounted() {
		if (this.conversationMessages.length > 0) {
			setTimeout(() => {
				this.scrollToBottom();
			}, 500);
		}
	},

	onLoad() {
		console.log('========= AI初始化 =========');
		
		this.conversationMessages = [];
		
		setTimeout(() => {
			this.scrollToBottom();
		}, 800);
		
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
	position: relative;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	
	.chat-container {
		flex: 1;
		padding: 20rpx 0;
		margin-bottom: 120rpx; 
		box-sizing: border-box;
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



