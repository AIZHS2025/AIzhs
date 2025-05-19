/* 官方资讯
*/
<template>
    <view class="main-container" style="color: white">
    <!-- 引入 顶部导航栏 -->
    <navigation-bars
        color="black"
        title="官方资讯"
        viscosity="true"
        @pack="packClick"
        :backgroundColor="color"
        :image="image"  />

    <!-- 以下为内容 -->
    <ai-text ref="aiText" :information="detail"></ai-text>
    </view>
</template>

<script>
import NavigationBars from '@/components/navigation-bars/index.vue'
import aiText from './ai-text.vue'
import {plantInformation } from '@/service/index.js'


export default {
    components: {
        NavigationBars,
        aiText
    },
    data(){
        return{
            parentId: '',  //首页知识星球列表 父级id
            id: '',  //资讯id
            type: '',
            color:'',
            image:'https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/返回.png',
            plantInformation:{
                title: '',
                tag: '',
                view: '',
                date: '',
                img: '',
                content: ''
            },
            detail:{}
        }
    },
    onPageScroll(e) {
    this.scrollTop = e.scrollTop;
    this.color = e.scrollTop > 20 ? "white" : "transparent";
  },
    onLoad(options) {

        // this.parentId = options.parentId;
        // this.type = options.type;
        this.postPlantInformation(options.id);
    },
    methods: {
    /**返回 */
    packClick() {
      uni.navigateBack({
        delta: 1,
      });
      this.$emit("pack");
    },
    /**查询资讯详情 */
    postPlantInformation(id) {
        // 传递父级ID到plantInformation接口
        plantInformation(id)
        .then(res => {
            console.log(res);
            if(res.data){
                if(res.data){
                    this.detail=res.data[0]
                }
            }

        })
        .catch(err => {
            console.log(err);
        })
    }
  },

    
}
</script>

<style scoped>
.main-container {
    min-height: 100vh;
    padding-bottom: 40rpx;
    background-image: url("https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/tabbar/ai_agent/12071746256773_.pic.jpg");
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;

}
</style>