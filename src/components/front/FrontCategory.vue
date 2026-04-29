<template>
  <div class="category-container">
    <div class="category-wrapper">
      <div 
        v-for="(category, index) in visibleCategories" 
        :key="index" 
        class="category-item"
        @click="handleCategoryClick(category)"
      >
        <div class="icon-wrapper">
          <img :src="getCategoryImage(category)" :alt="category.name" class="category-img" />
        </div>
        <span class="category-name">{{ category.name }}</span>
        <div class="hover-indicator"></div>
      </div>
      <div 
        v-if="showMore" 
        class="category-item more-item"
        @click="handleMoreClick"
      >
        <div class="icon-wrapper">
          <img :src="genCategoryImg('更多')" alt="更多分类" class="category-img" />
        </div>
        <span class="category-name">更多分类</span>
        <div class="hover-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Request from '@/utils/request.js'
import { normalizeImageUrl } from '@/utils/productImage'

export default {
  name: 'FrontCategory',
  data() {
    return {
      categories: [],
      maxVisible: 6
    }
  },
  computed: {
    visibleCategories() {
      return this.categories.slice(0, this.maxVisible)
    },
    showMore() {
      return this.categories.length > this.maxVisible
    }
  },
  created() {
    this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      try {
        // 获取一级分类（顶级分类）
        const res = await Request.get('/category/top')
        if (res.code === '0') {
          this.categories = res.data.map(item => ({
            ...item,
            icon: item.icon
          }))
        } else {
          // 备选：从 all 接口获取并筛选一级分类
          await this.fetchCategoriesFallback()
        }
      } catch (error) {
        console.error('获取分类数据失败:', error)
        // 尝试使用备选方案
        await this.fetchCategoriesFallback()
      }
    },
    async fetchCategoriesFallback() {
      try {
        const res = await Request.get('/category/all')
        if (res.code === '0') {
          // 只取一级分类（parentId为0或没有parentId的）
          this.categories = res.data
            .filter(item => !item.parentId || item.parentId === 0)
            .map(item => ({
              ...item,
              icon: item.icon
            }))
        }
      } catch (error) {
        console.error('获取分类数据失败:', error)
      }
    },
    getCategoryIcon(name) {
      const iconMap = {
        '蔬菜': 'el-icon-food',
        '水果': 'el-icon-apple',
        '谷物': 'el-icon-dish',
        '干货': 'el-icon-dessert',
        '肉类': 'el-icon-food',
        '水产': 'el-icon-dish-1',
        '农副产品': 'el-icon-sugar',
        '其他': 'el-icon-more'
      }
      return iconMap[name] || 'el-icon-more'
    },
    handleCategoryClick(category) {
      this.$router.push({
        name: 'category',
        params: { id: category.id },
        query: { name: category.name }
      })
    },
    handleMoreClick() {
      this.$router.push('/products')
    },
    getCategoryImage(category) {
      const imageUrl = category.imageUrl || category.image || category.coverImage || category.picture || category.iconUrl
      if (imageUrl) {
        const normalized = normalizeImageUrl(imageUrl)
        if (normalized) return normalized
      }
      const icon = category.icon ? String(category.icon) : ''
      if (icon && /^(https?:)?\/\//.test(icon)) {
        return icon
      }
      if (icon && (icon.startsWith('/') || icon.startsWith('data:image'))) {
        const normalized = normalizeImageUrl(icon)
        if (normalized) return normalized
      }
      return this.genCategoryImg(category.name)
    },
    genCategoryImg(name) {
      const s = 160
      const c = document.createElement('canvas')
      c.width = s; c.height = s
      const ctx = c.getContext('2d')
      let h = 0
      for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
      const hue = Math.abs(h) % 360

      const bg = ctx.createLinearGradient(0, 0, s, s)
      bg.addColorStop(0, `hsl(${hue}, 38%, 96%)`)
      bg.addColorStop(1, `hsl(${(hue + 24) % 360}, 42%, 88%)`)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, s, s)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)'
      ctx.beginPath()
      ctx.arc(s * 0.78, s * 0.2, s * 0.28, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `hsla(${hue}, 45%, 52%, 0.12)`
      ctx.beginPath()
      ctx.arc(s * 0.18, s * 0.82, s * 0.34, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = `hsla(${hue}, 35%, 52%, 0.28)`
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(s * 0.24, s * 0.68)
      ctx.quadraticCurveTo(s * 0.5, s * 0.56, s * 0.76, s * 0.68)
      ctx.stroke()

      ctx.fillStyle = `hsl(${hue}, 42%, 42%)`
      ctx.font = '700 36px "PingFang SC","Microsoft YaHei",sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const t = Array.from(name || '分类').slice(0, 3).join('')
      ctx.fillText(t, s / 2, s / 2)

      ctx.fillStyle = `hsla(${hue}, 42%, 42%, 0.16)`
      ctx.fillRect(s * 0.32, s * 0.66, s * 0.36, 4)

      return c.toDataURL()
    }
  }
}
</script>

<style scoped>
.category-container {
  background: linear-gradient(to right, #ffffff, #f8faf5);
  padding: 16px 0;
  margin: 16px 0;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.category-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 0% 0%, rgba(44, 150, 120, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(44, 150, 120, 0.03) 0%, transparent 50%);
  opacity: 0.8;
  z-index: 0;
}

.category-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.category-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  border-radius: 12px;
  border: 1px solid #e0ebe0;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(44, 150, 120, 0.08);
}

.category-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-item:hover .category-img {
  transform: scale(1.06);
}

.icon {
  font-size: 24px;
  color: #2c9678;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(44, 150, 120, 0.1),
    rgba(44, 150, 120, 0.15)
  );
  border-radius: 12px;
  transition: all 0.3s ease;
}

.category-item:hover .icon-bg {
  transform: scale(1.1) rotate(-5deg);
  background: linear-gradient(135deg, 
    rgba(44, 150, 120, 0.15),
    rgba(44, 150, 120, 0.2)
  );
}

.category-item:hover .icon {
  transform: scale(1.1);
}

.category-name {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.hover-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #2c9678;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.category-item:hover .hover-indicator {
  width: 20px;
}

.more-item .icon-bg {
  background: linear-gradient(135deg, 
    rgba(144, 147, 153, 0.1),
    rgba(144, 147, 153, 0.15)
  );
}

.more-item .icon {
  color: #909399;
}

.more-item:hover .icon-bg {
  background: linear-gradient(135deg, 
    rgba(144, 147, 153, 0.15),
    rgba(144, 147, 153, 0.2)
  );
}

.more-item:hover .hover-indicator {
  background: #909399;
}

@media (max-width: 768px) {
  .category-wrapper {
    flex-wrap: wrap;
  }
  
  .category-item {
    flex: 0 0 calc(25% - 9px);
  }
  
  .icon-wrapper {
    width: 44px;
    height: 44px;
  }
  
  .icon {
    font-size: 20px;
  }
  
  .category-name {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .category-item {
    flex: 0 0 calc(33.33% - 8px);
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .icon {
    font-size: 18px;
  }
}
</style> 
