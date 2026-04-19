# Migration vers le Service Firestore Centralisé

## 🎯 Objectif

Garantir que tous les accès Firestore passent par une couche de service unique qui utilise automatiquement la bonne base de données selon l'environnement.

## 📋 Avantages

- ✅ **Base de données automatique** : Utilise la bonne base (`default`, `staging`, `development`) selon l'environnement
- ✅ **Gestion d'erreurs centralisée** : Logs et gestion d'erreurs cohérents
- ✅ **API unifiée** : Interface simple et cohérente pour tous les accès Firestore
- ✅ **Traçabilité** : Logs détaillés pour le debugging
- ✅ **Maintenance facilitée** : Un seul point de modification pour les changements Firestore

## 🔧 Service Centralisé

### Fichier : `src/services/firestoreService.js`

Le service fournit une API complète pour tous les accès Firestore :

```javascript
import firestoreService from './firestoreService.js'

// Lire tous les documents d'une collection
const seasons = await firestoreService.getDocuments('seasons')

// Lire un document spécifique
const season = await firestoreService.getDocument('seasons', 'seasonId')

// Créer un nouveau document
const newId = await firestoreService.addDocument('seasons', {
  name: 'Nouvelle Saison',
  slug: 'nouvelle-saison'
})

// Mettre à jour un document
await firestoreService.updateDocument('seasons', 'seasonId', {
  name: 'Saison Modifiée'
})

// Supprimer un document
await firestoreService.deleteDocument('seasons', 'seasonId')

// Sous-collections
const events = await firestoreService.getDocuments('seasons', 'seasonId', 'events')
```

## 📝 Migration des Services Existants

### 1. Service Seasons (`src/services/seasons.js`)

**Avant :**
```javascript
import { db } from './firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

export async function getSeasons() {
  const q = query(collection(db, SEASONS_COLLECTION), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

**Après :**
```javascript
import firestoreService from './firestoreService.js'

export async function getSeasons() {
  const seasons = await firestoreService.getDocuments('seasons')
  return seasons.sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt)
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt)
    return dateB - dateA
  })
}
```

### 2. Service Storage (`src/services/storage.js`)

**Avant :**
```javascript
import { db } from './firebase.js'
import { collection, getDocs } from 'firebase/firestore'

export async function loadEvents(seasonId = null) {
  if (seasonId) {
    const eventsSnap = await getDocs(collection(db, 'seasons', seasonId, 'events'))
    return eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
}
```

**Après :**
```javascript
import firestoreService from './firestoreService.js'

export async function loadEvents(seasonId = null) {
  if (seasonId) {
    return await firestoreService.getDocuments('seasons', seasonId, 'events')
  } else {
    return await firestoreService.getDocuments('events')
  }
}
```

## 🔄 Plan de Migration

### Phase 1 : Services Principaux
- [x] Créer le service centralisé `firestoreService.js`
- [ ] Migrer `src/services/seasons.js`
- [ ] Migrer `src/services/storage.js`
- [ ] Migrer `src/services/auditClient.js`
- [ ] Migrer `src/services/pushService.js`

### Phase 2 : Composants Vue
- [ ] Migrer les composants qui accèdent directement à Firestore
- [ ] Remplacer les imports directs de `firebase/firestore`

### Phase 3 : Tests et Validation
- [ ] Tester tous les environnements (`development`, `staging`, `production`)
- [ ] Valider que les bonnes bases sont utilisées
- [ ] Vérifier les performances

## 🛠️ Utilisation du Service

### Méthodes Principales

| Méthode | Description | Exemple |
|---------|-------------|---------|
| `getDocuments()` | Lire tous les documents | `getDocuments('seasons')` |
| `getDocument()` | Lire un document | `getDocument('seasons', 'id')` |
| `addDocument()` | Créer un document | `addDocument('seasons', data)` |
| `setDocument()` | Créer/Mettre à jour | `setDocument('seasons', 'id', data)` |
| `updateDocument()` | Mettre à jour | `updateDocument('seasons', 'id', data)` |
| `deleteDocument()` | Supprimer | `deleteDocument('seasons', 'id')` |

### Gestion des Erreurs

Le service gère automatiquement les erreurs et les log :

```javascript
try {
  const seasons = await firestoreService.getDocuments('seasons')
} catch (error) {
  // L'erreur est déjà loggée par le service
  console.error('Erreur personnalisée:', error)
}
```

### Requêtes Complexes

```javascript
// Requête avec contraintes
const query = firestoreService.createQuery('seasons', [
  where('active', '==', true),
  orderBy('createdAt', 'desc'),
  limit(10)
])
const results = await firestoreService.executeQuery(query)
```

### Batch Operations

```javascript
const batch = firestoreService.createBatch()
batch.set(docRef1, data1)
batch.update(docRef2, data2)
batch.delete(docRef3)
await batch.commit()
```

## 🔍 Monitoring et Debug

Le service log automatiquement toutes les opérations :

```
🔧 FirestoreService initialisé pour l'environnement: development
✅ Document créé dans seasons avec l'ID: abc123
✅ Document seasonId mis à jour dans seasons
❌ Erreur lors de la lecture de la collection events: Missing or insufficient permissions
```

## 🚀 Avantages de la Migration

1. **Séparation des environnements** : Garantit l'utilisation de la bonne base
2. **Maintenance simplifiée** : Un seul point de modification
3. **Debugging facilité** : Logs centralisés et détaillés
4. **Cohérence** : API uniforme dans toute l'application
5. **Évolutivité** : Facilite l'ajout de nouvelles fonctionnalités

## ⚠️ Points d'Attention

- Tous les accès Firestore doivent passer par le service
- Ne pas importer directement `firebase/firestore` dans les composants
- Utiliser les méthodes du service pour la gestion d'erreurs
- Tester sur tous les environnements après migration
