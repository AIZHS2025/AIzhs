<template>
	<view class="container">
		<view class="logo">
			<image src="/static/logo.png" mode="aspectFit" class="logo-image"></image>
		</view>
		<view class="title">AI智汇社</view>
		<view class="subtitle">登录/注册您的账号</view>
		
		<view class="form">
			<view class="input-group">
				<text class="input-icon">👤</text>
				<input type="text" v-model="username" placeholder="请输入用户名" class="input" />
			</view>
			
			<view class="input-group">
				<text class="input-icon">🔒</text>
				<input type="password" v-model="password" placeholder="请输入密码" class="input" password />
			</view>
			
			<button class="btn login-btn" @tap="handleLogin">登录/注册</button>
		</view>
		
		<view class="tips">
			<text>注册即代表同意《用户服务协议》</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			username: '',
			password: '',
			loading: false
		}
	},
	onLoad() {
		// 检查是否已登录
		this.checkLoginStatus();
	},
	methods: {
		// 检查登录状态
		checkLoginStatus() {
			try {
				const token = uni.getStorageSync('token');
				const userInfo = uni.getStorageSync('userInfo');
				
				if (token && userInfo) {
					// 已登录，跳转到首页
					uni.switchTab({
						url: '/pages/index/index'
					});
				}
			} catch (e) {
				console.error('检查登录状态失败:', e);
			}
		},
		
		// 处理登录
		handleLogin() {
			if (this.loading) return;
			
			if (!this.username || !this.password) {
				uni.showToast({
					title: '请输入用户名和密码',
					icon: 'none'
				});
				return;
			}
			
			this.loading = true;
			uni.showLoading({
				title: '登录中...'
			});
			
			// 调用云函数登录
			this.callCloudLogin();
		},
		
		// 调用云函数登录
		async callCloudLogin() {
			try {
				const result = await uniCloud.callFunction({
					name: 'login',
					data: {
						action: 'login',
						params: {
							username: this.username,
							password: this.password
						}
					}
				});
				
				this.handleLoginResult(result);
			} catch (error) {
				console.error('登录失败:', error);
				this.loading = false;
				uni.hideLoading();
				
				uni.showToast({
					title: '登录失败，请检查网络',
					icon: 'none'
				});
			}
		},
		
		// 处理登录结果
		handleLoginResult(result) {
			this.loading = false;
			uni.hideLoading();
			
			if (result && result.result && result.result.code === 0) {
				const { token, userInfo } = result.result.data;
				
				// 确保用户信息包含openid
				if (!userInfo.openid) {
					console.warn('登录成功但openid不存在，尝试获取或生成openid');
					
					// 如果没有openid，尝试从小程序获取
					// #ifdef MP-WEIXIN
					this.getWechatOpenid(userInfo, token);
					// #endif
					
					// 如果不是小程序环境，生成一个随机的openid
					// #ifndef MP-WEIXIN
					this.generateRandomOpenid(userInfo, token);
					// #endif
					
					return;
				}
				
				console.log('登录成功，用户信息:', JSON.stringify(userInfo));
				
				// 保存用户信息
				uni.setStorageSync('token', token);
				uni.setStorageSync('userInfo', userInfo);
				
				// 更新全局状态
				const app = getApp();
				if (app.globalData) {
					app.globalData.userInfo = userInfo;
				}
				
				// 提示登录成功
				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});
				
				// 跳转到首页
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					});
				}, 1500);
			} else {
				uni.showToast({
					title: result?.result?.msg || '登录失败，请重试',
					icon: 'none'
				});
			}
		},
		
		// 获取微信小程序openid
		getWechatOpenid(userInfo, token) {
			// #ifdef MP-WEIXIN
			uni.login({
				provider: 'weixin',
				success: (loginRes) => {
					if (loginRes.code) {
						// 调用云函数获取openid
						uniCloud.callFunction({
							name: 'login',
							data: {
								action: 'getOpenid',
								params: {
									code: loginRes.code,
									userId: userInfo._id || userInfo.userId
								}
							},
							success: (res) => {
								if (res.result && res.result.code === 0) {
									// 更新用户信息并保存
									userInfo.openid = res.result.data.openid;
									
									// 保存用户信息
									uni.setStorageSync('token', token);
 									uni.setStorageSync('userInfo', userInfo);
									
 									console.log('成功获取并保存openid:', userInfo.openid);
									
 									// 跳转到首页
 									uni.switchTab({
 										url: '/pages/index/index'
 									});
 								} else {
 									console.error('获取openid失败:', res);
									this.handleLoginFailure('获取用户信息失败');
								}
							},
 							fail: (err) => {
 								console.error('获取openid失败:', err);
 								this.handleLoginFailure('获取用户信息失败');
 							}
 						});
 					} else {
 						console.error('登录wx.login失败:', loginRes);
 						this.handleLoginFailure('微信登录失败');
 					}
 				},
 				fail: (err) => {
 					console.error('调用wx.login接口失败:', err);
 					this.handleLoginFailure('微信登录失败');
 				}
 			});
			// #endif
 		},
		
 		// 生成随机openid
 		generateRandomOpenid(userInfo, token) {
 			// 生成一个随机的openid
 			const randomOpenid = 'random_openid_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
 			userInfo.openid = randomOpenid;
			
 			console.log('使用随机生成的openid:', randomOpenid);
			
 			// 调用云函数更新用户openid
 			uniCloud.callFunction({
 				name: 'user',
 				data: {
 					action: 'updateUserOpenid',
 					params: {
 						userId: userInfo._id || userInfo.userId,
 						openid: randomOpenid
 					}
 				},
 				success: (res) => {
 					console.log('更新openid成功:', res);
					
					// 如果云函数返回了完整的用户信息，使用它
 					if (res.result && res.result.code === 0 && res.result.data) {
 						userInfo = res.result.data;
 					}
					
 					// 保存用户信息
 					uni.setStorageSync('token', token);
 					uni.setStorageSync('userInfo', userInfo);
					
 					// 跳转到首页
 					uni.switchTab({
 						url: '/pages/index/index'
 					});
 				},
 				fail: (err) => {
 					console.error('更新openid失败:', err);
 					this.handleLoginFailure('更新用户信息失败');
 				}
 			});
 		},
		
 		// 处理登录失败
 		handleLoginFailure(message) {
 			this.loading = false;
 			uni.hideLoading();
			
 			uni.showToast({
 				title: message || '登录失败，请重试',
 				icon: 'none'
 			});
 		}
 	}
   }

