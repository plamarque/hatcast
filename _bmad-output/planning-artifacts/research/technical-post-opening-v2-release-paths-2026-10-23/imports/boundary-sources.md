# Boundary and incident sources — retrieved 2026-10-23
Read-only Git all refs and explicitly granted issue blobs. No analytics, email, PII-source or cloud query. Personal names, replay links and person-level chronology omitted from excerpts; issue text remains source testimony, not a new reproduction. Source is the current working blob unless an immutable commit is stated.
## B01 — issue snapshot

HEAD: `6a5b8a8a972da9558e8cf587eaa22f7ef2b080d9`. Working ISSUES.md SHA256: `ba1f6669236a21994483860c18db6dd1f5cfda0276515343fcd04091950eacea`. It has uncommitted changes; later evidence must not be attributed to release-time knowledge.

### B01/BUG-018
ISSUES.md:478: ### BUG-018 — Staging Cloud Run traffic stuck on a named revision
ISSUES.md:479: - **ID**: BUG-018
ISSUES.md:480: - **Status**: Open (workaround 2026-09-16 — traffic moved to `hatcast-v2-staging-00107-brq`)
ISSUES.md:481: - **Severity**: High (staging served stale 2.4.4 while CI deploys succeeded)
ISSUES.md:482: - **Affected area**: Cloud Run `hatcast-v2-staging` (`europe-west9`)
ISSUES.md:483: - **Observed behavior**: After `gcloud run deploy` from GitHub Actions, new revisions (`00104`–`00107`) were created then Retired. 100% of traffic stayed on `hatcast-v2-staging-00103-mr9` (2.4.4, 2026-07-12). `/version.txt` and the Formules UI stayed on that build. 2.4.5 never received live traffic.
ISSUES.md:484: - **Expected behavior**: A successful staging deploy serves the new revision at `https://hatcast-v2-staging-730278491306.europe-west9.run.app`.
ISSUES.md:485: - **Cause**: Traffic allocated to a **named** revision, not `LATEST`. Cloud Run then leaves existing split unchanged on deploy.
ISSUES.md:486: - **Fix / workaround**: `gcloud run services update-traffic hatcast-v2-staging --region=europe-west9 --project=impro-selector --to-revisions=hatcast-v2-staging-00107-brq=100` (or `--to-latest` after the new revision is Ready). Durable fix: stop pinning named revisions, or add `--to-latest` in CI after deploy.
ISSUES.md:487: - **Evidence**: Recette 2.4.6-rc.1 ; CI deploy jobs green while live `version.txt` still showed `2.4.4` / `010452ce`.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
aaf7dbb4 2026-09-17T11:00:07+02:00 fix(event-detail): Show Relance dispos on Infos via BFF flag
```

### B01/BUG-019
ISSUES.md:456: ### BUG-019 — Dispos « Pas disponible » : dépliage vide (noms invisibles)
ISSUES.md:457: - **ID**: BUG-019
ISSUES.md:458: - **Status**: Fixed (2026-09-28, local verification)
ISSUES.md:459: - **Severity**: Medium (orga cannot see who is unavailable; roles still expand)
ISSUES.md:460: - **Affected area**: Onglet Dispos — `availability-poll` / `availability-poll-row` (spectacle publié, explainability on)
ISSUES.md:461: - **Observed behavior**: Tap on the « Pas disponible » gauge, counter, or avatars expands the row but shows no names. Role rows (Arbitre, MC, …) do expand with names.
ISSUES.md:462: - **Expected behavior**: Expanding « Pas disponible » lists the unavailable members by name (same as the compact avatar stack).
ISSUES.md:463: - **Cause**: Neutral name chips render only when `explainabilityEnabled` is false (`unavailablePoolShowNeutral`). On a published event, explainability is on, and unavailable people have no `chancePercent`, so none of the three pool branches (`chance preview` / `neutral` / `chances unavailable`) match — empty body.
ISSUES.md:464: - **Repro**: Event detail → Dispos → tap avatars/gauge on « Pas disponible » (screenshot orga Impro, 2026-09-16).
ISSUES.md:466: - **Verification**: `availability-poll.spec.ts` clicks the unavailable gauge with explainability enabled, confirms the unavailable member is rendered, and confirms no chance-summary request is made; `npm test -- --watch=false --include='src/app/shared/availability/availability-poll.spec.ts'` passes (22 tests).

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
aaf7dbb4 2026-09-17T11:00:07+02:00 fix(event-detail): Show Relance dispos on Infos via BFF flag
```

### B01/LIMIT-009
ISSUES.md:468: ### LIMIT-009 — Dispos V2 : plus d’entrée « Tous » ni liste des non-répondants
ISSUES.md:469: - **ID**: LIMIT-009
ISSUES.md:470: - **Status**: Open
ISSUES.md:471: - **Severity**: Medium (orga cannot scan the full troupe for one date)
ISSUES.md:472: - **Affected area**: Onglet Dispos — `availability-subject-selector` + sondage unifié (story 5.8)
ISSUES.md:473: - **Observed behavior**: The Participant pulldown lists individuals only (proxy edit). There is no « Tous ». The poll shows role/unavailable gauges + 3 avatars; members with status `unknown` do not appear. Organizers cannot see who has not answered.
ISSUES.md:474: - **Expected behavior (V1)**: Pulldown first option « Tous » (`selectedTeamPlayer.id === 'all'`) rendered `EventRoleGroupingView` — named candidates per role. Combined with the season grid, orgs could also see unanswered cells.
ISSUES.md:475: - **Notes**: Story 5.8 D1 removed Moi/Tous in favor of a WhatsApp-style poll (saisie + collective on one screen). Named unavailable list was an explicit non-goal (MVP+). Relance dispos (cog menu) still targets `unknown` but does not display the list. Organizer request 2026-09-16: restore a troupe overview, especially unanswered members.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
aaf7dbb4 2026-09-17T11:00:07+02:00 fix(event-detail): Show Relance dispos on Infos via BFF flag
```

### B01/BUG-020
ISSUES.md:445: ### BUG-020 — Relance dispos hidden until Dispos tab is opened
ISSUES.md:446: - **ID**: BUG-020
ISSUES.md:447: - **Status**: Fixed (2026-09-16)
ISSUES.md:448: - **Severity**: Medium (orga cannot relance from Infos)
ISSUES.md:449: - **Affected area**: Event detail gear menu — `event-detail` `canRelanceDispos` + PERF-03 tab-gated `availability/summary`
ISSUES.md:450: - **Observed behavior**: On Infos, gear shows Modifier / Annoncer / Participants / Désactiver. **Relance dispos** appears only after visiting the Dispos tab (summary then loaded).
ISSUES.md:451: - **Expected behavior**: Story **6.10c** AC1 — Relance dispos visible on every event-detail tab when published + `canManageComposition` + ≥1 unknown, without requiring a prior Dispos visit.
ISSUES.md:452: - **Cause**: PERF-03 gated summary load to Dispos; menu visibility required `disposSummary()`.
ISSUES.md:453: - **Fix**: Event page BFF `hasUnknownAvailability` on all tabs (no full summary on Infos); menu uses that flag until a live summary is present.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
aaf7dbb4 2026-09-17T11:00:07+02:00 fix(event-detail): Show Relance dispos on Infos via BFF flag
```

### B01/BUG-021
ISSUES.md:432: ### BUG-021 — Agenda : rôles sélectionnés peu lisibles et sauvegarde distincte
ISSUES.md:433: - **ID**: BUG-021
ISSUES.md:434: - **Status**: Correctif implémenté et vérifié (API 29/29, E2E 10/10), revue et validation humaine restantes — cause de l’affectation DJ non établie
ISSUES.md:435: - **Severity**: Medium
ISSUES.md:436: - **Affected area**: V2 `AvailabilityDialog`, `AvailabilityForm`, `RoleToggleChipSet` ; agendas personnel et saison.
ISSUES.md:438: - **Expected behavior**: Rendre sans ambiguïté les rôles choisis et leur état d'enregistrement ; éviter qu'une fermeture soit comprise comme une validation. Solution autorisée : cases à cocher, validation groupée explicite, annulation du brouillon et rôle requis pour les nouvelles écritures disponibles proposant des rôles.
ISSUES.md:439: - **Correction**: Carte/actions partagées Accueil et agenda ; formulaire à brouillon, cases explicites, footer Enregistrer persistant ; annulation sans résultat ; échec conservant le brouillon. API self/proxy : rôle normalisé obligatoire si proposé, avant mutation. Historique vide préservé.
ISSUES.md:440: - **Repro initiale**: Mon agenda → badge personnel de disponibilité d'un spectacle pour lequel le membre actif n'est pas dans l'équipe et n'a pas un état de retrait → Dispo → modifier un rôle → Fermer sans utiliser le bouton d'enregistrement. Le clic sur le titre ouvre le détail spectacle, dont l'onglet Dispos utilise un sondage différent avec sauvegarde au clic sur les rôles.
ISSUES.md:443: - **Human smoke follow-up (2026-09-17)**: Initial single-column square checkboxes required excessive scrolling on a six-role match; errors appeared below the scroll. Changed to the poll's round multiple-selection checkmarks in two columns, with errors replacing the fixed-footer dirty hint. Verified visually in the local Chrome match dialog and with 27 targeted tests; full E2E rerun pending after this visual adjustment.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
aaf7dbb4 2026-09-17T11:00:07+02:00 fix(event-detail): Show Relance dispos on Infos via BFF flag
```

### B01/BUG-022
ISSUES.md:403: ### BUG-022 — Aperçu des relances : éligibilité email sans préférence
ISSUES.md:404: - **ID**: BUG-022
ISSUES.md:405: - **Status**: Fixed (2026-09-17)
ISSUES.md:406: - **Severity**: Medium
ISSUES.md:407: - **Affected area**: `ShareRecipientsService.buildResponse`, GET `share-recipients` et compteurs du POST `share-recipients/notify`.
ISSUES.md:408: - **Observed behavior**: `channels.email.eligible` dépend uniquement de la présence d'une adresse participant. La préférence email de la catégorie `AVAILABILITY_REQUEST` n'est pas consultée dans cet aperçu, alors que le dispatcher vérifie les préférences pour les utilisateurs liés. `notifiableCount` peut donc inclure des personnes qui ont désactivé ce canal ; le POST reprend ce nombre comme `notifiedCount`, sans preuve de livraison.
ISSUES.md:409: - **Expected behavior**: Un aperçu destiné à confirmer un envoi doit refléter les règles effectives de sélection et de canal ; distinguer demande acceptée et livraison constatée.
ISSUES.md:410: - **Notes/context**: Corrigé par la relance avec confirmation : l’aperçu et le POST utilisent désormais le compte lié, ses préférences de disponibilité et les canaux réellement disponibles. Les changements entre aperçu et confirmation produisent un conflit sans envoi.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
f15668f4 2026-09-17T15:09:49+02:00 docs: Record reminder email eligibility issue
```

### B01/BUG-023
ISSUES.md:412: ### BUG-023 — Home can retain a stale badge after saved response
ISSUES.md:413: - **ID**: BUG-023
ISSUES.md:414: - **Status**: Open — found during BUG-024 review; outside volunteer-rule scope
ISSUES.md:415: - **Severity**: Medium
ISSUES.md:416: - **Affected area**: V2 `member-home-todo.ts` availability/participation actions.
ISSUES.md:417: - **Observed behavior**: Code review shows `openAvailability` and `openParticipation` discard the returned updated item and only reload inbox. If that refresh fails after a successful save, `fetchInbox` retains the previously loaded card.
ISSUES.md:418: - **Expected behavior**: Keep the successful saved result visible even if the subsequent inbox refresh fails.
ISSUES.md:419: - **Evidence**: `member-home-todo.ts:309-314` and its `fetchInbox` loaded-error path. This behavior exists in the incorporated BUG-021 dependency before the volunteer correction; no live production reproduction claimed.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
7de14aa1 2026-09-17T22:40:13+02:00 fix(availability): Require offered volunteer
```

### B01/BUG-024
ISSUES.md:421: ### BUG-024 — Available participants can opt out of volunteer availability
ISSUES.md:422: - **ID**: BUG-024
ISSUES.md:423: - **Status**: Fixed locally — verification recorded; pending human smoke and integration
ISSUES.md:424: - **Severity**: Medium
ISSUES.md:425: - **Affected area**: V2 availability dialog/form, availability poll, shared role rules and self/proxy availability API.
ISSUES.md:426: - **Observed behavior**: The tested dialog starts an available draft without selected roles. Selecting player adds volunteer and displays a player-specific explanatory paragraph. Volunteer can then be unchecked and saved. Other roles do not trigger the rule. The screenshot matches the checkbox dialog in the BUG-021 worktree, not the current integration baseline.
ISSUES.md:427: - **Expected behavior**: User requests volunteer to be selected and non-removable as soon as availability is selected, with all other roles optional and volunteer-only availability allowed. Explain the rule beside the volunteer control with touch/keyboard-accessible help, replacing the player-specific paragraph. User confirmed on 2026-09-17: apply this rule only when volunteer is offered by the event; never add it to events that exclude it.
ISSUES.md:428: - **Cause**: `AvailabilityForm` and `AvailabilityPoll` retain explicit volunteer opt-out state. Both TypeScript and Kotlin normalizers only add volunteer for player when volunteer slots are positive; the API accepts `applyVolunteerRule=false`. This implements the former PRD FR16 opt-out contract, which the user now requests to replace.
ISSUES.md:429: - **Repro**: Open own availability for an event offering player and volunteer → select Dispo → select player → uncheck volunteer → save.
ISSUES.md:430: - **Notes/context**: Preserve BUG-021 checkbox/unified-save changes at commit `531256812b212a3145085236302169b857daf924`. Historical empty-role availability has wildcard candidacy semantics; no bulk migration or silent read-time narrowing is authorized. Correction adds mandatory offered volunteer to available writes and explicit drafts; verification recorded in the BUG-024 implementation report.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
7de14aa1 2026-09-17T22:40:13+02:00 fix(availability): Require offered volunteer
```

