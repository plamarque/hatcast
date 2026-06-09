---
title: UX as-built — Onglet Dispos sondage (baseline figée)
author: Sally (UX) + Paige (Tech Writer) + Patrice
date: '2026-06-09'
status: approved
baseline: story-5-8-recette-2026-06-09
supersedes:
  - _bmad-output/planning-artifacts/ux-design-dispos-poll-2026-06-09.md (sections listées § Amendements)
relatedArtifacts:
  - apps/web/src/app/shared/availability/availability-poll-row.scss
  - apps/web/src/app/shared/availability/availability-poll-row.html
  - apps/web/src/app/shared/availability/event-dispos-tab.scss
  - apps/web/src/app/shared/availability/event-dispos-tab.html
  - apps/web/src/styles.scss
  - docs/v2/technical/FRONTEND_UI.md
  - _bmad-output/implementation-artifacts/5-8-dispos-onglet-sondage-unifie.md
stakeholderDecisions:
  - freeze-dispos-poll-ui-2026-06-09
---

# UX as-built — Onglet Dispos sondage (baseline figée)

**Purpose:** Capturer l’UI/UX **livrée et validée en recette** (2026-06-09) pour éviter les régressions lors de futures stories perf, refactors SCSS ou retouches mobile/desktop.

**Audience:** devs, reviewers, agents IA — **source normative** pour tout changement touchant `app-availability-poll`, `app-availability-poll-row`, toolbar proxy de `app-event-dispos-tab`.

**Spec initiale:** [ux-design-dispos-poll-2026-06-09.md](ux-design-dispos-poll-2026-06-09.md) (D1–D22). Ce document **complète et corrige** les écarts constatés en implémentation.

---

## Amendements par rapport au draft UX

| ID draft | Draft | **As-built (figé)** |
|----------|-------|---------------------|
| **D5** | Indispo actif ⇒ lignes rôles **désactivées** | Rôles **restent éditables** quand « Pas disponible » est coché ; cocher un rôle repasse en `available` et décoche implicitement Indispo. Seuls `readOnly` / `archived` désactivent les rôles. |
| **D11** | Bannière « Saisie pour le compte de… » | Toolbar : sélecteur + bandeau **sur une ligne** (mobile et desktop). Copy : **« Tu modifies les dispos de {displayName} »**. |
| **D18** | Pré-remplissage rôles préférés au **premier** clic rôle | **Non** — un clic rôle ne coche **que ce rôle** (parité `availability-form.toggleRole`, pas `applyPreferredPrecheck` au toggle). |
| **Copy Indispo** | `Indispo` | **`Pas disponible`** (ligne sondage). |
| **Wireframe mobile** | 3 lignes visuelles (label / jauge / stats) | **2 lignes** — stats sur la ligne du libellé (voir § Layout). |
| **Proxy tokens** | tertiary 34 % + `on-surface` | **`tertiary-container` 52 %** surface, texte **`on-tertiary-container`**, bordure tertiary 48 % (`--hatcast-proxy-banner-*` dans `styles.scss`). |

---

## Layout — ligne sondage (`app-availability-poll-row`)

### Règle d’or

| Viewport | Nombre de lignes | Contenu |
|----------|------------------|---------|
| **Mobile ≤ 480 px** | **2** | L1 : case + libellé + compteur + avatars · L2 : jauge pleine largeur |
| **Desktop > 480 px** | **2** | L1 : case + libellé · L2 : jauge indentée + compteur + avatars (flex horizontal) |

### Mobile (≤ 480 px) — wireframe figé

```
┌────────────────────────────────────────────────────────┐
│ ○  🎧 DJ                              2/1  [👤👤]      │  ← L1
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  ← L2 jauge 100 % width
└────────────────────────────────────────────────────────┘
```

**Implémentation CSS (obligatoire) :**

- `.poll-row__main` : **`display: grid`** uniquement dans `@media (max-width: 480px)`.
- `.poll-row__gauge-row` : **`display: contents`** en mobile (enfants participent à la grille parent).
- Zones grille : `vote` | `stats` (L1), `gauge` span 2 cols (L2).
- **Interdit :** appliquer la grille mobile par défaut (régression desktop : stats seuls sous le label, jauge absente).

### Desktop (> 480 px) — wireframe figé

```
┌────────────────────────────────────────────────────────┐
│ ○  🎧 DJ                                               │  ← L1
│      ████████████████░░░░░░░░░░░░  2/1  [👤👤]         │  ← L2 indent + flex
└────────────────────────────────────────────────────────┘
```

**Implémentation CSS (obligatoire) :**

- `.poll-row__main` : **`display: flex; flex-direction: column`** (défaut / `@media (min-width: 481px)`).
- `.poll-row__gauge-row` : **`display: flex`** — jauge (`flex: 1`) + stats à droite.
- Indent jauge : `--poll-gauge-indent: calc(1.375rem + 0.65rem)` (alignement sous le libellé, pas sous la case seule).
- Mobile : `--poll-gauge-indent: 0`.

### DOM figé (ne pas replier stats dans le bouton jauge)

```
poll-row__main
├── poll-row__vote-line          → mat-checkbox + label
└── poll-row__gauge-row
    ├── poll-row__gauge-trigger  → mat-progress-bar seul
    └── poll-row__stats-trigger  → counter + avatars + spinner
```

