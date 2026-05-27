---
title: UX — Page Mon compte (alignement hub membre)
author: Sally (UX) + Patrice
date: '2026-05-28'
status: approved
relatedStories:
  - '17.24'
  - '1.6'
  - '1.7'
  - '2.6'
  - '2.5'
  - '5.x'
stakeholderDecisions:
  - remove-pseudo-and-preferred-roles-from-compte
  - align-chrome-with-agenda-and-stats
  - settings-list-not-stacked-cards
  - troupe-prefs-delegated-to-troupe-hub-sheet
  - placeholders-for-planned-account-features
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-hub-a-faire.md
  - _bmad-output/planning-artifacts/epics.md
  - apps/web/src/app/pages/user-agenda/user-agenda.html
  - apps/web/src/app/pages/member-season-glance/member-season-glance.html
  - apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.ts
  - docs/v2/technical/FRONTEND_UI.md
---

# UX Design — Mon compte (`/compte`)

**Purpose:** Refondre l’écran **Mon compte** pour l’aligner sur les pages de **premier niveau** du shell membre (**Accueil**, **Agenda**, **Stats**), réduire le texte et la redondance avec les **préférences troupe**, et prévoir des **placeholders** pour les stories planifiées (Epic 1).

**Principle:** Mon compte = **identité et sécurité du compte HatCast** (global). Pseudo et rôles préférés = **adhésion par troupe** → uniquement via **Préférences dans cette troupe** sur le hub troupe (`TroupeHubPreferencesSheet`).

---

## Problème (état actuel)

| Point | Constat |
|-------|---------|
| **Chrome** | Empilement de `mat-card` avec titres/sous-titres longs ; pas de header `h1` + sous-titre comme Agenda / Stats. |
| **Verbosité** | Bloc intro « prochaine livraison », sous-titres répétitifs sur chaque carte. |
| **Redondance** | Sections **Pseudo par troupe** et **Rôles préférés par troupe** dupliquent le bottom sheet **Préférences dans cette troupe** (`/troupes/:slug`). |
| **Navigation** | Lien « Retour aux troupes » hors pattern shell (nav globale + menu avatar). |
| **Menu avatar** | Sur `/compte`, afficher le menu avec l’entrée « Mon compte » est redondant (l’utilisateur est déjà sur la page). |

Référence implémentation actuelle : [`account-placeholder`](../../apps/web/src/app/pages/account-placeholder/).

---

## Décisions produit

| # | Sujet | Décision |
|---|--------|----------|
| C1 | **Périmètre écran** | Compte **global** : photo de profil HatCast, identifiant (email), sécurité (email / mot de passe connecté), suppression de compte. **Pas** de pseudo ni rôles préférés par troupe. |
| C2 | **Préférences troupe** | Lien discret vers **Mes troupes** ; rappel une ligne : *Pseudo et rôles par défaut se règlent dans chaque troupe.* Action contextuelle : depuis une troupe → bouton existant **Préférences dans cette troupe**. |
| C3 | **Chrome page** | Même squelette que **Mon agenda** / **Mes Stats** : conteneur `max-width: 56rem`, header `h1` + `p` sous-titre, contenu en sections courtes. |
| C4 | **Structure contenu** | **`mat-nav-list` / `mat-list`** (sections + lignes action) plutôt que plusieurs `mat-card` outline avec paragraphes. |
| C5 | **Avatar** | Conserver la gestion **photo de profil** (story 2.6) en **tête de page** (zone compacte, pas une carte « Paramètres du compte »). |
| C6 | **Placeholders Epic 1** | Lignes **désactivées** ou boutons « Bientôt » avec `matTooltip` jusqu’à stories **1.6** / **1.7** — pas de faux formulaires email/mot de passe. |
| C7 | **PWA** | **Pas** sur cet écran — reste dans le menu avatar global (`Installer l'app`, FR40). |
| C8 | **Déconnexion** | **Pas** de menu avatar sur `/compte` ; **Déconnexion** en bas de liste (zone sensible) ou bouton texte footer — évite doublon « Mon compte » dans le menu. |
| C9 | **Nav shell** | `/compte` garde la **barre membre** (Accueil · Agenda · Stats) — [ux-hub-a-faire.md](ux-hub-a-faire.md) ; pas de 4ᵉ onglet « Compte ». |

