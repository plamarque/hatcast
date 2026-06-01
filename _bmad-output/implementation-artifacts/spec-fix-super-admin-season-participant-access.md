---
title: 'Fix super-admin season participant access (Improbots dev)'
type: 'bugfix'
created: '2026-06-01'
status: 'done'
route: 'one-shot'
---

# Fix super-admin season participant access (Improbots dev)

## Intent

**Problem:** En dev, `patrice.lamarque@gmail.com` n'avait ni `TROUPE_ADMIN` sur Les Improbots (seed réservé à `patrice@seed.improbots.test`) ni accès garanti via super-admin si `HATCAST_SUPER_ADMIN_EMAILS` absent — la page `/admin/participants` renvoyait « Accès non autorisé ».

**Approach:** Bootstrap Flyway repeatable dev pour promouvoir les opérateurs réels sur Improbots + fallback UI `platformAdmin` aligné sur `admin-membres`.

## Suggested Review Order

1. [Bootstrap dev opérateurs Improbots](../../services/api/src/main/resources/db/seed/R__bootstrap_improbots_dev_operator_memberships.sql) — membership TROUPE_ADMIN, participant saison, réactivation si retiré
2. [Test intégration platform admin participants](../../services/api/src/test/kotlin/com/hatcast/api/troupe/PlatformAdminTroupeNavigationIntegrationTest.kt) — POST/GET sans adhésion troupe
3. [Garde d'accès admin-participants](../../apps/web/src/app/pages/admin-participants/admin-participants.ts) — signal `platformAdmin` + computed `canManageSeasonParticipants`
4. [Test unitaire platform admin UI](../../apps/web/src/app/pages/admin-participants/admin-participants.spec.ts) — accès sans permissions saison
