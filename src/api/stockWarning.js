import request from '@/utils/request'

// ==================== 库存预警接口 ====================

// 获取库存概览统计（支持按商户筛选，管理员场景传 merchantId）
export function getStockOverview(merchantId) {
  return request({ url: '/stock-warning/overview', method: 'get', params: { merchantId } })
}

// 获取所有库存预警（管理员，支持按商户筛选）
export function getAllStockWarnings(merchantId) {
  return request({ url: '/stock-warning/all', method: 'get', params: { merchantId } })
}

// 获取当前商户的库存预警
export function getMerchantStockWarnings() {
  return request({ url: '/stock-warning/merchant', method: 'get' })
}

// 检查指定商品库存
export function checkProductStock(productId) {
  return request({ url: `/stock-warning/product/${productId}`, method: 'get' })
}

// 获取预警数量（用于前端角标）
export function getWarningCount() {
  return request({ url: '/stock-warning/count', method: 'get' })
}

// ==================== 库存预警配置接口 ====================

// 获取商户全局配置
export function getGlobalConfig() {
  return request({ url: '/stock-alert/config/global', method: 'get' })
}

// 更新商户全局配置
export function updateGlobalConfig(data) {
  return request({ url: '/stock-alert/config/global', method: 'put', data })
}

// 获取商品配置列表（分页）
export function getProductConfigList(params) {
  return request({ url: '/stock-alert/config/products', method: 'get', params })
}

// 更新单个商品配置
export function updateProductConfig(productId, data) {
  return request({ url: `/stock-alert/config/product/${productId}`, method: 'put', data })
}

// 切换商品预警开关
export function toggleProductAlert(productId, enabled) {
  return request({ url: `/stock-alert/config/product/${productId}/toggle`, method: 'put', params: { enabled } })
}

// 批量更新商品配置
export function batchUpdateProductConfig(productIds, enabled, ruleConfig) {
  return request({ url: '/stock-alert/config/products/batch', method: 'put', data: productIds, params: { enabled, ruleConfig } })
}

// 批量切换预警开关
export function batchToggleProductAlert(productIds, enabled) {
  return request({ url: '/stock-alert/config/products/batch-toggle', method: 'put', data: productIds, params: { enabled } })
}

// ==================== 邮件记录接口 ====================

// 获取邮件发送记录列表（管理员）
export function getEmailRecordList(params) {
  return request({ url: '/email-record/list', method: 'get', params })
}

// 获取商户的邮件发送记录
export function getMerchantEmailRecordList(params) {
  return request({ url: '/email-record/merchant', method: 'get', params })
}

// 获取邮件详情
export function getEmailRecordDetail(id) {
  return request({ url: `/email-record/${id}`, method: 'get' })
}

// 手动重试发送邮件
export function retryEmail(id) {
  return request({ url: `/email-record/${id}/retry`, method: 'post' })
}

// 获取邮件发送统计
export function getEmailStats() {
  return request({ url: '/email-record/stats', method: 'get' })
}
