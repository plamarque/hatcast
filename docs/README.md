# Documentation HatCast

Ce dossier complète les **docs normatives à la racine du dépôt** : [AGENTS.md](../AGENTS.md), [SPEC.md](../SPEC.md), [DOMAIN.md](../DOMAIN.md), [ARCH.md](../ARCH.md), [PLAN.md](../PLAN.md), [DEVELOPMENT.md](../DEVELOPMENT.md).

## Carte par version

| Zone | Rôle |
|------|------|
| **[`v1/`](v1/README.md)** | Client **legacy** (Vue + Firebase, `legacy/`) : **référence et compréhension** ; ne décrit **pas** la V2. |
| **[`v2/`](v2/README.md)** | Stack **cible** (Angular, Spring, Neon, Cloud Run) : guides opérationnels pour `apps/web/` et `services/api/`. |
| **[`shared/`](shared/README.md)** | Monorepo, branches, conventions de commits — **transverse** au dépôt. |
| **[`adr/`](adr/README.md)** | Architecture Decision Records (décisions V1 Firebase vs V2 : voir l’index). |
| **[`meta/`](meta/)** | Méta (ex. rapport de cohérence normative, backlog produit historique). |

## Docs V2 (entrée rapide)

- [Index V2](v2/README.md)
- [Déploiement Cloud Run](v2/technical/DEPLOY_V2_CLOUD_RUN.md)
- [OAuth Google (opérateurs)](v2/technical/V2_GOOGLE_OAUTH_SETUP.md)

## Docs V1 — référence uniquement (entrée rapide)

- [Index V1](v1/README.md)
- [Documentation technique legacy](v1/technical/README.md)
- [Documentation utilisateur (UI legacy)](v1/user/README.md)

## Partagé (monorepo)

- [MONOREPO](shared/technical/MONOREPO.md) — structure `legacy/` / `apps/web/` / `services/api/`
- [Branches et environnements](shared/technical/BRANCH_ENVIRONMENTS.md)
- [Messages de commit](shared/technical/COMMIT_MESSAGE_GUIDELINES.md)

## Comment contribuer

1. **Nouveau guide V2** : placer sous `v2/technical/` (ou sous-domaine cohérent) et lier depuis `v2/README.md`.
2. **Documentation du comportement legacy** : placer sous `v1/technical/` ou `v1/user/`.
3. **Décision d’architecture** : ajouter un ADR dans `adr/` et une ligne dans `adr/README.md`.
4. **Langue** : le français est préféré pour la documentation orientée équipe produit ; l’anglais reste acceptable pour les ADR et conventions alignées sur AGENTS.md.

## Structure du dossier `docs/`

```
docs/
├── README.md          # Ce fichier
├── v1/                # Legacy Firebase / Vue (référence)
├── v2/                # Angular + API + Neon + Cloud Run
├── shared/            # Monorepo, branches, commits
├── adr/               # Décisions d’architecture
└── meta/              # Rapports et listes non normatives
```
