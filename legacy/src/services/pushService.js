// Queue de notifications push (à traiter côté Cloud Functions)
import firestoreService from './firestoreService.js'
import logger from './logger.js'

/**
 * Enqueue a push notification to be sent by backend based on user email.
 * The backend should resolve email -> tokens from collection `pushQueue` and send via FCM.
 */
export async function queuePushMessage({ toEmail, title, body, data = {}, reason = 'generic' }) {
  if (!toEmail) return { success: false, error: 'missing_toEmail' }
  
  const payload = {
    to: toEmail,
    title,
    body,
    data,
    reason,
    createdAt: new Date()
  }
  
  // LOG DÉTAILLÉ avant d'ajouter à la queue
  logger.info('📤 Ajout notification à pushQueue', {
    toEmail,
    title,
    reason,
    dataKeys: Object.keys(data),
    hasYesUrl: !!data.yesUrl,
    hasNoUrl: !!data.noUrl,
    hasConfirmUrl: !!data.confirmUrl,
    hasDeclineUrl: !!data.declineUrl,
    urls: {
      yesUrl: data.yesUrl ? data.yesUrl.substring(0, 60) + '...' : 'absent',
      noUrl: data.noUrl ? data.noUrl.substring(0, 60) + '...' : 'absent',
      eventUrl: data.url || 'absent'
    }
  })
  
  try {
    await firestoreService.addDocument('pushQueue', payload)
    logger.info('✅ Notification ajoutée à pushQueue avec succès')
    return { success: true }
  } catch (error) {
    logger.error('Erreur lors de l\'ajout à la queue push', {
      error: error.message,
      toEmail,
      reason
    })
    return { success: false, error: error.message }
  }
}


