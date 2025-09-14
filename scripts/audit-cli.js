#!/usr/bin/env node

const admin = require('firebase-admin')

// Détecter l'environnement
function detectEnvironment(options = {}) {
  // Priorité 1: Option --env
  if (options.env) {
    const env = options.env
    const databaseMap = {
      'development': 'development',
      'staging': 'staging',
      'production': 'default',
      'default': 'default'
    }
    
    if (databaseMap[env]) {
      return databaseMap[env]
    } else {
      console.warn(`⚠️ Environnement inconnu: ${env}, utilisation de 'development'`)
      return 'development'
    }
  }
  
  // Priorité 2: Variables d'environnement
  const env = process.env.NODE_ENV || process.env.FIREBASE_ENV || 'development'
  
  // Mapping des environnements vers les bases Firestore
  const databaseMap = {
    'development': 'development',
    'staging': 'staging',
    'production': 'default',
    'default': 'default'
  }
  
  return databaseMap[env] || 'development'
}

// Initialiser Firebase Admin avec les credentials Firebase CLI
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'impro-selector',
    credential: admin.credential.applicationDefault()
  })
}

// Se connecter à la base appropriée (sera mis à jour après parsing des options)
let environment = 'development'
let db = admin.firestore()

// Fonction pour mettre à jour la connexion selon l'environnement
function updateConnection(options = {}) {
  environment = detectEnvironment(options)
  
  // Se reconnecter à la base appropriée
  try {
    db = admin.firestore()
    console.log(`🔧 Connexion à la base Firestore: ${environment}`)
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à la base:', error)
    process.exit(1)
  }
}

// Fonctions pour interroger directement Firestore
async function getAuditLogsDirect(filters = {}) {
  try {
    let query = db.collection('auditLogs')

    // Appliquer les filtres
    if (filters.seasonSlug) {
      query = query.where('seasonSlug', '==', filters.seasonSlug)
    }
    
    if (filters.eventId) {
      query = query.where('eventId', '==', filters.eventId)
    }
    
    if (filters.eventTitle) {
      query = query.where('eventTitle', '==', filters.eventTitle)
    }
    
    if (filters.playerName) {
      query = query.where('playerName', '==', filters.playerName)
    }
    
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId)
    }
    
    if (filters.eventType) {
      query = query.where('eventType', '==', filters.eventType)
    }
    
    if (filters.severity) {
      query = query.where('severity', '==', filters.severity)
    }
    
    if (filters.startDate) {
      query = query.where('timestamp', '>=', new Date(filters.startDate))
    }
    
    if (filters.endDate) {
      query = query.where('timestamp', '<=', new Date(filters.endDate))
    }
    
    // Nouveaux filtres pour les données imbriquées
    if (filters.user) {
      // Rechercher dans userEmail
      query = query.where('userEmail', '==', filters.user)
    }
    
    if (filters.player) {
      // Rechercher dans data.playerName
      query = query.where('data.playerName', '==', filters.player)
    }
    
    if (filters.event) {
      // Rechercher dans data.eventTitle
      query = query.where('data.eventTitle', '==', filters.event)
    }
    
    if (filters.season) {
      // Rechercher dans data.seasonSlug
      query = query.where('data.seasonSlug', '==', filters.season)
    }

    // Trier par timestamp décroissant
    query = query.orderBy('timestamp', 'desc')
    
    // Limiter le nombre de résultats
    if (filters.limit) {
      query = query.limit(parseInt(filters.limit))
    } else {
      query = query.limit(100) // Limite par défaut
    }

    const snapshot = await query.get()
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error)
    throw error
  }
}



// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logError(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`)
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`)
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`)
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
}

// Authentification via Firebase CLI
async function authenticate() {
  try {
    logSuccess('Utilisation des credentials Firebase CLI')
    return 'admin'
  } catch (error) {
    logError(`Erreur d'authentification: ${error.message}`)
    process.exit(1)
  }
}

