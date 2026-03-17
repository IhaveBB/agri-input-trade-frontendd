<template>
  <div class="stock-warning">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">库存预警</h2>
        <p class="page-subtitle">
          <span v-if="isAdmin">管理员视图 - 查看全平台库存预警</span>
          <span v-else-if="isMerchant">商户视图 - 查看您的商品库存状态</span>
          <span v-else>数据更新时间: {{ lastUpdateTime }}</span>
        </p>
      </div>
      <div class="header-right">
        <el-button icon="el-icon-refresh" circle @click="refreshData" :loading="loading"></el-button>
      </div>
    </div>

    <!-- 预警概览卡片 -->
    <div class="stat-cards">
      <div class="stat-card stat-card--danger">
        <div class="stat-card__icon">
          <i class="el-icon-warning-outline"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">已缺货</div>
          <div class="stat-card__value">
            <count-to :start-val="0" :end-val="overview.outOfStockCount" :duration="1500" />
          </div>
          <div class="stat-card__trend trend-danger">
            <i class="el-icon-warning"></i>
            需立即补货
          </div>
        </div>
      </div>

      <div class="stat-card stat-card--warning">
        <div class="stat-card__icon">
          <i class="el-icon-warning"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">库存不足</div>
          <div class="stat-card__value">
            <count-to :start-val="0" :end-val="overview.lowStockCount" :duration="1500" />
          </div>
          <div class="stat-card__trend trend-warning">
            <i class="el-icon-bell"></i>
            建议补货
          </div>
        </div>
      </div>

      <div class="stat-card stat-card--success">
        <div class="stat-card__icon">
          <i class="el-icon-success"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">库存正常</div>
          <div class="stat-card__value">
            <count-to :start-val="0" :end-val="overview.safeStockCount" :duration="1500" />
          </div>
          <div class="stat-card__trend trend-success">
            <i class="el-icon-check"></i>
            无需操作
          </div>
        </div>
      </div>

      <div class="stat-card stat-card--info">
        <div class="stat-card__icon">
          <i class="el-icon-s-goods"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">商品总数</div>
          <div class="stat-card__value">
            <count-to :start-val="0" :end-val="overview.totalProducts" :duration="1500" />
          </div>
          <div class="stat-card__trend trend-neutral">
            <i class="el-icon-s-data"></i>
            全部商品
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 库存状态分布饼图 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">库存状态分布</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="pieChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 缺货商品TOP10 -->
      <div class="chart-panel chart-panel--large">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">库存预警商品 TOP10</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="barChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 预警商品列表 -->
    <div class="chart-panel chart-panel--full">
      <div class="chart-panel__header">
        <h3 class="chart-panel__title">预警商品明细</h3>
        <div class="chart-panel__filters">
          <el-radio-group v-model="filterType" size="small" @change="handleFilterChange">
            <el-radio-button label="ALL">全部</el-radio-button>
            <el-radio-button label="OUT_OF_STOCK">已缺货</el-radio-button>
            <el-radio-button label="LOW_STOCK">库存不足</el-radio-button>
            <el-radio-button label="HIGH_STOCK">库存积压</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="chart-panel__body">
        <el-table :data="filteredWarnings" stripe style="width: 100%" v-loading="loading">
          <el-table-column prop="productId" label="商品ID" width="80" />
          <el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="currentStock" label="当前库存" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="getStockTagType(scope.row.warningType)" size="small">
                {{ scope.row.currentStock }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="warningType" label="预警类型" width="120" align="center">
            <template slot-scope="scope">
              <el-tag :type="getWarningTypeTag(scope.row.warningType)" effect="dark" size="small">
                {{ getWarningTypeLabel(scope.row.warningType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="warningMessage" label="预警说明" min-width="200" show-overflow-tooltip />
          <el-table-column prop="suggestion" label="建议操作" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="120" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="viewProduct(scope.row.productId)">
                查看商品
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="filteredWarnings.length === 0" class="empty-data">
          <i class="el-icon-success" style="font-size: 48px; color: #67c23a;"></i>
          <p>暂无库存预警，所有商品库存正常！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import * as echarts from 'echarts'
import {
  getStockOverview,
  getAllStockWarnings,
  getMerchantStockWarnings
} from '@/api/stockWarning'

export default {
  name: 'StockWarning',
  components: {
    CountTo
  },
  data() {
    return {
      loading: false,
      lastUpdateTime: '',
      isAdmin: false,
      isMerchant: false,
      filterType: 'ALL',
      overview: {
        totalProducts: 0,
        outOfStockCount: 0,
        lowStockCount: 0,
        highStockCount: 0,
        safeStockCount: 0
      },
      warnings: [],
      pieChart: null,
      barChart: null
    }
  },
  computed: {
    filteredWarnings() {
      if (this.filterType === 'ALL') {
        return this.warnings
      }
      return this.warnings.filter(item => item.warningType === this.filterType)
    }
  },
  mounted() {
    this.checkUserRole()
    this.initCharts()
    this.loadData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    this.disposeCharts()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 检查用户角色
    checkUserRole() {
      const userStr = localStorage.getItem('backUser')
      if (userStr) {
        const user = JSON.parse(userStr)
        this.isAdmin = user.role === 'ADMIN'
        this.isMerchant = user.role === 'MERCHANT'
      }
    },
    // 初始化图表
    initCharts() {
      this.pieChart = echarts.init(this.$refs.pieChartRef)
      this.barChart = echarts.init(this.$refs.barChartRef)
    },
    // 销毁图表
    disposeCharts() {
      this.pieChart && this.pieChart.dispose()
      this.barChart && this.barChart.dispose()
    },
    // 响应式
    handleResize() {
      this.pieChart && this.pieChart.resize()
      this.barChart && this.barChart.resize()
    },
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchOverview(),
          this.fetchWarnings()
        ])
        this.updateTime()
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
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
    // 获取概览数据
    async fetchOverview() {
      const res = await getStockOverview()
      if (res.code === '0' && res.data) {
        this.overview = res.data
        this.renderPieChart()
      }
    },
    // 获取预警列表
    async fetchWarnings() {
      let res
      if (this.isAdmin) {
        res = await getAllStockWarnings()
      } else {
        res = await getMerchantStockWarnings()
      }
      if (res.code === '0' && res.data) {
        this.warnings = res.data
        this.renderBarChart()
      }
    },
    // 渲染饼图
    renderPieChart() {
      if (!this.pieChart) return

      const data = [
        { name: '已缺货', value: this.overview.outOfStockCount, type: 'danger' },
        { name: '库存不足', value: this.overview.lowStockCount, type: 'warning' },
        { name: '库存积压', value: this.overview.highStockCount, type: 'info' },
        { name: '库存正常', value: this.overview.safeStockCount, type: 'success' }
      ].filter(item => item.value > 0)

      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          textStyle: { color: '#606266' },
          formatter: (params) => {
            return `${params.name}<br/>数量: ${params.value} (${params.percent}%)`
          }
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
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#303133' },
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' }
          },
          labelLine: { show: false },
          data: data.length > 0 ? data : [{ name: '暂无数据', value: 0 }]
        }],
        color: ['#f56c6c', '#e6a23c', '#409eff', '#67c23a']
      }

      this.pieChart.setOption(option)
    },
    // 渲染柱状图
    renderBarChart() {
      if (!this.barChart) return

      // 只显示库存最少的10个商品
      const sortedData = [...this.warnings]
        .sort((a, b) => a.currentStock - b.currentStock)
        .slice(0, 10)

      if (sortedData.length === 0) {
        this.barChart.clear()
        return
      }

      const names = sortedData.map(item => item.productName || '未知').reverse()
      const stocks = sortedData.map(item => item.currentStock || 0).reverse()

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          textStyle: { color: '#606266' },
          formatter: (params) => {
            const item = params[0]
            const idx = sortedData.length - 1 - item.dataIndex
            const product = sortedData[idx]
            if (!product) return ''
            return `${product.productName}<br/>当前库存: ${product.currentStock}<br/>预警类型: ${this.getWarningTypeLabel(product.warningType)}`
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
          axisLabel: { color: '#606266', fontSize: 12 }
        },
        series: [{
          type: 'bar',
          data: stocks.map((val, idx) => {
            const item = sortedData[sortedData.length - 1 - idx]
            let color = '#67c23a'
            if (item.warningType === 'OUT_OF_STOCK') color = '#f56c6c'
            else if (item.warningType === 'LOW_STOCK') color = '#e6a23c'
            else if (item.warningType === 'HIGH_STOCK') color = '#409eff'
            return {
              value: val,
              itemStyle: { color }
            }
          }),
          barWidth: '50%',
          itemStyle: {
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: '#909399',
            formatter: '{c}'
          }
        }]
      }

      this.barChart.setOption(option)
    },
    // 筛选变化
    handleFilterChange() {
      // 筛选数据已自动通过computed属性更新
    },
    // 获取库存标签类型
    getStockTagType(warningType) {
      switch (warningType) {
        case 'OUT_OF_STOCK': return 'danger'
        case 'LOW_STOCK': return 'warning'
        case 'HIGH_STOCK': return 'info'
        default: return 'success'
      }
    },
    // 获取预警类型标签
    getWarningTypeTag(warningType) {
      switch (warningType) {
        case 'OUT_OF_STOCK': return 'danger'
        case 'LOW_STOCK': return 'warning'
        case 'HIGH_STOCK': return 'info'
        default: return 'success'
      }
    },
    // 获取预警类型标签文字
    getWarningTypeLabel(warningType) {
      switch (warningType) {
        case 'OUT_OF_STOCK': return '已缺货'
        case 'LOW_STOCK': return '库存不足'
        case 'HIGH_STOCK': return '库存积压'
        case 'SAFE': return '库存正常'
        default: return '未知'
      }
    },
    // 查看商品
    viewProduct(productId) {
      this.$router.push(`/product/${productId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.stock-warning {
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
  }

  &--danger &__icon {
    background: linear-gradient(135deg, #f56c6c 0%, #ff8c8c 100%);
  }

  &--warning &__icon {
    background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%);
  }

  &--success &__icon {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  }

  &--info &__icon {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
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
  }

  &__trend {
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;

    &.trend-danger {
      color: #f56c6c;
    }

    &.trend-warning {
      color: #e6a23c;
    }

    &.trend-success {
      color: #67c23a;
    }

    &.trend-neutral {
      color: #909399;
    }
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
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

  &__filters {
    display: flex;
    gap: 12px;
  }

  &__body {
    padding: 20px;

    .chart {
      width: 100%;
      height: 350px;
    }
  }
}

.empty-data {
  text-align: center;
  padding: 60px 20px;
  color: #909399;

  p {
    margin-top: 16px;
    font-size: 14px;
  }
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
