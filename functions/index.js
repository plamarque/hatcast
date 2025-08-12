const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.firestore()

exports.processPushQueue = functions.firestore
  .document('pushQueue/{pushId}')
  .onCreate(async (snap, context) => {
    const payload = snap.data() || {}
    const toEmail = payload.to
    const title = payload.title || 'Notification'
    const body = payload.body || ''
    const data = payload.data || {}

    if (!toEmail) {
      await snap.ref.set({ status: 'error', error: 'missing_toEmail' }, { merge: true })
      return
    }

    const tokensDoc = await db.collection('userPushTokens').doc(toEmail).get()
    const tokens = tokensDoc.exists ? (tokensDoc.data().tokens || []) : []

    if (!tokens.length) {
      await snap.ref.set({ status: 'no_tokens' }, { merge: true })
      return
    }

    const message = {
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      tokens
    }

    const resp = await admin.messaging().sendEachForMulticast(message)

    const invalid = []
    resp.responses.forEach((r, idx) => {
      if (!r.success) {
        const code = r.error?.code || ''
        if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
          invalid.push(tokens[idx])
        }
      }
    })
    if (invalid.length) {
      await db.collection('userPushTokens').doc(toEmail).set({
        tokens: admin.firestore.FieldValue.arrayRemove(...invalid),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true })
    }

    await snap.ref.set({
      status: 'sent',
      successCount: resp.successCount,
      failureCount: resp.failureCount,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
  })


