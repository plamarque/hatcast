<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1400] p-4" @click="close">
    <div class="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-6 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" @click.stop>
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
            📱
          </div>
          <div>
            <h3 class="text-xl font-semibold text-white">{{ title }}</h3>
            <p class="text-sm text-gray-400">Installation de l'application</p>
          </div>
        </div>
        <button @click="close" class="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10" aria-label="Fermer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Instructions -->
      <div class="space-y-4">
        <div v-if="isAlternativeNeeded" class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
          <div class="flex items-start gap-3">
            <span class="text-amber-400 text-lg flex-shrink-0">⚠️</span>
            <div class="text-amber-200 text-sm">
              <p class="font-medium mb-1">Installation non supportée</p>
              <p>{{ browserName }} ne supporte pas l'installation PWA. Utilisez la solution ci-dessous.</p>
            </div>
          </div>
        </div>

        <div class="bg-white/5 rounded-lg border border-white/10 p-4">
          <div class="space-y-3">
            <div v-for="(step, index) in instructionSteps" :key="index" class="flex items-start gap-3">
              <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div class="text-gray-200 text-sm leading-relaxed" v-html="step"></div>
            </div>
          </div>
        </div>

        <div v-if="hasAlternative" class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <div class="flex items-start gap-3">
            <span class="text-blue-400 text-lg flex-shrink-0">💡</span>
            <div class="text-blue-200 text-sm">
              <p class="font-medium mb-1">Astuce</p>
              <p>{{ alternativeText }}</p>
            </div>
          </div>
        </div>

        <div v-if="hasSuccess" class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-4">
          <div class="flex items-start gap-3">
            <span class="text-emerald-400 text-lg flex-shrink-0">✅</span>
            <div class="text-emerald-200 text-sm">
              <p class="font-medium mb-1">Résultat</p>
              <p v-html="successText"></p>
            </div>
          </div>
        </div>

        <div v-if="hasWarning" class="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
          <div class="flex items-start gap-3">
            <span class="text-orange-400 text-lg flex-shrink-0">⚠️</span>
            <div class="text-orange-200 text-sm">
              <p class="font-medium mb-1">Note importante</p>
              <p>{{ warningText }}</p>
            </div>
          </div>
        </div>

        <!-- Rappel pour relancer l'installation plus tard -->
        <div class="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-4">
          <div class="flex items-start gap-3">
            <span class="text-purple-400 text-lg flex-shrink-0">🔄</span>
            <div class="text-purple-200 text-sm">
              <p class="font-medium mb-1">Pour relancer l'installation plus tard</p>
              <p>Utilisez le <strong>menu utilisateur</strong> (en haut à droite) → <strong>"Installer l'App"</strong></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
        <button @click="close" class="px-4 py-2 text-gray-300 hover:text-white transition-colors">
          Fermer
        </button>
        <button v-if="canRetry" @click="retryInstall" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
          Réessayer l'installation
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  browserInfo: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'retry-install'])

const title = ref('')
const instructionSteps = ref([])
const isAlternativeNeeded = ref(false)
const browserName = ref('')
const alternativeText = ref('')
const successText = ref('')
const warningText = ref('')

const hasAlternative = computed(() => alternativeText.value.length > 0)
const hasSuccess = computed(() => successText.value.length > 0)
const hasWarning = computed(() => warningText.value.length > 0)
const canRetry = computed(() => {
  const { isChrome, isChromeDesktop, isChromeMobile } = props.browserInfo
  // Afficher le bouton seulement pour Chrome (desktop ou mobile) qui supporte nativement les PWA
  return (isChromeDesktop || isChromeMobile) && !isAlternativeNeeded.value
})

function close() {
  emit('close')
}

function retryInstall() {
  emit('retry-install')
  close()
}

