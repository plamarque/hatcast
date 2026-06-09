# Story 8.10 : Enveloppe HTML des emails de notification

Status: done

## Story

En tant que **membre ou orga recevant une notification HatCast par email**,  
je veux **un message visuellement clair, moderne et actionnable**,  
afin de **comprendre en un coup d'œil de quoi il s'agit et agir sans friction** (mobile inclus).

## Acceptance Criteria

1. **Given** un intent notification émis par `NotificationDispatcher` ou `OrganizerScopeGrantedNotificationService`, **when** le canal email est activé, **then** le corps HTML utilise le shell documenté dans [`ux-design-email-templates.md`](../planning-artifacts/ux-design-email-templates.md) : barre accent, marque HatCast, carte 600 px max, CTA bouton pill — pas de fragments `<p><a>` nus comme aujourd'hui. [Source: preview `email-previews/hatcast-email-previews.html`]

2. **Given** un intent lié à un spectacle (`EventEntity` disponible), **when** l'email est construit, **then** un **bloc contexte** affiche titre, date formatée, troupe · saison, et badge rôle / horizon si applicable. [Source: ux-design-email-templates § bloc contexte]

3. **Given** les intents `PROXY_AVAILABILITY_RECORDED`, `EVENT_DETAILS_CHANGED`, `TEAM_REGRESSED`, **when** l'email est construit, **then** une **carte détails** structurée (titre section + puces) encapsule le contenu structuré existant. [Source: ux-design-email-templates § carte détails]

4. **Given** `TEAM_COMPLETE_MEMBER`, **when** l'email est construit, **then** variante **B** : icône ✓, CTA outline. [Source: preview exemple 5]

5. **Given** les intents orga ops (`SLA_*`, `COMPOSITION_*`, `TEAM_COMPLETE`, `TEAM_REGRESSED`, `EVENT_DRAFT_CREATED`, `COMPOSITION_SHARED`), **when** l'email est construit, **then** variante **C** avec chip « Alerte organisateur ». [Source: preview exemple 6]

6. **Given** `ORGANIZER_SCOPE_GRANTED`, **when** l'email est construit, **then** variante transactionnelle : pas de bloc spectacle, footer dédié existant, shell commun. [Source: preview exemple 7]

7. **Given** chaque intent, **when** le HTML est généré, **then** un **headline H1** distinct du subject SMTP est présent (mapping documenté en Dev Notes). [Source: ux-design-email-templates § titres H1]

8. **Given** les tests `NotificationEmailBodyBuilderTest` et tests existants payload/dispatcher, **when** `./gradlew :services:api:test` s'exécute, **then** tous passent ; au minimum 4 intents pilotes assertent la présence du shell (accent bar, CTA bouton, footer prefs). [Source: AGENTS.md]

9. **Given** l'envoi via Cloudflare ou SMTP, **when** le HTML est délivré, **then** la version texte dérivée (strip tags) reste lisible avec URL CTA visible. [Source: CloudflareEmailSendingClient]

