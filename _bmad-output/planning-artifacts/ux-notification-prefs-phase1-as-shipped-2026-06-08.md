---
title: UX — Préférences notification membre phase 1 (as-shipped)
author: Sally (UX) + Patrice — rétro implémentation story 8.2b
date: '2026-06-08'
status: normative-as-shipped
supersedes_wireframe_in: ux-design-notification-preferences-2026-06-08.md
relatedStories:
  - 8.2b-preferences-membre-copy-masquage-d6
  - '8.1'
  - '8.2'
route: /compte/notifications
code_sources:
  - apps/web/src/app/core/notifications/notification-preference-ui-copy.ts
  - apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts
  - apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts
  - apps/web/src/app/pages/account-placeholder/tabs/account-notifications-tab.html
tests:
  - apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts
  - apps/web/src/app/shared/push-notifications-section/push-notifications-section.spec.ts
---

# Préférences notification membre — phase 1 (as-shipped)

**Objectif de ce document :** figer l’UI **réellement livrée** après story **8.2b** et itérations PO (2026-06-08), pour éviter toute régression vers le wireframe DT initial ou le jargon technique.

**Remplace** pour la phase 1 membre : wireframe § « phase 1 » et règles R3/R4 obsolètes dans [`ux-design-notification-preferences-2026-06-08.md`](./ux-design-notification-preferences-2026-06-08.md) (Concept A « Si désactivé », colonnes « Push », intro de page).

---

## Synthèse des décisions UX (rétro)

| Sujet | Wireframe DT initial | **As-shipped (ne pas régresser)** |
|-------|----------------------|-----------------------------------|
| Copy par ligne | Titre + aide + « Si désactivé : … » | **Titre + une phrase** commençant par **« Me prévenir quand »** (ou variante temps : *7 jours avant*, *la veille*, *tous les 5 jours*) |
| Intro de page | « Chaque option décrit ce que tu ne recevras plus… » | **Absente** — redondante avec intros de section |
| Nom canal push | Push | **« Cet appareil »** (jamais Push / Mobile dans l’UI membre) |
| Toggle global appareil | « Notifications sur cet appareil » | **Conservé** — ne pas renommer en « Push » ou « Mobile » |
| Hint global appareil OFF | Texte d’aide sous le toggle | **Aucun** — toggle seul suffit |
| Hint prefs quand appareil OFF | Explication sous la grille | **Supprimé** — toggles « Cet appareil » grisés sans message |
| Hiérarchie section / ligne | Titres proches (`title-medium` vs `title-small`) | **Cartes** : en-tête section (`headline-small`) ≠ titre ligne (`body-large` semi-gras) |
| Libellé rappel dispos | Dispos oubliées (~5 j) | **Dispos attendues** |
| Catégories fantômes D6 | — | `COMPOSITION_SHARED`, `TEAM_CONFIRMED` **absentes du DOM** |

---

## Wireframe texte as-shipped

