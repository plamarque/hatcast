---
stepsCompleted: [1, 2, 3, 4]
session_topic: 'Notifications V2 post-catalogue — moments clés manquants (hors périmètre couvert juin 2026)'
session_goals: '3–8 idées nouvelles ; matrice Intent×Audience×Trigger×Pref×Canal ; reverse brainstorming ; role storming Léa/Marc ; priorisation P1/P2 sans spec impl'
techniques_used:
  - 'Phase 1: Matrice morphologique (lignes nouvelles uniquement)'
  - 'Phase 2: Reverse brainstorming (anti-patterns restants)'
  - 'Phase 3: Role storming (Léa / Marc sur top 3)'
inputDocuments:
  - docs/v2/technical/NOTIFICATIONS_CATALOG.md
  - _bmad-output/implementation-artifacts/investigations/notifications-catalog-investigation.md
  - _bmad-output/brainstorming/brainstorming-session-2026-06-01-notifications-epic8.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-notifications-epic8-scope.md
  - _bmad-output/planning-artifacts/growth-backlog.md (G-012)
facilitator: Patrice
date: '2026-06-07'
session_status: complete
decisions_recorded: '2026-06-08 (Patrice) — D1–D7 tranchées'
context_note: 'Story 8.7 commitée (AVAILABILITY_PENDING_REMINDER). Catalogue as-is rédigé, non commité.'
---

# Brainstorming — Notifications post-catalogue

**Facilitateur :** Patrice  
**Date :** 2026-06-07  
**Projet :** HatCast V2 — Epic 8 notifications

---

## Contexte et périmètre

### Point de départ

- **Catalogue as-is** : [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) (+ investigation du 2026-06-07).
- **8.7 livrée** : rappels auto dispos `unknown` (`AVAILABILITY_PENDING_REMINDER`, cadence 5 j, catégorie `AVAILABILITY_WEEKLY_REMINDER`).
- **Discovery juin 2026** déjà arbitrée (SCP FR31/FR31b, principes inbox ≠ log, publish before ping, orga early / member late) — **non re-débattue ici**.

### Hors scope explicite

| Exclu | Raison |
|-------|--------|
| Intents actifs (dispos, confirm, reconfirm, retrait, présence, proxy, manual share) | Déjà catalogués |
| Backlog 8.4 FR31b (6 intents ops orga) | Tracé SCP — pas de duplication |
| G-012 « équipe confirmée » tel quel | Déjà growth-backlog — sauf angle nouveau (voir décisions) |
| Badge inbox PWA, refonte Share/Announce, parité HTML email V1, URL API 3 segments | Dette / Epic 10 / Epic 6 — pas idéation |
| Gap-fill → `CONFIRMATION_REQUEST` ciblé | Déjà runtime (story 8.3 / spec notify-on-validate) |

### Tensions — statut post-décisions PO (2026-06-08)

| Tension | Décision |
|---------|----------|
| Retrait compo obligatoire vs opt-out | **D1:A** — conserver opt-out via `CONFIRMATION_REQUEST` (écart SCP accepté) |
| Accusé proxy vs pref confirmation | **D2:A** — même catégorie (statu quo 8.6) |
| Toggles sans dispatch | **D6:B** — masquer `COMPOSITION_SHARED` et `TEAM_CONFIRMED` jusqu’au dispatch actif |
| G-012 intent / pref | **D3:B** — nouvel intent explicite (ex. `TEAM_COMPLETE_MEMBER`) ; pref à finaliser à l’implémentation |
| N4 équipe redevenue incomplète | **D5:B** — **non retenu** ; N3 (`ASSIGNEE_DECLINED`) suffit pour les orgas |

---

## Phase 1 — Matrice morphologique (lignes nouvelles)

Grille : **Intent × Audience × Trigger × Pref × Canal** — uniquement des moments **absents** du catalogue actif + **non couverts** par le backlog 8.4 tel quel.