// Obfusquer partiellement une adresse email
function obfuscateEmail(email) {
  if (!email || typeof email !== 'string') return 'Anonyme'
  
  const parts = email.split('@')
  if (parts.length !== 2) return email
  
  const [localPart, domain] = parts
  
  // Obfusquer la partie locale (avant @)
  let obfuscatedLocal = localPart
  if (localPart.length <= 3) {
    obfuscatedLocal = localPart.charAt(0) + '••'
  } else {
    obfuscatedLocal = localPart.substring(0, 3) + '••'
  }
  
  // Obfusquer le domaine
  const domainParts = domain.split('.')
  let obfuscatedDomain = domain
  if (domainParts.length >= 2) {
    const mainDomain = domainParts[0]
    const extension = domainParts.slice(1).join('.')
    
    if (mainDomain.length <= 2) {
      obfuscatedDomain = '••' + '.' + extension
    } else {
      obfuscatedDomain = mainDomain.substring(0, 2) + '••' + '.' + extension
    }
  }
  
  return `${obfuscatedLocal}@${obfuscatedDomain}`
}

// Formater un timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A'
  
  let date
  try {
    // Gérer les timestamps Firestore serverTimestamp non encore traités
    if (timestamp && timestamp._methodName === 'serverTimestamp') {
      return '⏳ En cours...'
    }
    
    // Gérer les timestamps Firestore
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate()
    } else if (timestamp && timestamp.seconds) {
      // Timestamp Firestore en format {seconds, nanoseconds}
      date = new Date(timestamp.seconds * 1000)
    } else if (timestamp instanceof Date) {
      date = timestamp
    } else {
      // Essayer de parser comme string ou number
      date = new Date(timestamp)
    }
    
    // Vérifier que la date est valide
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    return date.toLocaleString('fr-FR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    console.error('Erreur formatage timestamp:', error, 'timestamp:', timestamp)
    return 'Invalid Date'
  }
}

// Afficher un log d'audit en format tabulaire
function displayLog(log) {
  const timestamp = formatTimestamp(log.timestamp)
  const action = log.eventType
  
  // Récupérer et obfusquer l'email de l'utilisateur
  let user = 'Anonyme'
  if (log.data && log.data.email) {
    user = obfuscateEmail(log.data.email)
  } else if (log.data && log.data.context && log.data.context.email) {
    user = obfuscateEmail(log.data.context.email)
  } else if (log.userEmail) {
    user = obfuscateEmail(log.userEmail)
  } else if (log.userId && log.userId !== 'anonymous') {
    // Pour les connexions anonymes, afficher "Anonyme" au lieu de l'ID
    if (log.eventType === 'user_login' && log.data && log.data.method === 'firebase_auth') {
      user = 'Anonyme'
    } else {
      user = log.userId
    }
  }
  
  const saison = log.data?.seasonSlug || log.seasonSlug || '-'
  const spectacle = log.data?.eventTitle || log.eventTitle || '-'
  const joueur = log.data?.playerName || log.playerName || '-'
  
  // Formater le changement avec le statut de succès
  let changement = log.success ? '✅ success' : '❌ failure'
  
  // Ajouter des détails spécifiques selon le type d'action
  if (log.data) {
    if (log.data.oldValue !== undefined && log.data.newValue !== undefined) {
      changement += ` (${log.data.oldValue || 'null'} → ${log.data.newValue || 'null'})`
    } else if (log.data.added && log.data.added.length > 0) {
      changement += ` (+${log.data.added.join(', ')})`
    } else if (log.data.removed && log.data.removed.length > 0) {
      changement += ` (-${log.data.removed.join(', ')})`
    } else if (log.data.error) {
      changement = `❌ failure (${log.data.error})`
    } else if (log.data.change) {
      changement += ` (${log.data.change})`
    } else if (log.data.method) {
      changement += ` (${log.data.method})`
    } else if (log.data.eventTitle) {
      changement += ` (${log.data.eventTitle})`
    } else if (log.data.playerName) {
      changement += ` (${log.data.playerName})`
    } else if (log.data.seasonSlug) {
      changement += ` (${log.data.seasonSlug})`
    } else if (log.data.oldName && log.data.newName) {
      changement += ` (${log.data.oldName} → ${log.data.newName})`
    } else if (log.data.changes) {
      changement += ` (modifications)`
    }
  }
  
  // Couleur selon la sévérité
  const severityColors = {
    info: 'cyan',
    warning: 'yellow',
    error: 'red',
    critical: 'red'
  }
  const color = severityColors[log.severity] || 'reset'
  
  // Afficher en format tabulaire (changement en 3e position)
  console.log(`${colors[color]}${timestamp} | ${action} | ${changement} | ${user} | ${saison} | ${spectacle} | ${joueur}${colors.reset}`)
}

// Afficher l'en-tête du tableau
function displayTableHeader() {
  console.log(`${colors.bright}Timestamp | Action | Changement | User | Saison | Spectacle | Joueur${colors.reset}`)
  console.log(`${colors.bright}----------|--------|-----------|------|--------|-----------|--------${colors.reset}`)
}

