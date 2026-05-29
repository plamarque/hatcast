# Dev — tester le sélecteur troupe · saison (story 17.23)

Données : migration seed `V30__seed_context_switcher_dev.sql` (profil **dev** uniquement, pas cloud).

## Prérequis

1. Redémarrer l’API après pull (Flyway applique **V30**), ou reset branche Neon **`local`** puis `./scripts/start-dev.sh`.
2. Compte avec adhésion **Les Improbots** (seed dev ou `POST /v1/troupes/a0000001-0000-4000-8000-000000000001/memberships/me`).

## Connexion recommandée

| Champ | Valeur |
|--------|--------|
| Email seed | `patrice@seed.improbots.test` |
| Troupe 1 | **Les Improbots** (`/troupes/les-improbots`) |
| Troupe 2 | **Les Zinzins** (`/troupes/les-zinzins`) |

Si vous vous connectez avec un **autre** Google, rejoignez d’abord Les Improbots : le seed V30 vous ajoute automatiquement **Les Zinzins**.

## Saisons seed (non archivées)

| Troupe | Slug workspace | Titre |
|--------|----------------|--------|
| Les Improbots | `/saison/les-improbots-2026-2027` | Les Improbots 2026-2027 |
| Les Improbots | `/saison/aperock-2026` | Apérock 2026 |
| Les Zinzins | `/saison/festibask-2025-26` | Festibask 2025-26 |

## Où voir le sélecteur ▾

- Desktop : fil d’Ariane sur `/saison/:slug` ou fiche spectacle.
- Mobile (≤480px) : à côté du logo troupe dans le header.

Le bouton n’apparaît que si **au moins deux troupes** ou **au moins deux saisons** actives sur la troupe courante.
