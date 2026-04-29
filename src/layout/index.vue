<template>
  <div class="app-wrapper">
    <div class="side-container">
      <div class="logo-container">
        <i class="el-icon-shopping-cart-2 logo-icon"></i>
        <div class="logo-text-container">
          <h1 class="logo-text">农资采销</h1>
          <div class="logo-subtitle">后台管理系统</div>
        </div>
      </div>
      <SideMenu ref="sideMenu" />
    </div>
    <div class="main-container">
      <div class="main-header">
        <HeaderBar />
      </div>
      <div class="main-content">
        <el-scrollbar wrap-class="scrollbar">
          <router-view @update:user="updateUser" />
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderBar from '../components/Header.vue'
import SideMenu from '../components/Aside.vue'

export default {
  name: 'Layout',
  data() {
    return {
      userInfo: JSON.parse(localStorage.getItem("backUser") || {}),
    };
  },
  created() {
// 判断是否登录
    if(!this.userInfo){
      this.$message.warning('请先登录')
      this.$router.push('/login')
    }

  },
  provide() {
    return {
      userInfo: this.userInfo,
    
    };
  },
  components: { HeaderBar, SideMenu },
  computed: {

  },
  methods: {
    updateUser(user) {
      this.userInfo = user;
      this.$refs.sideMenu.refreshMenu();
    }

  }
}
</script>

<style lang="less">
@import "../assets/less/scroller-bar";

.app-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f0f2f5;

  .side-container {
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
    background: linear-gradient(180deg, #1a2a3a 0%, #1e3348 100%);
    float: left;
    width: 220px;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
    position: relative;
    z-index: 2;

    .logo-container {
      height: 64px;
      background: linear-gradient(135deg, #2c9678, #248a6d);
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 10px;
      position: relative;
      overflow: hidden;

      // 底部小波浪装饰
      &::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 0;
        right: 0;
        height: 12px;
        background: #1e3348;
        border-radius: 50% 50% 0 0;
      }

      .logo-icon {
        font-size: 24px;
        color: #fff;
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .logo-text-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .logo-text {
        margin: 0;
        font-size: 17px;
        color: #fff;
        font-weight: 700;
        letter-spacing: 1px;
        white-space: nowrap;
        line-height: 1.3;
      }

      .logo-subtitle {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.75);
        font-weight: 400;
        letter-spacing: 0.5px;
        white-space: nowrap;
        margin-top: 1px;
      }
    }
  }

  .main-container {
    margin-left: 220px;
    min-height: 100vh;
    background-color: #f0f2f5;
    padding: 16px;
    position: relative;
    overflow: hidden;

    .main-header {
      background: #fff;
      border-radius: 10px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 12px 20px;

      .el-header {
        padding: 0;
        height: auto;
      }
    }

    .main-content {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      min-height: calc(100vh - 124px);

      .el-scrollbar {
        height: calc(100vh - 124px);

        .scrollbar {
          height: 100%;
          overflow-x: hidden;
          padding: 20px;
        }
      }
    }
  }
}
</style>