// Commande: Lister les logs avec filtres
async function listLogs(filters = {}) {
  try {
    // Construire le message de filtres appliqués
    const appliedFilters = []
    if (filters.user) appliedFilters.push(`utilisateur: ${obfuscateEmail(filters.user)}`)
    if (filters.player) appliedFilters.push(`joueur: ${filters.player}`)
    if (filters.event) appliedFilters.push(`spectacle: ${filters.event}`)
    if (filters.season) appliedFilters.push(`saison: ${filters.season}`)
    if (filters.type) appliedFilters.push(`type: ${filters.type}`)
    
    const filterMessage = appliedFilters.length > 0 
      ? ` avec filtres: ${appliedFilters.join(', ')}`
      : ''
    
    logInfo(`Récupération des logs d'audit${filterMessage}...`)
    
    const logs = await getAuditLogsDirect(filters)
    
    if (!logs || logs.length === 0) {
      logWarning('Aucun log trouvé avec ces critères')
      return
    }
    
    logSuccess(`${logs.length} logs trouvés`)
    console.log()
    
    // Afficher les logs en format tabulaire
    if (filters.debug) {
      console.log('\n🔍 Mode debug - Structure complète du premier log:')
      console.log(JSON.stringify(logs[0], null, 2))
      console.log()
    }
    
    displayTableHeader()
    logs.forEach(displayLog)
    
  } catch (error) {
    logError(`Erreur lors de la récupération des logs: ${error.message}`)
    console.error('Détails:', error)
  }
}

// Commande: Rechercher dans les logs
async function searchLogs(searchTerm, filters = {}) {
  try {
    logInfo(`Recherche de "${searchTerm}" dans les logs...`)
    
    // Récupérer tous les logs et filtrer côté client pour la recherche
    const allLogs = await getAuditLogsDirect({ limit: 1000 })
    
    // Filtrer les logs qui contiennent le terme de recherche
    const filteredLogs = allLogs.filter(log => {
      const searchableText = JSON.stringify(log).toLowerCase()
      return searchableText.includes(searchTerm.toLowerCase())
    })
    
    if (filteredLogs.length === 0) {
      logWarning('Aucun résultat trouvé')
      return
    }
    
    logSuccess(`${filteredLogs.length} résultats trouvés pour "${searchTerm}"`)
    
    displayTableHeader()
    filteredLogs.forEach(displayLog)
    
  } catch (error) {
    logError(`Erreur: ${error.message}`)
  }
}

// Commande: Statistiques
async function showStats(seasonSlug = null, days = 7) {
  try {
    logInfo(`Calcul des statistiques pour les ${days} derniers jours...`)
    
    const result = await getAuditStats({ seasonSlug, days })
    
    if (result.data.success) {
      const { stats, period, seasonSlug: season } = result.data
      
      logSuccess(`Statistiques pour ${season} (${period})`)
      log(`\n📊 Actions totales: ${stats.totalActions}`)
      log(`❌ Erreurs: ${stats.errors}`)
      log(`👤 Actions anonymes: ${stats.anonymousActions}`)
      
      if (Object.keys(stats.byEventType).length > 0) {
        log('\n🎯 Par type d\'événement:')
        Object.entries(stats.byEventType)
          .sort(([,a], [,b]) => b - a)
          .forEach(([type, count]) => {
            log(`   ${type}: ${count}`)
          })
      }
      
      if (Object.keys(stats.byUser).length > 0) {
        log('\n👥 Par utilisateur:')
        Object.entries(stats.byUser)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .forEach(([user, count]) => {
            log(`   ${user}: ${count}`)
          })
      }
    } else {
      logError('Erreur lors du calcul des statistiques')
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`)
  }
}

// Commande: Historique d'un événement
async function showEventHistory(seasonSlug, eventTitle) {
  try {
    logInfo(`Historique de l'événement "${eventTitle}" dans ${seasonSlug}...`)
    
    const result = await getEventHistory({ seasonSlug, eventTitle })
    
    if (result.data.success) {
      const { eventTitle: title, seasonSlug: season, totalActions, timeline } = result.data
      
      logSuccess(`Historique de "${title}" dans ${season}`)
      log(`📊 Total: ${totalActions} actions`)
      
      if (timeline.length === 0) {
        logWarning('Aucun historique trouvé')
        return
      }
      
      displayTableHeader()
      timeline.forEach(displayLog)
    } else {
      logError('Erreur lors de la récupération de l\'historique')
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`)
  }
}

// Commande: Historique d'un joueur
async function showPlayerHistory(seasonSlug, playerName) {
  try {
    logInfo(`Historique du joueur "${playerName}" dans ${seasonSlug}...`)
    
    const result = await getPlayerHistory({ seasonSlug, playerName })
    
    if (result.data.success) {
      const { playerName: name, seasonSlug: season, totalActions, timeline } = result.data
      
      logSuccess(`Historique de "${name}" dans ${season}`)
      log(`📊 Total: ${totalActions} actions`)
      
      if (timeline.length === 0) {
        logWarning('Aucun historique trouvé')
        return
      }
      
      displayTableHeader()
      timeline.forEach(displayLog)
    } else {
      logError('Erreur lors de la récupération de l\'historique')
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`)
  }
}

// Fonction pour détecter si un user agent correspond à un appareil mobile
function isMobileDevice(userAgent) {
  if (!userAgent) return false
  
  const mobileKeywords = [
    'Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone',
    'Opera Mini', 'IEMobile', 'Mobile Safari', 'webOS', 'Palm'
  ]
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword))
}

