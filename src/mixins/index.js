// 页面生命周期混入
export const pageMixin = {
    data() {
        return {
            loading: false,
            refreshing: false,
            finished: false,
            page: 1,
            pageSize: 10,
            total: 0,
            list: []
        }
    },
    methods: {
        // 加载数据
        async loadData() {
            if (this.loading || this.finished) return
            this.loading = true
            try {
                const res = await this.fetchData()
                this.list = [...this.list, ...res.list]
                this.total = res.total
                this.page++
                if (this.list.length >= this.total) {
                    this.finished = true
                }
            } catch (error) {
                console.error('加载数据失败:', error)
            } finally {
                this.loading = false
            }
        },
        
        // 刷新数据
        async refresh() {
            this.refreshing = true
            this.page = 1
            this.finished = false
            this.list = []
            await this.loadData()
            this.refreshing = false
        },
        
        // 重置数据
        reset() {
            this.page = 1
            this.finished = false
            this.list = []
        }
    }
}

// 表单验证混入
export const formMixin = {
    data() {
        return {
            form: {},
            rules: {},
            errors: {}
        }
    },
    methods: {
        // 验证表单
        validate() {
            this.errors = {}
            let valid = true
            
            for (const field in this.rules) {
                const value = this.form[field]
                const rules = this.rules[field]
                
                for (const rule of rules) {
                    if (rule.required && !value) {
                        this.errors[field] = rule.message
                        valid = false
                        break
                    }
                    
                    if (rule.pattern && !rule.pattern.test(value)) {
                        this.errors[field] = rule.message
                        valid = false
                        break
                    }
                }
            }
            
            return valid
        },
        
        // 重置表单
        resetForm() {
            this.form = {}
            this.errors = {}
        }
    }
}

// 用户信息混入
export const userMixin = {
    data() {
        return {
            userInfo: null,
            isLogin: false
        }
    },
    methods: {
        // 获取用户信息
        async getUserInfo() {
            try {
                const res = await uni.getStorageSync('userInfo')
                if (res) {
                    this.userInfo = res
                    this.isLogin = true
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
            }
        },
        
        // 更新用户信息
        async updateUserInfo(info) {
            try {
                await uni.setStorageSync('userInfo', info)
                this.userInfo = info
            } catch (error) {
                console.error('更新用户信息失败:', error)
            }
        },
        
        // 退出登录
        async logout() {
            try {
                await uni.removeStorageSync('userInfo')
                this.userInfo = null
                this.isLogin = false
            } catch (error) {
                console.error('退出登录失败:', error)
            }
        }
    }
} 