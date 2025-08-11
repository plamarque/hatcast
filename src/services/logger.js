// Simple logging utility with environment-based levels and sensitive-data masking

const SENSITIVE_KEYS = [
  'pin', 'pinCode', 'password', 'motdepasse', 'mdp', 'token', 'oobCode',
  'apiKey', 'apikey', 'key', 'secret', 'authorization', 'auth', 'bearer'
]

function getLogLevel() {
  // Default: debug in development, warn in production unless overridden
  const defaultLevel = (import.meta?.env?.MODE === 'development') ? 'debug' : 'warn'
  const level = import.meta?.env?.VITE_LOG_LEVEL || defaultLevel
  return level
}

function levelToRank(level) {
  switch (level) {
    case 'debug': return 10
    case 'info': return 20
    case 'warn': return 30
    case 'error': return 40
    case 'silent': return 100
    default: return 30
  }
}

function maskString(str) {
  if (typeof str !== 'string') return str
  if (str.length <= 2) return '••'
  // Keep first and last char for long strings, otherwise fully mask
  if (str.length >= 8) {
    return `${str.slice(0, 2)}••••${str.slice(-2)}`
  }
  return '••••'
}

function isLikelySensitiveKey(key) {
  if (!key) return false
  const lower = String(key).toLowerCase()
  return SENSITIVE_KEYS.some(s => lower.includes(s.toLowerCase()))
}

function sanitizeValue(value) {
  if (value == null) return value
  if (typeof value === 'string') {
    // Mask emails
    const emailMatch = value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    if (emailMatch) {
      const [name, domain] = value.split('@')
      const maskedName = name.length <= 2 ? '••' : `${name.slice(0, 2)}••`
      const domainParts = domain.split('.')
      const maskedDomain = domainParts[0].length <= 2
        ? '••'
        : `${domainParts[0].slice(0, 2)}••`
      return `${maskedName}@${maskedDomain}.${domainParts.slice(1).join('.')}`
    }
    // Heuristic: mask strings that look like tokens (long, no spaces)
    const isTokenish = value.length >= 12 && !/\s/.test(value)
    return isTokenish ? maskString(value) : value
  }
  if (typeof value === 'number') {
    // Mask 4-6 digit codes (likely PIN/OTP)
    const str = String(value)
    if (/^\d{4,6}$/.test(str)) return '••••'
    return value
  }
  if (Array.isArray(value)) {
    return value.map(v => sanitizeValue(v))
  }
  if (typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = isLikelySensitiveKey(k) ? '••••' : sanitizeValue(v)
    }
    return out
  }
  return value
}

function sanitizeArgs(args) {
  const out = []
  for (let i = 0; i < args.length; i += 1) {
    const current = args[i]
    const prev = i > 0 ? args[i - 1] : null
    const prevIsSensitiveHint = typeof prev === 'string' && isLikelySensitiveKey(prev)
    if (prevIsSensitiveHint && (typeof current === 'string' || typeof current === 'number')) {
      out.push('••••')
      continue
    }
    out.push(sanitizeValue(current))
  }
  return out
}

const currentLevelRank = levelToRank(getLogLevel())

function makeLoggerMethod(methodLevel, consoleMethod) {
  const methodRank = levelToRank(methodLevel)
  return (...args) => {
    if (methodRank < currentLevelRank) return
    const safeArgs = sanitizeArgs(args)
    // eslint-disable-next-line no-console
    console[consoleMethod](...safeArgs)
  }
}

const logger = {
  debug: makeLoggerMethod('debug', 'log'),
  info: makeLoggerMethod('info', 'info'),
  warn: makeLoggerMethod('warn', 'warn'),
  error: makeLoggerMethod('error', 'error')
}

export default logger


