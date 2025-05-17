<template>
	<view class="pay-success-page">
		<view class="success-icon">
			<text class="iconfont icon-check-circle"></text>
		</view>
		
		<view class="success-title">支付成功</view>
		
		<view class="success-info">
			<view class="info-item">
				<text class="label">购买方案</text>
				<text class="value">{{ planName }}</text>
			</view>
			<view class="info-item">
				<text class="label">支付金额</text>
				<text class="value">¥{{ price }}</text>
			</view>
			<view class="info-item">
				<text class="label">支付时间</text>
				<text class="value">{{ payTime }}</text>
			</view>
		</view>
		
		<view class="btn-group">
			<button class="btn primary-btn" @click="goToVipCenter">查看会员权益</button>
			<button class="btn outline-btn" @click="goToHome">返回首页</button>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	
	export default {
		data() {
			return {
				plan: '',
				price: 0,
				payTime: '',
				planName: '',
				days: '',
				orderNo: ''
			}
		},
		computed: {
			...mapState('user', ['userInfo', 'hasLogin'])
		},
		onLoad(options) {
			// 获取支付信息
			this.plan = options.plan || 'monthly';
			this.price = options.price || '39.9';
			this.days = options.days || '30';
			
			// 设置方案名称
			this.planName = options.name ? decodeURIComponent(options.name) : (this.plan === 'yearly' ? '年度会员' : '月度会员');
			
			// 生成订单号
			this.orderNo = 'VIP' + new Date().getTime();
			
			// 格式化当前时间为支付时间
			const now = new Date();
			this.payTime = this.formatDate(now);
			
			// 标记已支付状态
			this.recordPayment();
		},
		methods: {
			...mapMutations('user', ['SET_USER_INFO']),
			
			// 记录支付状态
			recordPayment() {
				console.log('记录支付状态');
				
				// 将支付状态保存到本地存储
				uni.setStorageSync('paidStatus', true);
				
				// 如果用户已登录，更新用户信息
				if (this.hasLogin && this.userInfo) {
					// 根据购买方案设置VIP到期时间（30天或365天）
					const days = this.plan === 'yearly' ? 365 : 30;
					const expireDate = new Date();
					expireDate.setDate(expireDate.getDate() + days);
					
					// 更新用户信息
					const updatedUserInfo = {
						...this.userInfo,
						isVip: true,
						vipExpireTime: expireDate.toISOString(),
						vipDays: days
					};
					
					// 更新状态和本地存储
					this.SET_USER_INFO(updatedUserInfo);
					uni.setStorageSync('userInfo', JSON.stringify(updatedUserInfo));
					
					// 将支付信息保存到云数据库
					this.savePaymentToCloud(expireDate);
					
					console.log('用户VIP状态已更新');
				} else {
					// 用户未登录，也保存一个匿名订单
					this.saveAnonymousOrder();
				}
			},
			
			// 将支付信息保存到云数据库
			savePaymentToCloud(expireDate) {
				// 显示加载提示
				uni.showLoading({
					title: '保存订单...',
					mask: true
				});
				
				// 准备订单数据
				const orderData = {
					userId: this.userInfo._id,
					nickname: this.userInfo.nickname || '用户',
					avatar: this.userInfo.avatar || '',
					orderNo: this.orderNo,
					productId: 'vip_membership_' + this.plan,
					productName: this.planName,
					productType: 'vip',
					planType: this.plan,
					amount: parseFloat(this.price),
					paidAt: new Date(),
					expireTime: expireDate.toISOString(),
					duration: parseInt(this.days),
					paymentMethod: 'wechat',
					deviceInfo: this.getDeviceInfo()
				};
				
				console.log('准备保存订单数据:', orderData);
				
				// 调用云函数保存订单数据
				uniCloud.callFunction({
					name: 'order',
					data: {
						action: 'createOrder',
						orderData
					}
				}).then(res => {
					console.log('保存订单结果:', res);
					if (res.result && res.result.code === 0) {
						console.log('订单数据已保存到云数据库');
						uni.showToast({
							title: '订单已记录',
							icon: 'success',
							duration: 2000
						});
					} else {
						console.error('保存订单失败:', res.result ? res.result.msg : '未知错误');
						this.saveOrderToLocal(orderData);
					}
				}).catch(err => {
					console.error('调用云函数失败:', err);
					this.saveOrderToLocal(orderData);
				}).finally(() => {
					uni.hideLoading();
				});
			},
			
			// 保存匿名订单
			saveAnonymousOrder() {
				const days = this.plan === 'yearly' ? 365 : 30;
				const expireDate = new Date();
				expireDate.setDate(expireDate.getDate() + days);
				
				// 准备匿名订单数据
				const orderData = {
					orderNo: this.orderNo,
					productId: 'vip_membership_' + this.plan,
					productName: this.planName,
					productType: 'vip',
					planType: this.plan,
					amount: parseFloat(this.price),
					paidAt: new Date(),
					expireTime: expireDate.toISOString(),
					duration: parseInt(this.days),
					paymentMethod: 'wechat',
					deviceInfo: this.getDeviceInfo()
				};
				
				// 本地保存订单，等用户登录后再同步
				this.saveOrderToLocal(orderData);
				
				console.log('匿名订单已保存到本地');
				uni.showToast({
					title: '支付成功',
					icon: 'success',
					duration: 2000
				});
			},
			
			// 保存订单到本地
			saveOrderToLocal(orderData) {
				// 获取已有的本地订单
				let localOrders = uni.getStorageSync('localOrders') || [];
				localOrders.push(orderData);
				
				// 保存到本地
				uni.setStorageSync('localOrders', localOrders);
				console.log('订单已保存到本地');
			},
			
			// 获取设备信息
			getDeviceInfo() {
				const info = {};
				
				// 获取系统信息
				try {
					const sysInfo = uni.getSystemInfoSync();
					info.platform = sysInfo.platform;
					info.system = sysInfo.system;
					info.model = sysInfo.model;
					info.brand = sysInfo.brand;
					
					// 获取网络状态
					const networkType = uni.getNetworkType();
					info.networkType = networkType.networkType;
				} catch (e) {
					console.error('获取设备信息失败:', e);
					info.error = '获取设备信息失败';
				}
				
				return info;
			},
			
			// 格式化日期
			formatDate(date) {
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				const seconds = date.getSeconds().toString().padStart(2, '0');
				
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			},
			
			// 跳转到会员中心
			goToVipCenter() {
				uni.redirectTo({
					url: '/pages/vip/index'
				});
			},
			
			// 返回首页
			goToHome() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			}
		}
	}
