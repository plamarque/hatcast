# UX backlog — `EventFormDialog` (création / édition spectacle)

**Capturé :** 2026-05-25 (retours PO après usage modale « Modifier le spectacle »)  
**Composant :** [`event-form-dialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts)  
**Résolu (plan) :** 2026-05-25 — [sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](sprint-change-proposal-2026-05-25-epic17-event-form-ux.md) : **17.8** amendée (tag → Infos) ; **17.12–17.15** pour le reste.

---

## Synthèse produit (vision cible)

La modale **Modifier / Nouveau spectacle** ne devrait porter que le **noyau planning** : titre, date/heure, lieu, description (+ tag d’équité quand **17.8**). Le reste vit sur l’**onglet Infos** du détail spectacle, avec **entrées visibles** et **sous-modales dédiées** (type, rôles, organisateur·ices). Les **participants spectacle** ne passent plus par cette modale (menu admin dédié déjà en place).

---

## Remarques détaillées

| # | Problème observé | Proposition | Priorité | Stories / epics touchés |
|---|------------------|-------------|----------|-------------------------|
| 1 | Champ **Identifiant URL** visible et éditable | Slug auto, pas de saisie UI | **→ Story 17.12** | 17.6 doc amendée via SCP |
| 2 | **Date/heure** `datetime-local` | MatDatepicker + heure/minute | **→ Story 17.13** | — |
| 3 | **Type + rôles** dans la modale | Infos + modales dédiées | **→ Story 17.14** | — |
| 4 | **Organisateur·ices** dans la modale | Infos + modale | **→ Story 17.15** (partie orgas) | — |
| 5 | **Participants** dans la modale | Retrait ; menu admin | **→ Story 17.15** (partie participants) | 3.8 AC11 révisée |
| — | **Tag d’équité** (initialement modale) | **Onglet Infos** | **→ Story 17.8** (amendée) | SCP 2026-05-25 |

---

## Triage d’exécution (figé 2026-05-25)

| Story | Périmètre |
|-------|-----------|
| **17.8** | Tag équité — onglet Infos uniquement |
| **17.12** | Slug sans champ formulaire |
| **17.13** | Date/heure Material dans modale |
| **17.14** | Type + rôles → Infos + modales |
| **17.15** | Organisateurs → Infos ; retirer participants de modale |

**Ordre suggéré :** 17.8 → 17.9 → 17.10 → 17.12–17.15 (P2, parallélisables entre elles).

---

## Alignements existants (code)

| Élément | État actuel |
|---------|-------------|
| Slug spectacle | Champ éditable « Identifiant URL » (story **17.6**) |
| Date/heure | `type="datetime-local"` |
| Type + rôles | Dans la modale (3.4) |
| Organisateurs | Modale edit + actions `event-detail` |
| Participants | Modale edit (3.8 AC11) + menu admin `event-detail` |
| Saison (référence) | Slug auto à la création ; en edit, slug **lecture seule** + datepicker Material |

---

## Open questions (PO)

1. En **édition**, si le titre change : slug **inchangé** (règle 17.6 / liens stables) — confirmer que c’est toujours voulu sans champ UI.
2. **Création** depuis agenda saison : modale allégée aussi, ou seulement edit depuis détail ?
3. Sous-modales Infos : une par domaine (type+rôles, orgas) ou une modale « Configuration du spectacle » avec onglets internes ?

---

## Références

- [`ux-design-journey-league-agenda.md`](ux-design-journey-league-agenda.md) — Screen 6, 6b (tag **17.8**)
- [`17-6-slug-evenement-dans-les-urls.md`](../implementation-artifacts/17-6-slug-evenement-dans-les-urls.md)
- [`3-8-rosters-participants-saison-et-evenement.md`](../implementation-artifacts/3-8-rosters-participants-saison-et-evenement.md) — AC11 à réviser si #5 validé