### B01/BUG-025
ISSUES.md:392: ### BUG-025 — Mes Stats defaults to a prior active season
ISSUES.md:393: - **ID**: BUG-025
ISSUES.md:394: - **Status**: Fixed locally — targeted verification passed; review pending
ISSUES.md:395: - **Severity**: High
ISSUES.md:396: - **Affected area**: V2 member season glance API and the “Mes Stats” page default scope.
ISSUES.md:397: - **Observed behavior**: With multiple active eligible seasons and no explicit season filter, “Mes Stats” can render the previous season by default. When the API resolves any default season, the page leaves its filter signals unset, so it displays “Toutes les…” rather than the actual displayed scope.
ISSUES.md:398: - **Expected behavior**: The default scope is the newest active eligible season and the filter visibly identifies that returned troupe and season; an explicit season filter remains authoritative.
ISSUES.md:399: - **Cause**: `MemberSeasonGlanceService.selectPrimarySeason` uses `maxWith` with descending start-date and update-date comparators. Under `maxWith`, that ordering selects the older date when candidates have the same active state. `MemberSeasonGlance` does not hydrate its unset filter signals from the API's `resolvedSeasonId` and `troupeId`.
ISSUES.md:400: - **Repro**: A member participates in active seasons beginning 2025-09-01 and 2026-09-01, then opens `/membre/{userSlug}` without a season query parameter.
ISSUES.md:401: - **Notes/context**: The client correctly leaves an unset default to server-side resolution. The correction retains one-season aggregation and access checks, hydrates the existing filter from the returned scope, and is covered by focused backend (4 tests) and web (8 tests) suites.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
030426fd 2026-09-22T01:32:06+02:00 fix(stats): Select current season by default
399c2ba1 2026-09-22T22:37:55+02:00 feat(stats): Unify active season statistics (#9)
```

### B01/BUG-028
ISSUES.md:360: ### BUG-028 — Mobile troupe hub season chart stacks month columns vertically
ISSUES.md:361: - **ID**: BUG-028
ISSUES.md:362: - **Status**: Open — BMAD diagnosis and corrective spec ready for approval
ISSUES.md:363: - **Severity**: Medium (collective season overview is not usable on narrow mobile viewports)
ISSUES.md:364: - **Affected area**: V2 `troupe-hub` season mini-chart (`/troupes/:slug`).
ISSUES.md:365: - **Observed behavior**: On a narrow Android viewport, the mini-chart shown for La Malice renders month columns one below another. The chart becomes taller than the viewport and visually continues behind the fixed member navigation.
ISSUES.md:366: - **Expected behavior**: Months form a horizontal timeline inside the season-card chart; event blocks for each month stack vertically, and any extra width scrolls horizontally inside the chart. The final chart CTA must remain reachable above the member navigation.
ISSUES.md:367: - **Cause**: `troupe-hub.html` renders `.member-profile__chart-month` elements directly in the chart container, omitting `.member-profile__chart-timeline` and `.member-profile__chart-months`. The shared chart SCSS applies its horizontal flex layout only to the omitted months wrapper.
ISSUES.md:368: - **Repro**: On staging, sign in to a member account and open `/troupes/la-malice` on a narrow Android viewport with at least three past events in the selected season.
ISSUES.md:369: - **Notes/context**: The fixed bottom navigation is not established as causal: `member-shell.scss` already reserves its height plus safe-area. The corrective mobile E2E will verify CTA reachability before any shell/navigation change is considered. UX spec `ux-design-hub-mini-chart-17-44.md` MC10 requires horizontal in-card scrolling.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
aa89f644 2026-09-29T22:51:06+02:00 fix(troupe-hub): Fix mobile season chart
```

### B01/BUG-029
ISSUES.md:348: ### BUG-029 — Agenda performance fixture has too few future events
ISSUES.md:349: - **ID**: BUG-029
ISSUES.md:350: - **Status**: Fixed locally — complete regression and independent review verified; integration pending
ISSUES.md:351: - **Severity**: Low (blocks a complete local API regression run, not runtime behavior)
ISSUES.md:352: - **Affected area**: `UserAgendaPerformanceIntegrationTest` seeded agenda fixture.
ISSUES.md:353: - **Observed behavior**: On 2026-10-12, `./gradlew test` fails before the performance assertion because the fixture exposes 19 upcoming events while the test requires at least 20.
ISSUES.md:354: - **Expected behavior**: The test fixture remains date-independent and supplies the documented minimum of 20 future events.
ISSUES.md:355: - **Repro**: Run `./gradlew test` in `services/api`; `UserAgendaPerformanceIntegrationTest` fails with `content.length=19`.
ISSUES.md:356: - **Notes/context**: Found while verifying CN-1. CN-1 targeted API/domain tests pass; this failure is unrelated to the reconciliation contract.
ISSUES.md:357: - **Follow-up evidence (2026-10-18)**: The fixed calendar exposes only 18 upcoming events. Replaced the shared seed dependency with a dedicated troupe, season, 24 published shows relative to execution time, 24 roster participants, 576 availability rows and 72 required composition slots. The existing >=20 result assertion and p95 <=500 ms threshold remain unchanged and pass in the targeted run and complete 1189-test regression (zero failures, five unchanged skips).
ISSUES.md:358: - **Review follow-up**: Warmup now checks returned fixture IDs, actual available status, composed/pending versus collecting projections. This exposed and corrected the linked member's fixture availability subject (`user_id`, not `season_participant_id`), while guest responses retain participant subjects. Final standalone performance test and complete regression pass with these assertions.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
b9b0b17c 2026-10-12T23:03:54+02:00 feat(composition): Reconcile changed needs
```

### B01/BUG-031
ISSUES.md:326: ### BUG-031 — « Annuler » dans Format et besoins vide les besoins
ISSUES.md:328: - **ID**: BUG-031
ISSUES.md:329: - **Status**: Open — cause confirmée le 2026-10-13 ; correctif à cadrer
ISSUES.md:330: - **Severity**: High (une action ponctuelle peut masquer toute une équipe déjà composée)
ISSUES.md:331: - **Affected area**: V2 « Format et besoins » (`EventTypeRolesDialog` / `PATCH events.roleSlots`) et projection Équipe.
ISSUES.md:333: - **Expected behavior**: `Annuler` doit fermer sans émettre aucun PATCH. Réduire ou retirer un rôle ne doit pas effacer silencieusement les besoins restants ni rendre invisible une équipe constituée.
ISSUES.md:334: - **Cause confirmée**: L'attribut nu `mat-dialog-close` transmet la chaîne vide (`""`) au vrai clic Angular Material, et non `undefined`. `EventInfosTab.openTypeRolesDialog` ignore uniquement `undefined` : il appelle donc `persistTypeRoles("")`. À l'exécution, `result.templateType` et `result.roleSlots` sont alors `undefined`; `normalizeRoleSlots(undefined)` produit une map complète de zéros. `JSON.stringify` omet `templateType` mais envoie `roleSlots` à zéro. Le serveur accepte ce remplacement complet et persiste ces zéros. La re-sélection du format n'est pas nécessaire à l'incident, même si elle fait partie du parcours observé.
ISSUES.md:335: - **Reproduction vérifiée**: Le test temporaire a cliqué le vrai bouton `button[mat-dialog-close]` dans le dialogue Angular : `MatDialogRef.close` a reçu `""` (et non `undefined`). La chaîne client puis serveur ci-dessus a été vérifiée dans le code. Le test était volontairement rouge contre l'attendu fonctionnel et a été retiré après diagnostic pour ne pas laisser la branche en échec.
ISSUES.md:336: - **Notes/context**: Les événements de type sondage / personnalisé peuvent légitimement ne pas nécessiter de rôle : le correctif ne doit donc pas interdire globalement la valeur vide. Il doit distinguer explicitement une fermeture sans résultat d'une sauvegarde. CN-1 conserve désormais les créneaux affectés hors besoins pour les organisateurs, mais ne prévient pas l'écriture vide et ne les réaffiche pas encore dans l'UI. Voir aussi le chat Codex `01a130ec-46cd-7c60-b532-7634e1c5cfd4`.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
20aee054 2026-10-13T17:25:33+02:00 fix(composition): Prevent cancel role reset
```

### B01/BUG-032
ISSUES.md:315: ### BUG-032 — Équipe mobile : le rôle masque les noms
ISSUES.md:317: - **ID**: BUG-032
ISSUES.md:318: - **Status**: Fixed (2026-10-14)
ISSUES.md:319: - **Severity**: Medium (la composition reste visible, mais les personnes assignées ne sont plus identifiables sur un téléphone étroit)
ISSUES.md:320: - **Affected area**: V2 `apps/web` — onglet Équipe, lignes de créneaux de composition.
ISSUES.md:321: - **Observed behavior**: À largeur mobile, la colonne fixe du rôle et son libellé occupaient assez de place pour tronquer, voire masquer visuellement, le nom de la personne assignée.
ISSUES.md:322: - **Expected behavior**: À `≤ 480 px`, chaque rôle reste identifiable par son emoji, tandis que le nom de la personne conserve l'espace horizontal prioritaire. Les libellés complets restent affichés au-delà de ce breakpoint.
ISSUES.md:323: - **Fix**: La colonne de rôle passe de `7.5rem` à `2.75rem` sur mobile, et le chip Équipe n'affiche que son emoji ; les actions et la grille existantes sont inchangées.
ISSUES.md:324: - **Notes/context**: Signalé avec la capture de l'onglet Équipe sur iPhone. Le contrôle de pool interactif conserve son `aria-label` complet.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
654652e8 2026-10-14T08:06:53+02:00 fix(equipe): Preserve mobile member names
```

### B01/BUG-033
ISSUES.md:303: ### BUG-033 — Une adhésion active peut manquer du roster de saison
ISSUES.md:305: - **ID**: BUG-033
ISSUES.md:306: - **Status**: Fixed locally — targeted verification passed; production data repair pending explicit approval
ISSUES.md:307: - **Severity**: High (le membre peut ne plus voir les spectacles auxquels son adhésion de troupe lui donne accès)
ISSUES.md:308: - **Affected area**: V2 membership lifecycle and season participant synchronization (`TroupeMembershipService`, CSV member import).
ISSUES.md:309: - **Observed behavior**: Un membre ajouté par l'administration, importé par CSV, ou rejoignant une troupe ouverte pouvait avoir une adhésion `ACTIVE` sans ligne `season_participants`. Les projections Accueil / agenda s'appuient sur cette ligne et pouvaient donc n'afficher que les spectacles d'une autre troupe, par exemple la troupe démo.
ISSUES.md:310: - **Expected behavior**: Toute création ou réactivation d'adhésion membre active synchronise le roster de toutes les saisons de la troupe. Les retraits CSV inactivent aussi ces participations sans écraser un retrait explicite par l'administration de saison.
ISSUES.md:311: - **Cause**: Les chemins de création d'adhésion directe, d'import CSV et de self-join ne déclenchaient pas tous `SeasonParticipantMembershipSync`; seule une partie des réactivations était synchronisée.
ISSUES.md:312: - **Fix**: Le correctif appelle la synchronisation centrale après chaque création/réactivation concernée et couvre les transitions CSV active/inactive ainsi que self-join. Un ré-ajout administratif ou une ligne CSV inchangée guérit aussi une participation manquante, sans réactiver un retrait explicite de saison.
ISSUES.md:313: - **Notes/context**: Le code empêche une nouvelle dérive. Les adhésions créées avant son déploiement nécessitent un diagnostic de production en lecture seule puis une autorisation explicite avant toute réparation des données existantes.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
5f6f3f15 2026-10-14T22:02:31+02:00 fix(membership): Sync season participants
0eaa9238 2026-10-14T22:02:31+02:00 fix(membership): Sync season participants
```

### B01/BUG-037
ISSUES.md:220: ### BUG-037 — API regression fixtures assume unsynchronized shared memberships
ISSUES.md:221: - **ID**: BUG-037
ISSUES.md:222: - **Status**: Fixed locally — complete regression and independent review verified; integration pending
ISSUES.md:223: - **Severity**: Medium (API regression suite fails; no production behavior change)
ISSUES.md:224: - **Affected area**: Agenda, inbox, member glance/profile, audit, availability, lifecycle integration tests and member statistics unit fixtures.
ISSUES.md:225: - **Observed behavior**: The v2.6.3 lineage full API run reports 1189 tests, 37 failures and five environment-specific skips (GitHub runs 39100395161 and 38815714661; reproduced locally). Nine affected classes report 102 tests and 32 failures when run together; lifecycle passes 7/7 in isolation.
ISSUES.md:226: - **Cause**: Shared seed memberships now synchronize participants after BUG-033, adding projection scopes and duplicate participant setup. Lifecycle conversion payloads omit active seasons created by other classes sharing H2. Three statistics fixtures omit required role counts, so CN-1 correctly excludes their assignments. The remaining performance failure is tracked as BUG-029.
ISSUES.md:227: - **Expected behavior**: Explicit isolated troupe/season fixtures preserve automatic synchronization, exact business assertions, and valid required-slot indices; all enabled tests pass in both targeted and complete runs.
ISSUES.md:228: - **Fix**: Test-owned troupe/season scopes, reuse of synchronized audit participants, explicit legacy unsynchronized summary precondition, and required role-slot needs. Production code, seeds, migrations and CI gates are unchanged; business expectations are preserved and selected response assertions strengthened.
ISSUES.md:229: - **Verification (2026-10-18)**: JDK 21, nine affected classes: 102 tests, zero failures/errors/skips. Each of the nine classes also passed in its own Gradle invocation after review patches. Final complete `./gradlew test --no-daemon`: 1189 tests across 170 classes, zero failures/errors, five unchanged environment-specific skips (two Neon agenda and three Neon composition performance tests), BUILD SUCCESSFUL in 5m 27s. `git diff --check` passes. Three independent review lenses completed; all retained findings resolved, nothing deferred. Integration remains pending.
ISSUES.md:231: #### Initial release investigation (before the fixture correction)
ISSUES.md:233: - **Status:** Open — qualified during the v2.6.3 staging release on 2026-10-18; release validation blocked pending test remediation or explicit disposition.
ISSUES.md:234: - **Severity:** High for release validation; production impact not established.
ISSUES.md:235: - **Affected area:** `services/api` full Gradle test suite on GitHub Actions.
ISSUES.md:236: - **Observed behavior:** [Run 39100395161](https://github.com/plamarque/hatcast/actions/runs/39100395161), commit `d7dc3c15`, reports 1189 tests completed, 37 failed, 5 skipped. Failures span agenda (including performance), audit, availability summary, inbox, member profile/season glance, composition statistics and membership lifecycle tests. Local Playwright T1 passed separately (94 passed, 4 skipped), as did the staging workflow's E2E step.
ISSUES.md:237: - **Expected behavior:** The API regression suite passes or each failing case has an explicitly qualified disposition before production promotion.
ISSUES.md:238: - **Investigation (2026-10-18):** The same 37 named failures already occur in [run 38815714661](https://github.com/plamarque/hatcast/actions/runs/38815714661), commit `b39ccfc5`, which is an ancestor of `v2.6.2-rc.1`. [Run 38422699386](https://github.com/plamarque/hatcast/actions/runs/38422699386) on 2026-10-13 already reports the three statistics failures plus the agenda performance fixture failure. These are not newly introduced by the v2.6.3 delta.
ISSUES.md:239: - **Reproduction:** Current `v2` full `./gradlew test --no-daemon`: 1189 tests, 37 failures, 5 skipped (5m02s). Running only the nine affected classes: 102 tests, 32 failures; all seven membership lifecycle tests pass in that targeted run. Full-run report: `services/api/build/reports/tests/test/index.html`.
ISSUES.md:240: - **Qualified causes:**
ISSUES.md:241:   - **28 failures — membership fixture assumptions:** `0eaa9238` (BUG-033) synchronizes self-joined/added members across the troupe's seasons. Helpers join the shared seed troupe but expect an empty or narrowly scoped agenda/inbox/profile. The actual responses contain seed and other test seasons. Audit setup attempts to add an already-synchronized participant (409, "Un participant avec ce nom existe déjà dans la saison."). Availability's read-only test fails its setup precondition before the GET because joining has already created the participant. Breakdown: agenda 15, inbox 9, audit 1, availability 1, season glance 1, member profile 1.
ISSUES.md:242:   - **3 failures — statistics fixtures omit required slots:** `b9b0b17c` filters slots with `isRequiredBy(event.roleSlots)` as required by CN-1. The failing unit fixtures construct events with default empty `roleSlots`, then assign slots (index 1) and expect them to count. The resulting null/neutral output follows the required-position rule; the fixtures need explicit matching needs and valid indices.
ISSUES.md:243:   - **1 failure — date-dependent performance fixture:** BUG-029 reproduced: the seed now contains 18 upcoming events while the test requires at least 20. It fails before the latency assertion; no performance regression is established.
ISSUES.md:244:   - **5 failures — shared database / execution-order dependency:** Membership lifecycle tests pass in the targeted run but fail in the full suite with HTTP 400, "Choisissez pour chaque saison active : externe saison ou retrait du roster." Their conversion payload accounts only for the locally created seasons, while synchronized memberships include additional active seasons in the shared `jdbc:h2:mem:hatcast_test` database. This is related to the isolation concern in LIMIT-002, with a distinct observed symptom.
ISSUES.md:245: - **Proposed remediation:** Isolate fixture troupes/seasons and database state, update setup to explicitly create the intended membership/roster scope, provide required-slot needs in the statistics fixtures, and generate a date-independent future-event set for the performance test. Preserve the business rules and assertions; do not waive or disable tests. No test or production implementation changed during this investigation.
ISSUES.md:246: - **Notes/context:** The CI result arrived after `v2.6.3-rc.1` was pushed (`c2a6a4c2`) and its artifacts synchronized to `v2` (`fa1a27b2`). No production promotion was performed. Do not infer runtime regression or waive the failures from green E2E alone.
ISSUES.md:247: - **RC operational evidence:** [Run 39100935125](https://github.com/plamarque/hatcast/actions/runs/39100935125) completed successfully: staging E2E 93 passed / 4 skipped, Cloud Run revision `hatcast-v2-staging-00123-nz4` serving 100% traffic, E1 preprod 33 passed / 2 skipped. The staging `version.txt` reports `2.6.3`. Automated gates do not replace human staging smoke or disposition of the API failures.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
5c8e6e9c 2026-10-18T08:40:50+02:00 test(api): Isolate regression fixtures
```

### B01/BUG-038
ISSUES.md:210: ### BUG-038 — Composition smoke tests intermittently require retry
ISSUES.md:211: - **ID**: BUG-038
ISSUES.md:212: - **Status**: Open — observed during v2.6.3-rc.2 validation; cause not established
ISSUES.md:213: - **Severity**: Medium (smoke reliability; no confirmed production defect)
ISSUES.md:214: - **Affected area**: `apps/web/e2e/e1/orga-composition.desktop.spec.ts` and `apps/web/e2e/draw-formula-choice.spec.ts`.
ISSUES.md:215: - **Observed behavior (2026-10-18)**: [RC2 workflow 39105565455](https://github.com/plamarque/hatcast/actions/runs/39105565455), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: E1-ORG-001–002 first failed waiting for the dialog after publication (15 s); E2E-WD-05 first failed pool preview with HTTP 400 `Rôle inconnu pour cet événement`. Both passed on automatic retry. Final local-profile CI smoke: 92 passed, 2 flaky, 4 skipped; job succeeded. This is not evidence of a clean first-attempt run.
ISSUES.md:216: - **Expected behavior**: Composition smoke journeys pass without retry, with deterministic fixture state and assertions aligned to supported behavior.
ISSUES.md:217: - **Audit follow-up (2026-10-23)**: [RC workflow 39899222776](https://github.com/plamarque/hatcast/actions/runs/39899222776) again reports E1-ORG-001–002 passing only on retry after a missing publication dialog; final T1 result is 99 passed, 1 flaky, 4 skipped. This recurrence does not establish a production defect or the root cause.
ISSUES.md:218: - **Notes/context**: Local preflight passed 94 tests with four skips. The separate deployed-staging E1 gate passed 34 tests with two skips, without reported retries. No tests were disabled or changed for these observations. Investigation and any fix remain separate from the API fixture correction; the production promotion and human staging smoke are not authorized by these green automated jobs.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
c70139a9 2026-10-18T15:12:56+02:00 docs(issues): Record composition smoke flake
5c482046 2026-10-21T18:15:57Z fix(web): Recover from stale chunks after deploy
```

### B01/BUG-039
ISSUES.md:175: ### BUG-039 — PR #15 chunk recovery throws when storage access is denied
ISSUES.md:176: - **ID**: BUG-039
ISSUES.md:177: - **Status**: Open — review finding on PR #15 at `8740a147c63397623b5cc7bd3e2cadc1197491cb`; not a confirmed deployed defect
ISSUES.md:178: - **Severity**: Medium (navigation error handling fails under browser storage restrictions)
ISSUES.md:179: - **Affected area**: `apps/web/src/app/core/app/chunk-load-recovery.ts:22` and its registration in `app.config.ts` in [PR #15](https://github.com/plamarque/hatcast/pull/15).
ISSUES.md:180: - **Observed behavior (2026-10-21)**: The default argument `storage = sessionStorage` reads the browser property before the function body and its `try`. If that getter throws `SecurityError`, the router error handler throws instead of returning `false`, including for unrelated navigation errors. The existing unavailable-storage test only makes `getItem()` throw on an explicitly supplied object.
ISSUES.md:181: - **Expected behavior**: Classify the navigation error first, then resolve default browser storage inside the guarded block; denied storage access returns `false` without replacing the original error.
ISSUES.md:182: - **Verification**: Reproduced against the exact PR helper, transpiled with the installed TypeScript compiler: a throwing global `sessionStorage` getter escapes for both chunk and unrelated errors. Direct checks also verified first recovery, suppression inside the guard window, and handling of an injected `getItem()` failure. This is focused helper evidence, not browser or full-suite verification.
ISSUES.md:183: - **Additional PR review finding**: The PR assigns `BUG-038` to stale chunks, but the integration branch already assigns it to composition smoke retries below (commit `c70139a9`). Use a free identifier for the stale-chunk issue before integration; preserve the existing record.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
1c307c85 2026-10-21T23:33:10+02:00 fix(pwa): Recover stale lazy-route failures
```

### B01/BUG-040
ISSUES.md:148: ### BUG-040 — Stale client cannot load removed lazy chunks after deployment
ISSUES.md:149: - **ID**: BUG-040
ISSUES.md:150: - **Status**: Fixed locally — recovery verified; phone smoke accepted 2026-10-21; not deployed
ISSUES.md:151: - **Severity**: Medium (navigation can remain blocked until update/reload)
ISSUES.md:152: - **Affected area**: V2 static asset serving, router lazy imports and PWA client lifecycle.
ISSUES.md:153: - **Observed behavior**: [PR #15](https://github.com/plamarque/hatcast/pull/15), reviewed at `8740a147c63397623b5cc7bd3e2cadc1197491cb`, describes an old open client requesting removed hashed chunks and receiving HTML instead. Its one occurrence in 30 days is author-reported, not a fresh analytics measurement. Its blind reload did not establish coherent active-SW recovery. The replacement uses consent-only readiness checks and full navigation; six real-browser fixture cases, including a real active worker, pass locally.
ISSUES.md:154: - **Expected behavior**: Global generic update dialog after detected failure, explicit consent, ready-version check followed by full navigation when controlled, and exact destination restoration in web and installed PWA.
ISSUES.md:155: - **Notes/context**: A healthy SW prefetches old chunks, so controlled-client reproduction must include cache loss. Use this free ID instead of the PR's colliding BUG-038. See `spec-pr-15-stale-client-recovery.md` and supporting investigation/verification artifacts. Bootstrap-before-shell failures are outside modal reach. Accepted rare residual: NO_NEW_VERSION_DETECTED is broadcast to all worker clients; a simultaneous check against a different manifest can make an inconclusive local check appear known. A consented reload may then need another refresh. No cross-tab correlation is added for this low-impact case.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
1c307c85 2026-10-21T23:33:10+02:00 fix(pwa): Recover stale lazy-route failures
```

### B01/BUG-041
ISSUES.md:157: ### BUG-041 — Manual PWA check does not request Angular application-version check
ISSUES.md:158: - **ID**: BUG-041
ISSUES.md:159: - **Status**: Open — pre-existing behavior identified during PR #15 investigation; not included as a general manual-check refactor
ISSUES.md:160: - **Severity**: Medium (manual update feedback may miss a deploy with unchanged worker script)
ISSUES.md:161: - **Affected area**: `apps/web/src/app/core/pwa/pwa-update.service.ts`, `checkForUpdatesManually()` and `pollForAppUpdate()`.
ISSUES.md:162: - **Observed behavior**: These methods call registration.update() and await VERSION_READY/waiting worker, but never call SwUpdate.checkForUpdate(). Updating the worker script is distinct from checking the Angular app manifest; deployment may change app chunks without changing the worker script.
ISSUES.md:163: - **Expected behavior**: An explicit application-update check requests Angular's application-version check and distinguishes no update from failure.
ISSUES.md:164: - **Evidence/limits**: Source inspection against baseline `3a0a08482a4e9d1961f9b2469123ffc874a685c5`, installed Angular 21.2.9 and official SwUpdate documentation. A recovery-specific API is planned; no standalone manual-check browser reproduction or fix is claimed.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
1c307c85 2026-10-21T23:33:10+02:00 fix(pwa): Recover stale lazy-route failures
```

### B01/BUG-042
ISSUES.md:166: ### BUG-042 — Failed lazy analytics import can prevent application bootstrap
ISSUES.md:167: - **ID**: BUG-042
ISSUES.md:168: - **Status**: Open — pre-existing source-level finding; outside the post-bootstrap recovery scope
ISSUES.md:169: - **Severity**: Medium (conditional failure before recovery UI exists)
ISSUES.md:170: - **Affected area**: `apps/web/src/app/app.config.ts`, `core/analytics/product-analytics.service.ts` and `posthog-browser.client.ts`.
ISSUES.md:171: - **Observed behavior**: The app initializer awaits ProductAnalyticsService.bootstrap(); ensureInitialized() propagates rejection from the lazy posthog-js import when configured. A failed import can reject bootstrap before App and its recovery dialog exist.
ISSUES.md:172: - **Expected behavior**: A failed optional analytics initialization should not prevent the application shell from starting.
ISSUES.md:173: - **Evidence/limits**: Verified promise chain in the integration baseline; conditional on analytics being configured and the import failing. No production frequency or browser reproduction established. Record separately rather than claiming the recovery modal covers a shell that never starts.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
1c307c85 2026-10-21T23:33:10+02:00 fix(pwa): Recover stale lazy-route failures
```

### B01/BUG-043
ISSUES.md:138: ### BUG-043 — Optional storage failure can prevent reload after PWA activation
ISSUES.md:139: - **ID**: BUG-043
ISSUES.md:140: - **Status**: Fixed locally — optional changelog storage isolated; post-activation reload regression passes; not deployed
ISSUES.md:141: - **Severity**: Medium (conditional mixed-version runtime after user-confirmed update)
ISSUES.md:142: - **Affected area**: `apps/web/src/app/core/pwa/pwa-update.service.ts`, `applyUpdate()`.
ISSUES.md:143: - **Observed behavior**: The method activates the worker version, writes the optional changelog flag to sessionStorage, then reloads. If the storage getter/setItem throws after successful activation, the catch clears refreshing without reloading, leaving old JavaScript running after the client-version switch.
ISSUES.md:144: - **Expected behavior**: Optional storage bookkeeping must not prevent full navigation after a successful activation; it should be isolated as best effort.
ISSUES.md:145: - **Verification (2026-10-21)**: Executed the exact existing applyUpdate method with activateUpdate resolving true and setItem throwing: activation happened, reload did not, refreshing became false. This is a deterministic method-level test, not a production frequency or browser reproduction.
ISSUES.md:146: - **Context**: See `pr-15-recovery-party-review.md`, R7. The ordinary update path keeps its existing activation policy with only the optional storage flag guarded; recovery uses a separate readiness-check/full-navigation path.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
1c307c85 2026-10-21T23:33:10+02:00 fix(pwa): Recover stale lazy-route failures
```

### B01/BUG-044
ISSUES.md:128: ### BUG-044 — Phone recovery fixture cannot always be restarted with another client open
ISSUES.md:129: - **ID**: BUG-044
ISSUES.md:130: - **Status**: Closed — repeated two-client checks pass; Patrice confirmed phone repeatability 2026-10-21; temporary fixture removed at closure
ISSUES.md:131: - **Severity**: Medium (blocks repeated human verification)
ISSUES.md:132: - **Affected area**: Temporary phone fixture reset dashboard at Tailscale :8443, service-worker cache reset.
ISSUES.md:133: - **Observed behavior**: Patrice reports that the scenario works only once. Three consecutive single-client cycles pass; keeping a second client open on B reproduces a timeout loading the reset A home. The old worker can remain associated with a live client while its caches are cleared.
ISSUES.md:134: - **Expected behavior**: Reset always starts a fresh A screen and permits another complete recovery, including when Chrome and the installed PWA remain open.
ISSUES.md:135: - **Notes/context**: Fix: test reset preserves worker registrations and caches needed by other live clients, restores server A, and bypasses worker navigation only for its initial test Home document. Three consecutive complete cycles pass with another B client left open. Keep this separate from production ChunkRecoveryService. Phone screenshot also requests primary-left / dismiss-right actions in one row; scoped dialog CSS and DOM order corrected. Actual dark-theme Chromium at 320px: primary width151px/height56px, dismiss width81px/height48px, same row, no overflow. Patrice confirmed repeatability on Android. Temporary fixture and phone access removed at closure.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
1c307c85 2026-10-21T23:33:10+02:00 fix(pwa): Recover stale lazy-route failures
```

### B01/BUG-045
ISSUES.md:109: ### BUG-045 — Unlock rejected while composition appears validated
ISSUES.md:110: - **Status**: Closed locally on 2026-10-22 — Patrice accepted the phone recipe and authorized local closure. Not deployed.
ISSUES.md:111: - **Severity**: Medium (conditional organizer blockage after concurrent unlock).
ISSUES.md:112: - **Affected area**: Event Équipe tab, composition unlock lifecycle.
ISSUES.md:115: - **Fix**: On unlock HTTP 409, reload the authoritative composition, propagate it to the parent, and restore draft actions. Acknowledge an already-unlocked draft only after a successful read. Preserve assignments/statuses, retain other errors, ignore responses after navigation/destruction, and keep interactions blocked through recovery. The backend contract is unchanged.
ISSUES.md:116: - **Verification**: 158 tests passed across the Équipe component and event-detail parent, including 18 new recovery cases; production build passed. Independent review findings addressed. Patrice verified the prepared two-tab scenario on his phone and explicitly accepted closure. Existing Material controls and layout are reused, with no checklist waiver.
ISSUES.md:118: - **Scope/limits**: Recovery is validated for this incident pattern. This does not add live synchronization or prevent concurrent edits. Production records were inspected through the provided replays and screenshots; no production data was modified.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
9e3e3ad6 2026-10-22T22:30:45+02:00 fix(web): Recover stale composition unlock state
```

### B01/BUG-046
ISSUES.md:101: ### BUG-046 — Guest navigation E2E expects an incomplete fixture title
ISSUES.md:102: - **Status**: Fixed locally — complete E2E suite passed (100 passed, 4 skipped); CI verification pending.
ISSUES.md:103: - **Severity**: Low (release verification blocked; no application defect established).
ISSUES.md:104: - **Affected area**: `apps/web/e2e/recette-3-25.spec.ts`, scenario 3.25-E2E-10.
ISSUES.md:106: - **Expected behavior**: Assert the complete season title created by `E2eStory325FixtureService`, preserving the destination URL and navigation checks.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
d15773ca 2026-10-23T05:48:08+02:00 test(nav): Match the guest season fixture title
```

### B01/BUG-POSTHOG-002
ISSUES.md:185: ### BUG-POSTHOG-002 — Production promotion capture fails its acceptance guard
ISSUES.md:186: - **ID**: BUG-POSTHOG-002
ISSUES.md:187: - **Status**: Closed locally (2026-10-23) — reviewed correction integrated into local v2; regression tests pass; corrected CI execution pending. Historical deployment workflows remain unchanged.
ISSUES.md:188: - **Recurrence (2026-10-23)**: Production 2.7.0 [workflow 39910450325](https://github.com/plamarque/hatcast/actions/runs/39910450325), commit `37e1bfd27c9107aaca3d44dd796255de1ed70187`: deploy succeeded; revision `hatcast-v2-00026-wn2` serves 100% of traffic. The PostHog job fails with the same acceptance-guard message. Public version 2.7.0 / production channel, health UP and PWA smoke passed in the historical release evidence. This observability failure did not undo deployment. No quota/billing/credential change or retry performed; the message alone does not prove quota exhaustion.
ISSUES.md:189: - **Severity**: Medium (release observability incomplete; deployment remains successful)
ISSUES.md:190: - **Affected area**: `scripts/v2/posthog-lifecycle-dashboard.mjs`, production workflow `posthog-lifecycle` job.
ISSUES.md:191: - **Observed behavior**: [Workflow 39130429450](https://github.com/plamarque/hatcast/actions/runs/39130429450), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: deployment succeeded, revision `hatcast-v2-00024-5n9` serves 100% of traffic, but lifecycle synchronization failed with `PostHog promotion capture was not accepted without quota limits`. Overall workflow is red despite its successful deployment job. Read-only checks returned version 2.6.3, production channel, and health UP.
ISSUES.md:192: - **Expected behavior**: Promotion capture is accepted without quota limitation and lifecycle dashboard synchronization completes.
ISSUES.md:193: - **Notes/context**: The guard raises for either `status !== 1` or a nonempty `quota_limited` list; the redacted log does not distinguish those cases, so a quota exhaustion diagnosis is not established. Dashboard provisioning is not reached after this error. No retry, quota/billing change, credential change, or production rollback was performed. The prior staging E1 gate was green; user approved production using the existing human recipe and requested no repeat tests.
ISSUES.md:194: - **Established defect**: The guard requires numeric `1`, whereas the EU capture success contract returns the string `"Ok"` ([official response contract](https://posthog.com/docs/api#responses)). The [capture implementation](https://github.com/PostHog/posthog/blob/master/rust/capture/src/api.rs) derives Serde serialization for enum `CaptureResponseCode::Ok`: its Rust discriminant `= 1` does not make its JSON serialization numeric. Thus even an accepted, non-limited response is rejected before dashboard provisioning. HTTP success alone remains insufficient because quota-limited captures also return HTTP 200.
ISSUES.md:197: - **Correction**: Extract capture acceptance into `capturePromotion`; accept exact `"Ok"` and legacy numeric `1`, only with absent or empty-array quota metadata. Nonempty quota arrays, malformed quota metadata, unknown status, HTTP failure, invalid JSON and transport failure remain errors and stop provisioning. Diagnostics contain only HTTP code, a fixed status classification, and quota absence/invalidity/count; no raw body, status value, resource names, token or authentication headers. Payload identity, promotion date, ownership and deployment gates are unchanged.
ISSUES.md:198: - **Verification**: `node --test scripts/v2/posthog-lifecycle-dashboard.test.mjs` passes all 8 tests, including EU/legacy success, quota rejection, malformed replies, HTTP/JSON/transport errors, sensitive diagnostic redaction, and `--apply` ordering (provision after acceptance; no provisioning after rejection). Existing ownership/idempotent-provisioning and no-ingestion validation tests remain green. Manifest preview and `git diff --check` pass.
ISSUES.md:199: - **Limits / delivery**: The historical response bodies and quota fields were not recorded and cannot be reconstructed; do not claim a captured historical `quota_limited=[]` or a full billing audit. The protocol mismatch is established by the official contract/source and the real ingested release references. No isolated `--validate` run was needed: it would mutate managed dashboard objects and would not exercise capture. No remote mutation, event, workflow rerun, release/promotion script, tag, traffic change, credentials/permissions/billing change, or push was performed for this fix. Local integration into v2 was authorized separately at closure. Current private API access and end-to-end success of the corrected CI job remain unverified. Historical reports under `/private/tmp/hatcast-2.7.0-prod-proof/` were read only and are not evidence that this correction has shipped.
ISSUES.md:201: Read-only diagnostic query (no People fields, distinct IDs or raw properties):
ISSUES.md:203: ```sql
ISSUES.md:204: SELECT properties.release_id AS release_id, count() AS occurrences,
ISSUES.md:205:        min(timestamp) AS first_promoted_at
ISSUES.md:206: FROM events WHERE event = 'hatcast_release_promoted'
ISSUES.md:207: GROUP BY release_id ORDER BY first_promoted_at DESC LIMIT 10
ISSUES.md:208: ```

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
c27f369e 2026-10-18T16:08:33+02:00 docs(issues): Record PostHog promotion guard
```

### B01/BUG-047
ISSUES.md:93: ### BUG-047 — Google sign-in reports an unapproved V2 staging origin
ISSUES.md:94: - **Status**: Observed during the 2.7.0-rc.1 browser smoke; Google sign-in itself was not exercised.
ISSUES.md:95: - **Severity**: Low (staging-only console finding; impact on Google sign-in requires verification).
ISSUES.md:96: - **Affected area**: Google Identity Services on `https://hatcast-v2-staging-gz5evlelnq-od.a.run.app/connexion`.
ISSUES.md:97: - **Observed behavior**: The login page emits `[GSI_LOGGER]: The given origin is not allowed for the given client ID.` Browser extensions emit separate unrelated warnings.
ISSUES.md:98: - **Expected behavior**: A supported staging login origin is accepted by the configured Google OAuth web client.
ISSUES.md:99: - **Evidence and limits**: Browser console during the 2026-10-23 RC smoke, revision `hatcast-v2-staging-00127-r66`; email/password login passed for both configured E2E roles. No Google login attempt, client configuration change, or production impact is established.

First Git insertion candidates (all refs; author date, not discovery/deploy timestamp):
```text
9fb5e2a4 2026-10-23T09:54:53+02:00 docs(release): Record audit and delivery proposal
```

## B02 — July production cutover gate

```text
commit bb07b52104067e4955ef16751a0f595018abd779
Author: Patrice Lamarque <patrice.lamarque@gmail.com>
Date:   Sun Jul 12 11:29:02 2026 +0200

    ops(v1): Enable M4 cutover gate in production CI
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

diff --git a/.github/workflows/deploy-production.yml b/.github/workflows/deploy-production.yml
index c147961b..b39019cf 100644
--- a/.github/workflows/deploy-production.yml
+++ b/.github/workflows/deploy-production.yml
@@ -35,6 +35,8 @@ jobs:
         VITE_ENVIRONMENT=production
         VITE_FIRESTORE_DATABASE=default
         VITE_STORAGE_PREFIX=production/
+        VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED=true
+        VITE_V2_PROD_URL=https://hatcast.app
 
         EOF
         

```

## B03 — July gate runtime service

```text
const DEFAULT_V2_PROD_URL = 'https://hatcast.app'

export function resolveCutoverAnnouncementEnabled(envValue) {
  return envValue === 'true'
}

export function isCutoverAnnouncementEnabled() {
  return resolveCutoverAnnouncementEnabled(import.meta.env.VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED)
}

export function getV2ProdUrl() {
  return resolveV2ProdUrl(import.meta.env.VITE_V2_PROD_URL)
}

export function resolveV2ProdUrl(envValue) {
  const trimmed = String(envValue ?? '').trim()
  if (!trimmed) {
    return DEFAULT_V2_PROD_URL
  }
  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed.replace(/^\/+/, '')}`
}

export function formatV2ProdUrlForDisplay(url) {
  return resolveV2ProdUrl(url).replace(/^https?:\/\//, '').replace(/\/$/, '')
}

```

## B04 — July App gate excerpts

```text
1: <template>
2:   <Transition
3:     name="install-banner"
4:     appear
5:   >
6:     <div
7:       v-if="showCutoverBlock"
8:       data-testid="v2-cutover-announcement"
9:       role="dialog"
10:       aria-modal="true"
11:       aria-labelledby="v2-cutover-announcement-title"
12:       class="fixed inset-0 z-[100000] flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4"
13:     >
14:       <div class="w-full max-w-md bg-black/80 border border-gray-700 rounded-2xl p-6 text-center">
15:         <div class="flex flex-col items-center gap-4">
16:           <img
17:             src="/icons/icon-48x48.png"
18:             alt=""
19:             class="w-16 h-16 rounded-lg"
20:           />
21:           <h1
22:             id="v2-cutover-announcement-title"
23:             class="font-semibold text-2xl text-white"
24:           >
25:             HatCast
26:           </h1>
27:           <p class="text-sm text-gray-300 leading-relaxed">
28:             Cette version de HatCast n'est plus disponible. Retrouvez vos saisons et spectacles sur HatCast 2 sur
29:             <span class="text-white font-medium">{{ v2ProdUrlDisplay }}</span>.
30:           </p>
31:           <a
32:             data-testid="v2-cutover-announcement-cta"
33:             :href="v2ProdUrl"
34:             rel="noopener noreferrer"
35:             autofocus
36:             class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
37:           >
38:             Continuer sur HatCast 2
39:           </a>
40:         </div>
41:       </div>
42:     </div>
43:   </Transition>
44: 
45:   <div
46:     v-if="!showCutoverBlock"
47:     data-testid="app-loaded"
48:     class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
49:   >
50:     <router-view v-slot="{ Component }">
275: const bannerDismissed = ref(false)
276: const v2ProdUrl = getV2ProdUrl()
277: const v2ProdUrlDisplay = formatV2ProdUrlForDisplay(v2ProdUrl)
278: const showCutoverBlock = computed(() => isCutoverAnnouncementEnabled())
279: 
671:   if (!showCutoverBlock.value && shouldShowCutoverModal()) {
672:     await initPostHogCutover()
673:     showV2CutoverModal.value = true
674:     captureCutoverEvent(V1_CUTOVER_MODAL_SHOWN)
675:   }
676: 
677:   if (showCutoverBlock.value) {
678:     return
679:   }
```

## B05 — Staging traffic correction

```text
commit 313464f08ddb8f5583dc19fd9b2b1dc1e0b8a70a
Author: Patrice Lamarque <patrice.lamarque@gmail.com>
Date:   Sat Sep 19 18:11:29 2026 +0200

    fix(ci): Route staging to latest revision

diff --git a/.github/workflows/deploy-v2-cloud-run.yml b/.github/workflows/deploy-v2-cloud-run.yml
index 48123b0d..927406c3 100644
--- a/.github/workflows/deploy-v2-cloud-run.yml
+++ b/.github/workflows/deploy-v2-cloud-run.yml
@@ -321,6 +321,13 @@ jobs:
             --cpu 1 \
             --startup-probe=initialDelaySeconds=0,timeoutSeconds=10,periodSeconds=10,failureThreshold=60,httpGet.path=/,httpGet.port=8080 \
             --env-vars-file="${ENV_FILE}"
+          # Staging can retain a manually pinned revision after a prior rollback.
+          # The E1 gate must exercise the image built by this workflow.
+          if [ "${TARGET_ENV}" = "staging" ]; then
+            gcloud run services update-traffic "${SERVICE_NAME}" \
+              --region "${GCP_REGION}" \
+              --to-latest
+          fi
           # --allow-unauthenticated peut échouer à appliquer IAM ; voir DEPLOY_V2_CLOUD_RUN.md §4.1
           gcloud run services add-iam-policy-binding "${SERVICE_NAME}" \
             --region "${GCP_REGION}" \

```

## B06 — Incident corrective commit paths

```text
commit aaf7dbb4c6e2da395e9baeb4c91e2dec03b28a6c
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Thu Sep 17 11:00:07 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Thu Sep 17 11:00:07 2026 +0200

    fix(event-detail): Show Relance dispos on Infos via BFF flag
    
    Expose hasUnknownAvailability on the event page BFF so the orga gear
    menu can show Relance dispos without visiting the Dispos tab (BUG-020).
    
    Co-authored-by: Cursor <cursoragent@cursor.com>

 ISSUES.md                                          |  53 +++++++
 apps/web/src/app/core/events/event-api.service.ts  |   2 +
 .../app/pages/event-detail/event-detail.spec.ts    | 157 ++++++++++++---------
 .../web/src/app/pages/event-detail/event-detail.ts |  14 +-
 services/api/openapi/events.yaml                   |   6 +
 .../api/availability/AvailabilityService.kt        |  24 ++++
 .../com/hatcast/api/event/EventPageService.kt      |  54 +++++++
 .../com/hatcast/api/event/dto/EventPageDtos.kt     |   2 +
 .../hatcast/api/event/EventPageIntegrationTest.kt  |  89 ++++++++++--
 9 files changed, 313 insertions(+), 88 deletions(-)

commit 105fe455ba40a4e05958aabc13d5160f60f712b5
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Thu Sep 17 14:07:01 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Thu Sep 17 14:07:01 2026 +0200

    fix(availability): Clarify role selection

 DOMAIN.md                                          |   2 +-
 ISSUES.md                                          |  12 +-
 SPEC.md                                            |   6 +
 .../bug-021-implementation-report.md               |  95 ++++++++
 .../implementation-artifacts/bug-021-review.md     |  24 ++
 .../e2e-evidence/bug-021.json                      |  18 ++
 .../spec-bug-021-availability-consistency.md       | 117 ++++++++++
 .../e2e/recette-agenda-participation-cell.spec.ts  | 159 +++++++++++++
 .../pages/member-home-todo/member-home-todo.html   |  45 +---
 .../member-home-todo/member-home-todo.spec.ts      |  15 ++
 .../app/pages/member-home-todo/member-home-todo.ts |  35 ++-
 apps/web/src/app/pages/season-home/season-home.ts  |   3 +
 .../web/src/app/pages/user-agenda/user-agenda.html |  41 +---
 .../src/app/pages/user-agenda/user-agenda.spec.ts  |  38 +++
 apps/web/src/app/pages/user-agenda/user-agenda.ts  | 127 ++--------
 .../shared/availability/availability-dialog.html   |  13 +-
 .../shared/availability/availability-dialog.scss   |  10 +
 .../availability/availability-dialog.spec.ts       | 224 ++++--------------
 .../app/shared/availability/availability-dialog.ts |  21 +-
 .../app/shared/availability/availability-form.html |  44 ++--
 .../app/shared/availability/availability-form.scss |  25 +-
 .../shared/availability/availability-form.spec.ts  | 260 ++++++++++-----------
 .../app/shared/availability/availability-form.ts   | 174 +++++---------
 .../availability/availability-moi-panel.html       |   3 +-
 .../availability/availability-persist.service.ts   |   2 +-
 .../shared/availability/availability-poll.spec.ts  |  17 ++
 .../app/shared/availability/availability-poll.ts   |   6 +-
 .../open-agenda-availability-dialog.ts             |   9 +-
 .../agenda-event-actions.service.spec.ts           |  73 ++++++
 .../participation/agenda-event-actions.service.ts  |  94 ++++++++
 .../shared/participation/agenda-event-card.html    |  34 +++
 .../shared/participation/agenda-event-card.scss    |   1 +
 .../shared/participation/agenda-event-card.spec.ts |  29 +++
 .../app/shared/participation/agenda-event-card.ts  |  30 +++
 docs/v2/technical/FRONTEND_UI.md                   |   7 +-
 services/api/openapi/availability.yaml             |   6 +-
 .../api/availability/AvailabilityService.kt        |  20 +-
 .../AvailabilityControllerIntegrationTest.kt       |  86 +++++--
 .../UnfulfilledRoleRequestServiceTest.kt           |  15 +-
 .../api/event/EventControllerIntegrationTest.kt    |   2 +-
 ...tionNotificationTriggerMatrixIntegrationTest.kt |   4 +-
 .../api/season/SeasonDeleteIntegrationTest.kt      |   2 +-
 42 files changed, 1219 insertions(+), 729 deletions(-)

commit 9bdceadb09ecffcc11c079dfee14bd1bbeaefa30
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Mon Sep 28 08:19:45 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Mon Sep 28 13:17:43 2026 +0200

    fix(dispos): Show unavailable respondents

 ISSUES.md                                          |  3 ++-
 .../spec-fix-unavailable-poll-expansion.md         | 30 ++++++++++++++++++++++
 .../shared/availability/availability-poll.spec.ts  | 28 ++++++++++++++++++++
 .../app/shared/availability/availability-poll.ts   |  3 ++-
 4 files changed, 62 insertions(+), 2 deletions(-)

commit 030426fd24e7fb56ce0d687ae39b34fd87018e98
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Tue Sep 22 01:32:06 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Tue Sep 22 01:32:06 2026 +0200

    fix(stats): Select current season by default

 ISSUES.md                                          |  11 ++
 .../implementation-artifacts/deferred-work.md      |   4 +
 .../spec-fix-stats-current-season.md               | 145 +++++++++++++++++++++
 .../member-season-glance.spec.ts                   |  26 ++++
 .../member-season-glance/member-season-glance.ts   |   6 +
 scripts/v2/bmad-runtime.env                        |   8 +-
 scripts/v2/test-fixtures/mock-bmad-provisioner.sh  |   2 +-
 scripts/v2/test-fixtures/mock-npx.sh               |   4 +-
 .../api/memberglance/MemberSeasonGlanceService.kt  |   4 +-
 .../memberglance/MemberSeasonGlanceServiceTest.kt  |  55 ++++++++
 10 files changed, 256 insertions(+), 9 deletions(-)

commit aa89f644c44e613f431f703366805cd5de79c196
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Tue Sep 29 22:51:06 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Tue Sep 29 22:51:06 2026 +0200

    fix(troupe-hub): Fix mobile season chart

 ISSUES.md                                          | 11 +++
 ...-028-troupe-hub-mobile-season-chart-overflow.md | 94 ++++++++++++++++++++++
 apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts   |  2 +
 apps/web/e2e/helpers/troupe-hub.ui.ts              | 65 +++++++++++++++
 apps/web/src/app/pages/troupe-hub/troupe-hub.html  | 40 ++++-----
 .../src/app/pages/troupe-hub/troupe-hub.spec.ts    |  7 ++
 6 files changed, 201 insertions(+), 18 deletions(-)

commit 20aee05445118a98e3ce123d2aaf1fa3bd70e695
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Tue Oct 13 17:25:33 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Tue Oct 13 17:25:33 2026 +0200

    fix(composition): Prevent cancel role reset

 ISSUES.md                                          | 12 ++++++++
 .../spec-bug-031-cancel-role-slots.md              | 36 ++++++++++++++++++++++
 .../app/pages/event-detail/event-infos-tab.spec.ts | 32 +++++++++++++++++++
 .../src/app/pages/event-detail/event-infos-tab.ts  | 25 ++++++++++++++-
 .../event-detail/event-type-roles-dialog.html      |  2 +-
 .../event-detail/event-type-roles-dialog.spec.ts   | 11 +++++++
 6 files changed, 116 insertions(+), 2 deletions(-)

commit 0eaa92381ff784d49a25e86cb14c7dd17af9aefa
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Wed Oct 14 22:02:31 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Wed Oct 14 22:08:04 2026 +0200

    fix(membership): Sync season participants
    
    Synchronize direct adds, CSV imports, and self-joins with season rosters.\n\nHeal missing roster rows on unchanged admin and CSV updates while preserving explicit season removals.

 ISSUES.md                                          |  12 ++
 .../spec-fix-member-season-sync.md                 |  37 +++++
 .../api/troupe/TroupeMemberCsvImportService.kt     |  17 +-
 .../hatcast/api/troupe/TroupeMembershipService.kt  |  24 +--
 .../api/troupe/TroupeMembershipIntegrationTest.kt  | 171 +++++++++++++++++++--
 .../TroupeMembershipLifecycleIntegrationTest.kt    |   5 +-
 .../api/troupe/TroupeMembershipServiceTest.kt      |   2 +
 7 files changed, 241 insertions(+), 27 deletions(-)

commit 654652e8808fe08ee3e240b89326fb569c2d009a
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Wed Oct 14 08:06:53 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Wed Oct 14 08:06:53 2026 +0200

    fix(equipe): Preserve mobile member names

 ISSUES.md                                          | 11 ++++++++
 .../spec-fix-equipe-mobile-role-icon.md            | 31 ++++++++++++++++++++++
 .../src/styles/_hatcast-equipe-composition.scss    | 24 +++++++++++++++++
 3 files changed, 66 insertions(+)

commit 5c8e6e9c8e9e2763ae242527b208ca6e76ad71a4
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Sun Oct 18 08:40:50 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Sun Oct 18 08:40:50 2026 +0200

    test(api): Isolate regression fixtures

 ISSUES.md                                          |  37 ++++++-
 .../spec-bug-037-api-fixtures.md                   | 110 ++++++++++++++++++++
 .../api/agenda/UserAgendaIntegrationTest.kt        |  44 ++++----
 .../agenda/UserAgendaPerformanceIntegrationTest.kt | 112 +++++++++++++++------
 .../api/audit/AuditEventReadIntegrationTest.kt     |  72 ++++++-------
 .../AvailabilityControllerIntegrationTest.kt       |   7 ++
 .../hatcast/api/inbox/MeInboxIntegrationTest.kt    |  23 +++--
 .../MemberSeasonGlanceIntegrationTest.kt           |  43 ++++----
 .../memberprofile/MemberProfileIntegrationTest.kt  |  44 +++++---
 .../memberprofile/SeasonGlanceStatsProviderTest.kt |   3 +
 .../com/hatcast/api/support/TestAuthSupport.kt     |  10 ++
 .../TroupeMembershipLifecycleIntegrationTest.kt    |  53 ++++++----
 12 files changed, 414 insertions(+), 144 deletions(-)

commit c70139a9c677a05fbc2c3f8acfa5eb408c8a9eff
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Sun Oct 18 15:12:56 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Sun Oct 18 15:12:56 2026 +0200

    docs(issues): Record composition smoke flake

 ISSUES.md | 11 +++++++++++
 1 file changed, 11 insertions(+)

commit c27f369ecbd5ee5ecfca350440bcea78d3a9a6c7
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Sun Oct 18 16:08:33 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Sun Oct 18 16:08:33 2026 +0200

    docs(issues): Record PostHog promotion guard

 ISSUES.md | 11 +++++++++++
 1 file changed, 11 insertions(+)

commit 1c307c8528a7e98233931a5491314dd1bd767e76
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Wed Oct 21 23:33:10 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Wed Oct 21 23:33:10 2026 +0200

    fix(pwa): Recover stale lazy-route failures
    
    Offer user-confirmed update and full navigation after route import
    failures. Preserve drafts on dismissal and existing error reporting.
    
    Keep missing assets out of SPA fallback and isolate optional update
    storage. Verify targeted tests, production build and phone recovery.
    Temporary interactive smoke fixtures are removed before closure.

 ARCH.md                                            |   2 +
 ISSUES.md                                          |  61 ++++
 SPEC.md                                            |   8 +
 .../pr-15-recovery-investigation.md                |  63 ++++
 .../pr-15-recovery-party-review.md                 |  60 ++++
 .../pr-15-recovery-verification.md                 |  68 ++++
 .../spec-pr-15-stale-client-recovery.md            | 112 +++++++
 apps/web/src/app/app.config.ts                     |   7 +-
 apps/web/src/app/app.html                          |   6 +-
 apps/web/src/app/app.spec.ts                       |  13 +
 apps/web/src/app/app.ts                            |   2 +
 .../app/core/pwa/chunk-recovery.service.spec.ts    | 360 +++++++++++++++++++++
 .../web/src/app/core/pwa/chunk-recovery.service.ts | 161 +++++++++
 .../src/app/core/pwa/pwa-update.service.spec.ts    |  11 +
 apps/web/src/app/core/pwa/pwa-update.service.ts    |   6 +-
 .../chunk-recovery-dialog.spec.ts                  |  66 ++++
 .../chunk-recovery-dialog/chunk-recovery-dialog.ts |  72 +++++
 deploy/v2/nginx.conf.template                      |  14 +
 18 files changed, 1087 insertions(+), 5 deletions(-)

commit 9e3e3ad61b8040016a5cc87d8975be5f0e3cd433
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Thu Oct 22 22:30:45 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Thu Oct 22 22:30:45 2026 +0200

    fix(web): Recover stale composition unlock state

 ISSUES.md                                          |  11 ++
 .../spec-bug-045-composition-unlock.md             |  61 ++++++
 .../app/pages/event-detail/event-detail.spec.ts    |  45 +++++
 .../pages/event-detail/event-equipe-tab.spec.ts    | 204 ++++++++++++++++++++-
 .../src/app/pages/event-detail/event-equipe-tab.ts |  45 +++--
 5 files changed, 351 insertions(+), 15 deletions(-)

commit d15773cacf638216ac49b41612f2a5ef9285e877
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Fri Oct 23 05:48:08 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Fri Oct 23 05:48:08 2026 +0200

    test(nav): Match the guest season fixture title

 ISSUES.md                         | 8 ++++++++
 apps/web/e2e/recette-3-25.spec.ts | 2 +-
 2 files changed, 9 insertions(+), 1 deletion(-)

commit 1107b638183550d04e6541f9c05741ab01929ae6
Author:     Patrice Lamarque <patrice.lamarque@gmail.com>
AuthorDate: Fri Oct 23 09:41:20 2026 +0200
Commit:     Patrice Lamarque <patrice.lamarque@gmail.com>
CommitDate: Fri Oct 23 09:41:20 2026 +0200

    fix(posthog): Accept EU capture success status

 ISSUES.md                                       |  22 +++++-
 docs/v2/technical/PWA_LIFECYCLE_POSTHOG.md      |   2 +
 scripts/v2/posthog-lifecycle-dashboard.mjs      |  37 +++++++--
 scripts/v2/posthog-lifecycle-dashboard.test.mjs | 101 +++++++++++++++++++++++-
 4 files changed, 152 insertions(+), 10 deletions(-)

```

## B07 — RC and release chronology

```text
37e1bfd2 2026-10-23T07:34:28+02:00 chore(v2): release staging v2.7.0-rc.2
2c4dbe85 2026-10-23T06:13:56+02:00 chore(v2): release staging v2.7.0-rc.1
a5fb7f48 2026-10-18T08:52:06+02:00 chore(v2): release staging v2.6.3-rc.2
c2a6a4c2 2026-10-18T07:32:57+02:00 chore(v2): release staging v2.6.3-rc.1
7792f8e7 2026-10-16T09:12:21+02:00 chore(v2): release staging v2.6.2-rc.1
3f13bcef 2026-10-13T17:31:38+02:00 chore(v2): release staging v2.6.1-rc.1
c5d0cb19 2026-09-29T23:16:08+02:00 chore(v2): release staging v2.6.0-rc.2
3c302c00 2026-09-29T00:19:17+02:00 chore(v2): release staging v2.6.0-rc.1
87cdaafc 2026-09-19T19:05:41+02:00 chore(v2): release staging v2.5.0-rc.1
477a7920 2026-09-16T00:12:41+02:00 chore(v2): release staging v2.4.6-rc.1
12d46c27 2026-08-04T15:14:44+02:00 chore(v2): release staging v2.4.5-rc.1
4cf606f4 2026-07-12T22:21:10+02:00 chore(v2): release staging v2.4.4-rc.1
86023ea8 2026-07-12T09:33:46+02:00 chore(v2): release staging v2.4.3-rc.2
52fa5ba8 2026-07-11T21:15:50+02:00 chore(v2): release staging v2.4.3-rc.1
3ba27b83 2026-06-22T23:56:17+02:00 chore(v2): release staging v2.4.1-rc.1
761860b0 2026-06-19T21:32:30+02:00 chore(v2): release staging v2.4.0-rc.1
43be2ff4 2026-06-13T12:49:33+02:00 chore(v2): release staging v2.3.0-rc.5
c280a056 2026-06-13T12:28:34+02:00 chore(v2): release staging v2.3.0-rc.4
385d1cb5 2026-06-13T12:09:21+02:00 chore(v2): release staging v2.3.0-rc.3
5f84a9cb 2026-06-13T11:48:49+02:00 chore(v2): release staging v2.3.0-rc.2
a177e0bb 2026-06-07T22:02:09+02:00 chore(v2): release staging v2.3.0-rc.1
3bd3d38f 2026-06-07T01:38:48+02:00 chore(v2): release staging v2.2.0-rc.1
9bb71c98 2026-06-06T02:01:33+02:00 chore(v2): release staging v2.1.1-rc.1
40efc980 2026-06-06T01:57:24+02:00 chore(v2): release staging v2.1.0-rc.4
0a651bc0 2026-06-06T01:50:09+02:00 chore(v2): release staging v2.1.0-rc.3
ce4fcfee 2026-06-06T01:18:31+02:00 chore(v2): release staging v2.1.0-rc.2
6c2fdbbe 2026-06-06T00:58:33+02:00 chore(v2): release staging v2.1.0-rc.1
c025a368 2026-06-05T02:00:14+02:00 chore(v2): release staging v2.0.4-rc.1
5aea39eb 2026-06-04T19:22:06+02:00 chore(v2): release staging v2.0.3-rc.1
86b81a22 2026-06-04T01:50:18+02:00 chore(v2): release staging v2.0.2-rc.1

```

## B08 — historical issue versions

### `20aee054:ISSUES.md`

```text
### BUG-018 — Staging Cloud Run traffic stuck on a named revision
- **ID**: BUG-018
- **Status**: Open (workaround 2026-09-16 — traffic moved to `hatcast-v2-staging-00107-brq`)
- **Severity**: High (staging served stale 2.4.4 while CI deploys succeeded)
- **Affected area**: Cloud Run `hatcast-v2-staging` (`europe-west9`)
- **Observed behavior**: After `gcloud run deploy` from GitHub Actions, new revisions (`00104`–`00107`) were created then Retired. 100% of traffic stayed on `hatcast-v2-staging-00103-mr9` (2.4.4, 2026-07-12). `/version.txt` and the Formules UI stayed on that build. 2.4.5 never received live traffic.
- **Expected behavior**: A successful staging deploy serves the new revision at `https://hatcast-v2-staging-730278491306.europe-west9.run.app`.
- **Cause**: Traffic allocated to a **named** revision, not `LATEST`. Cloud Run then leaves existing split unchanged on deploy.
- **Fix / workaround**: `gcloud run services update-traffic hatcast-v2-staging --region=europe-west9 --project=impro-selector --to-revisions=hatcast-v2-staging-00107-brq=100` (or `--to-latest` after the new revision is Ready). Durable fix: stop pinning named revisions, or add `--to-latest` in CI after deploy.
- **Evidence**: Recette 2.4.6-rc.1 ; CI deploy jobs green while live `version.txt` still showed `2.4.4` / `010452ce`.

### BUG-031 — « Annuler » dans Format et besoins vide les besoins

- **ID**: BUG-031
- **Status**: Open — cause confirmée le 2026-10-13 ; correctif à cadrer
- **Severity**: High (une action ponctuelle peut masquer toute une équipe déjà composée)
- **Affected area**: V2 « Format et besoins » (`EventTypeRolesDialog` / `PATCH events.roleSlots`) et projection Équipe.
- **Expected behavior**: `Annuler` doit fermer sans émettre aucun PATCH. Réduire ou retirer un rôle ne doit pas effacer silencieusement les besoins restants ni rendre invisible une équipe constituée.
- **Cause confirmée**: L'attribut nu `mat-dialog-close` transmet la chaîne vide (`""`) au vrai clic Angular Material, et non `undefined`. `EventInfosTab.openTypeRolesDialog` ignore uniquement `undefined` : il appelle donc `persistTypeRoles("")`. À l'exécution, `result.templateType` et `result.roleSlots` sont alors `undefined`; `normalizeRoleSlots(undefined)` produit une map complète de zéros. `JSON.stringify` omet `templateType` mais envoie `roleSlots` à zéro. Le serveur accepte ce remplacement complet et persiste ces zéros. La re-sélection du format n'est pas nécessaire à l'incident, même si elle fait partie du parcours observé.
- **Reproduction vérifiée**: Le test temporaire a cliqué le vrai bouton `button[mat-dialog-close]` dans le dialogue Angular : `MatDialogRef.close` a reçu `""` (et non `undefined`). La chaîne client puis serveur ci-dessus a été vérifiée dans le code. Le test était volontairement rouge contre l'attendu fonctionnel et a été retiré après diagnostic pour ne pas laisser la branche en échec.
- **Notes/context**: Les événements de type sondage / personnalisé peuvent légitimement ne pas nécessiter de rôle : le correctif ne doit donc pas interdire globalement la valeur vide. Il doit distinguer explicitement une fermeture sans résultat d'une sauvegarde. CN-1 conserve désormais les créneaux affectés hors besoins pour les organisateurs, mais ne prévient pas l'écriture vide et ne les réaffiche pas encore dans l'UI. Voir aussi le chat Codex `01a130ec-46cd-7c60-b532-7634e1c5cfd4`.

```

### `5c8e6e9c:ISSUES.md`

```text
### BUG-018 — Staging Cloud Run traffic stuck on a named revision
- **ID**: BUG-018
- **Status**: Open (workaround 2026-09-16 — traffic moved to `hatcast-v2-staging-00107-brq`)
- **Severity**: High (staging served stale 2.4.4 while CI deploys succeeded)
- **Affected area**: Cloud Run `hatcast-v2-staging` (`europe-west9`)
- **Observed behavior**: After `gcloud run deploy` from GitHub Actions, new revisions (`00104`–`00107`) were created then Retired. 100% of traffic stayed on `hatcast-v2-staging-00103-mr9` (2.4.4, 2026-07-12). `/version.txt` and the Formules UI stayed on that build. 2.4.5 never received live traffic.
- **Expected behavior**: A successful staging deploy serves the new revision at `https://hatcast-v2-staging-730278491306.europe-west9.run.app`.
- **Cause**: Traffic allocated to a **named** revision, not `LATEST`. Cloud Run then leaves existing split unchanged on deploy.
- **Fix / workaround**: `gcloud run services update-traffic hatcast-v2-staging --region=europe-west9 --project=impro-selector --to-revisions=hatcast-v2-staging-00107-brq=100` (or `--to-latest` after the new revision is Ready). Durable fix: stop pinning named revisions, or add `--to-latest` in CI after deploy.
- **Evidence**: Recette 2.4.6-rc.1 ; CI deploy jobs green while live `version.txt` still showed `2.4.4` / `010452ce`.

### BUG-031 — « Annuler » dans Format et besoins vide les besoins

- **ID**: BUG-031
- **Status**: Open — cause confirmée le 2026-10-13 ; correctif à cadrer
- **Severity**: High (une action ponctuelle peut masquer toute une équipe déjà composée)
- **Affected area**: V2 « Format et besoins » (`EventTypeRolesDialog` / `PATCH events.roleSlots`) et projection Équipe.
- **Expected behavior**: `Annuler` doit fermer sans émettre aucun PATCH. Réduire ou retirer un rôle ne doit pas effacer silencieusement les besoins restants ni rendre invisible une équipe constituée.
- **Cause confirmée**: L'attribut nu `mat-dialog-close` transmet la chaîne vide (`""`) au vrai clic Angular Material, et non `undefined`. `EventInfosTab.openTypeRolesDialog` ignore uniquement `undefined` : il appelle donc `persistTypeRoles("")`. À l'exécution, `result.templateType` et `result.roleSlots` sont alors `undefined`; `normalizeRoleSlots(undefined)` produit une map complète de zéros. `JSON.stringify` omet `templateType` mais envoie `roleSlots` à zéro. Le serveur accepte ce remplacement complet et persiste ces zéros. La re-sélection du format n'est pas nécessaire à l'incident, même si elle fait partie du parcours observé.
- **Reproduction vérifiée**: Le test temporaire a cliqué le vrai bouton `button[mat-dialog-close]` dans le dialogue Angular : `MatDialogRef.close` a reçu `""` (et non `undefined`). La chaîne client puis serveur ci-dessus a été vérifiée dans le code. Le test était volontairement rouge contre l'attendu fonctionnel et a été retiré après diagnostic pour ne pas laisser la branche en échec.
- **Notes/context**: Les événements de type sondage / personnalisé peuvent légitimement ne pas nécessiter de rôle : le correctif ne doit donc pas interdire globalement la valeur vide. Il doit distinguer explicitement une fermeture sans résultat d'une sauvegarde. CN-1 conserve désormais les créneaux affectés hors besoins pour les organisateurs, mais ne prévient pas l'écriture vide et ne les réaffiche pas encore dans l'UI. Voir aussi le chat Codex `01a130ec-46cd-7c60-b532-7634e1c5cfd4`.

### BUG-037 — API regression fixtures assume unsynchronized shared memberships
- **ID**: BUG-037
- **Status**: Fixed locally — complete regression and independent review verified; integration pending
- **Severity**: Medium (API regression suite fails; no production behavior change)
- **Affected area**: Agenda, inbox, member glance/profile, audit, availability, lifecycle integration tests and member statistics unit fixtures.
- **Observed behavior**: The v2.6.3 lineage full API run reports 1189 tests, 37 failures and five environment-specific skips (GitHub runs 39100395161 and 38815714661; reproduced locally). Nine affected classes report 102 tests and 32 failures when run together; lifecycle passes 7/7 in isolation.
- **Cause**: Shared seed memberships now synchronize participants after BUG-033, adding projection scopes and duplicate participant setup. Lifecycle conversion payloads omit active seasons created by other classes sharing H2. Three statistics fixtures omit required role counts, so CN-1 correctly excludes their assignments. The remaining performance failure is tracked as BUG-029.
- **Expected behavior**: Explicit isolated troupe/season fixtures preserve automatic synchronization, exact business assertions, and valid required-slot indices; all enabled tests pass in both targeted and complete runs.
- **Fix**: Test-owned troupe/season scopes, reuse of synchronized audit participants, explicit legacy unsynchronized summary precondition, and required role-slot needs. Production code, seeds, migrations and CI gates are unchanged; business expectations are preserved and selected response assertions strengthened.
- **Verification (2026-10-18)**: JDK 21, nine affected classes: 102 tests, zero failures/errors/skips. Each of the nine classes also passed in its own Gradle invocation after review patches. Final complete `./gradlew test --no-daemon`: 1189 tests across 170 classes, zero failures/errors, five unchanged environment-specific skips (two Neon agenda and three Neon composition performance tests), BUILD SUCCESSFUL in 5m 27s. `git diff --check` passes. Three independent review lenses completed; all retained findings resolved, nothing deferred. Integration remains pending.

#### Initial release investigation (before the fixture correction)

- **Status:** Open — qualified during the v2.6.3 staging release on 2026-10-18; release validation blocked pending test remediation or explicit disposition.
- **Severity:** High for release validation; production impact not established.
- **Affected area:** `services/api` full Gradle test suite on GitHub Actions.
- **Observed behavior:** [Run 39100395161](https://github.com/plamarque/hatcast/actions/runs/39100395161), commit `d7dc3c15`, reports 1189 tests completed, 37 failed, 5 skipped. Failures span agenda (including performance), audit, availability summary, inbox, member profile/season glance, composition statistics and membership lifecycle tests. Local Playwright T1 passed separately (94 passed, 4 skipped), as did the staging workflow's E2E step.
- **Expected behavior:** The API regression suite passes or each failing case has an explicitly qualified disposition before production promotion.
- **Investigation (2026-10-18):** The same 37 named failures already occur in [run 38815714661](https://github.com/plamarque/hatcast/actions/runs/38815714661), commit `b39ccfc5`, which is an ancestor of `v2.6.2-rc.1`. [Run 38422699386](https://github.com/plamarque/hatcast/actions/runs/38422699386) on 2026-10-13 already reports the three statistics failures plus the agenda performance fixture failure. These are not newly introduced by the v2.6.3 delta.
- **Reproduction:** Current `v2` full `./gradlew test --no-daemon`: 1189 tests, 37 failures, 5 skipped (5m02s). Running only the nine affected classes: 102 tests, 32 failures; all seven membership lifecycle tests pass in that targeted run. Full-run report: `services/api/build/reports/tests/test/index.html`.
- **Qualified causes:**
  - **28 failures — membership fixture assumptions:** `0eaa9238` (BUG-033) synchronizes self-joined/added members across the troupe's seasons. Helpers join the shared seed troupe but expect an empty or narrowly scoped agenda/inbox/profile. The actual responses contain seed and other test seasons. Audit setup attempts to add an already-synchronized participant (409, "Un participant avec ce nom existe déjà dans la saison."). Availability's read-only test fails its setup precondition before the GET because joining has already created the participant. Breakdown: agenda 15, inbox 9, audit 1, availability 1, season glance 1, member profile 1.
  - **3 failures — statistics fixtures omit required slots:** `b9b0b17c` filters slots with `isRequiredBy(event.roleSlots)` as required by CN-1. The failing unit fixtures construct events with default empty `roleSlots`, then assign slots (index 1) and expect them to count. The resulting null/neutral output follows the required-position rule; the fixtures need explicit matching needs and valid indices.
  - **1 failure — date-dependent performance fixture:** BUG-029 reproduced: the seed now contains 18 upcoming events while the test requires at least 20. It fails before the latency assertion; no performance regression is established.
  - **5 failures — shared database / execution-order dependency:** Membership lifecycle tests pass in the targeted run but fail in the full suite with HTTP 400, "Choisissez pour chaque saison active : externe saison ou retrait du roster." Their conversion payload accounts only for the locally created seasons, while synchronized memberships include additional active seasons in the shared `jdbc:h2:mem:hatcast_test` database. This is related to the isolation concern in LIMIT-002, with a distinct observed symptom.
- **Proposed remediation:** Isolate fixture troupes/seasons and database state, update setup to explicitly create the intended membership/roster scope, provide required-slot needs in the statistics fixtures, and generate a date-independent future-event set for the performance test. Preserve the business rules and assertions; do not waive or disable tests. No test or production implementation changed during this investigation.
- **Notes/context:** The CI result arrived after `v2.6.3-rc.1` was pushed (`c2a6a4c2`) and its artifacts synchronized to `v2` (`fa1a27b2`). No production promotion was performed. Do not infer runtime regression or waive the failures from green E2E alone.
- **RC operational evidence:** [Run 39100935125](https://github.com/plamarque/hatcast/actions/runs/39100935125) completed successfully: staging E2E 93 passed / 4 skipped, Cloud Run revision `hatcast-v2-staging-00123-nz4` serving 100% traffic, E1 preprod 33 passed / 2 skipped. The staging `version.txt` reports `2.6.3`. Automated gates do not replace human staging smoke or disposition of the API failures.

```

### `c70139a9:ISSUES.md`

```text
### BUG-018 — Staging Cloud Run traffic stuck on a named revision
- **ID**: BUG-018
- **Status**: Open (workaround 2026-09-16 — traffic moved to `hatcast-v2-staging-00107-brq`)
- **Severity**: High (staging served stale 2.4.4 while CI deploys succeeded)
- **Affected area**: Cloud Run `hatcast-v2-staging` (`europe-west9`)
- **Observed behavior**: After `gcloud run deploy` from GitHub Actions, new revisions (`00104`–`00107`) were created then Retired. 100% of traffic stayed on `hatcast-v2-staging-00103-mr9` (2.4.4, 2026-07-12). `/version.txt` and the Formules UI stayed on that build. 2.4.5 never received live traffic.
- **Expected behavior**: A successful staging deploy serves the new revision at `https://hatcast-v2-staging-730278491306.europe-west9.run.app`.
- **Cause**: Traffic allocated to a **named** revision, not `LATEST`. Cloud Run then leaves existing split unchanged on deploy.
- **Fix / workaround**: `gcloud run services update-traffic hatcast-v2-staging --region=europe-west9 --project=impro-selector --to-revisions=hatcast-v2-staging-00107-brq=100` (or `--to-latest` after the new revision is Ready). Durable fix: stop pinning named revisions, or add `--to-latest` in CI after deploy.
- **Evidence**: Recette 2.4.6-rc.1 ; CI deploy jobs green while live `version.txt` still showed `2.4.4` / `010452ce`.

### BUG-031 — « Annuler » dans Format et besoins vide les besoins

- **ID**: BUG-031
- **Status**: Open — cause confirmée le 2026-10-13 ; correctif à cadrer
- **Severity**: High (une action ponctuelle peut masquer toute une équipe déjà composée)
- **Affected area**: V2 « Format et besoins » (`EventTypeRolesDialog` / `PATCH events.roleSlots`) et projection Équipe.
- **Expected behavior**: `Annuler` doit fermer sans émettre aucun PATCH. Réduire ou retirer un rôle ne doit pas effacer silencieusement les besoins restants ni rendre invisible une équipe constituée.
- **Cause confirmée**: L'attribut nu `mat-dialog-close` transmet la chaîne vide (`""`) au vrai clic Angular Material, et non `undefined`. `EventInfosTab.openTypeRolesDialog` ignore uniquement `undefined` : il appelle donc `persistTypeRoles("")`. À l'exécution, `result.templateType` et `result.roleSlots` sont alors `undefined`; `normalizeRoleSlots(undefined)` produit une map complète de zéros. `JSON.stringify` omet `templateType` mais envoie `roleSlots` à zéro. Le serveur accepte ce remplacement complet et persiste ces zéros. La re-sélection du format n'est pas nécessaire à l'incident, même si elle fait partie du parcours observé.
- **Reproduction vérifiée**: Le test temporaire a cliqué le vrai bouton `button[mat-dialog-close]` dans le dialogue Angular : `MatDialogRef.close` a reçu `""` (et non `undefined`). La chaîne client puis serveur ci-dessus a été vérifiée dans le code. Le test était volontairement rouge contre l'attendu fonctionnel et a été retiré après diagnostic pour ne pas laisser la branche en échec.
- **Notes/context**: Les événements de type sondage / personnalisé peuvent légitimement ne pas nécessiter de rôle : le correctif ne doit donc pas interdire globalement la valeur vide. Il doit distinguer explicitement une fermeture sans résultat d'une sauvegarde. CN-1 conserve désormais les créneaux affectés hors besoins pour les organisateurs, mais ne prévient pas l'écriture vide et ne les réaffiche pas encore dans l'UI. Voir aussi le chat Codex `01a130ec-46cd-7c60-b532-7634e1c5cfd4`.

### BUG-037 — API regression fixtures assume unsynchronized shared memberships
- **ID**: BUG-037
- **Status**: Fixed locally — complete regression and independent review verified; integration pending
- **Severity**: Medium (API regression suite fails; no production behavior change)
- **Affected area**: Agenda, inbox, member glance/profile, audit, availability, lifecycle integration tests and member statistics unit fixtures.
- **Observed behavior**: The v2.6.3 lineage full API run reports 1189 tests, 37 failures and five environment-specific skips (GitHub runs 39100395161 and 38815714661; reproduced locally). Nine affected classes report 102 tests and 32 failures when run together; lifecycle passes 7/7 in isolation.
- **Cause**: Shared seed memberships now synchronize participants after BUG-033, adding projection scopes and duplicate participant setup. Lifecycle conversion payloads omit active seasons created by other classes sharing H2. Three statistics fixtures omit required role counts, so CN-1 correctly excludes their assignments. The remaining performance failure is tracked as BUG-029.
- **Expected behavior**: Explicit isolated troupe/season fixtures preserve automatic synchronization, exact business assertions, and valid required-slot indices; all enabled tests pass in both targeted and complete runs.
- **Fix**: Test-owned troupe/season scopes, reuse of synchronized audit participants, explicit legacy unsynchronized summary precondition, and required role-slot needs. Production code, seeds, migrations and CI gates are unchanged; business expectations are preserved and selected response assertions strengthened.
- **Verification (2026-10-18)**: JDK 21, nine affected classes: 102 tests, zero failures/errors/skips. Each of the nine classes also passed in its own Gradle invocation after review patches. Final complete `./gradlew test --no-daemon`: 1189 tests across 170 classes, zero failures/errors, five unchanged environment-specific skips (two Neon agenda and three Neon composition performance tests), BUILD SUCCESSFUL in 5m 27s. `git diff --check` passes. Three independent review lenses completed; all retained findings resolved, nothing deferred. Integration remains pending.

#### Initial release investigation (before the fixture correction)

- **Status:** Open — qualified during the v2.6.3 staging release on 2026-10-18; release validation blocked pending test remediation or explicit disposition.
- **Severity:** High for release validation; production impact not established.
- **Affected area:** `services/api` full Gradle test suite on GitHub Actions.
- **Observed behavior:** [Run 39100395161](https://github.com/plamarque/hatcast/actions/runs/39100395161), commit `d7dc3c15`, reports 1189 tests completed, 37 failed, 5 skipped. Failures span agenda (including performance), audit, availability summary, inbox, member profile/season glance, composition statistics and membership lifecycle tests. Local Playwright T1 passed separately (94 passed, 4 skipped), as did the staging workflow's E2E step.
- **Expected behavior:** The API regression suite passes or each failing case has an explicitly qualified disposition before production promotion.
- **Investigation (2026-10-18):** The same 37 named failures already occur in [run 38815714661](https://github.com/plamarque/hatcast/actions/runs/38815714661), commit `b39ccfc5`, which is an ancestor of `v2.6.2-rc.1`. [Run 38422699386](https://github.com/plamarque/hatcast/actions/runs/38422699386) on 2026-10-13 already reports the three statistics failures plus the agenda performance fixture failure. These are not newly introduced by the v2.6.3 delta.
- **Reproduction:** Current `v2` full `./gradlew test --no-daemon`: 1189 tests, 37 failures, 5 skipped (5m02s). Running only the nine affected classes: 102 tests, 32 failures; all seven membership lifecycle tests pass in that targeted run. Full-run report: `services/api/build/reports/tests/test/index.html`.
- **Qualified causes:**
  - **28 failures — membership fixture assumptions:** `0eaa9238` (BUG-033) synchronizes self-joined/added members across the troupe's seasons. Helpers join the shared seed troupe but expect an empty or narrowly scoped agenda/inbox/profile. The actual responses contain seed and other test seasons. Audit setup attempts to add an already-synchronized participant (409, "Un participant avec ce nom existe déjà dans la saison."). Availability's read-only test fails its setup precondition before the GET because joining has already created the participant. Breakdown: agenda 15, inbox 9, audit 1, availability 1, season glance 1, member profile 1.
  - **3 failures — statistics fixtures omit required slots:** `b9b0b17c` filters slots with `isRequiredBy(event.roleSlots)` as required by CN-1. The failing unit fixtures construct events with default empty `roleSlots`, then assign slots (index 1) and expect them to count. The resulting null/neutral output follows the required-position rule; the fixtures need explicit matching needs and valid indices.
  - **1 failure — date-dependent performance fixture:** BUG-029 reproduced: the seed now contains 18 upcoming events while the test requires at least 20. It fails before the latency assertion; no performance regression is established.
  - **5 failures — shared database / execution-order dependency:** Membership lifecycle tests pass in the targeted run but fail in the full suite with HTTP 400, "Choisissez pour chaque saison active : externe saison ou retrait du roster." Their conversion payload accounts only for the locally created seasons, while synchronized memberships include additional active seasons in the shared `jdbc:h2:mem:hatcast_test` database. This is related to the isolation concern in LIMIT-002, with a distinct observed symptom.
- **Proposed remediation:** Isolate fixture troupes/seasons and database state, update setup to explicitly create the intended membership/roster scope, provide required-slot needs in the statistics fixtures, and generate a date-independent future-event set for the performance test. Preserve the business rules and assertions; do not waive or disable tests. No test or production implementation changed during this investigation.
- **Notes/context:** The CI result arrived after `v2.6.3-rc.1` was pushed (`c2a6a4c2`) and its artifacts synchronized to `v2` (`fa1a27b2`). No production promotion was performed. Do not infer runtime regression or waive the failures from green E2E alone.
- **RC operational evidence:** [Run 39100935125](https://github.com/plamarque/hatcast/actions/runs/39100935125) completed successfully: staging E2E 93 passed / 4 skipped, Cloud Run revision `hatcast-v2-staging-00123-nz4` serving 100% traffic, E1 preprod 33 passed / 2 skipped. The staging `version.txt` reports `2.6.3`. Automated gates do not replace human staging smoke or disposition of the API failures.

### BUG-038 — Composition smoke tests intermittently require retry
- **ID**: BUG-038
- **Status**: Open — observed during v2.6.3-rc.2 validation; cause not established
- **Severity**: Medium (smoke reliability; no confirmed production defect)
- **Affected area**: `apps/web/e2e/e1/orga-composition.desktop.spec.ts` and `apps/web/e2e/draw-formula-choice.spec.ts`.
- **Observed behavior (2026-10-18)**: [RC2 workflow 39105565455](https://github.com/plamarque/hatcast/actions/runs/39105565455), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: E1-ORG-001–002 first failed waiting for the dialog after publication (15 s); E2E-WD-05 first failed pool preview with HTTP 400 `Rôle inconnu pour cet événement`. Both passed on automatic retry. Final local-profile CI smoke: 92 passed, 2 flaky, 4 skipped; job succeeded. This is not evidence of a clean first-attempt run.
- **Expected behavior**: Composition smoke journeys pass without retry, with deterministic fixture state and assertions aligned to supported behavior.
- **Notes/context**: Local preflight passed 94 tests with four skips. The separate deployed-staging E1 gate passed 34 tests with two skips, without reported retries. No tests were disabled or changed for these observations. Investigation and any fix remain separate from the API fixture correction; the production promotion and human staging smoke are not authorized by these green automated jobs.

```

### `c27f369e:ISSUES.md`

```text
### BUG-018 — Staging Cloud Run traffic stuck on a named revision
- **ID**: BUG-018
- **Status**: Open (workaround 2026-09-16 — traffic moved to `hatcast-v2-staging-00107-brq`)
- **Severity**: High (staging served stale 2.4.4 while CI deploys succeeded)
- **Affected area**: Cloud Run `hatcast-v2-staging` (`europe-west9`)
- **Observed behavior**: After `gcloud run deploy` from GitHub Actions, new revisions (`00104`–`00107`) were created then Retired. 100% of traffic stayed on `hatcast-v2-staging-00103-mr9` (2.4.4, 2026-07-12). `/version.txt` and the Formules UI stayed on that build. 2.4.5 never received live traffic.
- **Expected behavior**: A successful staging deploy serves the new revision at `https://hatcast-v2-staging-730278491306.europe-west9.run.app`.
- **Cause**: Traffic allocated to a **named** revision, not `LATEST`. Cloud Run then leaves existing split unchanged on deploy.
- **Fix / workaround**: `gcloud run services update-traffic hatcast-v2-staging --region=europe-west9 --project=impro-selector --to-revisions=hatcast-v2-staging-00107-brq=100` (or `--to-latest` after the new revision is Ready). Durable fix: stop pinning named revisions, or add `--to-latest` in CI after deploy.
- **Evidence**: Recette 2.4.6-rc.1 ; CI deploy jobs green while live `version.txt` still showed `2.4.4` / `010452ce`.

### BUG-031 — « Annuler » dans Format et besoins vide les besoins

- **ID**: BUG-031
- **Status**: Open — cause confirmée le 2026-10-13 ; correctif à cadrer
- **Severity**: High (une action ponctuelle peut masquer toute une équipe déjà composée)
- **Affected area**: V2 « Format et besoins » (`EventTypeRolesDialog` / `PATCH events.roleSlots`) et projection Équipe.
- **Expected behavior**: `Annuler` doit fermer sans émettre aucun PATCH. Réduire ou retirer un rôle ne doit pas effacer silencieusement les besoins restants ni rendre invisible une équipe constituée.
- **Cause confirmée**: L'attribut nu `mat-dialog-close` transmet la chaîne vide (`""`) au vrai clic Angular Material, et non `undefined`. `EventInfosTab.openTypeRolesDialog` ignore uniquement `undefined` : il appelle donc `persistTypeRoles("")`. À l'exécution, `result.templateType` et `result.roleSlots` sont alors `undefined`; `normalizeRoleSlots(undefined)` produit une map complète de zéros. `JSON.stringify` omet `templateType` mais envoie `roleSlots` à zéro. Le serveur accepte ce remplacement complet et persiste ces zéros. La re-sélection du format n'est pas nécessaire à l'incident, même si elle fait partie du parcours observé.
- **Reproduction vérifiée**: Le test temporaire a cliqué le vrai bouton `button[mat-dialog-close]` dans le dialogue Angular : `MatDialogRef.close` a reçu `""` (et non `undefined`). La chaîne client puis serveur ci-dessus a été vérifiée dans le code. Le test était volontairement rouge contre l'attendu fonctionnel et a été retiré après diagnostic pour ne pas laisser la branche en échec.
- **Notes/context**: Les événements de type sondage / personnalisé peuvent légitimement ne pas nécessiter de rôle : le correctif ne doit donc pas interdire globalement la valeur vide. Il doit distinguer explicitement une fermeture sans résultat d'une sauvegarde. CN-1 conserve désormais les créneaux affectés hors besoins pour les organisateurs, mais ne prévient pas l'écriture vide et ne les réaffiche pas encore dans l'UI. Voir aussi le chat Codex `01a130ec-46cd-7c60-b532-7634e1c5cfd4`.

### BUG-037 — API regression fixtures assume unsynchronized shared memberships
- **ID**: BUG-037
- **Status**: Fixed locally — complete regression and independent review verified; integration pending
- **Severity**: Medium (API regression suite fails; no production behavior change)
- **Affected area**: Agenda, inbox, member glance/profile, audit, availability, lifecycle integration tests and member statistics unit fixtures.
- **Observed behavior**: The v2.6.3 lineage full API run reports 1189 tests, 37 failures and five environment-specific skips (GitHub runs 39100395161 and 38815714661; reproduced locally). Nine affected classes report 102 tests and 32 failures when run together; lifecycle passes 7/7 in isolation.
- **Cause**: Shared seed memberships now synchronize participants after BUG-033, adding projection scopes and duplicate participant setup. Lifecycle conversion payloads omit active seasons created by other classes sharing H2. Three statistics fixtures omit required role counts, so CN-1 correctly excludes their assignments. The remaining performance failure is tracked as BUG-029.
- **Expected behavior**: Explicit isolated troupe/season fixtures preserve automatic synchronization, exact business assertions, and valid required-slot indices; all enabled tests pass in both targeted and complete runs.
- **Fix**: Test-owned troupe/season scopes, reuse of synchronized audit participants, explicit legacy unsynchronized summary precondition, and required role-slot needs. Production code, seeds, migrations and CI gates are unchanged; business expectations are preserved and selected response assertions strengthened.
- **Verification (2026-10-18)**: JDK 21, nine affected classes: 102 tests, zero failures/errors/skips. Each of the nine classes also passed in its own Gradle invocation after review patches. Final complete `./gradlew test --no-daemon`: 1189 tests across 170 classes, zero failures/errors, five unchanged environment-specific skips (two Neon agenda and three Neon composition performance tests), BUILD SUCCESSFUL in 5m 27s. `git diff --check` passes. Three independent review lenses completed; all retained findings resolved, nothing deferred. Integration remains pending.

#### Initial release investigation (before the fixture correction)

- **Status:** Open — qualified during the v2.6.3 staging release on 2026-10-18; release validation blocked pending test remediation or explicit disposition.
- **Severity:** High for release validation; production impact not established.
- **Affected area:** `services/api` full Gradle test suite on GitHub Actions.
- **Observed behavior:** [Run 39100395161](https://github.com/plamarque/hatcast/actions/runs/39100395161), commit `d7dc3c15`, reports 1189 tests completed, 37 failed, 5 skipped. Failures span agenda (including performance), audit, availability summary, inbox, member profile/season glance, composition statistics and membership lifecycle tests. Local Playwright T1 passed separately (94 passed, 4 skipped), as did the staging workflow's E2E step.
- **Expected behavior:** The API regression suite passes or each failing case has an explicitly qualified disposition before production promotion.
- **Investigation (2026-10-18):** The same 37 named failures already occur in [run 38815714661](https://github.com/plamarque/hatcast/actions/runs/38815714661), commit `b39ccfc5`, which is an ancestor of `v2.6.2-rc.1`. [Run 38422699386](https://github.com/plamarque/hatcast/actions/runs/38422699386) on 2026-10-13 already reports the three statistics failures plus the agenda performance fixture failure. These are not newly introduced by the v2.6.3 delta.
- **Reproduction:** Current `v2` full `./gradlew test --no-daemon`: 1189 tests, 37 failures, 5 skipped (5m02s). Running only the nine affected classes: 102 tests, 32 failures; all seven membership lifecycle tests pass in that targeted run. Full-run report: `services/api/build/reports/tests/test/index.html`.
- **Qualified causes:**
  - **28 failures — membership fixture assumptions:** `0eaa9238` (BUG-033) synchronizes self-joined/added members across the troupe's seasons. Helpers join the shared seed troupe but expect an empty or narrowly scoped agenda/inbox/profile. The actual responses contain seed and other test seasons. Audit setup attempts to add an already-synchronized participant (409, "Un participant avec ce nom existe déjà dans la saison."). Availability's read-only test fails its setup precondition before the GET because joining has already created the participant. Breakdown: agenda 15, inbox 9, audit 1, availability 1, season glance 1, member profile 1.
  - **3 failures — statistics fixtures omit required slots:** `b9b0b17c` filters slots with `isRequiredBy(event.roleSlots)` as required by CN-1. The failing unit fixtures construct events with default empty `roleSlots`, then assign slots (index 1) and expect them to count. The resulting null/neutral output follows the required-position rule; the fixtures need explicit matching needs and valid indices.
  - **1 failure — date-dependent performance fixture:** BUG-029 reproduced: the seed now contains 18 upcoming events while the test requires at least 20. It fails before the latency assertion; no performance regression is established.
  - **5 failures — shared database / execution-order dependency:** Membership lifecycle tests pass in the targeted run but fail in the full suite with HTTP 400, "Choisissez pour chaque saison active : externe saison ou retrait du roster." Their conversion payload accounts only for the locally created seasons, while synchronized memberships include additional active seasons in the shared `jdbc:h2:mem:hatcast_test` database. This is related to the isolation concern in LIMIT-002, with a distinct observed symptom.
- **Proposed remediation:** Isolate fixture troupes/seasons and database state, update setup to explicitly create the intended membership/roster scope, provide required-slot needs in the statistics fixtures, and generate a date-independent future-event set for the performance test. Preserve the business rules and assertions; do not waive or disable tests. No test or production implementation changed during this investigation.
- **Notes/context:** The CI result arrived after `v2.6.3-rc.1` was pushed (`c2a6a4c2`) and its artifacts synchronized to `v2` (`fa1a27b2`). No production promotion was performed. Do not infer runtime regression or waive the failures from green E2E alone.
- **RC operational evidence:** [Run 39100935125](https://github.com/plamarque/hatcast/actions/runs/39100935125) completed successfully: staging E2E 93 passed / 4 skipped, Cloud Run revision `hatcast-v2-staging-00123-nz4` serving 100% traffic, E1 preprod 33 passed / 2 skipped. The staging `version.txt` reports `2.6.3`. Automated gates do not replace human staging smoke or disposition of the API failures.

### BUG-038 — Composition smoke tests intermittently require retry
- **ID**: BUG-038
- **Status**: Open — observed during v2.6.3-rc.2 validation; cause not established
- **Severity**: Medium (smoke reliability; no confirmed production defect)
- **Affected area**: `apps/web/e2e/e1/orga-composition.desktop.spec.ts` and `apps/web/e2e/draw-formula-choice.spec.ts`.
- **Observed behavior (2026-10-18)**: [RC2 workflow 39105565455](https://github.com/plamarque/hatcast/actions/runs/39105565455), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: E1-ORG-001–002 first failed waiting for the dialog after publication (15 s); E2E-WD-05 first failed pool preview with HTTP 400 `Rôle inconnu pour cet événement`. Both passed on automatic retry. Final local-profile CI smoke: 92 passed, 2 flaky, 4 skipped; job succeeded. This is not evidence of a clean first-attempt run.
- **Expected behavior**: Composition smoke journeys pass without retry, with deterministic fixture state and assertions aligned to supported behavior.
- **Notes/context**: Local preflight passed 94 tests with four skips. The separate deployed-staging E1 gate passed 34 tests with two skips, without reported retries. No tests were disabled or changed for these observations. Investigation and any fix remain separate from the API fixture correction; the production promotion and human staging smoke are not authorized by these green automated jobs.

### BUG-POSTHOG-002 — Production promotion capture fails its acceptance guard
- **ID**: BUG-POSTHOG-002
- **Status**: Open — observed after successful v2.6.3 production deployment on 2026-10-18
- **Severity**: Medium (release observability incomplete; deployment remains successful)
- **Affected area**: `scripts/v2/posthog-lifecycle-dashboard.mjs`, production workflow `posthog-lifecycle` job.
- **Observed behavior**: [Workflow 39130429450](https://github.com/plamarque/hatcast/actions/runs/39130429450), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: deployment succeeded, revision `hatcast-v2-00024-5n9` serves 100% of traffic, but lifecycle synchronization failed with `PostHog promotion capture was not accepted without quota limits`. Overall workflow is red despite its successful deployment job. Read-only checks returned version 2.6.3, production channel, and health UP.
- **Expected behavior**: Promotion capture is accepted without quota limitation and lifecycle dashboard synchronization completes.
- **Notes/context**: The guard raises for either `status !== 1` or a nonempty `quota_limited` list; the redacted log does not distinguish those cases, so a quota exhaustion diagnosis is not established. Dashboard provisioning is not reached after this error. No retry, quota/billing change, credential change, or production rollback was performed. The prior staging E1 gate was green; user approved production using the existing human recipe and requested no repeat tests.

```

### `d15773ca:ISSUES.md`

```text
### BUG-018 — Staging Cloud Run traffic stuck on a named revision
- **ID**: BUG-018
- **Status**: Open (workaround 2026-09-16 — traffic moved to `hatcast-v2-staging-00107-brq`)
- **Severity**: High (staging served stale 2.4.4 while CI deploys succeeded)
- **Affected area**: Cloud Run `hatcast-v2-staging` (`europe-west9`)
- **Observed behavior**: After `gcloud run deploy` from GitHub Actions, new revisions (`00104`–`00107`) were created then Retired. 100% of traffic stayed on `hatcast-v2-staging-00103-mr9` (2.4.4, 2026-07-12). `/version.txt` and the Formules UI stayed on that build. 2.4.5 never received live traffic.
- **Expected behavior**: A successful staging deploy serves the new revision at `https://hatcast-v2-staging-730278491306.europe-west9.run.app`.
- **Cause**: Traffic allocated to a **named** revision, not `LATEST`. Cloud Run then leaves existing split unchanged on deploy.
- **Fix / workaround**: `gcloud run services update-traffic hatcast-v2-staging --region=europe-west9 --project=impro-selector --to-revisions=hatcast-v2-staging-00107-brq=100` (or `--to-latest` after the new revision is Ready). Durable fix: stop pinning named revisions, or add `--to-latest` in CI after deploy.
- **Evidence**: Recette 2.4.6-rc.1 ; CI deploy jobs green while live `version.txt` still showed `2.4.4` / `010452ce`.

### BUG-031 — « Annuler » dans Format et besoins vide les besoins

- **ID**: BUG-031
- **Status**: Open — cause confirmée le 2026-10-13 ; correctif à cadrer
- **Severity**: High (une action ponctuelle peut masquer toute une équipe déjà composée)
- **Affected area**: V2 « Format et besoins » (`EventTypeRolesDialog` / `PATCH events.roleSlots`) et projection Équipe.
- **Expected behavior**: `Annuler` doit fermer sans émettre aucun PATCH. Réduire ou retirer un rôle ne doit pas effacer silencieusement les besoins restants ni rendre invisible une équipe constituée.
- **Cause confirmée**: L'attribut nu `mat-dialog-close` transmet la chaîne vide (`""`) au vrai clic Angular Material, et non `undefined`. `EventInfosTab.openTypeRolesDialog` ignore uniquement `undefined` : il appelle donc `persistTypeRoles("")`. À l'exécution, `result.templateType` et `result.roleSlots` sont alors `undefined`; `normalizeRoleSlots(undefined)` produit une map complète de zéros. `JSON.stringify` omet `templateType` mais envoie `roleSlots` à zéro. Le serveur accepte ce remplacement complet et persiste ces zéros. La re-sélection du format n'est pas nécessaire à l'incident, même si elle fait partie du parcours observé.
- **Reproduction vérifiée**: Le test temporaire a cliqué le vrai bouton `button[mat-dialog-close]` dans le dialogue Angular : `MatDialogRef.close` a reçu `""` (et non `undefined`). La chaîne client puis serveur ci-dessus a été vérifiée dans le code. Le test était volontairement rouge contre l'attendu fonctionnel et a été retiré après diagnostic pour ne pas laisser la branche en échec.
- **Notes/context**: Les événements de type sondage / personnalisé peuvent légitimement ne pas nécessiter de rôle : le correctif ne doit donc pas interdire globalement la valeur vide. Il doit distinguer explicitement une fermeture sans résultat d'une sauvegarde. CN-1 conserve désormais les créneaux affectés hors besoins pour les organisateurs, mais ne prévient pas l'écriture vide et ne les réaffiche pas encore dans l'UI. Voir aussi le chat Codex `01a130ec-46cd-7c60-b532-7634e1c5cfd4`.

### BUG-037 — API regression fixtures assume unsynchronized shared memberships
- **ID**: BUG-037
- **Status**: Fixed locally — complete regression and independent review verified; integration pending
- **Severity**: Medium (API regression suite fails; no production behavior change)
- **Affected area**: Agenda, inbox, member glance/profile, audit, availability, lifecycle integration tests and member statistics unit fixtures.
- **Observed behavior**: The v2.6.3 lineage full API run reports 1189 tests, 37 failures and five environment-specific skips (GitHub runs 39100395161 and 38815714661; reproduced locally). Nine affected classes report 102 tests and 32 failures when run together; lifecycle passes 7/7 in isolation.
- **Cause**: Shared seed memberships now synchronize participants after BUG-033, adding projection scopes and duplicate participant setup. Lifecycle conversion payloads omit active seasons created by other classes sharing H2. Three statistics fixtures omit required role counts, so CN-1 correctly excludes their assignments. The remaining performance failure is tracked as BUG-029.
- **Expected behavior**: Explicit isolated troupe/season fixtures preserve automatic synchronization, exact business assertions, and valid required-slot indices; all enabled tests pass in both targeted and complete runs.
- **Fix**: Test-owned troupe/season scopes, reuse of synchronized audit participants, explicit legacy unsynchronized summary precondition, and required role-slot needs. Production code, seeds, migrations and CI gates are unchanged; business expectations are preserved and selected response assertions strengthened.
- **Verification (2026-10-18)**: JDK 21, nine affected classes: 102 tests, zero failures/errors/skips. Each of the nine classes also passed in its own Gradle invocation after review patches. Final complete `./gradlew test --no-daemon`: 1189 tests across 170 classes, zero failures/errors, five unchanged environment-specific skips (two Neon agenda and three Neon composition performance tests), BUILD SUCCESSFUL in 5m 27s. `git diff --check` passes. Three independent review lenses completed; all retained findings resolved, nothing deferred. Integration remains pending.

#### Initial release investigation (before the fixture correction)

- **Status:** Open — qualified during the v2.6.3 staging release on 2026-10-18; release validation blocked pending test remediation or explicit disposition.
- **Severity:** High for release validation; production impact not established.
- **Affected area:** `services/api` full Gradle test suite on GitHub Actions.
- **Observed behavior:** [Run 39100395161](https://github.com/plamarque/hatcast/actions/runs/39100395161), commit `d7dc3c15`, reports 1189 tests completed, 37 failed, 5 skipped. Failures span agenda (including performance), audit, availability summary, inbox, member profile/season glance, composition statistics and membership lifecycle tests. Local Playwright T1 passed separately (94 passed, 4 skipped), as did the staging workflow's E2E step.
- **Expected behavior:** The API regression suite passes or each failing case has an explicitly qualified disposition before production promotion.
- **Investigation (2026-10-18):** The same 37 named failures already occur in [run 38815714661](https://github.com/plamarque/hatcast/actions/runs/38815714661), commit `b39ccfc5`, which is an ancestor of `v2.6.2-rc.1`. [Run 38422699386](https://github.com/plamarque/hatcast/actions/runs/38422699386) on 2026-10-13 already reports the three statistics failures plus the agenda performance fixture failure. These are not newly introduced by the v2.6.3 delta.
- **Reproduction:** Current `v2` full `./gradlew test --no-daemon`: 1189 tests, 37 failures, 5 skipped (5m02s). Running only the nine affected classes: 102 tests, 32 failures; all seven membership lifecycle tests pass in that targeted run. Full-run report: `services/api/build/reports/tests/test/index.html`.
- **Qualified causes:**
  - **28 failures — membership fixture assumptions:** `0eaa9238` (BUG-033) synchronizes self-joined/added members across the troupe's seasons. Helpers join the shared seed troupe but expect an empty or narrowly scoped agenda/inbox/profile. The actual responses contain seed and other test seasons. Audit setup attempts to add an already-synchronized participant (409, "Un participant avec ce nom existe déjà dans la saison."). Availability's read-only test fails its setup precondition before the GET because joining has already created the participant. Breakdown: agenda 15, inbox 9, audit 1, availability 1, season glance 1, member profile 1.
  - **3 failures — statistics fixtures omit required slots:** `b9b0b17c` filters slots with `isRequiredBy(event.roleSlots)` as required by CN-1. The failing unit fixtures construct events with default empty `roleSlots`, then assign slots (index 1) and expect them to count. The resulting null/neutral output follows the required-position rule; the fixtures need explicit matching needs and valid indices.
  - **1 failure — date-dependent performance fixture:** BUG-029 reproduced: the seed now contains 18 upcoming events while the test requires at least 20. It fails before the latency assertion; no performance regression is established.
  - **5 failures — shared database / execution-order dependency:** Membership lifecycle tests pass in the targeted run but fail in the full suite with HTTP 400, "Choisissez pour chaque saison active : externe saison ou retrait du roster." Their conversion payload accounts only for the locally created seasons, while synchronized memberships include additional active seasons in the shared `jdbc:h2:mem:hatcast_test` database. This is related to the isolation concern in LIMIT-002, with a distinct observed symptom.
- **Proposed remediation:** Isolate fixture troupes/seasons and database state, update setup to explicitly create the intended membership/roster scope, provide required-slot needs in the statistics fixtures, and generate a date-independent future-event set for the performance test. Preserve the business rules and assertions; do not waive or disable tests. No test or production implementation changed during this investigation.
- **Notes/context:** The CI result arrived after `v2.6.3-rc.1` was pushed (`c2a6a4c2`) and its artifacts synchronized to `v2` (`fa1a27b2`). No production promotion was performed. Do not infer runtime regression or waive the failures from green E2E alone.
- **RC operational evidence:** [Run 39100935125](https://github.com/plamarque/hatcast/actions/runs/39100935125) completed successfully: staging E2E 93 passed / 4 skipped, Cloud Run revision `hatcast-v2-staging-00123-nz4` serving 100% traffic, E1 preprod 33 passed / 2 skipped. The staging `version.txt` reports `2.6.3`. Automated gates do not replace human staging smoke or disposition of the API failures.

### BUG-038 — Composition smoke tests intermittently require retry
- **ID**: BUG-038
- **Status**: Open — observed during v2.6.3-rc.2 validation; cause not established
- **Severity**: Medium (smoke reliability; no confirmed production defect)
- **Affected area**: `apps/web/e2e/e1/orga-composition.desktop.spec.ts` and `apps/web/e2e/draw-formula-choice.spec.ts`.
- **Observed behavior (2026-10-18)**: [RC2 workflow 39105565455](https://github.com/plamarque/hatcast/actions/runs/39105565455), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: E1-ORG-001–002 first failed waiting for the dialog after publication (15 s); E2E-WD-05 first failed pool preview with HTTP 400 `Rôle inconnu pour cet événement`. Both passed on automatic retry. Final local-profile CI smoke: 92 passed, 2 flaky, 4 skipped; job succeeded. This is not evidence of a clean first-attempt run.
- **Expected behavior**: Composition smoke journeys pass without retry, with deterministic fixture state and assertions aligned to supported behavior.
- **Notes/context**: Local preflight passed 94 tests with four skips. The separate deployed-staging E1 gate passed 34 tests with two skips, without reported retries. No tests were disabled or changed for these observations. Investigation and any fix remain separate from the API fixture correction; the production promotion and human staging smoke are not authorized by these green automated jobs.

### BUG-POSTHOG-002 — Production promotion capture fails its acceptance guard
- **ID**: BUG-POSTHOG-002
- **Status**: Open — observed after successful v2.6.3 production deployment on 2026-10-18
- **Severity**: Medium (release observability incomplete; deployment remains successful)
- **Affected area**: `scripts/v2/posthog-lifecycle-dashboard.mjs`, production workflow `posthog-lifecycle` job.
- **Observed behavior**: [Workflow 39130429450](https://github.com/plamarque/hatcast/actions/runs/39130429450), commit `a5fb7f487d73672a3388e4b32ef200c4f314d1aa`: deployment succeeded, revision `hatcast-v2-00024-5n9` serves 100% of traffic, but lifecycle synchronization failed with `PostHog promotion capture was not accepted without quota limits`. Overall workflow is red despite its successful deployment job. Read-only checks returned version 2.6.3, production channel, and health UP.
- **Expected behavior**: Promotion capture is accepted without quota limitation and lifecycle dashboard synchronization completes.
- **Notes/context**: The guard raises for either `status !== 1` or a nonempty `quota_limited` list; the redacted log does not distinguish those cases, so a quota exhaustion diagnosis is not established. Dashboard provisioning is not reached after this error. No retry, quota/billing change, credential change, or production rollback was performed. The prior staging E1 gate was green; user approved production using the existing human recipe and requested no repeat tests.

### BUG-046 — Guest navigation E2E expects an incomplete fixture title
- **Status**: Fixed locally — complete E2E suite passed (100 passed, 4 skipped); CI verification pending.
- **Severity**: Low (release verification blocked; no application defect established).
- **Affected area**: `apps/web/e2e/recette-3-25.spec.ts`, scenario 3.25-E2E-10.
- **Observed behavior**: CI run [39851377774](https://github.com/plamarque/hatcast/actions/runs/39851377774) fails because the season menu displays `Guest 325 Ruben EVENT` while the assertion expects `Guest 325 Ruben`.
- **Expected behavior**: Assert the complete season title created by `E2eStory325FixtureService`, preserving the destination URL and navigation checks.
- **Cause and correction**: The fixture explicitly creates `Guest 325 Ruben EVENT`; the menu correctly uses the season title. Correct only the exact text expectation; no production behavior or fixture changes.

```

## B09 — opening testimony and supplemental chronology

Owner statement relayed in the authorized research task, 2026-10-23: “most users arrived September, exact date unknown; first technical prod launch June must not proxy user opening.” This is testimony, not measured adoption.

```text
f14c041c 2026-10-23T07:34:33+02:00 chore(v2): sync release v2.7.0-rc.2 artifacts to v2
37e1bfd2 2026-10-23T07:34:28+02:00 chore(v2): release staging v2.7.0-rc.2
20d972b0 2026-10-23T07:19:01+02:00 chore(v2): promote v2 to staging-v2
75ad23d5 2026-10-23T07:15:45+02:00 chore(release): Add home preview to v2.7.0 notes
3b3b69af 2026-10-23T07:14:31+02:00 feat(home): Integrate five upcoming spectacles
fdef773d 2026-10-23T07:14:25+02:00 feat(home): Show five upcoming spectacles
8eac4663 2026-10-23T06:14:01+02:00 chore(v2): sync release v2.7.0-rc.1 artifacts to v2
2c4dbe85 2026-10-23T06:13:56+02:00 chore(v2): release staging v2.7.0-rc.1
```

## B10 — selectively redacted issue testimony

Personal/event names and person-level timestamps replaced or omitted; statements remain issue-registry testimony.

BUG-021: - **Observed behavior**: Retour transmis le 2026-09-17 : un membre souhaitait être comédien pour [name omitted] mais rapporte une affectation DJ. La capture montre la modale « Disponibilité de … » au-dessus de « Mon agenda », avec Comédien·ne rempli et DJ/MC en contour. Le code utilise `[highlighted]` sans coche visible ; les rôles restent un brouillon jusqu'au bouton « Enregistrer rôles et commentaire », placé après le commentaire dans le contenu défilant. « Fermer » ferme sans sauvegarder ce brouillon ni avertir. Le statut Dispo, lui, est enregistré immédiatement.

BUG-031: - **Status**: Open — cause confirmée le 2026-10-13 ; correctif à cadrer

BUG-031: - **Observed behavior**: Sur « [name omitted] », [name omitted] a indiqué avoir voulu retirer uniquement le rôle Bénévole. Après avoir ouvert « Format et besoins », le bouton de pied de modale `Annuler` a persisté tous les effectifs à zéro ; l'onglet Équipe ne projette alors plus aucun créneau requis, bien que les affectations stockées existent encore. Un incident analogue a été signalé le 2026-10-12 pour « [name omitted] ».

BUG-031: - **Cause confirmée**: L'attribut nu `mat-dialog-close` transmet la chaîne vide (`""`) au vrai clic Angular Material, et non `undefined`. `EventInfosTab.openTypeRolesDialog` ignore uniquement `undefined` : il appelle donc `persistTypeRoles("")`. À l'exécution, `result.templateType` et `result.roleSlots` sont alors `undefined`; `normalizeRoleSlots(undefined)` produit une map complète de zéros. `JSON.stringify` omet `templateType` mais envoie `roleSlots` à zéro. Le serveur accepte ce remplacement complet et persiste ces zéros. La re-sélection du format n'est pas nécessaire à l'incident, même si elle fait partie du parcours observé.

BUG-045: - **Observed behavior**: [name omitted]'s [name omitted] screen retained “Annoncer la compo” and “Déverrouiller” after the API returned “La composition n'est pas validée”. Repeated clicks could not recover.

BUG-046: - **Observed behavior**: CI run [39851377774](https://github.com/plamarque/hatcast/actions/runs/39851377774) fails because the season menu displays `Guest 325 [name omitted] EVENT` while the assertion expects `Guest 325 [name omitted]`.

