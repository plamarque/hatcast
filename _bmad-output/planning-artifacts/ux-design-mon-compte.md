---
title: UX — Page Mon compte (alignement hub membre)
author: Sally (UX) + Patrice
date: '2026-06-03'
status: approved
relatedStories:
  - '17.34'
  - '17.33'
  - '17.25'
  - '1.6'
  - '1.7'
  - '2.6'
  - '8.1'
  - '8.2'
  - '10.3'
stakeholderDecisions:
  - global-member-preferences-on-compte
  - tabbed-layout-five-tabs
  - align-chrome-with-agenda-and-stats
  - settings-list-not-stacked-cards
  - placeholders-for-planned-account-features
  - logout-in-page-header
supersedes:
  - '2026-05-28 scroll layout (story 17.24) — structure remplacée par onglets 17.34'
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-hub-a-faire.md
  - _bmad-output/planning-artifacts/ux-design-troupe-hub.md
  - _bmad-output/planning-artifacts/epics.md
  - apps/web/src/app/pages/account-placeholder/account-placeholder.html
  - apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts
  - docs/v2/technical/FRONTEND_UI.md
---

# UX Design — Mon compte (`/compte`)

**Purpose:** Écran **Mon compte** aligné sur le shell membre (**Accueil**, **Agenda**, **Stats**), organisé en **onglets** (story **17.34**) pour réduire le scroll et clarifier les regroupements. Préférences membre **globales** (pseudo + rôles préférés pour toutes les troupes) sur l’onglet **Préférences**.

**Principle:** Mon compte = **paramètres du compte HatCast** : identité, préférences membre globales, notifications, sécurité, à propos. Pseudo et rôles préférés sont **uniques par utilisateur** (pas par troupe) — voir amendement [ux-design-troupe-hub.md](./ux-design-troupe-hub.md) § Mon compte — section Préférences membre.

**Historique :** La spec scroll unique (2026-05-28, story **17.24**) est **obsolète** pour la structure de navigation ; le contenu fonctionnel qu’elle a introduit (header hub, placeholders 1.6/1.7) reste valide et est réparti dans les onglets ci-dessous. **Amendement 2026-06-03 (révisé) :** **Se déconnecter** dans le **header de page** (à droite du titre L1), visible depuis **tous** les onglets — remplace le placement dans l’onglet Identité (C8b).

---

## Problème (état avant 17.34)

| Point | Constat |
|-------|---------|
| **Longueur** | Toutes les sections empilées sur une seule page — scroll excessif sur mobile. |
| **Repérage** | Notifications et préférences noyées entre identité et sécurité. |
| **Deep links** | Le fragment `#notifications` (story **10.6**) fonctionne mais sans structure d’URL claire. |
| **Menu avatar** | Sur `/compte`, afficher le menu avec l’entrée « Mon compte » est redondant (C8a). |

Référence implémentation actuelle (scroll, pré-17.34) : [`account-placeholder`](../../apps/web/src/app/pages/account-placeholder/).

---

## Décisions produit

| # | Sujet | Décision |
|---|--------|----------|
| C1 | **Périmètre écran** | Compte **global** : identité, **pseudo membre**, **rôles préférés globaux**, notifications push/catégories, sécurité (email / mot de passe connecté), suppression de compte, version app. |
| C2 | **Préférences membre** | **Un seul pseudo** et **un jeu de rôles préférés** pour toutes les troupes — formulaire sur l’onglet **Préférences** (`MemberPreferencesForm`). **Pas** de pseudo par troupe sur `/compte` ni dans le hub troupe. |
| C3 | **Chrome page** | Même squelette que **Mon agenda** / **Mes Stats** : conteneur `max-width: 56rem`, header `h1` + `p` sous-titre. Typo L1/L2 : [`ux-design-hub-section-headers.md`](ux-design-hub-section-headers.md). |
| C4 | **Navigation interne** | **5 onglets** Material (`mat-tab-nav-bar` + `mat-tab-link` + routes enfants) — pas de scroll unique pour tout le contenu. |
| C5 | **Avatar** | Gestion **photo de profil** (story **2.6**) dans l’onglet **Identité** — zone compacte en tête d’onglet. |
| C6 | **Placeholders Epic 1** | Lignes **désactivées** ou badge « Bientôt » + `matTooltip` jusqu’à stories **1.6** / **1.7**. |
| C7 | **PWA** | **Pas** sur cet écran — **Installer l'app** reste dans le menu compte global (FR40), story **17.25**. |
| C8a | **Menu compte sur `/compte`** | **Pas** de trigger menu compte (rail footer, avatar shell) sur `/compte` ni `/compte/*` — même règle qu’avant **17.25**. |
| C8b | **Déconnexion** | Bouton **Se déconnecter** dans le **header de page** (`account-placeholder`), aligné à **droite** du titre **Mon compte**, visible sur **tous** les onglets — **pas** dans le contenu d’un onglet, **pas** de footer sous le `router-outlet`. `mat-button` texte + icône `logout` ; libellé masqué ≤ 480 px avec `aria-label="Se déconnecter"`. Même flux que [`UserAccountMenuItemsComponent`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts). |
| C9 | **Nav shell** | `/compte` garde la **barre membre** (Accueil · Agenda · Stats) ; pas de 4ᵉ onglet « Compte ». |
| C10 | **Zone sensible** | **Pas d’onglet dédié** — « Supprimer mon compte » en bas de l’onglet **Sécurité**, séparé visuellement (`overline` + token `error`). |