---

## Parcours utilisateur

**Léa** ouvre le menu avatar depuis l’agenda → **Mon compte**. Elle voit son email et sa photo, change sa photo en deux taps, et repère que le changement de mot de passe arrive bientôt. Pour son pseudo à La Malice, elle retourne sur **Mes troupes**, ouvre la troupe, **Préférences dans cette troupe** — sans chercher la même chose sur Mon compte.

---

## Chrome (header)

Aligné sur [`user-agenda__header`](../../apps/web/src/app/pages/user-agenda/user-agenda.scss) et [`member-glance-page__header`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.scss).

```
┌────────────────────────────────────────────────────────────┐
│  Mon compte                                                 │
│  Identité et sécurité de ton compte HatCast.                │
└────────────────────────────────────────────────────────────┘
```

| Élément | Valeur |
|---------|--------|
| **Titre (`h1`)** | `Mon compte` |
| **Sous-titre** | `Identité et sécurité de ton compte HatCast.` (une ligne ; pas de paragraphe marketing) |
| **Actions header** | **Aucun** menu avatar sur cette route (C8) |
| **Typo** | `font-size: 1.75rem` titre ; sous-titre `opacity: 0.85`, `0.95rem` — tokens existants |

---

## Structure de la page

### Zone A — Identité (toujours visible après chargement session)

```
┌────────────────────────────────────────────────────────────┐
│  [Avatar 72px]   patrice@example.com                        │
│                  Léa Martin (si displayName)                │
│                  [ Choisir une image ]  [ Google ]  [ × ]   │
└────────────────────────────────────────────────────────────┘
```

| Règle | Détail |
|-------|--------|
| **Email** | Lecture seule, texte `body-large` ; pas de `mat-form-field` éditable tant que 1.6 non livrée. |
| **displayName** | Afficher si présent (nom compte / Google) ; édition **hors scope** sauf décision future explicite. |
| **Photo** | Boutons `mat-stroked-button` compacts ; formats / 2 Mo : **tooltip** sur « Choisir une image » ou aide `mat-hint` **une ligne** sous les boutons — pas de `mat-card-subtitle` long. |
| **Google** | Bouton « Utiliser ma photo Google » seulement si `hasGoogleAccount`. |

### Zone B — Préférences par troupe (renvoi, pas formulaire)

Une **`mat-list-item`** ou ligne texte + lien :

| Libellé | Comportement |
|---------|----------------|
| **Préférences par troupe** | `routerLink="/troupes"` — sous-texte optionnel : *Pseudo et rôles par défaut, troupe par troupe.* |
| **Icône** | `groups` |

Ne pas lister les troupes ni champs pseudo sur `/compte`.

### Zone C — Sécurité (placeholders story 1.6)

Section titre **Sécurité** (`overline` ou `subtitle-2` Material, pas de carte).

| Ligne | État MVP UX | Story |
|-------|-------------|-------|
| **Changer l’adresse e-mail** | `mat-list-item` + chevron ; `disabled` + badge texte `Bientôt` ou ouvre dialog placeholder « Fonctionnalité à venir » | 1.6 |
| **Changer le mot de passe** | Idem ; préciser en tooltip : *Différent du mot de passe oublié sur l’écran de connexion.* | 1.6 |

**Quand 1.6 est livrée :** chaque ligne ouvre un **`MatDialog`** dédié (pattern préférences / reset) — pas d’inline long sur la page.

Comptes **Google-only** : masquer « Changer le mot de passe » ou ligne désactivée + texte *Connexion via Google*.

### Zone D — Compte (placeholder story 1.7)

Section **Zone sensible** (séparateur visuel `outline-variant`).

| Ligne | État MVP UX | Story |
|-------|-------------|-------|
| **Supprimer mon compte** | `mat-list-item`, couleur `error`, `disabled` + `Bientôt` jusqu’à 1.7 | 1.7 |

**Quand 1.7 est livrée :** tap → dialog confirmation multi-étape (hors spec détaillée ici ; respecter NFR-S3).

### Zone E — Déconnexion

