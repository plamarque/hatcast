---
title: UX — Page Mon compte (alignement hub membre)
author: Sally (UX) + Patrice
date: '2026-06-03'
status: approved
relatedStories:
  - '17.36'
  - '17.35'
  - '17.34'
  - '17.33'
  - '17.25'
  - '1.6'
  - '1.7'
  - '2.6'
  - '8.1'
  - '8.2'
  - '10.3'
  - '10.2'
stakeholderDecisions:
  - global-member-preferences-on-compte
  - pseudo-on-identity-tab-not-preferences
  - rail-footer-shows-member-pseudo-not-compte-label
  - tabbed-layout-four-tabs-profile-merge
  - profile-tab-email-edit-icon
  - connection-modes-on-profile-tab
  - align-chrome-with-agenda-and-stats
  - settings-list-not-stacked-cards
  - placeholders-for-planned-account-features
  - logout-in-page-header
  - about-tab-identity-card-and-compact-action-rows
supersedes:
  - '2026-05-28 scroll layout (story 17.24) — structure remplacée par onglets 17.34'
  - '2026-06-06 onglet À propos — carte identité + lignes d’action (plus boutons pill version / MAJ)'
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-hub-a-faire.md
  - _bmad-output/planning-artifacts/ux-design-troupe-hub.md
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/implementation-artifacts/spec-about-manual-pwa-update-check.md
  - apps/web/src/app/pages/account-placeholder/account-placeholder.html
  - apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.html
  - apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts
  - docs/v2/technical/FRONTEND_UI.md
---

# UX Design — Mon compte (`/compte`)

**Purpose:** Écran **Mon compte** aligné sur le shell membre (**Accueil**, **Agenda**, **Stats**), organisé en **onglets** (story **17.34**, amendé **17.36**) pour réduire le scroll et clarifier les regroupements. **Profil unifié** sur le premier onglet **Mon profil** (avatar, e-mail, pseudo, modes de connexion, zone sensible) ; **rôles préférés globaux** sur **Préférences**.

**Principle:** Mon compte = **paramètres du compte HatCast** : profil et connexion, préférences de jeu (rôles), notifications, à propos. Pseudo et rôles préférés sont **uniques par utilisateur** (pas par troupe) — voir amendement [ux-design-troupe-hub.md](./ux-design-troupe-hub.md) § Mon compte — section Préférences membre.

**Historique :** La spec scroll unique (2026-05-28, story **17.24**) est **obsolète** pour la structure de navigation. **Amendement 2026-06-03 (révisé) :** **Se déconnecter** dans le **header de page** (C8b). **Amendement 2026-06-04 (a) :** pseudo sur **Identité** + rail pseudo (C2, C11) — story **17.35** `done`. **Amendement 2026-06-04 (b) — Sally :** fusion **Identité** + **Sécurité** → onglet **Mon profil** ; **4 onglets** ; e-mail modifiable via **icône crayon** (dialog **1.6**) ; section **Modes de connexion** (Google + mot de passe HatCast) ; **Supprimer mon compte** en bas du même onglet (C10) — story **17.36**.

---

## Problème (état après 17.35 — motivation amendement 17.36)

