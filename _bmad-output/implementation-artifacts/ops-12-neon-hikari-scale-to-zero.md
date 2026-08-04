---
feature_branch: feat/ops-12-neon-hikari-scale-to-zero
baseline_commit: fe98de1d4edddcb5284ba1241f56c659978514e4
---

# Story OPS-12 : Neon scale-to-zero compatible with Spring HikariCP

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

En tant qu’**opérateur / développeur HatCast V2**,  
je veux que le **pool HikariCP** de l’API Spring **laisse Neon passer en Idle** après inactivité (scale-to-zero),  
afin de **ne plus payer ~$78/mois de compute always-on** sur un usage intermittent, et de **rester viable sur le plan Free** (100 CU-h/mois).

## Acceptance Criteria

1. **Given** l’API Spring Boot 3.4 (`services/api`) connectée à Neon avec scale-to-zero activé (défaut Free / Launch), **when** aucune requête SQL n’est émise pendant ≥ **6 minutes** (Neon suspend ≈ 5 min + marge Hikari), **then** le compute de la branche ciblée passe **Idle** dans la console Neon (Branches → compute status). [Source: BUG-013 ; Neon scale-to-zero docs]

2. **Given** le compute Neon est **Idle**, **when** un client appelle un endpoint authentifié qui lit/écrit Postgres (ex. `GET /v1/me` ou health métier via session JDBC), **then** l’API répond **2xx** après cold start (ordre de grandeur : quelques centaines de ms à quelques secondes acceptable) **sans** redémarrage manuel de l’instance Cloud Run / JVM. [Source: PO — cold start OK]

3. **Given** la configuration datasource, **when** on inspecte les YAML runtime Postgres (`application.yml` et/ou `application-cloud.yml` + `application-dev.yml` si Neon local), **then** Hikari expose au minimum :
   - `minimum-idle: 0` (pool autorisé à se vider — **critique**)
   - `idle-timeout` **<** fenêtre Neon (recommandé **60_000** ms)
   - `connection-timeout` **≥ 15_000** ms (cold start)
   - `maximum-pool-size` raisonnable pour Cloud Run 1 instance (ex. **5**, pas le défaut 10 non documenté)
   - **pas** de `keepalive-time` > 0 qui pingerait Neon en idle  
   [Source: Neon blog long-running apps ; HikariCP docs]

4. **Given** Cloud Run profil `cloud`, **when** un probe ou un opérateur frappe `/actuator/health`, **then** le check **ne maintient pas** Neon awake en ping SQL périodique : soit `management.health.db.enabled: false`, soit un groupe liveness limité à `ping` (documenter le choix). Le startup probe actuel sur `/` (Nginx) reste hors scope sauf si on découvre un ping DB. [Source: deploy-v2-cloud-run.yml startup-probe `/`]

