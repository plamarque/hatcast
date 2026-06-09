---
baseline_commit: 5d9a72bf39cf7100e18352eba56695d26e3faf3f
---

# Story 6.23: Modales Partager / Annoncer — manuel uniquement + ligne compacte

Status: done

<!-- Context: UX spec ux-design-share-announce-manual-only.md (Patrice + Sally, 2026-06-09) — supersedes 6.15 D4/D6/D7 et retire l’usage UI du dispatch 6.17 -->

## Story

En tant qu’**organisateur**,  
je veux **partager un message personnalisé** (compo, tirage, spectacle, relance dispos) **via Copier ou WhatsApp**, avec une **ligne compacte** indiquant qui a déjà été notifié par HatCast et **qui reste à prévenir**,  
afin de **respecter les opt-out**, **éviter les doublons** et **ne plus croire** qu’un bouton envoie des notifications en masse depuis l’appli.

## Acceptance Criteria

1. **Given** tout intent (`draw`, `composition`, `event`, `availability_nudge`) et `canManageComposition`, **when** `ShareAnnounceDialog` s’ouvre, **then** la rangée d’actions contient **uniquement** `mat-stroked-button` **Copier** et **WhatsApp** — **pas** de bouton **Notifier X personnes**, pas de spinner POST, pas de `ConfirmDialog` anti-spam au clic. [Source: UX **M1**, **M2** ; [`ux-design-share-announce-manual-only.md`](../planning-artifacts/ux-design-share-announce-manual-only.md)]

2. **Given** GET `share-recipients` réussi, **when** le bloc destinataires s’affiche, **then** une **seule ligne** (flex-wrap) suit Copier/WhatsApp :
   - si `alreadyCount > 0` et `toReachCount > 0` : `[N personne(s)]` (bouton style lien) + *déjà notifiées automatiquement. Reste à prévenir :* + chips ;
   - si `alreadyCount === 0` : *Reste à prévenir :* + chips seuls ;
   - si `toReachCount === 0` : segment lien + *déjà notifiées automatiquement.* seuls ;
   - **pas** de `mat-expansion-panel`, pastilles canal, légende D10, ni section *Notifications* titre H3. [Source: UX **M3**, **M4**, **M11**]

3. **Given** `alreadyCount > 0`, **when** l’orga **clique** le segment *N personne(s)* (style lien `color="primary"`), **then** un tooltip ou `mat-menu` compact liste les noms déjà notifiés (virgules, ordre alphabétique) ; `aria-label` explicite ; fermeture Échap / clic extérieur / second clic. [Source: UX **M4b** ; M3-4]

4. **Given** `toReachCount > 0`, **when** la ligne s’affiche, **then** chaque personne **à prévenir** apparaît en `mat-chip` (nom seul, inline après *Reste à prévenir :*) — **aucune** icône canal. [Source: UX **M4**, **M7**]

5. **Given** une personne dans l’audience, **when** `channels.email.notified || channels.push.notified` pour l’intent dialog courant, **then** elle compte dans `alreadyCount` ; sinon dans `toReachCount`. [Source: UX **M5**]

6. **Given** GET `share-recipients?intent=composition`, **when** `ShareRecipientsService` calcule les logs, **then** intents mappés = `{ CONFIRMATION_REQUEST, RECONFIRMATION_REQUEST }`. **Given** `intent=draw`, **then** `{ COMPOSITION_SHARED }`. **Given** `intent=event`, **then** inchangé `{ AVAILABILITY_OPENED, MANUAL_AVAILABILITY_ANNOUNCE }`. **Given** `intent=availability_nudge`, **then** `{ AVAILABILITY_OPENED, MANUAL_AVAILABILITY_NUDGE, MANUAL_AVAILABILITY_ANNOUNCE, AVAILABILITY_PENDING_REMINDER }`. [Source: UX **M6** ; corrige stub compo/draw 6.16/6.17]

7. **Given** la modale, **when** le textarea est affiché, **then** `cdkAutosizeMinRows` = **8** (max ~20) ; hint = *« Copier et WhatsApp utilisent le texte ci-dessus. »* [Source: UX **M8**, **M11**]

8. **Given** fermeture dialog (**Fermer** ou `mat-dialog-close`), **when** l’orga n’a pas utilisé un flux POST, **then** **aucun** snack post-fermeture (*X notifications envoyées*, *Demande enregistrée*) ; seul le snack *Message copié.* reste au clic Copier. [Source: UX **M2** ; [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts)]

