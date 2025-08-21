const functions = require('firebase-functions')
const AuditService = require('./auditService')

/**
 * Trigger pour les changements de disponibilités
 */
exports.auditAvailabilityChanges = functions.firestore
  .document('seasons/{seasonId}/availabilities/{playerName}')
  .onWrite(async (change, context) => {
    const { seasonId, playerName } = context.params
    const before = change.before.exists ? change.before.data() : null
    const after = change.after.exists ? change.after.data() : null
    
    try {
      // Récupérer les infos de la saison
      const seasonDoc = await change.after.ref.parent.parent.get()
      const seasonData = seasonDoc.data()
      const seasonSlug = seasonData?.slug || seasonId
      
      // Récupérer les infos de l'utilisateur
      const userId = context.auth?.uid || 'anonymous'
      const userEmail = context.auth?.token?.email || null
      const isAnonymous = !context.auth?.uid
      
      if (!before && after) {
        // Nouvelle disponibilité créée
        console.log(`Nouvelle disponibilité créée pour ${playerName} dans ${seasonSlug}`)
        
        // Log chaque événement individuellement
        for (const [eventId, value] of Object.entries(after)) {
          if (eventId !== 'updatedAt' && value !== null) {
            await AuditService.logAvailabilityChange({
              seasonSlug,
              eventId,
              eventTitle: eventId, // On pourrait récupérer le vrai titre depuis Firestore
              playerName,
              userId,
              userEmail,
              isAnonymous,
              oldValue: null,
              newValue: value
            })
          }
        }
      } else if (before && after) {
        // Disponibilité modifiée
        console.log(`Disponibilité modifiée pour ${playerName} dans ${seasonSlug}`)
        
        // Comparer les valeurs avant/après
        const allEventIds = new Set([
          ...Object.keys(before),
          ...Object.keys(after)
        ])
        
        for (const eventId of allEventIds) {
          if (eventId !== 'updatedAt') {
            const oldValue = before[eventId] || null
            const newValue = after[eventId] || null
            
            if (oldValue !== newValue) {
              await AuditService.logAvailabilityChange({
                seasonSlug,
                eventId,
                eventTitle: eventId,
                playerName,
                userId,
                userEmail,
                isAnonymous,
                oldValue,
                newValue
              })
            }
          }
        }
      } else if (before && !after) {
        // Disponibilité supprimée
        console.log(`Disponibilité supprimée pour ${playerName} dans ${seasonSlug}`)
        
        for (const [eventId, value] of Object.entries(before)) {
          if (eventId !== 'updatedAt') {
            await AuditService.logAvailabilityChange({
              seasonSlug,
              eventId,
              eventTitle: eventId,
              playerName,
              userId,
              userEmail,
              isAnonymous,
              oldValue: value,
              newValue: null
            })
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur dans auditAvailabilityChanges:', error)
      await AuditService.logError({
        error: error.message,
        context: 'auditAvailabilityChanges',
        seasonSlug: seasonId,
        playerName,
        userId: context.auth?.uid || 'anonymous'
      })
    }
  })

/**
 * Trigger pour les changements de sélections
 */
exports.auditSelectionChanges = functions.firestore
  .document('seasons/{seasonId}/selections/{eventId}')
  .onWrite(async (change, context) => {
    const { seasonId, eventId } = context.params
    const before = change.before.exists ? change.before.data() : null
    const after = change.after.exists ? change.after.data() : null
    
    try {
      // Récupérer les infos de la saison
      const seasonDoc = await change.after.ref.parent.parent.get()
      const seasonData = seasonDoc.data()
      const seasonSlug = seasonData?.slug || seasonId
      
      // Récupérer les infos de l'utilisateur
      const userId = context.auth?.uid || 'anonymous'
      const userEmail = context.auth?.token?.email || null
      const isAnonymous = !context.auth?.uid
      
      let eventType = 'selection_updated'
      let oldPlayers = []
      let newPlayers = []
      
      if (!before && after) {
        eventType = 'selection_created'
        newPlayers = after.players || []
      } else if (before && after) {
        eventType = 'selection_updated'
        oldPlayers = before.players || []
        newPlayers = after.players || []
      } else if (before && !after) {
        eventType = 'selection_deleted'
        oldPlayers = before.players || []
      }
      
      await AuditService.logSelectionChange({
        eventType,
        seasonSlug,
        eventId,
        eventTitle: eventId, // On pourrait récupérer le vrai titre depuis Firestore
        userId,
        userEmail,
        isAnonymous,
        oldPlayers,
        newPlayers
      })
      
    } catch (error) {
      console.error('Erreur dans auditSelectionChanges:', error)
      await AuditService.logError({
        error: error.message,
        context: 'auditSelectionChanges',
        seasonSlug: seasonId,
        eventId,
        userId: context.auth?.uid || 'anonymous'
      })
    }
  })

/**
 * Trigger pour les changements d'événements
 */
exports.auditEventChanges = functions.firestore
  .document('seasons/{seasonId}/events/{eventId}')
  .onWrite(async (change, context) => {
    const { seasonId, eventId } = context.params
    const before = change.before.exists ? change.before.data() : null
    const after = change.after.exists ? change.after.data() : null
    
    try {
      // Récupérer les infos de la saison
      const seasonDoc = await change.after.ref.parent.parent.get()
      const seasonData = seasonDoc.data()
      const seasonSlug = seasonData?.slug || seasonId
      
      // Récupérer les infos de l'utilisateur
      const userId = context.auth?.uid || 'anonymous'
      const userEmail = context.auth?.token?.email || null
      const isAnonymous = !context.auth?.uid
      
      let eventType = 'event_updated'
      let eventData = {}
      
      if (!before && after) {
        eventType = 'event_created'
        eventData = {
          title: after.title,
          date: after.date,
          location: after.location,
          description: after.description
        }
      } else if (before && after) {
        eventType = 'event_updated'
        eventData = {
          before: {
            title: before.title,
            date: before.date,
            location: before.location,
            description: before.description
          },
          after: {
            title: after.title,
            date: after.date,
            location: after.location,
            description: after.description
          }
        }
      } else if (before && !after) {
        eventType = 'event_deleted'
        eventData = {
          title: before.title,
          date: before.date,
          location: before.location,
          description: before.description
        }
      }
      
      await AuditService.logEventChange({
        eventType,
        seasonSlug,
        eventId,
        eventTitle: after?.title || before?.title || eventId,
        userId,
        userEmail,
        isAnonymous,
        eventData
      })
      
    } catch (error) {
      console.error('Erreur dans auditEventChanges:', error)
      await AuditService.logError({
        error: error.message,
        context: 'auditEventChanges',
        seasonSlug: seasonId,
        eventId,
        userId: context.auth?.uid || 'anonymous'
      })
    }
  })

/**
 * Trigger pour les changements de joueurs
 */
exports.auditPlayerChanges = functions.firestore
  .document('seasons/{seasonId}/players/{playerName}')
  .onWrite(async (change, context) => {
    const { seasonId, playerName } = context.params
    const before = change.before.exists ? change.before.data() : null
    const after = change.after.exists ? change.after.data() : null
    
    try {
      // Récupérer les infos de la saison
      const seasonDoc = await change.after.ref.parent.parent.get()
      const seasonData = seasonDoc.data()
      const seasonSlug = seasonData?.slug || seasonId
      
      // Récupérer les infos de l'utilisateur
      const userId = context.auth?.uid || 'anonymous'
      const userEmail = context.auth?.token?.email || null
      const isAnonymous = !context.auth?.uid
      
      let eventType = 'player_updated'
      let playerData = {}
      
      if (!before && after) {
        eventType = 'player_added'
        playerData = {
          name: after.name,
          email: after.email,
          role: after.role,
          status: after.status
        }
      } else if (before && after) {
        eventType = 'player_updated'
        playerData = {
          before: {
            name: before.name,
            email: before.email,
            role: before.role,
            status: before.status
          },
          after: {
            name: after.name,
            email: after.email,
            role: after.role,
            status: after.status
          }
        }
      } else if (before && !after) {
        eventType = 'player_removed'
        playerData = {
          name: before.name,
          email: before.email,
          role: before.role,
          status: before.status
        }
      }
      
      await AuditService.logPlayerChange({
        eventType,
        seasonSlug,
        playerName,
        userId,
        userEmail: after?.email || before?.email,
        isAnonymous,
        playerData
      })
      
    } catch (error) {
      console.error('Erreur dans auditPlayerChanges:', error)
      await AuditService.logError({
        error: error.message,
        context: 'auditPlayerChanges',
        seasonSlug: seasonId,
        playerName,
        userId: context.auth?.uid || 'anonymous'
      })
    }
  })