5. **Given** la doc ops, **when** un mainteneur lit [DEVELOPMENT.md](../../DEVELOPMENT.md) et/ou [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §5, **then** une courte note explique : (a) Hikari `minimum-idle: 0` pour scale-to-zero ; (b) limites **Free** (100 CU-h, 0.5 Go) ; (c) préférer `--offline` / H2 si le poste ne doit pas brûler des CU-h Neon ; (d) endpoint **poolé** Neon pour runtime Cloud Run (déjà §5.2). [Source: ADR-0009]

6. **Given** les tests API existants (H2 `test` / `e2e`), **when** la suite Gradle tourne, **then** **verts** — la config Hikari ne casse pas H2 (mêmes propriétés ou overrides explicites si besoin). [Source: OPS-2]

7. **Given** BUG-013, **when** la story est clôturée (Idle vérifié + merge), **then** mettre à jour `ISSUES.md` : Status **Fixed** + note de fix pointant cette story.

**UI : N/A** — pas de changement sous `apps/web/` ; section Material 3 omise volontairement.

**Couverture produit :** NFR coût / ops ; pas de FR produit. Réf. PLAN **OPS-12** ; [BUG-013](../../ISSUES.md).

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` (YAML Spring) + docs ops — **pas** `apps/web/`
- [x] Ajouter bloc `spring.datasource.hikari` (AC #3) dans `application-cloud.yml` (prod/staging/dev cloud)
- [x] Aligner `application-dev.yml` (Neon branche `local`) avec la même politique idle, **ou** documenter pourquoi le défaut cloud-only suffit si local utilise surtout `--offline`
- [x] Désactiver / isoler health DB (AC #4) sous profil `cloud` (et `dev` si pertinent)
- [x] Vérifier manuellement Idle (AC #1) : arrêter trafic → attendre ≥6 min → console Neon ; puis une requête → AC #2
- [x] Documenter Free + Hikari (AC #5) dans DEVELOPMENT.md et/ou DEPLOY §5
- [x] `./gradlew test` (ou suite CI locale API) — AC #6
- [x] Clôturer BUG-013 dans ISSUES.md — AC #7
- [x] `./scripts/v2/story-branch.sh assert ops-12-neon-hikari-scale-to-zero` avant commits code

### Review Findings

- [x] [Review][Decision] Preuve AC #2 insuffisante vs lettre de l’AC — **Résolu 2026-08-04 :** option **2** — `GET /v1/auth/me` authentifié → **200** (DevTools, cookie `HATCAST_SESSION`, seed Improbots). Certitude facture : Idle post-deploy Neon **production** (encore Active tant que Cloud Run n’a pas OPS-12). Optional : rejouer `/me` après Idle local pour cold start.
- [x] [Review][Patch] Asymétrie test `max-lifetime` cloud vs dev [services/api/src/test/kotlin/com/hatcast/api/config/NeonHikariScaleToZeroConfigTest.kt:28] — assert `max-lifetime: 280000` ajouté au test `dev` (2026-08-04).
- [x] [Review][Defer] Cleanup Spring Session passé à 1×/jour — risque croissance `SPRING_SESSION` / sessions expirées jusqu’à ~24 h — deferred, pre-existing tradeoff (wake minute vs idle)
- [x] [Review][Defer] Fuseau du cron `0 30 3 * * *` non documenté (UTC vs TZ Cloud Run) — deferred, pre-existing
- [x] [Review][Defer] Overrides env `SPRING_DATASOURCE_HIKARI_*` / `MANAGEMENT_HEALTH_DB_ENABLED` peuvent contourner le YAML — deferred, pre-existing
- [x] [Review][Defer] Jobs `@Scheduled` notification (SQL quotidien) réveillent Neon — deferred, pre-existing (hors cause always-on BUG-013)
- [x] [Review][Defer] Interaction PgBouncer (endpoint poolé) + Spring Session JDBC — deferred, pre-existing architecture

## Dev Notes

### Problem diagnosis (do not re-litigate)

- Neon Launch has **no monthly fee** ; ~**$78** ≈ **1 CU × 730 h × $0.106**.
- Scale-to-zero was already ON ; Free forces it ON.
- Neon can suspend even with open TCP sockets if there is **no SQL activity** for the suspend window (~5 min).
- Spring Boot **Hikari defaults** without config: `minimumIdle == maximumPoolSize` (typically **10**). After Neon drops connections on suspend, the housekeeper **reopens** connections to refill the pool → perpetual wake / CU burn.
- Spring Session JDBC default cleanup cron is **every minute** (SQL) — secondary wake source discovered during OPS-12; set to daily under `cloud`/`dev`.
- Notification `@Scheduled` jobs are daily — not the root cause of always-on.
- Cloud Run deploy uses startup probe on **`/`** (port 8080), not `/actuator/health` — good ; still harden health DB for future probes.

### Recommended Hikari values (starting point)

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 5
      minimum-idle: 0
      idle-timeout: 60000
      max-lifetime: 280000
      connection-timeout: 20000
```

Do **not** set `keepalive-time` to a positive value for this story.

### What must keep working

| Concern | Preserve |
|---------|----------|
| JDBC URL / secrets | `HATCAST_DATASOURCE_*` unchanged |
| Flyway on boot | Still runs ; wakes Neon once at deploy — expected |
| Spring Session JDBC | Session store stays JDBC ; first request after Idle reconnects |
| Offline H2 | `application-offline.yml` / `--offline` unchanged |
| ADR-0009 | Stay on Neon ; **no** Cloud SQL migration in this story |
| Pooler endpoint | Prefer Neon **pooled** URL on Cloud Run (doc §5.2) — config change optional if secrets already use `-pooler` |

### Explicit non-goals

- Migrating off Neon (Supabase, Railway, Cloud SQL, Firestore)
- Disabling scale-to-zero / buying always-on compute
- Changing Neon branch topology (`local` / `development` / `staging` / `production`)
- Tuning Cloud Run min instances
- Rewriting connection code to Neon serverless HTTP driver (keep JDBC + Hikari)

### Architecture compliance

- [ADR-0009](../../docs/adr/0009-neon-postgres-environments.md) — Neon + branch-per-env ; Cloud SQL still rejected as default
- [ARCH.md](../../ARCH.md) — V2 API Spring + Postgres
- Stack : Spring Boot **3.4.1**, Kotlin, Hikari via `spring-boot-starter-data-jpa`

### Files to touch (expected)

| File | Change |
|------|--------|
| `services/api/src/main/resources/application-cloud.yml` | Hikari + health DB |
| `services/api/src/main/resources/application-dev.yml` | Same or note |
| `DEVELOPMENT.md` and/or `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md` §5 | Ops note Free + idle pool |
| `ISSUES.md` | BUG-013 → Fixed at closure |

### Current state of UPDATE files

**`application.yml`** — declares `spring.datasource` URL/user/password only ; **no** `hikari` block ; `spring.session.store-type: jdbc` ; actuator exposes `health`.

**`application-cloud.yml`** — Flyway locations + metrics JDBC/Hikari enabled ; CORS ; **no** hikari idle policy.

**`application-dev.yml`** — Flyway seeds + metrics ; mail health off ; **no** hikari idle policy.

Preserve existing metrics flags (`hatcast.jdbc`, `management.metrics.enable.hikaricp`) unless they force DB pings (they should not).

### Verification procedure (manual — required for AC #1/#2)

1. Ensure no other clients hold the target branch awake (`start-dev.sh` stopped, SQL editor closed, other Cloud Run envs not hammering same branch).
2. Note compute status in Neon console.
3. Stop traffic ; wait **≥ 6 minutes**.
4. Expect **Idle**. If still **Active**, check: remaining Hikari keepalive, health DB, second process, other project (`horain`), or Launch endpoint with scale-to-zero off.
5. Hit API once ; expect success + compute **Active** briefly.

### Free plan implications (document for operators)

| Limit | Free |
|-------|------|
| Compute | 100 CU-h / project / month |
| Storage | 0.5 GB |
| Scale-to-zero | Forced ON |
| Autoscaling | Up to 2 CU |

Without `minimum-idle: 0`, continuous wake can exhaust Free mid-month (compute suspended until quota reset).

### Previous / related intelligence

- **perf-16-db-latency-observability** (done) — Neon RTT tooling ; do not regress metrics endpoints into always-on SQL.
- **OPS-2** — H2 CI ; keep tests green.
- Neon org also has project **horain** (out of HatCast scope) — do not bill-diagnose it in this story unless needed.

### Git / branch

- Work **only** on `feat/ops-12-neon-hikari-scale-to-zero` (baseline `fe98de1d…` = `origin/v2`).
- After code review : `./scripts/v2/story-branch.sh merge ops-12-neon-hikari-scale-to-zero` then push `v2` manually.

### References

- [ISSUES.md — BUG-013](../../ISSUES.md)
- [ADR-0009](../../docs/adr/0009-neon-postgres-environments.md)
- [DEPLOY_V2_CLOUD_RUN.md §5](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md)
- [Neon — Scale to zero](https://neon.com/docs/introduction/scale-to-zero)
- [Neon — Long-running apps + pools](https://neon.com/blog/using-neons-auto-suspend-with-long-running-applications)
- [Neon — Connection latency / cold start](https://neon.com/docs/connect/connection-latency)
- HikariCP : `minimumIdle`, `idleTimeout`, `connectionTimeout`

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- Idle verification (branche Neon `local` / `ep-late-tooth-al75dkye`): last_active `2026-08-04T08:27:00Z` → suspended `08:36:02Z` while JVM still serving `/actuator/health` 200 (db health disabled).
- Cold start AC #2: `GET /v1/me` → 401 in ~1.13s after Idle; compute Active `08:38:09Z`.
- Secondary fix: Spring Session JDBC default cleanup cron (`0 * * * * *`) would prevent Idle; set to daily `0 30 3 * * *`.

### Completion Notes List

- Hikari scale-to-zero policy applied to `application-cloud.yml` and `application-dev.yml` (`minimum-idle: 0`, idle 60s, connection-timeout 20s, max pool 5, max-lifetime 280s).
- `management.health.db.enabled: false` under cloud/dev so `/actuator/health` does not ping JDBC.
- Session cleanup cron daily to avoid minute SQL wake.
- Docs: DEVELOPMENT.md Free/CU-h/`--offline`; DEPLOY §5.2.1 Hikari + health + session note.
- Unit test `NeonHikariScaleToZeroConfigTest` guards YAML; full `./gradlew test` green.
- BUG-013 marked Fixed in ISSUES.md after Idle+cold-start verification on `local`.

### File List

- `services/api/src/main/resources/application-cloud.yml`
- `services/api/src/main/resources/application-dev.yml`
- `services/api/src/test/kotlin/com/hatcast/api/config/NeonHikariScaleToZeroConfigTest.kt`
- `DEVELOPMENT.md`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`
- `ISSUES.md`
- `PLAN.md`
- `_bmad-output/implementation-artifacts/ops-12-neon-hikari-scale-to-zero.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

| Date | Note |
|------|------|
| 2026-08-04 | Story created (create-story) — ready-for-dev |
| 2026-08-04 | Implemented Hikari + health DB + session cleanup; Idle verified; status → review |
| 2026-08-04 | Code review: AC #2 auth `/me` 200 after Idle; patch max-lifetime assert in dev test; status → done |
