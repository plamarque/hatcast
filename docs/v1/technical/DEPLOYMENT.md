# 🚀 Guide de Release et Déploiement Multi-Environnement HatCast

## 🌍 **Environnements Disponibles**

### **🏠 Development (Local)**
- **URL** : `https://localhost:5173` (avec `npm run dev -- --host`)
- **Base Firestore** : `development` (région `europe-west3`)
- **Storage** : `development/` prefix
- **Email** : Ethereal Email (capture)
- **Tests** : Intercepteur local (fichiers JSON)

### **🌐 Staging**
- **URL** : `https://hatcast-staging.web.app`
- **Base Firestore** : `staging` (région `us-central1`)
- **Storage** : `staging/` prefix
- **Email** : Ethereal Email (capture)
- **Déploiement** : Automatique sur push `staging`

### **🚀 Production**
- **URL** : `https://selections.la-malice.fr` (domaine personnalisé)
- **URL Alternative** : `https://impro-selector.web.app`
- **Base Firestore** : `default` (région `us-central1`)
- **Storage** : `production/` prefix
- **Email** : Gmail (envoi réel)

### **🔄 Workflow Simplifié**
1. **Développement** : Branches `feature/*` → Tests locaux
2. **Staging** : Merge `feature/*` → `staging` → **Déploiement automatique** (GitHub Actions)
3. **Production** : Script `./scripts/release-version.sh` → **Release management** → **Déploiement automatique** (GitHub Actions)

## 🔄 **Workflow de Développement**

### **1. Développement de Fonctionnalités**
```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer et tester
npm run dev -- --host

# Commiter les changements
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

### **2. Test en Staging**
```bash
# Merger sur staging
git checkout staging
git merge feature/nouvelle-fonctionnalite

# Déployer en staging
./deploy-staging.sh

# Tester sur https://hatcast-staging.web.app
```

### **3. Release en Production**
```bash
# Utiliser le script de gestion des versions
./scripts/release-version.sh --dry-run   # Simuler le release
./scripts/release-version.sh             # Exécuter le release

# Le script gère le versioning et déclenche le déploiement automatique
# OU manuellement (non recommandé)
git checkout main
git merge staging
```

## 📦 **Gestion des Versions et Release**

### **🚀 Script de Release Management**

Le projet utilise un script automatisé pour gérer les versions et les releases en production :

> **⚠️ Important** : Le script ne fait **PAS** le déploiement technique. Il gère uniquement :
> - Versioning (incrémentation des versions)
> - Génération de changelog
> - Opérations Git (commits, merges, tags)
> - Déclenchement du déploiement via GitHub Actions

```bash
# Script principal de release management
./scripts/release-version.sh [OPTIONS]
```

### **📋 Options Disponibles**

#### **Types de Versioning (Sémantique)**
```bash
# Patch : Corrections de bugs, petites améliorations (1.2.3 → 1.2.4)
./scripts/release-version.sh --patch     # Par défaut
./scripts/release-version.sh             # Équivalent

# Minor : Nouvelles fonctionnalités compatibles (1.2.3 → 1.3.0)
./scripts/release-version.sh --minor

# Major : Breaking changes, refonte majeure (1.2.3 → 2.0.0)
./scripts/release-version.sh --major
```

#### **Mode Simulation**
```bash
# Dry-run : Voir exactement ce qui va être fait (recommandé)
./scripts/release-version.sh --dry-run --minor
./scripts/release-version.sh --dry-run --major

# Aide complète
./scripts/release-version.sh --help
```

### **🔍 Fonctionnalités Intelligentes**

#### **Détection des Hotfixes**
Le script détecte automatiquement les hotfixes faits directement en production :

```bash
⚠️  ATTENTION: 2 commit(s) sur main ne sont pas dans staging !

📋 Commits manquants dans staging:
abc123f fix: hotfix critique en production
def456g fix: correction urgente

