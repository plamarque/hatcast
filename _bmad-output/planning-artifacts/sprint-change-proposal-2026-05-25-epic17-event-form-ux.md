# Sprint Change Proposal — Epic 17 event form & Infos tab UX

**Date:** 2026-05-25  
**Author:** Correct Course (BMad) — mini scope  
**Approver:** Patrice (product)  
**Trigger:** Retours PO modale « Modifier le spectacle » + backlog [`ux-backlog-event-form-dialog.md`](ux-backlog-event-form-dialog.md)  
**Change scope:** **Moderate** — amend **17.8**, add stories **17.12–17.15** ; pas de code dans cette étape

---

## 1. Issue Summary

La modale `EventFormDialog` cumule trop de responsabilités (slug, datetime, type, rôles, organisateur·ices, participants). Le PO souhaite :

1. **Tag d’équité (17.8)** : saisie sur l’**onglet Infos** du détail spectacle, **pas** dans la modale create/edit.
2. **Autres simplifications** : nouvelles stories Epic 17 (**17.12–17.15**), après la phase tag/tirage/stats si besoin.

L’epic 17 en cours (**17.7** API tag livrée) n’est pas annulé ; seul le **placement UI** du tag change.

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **17.8** | Renommée / recentrée : UI onglet **Infos** (`event-infos-tab`), plus `EventFormDialog` |
| **17.9–17.10** | Aucun changement fonctionnel ; le tag reste sur l’événement via API 17.7 |
| **17.6** | Inchangé côté API ; **17.12** retirera le champ slug du formulaire (écart produit documenté) |
| **3.8 AC11** | **17.15** révise : participants spectacle hors modale |
| **3.4 / 6.2** | **17.14** déplace type + rôles vers Infos + modales |
| UX journey | Screen 6b : contexte **Infos tab**, pas event form |
| PLAN / sprint-status | Nouvelles lignes 17.12–17.15 ; clé 17.8 renommée |

**Not chosen:** Correct Course global epic ; report en epic 3 ; implémenter le tag dans la modale puis déplacer (double travail).

---

## 3. Recommended Approach

**Direct adjustment** (comme SCP admin chrome 2026-05-25) :

| Story | Action |
|-------|--------|
| **17.8** | Amend → tag sur onglet Infos + badge agenda optionnel |
| **17.12** | Slug auto, pas de champ formulaire |
| **17.13** | Datepicker + heure/minute Material dans modale |
| **17.14** | Type + rôles : affichage Infos + modales ; retirer de modale |
| **17.15** | Organisateur·ices : Infos + modale ; retirer participants de modale |

**Ordre suggéré :** **17.8** (après 17.7) → **17.9** → **17.10** → **17.12–17.15** (P2 polish, peuvent être parallèles entre elles après 17.8).

---

## 4. Story 17.8 (amended)

### Story 17.8 : UI onglet Infos — tag d’équité optionnel

**Summary:** Sur l’onglet **Infos** du détail spectacle, champ **Tag (optionnel)** avec autocomplete glossaire troupe (API 17.7), aide inline, effacement → équité principale. Pas de champ dans `EventFormDialog`.

**Acceptance criteria (high level):**

1. Utilisateur avec droit de gestion du spectacle (`canManageEvents` ou équivalent) voit le bloc tag sur **Infos** (lecture + édition).
2. Autocomplete `GET /v1/troupes/{troupeId}/equity-tags` ; saisie libre → création glossaire si politique 17.7.
3. `×` ou vide → `equity_tag` null (principal) ; pas de libellé « principal » exposé.
4. Sauvegarde via PATCH événement existant ; feedback Material (snackbar/erreur).
5. Badge discret sur ligne agenda saison si tag présent (optionnel MVP).
6. **Non-goal :** tag dans modale Nouveau/Modifier spectacle.

**Story file:** `_bmad-output/implementation-artifacts/17-8-ui-onglet-infos-tag-equite.md`

---

## 5. New stories 17.12–17.15

### 17.12 — Slug spectacle sans saisie dans le formulaire

- Retirer champ « Identifiant URL » de `EventFormDialog`.
- Création : slug alloué côté API depuis le titre (dédoublonnage).
- Édition : slug stable (comportement API 17.6 inchangé).
- Amender doc 17.6 / journey : slug non éditable par l’utilisateur.

### 17.13 — Formulaire spectacle : date et heure Material

- Remplacer `datetime-local` par `MatDatepicker` + sélecteur heure/minute (alignement `season-form-dialog`).
- Création et édition.

### 17.14 — Onglet Infos : type de spectacle et rôles (modales)

- Afficher type + résumé rôles sur Infos ; CTA ouvre modale(s) dédiée(s).
- Retirer type, confirmation template et grille rôles de `EventFormDialog`.
- Modale edit spectacle = noyau planning (titre, date/heure, lieu, description).

### 17.15 — Onglet Infos : organisateur·ices ; retrait participants du formulaire

- Bloc organisateur·ices sur Infos + modale dédiée (retirer section de `EventFormDialog`).
- Retirer section « Participants du spectacle » de la modale (parcours menu admin existant).
- Réviser trace 3.8 AC11.

---

## 6. Artifact updates

| File | Change |
|------|--------|
| `epics.md` | 17.8 amendée ; 17.12–17.15 ajoutées |
| `PLAN.md` | Table Epic 17 étendue |
| `sprint-status.yaml` | 17.8 renommée ; 17.12–17.15 backlog |
| `ux-design-journey-league-agenda.md` | Screen 6b → Infos tab |
| `ux-backlog-event-form-dialog.md` | Résolution + liens stories |
| `design-thinking-2026-05-25.md` | Ligne 17.8 + 17.12–15 |
| `17-8-ui-onglet-infos-tag-equite.md` | Story file créée |

---

## 7. Handoff

| Role | Action |
|------|--------|
| PO | Valider ordre 17.8 avant 17.9 si besoin tag en prod pour tests tirage |
| Dev | `dev story 17-8` (Infos tab) ; reporter 17.12–15 après 17.10 ou en parallèle P2 |
| PM | Pas de renumérotation epic |

**Success criteria :** Tag équité saisissable uniquement depuis Infos ; backlog UX #1–#5 couvert par 17.12–15.
