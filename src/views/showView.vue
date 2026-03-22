<template>
  <div class="dashboard-wrapper">
    <!-- 数据概览卡片 -->
    <div class="stat-cards" v-loading="statsLoading">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-header">
          <i class="el-icon-shopping-cart-full stat-icon"></i>
          <div class="stat-title">本月订单</div>
        </div>
        <div class="stat-value">
          <count-to :startVal="0" :endVal="orderStats.currentMonthOrders" :duration="2000">
          </count-to>
        </div>
        <div class="stat-footer">
          较上月
          <span :class="orderTrend >= 0 ? 'up' : 'down'">
            {{ orderStats.growthRate }}
            <i :class="orderTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
          </span>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-header">
          <i class="el-icon-money stat-icon"></i>
          <div class="stat-title">本月销售额</div>
        </div>
        <div class="stat-value">
          ¥<count-to :startVal="0" :endVal="salesStats.currentMonthSales" :duration="2000" :decimals="2">
          </count-to>
        </div>
        <div class="stat-footer">
          较上月
          <span :class="saleTrend >= 0 ? 'up' : 'down'">
            {{ salesStats.growthRate }}
            <i :class="saleTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
          </span>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-header">
          <i class="el-icon-user stat-icon"></i>
          <div class="stat-title">今年用户数</div>
        </div>
        <div class="stat-value">
          <count-to :startVal="0" :endVal="userStats.currentYearUsers" :duration="2000">
          </count-to>
        </div>
        <div class="stat-footer">
          较去年
          <span :class="userTrend >= 0 ? 'up' : 'down'">
            {{ userStats.growthRate }}
            <i :class="userTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
          </span>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-header">
          <i class="el-icon-warning-outline stat-icon stat-icon--warning"></i>
          <div class="stat-title">库存预警</div>
        </div>
        <div class="stat-value">
          <count-to :startVal="0" :endVal="stockWarningCount" :duration="2000">
          </count-to>
        </div>
        <div class="stat-footer">
          <span :class="stockWarningCount > 0 ? 'down' : 'up'">
            <i :class="stockWarningCount > 0 ? 'el-icon-warning' : 'el-icon-check'"></i>
            {{ stockWarningCount > 0 ? '需关注' : '库存正常' }}
          </span>
        </div>
      </el-card>
    </div>

    <div class="content-wrapper">
      <!-- 热销商品TOP5图表 -->
      <el-card class="chart-card" shadow="hover">
        <div slot="header" class="chart-header">
          <span>热销商品 TOP5</span>
          <el-button type="text" @click="fetchTopProducts">刷新</el-button>
        </div>
        <div class="chart-content">
          <div ref="topProductsChart" class="chart"></div>
        </div>
      </el-card>

      <!-- 品类销售占比图表 -->
      <el-card class="chart-card" shadow="hover">
        <div slot="header" class="chart-header">
          <span>品类销售占比</span>
          <el-button type="text" @click="fetchCategoryStats">刷新</el-button>
        </div>
        <div class="chart-content">
          <div ref="categoryChart" class="chart"></div>
        </div>
      </el-card>
    </div>

    <!-- 通知公告 -->
    <div class="content-wrapper">
      <el-card class="notice-card" shadow="hover">
        <div slot="header" class="notice-header">
          <span>通知公告</span>
          <el-button type="text" @click="fetchData">刷新</el-button>
        </div>
        <div class="notice-content" v-loading="noticeLoading">
          <div v-if="!noticeLoading && announcements.length === 0" class="empty-notice">
            <i class="el-icon-bell"></i>
            <p>暂无通知公告</p>
          </div>
          <el-timeline v-else>
            <el-timeline-item v-for="(notice, index) in announcements" :key="index" :timestamp="notice.time" :type="getNoticeType(notice.type)">
              <el-card class="notice-item" shadow="never">
                <h4>{{ notice.title }}</h4>
                <p class="notice-text">{{ notice.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Timeline, TimelineItem, Card, Button } from 'element-ui'
import CountTo from 'vue-count-to'
import Request from '../utils/request.js'
import * as echarts from 'echarts'

export default {
  name: 'ShowView',
  components: {
    [Card.name]: Card,
    [Timeline.name]: Timeline,
    [TimelineItem.name]: TimelineItem,
    [Button.name]: Button,
    CountTo
  },
  data() {
    return {
      noticeLimit: 10,
      announcements: [],
      statsLoading: false,
      noticeLoading: false,
      // 统计数据
      orderStats: {
        currentMonthOrders: 0,
        lastMonthOrders: 0,
        growthRate: '0.00%'
      },
      salesStats: {
        currentMonthSales: 0,
        lastMonthSales: 0,
        growthRate: '0.00%'
      },
      userStats: {
        currentYearUsers: 0,
        lastYearUsers: 0,
        growthRate: '0.00%'
      },
      stockWarningCount: 0,
      // 热销商品数据
      topProductsChart: null,
      topProducts: [],
      // 添加品类统计数据
      categoryChart: null,
      categoryStats: []
    }
  },
  computed: {
    // 计算订单增长率数值（去掉百分号）
    orderTrend() {
      return parseFloat(this.orderStats.growthRate)
    },
    // 计算销售额增长率数值
    saleTrend() {
      return parseFloat(this.salesStats.growthRate)
    },
    // 计算用户增长率数值
    userTrend() {
      return parseFloat(this.userStats.growthRate)
    }
  },
  mounted() {
    this.initTopProductsChart()
    this.initCategoryChart()
    this.fetchData()
    this.fetchStatistics()
    this.fetchTopProducts()
    this.fetchCategoryStats()
    this.fetchStockWarningCount()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    if (this.topProductsChart) {
      this.topProductsChart.dispose()
    }
    if (this.categoryChart) {
      this.categoryChart.dispose()
    }
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    // 获取通知数据
    fetchData() {
      this.noticeLoading = true
      Request.get("/notice/limit", {
        params: { count: this.noticeLimit }
      }).then(response => {
        if (response.code === '0') {
          this.announcements = response.data || []
        }
      }).catch(() => {
        this.announcements = []
      }).finally(() => {
        this.noticeLoading = false
      })
    },
    // 获取统计数据
    async fetchStatistics() {
      this.statsLoading = true
      try {
        const [orderRes, salesRes, userRes] = await Promise.all([
          Request.get("/statistics/orders/monthly"),
          Request.get("/statistics/sales/monthly"),
          Request.get("/statistics/users/yearly")
        ])
        if (orderRes.code === '0') this.orderStats = orderRes.data
        if (salesRes.code === '0') this.salesStats = salesRes.data
        if (userRes.code === '0') this.userStats = userRes.data
      } catch (e) {
        console.error('获取统计数据失败:', e)
      } finally {
        this.statsLoading = false
      }
    },
    // 获取库存预警数量
    async fetchStockWarningCount() {
      try {
        const res = await Request.get('/stock-warning/count')
        if (res.code === '0') {
          this.stockWarningCount = res.data || 0
        }
      } catch (e) {
        this.stockWarningCount = 0
      }
    },
    getNoticeType(type) {
      const types = {
        1: 'primary',   // 普通通知
        2: 'success',   // 活动通知
        3: 'warning',   // 重要通知
        4: 'danger'     // 紧急通知
      }
      return types[type] || 'primary'
    },
    // 初始化图表
    initTopProductsChart() {
      this.topProductsChart = echarts.init(this.$refs.topProductsChart)
      this.updateTopProductsChart()
    },

    // 更新图表数据
    updateTopProductsChart() {
      if (!this.topProductsChart) return
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}: {c}件'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => value + '件'
          }
        },
        yAxis: {
          type: 'category',
          data: this.topProducts.map(item => item.name).reverse(),
          axisLabel: {
            formatter: (value) => {
              if (value.length > 10) {
                return value.substring(0, 10) + '...'
              }
              return value
            }
          }
        },
        series: [{
          name: '销售数量',
          type: 'bar',
          data: this.topProducts.map(item => item.salesCount).reverse(),
          itemStyle: {
            color: '#2c9678'
          },
          emphasis: {
            itemStyle: {
              color: '#36a88a'
            }
          }
        }]
      }
      this.topProductsChart.setOption(option)
    },

    // 获取热销商品数据
    async fetchTopProducts() {
      try {
        const response = await Request.get('/statistics/products/top5')
        if (response.code === '0' && response.data.topProducts) {
          this.topProducts = response.data.topProducts
          this.$nextTick(() => {
            this.updateTopProductsChart()
          })
        }
      } catch (error) {
        console.error('获取热销商品数据失败:', error)
      }
    },

    // 初始化品类图表
    initCategoryChart() {
      this.categoryChart = echarts.init(this.$refs.categoryChart)
      this.updateCategoryChart()
    },

    // 更新品类图表数据
    updateCategoryChart() {
      if (!this.categoryChart) return
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [
          {
            name: '品类销售',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data: this.categoryStats.map(item => ({
              name: item.name,
              value: item.salesCount
            }))
          }
        ],
        color: [
          '#2c9678', '#36a88a', '#E6A23C', '#F56C6C',
          '#909399', '#36CBCB', '#FFA2D3', '#9A60B4'
        ]
      }
      this.categoryChart.setOption(option)
    },

    // 获取品类统计数据
    async fetchCategoryStats() {
      try {
        const response = await Request.get('/statistics/category/sales')
        if (response.code === '0' && response.data.categoryStats) {
          this.categoryStats = response.data.categoryStats
          this.$nextTick(() => {
            this.updateCategoryChart()
          })
        }
      } catch (error) {
        console.error('获取品类统计数据失败:', error)
      }
    },

    // 统一处理图表缩放
    resizeCharts() {
      if (this.topProductsChart) {
        this.topProductsChart.resize()
      }
      if (this.categoryChart) {
        this.categoryChart.resize()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.dashboard-wrapper {
  padding: 16px;
}

.stat-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  min-width: 220px;

  .stat-header {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
  }

  .stat-icon {
    font-size: 24px;
    margin-right: 12px;
    color: #2c9678;

    &--warning {
      color: #e6a23c;
    }
  }

  .stat-title {
    font-size: 15px;
    color: #606266;
  }

  .stat-value {
    font-size: 26px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 14px;
  }

  .stat-footer {
    font-size: 13px;
    color: #909399;

    .up {
      color: #67c23a;
    }

    .down {
      color: #f56c6c;
    }
  }
}

.content-wrapper {
  display: flex;
  gap: 16px;
  margin-top: 16px;

  .chart-card {
    flex: 1;
    min-width: 380px;
  }

  .notice-card {
    flex: 1;
    min-width: 380px;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 12px;
}

.chart-content {
  height: 380px;
  .chart {
    width: 100%;
    height: 100%;
  }
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 12px;
}

.notice-content {
  max-height: 550px;
  overflow-y: auto;
}

.empty-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #c0c4cc;

  i {
    font-size: 36px;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.notice-item {
  margin-bottom: 8px;

  h4 {
    margin: 0 0 8px;
    color: #333;
    font-size: 15px;
  }

  .notice-text {
    color: #666;
    margin: 0;
    line-height: 1.6;
    font-size: 14px;
  }
}

:deep(.el-timeline-item__node--primary) {
  background-color: #2c9678;
}

:deep(.el-timeline-item__node--success) {
  background-color: #67c23a;
}

:deep(.el-timeline-item__node--warning) {
  background-color: #e6a23c;
}

:deep(.el-timeline-item__node--danger) {
  background-color: #f56c6c;
}

/* 确保图表容器有最小高度 */
.chart {
  min-height: 300px;
}

/* 适配小屏幕 */
@media screen and (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;

    .chart-card,
    .notice-card {
      width: 100%;
    }
  }
}
</style>