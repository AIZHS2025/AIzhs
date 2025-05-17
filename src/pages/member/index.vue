<template>
	<view class="member-container">
		<view class="header">
			<view class="user-info">
				<image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'"></image>
				<view class="user-detail">
					<text class="nickname">{{ userInfo.nickname || '游客' }}</text>
					<view class="vip-badge" v-if="isVIP">
						<text class="vip-text">VIP会员</text>
						<text class="vip-expire" v-if="isPermanentVIP">永久有效</text>
						<text class="vip-expire" v-else>{{ vipExpireText }}</text>
					</view>
					<view class="non-vip" v-else>
						<text>普通用户</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="card privileges-card">
			<text class="card-title">会员特权</text>
			<view class="privileges-list">
				<view class="privilege-item">
					<image class="privilege-icon" src="/static/images/unlimited.png"></image>
					<view class="privilege-content">
						<text class="privilege-title">无限对话</text>
						<text class="privilege-desc">无限制使用AI对话功能</text>
					</view>
					<text class="privilege-status" :class="{ active: isVIP }">{{ isVIP ? '已开通' : '未开通' }}</text>
				</view>
				
				<view class="privilege-item">
					<image class="privilege-icon" src="/static/images/advanced.png"></image>
					<view class="privilege-content">
						<text class="privilege-title">高级模型</text>
						<text class="privilege-desc">使用最新的AI大模型</text>
					</view>
					<text class="privilege-status" :class="{ active: isVIP }">{{ isVIP ? '已开通' : '未开通' }}</text>
				</view>
				
				<view class="privilege-item">
					<image class="privilege-icon" src="/static/images/priority.png"></image>
					<view class="privilege-content">
						<text class="privilege-title">优先响应</text>
						<text class="privilege-desc">对话请求优先处理</text>
					</view>
					<text class="privilege-status" :class="{ active: isVIP }">{{ isVIP ? '已开通' : '未开通' }}</text>
				</view>
				
				<view class="privilege-item">
					<image class="privilege-icon" src="/static/images/community.png"></image>
					<view class="privilege-content">
						<text class="privilege-title">VIP社区</text>
						<text class="privilege-desc">加入专属VIP交流群</text>
					</view>
					<text class="privilege-status" :class="{ active: isVIP }">{{ isVIP ? '已开通' : '未开通' }}</text>
				</view>
			</view>
		</view>
		
		<view class="card usage-card">
			<text class="card-title">使用统计</text>
			<view class="usage-stats">
				<view class="stat-item">
					<text class="stat-value">{{ userInfo.free_quota || 0 }}</text>
					<text class="stat-label">剩余免费额度</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ userInfo.credit || 0 }}</text>
					<text class="stat-label">积分</text>
				</view>
			</view>
		</view>
		
		<view class="vip-card" v-if="!isVIP">
			<view class="vip-info">
				<view class="vip-title">开通VIP会员</view>
				<view class="vip-desc">享受更多特权，提升AI体验</view>
				<view class="vip-price">
					<text class="current-price">¥588</text>
					<text class="original-price">¥1288</text>
				</view>
			</view>
			<view class="vip-action">
				<button class="vip-button" @tap="goToPayment">立即开通</button>
			</view>
		</view>
		
		<view class="cta-section" v-else-if="!isPermanentVIP">
			<view class="vip-price">
				<text class="price-label">升级永久VIP会员</text>
				<view class="price-display">
					<text class="current-price">¥588</text>
					<text class="original-price">¥1288</text>
				</view>
			</view>
			<text class="cta-text">您已是VIP会员，可升级为永久VIP</text>
			<button class="cta-button outlined" @tap="gotoPayment">升级永久VIP</button>
		</view>
		
		<view class="cta-section vip-section" v-else>
			<view class="permanent-vip-badge">
				<image class="crown-icon" src="/static/images/crown.png"></image>
				<text>您已是永久VIP会员</text>
			</view>
			<text class="cta-text">已享有AI智汇社全部特权</text>
		</view>
		
		<view class="contact-section">
			<text class="contact-title">遇到问题？</text>
			<text class="contact-text">联系客服微信：AIXHS_Service</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {},
				isVIP: false,
				isPermanentVIP: false,
				vipExpireDate: null
			}
		},
		computed: {
			// VIP到期文字
			vipExpireText() {
				if (this.isPermanentVIP) return '永久有效';
				if (!this.vipExpireDate) return '';
				
				const now = new Date();
				const expire = new Date(this.vipExpireDate);
				
				// 计算相差天数
				const diffTime = expire.getTime() - now.getTime();
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				
				if (diffDays <= 0) {
					return '已过期';
				} else if (diffDays <= 7) {
					return `剩余${diffDays}天`;
				} else {
					// 格式化日期为 YYYY-MM-DD
					const year = expire.getFullYear();
					const month = String(expire.getMonth() + 1).padStart(2, '0');
					const day = String(expire.getDate()).padStart(2, '0');
					return `${year}-${month}-${day}到期`;
				}
			}
		},
		onShow() {
			// 每次显示页面时重新获取用户信息
			this.getUserInfo();
		},
		methods: {
			// 获取用户信息
			getUserInfo() {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo && userInfo.openid) {
					this.userInfo = userInfo;
					
					// 调用云函数检查VIP状态
					this.checkVIPStatus(userInfo.openid);
				} else {
					// 如果没有用户信息，跳转到登录页
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/login/index'
						});
					}, 1500);
				}
			},
			
			// 检查VIP状态
			checkVIPStatus(openid) {
				if (!openid) {
					console.error('检查VIP状态失败: openid不能为空');
					uni.showToast({
						title: '用户信息获取失败',
						icon: 'none'
					});
					return;
				}
				
				uni.showLoading({
					title: '加载中...'
				});
				
				uniCloud.callFunction({
					name: 'payment',
					data: {
						action: 'checkVIPStatus',
						params: {
							openid: openid
						}
					},
					success: (res) => {
						uni.hideLoading();
						
						if (res.result.code === 0) {
							const data = res.result.data;
							this.isVIP = data.isVIP;
							this.isPermanentVIP = data.isPermanentVIP || false;
							this.vipExpireDate = data.vipExpireTime;
							
							// 更新本地存储的用户VIP状态
							const userInfo = uni.getStorageSync('userInfo');
							userInfo.is_VIP = this.isVIP ? 1 : 0;
							userInfo.is_permanent_VIP = this.isPermanentVIP;
							userInfo.vip_expire_time = data.vipExpireTime;
							uni.setStorageSync('userInfo', userInfo);
						} else {
							uni.showToast({
								title: '获取VIP状态失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						uni.hideLoading();
						uni.showToast({
							title: '获取VIP状态失败',
							icon: 'none'
						});
						console.error('获取VIP状态失败:', err);
					}
				});
			},
			
			// 跳转到支付页面
			goToPayment() {
				uni.navigateTo({
					url: '/pages/payment/index'
				});
			},
			
			// 刷新会员状态
			refreshVipStatus() {
				this.getUserInfo();
			}
		}
	}
</script>

<style lang="scss">
.member-container {
	padding: 30rpx;
	
	.header {
		background: linear-gradient(135deg, #0056D6, #3498db);
		border-radius: 16rpx;
		padding: 40rpx 30rpx;
		margin-bottom: 30rpx;
		
		.user-info {
			display: flex;
			align-items: center;
			
			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 60rpx;
				background-color: #fff;
				margin-right: 20rpx;
			}
			
			.user-detail {
				flex: 1;
				
				.nickname {
					font-size: 36rpx;
					font-weight: bold;
					color: #fff;
					margin-bottom: 10rpx;
					display: block;
				}
				
				.vip-badge {
					display: inline-flex;
					align-items: center;
					
					.vip-text {
						background: #FFD700;
						color: #333;
						font-size: 24rpx;
						font-weight: bold;
						padding: 4rpx 16rpx;
						border-radius: 20rpx;
						margin-right: 10rpx;
					}
					
					.vip-expire {
						font-size: 24rpx;
						color: #fff;
					}
				}
				
				.non-vip {
					font-size: 26rpx;
					color: rgba(255, 255, 255, 0.8);
				}
			}
		}
	}
	
	.card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		
		.card-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 30rpx;
			display: block;
		}
	}
	
	.privileges-card {
		.privileges-list {
			display: flex;
			flex-direction: column;
			gap: 30rpx;
			
			.privilege-item {
				display: flex;
				align-items: center;
				
				.privilege-icon {
					width: 80rpx;
					height: 80rpx;
					margin-right: 20rpx;
				}
				
				.privilege-content {
					flex: 1;
					
					.privilege-title {
						font-size: 28rpx;
						font-weight: bold;
						color: #333;
						display: block;
					}
					
					.privilege-desc {
						font-size: 24rpx;
						color: #666;
					}
				}
				
				.privilege-status {
					font-size: 24rpx;
					color: #999;
					
					&.active {
						color: #0056D6;
						font-weight: bold;
					}
				}
			}
		}
	}
	
	.usage-card {
		.usage-stats {
			display: flex;
			justify-content: space-around;
			
			.stat-item {
				text-align: center;
				
				.stat-value {
					font-size: 48rpx;
					font-weight: bold;
					color: #0056D6;
					display: block;
					margin-bottom: 10rpx;
				}
				
				.stat-label {
					font-size: 26rpx;
					color: #666;
				}
			}
		}
	}
	
	.vip-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		
		.vip-info {
			margin-bottom: 20rpx;
			
			.vip-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				margin-bottom: 10rpx;
				display: block;
			}
			
			.vip-desc {
				font-size: 26rpx;
				color: #666;
			}
			
			.vip-price {
				display: flex;
				align-items: center;
				justify-content: center;
				
				.current-price {
					font-size: 40rpx;
					font-weight: bold;
					color: #FF6B00;
					margin-right: 16rpx;
				}
				
				.original-price {
					font-size: 28rpx;
					color: #999;
					text-decoration: line-through;
				}
			}
		}
		
		.vip-action {
			text-align: center;
			
			.vip-button {
				background: #0056D6;
				color: #fff;
				height: 80rpx;
				line-height: 80rpx;
				font-size: 30rpx;
				font-weight: bold;
				border-radius: 40rpx;
				width: 60%;
			}
		}
	}
	
	.cta-section {
		background: #f8f8f8;
		border-radius: 16rpx;
		padding: 40rpx 30rpx;
		text-align: center;
		margin-bottom: 30rpx;
		
		&.vip-section {
			background: linear-gradient(135deg, #FFD700, #FFC107);
		}
		
		.vip-price {
			margin-bottom: 20rpx;
			
			.price-label {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 10rpx;
				display: block;
			}
			
			.price-display {
				display: flex;
				align-items: center;
				justify-content: center;
				
				.current-price {
					font-size: 40rpx;
					font-weight: bold;
					color: #FF6B00;
					margin-right: 16rpx;
				}
				
				.original-price {
					font-size: 28rpx;
					color: #999;
					text-decoration: line-through;
				}
			}
		}
		
		.permanent-vip-badge {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 20rpx;
			
			.crown-icon {
				width: 40rpx;
				height: 40rpx;
				margin-right: 10rpx;
			}
			
			text {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
		}
		
		.cta-text {
			font-size: 28rpx;
			color: #333;
			margin-bottom: 20rpx;
			display: block;
		}
		
		.cta-button {
			background: #0056D6;
			color: #fff;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 30rpx;
			font-weight: bold;
			border-radius: 40rpx;
			width: 60%;
			
			&.outlined {
				background: transparent;
				color: #0056D6;
				border: 2rpx solid #0056D6;
			}
		}
	}
	
	.contact-section {
		text-align: center;
		padding: 20rpx;
		
		.contact-title {
			font-size: 28rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 10rpx;
			display: block;
		}
		
		.contact-text {
			font-size: 26rpx;
			color: #666;
		}
	}
}
</style> 