**Couverture produit :** Epic 8 polish UX email ; FR29–FR31 (canal email) ; pas de changement de déclenchement ni préférences.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` sauf asset logo PNG email (`public/icons/logo-hatcast-email.png`) servi statiquement.

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `apps/web/public/icons/` (PNG logo) + `email-previews/` (référence seulement, pas de modification requise)
- [x] **AC-1, AC-7** — Étendre `NotificationEmailHtml.kt` : `EmailVariant`, `EventEmailContext`, shell table-based + CSS inline, `wrapShell()` signature enrichie, `ctaBlock()` → bouton stylé
- [x] **AC-2, AC-4, AC-5, AC-6** — Adapter `NotificationEmailBodyBuilder.kt` : headline par intent, variante, contexte event, extraction carte détails
- [x] **AC-6** — `OrganizerScopeGrantedNotificationService.kt` : utiliser le nouveau wrap (via `buildOrganizerScopeGrantedHtml`)
- [x] **AC-1** — Ajouter `logo-hatcast-email.png` (export 72px depuis SVG masque) sous `apps/web/public/icons/`
- [x] **AC-8** — Mettre à jour / ajouter tests `NotificationEmailBodyBuilderTest.kt` (+ test unitaire shell si fichier dédié)
- [x] **AC-9** — Vérifier strip texte Cloudflare ; ajuster si besoin (lien CTA en clair dans le HTML)
- [x] **AC-8** — `./gradlew :services:api:test` vert (tests notification ; voir waivers)
- [x] Mettre à jour `docs/v2/technical/NOTIFICATIONS_CATALOG.md` § enveloppe email (1 paragraphe + lien spec UX)

## Dev Notes

### Spec UX (source de vérité visuelle)

- [`_bmad-output/planning-artifacts/ux-design-email-templates.md`](../planning-artifacts/ux-design-email-templates.md)
- Preview statique : [`email-previews/hatcast-email-previews.html`](../../email-previews/hatcast-email-previews.html)

### Fichiers existants à modifier

| Fichier | Action |
|---------|--------|
| `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationEmailHtml.kt` | Shell principal |
| `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationEmailBodyBuilder.kt` | Headlines, variantes, contexte |
| `services/api/src/main/kotlin/com/hatcast/api/notification/OrganizerScopeGrantedNotificationService.kt` | Wrap transactionnel |
| `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationEmailBodyBuilderTest.kt` | Assertions shell |

### Headlines H1 (mapping initial)

| Intent | Headline |
|--------|----------|
| `AVAILABILITY_OPENED` | Ta dispo pour {eventTitle} ? |
| `MANUAL_AVAILABILITY_ANNOUNCE` | Ta dispo pour {eventTitle} ? |
| `MANUAL_AVAILABILITY_NUDGE` | Rappel — ta dispo pour {eventTitle} |
| `AVAILABILITY_PENDING_REMINDER` | Rappel — ta dispo pour {eventTitle} |
| `CONFIRMATION_REQUEST` | Tu es dans la compo ! |
| `RECONFIRMATION_REQUEST` | Reconfirme ta participation |
| `REMOVED_FROM_COMPOSITION` | Tu n'es plus dans la compo |
| `ASSIGNEE_PRESENCE_REMINDER` | C'est dans {7 jours / demain / une semaine} |
| `PROXY_AVAILABILITY_RECORDED` | Ta dispo a été mise à jour |
| `PROXY_CONFIRMATION_RECORDED` | Ta participation a été mise à jour |
| `EVENT_DETAILS_CHANGED` | Infos modifiées pour {eventTitle} |
| `EVENT_ARCHIVED` | Spectacle archivé |
| `TEAM_COMPLETE_MEMBER` | L'équipe est au complet ! |
| `COMPOSITION_SHARED` | Nouvelle compo proposée |
| `EVENT_DRAFT_CREATED` | Nouveau spectacle en brouillon |
| `SLA_OPEN_AVAILABILITY` | Ouvre la collecte des dispos |
| `COMPOSITION_INCOMPLETE_WEEKLY` | Compo encore incomplète |
| `COMPOSITION_INCOMPLETE_DAILY_J7` | J-7 — compo incomplète |
| `TEAM_COMPLETE` | Compo bouclée |
| `TEAM_REGRESSED` | La compo n'est plus complète |
| `ORGANIZER_SCOPE_GRANTED` | = subject existant |

Ajuster si le headline dépasse ~60 caractères — privilégier la clarté.

### Variante par intent

```kotlin
// Pseudo — à implémenter proprement
fun variantFor(intent: NotificationIntent): EmailVariant = when (intent) {
    TEAM_COMPLETE_MEMBER -> GOOD_NEWS
    ORGANIZER_SCOPE_GRANTED -> TRANSACTIONAL
    SLA_OPEN_AVAILABILITY, COMPOSITION_INCOMPLETE_WEEKLY, COMPOSITION_INCOMPLETE_DAILY_J7,
    TEAM_COMPLETE, TEAM_REGRESSED, EVENT_DRAFT_CREATED, COMPOSITION_SHARED -> ORGA_ALERT
    else -> ACTION
}
```

### Contraintes techniques email

- **Tables** pour layout (Gmail, Outlook) — pas de flexbox/grid pour la structure principale
- **CSS inline** sur chaque élément critique
- **Pas de SVG gradient** dans l'email — PNG logo via `NotificationEmailProperties.publicWebOrigin`
- Largeur max **600 px**
- `color-mix()` : fallback hex si nécessaire pour clients anciens (acceptable : fond contexte en `#F3EDF7` fixe)

### Copy corps — NE PAS MODIFIER

Les paragraphes métier dans `NotificationEmailBodyBuilder` restent tels quels sauf si duplication évidente avec le bloc contexte (dans ce cas, alléger légèrement la 1re phrase — optionnel, non bloquant).

### Explicit non-goals

- Refonte sujets SMTP (`buildEmailSubject`)
- Changement push payloads
- Dark mode
- Templates auth (reset password, etc.) — hors périmètre 8.10

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 8.3–8.9 | done | Fournit intents + copy corps |
| ux-design-email-templates | approved | Spec visuelle |

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (Amelia)

### Completion Notes List

- Shell table-based implémenté via `NotificationEmailHtml.wrapShell()` : accent bar, brand header (logo PNG), variantes A/B/C, bloc contexte event, H1 headline, CTA pill (primary/outline), footer prefs/transactionnel.
- `NotificationEmailBodyBuilder` : mapping headline + variante par intent ; cartes détails pour PROXY_AVAILABILITY, EVENT_DETAILS_CHANGED, TEAM_REGRESSED via `detailsCard()` / `detailsUl()`.
- `buildOrganizerScopeGrantedHtml()` migré sur `wrapShell()` (variante TRANSACTIONAL, pas de contexte event).
- Asset `apps/web/public/icons/logo-hatcast-email.png` (72×72, dérivé `icon-48x48.png`).
- Tests shell : 6 intents pilotes dans `NotificationEmailBodyBuilderTest` (accent bar, CTA pill, footer, chip orga, ✓ bonne nouvelle, carte détails).
- **Waiver AC-8 suite complète** : 8 échecs pré-existants hors périmètre 8.10 (`CompositionGapFillIntegrationTest`, `CompositionSlotAssignmentIntegrationTest`, `TroupeMembershipIntegrationTest` ×6) — fichiers déjà modifiés sur branche avant story 8.10.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationEmailHtml.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationEmailBodyBuilder.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationEmailBodyBuilderTest.kt`
- `apps/web/public/icons/logo-hatcast-email.png`
- `docs/v2/technical/NOTIFICATIONS_CATALOG.md` (§ enveloppe HTML)

### Change Log

- 2026-06-09 : Story créée (Sally → Amelia) — spec UX validée par PO
- 2026-06-09 : Implémentation shell email table-based + tests + doc catalogue (Amelia)
- 2026-06-09 : Récupération depuis transcript agent (code jamais commité) + fusion copy 6.24
