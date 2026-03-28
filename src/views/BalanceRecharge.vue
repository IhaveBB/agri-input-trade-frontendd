<template>
  <div class="balance-recharge-manager">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <h2>用户余额充值</h2>
      <el-tag type="info">管理员专用</el-tag>
    </div>

    <div class="content-box">
      <!-- 搜索区域 -->
      <el-card class="search-area" shadow="hover">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户ID">
            <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" icon="el-icon-search">查询</el-button>
            <el-button @click="resetSearch" icon="el-icon-refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 用户信息卡片 -->
      <el-card class="user-info-card" shadow="hover" v-if="selectedUser">
        <div slot="header">
          <span>用户信息</span>
        </div>
        <div class="user-info">
          <div class="info-item">
            <label>用户ID：</label>
            <span>{{ selectedUser.id }}</span>
          </div>
          <div class="info-item">
            <label>用户名：</label>
            <span>{{ selectedUser.username }}</span>
          </div>
          <div class="info-item">
            <label>真实姓名：</label>
            <span>{{ selectedUser.name || '-' }}</span>
          </div>
          <div class="info-item">
            <label>当前余额：</label>
            <span class="balance-amount">¥ {{ formatBalance(selectedUser.balance) }}</span>
          </div>
        </div>

        <el-divider></el-divider>

        <!-- 充值表单 -->
        <el-form :model="rechargeForm" :rules="rechargeRules" ref="rechargeForm" label-width="100px">
          <el-form-item label="充值金额" prop="amount">
            <el-input-number
              v-model="rechargeForm.amount"
              :min="0.01"
              :max="100000"
              :precision="2"
              :step="100"
              controls-position="right"
              style="width: 200px">
            </el-input-number>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="rechargeForm.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入充值备注（可选）"
              style="width: 400px">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRecharge" :loading="rechargeLoading" icon="el-icon-wallet">
              确认充值
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 提示信息 -->
      <el-card class="tips-card" shadow="never" v-else>
        <el-empty description="请先查询并选择用户">
          <template slot="description">
            <p>请在上方搜索框输入用户ID或用户名查询</p>
          </template>
        </el-empty>
      </el-card>
    </div>
  </div>
</template>

<script>
import Request from '../utils/request.js'

export default {
  name: 'BalanceRecharge',
  data() {
    return {
      searchForm: {
        userId: '',
        username: ''
      },
      selectedUser: null,
      rechargeForm: {
        amount: 100,
        remark: ''
      },
      rechargeRules: {
        amount: [
          { required: true, message: '请输入充值金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '充值金额必须大于0', trigger: 'blur' }
        ]
      },
      rechargeLoading: false
    }
  },
  methods: {
    // 查询用户
    async handleSearch() {
      if (!this.searchForm.userId && !this.searchForm.username) {
        this.$message.warning('请输入用户ID或用户名')
        return
      }

      // 如果输入了用户ID，校验必须是数字
      if (this.searchForm.userId && !/^\d+$/.test(this.searchForm.userId)) {
        this.$message.warning('用户ID必须是数字')
        return
      }

      try {
        let res
        if (this.searchForm.userId) {
          // 根据ID查询
          res = await Request.get(`/user/${this.searchForm.userId}`)
        } else {
          // 根据用户名查询
          res = await Request.get(`/user/username/${this.searchForm.username}`)
        }

        if (res.code === '0' && res.data) {
          this.selectedUser = res.data
          // 获取用户当前余额
          const balanceRes = await Request.get(`/balance/user/${this.selectedUser.id}`)
          if (balanceRes.code === '0') {
            this.selectedUser.balance = balanceRes.data
          }
        } else {
          this.$message.error('用户不存在')
          this.selectedUser = null
        }
      } catch (error) {
        console.error('查询用户失败:', error)
        this.$message.error('查询用户失败')
      }
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        userId: '',
        username: ''
      }
      this.selectedUser = null
    },

    // 确认充值
    async handleRecharge() {
      this.$refs.rechargeForm.validate(async (valid) => {
        if (!valid) return

        if (!this.selectedUser) {
          this.$message.warning('请先选择用户')
          return
        }

        this.rechargeLoading = true
        try {
          const res = await Request.post(`/balance/recharge/admin/${this.selectedUser.id}`, null, {
            params: {
              amount: this.rechargeForm.amount,
              remark: this.rechargeForm.remark || '管理员充值'
            }
          })

          if (res.code === '0') {
            this.$message.success(`充值成功！当前余额：¥ ${res.data}`)
            // 更新用户余额显示
            this.selectedUser.balance = res.data
            // 重置充值表单
            this.rechargeForm = {
              amount: 100,
              remark: ''
            }
          } else {
            this.$message.error(res.msg || '充值失败')
          }
        } catch (error) {
          console.error('充值失败:', error)
          this.$message.error('充值失败')
        } finally {
          this.rechargeLoading = false
        }
      })
    },

    // 格式化余额
    formatBalance(value) {
      if (value === null || value === undefined) return '0.00'
      return parseFloat(value).toFixed(2)
    }
  }
}
</script>

<style lang="less" scoped>
.balance-recharge-manager {
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 24px;
    font-weight: 500;
    color: #1f2f3d;
    margin: 0;
    margin-right: 15px;
  }
}

.content-box {
  .search-area {
    margin-bottom: 24px;
    border-radius: 8px;

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .user-info-card {
    border-radius: 8px;

    .user-info {
      display: flex;
      flex-wrap: wrap;
      gap: 30px;
      margin-bottom: 20px;

      .info-item {
        label {
          color: #606266;
          font-weight: 500;
        }

        span {
          color: #303133;
          margin-left: 8px;
        }

        .balance-amount {
          color: #f56c6c;
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
  }

  .tips-card {
    border-radius: 8px;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>