<template>
  <div class="shop-page">
    <front-header></front-header>
    <div class="main-wrapper">
      <!-- 店铺头部信息 -->
      <div class="shop-header">
        <div class="shop-info">
          <div class="shop-avatar">
            <i class="el-icon-shop"></i>
          </div>
          <div class="shop-details">
            <h1 class="shop-name">{{ shopInfo.shopName }}</h1>
            <p class="shop-location">
              <i class="el-icon-location"></i> {{ shopInfo.location || '暂无位置信息' }}
            </p>
            <div class="shop-rating">
              <div class="rating-score">
                <span class="score">{{ shopInfo.rating ? shopInfo.rating.toFixed(1) : '0.0' }}</span>
                <div class="stars">
                  <i v-for="i in 5" :key="i" class="el-icon-star-on" :class="{ 'active': i <= Math.round(shopInfo.rating) }"></i>
                </div>
              </div>
              <div class="rating-stats">
                <span> {{ shopInfo.reviewCount }} 条评价</span>
                <span> | 好评率 {{ statistics.positiveRate }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="shop-stats">
          <div class="stat-item">
            <span class="value">{{ shopInfo.productCount }}</span>
            <span class="label">宝贝数</span>
          </div>
          <div class="stat-item">
            <span class="value">{{ shopInfo.totalSales }}</span>
            <span class="label">总销量</span>
          </div>
          <div class="stat-item" v-if="shopInfo.businessLicense">
            <el-button type="primary" size="small" @click="showLicense = true">
              <i class="el-icon-document"></i> 营业执照
            </el-button>
          </div>
        </div>
      </div>

      <!-- 营业执照 -->
      <div v-if="false && shopInfo.businessLicense" class="business-license-section">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span><i class="el-icon-document"></i> 营业执照</span>
            <el-button type="text" @click="showLicense = true">查看大图</el-button>
          </div>
          <img :src="getImageSrc(shopInfo.businessLicense)" alt="营业执照" class="license-image" @click="showLicense = true" />
        </el-card>
      </div>

      <!-- 主体内容 -->
      <div class="shop-main">
        <!-- 左侧：商品列表 -->
        <div class="main-content">
          <el-card shadow="hover">
            <div slot="header" class="card-header">
              <span>店内商品</span>
            </div>
            <div class="product-list">
              <div v-loading="productsLoading">
                <div v-for="product in products" :key="product.id" class="product-item">
                  <div class="product-image">
                    <img :src="getProductImage(product)" :alt="product.name" @click="goToProduct(product.id)" />
                  </div>
                  <div class="product-info">
                    <h3 class="product-name" @click="goToProduct(product.id)">{{ product.name }}</h3>
                    <p class="product-desc">{{ product.description || '暂无描述' }}</p>
                    <div class="product-meta">
                      <span>销量：{{ product.salesCount }}</span>
                      <span>库存：{{ product.stock }}</span>
                    </div>
                    <div class="product-price">
                      <span class="current-price">¥{{ product.price }}</span>
                      <span v-if="product.isDiscount === 1" class="discount-price">折扣价：¥{{ product.discountPrice }}</span>
                    </div>
                    <el-button type="primary" size="small" @click="addToCart(product)">加入购物车</el-button>
                  </div>
                </div>
                <div v-if="!productsLoading && products.length === 0" class="empty-state">
                  <i class="el-icon-shopping-bag-2"></i>
                  <p>暂无商品</p>
                </div>
              </div>
            </div>
            <div class="pagination">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="productTotal"
                :page-size="10"
                @current-change="handleProductPageChange"
              />
            </div>
          </el-card>
        </div>

      <!-- 右侧：店铺评价 -->
      <div class="sidebar">
        <el-card shadow="hover">
          <div slot="header" class="card-header">
            <span>店铺评价</span>
          </div>
          <div class="review-list">
            <div v-loading="reviewsLoading">
              <div v-for="review in reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <span class="user-name">{{ review.username }}</span>
                  <div class="review-rating">
                    <i v-for="i in 5" :key="i" class="el-icon-star-on" :class="{ 'active': i <= review.rating }"></i>
                  </div>
                </div>
                <p class="review-product">购买：{{ review.productName }}</p>
                <div class="review-content" v-html="renderHtmlContent(review.content)"></div>
                <p class="review-date">{{ review.createdAt }}</p>
              </div>
              <div v-if="!reviewsLoading && reviews.length === 0" class="empty-state">
                <i class="el-icon-chat-dot-round"></i>
                <p>暂无评价</p>
              </div>
            </div>
          </div>
          <div class="pagination">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="reviewTotal"
              :page-size="5"
              @current-change="handleReviewPageChange"
            />
          </div>
        </el-card>
      </div>
    </div>
    </div>

    <!-- 营业执照大图预览 -->
    <el-dialog :visible.sync="showLicense" title="营业执照" width="600px">
      <img :src="getImageSrc(shopInfo.businessLicense)" alt="营业执照" class="license-large" />
    </el-dialog>
    <front-footer></front-footer>
  </div>
</template>

<script>
import FrontHeader from '@/components/front/FrontHeader.vue'
import FrontFooter from '@/components/front/FrontFooter.vue'
import { getShopInfo, getShopProducts, getShopReviews, getShopStatistics } from '@/api/shop'
import Request from '@/utils/request'
import { getProductImageSrc, normalizeImageUrl } from '@/utils/productImage'

export default {
  name: 'ShopPage',
  components: {
    FrontHeader,
    FrontFooter
  },
  data() {
    return {
      merchantId: null,
      shopInfo: {
        shopName: '',
        merchantName: '',
        location: '',
        businessLicense: '',
        rating: 0,
        reviewCount: 0,
        productCount: 0,
        totalSales: 0
      },
      statistics: {
        positiveRate: '0%'
      },
      products: [],
      productTotal: 0,
      productPage: 1,
      reviews: [],
      reviewTotal: 0,
      reviewPage: 1,
      productsLoading: false,
      reviewsLoading: false,
      showLicense: false
    }
  },
  created() {
    this.merchantId = this.$route.query.merchantId
    if (!this.merchantId) {
      this.$message.error('缺少商户 ID')
      this.$router.push('/')
      return
    }
    this.loadShopData()
  },
  methods: {
    async loadShopData() {
      await this.loadShopInfo()
      await this.loadProducts()
      await this.loadReviews()
    },
    async loadShopInfo() {
      const res = await getShopInfo(this.merchantId)
      if (res.code === '0' && res.data) {
        this.shopInfo = res.data
      }
      const statsRes = await getShopStatistics(this.merchantId)
      if (statsRes.code === '0' && statsRes.data) {
        this.statistics = statsRes.data.statistics || {}
      }
    },
    async loadProducts() {
      this.productsLoading = true
      const res = await getShopProducts(this.merchantId, this.productPage, 10)
      if (res.code === '0' && res.data) {
        this.products = res.data.products || []
        this.productTotal = res.data.total || 0
      }
      this.productsLoading = false
    },
    async loadReviews() {
      this.reviewsLoading = true
      const res = await getShopReviews(this.merchantId, this.reviewPage, 5)
      if (res.code === '0' && res.data) {
        this.reviews = res.data.reviews || []
        this.reviewTotal = res.data.total || 0
      }
      this.reviewsLoading = false
    },
    goToProduct(productId) {
      this.$router.push(`/product/${productId}`)
    },
    async addToCart(product) {
      // 检查用户是否登录
      const userId = this.getUserId()
      if (!userId) {
        this.$message.error('请先登录')
        this.$router.push('/login')
        return
      }
      try {
        const cartItem = {
          userId: userId,
          productId: product.id,
          quantity: 1
        }
        const res = await Request.post('/cart', cartItem)
        if (res.code === '0') {
          this.$message.success('已加入购物车')
        } else {
          this.$message.error(res.msg || '加入购物车失败')
        }
      } catch (error) {
        this.$message.error('加入购物车失败')
      }
    },
    getUserId() {
      const user = localStorage.getItem('frontUser')
      if (user) {
        const userInfo = JSON.parse(user)
        return userInfo.id
      }
      return null
    },
    handleProductPageChange(page) {
      this.productPage = page
      this.loadProducts()
    },
    handleReviewPageChange(page) {
      this.reviewPage = page
      this.loadReviews()
    },
    renderHtmlContent(content) {
      if (!content) return ''
      // 移除 <p> 标签，保留内部内容
      return content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '<br/>')
    },
    getProductImage(product) {
      return getProductImageSrc(product)
    },
    // 处理图片 src，如果是 base64 则直接使用，否则添加 api 前缀
    getImageSrc(url) {
      return normalizeImageUrl(url)
    }
  }
}
</script>

