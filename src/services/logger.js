// Simple logging utility with environment-based levels and sensitive-data masking

const SENSITIVE_KEYS = [
  'pin', 'pinCode', 'password', 'motdepasse', 'mdp', 'token', 'oobCode',
  'apiKey', 'apikey', 'key', 'secret', 'authorization', 'auth', 'bearer'
]

// Clés qui ne doivent jamais être masquées même si elles contiennent des mots sensibles
const SAFE_KEYS = [
  'eventType', 'eventCategory', 'type', 'category', 'severity', 'tags'
]





// Cache pour le niveau de log
let cachedLogLevel = 'info'
let lastLogLevelCheck = 0
const LOG_LEVEL_CACHE_DURATION = 5000 // 5 secondes

// Clé pour localStorage
const LOG_LEVEL_STORAGE_KEY = 'hatcast_log_level'

async function getLogLevelAsync() {
  // Simple pass-through vers le configService
  try {
    // Utiliser import() dynamique au lieu de require() (qui n'existe pas dans le navigateur)
    const configService = await import('./configService.js')
    if (configService.default && configService.default.getLogLevel) {
      const level = configService.default.getLogLevel()
      // Mettre en cache
      cachedLogLevel = level
      lastLogLevelCheck = Date.now()
      // Persister en localStorage
      localStorage.setItem(LOG_LEVEL_STORAGE_KEY, level)
      return level
    }
  } catch (error) {
    console.warn('⚠️ Impossible de lire le niveau de log configuré:', error)
  }
  
  // Fallback de sécurité
  return 'info'
}

function getLogLevel() {
  // Vérifier si le cache est encore valide
  const now = Date.now()
  if (now - lastLogLevelCheck > LOG_LEVEL_CACHE_DURATION) {
    // Rafraîchir le cache en arrière-plan
    getLogLevelAsync().then(level => {
      cachedLogLevel = level
      lastLogLevelCheck = now
    }).catch(() => {
      // En cas d'erreur, garder l'ancienne valeur
    })
  }
  
  return cachedLogLevel
}

// Fonction pour mettre à jour le niveau de log dynamiquement
export async function updateLogLevel() {
  // Simple pass-through vers le configService
  try {
    const configService = await import('./configService.js')
    if (configService.default && configService.default.refreshLogLevel) {
      await configService.default.refreshLogLevel()
    }
  } catch (error) {
    console.warn('⚠️ Impossible de rafraîchir le niveau de log:', error)
  }
}

// Initialiser le niveau de log au chargement
// Vérifier d'abord localStorage, puis configService
const savedLevel = localStorage.getItem(LOG_LEVEL_STORAGE_KEY)
if (savedLevel) {
  cachedLogLevel = savedLevel
  lastLogLevelCheck = Date.now()
  console.log(`🔧 Niveau de log restauré depuis localStorage: ${savedLevel}`)
}

updateLogLevel()
getLogLevelAsync().then(level => {
  cachedLogLevel = level
  lastLogLevelCheck = Date.now()
}).catch(() => {
  // En cas d'erreur, utiliser la valeur par défaut
})

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
  // Ne jamais masquer les clés de métadonnées d'audit
  if (SAFE_KEYS.includes(key)) return false
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
    
    // Ne pas masquer les types d'événements d'audit même s'ils sont longs
    if (value.includes('_') && (value.startsWith('client_') || value.startsWith('user_') || 
        value.startsWith('player_') || value.startsWith('event_') || value.startsWith('notification_'))) {
      return value
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

function makeLoggerMethod(methodLevel, consoleMethod) {
  const methodRank = levelToRank(methodLevel)
  return (...args) => {
    // Vérifier le niveau de log à chaque appel pour permettre les changements dynamiques
    const currentLevelRank = levelToRank(getLogLevel())
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

// Remplacer console.log par le système de logging pour respecter le niveau de log
const originalConsoleLog = console.log
console.log = (...args) => {
  // Vérifier le niveau de log actuel
  const currentLevelRank = levelToRank(getLogLevel())
  const debugRank = levelToRank('debug')
  
  // Si le niveau est 'silent', ne rien afficher
  if (currentLevelRank >= levelToRank('silent')) {
    return
  }
  
  // Si le niveau est 'debug' ou plus bas, afficher le log
  if (currentLevelRank <= debugRank) {
    const safeArgs = sanitizeArgs(args)
    originalConsoleLog(...safeArgs)
  }
}

export default logger