```
┌─────────────────────────────────────────────────────────────────┐
│ Mon compte · onglet Notifications                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Notifications sur cet appareil                    [====○    ] │
│  (si actif) Notifications actives — les réglages « Cet         │
│             appareil » ci-dessous s’appliquent ici.              │
│  (si refusé navigateur) Autorisation refusée sur cet appareil…   │
│             [ Réactiver dans le navigateur ]                     │
│  (si OFF)   — pas de phrase d’aide —                            │
│                                                                  │
│  ┌─ MESSAGES POUR MOI ─────────────────────────────────────────┐ │
│  │ Tu reçois ces messages par défaut. Désactive ce que tu      │ │
│  │ ne veux plus.                                               │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │                    Cet appareil    E-mail    (desktop hdr)  │ │
│  │ Disponibilités                                              │ │
│  │ Me prévenir quand on attend ma dispo ou qu’une dispo est    │ │
│  │ enregistrée pour moi.                                       │ │
│  │                              [○]        [○]                 │ │
│  │ Participation                                               │ │
│  │ Me prévenir quand je dois confirmer ou qu’un·e orga modifie │ │
│  │ ma participation.                                           │ │
│  │                              [○]        [○]                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ RAPPELS AUTOMATIQUES ────────────────────────────────────┐ │
│  │ Rappels liés au calendrier, pas aux actions des orgas.      │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ Dispos attendues                                            │ │
│  │ Me prévenir tous les 5 jours quand ma dispo manque encore   │ │
│  │ sur un spectacle.                                           │ │
│  │ Semaine avant le spectacle                                  │ │
│  │ Me prévenir 7 jours avant un spectacle où je joue.          │ │
│  │ Veille du spectacle                                         │ │
│  │ Me prévenir la veille d’un spectacle où je joue.            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  (COMPOSITION_SHARED, TEAM_CONFIRMED, EVENT_* : absents UI)     │
│  (Section Alertes organisateur : absente jusqu’à 8.4)           │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile :** libellés **Cet appareil** / **E-mail** visibles **au-dessus** de chaque switcher (pas seulement en en-têtes de colonne desktop).

---

## Copy normative (verbatim — `notification-preference-ui-copy.ts`)

| Clé API | Titre UI | Description (une ligne) |
|---------|----------|-------------------------|
| `AVAILABILITY_REQUEST` | Disponibilités | Me prévenir quand on attend ma dispo ou qu’une dispo est enregistrée pour moi. |
| `CONFIRMATION_REQUEST` | Participation | Me prévenir quand je dois confirmer ou qu’un·e orga modifie ma participation. |
| `AVAILABILITY_WEEKLY_REMINDER` | Dispos attendues | Me prévenir tous les 5 jours quand ma dispo manque encore sur un spectacle. |
| `REMINDER_7_DAYS` | Semaine avant le spectacle | Me prévenir 7 jours avant un spectacle où je joue. |
| `REMINDER_1_DAY` | Veille du spectacle | Me prévenir la veille d’un spectacle où je joue. |

**Règle copy nouvelle ligne phase 1+ :** `description` = **une** phrase ; préférer l’amorce **« Me prévenir quand »** (rappels calendaires : *quand* / *X jours avant* / *la veille* / *tous les 5 jours quand*).

**Interdit en UI membre :** afficher `category.label` API ; blocs « Si désactivé » ; badge « bientôt » sur pref fantôme (D6 / A1).

---

## Toggle global — notifications sur cet appareil

| État | UI |
|------|-----|
| Label toggle | **Notifications sur cet appareil** |
| `aria-label` | Notifications sur cet appareil |
| Activé | Hint : *Notifications actives — les réglages « Cet appareil » ci-dessous s’appliquent ici.* |
| Refus navigateur | Hint erreur + bouton *Réactiver dans le navigateur* |
| Désactivé / pas encore opt-in | **Pas de hint** sous le toggle |
| Non supporté | *Les notifications sur cet appareil ne sont pas disponibles sur ce navigateur.* |

**Lien mental utilisateur :** ce toggle = autorisation **navigateur / OS** pour le canal **« Cet appareil »** dans la grille — pas le mot « push ».

---

## Sections catégories — structure & hiérarchie

### Deux cartes (groupes API inchangés)

1. **Messages pour moi** — `group === NOTIFICATIONS'` (après filtre D6)
2. **Rappels automatiques** — `group === AUTOMATIC_REMINDERS'`

Chaque carte :

- **Bandeau d’en-tête** (`notification-preferences__group-header`) : titre section + intro une ligne
- **Corps** (`notification-preferences__group-body`) : lignes pref

### Typographie (M3 tokens)

| Élément | Token / style |
|---------|----------------|
| Titre section (ex. Messages pour moi) | `headline-small` |
| Intro section | `body-medium`, opacité réduite |
| Titre ligne (ex. Disponibilités) | `body-large`, `font-weight: 600` |
| Description ligne | `body-medium`, opacité réduite |

### Grille canaux

