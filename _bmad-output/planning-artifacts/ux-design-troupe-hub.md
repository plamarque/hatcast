---
title: UX — Page Troupe (hub `/troupes/:slug`) — révision chrome & préférences globales
author: Sally (UX) + Patrice
date: '2026-05-31'
status: approved
supersedesPartially:
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md#zone-b--préférences-par-troupe
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md#screen-3--troupe-hub
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md#screen-4--troupe-hub
  - _bmad-output/design-thinking-2026-05-25.md#wireframe-p2
relatedStories:
  - '17.29'
  - '17.30'
  - '17.4'
  - '17.24'
  - '2.5'
  - '2.11'
  - '5.x'
stakeholderDecisions:
  - gear-menu-modifier-troupe
  - gear-menu-nouvelle-saison
  - remove-troupe-scoped-preferences-control
  - global-pseudo-and-preferred-roles-on-mon-compte
  - season-card-fully-clickable-no-ouvrir-button
  - remove-hub-footer-explorer-link
  - season-card-show-period-dates
  - season-card-stats-must-be-accurate
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
  - _bmad-output/planning-artifacts/ux-design-hub-section-headers.md
  - docs/v2/technical/FRONTEND_UI.md
  - docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md
---

# UX Design — Page Troupe (`/troupes/:slug`)

**Purpose:** Remettre le **hub troupe** en cohérence avec les autres écrans hub (Mon compte, Accueil, Stats) : actions admin regroupées dans le **menu engrenage**, hero épuré, et **préférences membre** (pseudo + rôles préférés) déplacées vers **Mon compte** en configuration **globale** (valable dans toutes les troupes).

**Principle:** Le hub troupe = **identité de la troupe + saisons**. Les réglages personnels du membre = **Mon compte**. L’administration troupe = **menu engrenage** (`app-scope-admin-menu`).

---

## Problème (état actuel)

| Point | Constat |
|-------|---------|
| **Hero encombré** | Bouton secondaire **Préférences dans cette troupe** (`mat-stroked-button` + icône `tune`) côte à côte avec l’engrenage admin — deux patterns d’action distincts pour des réglages que l’utilisateur perçoit comme « les siens ». |
| **CTA saison** | **+ Nouvelle saison** en `mat-flat-button` primary dans l’en-tête de section **Saisons** — même famille visuelle que **Ouvrir** sur les cartes ; compétition visuelle avec le contenu principal. |
| **Incohérence Mon compte** | `/compte` renvoie vers le hub troupe pour les préférences (*Pseudo et rôles par défaut, troupe par troupe*), alors que l’intention produit évolue vers des préférences **uniques pour toutes les troupes**. |
| **Gear incomplet** | Le menu admin ne contient que **Membres** ; pas d’entrée pour éditer les infos de base de la troupe ni pour créer une saison — contrairement au pattern « tout l’admin au même endroit » (saison, spectacle). |
| **Cartes saison** | Bouton **Ouvrir** isolé en bas de carte — l’utilisateur clique naturellement sur la carte entière ; affordance incohérente avec l’intention (accéder à la saison). |
| **Compteurs carte saison** | `eventCount` / `participantCount` proviennent de colonnes **dénormalisées** sur `seasons` ; après **import / migration SQL** (événements insérés en bulk), `event_count` reste souvent à **0** alors que l’agenda contient des spectacles. L’archivage d’un spectacle **ne décrémente pas** le compteur non plus. |
| **Période absente** | L’API expose déjà `startDate` / `endDate` sur chaque saison, mais `app-season-card` ne les affiche pas — difficile de distinguer « Malice 2025-2026 » vs « Malice 2026-2026 » sans ouvrir la saison. |
| **Footer hub** | Liseret + lien **Explorer d’autres troupes** en bas de page — redondant avec le fil d’Ariane (`Troupes › …`) et avec la section **Découvrir** sur `/troupes` (futur annuaire public). |

