// src/services/users.js
// Service unifié pour la gestion des utilisateurs et invitations
import firestoreService from './firestoreService.js'
import { createMagicLink } from './magicLinks.js'
import { queueInvitationEmail, queueUserAddedToSeasonEmail } from './emailService.js'
import configService from './configService.js'
import logger from './logger.js'
import { addPlayer } from './storage.js'
import { protectPlayer } from './players.js'

const INVITATIONS_COLLECTION = 'invitations'

/**
 * Créer une invitation pour un nouvel utilisateur
 */
export async function createInvite({
  seasonId,
  firstName,
  lastName,
  email,
  gender = 'unknown',
  linkedPlayerId = null,
  sendEmail = true,
  createdBy
}) {
  try {
    logger.info('Création d\'invitation', { seasonId, email, firstName, lastName })
    
    // Vérifier si l'email existe déjà dans la saison
    const existingUser = await checkEmailExistsInSeason(seasonId, email)
    if (existingUser.exists) {
      return {
        success: false,
        error: 'EMAIL_EXISTS',
        existingUser: existingUser.user
      }
    }
    
    // Vérifier si une invitation existe déjà
    const existingInvitation = await getInvitationByEmail(seasonId, email)
    if (existingInvitation) {
      return {
        success: false,
        error: 'INVITATION_EXISTS',
        existingInvitation
      }
    }
    
    // Créer le magic link pour l'invitation
    const magicLink = await createInvitationMagicLink(seasonId, email)
    
    // Créer l'invitation
    const invitationId = `${seasonId}__${email}__${Date.now()}`
    const invitationData = {
      seasonId,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      linkedPlayerId,
      status: 'pending',
      magicLinkToken: magicLink.token,
      shareableLink: magicLink.url,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + configService.getMagicLinkExpirationDays() * 24 * 60 * 60 * 1000),
      createdBy,
      sendEmail
    }
    
    await firestoreService.setDocument(INVITATIONS_COLLECTION, invitationId, invitationData)
    
    // Envoyer l'email si demandé
    if (sendEmail) {
      const seasonData = await firestoreService.getDocument('seasons', seasonId)
      await queueInvitationEmail({
        toEmail: email,
        firstName,
        lastName,
        seasonName: seasonData?.name || 'cette saison',
        inviteUrl: magicLink.url
      })
    }
    
    logger.info('Invitation créée avec succès', { invitationId, email })
    
    return {
      success: true,
      invitation: {
        id: invitationId,
        ...invitationData
      },
      shareableLink: magicLink.url
    }
    
  } catch (error) {
    logger.error('Erreur lors de la création d\'invitation', error)
    throw error
  }
}

/**
 * Renvoyer une invitation
 */
export async function resendInvite(invitationId) {
  try {
    const invitation = await firestoreService.getDocument(INVITATIONS_COLLECTION, invitationId)
    if (!invitation) {
      throw new Error('Invitation non trouvée')
    }
    
    if (invitation.status !== 'pending' && invitation.status !== 'expired') {
      throw new Error('Impossible de renvoyer cette invitation')
    }
    
    // Vérifier l'expiration
    if (new Date() > new Date(invitation.expiresAt)) {
      // Créer un nouveau magic link
      const magicLink = await createInvitationMagicLink(invitation.seasonId, invitation.email)
      
      await firestoreService.updateDocument(INVITATIONS_COLLECTION, invitationId, {
        magicLinkToken: magicLink.token,
        shareableLink: magicLink.url,
        expiresAt: new Date(Date.now() + configService.getMagicLinkExpirationDays() * 24 * 60 * 60 * 1000),
        status: 'pending'
      })
      
      invitation.shareableLink = magicLink.url
    }
    
    // Envoyer l'email
    const seasonData = await firestoreService.getDocument('seasons', invitation.seasonId)
    await queueInvitationEmail({
      toEmail: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      seasonName: seasonData?.name || 'cette saison',
      inviteUrl: invitation.shareableLink
    })
    
    logger.info('Invitation renvoyée', { invitationId, email: invitation.email })
    
    return { success: true }
    
  } catch (error) {
    logger.error('Erreur lors du renvoi d\'invitation', error)
    throw error
  }
}

/**
 * Révoquer une invitation
 */
