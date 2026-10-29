---
title: 'Open an Advent door in isolated development'
type: 'feature'
created: '2026-10-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: 'feat/25-1-open-an-advent-door-in-isolated-development'
baseline_commit: '84997064a04ea29b5cdb1fc4e0f8b802602be7e4'
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/specs/spec-hatcast-avent/SPEC.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Eligible members cannot safely explore the Advent discovery experience before its release.

**Approach:** Provide a visibly partial, isolated development-only door and fictional quiz, with server-enforced membership and content protection.

## Boundaries & Constraints

**Always:** Enforce active configured-troupe membership for every read, including platform administrators. Fail closed on missing configuration or non-isolated environments. Return sensitive content without caching. Use only fictional test content, no answer or correctness. Apply Material 3, keyboard and reduced-motion support. Verify data, notification and analytics isolation before any human demonstration.

**Never:** Enable test mode in production, package future real content or portraits as public assets, accept an answer, send Advent notifications or analytics, or expose unfinished functionality as complete. Do not add the general navigation entry reserved for story 25.6.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Eligible | Active configured troupe member in isolated test environment | Selected fictional quiz returned; door opens | No-store |
| Unauthorized | Nonmember, inactive, external or platform admin outside troupe | No content | Deny |
| Unsafe environment | Production, invalid/missing troupe or unavailable isolation | No test content | Fail closed |
| Motion preference | Reduced motion enabled | Immediate equivalent content and focus | No animation dependency |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt` — use `requireActiveMemberMembership`, not `TroupeAccessService` which bypasses platform admins.
- `services/api/src/main/resources/application-offline.yml` — local H2 isolation; dev profile alone may use Neon and is insufficient.
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeLogoIntegrationTest.kt` — integration-test conventions for protected reads.
- `apps/web/src/app/app.routes.ts` — authenticated member shell and lazy routes; no new navigation entry.
- `apps/web/src/app/core/agenda/user-agenda-api.service.ts` — credentialed API fetch pattern.
- `apps/web/ngsw-config.json` — API excluded from navigation cache; never place sensitive content in generic cached assets.
- `apps/web/src/app/core/analytics/` — global analytics may autocapture; prohibit human demo until actual isolation is verified.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/kotlin/com/hatcast/api/` — add isolated fictional-content read endpoint, configured troupe and strict environment gate.
- [x] `services/api/src/test/kotlin/com/hatcast/api/` — test authorization, direct access, profile restrictions, content and cache headers.
- [x] `apps/web/src/app/` — add direct authenticated test route, decorated door and accessible fictional quiz; identify test and unfinished answering.
- [x] `apps/web/src/app/` — test UI states, reduced motion and API failures.
- [x] `ARCH.md`, `SPEC.md` — document shipped partial capability and relevant configuration without representing later stories as shipped.

**Acceptance Criteria:**
- Given an eligible active member in isolated development, when opening a selected available test door, then only its fictional quiz is revealed and test mode and unavailable answering are explicit.
- Given an unauthorized user or unsafe environment, when requesting a quiz directly, then the API discloses no content, including to platform administrators outside the troupe.
- Given keyboard or reduced motion, when opening the door, then access, focus and state are equivalent; mobile layout and Material 3 controls meet the HatCast checklist.
- Given a potential human demonstration, when isolation of data, notifications and analytics has not been verified, then no demonstration is handed off.

## Décision utilisateur à intégrer — accès à la démonstration distante (2026-10-30)

L’accès au mode test en développement est réservé aux comptes de Patrice Lamarque et Antoine Brousseau par une liste d’adresses dédiée à l’Avent. Cette liste est distincte des rôles d’administration de troupe et de plateforme ; elle ne confère aucun autre privilège. Elle constitue une restriction supplémentaire aux contrôles d’adhésion active existants, sans en modifier les rôles. L’accès doit rester impossible en production. Après connexion, l’aperçu de test doit s’ouvrir automatiquement pour ces personnes dans l’environnement de développement isolé. Les conditions d’isolation des données, notifications et analytics restent à vérifier avant toute démonstration distante. Cette décision modifie le périmètre initial gelé ci-dessus et doit être intégrée aux contrats et vérifications avant clôture.

En production, Patrice et Toinou peuvent jouer et consulter leur score personnel, mais sont exclus du classement : ce comportement appartient à la story 25.4 et ne découle pas des droits d’administration du mode test.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- medium — Changing selection during a request could reveal a different door; selection is disabled while loading.
- low — Returning to the selection requires reload; the partial preview has no calendar navigation, which belongs to a later story.
- medium — Focus could be visually covered during opening; the focused title remains above the overlay and a Chromium check exercises it.
- high — Symbolic links could redirect the offline H2 file; local directories and the database file now reject symbolic links.
- medium — Offline configuration was undocumented; DEVELOPMENT.md now explains the configuration and fixture.
- medium — Refusal and absent-door no-store behavior lacked assertions; integration tests now exercise both.
- medium — The offline integration test mutates JVM `user.dir` and leaves a temporary directory; the test now uses an injected worktree root and cleans up H2 after closing the pool.
- medium — Mobile, zoom and contrast lacked visual evidence; local Chromium captures and contrast checks now cover light theme, with other themes and devices still unverified.
- medium — Opt-in and alternate H2 path lacked negative tests; both now fail closed in tests.
- medium — Reduced-motion unit testing did not verify CSS; a Chromium test now verifies the computed animation and display.
- medium — Mobile PWA banners hid the test label; the Advent preview now places them in flow and a Chromium test covers two banners and enlarged text.

## Verification

- Run targeted API integration and Angular component tests and relevant builds; record selected tests and results.
- Inspect actual isolation before any human demonstration; no production deploy.

### Résultats de vérification (2026-10-29)

- API : `AdventTestControllerTest` (3 tests), `AdventTestIntegrationTest` (2 tests) et `AdventOfflineIntegrationTest` (1 test) réussis ; ce dernier utilise une base H2 temporaire avec adhésions réelles.
- Angular : `advent-test.spec.ts` (3 tests) réussi, dont sélection de porte future, erreur et mouvement réduit ; build Angular réussi.
- Mouvement : animation d’ouverture décorative sans blocage du contenu ou du focus ; vérification Chromium à 375 px des styles avec et sans préférence de mouvement réduit.
- M3 : contrôles Material, tokens, cibles de 48 px, libellés FR et focus vérifiés dans le code et les tests ; dialogs, onglets et changements de navigation non applicables. Captures Chromium locales inspectées à 320 et 375 px et à 200 % (viewport 768 px) ; libellé test visible après correction de BUG-050, sans débordement horizontal. Contrastes calculés : texte du quiz 14,70:1, texte de page 16,33:1 et libellé de test 6,16:1, sur leurs fonds du thème clair. Autres thèmes et appareils réels non vérifiés.
- Isolation effective des notifications et de l’analytics non vérifiée ; aucune démonstration humaine proposée.

### User review correction (2026-10-29)

The original preview did not reflect the approved festive door and quiz. Reworked palette, full-page door interaction, floating decorations and opening light. Automatic entry remains story 25.6. Awaiting renewed visual review.

### Final review (2026-10-30)

- User approved the festive preview; 24 fictional days are available, answering remains story 25.2.
- Two independent reviewers examined the final changes. The test allowlist requires a verified email in the current session; unverified tester identities are refused before linking on the development service. Existing sessions must sign in again. The broader existing identity-linking concern is recorded as BUG-052.
- Cloud access requires the development Cloud Run service and actual Neon development endpoint, active La Malice membership, and the dedicated two-person allowlist. Private consented illustrations are read only after authorization from a private storage bucket; generic fallback is local to the API. Development builds omit PostHog.
- Targeted API tests (door, offline integration, authentication), 36 frontend tests, and frontend build passed. The remote deployment and Google sign-in remain to be verified after push.
