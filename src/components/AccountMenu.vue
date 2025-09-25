<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1040] p-2 md:p-4" @click="close">
    <div class="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto" @click.stop>
      <button @click="close" class="absolute right-2 md:right-3 top-2 md:top-3 text-white/80 hover:text-white" aria-label="Fermer" title="Fermer">✖️</button>


      <!-- Header compact style modales -->
      <div class="mb-4 md:mb-6">
        <div class="flex items-start gap-4">
          <!-- Icône et titre à gauche -->
          <div class="flex items-center gap-3">
            <div class="bg-gradient-to-br from-indigo-400 to-cyan-500 rounded-full p-1 flex-shrink-0">
              <UserAvatar size="lg" />
            </div>
            <div class="space-y-2">
              <h3 class="text-white font-semibold text-base md:text-lg">Mon compte</h3>
              <div class="flex items-center gap-2">
                <span class="text-gray-400 text-xs md:text-sm">{{ email || 'Non défini' }}</span>
                <button 
                  @click="showEmailUpdate = true" 
                  class="text-indigo-400 hover:text-indigo-300 transition-colors p-1 hover:bg-indigo-400/10 rounded flex-shrink-0"
                  title="Modifier l'email"
                  aria-label="Modifier l'email"
                >
                  ✏️
                </button>
              </div>
              <!-- Badge joueurs directement sous l'email -->
              <div v-if="associations.length > 0" class="flex items-center gap-2">
                <button 
                  @click="associations.length === 1 ? openPlayerModal(associations[0]) : showPlayersList = true" 
                  class="flex items-center gap-2 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-xs md:text-sm hover:bg-blue-500/30 transition-colors cursor-pointer"
                  :title="associations.length === 1 ? `Voir ${associations[0].playerName}` : 'Gérer mes joueurs'"
                >
                  <span class="text-blue-300">⭐</span>
                  <span class="text-blue-200">
                    {{ associations.length === 1 ? associations[0].playerName : `${associations.length} joueurs` }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="border-t border-white/10 mb-4 md:mb-6"></div>

      <div class="space-y-4 md:space-y-6">

        <!-- Section 3: Mot de passe -->
        <div class="space-y-2 md:space-y-3">
          <h3 class="text-white font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
            <span class="text-green-400">🔑</span>
            Mot de passe
          </h3>
          <div class="p-3 md:p-4 rounded-lg border border-white/10 bg-white/5">
            <p class="text-xs md:text-sm text-gray-400 mb-3">Vous pouvez changer votre mot de passe pour sécuriser vos opérations sensibles.</p>
            <button @click="changePassword" :disabled="passwordLoading" class="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {{ passwordLoading ? '⏳' : 'Changer de mot de passe' }}
            </button>
            <div v-if="passwordError" class="mt-2 text-xs text-red-300">{{ passwordError }}</div>
            <div v-if="passwordSuccess" class="mt-2 text-xs text-green-300">{{ passwordSuccess }}</div>
          </div>
        </div>

        <!-- Section 4: Suppression de compte -->
        <div class="space-y-2 md:space-y-3">
          <h3 class="text-white font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
            <span class="text-red-400">⚠️</span>
            Suppression de compte
          </h3>
          <div class="p-3 md:p-4 rounded-lg border border-white/10 bg-white/5">
            <p class="text-xs md:text-sm text-gray-400 mb-3">Cette action est irréversible et supprimera définitivement votre compte.</p>
            <button @click="$emit('delete-account')" class="w-full px-3 md:px-4 py-2 md:py-3 rounded-lg bg-red-600 text-white hover:bg-red-500 text-sm">Supprimer mon compte</button>
          </div>
        </div>
      </div>

      <div class="mt-4 md:mt-6 text-center">
        <button @click="close" class="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 text-sm">Fermer</button>
      </div>
    </div>

    <!-- Modal de modification d'email -->
    <div v-if="showEmailUpdate" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1050] p-4" @click="showEmailUpdate = false">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <span class="text-blue-400">📧</span>
            Modifier l'email
          </h3>
          <button @click="showEmailUpdate = false" class="text-white/80 hover:text-white">✖️</button>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs text-gray-400 mb-2">Nouvelle adresse email</label>
            <input v-model="newEmail" type="email" class="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 text-sm" placeholder="nouvel@email.com" />
          </div>
          
          <button @click="updateAccountEmail" :disabled="!canUpdateEmail || emailLoading" class="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {{ emailLoading ? '⏳' : 'Mettre à jour' }}
          </button>
          
          <div v-if="emailError" class="text-xs text-red-300 text-center">{{ emailError }}</div>
          <div v-if="emailSuccess" class="text-xs text-green-300 text-center">{{ emailSuccess }}</div>
        </div>
      </div>
    </div>

    <!-- Modal de gestion des joueurs -->
    <div v-if="showPlayersList" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1060] p-4" @click="showPlayersList = false">
      <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-lg" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <span class="text-yellow-400">⭐</span>
            {{ associations.length <= 1 ? 'Mon joueur' : 'Mes joueurs' }}
          </h3>
          <button @click="showPlayersList = false" class="text-white/80 hover:text-white">✖️</button>
        </div>
        
        <div class="space-y-3">
          <div v-if="associations.length === 0" class="text-sm text-gray-400 text-center py-4">
            Aucun joueur associé pour le moment.
          </div>
          <div v-else class="space-y-2">
            <div v-for="assoc in associations" :key="assocKey(assoc)" class="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="text-yellow-400 text-sm">⭐</span>
                <div class="truncate">
                  <div class="text-white font-medium text-sm">{{ assoc.playerName || '—' }}</div>
                  <div class="text-gray-400 text-xs">{{ assoc.seasonName || assoc.seasonId || '—' }}</div>
                </div>
              </div>
              <button 
                @click="dissociatePlayer(assoc)" 
                class="p-1.5 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-colors duration-200 flex-shrink-0"
                title="Dissocier ce joueur"
                aria-label="Dissocier ce joueur"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getFirebaseAuth, getFirebaseDb, resetPlayerPassword } from '../services/firebase.js'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { createAccountEmailUpdateLink } from '../services/magicLinks.js'