💡 Cela peut indiquer des hotfixes faits directement en production.
   Il est recommandé de rebaser staging sur main avant de continuer.

Que voulez-vous faire ?
1) Rebaser staging sur main automatiquement (recommandé)
2) Continuer sans rebaser (risqué - peut écraser les hotfixes)
3) Arrêter le déploiement pour investigation manuelle
```

#### **Workflow Git Automatisé**
Le script gère automatiquement :
- ✅ **Validation** : Vérifie l'état de la branche et des commits
- ✅ **Versioning** : Incrémente la version selon le type choisi
- ✅ **Fichiers** : Met à jour `package.json` et `public/version.txt`
- ✅ **Changelog** : Génère `CHANGELOG.md` et `CHANGELOG_FR.md`
- ✅ **Git** : Commit, merge staging → main, création de tags
- ✅ **Déclenchement** : Push sur `main` → GitHub Actions déploie automatiquement

#### **Exemple de Dry-Run**
```bash
$ ./scripts/release-version.sh --dry-run --minor

🔍 DRY RUN - Simulation du release en production
==================================================
⚠️  Mode simulation : aucune modification ne sera effectuée
📋 Type de bump: minor
📡 Récupération des dernières versions...
✅ Staging est à jour avec main - aucun hotfix détecté
📋 Version actuelle: 1.0.0
📋 Nouvelle version: 1.1.0
📋 Hash: abc123f
📋 Date: 2025-09-04

📝 SIMULATION: Mise à jour de package.json
   └─ sed -i "s/\"version\": \"1.0.0\"/\"version\": \"1.1.0\"/" package.json
   └─ "version": "1.0.0" → "version": "1.1.0"

📝 SIMULATION: Création de version.txt
   └─ Contenu qui serait créé:
      1.1.0
      Production build - 2025-09-04
      Git: abc123f
      Build: 2025-09-04T14:30:00+0200

📝 SIMULATION: Commits qui seraient créés...
   └─ git commit -m "chore: bump version to 1.1.0 for production release"
   └─ git merge staging --no-ff -m "release: version 1.1.0"
   └─ git tag -a "v1.1.0"

🚀 SIMULATION: Déploiement qui serait déclenché...
   - Push sur main → GitHub Action détecte automatiquement
   - Build et déploiement automatique sur Firebase Hosting
   - URLs mises à jour: https://selections.la-malice.fr → v1.1.0

✅ DRY RUN TERMINÉ - Aucune modification effectuée
```

### **📈 Historique des Versions**

Le script génère automatiquement :

#### **Tags Git**
```bash
git tag -l
v1.0.0
v1.1.0
v1.2.0
v2.0.0
```

#### **Fichier version.txt**
```
1.2.0
Production build - 2025-09-04
Git: abc123f
Build: 2025-09-04T14:30:00+0200
```

#### **Commits Structurés**
```
chore: bump version to 1.2.0 for production release
release: version 1.2.0

Merge staging to main for production release
- Version: 1.2.0
- Build: 2025-09-04
- Hash: abc123f
```

### **🎯 Recommandations d'Usage**

#### **Choix du Type de Version**
- **🔧 --patch** : Corrections de bugs, optimisations, petites améliorations
- **✨ --minor** : Nouvelles fonctionnalités, améliorations UX majeures
- **💥 --major** : Refonte complète, breaking changes, nouvelle architecture

#### **Workflow Recommandé**
```bash
# 1. Toujours commencer par un dry-run
./scripts/release-version.sh --dry-run --minor

# 2. Vérifier les changements qui vont être faits
# 3. Si tout est correct, exécuter le release
./scripts/release-version.sh --minor

