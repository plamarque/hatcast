# ADR-0009: PostgreSQL managé — Neon et branches par environnement (V2)

- **Status:** Accepted
- **Context:** La V2 persiste dans **PostgreSQL** depuis **Google Cloud Run**. Il faut un fournisseur managé économique, des **données isolées** par environnement (development, staging, production) et une **CI** qui injecte les bonnes chaînes de connexion sans les committer. **Cloud SQL** sur GCP est une option mais n’est pas imposée pour réduire coût et complexité réseau.
- **Decision:**
  1. **Fournisseur:** Utiliser **Neon** comme Postgres managé pour la V2.
  2. **Modèle de données:** Un **projet Neon** avec **quatre branches** nommées dans la console :
     - **`primary`** (ou équivalent) — production V2 (`production-v2` → Cloud Run prod).
     - **`staging`** — recette V2 (`staging-v2` → Cloud Run staging).
     - **`development`** — déploiement cloud **dev** uniquement (`v2` → `hatcast-v2-dev`, secrets GitHub environnement `development`).
     - **`local`** — développement **sur poste** (`./scripts/start-dev.sh`, profil Spring `dev`, Flyway `db/migration` + `db/seed` + `db/seed-postgresql`) ; **jamais** injectée dans Cloud Run.
  3. **Connexion:** Chaque branche expose sa propre **chaîne JDBC** (hôte, utilisateur, mot de passe) ; TLS requis (`sslmode=require` ou équivalent dans l’URL JDBC).
  4. **CI/CD:** Les secrets **`HATCAST_DATASOURCE_*`** et **`HATCAST_CORS_ALLOWED_ORIGINS`** sont stockés par **environnement GitHub** (`development`, `staging`, `production`) et reliés aux branches git **`v2`**, **`staging-v2`**, **`production-v2`** respectivement. Le fichier **`.env` local** pointe vers la branche Neon **`local`** (pas `development`).
  5. **Pas de Cloud SQL** pour la couche données V2 tant que cette ADR s’applique : pas de connecteur Unix socket ni rôle **Cloud SQL Client** requis sur le compte d’exécution Cloud Run pour cette base.
- **Consequences:**
  - **Positive:** Coût et opérations simplifiés ; branches Neon pour cloner / diverger les données entre env ; alignement clair git ↔ Neon ↔ Cloud Run ; **isolation Flyway** entre seeds locaux (profil `dev` sur branche `local`) et runtime cloud (profil `cloud` sur branche `development`, sans `db/seed` — ADR-0014).
  - **Negative:** Dépendance Internet public (TLS) vers Neon ; si allowlist IP est activée côté Neon, Cloud Run sans IP fixe peut compliquer l’accès ; une branche Neon supplémentaire à provisionner.
  - **Operational:** Trois URL Cloud Run et trois origines OAuth à maintenir ; trois jeux de secrets CI pour les déploiements ; **un quatrième** jeu de credentials JDBC dans `.env` (branche `local`, hors Git).
- **Alternatives considered:**
  - **Cloud SQL + connecteur:** Rejeté comme défaut pour la V2 pour coût / complexité ; peut être réévalué si exigences réseau privé strictes.
  - **Un seul Neon sans branches:** Rejeté — mélange des données entre env ; contraire aux objectifs de parity et de sécurité.
  - **Une seule branche Neon `development` pour local + cloud dev:** Rejeté (2026-05-28) — profils Flyway `dev` (seeds Les Improbots) vs `cloud` (schéma seul) sur la même base provoquent validation Flyway en boucle sur Cloud Run et empêchent resets seed locaux sans impacter `hatcast-v2-dev`.
