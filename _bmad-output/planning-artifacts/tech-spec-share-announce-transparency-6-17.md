# Spec technique — transparence partage / annonce (6.17+)

**Date :** 2026-06-04  
**Statut :** normatif pour implémentation (complète SPEC § Organizer share and announce, DOMAIN glossaire, UX D10–D12)  
**Prérequis livrés :** stories **6.15** (M3, garde anti-spam), **6.16** (pastilles canal `{ eligible, notified }`), **6.10c** (gear **Relance dispos**)

---

## Décisions produit verrouillées

| ID | Décision | Détail |
|----|----------|--------|
| **D12** | **Deux actions UI distinctes** | Menu gear : **Annoncer** puis **Relance dispos** — volontaire ; même coque modale, intents API distincts. |
| **AUD-1** | Audience **Annoncer** | Roster saison actif (même pool que `AVAILABILITY_OPENED`) — intent dialog `event`. |
| **AUD-2** | Audience **Relance dispos** | Participants avec dispo **`unknown`** uniquement — intent dialog `availability_nudge`. |
| **NOT-1** | Sémantique **notified** | Pastille colorée si log `notification_delivery_log` `SENT` ou `PARTIAL` pour l’intent (ou la famille) mappé — **y compris envois manuels** une fois dispatch réel. |
| **NOT-2** | **Dernière notification** | Exposer `lastNotifiedAt` par canal dans GET share-recipients (ISO-8601 UTC) ; UX peut afficher *« Notifié le … »* (tooltip ou `aria-label`). |
| **GUARD-1** | Anti-spam | Conserver garde **par intent dialog** (`event_manual_share_notify`) + `ConfirmDialog` au clic Notifier (UX D7) ; fenêtre `guardDays` (défaut **3**, `HATCAST_MANUAL_AVAILABILITY_NUDGE_GUARD_DAYS`). |

Références UX : [_ux-design-share-announce-6-15.md_](ux-design-share-announce-6-15.md) (D9, D10, D11, D12).

---

## Écart runtime → cible (2026-06-04)

| Zone | Runtime (6.16) | Cible (cette spec) |
|------|----------------|-------------------|
| POST `event` | Stub — log debug, `notifiedCount=0` | Dispatch réel + logs + pastilles |
| GET `event` · `notified` | Uniquement `AVAILABILITY_OPENED` | `AVAILABILITY_OPENED` **+** `MANUAL_AVAILABILITY_ANNOUNCE` |
| GET `availability_nudge` · `notified` | `MANUAL_AVAILABILITY_NUDGE` | Idem **+** `AVAILABILITY_OPENED` (famille dispos — voir § mapping) |
| Push éligible GET `event` | Toujours `eligible: false` | Même règle que nudge si user push OK catégorie `AVAILABILITY_REQUEST` |
| `lastNotifiedAt` par canal | Absent | Ajout DTO + lookup log |
| draw / composition | Stub POST ; `notified` toujours false | Hors scope **6.17** — story ultérieure Epic 6 / 8 |

---

## Modèle de données (inchangé sauf enum)

### Tables existantes

- **`notification_delivery_log`** — source de vérité « déjà notifié » et date du dernier succès par `(event_id, user_id, channel, intent)`.
- **`event_manual_share_notify`** — anti-spam manuel par `(event_id, intent)` → GET `lastManualNotifyAt`.

Aucune migration obligatoire pour **6.17** si le nouvel intent tient dans la colonne `intent` existante (varchar).

### Nouvel intent notification

Ajouter dans `NotificationIntent` :

```kotlin
MANUAL_AVAILABILITY_ANNOUNCE
```

- **Catégorie membre :** `AVAILABILITY_REQUEST` (même opt-in que ouverture dispos / nudge).
- **Déclencheur :** POST share-recipients/notify avec `intent=event` et message non vide.
- **Audience dispatch :** `recipientResolver.resolveConcernedRosterRecipients(seasonId, eventId)` — aligné sur `AVAILABILITY_OPENED`.
- **Corps message :** `customMessageBody` du POST (comme `MANUAL_AVAILABILITY_NUDGE`).

