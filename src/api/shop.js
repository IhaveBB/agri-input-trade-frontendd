import request from '@/utils/request'

// 获取店铺信息
export function getShopInfo(merchantId) {
  return request({ url: '/shop/info', method: 'get', params: { merchantId } })
}

// 获取店铺商品列表
export function getShopProducts(merchantId, pageNum = 1, pageSize = 10) {
  return request({ url: '/shop/products', method: 'get', params: { merchantId, pageNum, pageSize } })
}

// 获取店铺评价列表
export function getShopReviews(merchantId, pageNum = 1, pageSize = 10) {
  return request({ url: '/shop/reviews', method: 'get', params: { merchantId, pageNum, pageSize } })
}

// 获取店铺统计信息
export function getShopStatistics(merchantId) {
  return request({ url: '/shop/statistics', method: 'get', params: { merchantId } })
}