export async function revokeInvite(invitationId) {
  try {
    await firestoreService.updateDocument(INVITATIONS_COLLECTION, invitationId, {
      status: 'revoked',
      revokedAt: new Date()
    })
    
    logger.info('Invitation révoquée', { invitationId })
    
    return { success: true }
    
  } catch (error) {
    logger.error('Erreur lors de la révocation d\'invitation', error)
    throw error
  }
}

/**
 * Obtenir le lien partageable d'une invitation
 */
export async function getShareableInviteLink(invitationId) {
  try {
    const invitation = await firestoreService.getDocument(INVITATIONS_COLLECTION, invitationId)
    if (!invitation) {
      throw new Error('Invitation non trouvée')
    }
    
    return invitation.shareableLink
    
  } catch (error) {
    logger.error('Erreur lors de la récupération du lien', error)
    throw error
  }
}

/**
 * Lister tous les utilisateurs et invitations d'une saison (vue unifiée)
 */
export async function listUsersWithInviteStatus(seasonId) {
  try {
    // Récupérer les rôles de la saison
    const seasonData = await firestoreService.getDocument('seasons', seasonId)
    const seasonUsers = seasonData?.roles?.users || []
    const seasonAdmins = seasonData?.roles?.admins || []
    
    // Récupérer les invitations
    const invitations = await getInvitationsForSeason(seasonId)
    
    // Récupérer TOUS les joueurs de la saison
    const allPlayers = await firestoreService.getDocuments('seasons', seasonId, 'players')
    
    // Combiner utilisateurs et invitations
    const unifiedList = []
    
    // Ajouter TOUS les joueurs (associés à un utilisateur ou non)
    allPlayers.forEach(player => {
      if (player.email) {
        // Joueur associé à un utilisateur
        const isAdmin = seasonAdmins.includes(player.email)
        unifiedList.push({
          type: 'user',
          id: player.email,
          email: player.email,
          firstName: player.firstName || '',
          lastName: player.lastName || '',
          gender: player.gender || 'unknown',
          status: 'active',
          isAdmin: isAdmin,
          playerId: player.id,
          playerName: player.name,
          createdAt: player.createdAt,
          lastActiveAt: player.lastActiveAt
        })
      } else {
        // Joueur non associé à un utilisateur
        unifiedList.push({
          type: 'player',
          id: player.id,
          email: null,
          firstName: player.firstName || '',
          lastName: player.lastName || '',
          gender: player.gender || 'unknown',
          status: 'active',
          isAdmin: false,
          playerId: player.id,
          playerName: player.name,
          createdAt: player.createdAt,
          lastActiveAt: null
        })
      }
    })
    
    // Ajouter les invitations
    invitations.forEach(invitation => {
      unifiedList.push({
        type: 'invitation',
        id: invitation.id,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        gender: invitation.gender,
        status: invitation.status,
        isAdmin: false,
        players: invitation.linkedPlayerId ? [{ id: invitation.linkedPlayerId }] : [],
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        createdBy: invitation.createdBy
      })
    })
    
    // Trier par nom alphabétique
    unifiedList.sort((a, b) => {
      let nameA, nameB
      
      if (a.type === 'player') {
        // Pour les joueurs non associés, utiliser playerName
        nameA = a.playerName || `${a.firstName} ${a.lastName}`.trim()
      } else if (a.type === 'user') {
        // Pour les utilisateurs, utiliser playerName ou construire le nom
        nameA = a.playerName || `${a.firstName} ${a.lastName}`.trim()
      } else {
        // Pour les invitations, construire le nom
        nameA = `${a.firstName} ${a.lastName}`.trim()
      }
      
      if (b.type === 'player') {
        nameB = b.playerName || `${b.firstName} ${b.lastName}`.trim()
      } else if (b.type === 'user') {
        nameB = b.playerName || `${b.firstName} ${b.lastName}`.trim()
      } else {
        nameB = `${b.firstName} ${b.lastName}`.trim()
      }
      
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase())
    })
    
    return unifiedList
    
  } catch (error) {
    logger.error('Erreur lors du chargement des utilisateurs et invitations', error)
    throw error
  }
}

/**
 * Lier un utilisateur existant à une saison et des joueurs
 */
