# Organizer notification catalog (v2 target)

French UI copy for `/compte/notifications` and push/email payloads. Replaces shipped 8.4 labels where noted.

## Preference rows — Signaux immédiats

| Pref key (API) | Shipped 8.4 label | **v2 label (title)** | **v2 description (subtitle)** | Intent(s) | Audience |
|----------------|-------------------|----------------------|----------------------------------|-----------|----------|
| `ORG_EVENT_DRAFT_CREATED` | Nouveau brouillon | **Nouveau spectacle** | Me prévenir quand un spectacle **en brouillon** est créé (dispos pas encore ouvertes). | `EVENT_DRAFT_CREATED` | Season organizers |
| `ORG_DRAFT_COMPOSITION` | Brouillon partagé | **Compo proposée** | Me prévenir quand une composition est **partagée** avec le cercle orga. | `COMPOSITION_SHARED` | Event organizers |
| `ORG_TEAM_COMPLETE` | Équipe bouclée | **Équipe bouclée** | Me prévenir quand toutes les confirmations sont reçues (lifecycle complet). | `TEAM_COMPLETE` | Event organizers |
| `ORG_TEAM_REGRESSED` *(new)* | Déclin immédiat | **Équipe plus complète** | Me prévenir quand une équipe **confirmée** n’est plus complète (déclin, statut à confirmer, déverrouillage, etc.). | `TEAM_REGRESSED` | Event organizers |

## Preference rows — Rappels planifiés

| Pref key | v2 label | Intent(s) | Audience |
|----------|----------|-----------|----------|
| `ORG_SLA_OPEN_AVAILABILITY` | Ouvrir les dispos | `SLA_OPEN_AVAILABILITY` | Event + season organizers (deduped per tick) |
| `ORG_COMPOSITION_INCOMPLETE` | Compo incomplète | `COMPOSITION_INCOMPLETE_WEEKLY`, `COMPOSITION_INCOMPLETE_DAILY_J7` | Event + season organizers (deduped per tick) |

## Preference row — Promotion (push optional)

| Pref key | v2 label | Intent | Notes |
|----------|----------|--------|-------|
| `ORG_SCOPE_GRANTED` | Nouveau rôle orga | `ORGANIZER_SCOPE_GRANTED` | Transactional **email** on grant is independent of this pref |

## Payload copy (ops tone)

### `EVENT_DRAFT_CREATED`

- Push title: `📝 Nouveau spectacle`
- Body: `« {eventTitle} » a été créé en brouillon ({eventDate}).`
- Email subject: `Nouveau spectacle (brouillon) · {eventTitle} ({eventDate})`

### `COMPOSITION_SHARED`

- Push title: `👥 Compo proposée`
- Body: `Composition proposée pour {eventTitle} le {eventDate}.`
- Email subject: `Compo proposée · {eventTitle} ({eventDate})`

### `TEAM_REGRESSED`

Triggers when `before == COMPLETE && after != COMPLETE` on validated composition — **one dispatch per edge**.

- Push title: `⚠️ Équipe plus complète`
- Body: `{eventTitle} le {eventDate} : l’équipe confirmée n’est plus complète ({reasonSummary}).`
- Email subject: `Équipe plus complète · {eventTitle} ({eventDate})`
- `reasonSummary` examples: `déclin de {name}`, `confirmation à renouveler`, `composition déverrouillée`, `place à pourvoir`

### `TEAM_COMPLETE`

- Align subject with pref title **Équipe bouclée**.

## Triggers for `TEAM_REGRESSED`

| Cause | Lifecycle edge |
|-------|----------------|
| Assignee decline on validated compo | `COMPLETE` → `GAPS_TO_FILL` or `AWAITING_CONFIRMATIONS` |
| Participation reset to `PENDING` | `COMPLETE` → `AWAITING_CONFIRMATIONS` |
| Slot cleared / assignee removed | `COMPLETE` → `GAPS_TO_FILL` (typical) |
| Composition unlock | `COMPLETE` → `DRAFT_COMPOSITION` or `AWAITING_CONFIRMATIONS` |

**Out of scope:** composition never reached `COMPLETE`.

## Retire / migrate

- `ASSIGNEE_DECLINED` → `TEAM_REGRESSED` for orga ops.
- 8.4 cascade resolver → per-intent audiences (`orga-recipient-rules.md`).
- 8.4 `COMPOSITION_SHARED` circle → event organizers only.
- Catalogue D5:B superseded.
