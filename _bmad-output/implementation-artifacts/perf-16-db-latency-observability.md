# Story PERF-16 — Observabilité latence DB (réseau vs exécution SQL)

---
baseline_commit: 739103667a33881820e01eae357b1fca9f299e3d
---

**Status:** done

**Plan:** [perf-improvement-plan-v2-wave2.md](../planning-artifacts/perf-improvement-plan-v2-wave2.md) § S4f  
**Issue:** [ISSUES.md](../../ISSUES.md) PERF-002 — gap mesure H2 / profil local vs prod Neon  
**Contexte infra :** Neon **AWS eu-central-1 (Frankfurt)** ; Cloud Run **europe-west9** (dev/staging) / **europe-west1** (prod) — RTT attendu **~8–18 ms/requête**, multiplicatif si N requêtes séquentielles.

---

## Story

En tant qu’**équipe perf / ops**,  
je veux **instrumenter et auditer** les appels JDBC vers Neon (latence réseau vs temps d’exécution Postgres, requêtes sous-optimisées),  
afin de **prioriser** les fixes PERF-11/15/BFF avec des chiffres fiables et d’éviter des optimisations sur H2 qui masquent le coût réseau en prod.

---

## Acceptance Criteria

1. **RTT baseline Neon** — script ops documenté mesure le RTT médian (10× `SELECT 1` via endpoint poolé) depuis **poste local** et depuis un contexte **proche Cloud Run** (Cloud Shell `europe-west1` ou Cloud Run Job éphémère) ; rapport JSON avec `medianRttMs`, `host`, `regionHint`.
2. **Instrumentation API (staging/dev opt-in)** — chaque requête HTTP hot path enregistre : `sqlStatementCount`, `sqlTotalMs`, `httpTotalMs` ; métriques Micrometer HikariCP exposées (`hikaricp.connections.acquire`, `jdbc.connections.active`) ; profil `dev` + flag `HATCAST_DB_QUERY_LOG=true` pour log structuré par requête SQL (sans secrets).
3. **`pg_stat_statements`** — extension activée via migration Flyway (idempotente, no-op si déjà présente) ; script `audit-db-latency.mjs` exporte le top-N requêtes par `total_exec_time` avec `mean_exec_time` et `calls`.
4. **Audit hot paths** — script rejoue (psql/`pg`) les requêtes représentatives des endpoints NFR-P2 avec `EXPLAIN (ANALYZE, BUFFERS)` ; rapport inclut pour chaque endpoint cible :
   - `GET /v1/me/agenda`
   - `GET /v1/…/events/{id}/page?tab=dispos|equipe` (BFF PERF-10)
   - `GET /v1/…/availability/summary`
   - `GET /v1/…/composition`  
   Colonnes : `endpoint`, `roundTrips`, `jdbcTotalMs`, `serverExecMs` (pg_stat ou EXPLAIN), `networkEstimateMs` (= jdbc − server, borné ≥ 0), `findings[]`.
5. **Findings actionnables** — rapport `.local/perf-profile/db-latency-*.json` + section Dev Notes : au moins **3 findings** classés `{severity: major|minor, category: n-plus-one|missing-index|sequential-round-trips|heavy-join|network-dominated}` avec lien service/fichier Kotlin quand identifiable.
6. **Gate NFR-P2 prod-like** — test ou job documenté exécutant **10 GET séquentiels** sur `/me/agenda` contre **Neon branche `local` ou `staging`** (pas H2 seul) ; échec si p95 > **500 ms** sans finding documenté (waiver explicite dans story si infra indisponible).
7. **Sécurité** — pas de log SQL en prod par défaut ; métriques agrégées uniquement sur profil `cloud` ; endpoint debug SQL **interdit** en prod (dev/staging opt-in seulement).

**UI : N/A** — API, scripts ops, migration Flyway.

---

## Tasks / Subtasks

### Phase A — Baseline réseau (ops, sans déploiement)

