# Plan de migration HatCast V1.0

## Vue d'ensemble

Migration complète de HatCast vers une architecture robuste et sécurisée, découplant clairement client et serveur, avec une architecture en couches côté backend.

**Objectif** : Application mobile-first robuste avec API REST et exposition MCP pour agents IA

**Contraintes** :
- Conservation des données Firebase existantes
- Coût minimal (< 10€/mois)
- Mode offline préservé
- UI/UX conservée (style Tailwind)

## Stack technique finale

### Frontend
- **Framework** : Vue.js 3 + Composition API
- **Styling** : Tailwind CSS
- **State Management** : Pinia
- **Data Access** : 
  - Firestore SDK (accès direct pour offline/real-time)
  - Axios (API REST pour opérations complexes)
- **Hosting** : Firebase Hosting
- **Build** : Vite

### Backend
- **Framework** : Spring Boot 3.x
- **Language** : Java 17+
- **Build Tool** : Maven
- **Architecture** : Layered (Controller → Service → Repository)
- **Security** : Spring Security + Firebase Auth
- **Database Access** : Firebase Admin SDK
- **Deployment** : Google Cloud Run (europe-west1)

### Infrastructure
- **Database** : Firestore (conservation totale)
- **Authentication** : Firebase Auth
- **Storage** : Firebase Storage
- **Emails** : SendGrid (migration depuis firestore-send-email)
- **Push Notifications** : Firebase Cloud Messaging
- **Scheduled Jobs** : Cloud Scheduler → Cloud Run endpoints
- **CI/CD** : GitHub Actions
- **Environnements** : dev (local) → staging → production
- **Tests** : 
  - Tests unitaires (JUnit + Vitest) en local
  - Tests d'intégration (Spring Boot Test) sur staging
  - Tests UI (Playwright) sur staging
  - Déploiement production manuel après validation
- **Versioning** : Automatique avec génération changelog intelligent

### Coûts estimés
- Cloud Run : 3-5€/mois
- Firestore : 1-3€/mois
- Firebase Hosting : 0€
- Cloud Scheduler : 0€ (< 3 jobs)
- SendGrid : 0€ (quota gratuit 100 emails/jour)
- **Total : ~5-10€/mois**

## Architecture cible

### Vue d'ensemble des couches

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTS LAYER                           │
│  Vue.js Frontend │ MCP Clients │ Mobile Apps │ Cron Jobs    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                  SECURITY FILTER CHAIN                      │
│  Firebase Auth Token Validation │ CORS │ Rate Limiting      │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴─────────────────┐
        │                                  │