| Point | Constat |
|-------|---------|
| **Libellé « Identité »** | Peu explicite pour un membre ; « Mon profil » ou « Général » est plus parlant — choix produit : **Mon profil**. |
| **Doublon e-mail** | E-mail affiché en lecture seule sur Identité **et** ligne « Changer l’adresse e-mail » sur Sécurité — confusion. |
| **Sécurité isolée** | Mot de passe et suppression de compte sont des actions du **même** profil, pas un espace distinct. |
| **Liste pleine largeur** | Les lignes `mat-list-item` pour e-mail/MDP occupent trop d’espace ; l’e-mail doit se modifier **à côté** de l’adresse affichée. |

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
| C1 | **Périmètre écran** | Compte **global** : **profil** (**avatar**, **e-mail**, **pseudo**, modes de connexion, suppression), **rôles préférés globaux**, notifications push/catégories, version app. |
| C2 | **Pseudo membre** | **Un seul pseudo** (`memberDisplayName`) pour toutes les troupes — champ éditable sur l’onglet **Mon profil** (bloc profil avec genre, voir [ux-design-member-gender-parity.md](./ux-design-member-gender-parity.md) Screen 1). Max 255 ; non vide à l’enregistrement. **Pas** de hint sous le champ pseudo (2026-06-05). **Pas** de pseudo par troupe sur `/compte` ni dans le hub troupe. |
| C2b | **Rôles préférés** | **Un jeu de rôles préférés** pour toutes les troupes — formulaire sur l’onglet **Préférences** (grille `mat-checkbox` ; composant dérivé de `MemberPreferencesForm` **sans** le champ pseudo). |
| C3 | **Chrome page** | Même squelette que **Mon agenda** / **Mes Stats** : conteneur `max-width: 56rem`, header `h1` + `p` sous-titre. Typo L1/L2 : [`ux-design-hub-section-headers.md`](ux-design-hub-section-headers.md). |
| C4 | **Navigation interne** | **4 onglets** Material (`mat-tab-nav-bar` + `mat-tab-link` + routes enfants) — **Mon profil** · Préférences · Notifications · À propos. **Pas** d’onglet Sécurité séparé (fusion **17.36**). |
| C5 | **Avatar** | Gestion **photo de profil** (story **2.6**) en tête de l’onglet **Mon profil** — zone compacte inchangée. |
| C6 | **E-mail — édition** | E-mail affiché à côté de l’avatar ; action **modifier** = `mat-icon-button` icône `edit` (`aria-label` *Modifier l’adresse e-mail*, `data-testid="account-email-edit"`) ouvrant le dialog **1.6** — **pas** de ligne liste « Changer l’adresse e-mail ». |
| C12 | **Modes de connexion** | Section dédiée sous le pseudo : état **Google** (connecté si `hasGoogleAccount`) ; **mot de passe HatCast** (défini / non défini) avec bouton **Changer** ou **Définir** un mot de passe → dialog **1.6** ; conserver hint Google + secours si applicable (`data-testid="account-google-password-hint"`). |
| C7 | **PWA** | **Pas** sur cet écran — **Installer l'app** reste dans le menu compte global (FR40), story **17.25**. |
| C8a | **Menu compte sur `/compte`** | **Pas** de trigger menu compte (rail footer, avatar shell) sur `/compte` ni `/compte/*` — même règle qu’avant **17.25**. |
| C8b | **Déconnexion** | Bouton **Se déconnecter** dans le **header de page** (`account-placeholder`), aligné à **droite** du titre **Mon compte**, visible sur **tous** les onglets — **pas** dans le contenu d’un onglet, **pas** de footer sous le `router-outlet`. `mat-button` texte + icône `logout` ; libellé masqué ≤ 480 px avec `aria-label="Se déconnecter"`. Même flux que [`UserAccountMenuItemsComponent`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts). |
| C9 | **Nav shell** | `/compte` garde la **barre membre** (Accueil · Agenda · Stats) ; pas de 4ᵉ onglet « Compte ». |
| C10 | **Zone sensible** | **Pas d’onglet dédié** — « Supprimer mon compte » en bas de l’onglet **Mon profil**, séparé visuellement (`overline` **Zone sensible** + token `error`) ; `data-testid="account-delete"` inchangé. |
| C11 | **Libellé rail desktop** | Sur viewport **≥ 840 px**, le footer rail ([`member-account-menu-trigger`](../../apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.html) variant `rail-footer`) affiche sous l’avatar le **pseudo membre** (`memberDisplayName`, même source que C2) — **pas** le libellé générique « Compte ». Troncature `ellipsis` ; fallbacks si pseudo indisponible : **e-mail** → « Compte ». Mobile **< 840 px** : avatar seul inchangé ; `aria-label` = `Menu compte : {pseudo ou fallback}`. Voir [ux-hub-a-faire.md](./ux-hub-a-faire.md) § Menu compte. |

---