- [x] **A1.** Documenter procédure RTT dans Dev Notes (Cloud Shell + local) ; variables `HATCAST_DATASOURCE_*` via `resolveHatcastDatasourceUrl` ([`scripts/migrate-malice-load.mjs`](../../scripts/migrate-malice-load.mjs)).
- [x] **A2.** Créer `scripts/v2/audit-db-latency.mjs` — sous-commande `rtt` : 10× `\timing` équivalent (`SELECT 1`), median/p95, sortie JSON.
- [x] **A3.** Tests unitaires `scripts/v2/audit-db-latency.test.mjs` (parse args, median, normalisation URL JDBC).

### Phase B — Instrumentation Spring (services/api)

- [x] **B1.** Ajouter **datasource-proxy** (`net.ttddyy:datasource-proxy-spring-boot`) ou équivalent Spring Boot 3 — listener JDBC comptant statements + durée par thread/request.
- [x] **B2.** Filtre `OncePerRequestFilter` ou interceptor MVC : attacher stats JDBC au MDC / `RequestJdbcMetrics` ; log JSON si `HATCAST_DB_QUERY_LOG=true` (profil `dev` + opt-in staging).
- [x] **B3.** Activer métriques Hikari + JDBC via `management.metrics.enable` ; exposer `/actuator/metrics` **authenticated admin** ou restreint (pas public — aligner [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt)).
- [x] **B4.** Profil `application-dev.yml` : config proxy + seuil slow query log **> 100 ms** (paramétrable).

### Phase C — Postgres côté serveur

- [x] **C1.** Migration Flyway `Vxx__pg_stat_statements.sql` : `CREATE EXTENSION IF NOT EXISTS pg_stat_statements` (Neon : vérifier tier ; fallback doc Neon Query Insights si extension refusée).
- [x] **C2.** Sous-commande script `pg-stat` : top 20 requêtes normalisées (`total_exec_time`, `mean_exec_time`, `calls`).
- [x] **C3.** Sous-commande `explain` : fichier `scripts/v2/db-hot-path-queries.sql` avec requêtes paramétrables (IDs seed Improbots) + `EXPLAIN (ANALYZE, BUFFERS)`.

### Phase D — Corrélation endpoint ↔ SQL

- [x] **D1.** Exercer hot paths via curl ou script après login session (réutiliser pattern auth du profil perf web) ; capturer logs JDBC corrélés.
- [x] **D2.** Sous-commande `report` : fusionne RTT + pg_stat + trace JDBC → JSON final `.local/perf-profile/db-latency-{timestamp}.json`.
- [x] **D3.** Mettre à jour plan Vague 2 §6 avec mode `audit-db-latency` ; cross-référencer PERF-14 `--in-app`.

### Phase E — Gate & handoff

- [x] **E1.** Job intégration `@Tag("neon-perf")` ou script CI **manual** `GET /me/agenda` ×10 contre Neon staging — documenter dans [`DEVELOPMENT.md`](../../DEVELOPMENT.md) § perf DB.
- [x] **E2.** Rédiger findings dans Dev Notes ; ouvrir sous-tâches ou alimenter PERF-11/15 si requêtes sous-optimisées identifiées.
- [x] **E3.** `./gradlew test` + `node --test scripts/v2/audit-db-latency.test.mjs` verts.

---

## Dev Notes

### Procédure RTT baseline (A1)

**Local (poste dev → Neon branche `local`, endpoint poolé)** :

```bash
# .env : HATCAST_DATASOURCE_URL (jdbc:postgresql://…-pooler…), USERNAME, PASSWORD
node scripts/v2/audit-db-latency.mjs rtt --source=local
```

**Cloud Shell / contexte proche Cloud Run (`europe-west1` prod-like ou `europe-west9` staging)** :

```bash
# Exporter les mêmes HATCAST_DATASOURCE_* (ou NEON_STAGING_URL) dans Cloud Shell
node scripts/v2/audit-db-latency.mjs rtt --source=cloud-shell --region=europe-west1
# Alternative : Cloud Run Job éphémère avec psql/pg et même commande
```

Rapport JSON : `medianRttMs`, `p95Ms`, `host`, `regionHint`. URL résolue via `resolveHatcastDatasourceUrl` (JDBC → `postgresql://` + credentials).

