<template>
	<view class="cloud-test-page">
		<view class="status-card">
			<view class="title">云环境状态</view>
			<view class="status-item">
				<text class="label">云开发状态:</text>
				<text class="value" :class="cloudEnabled ? 'success' : 'error'">
					{{ cloudEnabled ? '已启用' : '已禁用' }}
				</text>
			</view>
			<view class="status-item">
				<text class="label">VIP状态:</text>
				<text class="value" :class="isVip ? 'success' : 'error'">
					{{ isVip ? '已开通' : '未开通' }}
				</text>
			</view>
		</view>
		
		<view class="action-card">
			<view class="title">功能测试</view>
			<button class="action-btn" @tap="testCloudInit">测试云初始化</button>
			<button class="action-btn" @tap="testLogin">测试登录</button>
			<button class="action-btn" @tap="testVipCheck">测试VIP检查</button>
			<button class="action-btn" @tap="testCloudFunction">测试云函数调用</button>
			<button class="action-btn" @tap="testDirectCloudDB">测试直接云数据库连接</button>
			<button class="action-btn" @tap="testDirectCloudFunction">测试直接云函数调用</button>
		</view>
		
		<view class="log-card">
			<view class="title">测试日志</view>
			<scroll-view class="log-content" scroll-y>
				<view v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
					<text class="log-time">{{ log.time }}</text>
					<text class="log-msg">{{ log.message }}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {
			logs: [],
			cloudEnabled: false,
		}
	},
	computed: {
		...mapState({
			isVip: state => state.user ? state.user.isVip : false
		})
	},
	onLoad() {
		this.cloudEnabled = this.$cloudEnabled || false
		this.addLog('info', '页面加载完成')
		this.addLog('info', `云环境状态: ${this.cloudEnabled ? '已启用' : '已禁用'}`)
	},
	methods: {
		addLog(type, message) {
			const now = new Date()
			const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
			this.logs.unshift({
				type,
				time,
				message
			})
		},
		
		async testCloudInit() {
			this.addLog('info', '测试云初始化...')
			try {
				this.cloudEnabled = this.$cloudEnabled || false
				this.addLog('success', `云环境状态: ${this.cloudEnabled ? '已启用' : '已禁用'}`)
				
				// 尝试获取uniCloud对象
				if (typeof uniCloud !== 'undefined') {
					this.addLog('success', 'uniCloud对象存在')
					
					// 尝试检查阿里云服务空间
					if (uniCloud.mixinDatacom) {
						this.addLog('success', 'uniCloud.mixinDatacom存在, 阿里云配置正常')
					}
					
					// 查看空间信息
					if (uniCloud.config && uniCloud.config.spaceId) {
						this.addLog('success', `服务空间ID: ${uniCloud.config.spaceId}`)
					} else {
						this.addLog('warning', '无法获取服务空间ID')
					}
				} else {
					this.addLog('error', 'uniCloud对象不存在，请检查网络和配置')
				}
			} catch (error) {
				this.addLog('error', `云初始化测试错误: ${error.message}`)
			}
		},
		
		async testLogin() {
			this.addLog('info', '测试登录...')
			try {
				const result = await this.$store.dispatch('user/login', {
					username: 'test',
					password: '123456'
				})
				this.addLog('success', `登录结果: ${result ? '成功' : '失败'}`)
			} catch (error) {
				this.addLog('error', `登录测试错误: ${error.message}`)
			}
		},
		
		async testVipCheck() {
			this.addLog('info', '测试VIP状态检查...')
			try {
				const result = await this.$store.dispatch('user/checkVipStatus')
				this.addLog('success', `VIP状态: ${result ? '已开通' : '未开通'}`)
			} catch (error) {
				this.addLog('error', `VIP检查错误: ${error.message}`)
			}
		},
		
		async testCloudFunction() {
			this.addLog('info', '测试云函数调用...')
			try {
				if (!this.$callFunction) {
					this.addLog('error', '云函数调用方法不存在')
					return
				}
				
				const result = await this.$callFunction('login', {
					action: 'checkVipStatus',
					params: {
						userId: 'test'
					}
				})
				
				this.addLog('success', `云函数调用结果: ${JSON.stringify(result.result)}`)
			} catch (error) {
				this.addLog('error', `云函数调用错误: ${error.message}`)
			}
		},
		
		async testDirectCloudDB() {
			this.addLog('info', '直接测试云数据库连接...')
			try {
				// 直接使用uniCloud的数据库API
				const db = uniCloud.database()
				this.addLog('success', 'uniCloud.database()调用成功')
				
				// 尝试访问user集合
				try {
					const userCollection = db.collection('user')
					this.addLog('success', '成功引用user集合')
					
					// 尝试查询数据
					const countResult = await userCollection.count()
					this.addLog('success', `用户集合数量: ${countResult.total}`)
				} catch (dbError) {
					this.addLog('error', `集合访问错误: ${dbError.message}`)
				}
			} catch (error) {
				this.addLog('error', `数据库连接错误: ${error.message}`)
			}
		},
		
		async testDirectCloudFunction() {
			this.addLog('info', '直接测试云函数调用...')
			try {
				if (typeof uniCloud === 'undefined') {
					this.addLog('error', 'uniCloud对象不存在')
					return
				}
				
				// 直接调用云函数
				try {
					const result = await uniCloud.callFunction({
						name: 'login',
						data: {
							action: 'checkVipStatus',
							params: {
								userId: 'test'
							}
						}
					})
					
					this.addLog('success', `直接云函数调用结果: ${JSON.stringify(result.result || {})}`)
				} catch (fnError) {
					this.addLog('error', `直接云函数调用失败: ${fnError.message}`)
				}
			} catch (error) {
				this.addLog('error', `函数测试错误: ${error.message}`)
			}
		}
	}
}
</script>

<style lang="scss">
.cloud-test-page {
	padding: 30rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
	
	.status-card, .action-card, .log-card {
		background-color: #fff;
		border-radius: 20rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
		
		.title {
			font-size: 36rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
			color: #333;
		}
	}
	
	.status-item {
		display: flex;
		justify-content: space-between;
		padding: 16rpx 0;
		border-bottom: 1px solid #f0f0f0;
		
		.label {
			color: #666;
		}
		
		.value {
			font-weight: bold;
			
			&.success {
				color: #4CAF50;
			}
			
			&.warning {
				color: #FF9800;
			}
			
			&.error {
				color: #F44336;
			}
		}
	}
	
	.action-btn {
		margin: 16rpx 0;
		background-color: #007AFF;
		color: #fff;
		font-size: 30rpx;
		
		&:active {
			opacity: 0.8;
		}
	}
	
	.log-content {
		height: 600rpx;
		border: 1px solid #eee;
		border-radius: 10rpx;
		padding: 20rpx;
	}
	
	.log-item {
		padding: 10rpx 0;
		font-size: 28rpx;
		border-bottom: 1px solid #f5f5f5;
		
		&.info {
			color: #2196F3;
		}
		
		&.success {
			color: #4CAF50;
		}
		
		&.error {
			color: #F44336;
		}
		
		.log-time {
			font-size: 24rpx;
			margin-right: 10rpx;
			opacity: 0.7;
		}
	}
}
</style> 