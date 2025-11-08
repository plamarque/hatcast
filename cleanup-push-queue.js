#!/usr/bin/env node

/**
 * Script pour nettoyer la queue push avant de réactiver le système
 * UTILISER AVEC PRÉCAUTION !
 */

const admin = require('firebase-admin');

// Initialiser Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  console.error('❌ Variable GOOGLE_APPLICATION_CREDENTIALS non définie');
  console.error('Export: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function analyzePushQueue() {
  console.log('\n📊 Analyse de la queue push...\n');
  
  const snapshot = await db.collection('pushQueue').get();
  
  console.log(`📦 Nombre total de documents: ${snapshot.size}`);
  
  if (snapshot.empty) {
    console.log('✅ Queue vide - aucun nettoyage nécessaire');
    return { total: 0, docs: [] };
  }
  
  const docs = [];
  const now = Date.now();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.() || new Date(0);
    const ageInHours = (now - createdAt.getTime()) / (1000 * 60 * 60);
    
    docs.push({
      id: doc.id,
      to: data.to,
      title: data.title,
      reason: data.reason,
      createdAt: createdAt.toISOString(),
      ageInHours: Math.round(ageInHours),
      status: data.status
    });
  });
  
  // Trier par ancienneté
  docs.sort((a, b) => b.ageInHours - a.ageInHours);
  
  console.log('\n📋 Détails des notifications:');
  console.log('━'.repeat(100));
  
  docs.slice(0, 10).forEach(doc => {
    console.log(`📄 ID: ${doc.id}`);
    console.log(`   To: ${doc.to}`);
    console.log(`   Title: ${doc.title}`);
    console.log(`   Reason: ${doc.reason}`);
    console.log(`   Age: ${doc.ageInHours}h (${Math.round(doc.ageInHours / 24)} jours)`);
    console.log(`   Status: ${doc.status || 'pending'}`);
    console.log('');
  });
  
  if (docs.length > 10) {
    console.log(`... et ${docs.length - 10} autres documents\n`);
  }
  
  // Statistiques
  const olderThan24h = docs.filter(d => d.ageInHours > 24).length;
  const olderThan1week = docs.filter(d => d.ageInHours > 24 * 7).length;
  
  console.log('\n📊 Statistiques:');
  console.log(`   Plus de 24h: ${olderThan24h} documents`);
  console.log(`   Plus de 7 jours: ${olderThan1week} documents`);
  
  return { total: docs.length, docs };
}

async function cleanupOldNotifications(olderThanHours = 24) {
  console.log(`\n🧹 Nettoyage des notifications de plus de ${olderThanHours}h...`);
  
  const snapshot = await db.collection('pushQueue').get();
  const now = Date.now();
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.() || new Date(0);
    const ageInHours = (now - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours > olderThanHours) {
      batch.delete(doc.ref);
      count++;
    }
  });
  
  if (count === 0) {
    console.log('✅ Aucune notification à nettoyer');
    return 0;
  }
  
  console.log(`⚠️  Sur le point de supprimer ${count} notifications`);
  console.log('⏳ Attente de 5 secondes... (Ctrl+C pour annuler)');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await batch.commit();
  console.log(`✅ ${count} notifications supprimées`);
  
  return count;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === '--analyze' || !command) {
    await analyzePushQueue();
  } else if (command === '--cleanup') {
    const hours = parseInt(args[1]) || 24;
    await analyzePushQueue();
    await cleanupOldNotifications(hours);
  } else {
    console.log('Usage:');
    console.log('  node cleanup-push-queue.js --analyze          Analyser la queue');
    console.log('  node cleanup-push-queue.js --cleanup [hours]  Nettoyer (défaut: 24h)');
    console.log('');
    console.log('Exemples:');
    console.log('  node cleanup-push-queue.js --analyze');
    console.log('  node cleanup-push-queue.js --cleanup 24   # Supprimer > 24h');
    console.log('  node cleanup-push-queue.js --cleanup 1    # Supprimer > 1h');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

