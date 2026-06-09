---
title: UX — Onglet Dispos en mode sondage (inspiré WhatsApp)
author: Sally (UX) + Patrice
date: '2026-06-09'
status: approved
asBuiltBaseline: ux-design-dispos-poll-as-built-2026-06-09.md
relatedArtifacts:
  - apps/web/src/app/shared/availability/event-dispos-tab.ts
  - apps/web/src/app/shared/availability/availability-form.ts
  - apps/web/src/app/shared/availability/availability-tous-panel.ts
  - apps/web/src/app/shared/composition/composition-pool-preview.ts
  - _bmad-output/planning-artifacts/ux-design-role-toggle-chips.md
  - _bmad-output/planning-artifacts/ux-event-draft-publish-3-21.md
  - _bmad-output/planning-artifacts/ux-design-factor-breakdown-19-7.md
  - _bmad-output/planning-artifacts/ux-design-dispos-poll-as-built-2026-06-09.md
  - _bmad-output/planning-artifacts/ux-design-pill-tab-bar.md
  - DOMAIN.md
stakeholderDecisions:
  - unified-poll-view-replaces-moi-tous-for-members
  - save-on-click-for-votes-roles
  - comment-separate-save-button
  - orga-keeps-subject-selector-pulldown
  - progress-bar-shows-candidates-over-slots-not-chance-percent
  - progress-bar-animates-on-vote-check-uncheck
  - dispos-tab-icon-ballot-not-grid
  - dispos-tab-icon-ballot-approved-2026-06-09
---

# UX Design — Onglet Dispos en mode sondage

**Purpose:** Remplacer le couple **Moi / Tous** par une **vue sondage unifiée** sur l’onglet Dispos du détail spectacle : chaque ligne = un choix (Pas disponible ou rôle), vote par case à cocher, jauge collective candidats/postes, pool dépliable. Pattern familier (sondages WhatsApp) ; une seule lecture pour voter **et** voir l’état du groupe.

> **Baseline figée (recette 2026-06-09) :** voir [ux-design-dispos-poll-as-built-2026-06-09.md](ux-design-dispos-poll-as-built-2026-06-09.md) pour layout mobile/desktop, copy proxy, amendements D5/D11/D18 et checklist anti-régression. **Ce doc prime sur le wireframe ci-dessous en cas de conflit.**

**Périmètre :** `apps/web/` — onglet Dispos (`app-event-dispos-tab`) et composants availability associés. **Pas de changement API** attendu (réutilise `GET summary` + `PUT availability` existants).

---

## User story

> En tant que **membre d’une troupe**,  
> je veux **indiquer ma disponibilité et voir où en est le groupe sur le même écran**,  
> afin de **ne pas basculer entre deux vues et comprendre d’un coup d’œil quels rôles manquent de candidats**.

> En tant qu’**organisateur ou admin**,  
> je veux **la même vue sondage avec la possibilité de voter au nom d’un membre**,  
> afin de **saisir les dispos pour quelqu’un d’autre sans perdre la lecture collective**.

---

## Problème (état actuel)

| Point | Constat |
|-------|---------|
| **Double navigation** | Toggle Moi / Tous oblige à changer de mode pour voter vs lire le groupe. |
| **Info fragmentée** | Les pools par rôle sont dans des accordéons (Tous) ; le vote est dans un formulaire séparé (Moi). |
| **Charge cognitive** | Statut (Dispo / Pas dispo / N/R) + chips rôles + bouton Enregistrer = trois zones distinctes. |
| **Familiarité** | Les troupes utilisent déjà les sondages WhatsApp ; le pattern Moi/Tous est spécifique HatCast. |

---

## Design decisions

