---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
status: final
inputDocuments:
  - _bmad-output/specs/spec-hatcast-avent/SPEC.md
  - _bmad-output/planning-artifacts/prds/prd-hatcast-2026-10-28/prd.md
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md
  - _bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md
  - docs/v2/technical/FRONTEND_UI.md
---

# HatCast Advent 2026 — Epic Breakdown

## Overview

Updated requirements inventory for the La Malice Advent calendar. The spec and companions are the source contract; the UX-linked mockup is illustrative. Revised stories were validated with Patrice on 2026-10-29.

## Requirements Inventory

### Functional Requirements

- **FR-1:** En production, l’animation est invisible avant le 1er décembre pour les membres ; aucun mode test n’y est disponible. Du 1er décembre au 15 janvier 2027 inclus, une icône Père Noël près de Mon compte permet d’accéder à l’animation. Sa micro-animation est discrète et festive ; ses détails sont à définir en UX. L’accès disparaît à partir du 16 janvier.

- **FR-2:** Du 1er au 24 décembre, lorsqu’un quiz du jour est disponible et que le membre n’y a pas répondu, il s’ouvre automatiquement lors de sa première ouverture pertinente de HatCast, après l’éventuelle révélation prioritaire prévue par FR-7. Le membre peut le fermer ; une fois fermé, il ne s’ouvre plus automatiquement ce jour-là sur aucun appareil du membre et reste accessible par l’icône. Une réponse enregistrée sur un autre appareil empêche aussi l’ouverture automatique. Une visite sans quiz disponible ne consomme pas cette ouverture : si le quiz paraît plus tard, il peut s’ouvrir lors d’une visite ultérieure, sauf si l’expérience a déjà été fermée ce jour-là.

- **FR-3:** Du 1er au 24 décembre, HatCast tente d’envoyer à 10 h, heure de Paris, une invitation habituelle aux membres qui n’ont pas répondu au quiz du jour. Le traitement vérifie la disponibilité du quiz lorsqu’il s’exécute et respecte les préférences habituelles. Si le quiz manque ou si le traitement ne se déclenche pas, aucune invitation n’est envoyée ; un envoi tardif ou manqué est acceptable, sans reprise particulière. L’invitation mène au parcours du jour en respectant la priorité de révélation de FR-7.

- **FR-4:** Le membre sélectionne l’anecdote qu’il estime fausse parmi trois, puis confirme ; en production, une réponse enregistrée est définitive et unique par quiz. Le rejeu personnel est limité au mode test isolé (FR-13). Chaque personne présentée peut jouer à son propre quiz. Le quiz est jouable uniquement pendant son jour de jeu ; aucun rattrapage n’est possible. À minuit, toute confirmation attendant encore le verrou est fermée, même si elle a été reçue avant minuit. La révélation attend la fin d’une transaction déjà en cours.

- **FR-5:** Une bonne réponse rapporte 10 points, une mauvaise 0. Chaque jour répondu rapporte en outre 1 point de participation, dès le premier jour et quelle que soit la justesse ; un jour manqué ne rapporte aucun point. Un bonus de 2 points est attribué pour chaque groupe de trois bonnes réponses consécutives : une mauvaise réponse remet la série à zéro, une journée manquée la laisse intacte. Après un bonus, le décompte repart pour le groupe de trois suivant : les groupes ne se chevauchent pas. Les bonus sont donc attribués aux 3ᵉ, 6ᵉ, 9ᵉ bonnes réponses consécutives, et ainsi de suite. Les points deviennent visibles et comptent dans le classement à la révélation, pas avant. Le maximum théorique est de 280 points : 240 de bonnes réponses, 24 de participation et 16 de bonus.

- **FR-6:** Après confirmation, afficher uniquement un accusé de réception, une invitation à revenir demain et une action pour voir le classement. Ne donner aucun indice sur la justesse ou les points du quiz en attente : notamment, le classement et les scores visibles ne doivent pas permettre de les déduire. À la révélation, afficher le choix du membre, la fausse anecdote, la justesse et les points gagnés, avec un complément d’anecdote facultatif s’il existe. Distinguer les points de réponse, de participation et le bonus lorsqu’il est acquis.

