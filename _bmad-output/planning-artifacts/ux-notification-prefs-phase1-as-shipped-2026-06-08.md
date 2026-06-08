---
title: UX — Préférences notification membre phase 1 (as-shipped)
author: Sally (UX) + Patrice — rétro implémentation story 8.2b
date: '2026-06-08'
status: normative-as-shipped
amendements:
  - '2026-06-08 — Refresh visuel : titres hors carte, cartes groupe iOS-style, ligne horizontale mobile, typo renforcée (§ Refresh visuel 2026-06-08)'
supersedes_wireframe_in: ux-design-notification-preferences-2026-06-08.md
relatedStories:
  - 8.2b-preferences-membre-copy-masquage-d6
  - '8.1'
  - '8.2'
  - '8.8'
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

**Amendement visuel 2026-06-08 (Patrice + Sally) :** conserver le modèle fonctionnel (deux switchers par notif, copy « Me prévenir quand », D6, canaux **Cet appareil** / **E-mail**) ; adopter une **grammaire visuelle type Réglages iOS/Android** — titres de section **hors** carte, cartes groupe arrondies sur fond page, lignes **horizontales** même sur mobile. Voir § [Refresh visuel 2026-06-08](#refresh-visuel-2026-06-08).

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
| Hiérarchie section / ligne | Titres proches (`title-medium` vs `title-small`) | **Cartes groupe** : titre section **hors** carte (L2) ; titre ligne **dans** carte (`title-small` / `body-large` 600) ; description plus petite (`body-small`) |
| Layout mobile | Texte puis toggles empilés | **Ligne horizontale** : texte à gauche, deux switchers à droite ; légende canaux **une fois** en tête de carte |
| Fond / carte | Carte avec bandeau header + bordure outline | Fond page `surface` ; carte `surface-container-high`, **sans bordure** (ou outline très faible) ; séparateurs **inset** entre lignes |
| Libellé rappel dispos | Dispos oubliées (~5 j) | **Dispos attendues** |
| Catégories fantômes D6 | — | `COMPOSITION_SHARED`, `TEAM_CONFIRMED` **absentes du DOM** |

---

## Wireframe texte as-shipped (amendement visuel 2026-06-08)

```
┌─────────────────────────────────────────────────────────────────┐
│ Mon compte · onglet Notifications                                │
├─────────────────────────────────────────────────────────────────┤
│  (fond page = --mat-sys-surface)                                 │
│                                                                  │
│  ┌─ surface-container-high, radius 16px ─────────────────────┐ │
│  │ Notifications sur cet appareil              [====○    ]     │ │
│  │ (si actif) Notifications actives — les réglages « Cet       │ │
│  │            appareil » ci-dessous s’appliquent ici.          │ │
│  │ (si refusé) Autorisation refusée… [ Réactiver… ]            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Messages pour moi                          ← L2, hors carte     │
│  Tu reçois ces messages par défaut. Désactive ce que tu         │
│  ne veux plus.                      ← intro body-medium atténuée│
│                                                                  │
│  ┌─ surface-container-high, radius 16px ─────────────────────┐ │
│  │              Cet appareil    E-mail    ← légende (1×/carte) │ │
│  │ Disponibilités                         [○]        [○]       │ │
│  │ Me prévenir quand on attend ma dispo ou qu’une dispo est    │ │
│  │ enregistrée pour moi.                                         │ │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  (séparateur inset)   │ │
│  │ Participation                          [○]        [○]       │ │
│  │ Me prévenir quand je dois confirmer ou qu’un·e orga modifie │ │
│  │ ma participation.                                             │ │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                         │ │
│  │ Changements importants *               [○]        [○]       │ │
│  │ Me prévenir quand la date, le lieu ou le format change…      │ │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                         │ │
│  │ Spectacle annulé *                     [○]        [○]       │ │
│  │ Me prévenir quand un spectacle est annulé ou archivé…       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Rappels automatiques                       ← L2, hors carte     │
│  Rappels liés au calendrier, pas aux actions des orgas.          │
│                                                                  │
│  ┌─ même style de carte ──────────────────────────────────────┐ │
│  │              Cet appareil    E-mail                          │ │
│  │ Dispos attendues                       [○]        [○]       │ │
│  │ Me prévenir tous les 5 jours quand ma dispo manque encore   │ │
│  │ …                                                             │ │
│  │ Semaine avant le spectacle             [○]        [○]       │ │
│  │ Veille du spectacle                    [○]        [○]       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  * EVENT_* : absents UI jusqu’à ship 8.8 (D6 / A1)              │
│  (COMPOSITION_SHARED, TEAM_CONFIRMED : absents UI)              │
│  (Section Alertes organisateur : absente jusqu’à 8.4)           │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile (≤ 559 px) :** même **ligne horizontale** que desktop — bloc texte (`flex: 1`) à gauche, colonnes **Cet appareil** / **E-mail** à droite. **Pas** d’empilement texte puis toggles. Légende canaux en **première ligne non interactive** de chaque carte (libellés `label-small` ou icônes `notifications` + `mail` avec `aria-hidden` sur l’icône si `aria-label` sur le toggle). **Pas** de répétition « Cet appareil » / « E-mail » sous chaque switcher.

**Desktop (≥ 560 px) :** identique ; légende canaux en tête de carte (comportement actuel des en-têtes colonne, étendu au mobile).

**Décision produit conservée :** **deux switchers par notif** sur un seul écran — pas de séparation Push / E-mail en deux routes (contrairement à certaines apps commerce).

---

## Copy normative (verbatim — `notification-preference-ui-copy.ts`)

| Clé API | Titre UI | Description (une ligne) |
|---------|----------|-------------------------|
| `AVAILABILITY_REQUEST` | Disponibilités | Me prévenir quand on attend ma dispo ou qu’une dispo est enregistrée pour moi. |
| `CONFIRMATION_REQUEST` | Participation | Me prévenir quand je dois confirmer ou qu’un·e orga modifie ma participation. |
| `AVAILABILITY_WEEKLY_REMINDER` | Dispos attendues | Me prévenir tous les 5 jours quand ma dispo manque encore sur un spectacle. |
| `REMINDER_7_DAYS` | Semaine avant le spectacle | Me prévenir 7 jours avant un spectacle où je joue. |
| `REMINDER_1_DAY` | Veille du spectacle | Me prévenir la veille d’un spectacle où je joue. |
| `EVENT_DETAILS_CHANGED` | Changements importants | Me prévenir quand la date, le lieu ou le format change sur un spectacle où j’ai déjà interagi (dispo ou participation). |
| `EVENT_ARCHIVED` | Spectacle annulé | Me prévenir quand un spectacle où j’ai déjà interagi (dispo ou participation) est annulé ou archivé. |

**Règle copy nouvelle ligne phase 1+ :** `description` = **une** phrase ; préférer l’amorce **« Me prévenir quand »** (rappels calendaires : *quand* / *X jours avant* / *la veille* / *tous les 5 jours quand*).

**Interdit en UI membre :** afficher `category.label` API ; blocs « Si désactivé » ; badge « bientôt » sur pref fantôme (D6 / A1).

---

## Toggle global — notifications sur cet appareil

| État | UI |
|------|-----|
| Conteneur | **Carte groupe** même grammaire que les sections catégories (`surface-container-high`, `border-radius: 1rem`, sans bordure visible) |
| Label toggle | **Notifications sur cet appareil** |
| `aria-label` | Notifications sur cet appareil |
| Layout ligne | Texte + toggle sur **une ligne horizontale** (alignement vertical centré) |
| Activé | Hint sous la ligne : *Notifications actives — les réglages « Cet appareil » ci-dessous s’appliquent ici.* |
| Refus navigateur | Hint erreur + bouton *Réactiver dans le navigateur* |
| Désactivé / pas encore opt-in | **Pas de hint** sous le toggle |
| Non supporté | *Les notifications sur cet appareil ne sont pas disponibles sur ce navigateur.* |

**Lien mental utilisateur :** ce toggle = autorisation **navigateur / OS** pour le canal **« Cet appareil »** dans la grille — pas le mot « push ».

---

## Sections catégories — structure & hiérarchie

### Deux groupes (API inchangés)

1. **Messages pour moi** — `group === 'NOTIFICATIONS'` (après filtre D6)
2. **Rappels automatiques** — `group === 'AUTOMATIC_REMINDERS'`

Chaque groupe :

| Zone | Contenu | Emplacement |
|------|---------|-------------|
| **Titre section** | ex. *Messages pour moi* | **Hors carte** — directement sur le fond page |
| **Intro section** | une ligne opt-out / contexte | **Hors carte**, sous le titre |
| **Carte groupe** | légende canaux + lignes pref | `notification-preferences__card` |

**Interdit :** bandeau header **dans** la carte mélangeant titre de section et lignes actionnables (pattern pré-refresh).

### Surfaces & séparateurs (M3 — pas de hex en dur)

| Élément | Token / règle |
|---------|----------------|
| Fond page (panneau onglet) | `--mat-sys-surface` (hérite `account-page__preferences-panel`) |
| Carte groupe | `--mat-sys-surface-container-high` |
| Bordure carte | **Aucune** ou `outline-variant` ≤ 25 % opacité — **pas** de bordure forte type formulaire |
| `border-radius` carte | `1rem` (16 px) |
| Padding carte | `0` sur le conteneur ; padding horizontal `1rem` sur les lignes |
| Séparateur entre lignes | `1px` `outline-variant` ~40 % ; **inset** (`margin-inline: 1rem` ou pseudo-élément) — ne touche pas les bords gauche/droit de la carte |
| Espacement entre groupes | `1.25rem` entre intro et carte suivante ; `1.5rem` entre fin de carte et titre section suivant |

### Typographie (M3 tokens)

| Élément | Token / style | Notes |
|---------|----------------|-------|
| Titre section (L2) | Hub L2 : `1.125rem`, `font-weight: 600`, `letter-spacing: -0.01em` — ou `title-medium` | Aligné [`ux-design-hub-section-headers.md`](./ux-design-hub-section-headers.md) L2 |
| Intro section | `body-medium`, ~68 % `on-surface` | Sous le titre, hors carte |
| Titre ligne (ex. Disponibilités) | `title-small` **ou** `body-large` + `font-weight: 600` | Contraste net avec la description |
| Description ligne | **`body-small`**, ~72 % `on-surface` | **Plus petit** qu’avant (`body-medium` → `body-small`) pour hiérarchie type Réglages |
| Légende canaux | `label-small`, ~70 % `on-surface`, centré sur colonne toggle | Première ligne de carte ; `aria-hidden="true"` sur la ligne si les toggles portent déjà `aria-label` |

### Grille canaux & layout ligne

| Viewport | Structure ligne | Légende canaux |
|----------|-----------------|----------------|
| **Tous** | `display: grid` ou flex : `minmax(0, 1fr)` texte \| colonne appareil \| colonne e-mail ; toggles **alignés verticalement au centre** du bloc titre+description | **Une fois** en tête de carte |
| ≥ 560 px | Colonnes toggle ~4.5–5.5 rem ; `align-items: center` | Texte **Cet appareil** \| **E-mail** |
| < 560 px | **Même grille horizontale** — pas de stack vertical | Idem ; option icônes `notifications` + `mail` si manque de place (< 360 px : réduire gap, conserver 2 colonnes) |

**Libellés canal :** **Cet appareil** \| **E-mail** (jamais Push / Mobile).

`aria-label` toggle catégorie : `{titre} — cet appareil` ou `{titre} — e-mail`.

### Comportement inchangé (8.1 / 8.2)

- Toggles **Cet appareil** désactivés si notifications appareil off — **sans** message explicatif dans la grille
- Toggles **E-mail** toujours éditables
- PATCH debounce 300 ms, rollback erreur, `data-testid` `notification-pref-{key}-{channel}` (`channel` reste `push` en technique)

---

## Refresh visuel 2026-06-08

**Contexte :** inspiration apps mobile « Réglages notifications » (cartes groupe sur fond sombre, titres hors cartes, scan horizontal). **Hors scope :** séparer Push et E-mail en deux écrans.

**Objectif :** alléger la lecture, rapprocher le ressenti natif iOS/Android, **sans** changer le modèle fonctionnel ni la copy.

| Dimension | Avant (8.2b ship) | Après (amendement) |
|-----------|-------------------|---------------------|
| Titre + intro section | Dans bandeau header de la carte | **Hors carte** |
| Lignes pref | Mobile : texte puis toggles empilés | **Toujours horizontales** |
| Labels canal mobile | Répétés sous chaque toggle | **Légende unique** en tête de carte |
| Carte | Bordure + header teinté | **Surface-container-high**, radius 16 px, séparateurs inset |
| Description ligne | `body-medium` | **`body-small`** |
| Toggle global push | Hors carte, layout simple | **Même carte groupe** que les prefs |

**Composants impactés :**

- [`notification-preferences-section.ts`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts) — template + styles
- [`push-notifications-section.ts`](../../apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts) — enveloppe carte (optionnel mais recommandé pour cohérence onglet)

**Checklist M3 (implémentation) :**

- [ ] Tokens `--mat-sys-*` uniquement — pas de `#000` / `#1C1C1C` en dur
- [ ] `mat-slide-toggle` conservé — pas de switch custom
- [ ] Cibles tactiles toggle ≥ 48 dp (`min-height` / `min-width` sur zone interactive)
- [ ] Pas de changement shell `/compte` (tabs, rail)
- [ ] Vitest existants mis à jour si sélecteurs DOM changent

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

- [ ] Exactement **5** lignes pref visibles membre (7 après ship 8.8 si `EVENT_*` démasqués)
- [ ] `COMPOSITION_SHARED` et `TEAM_CONFIRMED` **pas** dans le DOM
- [ ] Chaque description = **une** phrase ; amorce **Me prévenir**
- [ ] Colonne / légende canal = **Cet appareil**, pas Push/Mobile
- [ ] Toggle global = **Notifications sur cet appareil** ; contenu dans **carte groupe**
- [ ] Pas d’intro de page au-dessus de la grille
- [ ] Titres section (**Messages pour moi**, **Rappels automatiques**) **hors carte** ; intros hors carte
- [ ] Cartes prefs : `surface-container-high`, radius 16 px, **sans** bandeau header interne
- [ ] Lignes **horizontales** sur mobile (texte gauche, toggles droite) — **pas** de stack vertical
- [ ] Légende **Cet appareil** / **E-mail** **une fois** en tête de carte — **pas** répétée sous chaque toggle
- [ ] Description ligne en **`body-small`** ; titre ligne nettement plus fort
- [ ] Séparateurs entre lignes **inset** dans la carte
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

*Normative as-shipped · rétro 2026-06-08 · amendement visuel 2026-06-08 (Patrice + Sally).*
