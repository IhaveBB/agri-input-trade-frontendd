const placeholderCache = new Map()

const palettes = [
  { bg: '#f7f9f3', panel: '#ffffff', primary: '#2c9678', accent: '#f0b429', line: '#dfe8dc' },
  { bg: '#f7f8fb', panel: '#ffffff', primary: '#3b6ea8', accent: '#e4934b', line: '#dfe4ee' },
  { bg: '#f6faf8', panel: '#ffffff', primary: '#32876f', accent: '#cf6f5a', line: '#dce9e4' },
  { bg: '#faf8f4', panel: '#ffffff', primary: '#8a6f3d', accent: '#3f8f8a', line: '#e9e1d3' },
  { bg: '#f8f7fb', panel: '#ffffff', primary: '#6955a3', accent: '#d69245', line: '#e3deed' },
  { bg: '#f5f9fa', panel: '#ffffff', primary: '#287c94', accent: '#d47b5d', line: '#dbe8ec' }
]

function isEmptyImageUrl(url) {
  if (url === null || url === undefined) return true
  const value = String(url).trim()
  return !value || value === 'null' || value === 'undefined'
}

export function normalizeImageUrl(url) {
  if (isEmptyImageUrl(url)) return ''
  const value = String(url).trim()
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:image') || value.startsWith('blob:')) {
    return value
  }
  if (value.startsWith('/api/')) return value
  if (value.startsWith('/api')) return value
  return value.startsWith('/') ? `/api${value}` : `/api/${value}`
}

function hashText(text) {
  const value = String(text || '商品')
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function takeChars(text, count) {
  return Array.from(String(text || '')).slice(0, count).join('')
}

function splitProductName(name) {
  const chars = Array.from(name || '商品')
  const first = chars.slice(0, 8).join('')
  const second = chars.length > 8 ? chars.slice(8, 16).join('') : ''
  return {
    first: first || '商品',
    second: chars.length > 16 ? `${second}...` : second
  }
}

export function generateProductPlaceholder(product = {}) {
  product = product || {}
  const name = String(product.name || product.productName || '商品').trim() || '商品'
  const category = String(product.categoryName || product.category?.name || '农资商品').trim() || '农资商品'
  const origin = String(product.placeOfOrigin || product.origin || '').trim()
  const cacheKey = `${name}|${category}|${origin}`

  if (placeholderCache.has(cacheKey)) {
    return placeholderCache.get(cacheKey)
  }

  const seed = hashText(cacheKey)
  const palette = palettes[seed % palettes.length]
  const title = splitProductName(name)
  const tag = takeChars(category, 8)
  const originText = origin ? takeChars(origin, 10) : '品质农资'
  const mark = takeChars(name, 2)

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
  <rect width="640" height="640" rx="34" fill="${palette.bg}"/>
  <path d="M88 124 C170 76 244 84 318 124 C396 166 472 154 552 102" fill="none" stroke="${palette.line}" stroke-width="14" stroke-linecap="round" opacity=".75"/>
  <path d="M82 520 C172 468 252 472 324 510 C406 554 488 542 560 492" fill="none" stroke="${palette.line}" stroke-width="12" stroke-linecap="round" opacity=".6"/>
  <rect x="82" y="92" width="476" height="456" rx="26" fill="${palette.panel}" stroke="${palette.line}" stroke-width="2"/>
  <circle cx="320" cy="196" r="68" fill="${palette.primary}" opacity=".12"/>
  <circle cx="320" cy="196" r="44" fill="${palette.primary}" opacity=".95"/>
  <text x="320" y="207" text-anchor="middle" font-size="30" font-weight="700" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" fill="#ffffff">${escapeXml(mark)}</text>
  <rect x="232" y="278" width="176" height="40" rx="20" fill="${palette.accent}" opacity=".14"/>
  <text x="320" y="304" text-anchor="middle" font-size="22" font-weight="600" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" fill="${palette.primary}">${escapeXml(tag)}</text>
  <text x="320" y="382" text-anchor="middle" font-size="44" font-weight="700" letter-spacing="0" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" fill="#2f3437">${escapeXml(title.first)}</text>
  ${title.second ? `<text x="320" y="436" text-anchor="middle" font-size="34" font-weight="600" letter-spacing="0" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" fill="#4f575b">${escapeXml(title.second)}</text>` : ''}
  <line x1="234" y1="480" x2="406" y2="480" stroke="${palette.line}" stroke-width="3" stroke-linecap="round"/>
  <text x="320" y="518" text-anchor="middle" font-size="22" font-weight="500" font-family="PingFang SC, Microsoft YaHei, Arial, sans-serif" fill="#7b858a">${escapeXml(originText)}</text>
</svg>`.trim()

  const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  placeholderCache.set(cacheKey, dataUrl)
  return dataUrl
}

export function getProductImageSrc(product = {}, options = {}) {
  const source = product || {}
  const imageUrl = typeof source === 'string' ? source : source.imageUrl
  if (!options.forcePlaceholder && !isEmptyImageUrl(imageUrl)) {
    return normalizeImageUrl(imageUrl)
  }
  return generateProductPlaceholder(typeof source === 'string' ? { name: options.name } : source)
}
