<template>
  <button
    class="base-button"
    :class="[
      type ? `base-button--${type}` : '',
      size ? `base-button--${size}` : '',
      { 'base-button--plain': plain },
      { 'base-button--round': round },
      { 'base-button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: value => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['large', 'medium', 'small', 'mini'].includes(value)
    },
    plain: {
      type: Boolean,
      default: false
    },
    round: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(event) {
      if (this.disabled) return
      this.$emit('click', event)
    }
  }
}
</script>

<style lang="scss" scoped>
.base-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: .1s;
  font-weight: 500;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;

  &:hover,
  &:focus {
    color: #409eff;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
  }

  &:active {
    color: #3a8ee6;
    border-color: #3a8ee6;
    outline: none;
  }

  &--primary {
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;

    &:hover,
    &:focus {
      background: #66b1ff;
      border-color: #66b1ff;
      color: #fff;
    }

    &:active {
      background: #3a8ee6;
      border-color: #3a8ee6;
    }
  }

  &--success {
    color: #fff;
    background-color: #67c23a;
    border-color: #67c23a;

    &:hover,
    &:focus {
      background: #85ce61;
      border-color: #85ce61;
      color: #fff;
    }

    &:active {
      background: #5daf34;
      border-color: #5daf34;
    }
  }

  &--warning {
    color: #fff;
    background-color: #e6a23c;
    border-color: #e6a23c;

    &:hover,
    &:focus {
      background: #ebb563;
      border-color: #ebb563;
      color: #fff;
    }

    &:active {
      background: #cf9236;
      border-color: #cf9236;
    }
  }

  &--danger {
    color: #fff;
    background-color: #f56c6c;
    border-color: #f56c6c;

    &:hover,
    &:focus {
      background: #f78989;
      border-color: #f78989;
      color: #fff;
    }

    &:active {
      background: #dd6161;
      border-color: #dd6161;
    }
  }

  &--plain {
    background: #fff;
    border: 1px solid #409eff;
    color: #409eff;

    &:hover,
    &:focus {
      background: #fff;
      border-color: #66b1ff;
      color: #66b1ff;
    }

    &:active {
      background: #fff;
      border-color: #3a8ee6;
      color: #3a8ee6;
    }
  }

  &--round {
    border-radius: 20px;
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--large {
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
  }

  &--medium {
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 4px;
  }

  &--small {
    padding: 8px 12px;
    font-size: 12px;
    border-radius: 4px;
  }

  &--mini {
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 4px;
  }
}
</style> 