---

## Architecture — 5 onglets

| # | Onglet | Contenu | Icône M3 | Route |
|---|--------|---------|----------|-------|
| 1 | **Identité** | Avatar, email (lecture seule), nom affiché (`displayName`) | `person` | `/compte` (défaut) ou `/compte/identite` |
| 2 | **Préférences** | Pseudo membre + rôles préférés (`MemberPreferencesForm`) | `tune` | `/compte/preferences` |
| 3 | **Notifications** | Push (`PushNotificationsSection`) + catégories (`NotificationPreferencesSection`) | `notifications` | `/compte/notifications` |
| 4 | **Sécurité** | Changer e-mail · Changer MDP · hint Google-only · **Supprimer mon compte** (zone sensible) | `lock` | `/compte/securite` |
| 5 | **À propos** | Version app + ouverture changelog (`data-testid="account-app-version"`, story **10.3**) | `info` | `/compte/a-propos` |

**Déconnexion (C8b) :** dans le **header de page**, à droite du `h1` **Mon compte** (`mat-button`, icône `logout`, `data-testid="account-logout"`) — visible quel que soit l’onglet actif. Absente du contenu des onglets. Sur les autres routes membre, la déconnexion reste aussi dans le **menu compte global** (**17.25**).

### Deep links et compatibilité

| Entrée | Comportement |
|--------|--------------|
| `/compte` | Onglet **Identité** (redirect canonique si besoin depuis `/compte/identite`) |
| `/compte/notifications` | Onglet **Notifications** |
| `/compte#notifications` | **Redirect** vers `/compte/notifications` (compat story **10.6** — `PushOptInDialog`) |
| Menu avatar → Mon compte | `/compte` (Identité) |
| Post-login redirect `/compte` | Identité |

---

## Parcours utilisateur

**Léa** ouvre le menu avatar depuis l’agenda → **Mon compte**. Elle arrive sur **Identité**, change sa photo en deux taps, bascule sur **Préférences** pour ajuster son pseudo et ses rôles par défaut (valables dans toutes ses troupes), puis ouvre **Notifications** pour activer le push. Depuis n’importe quel onglet, **Se déconnecter** reste accessible en haut à droite — utile car le menu avatar est masqué sur `/compte`.

---

## Chrome (header)

Aligné sur [`user-agenda__header`](../../apps/web/src/app/pages/user-agenda/user-agenda.scss) et [`member-glance-page__header`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.scss).

```
┌────────────────────────────────────────────────────────────┐
│  Mon compte                          [ Se déconnecter ]    │
│  Paramètres de votre compte HatCast.                        │
├────────────────────────────────────────────────────────────┤
│  Identité │ Préférences │ Notifications │ Sécurité │ À propos│
└────────────────────────────────────────────────────────────┘
```

| Élément | Valeur |
|---------|--------|
| **Titre (`h1`)** | `Mon compte` |
| **Sous-titre** | `Paramètres de votre compte HatCast.` (une ligne) — voir [ux-voice-and-tone.md](./ux-voice-and-tone.md) |
| **Barre d’onglets** | Sous le sous-titre ; **scrollable horizontalement** sur mobile (`mat-tab-nav-bar`) |
| **Actions header** | **Se déconnecter** à droite du titre (C8b) ; **aucun** menu avatar sur cette route (C8a) |
| **Typo** | `font-size: 1.75rem` titre ; sous-titre `opacity: 0.85`, `0.95rem` |
| **Layout header** | Ligne 1 : `flex` `space-between` — `h1` à gauche, action à droite ; ligne 2 : sous-titre pleine largeur |

