<template>
  <div class="region-sales-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">地域销售分析</h2>
        <p class="page-subtitle">全国各省份农资销售数据可视化分析</p>
      </div>
      <div class="header-right">
        <el-select v-model="viewMode" size="small" style="width: 120px; margin-right: 12px;">
          <el-option label="地图视图" value="map"></el-option>
          <el-option label="大区视图" value="region"></el-option>
          <el-option label="省份视图" value="province"></el-option>
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          size="small"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 240px; margin-right: 12px;"
          @change="loadData">
        </el-date-picker>
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
        <div class="stat-icon orders">
          <i class="el-icon-s-order"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">订单总数</div>
          <div class="stat-value">{{ formatNumber(overview.totalOrders) }}<span class="unit">单</span></div>
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

    <!-- 地图视图 -->
    <div v-show="viewMode === 'map'" class="map-container">
      <div class="chart-panel map-panel">
        <div class="panel-header">
          <h3>全国销售分布</h3>
          <div class="map-header-right">
            <el-button-group style="margin-right: 12px;">
              <el-button size="mini" icon="el-icon-zoom-in" @click="zoomToPearlDelta" title="放大珠三角（港澳）">珠三角</el-button>
              <el-button size="mini" icon="el-icon-refresh-right" @click="resetMapZoom" title="还原全国视图">还原</el-button>
            </el-button-group>
            <div class="map-legend">
              <span class="legend-item"><i class="dot low"></i>低</span>
              <span class="legend-item"><i class="dot medium"></i>中</span>
              <span class="legend-item"><i class="dot high"></i>高</span>
            </div>
          </div>
        </div>
        <div class="panel-body">
          <div ref="chinaMapRef" class="chart china-map"></div>
          <div class="map-attribution">
            <span>中华人民共和国标准地图 &nbsp;|&nbsp; 数据来源：阿里云 DataV 数据可视化平台 &nbsp;|&nbsp;
              <a href="https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json" target="_blank" rel="noopener">
                https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 大区视图 -->
    <div v-show="viewMode === 'region'" class="region-view">
      <div class="region-tabs">
        <el-radio-group v-model="selectedRegion" @change="onRegionChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="华东">华东</el-radio-button>
          <el-radio-button label="华南">华南</el-radio-button>
          <el-radio-button label="华北">华北</el-radio-button>
          <el-radio-button label="华中">华中</el-radio-button>
          <el-radio-button label="西南">西南</el-radio-button>
          <el-radio-button label="西北">西北</el-radio-button>
          <el-radio-button label="东北">东北</el-radio-button>
        </el-radio-group>
      </div>

      <div class="charts-row">
        <div class="chart-panel">
          <div class="panel-header">
            <h3>大区销售占比</h3>
          </div>
          <div class="panel-body">
            <div ref="regionPieRef" class="chart"></div>
          </div>
        </div>

        <div class="chart-panel">
          <div class="panel-header">
            <h3>大区销售排行</h3>
          </div>
          <div class="panel-body">
            <div ref="regionBarRef" class="chart"></div>
          </div>
        </div>
      </div>

      <!-- 大区详情卡片 -->
      <div class="region-cards">
        <div v-for="region in regionData" :key="region.regionName"
             class="region-card"
             :class="{ active: selectedRegion === region.regionName }"
             @click="selectedRegion = region.regionName; onRegionChange()">
          <div class="region-header">
            <span class="region-name">{{ region.regionName }}</span>
            <span class="region-provinces">{{ region.provinceCount }}省</span>
          </div>
          <div class="region-stats">
            <div class="region-stat">
              <span class="label">销售额</span>
              <span class="value">¥{{ formatAmount(region.salesAmount) }}</span>
            </div>
            <div class="region-stat">
              <span class="label">订单数</span>
              <span class="value">{{ region.orderCount }}单</span>
            </div>
            <div class="region-stat">
              <span class="label">占比</span>
              <span class="value">{{ region.percentage }}%</span>
            </div>
          </div>
          <div class="region-progress">
            <div class="progress-bar" :style="{ width: region.percentage + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 省份视图 -->
    <div v-show="viewMode === 'province'" class="province-view">
      <div class="charts-row">
        <div class="chart-panel chart-panel--large">
          <div class="panel-header">
            <h3>省份销售排行</h3>
            <span class="panel-subtitle">TOP 15</span>
          </div>
          <div class="panel-body">
            <div ref="provinceBarRef" class="chart"></div>
          </div>
        </div>

        <div class="chart-panel">
          <div class="panel-header">
            <h3>销售趋势</h3>
          </div>
          <div class="panel-body">
            <div ref="trendLineRef" class="chart"></div>
          </div>
        </div>
      </div>

      <!-- 省份详细数据表格 -->
      <div class="data-table-panel">
        <div class="panel-header">
          <h3>省份详细数据</h3>
          <el-input v-model="provinceSearch" placeholder="搜索省份" size="small" style="width: 200px;" clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <el-table :data="filteredProvinceData" stripe style="width: 100%" v-loading="loading" max-height="400">
          <el-table-column prop="provinceName" label="省份" width="120" fixed>
            <template slot-scope="scope">
              <span class="province-tag">{{ scope.row.provinceName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="regionName" label="所属大区" width="100"></el-table-column>
          <el-table-column prop="salesAmount" label="销售额" width="140" sortable>
            <template slot-scope="scope">
              <span class="sales-amount">¥{{ formatAmount(scope.row.salesAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orderCount" label="订单数" width="100" sortable></el-table-column>
          <el-table-column prop="userCount" label="用户数" width="100" sortable></el-table-column>
          <el-table-column prop="avgOrderAmount" label="客单价" width="120">
            <template slot-scope="scope">
              ¥{{ formatAmount(scope.row.avgOrderAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="销售热力" width="180">
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
  </div>
</template>

<script>
import * as echarts from 'echarts'
import Request from '@/utils/request'

// 中国地图 GeoJSON URL（使用阿里云 DataV 标准中国地图，包含完整疆域）
const CHINA_MAP_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'

// 中国省份与大区映射
const PROVINCE_REGION_MAP = {
  '北京': '华北', '天津': '华北', '河北': '华北', '山西': '华北', '内蒙古': '华北',
  '辽宁': '东北', '吉林': '东北', '黑龙江': '东北',
  '上海': '华东', '江苏': '华东', '浙江': '华东', '安徽': '华东', '福建': '华东', '江西': '华东', '山东': '华东',
  '河南': '华中', '湖北': '华中', '湖南': '华中',
  '广东': '华南', '广西': '华南', '海南': '华南',
  '重庆': '西南', '四川': '西南', '贵州': '西南', '云南': '西南', '西藏': '西南',
  '陕西': '西北', '甘肃': '西北', '青海': '西北', '宁夏': '西北', '新疆': '西北',
  '台湾': '华东', '香港': '华南', '澳门': '华南'
}

// 省份短名到 GeoJSON 全名映射（DataV 地图使用全名）
const PROVINCE_FULL_NAME_MAP = {
  '北京': '北京市', '天津': '天津市', '上海': '上海市', '重庆': '重庆市',
  '河北': '河北省', '山西': '山西省', '辽宁': '辽宁省', '吉林': '吉林省',
  '黑龙江': '黑龙江省', '江苏': '江苏省', '浙江': '浙江省', '安徽': '安徽省',
  '福建': '福建省', '江西': '江西省', '山东': '山东省', '河南': '河南省',
  '湖北': '湖北省', '湖南': '湖南省', '广东': '广东省', '海南': '海南省',
  '四川': '四川省', '贵州': '贵州省', '云南': '云南省', '陕西': '陕西省',
  '甘肃': '甘肃省', '青海': '青海省',
  '内蒙古': '内蒙古自治区', '广西': '广西壮族自治区', '西藏': '西藏自治区',
  '宁夏': '宁夏回族自治区', '新疆': '新疆维吾尔自治区',
  '香港': '香港特别行政区', '澳门': '澳门特别行政区', '台湾': '台湾省'
}

// 大区包含省份数量
const REGION_PROVINCE_COUNT = {
  '华北': 5, '东北': 3, '华东': 8, '华中': 3, '华南': 3, '西南': 5, '西北': 5
}

export default {
  name: 'RegionSalesAnalysis',
  data() {
    return {
      loading: false,
      viewMode: 'map', // map, region, province
      dateRange: [],
      selectedRegion: '',
      provinceSearch: '',
      overview: {},
      provinceData: [],
      regionData: [],
      // 图表实例
      chinaMapChart: null,
      regionPieChart: null,
      regionBarChart: null,
      provinceBarChart: null,
      trendLineChart: null
    }
  },
  computed: {
    filteredProvinceData() {
      if (!this.provinceSearch) return this.provinceData
      return this.provinceData.filter(p =>
        p.provinceName.includes(this.provinceSearch)
      )
    }
  },
  watch: {
    viewMode(newVal) {
      // 切换视图时需要等待 DOM v-show 生效后再 resize 和重渲染
      this.$nextTick(() => {
        setTimeout(() => {
          if (newVal === 'map') {
            this.chinaMapChart && this.chinaMapChart.resize()
            this.registerChinaMap()
          } else if (newVal === 'region') {
            this.ensureChartInited('region')
            this.regionPieChart && this.regionPieChart.resize()
            this.regionBarChart && this.regionBarChart.resize()
            this.renderRegionPie()
            this.renderRegionBar()
          } else if (newVal === 'province') {
            this.ensureChartInited('province')
            this.provinceBarChart && this.provinceBarChart.resize()
            this.trendLineChart && this.trendLineChart.resize()
            this.renderProvinceBar()
            this.renderTrendLine()
          }
        }, 200)
      })
    }
  },
  mounted() {
    this.initDateRange()
    this.initCharts()
    this.loadData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.disposeCharts()
  },
  methods: {
    initDateRange() {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      this.dateRange = [
        this.formatDate(start),
        this.formatDate(end)
      ]
    },
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    initCharts() {
      // 仅初始化当前视图的图表，其他图表懒初始化（避免 display:none 时宽高为 0）
      this.chinaMapChart = echarts.init(this.$refs.chinaMapRef)
    },
    ensureChartInited(viewName) {
      if (viewName === 'region') {
        if (!this.regionPieChart) {
          this.regionPieChart = echarts.init(this.$refs.regionPieRef)
        }
        if (!this.regionBarChart) {
          this.regionBarChart = echarts.init(this.$refs.regionBarRef)
        }
      } else if (viewName === 'province') {
        if (!this.provinceBarChart) {
          this.provinceBarChart = echarts.init(this.$refs.provinceBarRef)
        }
        if (!this.trendLineChart) {
          this.trendLineChart = echarts.init(this.$refs.trendLineRef)
        }
      }
    },
    disposeCharts() {
      this.chinaMapChart && this.chinaMapChart.dispose()
      this.regionPieChart && this.regionPieChart.dispose()
      this.regionBarChart && this.regionBarChart.dispose()
      this.provinceBarChart && this.provinceBarChart.dispose()
      this.trendLineChart && this.trendLineChart.dispose()
    },
    handleResize() {
      // 使用 setTimeout 确保 DOM 已更新后再 resize
      setTimeout(() => {
        if (this.viewMode === 'map') {
          this.chinaMapChart && this.chinaMapChart.resize()
        } else if (this.viewMode === 'region') {
          this.regionPieChart && this.regionPieChart.resize()
          this.regionBarChart && this.regionBarChart.resize()
        } else if (this.viewMode === 'province') {
          this.provinceBarChart && this.provinceBarChart.resize()
          this.trendLineChart && this.trendLineChart.resize()
        }
      }, 50)
    },
    async loadData() {
      this.loading = true
      try {
        const params = {
          startDate: this.dateRange?.[0] || '',
          endDate: this.dateRange?.[1] || ''
        }
        await Promise.all([
          this.loadOverview(params),
          this.loadProvinceData(params),
          this.loadRegionData(params)
        ])
        this.renderAllCharts()
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
    async loadOverview(params) {
      const res = await Request.get('/region-sales/overview', { params })
      if (res.code === '0' && res.data) {
        this.overview = {
          totalSales: res.data.totalSales || 0,
          totalOrders: res.data.regionDistribution?.reduce((sum, r) => sum + (r.orderCount || 0), 0) || 0,
          coveredProvinces: res.data.coveredProvinces || 0,
          topRegion: res.data.topRegion || '-'
        }
      }
    },
    async loadProvinceData(params) {
      const res = await Request.get('/region-sales/heatmap', { params })
      if (res.code === '0' && res.data) {
        this.provinceData = res.data
          .filter(p => parseFloat(p.salesAmount) > 0)
          .map(p => ({
            ...p,
            salesAmount: parseFloat(p.salesAmount || 0),
            regionName: PROVINCE_REGION_MAP[p.provinceName] || '其他',
            avgOrderAmount: p.orderCount > 0 ? parseFloat(p.salesAmount || 0) / p.orderCount : 0,
            heatValue: Math.round(p.heatValue || 0)
          }))
          .sort((a, b) => b.salesAmount - a.salesAmount)
      }
    },
    async loadRegionData(params) {
      const res = await Request.get('/region-sales/distribution', { params })
      if (res.code === '0' && res.data) {
        // 计算总销售额
        const total = res.data.reduce((sum, r) => sum + parseFloat(r.salesAmount || 0), 0)

        this.regionData = res.data.map(r => ({
          ...r,
          salesAmount: parseFloat(r.salesAmount || 0),
          percentage: total > 0 ? ((parseFloat(r.salesAmount || 0) / total) * 100).toFixed(1) : 0,
          provinceCount: REGION_PROVINCE_COUNT[r.regionName] || 0
        }))
      }
    },
    async renderAllCharts() {
      // 仅渲染当前视图的图表，其他视图切换时再渲染
      if (this.viewMode === 'map') {
        await this.registerChinaMap()
      } else if (this.viewMode === 'region') {
        this.ensureChartInited('region')
        this.renderRegionPie()
        this.renderRegionBar()
      } else if (this.viewMode === 'province') {
        this.ensureChartInited('province')
        this.renderProvinceBar()
        this.renderTrendLine()
      }
    },
    onRegionChange() {
      this.renderProvinceBar()
    },
    // 放大珠三角（港澳）区域
    zoomToPearlDelta() {
      if (!this.chinaMapChart) return
      this.chinaMapChart.setOption({
        series: [{ zoom: 20, center: [113.9, 22.3] }]
      })
    },
    // 还原全国视图
    resetMapZoom() {
      if (!this.chinaMapChart) return
      this.chinaMapChart.setOption({
        series: [{ zoom: 1.35, center: [105, 38] }]
      })
    },
    // 加载并渲染中国地图（标准中国地图，包含完整疆域）
    async registerChinaMap() {
      if (!this.chinaMapChart) return

      try {
        // 检查地图是否已注册
        if (!echarts.getMap('china')) {
          // 从阿里云 DataV 加载标准中国地图 GeoJSON
          const response = await fetch(CHINA_MAP_URL)
          if (!response.ok) {
            throw new Error('地图数据加载失败')
          }
          const chinaGeoJson = await response.json()
          echarts.registerMap('china', chinaGeoJson)
        }

        // 准备地图数据（使用 GeoJSON 全名，确保颜色映射正确）
        const mapData = this.provinceData.map(p => ({
          name: PROVINCE_FULL_NAME_MAP[p.provinceName] || p.provinceName,
          value: parseFloat(p.salesAmount || 0),
          shortName: p.provinceName
        }))

        const maxSales = Math.max(...mapData.map(d => d.value), 1)

        const option = {
          tooltip: {
            trigger: 'item',
            formatter: params => {
              const item = this.provinceData.find(p =>
                (PROVINCE_FULL_NAME_MAP[p.provinceName] || p.provinceName) === params.name
              )
              if (item) {
                return `<div style="padding: 10px;">
                  <strong style="font-size: 15px;">${item.provinceName}</strong><br/>
                  <div style="margin-top: 8px; line-height: 1.8;">
                    <span style="color: #67c23a; font-weight: 600;">销售额: ¥${this.formatAmount(item.salesAmount)}</span><br/>
                    <span>订单数: ${item.orderCount}单</span><br/>
                    <span>用户数: ${item.userCount}人</span>
                  </div>
                </div>`
              }
              return params.name
            }
          },
          visualMap: {
            min: 0,
            max: maxSales,
            left: 20,
            bottom: 20,
            text: ['高', '低'],
            calculable: false,
            inRange: {
              color: ['#e8f5e9', '#a5d6a7', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20']
            },
            outOfRange: {
              color: ['#f5f5f5']
            },
            textStyle: {
              color: '#666'
            }
          },
          series: [{
            name: '销售额',
            type: 'map',
            map: 'china',
            roam: false,
            zoom: 1.35,
            center: [105, 38],
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                color: '#fff',
                fontSize: 12,
                fontWeight: 'bold'
              },
              itemStyle: {
                areaColor: '#f39c12',
                shadowBlur: 20,
                shadowColor: 'rgba(243, 156, 18, 0.5)'
              }
            },
            itemStyle: {
              borderColor: '#ccc',
              borderWidth: 0.5
            },
            select: {
              itemStyle: {
                areaColor: '#f39c12'
              }
            },
            data: mapData
          }]
        }

        this.chinaMapChart.setOption(option, true)
      } catch (error) {
        console.error('中国地图加载失败:', error)
        this.$message.warning('地图数据加载失败，请检查网络连接')
        // 降级显示为省份列表
        this.viewMode = 'province'
      }
    },
    // 渲染大区饼图
    renderRegionPie() {
      if (!this.regionPieChart || this.regionData.length === 0) return

      const data = this.regionData.map(r => ({
        name: r.regionName,
        value: parseFloat(r.salesAmount || 0)
      }))

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}<br/>销售额: ¥{c}<br/>占比: {d}%'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          top: 'center'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%'
          },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          data: data,
          color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
        }]
      }

      this.regionPieChart.setOption(option)
    },
    // 渲染大区柱状图
    renderRegionBar() {
      if (!this.regionBarChart || this.regionData.length === 0) return

      const sorted = [...this.regionData].sort((a, b) => b.salesAmount - a.salesAmount)
      const names = sorted.map(r => r.regionName)
      const values = sorted.map(r => parseFloat(r.salesAmount || 0))

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
            formatter: val => '¥' + (val / 10000).toFixed(0) + '万'
          }
        },
        yAxis: {
          type: 'category',
          data: names.reverse(),
          axisLabel: { fontSize: 12 }
        },
        series: [{
          type: 'bar',
          data: values.reverse(),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#91cc75' },
              { offset: 1, color: '#5470c6' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: '¥{c}',
            fontSize: 11
          }
        }]
      }

      this.regionBarChart.setOption(option)
    },
    // 渲染省份柱状图
    renderProvinceBar() {
      if (!this.provinceBarChart) return

      let data = this.provinceData
      if (this.selectedRegion) {
        data = data.filter(p => p.regionName === this.selectedRegion)
      }
      const top15 = data.slice(0, 15)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: params => {
            const item = top15[top15.length - 1 - params[0].dataIndex]
            return `<strong>${params[0].name}</strong><br/>
              销售额: ¥${this.formatAmount(item?.salesAmount)}<br/>
              订单数: ${item?.orderCount}单`
          }
        },
        grid: {
          left: '3%',
          right: '15%',
          bottom: '3%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: val => '¥' + (val / 10000).toFixed(0) + '万'
          }
        },
        yAxis: {
          type: 'category',
          data: top15.map(p => p.provinceName).reverse(),
          axisLabel: { fontSize: 12 }
        },
        series: [{
          type: 'bar',
          data: top15.map(p => parseFloat(p.salesAmount || 0)).reverse(),
          itemStyle: {
            color: params => {
              const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
              return colors[params.dataIndex % colors.length]
            },
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            formatter: '¥{c}',
            fontSize: 10
          }
        }]
      }

      this.provinceBarChart.setOption(option)
    },
    // 渲染趋势线图
    renderTrendLine() {
      if (!this.trendLineChart) return

      // 模拟7天趋势数据
      const days = []
      const values = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        days.push(`${d.getMonth() + 1}/${d.getDate()}`)
        values.push(Math.random() * 10000 + 5000)
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>销售额: ¥{c}'
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
          boundaryGap: false,
          data: days
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: val => '¥' + (val / 1000).toFixed(0) + 'k'
          }
        },
        series: [{
          type: 'line',
          data: values,
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.4)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
            ])
          },
          lineStyle: { color: '#5470c6', width: 2 },
          itemStyle: { color: '#5470c6' }
        }]
      }

      this.trendLineChart.setOption(option)
    },
    formatAmount(amount) {
      if (!amount) return '0.00'
      const num = parseFloat(amount)
      if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万'
      }
      return num.toFixed(2)
    },
    formatNumber(num) {
      if (!num) return '0'
      const n = parseInt(num)
      if (n >= 10000) {
        return (n / 10000).toFixed(1) + '万'
      }
      return n.toString()
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

  .header-right {
    display: flex;
    align-items: center;
  }
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .stat-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;

    &.total { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    &.orders { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    &.covered { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    &.top { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
  }

  .stat-label {
    font-size: 13px;
    color: #999;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;

    .unit {
      font-size: 13px;
      font-weight: normal;
      color: #999;
      margin-left: 4px;
    }
  }
}

.chart-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  &--large {
    flex: 1.5;
  }
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .panel-subtitle {
    font-size: 12px;
    color: #999;
  }
}

.panel-body {
  padding: 16px;
}

.chart {
  width: 100%;
  min-height: 350px;
  height: 350px;
}

.china-map {
  width: 100%;
  min-height: 680px;
  height: 680px;
}

/* 确保图表容器正确显示 */
.map-container,
.region-view,
.province-view {
  width: 100%;
}

/* 图表行布局 */
.charts-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .chart-panel {
    flex: 1;
    min-width: 0; /* 防止 flex 子项溢出 */
  }
}

/* 地图视图 */
.map-container {
  margin-bottom: 24px;

  .map-panel > .panel-body {
    padding: 0;
    border-radius: 0 0 12px 12px;
  }

  .map-panel {
    .map-header-right {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .map-legend {
      display: flex;
      gap: 16px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #666;

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;

          &.low { background: #a5d6a7; }
          &.medium { background: #43a047; }
          &.high { background: #1b5e20; }
        }
      }
    }
  }
}

.map-attribution {
  padding: 8px 16px;
  font-size: 11px;
  color: #999;
  text-align: center;
  background: #fff;

  a {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

/* 大区视图 */
.region-view {
  .region-tabs {
    margin-bottom: 20px;
  }

  .region-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    .region-card {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      &.active {
        border-color: #409eff;
      }

      .region-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .region-name {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .region-provinces {
          font-size: 12px;
          color: #999;
        }
      }

      .region-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;

        .region-stat {
          text-align: center;

          .label {
            display: block;
            font-size: 11px;
            color: #999;
            margin-bottom: 4px;
          }

          .value {
            font-size: 13px;
            font-weight: 600;
            color: #333;
          }
        }
      }

      .region-progress {
        height: 4px;
        background: #f0f0f0;
        border-radius: 2px;
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #409eff, #67c23a);
          transition: width 0.3s;
        }
      }
    }
  }
}

/* 省份视图 */
.province-view {
  width: 100%;
}

.data-table-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .panel-header {
    padding: 16px 20px;
  }

  .province-tag {
    display: inline-block;
    padding: 2px 8px;
    background: #f0f5ff;
    color: #409eff;
    border-radius: 4px;
    font-size: 12px;
  }

  .sales-amount {
    color: #f56c6c;
    font-weight: 600;
  }
}

.heat-bar {
  display: flex;
  align-items: center;
  gap: 10px;

  .heat-fill {
    flex: 1;
    height: 6px;
    background: linear-gradient(90deg, #11998e, #38ef7d);
    border-radius: 3px;
    transition: width 0.3s;
  }

  .heat-text {
    font-size: 12px;
    color: #666;
    min-width: 30px;
    text-align: right;
  }
}

@media (max-width: 1400px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .region-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .overview-cards,
  .region-cards {
    grid-template-columns: 1fr;
  }

  .charts-row {
    flex-direction: column;
  }
}
</style>
