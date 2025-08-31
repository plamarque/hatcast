# 🔐 Configuration du Système Admin HatCast

## 🎯 **Vue d'ensemble**

Le système admin de HatCast protège les fonctionnalités sensibles (outils de développement, dump d'environnement) en utilisant :

- **Firebase Secrets** pour la liste des admins
- **Re-authentification** pour déverrouiller la section
- **Session temporaire** (30 minutes) après déverrouillage
- **Protection côté serveur** sur toutes les fonctions sensibles

## 🚀 **Configuration initiale**

### **1. Définir les admins via Firebase Secrets**

```bash
# Configuration des emails admin (séparés par des virgules)
firebase functions:config:set admin.emails="admin@votre-domaine.com,autre-admin@email.com"

# Vérifier la configuration
firebase functions:config:get

# Déployer les fonctions
firebase deploy --only functions
```

### **2. Structure de la configuration**

```json
{
  "admin": {
    "emails": "admin@votre-domaine.com,autre-admin@email.com"
  }
}
```

## 🔒 **Fonctions protégées**

### **Fonctions admin disponibles :**

- **`checkAdminStatus`** : Vérifier le statut admin d'un utilisateur
- **`dumpEnvironment`** : Dumper les informations d'environnement (admin uniquement)
- **`checkAdminConfig`** : Vérifier la configuration admin (admin uniquement)
- **`testAdminAccess`** : Test d'accès admin (admin uniquement)

### **Protection automatique :**

Toutes les fonctions sensibles vérifient automatiquement :
1. **Authentification** : Utilisateur connecté
2. **Permissions admin** : Email dans la liste des admins
3. **Logs de sécurité** : Traçabilité des accès

## 🛡️ **Sécurité**

### **Niveaux de protection :**

1. **Frontend** : Section cachée si non-admin
2. **Backend** : Vérification admin sur toutes les fonctions
3. **Re-authentification** : Mot de passe requis pour déverrouiller
4. **Session temporaire** : Verrouillage automatique après 30 minutes

### **Logs de sécurité :**

```javascript
// Exemple de logs
🔐 Vérification admin pour admin@votre-domaine.com: ✅ OUI
✅ Accès admin autorisé pour: admin@votre-domaine.com
🚫 Tentative d'accès non autorisé: user@example.com
```

## 🔧 **Maintenance**

### **Ajouter un admin :**

```bash
# Récupérer la configuration actuelle
firebase functions:config:get admin.emails

# Ajouter un nouvel admin
firebase functions:config:set admin.emails="admin@votre-domaine.com,autre-admin@email.com,nouvel-admin@email.com"

# Déployer
firebase deploy --only functions
```

### **Retirer un admin :**

```bash
# Retirer un admin
firebase functions:config:set admin.emails="patrice.lamarque@gmail.com,autre-admin@email.com"

# Déployer
firebase deploy --only functions
```

### **Vérifier la configuration :**

```bash
# Voir la configuration actuelle
firebase functions:config:get

# Tester l'accès admin
# Utiliser la fonction checkAdminConfig depuis l'interface
```

## 🧪 **Tests**

### **Test de sécurité :**

1. **Se connecter avec un compte non-admin**
   - Section développement invisible
   - Fonctions admin rejetées

2. **Se connecter avec un compte admin**
   - Section développement visible
   - Section verrouillée par défaut
   - Déverrouillage avec mot de passe

3. **Test de session**
   - Déverrouiller la section
   - Attendre 30 minutes
   - Vérifier le verrouillage automatique

### **Test des fonctions :**

```bash
# Vérifier les logs des fonctions
firebase functions:log --only checkAdminStatus
firebase functions:log --only dumpEnvironment
```

## 🚨 **Dépannage**

### **Problèmes courants :**

#### **❌ Section développement invisible**
- Vérifier que l'utilisateur est dans la liste des admins
- Vérifier la configuration Firebase : `firebase functions:config:get`
- Vérifier les logs : `firebase functions:log --only checkAdminStatus`

#### **❌ Erreur "Admin required"**
- Vérifier que l'email est exactement le même
- Vérifier la configuration admin
- Redéployer les fonctions si nécessaire

#### **❌ Re-authentification échoue**
- Vérifier que le mot de passe est correct
- Vérifier que l'utilisateur est bien connecté
- Vérifier les logs Firebase Auth

### **Vérifications de sécurité :**

1. **Configuration admin** : `firebase functions:config:get`
2. **Logs des fonctions** : `firebase functions:log`
3. **Statut utilisateur** : Interface de debug admin
4. **Permissions Firestore** : Vérifier les règles

## 📚 **Références**

- [Firebase Functions Config](https://firebase.google.com/docs/functions/config)
- [Firebase Auth Re-authentication](https://firebase.google.com/docs/auth/web/manage-users#re-authenticate_a_user)
- [Firebase Functions Logs](https://firebase.google.com/docs/functions/monitoring)

---

**🎯 Objectif** : Sécuriser l'accès aux fonctionnalités sensibles tout en gardant la flexibilité pour les administrateurs.