| # | Intent proposé | Audience | Trigger | Pref proposée | Canal | Commentaire |
|---|----------------|----------|---------|---------------|-------|-------------|
| **N1** | `EVENT_DETAILS_CHANGED` | Assignés **+** roster (dispos ouvertes) | Auto — delta **`startsAt`**, **`location`** ou **format** (`templateType`) sur événement **publié** | Opt-out `EVENT_DETAILS_CHANGED` | Push + email | **D4:B** — pas de notif si seule `description` (ou autre champ hors date/lieu/format) |
| **N2** | `EVENT_ARCHIVED` | Assignés liés + roster avec dispos renseignées ou `unknown` | Auto — archivage spectacle (`archived: true`) | Opt-out membre (**D1:A** — même modèle que retrait ; catégorie dédiée ou `EVENT_DETAILS_CHANGED` TBD) | Push + email | Pas de notif sur unarchive |
| **N3** | `ASSIGNEE_DECLINED` | Cascade orga (event orga → season orga → troupe admin) | Auto — création ligne `event_composition_declines` sur compo validée | **Opt-in orga** — nouvelle catégorie FR31b (ex. `ORG_COMPOSITION_ALERTS`) | Push + email | Signal **immédiat** ; complète (≠ remplace) les cadences `COMPOSITION_INCOMPLETE_*` de 8.4 |
| ~~**N4**~~ | ~~`TEAM_REGRESSED_INCOMPLETE`~~ | — | — | — | — | **D5:B — non retenu** ; N3 suffit pour orgas |
| **N5** | `MANUAL_GAP_RECRUITMENT` | Sous-ensemble roster : dispos `available` pour le `roleKey` vacant | **Manuel** — action orga post-déclin (« Appeler des remplaçants » dans Share ou CTA Équipe) | `AVAILABILITY_REQUEST` (réutiliser) + garde-fou 6.10b (envoi récent) | Push + email | Alternative légère au broadcast auto post-déclin ; respecte « manual guarded » |
| **N6** | `TROUPE_MEMBERSHIP_INVITE` | Invité (email du carnet / compte cible) | Transactionnel — envoi invitation self-service ou add membre avec email (Epic 7 / ADR 0021) | **Hors prefs HatCast** (comme reset MDP) | Email only | Mention catalogue « transactionnel TBD » ; pas push |

**Non retenu comme idée distincte (déjà couvert ou hors brief) :**

- Confirmation nouveau assigné gap-fill → `CONFIRMATION_REQUEST` existant.
- `TEAM_COMPLETE` orga (8.4) vs G-012 membre — arbitrage produit existant, pas nouvelle ligne matrice.
- Email groupé multi-événements — defer explicite 8.7 / V1 parity, pas moment domaine nouveau.

---

## Phase 2 — Reverse brainstorming

**Consigne :** « Comment HatCast pourrait encore mal notifier en 2026 malgré le catalogue ? » → 3 anti-patterns + principe correctif.

| Anti-pattern | Symptôme | Principe correctif |
|--------------|----------|-------------------|
| **A1 — Pref fantôme** | Toggle visible (`COMPOSITION_SHARED`, `TEAM_CONFIRMED`) sans effet ; l’utilisateur croit s’être désabonné | **Pref = dispatch contract** : aucune clé UI sans intent actif ou mention « bientôt » ; livrer G-012 / 8.4 avant d’exposer le toggle |
| **A2 — Bruit post-engagement** | Notifier des assignés **confirmés** pour des changements mineurs (description seule) ou re-notifier toute l’équipe à chaque déclin | **Delta significatif + audience ciblée** : N1/N3/N4 filtrent les champs et les destinataires ; pas de re-broadcast confirmés pour un gap-fill (déjà respecté) |
| **A3 — Double vérité pull/push** | Push « équipe confirmée » alors que l’inbox / le badge agenda montrait déjà l’état ; ou ping alors que l’événement est archivé mais le lien 404 | **Publish / état domaine d’abord** : N2 avant tout rappel programmé ; G-012 = célébration explicite, pas doublon d’un état déjà visible partout |