- **FR-7:** Si une réponse n’a pas été enregistrée, le membre peut réessayer tant que le quiz reste jouable. Au retour, si un résultat révélable n’a pas été vu, le plus récent de ces résultats est présenté avant le quiz du jour, même si une réponse plus récente attend sa révélation ; proposer ensuite ce quiz lorsqu’il est disponible. Aucun accès au calendrier n’est proposé sur cet écran de révélation prioritaire. L’état de consultation est partagé entre appareils ; une interruption après enregistrement ne fait pas perdre le résultat. Les résultats révélables plus anciens non vus restent consultables dans leurs cases du calendrier, sans repère particulier ni enchaînement automatique.

- **FR-8:** Le classement présente sous leur nom tous les membres classables dès le départ, y compris ceux qui n’ont pas encore joué, à 0 point. Il met en évidence la position du membre connecté. Les ex æquo reçoivent tous le rang le plus bas de leur groupe : par exemple 1, 3, 3, 4 ; si tous les N membres sont à égalité, ils sont tous Nᵉ. Patrice et Toinou ne figurent pas dans ce classement ; chacun voit son score personnel séparément, sans rang. Le départage éventuel pour les lots reste à discuter et n’est pas automatisé dans ce périmètre.

- **FR-9:** Après réponse au quiz du jour, l’accès à l’animation ouvre le classement, sous réserve de la priorité de FR-7. Le 25 décembre, après l’éventuelle révélation du 24, présenter un message de Noël et un bilan personnel ; son contenu spécial et une éventuelle animation restent à discuter. Le classement est final dès la révélation du 24. Jusqu’au 15 janvier 2027 inclus, tous les membres peuvent consulter le classement final et le calendrier, même sans avoir joué ; après le 24, aucune réponse n’est possible et aucun quiz ne s’ouvre automatiquement.

- **FR-10:** Le calendrier représente les 24 quiz et le 25 décembre, dont la présentation reste à définir en UX. Il distingue les quiz joués, passés non joués, celui du jour et les futurs bloqués. Une case passée non jouée peut être consultée après sa date de révélation : portrait, anecdotes et fausse anecdote disponibles, sans réponse ni points. Une case jouée montre le choix, la fausse anecdote et les points obtenus uniquement après leur révélation. Une case sans contenu affiche « Il n’y a rien ici. Reviens plus tard ! ». Le calendrier et le classement restent accessibles depuis l’expérience, sauf sur l’écran prioritaire de révélation de FR-7.

- **FR-11:** L’animation peut commencer sans les 24 quiz. Patrice peut ajouter les contenus par une nouvelle release ; un quiz publié pendant son jour devient jouable dès sa disponibilité et jusqu’à minuit. Un contenu publié après son jour n’est pas jouable ; il peut être consulté comme contenu passé après révélation. Patrice vérifie les anecdotes avant publication ; la fausse anecdote ne change pas une fois qu’un membre a répondu.

- **FR-12:** Un jour de jeu sans quiz disponible, il n’y a ni notification ni ouverture automatique. L’icône mène au message « Il n’y a rien ici. Reviens plus tard ! » et à un accès au classement pour tous, même sans participation, après l’éventuelle révélation prioritaire. Le 25 décembre suit FR-9 et ne comporte pas de quiz.