</script>

<style lang="scss">
	.pay-success-page {
		min-height: 100vh;
		background-color: #030a1c;
		padding: 60rpx 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.success-icon {
		width: 200rpx;
		height: 200rpx;
		background: rgba(5, 122, 255, 0.1);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 40rpx;
		border: 1px solid rgba(5, 122, 255, 0.3);
		box-shadow: 0 10rpx 30rpx rgba(5, 122, 255, 0.3);
		
		.iconfont {
			font-size: 120rpx;
			color: #4caf50;
			text-shadow: 0 0 20rpx rgba(76, 175, 80, 0.6);
		}
	}
	
	.success-title {
		font-size: 48rpx;
		font-weight: bold;
		color: #fff;
		margin-bottom: 50rpx;
		text-shadow: 0 0 15rpx rgba(5, 122, 255, 0.6);
	}
	
	.success-info {
		width: 100%;
		background: rgba(8, 20, 40, 0.5);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
		margin-bottom: 60rpx;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(5, 122, 255, 0.2);
		box-shadow: 0 15rpx 35rpx rgba(0, 0, 0, 0.3), 0 0 20rpx rgba(5, 122, 255, 0.1);
	}
	
	.info-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
		padding-bottom: 20rpx;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		
		&:last-child {
			margin-bottom: 0;
			padding-bottom: 0;
			border-bottom: none;
		}
	}
	
	.label {
		font-size: 30rpx;
		color: rgba(255, 255, 255, 0.7);
	}
	
	.value {
		font-size: 30rpx;
		color: #fff;
		font-weight: 500;
	}
	
	.btn-group {
		width: 100%;
		margin-top: 20rpx;
	}
	
	.btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		border-radius: 45rpx;
		font-size: 32rpx;
		margin-bottom: 30rpx;
		transition: all 0.3s;
	}
	
	.primary-btn {
		background: linear-gradient(135deg, #0550d0, #057aff);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 5rpx 15rpx rgba(5, 122, 255, 0.4), 0 0 30rpx rgba(5, 122, 255, 0.2);
		
		&:active {
			transform: scale(0.98);
			box-shadow: 0 2rpx 10rpx rgba(5, 122, 255, 0.3);
		}
	}
	
	.outline-btn {
		background: transparent;
		color: #fff;
		border: 1px solid rgba(5, 122, 255, 0.4);
		
		&:active {
			background: rgba(5, 122, 255, 0.1);
		}
	}
</style> 