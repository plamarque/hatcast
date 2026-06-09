---
title: HatCast V2 — Templates email notifications
status: approved
date: 2026-06-09
author: Sally (UX)
preview: email-previews/hatcast-email-previews.html
related_story: 8-10-email-notification-templates-shell
related_catalog: docs/v2/technical/NOTIFICATIONS_CATALOG.md
---

# HatCast V2 — Templates email notifications

## Objectif

Moderniser l’enveloppe HTML de **tous** les emails HatCast (notifications membre, alertes orga, transactionnels) sans modifier le ton décontracté du copy métier existant.

**Référence visuelle validée :** [`email-previews/hatcast-email-previews.html`](../../email-previews/hatcast-email-previews.html) (7 exemples statiques).

## Principes

1. **Un email = une carte, un spectacle (si applicable), une action.**
2. **Shell unique** — trois variantes par slots optionnels, pas de layout distinct par intent.
3. **Copy métier inchangé** — le `NotificationEmailBodyBuilder` conserve ses paragraphes ; on ajoute enveloppe + contexte + titres.
4. **Compatibilité clients email** — tables + CSS inline ; largeur max 600 px ; pas de SVG gradient en production (PNG logo hébergé).

## Analyse des références (synthèse)

| Source | Retenu | Écarté |
|--------|--------|--------|
| Outlier | Carte blanche / fond gris, titre H1, CTA pill | Orange hors marque |
| Cloudflare | Barre accent, logo, CTA sous le titre, puces détails | Ton froid |
| Airbnb / Doctolib | Bloc contexte spectacle (titre, date, troupe) | Photo héro, header bleu corporate |
| Neon | Badge glanceable (J-7, rôle) | Jauge dataviz |
| PostHog / Finary | Hiérarchie typo | Layout newsletter / digest multi-sujets |
| Hello Watt | Encadré conversationnel (emoji corps OK) | Graphiques récap |

## Architecture template

### Shell `hatcast-email-shell`

```
fond page (#F5F3F7)
└─ carte (#FFFBFE, radius 12px, max 600px)
   ├─ barre accent gradient violet 4px
   ├─ header marque (logo PNG 36px + « HatCast »)
   ├─ [chip « Alerte organisateur »] — variante C uniquement
   ├─ [icône ✓ cercle vert] — variante B uniquement
   ├─ [bloc contexte spectacle] — si event lié
   ├─ titre H1 (headline)
   ├─ salutation + corps (paragraphes existants)
   ├─ [carte détails secondaire] — proxy, deltas, motif régression
   ├─ CTA bouton (primary ou outline)
   └─ footer (prefs / transactionnel)
```

### Variantes

| Code | Usage | CTA | Chip orga | Icône ✓ |
|------|-------|-----|-----------|---------|
| **A — Action** | Dispo, confirmation, rappel, proxy, changements | Primary violet plein | non | non |
| **B — Bonne nouvelle** | `TEAM_COMPLETE_MEMBER` | Outline violet | non | oui |
| **C — Orga / transactionnel** | Ops orga, `ORGANIZER_SCOPE_GRANTED` | Primary (ou outline si info seule) | oui (sauf transactionnel pur) | non |

### Bloc contexte spectacle

Affiché quand l’intent est lié à un `EventEntity` :

| Champ | Source |
|-------|--------|
| Titre spectacle | `event.title` |
| Date/heure formatée | `NotificationPayloadBuilder.formattedEventDate` |
| Troupe · Saison | `event.season.troupe.name` · `event.season.title` |
| Badge rôle | `RoleLabels` si `roleKey` connu |
| Badge horizon | `J-7` / `J-1` si `NotificationReminderWindow` |

Style : fond `color-mix(primary 8%)`, bordure légère, icône calendrier décorative.

### Carte détails secondaire

Pour contenus structurés déjà produits en HTML :

- `PROXY_AVAILABILITY_RECORDED` — statut, rôles, commentaire
- `EVENT_DETAILS_CHANGED` — lignes delta
- `TEAM_REGRESSED` — motif

Titre section en petites caps grises ; liste à puces.

### Titres H1 (headline)

Reformulation courte de l’objet — **pas** une copie brute du subject SMTP.

| Intent (exemples) | Subject (existant) | Headline proposé |
|-------------------|-------------------|------------------|
| `AVAILABILITY_OPENED` | `Dispo · Gala (15 juin)` | Ta dispo pour le Gala ? |
| `CONFIRMATION_REQUEST` | `Confirme · Gala (15 juin)` | Tu es dans la compo ! |
| `ASSIGNEE_PRESENCE_REMINDER` J-7 | `Rappel · Gala (dans 7 jours)` | C’est dans une semaine |
| `PROXY_AVAILABILITY_RECORDED` | … | Ta dispo a été mise à jour |
| `TEAM_COMPLETE_MEMBER` | … | L’équipe est au complet ! |
| `TEAM_REGRESSED` | … | La compo n’est plus complète |
| `ORGANIZER_SCOPE_GRANTED` | `Tu es désormais …` | Reprendre le subject tel quel |

