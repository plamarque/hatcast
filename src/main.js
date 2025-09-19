import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { registerSW } from 'virtual:pwa-register'
import SeasonResolver from './components/SeasonResolver.vue'
import HomePage from './views/HomePage.vue'
import SeasonsPage from './views/SeasonsPage.vue'
import HelpPage from './views/HelpPage.vue'
import GridBoard from './components/GridBoard.vue'
import PasswordReset from './views/PasswordReset.vue'
import MagicLink from './views/MagicLink.vue'
import JoinSeason from './views/JoinSeason.vue'
import SeasonAdminPage from './views/SeasonAdminPage.vue'
import NotFoundPage from './views/NotFoundPage.vue'
import { getFirebaseAuth } from './services/firebase.js'
import roleService from './services/roleService.js'
import logger from './services/logger.js'

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
  { path: '/', component: HomePage },
  { path: '/redirect', component: SeasonResolver },
  { path: '/seasons', component: SeasonsPage },
  { path: '/help', component: HelpPage },
  { path: '/season/:slug', component: GridBoard, props: true },
  { path: '/season/:slug/event/:eventId', component: GridBoard, props: true },
  { path: '/season/:slug/join', component: JoinSeason, props: true },
  { path: '/season/:slug/admin', component: SeasonAdminPage, props: true },
  { path: '/reset-password', component: PasswordReset },
  { path: '/magic', component: MagicLink },
  { path: '/magic-test', component: MagicLinkTest },
  { path: '/404', component: NotFoundPage },
  { path: '/:pathMatch(.*)*', component: NotFoundPage }
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
      
      // Fallback temporaire pour le développement local
      if (user.email === 'patrice.lamarque@gmail.com') {
        logger.info('🛡️ Fallback développement: Super Admin détecté - accès autorisé')
        next()
        return
      }
      
      // Fallback temporaire pour impropick@gmail.com (Admin de saison)
      if (user.email === 'impropick@gmail.com') {
        logger.info('🛡️ Fallback développement: Admin de saison détecté - accès autorisé')
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
      
      // Vérifier les permissions
      const isSuperAdmin = await roleService.isSuperAdmin()
      const isSeasonAdmin = await roleService.isSeasonAdmin(seasonSlug)
      
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
app.mount('#app')

// Enregistrer le service worker pour PWA et Push
registerSW({
  immediate: true,
  onRegistered(swReg) {
    window.__swReg = swReg
  }
})