## Architecture — 4 onglets

| # | Onglet | Contenu | Icône M3 | Route |
|---|--------|---------|----------|-------|
| 1 | **Mon profil** | Avatar ; e-mail + **icône modifier** ; `displayName` auth si distinct ; **pseudo** ; **Modes de connexion** (Google, MDP) ; **Zone sensible** (suppression) | `person` | `/compte` (défaut) |
| 2 | **Préférences** | Rôles préférés globaux uniquement (sans pseudo) | `tune` | `/compte/preferences` |
| 3 | **Notifications** | Push (`PushNotificationsSection`) + catégories (`NotificationPreferencesSection`) | `notifications` | `/compte/notifications` |
| 4 | **À propos** | Carte identité app + actions (changelog, check MAJ PWA si SW actif) + copyright | `info` | `/compte/a-propos` |

**Compat routes obsolètes :** `/compte/securite` et `/compte/identite` → **redirect** vers `/compte` (`replaceUrl: true`) — liens e-mail, vérif compte, stories **1.6**/**1.7**.

**Déconnexion (C8b) :** dans le **header de page**, à droite du `h1` **Mon compte** (`mat-button`, icône `logout`, `data-testid="account-logout"`) — visible quel que soit l’onglet actif. Absente du contenu des onglets. Sur les autres routes membre, la déconnexion reste aussi dans le **menu compte global** (**17.25**).

### Deep links et compatibilité

| Entrée | Comportement |
|--------|--------------|
| `/compte` | Onglet **Mon profil** |
| `/compte/securite` | **Redirect** → `/compte` (compat **1.6**, **1.7**, vérif e-mail) |
| `/compte/identite` | **Redirect** → `/compte` |
| `/compte/notifications` | Onglet **Notifications** |
| `/compte#notifications` | **Redirect** vers `/compte/notifications` (compat story **10.6** — `PushOptInDialog`) |
| Menu avatar → Mon compte | `/compte` (Mon profil) |
| Post-login redirect `/compte` | Mon profil |

---

## Parcours utilisateur

**Léa** ouvre le menu avatar depuis l’agenda → **Mon compte**. Elle arrive sur **Mon profil**, change sa photo, tape l’icône crayon à côté de son e-mail pour le mettre à jour, ajuste son **pseudo**, puis consulte **Modes de connexion** pour définir un mot de passe secours. Elle bascule sur **Préférences** pour ses rôles par défaut, puis **Notifications** pour le push. **Se déconnecter** reste en haut à droite sur tous les onglets.

---

## Chrome (header)

Aligné sur [`user-agenda__header`](../../apps/web/src/app/pages/user-agenda/user-agenda.scss) et [`member-glance-page__header`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.scss).

```
┌────────────────────────────────────────────────────────────┐
│  Mon compte                          [ Se déconnecter ]    │
│  Paramètres de votre compte HatCast.                        │
├────────────────────────────────────────────────────────────┤
│  Mon profil │ Préférences │ Notifications │ À propos │
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

### Onglet 1 — Mon profil

```
┌────────────────────────────────────────────────────────────┐
│  [Avatar 72px]   patrice@example.com  [ ✎ ]               │
│                  Léa Martin (si displayName auth)         │
│                  [ menu photo : Choisir · Google · × ]      │
├────────────────────────────────────────────────────────────┤
│  Pseudo                                                     │
│  [ Léa________________________________ ]                    │
│  Nom affiché dans toutes vos troupes.                      │
│  [ Enregistrer ]                                            │
├────────────────────────────────────────────────────────────┤
│  Modes de connexion                                         │
│  Google — connecté                                          │
│  Mot de passe HatCast — défini                              │
│  [ Changer le mot de passe ]                                │
│  (hint secours Google si applicable)                      │
├────────────────────────────────────────────────────────────┤
│  ZONE SENSIBLE                                              │
│  › Supprimer mon compte                                     │
└────────────────────────────────────────────────────────────┘
```

| Règle | Détail |
|-------|--------|
| **Email** | Affiché en `body-large` à côté de l’avatar ; **pas** de ligne liste dédiée. **Modifier** : `mat-icon-button` `edit` (`data-testid="account-email-edit"`) → `AccountChangeEmailDialog` (**1.6**). Conserver `data-testid="account-change-email"` sur le déclencheur si tests existants — ou alias documenté en story **17.36**. |
| **Pseudo membre** | Bloc profil unifié : `mat-form-field` Pseudo + toggle genre + **un** **Enregistrer** (`data-testid="account-profile-save"`) ; API `GET/PATCH /v1/me/preferences`. Voir [ux-design-member-gender-parity.md](./ux-design-member-gender-parity.md) Screen 1. |
| **displayName auth** | Lecture seule sous l’e-mail si présent et **distinct** du pseudo. |
| **Photo** | Menu compact sur l’avatar (story **2.6**) ; « Utiliser ma photo Google » si `hasGoogleAccount`. |
| **Modes de connexion (C12)** | Titre section `h2` ou `overline` *Modes de connexion* ; lignes texte pour Google et MDP ; bouton texte ou `mat-stroked-button` pour MDP (`data-testid="account-reset-password"`) — libellé *Changer* / *Définir* selon `hasPasswordProvider` ; hint Google + secours conservé. |
| **Zone sensible (C10)** | Séparateur `outline-variant` ; `overline` **Zone sensible** ; ligne suppression `error` (`data-testid="account-delete"`) → dialog **1.7**. |
| **Déconnexion** | **Header de page** uniquement (C8b). |

### Onglet 2 — Préférences

Contenu : grille rôles préférés (extrait de [`MemberPreferencesForm`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts) **sans** le champ pseudo, ou composant dédié `MemberPreferredRolesForm`).

| Élément | Détail |
|---------|--------|
| **Rôles préférés** | Grille `mat-checkbox` (clés, labels, emoji, règle `volunteer` non désactivable). |
| **Enregistrement** | Bouton **Enregistrer** pour la section ; snack succès / erreur ; API `PATCH /v1/me/preferences` (`preferredRoleKeys` seul). |
| **Retiré de cet onglet** | Champ **Pseudo** (déplacé Identité, amendement 2026-06-04). |
| **Retiré (historique)** | Lien « Préférences par troupe », bottom sheet hub, pseudo par troupe. |

Source amendement troupe hub : [ux-design-troupe-hub.md](./ux-design-troupe-hub.md) § Mon compte — section Préférences membre.

### Onglet 3 — Notifications

| Bloc | Composant | Story |
|------|-----------|-------|
| **Notifications navigateur** | `PushNotificationsSection` | **8.1** |
| **Catégories** | `NotificationPreferencesSection` | **8.2** |

Ordre : push d’abord, puis préférences par catégorie. Pas de titre de section redondant si l’onglet porte déjà le libellé **Notifications**.

**Grammaire visuelle (amendement 2026-06-08) :** cartes groupe type Réglages iOS — fond page `surface`, cartes `surface-container-high` radius 16 px ; titres **Messages pour moi** / **Rappels automatiques** **hors carte** ; deux switchers **Cet appareil** / **E-mail** par ligne, layout horizontal même sur mobile. Spec normative : [`ux-notification-prefs-phase1-as-shipped-2026-06-08.md`](./ux-notification-prefs-phase1-as-shipped-2026-06-08.md) § Refresh visuel.

### Onglet 4 — À propos

**Amendement 2026-06-06** — carte identité + lignes d’action compactes (aligné Préférences / Notifications) ; check MAJ manuel (**10.2** + [spec-about-manual-pwa-update-check.md](../implementation-artifacts/spec-about-manual-pwa-update-check.md)).

```
┌────────────────────────────────────────────────────────────┐
│  [logo 48px]  HatCast                                      │
│               Version X.Y.Z                                │
├────────────────────────────────────────────────────────────┤
│  ✨ Nouveautés                                    ›        │
│  📲 Vérifier les mises à jour                     ›        │  ← si SW PWA actif
├────────────────────────────────────────────────────────────┤
│           © 2025–2026 Patrice Lamarque                     │
└────────────────────────────────────────────────────────────┘
```

| Élément | Détail |
|---------|--------|
| **Conteneur** | `account-page__about-panel` — même surface que `account-page__preferences-panel` (tokens M3, `surface-container` 55 %). |
| **Identité** | Logo HatCast 2 (48 px) + nom app + **Version X.Y.Z** en texte secondaire — **pas** de bouton pill version. |
| **Nouveautés** | Ligne action plate (`account-page__about-action`) : icône `new_releases`, libellé, chevron `chevron_right` ; clic → dialog changelog MatDialog (**10.3**). |
| **Vérifier les mises à jour** | Même pattern ; icône `system_update` ; visible **uniquement** si service worker actif (`SwUpdate.isEnabled`, prod / recette `--with-push`). Spinner pendant le check ; snackbar résultat (à jour / disponible / erreur). Si MAJ en attente → réaffiche la bannière **Mettre à jour** (**10.2**), y compris après dismiss session. |
| **Copyright** | Pied de carte, typo 0.75 rem, centré : `© 2025–2026 Patrice Lamarque`. |
| **Test ids** | `account-app-version` (libellé version) · `account-changelog` · `account-check-updates` · `account-about-copyright` |
| **Accessibilité** | Lignes action ≥ 48 dp ; `aria-label` dynamique pendant vérification MAJ ; titre section masqué visuellement (`account-page__visually-hidden`) — l’onglet porte déjà « À propos ». |
| **Hors scope** | Liens GitHub / licence MIT, badge environnement — story ultérieure ; pas de badge permanent « MAJ dispo » sur la ligne action. |

**Parcours MAJ en attente (non installée) :** l’app reste sur l’ancienne version ; le SW a téléchargé la nouvelle en arrière-plan. Bannière auto (**10.2**) ou check manuel → snackbar « Une mise à jour est disponible » + bannière → **Mettre à jour** → reload + changelog auto (**10.3**). Fermer la bannière = repousser (session), pas annuler la MAJ.

---

## Wireframe mobile (cible 17.34)

**Exemple — onglet Mon profil :**

```
┌─────────────────────────┐
│ Mon compte  [ Déco… ]   │  ← icône seule ≤ 480 px
│ Paramètres de votre…    │
├─────────────────────────┤
│ Profil│Préf│Notif│À propos│  ← 4 tabs scrollables
├─────────────────────────┤
│ [Avatar] email@… [✎]    │
│ Pseudo [___________]    │
│ Modes de connexion      │
│ [ Changer MDP ]         │
│ ZONE SENSIBLE           │
│ › Supprimer le compte   │
├─────────────────────────┤
│ Accueil │ Agenda │ Stats│
└─────────────────────────┘
```

---

## Ce qu’on retire / ne pas réintroduire

| Retiré | Remplacé par |
|--------|----------------|
| Page scroll unique (17.24) | Onglets (**17.34** → **4** onglets **17.36**) |
| Carte « Paramètres du compte » + paragraphe livraison | Sous-titre header + onglets |
| **5 onglets** dont **Sécurité** séparé (**17.34**) | **4 onglets** — fusion profil (**17.36**) |
| Onglet **Identité** | Onglet **Mon profil** |
| Ligne liste « Changer l’adresse e-mail » | Icône **edit** à côté de l’e-mail (C6) |
| **Pseudo par troupe** (N cartes) | Onglet **Mon profil** — pseudo global |
| **Rôles préférés par troupe** | Onglet **Préférences** — rôles globaux |
| **Pseudo sur onglet Préférences** (17.33–17.34) | Onglet **Mon profil** (**17.35**) |
| Lien **Préférences par troupe** → `/troupes` | Formulaire inline Préférences |
| `TroupeHubPreferencesSheet` | `MemberPreferencesForm` sur `/compte` |
| **Retour aux troupes** (footer) | Nav shell membre |
| Onglet **Zone sensible** séparé | Sous-section bas de **Mon profil** (C10) |
| Menu avatar en header | Pas de menu sur `/compte` (C8a) ; déconnexion header (C8b) |

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
| Routes enfants | `app.routes.ts` : `/compte`, `/compte/preferences`, `/compte/notifications`, `/compte/a-propos` ; redirect `securite` + `identite` → `''` (+ `#notifications`) |
| Fusion profil (**17.36**) | Fusionner `account-security-tab` dans `account-identity-tab` → renommer `account-profile-tab` ; retirer onglet Sécurité du shell |
| E-mail edit (C6) | `mat-icon-button` + dialog email ; supprimer ligne liste e-mail |
| Modes connexion (C12) | Section sous pseudo ; logique MDP/Google depuis ancien `account-security-tab.ts` |
| Rail pseudo (C11) | Inchangé **17.35** — rafraîchir après save pseudo sur Mon profil |
| Fragment legacy | Redirect `/compte#notifications` → `/compte/notifications` |
| Déconnexion | Dans le **shell** `account-placeholder` (header, C8b) — **pas** dans un onglet ni sous le `router-outlet` |
| Tests | `account-placeholder.spec.ts` : navigation onglets, deep links, présence sections ; `account-about-tab.spec.ts` : carte, changelog, check MAJ |
| À propos UI | `tabs/account-about-tab.html` + `account-placeholder.scss` (`.account-page__about-*`) |
| Story file | [17-34-mon-compte-onglets-securite-preferences.md](../implementation-artifacts/17-34-mon-compte-onglets-securite-preferences.md) |

---

## Stories et FR

| Story | Contenu sur `/compte` |
|-------|------------------------|
| **17.34** | Layout onglets, routes, redirect fragment, déconnexion header page (C8b) |
| **17.33** | API préférences membre globales (`/v1/me/preferences`) |
| **17.35** | Pseudo → profil ; Préférences = rôles seuls ; rail pseudo (C11) — `done` |
| **17.36** | Fusion **Mon profil** : 4 onglets, e-mail + icône edit, modes connexion, zone sensible — `done` |
| **1.6** | Dialogs email / MDP — déclenchés depuis **Mon profil** (FR36) |
| **1.7** | Suppression compte — bas **Mon profil** (FR37) |
| **2.6** | Photo de profil (onglet **Mon profil**) |
| **8.1** / **8.2** | Push + catégories (onglet **Notifications**) |
| **10.3** | Version + changelog (onglet **À propos**) |
| **10.2** | Check MAJ manuel + bannière apply-on-click (complète le parcours **À propos**) |
| **FR9** | Pseudo membre — **global** (amendement vs per-troupe) |
| **FR46** | Rôles préférés — **global** |

---

## Sign-off

| Question | Réponse |
|----------|---------|
| Pseudo / rôles **globaux** sur Mon compte ? | **Oui** (C1, C2, C2b) — 17.24 scroll obsolète |
| Pseudo sur **Mon profil**, rôles sur **Préférences** ? | **Oui** (C2 / C2b) |
| Rail desktop : pseudo sous l’avatar (pas « Compte ») ? | **Oui** (C11) |
| 4 onglets, fusion Identité + Sécurité ? | **Oui** (C4, amendement 2026-06-04b) |
| E-mail modifiable via icône à côté de l’adresse ? | **Oui** (C6) |
| Modes de connexion sous le pseudo ? | **Oui** (C12) |
| Zone sensible en bas de Mon profil ? | **Oui** (C10) |
| Déconnexion dans le header page (tous onglets) ? | **Oui** (C8b) |
| Header sans menu avatar ? | **Oui** (C8a) |

**Statut :** `approved` (2026-06-03, amendé 2026-06-04a pseudo/rail, **2026-06-04b** fusion Mon profil — Sally) — stories : [17-34](../implementation-artifacts/17-34-mon-compte-onglets-securite-preferences.md) `done` ; [17-35](../implementation-artifacts/17-35-mon-compte-pseudo-identite-rail-label.md) `done` ; [17-36](../implementation-artifacts/17-36-mon-compte-onglet-mon-profil.md) `done`.
