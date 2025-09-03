# 🚀 Guide de Déploiement Multi-Environnement HatCast

## 🌍 **Environnements Disponibles**

### **🏠 Development (Local)**
- **URL** : `https://localhost:5173` (avec `npm run dev -- --host`)
- **Base Firestore** : `development` (région `europe-west3`)
- **Storage** : `development/` prefix
- **Email** : Ethereal Email (capture)
- **Tests** : Intercepteur local (fichiers JSON)

### **🌐 Staging**
- **URL** : `https://votre-projet-staging.web.app`
- **Base Firestore** : `staging` (région `us-central1`)
- **Storage** : `staging/` prefix
- **Email** : Ethereal Email (capture)
- **Déploiement** : Automatique sur push `staging`

### **🚀 Production**
- **URL** : `https://votre-projet-production.web.app`
- **Base Firestore** : `default` (région `us-central1`)
- **Storage** : `production/` prefix
- **Email** : Gmail (envoi réel)

### **🔄 Workflow Simplifié**
1. **Développement** : Branches `feature/*` → Tests locaux
2. **Staging** : Merge `feature/*` → `staging` → Déploiement automatique
3. **Production** : Merge `staging` → `main` → Déploiement automatique
- **Déploiement** : Automatique sur push `main`

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

# Tester sur https://votre-projet-staging.web.app
```

### **3. Déploiement en Production**
```bash
# Merger staging → main
git checkout main
git merge staging

# Déploiement automatique sur push main
# Vérifier sur https://votre-projet-production.web.app
```

## 🛠️ **Workflows GitHub Actions**

### **Déploiement Staging**
- **Déclencheur** : Push sur la branche `staging`
- ✅ Vérifie la branche `staging`
- 🔧 Déploie les Firebase Functions
- 🌐 Déploie l'application sur `votre-projet-staging.web.app`
- 🗄️ Déploie les règles Firestore
- 📁 Déploie les règles Storage

### **Déploiement Production**
- **Déclencheur** : Push sur la branche `main`
- ✅ Vérifie la branche `main`
- 🔧 Déploie les Firebase Functions
- 🌐 Déploie l'application sur `votre-projet-production.web.app`
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
- Tests manuels sur `votre-projet-staging.web.app`
- Validation des nouvelles fonctionnalités

### **Validation Production**
- Déploiement automatique sur push `main`
- Tests de régression sur `impro-selector.web.app`
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
