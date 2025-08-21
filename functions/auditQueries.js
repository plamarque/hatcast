const functions = require('firebase-functions')
const AuditService = require('./auditService')

/**
 * Fonction callable pour récupérer les logs d'audit avec filtres
 */
exports.getAuditLogs = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification Firebase CLI
    const userEmail = context.auth?.token?.email
    
    if (!userEmail) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise')
    }
    
    // Autoriser les utilisateurs connectés via Firebase CLI
    // (ils ont déjà accès au projet, donc on peut leur faire confiance)
    const filters = data.filters || {}
    const logs = await AuditService.getAuditLogs(filters)
    
    return {
      success: true,
      count: logs.length,
      logs: logs,
      user: userEmail
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

/**
 * Fonction callable pour rechercher dans les logs d'audit
 */
exports.searchAuditLogs = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification Firebase CLI
    const userEmail = context.auth?.token?.email
    
    if (!userEmail) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise')
    }
    
    const { searchTerm, filters } = data
    
    if (!searchTerm) {
      throw new functions.https.HttpsError('invalid-argument', 'Terme de recherche requis')
    }
    
    const logs = await AuditService.searchAuditLogs(searchTerm, filters)
    
    return {
      success: true,
      count: logs.length,
      logs: logs,
      searchTerm,
      user: userEmail
    }
  } catch (error) {
    console.error('Erreur lors de la recherche dans les logs:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

/**
 * Fonction callable pour obtenir les statistiques d'audit
 */
exports.getAuditStats = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification Firebase CLI
    const userEmail = context.auth?.token?.email
    
    if (!userEmail) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise')
    }
    
    const filters = data.filters || {}
    const stats = await AuditService.getAuditStats(filters)
    
    return {
      success: true,
      stats,
      user: userEmail
    }
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

/**
 * Fonction callable pour obtenir l'historique d'un événement
 */
exports.getEventHistory = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification Firebase CLI
    const userEmail = context.auth?.token?.email
    
    if (!userEmail) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise')
    }
    
    const { seasonSlug, eventTitle } = data
    
    if (!seasonSlug || !eventTitle) {
      throw new functions.https.HttpsError('invalid-argument', 'seasonSlug et eventTitle requis')
    }
    
    const logs = await AuditService.getEventHistory(seasonSlug, eventTitle)
    
    return {
      success: true,
      count: logs.length,
      logs: logs,
      seasonSlug,
      eventTitle,
      user: userEmail
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique événement:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})

/**
 * Fonction callable pour obtenir l'historique d'un joueur
 */
exports.getPlayerHistory = functions.https.onCall(async (data, context) => {
  try {
    // Vérifier l'authentification Firebase CLI
    const userEmail = context.auth?.token?.email
    
    if (!userEmail) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentification requise')
    }
    
    const { seasonSlug, playerName } = data
    
    if (!seasonSlug || !playerName) {
      throw new functions.https.HttpsError('invalid-argument', 'seasonSlug et playerName requis')
    }
    
    const logs = await AuditService.getPlayerHistory(seasonSlug, playerName)
    
    return {
      success: true,
      count: logs.length,
      logs: logs,
      seasonSlug,
      playerName,
      user: userEmail
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique joueur:', error)
    throw new functions.https.HttpsError('internal', error.message)
  }
})