# 4. Le script déclenche automatiquement le déploiement via GitHub Actions
# 5. Vérifier le déploiement
# GitHub Actions: https://github.com/VOTRE_REPO/actions
# Production: https://selections.la-malice.fr
```

#### **Sécurité et Rollback**
- ✅ **Branches de sauvegarde** automatiques en cas de conflit
- ✅ **Validation à chaque étape** avec possibilité d'annulation
- ✅ **Tags Git** pour rollback facile vers une version antérieure
- ✅ **Dry-run obligatoire** pour les déploiements critiques

## 🛠️ **Responsabilités : Release vs Déploiement**

### **📦 Script `release-version.sh` (Release Management)**
**Responsabilités :**
- ✅ **Versioning** : Incrémentation automatique des versions
- ✅ **Changelog** : Génération de `CHANGELOG.md` et `CHANGELOG_FR.md`
- ✅ **Git Operations** : Commits, merges, tags
- ✅ **Validation** : Vérification des branches et hotfixes
- ✅ **Déclenchement** : Push sur `main` pour déclencher le déploiement

**Ne fait PAS :**
- ❌ Build de l'application
- ❌ Déploiement sur Firebase
- ❌ Configuration des environnements

### **🚀 GitHub Actions (Déploiement Technique)**
**Responsabilités :**
- ✅ **Build** : Compilation de l'application
- ✅ **Deploy** : Déploiement sur Firebase Hosting
- ✅ **Functions** : Déploiement des Cloud Functions
- ✅ **Rules** : Déploiement des règles Firestore et Storage
- ✅ **Environment** : Configuration spécifique à l'environnement

### **🔄 Workflows GitHub Actions**

#### **Déploiement Staging**
- **Déclencheur** : Push sur la branche `staging`
- ✅ Vérifie la branche `staging`
- 🔧 Déploie les Firebase Functions
- 🌐 Déploie l'application sur `hatcast-staging.web.app`
- 🗄️ Déploie les règles Firestore
- 📁 Déploie les règles Storage

#### **Déploiement Production**
- **Déclencheur** : Push sur la branche `main` (déclenché par le script de release)
- ✅ Vérifie la branche `main`
- 🔧 Déploie les Firebase Functions
- 🌐 Déploie l'application sur `selections.la-malice.fr`
- 🗄️ Déploie les règles Firestore
- 📁 Déploie les règles Storage

## 🔐 **Configuration des Secrets**

### **Firebase CLI**
```bash
# Configurer les credentials Ethereal Email
firebase functions:config:set ethereal.user="votre-email@ethereal.email"
firebase functions:config:set ethereal.pass="votre-mot-de-passe"

# Configurer Gmail (production)
firebase functions:config:set gmail.user="youruser@gmail.com"
firebase functions:config:set gmail.app_password="votre-app-password"
```

### **GitHub Actions**
- `FIREBASE_SERVICE_ACCOUNT_HATCAST` : Service account Firebase pour production
- `FIREBASE_SERVICE_ACCOUNT_STAGING` : Service account Firebase pour staging

## 🔑 **Configuration des Permissions IAM**

### **Permissions requises pour le déploiement**

Avant le premier déploiement, il faut accorder les bonnes permissions IAM aux service accounts :

```bash
# 1. Se connecter avec le compte propriétaire du projet
firebase login

# 2. Vérifier le projet actuel
firebase projects:list

# 3. Lister les service accounts existants
gcloud iam service-accounts list --project=VOTRE_PROJECT_ID

# 4. Accorder le rôle "Service Account User" au service account Firebase Admin SDK
gcloud projects add-iam-policy-binding VOTRE_PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk-fbsvc@VOTRE_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 5. Accorder le rôle "Cloud Functions Admin" au service account Firebase Admin SDK
gcloud projects add-iam-policy-binding VOTRE_PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk-fbsvc@VOTRE_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.admin"

# 6. Accorder le rôle "Firebase Extensions Admin" au service account Firebase Admin SDK
gcloud projects add-iam-policy-binding VOTRE_PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk-fbsvc@VOTRE_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebaseextensions.admin"

# 7. Accorder le rôle "Cloud Scheduler Admin" au service account Firebase Admin SDK
gcloud projects add-iam-policy-binding VOTRE_PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk-fbsvc@VOTRE_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudscheduler.admin"