---

## Phase 3 — Role storming (top 3)

Idées retenues pour empathy check : **N1**, **N2**, **N4** (impact membre direct + tension G-012).

### Léa (membre assignée, confirmée)

| Idée | Réaction | Ajustement proposé |
|------|----------|-------------------|
| **N1** date/lieu | « Je *dois* le savoir — j’ai calé mon samedi. Un seul message clair avec ancienne → nouvelle date. » | P1 ; deep link `?tab=infos` ; une notif par événement par vague d’édition (debounce 15 min ?) |
| **N2** archivage | « Si le spectacle est annulé, oui — même si j’avais confirmé. Ne me rappelle plus J-1 après. » | P1 ; **couper** les jobs présence / pending dispos pour event archivé (garde technique, pas idée) |
| **N4** équipe incomplète | « Utile si quelqu’un se désiste *après* qu’on était au complet — je vérifie si je dois recruter. Pas si c’est encore en cours de confirmations normales. » | P2 ; trigger **uniquement** depuis état `complete` ; copy « L’équipe n’est plus au complet » |

### Marc (orga)

| Idée | Réaction | Ajustement proposé |
|------|----------|-------------------|
| **N1** | « Je préfère prévenir moi-même parfois — mais si j’oublie, l’auto me sauve. » | Opt-out membre OK ; option future : case « Ne pas notifier » sur PATCH date (manual override) — **hors MVP** |
| **N2** | « Annulation = je veux que tout le monde le sache sans refaire un Share. » | P1 ; inclure orgas en copie optionnelle ou confier à N3/N4 |
| **N3** (honorable mention) | « Le déclin, je veux le savoir **tout de suite**, pas dans le rappel hebdo 8.4. » | P1 orga ; regrouper sous story 8.4 ou **8.4b** « signaux immédiats » |

**Synthèse role storming :** N1 + N2 montent en **P1 membre** ; N3 en **P1 orga** (complément 8.4) ; N4 reste **P2** jusqu’à livraison G-012.

---

## Idées retenues (6)

Qualité > quantité. Chaque idée = un moment domaine **non couvert** aujourd’hui.

### 1. Changement date, lieu ou format (`EVENT_DETAILS_CHANGED`) — **P1**

Spectacle publié ; l’orga modifie **date**, **lieu** ou **format** (`templateType`). Assignés + roster (dispos ouvertes) reçoivent une alerte avec le delta. **Pas** de notif pour description seule ou autres champs.

- **Pref :** opt-out membre — catégorie `EVENT_DETAILS_CHANGED`.
- **Story :** nouvelle **8.8** — après alignement SPEC/DOMAIN.

### 2. Spectacle archivé / annulé (`EVENT_ARCHIVED`) — **P1**

L’événement disparaît de l’agenda ; assignés + roster actif prévenus.

- **Pref :** opt-out membre (**D1:A** — pas de catégorie obligatoire).
- **Story :** même lot que 8.8 ou story dédiée **8.9**.

### 3. Déclin assigné — alerte orga immédiate (`ASSIGNEE_DECLINED`) — **P1 orga**

Dès qu’un assigné décline sur compo validée, cascade orga (pas d’attente cadence hebdo 8.4).

- **Pref :** opt-in orga (famille FR31b).
- **Story :** **8.4** (intent supplémentaire) ou sous-story **8.4b**.

### ~~4. Équipe redevenue incomplète~~ — **Non retenu (D5:B)**

N3 (`ASSIGNEE_DECLINED`) suffit : les orgas infèrent que la compo redevient incomplète.

### 5. Appel manuel remplaçants (`MANUAL_GAP_RECRUITMENT`) — **P2**

Post-déclin, l’orga déclenche un nudge ciblé vers les membres **disponibles** pour le rôle vacant — sans auto-spam roster entier.