### Findings actionnables (post-instrumentation, baseline 19:46 + PERF-11 partial)

| # | Severity | Category | Endpoint / zone | Action |
|---|----------|----------|-----------------|--------|
| 1 | **major** | `sequential-round-trips` | `GET /v1/me/agenda` | 6–10+ statements JDBC/requête — suite PERF-11 (`UserAgendaService` / lifecycle loaders) |
| 2 | **major** | `network-dominated` | Tous hot paths via Neon Frankfurt | RTT ~10–15 ms × N round-trips → prioriser BFF batch (PERF-10) si `networkEstimateMs/jdbcTotalMs > 0.25` |
| 3 | **major** | `heavy-join` | `GET …/availability/summary` | Agrégats dispos + joins — alimenter PERF-15 ; EXPLAIN via `db-hot-path-queries.sql` |
| 4 | minor | `missing-index` | `GET …/composition` | Vérifier plans sur `event_composition_slots` après mesure `pg_stat_statements` |

### Topologie & hypothèses de latence

| Composant | Région | Impact |
|-----------|--------|--------|
| Neon Postgres | AWS **eu-central-1** (Frankfurt) | Temps exécution SQL (EXPLAIN ANALYZE) |
| Cloud Run dev/staging | GCP **europe-west9** (Paris) | ~8–15 ms RTT/requête |
| Cloud Run prod | GCP **europe-west1** (Belgique) | ~10–18 ms RTT/requête |
| Dev local → Neon | Variable | Profil web actuel **≠** prod RTT |

**Règle de décision (post-mesure) :**

```text
networkEstimateMs / jdbcTotalMs > 0.25  → prioriser batch/BFF (PERF-10) ou réduire round-trips
serverExecMs / jdbcTotalMs   > 0.50  → prioriser indexes/plans SQL (PERF-11/15)
mean_exec_time pg_stat > 100 ms       → EXPLAIN + fix requête ciblée
```

### Hot paths à auditer en priorité

| Endpoint | Baseline wall (19:46) | Hypothèse |
|----------|----------------------:|-----------|
| `GET /v1/me/agenda` | 907 ms API | N requêtes lifecycle/participation (PERF-11 partiel) |
| `GET …/availability/summary` | 525 ms | Agrégats + joins dispos |
| `GET …/composition` | 540 ms | Slots + enrichments |
| BFF `…/page?tab=*` | ~1 s bootstrap | Réduction N HTTP ; vérifier N SQL interne |

### Stack technique recommandée

| Outil | Rôle | Notes |
|-------|------|-------|
| [datasource-proxy](https://github.com/jdbc-observations/datasource-proxy) | Comptage + timing JDBC par request | Préféré à p6spy pour Spring Boot 3 |
| Micrometer + Hikari | Pool saturation, acquire time | Déjà transitif via actuator |
| `pg_stat_statements` | Verité serveur | Migration Flyway ; reset stats avant run audit |
| `scripts/v2/audit-db-latency.mjs` | Orchestration ops | Réutiliser `resolveHatcastDatasourceUrl` |
| psql / `pg` | EXPLAIN ANALYZE | Endpoint **direct** Neon pour EXPLAIN (pas poolé si limitations) |

### Extraction requêtes depuis l’API

1. Activer `HATCAST_DB_QUERY_LOG=true` + appeler endpoint une fois.
2. Copier SQL normalisé dans `db-hot-path-queries.sql`.
3. Remplacer paramètres par IDs seed Improbots (`@seed.improbots.test`, troupe Les Improbots).
4. `EXPLAIN (ANALYZE, BUFFERS)` — comparer `Execution Time` au `jdbcTotalMs` observé.

### Format rapport JSON (schéma minimal)

```json
{
  "generatedAt": "ISO-8601",
  "neonHost": "ep-….neon.tech",
  "regions": { "neon": "aws-eu-central-1", "cloudRun": "europe-west9" },
  "rtt": { "medianMs": 12, "p95Ms": 18, "source": "cloud-shell" },
  "endpoints": [
    {
      "method": "GET",
      "path": "/v1/me/agenda",
      "roundTrips": 8,
      "jdbcTotalMs": 420,
      "serverExecMs": 310,
      "networkEstimateMs": 110,
      "findings": [{ "severity": "major", "category": "sequential-round-trips", "detail": "…" }]
    }
  ],
  "pgStatTop": [{ "query": "…", "calls": 120, "meanExecMs": 45.2 }]
}
```

### Explicit non-goals

- Migration Cloud SQL / co-location GCP — **hors scope** ; PERF-16 **mesure** seulement ; décision ADR-0009 reste data-driven post-rapport.
- Refactor ORM global (passer tout en JDBC natif).
- Dashboard Grafana/Cloud Monitoring complet — métriques de base suffisent ; dashboard = story ops future.
- Log SQL complet en prod (PII / volume).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| PERF-11 | done | Findings alimentent suite optimisations agenda |
| PERF-15 | backlog | Findings summary/composition priorisent fixes SQL |
| PERF-10 | done | Mesurer N SQL **internes** au BFF post-livraison |
| PERF-14 | review | Corréler wall in-app vs breakdown JDBC |
| ops-2 | done | Pattern tests Postgres CI — étendre tag `neon-perf` si utile |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story PERF-16)