// Fonction pour extraire le type d'appareil mobile
function extractMobileDeviceInfo(userAgent) {
  if (!userAgent) return { type: 'Unknown', details: 'No user agent' }
  
  // iPhone
  if (userAgent.includes('iPhone')) {
    return { type: 'iPhone', details: userAgent }
  }
  
  // iPad
  if (userAgent.includes('iPad')) {
    return { type: 'iPad', details: userAgent }
  }
  
  // Android
  if (userAgent.includes('Android')) {
    // Extraire la version d'Android si possible
    const androidMatch = userAgent.match(/Android ([\d.]+)/)
    const androidVersion = androidMatch ? androidMatch[1] : 'Unknown version'
    return { type: 'Android', details: `${androidVersion} - ${userAgent}` }
  }
  
  // Autres appareils mobiles
  if (userAgent.includes('Mobile')) {
    return { type: 'Mobile', details: userAgent }
  }
  
  return { type: 'Unknown Mobile', details: userAgent }
}

// Commande: Analyser les appareils mobiles
async function showMobileDevices(days = 8) {
  try {
    logInfo(`Analyse des appareils mobiles utilisés au cours des ${days} derniers jours...`)
    
    // Calculer la date de début
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Récupérer tous les logs (sans limite de date car les timestamps ne sont pas encore traités)
    const filters = {
      limit: 2000 // Augmenter la limite pour avoir plus de données
    }
    
    const logs = await getAuditLogsDirect(filters)
    
    if (!logs || logs.length === 0) {
      logWarning('Aucun log trouvé pour cette période')
      return
    }
    
    logSuccess(`${logs.length} logs trouvés pour la période`)
    
    // Analyser les appareils mobiles
    const mobileDevices = new Map()
    const deviceStats = {
      totalMobileSessions: 0,
      uniqueMobileDevices: 0,
      byType: {},
      byUser: new Map()
    }
    
    logs.forEach(log => {
      const userAgent = log.userAgent || log.deviceInfo?.userAgent
      
      if (isMobileDevice(userAgent)) {
        deviceStats.totalMobileSessions++
        
        const deviceInfo = extractMobileDeviceInfo(userAgent)
        const deviceKey = `${deviceInfo.type}-${userAgent}`
        
        if (!mobileDevices.has(deviceKey)) {
          mobileDevices.set(deviceKey, {
            type: deviceInfo.type,
            userAgent: userAgent,
            firstSeen: log.timestamp,
            lastSeen: log.timestamp,
            sessions: 0,
            users: new Set()
          })
          deviceStats.uniqueMobileDevices++
        }
        
        const device = mobileDevices.get(deviceKey)
        device.sessions++
        
        // Mettre à jour les dates
        if (new Date(log.timestamp) < new Date(device.firstSeen)) {
          device.firstSeen = log.timestamp
        }
        if (new Date(log.timestamp) > new Date(device.lastSeen)) {
          device.lastSeen = log.timestamp
        }
        
        // Ajouter l'utilisateur
        const userEmail = log.data?.email || log.userEmail
        if (userEmail) {
          device.users.add(userEmail)
        }
        
        // Statistiques par type
        if (!deviceStats.byType[deviceInfo.type]) {
          deviceStats.byType[deviceInfo.type] = 0
        }
        deviceStats.byType[deviceInfo.type]++
        
        // Statistiques par utilisateur
        if (userEmail) {
          if (!deviceStats.byUser.has(userEmail)) {
            deviceStats.byUser.set(userEmail, new Set())
          }
          deviceStats.byUser.get(userEmail).add(deviceKey)
        }
      }
    })
    
    // Afficher les résultats
    logSuccess(`📱 Analyse des appareils mobiles (${days} derniers jours)`)
    console.log()
    
    log(`📊 Statistiques globales:`)
    log(`   Sessions mobiles totales: ${deviceStats.totalMobileSessions}`)
    log(`   Appareils mobiles uniques: ${deviceStats.uniqueMobileDevices}`)
    console.log()
    
    // Analyser les résolutions d'écran par utilisateur unique
    const resolutions = new Map()
    const userResolutions = new Map() // Pour éviter de compter le même utilisateur plusieurs fois par résolution
    
    logs.forEach(log => {
      const userAgent = log.userAgent || log.deviceInfo?.userAgent
      const screenResolution = log.deviceInfo?.screenResolution
      const userEmail = log.data?.email || log.userEmail || log.userId || 'anonymous'
      
      if (screenResolution) {
        if (!resolutions.has(screenResolution)) {
          resolutions.set(screenResolution, {
            userCount: 0,
            sessionCount: 0,
            devices: new Set(),
            users: new Set()
          })
        }
        
        const resolutionData = resolutions.get(screenResolution)
        resolutionData.sessionCount++
        
        // Ajouter l'utilisateur unique à cette résolution
        if (!userResolutions.has(userEmail)) {
          userResolutions.set(userEmail, new Set())
        }
        
        if (!userResolutions.get(userEmail).has(screenResolution)) {
          userResolutions.get(userEmail).add(screenResolution)
          resolutionData.users.add(userEmail)
          resolutionData.userCount++
        }
        
        // Ajouter le type d'appareil
        if (userAgent) {
          const deviceInfo = extractMobileDeviceInfo(userAgent)
          resolutionData.devices.add(deviceInfo.type)
        }
      }
    })
    
    if (resolutions.size > 0) {
      log(`📐 Résolutions d'écran par nombre d'utilisateurs uniques (${days} derniers jours):`)
      Array.from(resolutions.entries())
        .sort(([,a], [,b]) => b.userCount - a.userCount)
        .forEach(([resolution, data]) => {
          const devices = Array.from(data.devices).join(', ') || 'Unknown'
          log(`   ${resolution}: ${data.userCount} utilisateur(s) unique(s) - ${data.sessionCount} sessions (${devices})`)
        })
      console.log()
      
      // Statistiques globales
      const totalUsers = userResolutions.size
      const totalResolutions = resolutions.size
      log(`📊 Statistiques globales:`)
      log(`   Utilisateurs uniques total: ${totalUsers}`)
      log(`   Résolutions uniques total: ${totalResolutions}`)
      console.log()
    }
    
    if (Object.keys(deviceStats.byType).length > 0) {
      log(`📱 Répartition par type d'appareil:`)
      Object.entries(deviceStats.byType)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          log(`   ${type}: ${count} sessions`)
        })
      console.log()
    }
    
    if (deviceStats.byUser.size > 0) {
      log(`👥 Utilisateurs avec appareils mobiles:`)
      Array.from(deviceStats.byUser.entries())
        .sort(([,a], [,b]) => b.size - a.size)
        .slice(0, 10)
        .forEach(([user, devices]) => {
          log(`   ${obfuscateEmail(user)}: ${devices.size} appareil(s)`)
        })
      console.log()
    }
    
    log(`📱 Détail des appareils mobiles:`)
    log(`${colors.bright}Type | Sessions | Utilisateurs | Première utilisation | Dernière utilisation | User Agent${colors.reset}`)
    log(`${colors.bright}-----|----------|--------------|---------------------|---------------------|-----------${colors.reset}`)
    
    Array.from(mobileDevices.values())
      .sort((a, b) => b.sessions - a.sessions)
      .forEach(device => {
        const firstSeen = formatTimestamp(device.firstSeen)
        const lastSeen = formatTimestamp(device.lastSeen)
        const userCount = device.users.size
        const userAgentPreview = device.userAgent ? device.userAgent.substring(0, 80) + '...' : 'N/A'
        
        console.log(`${device.type} | ${device.sessions} | ${userCount} | ${firstSeen} | ${lastSeen} | ${userAgentPreview}`)
      })
    
  } catch (error) {
    logError(`Erreur lors de l'analyse des appareils mobiles: ${error.message}`)
    console.error('Détails:', error)
  }
}