- **FR-13:** Avant décembre, Patrice et Toinou peuvent tester et présenter le calendrier dans un environnement de développement isolé de la production. Le mode test permet aux membres actifs de la troupe configurée figurant sur la liste dédiée des testeurs d’ouvrir librement les cases disponibles avant leur jour prévu ; il doit permettre de vérifier les nouvelles règles de jeu et de révélation, sans affecter la partie réelle. Chaque testeur peut effacer sa propre réponse à une case et la rejouer, même passée, sans reculer l’horloge commune ni modifier les réponses des autres. Une remise à zéro ciblée des données du calendrier permet de recommencer toute la partie. La troupe peut être choisie par environnement. Aucun mode test n’est disponible en production. Une horloge simulée commune côté serveur avance seulement ; répondre à une case future la fait avancer jusqu’au jour de cette case. Le barème normal s’applique et le résultat est révélé le lendemain simulé. Revenir en arrière exige de réinitialiser la partie de test et son horloge. Les limites réelles sont vérifiées séparément.

### NonFunctional Requirements

- **NFR-1 — Confidentiality:** Restrict the event to active members of the configured troupe; protect unreleased portraits, statements and answers and collect consent from people presented.
- **NFR-2 — Integrity and recovery:** Ensure one durable answer per member and case under retries, interruption and concurrency; scores and rankings derive from recorded answers across devices.
- **NFR-3 — Accessibility and usability:** Apply HatCast Material 3, accessible interaction, mobile-first responsive layout and an equivalent reduced-motion experience; UX requirements below detail verification.
- **NFR-4 — Temporal correctness:** Evaluate dates and confirmation deadlines using server-side Europe/Paris civil time.
- **NFR-5 — Isolation:** Development tests and reset must not affect production data, notifications or analytics.
- **NFR-6 — Delivery and retention:** Prepare and verify before 1 December with testing margin; preserve answers and results after the consultation window.

### Additional Requirements

- **AD-1:** Enforce membership, date and mode on all API reads and mutations; keep future content, pending answers and derived correctness or points out of clients, URLs, caches and analytics; sensitive responses are no-store.
- **AD-2:** Development-only isolated mode, fictional statements, configured troupe, shared forward-only simulated clock and targeted reset of game and clock; advancing to a future answer uses normal scoring and next-day reveal. Verify real boundaries separately.
- **AD-3:** Persist unique answers, scores, daily dismissal and seen state; confirmations still waiting for the lock close at midnight; result reads wait for an already-running transaction, and acknowledgment follows actual reveal display. Select the most recent revealable unseen result.
- **AD-4:** Ranking and personal totals include only revealed points, use lowest ranks for ties, include zero scores and exclude designated accounts; retain answers after access ends.
- **AD-5:** Existing Spring reminder targets 10:00 Paris on days 1–24, checks actual execution availability and eligibility, tolerates late or missed notifications, without dedicated recovery or publication timestamp.
- **AD-6:** Measure distinct real players and recorded real answers; exclude tests and sensitive information, with the database authoritative.
- Contents arrive by release without an administration interface; verify reset safeguards, client and shared caches, isolation and operational effects.

### UX Design Requirements

- **UX-DR1:** Use accessible Angular Material 3 behaviors with the approved independent Advent identity, scoped Advent tokens, typography and components; preserve HatCast appearance and verify isolation and contrast.
- **UX-DR2:** Provide a full-page decorated discovery door, short opening and soft light, with immediate equivalent access under reduced motion.
- **UX-DR3:** Place portrait, three single-choice statements and explicit confirmation on the quiz; selection can change until confirmation. Aim for no scrolling on usual phones but never truncate content or sacrifice accessibility.
- **UX-DR4:** After a neutral acknowledgment, reveal the result from next midnight on the same surface; show response, participation and earned bonus points and total; celebrate only correct answers briefly and omit motion when requested. Revisited results show choice, correct answer and points without replaying celebration.
- **UX-DR5:** Provide separate accessible Advent-styled Calendar and Ranking tabs, with the priority reveal, daily quiz and personal ranking summary defined in EXPERIENCE.md.
- **UX-DR6:** Render 24 numbered quiz cases and a 25 December case in a four-column, left-to-right grid; distinguish played, past, today, future locked and missing-content cases without color alone; expose number and state accessibly without revealing future content.
- **UX-DR7:** Show the Santa icon near account with a discreet movement once at HatCast opening, less than five seconds, and no movement under reduced-motion preference.
- **UX-DR8:** Use French, tutoiement and encouraging festive tone; preserve the specified missing-content, bonus and Christmas messages and result variations.
- **UX-DR9:** Support keyboard operation, visible focus, appropriate focus entry/restoration and announcements for door, result and errors without a keyboard trap; use meaningful portrait alternatives and single-choice semantics.
- **UX-DR10:** Target 48 × 48 px touch targets, minimum 44 × 44 px. Verify small widths, zoom, text enlargement, contrast and no loss of content or action on mobile, tablet and desktop.
- **UX-DR11:** Show clear test-mode indication and preserve the development-only test journey and targeted reset behavior.

