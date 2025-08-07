// src/services/emailService.js
// Service d'envoi d'emails utilisant EmailJS

// Pour utiliser EmailJS, il faut :
// 1. Créer un compte sur https://www.emailjs.com/
// 2. Configurer un service d'email (Gmail, Outlook, etc.)
// 3. Créer un template d'email
// 4. Installer le package : npm install @emailjs/browser

export async function sendPasswordResetEmailWithEmailJS(email, resetLink) {
  try {
    // Import dynamique pour éviter les erreurs si EmailJS n'est pas installé
    const emailjs = await import('@emailjs/browser')
    
    const templateParams = {
      to_email: email,
      reset_link: resetLink,
      message: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`
    }
    
    const result = await emailjs.send(
      'YOUR_SERVICE_ID', // Remplacer par votre Service ID
      'YOUR_TEMPLATE_ID', // Remplacer par votre Template ID
      templateParams,
      'YOUR_PUBLIC_KEY' // Remplacer par votre Public Key
    )
    
    return { success: true, message: 'Email de réinitialisation envoyé !' }
  } catch (error) {
    console.error('Erreur EmailJS:', error)
    throw new Error('Erreur lors de l\'envoi de l\'email')
  }
}

// Fonction pour générer un lien de réinitialisation
export function generateResetLink(playerId, token) {
  // En production, utilisez votre domaine
  return `${window.location.origin}/reset-password?player=${playerId}&token=${token}`
}
