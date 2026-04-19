# 🎭 HatCast

Une application web simple pour organiser et gérer vos spectacles d'improvisation avec HatCast.  
Basée sur Vue 3, Firebase et TailwindCSS.

## ✨ Fonctionnalités

- Gestion des événements et des joueurs
- Indication des disponibilités par joueur
- Sélection automatique équitable et pondérée (selon les participations passées)
- Sauvegarde dans Firebase (Firestore)
- Interface responsive avec TailwindCSS
- **Audit trail complet** : Traçabilité de toutes les actions utilisateur ([voir documentation](docs/v1/technical/AUDIT.md))

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

⚠️ **IMPORTANT** : Remplacez toutes les valeurs sensibles (emails, URLs, IPs) par vos propres données dans la configuration.

3. Installez les dépendances :
   ```bash
   npm install
   ```

4. Démarrez le serveur local :
   ```bash
   npm run dev
   ```
   Pour tester depuis une autre machine ou un téléphone sur le réseau (ex. https://192.168.x.x:5173/) :
   ```bash
   npm run dev -- --host
   ```

## 🛠️ Tech stack

- [Vue 3 + Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase (Firestore + Auth)](https://firebase.google.com)

## 📦 Déploiement

Le déploiement est géré par **Firebase Hosting** et les **GitHub Actions** (branches `staging` et `main`). La CI fait un build Vite puis `firebase deploy`. Voir [DEVELOPMENT.md](DEVELOPMENT.md) et `.github/workflows/`.

## 📁 Structure (monorepo)

- **`legacy/`** — Client **V1** (Vue 3 + Vite + PWA). Build → `legacy/dist` (Firebase Hosting actuel). Voir [docs/shared/technical/MONOREPO.md](docs/shared/technical/MONOREPO.md).
- **`apps/web/`** — Client **V2** (cible Angular) — scaffold à venir.
- **`services/api/`** — API **V2** (cible Spring Boot) — scaffold à venir.
- **`functions/`** — Cloud Functions Firebase (ligne actuelle).

```
legacy/
  src/                 # App Vue (main.js, components/, views/, services/)
  public/              # Assets statiques servis à la racine du site
  vite.config.js
functions/
  index.js             # Cloud Functions (auth, audit, mail, push, admin)
scripts/
  replay-season.js     # Replay algorithmes (CLI)
```

## 📄 Docs pour agents et mainteneurs

- [docs/README.md](docs/README.md) — Carte de la documentation (V1 référence vs V2, partagé, ADR).
- [AGENTS.md](AGENTS.md) — Règles pour les agents IA (sources de vérité, spec vs plan, qualité).
- [SPEC.md](SPEC.md) — Spécification fonctionnelle (vision, acteurs, parcours, critères).
- [DOMAIN.md](DOMAIN.md) — Modèle de domaine et glossaire.
- [ARCH.md](ARCH.md) — Architecture (composants, déploiement, config, tests).
- [PLAN.md](PLAN.md) — Plan de livraison et slices.
- [DEVELOPMENT.md](DEVELOPMENT.md) — Run local, tests, build, déploiement.

---

### License

The code is licensed under the [MIT License](./LICENSE).  
Visual elements and written content (e.g., emojis, headers) are licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/). 