<style lang="scss" scoped>
.shop-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.main-wrapper {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 24px 30px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-bottom: 3px solid #2c9678;

  .shop-info {
    display: flex;
    align-items: center;
    gap: 20px;

    .shop-avatar {
      width: 80px;
      height: 80px;
      background: #e8f5e9;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      color: #2c9678;
    }

    .shop-details {
      .shop-name {
        font-size: 24px;
        margin: 0 0 8px 0;
        color: #333;
      }

      .shop-location {
        margin: 0 0 10px 0;
        color: #666;
      }

      .shop-rating {
        display: flex;
        align-items: center;
        gap: 15px;

        .rating-score {
          display: flex;
          align-items: center;
          gap: 8px;

          .score {
            font-size: 28px;
            font-weight: bold;
            color: #ff6b00;
          }

          .stars {
            .el-icon-star-on {
              color: #ddd;
              font-size: 18px;

              &.active {
                color: #ff6b00;
              }
            }
          }
        }

        .rating-stats {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }

  .shop-stats {
    display: flex;
    gap: 30px;
    align-items: center;

    .stat-item {
      text-align: center;

      .value {
        display: block;
        font-size: 28px;
        font-weight: bold;
        color: #333;
      }

      .label {
        font-size: 14px;
        color: #666;
      }
    }
  }
}

.business-license-section {
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .license-image {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    cursor: pointer;
    border-radius: 8px;
  }
}

.shop-main {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  min-width: 0;

  .card-header {
    font-weight: 600;
    color: #333;
    border-left: 4px solid #2c9678;
    padding-left: 12px;
  }

  .product-list {
    max-height: 500px;
    overflow-y: auto;
    padding: 8px;

    .product-item {
      display: flex;
      gap: 15px;
      padding: 16px;
      margin-bottom: 12px;
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

      &:last-child {
        border-bottom: none;
      }

      .product-image {
        width: 120px;
        height: 120px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
        }
      }

      .product-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .product-name {
          font-size: 16px;
          margin: 0 0 8px 0;
          cursor: pointer;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;

          &:hover {
            color: #2c9678;
          }
        }

        .product-desc {
          font-size: 14px;
          color: #666;
          margin: 0 0 8px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          max-width: 100%;
        }

        .product-meta {
          font-size: 13px;
          color: #999;
          display: flex;
          gap: 15px;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 10px;

          .current-price {
            font-size: 20px;
            color: #e43932;
            font-weight: bold;
          }

          .discount-price {
            font-size: 14px;
            color: #e43932;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
      background: #fff;
      border-radius: 6px;

      i {
        font-size: 48px;
        display: block;
        margin-bottom: 10px;
      }
    }
  }

  .pagination {
    margin-top: 20px;
    text-align: center;
  }
}

.sidebar {
  width: 320px;
  flex-shrink: 0;

  .card-header {
    font-weight: 600;
    color: #333;
    border-left: 4px solid #2c9678;
    padding-left: 12px;
  }

  .review-list {
    max-height: 600px;
    overflow-y: auto;
    padding: 8px;

    .review-item {
      padding: 16px;
      margin-bottom: 12px;
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

      &:last-child {
        border-bottom: none;
      }

      .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .user-name {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .review-rating {
          .el-icon-star-on {
            color: #ffcc00;
            font-size: 14px;

            &.active {
              color: #ffcc00;
            }
          }
        }
      }

      .review-product {
        font-size: 13px;
        color: #999;
        margin: 0 0 8px 0;
      }

      .review-content {
        font-size: 14px;
        color: #333;
        margin: 0 0 8px 0;
        line-height: 1.6;
        word-wrap: break-word;

        p {
          margin: 0;
        }
      }

      .review-date {
        font-size: 12px;
        color: #999;
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;

      i {
        font-size: 48px;
        display: block;
        margin-bottom: 10px;
      }
    }
  }

  .pagination {
    margin-top: 15px;
    text-align: center;
  }
}

.license-large {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .shop-main {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .shop-header {
    flex-direction: column;
    text-align: center;

    .shop-info {
      flex-direction: column;
    }

    .shop-stats {
      margin-top: 20px;
    }
  }
}
</style>
