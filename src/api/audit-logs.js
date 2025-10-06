// API endpoint pour récupérer les logs d'audit
// Ce fichier sera utilisé par le serveur de développement Vite

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import configService from '../services/configService.js';

// Configuration Firebase pour l'API
const firebaseConfig = configService.getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour récupérer les logs d'audit
export async function getAuditLogs(filters = {}) {
  try {
    // Vérifier l'authentification
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    if (!auth.currentUser) {
      throw new Error('Authentification requise pour accéder aux logs d\'audit');
    }
    const {
      env = 'production',
      limit: limitCount = 50,
      user,
      player,
      season,
      type
    } = filters;

    // Déterminer la base de données à utiliser
    let database = db;
    if (env === 'development') {
      database = getFirestore(app, 'development');
    } else if (env === 'staging') {
      database = getFirestore(app, 'staging');
    }
    // Pour 'production', utiliser la base par défaut

    // Construire la requête
    let q = query(
      collection(database, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    // Ajouter les filtres
    if (user) {
      q = query(q, where('userId', '==', user));
    }
    if (player) {
      q = query(q, where('playerName', '==', player));
    }
    if (season) {
      q = query(q, where('seasonId', '==', season));
    }
    if (type) {
      q = query(q, where('action', '==', type));
    }

    // Exécuter la requête
    const snapshot = await getDocs(q);
    const logs = [];

    snapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      logs,
      count: logs.length,
      environment: env
    };

  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error);
    return {
      success: false,
      error: error.message,
      logs: [],
      count: 0
    };
  }
}

// Fonction pour formater les logs pour l'affichage
export function formatAuditLogs(logs) {
  return logs.map(log => ({
    ...log,
    timestamp: log.timestamp?.toDate ? log.timestamp.toDate() : log.timestamp,
    formattedTimestamp: log.timestamp?.toDate ? 
      log.timestamp.toDate().toLocaleString('fr-FR') : 
      new Date(log.timestamp).toLocaleString('fr-FR')
  }));
}
