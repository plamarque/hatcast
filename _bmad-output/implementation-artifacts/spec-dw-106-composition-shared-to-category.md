---
title: 'DW-106 COMPOSITION_SHARED intent and toCategory mapping'
type: 'feature'
created: '2026-06-07'
status: 'done'
route: 'one-shot'
baseline_commit: 'c721a274c8394ea2311ff7a1354a9701a070a484'
---

# DW-106 COMPOSITION_SHARED intent and toCategory mapping

## Intent

**Problem:** `NotificationCategory.COMPOSITION_SHARED` was exposed in prefs UI/API but no `NotificationIntent` mapped to it via `toCategory()`, so future draft-shared dispatch would check the wrong preference category.

**Approach:** Add `NotificationIntent.COMPOSITION_SHARED`, map it to `NotificationCategory.COMPOSITION_SHARED`, and lock the mapping with unit tests. Keep `publishDraftCompositionShared` as a debug no-op (story 8.4); add compile-only dispatcher/payload stubs that remain unreachable until 8.4 wires dispatch.

## Suggested Review Order

**Intent and category mapping**

- New enum value and `toCategory()` branch for draft-shared prefs
  [`NotificationIntent.kt:7`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt#L7)

**Dispatch guard (8.4 not wired)**

- Empty recipients short-circuit before payload/prefs — safe until 8.4
  [`NotificationDispatcher.kt:109`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt#L109)

- Unreachable payload/subject stubs fail fast if guard is removed prematurely
  [`NotificationPayloadBuilder.kt:60`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt#L60)

**Tests**

- Exhaustive category mapping assertion including `COMPOSITION_SHARED`
  [`NotificationDispatcherTest.kt:180`](../../services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt#L180)

- Regression: dispatch with `COMPOSITION_SHARED` touches no channels yet
  [`NotificationDispatcherTest.kt:224`](../../services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt#L224)
