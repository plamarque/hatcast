<template>
  <div v-if="showInstallButton" class="pwa-install-button">
    <button 
      @click="installPWA" 
      class="install-btn"
      :disabled="installing"
    >
      <span v-if="!installing">📱 Installer l'app</span>
      <span v-else>⏳ Installation...</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'PWAInstallButton',
  data() {
    return {
      deferredPrompt: null,
      showInstallButton: false,
      installing: false
    }
  },
  mounted() {
    // Écouter l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt)
    
    // Écouter l'événement appinstalled
    window.addEventListener('appinstalled', this.handleAppInstalled)
    
    // Vérifier si l'app est déjà installée
    this.checkIfAlreadyInstalled()
  },
  beforeUnmount() {
    window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', this.handleAppInstalled)
  },
  methods: {
    handleBeforeInstallPrompt(e) {
      // Empêcher l'affichage automatique de la bannière
      e.preventDefault()
      
      // Stocker l'événement pour l'utiliser plus tard
      this.deferredPrompt = e
      
      // Afficher notre bouton personnalisé
      this.showInstallButton = true
      
      console.log('Événement beforeinstallprompt capturé')
    },
    
    handleAppInstalled() {
      console.log('Application installée')
      this.showInstallButton = false
      this.deferredPrompt = null
    },
    
    checkIfAlreadyInstalled() {
      // Vérifier si l'app est déjà installée en mode standalone
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Application déjà installée en mode standalone')
        this.showInstallButton = false
      }
    },
    
    async installPWA() {
      if (!this.deferredPrompt) {
        console.log('Aucun prompt d\'installation disponible')
        return
      }
      
      this.installing = true
      
      try {
        // Afficher le prompt d'installation
        this.deferredPrompt.prompt()
        
        // Attendre la réponse de l'utilisateur
        const choiceResult = await this.deferredPrompt.userChoice
        
        if (choiceResult.outcome === 'accepted') {
          console.log('Utilisateur a accepté l\'installation')
          this.showInstallButton = false
        } else {
          console.log('Utilisateur a refusé l\'installation')
        }
        
        // Réinitialiser la variable
        this.deferredPrompt = null
      } catch (error) {
        console.error('Erreur lors de l\'installation:', error)
      } finally {
        this.installing = false
      }
    }
  }
}
</script>

<style scoped>
.pwa-install-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.install-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.install-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.install-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Animation d'apparition */
.pwa-install-button {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .pwa-install-button {
    bottom: 10px;
    right: 10px;
  }
  
  .install-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
