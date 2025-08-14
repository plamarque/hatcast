#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lire le service worker source
const swPath = path.join(__dirname, '../src/service-worker.js');
const swContent = fs.readFileSync(swPath, 'utf8');

// Remplacer les placeholders par les vraies valeurs d'environnement
const replacements = {
  'FIREBASE_API_KEY_PLACEHOLDER': process.env.VITE_FIREBASE_API_KEY || '',
  'FIREBASE_AUTH_DOMAIN_PLACEHOLDER': process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  'FIREBASE_PROJECT_ID_PLACEHOLDER': process.env.VITE_FIREBASE_PROJECT_ID || '',
  'FIREBASE_STORAGE_BUCKET_PLACEHOLDER': process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  'FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER': process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  'FIREBASE_APP_ID_PLACEHOLDER': process.env.VITE_FIREBASE_APP_ID || '',
  'FIREBASE_MEASUREMENT_ID_PLACEHOLDER': process.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

let updatedContent = swContent;
Object.entries(replacements).forEach(([placeholder, value]) => {
  updatedContent = updatedContent.replace(new RegExp(placeholder, 'g'), `'${value}'`);
});

// Écrire le service worker mis à jour
fs.writeFileSync(swPath, updatedContent);

console.log('✅ Firebase configuration injected into service worker');
