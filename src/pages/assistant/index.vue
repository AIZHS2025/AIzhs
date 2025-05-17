<template>
    <view class="container">
        <nav-bar title="AI助手" />
        
        <!-- 对话列表 -->
        <scroll-view 
            class="chat-list" 
            scroll-y 
            :scroll-top="scrollTop"
            @scrolltoupper="loadMoreHistory"
        >
            <view 
                class="chat-item" 
                v-for="(item, index) in chatList" 
                :key="index"
                :class="{ 'user': item.type === 'user' }"
            >
                <view class="avatar">
                    <image 
                        :src="item.type === 'user' ? userAvatar : '/static/images/ai-avatar.png'" 
                        mode="aspectFill"
                    />
                </view>
                <view class="content">
                    <view class="message">{{item.content}}</view>
                    <view class="time">{{item.time}}</view>
                </view>
            </view>
        </scroll-view>
        
        <!-- 输入区域 -->
        <view class="input-area">
            <input 
                class="input" 
                v-model="inputContent" 
                placeholder="请输入您的问题"
                @confirm="sendMessage"
            />
            <view class="send-btn" @click="sendMessage">
                <text class="iconfont icon-send"></text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            scrollTop: 0,
            inputContent: '',
            userAvatar: '/static/images/default-avatar.png',
            chatList: [
                {
                    type: 'ai',
                    content: '你好！我是AI助手，有什么可以帮你的吗？',
                    time: '10:00'
                }
            ]
        }
    },
    methods: {
        // 发送消息
        sendMessage() {
            if (!this.inputContent.trim()) return
            
            // 添加用户消息
            this.chatList.push({
                type: 'user',
                content: this.inputContent,
                time: this.getCurrentTime()
            })
            
            // 清空输入框
            this.inputContent = ''
            
            // 滚动到底部
            this.$nextTick(() => {
                this.scrollToBottom()
            })
            
            // 模拟AI回复
            setTimeout(() => {
                this.chatList.push({
                    type: 'ai',
                    content: '我收到了你的消息，正在思考中...',
                    time: this.getCurrentTime()
                })
                this.scrollToBottom()
            }, 1000)
        },
        
        // 加载更多历史记录
        loadMoreHistory() {
            // TODO: 实现加载历史记录
        },
        
        // 滚动到底部
        scrollToBottom() {
            const query = uni.createSelectorQuery().in(this)
            query.select('.chat-list').boundingClientRect()
            query.exec(res => {
                this.scrollTop = res[0].height
            })
        },
        
        // 获取当前时间
        getCurrentTime() {
            const now = new Date()
            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        }
    }
}
</script>

<style lang="scss">
.container {
    min-height: 100vh;
    background-color: $background-color;
    display: flex;
    flex-direction: column;
}

.chat-list {
    flex: 1;
    padding: $spacing-base;
    
    .chat-item {
        display: flex;
        margin-bottom: $spacing-large;
        
        &.user {
            flex-direction: row-reverse;
            
            .content {
                margin-right: $spacing-base;
                margin-left: 0;
                
                .message {
                    background-color: $primary-color;
                    color: $background-color;
                }
            }
        }
        
        .avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: $border-radius-circle;
            overflow: hidden;
            
            image {
                width: 100%;
                height: 100%;
            }
        }
        
        .content {
            margin-left: $spacing-base;
            max-width: 70%;
            
            .message {
                padding: $spacing-base;
                background-color: $background-color-card;
                border-radius: $border-radius-base;
                font-size: $font-size-base;
                color: $text-color;
                word-break: break-all;
            }
            
            .time {
                font-size: $font-size-sm;
                color: $text-color-light;
                margin-top: $spacing-mini;
                text-align: center;
            }
        }
    }
}

.input-area {
    padding: $spacing-base;
    background-color: $background-color-card;
    display: flex;
    align-items: center;
    
    .input {
        flex: 1;
        height: 80rpx;
        background-color: $background-color;
        border-radius: $border-radius-base;
        padding: 0 $spacing-base;
        font-size: $font-size-base;
        color: $text-color;
    }
    
    .send-btn {
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: $spacing-base;
        
        .iconfont {
            font-size: 48rpx;
            color: $primary-color;
        }
    }
}
</style> 