<template>
	<view class="vip-page">
		<view class="header">
			<image class="bg-image" src="/static/vip-bg.png" mode="aspectFill"></image>
			<view class="content">
				<view class="title">AI智汇社 VIP会员</view>
				<view class="subtitle">一次性支付588元，终身使用</view>
				<view class="price-box">
					<text class="current-price">¥588</text>
				</view>
			</view>
		</view>
		
		<view class="features">
			<view class="section-title">会员特权</view>
			<view class="feature-list">
				<view class="feature-item" v-for="feature in features" :key="feature.id">
					<text class="feature-icon">{{feature.icon}}</text>
					<view class="feature-info">
						<text class="feature-title">{{feature.title}}</text>
						<text class="feature-desc">{{feature.desc}}</text>
					</view>
					<text class="feature-tag">VIP</text>
				</view>
			</view>
		</view>
		
		<view class="buy-section">
			<view class="price-info">
				<view class="price">
					<text class="symbol">¥</text>
					<text class="number">588</text>
				</view>
			</view>
			<button class="buy-btn" @tap="openPopup">一键开通会员</button>
		</view>
		<ConfirmPurchasePopUp
			:visible="showPopup"
			@updateVisible="handlePayment"
		/>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import ConfirmPurchasePopUp from '@/components/ConfirmPurchasePopUp/index.vue'

export default {
	data(){
		return {
			showPopup: false
		}
	},
	components: {
		ConfirmPurchasePopUp
	},
	computed: {
		...mapState('user', ['vipFeatures'])
	},
	methods: {
		...mapActions('user', ['purchaseVip']),
		openPopup(){
			this.showPopup = true
		},
		handlePayment(){
			this.showPopup = false
		}
	}
}
</script>

<style lang="scss" scoped>
.vip-page {
	min-height: 100vh;
	background: linear-gradient(135deg, #0F1623, #1F2937);
	padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.header {
	position: relative;
	height: 400rpx;
	overflow: hidden;
	
	.bg-image {
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
	
	.content {
		position: relative;
		z-index: 2;
		padding: 60rpx 40rpx;
		color: #fff;
		
		.title {
			font-size: 48rpx;
			font-weight: bold;
			margin-bottom: 16rpx;
			text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
		}
		
		.subtitle {
			font-size: 28rpx;
			opacity: 0.9;
			margin-bottom: 40rpx;
		}
		
		.price-box {
			display: flex;
			align-items: baseline;
			gap: 20rpx;
			
			.current-price {
				font-size: 64rpx;
				font-weight: bold;
				color: #FFD700;
				text-shadow: 0 2rpx 10rpx rgba(255, 215, 0, 0.3);
			}
		}
	}
}

.features {
	padding: 40rpx;
	
	.section-title {
		font-size: 32rpx;
		color: #fff;
		margin-bottom: 32rpx;
		font-weight: bold;
	}
	
	.feature-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	.feature-item {
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding: 24rpx;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 16rpx;
		border: 1px solid rgba(255, 255, 255, 0.1);
		
		.feature-icon {
			font-size: 40rpx;
			width: 80rpx;
			height: 80rpx;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		
		.feature-info {
			flex: 1;
			
			.feature-title {
				font-size: 28rpx;
				color: #fff;
				margin-bottom: 8rpx;
				display: block;
			}
			
			.feature-desc {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.6);
				display: block;
			}
		}
		
		.feature-tag {
			padding: 4rpx 16rpx;
			background: linear-gradient(135deg, #FFD700, #FFA500);
			border-radius: 20rpx;
			font-size: 20rpx;
			color: #1F2937;
			font-weight: bold;
		}
	}
}

.buy-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 24rpx 40rpx;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	background: rgba(15, 23, 42, 0.95);
	backdrop-filter: blur(20px);
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	align-items: center;
	justify-content: space-between;
	
	.price-info {
		.price {
			display: flex;
			align-items: baseline;
			
			.symbol {
				font-size: 32rpx;
				color: #fff;
				margin-right: 4rpx;
			}
			
			.number {
				font-size: 48rpx;
				font-weight: bold;
				color: #fff;
			}
		}
	}
	
	.buy-btn {
		padding: 20rpx 48rpx;
		background: linear-gradient(135deg, #FFD700, #FFA500);
		border-radius: 40rpx;
		font-size: 32rpx;
		color: #1F2937;
		font-weight: bold;
		border: none;
		
		&:active {
			transform: scale(0.98);
			background: linear-gradient(135deg, #FFC700, #FF9500);
		}
	}
}
</style> 