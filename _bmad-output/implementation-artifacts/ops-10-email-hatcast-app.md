---
baseline_commit: 079da9e1648b6e552dac02503e9e8f95215a7699
---

# Story OPS-10 : Courriel `@hatcast.app` (routing + envoi transactionnel)

**Status:** in-progress  
**Story ID:** OPS-10  
**Story key:** `ops-10-email-hatcast-app`  
**Priority:** P1 (V2.0.0 — **recommandé avant M4**, PO 2026-06-05)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave V2.0.0 — Wave F ; ordre de session #3  
**Depends on:** [ops-8-prod-domain-hatcast-app.md](ops-8-prod-domain-hatcast-app.md) (`hatcast.app` sur Cloudflare)  
**Runbook (cible) :** [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §7.6 (à créer à la clôture)  
**Related :** story **8.3** (notifications email) ; [ops-9-posthog-hatcast-app.md](ops-9-posthog-hatcast-app.md)

---

## Story

En tant qu’**opérateur produit**,  
je veux des adresses **`@hatcast.app`** visibles sur le site et dans les emails (sans `@gmail.com` affiché), avec réception dans **Gmail gratuit** et envoi transactionnel **fiable** (notifs, reset MDP),  
afin de **professionnaliser la marque**, **éviter le spam** dû à une mauvaise authentification, et **ne pas souscrire à Google Workspace**.

---

## Décision d’architecture (validée PO)

| Rôle | Technologie | Adresse(s) | Visible publiquement |
|------|-------------|------------|----------------------|
| **Entrant** (support, contact) | **Cloudflare Email Routing** → forward | `info@hatcast.app`, `admin@hatcast.app` (optionnel) | Oui — `@hatcast.app` uniquement |
| **Entrant** `noreply` (réponses utilisateurs) | Email Routing → action **Drop** | `noreply@hatcast.app` | Oui en `From:` sortant ; pas de boîte |
| **Sortant** (API : notifs, auth email) | **Cloudflare Email Sending** (REST) | `noreply@hatcast.app` | `HatCast <noreply@hatcast.app>` |
| **Lecture / réponse humaine** | **Gmail gratuit** (app + web) | Destination : **`impropick@gmail.com`** | **Non** — jamais sur le site |

**Exclusions explicites :**

- **Google Workspace** (payant) — non.
- **Gmail SMTP** (`smtp.gmail.com` + app password) pour l’envoi prod des notifs — non (risque DMARC / mention « via gmail.com »).
- Marketing / newsletters de masse — hors scope.

**Principe :** séparer **identité de marque** (`@hatcast.app`) du **client mail** (Gmail). L’API n’utilise pas le compte Gmail pour envoyer en prod.

---

## Inventaire des adresses

| Adresse | Entrant (Routing) | Sortant (Sending) | Usage |
|---------|-------------------|-------------------|--------|
| `noreply@hatcast.app` | **Drop** | **Oui** — expéditeur API | Notifs, emails auth ; pas de réponses lues |
| `info@hatcast.app` | **Forward** → `impropick@gmail.com` | Non (phase 1) | Contact / support sur le site |
| `admin@hatcast.app` | **Forward** → `impropick@gmail.com` (règle **désactivée** OK jusqu’au besoin) | Non | Ops / admin plateforme (futur) |

**Optionnel (plus tard) :** « Envoyer en tant que » `info@hatcast.app` dans Gmail (Paramètres → Comptes) après vérification par mail forwardé — pour répondre depuis l’app avec le bon `From:`. Non requis pour clôturer OPS-10.

---

## Acceptance criteria

### Ops — Cloudflare & DNS

1. **Given** la zone `hatcast.app` sur Cloudflare, **when** **Email Routing** est activé, **then** les enregistrements MX/TXT routing (MX `route*.mx.cloudflare.net`, SPF racine avec `include:_spf.mx.cloudflare.net`, DKIM `cf2024-1._domainkey`) sont **Locked** dans Routing → Settings. [Source: CF Email Routing]

2. **Given** la destination **`impropick@gmail.com`**, **when** ajoutée dans Email Routing, **then** son statut est **Verified** (lien reçu et cliqué).

3. **Given** les règles custom, **when** configurées, **then** :
   - `noreply@hatcast.app` → action **Drop** ;
   - `info@hatcast.app` → **Send to** `impropick@gmail.com` ;
   - catch-all : **désactivé** en phase 1 (ou **Drop** si activé — documenter le choix dans Dev Agent Record).

4. **Given** **Email Sending** activé sur `hatcast.app`, **when** les enregistrements sending sont vérifiés, **then** SPF/DKIM sending (`cf-bounce`, `cf-bounce._domainkey`) et **DMARC** `_dmarc` existent ; politique DMARC initiale **`p=none`** (surveillance). [Source: CF Email Service]

5. **Given** un mail de test envoyé via l’API prod/staging vers une boîte externe, **when** on inspecte les en-têtes, **then** `From:` est `noreply@hatcast.app`, **SPF et DKIM passent**, **DMARC** au moins aligné (`pass` ou `none` policy) ; **aucune** adresse `@gmail.com` dans `From:` / `Reply-To:` des notifs.

6. **Given** un email envoyé à `info@hatcast.app`, **when** la délivrance est OK, **then** il apparaît dans la boîte **`impropick@gmail.com`** (éventuellement dossier Promotions — normal).

7. **Given** un email envoyé à `noreply@hatcast.app`, **when** Routing est actif, **then** il est **supprimé** (Drop) sans bounce agressif vers l’expéditeur (recette manuelle documentée).

### Application & déploiement

8. **Given** prod/staging avec email activé, **when** une notif ou un reset MDP est déclenché, **then** l’envoi passe par **Cloudflare Email Sending** (pas `JavaMailSender` / `SPRING_MAIL_*` sur Cloud Run).

9. **Given** `HATCAST_NOTIFICATION_EMAIL_FROM`, **when** défini, **then** valeur `HatCast <noreply@hatcast.app>` (sans guillemets dans GitHub Secrets).

10. **Given** les liens dans les emails (reset, deep links), **when** envoyés après bascule, **then** les URLs restent sur **`https://hatcast.app`** et restent valides (OPS-8 : OAuth, domaines Firebase inchangés).

11. **Given** la clôture de la story, **when** un mainteneur lit la doc, **then** `DEPLOY_V2_CLOUD_RUN.md` §**7.6** décrit : routing, sending, secrets GitHub, recette, et renvoie vers ce fichier pour le détail dashboard.

### Qualité

12. **Given** l’implémentation API, **when** les tests existants tournent, **then** les tests unitaires/intégration email restent verts (mock du client Sending ou profil test).

**UI : N/A** — pas de changement sous `apps/web/` pour cette story (adresses affichées sur le site = contenu éditorial futur, hors implémentation obligatoire OPS-10).

**Couverture :** gate mail avant M4 (PLAN) ; parité expéditeur `@hatcast.app` pour story 8.3 en prod.

---

## Marche à suivre — Cloudflare Dashboard (`hatcast.app`)

Exécuter dans l’ordre. Compte Cloudflare = celui qui héberge déjà **OPS-8**.

### Prérequis

- [ ] Domaine **`hatcast.app`** actif dans le compte (Registrar CF).
- [ ] Accès boîte **`impropick@gmail.com`** (vérification CF + recettes).
- [ ] **Pas** d’autres MX entrants sur `@` pointant ailleurs (Google Workspace, OVH, etc.). Si oui : les retirer **avant** d’activer Routing (sinon conflit).

**Navigation générale (UI 2026) :**  
Dashboard → sélectionner **`hatcast.app`** → menu gauche **Email** ou **Compute** → **Email Service** (libellés proches selon version du dashboard).

---

### Phase A — Email Routing (réception)

#### A.1 Activer Email Routing

1. Ouvrir **[Email Routing](https://dash.cloudflare.com/?to=/:account/:zone/email/routing)** pour `hatcast.app`.
2. Si proposé : **Get started** / **Enable Email Routing**.
3. Écran **DNS records** : vérifier l’aperçu (MX vers `*.mx.cloudflare.net`, TXT SPF racine).
4. Cliquer **Add records and enable** (ou équivalent).
5. Aller dans **Settings** (Routing) : chaque enregistrement routing doit être **Locked** / actif.

**Vérification terminal (optionnel) :**

```bash
dig MX hatcast.app +short
dig TXT hatcast.app +short | grep spf
dig TXT cf2024-1._domainkey.hatcast.app +short
```

#### A.2 Vérifier la destination Gmail

1. **Email Routing** → **Destination addresses** (ou **Email addresses** → destinations).
2. **Create** / **Add destination**.
3. Saisir **`impropick@gmail.com`**.
4. Ouvrir Gmail → message Cloudflare **Verify your email address** → cliquer le lien → confirmer dans le dashboard (**Verified**).

#### A.3 Règle `info@hatcast.app`

1. **Routing rules** → **Create address** / **Create rule**.
2. **Custom address** : `info` (domaine `hatcast.app` implicite).
3. **Action** : **Send to an email**.
4. **Destination** : `impropick@gmail.com`.
5. **Save** — statut **Active**.

**Recette :** depuis une autre adresse (perso), envoyer *« test OPS-10 info »* à `info@hatcast.app` → reçu sous 1–2 min dans `impropick@gmail.com`.

#### A.4 Règle `noreply@hatcast.app` (trap)

1. **Create address** : custom `noreply`.
2. **Action** : **Drop** (suppression silencieuse — pas de forward).
3. **Save** — **Active**.

**Recette :** envoyer un mail à `noreply@hatcast.app` → rien dans Gmail ; pas de Non-Delivery Report bloquant côté expéditeur (accepter un délai de quelques minutes).

#### A.5 (Optionnel) `admin@hatcast.app`

Même procédure que A.3 (forward vers `impropick@gmail.com`). Peut rester **Disabled** jusqu’au besoin.

#### A.6 Catch-all

1. Section **Catch-all address**.
2. **Phase 1 recommandée :** laisser **Inactive** (pas de catch-all).
3. Si activé plus tard : préférer **Drop** plutôt que forward (limite le spam sur typos).

#### A.7 SPF existant (si conflit)

Si un TXT SPF existait avant OPS-8/10 :

1. **DNS** → **Records** → un seul TXT SPF sur `@`.
2. Fusionner, par exemple :  
   `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all`  
   (ajouter `include:_spf.google.com` **seulement** si vous envoyez encore via Google pour autre chose — **pas** requis pour Sending CF.)

Ne pas dupliquer deux enregistrements `v=spf1` sur `@`.

---

### Phase B — Email Sending (sortant API)

> Produit : **Email Sending** (bêta publique, sous **Email Service**). Pas de SMTP Spring natif — envoi via **REST API** depuis l’API HatCast.

#### B.1 Activer le domaine d’envoi

1. **Compute** → **Email Service** → **Email Sending** (ou **Sending** → **Settings**).
2. **Add domain** / activer **`hatcast.app`** si absent.
3. Suivre l’assistant DNS : enregistrements sur sous-domaine **`cf-bounce`** (MX, SPF, DKIM `cf-bounce._domainkey`) — souvent **Add records** automatique.
4. Attendre statut **Verified** / **Locked** (5–15 min, parfois plus).

#### B.2 DMARC (recommandé)

1. **DNS** → **Records** → ajouter si absent :

| Type | Name | Content (exemple phase 1) |
|------|------|---------------------------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:impropick@gmail.com` |

Commencer en **`p=none`** ; ne pas passer en `reject` avant plusieurs semaines de surveillance.

#### B.3 Token API Cloudflare (pour Cloud Run)

1. [Profil API tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token**.
2. Permissions minimales : **Email Sending** → **Send** (ou template « Email Sending » si proposé), scope **compte** + zone `hatcast.app` selon l’UI.
3. Copier le token → secret GitHub **`CLOUDFLARE_EMAIL_SENDING_API_TOKEN`** (nom à aligner avec l’implémentation — voir tâches dev).
4. Noter l’**Account ID** Cloudflare (barre latérale droite du dashboard) → secret **`CLOUDFLARE_ACCOUNT_ID`** si pas déjà présent.

**Limites :** compte gratuit / quotas journaliers — vérifier **Email Service** → analytics ; demander augmentation via formulaire CF si besoin (faible volume HatCast attendu).

#### B.4 Test d’envoi sans HatCast (sanity check)

```bash
# Remplacer ACCOUNT_ID et TOKEN ; from doit être une adresse autorisée sur le domaine (ex. noreply@hatcast.app)
curl -sS "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/email/sending/send" \
  --header "Authorization: Bearer <TOKEN>" \
  --header "Content-Type: application/json" \
  --data '{
    "from": "noreply@hatcast.app",
    "to": "impropick@gmail.com",
    "subject": "OPS-10 CF Sending test",
    "text": "Test envoi transactionnel hatcast.app"
  }'
```

Réponse `"success": true` et mail reçu → passer à l’intégration API.

**Recette délivrabilité :** envoyer vers Gmail + un autre fournisseur ; ou utiliser [mail-tester.com](https://www.mail-tester.com) ; vérifier **Authentication-Results**.

---

### Phase C — Gmail (lecture seule, pas d’envoi API)

**À faire une fois** (confort, pas bloquant OPS-10) :

1. Gmail → **Paramètres** → **Comptes et importation** → **Envoyer des e-mails en tant que**.
2. Ajouter **`info@hatcast.app`** ; vérification via mail forwardé (Phase A.3).
3. Ne pas publier `impropick@gmail.com` sur le site — uniquement **`info@hatcast.app`**.

**Ne pas** configurer `noreply@` comme « envoyer en tant que » dans Gmail (l’envoi notif reste côté CF Sending).

---

### Phase D — Secrets & déploiement (après code — voir Tasks)

| Secret GitHub (production, staging) | Valeur |
|-------------------------------------|--------|
| `HATCAST_NOTIFICATION_EMAIL_ENABLED` | `true` |
| `HATCAST_NOTIFICATION_EMAIL_FROM` | `HatCast <noreply@hatcast.app>` |
| `CLOUDFLARE_ACCOUNT_ID` | ID compte CF |
| `CLOUDFLARE_EMAIL_SENDING_API_TOKEN` | Token § B.3 |

**Retirer / ne plus utiliser en prod** pour l’email applicatif : `SPRING_MAIL_HOST`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, etc.

**Local dev :** inchangé — Mailpit via `./scripts/start-dev.sh` + `HATCAST_NOTIFICATION_EMAIL_ENABLED=true` (pas d’appel CF en local sauf choix explicite documenté).

---

## Tasks / Subtasks

### Ops (dashboard — peut commencer avant le code)

- [x] **Phase A** — Routing : enable, destination `impropick@gmail.com`, règles `info` / `noreply` / catch-all (AC 1–3, 6–7)
- [x] **Phase B** — Sending : domaine vérifié, DMARC `p=none`, token API, curl test (AC 4–5)
- [ ] **Phase C** — (Optionnel) Gmail « envoyer en tant que » `info@`
- [x] Capturer captures d’écran ou notes dans **Dev Agent Record** (dates, choix catch-all)

### Dev — API Spring

- [x] **Client Cloudflare Email Sending** (AC 8)
  - [x] Propriétés `hatcast.notification.email.cloudflare.*` : `accountId`, `apiToken` (env), `from` (déjà `hatcast.notification.email.from`)
  - [x] Implémenter envoi HTTP POST vers `https://api.cloudflare.com/client/v4/accounts/{id}/email/sending/send`
  - [x] Refactor [`EmailNotificationSender.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/EmailNotificationSender.kt) : branche CF Sending quand configuré ; conserver `JavaMailSender` pour tests locaux / Mailpit uniquement
- [x] **Workflow deploy** — [`deploy-v2-cloud-run.yml`](../../.github/workflows/deploy-v2-cloud-run.yml) : injecter nouveaux secrets ; garde-fou CF ou SMTP
- [x] **Auth emails** (reset MDP) — **Firebase client** (openapi/auth.yaml) ; pas Spring Mail — AC 10 N/A côté API
- [x] **Tests** (AC 12) — `CloudflareEmailSendingClientTest`, `EmailNotificationSenderTest`

### Docs

- [x] **`DEPLOY_V2_CLOUD_RUN.md` §7.6** — synthèse + lien vers ce fichier (AC 11)
- [x] **`.env.example`** — commenter migration CF Sending vs anciennes lignes Gmail SMTP prod
- [x] **`sprint-status.yaml`** → `review`

### Recette bout en bout (staging puis prod)

- [ ] Reset mot de passe → mail reçu, `From: noreply@hatcast.app`, lien `hatcast.app` OK
- [ ] Notif métier (ex. dispo / composition) → idem
- [ ] `info@` → forward OK
- [ ] `noreply@` inbound → Drop OK
- [ ] Score mail-tester ≥ 8/10 ou équivalent documenté

### Review Findings

- [x] [Review][Patch] CF Sending drops display name « HatCast » — corrigé : `from` envoyé en `{ address, name }` via `parseFromHeader` [CloudflareEmailSendingClient.kt]
- [x] [Review][Defer] RestClient sans timeout explicite — risque de blocage thread notif sur réseau lent [CloudflareEmailSendingClient.kt:18-20] — deferred, pattern RestClient existant, faible volume
- [x] [Review][Defer] Pas de test unitaire du chemin SMTP/Mailpit quand CF indisponible [EmailNotificationSender.kt:97-129] — deferred, chemin dev local secondaire

---

## Dev Notes

### Pourquoi pas Gmail SMTP en prod

| Risque | Gmail perso + `From: @hatcast.app` | CF Email Sending |
|--------|--------------------------------------|------------------|
| Alignement DMARC | Souvent DKIM `google.com` ≠ `hatcast.app` | Alignement documenté par CF |
| Marque | Risque « via gmail.com » | `From` 100 % domaine |
| Ops | App password, quotas compte perso | Token API + quotas compte CF |

### Coexistence Routing + Sending (DNS)

- **Routing** : MX + SPF + DKIM sur **apex** `@`.
- **Sending** : enregistrements sur **`cf-bounce`** (sous-domaine).
- Fusionner SPF apex si plusieurs `include:` — **un seul** TXT `v=spf1` sur `@`.

Réf. : [Email authentication](https://developers.cloudflare.com/email-service/concepts/email-authentication/), [Domain configuration](https://developers.cloudflare.com/email-service/configuration/domains/).

### Fichiers code touchés (estimation)

| Fichier | Changement |
|---------|------------|
| `EmailNotificationSender.kt` | Envoi via CF REST |
| `NotificationEmailProperties` / config | Credentials CF |
| `application.yml` | Profils, désactivation mail local inchangée |
| `deploy-v2-cloud-run.yml` | Secrets |
| Tests sous `services/api/.../notification/` | Mocks |

### Explicit non-goals

- Google Workspace ; boîtes Google `@hatcast.app` natives.
- Site vitrine : texte « Contact : info@… » (story contenu séparée).
- Marketing, newsletters, List-Unsubscribe bulk.
- Migration du domaine legacy `hatcast.com` (V1) — hors scope sauf demande explicite.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| OPS-8 | done | Domaine + zone CF |
| 8.3 | done | Pipeline notif email existant (Mailpit local) |
| 1.3 | done | Reset MDP par email — recette post OPS-10 |

---

## Dev Agent Record

### Agent Model Used

Composer (dev OPS-10)

### Completion Notes List

- Ops A–B validés PO (Routing, Sending, curl, `info@` forward).
- API : `CloudflareEmailSendingClient` (RestClient) prioritaire si `CLOUDFLARE_*` ; fallback `JavaMailSender` (Mailpit local).
- Deploy : secrets `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_EMAIL_SENDING_API_TOKEN` ; warning si email enabled sans CF ni SMTP.
- **À faire opérateur** : ajouter secrets GitHub staging/prod ; déployer ; recette notif sur staging ; retirer `SPRING_MAIL_*` prod si plus utilisés.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/notification/CloudflareEmailSendingProperties.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/CloudflareEmailSendingClient.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/EmailNotificationSender.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationConfiguration.kt`
- `services/api/src/main/resources/application.yml`
- `services/api/src/test/kotlin/com/hatcast/api/notification/CloudflareEmailSendingClientTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/EmailNotificationSenderTest.kt`
- `.github/workflows/deploy-v2-cloud-run.yml`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`
- `.env.example`
- `services/api/README.md`
- `scripts/ops-10-check-mail-dns.sh`

### Recette ops (checklist humaine)

| # | Action | OK |
|---|--------|-----|
| 1 | Routing enabled, DNS Locked | [x] |
| 2 | `impropick@gmail.com` Verified | [x] |
| 3 | `info@` → forward test | [x] |
| 4 | `noreply@` → Drop test | ☐ (optionnel) |
| 5 | Sending domain verified | [x] |
| 6 | DMARC `p=none` publié | [x] |
| 7 | curl CF Sending OK | [x] |
| 8 | Staging API notif + reset MDP | ☐ |
| 9 | Prod idem | ☐ |
| 10 | mail-tester / headers OK | ☐ |

### Session ops 2026-06-05 (phases A–B)

**Baseline DNS (avant ops) :** pas de MX sur `@` ; zone NS Cloudflare (`christian` / `tegan`) ; TXT = `google-site-verification` uniquement — **OK pour activer Routing sans retirer d’anciens MX.**

**Vérification locale :** `./scripts/ops-10-check-mail-dns.sh`

| Étape dashboard | Fait ? |
|-----------------|--------|
| A.1 Enable Email Routing + Add records | [x] Enabled + DNS Configured (capture 2026-06-05) |
| A.2 Destination `impropick@gmail.com` Verified | [x] capture 2026-06-05 |
| A.3 Règle `info@` → forward | [x] recette 2026-06-05 → `impropick@gmail.com` |
| A.4 Règle `noreply@` → Drop | [x] Active (capture 2026-06-05) |
| A.6 Catch-all Inactive | [x] Disabled (capture 2026-06-05) |
| B.1 Email Sending domain verified | [x] partiel — MX/SPF cf-bounce ; confirmer dashboard Locked |
| B.2 DMARC `_dmarc` `p=none` | [x] `p=none; rua=impropick@gmail.com` (DNS UI 2026-06-05) |
| B.3 Token API créé (secret pas en repo) | [x] (curl OK) |
| B.4 curl test OK | [x] API `success:true` + mail reçu 2026-06-05 |

---

## References

- [Enable Email Routing](https://developers.cloudflare.com/email-routing/get-started/enable-email-routing/)
- [Configure rules and addresses](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/) (actions Drop / Forward)
- [Email Sending — REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/)
- [Email authentication (SPF/DKIM/DMARC)](https://developers.cloudflare.com/email-service/concepts/email-authentication/)
- [Gmail sender guidelines](https://support.google.com/a/answer/81126) (exigences côté destinataires)
- Story repo : [8-3-notifications-mep-dispos-et-confirmation-assignes.md](8-3-notifications-mep-dispos-et-confirmation-assignes.md)
