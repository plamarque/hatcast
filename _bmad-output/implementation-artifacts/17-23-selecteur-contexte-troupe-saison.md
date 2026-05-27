# Story 17.23 : Sélecteur de contexte troupe · saison (fil + menu)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created via /bmad-create-story 2026-05-27 -->

## Story

En tant qu’**organisateur ou membre actif** avec **plusieurs troupes ou plusieurs saisons**,  
je veux **changer de troupe ou de saison en un ou deux taps** depuis l’écran saison ou spectacle,  
afin de **ne pas repasser systématiquement par le hub troupe** tout en gardant le **fil d’Ariane** pour m’orienter.

## Acceptance Criteria

1. **Given** desktop (`min-width: 481px`) sur `/saison/:slug` ou détail spectacle (`/saison/:slug/event/:eventSlug`), **when** l’utilisateur a **au moins deux troupes** (`listMyTroupes` > 1) **ou** au moins **deux saisons listables** pour la troupe courante, **then** le segment **saison** du chrome affiche un **bouton sélecteur** (`{titre saison} ▾`) ouvrant un `mat-menu` — le fil conserve **logo + nom troupe** (lien hub) › sélecteur › (sur événement) titre spectacle en feuille. [Source: [ADR 0013 §2](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md) ; design-thinking 2026-05-25 ; wireframes UX 2026-05-27]
2. **Given** le menu ouvert, **when** affiché, **then** il contient au minimum : section **Troupes** (adhésions actives, troupe courante marquée) ; section **Saisons — {nom troupe}** (saisons de la troupe sélectionnée dans le menu, saison courante marquée) ; lien **Voir toutes mes troupes** → `/troupes` ; lien **Gérer les saisons sur la page troupe** → `/troupes/:troupeSlug`. [Source: wireframes UX 2026-05-27]
3. **Given** l’utilisateur choisit une **autre saison** (même troupe), **when** sélection, **then** navigation vers `saisonWorkspacePath(slug)` et persistance `rememberLastVisitedSeasonSlug(slug)` (même helper que [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts)). [Source: 17.1, 2.9]
4. **Given** l’utilisateur choisit une **autre troupe**, **when** sélection, **then** navigation vers `saisonWorkspacePath` de la **dernière saison visitée** de cette troupe si slug mémorisé et valide pour cette troupe (`TroupeSeasonResolverService.resolveSeasonSlug`) ; **sinon** vers `troupeHubPath(troupeSlug)`. [Source: post-login / `lastVisitedSeason` — voir Dev Notes]
5. **Given** **une seule troupe** et **une seule saison** listable pour l’utilisateur sur l’écran courant, **when** header rendu, **then** le sélecteur **n’est pas affiché** : comportement **identique à 17.1** (saison en texte / `aria-current` sur workspace saison). [Source: wireframes — réduction bruit mono-contexte]
6. **Given** mobile (`max-width: 480px`) sur saison ou spectacle, **when** sélecteur requis (AC5 faux), **then** une ligne **{titre saison} ▾** (ou **{troupe} · {saison} ▾** si place) est visible à côté du logo troupe dans le header ; le tap ouvre le **même menu** (ou `MatBottomSheet` si >8 entrées totales — décision Dev Notes) ; **ne pas** dupliquer un H1 saison identique sous le header si le titre est déjà dans le sélecteur (retirer ou alléger [`season__mobile-context`](../../apps/web/src/app/pages/season-home/season-home.html) / équivalent event). [Source: 17.1 mobile ; wireframes]
7. **Given** fil d’Ariane + compte, **when** tout écran couvert, **then** **pas** d’engrenage admin dans la ligne header ; raccourcis **Mon agenda** ([`app-member-agenda-shortcut`](../../apps/web/src/app/shared/member-cross-nav/member-agenda-shortcut.ts), story **17.18**) inchangés à droite. [Source: ux-design-scope-admin-menu-epic17.md]
8. **Given** chargement des listes troupes/saisons pour le menu, **when** en cours, **then** bouton sélecteur désactivé ou spinner inline ; **when** erreur API, **then** menu non ouvrable + comportement fil 17.1 conservé (liens hub existants). [Source: NFR robustesse]
9. **Given** clavier / lecteur d’écran, **when** focus sur le sélecteur, **then** `aria-label` français ex. `Changer de troupe ou de saison` ; entrées courantes avec `aria-current="true"` ou texte « (actuel) » ; séparateurs de menu accessibles. [Source: NFR-A1 ; G65]
10. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false` et `npm run build -w @hatcast/web`, **then** succès ; specs couvrent : affichage conditionnel (AC5), ouverture menu, navigation saison, fallback troupe, mobile, non-régression breadcrumb liens hub. [Source: repo norms]

**Couverture produit :** ADR 0013 §2 (complément wayfinding) ; Epic 17 navigation troupe-first ; **pas** de nouveau FR — améliore FR8 / FR51 (navigation multi-troupes). **Hors scope :** shell nav bar **17.22** (déjà livrée — ne pas y placer le sélecteur).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** le sélecteur livré, **when** rendu, **then** `mat-button` ou `mat-stroked-button` + `mat-menu` + `mat-menu-item` (+ `mat-divider` entre sections) ; icône `expand_more` sur le bouton ; **pas** de `<select>` HTML natif ni div menu custom. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** styles du sélecteur et du menu, **when** couleurs appliquées, **then** uniquement `var(--mat-sys-*)` / `color-mix` — pas de hex en dur sur la feature. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** bouton sélecteur affiché, **then** cible **≥ 48×48 dp** ; libellé tronqué avec ellipsis si besoin ; `aria-label` si texte masqué. [Source: FRONTEND_UI.md ; NFR-A1]

**M3-4. Navigation membre** — **Given** cette story, **when** livrée, **then** **ne pas** introduire de bottom app bar M2 ni modifier le périmètre de la nav bar **17.22** ; le sélecteur reste dans le **header contextuel** saison/événement uniquement (routes **hors** [`MemberShell`](../../apps/web/src/app/layout/member-shell/member-shell.ts) : pas de barre basse sur ces écrans). [Source: ux-hub-a-faire.md ; 17.22 non-goals]

**M3-5. Revue** — **Given** implémentation terminée, **when** validation story, **then** checklist M3 [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue ; écarts notés ci-dessous. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Service données menu** (AC: 2, 4, 5, 8)
  - [x] Ajouter [`apps/web/src/app/core/navigation/context-switcher-data.service.ts`](../../apps/web/src/app/core/navigation/context-switcher-data.service.ts) (+ spec) :
    - `TroupeApiService.listMyTroupes()` — même pattern que [`TroupeContextService`](../../apps/web/src/app/core/troupes/troupe-context.service.ts).
    - Par `troupeId` : `SeasonApiService.listSeasons(troupeId, page, size)` — **`SEASONS_PAGE_SIZE = 50`** comme [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts).
    - Signaux/computed : `showSwitcher`, `troupes[]`, `seasonsForTroupe(troupeId)`, chargement/erreur.
    - Règle AC5 : `showSwitcher === false` si `troupes.length <= 1` **et** saisons de la troupe courante `<= 1`.
  - [x] **Last season per troupe (AC4)** : étendre [`last-visited-league-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-league-storage.ts) avec map `troupeId → seasonSlug` (clé dédiée) mise à jour dans `rememberLastVisitedSeasonSlug` ; à la sélection troupe, `resolveSeasonSlug` pour valider avant navigation. MVP acceptable : une seule clé globale `lastVisitedSeason` + hub troupe si slug invalide pour la troupe cible.