- **Pref :** `AVAILABILITY_REQUEST` + garde 6.10b.
- **Story :** extension **6.10c** ou intent manual dans Epic 6 (pas dispatcher auto).

### 6. Email invitation troupe / guest (`TROUPE_MEMBERSHIP_INVITE`) — **P2**

Email transactionnel d’onboarding (lien acceptation), hors prefs push/email membre.

- **Pref :** ops-only / transactionnel Identity-like.
- **Story :** Epic **7** / ADR 0021 — pas Epic 8.

---

## Tableau synthèse

| Moment | Intent proposé | Audience | Trigger | Pref | P | Story / G-id |
|--------|----------------|----------|---------|------|---|--------------|
| Date, lieu ou format modifiés | `EVENT_DETAILS_CHANGED` | Assignés + roster (dispos ouvertes) | Auto — delta date/lieu/`templateType` | Opt-out `EVENT_DETAILS_CHANGED` | **P1** | 8.8 |
| Spectacle archivé | `EVENT_ARCHIVED` | Assignés + roster actif | Auto — archive | Opt-out membre (D1:A) | **P1** | 8.8 / 8.9 |
| Assigné décline | `ASSIGNEE_DECLINED` | Cascade orga | Auto — decline row | Opt-in orga (FR31b) | **P1** | 8.4 / 8.4b |
| Équipe confirmée (G-012) | `TEAM_COMPLETE_MEMBER` | Orgas + assignés confirmés | Auto — lifecycle `complete` | Opt-out `TEAM_CONFIRMED` (UI masquée jusqu’au ship — D6:B) | **P1** | G-012 → story 8.x |
| Recrutement remplaçant | `MANUAL_GAP_RECRUITMENT` | Roster dispo pour rôle vacant | Manuel — orga | `AVAILABILITY_REQUEST` + guard | **P2** | 6.10c |
| Invitation email | `TROUPE_MEMBERSHIP_INVITE` | Invité | Transactionnel | Hors prefs app | **P2** | Epic 7 |

*Retiré (D5:B) :* `TEAM_REGRESSED_INCOMPLETE` — N3 suffit pour les orgas.

---

## Décisions PO — tranchées (2026-06-08)

| # | Décision | Option retenue | Implication |
|---|----------|----------------|-------------|
| **D1** | Retrait + archivage obligatoires ? | **A — opt-out** | `REMOVED_FROM_COMPOSITION` et N2 restent désactivables ; écart SCP accepté et documenté |
| **D2** | Split pref accusé proxy ? | **A — statu quo** | `PROXY_CONFIRMATION_RECORDED` reste sous `CONFIRMATION_REQUEST` |
| **D6** | Toggles sans dispatch | **B — masquer** | Retirer de l’UI `COMPOSITION_SHARED` et `TEAM_CONFIRMED` jusqu’à 8.4 / G-012 |
| **D3** | G-012 intent | **B — nouvel intent** | `TEAM_COMPLETE_MEMBER` (pas réutiliser `TEAM_VALIDATED_FYI` tel quel) |
| **D4** | Audience + déclencheurs N1 | **B — assignés + roster** | Uniquement **date, lieu, format** ; pas description ni autres champs |
| **D5** | N3 + N4 au déclin | **B — N3 seul** | `TEAM_REGRESSED_INCOMPLETE` abandonné ; pas de G-013 |
| **D7** | Catalogue | **B — backlog « proposé » maintenant** | [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) |

---

## Prochaines étapes

1. **`bmad-create-story`** — 8.8 (N1 + N2) ; amendement 8.4 (+ N3) ; G-012 → story avec `TEAM_COMPLETE_MEMBER`.
2. **UI** — masquer toggles fantômes (D6:B).
3. **Doc** — catalogue § Backlog proposé (D7:B).

---

*Session close — 2026-06-07. Décisions PO — 2026-06-08.*
