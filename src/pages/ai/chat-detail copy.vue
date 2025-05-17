/**
* @description: AI文案创作页面，三级页面，接入智能体
* @author: tgg
* @date: 2025-04-15 17:16:32
* 
*/


<template>
	<view class="chat-container">
		<!-- 聊天内容区域 -->
		<scroll-view class="chat-messages" scroll-y="true" :style="{height: 'calc(100vh - 160rpx)'}" @scroll="onScroll">
			<!-- 欢迎消息 -->
			<view class="message-bubble bot">
				<view class="avatar">  <!-- 聊天框左边图标 -->
					<image src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/second/jiqiren-big.png" mode="aspectFit"></image>
				</view>
				<view class="message-content background-image">
					<view class="message-text1">Hi, 我是您的智能助手小智</view>
					<view class="message-text2">快来跟我聊天吧！</view>
				</view>
			</view>
			
			<!-- 动态消息列表 -->
			<view v-for="(msg, index) in messages" :key="index" class="message-bubble" :class="msg.type">
				<view v-if="msg.type === 'bot'" class="avatar">
					<image src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/second/hello.png" mode="aspectFit"></image>
				</view>
				<view class="message-content background-image">
					<view class="message-text">{{msg.content}}</view>
				</view>
				<view v-if="msg.type === 'user'" class="avatar">
					<image src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/second/user-avatar.jpg" mode="aspectFit"></image>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部输入区域 -->
		<view class="input-area">
			<view class="input-box">
				<input 
					type="text" 
					v-model="userInput" 
					placeholder="请输入产品或服务需求"
					confirm-type="send"
					@confirm="sendMessage"
					focus
					:cursor-spacing="20"
					:adjust-position="true"
					:confirm-hold="false"
				/>
			</view>
			<view class="send-btn" @click="sendMessage" :class="{ 'active': userInput.trim().length > 0 }">
				<text class="send-icon">→</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInput: '',
			messages: [],
			educationOptions: [
				'家长痛点库',
				'K12私域转化',
				'素质教育引流',
				'知识IP孵化',
				'学科资料构子',
				'课程拼团话术',
				'引流课设计',
				'教育直播脚本',
				'教育黑化库'
			],
			selectedOption: '',
			tokenBalance: 0,
			freeUsage: 4
		}
	},
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},
		
		// 加载更多历史消息
		loadMoreMessages() {
			// 实现加载更多历史消息的逻辑
		},
		
		// 发送消息
		sendMessage() {
			if (!this.userInput.trim()) return;
			
			const message = this.userInput.trim();
			
			// 添加用户消息
			this.messages.push({
				type: 'user',
				content: message
			});
			
			// 清空输入框
			this.userInput = '';
			
			// 立即滚动到底部显示用户消息
			this.$nextTick(() => {
				this.scrollToBottom();
			});
			
			// 模拟AI思考状态
			setTimeout(() => {
				this.messages.push({
					type: 'bot',
					content: '我正在思考您的问题...'
				});
				
				// 滚动到底部显示思考状态
				this.scrollToBottom();
				
				// 模拟延迟后的回复
				setTimeout(() => {
					// 将"思考中"的消息替换为实际回复
					this.messages.pop();
					this.messages.push({
						type: 'bot',
						content: this.generateResponse(message)
					});
					
					// 滚动到底部显示最新消息
					this.scrollToBottom();
				}, 1500);
			}, 300);
		},
		
		// 滚动到底部
		scrollToBottom() {
			setTimeout(() => {
				const query = uni.createSelectorQuery().in(this);
				query.select('.chat-messages').boundingClientRect(data => {
					if (data) {
						// 使用内置scrollTop属性滚动到底部
						const scrollView = uni.createSelectorQuery().in(this).select('.chat-messages');
						scrollView.node(res => {
							if (res && res.node) {
								res.node.scrollTop = res.node.scrollHeight;
							}
						}).exec();
					}
				}).exec();
			}, 100);
		},
		
		// 生成简单回复
		generateResponse(message) {
			const responses = [
				'我理解您的问题了。让我来为您解答...',
				'这是一个很好的问题！我的建议是...',
				'根据您的需求，我推荐以下方案...',
				'我已经分析了您的问题，以下是我的想法...',
				'感谢您的提问，这是我的回答...'
			];
			
			return responses[Math.floor(Math.random() * responses.length)] + ' 关于"' + message + '"的详细内容将在实际接入智能体后生成。';
		},
		
		// 处理滚动事件
		onScroll(e) {
			// 滚动事件处理
		},
		
		// 选择教育选项
		selectOption(option) {
			this.selectedOption = option;
			this.userInput = option;
		},
		
		// 购买token，题哦转
		buyTokens() {
			uni.navigateTo({
				url: url
			});
		}
	},
	onLoad(options) {
		// 获取从选择页面传来的行业
		const selectedIndustry = uni.getStorageSync('selectedIndustry');
		if (selectedIndustry) {
			console.log('选择的行业:', selectedIndustry);
			// 这里可以根据行业类型调整页面内容
		}
		
		// 获取用户token余额
		// 实际应用中应该从服务器获取
		this.tokenBalance = uni.getStorageSync('tokenBalance') || 0;
		
		// 滚动到底部
		this.$nextTick(() => {
			this.scrollToBottom();
		});
	}
}
</script>

