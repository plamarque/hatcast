# 🔐 Configuration des Systèmes Admin et Super Admin HatCast

## 📚 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Différences Admin vs Super Admin](#différences-admin-vs-super-admin)
- [Configuration Super Admin](#configuration-super-admin)
- [Configuration Admin](#configuration-admin)
- [Migration vers Firebase Secrets](#migration-vers-firebase-secrets)
- [Maintenance](#maintenance)
- [Tests](#tests)
- [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

HatCast utilise deux niveaux de permissions pour protéger les fonctionnalités sensibles :

### **Super Admin** 🔴
- **Rôle** : Propriétaire du projet, contrôle total
- **Accès** : Menu Développement, gestion des rôles, administration de toutes les saisons
- **Configuration** : Via Firebase Secret `SUPERADMIN_EMAILS`
- **Fonctions protégées** : Tous les rôles d'administration + gestion des admins de saison

### **Admin** 🟠
- **Rôle** : Administrateur avec accès aux outils de développement
- **Accès** : Menu Développement (verrouillé par défaut), outils de debug
- **Configuration** : Via Firebase Secret `ADMIN_EMAILS`
- **Fonctions protégées** : Outils de développement, dump d'environnement, configuration

---

## 🔴 Configuration Super Admin

### **1. Définir les Super Admins via Firebase Secrets**

```bash
# Créer ou mettre à jour le secret SUPERADMIN_EMAILS
echo "email1@domain.com,email2@domain.com" | firebase functions:secrets:set SUPERADMIN_EMAILS

# Vérifier que le secret a été créé
firebase functions:secrets:access SUPERADMIN_EMAILS

# Déployer les fonctions pour appliquer les changements
firebase deploy --only functions
```

### **2. Format du secret**

```
superadmin1@example.com,superadmin2@example.com
```

**Important** : 
- Emails séparés par des **virgules sans espace**
- Pas de retour à la ligne
- Emails exactement comme configurés dans Firebase Auth

### **3. Fonctions Super Admin disponibles**

- **`checkSuperAdminStatus`** : Vérifier le statut Super Admin d'un utilisateur
- **`checkSeasonAdminStatus`** : Vérifier les permissions d'admin de saison
- **`grantSeasonAdmin`** : Accorder le rôle Admin de saison (Super Admin uniquement)
- **`revokeSeasonAdmin`** : Révoquer le rôle Admin de saison (Super Admin uniquement)
- **`listSeasonAdmins`** : Lister les admins d'une saison (Super Admin uniquement)

### **4. Interface utilisateur**

#### **Menu Développement**
Le menu Développement est visible pour les Super Admins dans **tous les environnements** (y compris production) :

```javascript
// AccountDropdown.vue
v-if="isSuperAdmin || isDevelopment"
```

**Logique d'affichage** :
- **En développement** : Visible pour tous (bypass pour faciliter le dev)
- **En production/staging** : Visible uniquement pour les Super Admins

#### **Administration des saisons**
Les Super Admins ont automatiquement accès à l'administration de **toutes les saisons** sans avoir besoin d'être explicitement ajoutés comme admin de saison.

---

## 🟠 Configuration Admin

### **1. Définir les Admins via Firebase Secrets**

```bash
# Créer ou mettre à jour le secret ADMIN_EMAILS
echo "admin@domain.com,autre-admin@domain.com" | firebase functions:secrets:set ADMIN_EMAILS

# Vérifier que le secret a été créé
firebase functions:secrets:access ADMIN_EMAILS

# Déployer les fonctions pour appliquer les changements
firebase deploy --only functions
```

### **2. Format du secret**

```
admin@votre-domaine.com,autre-admin@domain.com
```

### **3. Fonctions Admin disponibles**

- **`checkAdminStatus`** : Vérifier le statut admin d'un utilisateur
- **`dumpEnvironment`** : Dumper les informations d'environnement (admin uniquement)
- **`checkAdminConfig`** : Vérifier la configuration admin (admin uniquement)
- **`testAdminAccess`** : Test d'accès admin (admin uniquement)
- **`getLogLevel`** : Récupérer le niveau de log actuel
- **`setLogLevel`** : Modifier le niveau de log

### **4. Interface utilisateur**

#### **Menu Développement (avec verrouillage)**
Les Admins voient le menu Développement mais il est **verrouillé par défaut** :
- **Re-authentification requise** : Mot de passe demandé pour déverrouiller
- **Session temporaire** : Verrouillage automatique après 30 minutes
- **Protection renforcée** : Double niveau de sécurité

---

## 🔄 Migration vers Firebase Secrets

### **Pourquoi migrer ?**

⚠️ **DEPRECATION NOTICE** : L'API `functions.config()` sera supprimée en **mars 2026**.

### **Ancien système (déprécié)**

```bash
# ❌ NE PLUS UTILISER
firebase functions:config:set superadmin.emails="email@domain.com"
firebase functions:config:set admin.emails="email@domain.com"
```

### **Nouveau système (recommandé)**

```bash
# ✅ À UTILISER
echo "email@domain.com" | firebase functions:secrets:set SUPERADMIN_EMAILS
echo "email@domain.com" | firebase functions:secrets:set ADMIN_EMAILS
```

### **Avantages de Firebase Secrets**

- ✅ **Pérenne** : Supporté à long terme par Firebase
- ✅ **Sécurisé** : Intégration avec Google Secret Manager
- ✅ **Aucune trace** : Secrets non présents dans les fichiers de build
- ✅ **Permissions granulaires** : Contrôle d'accès par service account

### **Compatibilité**

Le code actuel possède un **fallback automatique** :
1. Essaie de lire depuis Firebase Secrets (`process.env.SUPERADMIN_EMAILS`)
2. Si non trouvé, fallback vers `functions.config().superadmin.emails`
3. Si toujours non trouvé, aucun admin autorisé (tableau vide)

```javascript
// Exemple dans roleService.js
let superAdminEmails = process.env.SUPERADMIN_EMAILS;

// Fallback to legacy functions.config() if secret not set
if (!superAdminEmails) {
  console.warn('⚠️ SUPERADMIN_EMAILS secret not found, trying legacy functions.config()');
  const config = functions.config();
  superAdminEmails = config.superadmin?.emails;
}
```

---

## 🔧 Maintenance

### **Ajouter un Super Admin**

```bash
# 1. Récupérer la liste actuelle
firebase functions:secrets:access SUPERADMIN_EMAILS

# 2. Ajouter le nouvel email (copier la liste existante + nouveau)
echo "email1@domain.com,email2@domain.com,nouveau@domain.com" | firebase functions:secrets:set SUPERADMIN_EMAILS

# 3. Déployer
firebase deploy --only functions
```

### **Retirer un Super Admin**

```bash
# 1. Récupérer la liste actuelle
firebase functions:secrets:access SUPERADMIN_EMAILS

# 2. Retirer l'email de la liste
echo "email1@domain.com,email2@domain.com" | firebase functions:secrets:set SUPERADMIN_EMAILS

# 3. Déployer
firebase deploy --only functions
```

### **Vérifier la configuration**

```bash
# Lister tous les secrets
firebase functions:secrets:list

# Voir le contenu d'un secret
firebase functions:secrets:access SUPERADMIN_EMAILS
firebase functions:secrets:access ADMIN_EMAILS

# Vérifier les permissions
gcloud secrets get-iam-policy SUPERADMIN_EMAILS --project=impro-selector
```

### **Environnements multiples**

Si vous avez plusieurs projets Firebase (production, staging, dev) :

```bash
# Production
firebase functions:secrets:set SUPERADMIN_EMAILS -P production

# Staging
firebase functions:secrets:set SUPERADMIN_EMAILS -P staging

# Développement local
# Utiliser .env.local (non commité) avec SUPERADMIN_EMAILS
```

---

## 🧪 Tests

### **Test Super Admin**

1. **Se connecter avec un compte Super Admin**
   - Menu Développement visible immédiatement
   - Accès à l'administration de toutes les saisons
   - Peut accorder/révoquer des rôles

2. **Se connecter avec un compte non-Super Admin**
   - Menu Développement invisible (en production)
   - Accès administration limité aux saisons autorisées

### **Test Admin**

1. **Se connecter avec un compte Admin**
   - Menu Développement visible mais verrouillé
   - Re-authentification demandée
   - Accès aux outils de debug après déverrouillage

2. **Test de session**
   - Déverrouiller la section
   - Attendre 30 minutes
   - Vérifier le verrouillage automatique

### **Logs des fonctions**

```bash
# Vérifier les logs Super Admin
firebase functions:log --only checkSuperAdminStatus

# Vérifier les logs Admin
firebase functions:log --only checkAdminStatus

# Logs en temps réel
firebase functions:log --only checkSuperAdminStatus --tail
```

---

## 🚨 Dépannage

### **Menu Développement invisible en production**

#### Symptômes
- Connecté avec un compte qui devrait être Super Admin
- Menu Développement n'apparaît pas
- Pas d'erreurs dans la console

#### Solutions

**1. Vérifier le secret SUPERADMIN_EMAILS**
```bash
firebase functions:secrets:access SUPERADMIN_EMAILS
```
- Le secret existe-t-il ?
- L'email est-il exactement le même que dans Firebase Auth ?
- Y a-t-il des espaces ou caractères invisibles ?

**2. Vérifier les logs de la Cloud Function**
```bash
firebase functions:log --only checkSuperAdminStatus
```
Cherchez :
```
🔐 Vérification Super Admin pour user@email.com: ❌ NON
```

**3. Vérifier le cache côté client**
- Déconnexion/reconnexion
- Vider le cache du navigateur
- Vérifier la console : `permissionService.invalidateAllCache()`

**4. Vérifier le déploiement**
```bash
# Redéployer les fonctions
firebase deploy --only functions

# Vérifier que le déploiement inclut les secrets
# Chercher dans les logs de déploiement :
# "ensuring access to secret SUPERADMIN_EMAILS"
```

### **Erreur "Secret not found"**

#### Symptômes
```
⚠️ SUPERADMIN_EMAILS secret not found, trying legacy functions.config()
⚠️ Configuration Super Admin non trouvée, aucun Super Admin autorisé
```

#### Solutions

**1. Créer le secret**
```bash
echo "votre-email@domain.com" | firebase functions:secrets:set SUPERADMIN_EMAILS
firebase deploy --only functions
```

**2. Vérifier les permissions**
```bash
# Le service account doit avoir accès au secret
gcloud secrets add-iam-policy-binding SUPERADMIN_EMAILS \
  --member="serviceAccount:YOUR-PROJECT@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=YOUR-PROJECT
```

### **Erreur "Admin required"**

#### Symptômes
- Fonctions protégées retournent 403 Forbidden
- Message : "Accès réservé aux Super Admins"

#### Solutions

**1. Vérifier l'email exact**
```bash
# Email dans Firebase Auth
firebase auth:export users.json
grep "votre-email" users.json

# Email dans le secret
firebase functions:secrets:access SUPERADMIN_EMAILS
```

**2. Vérifier le format**
- Pas d'espaces : `email1@domain.com,email2@domain.com` ✅
- Avec espaces : `email1@domain.com, email2@domain.com` ❌
- Retours à la ligne : ❌

### **Fallback ne fonctionne pas**

#### Symptômes
- Secret Firebase Secrets non trouvé
- Fallback vers `functions.config()` échoue aussi

#### Solutions

**1. Vérifier l'ancienne configuration**
```bash
firebase functions:config:get
```

**2. Migrer définitivement**
```bash
# Récupérer l'ancienne valeur
OLD_VALUE=$(firebase functions:config:get superadmin.emails)

# Créer le secret
echo "$OLD_VALUE" | firebase functions:secrets:set SUPERADMIN_EMAILS

# Déployer
firebase deploy --only functions
```

---

## 🛡️ Sécurité

### **Niveaux de protection**

1. **Frontend** : Menu/sections cachés si non autorisé
2. **Backend** : Vérification sur toutes les Cloud Functions
3. **Re-authentification** : Mot de passe requis pour déverrouiller (Admin)
4. **Session temporaire** : Verrouillage automatique après 30 minutes (Admin)
5. **Audit logs** : Traçabilité de tous les accès

### **Logs de sécurité**

```javascript
// Exemple de logs
🔐 Vérification Super Admin pour superadmin@example.com: ✅ OUI
🔐 Vérification Super Admin pour user@example.com: ❌ NON
✅ Accès Super Admin autorisé pour: superadmin@example.com
🚫 Tentative d'accès non autorisé: user@example.com
```

### **Bonnes pratiques**

- ✅ **Minimiser le nombre de Super Admins** : Seulement les propriétaires du projet
- ✅ **Utiliser Admin pour les développeurs** : Accès aux outils sans contrôle total
- ✅ **Auditer régulièrement** : Vérifier les logs d'accès
- ✅ **Révoquer immédiatement** : Retirer l'accès des personnes qui quittent l'équipe
- ✅ **Tester après modification** : Vérifier que les changements fonctionnent

---

## 📚 Références

### **Documentation Firebase**
- [Firebase Secrets Manager](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [Migration depuis functions.config()](https://firebase.google.com/docs/functions/config-env#migrate-to-dotenv)
- [Firebase Auth Re-authentication](https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user)
- [Firebase Functions Logs](https://firebase.google.com/docs/functions/monitoring)

### **Code source**
- `functions/roleService.js` : Gestion des Super Admins
- `functions/adminService.js` : Gestion des Admins
- `functions/roleFunctions.js` : Fonctions HTTP Super Admin
- `functions/adminFunctions.js` : Fonctions HTTP Admin
- `src/services/permissionService.js` : Vérification côté client
- `src/components/AccountDropdown.vue` : Affichage du menu Développement

---

## 📝 Historique des changements

### **2025-01-08 : Migration vers Firebase Secrets**
- ✅ Migration de `functions.config()` vers Firebase Secrets
- ✅ Ajout du secret `SUPERADMIN_EMAILS`
- ✅ Ajout du secret `ADMIN_EMAILS`
- ✅ Fallback automatique pour la compatibilité
- ✅ Documentation mise à jour

### **Avant : Système legacy**
- ❌ Utilisation de `functions.config()`
- ❌ API dépréciée (fin de vie mars 2026)

---

**🎯 Objectif** : Sécuriser l'accès aux fonctionnalités sensibles avec un système de permissions robuste, moderne et pérenne.