┌───────▼──────────┐            ┌─────────▼──────────┐
│  REST CONTROLLER │            │   MCP CONTROLLER   │
│     LAYER        │            │      LAYER         │
│  /api/**         │            │   /mcp/**          │
└───────┬──────────┘            └─────────┬──────────┘
        │                                  │
        └────────────────┬─────────────────┘
                         │
              ┌──────────▼──────────┐
              │   SERVICE LAYER     │
              │  Business Logic     │
              └──────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────┐  ┌────────▼────┐  ┌───────▼──────┐
│ REPOSITORY │  │   DOMAIN    │  │  EXTERNAL    │
│   LAYER    │  │   MODELS    │  │  SERVICES    │
│            │  │             │  │ SendGrid,FCM │
└─────┬──────┘  └─────────────┘  └──────────────┘
      │
┌─────▼──────────────────────────┐
│  FIREBASE ADMIN SDK            │
│  Firestore │ Auth │ Storage    │
└────────────────────────────────┘
```

### Architecture hybride Frontend

```
Vue.js Frontend (PWA)
  ├── Components (props/events cohérents)
  ├── Views
  ├── Stores (Pinia)
  ├── Services
  │   ├── Firestore SDK direct (offline/real-time)
  │   └── API Client (axios → Spring Boot)
  └── Service Worker (offline support)
       ↓
Firebase Hosting
       ↓
       ├─→ Firestore (lecture/écriture directe pour offline)
       │
       └─→ Spring Boot API (Cloud Run)
            ├── Controllers (REST endpoints)
            ├── Services (business logic)
            ├── Repositories (data abstraction)
            ├── Security (Firebase token validation)
            └── Firebase Admin SDK
                 ├── Firestore (opérations complexes)
                 ├── Firebase Auth (validation tokens)
                 ├── Cloud Messaging (push notifications)
                 └── Firebase Storage
```

## Règles d'architecture anti-incohérence

### Principe fondamental : Single Source of Truth

- **Firestore = Source de vérité pour les DONNÉES**
- **Spring Boot = Source de vérité pour la LOGIQUE MÉTIER**

### Matrice de responsabilités

| Donnée | Lecture Frontend | Écriture Frontend | Logique Métier |
|--------|------------------|-------------------|----------------|
| **Availabilities** | ✅ Firestore direct | ✅ Firestore direct | ❌ Aucune (simple bool) |
| **User Profile** | ✅ Firestore direct | ✅ Firestore direct (champs limités) | ❌ Minimale (validation format) |
| **Shows (lecture)** | ✅ Firestore direct | ❌ Interdit | ✅ API (validation dates, saison, etc.) |
| **Castings (lecture)** | ✅ Firestore direct | ❌ Interdit | ✅ API (algorithme tirage) |
| **Seasons** | ✅ Firestore direct | ❌ Interdit | ✅ API (validation périodes) |
| **Stats** | ❌ Via API | ❌ Interdit | ✅ API (calculs complexes) |

### Firestore Security Rules (première barrière)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ✅ Disponibilités : écriture autorisée (logique simple)
    match /availabilities/{availId} {
      allow read: if request.auth != null;
      allow create, update: if 
        request.auth != null &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.available is bool &&
        request.resource.data.showId is string &&
        exists(/databases/$(database)/documents/shows/$(request.resource.data.showId));
    }
    
    // ✅ Profil : lecture autorisée, écriture limitée
    match /users/{userId} {
      allow read: if request.auth != null;
      allow update: if 
        request.auth.uid == userId &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['displayName', 'photoURL', 'phone', 'preferences']);
    }
    
    // ❌ Shows : LECTURE SEULE depuis frontend
    match /shows/{showId} {
      allow read: if request.auth != null;
      allow write: if false; // Écriture UNIQUEMENT via API Spring Boot
    }
    
    // ❌ Castings : LECTURE SEULE depuis frontend
    match /castings/{castingId} {
      allow read: if request.auth != null;
      allow write: if false; // Écriture UNIQUEMENT via API Spring Boot
    }
    
    // ❌ Seasons : LECTURE SEULE depuis frontend
    match /seasons/{seasonId} {
      allow read: if request.auth != null;
      allow write: if false; // Écriture UNIQUEMENT via API Spring Boot
    }
  }
}
```

### Guidelines de développement

#### ✅ Frontend - Ce qu'on FAIT
- Validation UX (champs vides, format email)
- Affichage des données
- Appels API pour opérations complexes
- Gestion offline pour données simples (availabilities)

#### ❌ Frontend - Ce qu'on NE FAIT PAS
- Validation métier complexe
- Calculs statistiques
- Algorithmes de tirage
- Gestion des permissions
- Orchestration de notifications

#### ✅ Spring Boot - Responsabilités
- Validation métier complexe
- Calculs et algorithmes
- Gestion des permissions
- Orchestration des notifications
- Transactions multi-collections
- Audit et logging

### Checklist de validation anti-incohérence

- [ ] Security Rules Firestore interdisent les écritures non autorisées
- [ ] Code frontend audité pour détecter la logique métier
- [ ] Tests d'intégration validant la cohérence
- [ ] Documentation des responsabilités par entité
- [ ] Formation équipe sur les règles d'architecture

## Phases de migration

### Phase 1 : Préparation (Semaine 1-2)
**Objectif** : Environnement et infrastructure de base

1. **Création projet Spring Boot**
   - Structure Maven
   - Configuration Spring Boot 3
   - Dépendances (Firebase Admin SDK, Spring Web, Spring Security)
   - Configuration multi-environnements (local, staging, production)

2. **Configuration Firebase**
   - Service Account pour Spring Boot
   - Configuration Firestore Database ID
   - Variables d'environnement sécurisées

3. **Configuration Cloud Run**
   - Projet GCP
   - Service Account
   - Permissions IAM
   - Configuration région europe-west1

4. **Configuration CI/CD**
   - GitHub Actions workflows
   - Secrets GitHub (GCP credentials, SendGrid API key)
   - Déploiement automatique staging/production

5. **Documentation architecture**
   - Diagrammes d'architecture
   - Conventions de code
   - Guide de contribution

**Validation** : Déploiement d'un endpoint `/health` sur Cloud Run

### Phase 2 : Backend - API de base (Semaine 3-5)
**Objectif** : API REST avec authentification et premières entités

1. **Security Layer**
   - Configuration Spring Security
   - Validation Firebase Auth tokens
   - Intercepteurs pour authentification
   - Gestion des rôles (admin, user, guest)

2. **Repository Layer**
   - Interfaces Repository
   - Implémentation Firestore
   - Pattern abstraction pour future évolution

3. **Endpoints Authentication**
   - POST `/api/auth/verify-token`
   - GET `/api/auth/current-user`
   - PUT `/api/auth/update-profile`

4. **Endpoints Seasons**
   - GET `/api/seasons` (liste)
   - GET `/api/seasons/{id}` (détail)
   - POST `/api/seasons` (création - admin)
   - PUT `/api/seasons/{id}` (update - admin)
   - DELETE `/api/seasons/{id}` (soft delete - admin)

5. **Endpoints Shows**
   - GET `/api/shows` (liste avec filtres)
   - GET `/api/shows/{id}` (détail)
   - POST `/api/shows` (création)
   - PUT `/api/shows/{id}` (update)
   - DELETE `/api/shows/{id}` (soft delete)

**Validation** : Tests Postman/Insomnia de tous les endpoints

### Phase 3 : Backend - Logique métier complexe (Semaine 6-8)
**Objectif** : Migration de la logique métier critique

1. **Casting System**
   - GET `/api/castings/{showId}` (récupérer casting)
   - POST `/api/castings/{showId}/draw` (tirage automatique)
   - PUT `/api/castings/{showId}/assign` (assignation manuelle)
   - POST `/api/castings/{showId}/validate` (validation finale)

2. **Availabilities Management**
   - GET `/api/availabilities/user/{userId}` (dispos utilisateur)
   - PUT `/api/availabilities` (update dispos - reste aussi en direct Firestore)
   - GET `/api/availabilities/show/{showId}` (synthèse pour spectacle)

3. **Notifications System**
   - POST `/api/notifications/send` (envoi notification)
   - GET `/api/notifications/user/{userId}` (historique)
   - Service SendGrid (configuration, templates)
   - Service FCM (push notifications)

4. **Statistics & Analytics**
   - GET `/api/stats/season/{seasonId}` (stats saison)
   - GET `/api/stats/user/{userId}` (stats acteur)
   - GET `/api/stats/shows` (statistiques globales)

5. **Admin Operations**
   - POST `/api/admin/users/{id}/role` (gestion rôles)
   - GET `/api/admin/audit-logs` (logs d'audit)
   - POST `/api/admin/data-export` (export données)

**Validation** : Tests d'intégration sur scénarios complets

### Phase 4 : Backend - Scheduled Jobs (Semaine 9)
**Objectif** : Migration des Cloud Functions vers endpoints cron

1. **Endpoints Cron**
   - POST `/api/cron/daily-reminder` (rappel quotidien)
   - POST `/api/cron/auto-draw` (tirage automatique dimanche soir)
   - POST `/api/cron/monthly-cleanup` (nettoyage données)

2. **Configuration Cloud Scheduler**
   - Job reminder quotidien (9h)
   - Job tirage auto (dimanche 20h)
   - Job cleanup (1er du mois 2h)
   - Authentification OIDC

3. **Sécurité Cron**
   - Validation tokens Cloud Scheduler
   - Logs détaillés
   - Gestion d'erreurs et retry

**Validation** : Tests manuels des endpoints, configuration Cloud Scheduler en staging

### Phase 5 : Backend - Exposition MCP (Semaine 10)
**Objectif** : API pour agents IA

1. **MCP Server Configuration**
   - Endpoints standardisés selon protocole MCP
   - Documentation OpenAPI/Swagger
   - Rate limiting

2. **MCP Endpoints**
   - GET `/mcp/seasons` (liste saisons)
   - GET `/mcp/shows` (recherche spectacles)
   - GET `/mcp/stats` (statistiques agrégées)
   - POST `/mcp/query` (requêtes en langage naturel)

**Validation** : Tests avec agents IA (Claude, ChatGPT)

### Phase 6 : Frontend - Refonte architecture (Semaine 11-13)
**Objectif** : Réécriture frontend avec architecture propre

1. **Structure projet**
   - Réorganisation dossiers
   - Configuration Pinia stores
   - Services API (axios clients)
   - Composables Vue 3

2. **API Service Layer**
   ```javascript
   // src/services/api/
   - authService.js
   - seasonsService.js
   - showsService.js
   - castingService.js
   - notificationsService.js
   ```

3. **Firestore Service Layer**
   ```javascript
   // src/services/firestore/
   - availabilitiesService.js
   - profileService.js
   - realtimeService.js
   ```

4. **Pinia Stores**
   - authStore (état authentification)
   - seasonsStore (cache + API)
   - showsStore (cache + API)
   - uiStore (état UI global)

5. **Refonte composants**
   - Props/events cohérents
   - Composition API
   - Réutilisabilité maximale
   - Séparation présentation/logique

**Validation** : Linter, tests composants, vérification offline

### Phase 7 : Frontend - Vues et écrans (Semaine 14-17)
**Objectif** : Réécriture des vues avec nouvelle architecture

**Ordre de migration** :
1. Login/Auth (crucial)
2. Liste saisons (simple)
3. Détail saison (simple)
4. Liste spectacles (moyen)
5. Détail spectacle (complexe)
6. Gestion disponibilités (critique - offline)
7. Casting (complexe - real-time)
8. Profil utilisateur (simple)
9. Administration (complexe)

**Pour chaque vue** :
- Réécriture avec Composition API
- Utilisation stores Pinia
- Gestion offline (Firestore direct)
- Gestion erreurs et loading states
- Tests manuels

**Validation** : Tests utilisateurs sur chaque vue migrée

### Phase 8 : Migration SendGrid (Semaine 18)
**Objectif** : Remplacer firestore-send-email par SendGrid

1. **Configuration SendGrid**
   - API Key dans secrets
   - Configuration Spring Boot
   - Templates email (Dynamic Templates)

2. **Migration templates**
   - Casting reminder
   - New show notification
   - Password reset
   - Welcome email

3. **Service Email**
   ```java
   @Service
   public class EmailService {
     - sendCastingReminder()
     - sendNewShowNotification()
     - sendPasswordReset()
     - sendWelcomeEmail()
   }
   ```

4. **Tests emails**
   - Environnement staging
   - Vérification délivrabilité
   - Templates responsives

**Validation** : Tests emails en staging sur tous les cas d'usage

### Phase 9 : Tests et optimisation (Semaine 19-20)
**Objectif** : Validation complète et optimisations

1. **Tests end-to-end**
   - Scénarios complets utilisateurs
   - Tests offline/online
   - Tests multi-appareils
   - Tests performance

2. **Optimisations Backend**
   - Cache Redis si besoin
   - Optimisation requêtes Firestore
   - Logs optimisés
   - Monitoring Cloud Run

3. **Optimisations Frontend**
   - Code splitting
   - Lazy loading
   - Service Worker optimisé
   - PWA manifest

4. **Sécurité**
   - Audit Security Rules Firestore
   - Tests permissions Spring Security
   - Rate limiting
   - CORS configuration

**Validation** : Checklist complète de validation

### Phase 10 : Migration données et bascule (Semaine 21)
**Objectif** : Migration production et go-live

1. **Backup production**
   - Export Firestore complet
   - Backup Storage
   - Documentation état actuel

2. **Déploiement staging complet**
   - Import données de prod vers staging
   - Tests complets en staging
   - Validation utilisateurs pilotes

3. **Migration progressive**
   - Déploiement backend production
   - Déploiement frontend en canary (10% trafic)
   - Monitoring erreurs
   - Augmentation progressive (25%, 50%, 100%)

4. **Bascule complète**
   - 100% trafic nouvelle version
   - Désactivation ancienne version
   - Monitoring 48h

5. **Cleanup**
   - Suppression ancien code
   - Documentation mise à jour
   - Post-mortem migration

**Validation** : Application V1.0 en production, stable, 0 bug critique

## Points de validation critiques

### Validation Phase 1
- [ ] Endpoint `/health` répond sur Cloud Run
- [ ] CI/CD déploie automatiquement
- [ ] Connexion Firebase Admin SDK fonctionne

### Validation Phase 2-3
- [ ] Tous les endpoints REST fonctionnent
- [ ] Authentification Firebase validée
- [ ] CRUD complet sur toutes les entités

### Validation Phase 6-7
- [ ] Nouveau frontend fonctionne en local
- [ ] Mode offline préservé
- [ ] Toutes les vues migrées

### Validation Phase 10
- [ ] Production stable
- [ ] Aucun bug critique
- [ ] Performance acceptable (< 2s chargement)
- [ ] Coûts sous contrôle (< 10€/mois)

## Gestion des risques

### Risque : Perte de données
**Mitigation** : 
- Backups automatiques Firestore avant migration
- Tests complets en staging avec copie des données prod
- Migration canary progressive

### Risque : Régression fonctionnelle
**Mitigation** :
- Tests end-to-end exhaustifs
- Validation utilisateurs en staging
- Rollback plan documenté

### Risque : Coûts imprévus
**Mitigation** :
- Configuration Cloud Run avec limites (max-instances)
- Monitoring quotidien des coûts
- Alertes budgets GCP

### Risque : Performance dégradée
**Mitigation** :
- Tests de charge avant prod
- Monitoring APM (Cloud Run metrics)
- Cache strategy si nécessaire

### Risque : Complexité migration
**Mitigation** :
- Migration progressive par module
- Conservation ancien système en parallèle
- Documentation détaillée

## Estimation temporelle

**Durée totale : 21 semaines (~5 mois)**

- Phase 1 : 2 semaines
- Phase 2 : 3 semaines
- Phase 3 : 3 semaines
- Phase 4 : 1 semaine
- Phase 5 : 1 semaine
- Phase 6 : 3 semaines
- Phase 7 : 4 semaines
- Phase 8 : 1 semaine
- Phase 9 : 2 semaines
- Phase 10 : 1 semaine

**Charge de travail** : ~200-250 heures total

## Documentation à créer

1. **Documentation technique**
   - `docs/architecture/SPRING_BOOT_ARCHITECTURE.md`
   - `docs/architecture/API_DOCUMENTATION.md`
   - `docs/architecture/DEPLOYMENT_GUIDE.md`
   - `docs/architecture/SECURITY_MODEL.md`

2. **Documentation développeur**
   - `docs/developer/SETUP_LOCAL.md`
   - `docs/developer/CONTRIBUTING.md`
   - `docs/developer/TESTING_GUIDE.md`

3. **Documentation utilisateur**
   - Mise à jour des docs existantes si nécessaire
   - Guide migration pour utilisateurs

## Rollback Plan

En cas de problème critique en production :

1. **Rollback Cloud Run** : 
   ```bash
   gcloud run services update-traffic hatcast-api \
     --to-revisions=PREVIOUS_REVISION=100
   ```

2. **Rollback Frontend** :
   ```bash
   firebase hosting:rollback
   ```

3. **Communication utilisateurs** : Email + notification app

4. **Investigation** : Logs Cloud Run + Firestore + Sentry

5. **Fix et redéploiement** : Après correction

## Succès de la migration

La migration sera considérée comme réussie si :

- ✅ Application stable en production (uptime > 99%)
- ✅ Aucune perte de données
- ✅ Fonctionnalités offline préservées
- ✅ Performance équivalente ou meilleure
- ✅ Coûts < 10€/mois
- ✅ Satisfaction utilisateurs maintenue
- ✅ Code maintenable et documenté
- ✅ API REST fonctionnelle
- ✅ Exposition MCP opérationnelle

## Notes importantes

- **Pas de précipitation** : Chaque phase doit être validée avant de passer à la suivante
- **Tests rigoureux** : Staging avec données réelles avant chaque déploiement prod
- **Communication** : Informer les utilisateurs des changements à venir
- **Monitoring** : Logs et métriques tout au long de la migration
- **Flexibilité** : Adapter le planning si nécessaire selon les difficultés rencontrées

## To-dos

- [ ] Phase 1 : Préparation - Environnement et infrastructure de base
- [ ] Phase 2 : Backend - API de base avec authentification et premières entités
- [ ] Phase 3 : Backend - Logique métier complexe (casting, availabilities, notifications)
- [ ] Phase 4 : Backend - Scheduled Jobs (migration Cloud Functions vers cron endpoints)
- [ ] Phase 5 : Backend - Exposition MCP pour agents IA
- [ ] Phase 6 : Frontend - Refonte architecture (Pinia, services, composables)
- [ ] Phase 7 : Frontend - Réécriture des vues et écrans
- [ ] Phase 8 : Migration SendGrid (remplacement firestore-send-email)
- [ ] Phase 9 : Tests et optimisation (end-to-end, performance, sécurité)
- [ ] Phase 10 : Migration données et bascule production