### FR Coverage Map

- FR-1 → Advent epic: entry and availability.
- FR-2 → Advent epic: daily automatic opening and shared dismissal.
- FR-3 → Advent epic: daily invitation using existing reminders.
- FR-4 → Advent epic: quiz selection and confirmation.
- FR-5 → Advent epic: answer and streak scoring.
- FR-6 → Advent epic: result and next action.
- FR-7 → Advent epic: retry and unseen-result recovery.
- FR-8 → Advent epic: ranking, ties and exclusions.
- FR-9 → Advent epic: ranking and final consultation.
- FR-10 → Advent epic: calendar, read-only past discovery and review.
- FR-11 → Advent epic: content availability and release publication.
- FR-12 → Advent epic: missing daily content.
- FR-13 → Advent epic: isolated development testing.

## Epic List

### Approved epic: La Malice Advent calendar

Members of La Malice discover each other through a daily festive quiz, review revealed results and past content, then consult the final friendly ranking; organizers prepare and test the experience safely before opening.

**FRs covered:** FR-1–FR-13. **Architecture:** AD-1–AD-7. **UX:** UX-DR1–UX-DR11.

Progressive human checkpoints follow the journey: door, quiz, result, ranking, calendar, Santa icon, then notifications. Show each partial experience to Patrice and Toinou as soon as it is safe and testable; explicitly identify unfinished parts. The first usable test requires development isolation and the protections relevant to what is exposed.

The experience and its security, scoring, ranking and state share one domain and are already designed together. One epic avoids artificial boundaries and repeated work on the same components; independently reviewable stories will be ordered inside it. The production entry must not expose an incomplete or unprotected experience. Epic 25 and its story identifiers remain stable; revised criteria and dependencies were validated with Patrice on 2026-10-29.


### Approved visual alignment — 30 October 2026

The approved Advent design system and AD-7 apply to every Advent screen and state. Create a scoped foundation and separately align the already completed 25.1/25.2 discovery, question and neutral confirmation without changing behavior. Later stories apply the same foundation within their existing scope; do not infer sharing, countdown or a 24 December completion journey from the visual board. Preserve completed story history. Acceptance includes responsive and accessibility checks, before/after HatCast visual and computed-style isolation, and existing answer-secrecy and date-boundary regressions. Detailed delivery sequence is recorded in PLAN.md.

## Epic 25: Discover La Malice through an Advent calendar

Members discover each other through 24 daily quizzes, delayed reveals and a friendly ranking; Patrice and Toinou validate the journey in isolated development before production opening. The PRD, UX, spec and architecture remain binding. Partial checkpoints identify unfinished features and must never expose protected production data.

### Story 25.1: Open an Advent door in isolated development

As an eligible member testing the calendar, I want to open an available test door so that I can explore the discovery experience.

**Acceptance Criteria:**

1. In isolated development, active members of the configured troupe can open available future cases before their simulated day; the interface visibly identifies test mode. Test statements are fictional; actual names or portraits require consent.
2. The API enforces active troupe membership, the dedicated test-user allowlist and environment restrictions on each read. Platform administrators outside the troupe are not exempt. Production offers no test mode; future content, revealing portraits and answers are inaccessible through API, bundles, assets or direct URLs.
3. Opening the full-page decorated door reveals only the selected permitted portrait and quiz content; reduced motion gives equivalent immediate access. Answering is not yet available and is explicitly identified as unfinished in the demonstration.
4. Before a human demonstration, verify development data, notifications and analytics are isolated from production. Keyboard access, focus, accessible state, responsive layout, scoped Advent styling, Material 3 behavior and touch targets follow the UX contract.

