<template>
	<view class="container" style="color: white">
		<!-- 引入外部 顶部导航栏 -->
		<navigation-bars 
			color="#171717" 
			font-size-30 
			title="视频生成助手" 
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
		</view>
		
		<!-- 参数设置面板 -->
		<view class="params-panel" v-if="showParamsPanel">
			<view class="panel-header">
				<text class="panel-title">视频参数设置</text>
				<view class="close-btn" @tap="toggleParamsPanel">
					<text>×</text>
				</view>
			</view>
			
			<scroll-view scroll-y class="params-content">
				<!-- 分辨率选择 -->
				<view class="param-item">
					<text class="param-label">分辨率:</text>
					<view class="radio-group">
						<view 
							v-for="(option, index) in resolutionOptions" 
							:key="'res-'+index" 
							class="radio-item"
							:class="{ active: videoParams.resolution === option }"
							@tap="videoParams.resolution = option"
						>
							<text>{{ option }}</text>
						</view>
					</view>
				</view>
				
				<!-- 宽高比选择 -->
				<view class="param-item">
					<text class="param-label">比例:</text>
					<view class="ratio-group">
						<view 
							v-for="(option, index) in ratioOptions" 
							:key="'ratio-'+index" 
							class="ratio-item"
							:class="{ active: videoParams.ratio === option }"
							@tap="videoParams.ratio = option"
						>
							<text>{{ option }}</text>
						</view>
					</view>
				</view>
				
				<!-- 时长选择 -->
				<view class="param-item">
					<text class="param-label">时长:</text>
					<view class="radio-group">
						<view 
							v-for="(option, index) in durationOptions" 
							:key="'dur-'+index" 
							class="radio-item"
							:class="{ active: videoParams.duration === option }"
							@tap="videoParams.duration = option"
						>
							<text>{{ option }}秒</text>
						</view>
					</view>
				</view>
				
				<!-- 帧率选择 -->
				<view class="param-item">
					<text class="param-label">帧率:</text>
					<view class="radio-group">
						<view 
							v-for="(option, index) in fpsOptions" 
							:key="'fps-'+index" 
							class="radio-item"
							:class="{ active: videoParams.framepersecond === option }"
							@tap="videoParams.framepersecond = option"
						>
							<text>{{ option }}</text>
						</view>
					</view>
				</view>
				
				<!-- 水印选择 -->
				<view class="param-item">
					<text class="param-label">水印:</text>
					<view class="switch-item">
						<switch 
							:checked="videoParams.watermark" 
							@change="videoParams.watermark = $event.detail.value"
							color="#007AFF"
						/>
						<text>{{ videoParams.watermark ? '开启' : '关闭' }}</text>
					</view>
				</view>
				
				<!-- 固定摄像头选择 -->
				<view class="param-item">
					<text class="param-label">固定摄像头:</text>
					<view class="switch-item">
						<switch 
							:checked="videoParams.camerafixed" 
							@change="videoParams.camerafixed = $event.detail.value"
							color="#007AFF"
						/>
						<text>{{ videoParams.camerafixed ? '开启' : '关闭' }}</text>
					</view>
				</view>
				
				<!-- 随机种子 -->
				<view class="param-item">
					<text class="param-label">随机种子:</text>
					<view class="seed-input">
						<input 
							type="number" 
							v-model="videoParams.seed" 
							placeholder="输入种子值(-1表示随机)"
							maxlength="10"
							@input="validateSeed"
						/>
					</view>
				</view>
				
				<!-- 提交按钮 -->
				<button class="confirm-btn" @tap="saveParamsAndClose">确定</button>
			</scroll-view>
		</view>
		
		<!-- 底部输入框区域 -->
		<view class="input-area">
			<button class="param-btn" @tap="toggleParamsPanel">
				<image src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/s tool.png" mode="aspectFit" class="param-icon"></image>
			</button>
			<input 
				type="text" 
				v-model="prompt" 
				:disabled="loading" 
				placeholder="输入视频生成描述..." 
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