---

## Contenu par onglet

### Onglet 1 — Identité

```
┌────────────────────────────────────────────────────────────┐
│  [Avatar 72px]   patrice@example.com                        │
│                  Léa Martin (si displayName)                │
│                  [ menu photo : Choisir · Google · × ]      │
└────────────────────────────────────────────────────────────┘
```

| Règle | Détail |
|-------|--------|
| **Email** | Lecture seule, `body-large` ; pas de champ éditable tant que **1.6** non livrée. |
| **displayName** | Afficher si présent ; édition **hors scope** sauf décision future. |
| **Photo** | Menu compact sur l’avatar (pattern actuel `account-placeholder`) ; formats / 2 Mo via tooltip ou hint une ligne. |
| **Google** | « Utiliser ma photo Google » seulement si `hasGoogleAccount`. |
| **Déconnexion** | **Header de page** uniquement (C8b) — **pas** dans cet onglet. |

### Onglet 2 — Préférences

Contenu : [`MemberPreferencesForm`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts).

| Élément | Détail |
|---------|--------|
| **Pseudo** | Un `mat-form-field` ; hint : *Nom affiché dans toutes vos troupes.* ; max 255 ; non vide à l’enregistrement. |
| **Rôles préférés** | Grille `mat-checkbox` (clés, labels, emoji, règle `volunteer` non désactivable). |
| **Enregistrement** | Bouton **Enregistrer** pour la section ; snack succès / erreur. |
| **Retiré** | Lien « Préférences par troupe », bottom sheet hub, pseudo par troupe. |

Source amendement troupe hub : [ux-design-troupe-hub.md](./ux-design-troupe-hub.md) § Mon compte — section Préférences membre.

### Onglet 3 — Notifications

| Bloc | Composant | Story |
|------|-----------|-------|
| **Notifications navigateur** | `PushNotificationsSection` | **8.1** |
| **Catégories** | `NotificationPreferencesSection` | **8.2** |

Ordre : push d’abord, puis préférences par catégorie. Pas de titre de section redondant si l’onglet porte déjà le libellé **Notifications**.

### Onglet 4 — Sécurité

**Partie haute — Connexion**

| Ligne | État avant **1.6** | Story |
|-------|-------------------|-------|
| **Changer l’adresse e-mail** | `disabled` + badge **Bientôt** + `matTooltip` | **1.6** |
| **Changer le mot de passe** | Idem ; tooltip : *Différent du mot de passe oublié sur l’écran de connexion.* | **1.6** |

Comptes **Google-only** : pas de ligne mot de passe ; hint *Connexion via Google — pas de mot de passe HatCast.*

**Quand 1.6 est livrée :** chaque ligne ouvre un **`MatDialog`** dédié.

**Partie basse — Zone sensible** (séparateur `outline-variant`, `overline` **Zone sensible**)

| Ligne | État avant **1.7** | Story |
|-------|-------------------|-------|
| **Supprimer mon compte** | `mat-list-item`, couleur `error`, `disabled` + **Bientôt** | **1.7** |

**Quand 1.7 est livrée :** tap → dialog confirmation multi-étape (NFR-S3).

### Onglet 5 — À propos

| Élément | Détail |
|---------|--------|
| **Version** | Bouton `mat-stroked-button` avec logo HatCast 2 + `vX.Y.Z` ; clic → dialog changelog (**10.3**) |
| **Test id** | `data-testid="account-app-version"` — stable pour déplacements futurs |
| **Hors scope 10.3** | Liens GitHub/MIT, badge environnement — réservés story ultérieure |

---

## Wireframe mobile (cible 17.34)

**Exemple — onglet Identité :**

```
┌─────────────────────────┐
│ Mon compte  [ Déco… ]   │  ← icône seule ≤ 480 px
│ Paramètres de votre…    │
├─────────────────────────┤
│ Identité│Préf│Notif│…   │  ← tabs scrollables
├─────────────────────────┤
│ [Avatar] email@…        │
├─────────────────────────┤
│ Accueil │ Agenda │ Stats│
└─────────────────────────┘
```

**Exemple — onglet Sécurité (sans déconnexion) :**

```
├─────────────────────────┤
│ … │ Sécurité │ …       │
├─────────────────────────┤
│ › Changer l’e-mail  ⏳  │
│ › Mot de passe      ⏳  │
│ ─────────────────────── │
│ ZONE SENSIBLE           │
│ › Supprimer le compte ⏳│
└─────────────────────────┘
```

