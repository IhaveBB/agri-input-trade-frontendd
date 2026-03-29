import request from '@/utils/request'

// ==================== 地域销售分析接口 ====================

// 获取省份销售热力图数据（支持 merchantId，管理员可查看指定商户数据）
export function getProvinceSalesHeatmap(merchantId) {
  return request({ url: '/region-sales/heatmap', method: 'get', params: { merchantId } })
}

// 获取大区销售分布（支持 merchantId，管理员可查看指定商户数据）
export function getRegionSalesDistribution(merchantId) {
  return request({ url: '/region-sales/distribution', method: 'get', params: { merchantId } })
}

// 获取地域销售概览（支持 merchantId，管理员可查看指定商户数据）
export function getRegionSalesOverview(merchantId) {
  return request({ url: '/region-sales/overview', method: 'get', params: { merchantId } })
}

// 获取商户列表（管理员用）
export function getRegionMerchantList() {
  return request({ url: '/region-sales/merchants', method: 'get' })
}
