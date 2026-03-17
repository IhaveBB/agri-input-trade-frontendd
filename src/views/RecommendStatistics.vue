<template>
  <div class="recommend-statistics">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">推荐效果评估</h2>
        <p class="page-subtitle">智能推荐系统运行状况监控</p>
      </div>
      <div class="header-right">
        <el-button icon="el-icon-refresh" circle @click="refreshData" :loading="loading"></el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--click">
          <i class="el-icon-s-data"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">推荐点击率</div>
          <div class="stat-card__value">{{ formatRate(overviewData.ctr) }}<span class="stat-card__unit">%</span></div>
          <div class="stat-card__trend" :class="getTrendClass(overviewData.clickGrowth)">
            <i :class="getTrendIcon(overviewData.clickGrowth)"></i>
            {{ formatTrend(overviewData.clickGrowth) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--convert">
          <i class="el-icon-s-marketing"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">推荐转化率</div>
          <div class="stat-card__value">{{ formatRate(overviewData.cvr) }}<span class="stat-card__unit">%</span></div>
          <div class="stat-card__trend" :class="getTrendClass(overviewData.buyGrowth)">
            <i :class="getTrendIcon(overviewData.buyGrowth)"></i>
            {{ formatTrend(overviewData.buyGrowth) }}
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--diversity">
          <i class="el-icon-s-grid"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">推荐多样性</div>
          <div class="stat-card__value">{{ formatRate(diversityData.entropy) }}</div>
          <div class="stat-card__trend trend-neutral">
            信息熵指标
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--coverage">
          <i class="el-icon-s-custom"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">覆盖用户数</div>
          <div class="stat-card__value">{{ overviewData.coveredUsers || 0 }}</div>
          <div class="stat-card__trend trend-neutral">
            <i class="el-icon-user"></i>
            活跃用户
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 推荐效果趋势 -->
      <div class="chart-panel chart-panel--large">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">推荐效果趋势</h3>
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

      <!-- 算法构成 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">算法构成</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="algorithmChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 第二行图表 -->
    <div class="charts-grid charts-grid--second">
      <!-- 分类推荐效果 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">分类推荐效果</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="categoryEffectChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 多样性仪表盘 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">多样性指标</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="gaugeChartRef" class="chart"></div>
        </div>
      </div>

      <!-- 用户相似度分布 -->
      <div class="chart-panel">
        <div class="chart-panel__header">
          <h3 class="chart-panel__title">用户相似度分布</h3>
        </div>
        <div class="chart-panel__body">
          <div ref="similarityChartRef" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 优化建议和预测 -->
    <div class="bottom-panels">
      <!-- 智能优化建议 -->
      <div class="panel-suggestions">
        <div class="panel-suggestions__header">
          <i class="el-icon-s-opportunity"></i>
          <h3>智能优化建议</h3>
        </div>
        <div class="panel-suggestions__content">
          <div v-if="suggestions.length === 0" class="empty-tip">
            <i class="el-icon-loading"></i>
            正在分析推荐系统...
          </div>
          <ul v-else class="suggestion-list">
            <li v-for="(item, index) in suggestions" :key="index" class="suggestion-item">
              <span class="suggestion-icon" :class="'suggestion-icon--' + item.level">
                <i :class="getSuggestionIcon(item.type)"></i>
              </span>
              <div class="suggestion-content">
                <div class="suggestion-title">{{ item.message }}</div>
                <div class="suggestion-desc">{{ item.action }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- 效果预测 -->
      <div class="panel-prediction">
        <div class="panel-prediction__header">
          <i class="el-icon-s-data"></i>
          <h3>下期效果预测</h3>
        </div>
        <div class="panel-prediction__content">
          <div class="prediction-items">
            <div class="prediction-item">
              <div class="prediction-label">当前点击率</div>
              <div class="prediction-value prediction-value--click">{{ formatRate(overviewData.ctr) }}%</div>
            </div>
            <div class="prediction-item">
              <div class="prediction-label">预测转化率</div>
              <div class="prediction-value prediction-value--convert">{{ formatPredictionRate(predictionData.predictedCVR) }}%</div>
            </div>
            <div class="prediction-item">
              <div class="prediction-label">预测置信度</div>
              <div class="prediction-value prediction-value--coverage">{{ predictionData.confidence || '--' }}</div>
            </div>
          </div>
          <div class="prediction-chart">
            <div ref="predictionChartRef" class="chart"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from 'element-ui'
import * as echarts from 'echarts'
import {
  getRecommendOverview,
  getRecommendTrend,
  getCategoryEffect,
  getAlgorithmComposition,
  getRecommendationDiversity,
  getUserSimilarityDistribution,
  getOptimizationSuggestions,
  predictNextPeriodEffect
} from '@/api/statistics'

export default {
  name: 'RecommendStatistics',
  components: {
    [Button.name]: Button
  },
  data() {
    return {
      loading: false,
      activeTrendTab: 30,
      trendTabs: [
        { label: '近7天', value: 7 },
        { label: '近30天', value: 30 },
        { label: '近90天', value: 90 }
      ],
      // 数据
      overviewData: {},
      trendData: [],
      categoryEffectData: [],
      algorithmData: [],
      diversityData: {},
      similarityData: [],
      suggestions: [],
      predictionData: {},
      // 图表实例
      trendChart: null,
      algorithmChart: null,
      categoryEffectChart: null,
      gaugeChart: null,
      similarityChart: null,
      predictionChart: null,
      // 配色
      chartColors: ['#11998e', '#38ef7d', '#43e97b', '#38f9d7', '#20c997', '#12b886']
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
    // 格式化比率（去掉%符号）
    formatRate(value) {
      if (!value) return '0'
      if (typeof value === 'string') {
        return value.replace('%', '')
      }
      return value
    },
    // 格式化趋势值
    formatTrend(value) {
      if (!value) return '0%'
      if (typeof value === 'string') {
        return value
      }
      return value + '%'
    },
    // 格式化预测值
    formatPredictionRate(value) {
      if (!value) return '--'
      if (typeof value === 'string') {
        return value.replace('%', '')
      }
      return value
    },
    // 获取趋势样式
    getTrendClass(value) {
      if (!value) return 'trend-neutral'
      const num = parseFloat(value)
      if (num > 0) return 'trend-up'
      if (num < 0) return 'trend-down'
      return 'trend-neutral'
    },
    // 获取趋势图标
    getTrendIcon(value) {
      if (!value) return 'el-icon-minus'
      const num = parseFloat(value)
      if (num > 0) return 'el-icon-top'
      if (num < 0) return 'el-icon-bottom'
      return 'el-icon-minus'
    },
    initCharts() {
      this.trendChart = echarts.init(this.$refs.trendChartRef)
      this.algorithmChart = echarts.init(this.$refs.algorithmChartRef)
      this.categoryEffectChart = echarts.init(this.$refs.categoryEffectChartRef)
      this.gaugeChart = echarts.init(this.$refs.gaugeChartRef)
      this.similarityChart = echarts.init(this.$refs.similarityChartRef)
      this.predictionChart = echarts.init(this.$refs.predictionChartRef)
    },
    disposeCharts() {
      this.trendChart && this.trendChart.dispose()
      this.algorithmChart && this.algorithmChart.dispose()
      this.categoryEffectChart && this.categoryEffectChart.dispose()
      this.gaugeChart && this.gaugeChart.dispose()
      this.similarityChart && this.similarityChart.dispose()
      this.predictionChart && this.predictionChart.dispose()
    },
    handleResize() {
      const charts = [
        this.trendChart, this.algorithmChart, this.categoryEffectChart,
        this.gaugeChart, this.similarityChart, this.predictionChart
      ]
      charts.forEach(chart => chart && chart.resize())
    },
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.fetchOverview(),
          this.fetchTrend(),
          this.fetchCategoryEffect(),
          this.fetchAlgorithm(),
          this.fetchDiversity(),
          this.fetchSimilarity(),
          this.fetchSuggestions(),
          this.fetchPrediction()
        ])
        this.renderAllCharts()
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    refreshData() {
      this.loadData()
    },
    changeTrendPeriod(days) {
      this.activeTrendTab = days
      this.fetchTrend()
    },
    // API 调用
    async fetchOverview() {
      const res = await getRecommendOverview()
      if (res.code === '0' && res.data) {
        this.overviewData = res.data
      }
    },
    async fetchTrend() {
      const res = await getRecommendTrend(this.activeTrendTab)
      if (res.code === '0' && res.data) {
        // 后端返回的是 trend 数组，每个元素包含 date, exposure_count, click_count, buy_count
        this.trendData = res.data.trend || []
        this.renderTrendChart()
      }
    },
    async fetchCategoryEffect() {
      const res = await getCategoryEffect()
      if (res.code === '0' && res.data) {
        this.categoryEffectData = res.data
        this.renderCategoryEffectChart()
      }
    },
    async fetchAlgorithm() {
      const res = await getAlgorithmComposition()
      if (res.code === '0' && res.data) {
        this.algorithmData = res.data
        this.renderAlgorithmChart()
      }
    },
    async fetchDiversity() {
      const res = await getRecommendationDiversity()
      if (res.code === '0' && res.data) {
        this.diversityData = res.data
        this.renderGaugeChart()
      }
    },
    async fetchSimilarity() {
      const res = await getUserSimilarityDistribution()
      if (res.code === '0' && res.data) {
        this.similarityData = res.data
        this.renderSimilarityChart()
      }
    },
    async fetchSuggestions() {
      const res = await getOptimizationSuggestions()
      if (res.code === '0' && res.data) {
        this.suggestions = res.data.suggestions || res.data || []
      }
    },
    async fetchPrediction() {
      const res = await predictNextPeriodEffect()
      if (res.code === '0' && res.data) {
        this.predictionData = res.data
        this.renderPredictionChart()
      }
    },
    // 渲染图表
    renderAllCharts() {
      this.renderTrendChart()
      this.renderAlgorithmChart()
      this.renderCategoryEffectChart()
      this.renderGaugeChart()
      this.renderSimilarityChart()
      this.renderPredictionChart()
    },
    renderTrendChart() {
      if (!this.trendChart) return

      // 使用真实API数据
      const trendList = this.trendData || []
      const dates = trendList.map(item => item.date || '')
      const clicks = trendList.map(item => item.click_count || 0)
      const conversions = trendList.map(item => item.buy_count || 0)

      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#fff',
          borderColor: '#e5e5e5',
          textStyle: { color: '#606266' }
        },
        legend: {
          data: ['点击次数', '转化次数'],
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
            name: '点击',
            nameTextStyle: { color: '#909399' },
            axisLabel: { color: '#909399' },
            splitLine: { lineStyle: { color: '#f5f5f5' } }
          },
          {
            type: 'value',
            name: '转化',
            nameTextStyle: { color: '#909399' },
            axisLabel: { color: '#909399' },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: '点击次数',
            type: 'line',
            smooth: true,
            data: clicks,
            lineStyle: { color: '#11998e', width: 3 },
            itemStyle: { color: '#11998e' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(17, 153, 142, 0.2)' },
                { offset: 1, color: 'rgba(17, 153, 142, 0.02)' }
              ])
            }
          },
          {
            name: '转化次数',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: conversions,
            lineStyle: { color: '#f6d365', width: 3 },
            itemStyle: { color: '#f6d365' }
          }
        ]
      }

      this.trendChart.setOption(option)
    },
    renderAlgorithmChart() {
      if (!this.algorithmChart) return

      // 从后端composition数据中获取
      const composition = this.algorithmData.composition || {}
      const data = Object.keys(composition).length > 0
        ? Object.entries(composition).map(([name, value]) => ({
            name,
            value: parseFloat(value.toString().replace('%', ''))
          }))
        : []

      // 如果没有数据，显示提示
      if (data.length === 0) {
        this.algorithmChart.clear()
        return
      }

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%'
        },
        series: [{
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['50%', '50%'],
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{c}%',
            color: '#606266'
          },
          data: data
        }],
        color: this.chartColors
      }

      this.algorithmChart.setOption(option)
    },
    renderCategoryEffectChart() {
      if (!this.categoryEffectChart) return

      // 从后端categoryEffect数据中获取
      const categoryEffectList = this.categoryEffectData.categoryEffect || this.categoryEffectData || []
      const data = categoryEffectList.length > 0 ? categoryEffectList : []

      // 如果没有数据，显示空状态
      if (data.length === 0) {
        this.categoryEffectChart.clear()
        return
      }

      const categories = data.map(item => item.category_name || item.categoryName)
      const rates = data.map(item => parseFloat((item.cvr || item.conversionRate || '0').toString().replace('%', '')))

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const item = params[0]
            const idx = item.dataIndex
            const d = data[idx]
            if (!d) return ''
            return `${item.name}<br/>转化率: ${d.cvr || '0%'}<br/>点击率: ${d.ctr || '0%'}`
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
          data: categories,
          axisLine: { lineStyle: { color: '#e5e5e5' } },
          axisLabel: { color: '#909399' }
        },
        yAxis: {
          type: 'value',
          name: '转化率(%)',
          nameTextStyle: { color: '#909399' },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        series: [{
          type: 'bar',
          data: rates,
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

      this.categoryEffectChart.setOption(option)
    },
    renderGaugeChart() {
      if (!this.gaugeChart) return

      const value = parseFloat(this.diversityData.entropy) || 0.75

      const option = {
        series: [{
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 1,
          splitNumber: 5,
          radius: '90%',
          center: ['50%', '70%'],
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [value, new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: '#11998e' },
                  { offset: 1, color: '#38ef7d' }
                ])],
                [1, '#f0f0f0']
              ]
            }
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '60%',
            width: 14,
            offsetCenter: [0, '-10%'],
            itemStyle: { color: '#11998e' }
          },
          axisTick: { length: 8, lineStyle: { color: '#fff', width: 2 } },
          splitLine: { length: 15, lineStyle: { color: '#fff', width: 3 } },
          axisLabel: {
            color: '#909399',
            fontSize: 12,
            distance: -45,
            formatter: (v) => v.toFixed(1)
          },
          title: {
            offsetCenter: [0, '20%'],
            fontSize: 14,
            color: '#606266'
          },
          detail: {
            fontSize: 28,
            offsetCenter: [0, '50%'],
            valueAnimation: true,
            formatter: (v) => v.toFixed(2),
            color: '#11998e',
            fontWeight: 'bold'
          },
          data: [{ value: value, name: '信息熵' }]
        }]
      }

      this.gaugeChart.setOption(option)
    },
    renderSimilarityChart() {
      if (!this.similarityChart) return

      // 使用新的DTO结构: funnel + depthAnalysis
      const data = this.similarityData || {}
      const depthAnalysis = data.depthAnalysis || {}
      const depthDistribution = depthAnalysis.depthDistribution || {}

      // 转换深度分布为数组
      const depthData = [
        { name: '深度4(完整转化)', value: parseFloat(depthDistribution['深度4(完整转化)'] || '0') },
        { name: '深度3(加购/收藏)', value: parseFloat(depthDistribution['深度3(加购/收藏)'] || '0') },
        { name: '深度2(点击)', value: parseFloat(depthDistribution['深度2(点击)'] || '0') },
        { name: '深度1(仅曝光)', value: parseFloat(depthDistribution['深度1(仅曝光)'] || '0') }
      ]

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params) => {
            const item = params[0]
            return `${item.name}<br/>占比: ${item.value}%`
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
          data: depthData.map(d => d.name),
          axisLine: { lineStyle: { color: '#e5e5e5' } },
          axisLabel: { color: '#909399', interval: 0, rotate: 0 }
        },
        yAxis: {
          type: 'value',
          name: '占比 (%)',
          axisLine: { lineStyle: { color: '#e5e5e5' } },
          axisLabel: { color: '#909399' },
          splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        series: [{
          type: 'bar',
          data: depthData.map(d => d.value),
          barWidth: '50%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%'
          }
        }]
      }

      this.similarityChart.setOption(option)
    },
    renderPredictionChart() {
      if (!this.predictionChart) return

      // 从 overviewData 获取当前值
      const currentCTR = parseFloat(this.formatRate(this.overviewData.ctr)) || 0
      const currentCVR = parseFloat(this.formatRate(this.overviewData.cvr)) || 0
      // 从 predictionData 获取预测值
      const predictedCVR = parseFloat(this.formatPredictionRate(this.predictionData.predictedCVR)) || 0
      const diversity = parseFloat(this.diversityData.entropy) * 100 || 0

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['当前指标', '预测指标'],
          top: 0,
          textStyle: { color: '#909399' }
        },
        radar: {
          indicator: [
            { name: '点击率(CTR)', max: 100 },
            { name: '转化率(CVR)', max: 100 },
            { name: '多样性', max: 100 }
          ],
          shape: 'polygon',
          splitNumber: 4,
          axisName: { color: '#606266' },
          splitLine: { lineStyle: { color: '#e5e5e5' } },
          splitArea: { show: true, areaStyle: { color: ['#f7f8fa', '#fff'] } }
        },
        series: [{
          type: 'radar',
          data: [
            {
              value: [currentCTR, currentCVR, diversity],
              name: '当前指标',
              areaStyle: {
                color: 'rgba(17, 153, 142, 0.3)'
              },
              lineStyle: { color: '#11998e', width: 2 },
              itemStyle: { color: '#11998e' }
            },
            {
              value: [currentCTR, predictedCVR, diversity],
              name: '预测指标',
              areaStyle: {
                color: 'rgba(246, 211, 101, 0.3)'
              },
              lineStyle: { color: '#f6d365', width: 2 },
              itemStyle: { color: '#f6d365' }
            }
          ]
        }]
      }

      this.predictionChart.setOption(option)
    },
    getSuggestionIcon(type) {
      const icons = {
        optimize: 'el-icon-setting',
        warning: 'el-icon-warning',
        suggest: 'el-icon-s-opportunity',
        info: 'el-icon-info'
      }
      return icons[type] || icons.suggest
    }
  }
}
</script>