| Élément | Détail |
|---------|--------|
| **Bouton** | `mat-stroked-button` pleine largeur ou `mat-list-item` « Se déconnecter » en bas de page |
| **Action** | Même flux que [`UserAccountMenuItemsComponent`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) |

---

## Wireframe mobile (cible)

```
┌─────────────────────────┐
│ Mon compte              │
│ Identité et sécurité…   │
├─────────────────────────┤
│ [○]  email@…            │
│      Nom affiché        │
│ [Choisir] [Google]      │
├─────────────────────────┤
│ PRÉFÉRENCES TROUPE      │
│ › Préférences par troupe│
├─────────────────────────┤
│ SÉCURITÉ                │
│ › Changer l’e-mail  ⏳  │
│ › Mot de passe      ⏳  │
├─────────────────────────┤
│ › Supprimer le compte ⏳│
├─────────────────────────┤
│ [ Se déconnecter ]      │
└─────────────────────────┘
│ Accueil │ Agenda │ Stats│  ← shell existant
└─────────────────────────┘
```

---

## Ce qu’on retire de `/compte`

| Retiré | Remplacé par |
|--------|----------------|
| Carte « Paramètres du compte » + paragraphe livraison future | Sous-titre header + placeholders listés (C6) |
| **Pseudo par troupe** (N cartes × champs) | Hub troupe → `TroupeHubPreferencesSheet` |
| **Rôles préférés par troupe** | Idem |
| **Retour aux troupes** (footer) | Ligne « Préférences par troupe » + nav shell |
| Menu avatar en header | Déconnexion en page (C8) |

---

## Alignement M3 (checklist story)

| ID | Critère | Application `/compte` |
|----|---------|------------------------|
| M3-1 | Composants Material | `mat-list`, `mat-stroked-button`, `mat-spinner`, dialogs futurs 1.6/1.7 |
| M3-2 | Tokens | `var(--mat-sys-on-surface)`, `outline-variant`, `error` pour zone sensible |
| M3-3 | Mobile-first | Padding `1rem`, cibles ≥ 48dp sur lignes liste et boutons avatar |
| M3-4 | a11y | `aria-label` sur actions avatar ; titres de section via `aria-labelledby` |
| M3-5 | Pas bottom app bar M2 | Inchangé — nav membre existante |

**Anti-patterns à éviter :** empiler 4+ `mat-card` avec sous-titres multi-lignes ; formulaires troupe sur cette route ; couleurs hex en dur.

---

## Implémentation — notes dev

| Tâche | Fichier / action |
|-------|------------------|
| Renommer / refactor | `account-placeholder` → composant `account-settings` ou garder route, changer template + SCSS |
| Supprimer logique | Chargement liste troupes, pseudo, preferred roles dans [`account-placeholder.ts`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.ts) |
| SCSS partagé | Extraire optionnel mixin `member-page-shell` (header + max-width) partagé avec agenda / stats — **optionnel**, pas bloquant |
| Menu global | Dans `user-account-menu-items`, optionnel : masquer ou désactiver « Mon compte » quand `router.url` est `/compte` |
| Tests | Mettre à jour `account-placeholder.spec.ts` : plus de pseudo/roles ; présence placeholders 1.6/1.7 |

---

## Stories et FR

| Story | Contenu sur `/compte` |
|-------|------------------------|
| **1.6** | Activer lignes Sécurité + dialogs email / mot de passe connecté (FR36) |
| **1.7** | Activer suppression compte (FR37) |
| **2.6** | Photo de profil (déjà en place — conserver zone A) |
| **2.5** | Pseudo troupe — **uniquement** hub troupe, pas `/compte` |
| **5.x / FR46** | Rôles préférés — **uniquement** `TroupeHubPreferencesSheet` |

---

## Sign-off

| Question | Réponse attendue |
|----------|------------------|
| Pseudo / rôles hors Mon compte ? | Oui (C1) |
| Placeholders visibles avant 1.6/1.7 ? | Oui (C6) |
| Header sans menu avatar ? | Oui (C8) |

**Statut :** `approved` (2026-05-28) — story d’implémentation : [17-24-ecran-mon-compte-alignement-hub-membre.md](../implementation-artifacts/17-24-ecran-mon-compte-alignement-hub-membre.md).
