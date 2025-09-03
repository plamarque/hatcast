# 🚀 Guide de Déploiement Multi-Environnement HatCast

## 🌍 **Environnements Disponibles**

### **🏠 Development (Local)**
- **URL** : `https://votre-ip-locale:5173`
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
- `FIREBASE_SERVICE_ACCOUNT_HATCAST` : Service account Firebase
- `FIREBASE_TOKEN` : Token Firebase CLI

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
- Tests de régression
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
