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

// Simuler la logique de calculateCastStatus
function debugCastStatus(cast, eventData) {
  console.log('🔍 Debug calculateCastStatus:')
  console.log('  - cast:', cast)
  console.log('  - eventData:', eventData)
  
  // Extraire les joueurs composés
  const selectedPlayers = extractSelectedPlayers(cast)
  console.log('  - selectedPlayers:', selectedPlayers)
  
  // Vérifier les joueurs qui ont décliné
  const hasDeclinedPlayers = selectedPlayers.some(playerName => 
    cast.playerStatuses?.[playerName] === 'declined'
  )
  console.log('  - hasDeclinedPlayers:', hasDeclinedPlayers)
  
  const declinedPlayers = selectedPlayers.filter(playerName => 
    cast.playerStatuses?.[playerName] === 'declined'
  )
  console.log('  - declinedPlayers:', declinedPlayers)
  
  // Vérifier chaque joueur individuellement
  selectedPlayers.forEach(playerName => {
    const status = cast.playerStatuses?.[playerName]
    console.log(`  - ${playerName}: ${status}`)
  })
}

function extractSelectedPlayers(cast) {
  if (!cast) return []
  
  if (Array.isArray(cast)) {
    return cast
  } else if (cast.players && Array.isArray(cast.players)) {
    return cast.players
  } else if (cast.roles && typeof cast.roles === 'object') {
    return Object.values(cast.roles).flat().filter(Boolean)
  }
  
  return []
}

async function main() {
  try {
    console.log('🔍 Debug du statut de la composition...')
    
    const seasonId = 'o0kD2IJekMdGdiJeIg4O'
    const eventId = 'aTKxqc5Rh0XCSrgib9w2'
    
    const docRef = doc(db, 'seasons', seasonId, 'selections', eventId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      debugCastStatus(data, { roles: { player: 6 } })
    } else {
      console.log('❌ Document non trouvé')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

main()