---

## Contrat API

### GET `/v1/seasons/{seasonId}/events/{eventId}/share-recipients?intent=…`

#### DTO canal (évolution)

```json
{
  "email": {
    "eligible": true,
    "notified": true,
    "lastNotifiedAt": "2026-06-02T14:30:00Z"
  },
  "push": {
    "eligible": true,
    "notified": false,
    "lastNotifiedAt": null
  }
}
```

| Champ | Règle |
|-------|--------|
| `eligible` | Inchangé (6.16). |
| `notified` | `true` si au moins un log mappé `SENT`/`PARTIAL` pour ce `(user_id, channel)`. |
| `lastNotifiedAt` | `max(created_at)` des logs mappés `SENT`/`PARTIAL` pour ce `(user_id, channel)` ; `null` si aucun. |

Champs racine inchangés : `total`, `notifiableCount`, `manualCount`, `recipients`, `lastManualNotifyAt`, `guardDays`.

#### Éligibilité push GET

Pour **`event`** et **`availability_nudge`** :

```text
push.eligible = user_id != null
  AND PushNotificationEligibilityPort.isPushAllowedForCategory(userId, AVAILABILITY_REQUEST)
```

(Aujourd’hui seul `availability_nudge` active push dans `ShareRecipientsService.buildResponse` — **bug à corriger en 6.17**.)

#### Mapping intent dialog → logs pour `notified` / `lastNotifiedAt`

| Intent dialog | Intents `notification_delivery_log` consultés |
|---------------|--------------------------------------------------|
| `event` | `AVAILABILITY_OPENED`, `MANUAL_AVAILABILITY_ANNOUNCE` |
| `availability_nudge` | `AVAILABILITY_OPENED`, `MANUAL_AVAILABILITY_NUDGE`, `MANUAL_AVAILABILITY_ANNOUNCE` |
| `draw` | *(aucun — stub)* |
| `composition` | *(aucun — stub)* |

**Justification famille dispos (nudge) :** sur **Relance dispos**, l’orga doit voir qui a déjà reçu l’ouverture auto ou une annonce manuelle (pastille colorée) même s’il n’a pas répondu — évite de relancer à l’aveugle.

**Justification annonce (`event`) :** inclure `AVAILABILITY_OPENED` pour refléter la publication ; inclure `MANUAL_AVAILABILITY_ANNOUNCE` après Notifier réel.

#### Requête batch

Étendre le lookup 6.16 :

- Charger tous les logs `(event_id, user_id ∈ roster, intent ∈ mappedSet, status ∈ {SENT, PARTIAL})`.
- Construire par `(userId, channel)` : `notified = non vide`, `lastNotifiedAt = max(created_at)`.

Index existants sur `notification_delivery_log` suffisants ; pas de N+1.

---

### POST `/v1/seasons/{seasonId}/events/{eventId}/share-recipients/notify`

Corps : `{ "intent": "…", "messageText": "…" }` (max 500 car.).

| Intent | Comportement cible |
|--------|-------------------|
| `availability_nudge` | **Inchangé** — dispatch `MANUAL_AVAILABILITY_NUDGE`, `notifiedCount = notifiableCount` preview. |
| `event` | Dispatch **`MANUAL_AVAILABILITY_ANNOUNCE`** avec `customMessageBody` ; `notifiedCount = notifiableCount` preview (plus stub 0). |
| `draw`, `composition` | Stub conservé jusqu’à story dédiée ; `notifiedCount = 0`, snack *Demande enregistrée.* |

Toujours :

1. Valider permissions `canManageComposition`.
2. Valider lifecycle intent (6.10b / 6.15).
3. `recordManualNotify(eventId, intent, actorUserId)` → `event_manual_share_notify`.
4. Dispatcher **après** validation (pattern NFR-R2 — échec canal n’annule pas le POST accepté).

#### Payload email / push `MANUAL_AVAILABILITY_ANNOUNCE`

