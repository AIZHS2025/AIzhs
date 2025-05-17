<template>
	<view class="settings">
		<view class="section">
			<view class="section-title">TabBar图标管理</view>
			<view class="icon-list">
				<view class="icon-item" v-for="(item, index) in iconList" :key="index">
					<view class="icon-name">{{item.name}}</view>
					<view class="icon-preview">
						<image :src="item.icon" mode="aspectFit" class="icon-image"></image>
						<image :src="item.activeIcon" mode="aspectFit" class="icon-image"></image>
					</view>
					<button class="upload-btn" @click="uploadIcon(index)">更新图标</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			iconList: [
				{
					name: '首页',
					icon: '',
					activeIcon: ''
				},
				{
					name: '对话',
					icon: '',
					activeIcon: ''
				},
				{
					name: '会员',
					icon: '',
					activeIcon: ''
				},
				{
					name: '设置',
					icon: '',
					activeIcon: ''
				}
			]
		}
	},
	onLoad() {
		this.getTabBarIcons();
	},
	methods: {
		async getTabBarIcons() {
			try {
				const res = await uniCloud.callFunction({
					name: 'common',
					data: {
						action: 'getTabBarIcons'
					}
				});
				
				if (res.result.code === 0) {
					const icons = res.result.data;
					this.iconList = [
						{
							name: '首页',
							icon: icons.home,
							activeIcon: icons.homeActive
						},
						{
							name: '对话',
							icon: icons.chat,
							activeIcon: icons.chatActive
						},
						{
							name: '会员',
							icon: icons.member,
							activeIcon: icons.memberActive
						},
						{
							name: '设置',
							icon: icons.settings,
							activeIcon: icons.settingsActive
						}
					];
				}
			} catch (e) {
				uni.showToast({
					title: '获取图标失败',
					icon: 'none'
				});
			}
		},
		uploadIcon(index) {
			uni.chooseImage({
				count: 2,
				success: async (res) => {
					const tempFilePaths = res.tempFilePaths;
					if (tempFilePaths.length === 2) {
						try {
							// 上传图标到云存储
							const uploadTasks = tempFilePaths.map(filePath => {
								return uniCloud.uploadFile({
									filePath: filePath,
									cloudPath: `tabbar/${Date.now()}_${index}.png`
								});
							});
							
							const results = await Promise.all(uploadTasks);
							
							// 更新图标数据
							this.iconList[index].icon = results[0].fileID;
							this.iconList[index].activeIcon = results[1].fileID;
							
							// 保存到数据库
							await this.saveIcons();
							
							uni.showToast({
								title: '更新成功',
								icon: 'success'
							});
						} catch (e) {
							uni.showToast({
								title: '上传失败',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		async saveIcons() {
			try {
				const icons = {
					home: this.iconList[0].icon,
					homeActive: this.iconList[0].activeIcon,
					chat: this.iconList[1].icon,
					chatActive: this.iconList[1].activeIcon,
					member: this.iconList[2].icon,
					memberActive: this.iconList[2].activeIcon,
					settings: this.iconList[3].icon,
					settingsActive: this.iconList[3].activeIcon
				};
				
				await uniCloud.callFunction({
					name: 'common',
					data: {
						action: 'saveTabBarIcons',
						data: icons
					}
				});
			} catch (e) {
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				});
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.settings {
	padding: 20rpx;
	
	.section {
		margin-bottom: 30rpx;
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			margin-bottom: 20rpx;
		}
		
		.icon-list {
			.icon-item {
				background: #fff;
				padding: 20rpx;
				margin-bottom: 20rpx;
				border-radius: 12rpx;
				
				.icon-name {
					font-size: 28rpx;
					margin-bottom: 20rpx;
				}
				
				.icon-preview {
					display: flex;
					justify-content: space-around;
					margin-bottom: 20rpx;
					
					.icon-image {
						width: 80rpx;
						height: 80rpx;
					}
				}
				
				.upload-btn {
					background: #007AFF;
					color: #fff;
					font-size: 28rpx;
					padding: 10rpx 30rpx;
					border-radius: 8rpx;
				}
			}
		}
	}
}
</style> 