- [x] **`app-context-switcher` (présentation)** (AC: 1, 2, 3, 4, 6, 9)
  - [x] Créer `apps/web/src/app/shared/context-switcher/` (`ts|html|scss|spec`).
  - [ ] Inputs : `troupeId`, `troupeSlug`, `troupeName`, `seasonSlug`, `seasonTitle`, `compact` (mobile).
  - [ ] Navigation : `Router.navigate` + `rememberLastVisitedSeasonSlug` ; imports depuis [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts).
  - [ ] Menu structuré (sections + liens bas de menu).

- [x] **Intégration `app-context-breadcrumb`** (AC: 1, 5, 6)
  - [x] [`context-breadcrumb.ts`](../../apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.ts) : remplacer le segment saison statique (lignes 27–35 du template desktop) par `<app-context-switcher>` quand `showSwitcher` ; conserver lien troupe + feuille événement.
  - [x] Mobile : slot à côté de [`context-breadcrumb__mobile-logo`](../../apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html) ; ajuster [`season-home.html`](../../apps/web/src/app/pages/season-home/season-home.html) (`season__mobile-context`) et event detail si AC6.

- [x] **Surfaces** (AC: 7, 10)
  - [x] [`season-header`](../../apps/web/src/app/pages/season-home/season-header.ts) + [`event-detail-header`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts) (déjà `app-context-breadcrumb`) — pas de logique dupliquée hors breadcrumb.
  - [x] Specs : [`context-breadcrumb.spec.ts`](../../apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts), [`season-header.spec.ts`](../../apps/web/src/app/pages/season-home/season-header.spec.ts).
  - [ ] **Optionnel P2** : admin avec breadcrumb saison (`admin-participants`, `admin-event-participants`) — sinon non-objectif.

- [x] **Tests & build** (AC: 10)
  - [x] Mocks `TroupeApiService` / `SeasonApiService` ; pas d’appels réseau en unit tests.
  - [x] `npm run test -w @hatcast/web -- --watch=false` ; `npm run build -w @hatcast/web`.

## Dev Notes

### Wireframes de référence (UX 2026-05-27)

**Desktop — fil + sélecteur (workspace saison)**

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [🎭] La Malice  ›  [ Festibask 2025-26        ▾ ]     [Agenda] [Patrice▾]│
├──────────────────────────────────────────────────────────────────────────┤
│  … season-view-toolbar …                                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

**Menu ▾**

