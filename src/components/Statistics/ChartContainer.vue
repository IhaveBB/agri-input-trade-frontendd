<template>
  <div class="chart-container">
    <div class="chart-header" v-if="title || $slots.actions">
      <div class="chart-title">
        <h3>{{ title }}</h3>
        <span class="chart-subtitle" v-if="subtitle">{{ subtitle }}</span>
      </div>
      <div class="chart-actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="chart-body" :class="{ 'no-padding': noPadding }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartContainer',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: '400px'
    }
  }
}
</script>

<style lang="scss" scoped>
.chart-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  overflow: hidden;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    .chart-title {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .chart-subtitle {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
        display: block;
      }
    }

    .chart-actions {
      display: flex;
      gap: 8px;
    }
  }

  .chart-body {
    padding: 20px;

    &.no-padding {
      padding: 0;
    }
  }
}
</style>
