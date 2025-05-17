/* 搜索框 通用组件
*  @author: TONG
*  @date: 2025-04-29
*/

<template>
    <view class="search-box">
      <image
        class="search-icon"
        src="https://mp-aab956eb-2e97-4b81-823e-69195b354e49.cdn.bspapp.com/home/搜索框.png"
        mode="aspectFit"
      />
      <input
        class="search-input"
        type="text"
        v-model="searchValue"
        :placeholder="placeholder"
        placeholder-class="search-placeholder"
        @input="onInput"
        @confirm="onSearch"
      />
    </view>
  </template>
  
  <script>
  export default {
    name: "SearchBox",
    props: {
      placeholder: {
        type: String,
        default: "请搜索您所需要的智能体"
      }
    },
    data() {
      return {
        searchValue: ""
      };
    },
    methods: {
      onInput(e) {
        this.$emit("input", e.detail.value);
      },
      onSearch(e) {
        this.$emit("search", e.detail.value);
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .search-box {
    display: flex;
    align-items: center;
    background: #e6f3fa;
    border-radius: 40rpx;
    padding: 0 24rpx;
    height: 70rpx;
    margin: 10rpx;
  }
  .search-icon {
    width: 36rpx;
    height: 36rpx;
    margin-right: 16rpx;
    opacity: 0.5;
  }
  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 28rpx;
    color: #666;
    outline: none;
  }
  .search-placeholder {
    color: #bfc5c9;
    font-size: 28rpx;
  }
  </style>