<template>
  <div class="cart-page">
    <front-header></front-header>
    <div class="main-content">
      <!-- 购物车标题 -->
      <div class="page-header">
        <h2>我的购物车</h2>
        <div class="cart-count">共 {{ totalItems }} 件商品</div>
      </div>

      <!-- 购物车主体 -->
      <div class="cart-content" v-loading="loading">
        <!-- 空购物车提示 -->
        <el-empty v-if="!loading && cartItems.length === 0" description="购物车是空的">
          <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
        </el-empty>

        <!-- 购物车列表 - 按商家分组 -->
        <template v-else>
          <div class="merchant-groups">
            <div v-for="(group, merchantId) in groupedCart" :key="merchantId" class="merchant-group">
              <!-- 商家头部 -->
              <div class="merchant-header">
                <el-checkbox v-model="group.allSelected" @change="() => handleMerchantSelectAll(merchantId)"></el-checkbox>
                <div class="merchant-info" @click="goToShop(merchantId)">
                  <i class="el-icon-shop"></i>
                  <span class="merchant-name">{{ group.merchantName }}</span>
                  <i class="el-icon-arrow-right"></i>
                </div>
              </div>

              <!-- 商家商品列表 -->
              <div class="merchant-items">
                <div v-for="item in group.items" :key="item.id" class="cart-item">
                  <el-checkbox v-model="item.selected" @change="handleItemSelect"></el-checkbox>

                  <div class="product-info">
                    <el-image :src="'api'+item.product.imageUrl" fit="cover" class="product-image" @click="$router.push(`/product/${item.product.id}`)">
                      <div slot="error" class="image-slot">
                        <i class="el-icon-picture-outline"></i>
                      </div>
                    </el-image>
                    <div class="product-detail">
                      <div class="product-name">{{ item.product.name }}</div>
                      <div class="product-stock">库存：{{ item.product.stock }}</div>
                    </div>
                  </div>

                  <div class="product-price">
                    <span class="current-price">
                      ¥{{ item.product.isDiscount ? item.product.discountPrice : item.product.price }}
                    </span>
                    <span class="original-price" v-if="item.product.isDiscount">
                      ¥{{ item.product.price }}
                    </span>
                  </div>

                  <div class="product-quantity">
                    <el-input-number v-model="item.quantity" :min="1" :max="item.product.stock" size="small"
                      @change="(value) => handleQuantityChange(item, value)"></el-input-number>
                  </div>

                  <div class="product-subtotal">
                    ¥{{ calculateSubtotal(item).toFixed(2) }}
                  </div>

                  <div class="product-actions">
                    <el-button type="text" class="delete-btn" @click="handleDelete(item)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 收货地址选择区域 -->
          <div class="address-section" v-if="hasSelected">
            <div class="section-title">收货地址</div>
            <div class="address-content">
              <el-select v-model="selectedAddressId" placeholder="请选择收货地址" class="address-select">
                <el-option v-for="addr in addresses" :key="addr.id" :label="formatAddress(addr)" :value="addr.id">
                  <div class="address-option">
                    <div class="receiver-info">
                      <span class="phone">{{ formatAddress(addr) }}</span>
                    </div>
                    <div class="address-detail">{{ addr.address }}</div>
                  </div>
                </el-option>
              </el-select>
              <el-button type="text" icon="el-icon-plus" @click="$router.push('/user-center')">
                添加新地址
              </el-button>
            </div>
          </div>

          <!-- 购物车底部 -->
          <div class="cart-footer">
            <div class="footer-left">
              <el-checkbox v-model="allSelected" @change="handleSelectAll">全选</el-checkbox>
              <el-button type="text" class="delete-btn" @click="handleBatchDelete">删除选中商品</el-button>
            </div>
            <div class="footer-right">
              <div class="total-info">
                <span>已选择 {{ selectedCount }} 件商品</span>
                <span class="total-price">
                  合计：<em>¥{{ totalPrice.toFixed(2) }}</em>
                </span>
              </div>
              <el-button type="primary" size="medium" :disabled="selectedCount === 0 || !selectedAddressId" @click="handleCheckout">
                结算
              </el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <front-footer></front-footer>
  </div>
