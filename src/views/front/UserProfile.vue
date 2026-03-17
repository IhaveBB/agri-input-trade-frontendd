<template>
  <div class="user-profile-page">
    <front-header />
    <div class="profile-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2 class="page-title">
          <i class="el-icon-user-solid"></i>
          我的画像
        </h2>
        <p class="page-subtitle">了解您的消费偏好和个性化特征</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <i class="el-icon-loading"></i>
        <span>正在加载您的画像...</span>
      </div>

      <!-- 画像内容 -->
      <div v-else-if="profile" class="profile-content">
        <!-- 顶部概览卡片 -->
        <div class="overview-section">
          <div class="overview-card">
            <div class="overview-item">
              <div class="overview-icon consumption">
                <i class="el-icon-money"></i>
              </div>
              <div class="overview-info">
                <div class="overview-label">消费能力</div>
                <div class="overview-value">{{ getConsumptionLabel(profile.consumptionLevel) }}</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-icon price">
                <i class="el-icon-coin"></i>
              </div>
              <div class="overview-info">
                <div class="overview-label">价格敏感度</div>
                <div class="overview-value">{{ getSensitivityLabel(profile.priceSensitivity) }}</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-icon orders">
                <i class="el-icon-shopping-cart-full"></i>
              </div>
              <div class="overview-info">
                <div class="overview-label">累计购买</div>
                <div class="overview-value">{{ profile.totalPurchases || 0 }} 单</div>
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-icon amount">
                <i class="el-icon-wallet"></i>
              </div>
              <div class="overview-info">
                <div class="overview-label">平均客单价</div>
                <div class="overview-value">¥{{ formatPrice(profile.avgOrderAmount) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-grid">
          <!-- 左侧：地域信息 -->
          <div class="profile-card location-card">
            <div class="card-header">
              <i class="el-icon-location"></i>
              <span>地域信息</span>
            </div>
            <div class="card-body">
              <div class="location-info">
                <div class="location-item">
                  <span class="label">所在地区：</span>
                  <span class="value">{{ profile.regionName || '未设置' }}</span>
                </div>
                <div class="location-item">
                  <span class="label">省份：</span>
                  <span class="value">{{ profile.province || '未设置' }}</span>
                </div>
                <div class="location-item">
                  <span class="label">城市：</span>
                  <span class="value">{{ profile.city || '未设置' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：品类偏好 -->
          <div class="profile-card preference-card">
            <div class="card-header">
              <i class="el-icon-star-on"></i>
              <span>品类偏好</span>
            </div>
            <div class="card-body">
              <div v-if="profile.categoryPreferences && profile.categoryPreferences.length > 0">
                <div
                  v-for="(pref, index) in profile.categoryPreferences"
                  :key="index"
                  class="preference-item"
                >
                  <div class="preference-info">
                    <span class="preference-name">{{ pref.categoryName }}</span>
                    <span class="preference-percent">{{ Math.round(pref.weight * 100) }}%</span>
                  </div>
                  <div class="preference-bar">
                    <div
                      class="preference-fill"
                      :style="{ width: (pref.weight * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-tip">
                <i class="el-icon-info"></i>
                <span>暂无品类偏好数据，多购买商品后即可生成</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部：推荐说明 -->
        <div class="profile-card tips-card">
          <div class="card-header">
            <i class="el-icon-info-filled"></i>
            <span>个性化推荐说明</span>
          </div>
          <div class="card-body">
            <div class="tips-list">
              <div class="tip-item">
                <i class="el-icon-check"></i>
                <span>系统根据您的<b>历史购买记录</b>分析您的品类偏好</span>
              </div>
              <div class="tip-item">
                <i class="el-icon-check"></i>
                <span>根据您的<b>消费能力</b>推荐合适价格区间的商品</span>
              </div>
              <div class="tip-item">
                <i class="el-icon-check"></i>
                <span>结合您的<b>所在地区</b>推荐适用的农资产品</span>
              </div>
              <div class="tip-item">
                <i class="el-icon-check"></i>
                <span>根据<b>当前季节</b>推荐应季的农资商品</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 未登录状态 -->
      <div v-else class="empty-container">
        <i class="el-icon-user"></i>
        <p>请先登录查看您的画像</p>
        <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
      </div>
    </div>
    <front-footer />
  </div>
</template>

<script>
import FrontHeader from '@/components/front/FrontHeader.vue'
import FrontFooter from '@/components/front/FrontFooter.vue'
import Request from '@/utils/request'

export default {
  name: 'UserProfile',
  components: {
    FrontHeader,
    FrontFooter
  },
  data() {
    return {
      loading: true,
      profile: null
    }
  },
  created() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        this.loading = true
        const token = localStorage.getItem('token')
        if (!token) {
          this.profile = null
          return
        }

        const res = await Request.get('/api/recommendation/profile/me')
        if (res.code === '0' && res.data) {
          this.profile = res.data
        }
      } catch (error) {
        console.error('加载用户画像失败:', error)
        this.$message.error('加载画像失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    getConsumptionLabel(level) {
      const labels = {
        'HIGH': '高消费',
        'MEDIUM': '中等消费',
        'LOW': '经济型'
      }
      return labels[level] || '未知'
    },

    getSensitivityLabel(sensitivity) {
      const labels = {
        'LOW': '低敏感',
        'MEDIUM': '中等敏感',
        'HIGH': '高敏感'
      }
      return labels[sensitivity] || '未知'
    },

    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    }
  }
}
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  min-height: calc(100vh - 200px);
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  color: #333;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.page-title i {
  color: #2c9678;
}

.page-subtitle {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading-container i {
  font-size: 40px;
  color: #2c9678;
  margin-bottom: 16px;
}

.empty-container i {
  font-size: 60px;
  color: #ddd;
  margin-bottom: 16px;
}

.empty-container p {
  color: #999;
  margin-bottom: 20px;
}

/* 概览区域 */
.overview-section {
  margin-bottom: 24px;
}

.overview-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.overview-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.overview-icon.consumption {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.overview-icon.price {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.overview-icon.orders {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.overview-icon.amount {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.overview-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.overview-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 画像网格 */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-bottom: 24px;
}

.profile-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.card-header i {
  color: #2c9678;
}

.card-body {
  padding: 20px;
}

/* 地域信息 */
.location-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.location-item .label {
  color: #666;
}

.location-item .value {
  font-weight: 500;
  color: #333;
}

/* 品类偏好 */
.preference-item {
  margin-bottom: 16px;
}

.preference-item:last-child {
  margin-bottom: 0;
}

.preference-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.preference-name {
  color: #333;
  font-weight: 500;
}

.preference-percent {
  color: #2c9678;
  font-weight: 600;
}

.preference-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.preference-fill {
  height: 100%;
  background: linear-gradient(90deg, #2c9678, #38ef7d);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.empty-tip {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-tip i {
  font-size: 32px;
  margin-bottom: 10px;
  display: block;
}

/* 提示卡片 */
.tips-card {
  margin-top: 24px;
}

.tips-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
}

.tip-item i {
  color: #52c41a;
}

.tip-item span {
  color: #333;
}

@media (max-width: 768px) {
  .overview-card {
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .tips-list {
    grid-template-columns: 1fr;
  }
}
</style>
