<template>
  <div ref="chartRef" class="base-chart" :style="{ height: height, width: width }"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'BaseChart',
  props: {
    options: {
      type: Object,
      required: true
    },
    height: {
      type: String,
      default: '400px'
    },
    width: {
      type: String,
      default: '100%'
    },
    theme: {
      type: String,
      default: 'light'
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    options: {
      handler(newOptions) {
        if (this.chart) {
          this.chart.setOption(newOptions, true)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    this.disposeChart()
  },
  methods: {
    initChart() {
      if (!this.$refs.chartRef) return

      this.chart = echarts.init(this.$refs.chartRef, this.theme)
      this.chart.setOption(this.options)

      if (this.autoResize) {
        window.addEventListener('resize', this.handleResize)
      }
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    disposeChart() {
      if (this.autoResize) {
        window.removeEventListener('resize', this.handleResize)
      }
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
    },
    getChart() {
      return this.chart
    }
  }
}
</script>

<style lang="scss" scoped>
.base-chart {
  min-height: 200px;
}
</style>