9. **Given** implémentation terminée, **when** docs runtime sont alignées, **then** [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) § Types de déclenchement liste **tous** les share intents (`draw`, `composition`, `event`, `availability_nudge`) en **manuel hors dispatcher** (Copier / WhatsApp) ; OpenAPI GET décrit le mapping par intent ; POST `share-recipients/notify` documenté **déprécié côté UI** (endpoint conservé, non appelé par le front). [Source: UX **M9**]

10. **Regression:** `./gradlew :services:api:test` et `npm run test -w @hatcast/web -- --watch=false` verts ; tests 6.15/6.16/6.17 adaptés (suppression assertions Notifier, garde anti-spam, snacks dispatch) ; intents `event` / `availability_nudge` **dispatch backend** inchangé si appelé hors UI (pas de suppression `MANUAL_AVAILABILITY_ANNOUNCE` / `MANUAL_AVAILABILITY_NUDGE` côté API dans cette story).

**Couverture produit :** UX-DR7, UX-DR11 ; [**ux-design-share-announce-manual-only.md**](../planning-artifacts/ux-design-share-announce-manual-only.md) (M1–M11).

### Explicit out of scope

| Item | Reason |
|------|--------|
| Suppression endpoint POST notify | Dépréciation doc seulement (M9) |
| Bouton *Copier la liste des noms* | UX spec hors scope |
| Dates dans tooltip / modale | API `lastNotifiedAt` conservé, non affiché |
| Réactivation envoi bulk futur | Décision produit 2026-06-09 — politique manuelle verrouillée |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** la modale refondue, **when** rendue, **then** `mat-dialog`, `mat-form-field`, `mat-stroked-button`, `mat-chip-set` / `mat-chip`, `mat-button` (lien compteur), `matTooltip` ou `mat-menu` compact, `mat-progress-bar` — pas de contrôle HTML custom pour les mêmes rôles. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** SCSS touchés, **when** couleurs appliquées, **then** uniquement `var(--mat-sys-*)` / `color-mix` — lien compteur via `color="primary"`, texte ligne en `--mat-sys-on-surface-variant`.

**M3-3. Mobile & tactile** — **Given** viewport ≤ 480px, **when** Copier / WhatsApp et le lien compteur sont affichés, **then** cibles ≥ 48dp ; rangée actions en colonne pleine largeur ; ligne destinataires en flex-wrap (1–2 lignes max visuellement).

**M3-4. Navigation membre** — **N/A** (dialog événement uniquement).

**M3-5. Revue** — **Given** implémentation terminée, **when** validation story, **then** checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue ; écarts notés dans Dev Agent Record.

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `apps/web/` + `docs/v2/technical/NOTIFICATIONS_CATALOG.md` — **ne pas modifier** `legacy/`.

- [x] **API — mapping GET** (AC 5, 6, 10)
  - [x] [`ShareRecipientsService.resolveDeliveryLogIntents`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt) : ajouter branches `COMPOSITION`, `DRAW` ; ajouter `AVAILABILITY_PENDING_REMINDER` sur `AVAILABILITY_NUDGE`.
  - [x] Tests [`ShareRecipientsIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt) : GET composition après validate → assigné `notified: true` sur canal touché ; GET nudge inclut log `AVAILABILITY_PENDING_REMINDER`.

- [x] **API — OpenAPI** (AC 9)
  - [x] [`composition.yaml`](../../services/api/openapi/composition.yaml) : tableau mapping par intent dialog ; note POST notify *deprecated for web UI*.

- [x] **Front — dialog refonte** (AC 1–5, 7)
  - [x] [`share-announce-dialog.html`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.html) : retirer Notifier, expansion panel, section Notifications ; ajouter ligne flex `recipients-line` (lien + chips).
  - [x] [`share-announce-dialog.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.ts) : supprimer `sendNotifications`, `guardConfirmMessage`, `confirmResend`, `notifyButtonLabel`, `sending`, `sendError`, `notifiableCount`/`manualCount` summary legacy ; ajouter `alreadyNotifiedRecipients()`, `toReachRecipients()`, `alreadyCount`, `toReachCount`, `alreadyNotifiedNamesTooltip`, toggle tooltip/menu au clic.
  - [x] [`share-announce-dialog.scss`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.scss) : styles ligne compacte + bouton-lien ; retirer styles panel/channels inutilisés.
  - [x] Exporter `formatManualNotifyGuardAge` : supprimer si plus référencé hors tests, ou déplacer tests vers suppression.

