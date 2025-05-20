<template>
	<view class="container" style="color: white">
		<!-- 引入外部 顶部导航栏 -->
		<navigation-bars 
			:title="'AI图片增强'" 
			:backgroundColor="color"
      		viscosity="true"
			:isShowBack="true"
			:isShowHome="true"
			@back="goBack"
			@home="goHome"
		></navigation-bars>
		
		<!-- 主体内容 -->
		<view class="content">
			<!-- 上传区域 -->
			<view class="upload-area" @click="chooseImage">
				<image v-if="!imageUrl" src="/static/images/upload.png" mode="aspectFit"></image>
				<image v-else :src="imageUrl" mode="aspectFit"></image>
				<text v-if="!imageUrl">点击上传图片</text>
			</view>
			
			<!-- 操作按钮 -->
			<view class="action-buttons">
				<button class="action-btn" @click="enhanceImage" :disabled="!imageUrl || isProcessing">
					{{ isProcessing ? '处理中...' : '开始增强' }}
				</button>
			</view>
			
			<!-- 结果展示 -->
			<view class="result-area" v-if="enhancedImageUrl">
				<image :src="enhancedImageUrl" mode="aspectFit"></image>
				<view class="result-actions">
					<button class="action-btn" @click="saveImage">保存图片</button>
					<button class="action-btn" @click="shareImage">分享</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex'
	import { getToken } from '@/utils/auth.js'
	import { getBaseUrl } from '@/utils/request.js'
	
	export default {
		data() {
			return {
				color:'',
				imageUrl: '',
				enhancedImageUrl: '',
				isProcessing: false,
				color: "",
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
			this.color = e.scrollTop > 20 ? "white" : "transparent";
  },
		computed: {
			...mapState({
				userInfo: state => state.user.userInfo,
				hasLogin: state => state.user.hasLogin
			})
		},
		methods: {
			...mapMutations(['login']),
			
			// 返回上一页
			goBack() {
				uni.navigateBack()
			},
			
			// 返回首页
			goHome() {
				uni.switchTab({
					url: '/pages/index/index'
				})
			},
			
			// 选择图片
			chooseImage() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						this.imageUrl = res.tempFilePaths[0]
						this.enhancedImageUrl = ''
					}
				})
			},
			
			// 增强图片
			async enhanceImage() {
				if (!this.imageUrl) {
					uni.showToast({
						title: '请先选择图片',
						icon: 'none'
					})
					return
				}
				
				this.isProcessing = true
				
				try {
					// 上传图片
					const uploadRes = await this.uploadFile(this.imageUrl)
					
					// 调用增强API
					const enhanceRes = await this.callEnhanceAPI(uploadRes.url)
					
					// 显示结果
					this.enhancedImageUrl = enhanceRes.enhancedUrl
					
					uni.showToast({
						title: '增强完成',
						icon: 'success'
					})
				} catch (error) {
					uni.showToast({
						title: error.message || '处理失败',
						icon: 'none'
					})
				} finally {
					this.isProcessing = false
				}
			},
			
			// 上传文件
			uploadFile(filePath) {
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: getBaseUrl() + '/api/upload',
						filePath: filePath,
						name: 'file',
						header: {
							'Authorization': 'Bearer ' + getToken()
						},
						success: (res) => {
							const data = JSON.parse(res.data)
							if (data.code === 200) {
								resolve(data.data)
							} else {
								reject(new Error(data.msg))
							}
						},
						fail: (err) => {
							reject(new Error('上传失败'))
						}
					})
				})
			},
			
			// 调用增强API
			async callEnhanceAPI(imageUrl) {
				const res = await uni.request({
					url: getBaseUrl() + '/api/ai/enhance',
					method: 'POST',
					header: {
						'Authorization': 'Bearer ' + getToken()
					},
					data: {
						imageUrl: imageUrl
					}
				})
				
				if (res.data.code === 200) {
					return res.data.data
				} else {
					throw new Error(res.data.msg)
				}
			},
			
			// 保存图片
			saveImage() {
				if (!this.enhancedImageUrl) return
				
				uni.saveImageToPhotosAlbum({
					filePath: this.enhancedImageUrl,
					success: () => {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						})
					},
					fail: () => {
						uni.showToast({
							title: '保存失败',
							icon: 'none'
						})
					}
				})
			},
			
			// 分享图片
			shareImage() {
				if (!this.enhancedImageUrl) return
				
				uni.share({
					provider: 'weixin',
					scene: 'WXSceneSession',
					type: 2,
					imageUrl: this.enhancedImageUrl,
					success: () => {
						uni.showToast({
							title: '分享成功',
							icon: 'success'
						})
					},
					fail: () => {
						uni.showToast({
							title: '分享失败',
							icon: 'none'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #1a1a1a;
	
	.content {
		padding: 30rpx;
		
		.upload-area {
			width: 100%;
			height: 400rpx;
			background-color: #2a2a2a;
			border-radius: 20rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			margin-bottom: 30rpx;
			
			image {
				width: 200rpx;
				height: 200rpx;
				margin-bottom: 20rpx;
			}
			
			text {
				color: #999;
				font-size: 28rpx;
			}
		}
		
		.action-buttons {
			margin-bottom: 30rpx;
			
			.action-btn {
				width: 100%;
				height: 88rpx;
				background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
				border-radius: 44rpx;
				color: #fff;
				font-size: 32rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				&:active {
					opacity: 0.8;
				}
				
				&[disabled] {
					background: #666;
					opacity: 0.5;
				}
			}
		}
		
		.result-area {
			background-color: #2a2a2a;
			border-radius: 20rpx;
			padding: 20rpx;
			
			image {
				width: 100%;
				height: 400rpx;
				border-radius: 10rpx;
				margin-bottom: 20rpx;
			}
			
			.result-actions {
				display: flex;
				gap: 20rpx;
				
				.action-btn {
					flex: 1;
					height: 80rpx;
					background: linear-gradient(45deg, #4CAF50, #45a049);
					border-radius: 40rpx;
					color: #fff;
					font-size: 28rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					
					&:active {
						opacity: 0.8;
					}
				}
			}
		}
	}
}
</style> 