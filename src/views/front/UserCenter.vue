<template>
  <div class="user-center">
    <front-header></front-header>
    <div class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>个人中心</h2>
      </div>

      <div class="content-wrapper">
        <!-- 左侧导航 -->
        <div class="side-menu">
          <el-menu :default-active="activeMenu" class="menu-list" @select="handleMenuSelect">
            <el-menu-item index="info">
              <i class="el-icon-user"></i>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="balance">
              <i class="el-icon-wallet"></i>
              <span>我的余额</span>
            </el-menu-item>
            <el-menu-item index="address">
              <i class="el-icon-location"></i>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="password">
              <i class="el-icon-lock"></i>
              <span>修改密码</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 右侧内容区 -->
        <div class="content-area">
          <!-- 个人信息 -->
          <div v-if="activeMenu === 'info'" class="info-section">
            <div class="section-header">
              <h3>个人信息</h3>
              <p class="section-desc">您可以在这里修改您的个人信息</p>
            </div>
            <el-form :model="userInfo" :rules="rules" ref="userForm" label-width="100px" class="user-form">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userInfo.username" disabled></el-input>
              </el-form-item>
              <el-form-item label="真实姓名" prop="name">
                <el-input v-model="userInfo.name"></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userInfo.email"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateUserInfo">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 我的余额 -->
          <div v-if="activeMenu === 'balance'" class="balance-section">
            <div class="section-header">
              <div class="header-left">
                <h3>我的余额</h3>
                <p class="section-desc">查看您的账户余额和交易记录</p>
              </div>
              <el-button type="primary" icon="el-icon-wallet" @click="showRechargeDialog">
                立即充值
              </el-button>
            </div>

            <!-- 余额卡片 -->
            <div class="balance-card">
              <div class="balance-info">
                <div class="balance-label">当前余额</div>
                <div class="balance-amount">¥ {{ formatBalance(balance) }}</div>
              </div>
            </div>

            <!-- 充值记录表格 -->
            <div class="recharge-records">
              <h4 class="records-title">充值记录</h4>
              <el-table :data="rechargeRecords" stripe style="width: 100%" v-loading="rechargeLoading">
                <el-table-column prop="createdAt" label="创建时间" width="180">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column prop="rechargeNo" label="充值单号" width="220">
                  <template slot-scope="scope">
                    <span class="recharge-no">{{ scope.row.rechargeNo }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="充值金额" width="120">
                  <template slot-scope="scope">
                    <span class="amount-positive">¥ {{ formatBalance(scope.row.amount) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="getRechargeStatusType(scope.row.status)">
                      {{ getRechargeStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="paidAt" label="支付时间" width="180">
                  <template slot-scope="scope">
                    {{ scope.row.paidAt ? formatDate(scope.row.paidAt) : '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template slot-scope="scope">
                    <el-button
                      v-if="scope.row.status === 0"
                      type="text"
                      size="small"
                      @click="continueRecharge(scope.row)">
                      继续支付
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination-wrapper">
                <el-pagination
                  @current-change="handleRechargePageChange"
                  :current-page="rechargePage"
                  :page-size="5"
                  layout="prev, pager, next"
                  :total="rechargeTotal">
                </el-pagination>
              </div>
            </div>

            <!-- 余额记录表格 -->
            <div class="balance-records">
              <h4 class="records-title">余额变动记录</h4>
              <el-table :data="balanceRecords" stripe style="width: 100%" v-loading="balanceLoading">
                <el-table-column prop="createdAt" label="时间" width="180">
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="120">
                  <template slot-scope="scope">
                    <el-tag :type="getBalanceTypeType(scope.row.type)">
                      {{ getBalanceTypeText(scope.row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="金额" width="150">
                  <template slot-scope="scope">
                    <span :class="scope.row.amount > 0 ? 'amount-positive' : 'amount-negative'">
                      {{ scope.row.amount > 0 ? '+' : '' }}¥ {{ formatBalance(scope.row.amount) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="balanceAfter" label="余额" width="150">
                  <template slot-scope="scope">
                    ¥ {{ formatBalance(scope.row.balanceAfter) }}
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注"></el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination-wrapper">
                <el-pagination
                  @current-change="handleBalancePageChange"
                  :current-page="balancePage"
                  :page-size="10"
                  layout="prev, pager, next"
                  :total="balanceTotal">
                </el-pagination>
              </div>
            </div>
          </div>

          <!-- 收货地址 -->
          <div v-if="activeMenu === 'address'" class="address-section">
            <div class="section-header">
              <div class="header-left">
                <h3>收货地址</h3>
                <p class="section-desc">管理您的收货地址信息</p>
              </div>
              <el-button type="primary" @click="showAddressDialog('add')" icon="el-icon-plus">
                新增地址
              </el-button>
            </div>

            <div class="address-list">
              <template v-if="addresses.length === 0">
                <el-empty description="暂无收货地址">
                  <el-button type="primary" @click="showAddressDialog('add')">添加地址</el-button>
                </el-empty>
              </template>
              
              <template v-else>
                <el-card v-for="address in addresses" 
                  :key="address.id" 
                  class="address-item" 
                  shadow="hover"
                >
                  <div class="address-info">
                    <h4 class="receiver">
                      <span class="name">{{ address.receiver }}</span>
                      <span class="phone">{{ address.phone }}</span>
                    </h4>
                    <p class="detail">{{ address.address }}</p>
                  </div>
                  <div class="address-actions">
                    <el-button type="text" icon="el-icon-edit" @click="showAddressDialog('edit', address)">
                      编辑
                    </el-button>
                    <el-button type="text" icon="el-icon-delete" class="delete-btn" @click="deleteAddress(address.id)">
                      删除
                    </el-button>
                  </div>
                </el-card>
              </template>
            </div>
          </div>

          <!-- 修改密码 -->
          <div v-if="activeMenu === 'password'" class="password-section">
            <div class="section-header">
              <h3>修改密码</h3>
              <p class="section-desc">您可以在这里修改您的账号密码</p>
            </div>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px" class="user-form">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updatePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 地址编辑对话框 -->
    <el-dialog :title="dialogType === 'add' ? '新增地址' : '编辑地址'" :visible.sync="addressDialogVisible" width="500px" :close-on-click-modal="false">
      <el-form :model="addressForm" :rules="addressRules" ref="addressForm" label-width="100px">
        <el-form-item label="收货人" prop="receiver">
          <el-input v-model="addressForm.receiver" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input 
            type="textarea" 
            v-model="addressForm.address"
            placeholder="请输入详细地址，如：xx省xx市xx区xx街道xx号"
            :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">确定</el-button>
      </div>
    </el-dialog>

    <!-- 充值对话框 -->
    <el-dialog title="余额充值" :visible.sync="rechargeDialogVisible" width="400px" :close-on-click-modal="false">
      <el-form :model="rechargeForm" :rules="rechargeRules" ref="rechargeForm" label-width="100px">
        <el-form-item label="充值金额" prop="amount">
          <el-input-number
            v-model="rechargeForm.amount"
            :min="0.01"
            :max="10000"
            :precision="2"
            :step="10"
            controls-position="right"
            style="width: 100%">
          </el-input-number>
        </el-form-item>
        <el-form-item>
          <div class="recharge-tips">
            <p>提示：充值金额范围 0.01 ~ 10000 元</p>
            <p>充值成功后金额将立即到账</p>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createRecharge" :loading="rechargeSubmitting">
          立即支付
        </el-button>
      </div>
    </el-dialog>

    <front-footer></front-footer>
  </div>
</template>

<script>
import FrontHeader from '@/components/front/FrontHeader.vue'
import FrontFooter from '@/components/front/FrontFooter.vue'
import Request from '@/utils/request'

export default {
  name: 'UserCenter',
  components: {
    FrontHeader,
    FrontFooter
  },
  data() {
    return {
      activeMenu: 'info',
      currentUser: JSON.parse(localStorage.getItem('frontUser') || '{}'),
      userInfo: {
        username: '',
        name: '',
        email: ''
      },
      rules: {
        name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      },
      addresses: [],
      addressDialogVisible: false,
      dialogType: 'add',
      addressForm: {
        id: '',
        receiver: '',
        phone: '',
        address: '',
      },
      addressRules: {
        receiver: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      },
      // 余额相关数据
      balance: 0,
      balanceRecords: [],
      balancePage: 1,
      balanceTotal: 0,
      balanceLoading: false,
      // 充值相关数据
      rechargeRecords: [],
      rechargePage: 1,
      rechargeTotal: 0,
      rechargeLoading: false,
      rechargeDialogVisible: false,
      rechargeSubmitting: false,
      rechargeForm: {
        amount: 100
      },
      rechargeRules: {
        amount: [
          { required: true, message: '请输入充值金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '充值金额必须大于0', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    const userInfo = localStorage.getItem('frontUser')
    if(!userInfo){
      this.$message.warning('请先登录')
      this.$router.push('/login')
    }
    else{
      this.userInfo = JSON.parse(userInfo)
      this.getUserInfo()
      this.getAddresses()
    }
  },

  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index;
      if (index === 'balance') {
        this.getBalance()
        this.getBalanceRecords()
        this.getRechargeRecords()
      }
    },
    async getUserInfo() {
      try {
        const userId = this.currentUser.id
        const res = await Request.get(`/user/${userId}`)
        if (res.code === '0') {
          this.userInfo = res.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$message.error('获取用户信息失败')
      }
    },

    async updateUserInfo() {
      try {
        this.$refs.userForm.validate(async (valid) => {
          if (valid) {
            const res = await Request.put(`/user/${this.userInfo.id}`, this.userInfo)
            if (res.code === '0') {
              this.$message.success('个人信息更新成功')
            }
          }
        })
      } catch (error) {
        console.error('更新用户信息失败:', error)
        this.$message.error('更新用户信息失败')
      }
    },

    async getAddresses() {
      try {
        const userId = this.currentUser.id
        const res = await Request.get(`/address/user/${userId}`)
        if (res.code === '0') {
          this.addresses = res.data
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
        this.$message.error('获取地址列表失败')
      }
    },

    showAddressDialog(type, address) {
      this.dialogType = type
      this.addressDialogVisible = true
      if (type === 'edit' && address) {
        this.addressForm = {
          id: address.id,
          receiver: address.receiver,
          phone: address.phone,
          address: address.address
        }
      } else {
        this.addressForm = {
          receiver: '',
          phone: '',
          address: ''
        }
      }
    },

    async saveAddress() {
      try {
        await this.$refs.addressForm.validate()
        const userId = this.currentUser.id
        const addressData = {
          ...this.addressForm,
          userId,
        }

        if (this.dialogType === 'add') {
          const res = await Request.post('/address', addressData)
          if (res.code === '0') {
            this.$message.success('添加地址成功')
            this.getAddresses()
          }
        } else {
          const res = await Request.put(`/address/${addressData.id}`, addressData)
          if (res.code === '0') {
            this.$message.success('更新地址成功')
            this.getAddresses()
          }
        }
        this.addressDialogVisible = false
      } catch (error) {
        console.error('保存地址失败:', error)
        this.$message.error('保存地址失败')
      }
    },

    async deleteAddress(id) {
      try {
        await this.$confirm('确定要删除该地址吗？', '提示', {
          type: 'warning'
        })
        const res = await Request.delete(`/address/${id}`)
        if (res.code === '0') {
          this.$message.success('删除地址成功')
          this.getAddresses()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除地址失败:', error)
          this.$message.error('删除地址失败')
        }
      }
    },

    async updatePassword() {
      try {
        this.$refs.passwordForm.validate(async (valid) => {
          if (valid) {
            const userId = this.currentUser.id
            const params = {

              newPassword: this.passwordForm.newPassword,
              oldPassword: this.passwordForm.oldPassword
            }
            const res = await Request.put(`/user/password/${userId}`, params)
            if (res.code === '0') {
              this.$message.success('密码修改成功')
              this.passwordForm = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
              }
              this.$refs.passwordForm.resetFields()
            } else {
              this.$message.error(res.msg || '密码修改失败')
            }
          }
        })
      } catch (error) {
        console.error('修改密码失败:', error)
        this.$message.error('修改密码失败')
      }
    },

    // 余额相关方法
    async getBalance() {
      try {
        const res = await Request.get('/balance/my')
        if (res.code === '0') {
          this.balance = res.data
        }
      } catch (error) {
        console.error('获取余额失败:', error)
      }
    },

    async getBalanceRecords() {
      this.balanceLoading = true
      try {
        const res = await Request.get('/balance/my/records', {
          params: {
            currentPage: this.balancePage,
            size: 10
          }
        })
        if (res.code === '0') {
          this.balanceRecords = res.data.records
          this.balanceTotal = res.data.total
        }
      } catch (error) {
        console.error('获取余额记录失败:', error)
        this.$message.error('获取余额记录失败')
      } finally {
        this.balanceLoading = false
      }
    },

    handleBalancePageChange(page) {
      this.balancePage = page
      this.getBalanceRecords()
    },

    formatBalance(value) {
      if (value === null || value === undefined) return '0.00'
      return parseFloat(value).toFixed(2)
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN')
    },

    getBalanceTypeText(type) {
      const typeMap = {
        1: '充值',
        2: '消费',
        3: '退款'
      }
      return typeMap[type] || '其他'
    },

    getBalanceTypeType(type) {
      const typeColorMap = {
        1: 'success',
        2: 'danger',
        3: 'warning'
      }
      return typeColorMap[type] || 'info'
    },

    // 充值相关方法
    showRechargeDialog() {
      this.rechargeDialogVisible = true
      this.rechargeForm.amount = 100
    },

    async createRecharge() {
      try {
        await this.$refs.rechargeForm.validate()
        this.rechargeSubmitting = true

        const res = await Request.post('/balance/recharge/create', null, {
          params: {
            amount: this.rechargeForm.amount
          }
        })

        if (res.code === '0') {
          this.rechargeDialogVisible = false
          this.$message.success('充值订单创建成功，正在跳转到支付页面...')
          // 跳转到支付宝支付页面，携带 token
          const token = JSON.parse(localStorage.getItem('frontUser') || '{}').token
          window.open(`/api/alipay/recharge/pay/${res.data.id}?token=${token}`, '_blank')
          // 刷新充值记录
          setTimeout(() => {
            this.getRechargeRecords()
          }, 1000)
        }
      } catch (error) {
        console.error('创建充值订单失败:', error)
        this.$message.error('创建充值订单失败')
      } finally {
        this.rechargeSubmitting = false
      }
    },

    async getRechargeRecords() {
      this.rechargeLoading = true
      try {
        const res = await Request.get('/balance/my/recharges', {
          params: {
            currentPage: this.rechargePage,
            size: 5
          }
        })
        if (res.code === '0') {
          this.rechargeRecords = res.data.records
          this.rechargeTotal = res.data.total
        }
      } catch (error) {
        console.error('获取充值记录失败:', error)
        this.$message.error('获取充值记录失败')
      } finally {
        this.rechargeLoading = false
      }
    },

    handleRechargePageChange(page) {
      this.rechargePage = page
      this.getRechargeRecords()
    },

    continueRecharge(rechargeRecord) {
      // 继续支付，携带 token
      const token = JSON.parse(localStorage.getItem('frontUser') || '{}').token
      window.open(`/api/alipay/recharge/pay/${rechargeRecord.id}?token=${token}`, '_blank')
    },

    getRechargeStatusText(status) {
      const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已取消'
      }
      return statusMap[status] || '未知'
    },

    getRechargeStatusType(status) {
      const typeMap = {
        0: 'warning',
        1: 'success',
        2: 'info'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8faf5 0%, #f5f7fa 100%);
}

.main-content {
  flex: 1;
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 页面标题样式 */
.page-header {
  margin-bottom: 24px;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #409EFF, #66B1FF);
}

.page-header h2 {
  font-size: 24px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0;
}

.content-wrapper {
  display: flex;
  gap: 24px;
}

/* 左侧菜单样式 */
.side-menu {
  width: 240px;
  background: white;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.menu-list {
  border-right: none;
}

.menu-list .el-menu-item {
  height: 56px;
  line-height: 56px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.menu-list .el-menu-item:hover {
  background: linear-gradient(to right, rgba(64, 158, 255, 0.05), transparent);
}

.menu-list .el-menu-item.is-active {
  background: linear-gradient(to right, rgba(64, 158, 255, 0.1), transparent);
  border-right: 3px solid #409EFF;
}

.menu-list .el-menu-item i {
  font-size: 18px;
  margin-right: 12px;
  color: #909399;
}

.menu-list .el-menu-item.is-active i {
  color: #409EFF;
}

/* 右侧内容区样式 */
.content-area {
  flex: 1;
  background: white;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  padding: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
}

.header-left h3 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.section-desc {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

/* 表单样式 */
.user-form {
  max-width: 500px;
}

/* 地址列表样式 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-item {
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.address-item:hover {
  transform: translateY(-2px);
  background: linear-gradient(to right, rgba(64, 158, 255, 0.02), transparent);
}

.address-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(to bottom, #409EFF, #66B1FF);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.address-item:hover::before {
  opacity: 1;
}

.address-info {
  flex: 1;
}

.receiver {
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.phone {
  color: #606266;
  font-weight: normal;
}

.detail {
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

.address-actions {
  margin-top: 16px;
  display: flex;
  gap: 16px;
}

.delete-btn {
  color: #f56c6c;
}

/* 按钮样式 */
.el-button--primary {
  background: linear-gradient(135deg, #67c23a, #66B1FF);
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.el-button--primary:hover {
  transform: translateY(-1px);
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #f0f2f5;
  margin: 0;
  background: linear-gradient(135deg, #f8faf5, #fff);
}

:deep(.el-dialog__body) {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 自定义滚动条样式 */
:deep(.el-dialog__body::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-dialog__body::-webkit-scrollbar-thumb) {
  background: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

:deep(.el-dialog__body::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #f0f2f5;
  margin-top: 0;
}

/* 表单项样式 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  border-radius: 6px;
  transition: all 0.3s ease;
  border-color: #dcdfe6;
}

:deep(.el-input__inner:hover),
:deep(.el-textarea__inner:hover) {
  border-color: #67c23a;
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: #67c23a;
}

/* 空状态样式 */
:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-empty .el-button--primary) {
  background: linear-gradient(135deg, #67c23a, #66B1FF);
  border: none;
  transition: all 0.3s ease;
}

:deep(.el-empty .el-button--primary:hover) {
  transform: translateY(-1px);
}

/* 密码表单样式 */
.password-section {
  width: 100%;
}

/* 余额部分样式 */
.balance-section {
  width: 100%;
}

.balance-card {
  background: linear-gradient(135deg, #409EFF 0%, #66B1FF 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.balance-info {
  text-align: center;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
}

.balance-amount {
  font-size: 36px;
  font-weight: 600;
  letter-spacing: 1px;
}

.balance-records {
  margin-top: 24px;
}

.records-title {
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-weight: 500;
}

.amount-positive {
  color: #67C23A;
  font-weight: 500;
}

.amount-negative {
  color: #F56C6C;
  font-weight: 500;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 充值记录样式 */
.recharge-records {
  margin-bottom: 32px;
}

.recharge-no {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

.recharge-tips {
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}

.recharge-tips p {
  margin: 4px 0;
}
</style> 