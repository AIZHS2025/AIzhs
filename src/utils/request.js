// 使用Vue实例获取baseURL
const baseURL = Vue.prototype.$baseUrl

function request(options = {}) {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token')
		
		uni.request({
			url: baseURL + options.url,
			method: options.method || 'GET',
			data: options.data,
			header: {
				'content-type': 'application/json',
				'Authorization': token ? `Bearer ${token}` : ''
			},
			success: (res) => {
				if (res.statusCode === 200) {
					if (res.data.code === 0) {
						resolve(res.data)
					} else if (res.data.code === 401) {
						// token过期，需要重新登录
						uni.removeStorageSync('token')
						uni.removeStorageSync('userInfo')
						uni.showModal({
							title: '提示',
							content: '登录已过期，请重新登录',
							showCancel: false,
							success: () => {
								uni.navigateTo({
									url: '/pages/login/index'
								})
							}
						})
						reject(new Error('登录已过期'))
					} else {
						uni.showToast({
							title: res.data.msg || '请求失败',
							icon: 'none'
						})
						reject(new Error(res.data.msg || '请求失败'))
					}
				} else {
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					})
					reject(new Error('网络错误'))
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				})
				reject(err)
			}
		})
	})
}

// 添加请求拦截器
request.interceptors = {
	request: (config) => {
		// 在发送请求之前做些什么
		return config
	},
	response: (response) => {
		// 对响应数据做点什么
		return response
	}
}

export default request

// 云函数调用封装
function callCloudFunction(name, data) {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name,
			data
		}).then(res => {
			if (res.result.code === 0) {
				resolve(res.result)
			} else {
				uni.showToast({
					title: res.result.msg || '请求失败',
					icon: 'none'
				})
				reject(new Error(res.result.msg || '请求失败'))
			}
		}).catch(err => {
			console.error('云函数调用失败:', err)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
			reject(err)
		})
	})
}

// 用户相关接口
export const userApi = {
	// 微信登录
	wxLogin: (data) => callCloudFunction('login', {
		action: 'wxLogin',
		params: data
	}),
	
	// 检查登录状态
	checkLoginStatus: (data) => callCloudFunction('login', {
		action: 'checkLoginStatus',
		params: data
	}),
	
	// 更新用户信息
	updateUserInfo: (data) => callCloudFunction('user', {
		action: 'updateUserInfo',
		params: data
	}),
	
	// 获取用户信息
	getUserInfo: (data) => callCloudFunction('user', {
		action: 'getUserInfo',
		params: data
	})
}

// 支付相关接口
export const paymentApi = {
	// 创建订单
	createOrder: (data) => callCloudFunction('payment', {
		action: 'createOrder',
		params: data
	}),
	
	// 查询订单状态
	queryOrder: (data) => callCloudFunction('payment', {
		action: 'queryOrder',
		params: data
	}),
	
	// 取消订单
	cancelOrder: (data) => callCloudFunction('payment', {
		action: 'cancelOrder',
		params: data
	})
}

// VIP相关接口
export const vipApi = {
	// 开通VIP
	openVip: (data) => callCloudFunction('vip', {
		action: 'openVip',
		params: data
	}),
	
	// 查询VIP状态
	queryVipStatus: (data) => callCloudFunction('vip', {
		action: 'queryVipStatus',
		params: data
	}),
	
	// 获取VIP权益
	getVipBenefits: (data) => callCloudFunction('vip', {
		action: 'getVipBenefits',
		params: data
	})
}

// AI对话相关接口
export const aiApi = {
	// 发送消息
	sendMessage: (data) => callCloudFunction('ai', {
		action: 'sendMessage',
		params: data
	}),
	
	// 获取历史记录
	getHistory: (data) => callCloudFunction('ai', {
		action: 'getHistory',
		params: data
	}),
	
	// 清空历史记录
	clearHistory: (data) => callCloudFunction('ai', {
		action: 'clearHistory',
		params: data
	})
}

// 内容相关接口
export const contentApi = {
	// 获取内容列表
	getList: (params) => callCloudFunction('content', {
		type: 'getContentList',
		...params
	}),
	// 获取内容详情
	getDetail: (id) => callCloudFunction('content', {
		type: 'getContentDetail',
		id
	}),
	// 创建内容
	create: (content) => callCloudFunction('content', {
		type: 'createContent',
		content
	}),
	// 更新内容
	update: (id, content) => callCloudFunction('content', {
		type: 'updateContent',
		id,
		content
	}),
	// 删除内容
	delete: (id) => callCloudFunction('content', {
		type: 'deleteContent',
		id
	})
} 