Mapping complet dans la story d’implémentation.

## Tokens visuels

Alignés thème M3 violet (`apps/web/src/styles.scss`, logo `public/icons/logo-hatcast-2.svg`) :

| Token | Valeur | Usage |
|-------|--------|-------|
| `--hc-primary` | `#6750A4` | CTA, liens footer |
| `--hc-primary-light` | `#A974F0` | Gradient CTA / barre accent |
| `--hc-primary-container` | `#EADDFF` | Badge rôle |
| `--hc-on-primary` | `#FFFFFF` | Texte bouton |
| `--hc-surface` | `#FFFBFE` | Carte |
| `--hc-surface-page` | `#F5F3F7` | Fond page email |
| `--hc-on-surface` | `#1D1B20` | Texte principal |
| `--hc-on-surface-variant` | `#49454F` | Méta, footer |
| `--hc-outline` | `#E7E0EC` | Bordures carte détails |
| `--hc-success-container` | `#E8F5E0` | Cercle ✓ variante B |
| `--hc-orga-chip` | `#F3EDF7` | Fond chip orga |

**Typo email :** `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

**CTA :** min-height 48 px, border-radius 24 px (pill), gradient primary, ombre légère `rgba(103,80,164,0.28)`.

## CTA

Conserver la logique `NotificationEmailHtml.ctaLabel(relativeUrl)` — libellés contextuels existants.

Rendu : `<a>` stylé bouton (pas un lien bleu nu).

Variante B : classe outline (bordure 2 px primary, fond transparent).

## Footer

| Type | Contenu |
|------|---------|
| Notification opt-out | Lien prefs catégorie (existant `standardPreferencesFooter`) + « Envoyé par HatCast pour {troupe} » |
| Transactionnel orga | `organizerScopeGrantedFooter` existant + sign-off « — L’équipe HatCast » |

## Matrice intent → variante

| Groupe | Intents | Variante |
|--------|---------|----------|
| Dispo | `AVAILABILITY_OPENED`, `MANUAL_*`, `AVAILABILITY_PENDING_REMINDER` | A |
| Confirmation | `CONFIRMATION_REQUEST`, `RECONFIRMATION_REQUEST`, `REMOVED_FROM_COMPOSITION` | A |
| Rappel | `ASSIGNEE_PRESENCE_REMINDER` | A |
| Proxy | `PROXY_*` | A + détails |
| Changement | `EVENT_DETAILS_CHANGED`, `EVENT_ARCHIVED` | A |
| Positif membre | `TEAM_COMPLETE_MEMBER` | B |
| Orga ops | `SLA_*`, `COMPOSITION_*`, `TEAM_COMPLETE`, `TEAM_REGRESSED`, `EVENT_DRAFT_CREATED`, `COMPOSITION_SHARED` | C |
| Transactionnel | `ORGANIZER_SCOPE_GRANTED` | C (sans chip orga, sans contexte event) |

## Hors scope v1

- Dark mode email
- Illustrations par intent
- Digest multi-sujets (Finary / Hello Watt)
- Photos spectacle
- Double CTA (oui/non dans l’email)
- Refonte des sujets SMTP ou du copy corps

## Implémentation (point d’accroche)

| Fichier | Rôle |
|---------|------|
| `NotificationEmailHtml.kt` | Shell table-based, tokens inline, `wrap()` étendu |
| `NotificationEmailBodyBuilder.kt` | Fournir `headline`, `eventContext`, `variant`, `detailsCard` |
| `OrganizerScopeGrantedNotificationService.kt` | Adopter le nouveau `wrap()` |
| Tests `NotificationEmailBodyBuilderTest.kt` | Assertions structure shell + intents pilotes |

Logo production : PNG absolu `{publicWebOrigin}/icons/logo-hatcast-email.png` — asset livré story **8.10** (`apps/web/public/icons/logo-hatcast-email.png`, 72×72).

## QA visuelle

1. Ouvrir la preview statique et comparer le rendu Mailpit (2–3 intents).
2. Gmail web + Apple Mail iOS si possible.
3. Viewport 375 px — CTA thumb-friendly ≥ 48 px.
4. Version texte (strip HTML Cloudflare) — lisible, CTA URL présente.

## Liens

- Preview : [`email-previews/hatcast-email-previews.html`](../../email-previews/hatcast-email-previews.html)
- Catalogue runtime : [`docs/v2/technical/NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md)
- Code actuel : `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationEmailHtml.kt`