export default {
	components: {
		NavigationBars,
		IntelligentAssistant,
		Conversation,
	},

	data() {
		return {
			prompt: '',
			loading: false,
			savedPrompt: '',
			conversationMessages: [],
			userAvatar: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/user-avatar.png',
			botAvatar: 'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/jiqiren-big.png',
			initialBotMessage: `您好，我是视频生成助手。请输入您想要生成的视频描述，例如"生成一段星空下的城市夜景视频"。

您可以点击左侧设置按钮自定义视频参数，或者在描述中指定参数：
- 分辨率：480p 或 720p (例如：分辨率:720p)
- 比例：16:9, 4:3, 1:1, 3:4, 9:16 等 (例如：比例:16:9)
- 时长：5秒 或 10秒 (例如：时长:10秒)
- 帧率：16 或 24 (例如：帧率:24)

示例："生成一段太空飞船穿越星系的视频 分辨率:720p 比例:16:9 时长:10秒"`,
			
			// 视频生成相关
			videoTaskId: '',
			videoModel: 'wan2-1-14b-t2v-250225',
			videoPollingInterval: null,
			videoTasks: [],
			
			// 参数面板控制
			showParamsPanel: false,
			
			// 视频参数设置
			videoParams: {
				resolution: '720p',       // 视频分辨率，默认720p
				ratio: '16:9',            // 宽高比，默认16:9
				duration: 5,              // 时长，默认5秒
				framepersecond: 24,       // 帧率，默认24
				watermark: false,         // 水印，默认false
				seed: -1,                 // 种子值，默认-1（随机）
				camerafixed: false        // 固定摄像头，默认false
			},
			
			// 参数选项
			resolutionOptions: ['480p', '720p'],
			ratioOptions: ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9', '9:21', 'keep_ratio'],
			durationOptions: [5, 10],
			fpsOptions: [16, 24],
		}
	},
	methods: {
		// 导航栏 返回上一页
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
		
		// 处理发送消息
		async handleSendMessage() {
			const message = this.prompt;
			if (!message || !message.trim()) {
				uni.showToast({
					title: '请输入视频描述',
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
				content: '正在生成视频中...'
			});
			
			// 延迟滚动到底部，确保DOM已更新
			setTimeout(() => {
				this.scrollToBottom();
			}, 100);
			
			// 调用视频生成
			this.createVideoTask(message);
		},
		
		// 移除加载消息
		removeLoadingMessage() {
			this.conversationMessages = this.conversationMessages.filter(msg => msg.type !== 'loading');
		},
		
		// ------------ 视频生成相关方法 ------------
		
		// 创建视频生成任务
		async createVideoTask(prompt) {
			try {
				// 从用户输入中解析特殊参数
				// 例如：生成一段太空视频 比例16:9 时长10秒
				const resolutionMatch = prompt.match(/分辨率\s*[：:]\s*(480p|720p)/i);
				const ratioMatch = prompt.match(/比例\s*[：:]\s*(16:9|4:3|1:1|3:4|9:16|21:9|9:21)/i);
				const durationMatch = prompt.match(/时长\s*[：:]\s*(\d+)(?:\s*秒)?/i);
				const fpsMatch = prompt.match(/帧率\s*[：:]\s*(16|24)/i);
				
				// 应用从文本中解析的参数
				const params = {
					...this.videoParams
				};
				
				if (resolutionMatch) params.resolution = resolutionMatch[1];
				if (ratioMatch) params.ratio = ratioMatch[1];
				if (durationMatch) params.duration = parseInt(durationMatch[1]);
				if (fpsMatch) params.framepersecond = parseInt(fpsMatch[1]);
				
				// 清除用户描述中的参数文本，保留纯描述文本
				let cleanPrompt = prompt;
				if (resolutionMatch) cleanPrompt = cleanPrompt.replace(resolutionMatch[0], '');
				if (ratioMatch) cleanPrompt = cleanPrompt.replace(ratioMatch[0], '');
				if (durationMatch) cleanPrompt = cleanPrompt.replace(durationMatch[0], '');
				if (fpsMatch) cleanPrompt = cleanPrompt.replace(fpsMatch[0], '');
				
				// 整理清理后的提示文本
				cleanPrompt = cleanPrompt.replace(/\s+/g, ' ').trim();
				
				console.log('准备创建视频任务...', {
					model: this.videoModel,
					content: cleanPrompt,
					...params
				});
				
				// 添加请求中状态提示
				this.conversationMessages.push({
					type: 'bot',
					content: '正在提交视频生成请求...',
					timestamp: Date.now()
				});
				
				const result = await wx.cloud.callFunction({
					name: 'jimeng_createVideoTask',
					data: {
						model: this.videoModel,
						content: cleanPrompt,
						...params
					}
				});
				
				console.log('创建视频任务结果:', JSON.stringify(result));
				
				if (result && result.result && result.result.code === 200) {
					// 获取任务ID
					this.videoTaskId = result.result.data.id || result.result.data.task_id;
					
					// 添加任务创建成功的提示
					this.conversationMessages.push({
						type: 'bot',
						content: `视频生成任务已创建，请耐心等待。任务ID: ${this.videoTaskId}`,
						timestamp: Date.now()
					});
					
					// 移除加载消息
					this.removeLoadingMessage();
					
					// 开始轮询视频任务状态
					this.startPollingVideoTask();
				} else {
					// 提取更详细的错误信息
					const errorMsg = result && result.result ? (result.result.message || '未知错误') : '创建视频任务失败';
					const errorDetails = result && result.result && result.result.data ? JSON.stringify(result.result.data) : '';
					
					throw new Error(`${errorMsg}${errorDetails ? ' - ' + errorDetails : ''}`);
				}
			} catch (error) {
				console.error('创建视频任务失败:', error);
				
				// 移除加载消息
				this.removeLoadingMessage();
				
				// 尝试提取更详细的错误信息
				let errorMessage = error.message || '未知错误';
				
				// 添加错误消息
				this.conversationMessages.push({
					type: 'bot',
					content: `创建视频任务失败，请稍后重试: ${errorMessage}`,
					timestamp: Date.now()
				});
				
				// 添加故障排除建议
				this.conversationMessages.push({
					type: 'bot',
					content: '可能的原因: API密钥无效、网络问题或服务暂时不可用。请稍后再试或联系管理员。',
					timestamp: Date.now() + 1
				});
				
				this.loading = false;
			}
		},
		
		// 开始轮询视频任务状态
		startPollingVideoTask() {
			// 清除可能存在的旧定时器
			if (this.videoPollingInterval) {
				clearInterval(this.videoPollingInterval);
			}
			
			// 设置新的定时器，每3秒检查一次
			this.videoPollingInterval = setInterval(() => {
				this.checkVideoTaskStatus();
			}, 3000);
		},
		
		// 检查视频任务状态
		async checkVideoTaskStatus() {
			try {
				if (!this.videoTaskId) {
					console.error('视频任务ID为空');
					this.stopPollingVideoTask();
					return;
				}
				
				console.log('检查视频任务状态:', this.videoTaskId);
				
				const result = await wx.cloud.callFunction({
					name: 'jimeng_getVideoTask',
					data: {
						taskId: this.videoTaskId
					}
				});
				
				console.log('查询视频任务结果:', JSON.stringify(result));
				
				if (result && result.result && result.result.code === 200) {
					const taskData = result.result.data;
					// 兼容不同API的状态命名
					const status = taskData.status || taskData.task_status || '';
					
					// 根据任务状态处理
					if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'succeeded') {
						// 任务成功，获取视频URL
						this.stopPollingVideoTask();
						this.handleVideoTaskSuccess(taskData);
					} else if (status === 'FAILED' || status === 'FAILURE') {
						// 任务失败
						this.stopPollingVideoTask();
						this.handleVideoTaskFailed(taskData.fail_reason || taskData.error_msg || '未知原因');
					} else if (status === 'TIMEOUT') {
						// 任务超时
						this.stopPollingVideoTask();
						this.handleVideoTaskFailed('任务超时');
					} else if (status === 'CANCELED' || status === 'CANCELLED') {
						// 任务被取消
						this.stopPollingVideoTask();
						this.handleVideoTaskFailed('任务已取消');
					}
					// 其他状态(IN_PROGRESS, PENDING, RUNNING)继续轮询
				} else {
					console.error('查询视频任务失败:', result && result.result ? result.result.message : '未知错误');
				}
			} catch (error) {
				console.error('检查视频任务状态失败:', error);
			}
		},
		
		// 停止轮询视频任务状态
		stopPollingVideoTask() {
			if (this.videoPollingInterval) {
				clearInterval(this.videoPollingInterval);
				this.videoPollingInterval = null;
			}
			this.loading = false;
		},
		
		// 处理视频任务成功
		handleVideoTaskSuccess(taskData) {
			console.log('视频生成成功:', taskData);
			
			// 获取视频URL (兼容不同的返回格式)
			let videoUrl = '';
			
			// 新的API格式： content.video_url
			if (taskData.content && taskData.content.video_url) {
				videoUrl = taskData.content.video_url;
			} 
			// 情况1: result.url 结构
			else if (taskData.result && taskData.result.url) {
				videoUrl = taskData.result.url;
			} 
			// 情况2: output.url 结构
			else if (taskData.output && taskData.output.url) {
				videoUrl = taskData.output.url;
			}
			// 情况3: url 直接在结果中
			else if (taskData.url) {
				videoUrl = taskData.url;
			}
			
			if (!videoUrl) {
				this.conversationMessages.push({
					type: 'bot',
					content: '视频生成完成，但未获取到视频链接',
					timestamp: Date.now()
				});
				return;
			}
			
			console.log('成功获取到视频URL:', videoUrl);
			
			// 移除加载消息
			this.removeLoadingMessage();
			
			// 添加视频消息
			this.conversationMessages.push({
				type: 'bot',
				content: '视频已生成完成，您可以点击播放或保存',
				mediaType: 'video',
				mediaUrl: videoUrl,
				parsedUrl: videoUrl, // 添加已解析的URL
				timestamp: Date.now(),
				showCopyButton: true,
				videoLoading: false,
				initialized: true,
				useSimplePlayer: true
			});
			
			// 确保页面滚动到底部
			setTimeout(() => {
				this.scrollToBottom();
			}, 200);
			
			uni.showToast({
				title: '视频生成成功',
				icon: 'success'
			});
		},
		
		// 处理视频任务失败
		handleVideoTaskFailed(reason) {
			console.error('视频生成失败:', reason);
			
			this.conversationMessages.push({
				type: 'bot',
				content: `视频生成失败: ${reason}`,
				timestamp: Date.now()
			});
			
			uni.showToast({
				title: '视频生成失败',
				icon: 'none'
			});
		},
		
		// 获取用户的视频任务列表
		async getVideoTasksList() {
			try {
				const result = await wx.cloud.callFunction({
					name: 'jimeng_listVideoTasks',
					data: {
						page_num: 1,
						page_size: 10
					}
				});
				
				console.log('获取视频任务列表结果:', result);
				
				if (result && result.result && result.result.code === 200) {
					this.videoTasks = result.result.data.tasks || [];
					
					// 如果有历史任务，显示在对话中
					if (this.videoTasks.length > 0) {
						const recentTasks = this.videoTasks.slice(0, 3); // 只显示最近的3个任务
						
						setTimeout(() => {
							this.conversationMessages.push({
								type: 'bot',
								content: '您有以下最近的视频任务：',
								timestamp: Date.now()
							});
							
							recentTasks.forEach(task => {
								if (task.status === 'SUCCESS' && task.result && task.result.url) {
									this.conversationMessages.push({
										type: 'bot',
										content: `${task.content ? '历史视频任务: ' + task.content.substring(0, 20) + '...' : '历史视频任务'}`,
										mediaType: 'video',
										mediaUrl: task.result.url,
										timestamp: Date.now(),
										showCopyButton: true,
										videoLoading: false,
										initialized: true,
										useSimplePlayer: true
									});
								}
							});
						}, 1000);
					}
					
					return this.videoTasks;
				} else {
					console.error('获取视频任务列表失败:', result && result.result ? result.result.message : '未知错误');
					return [];
				}
			} catch (error) {
				console.error('获取视频任务列表失败:', error);
				return [];
			}
		},
		
		// 删除视频任务
		async deleteVideoTask(taskId) {
			try {
				if (!taskId) {
					uni.showToast({
						title: '任务ID不能为空',
						icon: 'none'
					});
					return false;
				}
				
				const result = await wx.cloud.callFunction({
					name: 'jimeng_deleteVideoTask',
					data: {
						taskId: taskId
					}
				});
				
				console.log('删除视频任务结果:', result);
				
				if (result && result.result && (result.result.code === 204 || result.result.code === 200)) {
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
					
					// 从列表中移除已删除的任务
					this.videoTasks = this.videoTasks.filter(task => task.task_id !== taskId);
					
					return true;
				} else {
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
					return false;
				}
			} catch (error) {
				console.error('删除视频任务失败:', error);
				uni.showToast({
					title: '删除失败: ' + (error.message || '未知错误'),
					icon: 'none'
				});
				return false;
			}
		},
		
		// 复制文本
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
		
		// 滚动到底部
		scrollToBottom() {
			requestAnimationFrame(() => {
				const chatContainer = document.querySelector('.chat-container');
				if (chatContainer) {
					chatContainer.scrollTop = chatContainer.scrollHeight;
				}
			});
		},
		
		handleMediaDetected(media) {
			console.log('检测到媒体:', media);
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
			}
		},
		
		// 切换参数面板显示
		toggleParamsPanel() {
			this.showParamsPanel = !this.showParamsPanel;
		},
		
		// 保存参数并关闭面板
		saveParamsAndClose() {
			// 确保种子值在合理范围内
			this.validateSeed();
			
			// 保存参数设置
			uni.showToast({
				title: '参数设置已保存',
				icon: 'success',
				duration: 1500
			});
			
			// 关闭参数面板
			this.showParamsPanel = false;
		},
		
		// 验证种子值
		validateSeed() {
			// 转换为数字
			const seedValue = parseInt(this.videoParams.seed);
			
			// 如果不是有效数字，设为默认值-1
			if (isNaN(seedValue)) {
				this.videoParams.seed = -1;
				return;
			}
			
			// 限制种子值范围在合理区间内（-1表示随机，正数为具体种子值）
			if (seedValue < -1) {
				this.videoParams.seed = -1;
			} else if (seedValue > 2147483647) { // 防止超出32位整数范围
				this.videoParams.seed = 2147483647;
			}
		},
	},

	onLoad() {
		console.log('========= 视频生成助手初始化 =========');
		
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
		
		// 初始化视频任务列表
		this.getVideoTasksList().then(tasks => {
			console.log('已获取视频任务列表:', tasks.length);
		});
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

	beforeDestroy() {
		// 恢复页面滚动
		document.body.style.overflow = '';
		
		// 清除定时器
		if (this.videoPollingInterval) {
			clearInterval(this.videoPollingInterval);
		}
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
	
	// 参数设置面板
	.params-panel {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 120rpx;
		background-color: rgba(255, 255, 255, 0.98);
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.15);
		z-index: 100;
		max-height: 75vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		
		.panel-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 24rpx 30rpx;
			border-bottom: 1px solid rgba(0, 122, 255, 0.2);
			flex-shrink: 0;
			
			.panel-title {
				font-size: 34rpx;
				font-weight: bold;
				color: #333;
			}
			
			.close-btn {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				text {
					font-size: 44rpx;
					color: #666;
				}
			}
		}
		
		.params-content {
			padding: 24rpx 30rpx;
			max-height: calc(75vh - 80rpx);
			overflow-y: auto;
			-webkit-overflow-scrolling: touch;
			flex: 1;
			
			.param-item {
				margin-bottom: 36rpx;
				width: 100%;
				
				.param-label {
					display: block;
					font-size: 30rpx;
					color: #333;
					font-weight: 500;
					margin-bottom: 16rpx;
				}
				
				.radio-group, .ratio-group {
					display: flex;
					flex-wrap: wrap;
					gap: 20rpx;
					width: 100%;
					
					.radio-item, .ratio-item {
						padding: 12rpx 24rpx;
						border-radius: 8rpx;
						background-color: #f0f0f0;
						border: 1px solid #e0e0e0;
						font-size: 28rpx;
						transition: all 0.2s;
						color: #333;
						
						&.active {
							background-color: #007AFF;
							color: #ffffff;
							border-color: #0062cc;
							box-shadow: 0 2rpx 6rpx rgba(0, 122, 255, 0.3);
							font-weight: 500;
						}
					}
				}
				
				.ratio-group {
					.ratio-item {
						min-width: 100rpx;
						text-align: center;
					}
				}
				
				.switch-item {
					display: flex;
					align-items: center;
					
					text {
						margin-left: 20rpx;
						font-size: 28rpx;
						color: #333;
					}
				}
				
				.seed-input {
					input {
						height: 70rpx;
						background-color: #f7f7f7;
						border-radius: 8rpx;
						border: 1px solid #e0e0e0;
						padding: 0 20rpx;
						font-size: 28rpx;
						width: 100%;
						box-sizing: border-box;
						color: #333;
						max-width: 100%;
						overflow: hidden;
						text-overflow: ellipsis;
						
						&:focus {
							border-color: #007AFF;
							background-color: #fff;
							box-shadow: 0 0 0 2rpx rgba(0, 122, 255, 0.2);
						}
					}
				}
			}
			
			.confirm-btn {
				margin-top: 20rpx;
				margin-bottom: 40rpx;
				background-color: #007AFF;
				color: #fff;
				border-radius: 40rpx;
				height: 80rpx;
				line-height: 80rpx;
				font-size: 30rpx;
				font-weight: 500;
				box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
				display: flex;
				align-items: center;
				justify-content: center;
				letter-spacing: 2rpx;
				width: 90%;
				margin-left: auto;
				margin-right: auto;
				
				&:active {
					background-color: #0062cc;
					transform: translateY(2rpx);
				}
				
				&::before {
					content: '';
					width: 36rpx;
					height: 36rpx;
					background-image: url('https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/check.png');
					background-size: contain;
					background-repeat: no-repeat;
					margin-right: 10rpx;
				}
			}
		}
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
		z-index: 10;
		height: 120rpx; // 固定输入区域高度
		
		.param-btn {
			min-width: 80rpx;
			width: 80rpx;
			height: 80rpx;
			padding: 0;
			margin: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: rgba(0, 242, 255, 0.1);
			border-radius: 40rpx;
			border: none;
			transition: all 0.3s ease;
			
			&::after {
				border: none;
			}
			
			.param-icon {
				width: 48rpx;
				height: 48rpx;
			}
			
			&:active {
				background-color: rgba(0, 242, 255, 0.2);
				transform: scale(0.95);
			}
		}

		input {
			flex: 1;
			height: 80rpx;
			padding: 0 30rpx;
			background-color: #E6F3FA;
			border-radius: 40rpx;
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
			border-radius: 40rpx;
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
				opacity: 0.6;
			}
		}
	}
}
</style>