// Afficher l'aide
function showHelp() {
  log(`${colors.bright}🔍 HatCast Audit CLI${colors.reset}`, 'cyan')
  log('\nUtilisation:')
  log('  node audit-cli.js <commande> [options]')
  log('\nCommandes:')
  log('  list [--user=EMAIL] [--player=NAME] [--event=TITLE] [--season=SLUG] [--type=TYPE] [--limit=N]')
  log('    Liste les logs d\'audit avec filtres optionnels')
  log('\n  search <terme> [--season=SLUG]')
  log('    Recherche textuelle dans les logs')
  log('\n  stats [--season=SLUG] [--days=N]')
  log('    Affiche les statistiques (défaut: 7 jours)')
  log('\n  event <season> <eventTitle>')
  log('    Historique complet d\'un événement')
  log('\n  player <season> <playerName>')
  log('    Historique complet d\'un joueur')
  log('\n  mobile [--days=N]')
  log('    Analyse des appareils mobiles utilisés (défaut: 8 jours)')
  log('\n  help')
  log('    Affiche cette aide')
  log('\nFiltres disponibles:')
  log('  --user=EMAIL     : Logs d\'un utilisateur spécifique')
  log('  --player=NAME    : Logs concernant un joueur spécifique')
  log('  --event=TITLE    : Logs d\'un spectacle spécifique')
  log('  --season=SLUG    : Logs d\'une saison spécifique')
  log('  --type=TYPE      : Type d\'événement (ex: player_confirmed)')
  log('  --limit=N        : Nombre maximum de résultats (défaut: 100)')
  log('  --env=ENV        : Environnement (development, staging, production)')
  log('\nExemples:')
  log('  node audit-cli.js list --user="patrice.lamarque@gmail.com" --limit=20')
  log('  node audit-cli.js list --player="Christopher" --season="test"')
  log('  node audit-cli.js list --event="TOTO123" --type="player_confirmed"')
  log('  node audit-cli.js search "Catch chez Geoff" --season="malice-2025-2026"')
  log('  node audit-cli.js event "malice-2025-2026" "Catch chez Geoff"')
  log('  node audit-cli.js stats --season="malice-2025-2026" --days=30')
  log('  node audit-cli.js mobile --days=8 --env=production')
}

