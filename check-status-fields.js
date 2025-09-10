import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app, 'development')

async function checkStatusFields() {
  try {
    console.log('🔍 Vérification des champs status et statusDetails...')
    
    const seasonId = 'o0kD2IJekMdGdiJeIg4O'
    const eventId = 'aTKxqc5Rh0XCSrgib9w2'
    
    const docRef = doc(db, 'seasons', seasonId, 'selections', eventId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log('📄 Document trouvé:')
      console.log('  - confirmed:', data.confirmed)
      console.log('  - status:', data.status)
      console.log('  - statusDetails:', data.statusDetails)
      console.log('  - playerStatuses:', data.playerStatuses)
      console.log('  - roles:', data.roles)
      
      if (data.status && data.statusDetails) {
        console.log('✅ Les champs status et statusDetails sont présents en base')
      } else {
        console.log('❌ Les champs status et statusDetails sont manquants en base')
      }
    } else {
      console.log('❌ Document non trouvé')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkStatusFields()