- Sujet email : distinct de l’ouverture auto — ex. reprendre le ton template **Annonce de spectacle** (📢) ; aligner `NotificationPayloadBuilder` sur le template front `share-announce-messages.ts` intent `event`.
- Push : même corps custom que l’email (ou variante courte) — cohérent avec nudge manuel.

---

## Frontend (Angular)

### Fichiers touchés

| Fichier | Changement |
|---------|------------|
| `share-announce-api.service.ts` | Types `lastNotifiedAt?` sur canal ; normalisation. |
| `share-announce-dialog.ts` / `.html` | `channelIconAriaLabel` : inclure date si `lastNotifiedAt` (*« Email — notifié le 2 juin »*). |
| `share-announce-snack.ts` | `event` après dispatch réel → *« {n} notifications envoyées. »* (plus *Demande enregistrée.* si `n > 0`). |

Après POST réussi : **re-fetch GET** ou merge optimiste des pastilles (préférer re-fetch pour `lastNotifiedAt` exact).

### Garde anti-spam

Inchangée côté UX (D7) — messages distincts nudge vs annonce déjà en place dans `guardConfirmMessage()`.

---

## Tests d’acceptation (6.17)

### API (`ShareRecipientsIntegrationTest` + nouveau `ManualAvailabilityAnnounceIntegrationTest`)

1. POST `event` avec roster notifiable → logs `MANUAL_AVAILABILITY_ANNOUNCE` `SENT`/`PARTIAL` ; GET `event` pastilles notified + `lastNotifiedAt` non null.
2. GET `event` après publication seule → notified via `AVAILABILITY_OPENED` uniquement.
3. GET `availability_nudge` → participant auto-notifié à l’ouverture apparaît `notified: true` sur canal touché.
4. POST `event` → `notifiedCount` > 0 quand emails/push partent (mock dispatcher ou Mailpit selon pattern 6.10b).
5. Push `eligible: true` sur GET `event` quand abonnement + prefs OK.

### Web (`share-announce-dialog.spec.ts`, `share-announce-api.service.spec.ts`)

1. Pastille aria-label contient date quand `lastNotifiedAt` fourni.
2. Snack *notifications envoyées* pour `event` quand `notifiedCount > 0`.

---

## Découpage stories PLAN

| ID | Titre | Scope |
|----|-------|--------|
| **6.17** | Dispatch annonce manuelle + transparence dates | Enum `MANUAL_AVAILABILITY_ANNOUNCE` ; POST `event` réel ; GET mapping + `lastNotifiedAt` ; push eligible `event` ; OpenAPI ; tests |
| **6.18** *(backlog)* | Dispatch draw / composition + mapping notified | Intents notification dédiés ; hors 6.17 |
| **6.19** *(optionnel)* | Garde cross-famille dispos | Si PO veut confirm Relance quand Annoncer < 3 j — **non requis** par GUARD-1 |

**6.16** reste en review sans blocage : 6.17 **étend** le DTO canal (champ additionnel compatible).

---

## OpenAPI

Mettre à jour `services/api/openapi/composition.yaml` :

- `ShareRecipientChannelStatus.lastNotifiedAt` (string, format date-time, nullable).
- Documenter mapping intents dans la description de `GET …/share-recipients`.

---

## Non-objectifs 6.17

- FR35 audit ligne par envoi manuel.
- Fusion menu Annoncer / Relance (D12).
- Changement audience relance (reste `unknown`).
- Tooltip Material obligatoire — `aria-label` suffit pour accessibilité MVP.

---

## Checklist implémentation agent

- [ ] `NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE` + `toCategory()` + payload builder + dispatcher recipients
- [ ] `CompositionWorkflowNotificationAdapter.requestManualAnnouncement` branche `event`
- [ ] `ShareRecipientsService` : POST counts, `resolveDeliveryLogIntents`, push eligible event, `lastNotifiedAt` lookup
- [ ] OpenAPI + types TS + normalisation
- [ ] UI aria-label dates ; snack `event`
- [ ] Tests API + web
- [ ] Retirer ou mettre à jour **Known divergence** dans SPEC.md / DOMAIN.md après merge 6.17