**References:** FR-1, FR-10, FR-13; AD-1, AD-2; UX-DR1, UX-DR2, UX-DR6, UX-DR9–UX-DR11.

### Story 25.2: Answer the quiz after opening a door

As an eligible member, I want to select and confirm a single statement so that my answer is saved for the next day's reveal.

**Clarification after completion:** Production answers remain final. The isolated test preview additionally allows a tester to erase and replay their own answer under the existing 25.2 safeguards, without changing other answers or rewinding the shared clock.

**Acceptance Criteria:**

1. Display the portrait and three single-choice statements; allow selection changes until explicit confirmation. One immutable answer per member and quiz is enforced in the database under concurrent requests and retries.
2. At the next Paris midnight, confirmations still waiting for the lock close even if received earlier; result reads wait for an already-running transaction. An uncertain response is resolved by checking stored state, with retry only while admissible.
3. Persist the selection and stable result data and calculate 10 points for a correct answer or 0 for incorrect, plus 1 participation point and 2 for each non-overlapping group of three consecutive correct responses. A wrong answer resets the sequence; a missed day does not. Concurrent writes cannot corrupt the sequence or duplicate scores.
4. Before reveal return only a neutral recorded acknowledgment and return-tomorrow message; identify Ranking as unavailable in the partial demonstration until its action becomes operational in 25.4. API responses, errors, metadata, scores and client state must not disclose correctness, answer, points or other clues. No past quiz accepts a catch-up answer.
5. In isolated test mode, confirming a future case advances the shared simulated server clock to its day; normal scoring applies and the result is revealed the following simulated day. The clock cannot move backward except through the targeted reset. Actual production date boundaries are verified separately.
6. Verify single-choice semantics, portrait alternatives, keyboard, focus, announcements, contrast, small screens and enlarged text; use HatCast Material 3 and never truncate the content.

**References:** FR-4–FR-7, FR-13; AD-1–AD-3; UX-DR1, UX-DR3, UX-DR9–UX-DR11.

### Story 25.2a: Restart an isolated test session

As an organizer, I want to reset the test game so that I can replay its dates and results safely.

**Acceptance Criteria:**

1. A documented targeted reset in verified isolated development clears test answers, scores, shared per-member journey state and the simulated clock for the intended scope while preserving test content and unrelated data; the clock can then start earlier.
2. Production and any environment whose isolation cannot be established reject reset and clock control on the server. The procedure cannot affect production data, notifications or analytics.
3. Replaying after reset computes results and series solely from new answers. Document target, prerequisites, effects and verification; no general administration interface is required.

**References:** FR-13; AD-2–AD-4; UX-DR11.

### Story 25.3: Discover and recover the quiz result

As a member who answered, I want to discover my saved result after its reveal so that I can enjoy it even after interruption or on another device.

**Acceptance Criteria:**

1. Starting at the following 00:00 Paris, show the selected statement, false statement, correctness, response and participation points, earned streak bonus if any, total and optional anecdote; before that instant none is available through API or interface.
2. On return present the most recent revealable unseen answer first, even when a newer answer is pending. No Calendar action is offered on this priority screen; afterwards offer today's quiz if available, or the relevant missing-content or 25 December path.
3. Persist seen state by member and answer across devices only after the reveal screen is actually displayed and the client acknowledges it; HTTP delivery alone does not mark it seen. A lost acknowledgment can cause a repeat and simultaneous devices can both show it; acknowledgments are idempotent. Older unseen results remain accessible through their calendar cases without special markers or automatic chaining; verify that calendar access when 25.5 is available.
4. Celebrate correct answers only on initial reveal, with an equivalent reduced-motion result; revisiting does not replay celebration. A failed or uncertain submission is checked before offering a retry; after closure explain that the quiz is closed.
5. Verify focus, announcements, accessible error handling, no truncated text and navigation on narrow screens with Material 3 components.