# 8. Accorder le rôle "Firestore Rules Admin" au service account Firebase Admin SDK
gcloud projects add-iam-policy-binding VOTRE_PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk-fbsvc@VOTRE_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebaserules.admin"

# 9. Accorder le rôle "Firebase Storage Admin" au service account Firebase Admin SDK
gcloud projects add-iam-policy-binding VOTRE_PROJECT_ID \
  --member="serviceAccount:firebase-adminsdk-fbsvc@VOTRE_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firebasestorage.admin"

# 10. Vérifier que le service account GitHub Actions a les bonnes permissions
# (déjà configuré via le secret FIREBASE_SERVICE_ACCOUNT_HATCAST)
```

### **Rôles IAM nécessaires**

- **`roles/iam.serviceAccountUser`** : Permet aux service accounts d'agir au nom d'autres comptes
- **`roles/iam.serviceAccountTokenCreator`** : Permet de créer des tokens pour d'autres service accounts
- **`roles/cloudfunctions.admin`** : Permet l'administration complète des Cloud Functions
- **`roles/firebaseextensions.admin`** : Permet l'administration des Firebase Extensions (nécessaire pour le déploiement)
- **`roles/cloudscheduler.admin`** : Permet l'administration de Cloud Scheduler (nécessaire pour les fonctions planifiées)
- **`roles/firebaserules.admin`** : Permet l'administration des Firestore Rules (nécessaire pour le déploiement des règles)
- **`roles/firebasestorage.admin`** : Permet l'administration de Firebase Storage (nécessaire pour le déploiement des règles de stockage)
- **`roles/firebase.admin`** : Permet la gestion complète Firebase (déjà accordé par défaut)

### **Vérification des permissions**

```bash
# Vérifier les permissions d'un service account
gcloud projects get-iam-policy VOTRE_PROJECT_ID \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:firebase-adminsdk-fbsvc@VOTRE_PROJECT_ID.iam.gserviceaccount.com"
```c de 

### **⚠️ Ordre important des permissions**

Les permissions doivent être accordées dans cet ordre spécifique :
1. **`iam.serviceAccountUser`** : Permet l'utilisation des service accounts
2. **`iam.serviceAccountTokenCreator`** : Permet la création de tokens
3. **`cloudfunctions.admin`** : Permet l'administration complète des Cloud Functions
4. **`firebaseextensions.admin`** : Permet l'administration des Firebase Extensions
5. **`cloudscheduler.admin`** : Permet l'administration de Cloud Scheduler
6. **`firebaserules.admin`** : Permet l'administration des Firestore Rules
7. **`firebasestorage.admin`** : Permet l'administration de Firebase Storage

**Note** : 
- L'erreur `Missing permissions required for functions deploy. You must have permission iam.serviceAccounts.ActAs` indique qu'il manque le rôle `iam.serviceAccountUser` pour le service account `firebase-adminsdk-fbsvc@VOTRE_PROJECT_ID.iam.gserviceaccount.com`.
- L'erreur `HTTP Error: 403, The caller does not have permission` sur `firebaseextensions.googleapis.com` indique qu'il manque le rôle `firebaseextensions.admin`.
- L'erreur `HTTP Error: 403, The principal lacks IAM permission "cloudscheduler.jobs.update"` indique qu'il manque le rôle `cloudscheduler.admin`.
- L'erreur `HTTP Error: 403, The caller does not have permission` sur `firebaserules.googleapis.com` indique qu'il manque le rôle `firebaserules.admin`.
- L'erreur `HTTP Error: 403, Permission 'firebasestorage.defaultBucket.get' denied` indique qu'il manque le rôle `firebasestorage.admin`.

## 📧 **Configuration Email par Environnement**

### **Development & Staging**
- **Service** : Ethereal Email
- **Avantage** : Capture des emails pour inspection
- **Usage** : Test des fonctionnalités email

### **Production**
- **Service** : Gmail SMTP
- **Avantage** : Envoi réel aux utilisateurs
- **Usage** : Notifications de production

## 🧪 **Tests et Qualité**

### **Tests Locaux**
```bash
# Tests Playwright avec intercepteur local
npm run test

