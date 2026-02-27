<template>
  <div class="stat-card" :class="[`stat-card--${type}`]">
    <div class="stat-card__header">
      <div class="stat-card__icon" :style="{ background: iconBgColor }">
        <i :class="icon"></i>
      </div>
      <div class="stat-card__trend" v-if="showTrend" :class="trendClass">
        <i :class="trendIcon"></i>
        <span>{{ Math.abs(trend) }}%</span>
      </div>
    </div>
    <div class="stat-card__body">
      <div class="stat-card__title">{{ title }}</div>
      <div class="stat-card__value">
        <span class="value-number">{{ displayValue }}</span>
        <span class="value-unit" v-if="unit">{{ unit }}</span>
      </div>
    </div>
    <div class="stat-card__footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    trend: {
      type: Number,
      default: 0
    },
    icon: {
      type: String,
      default: 'el-icon-data-analysis'
    },
    type: {
      type: String,
      default: 'default' // default, success, warning, danger, info
    },
    showTrend: {
      type: Boolean,
      default: true
    },
    prefix: {
      type: String,
      default: ''
    },
    suffix: {
      type: String,
      default: ''
    },
    decimals: {
      type: Number,
      default: 0
    }
  },
  computed: {
    displayValue() {
      let val = this.value
      if (typeof val === 'number') {
        // 如果是小数且指定了小数位数
        if (this.decimals > 0) {
          val = val.toFixed(this.decimals)
        } else {
          // 整数格式化千分位
          val = val.toLocaleString('zh-CN')
        }
      }
      return `${this.prefix}${val}${this.suffix}`
    },
    trendClass() {
      if (this.trend > 0) return 'trend-up'
      if (this.trend < 0) return 'trend-down'
      return 'trend-neutral'
    },
    trendIcon() {
      if (this.trend > 0) return 'el-icon-top'
      if (this.trend < 0) return 'el-icon-bottom'
      return ''
    },
    iconBgColor() {
      const colors = {
        default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        danger: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        green: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        orange: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        teal: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
      return colors[this.type] || colors.default
    }
  }
}
</script>

<style lang="scss" scoped>
.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

  &:hover {
    box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 4px;

    &.trend-up {
      color: #67c23a;
      background: rgba(103, 194, 58, 0.1);
    }

    &.trend-down {
      color: #f56c6c;
      background: rgba(245, 108, 108, 0.1);
    }

    &.trend-neutral {
      color: #909399;
      background: rgba(144, 147, 152, 0.1);
    }
  }

  &__body {
    .stat-card__title {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .stat-card__value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: baseline;
      gap: 4px;

      .value-number {
        font-family: 'DIN Alternate', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      }

      .value-unit {
        font-size: 14px;
        color: #909399;
        font-weight: normal;
      }
    }
  }

  &__footer {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    font-size: 12px;
    color: #909399;
  }
}
</style>
