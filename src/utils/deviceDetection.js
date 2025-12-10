// src/utils/deviceDetection.js

/**
 * Détecte si l'appareil est mobile ou si l'application est en mode PWA
 * @returns {boolean} true si l'appareil est mobile ou si l'app est en mode PWA
 */
export function isMobileOrPWA() {
  // Détection PWA : vérifier si l'app est en mode standalone
  if (typeof window !== 'undefined') {
    // Mode standalone (PWA installée)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true
    }
    
    // iOS Safari mode standalone
    if (window.navigator && window.navigator.standalone === true) {
      return true
    }
    
    // Détection mobile par largeur d'écran
    if (window.innerWidth < 768) {
      return true
    }
    
    // Détection mobile par user agent (fallback)
    const userAgent = navigator.userAgent || ''
    const mobileKeywords = [
      'Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 
      'Windows Phone', 'Opera Mini', 'IEMobile', 'Mobile Safari', 
      'webOS', 'Palm'
    ]
    
    if (mobileKeywords.some(keyword => userAgent.includes(keyword))) {
      return true
    }
  }
  
  return false
}

