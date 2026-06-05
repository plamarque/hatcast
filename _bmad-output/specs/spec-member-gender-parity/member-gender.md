# Member gender — data model, labels, parity (companion)

Normative detail for [SPEC.md](SPEC.md). Root [DOMAIN.md](../../../DOMAIN.md) glossary and rules cite this companion.

## Enum and persistence

| Layer | Value |
|-------|--------|
| DB `users.gender` | `VARCHAR` nullable; store `male`, `female`, `non_specified` |
| JSON API | same strings |
| Default | `non_specified` when column NULL or unset |
| UI (Mon compte) | Homme → `male`; Femme → `female`; Non précisé → `non_specified` |

**V1 import mapping:**

| V1 `players.gender` | V2 |
|---------------------|-----|
| `male` | `male` |
| `female` | `female` |
| `non-specified`, `unknown`, null, invalid | `non_specified` |

When multiple V1 player rows link to one user, prefer the most recently updated non-`non_specified` value; else `non_specified`.

**Account deletion (FR37):** Clear `users.gender` with other PII on anonymization.

## Gender-aware role labels

Port V1 `getRoleLabel(role, userGender, plural)` from `legacy/src/services/storage.js`. Singular labels by gender:

| roleKey | male | female | non_specified |
|---------|------|--------|---------------|
| `player` | Comédien | Comédienne | Comédien·ne |
| `volunteer` | Bénévole | Bénévole | Bénévole |
| `mc` | MC | MC | MC |
| `dj` | DJ | DJ | DJ |
| `referee` | Arbitre | Arbitre | Arbitre |
| `assistant_referee` | Assistant | Assistante | Assistant.e |
| `lighting` | Lumière | Lumière | Lumière |
| `coach` | Coach | Coach | Coach |
| `stage_manager` | Régisseur | Régisseuse | Régisseur.euse |

Plural forms follow the same V1 `ROLE_LABELS_PLURAL_BY_GENDER` tables.

**Surfaces (Wave B):** dispos cells, équipe slots, confirmation/decline copy, availability summaries, member popover role pills, email templates if reintroduced.

**Selection status (V1 parity):** pending/confirmed labels may use Sélectionné / Sélectionnée / Sélectionné·e by gender when shown next to a named participant.

## Avatar fallback

When `avatar_url` is absent and Google photo is not used (story **2.6** rules), V2 shows the **first letter** of the display name on a **gender tone** background (`app-user-avatar` + `--hatcast-member-gender-*` tokens). V1 used emoji (`legacy/src/services/playerAvatars.js`) — **not** ported to V2 runtime.

| gender | Letter | Tone (M3 tokens) | Host class |
|--------|--------|------------------|------------|
| `male` | First char (uppercase) | Purple (`--hatcast-member-gender-male-bg/fg`) | `user-avatar--tone-male` |
| `female` | Same | Orange (`--hatcast-member-gender-female-bg/fg`) | `user-avatar--tone-female` |
| `non_specified` | Same | Grey (`--hatcast-member-gender-neutral-bg/fg`) | `user-avatar--tone-neutral` |

Custom or Google photo takes precedence; tone applies only on letter fallback.

## Team gender parity — definitions

**Scope role:** `player` (`RoleKeys.PLAYER` / JEU).

**Slot set (composition hint, story 6.21):** all filled slots on the **current** composition (draft or validated) where `roleKey = player` and `participantId` is set.

**Slot set (season stats, story 16.3):** all slots on **validated** compositions in the season where `roleKey = player`, `participationStatus ≠ DECLINED`, same event scope rules as existing season statistics.

**Counts:**

```
f = slots where linked user.gender = female
m = slots where linked user.gender = male
u = slots where gender is non_specified, null user, or unlinked participant without gender
```

**Ratio (when f + m > 0):**

```
femaleShare = f / (f + m)   // 0.0–1.0
```

`u` does not enter `femaleShare`. UI may show « X non renseigné(s) » when `u > 0`.

**Organizer hint (6.21):** informational strip on Équipe tab; example copy: « Joueurs : 2 F · 4 H » or « Parité : 33 % femmes »; tone info (not warning). Updates on same refresh path as slots.

**Season aggregate (16.3):** expose `{ female, male, femaleShare }` for the season; presentation on Statistiques ligue unless OQ-2 resolves otherwise.

## Privacy

- Wave A: `gender` writable by self only; not listed on public `/membre/:userSlug` header.
- Wave B (2.12b): `gender` on **operational** participant rows (composition, dispos summary, draw candidates) and on **troupe-visible member season glance** (`MemberSeasonGlanceResponseDto`) for gender-aware role pills on profile — not on admin member list API.
- Derived labels and avatars are visible in troupe operational UI (expected).
- Aggregate season stats must not enable inferring an individual's gender beyond what labels already show in grids.

## Implementation surfaces (registry)

Normative label tables and privacy rules stay in this file. For the **per-screen inventory** (labels, avatars, API fields, status, tests), see [member-gender-surfaces.md](../../../docs/v2/technical/member-gender-surfaces.md). Update that registry when adding or changing a gender-aware UI surface.

## Downstream

- **19.11:** optional draw weight factor; requires this enum and **19.6** pipeline; formula in ADR 0019 extension, not here.