| ID | Decision |
|----|----------|
| **D1** | **Supprimer le toggle Moi / Tous** pour tous les viewers. Une seule vue sondage. |
| **D2** | **Une ligne par choix** : d’abord **Indispo**, puis une ligne par **rôle requis** sur l’événement (ordre `ROLE_DISPLAY_ORDER` / `candidateRolesForEvent`). |
| **D3** | **Vote multi-sélection** sur les rôles (comme sondage WhatsApp multi-choix). Cocher = candidater pour ce rôle ; décocher = retirer ce rôle. |
| **D4** | **Tout décoché** (y compris Indispo) = statut **`unknown`** (non renseigné). |
| **D5** | **Indispo exclusif** : cocher « Pas disponible » enregistre **`unavailable`** et vide `role_keys`. **As-built :** les lignes rôles **restent éditables** ; cocher un rôle repasse en `available` et décoche Indispo. Désactivation rôles = `readOnly` ou `archived` seulement. |
| **D6** | **Au moins un rôle coché** ⇒ statut **`available`** + `role_keys` correspondants. Indispo décoché implicitement. |
| **D7** | **Enregistrement immédiat au clic** sur une case (vote / dévote). Pas de bouton « Enregistrer rôles ». Feedback : spinner inline sur la ligne ou snackbar courte en cas d’erreur (réutiliser pattern status auto-save actuel). |
| **D8** | **Jauge par rôle** = `candidats / postes à pourvoir`, **plafonnée à 100 %** si candidats ≥ postes. **Ce n’est pas** le `%` de chance au tirage (FR24) — voir D12. |
| **D9** | **Bout de ligne** : jusqu’à **3 avatars** superposés (les plus récents ou ordre API) + **compteur** `N` candidats. Zone cliquable **distincte** de la case à cocher. |
| **D10** | **Clic jauge / avatars / compteur** ⇒ **déplie le pool** sous la ligne (`app-composition-pool-preview`, tags marron existants — capture 2). Second clic ou clic ailleurs ⇒ replie. Un seul pool ouvert à la fois (accordion behavior). |
| **D11** | **Sélecteur participant** en tête pour orgas/admins (`canSwitchSubject`) ; bandeau proxy **sur la même ligne**. Copy : **« Tu modifies les dispos de {displayName} »** ; tokens `--hatcast-proxy-banner-*` (teinte tertiary marron/orange). |
| **D12** | **Cotes % (explainability)** : **pas** sur la jauge D8. Si `explainabilityEnabled` et données présentes, les `%` restent **dans le pool déplié** (segments interactifs + breakdown sheet — comportement Tous actuel). |
| **D13** | **Commentaire** en bas du sondage : `mat-form-field` + bouton **« Enregistrer le commentaire »** (sauvegarde **uniquement** le commentaire, pas les votes). Visible quand statut ≠ `unknown` ou commentaire non vide (parité formulaire actuel). |
| **D14** | **Événement sans rôles** (`totalSlots === 0`) : variante **sondage plat** — deux lignes **Indispo** / **Dispo** (pas de lignes rôles). Jauge globale `disponibles / effectif`. Pas de pool par rôle. |
| **D15** | **Brouillon spectacle** : bandeau existant ; pas de sondage interactif (inchangé story 3.21). |
| **D16** | **Archivé / lecture seule** : cases désactivées ; jauges et pools restent consultables. |
| **D17** | **Règle bénévole obligatoire** inchangée : cocher Comédien·ne auto-ajoute Bénévole si requis. Retour UX : **snackbar** courte « Bénévole ajouté (obligatoire sur ce format) » + micro-animation sur la ligne Bénévole (scale ou highlight token `--mat-sys-primary` 300 ms). |
| **D18** | **Préférences rôles** : au toggle d’un rôle, **ne cocher que ce rôle** — pas de pré-remplissage multi-rôles depuis les préférences compte (parité `availability-form.toggleRole`). Le precheck préférences s’applique au passage statut **Dispo** dans le formulaire dialog, pas au sondage. |
| **D19** | **Libellés rôles** : inclusifs selon genre du **sujet** votant (`subject.gender`), pas du viewer — parité 2.12b. |
| **D20** | **Material 3** : pas de vert WhatsApp en dur ; tokens `--mat-sys-*`. Inspiration WhatsApp = **layout**, pas palette. |
| **D21** | **Animation jauge au vote** : quand le sujet **coche ou décoche** une ligne (rôle, Indispo ou Dispo), la **jauge de cette ligne** et le **compteur `N/M`** évoluent avec une **transition fluide** (remplissage qui avance ou recule) — pas un saut instantané. Même comportement en **optimistic UI** (dès le clic, avant réponse API) ; **revert** sans animation brusque si erreur save. |
| **D22** | **Icône onglet Dispos** : remplacer `grid_on` (grille Moi/Tous héritée) par **`ballot`** (Material Symbols) — liste à coches, lecture « sondage ». Libellé texte **Dispos** inchangé. Cohérence avec les autres onglets (`info`, `groups`, `history`). |