Les deux boutons appellent le même handler pool expand ; **ne pas** remettre compteur/avatars dans `gauge-trigger` sans adapter les deux breakpoints.

---

## Layout — toolbar proxy orga

Visible si `canSwitchSubject` + `subjectProxyMode`.

```
┌──────────────────────────┬─────────────────────────────────────┐
│ [Participant ▾ Patrice]  │ ⚠ Tu modifies les dispos de Patrice │
└──────────────────────────┴─────────────────────────────────────┘
```

| Règle | Détail |
|-------|--------|
| **Une seule ligne** | Mobile et desktop — **pas** de wrap vertical. |
| **Alignement hauteur** | `align-items: stretch` sur `.event-dispos__toolbar` ; hint sans `min-height` fixe — hauteur = sélecteur Material. |
| **Largeurs mobile** | Sélecteur ~**42 %** ; hint ~**58 %** ; texte hint ellipsis `nowrap`. |
| **Largeurs desktop** | Sélecteur `max-width: min(14rem, 48%)` ; hint `flex: 1`. |
| **Couleurs** | Tokens `--hatcast-proxy-banner-surface`, `-border`, `-on`, `-icon` — teinte **marron/orange tertiary**, pas gris neutre. |

---

## Interactions vote (non-régression)

| Action | Comportement figé |
|--------|-------------------|
| Cocher rôle X | Seul X ajouté (pas de pré-cochage des rôles préférés). |
| Cocher rôle alors que « Pas disponible » actif | Passe `available` avec ce rôle ; Indispo décoché. |
| Cocher « Pas disponible » | `unavailable`, rôles vidés côté API ; **rôles restent cliquables** à l’écran. |
| Hover zone vote | Fond commun sur **toute** `.poll-row__vote-line` (case + libellé), pas seulement la case Material. |
| Cases | Rondes style WhatsApp via SCSS sur `mat-checkbox` (`border-radius: 50%`), `disableRipple`. |

---

## Copy UI (authoritative)

| Clé | Texte figé |
|-----|------------|
| `poll.hint` | Sélectionnez une ou plusieurs options |
| `poll.choice.unavailable` | **Pas disponible** |
| `poll.choice.available-flat` | Dispo |
| `poll.proxy.hint` | **Tu modifies les dispos de {displayName}** |
| `poll.proxy.aria` | Tu modifies les dispos de {displayName}. Chaque vote s'enregistre au clic. |
| `poll.save-comment` | Enregistrer le commentaire |

---

## Tokens & fichiers CSS

| Fichier | Rôle |
|---------|------|
| `availability-poll-row.scss` | Layout 2 lignes, hover vote, cases rondes, jauge, avatars |
| `availability-poll.scss` | Conteneur liste, hint, commentaire |
| `event-dispos-tab.scss` | Toolbar proxy + sélecteur |
| `styles.scss` | `--hatcast-proxy-banner-*` |

**Interdit :** hex ad hoc, vert WhatsApp `#00a884`, `padding-inline-start` + `margin-inline-start` cumulés sur le pool-trigger mobile (double indent — cause overflow avatars).

---

## Checklist anti-régression (revue PR / checkpoint)

### Layout

- [ ] Mobile 375 px : **exactement 2 lignes** par vote ; compteur + avatars **à droite du libellé**, pas sous la jauge.
- [ ] Mobile : avatars **dans** le viewport (pas de débordement horizontal).
- [ ] Desktop : jauge **visible** sur L2 avec compteur + avatars **sur la même ligne**.
- [ ] Desktop : pas de grille `vote | stats` appliquée par erreur.

### Proxy

- [ ] Bandeau + sélecteur **même hauteur**, une ligne.
- [ ] Copy **« Tu modifies les dispos de … »** ; fond tertiary visible (pas gris plat).

### Vote

- [ ] Premier clic DJ → **seul DJ** coché (pas MC + Comédien·ne).
- [ ] Clic rôle avec « Pas disponible » actif → rôle coché, Indispo décoché.
- [ ] Rôles **non** grisés quand Indispo coché (sauf read-only / archivé).

### A11y / M3

- [ ] `mat-checkbox`, `mat-progress-bar`, tokens `--mat-sys-*`.
- [ ] `prefers-reduced-motion` : pas de transition jauge.

### Tests automatisés minimum

- [ ] `availability-poll.spec.ts` — toggle rôle seul, Indispo → rôle, proxy API.
- [ ] `event-dispos-tab.spec.ts` — rendu « Pas disponible », proxy.

---

## Tests manuels rapides (5 min)

1. Membre mobile : cocher DJ seul → un seul rôle.
2. Membre mobile : scroll horizontal absent sur la liste.
3. Orga mobile : toolbar proxy une ligne, teinte marron.
4. Desktop : jauge + 2/1 + avatars alignés sous le label.
5. Hover libellé = même fond que hover case.

---

## Références

- Story : [5-8-dispos-onglet-sondage-unifie.md](../implementation-artifacts/5-8-dispos-sondage-unifie.md)
- Technique : [FRONTEND_UI.md § Onglet Dispos sondage](../../docs/v2/technical/FRONTEND_UI.md)
- Spec initiale : [ux-design-dispos-poll-2026-06-09.md](ux-design-dispos-poll-2026-06-09.md)
