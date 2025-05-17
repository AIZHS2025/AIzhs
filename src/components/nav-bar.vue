<template>
	<view class="navbar">
		<view class="navbar__content">
			<view class="logo">
				<image class="logo__icon" src="/static/logo.png" mode="aspectFit" />
				<text class="logo__text">AI智汇社</text>
			</view>
			<view class="nav-actions">
				<view class="search-btn" @tap="handleSearch">
					<text class="icon">🔍</text>
				</view>
				<view class="message-btn" @tap="handleMessage">
					<text class="icon">💬</text>
					<view class="badge" v-if="unreadCount">{{unreadCount}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			unreadCount: 2
		}
	},
	methods: {
		handleSearch() {
			uni.vibrateShort()
			uni.showToast({
				title: '搜索功能开发中',
				icon: 'none'
			})
		},
		handleMessage() {
			uni.vibrateShort()
			uni.showToast({
				title: '消息功能开发中',
				icon: 'none'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.navbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 100;
	backdrop-filter: blur(40px);
	background: linear-gradient(180deg, 
		rgba(10, 10, 15, 0.95), 
		rgba(15, 15, 20, 0.85)
	);
	border-bottom: 1px solid rgba(0, 242, 255, 0.15);
	box-shadow: 
		0 4rpx 30rpx rgba(0, 0, 0, 0.4),
		inset 0 0 60rpx rgba(0, 242, 255, 0.02);
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, 
			transparent,
			rgba(0, 242, 255, 0.6),
			rgba(139, 92, 246, 0.6),
			transparent
		);
		opacity: 0.6;
		filter: blur(1px);
		animation: gradientFlow 6s linear infinite;
	}
	
	&__content {
		padding: 24rpx 32rpx;
		padding-top: calc(24rpx + env(safe-area-inset-top));
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
}

.logo {
	display: flex;
	align-items: center;
	gap: 20rpx;
	position: relative;
	
	&__icon {
		width: 56rpx;
		height: 56rpx;
		border-radius: 16rpx;
		box-shadow: 
			0 0 40rpx rgba(0, 242, 255, 0.4),
			inset 0 0 20rpx rgba(0, 242, 255, 0.3);
		border: 1px solid rgba(0, 242, 255, 0.3);
		transform: translateZ(0);
		backface-visibility: hidden;
		perspective: 1000;
		animation: iconFloat 6s ease-in-out infinite;
	}
	
	&__text {
		font-size: 38rpx;
		font-weight: 800;
		letter-spacing: 1px;
		background: linear-gradient(135deg, #00F2FF, #8B5CF6, #00F2FF);
		background-size: 200% 100%;
		animation: gradientFlow 6s linear infinite;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		text-shadow: 0 0 30rpx rgba(0, 242, 255, 0.5);
	}
	
	&::after {
		content: '';
		position: absolute;
		bottom: -8rpx;
		left: 0;
		width: 70%;
		height: 2px;
		background: linear-gradient(90deg, rgba(0, 242, 255, 0.8), transparent);
		filter: blur(1px);
		opacity: 0.8;
	}
}

.nav-actions {
	display: flex;
	align-items: center;
	gap: 28rpx;
}

.search-btn, .message-btn {
	width: 80rpx;
	height: 80rpx;
	background: rgba(0, 242, 255, 0.05);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid rgba(0, 242, 255, 0.15);
	overflow: hidden;
	backdrop-filter: blur(30px);
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(0, 242, 255, 0.4), transparent);
		filter: blur(1px);
	}
	
	&::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at center, rgba(0, 242, 255, 0.15) 0%, transparent 70%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	&:active {
		transform: scale(0.95) translateY(2rpx);
		background: rgba(0, 242, 255, 0.08);
		box-shadow: 
			0 0 40rpx rgba(0, 242, 255, 0.2),
			inset 0 0 30rpx rgba(0, 242, 255, 0.1);
		
		&::after {
			opacity: 1;
		}
	}
	
	.icon {
		font-size: 40rpx;
		filter: drop-shadow(0 0 15rpx rgba(0, 242, 255, 0.5));
		transform: translateZ(0);
	}
}

.badge {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	min-width: 36rpx;
	height: 36rpx;
	padding: 0 10rpx;
	background: linear-gradient(135deg, #00F2FF, #8B5CF6);
	border-radius: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22rpx;
	color: #ffffff;
	font-weight: bold;
	box-shadow: 
		0 0 30rpx rgba(0, 242, 255, 0.5),
		inset 0 0 8rpx rgba(255, 255, 255, 0.5);
	animation: badgePulse 2s infinite;
	border: 1px solid rgba(255, 255, 255, 0.3);
	transform: translateZ(0);
	text-shadow: 0 0 10rpx rgba(0, 242, 255, 0.5);
}

@keyframes badgePulse {
	0% {
		box-shadow: 0 0 20rpx rgba(0, 242, 255, 0.4);
	}
	50% {
		box-shadow: 0 0 40rpx rgba(0, 242, 255, 0.6);
	}
	100% {
		box-shadow: 0 0 20rpx rgba(0, 242, 255, 0.4);
	}
}

@keyframes iconFloat {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-8rpx);
	}
}

@keyframes gradientFlow {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}
</style> 