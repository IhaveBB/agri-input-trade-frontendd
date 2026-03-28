<template>
  <div class="home" v-if="refresh" :key="refresh">
    <front-header></front-header>
    <div class="main-content">
      <!-- 加载动画 -->
      <div class="loading-container" v-if="loading">
        <div class="loading-spinner">
          <i class="el-icon-loading"></i>
        </div>
        <div class="loading-text">加载中...</div>
      </div>

      <!-- 轮播图和公告区域 -->
      <div v-else>
        <div class="carousel-notice-section">
          <div class="carousel-wrapper">
            <front-carousel></front-carousel>
          </div>
          <div class="notice-wrapper">
            <front-notice></front-notice>
          </div>
        </div>
        
        <front-category></front-category>

        <!-- 推荐产品区域 -->
        <div class="section">
          <div class="section-header">
            <div class="title-wrapper">
              <h2 class="section-title">
                <i class="el-icon-star-on"></i>
                <span>为您推荐</span>
              </h2>
              <div class="title-line"></div>
              <div class="subtitle">精选优质农资，专属于您的推荐</div>
            </div>
            <div class="more-btn" @click="$router.push('/products')">
              <span>查看更多</span>
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
          <el-row :gutter="24">
            <el-col :span="6" v-for="product in recommendProducts" :key="product.id">
              <product-card :product="product" @add-to-cart="handleAddToCart" @toggle-favorite="handleToggleFavorite"></product-card>
            </el-col>
          </el-row>
        </div>

        <!-- 新品上市区域 -->
        <div class="section">
          <div class="section-header">
            <div class="title-wrapper">
              <h2 class="section-title">
                <i class="el-icon-goods"></i>
                <span>新品尝鲜</span>
              </h2>
              <div class="title-line"></div>
              <div class="subtitle">精选热门产品，快速送达您家</div>
            </div>
            <div class="more-btn" @click="$router.push('/products?type=new')">
              <span>查看更多</span>
              <i class="el-icon-arrow-right"></i>
            </div>
          </div>
          <el-row :gutter="24">
            <el-col :span="6" v-for="product in newProducts" :key="product.id">
              <product-card :product="product" @add-to-cart="handleAddToCart" @toggle-favorite="handleToggleFavorite"></product-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <front-footer></front-footer>
  </div>
</template>

<script>
import FrontHeader from '@/components/front/FrontHeader.vue'
import FrontFooter from '@/components/front/FrontFooter.vue'
import FrontCarousel from '@/components/front/FrontCarousel.vue'
import FrontCategory from '@/components/front/FrontCategory.vue'
import ProductCard from '@/components/front/ProductCard.vue'
import FrontNotice from '@/components/front/FrontNotice.vue'
import Request from '@/utils/request'