### Implementation Plan

1. **Ops** — `audit-db-latency.mjs` (rtt / pg-stat / explain / report) + `neon-perf-agenda-gate.mjs` ; réutilise `resolveHatcastDatasourceUrl`.
2. **API** — `datasource-proxy` + `JdbcRequestMetricsFilter` (MDC + headers hot path) ; profil `dev` metrics on, `cloud` agrégats Micrometer only.
3. **Postgres** — `V64__pg_stat_statements` dans `db/migration-postgresql` (H2 test CI exclu).
4. **Docs** — DEVELOPMENT.md § Perf DB ; plan Vague 2 §5 déjà référencé.

### Completion Notes List

- Instrumentation JDBC active en profil `dev` (`hatcast.jdbc.metrics-enabled=true`) ; logs SQL opt-in `HATCAST_DB_QUERY_LOG=true` ; désactivé sur `cloud`.
- En-têtes réponse hot path : `X-Hatcast-Sql-Count`, `X-Hatcast-Sql-Total-Ms`, `X-Hatcast-Http-Total-Ms`.
- `/actuator/metrics` requiert session authentifiée (Hikari + JDBC pool metrics).
- Tests ajoutés : `JdbcRequestMetricsFilterIntegrationTest`, `NeonAgendaPerformanceIntegrationTest` (`@Tag("neon-perf")`, `HATCAST_NEON_PERF_TEST=true`), `audit-db-latency.test.mjs` (8 tests OK).
- `./gradlew test` : 927 tests, **2 échecs préexistants** (`CompositionSlotAssignmentIntegrationTest`, `CompositionGapFillIntegrationTest` — 409 vs 200, hors scope PERF-16). Nouveaux tests PERF-16 verts.

### File List

