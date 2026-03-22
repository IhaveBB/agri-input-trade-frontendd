<template>
  <div class="email-record">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">邮件发送记录</h2>
        <p class="page-subtitle">查看邮件发送状态和统计</p>
      </div>
      <div class="header-right">
        <el-button icon="el-icon-refresh" circle @click="refreshData" :loading="loading"></el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card stat-card--primary">
        <div class="stat-card__icon">
          <i class="el-icon-message"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">今日发送</div>
          <div class="stat-card__value">{{ stats.todayTotal }}</div>
        </div>
      </div>
      <div class="stat-card stat-card--success">
        <div class="stat-card__icon">
          <i class="el-icon-success"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">发送成功</div>
          <div class="stat-card__value">{{ stats.todaySuccess }}</div>
        </div>
      </div>
      <div class="stat-card stat-card--danger">
        <div class="stat-card__icon">
          <i class="el-icon-error"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">发送失败</div>
          <div class="stat-card__value">{{ stats.todayFail }}</div>
        </div>
      </div>
      <div class="stat-card stat-card--warning">
        <div class="stat-card__icon">
          <i class="el-icon-warning"></i>
        </div>
        <div class="stat-card__content">
          <div class="stat-card__label">待重试</div>
          <div class="stat-card__value">{{ stats.pendingRetry }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-panel">
      <el-form inline size="small">
        <el-form-item label="邮件类型">
          <el-select v-model="filters.emailType" placeholder="全部" clearable style="width: 150px">
            <el-option label="库存预警" value="STOCK_ALERT"></el-option>
            <el-option label="验证码" value="VERIFICATION"></el-option>
            <el-option label="其他" value="OTHER"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="待发送" value="PENDING"></el-option>
            <el-option label="发送中" value="SENDING"></el-option>
            <el-option label="发送成功" value="SUCCESS"></el-option>
            <el-option label="失败（可重试）" value="RETRYABLE_FAIL"></el-option>
            <el-option label="失败（不可重试）" value="PERMANENT_FAIL"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 邮件列表 -->
    <div class="table-panel">
      <el-table :data="recordList" stripe v-loading="loading" size="small">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="createdAt" label="发送时间" width="160">
          <template slot-scope="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="recipientEmail" label="收件人" min-width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="recipientName" label="收件人名称" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="emailType" label="邮件类型" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getEmailTypeTag(scope.row.emailType)" size="small">
              {{ getEmailTypeLabel(scope.row.emailType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="主题" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="retryCount" label="重试次数" width="80" align="center"></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button
              v-if="scope.row.status === 'RETRYABLE_FAIL' || scope.row.status === 'PERMANENT_FAIL'"
              type="text"
              size="small"
              @click="retrySend(scope.row)">
              重试
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="table-pagination"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog title="邮件详情" :visible.sync="detailDialogVisible" width="600px">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="邮件ID">{{ currentRecord.id }}</el-descriptions-item>
        <el-descriptions-item label="发送时间">{{ formatTime(currentRecord.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="收件人邮箱">{{ currentRecord.recipientEmail }}</el-descriptions-item>
        <el-descriptions-item label="收件人名称">{{ currentRecord.recipientName }}</el-descriptions-item>
        <el-descriptions-item label="邮件类型">{{ getEmailTypeLabel(currentRecord.emailType) }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getStatusLabel(currentRecord.status) }}</el-descriptions-item>
        <el-descriptions-item label="主题" :span="2">{{ currentRecord.subject }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <pre class="email-content">{{ currentRecord.content }}</pre>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRecord.failReason" label="失败原因" :span="2">
          <span class="fail-reason">{{ currentRecord.failReason }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="重试次数">{{ currentRecord.retryCount }} / {{ currentRecord.maxRetry }}</el-descriptions-item>
        <el-descriptions-item label="下次重试时间">{{ formatTime(currentRecord.nextRetryTime) || '-' }}</el-descriptions-item>
      </el-descriptions>
      <span slot="footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentRecord.status === 'RETRYABLE_FAIL' || currentRecord.status === 'PERMANENT_FAIL'"
          type="primary"
          @click="retrySend(currentRecord)">
          手动重试
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getEmailRecordList, getEmailStats, retryEmail } from '@/api/stockWarning'

export default {
  name: 'EmailRecord',
  data() {
    return {
      loading: false,
      filters: {
        emailType: '',
        status: ''
      },
      stats: {
        todayTotal: 0,
        todaySuccess: 0,
        todayFail: 0,
        pendingRetry: 0
      },
      recordList: [],
      pageNum: 1,
      pageSize: 20,
      total: 0,
      detailDialogVisible: false,
      currentRecord: {}
    }
  },
  mounted() {
    this.loadStats()
    this.loadData()
  },
  methods: {
    async loadStats() {
      try {
        const res = await getEmailStats()
        if (res.code === '0' && res.data) {
          this.stats = res.data
        }
      } catch (error) {
        console.error('加载统计失败:', error)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getEmailRecordList({
          emailType: this.filters.emailType || undefined,
          status: this.filters.status || undefined,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        if (res.code === '0' && res.data) {
          this.recordList = res.data.records
          this.total = res.data.total
        }
      } catch (error) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    refreshData() {
      this.loadStats()
      this.loadData()
    },
    search() {
      this.pageNum = 1
      this.loadData()
    },
    resetFilters() {
      this.filters = { emailType: '', status: '' }
      this.search()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.pageNum = 1
      this.loadData()
    },
    handlePageChange(page) {
      this.pageNum = page
      this.loadData()
    },
    viewDetail(row) {
      this.currentRecord = row
      this.detailDialogVisible = true
    },
    async retrySend(row) {
      try {
        const res = await retryEmail(row.id)
        if (res.code === '0') {
          this.$message.success('重试成功')
          this.loadData()
          this.loadStats()
          if (this.detailDialogVisible) {
            this.detailDialogVisible = false
          }
        } else {
          this.$message.error(res.msg || '重试失败')
        }
      } catch (error) {
        this.$message.error('重试失败')
      }
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN')
    },
    getEmailTypeTag(type) {
      const map = { STOCK_ALERT: 'warning', VERIFICATION: 'primary', OTHER: 'info' }
      return map[type] || 'info'
    },
    getEmailTypeLabel(type) {
      const map = { STOCK_ALERT: '库存预警', VERIFICATION: '验证码', OTHER: '其他' }
      return map[type] || type
    },
    getStatusTag(status) {
      const map = {
        PENDING: 'info',
        SENDING: 'primary',
        SUCCESS: 'success',
        RETRYABLE_FAIL: 'warning',
        PERMANENT_FAIL: 'danger'
      }
      return map[status] || 'info'
    },
    getStatusLabel(status) {
      const map = {
        PENDING: '待发送',
        SENDING: '发送中',
        SUCCESS: '成功',
        RETRYABLE_FAIL: '失败可重试',
        PERMANENT_FAIL: '失败不可重试'
      }
      return map[status] || status
    }
  }
}
</script>

<style lang="scss" scoped>
.email-record {
  padding: 24px;
  background: #f7f8fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .page-subtitle {
      margin: 0;
      font-size: 13px;
      color: #999;
    }
  }
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;
  }

  &--primary &__icon { background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%); }
  &--success &__icon { background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%); }
  &--danger &__icon { background: linear-gradient(135deg, #f56c6c 0%, #ff8c8c 100%); }
  &--warning &__icon { background: linear-gradient(135deg, #e6a23c 0%, #f0c78a 100%); }

  &__label {
    font-size: 13px;
    color: #999;
    margin-bottom: 4px;
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
  }
}

.filter-panel {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.table-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.table-pagination {
  margin-top: 16px;
  text-align: right;
}

.email-content {
  margin: 0;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.fail-reason {
  color: #f56c6c;
}

@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-cards {
    grid-template-columns: 1fr;
  }
}
</style>
