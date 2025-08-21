import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { registerSW } from 'virtual:pwa-register'
import SeasonResolver from './components/SeasonResolver.vue'
import Seasons from './Seasons.vue'
import GridBoard from './components/GridBoard.vue'
import PasswordReset from './views/PasswordReset.vue'
import MagicLink from './views/MagicLink.vue'
import JoinSeason from './views/JoinSeason.vue'

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
  { path: '/', component: SeasonResolver },
  { path: '/seasons', component: Seasons },
  { path: '/season/:slug', component: GridBoard, props: true },
  { path: '/season/:slug/event/:eventId', component: GridBoard, props: true },
  { path: '/season/:slug/join', component: JoinSeason, props: true },
  { path: '/reset-password', component: PasswordReset },
  { path: '/magic', component: MagicLink }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
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
app.use(router)
app.mount('#app')

// Enregistrer le service worker pour PWA et Push
registerSW({
  immediate: true,
  onRegistered(swReg) {
    window.__swReg = swReg
  }
})