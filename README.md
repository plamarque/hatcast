# HatCast

Application de gestion de sélections pour spectacles.

## Test de déploiement

Test du nouveau workflow GitHub Pages - $(date)

## ✨ Fonctionnalités

- Gestion des événements et des joueurs
- Indication des disponibilités par joueur
- Sélection automatique équitable et pondérée (selon les participations passées)
- Sauvegarde dans Firebase (Firestore)
- Interface responsive avec TailwindCSS

## 🚀 Installation

1. Clonez le repo :
   ```bash
   git clone https://github.com/plamarque/hatcast.git
   cd hatcast
   ```

2. Copiez le fichier `.env.example` en `.env.local` et remplissez avec vos clés Firebase :
   ```bash
   cp .env.example .env.local
   ```

3. Installez les dépendances :
   ```bash
   npm install
   ```

4. Démarrez le serveur local :
   ```bash
   npm run dev
   ```

## 🛠️ Tech stack

- [Vue 3 + Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase (Firestore + Auth)](https://firebase.google.com)

## 📦 Déploiement

Déployable sur [Netlify](https://netlify.com), [Vercel](https://vercel.com) ou tout autre service supportant un projet Vite.

## 📁 Structure

```
src/
  components/     # (à venir)
  services/
    firebase.js   # Connexion Firebase
    storage.js    # Accès Firestore abstrait
  views/
    Grille.vue    # Vue principale
```


### License

The code is licensed under the [MIT License](./LICENSE).  
Visual elements and written content (e.g., emojis, headers) are licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).