---

## Wireframe — spectacle avec rôles (mobile ≤ 480 px)

**Figé as-built** — 2 lignes par vote (stats sur L1, pas sous la jauge) :

```
┌─────────────────────────────────────────────────────────┐
│ [Participant ▾]  │ ⚠ Tu modifies les dispos de Camille…  │  ← orga, 1 ligne
├─────────────────────────────────────────────────────────┤
│ Sélectionnez une ou plusieurs options                     │
├─────────────────────────────────────────────────────────┤
│ ○  Pas disponible                        9   [👤👤👤]     │  ← L1
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │  ← L2 jauge
├─────────────────────────────────────────────────────────┤
│ ●  🎭 Comédien·ne                     4/12  [👤👤👤]     │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
└─────────────────────────────────────────────────────────┘
```

**Desktop :** L1 = case + libellé ; L2 = jauge indentée + compteur + avatars (même ligne). Détail complet : [as-built](ux-design-dispos-poll-as-built-2026-06-09.md).

---

## Anatomie d’une ligne (`app-availability-poll-row`)

| Zone | Composant / pattern | Interaction | Rôle a11y |
|------|---------------------|-------------|-----------|
| **Case** | `mat-checkbox` ou ligne `role="checkbox"` + `mat-checkbox` | Toggle vote propre au sujet | `aria-checked`, label = nom du choix |
| **Libellé** | Texte + emoji rôle (`aria-hidden` sur emoji) | — | inclus dans label case |
| **Jauge** | `mat-progress-bar` mode `determinate` **ou** barre custom tokenisée | Ouvre / ferme pool | `role="button"`, `aria-expanded`, `aria-label="Voir les N candidats pour {rôle}"` |
| **Compteur** | `N` ou `N/M` | Même hit area que jauge | annoncé dans `aria-label` jauge |
| **Avatars** | `app-user-avatar` stack (max 3) | Même hit area que jauge | décoratif si label jauge complet |
| **Pool** | `app-composition-pool-preview` | Segments interactifs si explainability | region `aria-label="Candidats pour {rôle}"` |

**Séparation des hit areas (D10) :** la case a sa propre zone ≥ 48 dp ; la jauge+avatars forment une zone cliquable distincte (min-height 40 dp documenté — voir § M3 waivers).

---

## États et transitions

### Matrice vote (sujet éditable)

| État UI | `status` API | `role_keys` |
|---------|--------------|-------------|
| Rien coché | `unknown` | `[]` |
| Indispo seul | `unavailable` | `[]` |
| ≥ 1 rôle coché | `available` | clés cochées |
| Indispo + rôle (interdit) | — | Indispo prioritaire ; rôles décochés avant save |

### Transitions au clic

```
                    ┌─────────────┐
         tout décoché│   unknown   │
                    └──────┬──────┘
           coche Indispo   │   coche rôle(s)
                    ┌──────▼──────┐         ┌──────────────┐
                    │ unavailable │         │  available   │
                    └─────────────┘         └──────┬───────┘
                           ▲                       │
                           │ coche Indispo         │ décoche tout
                           └───────────────────────┘
```