<style lang="scss" scoped>
.recommend-statistics {
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

    &--click {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    &--convert {
      background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    }
    &--diversity {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    &--coverage {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

    .stat-card__unit {
      font-size: 14px;
      font-weight: normal;
      color: #999;
      margin-left: 2px;
    }
  }

  &__trend {
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;

    &.trend-up { color: #67c23a; }
    &.trend-down { color: #f56c6c; }
    &.trend-neutral { color: #999; }
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

    &:hover { color: #11998e; }

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
      height: 320px;
    }
  }
}

.bottom-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.panel-suggestions, .panel-prediction {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.panel-suggestions {
  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;

    i {
      font-size: 20px;
      color: #11998e;
    }

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
  }

  &__content {
    padding: 20px;
    min-height: 200px;
  }
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.suggestion-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;

  &--high {
    background: linear-gradient(135deg, #f56c6c, #fa709a);
  }
  &--medium {
    background: linear-gradient(135deg, #f6d365, #fda085);
  }
  &--low {
    background: linear-gradient(135deg, #11998e, #38ef7d);
  }
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.suggestion-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #999;

  i {
    display: block;
    font-size: 24px;
    margin-bottom: 10px;
  }
}

.panel-prediction {
  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;

    i {
      font-size: 20px;
      color: #f6d365;
    }

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
  }

  &__content {
    padding: 20px;
  }
}

.prediction-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.prediction-item {
  text-align: center;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.prediction-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.prediction-value {
  font-size: 24px;
  font-weight: 700;
  font-family: 'DIN Alternate', 'Helvetica Neue', Helvetica, Arial, sans-serif;

  &--click { color: #11998e; }
  &--convert { color: #f6d365; }
  &--coverage { color: #43e97b; }
}

.prediction-chart .chart {
  height: 200px;
}

@media (max-width: 1400px) {
  .charts-grid--second {
    grid-template-columns: 1fr 1fr;
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

  .bottom-panels {
    grid-template-columns: 1fr;
  }
}
</style>
