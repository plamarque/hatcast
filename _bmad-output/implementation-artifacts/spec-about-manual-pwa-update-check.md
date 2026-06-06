---
title: 'About tab manual PWA update check'
type: 'feature'
created: '2026-06-06'
status: 'done'
route: 'one-shot'
baseline_commit: 6254ab63e4515655ccb178a1ef071d4acb6619a1
---

# About tab manual PWA update check

## Intent

**Problem:** Users only discover app updates via the automatic banner (story 10.2) or navigation-triggered polling; there is no explicit way to force a check from the UI.

**Approach:** Add a « Vérifier les mises à jour » control on Mon compte → À propos that calls `PwaUpdateService.checkForUpdatesManually()`, shows snackbar feedback, and surfaces the existing update banner when a pending version is found.

## Suggested Review Order

**Manual check orchestration**

- Entry point: user-triggered SW update with waiting-worker fast path
  [`pwa-update.service.ts:86`](../../apps/web/src/app/core/pwa/pwa-update.service.ts#L86)

- Network guard on ngsw.json fetch (8s abort)
  [`pwa-update.service.ts:209`](../../apps/web/src/app/core/pwa/pwa-update.service.ts#L209)

**About tab UI**

- Button, spinner, snackbar wiring
  [`account-about-tab.ts:53`](../../apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.ts#L53)

- Template with dynamic aria-label
  [`account-about-tab.html:23`](../../apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.html#L23)

- Layout for version + check actions
  [`account-placeholder.scss:366`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss#L366)

**Tests**

- Service manual-check paths
  [`pwa-update.service.spec.ts:184`](../../apps/web/src/app/core/pwa/pwa-update.service.spec.ts#L184)

- About tab render + snackbar
  [`account-about-tab.spec.ts:41`](../../apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.spec.ts#L41)