| Action | Effet immédiat (optimistic UI) | API |
|--------|-------------------------------|-----|
| Cocher rôle | Indispo décoché ; rôle ajouté ; save | `PUT` availability |
| Décocher rôle | Si dernier rôle → `unknown` ; sinon maj `role_keys` | `PUT` |
| Cocher Indispo | Tous rôles décochés + disabled ; save `unavailable` | `PUT` |
| Décocher Indispo | → `unknown` si aucun rôle | `PUT` |
| Cocher 2e rôle | Ajout à `role_keys` | `PUT` |

### États visuels ligne

| État | Case | Jauge | Pool |
|------|------|-------|------|
| **Non coché (éditable)** | cercle vide | neutre `outline-variant` | fermé |
| **Coché (éditable)** | primary + check | fill primary | fermé |
| **Indispo actif** | coché ; lignes rôles **disabled** | rôles grisés | — |
| **Saving** | case disabled + spinner inline | — | — |
| **Read-only** | disabled, état reflété | cliquable (lecture pool) | ouvrable |
| **Erreur save** | revert état précédent + snackbar | — | — |

### Ligne Indispo — traitement visuel

- Jauge : teinte **sémantique indisponibilité** (`--hatcast-v1-unavailable` ou `--mat-sys-error-container` en `color-mix`) — pas la même couleur que les rôles « positifs ».
- Compteur = nombre de participants `unavailable` (pas de ratio /M).

---

## Jauge candidats / postes (D8)

```
fillPercent = min(100, round(100 * candidates.length / max(1, requiredCount)))
```

| Cas | Affichage compteur | Jauge |
|-----|-------------------|-------|
| `0 / 4` | `0` ou `0/4` (préférer **`0/4`** pour clarté orga) | vide |
| `2 / 4` | `2/4` | 50 % |
| `12 / 4` | `12/4` | **100 %** (plafond) |
| `0 / 0` (slot 0) | ligne masquée ou « — » | N/A — ne pas afficher de ligne rôle sans slot |

**Hint sous-titre (optionnel, orga)** : si au moins un rôle &lt; 50 % rempli, badge discret « Rôles à pourvoir » — *hors MVP si scope serré*.

### Animation jauge au vote (D21)

Feedback visuel type sondage WhatsApp : le groupe « bouge » sous tes doigts.

| Événement | Lignes animées |
|-----------|----------------|
| Cocher un **rôle** | Jauge + compteur de **ce rôle** (+1 candidat, fill % recalculé) |
| Décocher un **rôle** | Idem en sens inverse (−1) |
| Cocher **Indispo** | Jauge Indispo (+1) ; si le sujet quittait des rôles, jauges de **chaque rôle** concerné reculent |
| Décocher **Indispo** | Jauge Indispo (−1) |
| Variante **Dispo** (sans rôles) | Jauge Dispo ou Indispo selon le choix |
| **Bénévole auto** (D17) | Jauges des **deux** rôles touchés (Comédien·ne + Bénévole) enchaînées ou simultanées |
| Erreur API | Revert case + jauge/compteur vers valeurs serveur (transition courte acceptable) |
| Chargement initial / changement sujet proxy | **Pas** d’animation longue — valeur affichée directement ou fade ≤ 150 ms |

**Paramètres motion (défaut implémentation) :**

- Durée : **250–300 ms**
- Courbe : `cubic-bezier(0.4, 0, 0.2, 1)` (standard M3 easing) ou `ease-out`
- Cible : `value` du `mat-progress-bar` **et** texte compteur (changement immédiat du nombre ; la barre transitionne)
- **`prefers-reduced-motion: reduce`** : pas de transition — mise à jour instantanée (NFR-A1 / WCAG)

**Implémentation suggérée :** SCSS sur `.mat-mdc-progress-bar` (transition `transform` / `width` du segment primary) ; patch optimiste du summary local **avant** `PUT` pour déclencher l’animation au clic.

