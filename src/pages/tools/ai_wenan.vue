<template>
	<view class="container" style="padding: 0 20rpx">
		<!-- 引入外部 顶部导航栏 -->
		<navigation-bars 
			color="#171717" 
			font-size-30 
			title="AI获客文案生成助手" 
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
				placeholder="输入您的创作赛道..." 
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
			checkStatusInterval: null,
			savedPrompt: '',
			conversationMessages: [],
			userAvatar: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/user-avatar.png',
			botAvatar: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/jiqiren-big.png',
			initialBotMessage: '请问您想要什么类型的文案？',
			currentResponse: null,
			lastProcessedTimestamp: 0,
			
			// Coze API 配置
			token: 'pat_tu253KJPlSsaCx1YFunZ00wr8VmJUd3z7hujxXd79Ag7JIgNtHw0pC6G58i63F8S',
			botId: '7505746678079668233',
			userId: 'user_' + Math.random().toString(36).substring(2, 10),
			conversationId: '',
			chatId: '',
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
				content: '正在努力生成中，请耐心等待不要退出页面哦...'
			});
			
			// 延迟滚动到底部，确保DOM已更新
			setTimeout(() => {
				this.scrollToBottom();
			}, 100);
			
			try {
				// 使用coze_chatv3_request发送所有对话，带上完整历史消息
				console.log('准备调用云函数coze_chatv3_request...');
				
				// 构建包含全部历史的消息上下文
				let additionalMessages = this.conversationMessages
					.filter(msg => msg.type !== 'loading')
					.map(msg => ({
						role: msg.type === 'user' ? 'user' : 'assistant',
						content: msg.content,
						content_type: 'text',
						type: msg.type === 'user' ? 'question' : 'answer'
					}));
				
				// 准备发送参数 - 无需使用会话ID
				const callParams = {
					token: this.token,
					bot_id: this.botId,
					user_id: this.userId,
					additional_messages: additionalMessages,
					stream: false,
					auto_save_history: true
				};
				
				console.log('发送参数:', callParams);
				
				const result = await wx.cloud.callFunction({
					name: 'coze_chatv3_request',
					data: callParams
				});
				
				console.log('对话云函数返回结果:', result);
				
				if (result && result.result && result.result.code === 0) {
					// 保存聊天ID和会话ID，用于获取回复
					this.chatId = result.result.data.chat_id;
					
					// 如果返回了会话ID，则保存
					if (result.result.data.conversation_id) {
						this.conversationId = result.result.data.conversation_id;
						console.log('收到会话ID:', this.conversationId);
						
						// 保存到本地存储
						try {
							uni.setStorageSync('last_conversation_id', this.conversationId);
						} catch (e) {
							console.warn('保存会话ID失败:', e);
						}
					}
					
					// 开始轮询回复状态
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
					content: `生成回复失败，请稍后重试: ${error.message || '未知错误'}`,
					timestamp: Date.now()
				});
				
				this.loading = false;
			}
		},
		
		// 重置会话方法
		resetConversation() {
			// 清空会话ID和聊天ID
			this.conversationId = '';
			this.chatId = '';
			
			// 清除本地存储的会话ID
			try {
				uni.removeStorageSync('last_conversation_id');
				console.log('已清除本地存储的会话ID');
			} catch (e) {
				console.warn('清除本地存储会话ID失败:', e);
			}
			
			// 清空对话记录或添加提示消息
			this.conversationMessages = [];
			
			// 重新添加初始消息
			this.$nextTick(() => {
				if (this.$refs.conversationComp) {
					this.$refs.conversationComp.handleInitialMessage();
				}
			});
			
			// 显示提示
			uni.showToast({
				title: '会话已重置',
				icon: 'success'
			});
		},
		
		// 移除加载消息
		removeLoadingMessage() {
			this.conversationMessages = this.conversationMessages.filter(msg => msg.type !== 'loading');
		},
		
		// 开始检查AI回复状态
		startCheckingStatus() {
			// 清除可能存在的旧定时器
			if (this.checkStatusInterval) {
				clearInterval(this.checkStatusInterval);
			}
			
			// 检查计数器
			let checkCount = 0;
			const MAX_CHECKS = 30; // 最多检查30次，约60秒
			
			// 保存当前的聊天ID，防止在检查过程中被修改
			const currentChatId = this.chatId;
			
			console.log('开始轮询状态，聊天ID:', currentChatId);
			
			// 设置新的定时器，每2秒检查一次
			this.checkStatusInterval = setInterval(async () => {
				try {
					// 超过最大检查次数，认为超时
					if (checkCount >= MAX_CHECKS) {
						console.error('检查次数超过限制，中止检查');
						throw new Error('回复生成超时，请重试');
					}
					
					checkCount++;
					console.log(`准备调用云函数检查状态...(第${checkCount}次)`);
					console.log('状态检查参数:', {
						chatId: currentChatId
					});
					
					// 验证参数
					if (!currentChatId) {
						console.error('聊天ID为空');
						throw new Error('聊天ID不能为空');
					}
					
					const result = await wx.cloud.callFunction({
						name: 'coze_chatv3_is_reply_complete',
						data: {
							token: this.token,
							chat_id: currentChatId,
							conversation_id: this.conversationId || 'temp_conversation_id'
						}
					});
					
					console.log(`第${checkCount}次状态检查结果:`, result);
					
					if (result && result.result && result.result.code === 0) {
						const status = result.result.data;
						console.log('回复状态:', status.is_completed);
						
						// 更新token使用情况
						if (status.token) {
							const tokenUsage = {
								total: status.token.token_count || 0
							};
							console.log('Token使用详情:', tokenUsage);
						}
						
						if (status.is_completed) {
							// 回复完成
							clearInterval(this.checkStatusInterval);
							
							// 获取回复内容
							this.getReply();
						}
					} else {
						// 处理错误
						console.error('获取回复状态失败:', result?.result?.msg || '未知错误');
						throw new Error(result?.result?.msg || '获取回复状态失败');
					}
				} catch (error) {
					console.error('检查回复状态失败:', error);
					clearInterval(this.checkStatusInterval);
					this.loading = false;
					
					// 移除加载消息
					this.removeLoadingMessage();
					
					// 添加错误消息
					this.conversationMessages.push({
						type: 'bot',
						content: '检查回复状态失败，请重新发送消息: ' + (error.message || '未知错误'),
						timestamp: Date.now()
					});
				}
			}, 2000);
		},
		
		// 获取AI回复内容
		async getReply() {
			try {
				console.log('准备调用云函数coze_chatv3_get_reply获取回复...');
				console.log('获取回复参数:', {
					chatId: this.chatId
				});
				
				// 验证参数
				if (!this.chatId) {
					console.error('聊天ID为空');
					throw new Error('聊天ID不能为空');
				}
				
				const result = await wx.cloud.callFunction({
					name: 'coze_chatv3_get_reply',
					data: {
						token: this.token,
						chat_id: this.chatId,
						conversation_id: this.conversationId || 'temp_conversation_id'
					}
				});
				
				console.log('获取回复结果:', result);
				
				if (result && result.result && result.result.code === 0) {
					const reply = result.result.data.final_answer;
					
					// 移除加载消息
					this.removeLoadingMessage();
					
					// 尝试使用ResponseFormatter处理
					this.currentResponse = reply;
					
					// 保存到历史记录
					this.saveToHistory(reply);
					
					// 调用ResponseFormatter组件处理数据
					this.$nextTick(() => {
						if (this.$refs.responseFormatter) {
							this.$refs.responseFormatter.processResponse(reply);
							
							// 显示成功消息
							uni.showToast({
								title: '回复生成成功',
								icon: 'success'
							});
						} else {
							// 保险起见，直接添加原始消息
							this.conversationMessages.push({
								type: 'bot',
								content: reply,
								timestamp: Date.now(),
								showCopyButton: true
							});
						}
					});
				} else {
					const errorMsg = result?.result?.msg || '获取回复失败';
					console.error('API返回错误:', errorMsg);
					throw new Error(errorMsg);
				}
			} catch (error) {
				console.error('获取回复失败:', error);
				
				// 移除加载消息
				this.removeLoadingMessage();
				
				// 添加错误消息
				this.conversationMessages.push({
					type: 'bot',
					content: `获取回复失败，请重新发送消息: ${error.message || '未知错误'}`,
					timestamp: Date.now()
				});
			} finally {
				this.loading = false;
			}
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
			
			// 使用Vue的nextTick确保DOM更新完成
			this.$nextTick(() => {
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
					// 批量处理图片，避免频繁DOM更新
					const newMessages = result.imageUrls
						.filter(imageUrl => imageUrl && typeof imageUrl === 'string' && imageUrl.includes('http'))
						.map((imageUrl, index) => ({
							type: 'bot',
							mediaType: 'image',
							mediaUrl: imageUrl,
							timestamp: timestamp,
							content: index === 0 && textContent ? textContent : '',
							showCopyButton: index === 0 && !!textContent
						}));
					
					// 一次性添加所有消息
					this.conversationMessages.push(...newMessages);
				} else if (textContent) {
					this.conversationMessages.push({
						type: 'bot',
						content: textContent, 
						timestamp: timestamp,
						showCopyButton: true
					});
				} else {
					this.conversationMessages.push({
						type: 'bot',
						content: '未能获取到有效内容，请重试',
						timestamp: timestamp
					});
				}
				
				// 使用requestAnimationFrame优化滚动
				setTimeout(() => {
					this.scrollToBottom();
				}, 100);
			});
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
						this.conversationId = ''; // 重置会话ID
						this.chatId = ''; // 重置聊天ID
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
			setTimeout(() => {
				const chatContainer = document.querySelector('.chat-container');
				if (chatContainer) {
					chatContainer.scrollTop = chatContainer.scrollHeight;
				}
			}, 50);
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
			this.$nextTick(() => {
				this.scrollToBottom();
			});
		}
		
		// 禁用页面滚动
		document.body.style.overflow = 'hidden';
	},

	async onLoad() {
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
		
		// 初始化微信云开发环境
		wx.cloud.init({
			env: 'cloud1-5gszljn762dc4719',
			traceUser: true
		});
		// #endif
		
		this.conversationMessages = [];
		
		// 尝试从本地存储恢复会话ID
		try {
			const savedId = uni.getStorageSync('last_conversation_id');
			if (savedId) {
				console.log('从本地存储恢复到会话ID:', savedId);
				this.conversationId = savedId;
			} else {
				console.log('本地存储中没有会话ID，将在首次发送消息时创建');
				this.conversationId = ''; // 确保会话ID为空
			}
		} catch (storageError) {
			console.warn('读取本地存储失败:', storageError);
			this.conversationId = ''; // 确保会话ID为空
		}
		
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
	},
	
	beforeDestroy() {
		// 恢复页面滚动
		document.body.style.overflow = '';
		console.log('页面销毁，会话结束');
	}
}
</script>