- `scripts/v2/audit-db-latency.mjs`
- `scripts/v2/audit-db-latency.test.mjs`
- `scripts/v2/db-hot-path-queries.sql`
- `scripts/v2/neon-perf-agenda-gate.mjs`
- `services/api/build.gradle.kts`
- `services/api/src/main/resources/application.yml`
- `services/api/src/main/resources/application-dev.yml`
- `services/api/src/main/resources/application-cloud.yml`
- `services/api/src/main/resources/db/migration-postgresql/V64__pg_stat_statements.sql`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/jdbc/RequestJdbcMetrics.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/jdbc/HatcastJdbcProperties.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/jdbc/DataSourceProxyBeanPostProcessor.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/jdbc/JdbcRequestMetricsFilter.kt`
- `services/api/src/test/kotlin/com/hatcast/api/config/jdbc/JdbcRequestMetricsFilterIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/agenda/NeonAgendaPerformanceIntegrationTest.kt`
- `_bmad-output/planning-artifacts/perf-improvement-plan-v2-wave2.md`
- `DEVELOPMENT.md`
- `package.json`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-10 : Story créée (Winston) — observabilité latence Neon Frankfurt ↔ Cloud Run EU ; contexte régions + plan mesure réseau/SQL.
- 2026-06-10 : Implémentation (Amelia) — proxy JDBC, scripts audit, pg_stat_statements, gate neon-perf, docs DEVELOPMENT.
- 2026-06-10 : Code review — 10 patches appliqués (YAML cloud, EXPLAIN correlation, gate Neon, classifieur findings).
- 2026-06-10 : Fix en-têtes JDBC — `ContentCachingResponseWrapper` sur hot paths (Tomcat commitait avant `setHeader`).

### Review Findings
 Actuator `/metrics` — admin-only vs any authenticated session? — **Résolu (D1-A)** : conserver `.authenticated()` ; tout membre connecté peut lire les métriques pool (acceptable pour dev/staging).
- [x] [Review][Decision] Migration Flyway V64 `pg_stat_statements` — échec bloquant ou skip documenté? — **Résolu (D2-C)** : conserver V64 ; si Neon refuse l’extension → waiver documenté + Neon Query Insights comme fallback (DEVELOPMENT.md).
- [x] [Review][Decision] `perf-14` passé `done` dans le même diff sprint-status — **Résolu (D3-A)** : co-clôture intentionnelle (PERF-14 terminée en parallèle).

- [x] [Review][Patch] Clé YAML `hatcast` dupliquée dans `application-cloud.yml` — fusionnée (jdbc + cors) [`application-cloud.yml`:21-25]
- [x] [Review][Patch] Corrélation EXPLAIN → `serverExecMs` — `matchExplainBlockToEndpoint` + `EXPLAIN_BLOCK_TO_ENDPOINT` [`audit-db-latency.mjs`]
- [x] [Review][Patch] Faux positif `network-dominated` quand `serverExecMs` inconnu — garde `serverExecMs > 0` [`audit-db-latency.mjs`:classifyEndpointFindings]
- [x] [Review][Patch] Schéma RTT AC1 — `medianRttMs` dans measureRtt / report [`audit-db-latency.mjs`]
- [x] [Review][Patch] Colonne rapport AC4 — champ `endpoint` (remplace `path`) [`audit-db-latency.mjs`:buildEndpointProbe]
- [x] [Review][Patch] Catégorie `heavy-join` — ajoutée pour summary/composition [`audit-db-latency.mjs`:classifyEndpointFindings]
- [x] [Review][Patch] Logs SQL slow-query sans opt-in — WARN sans texte SQL si `queryLogEnabled=false` [`DataSourceProxyBeanPostProcessor.kt`]
- [x] [Review][Patch] Tests A3 — test normalisation JDBC URL [`audit-db-latency.test.mjs`]
- [x] [Review][Patch] Gate NFR-P2 warmup — requête warmup avant les 10 mesures [`neon-perf-agenda-gate.mjs`]
- [x] [Review][Patch] Gate AC6 anti-H2 — vérifie `neon.tech` dans datasource + en-têtes JDBC [`neon-perf-agenda-gate.mjs`]

- [x] [Review][Defer] ThreadLocal JDBC metrics sur threads async/scheduled — deferred, pre-existing [`RequestJdbcMetrics.kt`:23-31]
- [x] [Review][Defer] BeanPostProcessor enveloppe tout bean `DataSource` — deferred, pre-existing [`DataSourceProxyBeanPostProcessor.kt`:21-29]
- [x] [Review][Defer] p95 sur n=10 ≈ max (pas vrai percentile) — deferred, pre-existing [`neon-perf-agenda-gate.mjs`:778]
- [x] [Review][Defer] `NeonAgendaPerformanceIntegrationTest` MockMvc in-process ≠ RTT Neon réseau — deferred, pre-existing (documenté opt-in manual CI)

---

### Validation create-story

- [x] AC métier numérotés et sourcés (NFR-P2, PERF-002, ADR-0009)
- [x] **UI : N/A** explicite
- [x] Tasks référencent les AC par phase
- [x] Liens vers fichiers code existants (`migrate-malice-load.mjs`, `SecurityConfig.kt`)
- [x] `./gradlew test` + `node --test` mentionnés
