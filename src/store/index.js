import Vue from 'vue'
import Vuex from 'vuex'
import userModule from './modules/user'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        appReady: false,
        cloud: {
            enabled: false,
            status: 'unknown' // unknown, connected, failed
        }
    },
    mutations: {
        setCloudStatus(state, { enabled, status }) {
            state.cloud.enabled = enabled;
            state.cloud.status = status;
            
            // 同步到全局
            const app = getApp();
            if (app && app.globalData) {
                app.globalData.cloudConnected = enabled;
            }
        },
        setAppReady(state, value) {
            state.appReady = value;
        }
    },
    actions: {
        // 初始化应用
        initApp({ commit, dispatch }) {
            commit('setAppReady', true);
            return dispatch('checkCloudStatus');
        },
        
        // 检查云服务状态
        async checkCloudStatus({ commit }) {
            try {
                if (typeof uniCloud !== 'undefined') {
                    console.log('检测到uniCloud，开始测试连接');
                    
                    try {
                        // 测试云函数连接
                        const testResult = await uniCloud.callFunction({
                            name: 'login',
                            data: {
                                action: 'ping'
                            }
                        });
                        
                        console.log('云服务测试结果:', testResult);
                        
                        if (testResult.result && testResult.result.code === 0) {
                            console.log('云服务连接成功');
                            commit('setCloudStatus', { enabled: true, status: 'connected' });
                            return true;
                        } else {
                            console.warn('云服务连接失败:', testResult);
                            commit('setCloudStatus', { enabled: false, status: 'failed' });
                            return false;
                        }
                    } catch (e) {
                        console.error('云服务连接测试失败:', e);
                        commit('setCloudStatus', { enabled: false, status: 'failed' });
                    }
                } else {
                    console.log('未检测到uniCloud');
                    commit('setCloudStatus', { enabled: false, status: 'failed' });
                }
            } catch (error) {
                console.error('云服务状态检查失败:', error);
                commit('setCloudStatus', { enabled: false, status: 'failed' });
            }
            
            return false;
        }
    },
    getters: {
        // 应用是否准备就绪
        isAppReady: state => state.appReady,
        
        // 云服务状态
        cloudStatus: state => state.cloud
    },
    // 注册模块
    modules: {
        user: userModule
    },
    strict: process.env.NODE_ENV !== 'production'
}) 