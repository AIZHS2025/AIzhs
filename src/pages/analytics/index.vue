<template>
    <view class="container">
        <nav-bar title="数据分析" />
        
        <!-- 数据概览 -->
        <view class="overview">
            <view class="overview-item">
                <text class="value">{{data.totalViews}}</text>
                <text class="label">总浏览量</text>
            </view>
            <view class="overview-item">
                <text class="value">{{data.totalLikes}}</text>
                <text class="label">总点赞数</text>
            </view>
            <view class="overview-item">
                <text class="value">{{data.totalComments}}</text>
                <text class="label">总评论数</text>
            </view>
            <view class="overview-item">
                <text class="value">{{data.totalFans}}</text>
                <text class="label">总粉丝数</text>
            </view>
        </view>
        
        <!-- 趋势图表 -->
        <view class="chart-section">
            <view class="section-title">数据趋势</view>
            <view class="chart-container">
                <!-- 这里可以集成图表组件 -->
                <view class="chart-placeholder">图表区域</view>
            </view>
        </view>
        
        <!-- 详细数据 -->
        <view class="detail-section">
            <view class="section-title">详细数据</view>
            <view class="detail-list">
                <view class="detail-item" v-for="(item, index) in data.details" :key="index">
                    <view class="item-header">
                        <text class="title">{{item.title}}</text>
                        <text class="date">{{item.date}}</text>
                    </view>
                    <view class="item-content">
                        <view class="data-row">
                            <text class="label">浏览量</text>
                            <text class="value">{{item.views}}</text>
                        </view>
                        <view class="data-row">
                            <text class="label">点赞数</text>
                            <text class="value">{{item.likes}}</text>
                        </view>
                        <view class="data-row">
                            <text class="label">评论数</text>
                            <text class="value">{{item.comments}}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            data: {
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0,
                totalFans: 0,
                details: []
            }
        }
    },
    onLoad() {
        this.getAnalyticsData()
    },
    methods: {
        getAnalyticsData() {
            // TODO: 调用云函数获取数据
            // 模拟数据
            this.data = {
                totalViews: 12345,
                totalLikes: 678,
                totalComments: 123,
                totalFans: 456,
                details: [
                    {
                        title: '短视频数据分析',
                        date: '2024-03-20',
                        views: 1234,
                        likes: 56,
                        comments: 12
                    },
                    {
                        title: '直播数据分析',
                        date: '2024-03-19',
                        views: 2345,
                        likes: 78,
                        comments: 23
                    }
                ]
            }
        }
    }
}
</script>

<style lang="scss">
.container {
    min-height: 100vh;
    background-color: $background-color;
    padding: $spacing-base;
}

.overview {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-large;
    
    .overview-item {
        flex: 1;
        text-align: center;
        padding: $spacing-base;
        background: $background-color-card;
        border-radius: $border-radius-base;
        margin: 0 $spacing-mini;
        
        .value {
            display: block;
            font-size: $font-size-xl;
            color: $primary-color;
            margin-bottom: $spacing-mini;
        }
        
        .label {
            font-size: $font-size-sm;
            color: $text-color-light;
        }
    }
}

.chart-section {
    background: $background-color-card;
    border-radius: $border-radius-base;
    padding: $spacing-base;
    margin-bottom: $spacing-large;
    
    .section-title {
        font-size: $font-size-lg;
        color: $text-color;
        margin-bottom: $spacing-base;
    }
    
    .chart-container {
        height: 400rpx;
        
        .chart-placeholder {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: $background-color;
            border-radius: $border-radius-base;
            color: $text-color-light;
        }
    }
}

.detail-section {
    background: $background-color-card;
    border-radius: $border-radius-base;
    padding: $spacing-base;
    
    .section-title {
        font-size: $font-size-lg;
        color: $text-color;
        margin-bottom: $spacing-base;
    }
    
    .detail-list {
        .detail-item {
            padding: $spacing-base;
            border-bottom: 1px solid $border-color;
            
            &:last-child {
                border-bottom: none;
            }
            
            .item-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: $spacing-base;
                
                .title {
                    font-size: $font-size-base;
                    color: $text-color;
                }
                
                .date {
                    font-size: $font-size-sm;
                    color: $text-color-light;
                }
            }
            
            .item-content {
                .data-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: $spacing-mini;
                    
                    &:last-child {
                        margin-bottom: 0;
                    }
                    
                    .label {
                        font-size: $font-size-sm;
                        color: $text-color-light;
                    }
                    
                    .value {
                        font-size: $font-size-sm;
                        color: $text-color;
                    }
                }
            }
        }
    }
}
</style> 