Référence implémentation : [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html), [`troupe-hub-preferences-sheet.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.ts), [`season-card`](../../apps/web/src/app/shared/season-card/season-card.html).

---

## Décisions produit

| # | Sujet | Décision |
|---|--------|----------|
| T1 | **Menu engrenage — Modifier** | Entrée **Modifier** ouvre un **`MatDialog`** pour éditer les infos de base de la troupe : **nom** (obligatoire), **logo** (optionnel, upload image), **description** (optionnelle, texte court). Visible pour `TROUPE_ADMIN` et admin plateforme. |
| T2 | **Menu engrenage — Nouvelle saison** | Retirer le bouton **+ Nouvelle saison** de la section Saisons ; ajouter **Nouvelle saison** dans le menu engrenage (même action : `SeasonFormDialog` mode create → navigation `/saison/:slug` au succès). |
| T3 | **Menu engrenage — Membres** | Conserver **Membres** → `/troupe/:slug/admin/membres` (inchangé). |
| T4 | **Ordre des entrées** | **Modifier** · **Nouvelle saison** · **Membres** (actions création/édition avant navigation admin lourde). |
| T5 | **Préférences troupe** | **Supprimer** le bouton **Préférences dans cette troupe** et le bottom sheet `TroupeHubPreferencesSheet` du hub. |
| T6 | **Préférences globales** | Sur **Mon compte** : section **Préférences membre** avec **pseudo** (unique, toutes troupes) et **rôles préférés** (unique, toutes troupes). Remplacer la section actuelle « Préférences par troupe » (lien vers `/troupes`). |
| T7 | **Hero** | Logo + nom (+ description courte en lecture seule si présente, sous le nom, `body-medium`, max 2 lignes tronquées). Pas de bouton d’action membre dans le hero. |
| T8 | **Section Saisons** | Titre **Saisons** seul à gauche ; **aucun** CTA primary dans l’en-tête de section pour les admins. |
| T9 | **Non-admins** | Pas de menu engrenage (`items.length === 0`). Préférences via **Mon compte** uniquement. |
| T10 | **Slug URL** | Modifier le **nom** de la troupe **ne change pas** le slug `/troupes/:slug` (stabilité des liens). Le dialog l’indique en aide une ligne si le nom diffère du slug visible. |
| T11 | **Cartes saison cliquables** | Retirer le bouton **Ouvrir** ; **toute la carte** navigue vers `/saison/:slug`. Pattern M3 : carte interactive avec états hover/focus visibles (voir § Pattern carte saison). |
| T12 | **Footer hub** | **Supprimer** le `<footer>` (liseret + lien **Explorer d’autres troupes**). La découverte de troupes se fait depuis **`/troupes`** (section **Découvrir** / futur annuaire public), pas depuis le hub d’une troupe déjà ouverte. |
| T13 | **Période sur carte saison** | Afficher la **période** lorsque `startDate` et/ou `endDate` sont renseignés (voir § Contenu carte). Prioritaire pour désambiguïser les saisons au titre proche. |
| T14 | **Compteurs fiables** | **Story séparée [17-30](../implementation-artifacts/17-30-season-event-count-resync.md)** / [BUG-004](../../ISSUES.md). La refonte UI **17-29** continue d’afficher `eventCount` / `participantCount` tels que renvoyés par l’API (comportement actuel). |

### Impact domaine / API (à traiter en story technique)

| Sujet | État actuel | Cible UX |
|-------|-------------|----------|
| **Pseudo** | `troupe_memberships.display_name` — **par troupe** (FR9, story 2.5) | **Compte global** : un pseudo membre valable dans **toutes** les troupes. *Recommandation impl.* : champ dédié sur `users` (ex. `memberDisplayName`) **ou** propagation synchronisée sur toutes les adhésions actives à l’enregistrement depuis `/compte` — **ADR requis** si le modèle change. |
| **Rôles préférés** | `troupe_memberships.preferred_role_keys` — **par troupe** | **Compte global** : une liste unique. *Recommandation impl.* : colonne sur `users` + migration, ou endpoint `/v1/users/me/preferences` ; les adhésions existantes héritent de la valeur compte. |
| **Logo / description troupe** | `troupes` : **nom seulement** aujourd’hui | **Migration** : `logo_url` (nullable), `description` (nullable, ex. 500 car.) + `PATCH /v1/troupes/{id}` admin-only. **Phase UI** : dialog avec nom seul si API logo/description pas encore livrée ; champs logo/description désactivés + badge « Bientôt » acceptable en MVP technique. |
| **Admin override pseudo membre** | Admin peut éditer le pseudo d’un membre par troupe (story 2.2) | **Conservé** côté admin **Membres** ; indépendant du pseudo global self-service (l’admin peut toujours corriger un cas particulier). |

---

## Parcours utilisateur

### Léa (membre)

1. Ouvre **Mon compte** depuis le menu avatar.
2. Saisit son **pseudo** « Léa » et coche **Comédien·ne** + **Volontaire** dans **Rôles préférés**.
3. Enregistre — le pseudo et les rôles s’appliquent dans **La Malice** et toute autre troupe.
4. Sur `/troupes/malice`, le hero est épuré (logo, nom, saisons) ; pas de bouton préférences.

### Amira (admin troupe)

1. Ouvre **La Malice** → hub troupe.
2. Tape l’**engrenage** → **Modifier** pour mettre à jour le logo et une courte description.
3. Même menu → **Nouvelle saison** → dialog existant → arrive sur la nouvelle saison.
4. Même menu → **Membres** pour gérer le roster.

---

## Chrome — hub troupe (cible)

### Wireframe desktop / mobile

```
┌────────────────────────────────────────────────────────────┐
│ Troupes › La Malice                                        │
├────────────────────────────────────────────────────────────┤
│  [logo]   La Malice                              [ ⚙ ]     │  ← gear si admin
│           Courte description de la troupe… (optionnel)      │
├────────────────────────────────────────────────────────────┤
│  Saisons                                                   │  ← pas de bouton + ici
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ 🎭 Malice 2025-2026 │  │ 🎭 Malice 2026-2026 │  ← clic  │
│  │ Sep 2025 – Jun 2026 │  │ (pas de dates)      │    partout│
│  │ 12 spectacles       │  │ 0 spectacles *      │          │
│  │ 31 participants     │  │ 31 participants     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│  * compteur à corriger côté API si import (T14)             │
│  [ Afficher les saisons archivées ]                          │
└────────────────────────────────────────────────────────────┘
```

| Élément | Valeur |
|---------|--------|
| **Conteneur** | `max-width: 56rem`, padding aligné hub membre ([ux-design-hub-section-headers.md](./ux-design-hub-section-headers.md)) |
| **Fil d’Ariane** | `Troupes › {nom}` — lien parent → `/troupes` |
| **Hero** | Logo circulaire (image si `logoUrl`, sinon `mat-icon` `groups` comme aujourd’hui) + `h1` nom + description optionnelle |
| **Engrenage** | `app-scope-admin-menu` scope `troupe`, aligné à droite du hero (même ligne que le titre sur desktop ; wrap gracieux mobile) |
| **Section Saisons** | `h2` L2 **Saisons** — typo hub section headers |
| **Fin de page** | Pas de footer ni liseret ; padding bas du conteneur suffit (`2rem`) |

---

## Pattern — Carte saison (`app-season-card`)

**Objectif :** une tap/click **n’importe où** sur la carte ouvre la saison — comportement attendu par l’utilisateur, aligné sur la liste legacy `/seasons` ([`seasons-list`](../../apps/web/src/app/pages/seasons-list/seasons-list.html) : corps de carte en `<button>` pleine surface).

### Compatible Material 3 ?

**Oui.** M3 n’interdit pas les cartes cliquables ; il demande des **états interactifs explicites** (hover, focus, pressed) et une **cible tactile ≥ 48 dp**. Deux patterns valides :

| Pattern | Usage HatCast |
|---------|----------------|
| **`<a routerLink>`** enveloppant le contenu (block, `color: inherit`) | Préféré si navigation pure, sans logique click |
| **`<button type="button">`** transparent pleine surface + `router.navigate` | Déjà utilisé sur `seasons-list` ; pratique si actions secondaires (kebab) coexistent plus tard |

Sur le hub troupe, **pas de kebab** sur les cartes → **`routerLink`** sur un lien block ou **`mat-card`** + lien stretch est le plus simple.

### Structure cible

```
┌──────────────────────────────────┐
│  🎭  Malice 2025-2026            │  ← mat-card appearance="outlined"
│      Archivée (si applicable)      │     cursor: pointer
│      1 spectacle · 31 participants│     hover: outline / surface tint
└──────────────────────────────────┘
```

| Règle | Détail |
|-------|--------|
| **Retiré** | Bouton `mat-flat-button` **Ouvrir** et bloc `.season-card__actions` |
| **Interaction** | Clic / Entrée / Espace sur la carte → `/saison/:slug` |
| **Implémentation** | `<a class="season-card__surface" [routerLink]="workspaceLink(slug())" [attr.aria-label]="'Ouvrir ' + title()">` englobant le contenu **ou** `<button class="season-card__surface">` + navigate — **même composant** `app-season-card` |
| **Hover / focus** | `outline` ou `background: color-mix(in srgb, var(--mat-sys-primary) 8%, transparent)` ; `:focus-visible` ring Material |
| **Archivée** | Badge texte **Archivée** conservé ; carte reste cliquable (accès lecture workspace) |
| **Période (T13)** | Ligne sous le titre si au moins une date ; format court FR (voir tableau ci-dessous) |
| **Stats (T14)** | Lignes spectacles + participants ; libellés **spectacles** / **participants** (hub) — chiffres **source de vérité API** |
| **Mobile** | Carte entière ≥ 48 dp de hauteur effective ; pas de zone morte |

### Période — format d’affichage (T13)

Réutiliser / extraire la logique de [`formatSeasonDates`](../../apps/web/src/app/pages/seasons-list/seasons-list.ts) vers un helper partagé avec format **humain** (pas ISO brut).

| Données API | Affichage carte |
|-------------|-----------------|
| `startDate` + `endDate` | `Sep 2025 – Jun 2026` (mois abrégés FR, même année → `Sep – Dec 2026` si pertinent) |
| `startDate` seul | `À partir de sep. 2025` |
| `endDate` seul | `Jusqu’en jun. 2026` |
| Aucune date | **Pas de ligne** (ne pas inventer depuis le titre) |

**Placement :** entre le titre et le badge **Archivée** / stats ; `font-size: 0.9rem`, opacité ~0.85.

**Saisie :** dates déjà éditables via **Nouvelle saison** / **Modifier la saison** (`SeasonFormDialog`) — inciter les admins à les renseigner à la création (hint dialog existant).

### Données & compteurs (T14)

**Symptôme observé :** troupe importée — carte affiche **0 spectacles** alors que la saison en contient.

**Cause (runtime) :** `seasons.event_count` est un **cache** incrémenté uniquement à la création via API (`EventService.create`). Les imports SQL bulk et les seeds recalculent par `UPDATE … COUNT(*)` ; la migration V1→V2 **ne recalcule pas** systématiquement après `load.sql`.

**Sémantique cible (à verrouiller) :**

| Compteur | Définition recommandée |
|----------|------------------------|
| **Spectacles** | Événements de la saison avec `archived = false` (aligné seeds V26/V34) |
| **Participants** | `season_participants` avec `status = ACTIVE` (déjà le cas côté sync) |

**Correctifs techniques (story impl., au choix PO/dev — un suffit) :**

1. **Reconciliation** — après migration / script admin : `UPDATE seasons SET event_count = (SELECT COUNT(*) FROM events …)` (comme les seeds).
2. **Liste saisons** — calculer les comptes via sous-requête ou refresh à la lecture (authoritative, plus coûteux).
3. **Maintenance runtime** — décrémenter `event_count` à l’archivage ; job de resync périodique.

**Règle UX (17-29) :** afficher les compteurs API tels quels ; ne pas masquer ni contournement UI. Correction dans **17-30** uniquement.

**Issue :** [BUG-004](../../ISSUES.md#bug-004--season-event_count-drift-after-bulk-import-and-archive).

**Note :** `seasons-list` affiche « Événements » ; hub carte « spectacles » — harmoniser le vocable (**spectacles** sur hub troupe, cohérent métier HatCast).

**Note :** les cartes **troupe** sur `/troupes` (`app-troupe-card`) gardent pour l’instant le bouton **Ouvrir** — **hors scope** de T11 ; harmonisation possible en story ultérieure.

---

## Menu engrenage — entrées (scope `troupe`)

| # | Label | Icône | Condition | Action |
|---|-------|-------|-----------|--------|
| 1 | **Modifier** | `edit` | `canManageTroupe()` | Ouvre `TroupeEditDialog` |
| 2 | **Nouvelle saison** | `add` | `canManageTroupe()` | Ouvre `SeasonFormDialog` (create) |
| 3 | **Membres** | `groups` | `canManageTroupe()` | `routerLink` → `/troupe/:slug/admin/membres` |

**Règles :**

- Pas de sous-menu ; liste plate (`mat-menu-item`).
- `aria-label` engrenage : `Administration de la troupe` (inchangé).
- Gear **absent** pour les membres sans droit admin (règle 17.2 conservée).

---

## Pattern — Dialog Modifier la troupe (`TroupeEditDialog`)

**Ouverture :** menu engrenage → **Modifier**.

| Champ | Type | Règles |
|-------|------|--------|
| **Nom** | `matInput` | Obligatoire, trim, max 255 ; validation identique à création troupe (story 2.11). |
| **Logo** | Zone upload + aperçu | JPEG/PNG/WebP ; max 2 Mo ; boutons *Choisir une image* / *Supprimer* — **mirror** pattern avatar Mon compte. Si API absente : champ masqué ou « Bientôt ». |
| **Description** | `matInput` textarea | Optionnel ; max 500 car. ; `mat-hint` : *Visible sur la page troupe.* |

**Actions :** **Enregistrer** (primary) · **Annuler**.

**Après succès :** fermer dialog, rafraîchir hero (nom, logo, description), snack *« Troupe mise à jour »*.

**Slug :** texte d’aide sous le nom si pertinent : *L’adresse web de la troupe ne change pas.*

**Permissions :** `TROUPE_ADMIN` ou admin plateforme ; sinon entrée absente du menu.

---

## Mon compte — section Préférences membre (amendement `ux-design-mon-compte.md`)

Remplace la **Zone B — Préférences par troupe** (lien vers `/troupes`).

### Wireframe

```
┌─────────────────────────┐
│ Mon compte              │
│ Identité et sécurité…   │
├─────────────────────────┤
│ [○]  email@…            │
│      Nom du compte        │
├─────────────────────────┤
│ PRÉFÉRENCES MEMBRE       │
│ Pseudo                   │
│ [ Léa________________ ]  │
│ Rôles préférés           │
│ ☑ Comédien·ne  ☑ Volontaire … │
│ [ Enregistrer ]          │
├─────────────────────────┤
│ SÉCURITÉ                │
│ …                       │
└─────────────────────────┘
```

| Élément | Détail |
|---------|--------|
| **Titre section** | **Préférences membre** (`h2` / overline, même rythme que **Sécurité**) |
| **Pseudo** | Un seul `mat-form-field` ; hint : *Nom affiché dans toutes vos troupes.* ; max 255 ; non vide à l’enregistrement. |
| **Rôles préférés** | Grille `mat-checkbox` identique à l’actuel `TroupeHubPreferencesSheet` (clés, labels, emoji, règle `volunteer` non désactivable). |
| **Enregistrement** | Un bouton **Enregistrer** pour la section (ou auto-save par bloc — **préférer un bouton** pour limiter les appels API). Snack succès / erreur. |
| **Retiré** | Lien **Préférences par troupe** ; bottom sheet hub ; toute liste « un pseudo par troupe » sur `/compte`. |

### Amendements `ux-design-mon-compte.md`

| Ancien (C1/C2) | Nouveau |
|----------------|---------|
| Compte global sans pseudo ni rôles | Compte global **avec** pseudo membre + rôles préférés **globaux** (T6) |
| Renvoi vers hub troupe pour préférences | Section formulaire inline sur `/compte` |
| Story 2.5 pseudo **uniquement** hub troupe | Story technique de migration FR9 → préférences compte |

---

## Ce qu’on retire du hub troupe

| Retiré | Remplacé par |
|--------|----------------|
| Bouton **Préférences dans cette troupe** | **Mon compte** → Préférences membre |
| `TroupeHubPreferencesSheet` | Composant supprimé ou déplacé vers `/compte` |
| Bouton **+ Nouvelle saison** (section Saisons) | Menu engrenage → **Nouvelle saison** |
| Bouton **Ouvrir** sur cartes saison | Carte entière cliquable (T11) |
| Footer **Explorer d’autres troupes** + liseret | Retiré ; découverte via `/troupes#decouvrir` (T12) |

---

## Ce qu’on conserve

| Élément | Note |
|---------|------|
| Grille cartes saisons | Contenu identique ; interaction carte entière (T11) |
| Toggle saisons archivées | Inchangé |
| Fil d’Ariane `Troupes › …` | Lien retour vers `/troupes` (accès liste + Découvrir) |
| Hint bac à sable (troupe démo) | Inchangé |
| **Membres** via engrenage | Inchangé (destination) |

---

## Alignement M3 (checklist)

| ID | Critère | Application |
|----|---------|-------------|
| M3-1 | Composants Material | `app-scope-admin-menu`, `MatDialog`, `mat-form-field`, `mat-checkbox`, `mat-card` interactive |
| M3-2 | Tokens | `var(--mat-sys-*)` ; pas de hex sur nouveaux styles |
| M3-3 | Mobile-first | Hero wrap ; menu engrenage 48dp ; dialog `min(100vw - 2rem, 28rem)` |
| M3-4 | a11y | Labels français ; `aria-label` gear ; champs pseudo avec `mat-label` |
| M3-5 | Nav membre | Pas de 4ᵉ onglet ; pas de bottom app bar M2 |

**Anti-patterns :** bouton stroked « préférences » dans le hero ; CTA primary concurrent dans l’en-tête Saisons ; bouton **Ouvrir** isolé sur une carte déjà cliquable ; footer découverte redondant ; formulaires troupe sur `/compte`.

---

## Implémentation — notes dev

| Tâche | Fichier / action |
|-------|------------------|
| Hub HTML/TS | Retirer prefs button + CTA Nouvelle saison + `<footer>` ; étendre `troupeAdminItems()` |
| `app-season-card` | Lien/block cliquable pleine surface ; retirer **Ouvrir** ; inputs `startDate` / `endDate` ; helper `formatSeasonPeriod` ; hover/focus tokens |
| API / migration | **17-30** — resync `event_count` ; voir BUG-004 (**hors 17-29**) |
| `season-card.spec.ts` | Ajouter : navigation au clic carte ; plus de bouton Ouvrir |
| Nouveau dialog | `troupe-edit-dialog.ts` (nom ; logo/description si API) |
| Supprimer / migrer | `troupe-hub-preferences-sheet.ts` → logique vers `account-placeholder` ou `member-preferences-section` |
| Mon compte | Remplacer section « Préférences par troupe » par formulaire pseudo + rôles |
| API | `PATCH /v1/troupes/{id}` ; endpoints préférences compte — **story dédiée** |
| Specs | Mettre à jour `troupe-hub.spec.ts`, `account-placeholder.spec.ts`, retirer `troupe-hub-preferences-sheet.spec.ts` |
| Docs | Amendement `ux-design-mon-compte.md`, Screen 3 `ux-design-scope-admin-menu-epic17.md`, Screen 4 `ux-design-journey-league-agenda.md` ; DOMAIN/SPEC si modèle pseudo change |

---

## Stories & FR (traceabilité)

| Réf | Impact |
|-----|--------|
| **FR9** | Pseudo membre — **passage de per-troupe à global** (changement spec — approbation PO requise) |
| **FR46 / 5.x** | Rôles préférés — idem global |
| **17.4** | Hub troupe — amendement AC (gear, retrait prefs, retrait CTA section, retrait footer découverte) |
| **17.3** | `/troupes#decouvrir` reste le point d’entrée découverte (agenda vide, accueil) — **plus** de lien depuis hub troupe |
| **17.24** | Mon compte — amendement section préférences |
| **2.11** | Création troupe — dialog Modifier réutilise validations nom |
| **2.2** | Admin Membres — override pseudo par membre **conservé** |

---

## Questions ouvertes (PO)

| # | Question | Recommandation UX |
|---|----------|-------------------|
| Q1 | Logo troupe : upload immédiat ou phase 2 ? | Dialog **Modifier** avec nom + description en v1 ; logo dès que migration API prête (T1). |
| Q2 | Migration des pseudos existants par troupe | À l’activation globale : prendre le pseudo de la **troupe la plus récemment visitée** ou le **plus long** non vide — documenter en ADR. |
| Q3 | Onglets Saisons / Membres (G-007 backlog) | **Hors scope** de cette révision ; le gear **Membres** reste jusqu’à story 17.26+. |

---

## Sign-off

| Question | Réponse attendue |
|----------|------------------|
| Gear : Modifier + Nouvelle saison + Membres ? | Oui (T1–T4) |
| Retrait Préférences dans cette troupe ? | Oui (T5) |
| Pseudo + rôles globaux sur Mon compte ? | Oui (T6) |
| Cartes saison entièrement cliquables (sans Ouvrir) ? | Oui (T11) |
| Période affichée sur carte si dates connues ? | Oui (T13) |
| Fix compteurs spectacles/participants (import) ? | **Story séparée 17-30** (T14) |
| FR9 per-troupe abandonné pour self-service ? | Oui — propagation multi-troupes via endpoints existants en 17-29 ; ADR global optionnel plus tard |

**Statut :** `approved` (2026-05-31) — implémentation : [17-29-refonte-hub-troupe-mon-compte-preferences.md](../implementation-artifacts/17-29-refonte-hub-troupe-mon-compte-preferences.md).