export default {
  name: 'Home',
  components: {
    FrontHeader,
    FrontFooter,
    FrontCarousel,
    FrontCategory,
    ProductCard,
    FrontNotice
  },
  data() {
    return {
      recommendProducts: [],
      newProducts: [],
      isLoggedIn: false,
      refresh: true,
      loading: true
    }
  },
  computed: {
   
  },
  methods: {
    // 修改 checkLoginStatus 方法
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('frontUser');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
       
          // 检查用户角色，如果不是 USER 则注销
          if (user.role !== 'USER') {
            this.logout();
            this.$message.warning('请使用普通用户账号访问');
            return;
          }
          this.isLoggedIn = true;
        } catch (error) {
          this.logout();
        }
      } else {
        this.isLoggedIn = false;
      }
    },

    // 修改 logout 方法
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('frontUser');
      this.isLoggedIn = false;
      // 强制刷新整个页面
      window.location.reload()
   
    },

    // 获取推荐产品
    async getRecommendProducts() {
      try {
        this.loading = true; // 开始加载
        // 重新检查登录状态
        this.checkLoginStatus();
        
        let products = [];
        
        if (!this.isLoggedIn) {
          // 未登录状态 - 获取热销商品（冷启动降级策略）
          const res = await Request.get('/product/page?status=1&sortField=sales&sortOrder=desc&size=8');
          if (res.code === '0') {
            products = (res.data && (res.data.records || res.data)) || [];
          }
        } else {
          // 登录状态 - 获取个性化推荐（使用融合推荐算法）
          const userStr = localStorage.getItem('frontUser');
          if (!userStr) {
            throw new Error('User info not found');
          }
          const user = JSON.parse(userStr);
          const userId = user.id;

          const res = await Request.get('/api/recommendation/personalized');
          if (res.code === '0') {
            // 融合推荐接口返回的数据结构需要转换
            const recommendData = (res.data && (res.data.records || res.data)) || [];
            products = recommendData.map(item => ({
              id: item.productId,
              name: item.productName,
              price: item.price,
              imageUrl: item.imageUrl,
              categoryId: item.categoryId,
              categoryName: item.categoryName,
              // 保留推荐相关的额外信息
              recommendScore: item.score,
              recommendReason: item.reason,
              matchTags: item.matchTags
            }));
          }

          // 获取收藏状态
          try {
            const favRes = await Request.get(`/favorite/user/${userId}`);
            if (favRes.code === '0') {
              const favorites = favRes.data;
              products = products.map(product => ({
                ...product,
                isFavorite: favorites.some(f => f.productId === product.id && f.status === 1)
              }));
            }
          } catch (error) {
            console.error('获取收藏状态失败:', error);
            products = products.map(product => ({
              ...product,
              isFavorite: false
            }));
          }
        }

        // 设置推荐产品
        this.recommendProducts = products.map(product => ({
          ...product,
          isFavorite: product.isFavorite || false
        }));

      } catch (error) {
        console.error('获取推荐产品失败:', error);
        this.$message.error('获取推荐产品失败，请稍后重试');
      } finally {
        // 结束加载
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }
    },
    // 获取新品
    async getNewProducts() {
      try {
        const res = await Request.get('/product/page?status=1&sortField=updatedAt&sortOrder=desc&size=4')
        if (res.code === '0') {
          this.newProducts = (res.data && res.data.records || []).map(product => ({
            ...product,
            isFavorite: false
          }))
        }
      } catch (error) {
        console.error('获取新品失败:', error)
      }
    },
    // 添加到购物车
    handleAddToCart(product) {
      this.$message({
        type: 'success',
        message: '已添加到购物车'
      })
    },
    // 切换收藏状态
    async handleToggleFavorite({ product, status }) {
      // 更新本地数据
      const targetProduct = this.recommendProducts.find(p => p.id === product.id)
      if (targetProduct) {
        targetProduct.isFavorite = status === 1
      }
      
      // 同时更新新品列表中的收藏状态
      const newProduct = this.newProducts.find(p => p.id === product.id)
      if (newProduct) {
        newProduct.isFavorite = status === 1
      }
    }
  },
  created() {
    // 添加登录状态检查
    this.checkLoginStatus();
    this.getRecommendProducts();
    this.getNewProducts();
  },
  mounted() {
    const userStr = localStorage.getItem('frontUser');
    if (userStr) {
      this.isLoggedIn = true;
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #fff, #f5f7fa);
}
.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  background-color: #f8f8f8;
}
.section {
  margin: 24px 0;
  position: relative;
  padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.section::before {
  content: '';
  position: absolute;
  inset: -12px;
  background:
    radial-gradient(circle at 0% 0%, rgba(44, 150, 120, 0.04) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(44, 150, 120, 0.04) 0%, transparent 50%);
  z-index: -1;
  border-radius: 8px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 14px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 16px;
  border-left: 4px solid #2c9678;
}

.section-title i {
  color: #2c9678;
  font-size: 20px;
}

.title-line {
  display: none;
}

.subtitle {
  font-size: 13px;
  color: #999;
  position: relative;
  top: 2px;
  margin-left: 8px;
}

.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  background: #f0faf5;
  color: #2c9678;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e0e8e8;
}

.more-btn:hover {
  background: #2c9678;
  color: #fff;
  border-color: #2c9678;
}

.more-btn i {
  font-size: 14px;
  transition: transform 0.2s ease;
}

.more-btn:hover i {
  transform: translateX(2px);
}

.el-col {
  margin-bottom: 24px;
}

/* 确保最后一行的卡片底部没有多余的margin */
.section:last-child .el-col {
  margin-bottom: 0;
}

@media (max-width: 1200px) {
  .main-content {
    padding: 12px;
  }

  .section-title {
    font-size: 18px;
  }

  .section-title i {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .section {
    margin: 16px 0;
  }

  .section-title {
    font-size: 16px;
  }

  .section-title i {
    font-size: 16px;
  }

  .title-wrapper {
    gap: 8px;
  }

  .subtitle {
    font-size: 12px;
    display: none;
  }
}

.carousel-notice-section {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  height: 380px;
  margin-bottom: 32px;
}

.carousel-wrapper {
  flex: 1;
  min-width: 0;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.notice-wrapper {
  flex: 0 0 280px;
  height: 100%;
}

@media (max-width: 1200px) {
  .carousel-notice-section {
    flex-direction: column;
    gap: 16px;
    height: auto;
  }

  .notice-wrapper {
    max-width: none;
    height: 280px;
  }
}

/* 加载动画样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.loading-spinner {
  font-size: 48px;
  color: #2c9678;
  animation: pulse 1.5s infinite;
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  color: #909399;
  font-weight: 500;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}
</style> 