**Visual contract:** Apply the Advent visual foundation to the correct, incorrect and detailed reveal states; keep the reveal priority and secrecy rules. Use the Advent DESIGN and EXPERIENCE contracts and architecture AD-7; test keyboard, accessible states, responsive rendering and isolation from HatCast.

**References:** FR-5–FR-7, FR-9–FR-10; AD-1–AD-3; UX-DR4, UX-DR8–UX-DR10.

### Story 25.4: See the friendly ranking

As a member, I want to see the revealed ranking and my own score so that I can share the fun without learning today's result early.

**Acceptance Criteria:**

1. Include all classable members by name from zero; show the connected member's position and revealed score. Patrice and Toinou see their own scores without rank and are excluded from the list.
2. Derive scores and ranks using one server reference time and only answers already revealable; no pending correctness, points, subtotal or derived clue is returned. Ties receive the lowest position of the group: 1, 3, 3, 4; all N tied receive rank N.
3. At 00:00 Paris on 25 December the result of the 24th is revealable and the ranking is final. The ranking is available to all eligible members through 15 January, even without answers; verify calendar availability with 25.5. Member access ends on 16 January; results remain retained. No special membership-change mechanism is added.
4. Verify ranking against correct, incorrect, missed and third/sixth correct answers, including exclusion, cross-account requests and before/after-midnight snapshots. Test simulated time and actual date boundaries separately.
5. Names, position and scores remain readable and accessible on small screens and with keyboard, assistive technology and text enlargement; use Material 3.

**Visual contract:** Apply the Advent visual foundation to ranking and personal score states; retain the existing accessible data and pending-score protections. Use the Advent DESIGN and EXPERIENCE contracts and architecture AD-7; test keyboard, accessible states, responsive rendering and isolation from HatCast.

**References:** FR-5, FR-6, FR-8–FR-9; AD-1, AD-3, AD-4; UX-DR1, UX-DR5, UX-DR9–UX-DR10.

### Story 25.5: Browse the calendar and past content

As a member, I want to browse the calendar and revisit permitted content so that I can enjoy the discoveries at my own pace.

**Acceptance Criteria:**

1. Show 24 numbered quiz cases and a 25 December case in a four-column ordered grid. Distinguish played, past unplayed, today, future locked and missing states accessibly, without exposing future content or relying on color alone.
2. A played case before revelation provides only the neutral pending state. After revelation it provides the choice, false statement and points without allowing another answer or replaying celebration. An unplayed past quiz is read-only after its reveal, with portrait, anecdotes and false statement but no points or answer action.
3. No past case can be answered. A future production case remains locked at both UI and API. An absent case shows “Il n’y a rien ici. Reviens plus tard !”; content published during its day becomes playable until midnight, and content published later is read-only after reveal.
4. From 25 December through 15 January, eligible members can consult calendar and final ranking, even without playing. The 25 displays the Christmas message, personal score and decorative Santa and box according to UX; no quiz or automatic quiz opening occurs.
5. Verify case states and content permissions through direct API, URLs, cache and two accounts; meet keyboard, screen-reader, responsive, reduced-motion and Material 3 requirements.

**Visual contract:** Apply the Advent visual foundation to calendar states, past content, missing content and the 25 December presentation; distinguish states without relying on color. Use the Advent DESIGN and EXPERIENCE contracts and architecture AD-7; test keyboard, accessible states, responsive rendering and isolation from HatCast.

**References:** FR-6, FR-9–FR-11, FR-13; AD-1–AD-4; UX-DR1–UX-DR6, UX-DR9–UX-DR11.

### Story 25.6: Enter the Advent experience from HatCast

