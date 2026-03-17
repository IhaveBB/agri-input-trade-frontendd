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
  background-color: #f5f5f5;

  .side-container {
    box-shadow: 1px 0 8px rgba(0, 0, 0, 0.06);
    background-color: #fafafa;
    float: left;
    width: 230px;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: #2c9678 #f0f0f0;
    border-right: 1px solid #e8e8e8;
    position: relative;
    z-index: 2;
    border-radius: 0;

    .logo-container {
      height: 60px;
      background: #2c9678;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 20px;
      gap: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .logo-icon {
        font-size: 26px;
        color: #fff;
        margin-right: 0;
      }

      .logo-text-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .logo-text {
        margin: 0;
        font-size: 18px;
        color: #fff;
        font-weight: 600;
        letter-spacing: 1px;
        white-space: nowrap;
        line-height: 1.2;
      }

      .logo-subtitle {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 400;
        letter-spacing: 0.5px;
        white-space: nowrap;
        margin-top: 2px;
      }
    }
  }

  .main-container {
    margin-left: 230px;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 16px;
    position: relative;
    overflow: hidden;

    .main-header {
      background: #fff;
      border-radius: 6px;
      margin-bottom: 16px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      padding: 12px 20px;

      .el-header {
        padding: 0;
        height: auto;
      }
    }

    .main-content {
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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