import { queueVerificationEmail } from '../services/emailService.js'
import { listAssociationsForEmail } from '../services/players.js'
import UserAvatar from './UserAvatar.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  seasonId: { type: String, default: null }
})

const emit = defineEmits(['close', 'delete-account', 'open-player'])

const email = ref('')

// Email update state
const newEmail = ref('')
const emailLoading = ref(false)
const emailError = ref('')
const emailSuccess = ref('')
const canUpdateEmail = ref(false)

// Password change state
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

// Player associations state
const associations = ref([])

// Modal display states
const showEmailUpdate = ref(false)
const showPlayersList = ref(false)

watch(email, (v) => { newEmail.value = v || '' })
watch(newEmail, (v) => { canUpdateEmail.value = !!v && v.includes('@') && v !== email.value })

async function updateAccountEmail() {
  if (!canUpdateEmail.value) return
  emailLoading.value = true
  emailError.value = ''
  emailSuccess.value = ''
  try {
    // Générer un magic link custom et envoyer via notre pipeline email
    const link = await createAccountEmailUpdateLink({ currentEmail: email.value, newEmail: newEmail.value.trim() })
    await queueVerificationEmail({ toEmail: newEmail.value.trim(), verifyUrl: link.url, purpose: 'account_email_update', displayName: 'utilisateur' })
    emailSuccess.value = `Un email de vérification a été envoyé à ${newEmail.value.trim()}. Cliquez sur le lien pour confirmer le changement. Si vous ne recevez pas l'email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.`
  } catch (e) {
    emailError.value = (e?.code === 'auth/requires-recent-login')
      ? 'Veuillez vous reconnecter pour modifier votre email'
      : 'Impossible de mettre à jour l\'email'
  } finally {
    emailLoading.value = false
  }
}

async function changePassword() {
  // Fonction de changement de mot de passe
  
  if (!email.value) {
    passwordError.value = 'Adresse email non disponible. Veuillez vous reconnecter.'
    return
  }
  
  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''
  
  try {
    // Sauvegarder le contexte "Mon Compte" avant l'envoi de l'email
    const currentPath = window.location.pathname + window.location.search
    const currentNavigation = {
      lastVisitedPage: currentPath,
      timestamp: Date.now(),
      email: email.value,
      context: 'account_menu_password_reset',
      returnToAccountMenu: true,
      modalState: {
        accountMenu: true,
        eventDetails: currentPath.includes('modal=event_details'),
        playerDetails: currentPath.includes('modal=player_details'),
        eventId: new URLSearchParams(window.location.search).get('event'),
        playerId: new URLSearchParams(window.location.search).get('player')
      }
    }
    localStorage.setItem('pendingPasswordResetNavigation', JSON.stringify(currentNavigation))
    
    await resetPlayerPassword(email.value)
    passwordSuccess.value = 'Email de réinitialisation envoyé ! Si vous ne recevez pas l\'email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.'
  } catch (error) {
    // Gestion des erreurs de changement de mot de passe
    
    // Afficher un message d'erreur plus spécifique selon le type d'erreur
    if (error.code === 'AUTH_USER_NOT_FOUND') {
      passwordError.value = 'Aucun compte trouvé avec cette adresse email.'
    } else if (error.code === 'auth/user-not-found') {
      passwordError.value = 'Aucun compte trouvé avec cette adresse email.'
    } else if (error.code === 'auth/invalid-email') {
      passwordError.value = 'Adresse email invalide.'
    } else if (error.code === 'auth/too-many-requests') {
      passwordError.value = 'Trop de tentatives. Veuillez réessayer plus tard.'
    } else {
      passwordError.value = error.message || 'Impossible d\'envoyer l\'email de réinitialisation. Veuillez réessayer.'
    }
  } finally {
    passwordLoading.value = false
  }
}

