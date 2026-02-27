<template>
  <div class="sales-statistics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">销售统计</h2>
        <p class="page-subtitle">
          <span v-if="isAdmin && merchantList.length > 0">
            当前查看:
            <el-select v-model="selectedMerchantId" placeholder="请选择店铺" size="mini" style="width: 150px; margin-left: 8px;" @change="handleMerchantChange">
              <el-option label="全部店铺" :value="null" />
              <el-option v-for="m in merchantList" :key="m.id" :label="m.name || m.username" :value="m.id" />
            </el-select>
          </span>
          <span v-else>数据更新时间: {{ lastUpdateTime }}</span>
        </p>
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
            TOP5
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--users">
          <i class="el-icon-s-custom"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">{{ isAdmin ? '平台用户' : '活跃用户' }}</div>
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
              @click="changeTrendPeriod(item.value)"
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

    <!-- 第二行图表 -->
    <div class="charts-grid charts-grid--second">
      <!-- 季节性销售 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">季节性销售分析</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="seasonChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 地区销售 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">地区销售分布</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="regionChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 月度销售趋势 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">月度销售趋势</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="monthChartRef" class="chart"></div>
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
import { Button, Select, Option } from 'element-ui'
import CountTo from 'vue-count-to'
import * as echarts from 'echarts'
import {
  getMonthlyOrderStatistics,
  getMonthlySalesStatistics,
  getYearlyUserStatistics,
  getTopSellingProducts,
  getCategorySalesStatistics,
  getSalesTrend,
  getSeasonalStatistics,
  getRegionStatistics,
  getMerchantList
} from '@/api/statistics'