</template>

<script>
import FrontHeader from '@/components/front/FrontHeader.vue'
import FrontFooter from '@/components/front/FrontFooter.vue'
import Request from '@/utils/request'

export default {
  name: 'Cart',
  components: {
    FrontHeader,
    FrontFooter
  },
  data() {
    return {
      userInfo: JSON.parse(localStorage.getItem('frontUser') || '{}'),
      loading: false,
      cartItems: [],
      allSelected: false,
      selectedAddressId: null,
      addresses: []
    }
  },
  computed: {
    totalItems() {
      return this.cartItems.length
    },
    selectedCount() {
      return this.cartItems.filter(item => item.selected).length
    },
    hasSelected() {
      return this.cartItems.some(item => item.selected)
    },
    totalPrice() {
      return this.cartItems
        .filter(item => item.selected)
        .reduce((total, item) => {
          const price = item.product.isDiscount === 1 ? item.product.discountPrice : item.product.price
          return total + price * item.quantity
        }, 0)
    },
    groupedCart() {
      const groups = {}
      this.cartItems.forEach(item => {
        const merchantId = item.product.merchantId
        if (!groups[merchantId]) {
          groups[merchantId] = {
            merchantId,
            merchantName: item.product.merchant?.username || `店铺${merchantId}`,
            items: [],
            allSelected: false
          }
        }
        groups[merchantId].items.push(item)
      })
      // 计算每个商家的全选状态
      Object.values(groups).forEach(group => {
        group.allSelected = group.items.length > 0 && group.items.every(item => item.selected)
      })
      return groups
    }
  },
  created() {
    this.getCartList()
    this.getAddresses()
  },
  methods: {
    formatAddress(addr) {
      return `${addr.receiver} ${addr.phone}`
    },
    async getCartList() {
      try {
        this.loading = true
        const userId = this.userInfo.id
        const res = await Request.get(`/cart/user/${userId}`)
        if (res.code === '0') {
          this.cartItems = res.data.map(item => ({
            ...item,
            selected: false
          }))
        }
      } catch (error) {
        console.error('获取购物车列表失败:', error)
        this.$message.error('获取购物车列表失败')
      } finally {
        this.loading = false
      }
    },
    async getAddresses() {
      try {
        const userId = this.userInfo.id
        const res = await Request.get(`/address/user/${userId}`)
        if (res.code === '0') {
          this.addresses = res.data
          if (this.addresses.length > 0) {
            this.selectedAddressId = this.addresses[0].id
          }
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
      }
    },
    handleSelectAll(checked) {
      this.cartItems.forEach(item => {
        item.selected = checked
      })
    },
    handleMerchantSelectAll(merchantId) {
      const group = this.groupedCart[merchantId]
      group.items.forEach(item => {
        item.selected = group.allSelected
      })
    },
    handleItemSelect() {
      // 更新全选状态
      this.allSelected = this.cartItems.length > 0 && this.cartItems.every(item => item.selected)
    },
    handleQuantityChange(item, value) {
      this.updateCartItem(item.id, { quantity: value })
    },
    async updateCartItem(id, data) {
      try {
        const res = await Request.put(`/cart/${id}`, data)
        if (res.code === '0') {
          this.getCartList()
        } else {
          this.$message.error(res.msg || '更新失败')
        }
      } catch (error) {
        console.error('更新购物车失败:', error)
        this.$message.error('更新购物车失败')
      }
    },
    async handleDelete(item) {
      try {
        const res = await Request.delete(`/cart/${item.id}`)
        if (res.code === '0') {
          this.$message.success('删除成功')
          this.getCartList()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        this.$message.error('删除失败')
      }
    },
    async handleBatchDelete() {
      const selectedIds = this.cartItems.filter(item => item.selected).map(item => item.id)
      if (selectedIds.length === 0) {
        this.$message.warning('请选择要删除的商品')
        return
      }

      try {
        const res = await Request.delete(`/cart/batch?ids=${selectedIds.join(',')}`)
        if (res.code === '0') {
          this.$message.success('删除成功')
          this.getCartList()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      } catch (error) {
        console.error('批量删除失败:', error)
        this.$message.error('批量删除失败')
      }
    },
    async handleCheckout() {
      const selectedItems = this.cartItems.filter(item => item.selected)
      if (selectedItems.length === 0) {
        this.$message.warning('请选择要结算的商品')
        return
      }

      if (!this.selectedAddressId) {
        this.$message.warning('请选择收货地址')
        return
      }

      const selectedAddress = this.addresses.find(addr => addr.id === this.selectedAddressId)
      const orderData = {
        userId: this.userInfo.id,
        addressId: this.selectedAddressId,
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.isDiscount ? item.product.discountPrice : item.product.price
        }))
      }

      try {
        const res = await Request.post('/order/batch', orderData)
        if (res.code === '0') {
          this.$message.success('下单成功')
          this.getCartList()
          this.$router.push('/order')
        } else {
          this.$message.error(res.msg || '下单失败')
        }
      } catch (error) {
        console.error('下单失败:', error)
        this.$message.error('下单失败')
      }
    },
    calculateSubtotal(item) {
      const price = item.product.isDiscount === 1 ? item.product.discountPrice : item.product.price
      return price * item.quantity
    },
    goToShop(merchantId) {
      this.$router.push(`/shop?merchantId=${merchantId}`)
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.main-content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.cart-count {
  color: #909399;
  font-size: 14px;
}

.cart-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 商家分组样式 */
.merchant-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.merchant-group {
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
}

.merchant-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.merchant-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #303133;
  font-size: 15px;
  font-weight: 500;
}

.merchant-info:hover {
  color: #409EFF;
}

.merchant-info i {
  font-size: 18px;
}

.merchant-items {
  padding: 0;
}

/* 购物车商品项样式 */
.cart-item {
  display: grid;
  grid-template-columns: 40px 380px 120px 120px 120px auto;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item:hover {
  background: #fafafa;
}

.product-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #ebeef5;
}

.product-image :deep(.el-image__inner) {
  border-radius: 8px;
}

.product-detail {
  flex: 1;
}

.product-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-name:hover {
  color: #409EFF;
}

.product-stock {
  font-size: 12px;
  color: #909399;
}

.product-price {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.current-price {
  font-size: 18px;
  color: #ff4757;
  font-weight: 600;
}

.original-price {
  font-size: 13px;
  color: #909399;
  text-decoration: line-through;
}

.product-quantity {
  display: flex;
  justify-content: center;
}

.product-subtotal {
  text-align: center;
  font-size: 18px;
  color: #ff4757;
  font-weight: 600;
}

.product-actions {
  display: flex;
  justify-content: center;
}

.delete-btn {
  color: #909399;
  font-size: 14px;
}

.delete-btn:hover {
  color: #ff4757;
}

/* 收货地址区域 */
.address-section {
  margin-top: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.address-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.address-select {
  width: 400px;
}

/* 购物车底部 */
.cart-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.delete-btn {
  color: #909399;
}

.delete-btn:hover {
  color: #ff4757;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.total-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: right;
}

.total-info span:first-child {
  font-size: 14px;
  color: #606266;
}

.total-price {
  font-size: 16px;
  color: #303133;
}

.total-price em {
  font-size: 24px;
  color: #ff4757;
  font-weight: 600;
  font-style: normal;
}

:deep(.el-button--medium) {
  height: 44px;
  padding: 0 32px;
  font-size: 16px;
}

:deep(.el-checkbox) {
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 992px) {
  .cart-item {
    grid-template-columns: 40px 1fr auto;
    gap: 12px;
  }

  .product-price,
  .product-quantity,
  .product-subtotal {
    grid-column: span 1;
  }
}
</style>
