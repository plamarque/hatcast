# 🔍 Guide de Diagnostic PWA - HatCast

## Problème : La bannière d'installation PWA ne s'affiche pas sur Chrome Mobile Android

### 📋 Critères d'éligibilité PWA (Chrome)

Pour qu'une PWA soit éligible à l'installation sur Chrome Mobile, elle doit satisfaire **TOUS** ces critères :

1. ✅ **HTTPS obligatoire** - Le site doit être servi en HTTPS
2. ✅ **Manifest valide** - Le fichier `manifest.webmanifest` doit être accessible et valide
3. ✅ **Service Worker** - Un service worker doit être enregistré et actif
4. ✅ **Icônes requises** - Au moins une icône 192x192 et une 512x512 avec `purpose: "any"`
5. ✅ **Display standalone** - Le manifest doit avoir `"display": "standalone"`
6. ✅ **Start URL** - Le manifest doit avoir une `start_url` valide
7. ✅ **Nom et description** - Le manifest doit avoir `name` et `short_name`

### 🛠️ Outils de Diagnostic

#### 1. Page de diagnostic intégrée
Visitez : `https://votre-domaine.com/pwa-debug.html`

Cette page vous permettra de :
- Vérifier tous les critères d'éligibilité
- Tester l'accessibilité du manifest
- Vérifier l'état du service worker
- Diagnostiquer les problèmes d'icônes

#### 2. Chrome DevTools (Desktop)
1. Ouvrez Chrome DevTools (F12)
2. Allez dans l'onglet **Application**
3. Vérifiez :
   - **Manifest** : Le manifest est-il chargé correctement ?
   - **Service Workers** : Y a-t-il un service worker actif ?
   - **Storage** : Les icônes sont-elles en cache ?

#### 3. Chrome Mobile - Menu de développement
1. Ouvrez Chrome Mobile
2. Allez sur `chrome://flags`
3. Activez **#enable-desktop-pwas** si disponible
4. Redémarrez Chrome

### 🔍 Vérifications spécifiques

#### Vérifier le manifest
```bash
curl -I https://votre-domaine.com/manifest.webmanifest
```

#### Vérifier les icônes
```bash
curl -I https://votre-domaine.com/icons/manifest-icon-192.maskable.png
curl -I https://votre-domaine.com/icons/manifest-icon-512.maskable.png
```

#### Vérifier le service worker
```bash
curl -I https://votre-domaine.com/sw.js
```

### 🚨 Problèmes courants et solutions

#### 1. Service Worker non enregistré
**Symptôme** : Pas de service worker dans DevTools
**Solution** : 
- Vérifier que le build Vite PWA fonctionne
- Vérifier les erreurs dans la console
- Redéployer l'application

#### 2. Icônes inaccessibles
**Symptôme** : Erreur 404 sur les icônes
**Solution** :
- Vérifier que les fichiers existent dans `/public/icons/`
- Vérifier les chemins dans le manifest
- Redéployer avec les icônes

#### 3. Manifest invalide
**Symptôme** : Erreur JSON dans le manifest
**Solution** :
- Valider le JSON du manifest
- Vérifier la syntaxe
- Corriger les erreurs

#### 4. HTTPS manquant
**Symptôme** : Site en HTTP
**Solution** :
- Configurer HTTPS sur le serveur
- Rediriger HTTP vers HTTPS

### 📱 Test sur Chrome Mobile

#### Méthode 1 : Menu Chrome
1. Ouvrez `https://votre-domaine.com` sur Chrome Mobile
2. Appuyez sur le menu (3 points)
3. Cherchez **"Ajouter à l'écran d'accueil"** ou **"Installer l'application"**

#### Méthode 2 : Bannière automatique
- La bannière devrait apparaître automatiquement après quelques visites
- Chrome peut prendre du temps à détecter l'éligibilité

#### Méthode 3 : Test manuel
1. Ouvrez Chrome DevTools (connectez votre mobile)
2. Allez dans **Application > Manifest**
3. Cliquez sur **"Add to homescreen"**

### 🔧 Debug avancé

#### Activer les logs PWA
Dans Chrome DevTools :
1. Onglet **Console**
2. Filtrez par **"PWA"** ou **"Manifest"**
3. Vérifiez les erreurs et warnings

#### Vérifier l'état du cache
```javascript
// Dans la console DevTools
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

#### Tester l'événement d'installation
```javascript
// Dans la console DevTools
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Événement beforeinstallprompt déclenché!', e);
});
```

### 📊 Métriques d'éligibilité

Utilisez Lighthouse pour vérifier votre score PWA :
1. Ouvrez Chrome DevTools
2. Onglet **Lighthouse**
3. Cochez **"Progressive Web App"**
4. Lancez l'audit

### 🆘 Si rien ne fonctionne

1. **Vérifiez les logs** : Console DevTools, Network tab
2. **Testez sur un autre appareil** : Différents modèles Android
3. **Vérifiez la version Chrome** : Mettez à jour si nécessaire
4. **Testez en navigation privée** : Évitez les caches
5. **Contactez le support** : Avec les logs d'erreur

### 📞 Support

Si vous avez besoin d'aide supplémentaire :
1. Collectez les logs d'erreur
2. Prenez des captures d'écran de DevTools
3. Testez sur la page de diagnostic
4. Fournissez les informations de votre appareil (modèle, version Android, version Chrome)

---

**Note** : Chrome peut prendre jusqu'à 24h pour détecter l'éligibilité PWA d'un site. Si tout semble correct, attendez et testez régulièrement.