# Tests d'emails
npm run test:email
```

### **Tests en Staging**
- Déploiement automatique sur push `staging`
- Tests manuels sur `https://hatcast-staging.web.app`
- Validation des nouvelles fonctionnalités

### **Validation Production**
- Déploiement via script intelligent avec versioning
- Tests de régression sur `https://selections.la-malice.fr`
- Monitoring des performances

## 🚨 **Sécurité et Bonnes Pratiques**

### **Branches Protégées**
- `main` : Déploiement production uniquement
- `staging` : Tests et validation
- `feature/*` : Développement

### **Secrets et Configuration**
- ✅ Aucun secret dans le code
- ✅ Configuration via Firebase CLI
- ✅ Variables d'environnement sécurisées

### **Cutover V1 → V2 (story 11.3 — gate M4 La Malice)**

Variables **build-time Vite** injectées par [`.github/workflows/deploy-production.yml`](../../../.github/workflows/deploy-production.yml) lors du déploiement prod (`main`) :

| Variable | Secret / var GitHub | Comportement |
|----------|---------------------|--------------|
| `VITE_POSTHOG_PROJECT_API_KEY` | Secret `VITE_POSTHOG_PROJECT_API_KEY` | Même projet PostHog EU que V2 (OPS-9) ; vide = pas d’events cutover V1 |
| `VITE_V2_CUTOVER_MODAL_ENABLED` | Var `VITE_V2_CUTOVER_MODAL_ENABLED` | `true` uniquement quand le PO active le cutover ; défaut `false` |

**Recette avant prod :** ne pas activer le modal tant que la clé PostHog n’est pas configurée si l’attribution funnel est requise (voir [DEPLOY_V2_CLOUD_RUN.md §7.5](../../v2/technical/DEPLOY_V2_CLOUD_RUN.md)). Runbook funnel complet : même section.

**Staging :** laisser `VITE_V2_CUTOVER_MODAL_ENABLED` absent ou `false` (workflow staging n’injecte pas ces variables).

### **Validation des Déploiements**
- ✅ Tests automatisés avant déploiement
- ✅ Validation manuelle en staging
- ✅ Rollback possible en cas de problème

## 🔍 **Monitoring et Debugging**

### **Logs Firebase**
```bash
# Logs des fonctions
firebase functions:log

# Logs spécifiques
firebase functions:log --only functionName
```

### **Erreurs courantes de déploiement**

#### **Erreur d'authentification Firebase**
```
Error: Failed to authenticate... have you run firebase login?
```
**Solution** : Vérifier que le secret `FIREBASE_SERVICE_ACCOUNT_*` est valide et complet

#### **Erreur de permissions IAM**
```
Error: Missing permissions required for functions deploy. You must have permission iam.serviceAccountActAs
```
**Solution** : Exécuter les commandes de configuration IAM (voir section "Configuration des Permissions IAM")

#### **Erreur de parsing JSON**
```
SyntaxError: Bad control character in string literal in JSON at position X
```
**Solution** : Régénérer le service account Firebase et mettre à jour le secret GitHub

### **Base de Données**
- **Development** : `firebase firestore:use development`
- **Staging** : `firebase firestore:use staging`
- **Production** : `firebase firestore:use default`

### **Storage**
- **Development** : `development/` prefix
- **Staging** : `staging/` prefix
- **Production** : `production/` prefix

## 📚 **Ressources Utiles**

- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Playwright Testing](https://playwright.dev/)
- [Ethereal Email](https://ethereal.email/)

---

**🎯 Objectif** : Déploiement sécurisé et automatisé avec validation en staging avant production.
