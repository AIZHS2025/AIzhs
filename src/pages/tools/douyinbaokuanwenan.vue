<template>
	<view class="container">
		<!-- 引入外部 顶部导航栏 -->
		<navigation-bars
			color="#171717"
			title="抖音爆款文案生成"
			@pack="backPage"
			:image="'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/返回.png'" />

		<!-- 引入外部 智能助手小智 -->
		<intelligent-assistant></intelligent-assistant>

		<!-- 主要内容区域 -->
		<scroll-view class="content-area" scroll-y="true" :scroll-top="scrollTop">
			<!-- 欢迎区域 -->
			<view class="welcome-area" v-if="!loading && completedResponses.length === 0">
				<view class="robot-message">
					<view class="robot-avatar">
						<image src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/jiqiren-big.png" mode="aspectFit"></image>
					</view>
					<view class="message-bubble">
						<view class="message-text">Hi, 我是您的抖音爆款文案生成助手</view>
						<view class="message-text">请输入您需要生成文案的内容主题或关键词</view>
						<view class="message-text">例如：养生饮食、美容护肤、生活妙招等</view>
					</view>
				</view>
			</view>
			
			<!-- 历史消息 -->
			<view class="message-list" v-if="completedResponses.length > 0">
				<view class="message-item" v-for="(response, index) in completedResponses" :key="index">
					<view class="user-message">
						<view class="message-bubble">
							<view class="message-text">{{ response.prompt }}</view>
						</view>
					</view>
					
					<view class="robot-message">
						<view class="robot-avatar">
							<image src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/jiqiren-big.png" mode="aspectFit"></image>
						</view>
						<view class="message-bubble">
							<view class="message-text" v-if="response.text" v-html="formatContentWithHighlight(response.text)"></view>
							
							<!-- 视频展示 -->
							<view class="video-container" v-if="response.videoUrl">
								<video 
									:src="response.videoUrl" 
									controls 
									show-center-play-btn="true" 
									show-play-btn="true"
									enable-progress-gesture
									object-fit="contain"
									class="video-player"
								></video>
								<view class="video-actions">
									<button class="action-btn" @tap="copyVideoUrl(response.videoUrl)">复制视频链接</button>
									<button class="action-btn" @tap="openInBrowser(response.videoUrl)">在浏览器打开</button>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载中提示 -->
			<view class="loading-container" v-if="loading">
				<text class="loading-text">AI正在思考中...</text>
			</view>
		</scroll-view>
		
		<!-- 底部输入区域 -->
		<view class="input-area">
			<input 
				type="text" 
				v-model="prompt" 
				:disabled="loading" 
				placeholder="请输入产品或服务需求" 
				placeholder-class="placeholder-style"
				@confirm="generateWenan" 
			/>
			<button class="send-btn" :disabled="loading || !prompt.trim()" @tap="generateWenan">
				<image src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/跳转 (1).png" mode="aspectFit" class="send-icon"></image>
			</button>
		</view>
	</view>
</template>

<script>
// 引入外部组件
import NavigationBars from "../../components/navigation-bars/index.vue";
import IntelligentAssistant from "../table/tools/components/Intelligent-assistant.vue";