function updateInstructions(browserInfo) {
  const { 
    isChromeIOS, isFirefoxIOS, isEdgeIOS, isSafariMobile, isSafariDesktop,
    isChromeMobile, isChromeDesktop, isEdge, isFirefox, isSamsung,
    isAndroid, isIOS, isMac, isWindows, iOSVersion
  } = browserInfo

  // Reset
  isAlternativeNeeded.value = false
  alternativeText.value = ''
  successText.value = ''
  warningText.value = ''

  // === iOS SPÉCIFIQUES ===
  if (isChromeIOS || isFirefoxIOS || isEdgeIOS) {
    const browserDisplayName = isChromeIOS ? 'Chrome' : isFirefoxIOS ? 'Firefox' : 'Edge'
    title.value = `${browserDisplayName} sur iPhone/iPad`
    
    // iOS 16.4+ supporte PWA directement, sinon passer par Safari
    if (iOSVersion && iOSVersion >= 16.4) {
      instructionSteps.value = [
        'Appuyez sur <strong>Partager 📤</strong> (barre d\'outils)',
        'Faites défiler et sélectionnez <strong>"Ajouter à l\'écran d\'accueil"</strong>',
        'Appuyez sur <strong>"Ajouter"</strong>'
      ]
      successText.value = '🎉 Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> <strong>HatCast</strong> apparaîtra sur votre écran d\'accueil et se lancera en plein écran comme une app native !'
    } else {
      browserName.value = `${browserDisplayName} iOS`
      isAlternativeNeeded.value = true
      instructionSteps.value = [
        'Ouvrez ce site dans <strong>Safari</strong>',
        'Appuyez sur le bouton <strong>Partager 📤</strong> (en bas)',
        'Sélectionnez <strong>"Ajouter à l\'écran d\'accueil"</strong>',
        'Confirmez en appuyant sur <strong>"Ajouter"</strong>'
      ]
      alternativeText.value = 'Sur iOS < 16.4, copiez cette URL et collez-la dans Safari pour installer l\'app.'
      successText.value = '🎉 Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> <strong>HatCast</strong> apparaîtra sur votre écran d\'accueil et fonctionnera comme une app native !'
    }
  } else if (isSafariMobile) {
    title.value = 'Safari sur iPhone/iPad'
    if (iOSVersion && iOSVersion >= 16) {
      instructionSteps.value = [
        'Appuyez sur le bouton <strong>Partager 📤</strong> (en bas de l\'écran)',
        'Faites défiler vers le bas dans le menu',
        'Sélectionnez <strong>"Ajouter à l\'écran d\'accueil"</strong>',
        'Modifiez le nom de l\'app si souhaité',
        'Appuyez sur <strong>"Ajouter"</strong> (en haut à droite)'
      ]
    } else {
      instructionSteps.value = [
        'Appuyez sur le bouton <strong>Partager 📤</strong> (en bas de l\'écran)',
        'Recherchez <strong>"Ajouter à l\'écran d\'accueil"</strong> dans la liste',
        'Appuyez dessus',
        'Confirmez en appuyant sur <strong>"Ajouter"</strong>'
      ]
    }
    successText.value = '🎉 Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> <strong>HatCast</strong> apparaîtra sur votre écran d\'accueil pour un accès rapide !'
  }
  
  // === ANDROID SPÉCIFIQUES ===
  else if (isChromeMobile) {
    title.value = 'Chrome sur Android'
    instructionSteps.value = [
      'Appuyez sur le menu <strong>⋮</strong> (3 points en haut à droite)',
      'Faites défiler vers le bas',
      'Sélectionnez <strong>"Ajouter à l\'écran d\'accueil"</strong>',
      'Confirmez l\'ajout'
    ]
    alternativeText.value = 'Si disponible, vous pouvez aussi chercher une icône "Installer ⊕" dans la barre d\'adresse.'
    successText.value = '🎉 Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> <strong>HatCast</strong> apparaîtra sur votre écran d\'accueil et dans le tiroir d\'applications. L\'app fonctionnera comme une application native avec ses propres notifications !'
  } else if (isSamsung) {
    title.value = 'Samsung Internet'
    instructionSteps.value = [
      'Cherchez l\'icône <strong>＋</strong> dans la barre d\'adresse',
      'Appuyez dessus',
      'Confirmez l\'ajout à l\'écran d\'accueil'
    ]
    alternativeText.value = 'Si l\'icône n\'est pas visible : Menu ≡ → "Ajouter page à" → "Écran d\'accueil"'
    successText.value = '🎉 Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> <strong>HatCast</strong> apparaîtra sur votre écran d\'accueil. Selon la version, elle s\'ouvrira en mode PWA fenêtré ou comme raccourci vers le navigateur.'
  } else if (isAndroid) {
    title.value = 'Navigateur Android'
    instructionSteps.value = [
      'Cherchez le menu du navigateur <strong>(⋮ ou ☰)</strong>',
      'Recherchez <strong>"Installer l\'application"</strong> ou <strong>"Ajouter à l\'écran d\'accueil"</strong>',
      'Confirmez l\'installation'
    ]
    successText.value = '🎉 Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> <strong>HatCast</strong> apparaîtra sur votre écran d\'accueil. Le comportement dépend du navigateur : vraie PWA ou simple raccourci.'
    warningText.value = 'Le résultat varie selon le navigateur utilisé. Pour une meilleure expérience, utilisez Chrome ou Samsung Internet.'
  }
  
  // === DESKTOP SPÉCIFIQUES ===
  else if (isChromeDesktop) {
    title.value = `Chrome sur ${isWindows ? 'Windows' : isMac ? 'Mac' : 'Linux'}`
    instructionSteps.value = [
      'Cherchez l\'icône <strong>Installer ⊕</strong> dans la barre d\'adresse',
      'Cliquez dessus et sélectionnez <strong>"Installer"</strong>',
      'Confirmez l\'installation'
    ]
    alternativeText.value = 'Si l\'icône n\'est pas visible : Menu ⋮ → "Caster, enregistrer et partager" → "Installer la page en tant qu\'appli"'
    successText.value = `🎉 <strong>HatCast</strong> s\'installera comme une vraie application ! Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> apparaîtra dans ${isMac ? 'le dossier Applications et sera accessible via le Launchpad et Spotlight. Vous pourrez l\'épingler au Dock' : isWindows ? 'le menu Démarrer (section "Chrome Apps") et sera épinglable à la barre des tâches. Recherche Windows la trouvera aussi' : 'le menu Applications et sera épinglable dans le dock/panel de votre environnement de bureau'} !`
  } else if (isEdge && !isIOS) {
    title.value = `Edge sur ${isWindows ? 'Windows' : isMac ? 'Mac' : 'Linux'}`
    instructionSteps.value = [
      'Cherchez l\'icône <strong>Installer ⊕</strong> dans la barre d\'adresse',
      'Cliquez dessus et sélectionnez <strong>"Installer"</strong>',
      'Confirmez l\'installation'
    ]
    alternativeText.value = 'Si l\'icône n\'est pas visible : Menu ⋯ → "Applications" → "Installer ce site en tant qu\'application"'
    successText.value = `🎉 <strong>HatCast</strong> s\'installera comme une application native ! Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> sera ajoutée ${isMac ? 'au Launchpad et accessible via Spotlight. Épinglable au Dock' : isWindows ? 'au menu Démarrer et visible dans Paramètres > Applications installées. Épinglable à la barre des tâches' : 'au menu Applications et épinglable au dock/panel'} !`
  } else if (isSafariDesktop) {
    title.value = 'Safari sur Mac'
    instructionSteps.value = [
      'Menu <strong>"Fichier" → "Ajouter au Dock"</strong>',
      'Confirmez le nom de l\'application',
      'Cliquez sur <strong>"Ajouter"</strong>'
    ]
    successText.value = '🎉 <strong>HatCast.app</strong> sera installée dans le dossier Applications ! Cette icône <img src="/icons/icon-48x48.png" style="width: 20px; height: 20px; display: inline; vertical-align: middle; margin: 0 4px; border-radius: 4px;"> apparaîtra automatiquement au Dock et fonctionnera comme une app classique (quittable via ⌘Q, listée comme app native) !'
  } else if (isFirefox) {
    title.value = 'Firefox - Installation limitée'
    browserName.value = 'Firefox'
    isAlternativeNeeded.value = true
    instructionSteps.value = [
      'Firefox ne supporte pas l\'installation PWA stable',
      'Pour une meilleure expérience, utilisez <strong>Chrome</strong> ou <strong>Edge</strong>',
      'Vous pouvez continuer à utiliser HatCast dans Firefox normalement'
    ]
    alternativeText.value = 'Recommandation : ouvrez HatCast dans Chrome ou Edge pour pouvoir l\'installer comme une vraie application.'
    warningText.value = 'Firefox peut créer un raccourci, mais il ouvrira simplement Firefox au lieu d\'une app dédiée.'
  }
  
  // === FALLBACK GÉNÉRIQUE ===
  else {
    title.value = 'Installation de l\'application'
    instructionSteps.value = [
      'Recherchez dans votre navigateur une icône <strong>⊕</strong> ou <strong>"installer"</strong> dans la barre d\'adresse',
      'OU cherchez dans le menu une option comme :<br>• "Installer cette application/page"<br>• "Ajouter à l\'écran d\'accueil"',
      'OU utilisez le bouton <strong>Partager → "Ajouter au Dock/écran d\'accueil"</strong>'
    ]
    warningText.value = 'Si aucune option n\'est disponible, votre navigateur ne supporte peut-être pas cette fonctionnalité.'
  }
}

// Watcher pour mettre à jour les instructions quand browserInfo change
import { watch } from 'vue'
watch(() => props.browserInfo, (newBrowserInfo) => {
  if (Object.keys(newBrowserInfo).length > 0) {
    updateInstructions(newBrowserInfo)
  }
}, { immediate: true, deep: true })
</script>