export async function linkExistingUserToSeasonAndPlayers({
  seasonId,
  email,
  linkedPlayerId = null,
  performedBy
}) {
  try {
    // Ajouter l'utilisateur à la saison
    const seasonData = await firestoreService.getDocument('seasons', seasonId)
    const currentUsers = seasonData?.roles?.users || []
    
    if (!currentUsers.includes(email)) {
      currentUsers.push(email)
      await firestoreService.updateDocument('seasons', seasonId, {
        'roles.users': currentUsers
      })
    }
    
    // Lier ou créer le joueur
    if (linkedPlayerId) {
      // Lier le joueur existant
      await protectPlayer(linkedPlayerId, email, null, seasonId)
    } else {
      // Créer un joueur minimal et le lier
      const playerId = await addPlayer(`${email.split('@')[0]}`, seasonId, 'unknown')
      await protectPlayer(playerId, email, null, seasonId)
    }
    
    // Envoyer notification email
    const seasonData2 = await firestoreService.getDocument('seasons', seasonId)
    await queueUserAddedToSeasonEmail({
      toEmail: email,
      seasonName: seasonData2?.name || 'cette saison',
      seasonSlug: seasonData2?.slug || seasonId
    })
    
    logger.info('Utilisateur existant lié à la saison', { email, seasonId })
    
    return { success: true }
    
  } catch (error) {
    logger.error('Erreur lors de la liaison utilisateur existant', error)
    throw error
  }
}

/**
 * Accepter une invitation et finaliser le compte
 */
export async function acceptInvitation({
  invitationId,
  firstName,
  lastName,
  gender,
  password = null
}) {
  try {
    const invitation = await firestoreService.getDocument(INVITATIONS_COLLECTION, invitationId)
    if (!invitation) {
      throw new Error('Invitation non trouvée')
    }
    
    if (invitation.status !== 'pending') {
      throw new Error('Cette invitation n\'est plus valide')
    }
    
    if (new Date() > new Date(invitation.expiresAt)) {
      throw new Error('Cette invitation a expiré')
    }
    
    // Créer le compte Firebase Auth si un mot de passe est fourni
    let firebaseUid = null
    if (password) {
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const { getFirebaseAuth } = await import('./firebase.js')
      
      // Attendre que Firebase Auth soit disponible
      let auth = null
      let attempts = 0
      const maxAttempts = 20
      
      while (!auth && attempts < maxAttempts) {
        auth = getFirebaseAuth()
        if (!auth) {
          logger.info(`⏳ Tentative ${attempts + 1}/${maxAttempts}: Firebase Auth pas encore prêt, attente...`)
          await new Promise(resolve => setTimeout(resolve, 250))
          attempts++
        }
      }
      
      logger.info('🔍 Debug Firebase Auth state:', {
        hasAuth: !!auth,
        authApp: auth?.app?.name || 'N/A',
        attempts: attempts
      })
      
      if (!auth) {
        throw new Error('Firebase Auth non disponible après plusieurs tentatives - veuillez réessayer')
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, invitation.email, password)
      firebaseUid = userCredential.user.uid
    }
    
    // Ajouter l'utilisateur à la saison
    await linkExistingUserToSeasonAndPlayers({
      seasonId: invitation.seasonId,
      email: invitation.email,
      linkedPlayerId: invitation.linkedPlayerId,
      performedBy: 'system'
    })
    
    // Mettre à jour l'invitation
    await firestoreService.updateDocument(INVITATIONS_COLLECTION, invitationId, {
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedFirstName: firstName,
      acceptedLastName: lastName,
      acceptedGender: gender,
      firebaseUid
    })
    
    logger.info('Invitation acceptée', { invitationId, email: invitation.email })
    
    return {
      success: true,
      user: {
        email: invitation.email,
        firstName,
        lastName,
        gender,
        firebaseUid
      }
    }
    
  } catch (error) {
    logger.error('Erreur lors de l\'acceptation d\'invitation', error)
    throw error
  }
}


// ===== FONCTIONS UTILITAIRES =====

/**
 * Créer un magic link pour invitation
 */
async function createInvitationMagicLink(seasonId, email) {
  const token = Math.random().toString(36).slice(-40)
  const expirationDays = configService.getMagicLinkExpirationDays()
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * expirationDays
  
  const base = window.location.origin + '/'
  const url = `${base}accept-invitation?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&season=${encodeURIComponent(seasonId)}`
  
  return { token, url, expiresAt }
}