// Parser les arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (!command || command === 'help') {
    showHelp()
    return null
  }
  
  const options = {}
  
  // Parser les options --key=value et --debug
  args.slice(1).forEach(arg => {
    if (arg === '--debug') {
      options.debug = true
    } else if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      options[key] = value
    }
  })
  
  return { command, options, args: args.slice(1) }
}

// Main
async function main() {
  try {
    const parsed = parseArgs()
    if (!parsed) return // Si help a été affiché
    
    const { command, options, args } = parsed
    
    if (!command) return
    
    // Authentification via Firebase CLI
    const userEmail = await authenticate()
    
    // Mettre à jour la connexion selon l'environnement
    updateConnection(options)
    
    // Exécuter la commande
    switch (command) {
      case 'list':
        await listLogs(options)
        break
        
      case 'search':
        const searchTerm = args[0]
        if (!searchTerm) {
          logError('Terme de recherche requis')
          return
        }
        await searchLogs(searchTerm, options)
        break
        
      case 'stats':
        await showStats(options.season, parseInt(options.days) || 7)
        break
        
      case 'event':
        const [seasonSlug, eventTitle] = args
        if (!seasonSlug || !eventTitle) {
          logError('season et eventTitle requis')
          return
        }
        await showEventHistory(seasonSlug, eventTitle)
        break
        
      case 'player':
        const [playerSeason, playerName] = args
        if (!playerSeason || !playerName) {
          logError('season et playerName requis')
          return
        }
        await showPlayerHistory(playerSeason, playerName)
        break
        
      case 'mobile':
        await showMobileDevices(parseInt(options.days) || 8)
        break
        
      default:
        logError(`Commande inconnue: ${command}`)
        showHelp()
    }
  } catch (error) {
    logError(`Erreur: ${error.message}`)
    process.exit(1)
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main()
}

module.exports = {
  authenticate,
  listLogs,
  searchLogs,
  showStats,
  showEventHistory,
  showPlayerHistory,
  showMobileDevices
}