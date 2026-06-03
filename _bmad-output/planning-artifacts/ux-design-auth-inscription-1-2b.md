---
title: UX — Inscription et connexion dédiées (Story 1.2b)
author: Patrice + Sally (UX) + bmad-ux
date: '2026-06-03'
status: approved
relatedStories:
  - '1.2'
  - '1.2b'
  - '1.1'
  - '1.3'
stakeholderDecisions:
  - two-routes-connexion-inscription
  - no-shared-form-dual-intent
  - confirm-password-on-signup-only
  - keep-direct-idp-signup-not-v1-email-wizard
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-2026-06-03/EXPERIENCE.md
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-2026-06-03/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-2026-06-03/.decision-log.md
  - _bmad-output/implementation-artifacts/1-2-inscription-et-connexion-email-mot-de-passe.md
  - _bmad-output/planning-artifacts/ux-hub-a-faire.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/src/app/pages/login/
---

# UX Design — Auth inscription / connexion (1.2b)

**Purpose:** Remplacer le pattern ambigu de la story **1.2** (lien « Créer un compte » sur `/connexion` qui réutilise le formulaire de connexion) par **deux intentions explicites** — sans changer le backend Identity Platform.

**Principle:** Même habillage visuel, **deux routes**, **un CTA primaire par page**, flux email **direct** (pas de machine à étapes V1).

**Spines (source de vérité expérience + visuel) :**

- [EXPERIENCE.md](ux-designs/ux-hatcast-2026-06-03/EXPERIENCE.md) — IA, flux, anti-patterns, accessibilité
- [DESIGN.md](ux-designs/ux-hatcast-2026-06-03/DESIGN.md) — chrome M3 auth (extension du thème global)

---

## Problème (état actuel — 1.2)

| Point | Constat |
|-------|---------|
| **Intention** | Titre **Connexion** + CTA **Se connecter** alors que l’inscription passe par un lien texte |
| **Formulaire** | Un seul `emailForm` sert connexion et `registerWithEmail()` |
| **Inscription** | Pas de confirmation de mot de passe |
| **Découverte** | Utilisateur pense qu’il n’y a que Google si le bloc email est masqué (config) |

Référence : [`login.html`](../../apps/web/src/app/pages/login/login.html) lignes 81–86 (bouton `registerWithEmail`).

---

## Décisions produit

| # | Sujet | Décision |
|---|--------|----------|
| A1 | Routes | `/connexion` (connexion) + **`/inscription`** (création compte) |
| A2 | CTA | Connexion : **Se connecter** uniquement. Inscription : **Créer mon compte** uniquement |
| A3 | Google | Bloc **Continuer avec Google** identique en tête des **deux** pages |
| A4 | MDP | Confirmation **uniquement** sur `/inscription` |
| A5 | Liens | Footer : *Pas de compte ?* → `/inscription` ; *Déjà un compte ?* → `/connexion` (`routerLink`, pas `click` sur le même form) |
| A6 | Technique | Réutiliser logique 1.2 (`createUserWithEmailAndPassword`, `finishIdpSignIn`) — **pas** de nouveau endpoint |
| A7 | Hors scope | Harmoniser layout `/mot-de-passe-oublie` ; flux email V1 en plusieurs étapes |

---

## Wireframe ASCII (mobile)

### `/connexion`

```
┌─────────────────────────────┐
│      [logo] HatCast         │
│        Connexion            │
│  Pour continuer vers HatCast│
│                             │
│  [ Continuer avec Google ]  │
│         ── ou ──            │
│  Email                      │
│  Mot de passe               │
│  [x] Se souvenir  Oublié ?  │
│  [    Se connecter      ]   │
│  Pas de compte ? Créer →    │
└─────────────────────────────┘
```

### `/inscription`

```
┌─────────────────────────────┐
│      [logo] HatCast         │
│     Créer un compte         │
│ Rejoins HatCast pour…       │
│                             │
│  [ Continuer avec Google ]  │
│         ── ou ──            │
│  Email                      │
│  Mot de passe               │
│  Confirmer le mot de passe  │
│  [  Créer mon compte    ]   │
│  Déjà un compte ? Connexion │
└─────────────────────────────┘
```

---

## Acceptance Criteria — fonctionnels (pour story 1.2b)

1. **Route `/inscription`** : composant dédié, titre **Créer un compte**, tagline une ligne, formulaire email + MDP + **confirmation MDP**.
2. **Soumission inscription** : si MDP ≠ confirmation → message *Les deux mots de passe ne correspondent pas.* (snackbar), pas d’appel IdP ; sinon `createUserWithEmailAndPassword` + session comme 1.2.
3. **`/connexion`** : supprimer l’appel `registerWithEmail()` depuis le footer ; lien **Créer un compte** → `routerLink="/inscription"` (conserver query `returnUrl` si présent).
4. **Google** : même implémentation GSI sur `/inscription` que sur `/connexion` (réutiliser service / pattern overlay existant).
5. **`hasEmailAuth()` false** : pas de lien vers formulaire email vide ; Google seul (+ hint dev inchangé).
6. **Tests** : unitaires sur inscription (mismatch MDP, navigation liens) ; ajuster tests `login` qui supposent `registerWithEmail` sur connexion.

## Acceptance Criteria — Material 3 (UI)

| ID | Critère |
|----|---------|
| M3-1 | `mat-card` outlined, champs `mat-form-field` outline, boutons Material — [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) |
| M3-2 | Couleurs / fond via `var(--mat-sys-*)` — coque `.auth-page` comme login |
| M3-3 | Mobile ≤ 480px : carte pleine largeur, CTA pleine largeur |
| M3-4 | Cibles tactiles ≥ 48dp sur CTA et liens footer |
| M3-5 | `h1` et CTA primaire cohérents avec l’intention de la page |

---

## Notes d’implémentation (Amelia)

| Tâche suggérée | Détail |
|----------------|--------|
| Route | Ajouter `{ path: 'inscription', component: Signup }` dans `app.routes.ts` |
| Partage | Extraire optionnel `AuthCardShell` (brand + google + separator) pour éviter duplication ; styles : réutiliser `login.scss` → `auth.scss` ou classes partagées |
| Connexion | Retirer `registerWithEmail` du template connexion ; garder `signInWithEmail` |
| Redirect | Propager `returnUrl` / query de `/connexion` vers `/inscription` et inversement |
| OpenAPI | Aucun changement (1.2) |

**Fichiers probables :** `apps/web/src/app/pages/signup/` (nouveau), `login/login.html`, `login/login.ts`, `app.routes.ts`, specs associés.

---

## Recette manuelle (cutover 1.2 + 1.2b)

1. `/connexion` → email existant → **Se connecter** → app membre.
2. `/connexion` → **Créer un compte** → `/inscription` → compte neuf → **Créer mon compte** → app membre.
3. `/inscription` → MDP différents → message, pas de compte créé.
4. Google depuis `/inscription` → même succès qu’ depuis `/connexion`.
5. Config Firebase absente (dev) → pas de lien inscription email trompeur.

---

## Suite BMad

1. `bmad-create-story` — story **1.2b** en citant ce fichier + EXPERIENCE.md
2. `bmad-dev-story` — implémentation
3. Recette gate **1.2** (PLAN.md) inclut le parcours via `/inscription`
