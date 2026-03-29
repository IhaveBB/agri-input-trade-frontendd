<template>
  <div class="front-header">
    <div class="header-container">
      <div class="logo-area" @click="$router.push('/')">
        <i class="el-icon-shopping-cart-2"></i>
        <span>农资采销</span>
      </div>

      <el-menu mode="horizontal" :router="true" :default-active="activePath" class="nav-menu">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/products">全部商品</el-menu-item>
        <el-menu-item index="/cart">购物车</el-menu-item>
        <el-menu-item index="/order">我的订单</el-menu-item>
        <el-menu-item index="/articles" class="nav-item">
            资讯中心
          </el-menu-item>
      </el-menu>

      <div class="right-section">
        <div class="search-box">
          <el-input 
            v-model="searchKey" 
            placeholder="搜索产品..." 
            @keyup.enter.native="handleSearch"
            class="search-input">
            <i slot="prefix" class="el-icon-search"></i>
          </el-input>
        </div>

        <div class="user-actions">
          <template v-if="!isLoggedIn">
            <el-button type="text" class="action-btn" @click="goToLogin">
              <i class="el-icon-user"></i>
              <span>登录</span>
            </el-button>
          </template>
          <template v-else>
            <el-dropdown trigger="click">
              <div class="user-info">
                <span class="username">{{ userInfo.username }}</span>
                <i class="el-icon-arrow-down el-icon--right"></i>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="goToUserCenter">
                  <i class="el-icon-user"></i> 个人中心
                </el-dropdown-item>
                <el-dropdown-item @click.native="goToFavorite">
                  <i class="el-icon-star-off"></i> 我的收藏
                </el-dropdown-item>
                <el-dropdown-item  @click.native="logout">
                  <i class="el-icon-switch-button"></i> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>

          <!-- <el-button type="text" class="action-btn admin-btn" @click="goToAdmin">
            <i class="el-icon-s-tools"></i>
            <span>后台</span>
          </el-button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import router from '@/router';

export default {
  name: 'FrontHeader',
  data() {
    return {
      searchKey: '',
      isLoggedIn: false,
      userInfo: {},
    
    }
  },
  created() {
    this.checkLoginStatus();

  },
  mounted() {

  },
  methods: {
    checkLoginStatus() {
      const userInfo = localStorage.getItem('frontUser');
      if (userInfo) {
        this.isLoggedIn = true;
        this.userInfo = JSON.parse(userInfo);
      }
    },
    goToLogin() {
      this.$router.push('/login')
    },
    goToUserCenter() {
      this.$router.push('/user-center')
    },
    goToFavorite() {
      if (!this.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      this.$router.push('/favorite')
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('frontUser');
      localStorage.removeItem('backUser');
      localStorage.removeItem('userMenuList');
      this.isLoggedIn = false;
      this.userInfo = {};
      this.$message.success('已退出登录');
      this.$router.push('/');
      window.location.reload()
    },
    handleSearch() {
      if (!this.searchKey.trim()) {
        this.$message({
          type: 'warning',
          message: '请输入搜索关键词'
        })
        return
      }

      this.$router.push({
        path: '/search',
        query: {
          keyword: this.searchKey.trim()
        }
      })

      this.searchKey = ''
    },
    goToAdmin() {
      // 检查是否已登录
      const userMenuList = localStorage.getItem('userMenuList');
      const backUser = localStorage.getItem('backUser');
      if (!userMenuList || !backUser) {
        this.$message.warning('请先登录');
        this.$router.push('/login');
        return;
      }
      
      this.$router.push('/showView');
    }
  },
  computed: {
    activePath() {
      return this.$router.currentRoute.fullPath;
    }
  }
}
</script>

<style scoped>
.front-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  height: 60px;
  border-bottom: 2px solid #2c9678;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #2c9678;
  font-size: 18px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.logo-area:hover {
  opacity: 0.8;
}

.logo-area i {
  font-size: 22px;
  color: #2c9678;
}

.nav-menu {
  border: none;
  background: transparent;
  height: 60px;
  line-height: 60px;
  flex: 1;
}

:deep(.el-menu--horizontal > .el-menu-item) {
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  font-size: 15px;
  border: none !important;
  transition: color 0.2s ease;
}

:deep(.el-menu--horizontal > .el-menu-item:hover) {
  color: #2c9678;
  background: transparent;
}

:deep(.el-menu--horizontal > .el-menu-item.is-active) {
  color: #2c9678;
  font-weight: 500;
  border-bottom: 2px solid #2c9678 !important;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  width: 220px;
}

.search-input :deep(.el-input__inner) {
  height: 32px;
  line-height: 32px;
  border-radius: 16px;
  background: #f5f7fa;
  border: 1px solid transparent;
  padding-left: 35px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__inner:focus) {
  background: #fff;
  border-color: #2c9678;
  box-shadow: 0 0 0 2px rgba(44, 150, 120, 0.1);
}

.search-input :deep(.el-input__prefix) {
  left: 12px;
  display: flex;
  align-items: center;
  height: 100%;
}

.search-input :deep(.el-input__prefix i) {
  font-size: 15px;
  color: #909399;
}

.search-input :deep(.el-input__inner:focus + .el-input__prefix i) {
  color: #2c9678;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu) {
  padding: 6px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 10px 16px;
  border-radius: 6px;
  margin: 2px 0;
  line-height: 1;
}

:deep(.el-dropdown-menu__item i) {
  font-size: 15px;
  color: #606266;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(44, 150, 120, 0.08);
  color: #2c9678;
}

:deep(.el-dropdown-menu__item:hover i) {
  color: #2c9678;
}

:deep(.el-dropdown-menu__item.is-disabled) {
  color: #C0C4CC;
  cursor: not-allowed;
  background-color: transparent;
}

:deep(.el-dropdown-menu__item.el-dropdown-menu__item--divided) {
  border-top: 1px solid #EBEEF5;
  margin: 6px 0;
  padding-top: 12px;
}

:deep(.el-dropdown-menu__item--divided:before) {
  height: 0;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.user-info:hover {
  background: rgba(44, 150, 120, 0.06);
}

.user-info .el-icon-arrow-down {
  font-size: 12px;
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.user-info:hover .el-icon-arrow-down {
  transform: rotate(180deg);
}

.username {
  font-size: 13px;
  color: #606266;
}

.admin-btn {
  color: #2c9678;
}

.admin-btn:hover {
  color: #2c9678;
  background: rgba(44, 150, 120, 0.08);
}

@media (max-width: 1200px) {
  .header-container {
    padding: 0 16px;
    gap: 16px;
  }

  .search-box {
    width: 180px;
  }

  :deep(.el-menu--horizontal > .el-menu-item) {
    padding: 0 12px;
  }
}

@media (max-width: 992px) {
  .search-box {
    width: 160px;
  }

  .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 8px;
  }

  .action-btn i {
    margin: 0;
  }
}
</style> 