---

## Variante sans rôles (D14)

```
┌────────────────────────────────────────┐
│ ○  Indispo          ████████░░  3/18    │
│ ●  Dispo            ██████████  15/18   │
└────────────────────────────────────────┘
```

- **Dispo** = `available` avec `role_keys: []` (dispo générale, parité DOMAIN).
- **Indispo** = `unavailable`.
- Mutualité exclusive (radio-like UX, mais implémentation via même composant ligne avec règle exclusivité).
- Liste participants indisponibles / disponibles : optionnel MVP+ (tap compteur → liste noms) — *non requis v1*.

---

## Commentaire (D13)

| Règle | Détail |
|-------|--------|
| Position | Sous la dernière ligne sondage, au-dessus du safe-area bottom |
| Champ | `mat-form-field` outline, 500 car. max |
| Bouton | `mat-flat-button` « Enregistrer le commentaire » |
| Dirty state | Hint « Modifications non enregistrées » si texte ≠ sauvegardé |
| Disabled | read-only, archived, saving |
| Scope save | `scope: 'details'`, commentaire seul — **ne pas** renvoyer les rôles si inchangés |

---

## Toolbar — ce qui change / reste

| Élément | Avant | Après |
|---------|-------|-------|
| Toggle Moi / Tous | visible tous | **supprimé** |
| `app-availability-subject-selector` | orga, mode Moi | orga, **toujours visible** en tête |
| Bannière proxy | mode proxy | **inchangée** |
| Hint explainability estimated/snapshot | mode Tous | **sous-titre global** sous toolbar si chances chargées pour pools |

---

## Chargement données & perf

| Topic | Règle |
|-------|-------|
| **API** | `GET /availability/summary` au mount onglet (inchangé). |
| **Chances** | Charger `chancePercent` **à la demande** : au premier expand pool d’un rôle, ou lazy batch si API le permet — éviter de bloquer le premier paint (G-003 / PERF-03). |
| **Refresh** | Après vote réussi : patch optimiste summary local (comme `patchSubjectInSummary`) + recalcul compteurs lignes ; reload complet si échec ou si commentaire save. |
| **Tab gating** | Conserver chargement différé si PERF-03 en place — le sondage ne charge que quand onglet Dispos actif. |

---

## Composants — architecture front proposée

| Composant | Responsabilité |
|-----------|----------------|
| `app-event-dispos-tab` | Orchestration : summary, subject, proxy, draft guard |
| `app-availability-poll` *(nouveau)* | Liste lignes + commentaire ; remplace Moi panel + Tous panel |
| `app-availability-poll-row` *(nouveau)* | Une ligne : case, jauge, avatars, expand pool |
| `app-composition-pool-preview` | **Réutilisé** tel quel dans expand |
| `availability-form` | **Déprécié** pour onglet Dispos (peut rester pour dialog agenda si utilisé ailleurs) |

**Migration :** vérifier `availability-dialog` / agenda — si réutilise `availability-form`, **ne pas supprimer** le formulaire ; extraire logique persist dans service partagé.

---

## Copy (français UI)

| Clé | Texte |
|-----|-------|
| `poll.hint` | Sélectionnez une ou plusieurs options |
| `poll.choice.unavailable` | Pas disponible |
| `poll.proxy.hint` | Tu modifies les dispos de {displayName} |
| `poll.choice.available-flat` | Dispo |
| `poll.save-comment` | Enregistrer le commentaire |
| `poll.saving` | Enregistrement… |
| `poll.volunteer-auto` | Bénévole ajouté (obligatoire sur ce format) |
| `poll.pool-aria` | Voir les {n} candidats pour {role} |
| `poll.error-save` | Impossible d'enregistrer. Réessayez. |

---

## Acceptance Criteria — prêts pour story

1. **AC-01 — Vue unifiée** — **Given** un membre sur l’onglet Dispos d’un spectacle publié avec rôles, **when** le summary est chargé, **then** il voit **une liste sondage** (Indispo + rôles) **sans** toggle Moi/Tous. [Source: D1]