export default {
  name: 'SalesStatistics',
  components: {
    [Button.name]: Button,
    [Select.name]: Select,
    [Option.name]: Option,
    CountTo
  },
  data() {
    return {
      loading: false,
      lastUpdateTime: '',
      activeTrendTab: 30,
      trendTabs: [
        { label: '近7天', value: 7 },
        { label: '近30天', value: 30 },
        { label: '近90天', value: 90 }
      ],
      // 权限相关
      isAdmin: false,
      isMerchant: false,
      merchantList: [],
      selectedMerchantId: null,
      // 数据
      orderData: { count: 0, growth: 0 },
      salesData: { amount: 0, growth: 0 },
      userData: { total: 0, growth: 0 },
      topProductsData: [],
      categoryData: [],
      trendData: [],
      seasonData: {},
      regionData: [],
      // 图表实例
      trendChart: null,
      categoryChart: null,
      topProductsChart: null,
      seasonChart: null,
      regionChart: null,
      monthChart: null,
      // 图表配置
      chartColors: [
        '#11998e', '#38ef7d', '#43e97b', '#38f9d7',
        '#20c997', '#12b886', '#0ca678', '#099268'
      ]
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
        if (this.isMerchant) {
          this.selectedMerchantId = user.id
        }
      }
    },
    // 获取当前merchantId
    getMerchantId() {
      if (this.isMerchant) {
        return this.selectedMerchantId
      }
      return this.isAdmin ? this.selectedMerchantId : null
    },
    // 店铺切换
    handleMerchantChange() {
      this.loadData()
    },
    // 切换趋势周期
    changeTrendPeriod(days) {
      this.activeTrendTab = days
      this.fetchTrendData()
    },
    // 初始化图表
    initCharts() {
      this.trendChart = echarts.init(this.$refs.trendChartRef)
      this.categoryChart = echarts.init(this.$refs.categoryChartRef)
      this.topProductsChart = echarts.init(this.$refs.topProductsChartRef)
      this.seasonChart = echarts.init(this.$refs.seasonChartRef)
      this.regionChart = echarts.init(this.$refs.regionChartRef)
      this.monthChart = echarts.init(this.$refs.monthChartRef)
    },
    // 销毁图表
    disposeCharts() {
      this.trendChart && this.trendChart.dispose()
      this.categoryChart && this.categoryChart.dispose()
      this.topProductsChart && this.topProductsChart.dispose()
      this.seasonChart && this.seasonChart.dispose()
      this.regionChart && this.regionChart.dispose()
      this.monthChart && this.monthChart.dispose()
    },
    // 响应式
    handleResize() {
      this.trendChart && this.trendChart.resize()
      this.categoryChart && this.categoryChart.resize()
      this.topProductsChart && this.topProductsChart.resize()
      this.seasonChart && this.seasonChart.resize()
      this.regionChart && this.regionChart.resize()
      this.monthChart && this.monthChart.resize()
    },
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        // 如果是管理员，先获取商户列表
        if (this.isAdmin) {
          await this.fetchMerchantList()
        }

        await Promise.all([
          this.fetchOrderData(),
          this.fetchSalesData(),
          this.fetchUserData(),
          this.fetchTopProducts(),
          this.fetchCategoryData(),
          this.fetchTrendData(),
          this.fetchSeasonData(),
          this.fetchRegionData()
        ])
        this.updateTime()
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    // 获取商户列表
    async fetchMerchantList() {
      if (!this.isAdmin) return
      try {
        const res = await getMerchantList()
        if (res.code === '0') {
          this.merchantList = res.data || []
        }
      } catch (error) {
        console.error('获取商户列表失败:', error)
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
      const res = await getMonthlyOrderStatistics(this.selectedMerchantId)
      if (res.code === '0' && res.data) {
        this.orderData = {
          count: res.data.currentMonthOrders || 0,
          growth: parseFloat(res.data.growthRate) || 0
        }
      }
    },
    // 获取销售数据
    async fetchSalesData() {
      const res = await getMonthlySalesStatistics(this.selectedMerchantId)
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
      const res = await getTopSellingProducts(this.selectedMerchantId)
      if (res.code === '0' && res.data) {
        this.topProductsData = res.data.topProducts || []
        this.renderTopProductsChart()
      }
    },
    // 获取品类数据
    async fetchCategoryData() {
      const res = await getCategorySalesStatistics(this.selectedMerchantId)
      if (res.code === '0' && res.data) {
        this.categoryData = res.data.categoryStats || []
        this.renderCategoryChart()
      }
    },
    // 获取趋势数据
    async fetchTrendData() {
      const res = await getSalesTrend(this.activeTrendTab, this.selectedMerchantId)
      if (res.code === '0' && res.data) {
        this.trendData = res.data.trend || []
        this.renderTrendChart()
      }
    },
    // 获取季节性数据
    async fetchSeasonData() {
      const res = await getSeasonalStatistics(this.selectedMerchantId)
      if (res.code === '0' && res.data) {
        this.seasonData = res.data
        this.renderSeasonChart()
        this.renderMonthChart()
      }
    },
    // 获取地区数据
    async fetchRegionData() {
      const res = await getRegionStatistics(this.selectedMerchantId)
      if (res.code === '0' && res.data) {
        this.regionData = res.data.regionStats || []
        this.renderRegionChart()
      }
    },
    // 渲染销售趋势图
    renderTrendChart() {
      if (!this.trendChart) return

      const trendList = this.trendData || []
      const dates = trendList.map(item => item.date || '')
      const salesAmounts = trendList.map(item => item.salesAmount || 0)
      const orderCounts = trendList.map(item => item.orderCount || 0)

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          borderWidth: 1,
          textStyle: { color: '#606266' },
          formatter: (params) => {
            let result = params[0].name + '<br/>'
            params.forEach(item => {
              const value = item.seriesName === '销售额' ? '¥' + item.value.toLocaleString() : item.value
              result += `${item.marker} ${item.seriesName}: ${value}<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['销售额', '订单数'],
          top: 0,
          textStyle: { color: '#909399' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#e5e5e5' } },
          axisLabel: { color: '#909399' }
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额(元)',
            nameTextStyle: { color: '#909399' },
            axisLine: { show: false },
            axisLabel: { color: '#909399' },
            splitLine: { lineStyle: { color: '#f5f5f5' } }
          },
          {
            type: 'value',
            name: '订单数',
            nameTextStyle: { color: '#909399' },
            axisLine: { show: false },
            axisLabel: { color: '#909399' },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: salesAmounts,
            lineStyle: { color: '#11998e', width: 3 },
            itemStyle: { color: '#11998e', borderColor: '#fff', borderWidth: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(17, 153, 142, 0.3)' },
                { offset: 1, color: 'rgba(17, 153, 142, 0.02)' }
              ])
            }
          },
          {
            name: '订单数',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            data: orderCounts,
            lineStyle: { color: '#f6d365', width: 3 },
            itemStyle: { color: '#f6d365', borderColor: '#fff', borderWidth: 2 }
          }
        ]
      }

      this.trendChart.setOption(option)
    },
    // 渲染品类饼图
    renderCategoryChart() {
      if (!this.categoryChart) return

      const data = this.categoryData.map((item, index) => ({
        name: item.categoryName || `品类${index + 1}`,
        value: item.salesAmount || 0
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          textStyle: { color: '#606266' },
          formatter: (params) => {
            return `${params.name}<br/>销售额: ¥${params.value.toLocaleString()} (${params.percent}%)`
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
        color: this.chartColors
      }

      this.categoryChart.setOption(option)
    },
    // 渲染热销商品图
    renderTopProductsChart() {
      if (!this.topProductsChart) return

      const data = this.topProductsData.length > 0 ? this.topProductsData : []
      if (data.length === 0) {
        this.topProductsChart.clear()
        return
      }

      const names = data.map(item => item.name || '未知').reverse()
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
            if (!product) return ''
            return `${product.name}<br/>销量: ${product.salesCount || 0} 件<br/>销售额: ¥${(product.salesAmount || 0).toLocaleString()}`
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
    },
    // 渲染季节性图表
    renderSeasonChart() {
      if (!this.seasonChart) return

      const seasonStats = this.seasonData.seasonStats || []
      if (seasonStats.length === 0) {
        this.seasonChart.clear()
        return
      }

      const seasons = seasonStats.map(item => item.season)
      const salesAmounts = seasonStats.map(item => item.salesAmount || 0)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const item = params[0]
            const idx = item.dataIndex
            const season = seasonStats[idx]
            if (!season) return ''
            return `${item.name}<br/>销售额: ¥${season.salesAmount?.toLocaleString() || 0}<br/>订单数: ${season.orderCount || 0}<br/>商品数: ${season.productCount || 0}`
          }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: seasons,
          axisLine: { lineStyle: { color: '#e5e5e5' } },
          axisLabel: { color: '#909399' }
        },
        yAxis: {
          type: 'value',
          name: '销售额(元)',
          nameTextStyle: { color: '#909399' },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        series: [{
          type: 'bar',
          data: salesAmounts,
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#43e97b' },
              { offset: 1, color: '#38f9d7' }
            ]),
            borderRadius: [4, 4, 0, 0]
          }
        }]
      }

      this.seasonChart.setOption(option)
    },
    // 渲染月度趋势图表
    renderMonthChart() {
      if (!this.monthChart) return

      const monthStats = this.seasonData.monthStats || []
      if (monthStats.length === 0) {
        this.monthChart.clear()
        return
      }

      const months = monthStats.map(item => item.monthName)
      const salesAmounts = monthStats.map(item => item.salesAmount || 0)

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const item = params[0]
            const idx = item.dataIndex
            const month = monthStats[idx]
            if (!month) return ''
            return `${item.name}<br/>销售额: ¥${month.salesAmount?.toLocaleString() || 0}<br/>订单数: ${month.orderCount || 0}`
          }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
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
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        series: [{
          type: 'line',
          smooth: true,
          data: salesAmounts,
          lineStyle: { color: '#667eea' },
          itemStyle: { color: '#667eea' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.02)' }
            ])
          }
        }]
      }

      this.monthChart.setOption(option)
    },
    // 渲染地区图表
    renderRegionChart() {
      if (!this.regionChart) return

      const data = this.regionData.slice(0, 10)
      if (data.length === 0) {
        this.regionChart.clear()
        return
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const item = params[0]
            const idx = item.dataIndex
            const region = data[idx]
            if (!region) return ''
            return `${item.name}<br/>销售额: ¥${region.salesAmount?.toLocaleString() || 0}<br/>订单数: ${region.orderCount || 0}<br/>用户数: ${region.userCount || 0}<br/>占比: ${region.percentage || '0%'}`
          }
        },
        grid: { left: '3%', right: '10%', bottom: '3%', top: '3%', containLabel: true },
        xAxis: {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        yAxis: {
          type: 'category',
          data: data.map(item => item.region).reverse(),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#606266', fontSize: 13 }
        },
        series: [{
          type: 'bar',
          data: data.map(item => item.salesAmount || 0).reverse(),
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#f6d365' },
              { offset: 1, color: '#fda085' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: '#909399',
            formatter: (params) => '¥' + params.value.toLocaleString()
          }
        }]
      }

      this.regionChart.setOption(option)
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

  &--second {
    grid-template-columns: repeat(3, 1fr);
  }
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