<style lang="scss">
	
.background-image {
	background-image: url('https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/second/jiqiren.png');
	background-size: 200rpx;
	background-position: right -50px bottom -40px;
	background-repeat: no-repeat;
}
	
	
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #ade0f0;
	padding-bottom: 140rpx; /* 添加底部padding以避免内容被输入区域遮挡 */
}

/* 聊天消息区域 */
.chat-messages {
	flex: 1;
	padding: 20rpx;
	overflow-y: scroll;

	height: calc(100vh - 160rpx); /* 减去输入区和可能的安全区域高度 */
	-webkit-overflow-scrolling: touch; /* 增加iOS上的滚动惯性 */
}

/* 消息气泡 */
.message-bubble {
	display: flex;
	margin-bottom: 30rpx;
	max-width: 80%;
	
	&.bot {
		align-self: flex-start;
		
		.message-content {
			background-image: url('https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/home/second/jiqiren.png');
			background-size: 200rpx;
			// background-position: bottom right;
			background-position: right -50px bottom -40px; /* 修改这里 */
			background-repeat: no-repeat;
			background-color: rgba(252, 255, 242, 0.9);
			min-width: 500rpx;
		}
	}
	
	&.user {
		align-self: flex-end;
		justify-content: flex-end;
		margin-left: auto;
	}
	
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 15rpx;
		
		image {
			width: 120%;
			height: 120%;
		}
	}
	
	&.user .avatar {
		margin-right: 0;
		margin-left: 15rpx;
	}
	
	.message-content {
		background-color: #fcfdf7;
		background-image: linear-gradient(135deg, #e2e2e2, #f5f5f5);
		background-size: cover;
		background-position: center;
		padding: 20rpx;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
		

		.message-text1, .message-text2, .message-text {
			position: relative;
			z-index: 2;
			text-shadow: 0 0 3px rgba(255, 255, 255, 0.7);
		}

		.message-text1 {
			font-size: 28rpx;
			line-height: 1.5;
			color: #333;
		}
		.message-text2 {
			font-size: 32rpx;
			line-height: 1.5;
			color: #333;
			font-weight: bold;
		}
		
		.message-text {
			font-size: 28rpx;
			line-height: 1.5;
			color: #333;
		}
	}
	
	&.user .message-content {
		background-color: #b3e5fc;
		background-image: linear-gradient(135deg, #b3e5fc, #d7f0fd);
	}
}

/* 底部输入区域 */
.input-area {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background-color: #fff;
	border-top: 1rpx solid #eee;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 10;
	
	.input-box {
		flex: 1;
		background-color: #f5f7fa;
		border-radius: 40rpx;
		padding: 15rpx 25rpx;
		margin-right: 20rpx;
		
		input {
			width: 100%;
			height: 60rpx;
			font-size: 28rpx;
		}
	}
	
	.send-btn {
		width: 80rpx;
		height: 80rpx;
		background-color: #b3e5fc;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		
		&.active {
			background-color: #4baae0;
			transform: scale(1.05);
		}
		
		.send-icon {
			font-size: 40rpx;
			color: #fff;
		}
	}
}
</style>