2. **AC-02 — Vote multi-rôles** — **Given** un sujet éditable, **when** il coche deux rôles, **then** statut `available` et `role_keys` contient les deux ; enregistrement **immédiat** sans bouton rôles. [Source: D3, D6, D7]

3. **AC-03 — Non renseigné** — **Given** un sujet avec rôles cochés, **when** il décoche tout (y compris Indispo), **then** statut `unknown`. [Source: D4]

4. **AC-04 — Indispo exclusif** — **Given** un sujet avec rôles cochés, **when** il coche Indispo, **then** rôles décochés et désactivés, statut `unavailable`. [Source: D5]

5. **AC-05 — Jauge** — **Given** un rôle avec 4 candidats et 12 postes, **when** la ligne s’affiche, **then** jauge à 33 % et compteur `4/12` ; avec 20 candidats et 4 postes, jauge **100 %** et compteur `20/4`. [Source: D8]

6. **AC-06 — Pool** — **Given** une ligne avec candidats, **when** l’utilisateur tape jauge ou avatars, **then** le pool `composition-pool-preview` s’affiche sous la ligne ; un seul pool ouvert à la fois. [Source: D9, D10]

7. **AC-07 — Pas de % sur jauge** — **Given** explainability activée, **when** la ligne s’affiche, **then** la jauge **ne** montre **pas** le `chancePercent` ; les % restent dans le pool / breakdown. [Source: D12 ; FR24]

8. **AC-08 — Orga proxy** — **Given** `canSwitchSubject`, **when** l’orga change le sujet, **then** les cases reflètent les votes du sujet sélectionné et la bannière proxy s’affiche. [Source: D11]

9. **AC-09 — Commentaire** — **Given** un sujet `available`, **when** il saisit un commentaire et clique Enregistrer le commentaire, **then** seul le commentaire est persisté. [Source: D13]

10. **AC-10 — Sans rôles** — **Given** un événement sans `roleSlots`, **when** l’onglet s’affiche, **then** variante deux lignes Indispo / Dispo (D14).

11. **AC-11 — Brouillon / archivé** — **Given** spectacle brouillon (membre) ou archivé, **then** comportement inchangé story 3.21 / lecture seule (D15, D16).

12. **AC-12 — Bénévole auto** — **Given** format impose bénévole avec comédien·ne, **when** le membre coche Comédien·ne, **then** Bénévole coché automatiquement + snackbar D17.

13. **AC-13 — Animation jauge** — **Given** un sujet éditable et une ligne rôle à `3/12` (25 %), **when** il coche ce rôle, **then** la jauge **anime** vers `4/12` (~33 %) en ≤ 300 ms ; **when** il décoche, **then** retour animé vers `3/12`. **Given** `prefers-reduced-motion: reduce`, **then** mise à jour **sans** transition. [Source: D21]

14. **AC-14 — Icône onglet** — **Given** le détail spectacle, **when** la barre d’onglets s’affiche, **then** l’onglet Dispos utilise `mat-icon` **`ballot`** (pas `grid_on`). [Source: D22]

---

## Icône onglet Dispos (D22)

| Option Material | Verdict | Raison |
|-----------------|---------|--------|
| **`ballot`** ✅ | **Retenu — validé Patrice 2026-06-09** | Liste à cases — proche sondage WhatsApp multi-choix |
| `how_to_vote` | Rejeté | Urne électorale — trop « élection », pas « dispo troupe » |
| `poll` | Rejeté | Histogramme — lecture analytics, pas vote |
| `checklist` | Rejeté | Tâches / todo — ambigu avec hub « À faire » |
| `grid_on` (actuel) | Déprécié | Grille Moi/Tous — ne correspond plus au contenu |