// Fonctions pour gérer les joueurs
function assocKey(a) {
  return `${a.seasonId || 'global'}__${a.playerId}`
}

async function loadPlayerAssociations() {
  try {
    const raw = email.value ? await listAssociationsForEmail(email.value) : []
    // Enrichir avec le nom réel du joueur depuis la saison
    const enriched = []
    const db = getFirebaseDb()
    if (!db) {
      associations.value = []
      return
    }
    
    for (const a of raw) {
      let playerName = a.playerId
      let seasonName = a.seasonId || '—'
      try {
        if (a.seasonId) {
          const playerRef = doc(db, 'seasons', a.seasonId, 'players', a.playerId)
          const snap = await getDoc(playerRef)
          if (snap.exists()) playerName = snap.data().name || playerName
          
          // Récupérer le nom de la saison
          const seasonRef = doc(db, 'seasons', a.seasonId)
          const seasonSnap = await getDoc(seasonRef)
          if (seasonSnap.exists()) seasonName = seasonSnap.data().name || seasonName
        }
      } catch {}
      enriched.push({ ...a, playerName, seasonName })
    }
    associations.value = enriched
  } catch {
    associations.value = []
  }
}

async function dissociatePlayer(assoc) {
  if (!confirm(`Êtes-vous sûr de vouloir dissocier le joueur "${assoc.playerName}" de votre compte ?`)) {
    return
  }
  
  try {
    // Supprimer l'association depuis Firestore
    const { deleteDoc } = await import('firebase/firestore')
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase n\'est pas encore initialisé')
    }
    
    if (assoc.seasonId) {
      // Association spécifique à une saison
      const protectionRef = doc(db, 'seasons', assoc.seasonId, 'playerProtection', assoc.playerId)
      await deleteDoc(protectionRef)
    } else {
      // Association globale
      const protectionRef = doc(db, 'playerProtection', assoc.playerId)
      await deleteDoc(protectionRef)
    }
    
    // Supprimer aussi la préférence locale si elle existe
    try {
      if (assoc.seasonId) {
        const key = `seasonPreferredPlayer:${assoc.seasonId}`
        const raw = localStorage.getItem(key)
        if (raw) {
          if (raw.startsWith('[')) {
            const current = JSON.parse(raw) || []
            const updated = current.filter(id => id !== assoc.playerId)
            localStorage.setItem(key, JSON.stringify(updated))
          } else if (raw === assoc.playerId) {
            localStorage.removeItem(key)
          }
        }
      }
    } catch {}
    
    // Recharger la liste des associations
    await loadPlayerAssociations()
    
    // Message de succès temporaire
    const successMsg = `Joueur "${assoc.playerName}" dissocié avec succès`
    // On pourrait ajouter un état de succès ici si on veut l'afficher
    
  } catch (error) {
    console.error('Erreur lors de la dissociation:', error)
    alert(`Erreur lors de la dissociation: ${error.message || 'Veuillez réessayer'}`)
  }
}

function openPlayerModal(association) {
  emit('open-player', association)
  close()
}

function close() { emit('close') }

// Fonction pour charger l'email de l'utilisateur connecté
async function loadUserEmail() {
  try {
    // Attendre que Firebase soit initialisé
    let attempts = 0
    const maxAttempts = 50 // 5 secondes max
    
    while (attempts < maxAttempts) {
      const auth = getFirebaseAuth()
      if (auth && auth.currentUser) {
        email.value = auth.currentUser.email || ''
        // Email chargé avec succès
        return
      }
      
      // Attendre 100ms avant le prochain essai
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    console.warn('Impossible de charger l\'email utilisateur après', maxAttempts * 100, 'ms')
  } catch (error) {
    console.error('Erreur lors du chargement de l\'email:', error)
  }
}

watch(() => props.show, async (v) => { 
  if (v) { 
    await loadUserEmail()
    await loadPlayerAssociations()
  } 
})

onMounted(async () => { 
  if (props.show) { 
    await loadUserEmail()
    await loadPlayerAssociations()
  } 
})
</script>


