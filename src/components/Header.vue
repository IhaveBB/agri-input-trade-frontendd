<template>
  <div class="header-bar">
    <div class="header-left">
      <BreadCrumbs />
    </div>
    <div class="header-right">
      <div class="current-time">
        <i class="el-icon-time"></i>
        <span>{{ currentTime }}</span>
      </div>
      <div class="header-actions">
        <el-tooltip content="返回前台" placement="bottom">
          <div class="action-btn" @click="goToFront">
            <i class="el-icon-s-home"></i>
            <span>系统首页</span>
          </div>
        </el-tooltip>
        
        <div class="action-group">
          <el-tooltip content="刷新页面" placement="bottom">
            <div class="action-icon-btn" @click="refreshPage">
              <i class="el-icon-refresh-right"></i>
            </div>
          </el-tooltip>
          
          <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏显示'" placement="bottom">
            <div class="action-icon-btn" @click="toggleFullScreen">
              <i :class="isFullscreen ? 'el-icon-close' : 'el-icon-full-screen'"></i>
            </div>
          </el-tooltip>
        </div>

        <div class="divider"></div>
        <UserAvatar />
      </div>
    </div>
  </div>
</template>

<script>
import BreadCrumbs from '../components/BreadCrumbs/index.vue'
import UserAvatar from '../components/UserAvatar/index.vue'

export default {
  name: 'HeaderBar',
  components: {
    BreadCrumbs,
    UserAvatar
  },
  data() {
    return {
      isFullscreen: false,
      currentTime: '',
      timer: null
    }
  },
  methods: {
    refreshPage() {
      window.location.reload()
    },
    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        this.isFullscreen = true
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
          this.isFullscreen = false
        }
      }
    },
    goToFront() {
      this.$router.push('/');
    },
    updateTime() {
      const now = new Date();
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      };
      this.currentTime = now.toLocaleDateString('zh-CN', options).replace(/\//g, '-');
    }
  },
  mounted() {
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement
    })
    this.updateTime();
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
</script>

<style lang="less" scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  background: #fff;
  border-bottom: none;

  .header-left {
    display: flex;
    align-items: center;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .current-time {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #606266;
      font-size: 13px;
      background: #f5f7fa;
      padding: 6px 14px;
      border-radius: 20px;
      white-space: nowrap;

      i {
        color: #2c9678;
        font-size: 15px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 16px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.25s ease;
        background: linear-gradient(135deg, #2c9678, #3aaf8e);
        color: white;
        font-size: 14px;

        &:hover {
          box-shadow: 0 4px 12px rgba(44, 150, 120, 0.3);
          transform: translateY(-1px);
        }

        i {
          font-size: 16px;
        }
      }

      .action-group {
        display: flex;
        align-items: center;
        gap: 4px;
        background: #f5f7fa;
        padding: 3px;
        border-radius: 20px;
      }

      .action-icon-btn {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #606266;

        i {
          font-size: 16px;
          transition: all 0.2s ease;
        }

        &:hover {
          background-color: #fff;
          color: #2c9678;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

          i.el-icon-refresh-right {
            transform: rotate(180deg);
          }
        }
      }

      .divider {
        width: 1px;
        height: 20px;
        background: #e8e8e8;
        margin: 0 4px;
      }
    }
  }
}
</style>