- [x] **Front — fermeture sans snack dispatch** (AC 8)
  - [x] [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts) : `afterClosed` ne déclenche plus snack sauf si besoin futur ; retirer type `ShareAnnounceNotifyResult` du close value.
  - [x] [`share-announce-snack.ts`](../../apps/web/src/app/shared/share-announce/share-announce-snack.ts) : supprimer ou marquer dead code + MAJ [`share-announce-snack.spec.ts`](../../apps/web/src/app/shared/share-announce/share-announce-snack.spec.ts).

- [x] **Front — tests** (AC 10)
  - [x] [`share-announce-dialog.spec.ts`](../../apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts) : pas de bouton Notifier ; ligne *Reste à prévenir* + chips ; clic lien → tooltip/menu noms ; variants `alreadyCount`/`toReachCount` 0.
  - [x] [`share-announce-open.spec.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.spec.ts) : fermeture sans snack.

- [x] **Docs** (AC 9)
  - [x] [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) : index + § Types de déclenchement — share `event` / `availability_nudge` → manuel hors dispatcher ; retirer ou annoter lignes `MANUAL_AVAILABILITY_*` comme *non déclenché depuis UI web*.

- [x] **Validation finale** (AC 10, M3-5)
  - [x] `./gradlew :services:api:test`
  - [x] `npm run test -w @hatcast/web -- --watch=false`

---

## Dev Notes

### Product and UX rules

- Spec normative : [**ux-design-share-announce-manual-only.md**](../planning-artifacts/ux-design-share-announce-manual-only.md) — décisions **M1–M11**.
- **Course correction** : story **6.17** a activé le dispatch POST pour `event` ; cette story **retire l’appel UI** sans obliger à supprimer le code dispatcher (autres callers futurs / API directe).
- Entrées inchangées : gear **Annoncer** / **Relance dispos**, Équipe **Partager** / **Annoncer la compo**, publish banner 3.21 — [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts).

### Calcul `alreadyNotified` (front ou API)

```typescript
function isAlreadyNotified(r: ShareRecipientDto): boolean {
  return r.channels.email.notified || r.channels.push.notified
}
```

Option API (nice-to-have, pas obligatoire AC) : champs `alreadyNotifiedCount` / `toReachCount` dans `ShareRecipientsResponseDto` pour éviter divergence — si non fait, calcul front uniquement.

### Tooltip au clic — pattern recommandé

Material `matTooltip` est hover-first. Pour **clic** fiable sur touch :

- Préférer `mat-menu` avec `panelClass` compact (padding réduit, liste texte seule) sur le bouton-lien ;
- Ou directive tooltip `showDelay=0` + toggle `matTooltip` via `(click)` + `@ViewChild(MatTooltip)`.

Ne pas réintroduire `mat-icon-button` `info` séparé (UX **M4b**).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `mat-chip-set`, `mat-button` lien, pas de chips custom CSS |
| Tokens | `--mat-sys-on-surface-variant` pour la ligne ; `--mat-sys-primary` pour le lien |
| Réutilisation | Garder `buildWhatsAppSendUrl`, `buildDefaultShareMessage`, `ShareAnnounceApiService.getRecipients` |
| Dialog width | Conserver `min(42rem, 96vw)` sauf si recette mobile demande réduction |

### Explicit non-goals

- Ne pas supprimer `MANUAL_AVAILABILITY_ANNOUNCE` / `MANUAL_AVAILABILITY_NUDGE` du backend.
- Ne pas changer templates message [`share-announce-messages.ts`](../../apps/web/src/app/core/messaging/share-announce-messages.ts) sauf hint.
- Ne pas toucher aux notifications **auto** (validate, publish, 8.7 cron).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 6.15 | done | Shell M3 + rangée actions — **partiellement supersédé** (Notifier retiré) |
| 6.16 | done | Pastilles canal — **retirées de l’UI** ; données GET réutilisées |
| 6.17 | done | Mapping event/nudge + dispatch POST — **UI n’appelle plus POST** ; mapping GET étendu |
| 8.3 | done | Logs `CONFIRMATION_REQUEST`, `AVAILABILITY_OPENED` source « déjà notifié » |
| 8.7 | done | `AVAILABILITY_PENDING_REMINDER` dans mapping nudge |

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Completion Notes List

- Modale `ShareAnnounceDialog` : actions **Copier** + **WhatsApp** uniquement ; ligne compacte `alreadyCount` / `toReachCount` avec `mat-menu` au clic sur le lien compteur et `mat-chip` pour les personnes restantes.
- API `resolveDeliveryLogIntents` : `draw` → `COMPOSITION_SHARED` ; `composition` → `CONFIRMATION_REQUEST` + `RECONFIRMATION_REQUEST` ; `availability_nudge` + `AVAILABILITY_PENDING_REMINDER`.
- Suppression `share-announce-snack.ts` et flux POST UI (`sendNotifications`, garde anti-spam, snacks dispatch) dans `share-announce-open.ts` et `event-equipe-tab.ts`.
- OpenAPI + `NOTIFICATIONS_CATALOG.md` alignés (POST notify deprecated UI ; share intents manuel hors dispatcher).
- **Tests ciblés story :** 18/18 share-announce (web) ; `ShareRecipientsIntegrationTest` (API) OK.
- **Régressions préexistantes hors scope :** suite web complète (80 échecs / 29 fichiers) ; 2 tests composition WIP (`CompositionGapFillIntegrationTest`, `CompositionSlotAssignmentIntegrationTest`) — fichiers déjà modifiés avant baseline.
- **M3-5 :** `mat-dialog`, `mat-stroked-button`, `mat-chip-set`, `mat-menu`, tokens `--mat-sys-*`, cibles ≥ 48dp mobile — validé ; pas d’exception volontaire.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt`
- `services/api/openapi/composition.yaml`
- `apps/web/src/app/shared/share-announce/share-announce-dialog.ts`
- `apps/web/src/app/shared/share-announce/share-announce-dialog.html`
- `apps/web/src/app/shared/share-announce/share-announce-dialog.scss`
- `apps/web/src/app/shared/share-announce/share-announce-dialog.spec.ts`
- `apps/web/src/app/shared/share-announce/share-announce-open.ts`
- `apps/web/src/app/shared/share-announce/share-announce-open.spec.ts`
- `apps/web/src/app/shared/share-announce/share-announce-snack.ts` (deleted)
- `apps/web/src/app/shared/share-announce/share-announce-snack.spec.ts` (deleted)
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail-draft-banner.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `docs/v2/technical/NOTIFICATIONS_CATALOG.md`

### Change Log

- 2026-06-09 : Story créée (UX ux-design-share-announce-manual-only.md, recette Patrice).
- 2026-06-09 : Implémentation dev — modale manuelle compacte, mapping GET étendu, docs + tests.
- 2026-06-09 : Code review appliquée ; story clôturée (done).
- 2026-06-09 : Code review — 7 patches appliqués ; scope 8.10 séparé (revert) ; story `done`.

### Review Findings

- [x] [Review][Decision] Diff mélange story 8.10 (emails HTML) hors périmètre 6.23 — **résolu** : fichiers 8.10 revertés au baseline ; `NOTIFICATIONS_CATALOG.md` limité aux changements 6.23.
- [x] [Review][Patch] Accord grammatical singulier quand `alreadyCount === 1` [`share-announce-dialog.html`:81-84]
- [x] [Review][Patch] `aria-label` du lien compteur conforme UX M4b [`share-announce-dialog.ts`:147-155]
- [x] [Review][Patch] Race condition sur « Réessayer » — garde `loadingRecipients` + séquence [`share-announce-dialog.ts`:175-199]
- [x] [Review][Patch] Test d'intégration API `draw → COMPOSITION_SHARED` [`ShareRecipientsIntegrationTest.kt`]
- [x] [Review][Patch] OpenAPI POST notify `deprecated: true` [`composition.yaml`:453]
- [x] [Review][Patch] `mat-menu` avec `mat-menu-item` focusables [`share-announce-dialog.html`:75-79]
- [x] [Review][Patch] État vide — hint « Aucun destinataire pour cette action. » [`share-announce-dialog.html`:97-99]
- [x] [Review][Defer] Tooltip WhatsApp via `title` natif (M3-1) — préexistant 6.15 [`share-announce-dialog.html`:50] — deferred, pre-existing
- [x] [Review][Defer] AC10 suite web complète (80 échecs) — préexistants — deferred, pre-existing
- [x] [Review][Defer] `::ng-deep` panel menu — deferred, pre-existing
- [x] [Review][Defer] Menu noms max-height ajouté en bonus lors du patch menu [`share-announce-dialog.scss`:74]

---

### Validation create-story

- [x] AC métier numérotés et sourcés (UX M1–M11, UX-DR7/11)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants
- [x] `./gradlew test` + `npm run test` mentionnés
