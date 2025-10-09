// API endpoint pour récupérer les logs d'audit
// Ce fichier sera utilisé par le serveur de développement Vite

import { getApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';

// Use existing Firebase app instance (singleton pattern)
let app;
let db;

function getFirebaseApp() {
  if (!app) {
    app = getApp(); // Get existing Firebase app
  }
  return app;
}

function getFirebaseDb() {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

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
    const firebaseApp = getFirebaseApp();
    let database = getFirebaseDb();
    if (env === 'development') {
      database = getFirestore(firebaseApp, 'development');
    } else if (env === 'staging') {
      database = getFirestore(firebaseApp, 'staging');
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
