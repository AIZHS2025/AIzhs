<template>
    <view class="container">
        <nav-bar title="新闻详情" />
        
        <!-- 文章头部 -->
        <view class="article-header">
            <view class="title">{{article.title}}</view>
            <view class="meta">
                <text class="time">{{article.time}}</text>
                <text class="author">{{article.author}}</text>
                <text class="views">{{article.views}}阅读</text>
            </view>
        </view>
        
        <!-- 文章内容 -->
        <view class="article-content">
            <rich-text :nodes="article.content"></rich-text>
        </view>
        
        <!-- 相关推荐 -->
        <view class="related-section">
            <view class="section-title">相关推荐</view>
            <view class="related-list">
                <view 
                    class="related-item" 
                    v-for="(item, index) in article.related" 
                    :key="index"
                    @click="navigateTo(item.id)"
                >
                    <image :src="item.coverUrl" mode="aspectFill" />
                    <view class="info">
                        <view class="title">{{item.title}}</view>
                        <view class="meta">
                            <text class="time">{{item.time}}</text>
                            <text class="views">{{item.views}}阅读</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        
        <!-- 底部操作栏 -->
        <view class="bottom-bar">
            <view class="action-item" @click="handleLike">
                <text class="iconfont" :class="isLiked ? 'icon-like-filled' : 'icon-like'"></text>
                <text class="count">{{article.likes}}</text>
            </view>
            <view class="action-item" @click="handleComment">
                <text class="iconfont icon-comment"></text>
                <text class="count">{{article.comments}}</text>
            </view>
            <view class="action-item" @click="handleShare">
                <text class="iconfont icon-share"></text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            isLiked: false,
            article: {
                title: 'AI技术如何改变短视频创作？',
                time: '2024-03-20 10:30',
                author: 'AI智汇社',
                views: 1234,
                likes: 88,
                comments: 32,
                content: `
                    <div style="font-size: 28rpx; line-height: 1.6; color: #333;">
                        <p>随着人工智能技术的快速发展，短视频创作领域正在经历一场革命性的变革。本文将深入探讨AI技术如何改变短视频创作的方式和效率。</p>
                        
                        <h3>1. 内容创作效率提升</h3>
                        <p>AI技术能够帮助创作者快速生成创意内容，包括文案、标题、标签等。通过自然语言处理技术，AI可以分析热点话题，提供创作建议。</p>
                        
                        <h3>2. 视频制作智能化</h3>
                        <p>AI剪辑工具可以自动识别精彩片段，智能剪辑视频。同时，AI特效生成器可以为视频添加独特的视觉效果。</p>
                        
                        <h3>3. 数据分析与优化</h3>
                        <p>AI算法可以分析视频数据，提供内容优化建议，帮助创作者更好地了解受众需求。</p>
                    </div>
                `,
                related: [
                    {
                        id: 1,
                        title: '短视频运营技巧分享',
                        coverUrl: '/static/images/news-1.jpg',
                        time: '2024-03-19',
                        views: 856
                    },
                    {
                        id: 2,
                        title: 'AI工具使用指南',
                        coverUrl: '/static/images/news-2.jpg',
                        time: '2024-03-18',
                        views: 654
                    }
                ]
            }
        }
    },
    methods: {
        // 点赞
        handleLike() {
            this.isLiked = !this.isLiked
            this.article.likes += this.isLiked ? 1 : -1
        },
        
        // 评论
        handleComment() {
            uni.navigateTo({
                url: '/pages/news/comment?id=' + this.article.id
            })
        },
        
        // 分享
        handleShare() {
            uni.showShareMenu({
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline']
            })
        },
        
        // 跳转到相关文章
        navigateTo(id) {
            uni.navigateTo({
                url: '/pages/news/detail?id=' + id
            })
        }
    }
}
</script>

<style lang="scss">
.container {
    min-height: 100vh;
    background-color: $background-color;
    padding-bottom: 120rpx;
}

.article-header {
    padding: $spacing-large;
    background-color: $background-color-card;
    
    .title {
        font-size: $font-size-xl;
        color: $text-color;
        margin-bottom: $spacing-base;
        line-height: 1.4;
    }
    
    .meta {
        display: flex;
        align-items: center;
        
        text {
            font-size: $font-size-sm;
            color: $text-color-light;
            margin-right: $spacing-base;
            
            &:last-child {
                margin-right: 0;
            }
        }
    }
}

.article-content {
    padding: $spacing-large;
    background-color: $background-color-card;
    margin-top: $spacing-base;
}

.related-section {
    margin-top: $spacing-base;
    padding: $spacing-large;
    background-color: $background-color-card;
    
    .section-title {
        font-size: $font-size-lg;
        color: $text-color;
        margin-bottom: $spacing-base;
    }
    
    .related-list {
        .related-item {
            display: flex;
            padding: $spacing-base 0;
            border-bottom: 1px solid $border-color;
            
            &:last-child {
                border-bottom: none;
            }
            
            image {
                width: 200rpx;
                height: 150rpx;
                border-radius: $border-radius-base;
                margin-right: $spacing-base;
            }
            
            .info {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                
                .title {
                    font-size: $font-size-base;
                    color: $text-color;
                    line-height: 1.4;
                }
                
                .meta {
                    display: flex;
                    align-items: center;
                    
                    text {
                        font-size: $font-size-sm;
                        color: $text-color-light;
                        margin-right: $spacing-base;
                        
                        &:last-child {
                            margin-right: 0;
                        }
                    }
                }
            }
        }
    }
}

.bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100rpx;
    background-color: $background-color-card;
    display: flex;
    align-items: center;
    padding: 0 $spacing-large;
    
    .action-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .iconfont {
            font-size: $font-size-lg;
            color: $text-color-light;
            margin-right: $spacing-mini;
            
            &.icon-like-filled {
                color: $primary-color;
            }
        }
        
        .count {
            font-size: $font-size-sm;
            color: $text-color-light;
        }
    }
}
</style> 