<style lang="scss">
.container {
	background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/背景和logo.png");
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	background-attachment: fixed;
	height: 100vh;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	overflow: hidden;
	
	.chat-container {
		flex: 1;
		padding: 20rpx 0;
		margin-bottom: 120rpx; 
		box-sizing: border-box;
		position: relative;
		z-index: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		height: calc(100vh - 240rpx);
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
		background-color: rgba(255, 255, 255, 0.9);
		z-index: 2;
		height: 120rpx; // 固定输入区域高度

		input {
			flex: 1;
			height: 80rpx;
			padding: 0 30rpx;
			background-color: #E6F3FA;
			border-radius: 50rpx;
			font-size: 28rpx;
			color: #333333;
			transition: all 0.3s ease;
			
			&:focus {
				background-color: #ffffff;
				box-shadow: 0 0 10rpx rgba(0, 242, 255, 0.2);
			}
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
			border-radius: 50rpx;
			border: none;
			transition: all 0.3s ease;

			&::after {
				border: none;
			}

			.send-icon {
				width: 200rpx;
				height: 200rpx;
				transition: transform 0.3s ease;
			}

			&:active {
				transform: scale(0.95);
				.send-icon {
					transform: scale(0.95);
				}
			}

			&:disabled {
				opacity: 1;
			}
		}
	}
}
</style>



