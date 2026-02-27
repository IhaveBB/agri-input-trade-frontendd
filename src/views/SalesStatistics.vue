<template>
  <div class="sales-statistics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">销售统计</h2>
        <p class="page-subtitle">数据更新时间: {{ lastUpdateTime }}</p>
      </div>
      <div class="header-right">
        <el-button icon="el-icon-refresh" circle @click="refreshData" :loading="loading"></el-button>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--orders">
          <i class="el-icon-s-order"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">本月订单</div>
          <div class="stat-card__value">
            <count-to :start-val="0" :end-val="orderData.count" :duration="1500" />
          </div>
          <div class="stat-card__trend" :class="orderData.growth >= 0 ? 'trend-up' : 'trend-down'">
            <i :class="orderData.growth >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
            {{ Math.abs(orderData.growth) }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--sales">
          <i class="el-icon-s-goods"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">本月销售额</div>
          <div class="stat-card__value">
            ¥<count-to :start-val="0" :end-val="salesData.amount" :duration="1500" :decimals="2" />
          </div>
          <div class="stat-card__trend" :class="salesData.growth >= 0 ? 'trend-up' : 'trend-down'">
            <i :class="salesData.growth >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
            {{ Math.abs(salesData.growth) }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--products">
          <i class="el-icon-s-marketing"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">热销商品</div>
          <div class="stat-card__value">
            <count-to :start-val="0" :end-val="topProductsData.length" :duration="1500" />
            <span class="stat-card__unit">种</span>
          </div>
          <div class="stat-card__trend trend-neutral">
            <i class="el-icon-minus"></i>
            统计中
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--users">
          <i class="el-icon-s-custom"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">平台用户</div>
          <div class="stat-card__value">
            <count-to :start-val="0" :end-val="userData.total" :duration="1500" />
          </div>
          <div class="stat-card__trend" :class="userData.growth >= 0 ? 'trend-up' : 'trend-down'">
            <i :class="userData.growth >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
            {{ Math.abs(userData.growth) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 销售趋势图 -->
      <div class="chart-panel chart-panel--large">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">销售趋势</h3>
          <div class="chart-panel__tabs">
            <span
              v-for="item in trendTabs"
              :key="item.value"
              class="chart-panel__tab"
              :class="{ active: activeTrendTab === item.value }"
              @click="activeTrendTab = item.value"
            >
              {{ item.label }}
            </span>
          </div>
        </div>
        <div class="chart-panel__body">
          <div ref="trendChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 品类占比饼图 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">品类销售占比</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="categoryChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 热销商品 -->
    <div class="chart-panel chart-panel--full">
      <div class="chart-panel__header">
        <h3 class="chart-panel__title">热销商品 TOP5</h3>
      </div>
      <div class="chart-panel__body">
        <div ref="topProductsChartRef" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from 'element-ui'
import CountTo from 'vue-count-to'
import * as echarts from 'echarts'
import {
  getMonthlyOrderStatistics,
  getMonthlySalesStatistics,
  getYearlyUserStatistics,
  getTopSellingProducts,
  getCategorySalesStatistics
} from '@/api/statistics'

export default {
  name: 'SalesStatistics',
  components: {
    [Button.name]: Button,
    CountTo
  },
  data() {
    return {
      loading: false,
      lastUpdateTime: '',
      activeTrendTab: 12,
      trendTabs: [
        { label: '近7天', value: 7 },
        { label: '近30天', value: 30 },
        { label: '近12月', value: 12 }
      ],
      // 数据
      orderData: { count: 0, growth: 0 },
      salesData: { amount: 0, growth: 0 },
      userData: { total: 0, growth: 0 },
      topProductsData: [],
      categoryData: [],
      // 图表实例
      trendChart: null,
      categoryChart: null,
      topProductsChart: null,
      // 图表配置
      chartColors: [
        '#11998e', '#38ef7d', '#43e97b', '#38f9d7',
        '#20c997', '#12b886', '#0ca678', '#099268'
      ]
    }
  },
  mounted() {
    this.initCharts()
    this.loadData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    this.disposeCharts()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 初始化图表
    initCharts() {
      this.trendChart = echarts.init(this.$refs.trendChartRef)
      this.categoryChart = echarts.init(this.$refs.categoryChartRef)
      this.topProductsChart = echarts.init(this.$refs.topProductsChartRef)
    },
    // 销毁图表
    disposeCharts() {
      this.trendChart && this.trendChart.dispose()
      this.categoryChart && this.categoryChart.dispose()
      this.topProductsChart && this.topProductsChart.dispose()
    },
    // 响应式
    handleResize() {
      this.trendChart && this.trendChart.resize()
      this.categoryChart && this.categoryChart.resize()
      this.topProductsChart && this.topProductsChart.resize()
    },
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchOrderData(),
          this.fetchSalesData(),
          this.fetchUserData(),
          this.fetchTopProducts(),
          this.fetchCategoryData()
        ])
        this.updateTime()
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    // 刷新数据
    refreshData() {
      this.loadData()
    },
    // 更新时间
    updateTime() {
      const now = new Date()
      this.lastUpdateTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    // 获取订单数据
    async fetchOrderData() {
      const res = await getMonthlyOrderStatistics()
      if (res.code === '0' && res.data) {
        this.orderData = {
          count: res.data.currentMonthOrders || 0,
          growth: parseFloat(res.data.growthRate) || 0
        }
      }
    },
    // 获取销售数据
    async fetchSalesData() {
      const res = await getMonthlySalesStatistics()
      if (res.code === '0' && res.data) {
        this.salesData = {
          amount: res.data.currentMonthSales || 0,
          growth: parseFloat(res.data.growthRate) || 0
        }
      }
    },
    // 获取用户数据
    async fetchUserData() {
      const res = await getYearlyUserStatistics()
      if (res.code === '0' && res.data) {
        this.userData = {
          total: res.data.currentYearUsers || 0,
          growth: parseFloat(res.data.growthRate) || 0
        }
      }
    },
    // 获取热销商品
    async fetchTopProducts() {
      const res = await getTopSellingProducts()
      if (res.code === '0' && res.data) {
        this.topProductsData = res.data || []
        this.renderTopProductsChart()
      }
    },
    // 获取品类数据
    async fetchCategoryData() {
      const res = await getCategorySalesStatistics()
      if (res.code === '0' && res.data) {
        this.categoryData = res.data || []
        this.renderCategoryChart()
        this.renderTrendChart()
      }
    },
    // 渲染销售趋势图
    renderTrendChart() {
      if (!this.trendChart) return

      // 模拟数据（实际应从后端获取）
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const data = this.categoryData.length > 0
        ? this.categoryData.map((item, index) => item.salesAmount || Math.random() * 100000)
        : Array.from({ length: 12 }, () => Math.random() * 100000 + 50000)

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          borderWidth: 1,
          textStyle: {
            color: '#606266'
          },
          formatter: (params) => {
            const item = params[0]
            return `${item.name}<br/>销售额: ¥${item.value.toLocaleString()}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months,
          axisLine: { lineStyle: { color: '#e5e5e5' } },
          axisLabel: { color: '#909399' }
        },
        yAxis: {
          type: 'value',
          name: '销售额(元)',
          nameTextStyle: { color: '#909399' },
          axisLine: { show: false },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        series: [{
          data: data,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#11998e',
            width: 3
          },
          itemStyle: {
            color: '#11998e',
            borderColor: '#fff',
            borderWidth: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(17, 153, 142, 0.3)' },
              { offset: 1, color: 'rgba(17, 153, 142, 0.02)' }
            ])
          }
        }]
      }

      this.trendChart.setOption(option)
    },
    // 渲染品类饼图
    renderCategoryChart() {
      if (!this.categoryChart) return

      const data = this.categoryData.map((item, index) => ({
        name: item.categoryName || `品类${index + 1}`,
        value: item.salesAmount || item.salesCount || 0
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          textStyle: { color: '#606266' },
          formatter: '{b}: ¥{c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: { color: '#606266' }
        },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#303133'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          labelLine: {
            show: false
          },
          data: data.length > 0 ? data : [
            { name: '农药', value: 350000 },
            { name: '化肥', value: 280000 },
            { name: '种子', value: 180000 },
            { name: '农具', value: 120000 },
            { name: '其他', value: 70000 }
          ]
        }],
        color: this.chartColors
      }

      this.categoryChart.setOption(option)
    },
    // 渲染热销商品图
    renderTopProductsChart() {
      if (!this.topProductsChart) return

      const data = this.topProductsData.length > 0
        ? this.topProductsData
        : [
            { name: '敌敌畏', salesCount: 1234, salesAmount: 56780 },
            { name: '尿素', salesCount: 987, salesAmount: 45670 },
            { name: '草甘膦', salesCount: 856, salesAmount: 34560 },
            { name: '复合肥', salesCount: 765, salesAmount: 32450 },
            { name: '喷雾器', salesCount: 654, salesAmount: 28760 }
          ]

      const names = data.map(item => item.name).reverse()
      const counts = data.map(item => item.salesCount || 0).reverse()

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          textStyle: { color: '#606266' },
          formatter: (params) => {
            const item = params[0]
            const idx = data.length - 1 - item.dataIndex
            const product = data[idx]
            return `${product.name}<br/>销量: ${product.salesCount} 件<br/>销售额: ¥${(product.salesAmount || 0).toLocaleString()}`
          }
        },
        grid: {
          left: '3%',
          right: '10%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        yAxis: {
          type: 'category',
          data: names,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#606266', fontSize: 13 }
        },
        series: [{
          type: 'bar',
          data: counts,
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#11998e' },
              { offset: 1, color: '#38ef7d' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: '#909399',
            formatter: '{c} 件'
          }
        }]
      }

      this.topProductsChart.setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
.sales-statistics {
  padding: 24px;
  background: #f7f8fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .page-subtitle {
      margin: 0;
      font-size: 13px;
      color: #999;
    }
  }
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  &__icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #fff;
    flex-shrink: 0;

    &--orders {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    &--sales {
      background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    }
    &--products {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    &--users {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    font-family: 'DIN Alternate', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    margin-bottom: 8px;
    display: flex;
    align-items: baseline;

    .stat-card__unit {
      font-size: 14px;
      font-weight: normal;
      color: #999;
      margin-left: 4px;
    }
  }

  &__trend {
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;

    &.trend-up {
      color: #67c23a;
    }
    &.trend-down {
      color: #f56c6c;
    }
    &.trend-neutral {
      color: #999;
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  &--large {
    grid-column: span 1;
  }

  &--full {
    width: 100%;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  &__tabs {
    display: flex;
    gap: 16px;
  }

  &__tab {
    font-size: 13px;
    color: #999;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: #11998e;
    }

    &.active {
      color: #11998e;
      background: rgba(17, 153, 142, 0.1);
      font-weight: 500;
    }
  }

  &__body {
    padding: 20px;

    .chart {
      width: 100%;
      height: 350px;
    }
  }
}

.chart-panel--full .chart-panel__body .chart {
  height: 300px;
}

@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style>
