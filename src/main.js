import './assets/main.css'
import './styles/status-colors.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { registerSW } from 'virtual:pwa-register'
import { getFirebaseAuth } from './services/firebase.js'
import permissionService from './services/permissionService.js'
import firestoreService from './services/firestoreService.js'
import logger from './services/logger.js'

// Précharger GridBoardShell (+ GridBoard) si on est déjà sur une route saison (mobile PWA refresh)
if (typeof window !== 'undefined' && /^\/season\//.test(window.location.pathname)) {
  import('./components/GridBoardShell.vue').catch(() => {})
}

// Réduire le bruit de logs en production (garder warnings/erreurs)
if (import.meta.env && import.meta.env.PROD) {
  const noop = () => {}
  // eslint-disable-next-line no-console
  console.debug = noop
  // eslint-disable-next-line no-console
  console.log = noop
  // eslint-disable-next-line no-console
  console.info = noop
}

const routes = [
  { path: '/', component: () => import('./views/HomePage.vue') },
  { path: '/redirect', component: () => import('./components/SeasonResolver.vue') },
  { path: '/seasons', component: () => import('./views/SeasonsPage.vue') },
  { path: '/help', component: () => import('./views/HelpPage.vue') },
  { path: '/season/:slug', component: () => import('./components/GridBoardShell.vue'), props: true },
  { path: '/season/:slug/event/:eventId', component: () => import('./components/GridBoardShell.vue'), props: true },
  { path: '/season/:slug/join', component: () => import('./views/JoinSeason.vue') },
  { path: '/season/:slug/admin', component: () => import('./views/SeasonAdminPage.vue') },
  { path: '/reset-password', component: () => import('./views/PasswordReset.vue') },
  { path: '/magic', component: () => import('./views/MagicLink.vue') },
  { path: '/accept-invitation', component: () => import('./views/AcceptInvitation.vue') },
  { path: '/404', component: () => import('./views/NotFoundPage.vue') },
  { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundPage.vue') }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// Guard de navigation pour la page d'administration
router.beforeEach(async (to, from, next) => {
  // Vérifier si la route est une page d'administration de saison
  if (to.path.includes('/admin') && to.path.startsWith('/season/')) {
    try {
      const auth = getFirebaseAuth()
      const user = auth?.currentUser
      
      if (!user) {
        logger.warn('🛡️ Tentative d\'accès à l\'administration sans authentification - redirection vers 404')
        next('/404')
        return
      }
      
      // Vérifier les droits admin via la fonction centralisée (inclut le fallback)
      const hasAdminRights = await permissionService.isSuperAdmin()
      if (hasAdminRights) {
        logger.info('🛡️ Accès admin autorisé')
        next()
        return
      }
      
      // Extraire le slug de la saison depuis l'URL
      const seasonSlug = to.params.slug
      if (!seasonSlug) {
        logger.warn('🛡️ Slug de saison manquant - redirection vers 404')
        next('/404')
        return
      }
      
      // Récupérer l'ID réel de la saison depuis le slug
      let seasonId = null
      try {
        const seasons = await firestoreService.getDocuments('seasons')
        const seasonDoc = seasons.find(s => s.slug === seasonSlug)
        if (seasonDoc) {
          seasonId = seasonDoc.id
          logger.debug('🛡️ ID de saison trouvé:', seasonId, 'pour le slug:', seasonSlug)
        } else {
          logger.warn('🛡️ Saison non trouvée pour le slug:', seasonSlug)
          next('/404')
          return
        }
      } catch (error) {
        logger.error('🛡️ Erreur lors de la récupération de l\'ID de saison:', error)
        next('/404')
        return
      }
      
      // Vérifier les permissions
      const isSuperAdmin = await permissionService.isSuperAdmin()
      const isSeasonAdmin = await permissionService.isSeasonAdmin(seasonId)
      
      if (isSuperAdmin || isSeasonAdmin) {
        logger.info('🛡️ Accès autorisé à l\'administration de la saison', seasonSlug)
        next()
      } else {
        logger.warn('🛡️ Accès refusé à l\'administration de la saison', seasonSlug, '- redirection vers 404')
        next('/404')
      }
    } catch (error) {
      logger.error('🛡️ Erreur lors de la vérification des permissions:', error)
      next('/404')
    }
  } else {
    // Pour toutes les autres routes, continuer normalement
    next()
  }
})



// Gestion de l'installation PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Empêcher l'affichage automatique de la bannière
  e.preventDefault();
  // Stocker l'événement pour l'utiliser plus tard
  deferredPrompt = e;
  console.log('Événement beforeinstallprompt capturé');
  
  // Optionnel : afficher un bouton d'installation personnalisé
  // showInstallButton();
});

// Événement quand l'app est installée
window.addEventListener('appinstalled', (evt) => {
  console.log('Application installée');
  // Réinitialiser la variable
  deferredPrompt = null;
});

// Fonction pour déclencher l'installation manuellement
window.triggerInstall = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation');
      } else {
        console.log('Utilisateur a refusé l\'installation');
      }
      deferredPrompt = null;
    });
  }
};

// Vérifier si l'app est déjà installée
if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Application déjà installée en mode standalone');
}

// Gestionnaire d'erreurs global pour l'audit
window.addEventListener('error', async (event) => {
  try {
    const { default: AuditClient } = await import('./services/auditClient.js')
    await AuditClient.logError(event.error, { 
      context: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  } catch (auditError) {
    console.warn('Erreur audit global error:', auditError)
  }
})

// Gestionnaire d'erreurs non gérées pour l'audit
window.addEventListener('unhandledrejection', async (event) => {
  try {
    const { default: AuditClient } = await import('./services/auditClient.js')
    await AuditClient.logError(event.reason, { 
      context: 'unhandled_rejection',
      promise: event.promise
    })
  } catch (auditError) {
    console.warn('Erreur audit unhandled rejection:', auditError)
  }
})

const app = createApp(App)

// Injecter configService dans les propriétés globales
import configService from './services/configService.js'
app.config.globalProperties.configService = configService

// Rendre configService accessible globalement pour le débogage
window.configService = configService

app.use(router)

// Sur route saison : attendre que le composant soit chargé avant de monter (évite écran dégradé)
async function mountApp() {
  if (/^\/season\//.test(window.location.pathname)) {
    await router.isReady()
  }
  app.mount('#app-vue')
}
mountApp()

// Enregistrer le service worker pour PWA et Push
registerSW({
  immediate: true,
  onRegistered(swReg) {
    window.__swReg = swReg
  }
})