export default {
	components: {
		NavigationBars,
		IntelligentAssistant
	},
	data() {
		return {
			prompt: '',
			loading: false,
			scrollTop: 0,
			completedResponses: [],
			taskId: null,
			checkStatusInterval: null
		}
	},
	methods: {
		// 导航栏 返回上一页
		backPage() {
			uni.navigateBack({
				delta: 1
			});
		},
		// 处理输入
		onInput(e) {
			this.prompt = e.detail.value;
		},
		
		// 处理发送
		handleSend() {
			if (!this.prompt.trim() || this.loading) return;
			this.generateWenan();
		},
		
		// 格式化文案内容以便显示
		formatContentWithHighlight(text) {
			if (!text) return '';
			
			// 确保text是字符串
			if (typeof text !== 'string') {
				text = String(text);
			}
			
			// 检查是否已有【文案 X】格式的内容
			if (text.includes('【文案 ')) {
				// 替换【文案 X】标签为带样式的HTML
				return text.replace(/【文案\s+(\d+)】\n/g, 
					'<div class="content-section-title">文案 $1</div>');
			} else {
				// 处理没有【文案 X】格式的内容
				// 检查是否有数字列表格式 (如 "1. 内容")
				const hasNumberedList = /^\d+\.\s+/m.test(text);
				
				if (hasNumberedList) {
					// 对编号内容进行格式化
					return text.replace(/(\d+)\.\s+(.*?)(?=\n\d+\.|\n$|$)/gs, 
						'<div class="content-section-title">文案 $1</div>$2<br>');
				} else {
					// 检查是否有多个段落
					const paragraphs = text.split('\n\n');
					if (paragraphs.length > 1) {
						// 为每个段落添加标题
						return paragraphs.map((p, index) => 
							`<div class="content-section-title">文案 ${index + 1}</div>${p}`
						).join('<br><br>');
					}
					
					// 没有明确分段，保持原样
					return text;
				}
			}
		},
		
		// 生成文案
		async generateWenan() {
			if (!this.prompt.trim()) {
				uni.showToast({
					title: '请输入内容',
					icon: 'none'
				});
				return;
			}
			
			if (this.loading) return;
			
			this.loading = true;
			this.taskId = null;
			
			try {
				// 调用 coze_request 云函数创建任务
				const result = await uniCloud.callFunction({
					name: 'coze_request',
					data: {
						token: 'pat_tu253KJPlSsaCx1YFunZ00wr8VmJUd3z7hujxXd79Ag7JIgNtHw0pC6G58i63F8S',
						workflowId: '7494836944268312617',
						parameters: {
							prompt: this.prompt
						}
					}
				});

				if (result.result && result.result.code === 0 && result.result.data && result.result.data.execute_id) {
					this.taskId = result.result.data.execute_id;
					this.startCheckingStatus();
				} else {
					throw new Error('创建任务失败: ' + (result.result?.msg || '未知错误'));
				}
			} catch (error) {
				uni.showToast({
					title: '生成文案失败，请重试',
					icon: 'none'
				});
				this.loading = false;
			}
		},
		
		// 开始检查任务状态
		async startCheckingStatus() {
			if (this.checkStatusInterval) {
				clearInterval(this.checkStatusInterval);
			}
			
			this.checkStatusInterval = setInterval(async () => {
				try {
					if (!this.taskId) {
						clearInterval(this.checkStatusInterval);
						this.loading = false;
						return;
					}
					
					const result = await uniCloud.callFunction({
						name: 'coze_worker',
						data: {
							token: 'pat_tu253KJPlSsaCx1YFunZ00wr8VmJUd3z7hujxXd79Ag7JIgNtHw0pC6G58i63F8S',
							workflowId: '7494836944268312617',
							execute_id: this.taskId
						}
					});
					
					if (result.result && result.result.code === 0) {
						const task = result.result.data;
						
						if (task.status === 'Success') {
							clearInterval(this.checkStatusInterval);
							this.loading = false;
							uni.hideLoading();
							
							// 获取API返回的内容
							let responseText = '';
							let videoUrl = '';
							
							// 首先尝试从output字段提取内容
							if (task.originalData && task.originalData.output) {
								const output = task.originalData.output;
								
								try {
									// 尝试解析JSON格式
									const jsonObj = JSON.parse(output);
									
									// 检查是否是视频URL
									if (jsonObj.Output && typeof jsonObj.Output === 'string' && 
										(jsonObj.Output.includes('.mp4') || 
										 jsonObj.Output.includes('.mov') || 
										 jsonObj.Output.includes('video') || 
										 jsonObj.Output.includes('digitalHuman'))) {
										
										// 清理URL字符串（移除引号和转义字符）
										videoUrl = jsonObj.Output.replace(/^"/, '').replace(/"$/, '')
														.replace(/\\"/g, '"')
														.replace(/\\\\/g, '\\');
										
										console.log('找到视频URL:', videoUrl);
									} 
									// 常规文本内容检查
									else if (jsonObj.Output) {
										responseText = typeof jsonObj.Output === 'string' ? jsonObj.Output : JSON.stringify(jsonObj.Output);
									} else if (jsonObj.output) {
										responseText = typeof jsonObj.output === 'string' ? jsonObj.output : JSON.stringify(jsonObj.output);
									} else {
										// 没有特定字段，使用整个JSON对象
										responseText = output;
									}
									
									// 检查responseText是否为视频URL
									if (!videoUrl && responseText && typeof responseText === 'string' && 
										(responseText.includes('.mp4') || 
										 responseText.includes('.mov') || 
										 responseText.includes('video') || 
										 responseText.includes('digitalHuman'))) {
											
										// 可能是URL，提取并清理
										videoUrl = responseText.replace(/^"/, '').replace(/"$/, '')
														.replace(/\\"/g, '"')
														.replace(/\\\\/g, '\\');
										// 清空responseText以避免重复显示
										responseText = '';
										
										console.log('从responseText中找到视频URL:', videoUrl);
									}
									
									// 如果responseText依然是JSON字符串，继续解析
									if (!videoUrl && responseText && responseText.startsWith('"') && responseText.endsWith('"')) {
										try {
											const innerContent = JSON.parse(responseText);
											
											// 检查解析后的内容是否为视频URL
											if (typeof innerContent === 'string' && 
												(innerContent.includes('.mp4') || 
												 innerContent.includes('.mov') || 
												 innerContent.includes('video') || 
												 innerContent.includes('digitalHuman'))) {
												
												videoUrl = innerContent;
												responseText = '';
												console.log('从嵌套JSON中找到视频URL:', videoUrl);
											} else {
												responseText = typeof innerContent === 'string' ? innerContent : JSON.stringify(innerContent);
											}
										} catch(e) {
											// 如果不是有效的JSON，则移除首尾引号
											responseText = responseText.substring(1, responseText.length - 1);
										}
									}
									
									// 清除所有格式为["output":" 或 {"Output":" 的前缀
									if (responseText) {
										responseText = responseText.replace(/^\s*\[?"[Oo]utput":\s*"/, '')
											.replace(/^\s*\{?"[Oo]utput":\s*"/, '')
											.replace(/^\s*"[Oo]utput":\s*"/, '');
										
										// 清除可能的尾部引号和括号
										responseText = responseText.replace(/"\s*\}?\s*\]?\s*$/, '')
											.replace(/"\s*\}?\s*$/, '');
										
										// 替换所有转义字符
										responseText = responseText.replace(/\\n/g, '\n')
														.replace(/\\"/g, '"')
														.replace(/\\\\/g, '\\');
									}
								} catch (e) {
									// 如果解析失败，尝试直接从原始内容中查找视频URL
									const urlMatch = output.match(/(https?:\/\/[^\s"]+\.(?:mp4|mov)[^\s"]*)/i);
									if (urlMatch && urlMatch[1]) {
										videoUrl = urlMatch[1];
										console.log('从原始内容中提取视频URL:', videoUrl);
									} else {
										// 如果没有找到视频URL，直接使用原始内容但尝试清除前缀
										responseText = output
											.replace(/^\s*\[?"[Oo]utput":\s*"/, '')
											.replace(/^\s*\{?"[Oo]utput":\s*"/, '')
											.replace(/^\s*"[Oo]utput":\s*"/, '')
											.replace(/"\s*\}?\s*\]?\s*$/, '')
											.replace(/"\s*\}?\s*$/, '')
											.replace(/\\n/g, '\n')
											.replace(/\\"/g, '"')
											.replace(/\\\\/g, '\\');
									}
								}
							}
							
							// 添加到历史消息
							this.completedResponses.unshift({
								prompt: this.prompt,
								text: responseText,
								videoUrl: videoUrl
							});
							
							// 清空输入框
							this.prompt = '';
							
							// 滚动到顶部以查看结果
							this.scrollToTop();
							
							uni.showToast({
								title: '生成成功',
								icon: 'success'
							});
						} else if (task.status === 'Failed') {
							clearInterval(this.checkStatusInterval);
							this.loading = false;
							uni.hideLoading();
							
							const errorMsg = task.error || '生成文案失败，请重试';
							
							uni.showModal({
								title: '生成失败',
								content: errorMsg,
								showCancel: false
							});
						} else if (task.status === 'Running') {
							uni.showLoading({
								title: '正在生成文案...',
								mask: true
							});
						}
					} else {
						throw new Error(result.result?.msg || '检查任务状态失败');
					}
				} catch (error) {
					clearInterval(this.checkStatusInterval);
					this.loading = false;
					uni.hideLoading();
					
					uni.showModal({
						title: '错误',
						content: '检查任务状态失败，请重试',
						showCancel: false
					});
				}
			}, 3000);
		},
		
		// 滚动到顶部
		scrollToTop() {
			this.scrollTop = 0;
		},
		
		// 复制视频链接
		copyVideoUrl(url) {
			if (!url) return;
			
			uni.setClipboardData({
				data: url,
				success: () => {
					uni.showToast({
						title: '视频链接已复制',
						icon: 'success'
					});
				},
				fail: (err) => {
					console.error('复制失败:', err);
					uni.showToast({
						title: '复制失败',
						icon: 'none'
					});
				}
			});
		},
		
		// 在浏览器中打开视频链接
		openInBrowser(url) {
			if (!url) return;
			
			// 使用系统浏览器打开链接
			// #ifdef H5
			window.open(url, '_blank');
			// #endif
			
			// #ifdef APP-PLUS
			plus.runtime.openURL(url);
			// #endif
			
			// #ifdef MP
			uni.setClipboardData({
				data: url,
				success: () => {
					uni.showModal({
						title: '提示',
						content: '链接已复制，请在浏览器中打开',
						showCancel: false
					});
				}
			});
			// #endif
		},
		
		scrollToBottom() {
			requestAnimationFrame(() => {
				const container = document.querySelector('.content-container');
				if (container) {
					container.scrollTop = container.scrollHeight;
				}
			});
		}
	},
	
	onLoad() {
		console.log('========= AI文案助手初始化 =========');
		document.body.style.overflow = 'hidden';
	},
	
	beforeDestroy() {
		document.body.style.overflow = '';
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
	
	/* 欢迎区域样式 */
	.welcome-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;
		width: 100%;
		min-height: 100vh;
		position: relative;
		
		.robot-message {
			position: absolute;
			top: 40rpx;
			left: 0;
			padding-left: 20rpx;
			width: 100%;
			box-sizing: border-box;
			z-index: 2;
			display: flex;
			align-items: flex-start;
			
			.robot-avatar {
				width: 100rpx;
				height: 100rpx;
				flex-shrink: 0;
				margin-right: 20rpx;
				
				image {
					width: 100%;
					height: 100%;
				}
			}
			
			.message-bubble {
				background-color: #fff;
				border-radius: 20rpx;
				padding: 20rpx;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
				position: relative;
				max-width: 90%;
				
				&:before {
					content: '';
					position: absolute;
					left: -16rpx;
					top: 20rpx;
					border-width: 8rpx;
					border-style: solid;
					border-color: transparent #fff transparent transparent;
				}
				
				.message-text {
					font-size: 28rpx;
					color: #000;
					line-height: 1.5;
				}
			}
		}
	}
	
	/* 内容区域样式 */
	.content-area {
		flex: 1;
		padding: 120rpx 30rpx calc(120rpx + constant(safe-area-inset-bottom));
		padding: 120rpx 30rpx calc(120rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		position: relative;
		height: calc(100vh - 240rpx);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		
		.message-list {
			.message-item {
				margin-bottom: 40rpx;
				
				.user-message {
					display: flex;
					justify-content: flex-end;
					margin-bottom: 20rpx;
					
					.message-bubble {
						max-width: 70%;
						background-color: #007AFF;
						border-radius: 20rpx;
						padding: 20rpx;
						box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.2);
						position: relative;
						
						.message-text {
							font-size: 28rpx;
							color: #fff;
							line-height: 1.5;
						}
					}
				}
				
				.robot-message {
					display: flex;
					align-items: flex-start;
					margin-bottom: 20rpx;
					
					.robot-avatar {
						width: 80rpx;
						height: 80rpx;
						flex-shrink: 0;
						margin-right: 20rpx;
						
						image {
							width: 100%;
							height: 100%;
						}
					}
					
					.message-bubble {
						background-color: rgba(31, 31, 40, 0.8);
						border-radius: 20rpx;
						padding: 20rpx;
						box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
						position: relative;
						max-width: 70%;
						border: 1px solid rgba(0, 242, 255, 0.2);
						
						&:before {
							content: '';
							position: absolute;
							left: -16rpx;
							top: 20rpx;
							border-width: 8rpx;
							border-style: solid;
							border-color: transparent rgba(31, 31, 40, 0.8) transparent transparent;
						}
						
						.message-text {
							font-size: 28rpx;
							color: rgba(255, 255, 255, 0.9);
							line-height: 1.5;
							
							.content-section-title {
								font-size: 32rpx;
								font-weight: bold;
								color: rgba(0, 242, 255, 0.9);
								margin: 20rpx 0 10rpx 0;
								padding-bottom: 8rpx;
								border-bottom: 1px dashed rgba(0, 242, 255, 0.4);
							}
						}
						
						.video-container {
							margin: 20rpx 0;
							width: 100%;
							
							.video-player {
								width: 100%;
								border-radius: 12rpx;
								overflow: hidden;
								margin-bottom: 15rpx;
								box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
							}
							
							.video-actions {
								display: flex;
								gap: 20rpx;
								margin-top: 10rpx;
								justify-content: space-between;
								
								.action-btn {
									flex: 1;
									height: 60rpx;
									line-height: 60rpx;
									text-align: center;
									background-color: rgba(0, 242, 255, 0.2);
									color: #fff;
									border-radius: 30rpx;
									font-size: 24rpx;
									padding: 0 10rpx;
									border: 1px solid rgba(0, 242, 255, 0.4);
								}
							}
						}
					}
				}
			}
		}
	}
	
	/* 输入区域样式 */
	.input-area {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx;
		display: flex;
		align-items: center;
		gap: 20rpx;
		background-color: rgba(31, 31, 40, 0.8);
		backdrop-filter: blur(10px);
		border-top: 1px solid rgba(0, 242, 255, 0.15);
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 999;
		padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

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
				width: 80rpx;
				height: 80rpx;
			}

			&:disabled {
				opacity: 0.6;
			}
		}
	}
	
	/* 加载动画样式 */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
		
		.loading-text {
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.7);
		}
	}
}
</style>