As an eligible member, I want to discover and reopen the experience without repeated automatic interruptions.

**Acceptance Criteria:**

1. In production show the Santa icon near My Account from 1 December to 15 January inclusive Paris time; hide it outside that window and enforce the same server access. Its discreet motion lasts less than five seconds, once on opening, and respects reduced motion.
2. From 1–24 December, automatically open an available unanswered daily quiz on the first eligible visit after any priority reveal. Persist dismissal by member and day across devices; a recorded answer also prevents opening. Visiting without available content does not consume the opening; closing the experience does.
3. With no quiz, no automatic opening occurs; the icon offers the absence message and Calendar and Ranking after the priority reveal. When content appears later that day, it may auto-open on a later eligible visit unless already closed.
4. After today's answer, the icon opens Ranking subject to reveal priority. On 25 December show the Christmas journey after any priority reveal; thereafter and through 15 January provide final Ranking and Calendar without new answers or automatic quiz opening.
5. Test mode is development-only and visibly identified. Verify cross-device state, active membership, focus entry and restoration, keyboard and accessible labels.

**Visual contract:** Apply the Advent visual foundation to Advent entry and missing-content surfaces; keep HatCast navigation chrome and design system unaffected. Use the Advent DESIGN and EXPERIENCE contracts and architecture AD-7; test keyboard, accessible states, responsive rendering and isolation from HatCast.

**References:** FR-1, FR-2, FR-7, FR-9, FR-12, FR-13; AD-1–AD-3; UX-DR1, UX-DR5, UX-DR7–UX-DR11.

### Story 25.7: Invite members to the daily quiz

As an eligible member, I want the usual invitation to the day's quiz so that I can take part when notifications are enabled.

**Acceptance Criteria:**

1. Schedule an attempt with existing Spring reminders at 10:00 Europe/Paris on 1–24 December. At actual execution check the day's available quiz, active troupe membership, no recorded answer and ordinary notification preferences. The link follows the priority reveal before the daily path.
2. If the quiz is unavailable or the job does not run, no invitation is sent. A late execution may invite a quiz published after 10:00; late or missed delivery is acceptable. No dedicated publication timestamp, recovery, delivery guarantee or fictitious show is added.
3. Adapt existing notification dispatch and deduplication to a quiz and recipient without a fictitious event; ensure repeated or concurrent processing does not intentionally send duplicate invitations. Respect normal eligibility checks and test both answered and disabled-preference cases.
4. Test with isolated development data and notifications without production effects; verify Paris time boundaries and real dates separately.

**References:** FR-3, FR-12, FR-13; AD-1, AD-2, AD-5.

### Story 25.9: Measure actual participation

As an organizer, I want to know how many people played and how many answers were recorded without exposing quiz contents.

**Acceptance Criteria:**

1. Measure two global totals: distinct real players with at least one saved answer and the number of real saved answers. No daily breakdown or participation target is required.
2. Exclude development tests and never transmit anecdotes, statements, choices, pending correctness or points. Repeated submissions must not inflate counts.
3. Recorded database answers are authoritative for both totals if telemetry is missing or duplicated. This story does not authorize an analysis of existing PostHog data.

**References:** AD-2, AD-6; PRD success signal.

## Final validation

- **Coverage:** FR-1–FR-13, AD-1–AD-7 and UX-DR1–UX-DR11 are covered across stories 25.1–25.7, 25.2a and 25.9; companions retain full contractual detail.
- **Order:** 25.1 → 25.2 → 25.2a → 25.3 → 25.4 → 25.5 → 25.6 → 25.7; 25.9 follows recorded answers. Development isolation and protections precede human testing; partial features are identified as such.
- **Validation:** Revised criteria and dependencies reviewed and approved with Patrice on 2026-10-29. Check real date boundaries separately from the simulated clock; verify device, keyboard, contrast and reduced-motion behavior. The Christmas recap, optional animation and graphical treatment of missed cases remain open for story design.
