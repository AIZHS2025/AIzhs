// 用户状态模块
import Vue from 'vue'

// 状态
const state = {
	// 是否已登录
	isLoggedIn: false,
	// token
	token: '',
	// 用户信息
	userInfo: null
}

// getter
const getters = {
	isLoggedIn: state => state.isLoggedIn,
	token: state => state.token,
	userInfo: state => state.userInfo
}

// mutations
const mutations = {
	// 设置登录状态
	SET_LOGIN_STATE(state, isLoggedIn) {
		state.isLoggedIn = isLoggedIn
	},
	// 设置token
	SET_TOKEN(state, token) {
		state.token = token;
		// 保存到本地存储
		try {
			uni.setStorageSync('token', token);
			console.log('Token已保存:', token);
		} catch (error) {
			console.error('保存token失败:', error);
		}
	},
	// 设置用户信息
	SET_USER_INFO(state, userInfo) {
		state.userInfo = userInfo;
		// 保存到本地存储
		try {
			uni.setStorageSync('userInfo', userInfo);
			console.log('用户信息已保存:', userInfo);
		} catch (error) {
			console.error('保存用户信息失败:', error);
		}
	},
	// 设置VIP状态
	SET_VIP_STATUS(state, status) {
		if (state.userInfo) {
			Vue.set(state.userInfo, 'isVip', status)
		}
	},
	// 设置VIP到期时间
	SET_VIP_EXPIRE_TIME(state, time) {
		if (state.userInfo) {
			Vue.set(state.userInfo, 'vipExpireTime', time)
		}
	},
	// 登出处理
	CLEAR_USER_DATA(state) {
		state.isLoggedIn = false
		state.token = ''
		state.userInfo = null
		// 清除本地存储
		uni.removeStorageSync('token')
		uni.removeStorageSync('userInfo')
	}
}

// actions
const actions = {
	// 恢复用户状态
	restoreUserState({ commit, dispatch }) {
		console.log('尝试恢复用户状态...')
		return dispatch('checkLoginStatus')
	},
	
	// 微信登录
	async wxLogin({ commit }, code) {
		try {
			const loginResult = await uniCloud.callFunction({
				name: 'login',
				data: {
					action: 'wxLogin',
					params: {
						code
					}
				}
			})
			
			console.log('微信登录结果:', loginResult)
			
			if (loginResult.result.code === 0) {
				const { token, userInfo } = loginResult.result.data
				commit('SET_TOKEN', token)
				commit('SET_USER_INFO', userInfo)
				commit('SET_LOGIN_STATE', true)
				return true
			}
			return false
		} catch (error) {
			console.error('微信登录失败:', error)
			return false
		}
	},
	
	// 检查登录状态
	async checkLoginStatus({ commit, state }) {
		try {
			// 从本地存储获取token
			const token = uni.getStorageSync('token')
			if (!token) {
				commit('CLEAR_USER_DATA')
				return false
			}
			
			const checkResult = await uniCloud.callFunction({
				name: 'login',
				data: {
					action: 'checkLoginStatus',
					params: {
						token
					}
				}
			})
			
			console.log('检查登录状态结果:', checkResult)
			
			if (checkResult.result.code === 0) {
				const { userInfo } = checkResult.result.data
				commit('SET_USER_INFO', userInfo)
				commit('SET_LOGIN_STATE', true)
				return true
			}
			
			commit('CLEAR_USER_DATA')
			return false
		} catch (error) {
			console.error('检查登录状态失败:', error)
			commit('CLEAR_USER_DATA')
			return false
		}
	}
}

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
} 