**Fichier :** [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) ligne onglet Dispos — changement d’une ligne, livré avec story **5.8**.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Cases : `mat-checkbox` ; jauge : `mat-progress-bar` (determinate) ou barre tokenisée documentée ; commentaire : `mat-form-field` + `mat-flat-button` ; pas de boutons HTML custom. [Source: FRONTEND_UI.md]

**M3-2. Tokens** — Couleurs via `--mat-sys-primary`, `on-surface-variant`, `outline-variant` ; état indispo via tokens sémantiques participation (`_hatcast-semantic-colors.scss`). **Pas** `#00a884` WhatsApp. [Source: D20]

**M3-3. Mobile & tactile** — Case ≥ 48 dp ; zone pool-trigger ≥ 40 dp (waiver documenté ici, aligné 19.7 pool segments). `aria-label` français sur jauge et cases. [Source: NFR-A1]

**M3-4. Navigation membre** — **N/A** (contenu d’onglet existant ; pas de changement chrome).

**M3-5. Revue** — Checklist FRONTEND_UI.md en fin d’implémentation ; waivers ci-dessus recopiés dans story Dev Notes.

---

## Explicit non-goals (v1)

- Refonte API summary ou nouveaux endpoints.
- Afficher la liste nominative complète des indisponibles en mode sans-rôles (MVP+).
- Copier pixel-perfect l’UI WhatsApp (couleurs, typo).
- Remplacer `availability-form` dans les **dialogs** agenda (sauf décision ultérieure).
- Bouton « Voir les votes » global (chaque ligne a son expand).
- Mode « Tous » séparé pour export / partage.

---

## Dependencies & impacts

| Artifact | Impact |
|----------|--------|
| `ux-design-role-toggle-chips.md` | Dispos **n’utilise plus** `RoleToggleChipSet` pour la saisie — mettre à jour tableau « Quand utiliser » après ship. |
| `event-dispos-tab.spec.ts` | Réécrire tests Moi/Tous → sondage. |
| `availability-tous-panel` | **Retirer** de Dispos (peut rester si réutilisé ailleurs). |
| Story PERF-03 | Compatible (tab-gated load). |
| FR19 / FR24 | Lecture collective conservée ; % chance déplacés visuellement vers pool uniquement. |

---

## Test plan (manuel)

1. Membre : tout décoché → unknown ; cocher 1 rôle → available + save ; ajouter 2e rôle ; tout décocher.
2. Membre : cocher Indispo depuis rôles cochés → unavailable, rôles grisés.
3. Orga : changer sujet → votes corrects ; banner proxy.
4. Rôle 12/4 candidats → jauge pleine, compteur 12/4.
5. Tap jauge → pool ; tap autre ligne → premier pool fermé.
6. Explainability : % visibles dans pool, pas sur jauge.
7. Commentaire seul → save sans toucher rôles.
8. Format bénévole+comédien → auto bénévole + snackbar.
9. Événement sans rôles → 2 lignes.
10. Brouillon membre → hint, pas de vote.
11. Mobile 375 px : pas de chevauchement case / jauge.
12. Cocher rôle : jauge avance ; décocher : jauge recule ; reduced-motion → instantané.

---

## Open questions

| ID | Question | Recommandation Sally |
|----|----------|---------------------|
| **Q1** | Compteur `4` vs `4/12` ? | **`N/M` toujours** pour les rôles — plus clair pour les orgas. |
| **Q2** | Dialog agenda : même sondage ou formulaire actuel ? | **Garder formulaire compact** dans dialog pour v1 ; aligner plus tard. |
| **Q3** | Pré-expand premier rôle sous-rempli ? | **Non** — éviter le bruit ; orgas voient les jauges sans clic. |
| **Q4** | Animation check style WhatsApp ? | **Micro** : `mat-checkbox` natif M3 suffit. |

---

## Prochaine étape

Créer la story d’implémentation (`bmad-create-story`) en référençant ce document et les AC ci-dessus. Epic suggéré : **perf-v2** ou **5.x dispos** selon priorisation PO.
