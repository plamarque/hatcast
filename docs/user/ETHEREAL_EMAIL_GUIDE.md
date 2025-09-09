# 📬 Guide d'Utilisation d'Ethereal Email

## 🎯 **Qu'est-ce qu'Ethereal Email ?**

Ethereal Email est un service gratuit qui **capture et stocke** les emails envoyés par votre application au lieu de les envoyer aux vrais destinataires. C'est parfait pour le développement et les tests !

## 🌍 **Quand est-ce utilisé ?**

- **🏠 Development (Local)** : `https://votre-ip-locale:5173`
- **🌐 Staging** : `https://votre-projet-staging.web.app`
- **❌ Production** : Les vrais emails sont envoyés via Gmail

## 🔑 **Comment se connecter ?**

### **1. Aller sur Ethereal Email**
- Cliquez sur le bouton **"🌐 Ouvrir Ethereal"** dans le debug
- Ou allez directement sur [https://ethereal.email](https://ethereal.email)

### **2. Se connecter avec vos credentials**
- **Email** : Votre compte Ethereal (ex: `votre-email@ethereal.email`)
- **Mot de passe** : Votre mot de passe Ethereal

### **3. Voir vos emails capturés**
- Tous les emails envoyés par votre app apparaissent dans la liste
- Cliquez sur un email pour le lire
- Vous pouvez cliquer sur les liens (magic links, etc.)

## 📧 **Types d'emails capturés**

### **🔐 Authentification**
- **Mot de passe oublié** : Magic links de réinitialisation
- **Confirmation d'email** : Liens de vérification
- **Changement d'email** : Liens de confirmation

### **🎭 Notifications HatCast**
- **Disponibilité** : Quand quelqu'un se déclare disponible
- **Sélection** : Quand quelqu'un est compositionné pour un spectacle
- **Rappels** : Notifications automatiques

## 🧪 **Comment tester ?**

### **1. Envoyer un email de test**
- Ouvrez le menu compte → Développement
- Cliquez sur **"📧 Tester emails"**
- L'email sera capturé par Ethereal

### **2. Voir l'email capturé**
- Allez sur [https://ethereal.email](https://ethereal.email)
- Connectez-vous
- L'email de test apparaîtra dans la liste

### **3. Tester les liens**
- Cliquez sur l'email pour le lire
- Cliquez sur les liens (magic links, etc.)
- Vérifiez que la navigation fonctionne

## 🔍 **Avantages d'Ethereal Email**

### **✅ Pour le développement**
- **Pas de spam** : Aucun email réel n'est envoyé
- **Tests complets** : Vous pouvez tester tous les scénarios
- **Magic links** : Testez l'authentification complète
- **Inspection** : Voir exactement ce qui est envoyé

### **✅ Pour le staging**
- **Validation** : Tester avant production
- **Équipe** : Tous les développeurs peuvent voir les emails
- **Sécurité** : Pas de risque d'envoyer des emails de test aux vrais utilisateurs

## 🚨 **Limitations**

- **Stockage temporaire** : Les emails ne sont pas gardés indéfiniment
- **Un seul compte** : Tous les emails arrivent au même endroit
- **Pas de pièces jointes** : Seuls les emails texte/HTML sont capturés

## 💡 **Bonnes pratiques**

### **🧹 Nettoyage régulier**
- Vérifiez régulièrement vos emails capturés
- Supprimez les anciens tests

### **🔍 Tests complets**
- Testez tous les types d'emails
- Vérifiez les liens et la navigation
- Testez sur mobile et desktop

### **📝 Documentation**
- Notez les problèmes rencontrés
- Documentez les cas de test

## 🆘 **Problèmes courants**

### **❌ Pas d'emails visibles**
- Vérifiez que vous êtes sur le bon environnement (dev/staging)
- Vérifiez vos credentials Ethereal
- Vérifiez que l'email a bien été envoyé

### **❌ Liens qui ne marchent pas**
- Vérifiez que l'URL de base est correcte
- Testez en local d'abord
- Vérifiez les logs de l'application

### **❌ Configuration incorrecte**
- Vérifiez les variables d'environnement
- Vérifiez la configuration Firebase
- Redéployez les fonctions si nécessaire

## 🔗 **Liens utiles**

- **Interface Ethereal** : [https://ethereal.email](https://ethereal.email)
- **Documentation** : [https://ethereal.email/create](https://ethereal.email/create)
- **Support** : Via l'interface Ethereal

---

**🎯 Objectif** : Tester complètement les fonctionnalités email sans spammer les utilisateurs !
