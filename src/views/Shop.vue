<template>
  <div class="shop-page">
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
      </div>
    </div>

    <!-- 营业执照 -->
    <div v-if="shopInfo.businessLicense" class="business-license-section">
      <el-card shadow="hover">
        <div slot="header" class="card-header">
          <span><i class="el-icon-document"></i> 营业执照</span>
          <el-button type="text" @click="showLicense = true">查看大图</el-button>
        </div>
        <img :src="shopInfo.businessLicense" alt="营业执照" class="license-image" @click="showLicense = true" />
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
                  <img :src="product.imageUrl || '/placeholder.png'" :alt="product.name" @click="goToProduct(product.id)" />
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
                <p class="review-content">{{ review.content }}</p>
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

    <!-- 营业执照大图预览 -->
    <el-dialog :visible.sync="showLicense" title="营业执照" width="600px">
      <img :src="shopInfo.businessLicense" alt="营业执照" class="license-large" />
    </el-dialog>
  </div>
</template>

<script>
import { getShopInfo, getShopProducts, getShopReviews, getShopStatistics } from '@/api/shop'
import Request from '@/utils/request'

export default {
  name: 'ShopPage',
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
      try {
        const cartItem = {
          userId: this.getUserId(),
          productId: product.id,
          count: 1
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
    }
  }
}
</script>

<style lang="scss" scoped>
.shop-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  color: white;

  .shop-info {
    display: flex;
    align-items: center;
    gap: 20px;

    .shop-avatar {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }

    .shop-details {
      .shop-name {
        font-size: 24px;
        margin: 0 0 8px 0;
      }

      .shop-location {
        margin: 0 0 10px 0;
        opacity: 0.9;
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
          }

          .stars {
            .el-icon-star-on {
              color: rgba(255, 255, 255, 0.3);
              font-size: 18px;

              &.active {
                color: #ffd700;
              }
            }
          }
        }

        .rating-stats {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
  }

  .shop-stats {
    display: flex;
    gap: 30px;

    .stat-item {
      text-align: center;

      .value {
        display: block;
        font-size: 28px;
        font-weight: bold;
      }

      .label {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
}

.business-license-section {
  margin-bottom: 20px;

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
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
}

.main-content {
  .card-header {
    font-weight: 500;
  }

  .product-list {
    .product-item {
      display: flex;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #eee;

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
          border-radius: 8px;
          cursor: pointer;
        }
      }

      .product-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .product-name {
          font-size: 16px;
          margin: 0 0 8px 0;
          cursor: pointer;
          color: #333;

          &:hover {
            color: #667eea;
          }
        }

        .product-desc {
          font-size: 14px;
          color: #666;
          margin: 0 0 8px 0;
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
            color: #ff4400;
            font-weight: bold;
          }

          .discount-price {
            font-size: 14px;
            color: #ff6b6b;
          }
        }
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
    margin-top: 20px;
    text-align: center;
  }
}

.sidebar {
  .card-header {
    font-weight: 500;
  }

  .review-list {
    max-height: 600px;
    overflow-y: auto;

    .review-item {
      padding: 15px 0;
      border-bottom: 1px solid #eee;

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
    grid-template-columns: 1fr;
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
