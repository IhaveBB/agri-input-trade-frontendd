<template>
  <div class="region-sales-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">地域销售分析</h2>
        <p class="page-subtitle">全国各省份农资销售数据热力分布</p>
      </div>
      <div class="header-right">
        <el-button icon="el-icon-refresh" circle @click="refreshData" :loading="loading"></el-button>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="el-icon-money"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">总销售额</div>
          <div class="stat-value">¥{{ formatAmount(overview.totalSales) }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon covered">
          <i class="el-icon-map-location"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">覆盖省份</div>
          <div class="stat-value">{{ overview.coveredProvinces || 0 }}<span class="unit">个</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon top">
          <i class="el-icon-trophy"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">最热地区</div>
          <div class="stat-value">{{ overview.topRegion || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 省份销售排行 -->
      <div class="chart-panel">
        <div class="panel-header">
          <h3>省份销售排行</h3>
          <span class="panel-subtitle">TOP 15 销售省份</span>
        </div>
        <div class="panel-body">
          <div ref="provinceChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 大区分布 -->
      <div class="chart-panel">
        <div class="panel-header">
          <h3>大区销售分布</h3>
          <span class="panel-subtitle">各区域销售额占比</span>
        </div>
        <div class="panel-body">
          <div ref="regionChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="data-table-panel">
      <div class="panel-header">
        <h3>详细数据</h3>
      </div>
      <el-table :data="provinceData" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="provinceName" label="省份" width="120"></el-table-column>
        <el-table-column prop="salesAmount" label="销售额" width="150">
          <template slot-scope="scope">
            ¥{{ formatAmount(scope.row.salesAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="100"></el-table-column>
        <el-table-column prop="userCount" label="用户数" width="100"></el-table-column>
        <el-table-column label="热力值" width="200">
          <template slot-scope="scope">
            <div class="heat-bar">
              <div class="heat-fill" :style="{ width: scope.row.heatValue + '%' }"></div>
              <span class="heat-text">{{ scope.row.heatValue }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import Request from '@/utils/request'

export default {
  name: 'RegionSalesAnalysis',
  data() {
    return {
      loading: false,
      overview: {},
      provinceData: [],
      regionData: [],
      provinceChart: null,
      regionChart: null
    }
  },
  mounted() {
    this.initCharts()
    this.loadData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.disposeCharts()
  },
  methods: {
    initCharts() {
      this.provinceChart = echarts.init(this.$refs.provinceChartRef)
      this.regionChart = echarts.init(this.$refs.regionChartRef)
    },
    disposeCharts() {
      this.provinceChart && this.provinceChart.dispose()
      this.regionChart && this.regionChart.dispose()
    },
    handleResize() {
      this.provinceChart && this.provinceChart.resize()
      this.regionChart && this.regionChart.resize()
    },
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadOverview(),
          this.loadProvinceData(),
          this.loadRegionData()
        ])
        this.renderCharts()
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    refreshData() {
      this.loadData()
    },
    async loadOverview() {
      const res = await Request.get('/api/region-sales/overview')
      if (res.code === '0' && res.data) {
        this.overview = res.data
      }
    },
    async loadProvinceData() {
      const res = await Request.get('/api/region-sales/heatmap')
      if (res.code === '0' && res.data) {
        // 过滤有数据的省份并排序
        this.provinceData = res.data
          .filter(p => p.salesAmount > 0)
          .sort((a, b) => b.salesAmount - a.salesAmount)
      }
    },
    async loadRegionData() {
      const res = await Request.get('/api/region-sales/distribution')
      if (res.code === '0' && res.data) {
        this.regionData = res.data
      }
    },
    renderCharts() {
      this.renderProvinceChart()
      this.renderRegionChart()
    },
    renderProvinceChart() {
      if (!this.provinceChart || this.provinceData.length === 0) return

      // 取前15名
      const top15 = this.provinceData.slice(0, 15)
      const provinces = top15.map(p => p.provinceName)
      const sales = top15.map(p => parseFloat(p.salesAmount || 0))

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: '{b}<br/>销售额: ¥{c}'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: value => '¥' + (value / 10000).toFixed(0) + '万'
          }
        },
        yAxis: {
          type: 'category',
          data: provinces.reverse(),
          axisLabel: {
            fontSize: 12
          }
        },
        series: [{
          type: 'bar',
          data: sales.reverse(),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }]
      }

      this.provinceChart.setOption(option)
    },
    renderRegionChart() {
      if (!this.regionChart || this.regionData.length === 0) return

      const data = this.regionData.map(r => ({
        name: r.regionName,
        value: parseFloat(r.salesAmount || 0)
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>销售额: ¥{c}'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 'center'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: data
        }]
      }

      this.regionChart.setOption(option)
    },
    formatAmount(amount) {
      if (!amount) return '0.00'
      const num = parseFloat(amount)
      if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万'
      }
      return num.toFixed(2)
    }
  }
}
</script>

<style lang="scss" scoped>
.region-sales-page {
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

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #fff;

    &.total {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    &.covered {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.top {
      background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    }
  }

  .stat-label {
    font-size: 14px;
    color: #999;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;

    .unit {
      font-size: 14px;
      font-weight: normal;
      color: #999;
      margin-left: 4px;
    }
  }
}

.charts-container {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-panel,
.data-table-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .panel-subtitle {
    font-size: 13px;
    color: #999;
  }
}

.panel-body {
  padding: 20px;
}

.chart {
  width: 100%;
  height: 400px;
}

.data-table-panel {
  .panel-header {
    h3 {
      font-size: 16px;
    }
  }
}

.heat-bar {
  display: flex;
  align-items: center;
  gap: 10px;

  .heat-fill {
    height: 8px;
    background: linear-gradient(90deg, #11998e, #38ef7d);
    border-radius: 4px;
    transition: width 0.3s;
  }

  .heat-text {
    font-size: 12px;
    color: #666;
    min-width: 40px;
  }
}

@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>
