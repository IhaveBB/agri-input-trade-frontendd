import request from '@/utils/request'

// ==================== 库存预警接口 ====================

// 获取库存概览统计
export function getStockOverview() {
  return request({ url: '/api/stock-warning/overview', method: 'get' })
}

// 获取所有库存预警（管理员）
export function getAllStockWarnings() {
  return request({ url: '/api/stock-warning/all', method: 'get' })
}

// 获取当前商户的库存预警
export function getMerchantStockWarnings() {
  return request({ url: '/api/stock-warning/merchant', method: 'get' })
}

// 检查指定商品库存
export function checkProductStock(productId) {
  return request({ url: `/api/stock-warning/product/${productId}`, method: 'get' })
}

// 获取预警数量（用于前端角标）
export function getWarningCount() {
  return request({ url: '/api/stock-warning/count', method: 'get' })
}
