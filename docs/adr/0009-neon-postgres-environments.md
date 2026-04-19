# ADR-0009: PostgreSQL managé — Neon et branches par environnement (V2)

- **Status:** Accepted
- **Context:** La V2 persiste dans **PostgreSQL** depuis **Google Cloud Run**. Il faut un fournisseur managé économique, des **données isolées** par environnement (development, staging, production) et une **CI** qui injecte les bonnes chaînes de connexion sans les committer. **Cloud SQL** sur GCP est une option mais n’est pas imposée pour réduire coût et complexité réseau.
- **Decision:**
  1. **Fournisseur:** Utiliser **Neon** comme Postgres managé pour la V2.
  2. **Modèle de données:** Un **projet Neon** avec **trois branches** alignées sur les cibles de déploiement : une branche **primary** (production), une branche **staging**, une branche **development** (ou `dev`) — noms exacts à figer dans l’équipe et dans la console Neon.
  3. **Connexion:** Chaque branche expose sa propre **chaîne JDBC** (hôte, utilisateur, mot de passe) ; TLS requis (`sslmode=require` ou équivalent dans l’URL JDBC).
  4. **CI/CD:** Les secrets **`HATCAST_DATASOURCE_*`** et **`HATCAST_CORS_ALLOWED_ORIGINS`** sont stockés par **environnement GitHub** (`development`, `staging`, `production`) et reliés aux branches git **`v2`**, **`staging`**, **`main`** respectivement (voir [`docs/technical/DEPLOY_V2_CLOUD_RUN.md`](../technical/DEPLOY_V2_CLOUD_RUN.md)).
  5. **Pas de Cloud SQL** pour la couche données V2 tant que cette ADR s’applique : pas de connecteur Unix socket ni rôle **Cloud SQL Client** requis sur le compte d’exécution Cloud Run pour cette base.
- **Consequences:**
  - **Positive:** Coût et opérations simplifiés ; branches Neon pour cloner / diverger les données entre env ; alignement clair git ↔ Neon ↔ Cloud Run.
  - **Negative:** Dépendance Internet public (TLS) vers Neon ; si allowlist IP est activée côté Neon, Cloud Run sans IP fixe peut compliquer l’accès.
  - **Operational:** Trois URL Cloud Run et trois origines OAuth à maintenir ; trois jeux de secrets à provisionner.
- **Alternatives considered:**
  - **Cloud SQL + connecteur:** Rejeté comme défaut pour la V2 pour coût / complexité ; peut être réévalué si exigences réseau privé strictes.
  - **Un seul Neon sans branches:** Rejeté — mélange des données entre env ; contraire aux objectifs de parity et de sécurité.
