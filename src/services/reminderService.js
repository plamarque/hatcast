// src/services/reminderService.js
import { db } from './firebase.js'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { notifyRecipientAcrossChannels } from './notificationsService.js'
import logger from './logger.js'

/**
 * Service de gestion des rappels automatiques pour les sélections
 */

/**
 * Crée des rappels automatiques pour un joueur sélectionné
 * @param {Object} params
 * @param {string} params.seasonId - ID de la saison
 * @param {string} params.eventId - ID de l'événement
 * @param {string} params.playerEmail - Email du joueur
 * @param {string} params.playerName - Nom du joueur
 * @param {string} params.eventTitle - Titre de l'événement
 * @param {Date} params.eventDate - Date de l'événement
 * @param {string} params.seasonSlug - Slug de la saison
 */
export async function createRemindersForSelection({
  seasonId,
  eventId,
  playerEmail,
  playerName,
  eventTitle,
  eventDate,
  seasonSlug
}) {
  try {
    const eventDateObj = new Date(eventDate)
    const now = new Date()
    
    // Calculer les dates de rappel
    const reminder7Days = new Date(eventDateObj)
    reminder7Days.setDate(eventDateObj.getDate() - 7)
    
    const reminder1Day = new Date(eventDateObj)
    reminder1Day.setDate(eventDateObj.getDate() - 1)
    
    // Vérifier que les rappels ne sont pas dans le passé
    const reminders = []
    
    // Si l'événement est dans moins de 7 jours, notifier immédiatement
    if (eventDateObj > now && eventDateObj.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      reminders.push({
        type: '7days',
        scheduledFor: now, // Notifier immédiatement
        eventId,
        seasonId,
        playerEmail,
        playerName,
        eventTitle,
        eventDate: eventDateObj,
        seasonSlug,
        status: 'pending'
      })
    } else if (reminder7Days > now) {
      // Sinon, programmer le rappel 7 jours avant
      reminders.push({
        type: '7days',
        scheduledFor: reminder7Days,
        eventId,
        seasonId,
        playerEmail,
        playerName,
        eventTitle,
        eventDate: eventDateObj,
        seasonSlug,
        status: 'pending'
      })
    }
    
    // Si l'événement est dans moins de 1 jour, notifier immédiatement
    if (eventDateObj > now && eventDateObj.getTime() - now.getTime() <= 1 * 24 * 60 * 60 * 1000) {
      reminders.push({
        type: '1day',
        scheduledFor: now, // Notifier immédiatement
        eventId,
        seasonId,
        playerEmail,
        playerName,
        eventTitle,
        eventDate: eventDateObj,
        seasonSlug,
        status: 'pending'
      })
    } else if (reminder1Day > now) {
      // Sinon, programmer le rappel 1 jour avant
      reminders.push({
        type: '1day',
        scheduledFor: reminder1Day,
        eventId,
        seasonId,
        playerEmail,
        playerName,
        eventTitle,
        eventDate: eventDateObj,
        seasonSlug,
        status: 'pending'
      })
    }
    
    // Créer les rappels dans Firestore
    const results = []
    for (const reminder of reminders) {
      try {
        const docRef = await addDoc(collection(db, 'reminderQueue'), {
          ...reminder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        results.push({ success: true, id: docRef.id, type: reminder.type })
        logger.info('Rappel créé avec succès', { reminderId: docRef.id, type: reminder.type, playerEmail })
        
        // Log plus détaillé pour le debugging
        console.log(`✅ Rappel ${reminder.type} créé:`, {
          id: docRef.id,
          playerEmail,
          eventTitle: reminder.eventTitle,
          scheduledFor: reminder.scheduledFor,
          eventDate: reminder.eventDate
        })
      } catch (error) {
        logger.error('Erreur lors de la création du rappel', { error, reminder })
        results.push({ success: false, type: reminder.type, error: error.message })
      }
    }
    
    return { success: true, results }
  } catch (error) {
    logger.error('Erreur lors de la création des rappels', error)
    throw error
  }
}

/**
 * Supprime tous les rappels pour un joueur et un événement
 * Utile lors d'un désistement ou d'une désélection
 */
export async function removeRemindersForPlayer({
  seasonId,
  eventId,
  playerEmail
}) {
  try {
    const q = query(
      collection(db, 'reminderQueue'),
      where('seasonId', '==', seasonId),
      where('eventId', '==', eventId),
      where('playerEmail', '==', playerEmail)
    )
    
    const snapshot = await getDocs(q)
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    
    await Promise.all(deletePromises)
    
    logger.info('Rappels supprimés pour le joueur', { 
      seasonId, 
      eventId, 
      playerEmail, 
      count: snapshot.docs.length 
    })
    
    return { success: true, deletedCount: snapshot.docs.length }
  } catch (error) {
    logger.error('Erreur lors de la suppression des rappels', error)
    throw error
  }
}

/**
 * Supprime tous les rappels pour un événement
 * Utile lors de la suppression d'un événement
 */
export async function removeRemindersForEvent({
  seasonId,
  eventId
}) {
  try {
    const q = query(
      collection(db, 'reminderQueue'),
      where('seasonId', '==', seasonId),
      where('eventId', '==', eventId)
    )
    
    const snapshot = await getDocs(q)
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    
    await Promise.all(deletePromises)
    
    logger.info('Rappels supprimés pour l\'événement', { 
      seasonId, 
      eventId, 
      count: snapshot.docs.length 
    })
    
    return { success: true, deletedCount: snapshot.docs.length }
  } catch (error) {
    logger.error('Erreur lors de la suppression des rappels de l\'événement', error)
    throw error
  }
}

/**
 * Récupère les rappels en attente pour une date donnée
 * Utilisé par la Cloud Function pour traiter les rappels
 */
export async function getPendingRemindersForDate(targetDate) {
  try {
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    const q = query(
      collection(db, 'reminderQueue'),
      where('scheduledFor', '>=', startOfDay),
      where('scheduledFor', '<=', endOfDay),
      where('status', '==', 'pending')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Erreur lors de la récupération des rappels en attente', error)
    throw error
  }
}

/**
 * Marque un rappel comme traité
 */
export async function markReminderProcessed(reminderId, result) {
  try {
    const reminderRef = doc(db, 'reminderQueue', reminderId)
    await reminderRef.update({
      status: 'processed',
      processedAt: serverTimestamp(),
      result
    })
    
    logger.info('Rappel marqué comme traité', { reminderId, result })
  } catch (error) {
    logger.error('Erreur lors du marquage du rappel comme traité', error)
    throw error
  }
}

/**
 * Fonction de test : déclenche immédiatement les rappels pour un événement
 * Utile pour tester sans attendre les dates réelles
 */
export async function triggerRemindersForEvent({
  seasonId,
  eventId,
  playerEmail,
  playerName,
  eventTitle,
  eventDate,
  seasonSlug
}) {
  try {
    // Créer des rappels avec des dates dans le passé pour déclenchement immédiat
    const now = new Date()
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 jour dans le passé
    
    const reminders = [
      {
        type: '7days',
        scheduledFor: pastDate,
        eventId,
        seasonId,
        playerEmail,
        playerName,
        eventTitle,
        eventDate: new Date(eventDate),
        seasonSlug,
        status: 'pending'
      },
      {
        type: '1day',
        scheduledFor: pastDate,
        eventId,
        seasonId,
        playerEmail,
        playerName,
        eventTitle,
        eventDate: new Date(eventDate),
        seasonSlug,
        status: 'pending'
      }
    ]
    
    // Créer les rappels dans Firestore
    const results = []
    for (const reminder of reminders) {
      try {
        const docRef = await addDoc(collection(db, 'reminderQueue'), {
          ...reminder,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        results.push({ success: true, id: docRef.id, type: reminder.type })
        logger.info('Rappel de test créé avec succès', { reminderId: docRef.id, type: reminder.type, playerEmail })
      } catch (error) {
        logger.error('Erreur lors de la création du rappel de test', { error, reminder })
        results.push({ success: false, type: reminder.type, error: error.message })
      }
    }
    
    return { success: true, results }
  } catch (error) {
    logger.error('Erreur lors de la création des rappels de test', error)
    throw error
  }
}
