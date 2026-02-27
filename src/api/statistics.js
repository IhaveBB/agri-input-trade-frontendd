import request from '@/utils/request'

// ==================== 销售统计接口 ====================

// 获取本月订单统计（支持 merchantId，管理员可查看指定商户数据）
export function getMonthlyOrderStatistics(merchantId) {
  return request({ url: '/statistics/orders/monthly', method: 'get', params: { merchantId } })
}

// 获取本月销售额统计（支持 merchantId，管理员可查看指定商户数据）
export function getMonthlySalesStatistics(merchantId) {
  return request({ url: '/statistics/sales/monthly', method: 'get', params: { merchantId } })
}

// 获取用户订单统计
export function getUserOrderStatistics(userId) {
  return request({ url: '/statistics/user/orders', method: 'get', params: { userId } })
}

// 获取用户消费统计
export function getUserSpendingStatistics() {
  return request({ url: '/statistics/user/spending', method: 'get' })
}

// 获取年度用户统计
export function getYearlyUserStatistics() {
  return request({ url: '/statistics/users/yearly', method: 'get' })
}

// 获取热销商品 Top5（支持 merchantId，管理员可查看指定商户数据）
export function getTopSellingProducts(merchantId) {
  return request({ url: '/statistics/products/top5', method: 'get', params: { merchantId } })
}

// 获取品类销售占比（支持 merchantId，管理员可查看指定商户数据）
export function getCategorySalesStatistics(merchantId) {
  return request({ url: '/statistics/category/sales', method: 'get', params: { merchantId } })
}

// ==================== 新增统计接口 ====================

// 获取销售趋势（支持 merchantId，管理员可查看指定商户数据）
export function getSalesTrend(days = 30, merchantId) {
  return request({ url: '/statistics/sales/trend', method: 'get', params: { days, merchantId } })
}

// 获取季节性销售统计（支持 merchantId，管理员可查看指定商户数据）
export function getSeasonalStatistics(merchantId) {
  return request({ url: '/statistics/sales/seasonal', method: 'get', params: { merchantId } })
}

// 获取地区销售统计（支持 merchantId，管理员可查看指定商户数据）
export function getRegionStatistics(merchantId) {
  return request({ url: '/statistics/sales/region', method: 'get', params: { merchantId } })
}

// 获取商户列表（管理员用）
export function getMerchantList() {
  return request({ url: '/statistics/merchants', method: 'get' })
}

// ==================== 推荐系统效果评估接口 ====================

// 获取推荐系统效果概览
export function getRecommendOverview() {
  return request({ url: '/statistics/recommend/overview', method: 'get' })
}

// 获取推荐效果趋势
export function getRecommendTrend(days = 30) {
  return request({ url: '/statistics/recommend/trend', method: 'get', params: { days } })
}

// 获取分类推荐效果
export function getCategoryEffect() {
  return request({ url: '/statistics/recommend/category-effect', method: 'get' })
}

// 获取推荐算法构成
export function getAlgorithmComposition() {
  return request({ url: '/statistics/recommend/algorithm-composition', method: 'get' })
}

// 获取推荐多样性指标
export function getRecommendationDiversity() {
  return request({ url: '/statistics/recommend/diversity', method: 'get' })
}

// 获取用户行为相似度分布
export function getUserSimilarityDistribution() {
  return request({ url: '/statistics/recommend/user-similarity', method: 'get' })
}

// 获取智能优化建议
export function getOptimizationSuggestions() {
  return request({ url: '/statistics/recommend/suggestions', method: 'get' })
}

// 预测下期推荐效果
export function predictNextPeriodEffect() {
  return request({ url: '/statistics/recommend/prediction', method: 'get' })
}