```
│  Troupes
│  ● La Malice
│    Les Zinzins
│  ─────────────────
│  Saisons — La Malice
│  ● Festibask 2025-26
│    Apérock 2026
│  ─────────────────
│  Voir toutes mes troupes →
│  Gérer sur la page troupe →
```

**Mobile**

```
┌─────────────────────────────────────┐
│  [🎭]  Festibask 2025-26  ▾   [Agenda][▾]│
└─────────────────────────────────────┘
```

**Fil seul (mono-troupe + mono-saison)** — aucun changement visuel vs 17.1.

### Product and UX rules

| Rôle | Fil d’Ariane | Sélecteur ▾ |
|------|--------------|-------------|
| Orientation hiérarchique | Oui | Non |
| Changer troupe/saison rapidement | Liens parents seulement | Oui |
| Liste complète des troupes | Lien menu → `/troupes` | Oui |

- **Vocabulaire UI :** **Saison** (pas Ligue).
- Le **nom troupe** dans le fil reste un **lien hub** ; le sélecteur ne remplace pas ce lien.
- **Admin** : inchangé (`app-scope-admin-menu` dans toolbar, pas dans le header breadcrumb).
- **Shell 17.22** : la nav basse/rail n’apparaît que sur `/accueil`, `/agenda`, `/membre/:slug` ([`member-shell-nav-visibility.ts`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts)) — le sélecteur ne concerne **pas** ces routes.

### Last season per troupe (recommandation implémentation)

| Niveau | Comportement |
|--------|----------------|
| **MVP (AC4 minimum)** | Clé globale `lastVisitedSeason` ; changement de troupe → `resolveSeasonSlug(stored)` si la saison appartient à la troupe via resolver ; sinon `troupeHubPath`. |
| **Recommandé** | Map `lastVisitedSeasonByTroupe` (JSON localStorage) + mise à jour dans `rememberLastVisitedSeasonSlug` ; évite hub inutile quand l’utilisateur alterne entre deux troupes. |

Réutiliser [`TroupeSeasonResolverService`](../../apps/web/src/app/core/troupes/troupe-season-resolver.service.ts) pour valider un slug avant navigation (même logique que post-login).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Réutilisation | `TroupeApiService`, `SeasonApiService`, `troupe-routes.ts`, `context-breadcrumb`, `TroupeSeasonResolverService` |
| Performance | Charger saisons du menu **à l’ouverture** du menu (lazy) si `troupes.length > 3` |
| DRY | Un composant `app-context-switcher` ; pas de menu dupliqué dans season-header et event-header |
| i18n | Libellés menu en français |
| 17.22 | Ne pas déplacer le sélecteur dans `app-member-nav` |

### Code existant à réutiliser

| Fichier | Usage |
|---------|--------|
| [`context-breadcrumb/*`](../../apps/web/src/app/shared/context-breadcrumb/) | Point d’intégration principal (desktop trail + mobile logo) |
| [`season-header.html`](../../apps/web/src/app/pages/season-home/season-header.html) | Hôte breadcrumb workspace saison |
| [`event-detail-header.html`](../../apps/web/src/app/pages/event-detail/event-detail-header.html) | Hôte breadcrumb `layout="event"` |
| [`last-visited-league-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-league-storage.ts) | Persistance slug saison |
| [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts) | `troupeHubPath`, `saisonWorkspacePath`, `saisonEventPath` |
| [`troupes-list.ts`](../../apps/web/src/app/pages/troupes-list/troupes-list.ts) | Référence `listMyTroupes` |

### Explicit non-goals

- Pas de nouvelle route API.
- Pas de remplacement de `/troupes` ni du hub troupe.
- Pas de sélecteur sur `/agenda`, `/accueil`, `/troupes` (hors scope header contextuel).
- Pas de modification de `MemberShell` / `app-member-nav` (**17.22**).
- Pas de changement post-login (**17.20** / **2.9**).
- Pas de sélecteur sur spectacle pour changer d’**événement** (hors scope).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.1** | done | Breadcrumb de base ; cette story étend le segment saison |
| **17.3, 17.4** | done | Routes `/troupes`, hub troupe pour liens menu |
| **17.18** | done | Raccourcis agenda coexistants dans header right |
| **17.22** | done | Nav shell livrée — sélecteur **uniquement** header saison/event |
| **17.20** | backlog | Optionnel — map last visit élargie ; non bloquant |

## Dev Agent Record

### Agent Model Used

_(à remplir à l’implémentation)_

### Completion Notes List

- …

### File List

- _(à remplir)_

### Change Log

- 2026-05-27 : Story créée (UX breadcrumb + sélecteur, conversation produit).
- 2026-05-27 : Story **17.23** enrichie via `/bmad-create-story` — ancres code, dépendance **17.22** `done`, statut **ready-for-dev**.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ADR 0013, Epic 17)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC et chemins de fichiers réels
- [x] Liens vers code existant (`context-breadcrumb`, APIs troupe/saison, storage)
- [x] Tests web mentionnés
- [x] Conflit **17.22** documenté (sélecteur hors shell nav)
