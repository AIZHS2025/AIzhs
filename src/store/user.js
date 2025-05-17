import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default {
	namespaced: true,
	state: {
		isVip: false,
		vipExpireTime: null,
		userInfo: {
			userId: '',
			username: '',
			nickName: '',
			avatarUrl: '',
			isVip: false,
			vipExpireTime: null,
			studyDays: 0,
			points: 0,
			collections: 0
		},
		token: null,
		vipFeatures: [
			{
				id: 'ai_copywriting',
				title: 'AI营销文案',
				icon: '✍️',
				desc: '智能生成各类营销文案'
			},
			{
				id: 'ai_chat',
				title: 'AI智能对话',
				icon: '💬',
				desc: '智能助手解答各类问题'
			},
			{
				id: 'ai_analysis',
				title: 'AI数据分析',
				icon: '📊',
				desc: '智能分析各类数据报表'
			},
			{
				id: 'ai_design',
				title: 'AI智能设计',
				icon: '🎨',
				desc: '智能生成图片和设计'
			}
		],
		vipPrice: {
			original: 588,
			current: 588
		},
		hasLogin: false
	},
	mutations: {
		SET_VIP_STATUS(state, status) {
			state.isVip = status
			if (state.userInfo) {
				state.userInfo.isVip = status
			}
		},
		SET_VIP_EXPIRE_TIME(state, time) {
			state.vipExpireTime = time
			if (state.userInfo) {
				state.userInfo.vipExpireTime = time
			}
		},
		SET_USER_INFO(state, info) {
			if (!info) {
				state.userInfo = {
					userId: '',
					username: '',
					nickName: '',
					avatarUrl: '',
					isVip: false,
					vipExpireTime: null,
					studyDays: 0,
					points: 0,
					collections: 0
				}
			} else {
				state.userInfo = {...state.userInfo, ...info}
				// 同步VIP状态
				state.isVip = info.isVip || false
				state.vipExpireTime = info.vipExpireTime || null
			}
			
			// 本地持久化
			try {
				uni.setStorageSync('userInfo', state.userInfo)
			} catch (e) {
				console.error('存储用户信息失败:', e)
			}
		},
		SET_TOKEN(state, token) {
			state.token = token
			// 保存到本地存储
			if (token) {
				uni.setStorageSync('token', token)
			} else {
				uni.removeStorageSync('token')
			}
		},
		SET_LOGIN_STATE(state, isLoggedIn) {
			// 设置登录状态
			state.hasLogin = isLoggedIn
			console.log('登录状态已更新:', isLoggedIn)
		},
		LOGOUT(state) {
			// 清除用户信息
			state.token = null
			state.hasLogin = false
			state.isVip = false
			state.vipExpireTime = null
			state.userInfo = {
				userId: '',
				username: '',
				nickName: '',
				avatarUrl: '',
				isVip: false,
				vipExpireTime: null,
				studyDays: 0,
				points: 0,
				collections: 0
			}
			
			// 清除本地存储
			try {
				uni.removeStorageSync('token')
				uni.removeStorageSync('userInfo')
			} catch (e) {
				console.error('清除登录信息失败:', e)
			}
		}
	},
	actions: {
		// 微信登录
		async loginWithWechat({ commit, dispatch }) {
			return new Promise((resolve, reject) => {
				uni.showLoading({
					title: '登录中'
				});
				
				// 使用微信登录
				uni.login({
					provider: 'weixin',
					success: async (loginRes) => {
						if (loginRes.code) {
							try {
								console.log('获取到微信登录code:', loginRes.code);
								
								// 直接调用云函数进行登录，传入code
								try {
									const loginResult = await uniCloud.callFunction({
										name: 'login',
										data: {
											action: 'wxLogin',
											params: {
												code: loginRes.code,
												device: 'mp-weixin'
											}
										}
									});
									
									console.log('登录云函数返回结果:', loginResult);
									
									const { code, msg, data } = loginResult.result;
									
									if (code !== 0 || !data) {
										uni.hideLoading();
										uni.showToast({
											title: msg || '登录失败',
											icon: 'none'
										});
										reject(new Error(msg || '登录失败'));
										return;
									}
									
									// 确保userInfo存在
									if (!data.userInfo) {
										uni.hideLoading();
										uni.showToast({
											title: '登录返回的用户信息为空',
											icon: 'none'
										});
										reject(new Error('登录返回的用户信息为空'));
										return;
									}
									
									console.log('登录成功，用户信息:', data.userInfo);
									
									// 规格化用户信息，确保字段一致
									const normalizedUserInfo = {
										userId: data.userInfo.userId || '',
										username: data.userInfo.username || '',
										nickname: data.userInfo.nickname || data.userInfo.username || '',
										avatarUrl: data.userInfo.avatar || '',
										isVip: data.userInfo.isVip || false,
										vipExpireTime: data.userInfo.vipExpireTime || null,
										studyDays: data.userInfo.studyDays || 0,
										points: data.userInfo.points || 0,
										collections: data.userInfo.collections || 0
									};
									
									// 保存用户信息和token
									commit('SET_TOKEN', data.token);
									commit('SET_USER_INFO', normalizedUserInfo);
									commit('SET_VIP_STATUS', normalizedUserInfo.isVip);
									commit('SET_VIP_EXPIRE_TIME', normalizedUserInfo.vipExpireTime);
									commit('SET_LOGIN_STATE', true);
									
									// 保存到本地存储以便下次自动登录
									try {
										uni.setStorageSync('token', data.token);
										uni.setStorageSync('userInfo', JSON.stringify(normalizedUserInfo));
										console.log('用户信息成功保存到本地存储');
									} catch (storageError) {
										console.error('保存用户信息到本地存储失败:', storageError);
									}
									
									uni.hideLoading();
									uni.showToast({
										title: '登录成功',
										icon: 'success'
									});
									
									resolve({
										success: true,
										userInfo: normalizedUserInfo
									});
								} catch (error) {
									console.error('调用登录云函数失败:', error);
									uni.hideLoading();
									uni.showToast({
										title: '登录失败，请稍后重试',
										icon: 'none'
									});
									reject(error);
								}
							} catch (error) {
								console.error('登录过程出错:', error);
								uni.hideLoading();
								uni.showToast({
									title: '登录失败，请稍后重试',
									icon: 'none'
								});
								reject(error);
							}
						} else {
							console.error('微信登录失败，没有code');
							uni.hideLoading();
							uni.showToast({
								title: '微信登录失败，请稍后重试',
								icon: 'none'
							});
							reject(new Error('微信登录失败'));
						}
					},
					fail: (err) => {
						console.error('微信登录失败:', err);
						uni.hideLoading();
						uni.showToast({
							title: '微信登录失败，请稍后重试',
							icon: 'none'
						});
						reject(err);
					}
				});
			});
		},
		
		// 检查VIP状态
		async checkVipStatus({ commit, state }) {
			try {
				const token = state.token || uni.getStorageSync('token')
				if (!token) return false
				
				// 调用云函数检查VIP状态
				try {
					console.log('调用云函数检查VIP状态')
					const vipResult = await uniCloud.callFunction({
						name: 'login',
						data: {
							action: 'checkVipStatus',
							params: {
								token
							}
						}
					});
					
					const { code, data } = vipResult.result
					if (code === 0) {
						commit('SET_VIP_STATUS', data.isVip)
						commit('SET_VIP_EXPIRE_TIME', data.expireTime)
						return data.isVip
					}
					
					return false
				} catch (cloudError) {
					console.error('云函数VIP检查失败:', cloudError)
					return false
				}
			} catch (error) {
				console.error('VIP状态检查错误:', error)
				return false
			}
		},
		
		// 购买VIP
		async purchaseVip({ commit, state, dispatch }) {
			return new Promise((resolve, reject) => {
				// 检查是否已登录
				if (!state.token) {
					uni.showModal({
						title: '请先登录',
						content: '开通VIP会员需要先登录账号',
						confirmText: '去登录',
						success: (res) => {
							if (res.confirm) {
								dispatch('loginWithWechat');
							}
						}
					});
					resolve(false);
					return;
				}
				
				uni.showModal({
					title: 'AI智汇社VIP会员',
					content: '开通VIP会员，一次性支付588元\n畅享所有AI功能，终身使用',
					confirmText: '立即支付',
					confirmColor: '#FFD700',
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '正在创建订单'
							})
							
							try {
								// 创建订单
								const createOrderResult = await uniCloud.callFunction({
									name: 'order',
									data: {
										action: 'create',
										params: {
											productId: 'vip_membership',
											productName: 'VIP会员',
											amount: 588
										}
									}
								});
								
								if (createOrderResult.result.code !== 0) {
									throw new Error(createOrderResult.result.msg || '创建订单失败');
								}
								
								const { orderId, orderNo } = createOrderResult.result.data;
								
								// 这里应调用微信支付API
								// 为了演示，我们模拟支付成功
								setTimeout(async () => {
									try {
										// 处理支付成功回调
										const payResult = await uniCloud.callFunction({
											name: 'order',
											data: {
												action: 'handlePayment',
												params: {
													orderNo,
													paymentMethod: 'wechat',
													paymentId: 'wx_' + Date.now()
												}
											}
										});
										
										if (payResult.result.code === 0) {
											commit('SET_VIP_STATUS', true);
											commit('SET_VIP_EXPIRE_TIME', null);
											
											// 更新本地状态
											const userInfo = {...state.userInfo};
											userInfo.isVip = true;
											userInfo.vipExpireTime = null;
											commit('SET_USER_INFO', userInfo);
											
											uni.hideLoading();
											uni.showToast({
												title: '支付成功',
												icon: 'success'
											});
											resolve(true);
										} else {
											throw new Error(payResult.result.msg || '支付处理失败');
										}
									} catch (error) {
										console.error('支付处理错误:', error);
										uni.hideLoading();
										uni.showToast({
											title: error.message || '支付失败，请重试',
											icon: 'none'
										});
										reject(error);
									}
								}, 1500);
							} catch (error) {
								console.error('创建订单错误:', error);
								uni.hideLoading();
								uni.showToast({
									title: error.message || '支付失败，请重试',
									icon: 'none'
								});
								reject(error);
							}
						} else {
							resolve(false);
						}
					}
				})
			})
		},
		
		// 检查单个功能是否可用
		async checkFeatureAvailable({ dispatch, state }, featureId) {
			// 检查是否登录
			if (!state.token) {
				uni.showModal({
					title: '需要登录',
					content: '该功能需要登录后才能使用，是否立即登录？',
					confirmText: '去登录',
					cancelText: '暂不登录',
					success: (res) => {
						if(res.confirm) {
							// 调用微信登录
							dispatch('loginWithWechat');
						}
					}
				});
				return false;
			}
			
			// 如果已登录，检查VIP状态
			if (!state.isVip) {
				const isVip = await dispatch('checkVipStatus');
				if (!isVip) {
					uni.showModal({
						title: 'VIP功能',
						content: '该功能需要VIP会员，是否立即开通？',
						confirmText: '立即开通',
						success: (res) => {
							if(res.confirm) {
								uni.navigateTo({
									url: '/pages/vip/index'
								});
							}
						}
					});
					return false;
				}
			}
			
			return true;
		},
		
		// 恢复用户状态(从本地存储)
		restoreUserState({ commit }) {
			try {
				const token = uni.getStorageSync('token');
				const userInfo = uni.getStorageSync('userInfo');
				
				if (token && userInfo) {
					console.log('正在恢复用户状态:', userInfo);
					// 同步到状态管理
					commit('SET_TOKEN', token);
					commit('SET_USER_INFO', userInfo);
					commit('SET_VIP_STATUS', userInfo.isVip || false);
					commit('SET_VIP_EXPIRE_TIME', userInfo.vipExpireTime);
					
					return true;
				}
			} catch (e) {
				console.error('恢复用户状态失败:', e);
			}
			
			return false;
		},
		
		// 退出登录
		logout({ commit }) {
			// 清除本地存储
			uni.removeStorageSync('token');
			uni.removeStorageSync('userInfo');
			
			// 重置状态
			commit('SET_TOKEN', null);
			commit('SET_USER_INFO', null);
			commit('SET_VIP_STATUS', false);
			commit('SET_VIP_EXPIRE_TIME', null);
			
			uni.showToast({
				title: '已退出登录',
				icon: 'success'
			});
		},
		
		// 检查登录状态
		async checkLoginStatus({ commit, dispatch }) {
			try {
				// 先清除可能存在的提示
				uni.hideToast();
				
				// 尝试从本地存储恢复用户状态
				const restored = await dispatch('restoreUserState');
				
				if (restored) {
					const token = uni.getStorageSync('token');
					if (!token) return false;
					
					// 验证Token有效性
					const loginStatusResult = await uniCloud.callFunction({
						name: 'login',
						data: {
							action: 'checkLoginStatus',
							params: { token }
						}
					});
					
					const { code, data } = loginStatusResult.result;
					
					// Token有效
					if (code === 0) {
						console.log('Token有效，更新用户信息');
						// 更新最新的用户信息
						commit('SET_USER_INFO', data.userInfo);
						commit('SET_VIP_STATUS', data.userInfo.isVip || false);
						commit('SET_VIP_EXPIRE_TIME', data.userInfo.vipExpireTime);
						return true;
					} else {
						console.warn('Token无效，清除登录状态');
						// Token无效，清除登录状态
						dispatch('logout');
						return false;
					}
				}
				
				return false;
			} catch (error) {
				console.error('检查登录状态失败:', error);
				return false;
			}
		}
	},
	getters: {
		vipStatus: state => state.isVip,
		vipExpireTime: state => state.vipExpireTime,
		availableFeatures: state => state.vipFeatures,
		vipPriceInfo: state => state.vipPrice,
		isLoggedIn: state => !!state.token,
		hasLogin: state => !!state.token,
		userInfo: state => state.userInfo || {
			userId: '',
			username: '',
			nickName: '',
			avatarUrl: '',
			isVip: false,
			vipExpireTime: null,
			studyDays: 0,
			points: 0,
			collections: 0
		}
	}
} 