</script>




<style>
.container {
	min-height: 100vh;
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
	padding: 60rpx 50rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.logo {
	margin-bottom: 40rpx;
}

.logo-image {
	width: 180rpx;
	height: 180rpx;
}

.title {
	color: #ffffff;
	font-size: 56rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	text-shadow: 0 2px 10px rgba(0,242,255,0.5);
}

.subtitle {
	color: rgba(255,255,255,0.7);
	font-size: 32rpx;
	margin-bottom: 80rpx;
}

.form {
	width: 100%;
	max-width: 600rpx;
}

.input-group {
	display: flex;
	align-items: center;
	background-color: rgba(255,255,255,0.08);
	border-radius: 12rpx;
	height: 100rpx;
	padding: 0 30rpx;
	margin-bottom: 30rpx;
}

.input-icon {
	font-size: 40rpx;
	margin-right: 20rpx;
}

.input {
	flex: 1;
	height: 100%;
	color: #ffffff;
	font-size: 30rpx;
}

.btn {
	height: 90rpx;
	line-height: 90rpx;
	border-radius: 45rpx;
	font-size: 32rpx;
	margin-bottom: 30rpx;
}

.login-btn {
	background: linear-gradient(45deg, #0056d6, #00a0ff);
	color: #ffffff;
	box-shadow: 0 5px 15px rgba(0,86,214,0.3);
}

.tips {
	margin-top: 60rpx;
	color: rgba(255,255,255,0.5);
	font-size: 24rpx;
}
</style> 