---

## Ce qu’on retire / ne pas réintroduire

| Retiré | Remplacé par |
|--------|----------------|
| Page scroll unique (17.24) | 5 onglets (**17.34**) |
| Carte « Paramètres du compte » + paragraphe livraison | Sous-titre header + onglets |
| **Pseudo par troupe** (N cartes) | Onglet **Préférences** — pseudo global |
| **Rôles préférés par troupe** | Onglet **Préférences** — rôles globaux |
| Lien **Préférences par troupe** → `/troupes` | Formulaire inline Préférences |
| `TroupeHubPreferencesSheet` | `MemberPreferencesForm` sur `/compte` |
| **Retour aux troupes** (footer) | Nav shell membre |
| Onglet **Zone sensible** séparé | Sous-section dans **Sécurité** (C10) |
| Menu avatar en header | Pas de menu sur `/compte` (C8a) ; déconnexion dans le header page (C8b) |

---

## Alignement M3 (checklist story)

| ID | Critère | Application `/compte` |
|----|---------|------------------------|
| M3-1 | Composants Material | `mat-tab-nav-bar`, `mat-tab-link`, `mat-list`, `mat-stroked-button`, `mat-spinner`, dialogs **1.6**/**1.7**/**10.3** |
| M3-2 | Tokens | `var(--mat-sys-on-surface)`, `outline-variant`, `error` zone sensible |
| M3-3 | Mobile-first | Tabs scrollables ; padding `1rem` ; cibles ≥ 48dp |
| M3-4 | a11y | `aria-label` actions avatar ; panel onglet avec `role="tabpanel"` ; libellés tabs en français |
| M3-5 | Pas bottom app bar M2 | Nav membre existante inchangée |

**Anti-patterns :** empiler 4+ `mat-card` avec sous-titres longs ; 6+ onglets dont un quasi vide ; formulaires pseudo **par troupe** ; couleurs hex en dur ; contenu dupliqué entre onglets via `@if` sans router-outlet.

---

## Implémentation — notes dev (17.34)

| Tâche | Fichier / action |
|-------|------------------|
| Routes enfants | `app.routes.ts` : `/compte`, `/compte/preferences`, `/compte/notifications`, `/compte/securite`, `/compte/a-propos` (+ redirect `#notifications`) |
| Shell onglets | `account-placeholder` (ou `account-settings`) : header + `mat-tab-nav-bar` + `<router-outlet>` |
| Extraire panels | Optionnel : un composant par onglet sous `pages/account/` |
| Fragment legacy | Redirect `/compte#notifications` → `/compte/notifications` |
| Déconnexion | Dans le **shell** `account-placeholder` (header, C8b) — **pas** dans un onglet ni sous le `router-outlet` |
| Tests | `account-placeholder.spec.ts` : navigation onglets, deep links, présence sections ; conserver tests avatar / version |
| Story file | [17-34-mon-compte-onglets-securite-preferences.md](../implementation-artifacts/17-34-mon-compte-onglets-securite-preferences.md) |

---

## Stories et FR

| Story | Contenu sur `/compte` |
|-------|------------------------|
| **17.34** | Layout onglets, routes, redirect fragment, déconnexion header page (C8b) |
| **17.33** | Formulaire préférences membre (onglet **Préférences**) |
| **1.6** | Activer lignes Sécurité + dialogs email / mot de passe (FR36) |
| **1.7** | Activer suppression compte (FR37) |
| **2.6** | Photo de profil (onglet **Identité**) |
| **8.1** / **8.2** | Push + catégories (onglet **Notifications**) |
| **10.3** | Version + changelog (onglet **À propos**) |
| **FR9** | Pseudo membre — **global** (amendement vs per-troupe) |
| **FR46** | Rôles préférés — **global** |

---

## Sign-off

| Question | Réponse |
|----------|---------|
| Pseudo / rôles **globaux** sur Mon compte ? | **Oui** (C1, C2) — 17.24 scroll obsolète |
| 5 onglets sans « Zone sensible » séparé ? | **Oui** (C10) |
| Déconnexion dans le header page (tous onglets) ? | **Oui** (C8b) — amendement 2026-06-03 révisé |
| Placeholders visibles avant 1.6/1.7 ? | **Oui** (C6) |
| Header sans menu avatar ? | **Oui** (C8a) |

**Statut :** `approved` (2026-06-03) — story d’implémentation : [17-34-mon-compte-onglets-securite-preferences.md](../implementation-artifacts/17-34-mon-compte-onglets-securite-preferences.md).