| Viewport | En-têtes colonnes | Libellé sur switcher |
|----------|-------------------|----------------------|
| ≥ 560px | **Cet appareil** \| **E-mail** une fois par section | Masqués (en-têtes suffisent) |
| < 560px | Masqués | **Cet appareil** et **E-mail** au-dessus de chaque toggle |

`aria-label` toggle catégorie : `{titre} — cet appareil` ou `{titre} — e-mail`.

### Comportement inchangé (8.1 / 8.2)

- Toggles **Cet appareil** désactivés si notifications appareil off — **sans** message explicatif dans la grille
- Toggles **E-mail** toujours éditables
- PATCH debounce 300 ms, rollback erreur, `data-testid` `notification-pref-{key}-{channel}` (`channel` reste `push` en technique)

---

## Masquage D6 (phase 1)

| Clé | UI |
|-----|-----|
| `COMPOSITION_SHARED` | **Absent** (filtre client `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS`) |
| `TEAM_CONFIRMED` | **Absent** |
| `EVENT_DETAILS_CHANGED`, `EVENT_ARCHIVED` | Absents jusqu’à 8.8 |
| Section orga 8.4 | Absente entièrement |

---

## Textes volontairement absents (anti-régression)

Ne **pas** réintroduire sans décision PO explicite :

1. Intro page *« Chaque option décrit ce que tu ne recevras plus… »*
2. Hint sous grille *« Les toggles … sont désactivés — active … ci-dessus »*
3. Hint toggle appareil OFF *« Active … Les e-mails restent réglables… »*
4. Blocs **« Si désactivé : … »** sous chaque ligne
5. Libellés canal **Push** ou **Mobile** dans l’UI membre
6. Affichage des libellés API longs (`M'envoyer une notification…`)

---

## Checklist régression (dev / review / QA)

- [ ] Exactement **5** lignes pref visibles membre
- [ ] `COMPOSITION_SHARED` et `TEAM_CONFIRMED` **pas** dans le DOM
- [ ] Chaque description = **une** phrase ; les 5 commencent par **Me prévenir**
- [ ] Colonne / libellé canal = **Cet appareil**, pas Push/Mobile
- [ ] Toggle global = **Notifications sur cet appareil**
- [ ] Pas d’intro de page au-dessus de la grille
- [ ] Sections en **cartes** ; titre section nettement plus grand que titre ligne
- [ ] Mobile : libellés **Cet appareil** / **E-mail** visibles sur les switchers
- [ ] Appareil OFF : pas de hint sous toggle global ni sous grille prefs
- [ ] Appareil ON : hint lien vers « Cet appareil » ci-dessous présent
- [ ] Vitest `notification-preferences-section.spec.ts` + `push-notifications-section.spec.ts` verts

---

## Scénarios guérilla mis à jour (phase 1)

| # | Tâche | Pass (as-shipped) |
|---|-------|-------------------|
| S1 | Couper rappels dispos ~5 j | Trouve **Dispos attendues** en < 15 s ; lit *tous les 5 jours* |
| S2 | Couper veille + semaine, garder dispos | Désactive **Veille** + **Semaine avant** sans toucher **Disponibilités** |
| S4 | Push appareil off | Comprend que **Cet appareil** est grisé ; peut régler **E-mail** ; pas de mur de texte |
| S5 | Couper Participation — retrait compo ? | Lit *Me prévenir quand je dois confirmer ou qu’un·e orga modifie ma participation* |

---

## Évolutions futures (hors phase 1 — ne pas mélanger)

| Story | Ajout UI attendu |
|-------|------------------|
| 8.8 | Lignes `EVENT_*` + copy « Me prévenir quand… » |
| G-012 | Démasquer `TEAM_CONFIRMED` |
| 8.4 | Section **Alertes organisateur** (opt-in, rhétorique différente) |

Nouvelles lignes : suivre le même pattern **titre court + Me prévenir quand…** ; retirer la clé du set `MEMBER_HIDDEN_*` si applicable.

---

*Rétro UX Sally — 2026-06-08 · source de vérité UI phase 1 jusqu’à amendement PO documenté.*