/**
 * Vérifier si un email existe déjà dans la saison
 */
async function checkEmailExistsInSeason(seasonId, email) {
  try {
    // Vérifier dans les rôles de la saison
    const seasonData = await firestoreService.getDocument('seasons', seasonId)
    const seasonUsers = seasonData?.roles?.users || []
    const seasonAdmins = seasonData?.roles?.admins || []
    
    if (seasonUsers.includes(email) || seasonAdmins.includes(email)) {
      return {
        exists: true,
        user: { email, isAdmin: seasonAdmins.includes(email) }
      }
    }
    
    // Vérifier dans les joueurs protégés
    const players = await firestoreService.getDocuments('seasons', seasonId, 'players')
    const playerWithEmail = players.find(p => p.email === email)
    
    if (playerWithEmail) {
      return {
        exists: true,
        user: { email, isAdmin: false, playerId: playerWithEmail.id }
      }
    }
    
    return { exists: false }
    
  } catch (error) {
    logger.error('Erreur lors de la vérification email', error)
    return { exists: false }
  }
}

/**
 * Obtenir une invitation par email
 */
async function getInvitationByEmail(seasonId, email) {
  try {
    const invitations = await firestoreService.queryDocuments(
      INVITATIONS_COLLECTION,
      [
        firestoreService.where('seasonId', '==', seasonId),
        firestoreService.where('email', '==', email.toLowerCase().trim())
      ]
    )
    
    return invitations.length > 0 ? invitations[0] : null
    
  } catch (error) {
    logger.error('Erreur lors de la récupération d\'invitation', error)
    return null
  }
}

/**
 * Obtenir toutes les invitations d'une saison
 */
async function getInvitationsForSeason(seasonId) {
  try {
    const invitations = await firestoreService.queryDocuments(
      INVITATIONS_COLLECTION,
      [firestoreService.where('seasonId', '==', seasonId)]
    )
    
    return invitations.map(inv => ({
      id: inv.id,
      ...inv
    }))
    
  } catch (error) {
    logger.error('Erreur lors du chargement des invitations', error)
    return []
  }
}

/**
 * Construire la liste des utilisateurs avec leurs joueurs
 */
async function buildUsersWithPlayers(players, seasonUsers, seasonAdmins) {
  const userMap = new Map()
  
  players.forEach(player => {
    if (player.email) {
      if (!userMap.has(player.email)) {
        userMap.set(player.email, {
          email: player.email,
          firstName: player.firstName || '',
          lastName: player.lastName || '',
          gender: player.gender || 'unknown',
          isAdmin: seasonAdmins.includes(player.email),
          players: []
        })
      }
      
      const user = userMap.get(player.email)
      user.players.push({
        id: player.id,
        name: player.name,
        protected: player.isProtected || false
      })
      
      // Définir le playerId principal (le premier joueur trouvé)
      if (!user.playerId) {
        user.playerId = player.id
      }
    }
  })
  
  // Ajouter les utilisateurs sans joueurs protégés
  seasonUsers.forEach(email => {
    if (!userMap.has(email)) {
      userMap.set(email, {
        email,
        firstName: '',
        lastName: '',
        gender: 'unknown',
        isAdmin: seasonAdmins.includes(email),
        players: []
      })
    }
  })
  
  return Array.from(userMap.values())
}

/**
 * Vérifier et valider un token d'invitation
 */
export async function validateInvitationToken(token, email, seasonId) {
  try {
    const invitations = await firestoreService.queryDocuments(
      INVITATIONS_COLLECTION,
      [
        firestoreService.where('seasonId', '==', seasonId),
        firestoreService.where('email', '==', email.toLowerCase().trim()),
        firestoreService.where('magicLinkToken', '==', token)
      ]
    )
    
    if (invitations.length === 0) {
      return { valid: false, reason: 'not_found' }
    }
    
    const invitation = invitations[0]
    
    if (invitation.status !== 'pending') {
      return { valid: false, reason: 'not_pending', status: invitation.status }
    }
    
    if (new Date() > new Date(invitation.expiresAt)) {
      return { valid: false, reason: 'expired' }
    }
    
    return { valid: true, invitation }
    
  } catch (error) {
    logger.error('Erreur lors de la validation du token', error)
    return { valid: false, reason: 'error', error: error.message }
  }
}
