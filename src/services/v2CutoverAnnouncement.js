const DEFAULT_V2_PROD_URL = 'https://hatcast.app'

export function resolveCutoverAnnouncementEnabled(envValue) {
  return envValue === 'true'
}

export function isCutoverAnnouncementEnabled() {
  return resolveCutoverAnnouncementEnabled(import.meta.env.VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED)
}

export function getV2ProdUrl() {
  return resolveV2ProdUrl(import.meta.env.VITE_V2_PROD_URL)
}

export function resolveV2ProdUrl(envValue) {
  const trimmed = String(envValue ?? '').trim()
  if (!trimmed) {
    return DEFAULT_V2_PROD_URL
  }
  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed.replace(/^\/+/, '')}`
}

export function formatV2ProdUrlForDisplay(url) {
  return resolveV2ProdUrl(url).replace(/^https?:\/\//, '').replace(/\/$/, '')
}
