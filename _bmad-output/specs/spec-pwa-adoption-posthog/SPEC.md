---
id: SPEC-pwa-adoption-posthog
companions:
  - pwa-adoption-measurement.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate.

# PWA adoption measurement in PostHog

## Why

Product operators need a PostHog dashboard that distinguishes people who use HatCast as an installed PWA from people who continue in a browser, and explains whether web-only usage correlates with browser, OS, or device compatibility. HatCast supplies only the bounded signals; PostHog owns the analysis and visual presentation.

## Capabilities

- **CAP-1**
  - **intent:** An identified HatCast user can contribute a bounded observation of the current access mode so operators can compare active PWA and browser use.
  - **success:** A session opened in standalone mode records `standalone`; a normal browser session records `web`; a person is counted once per mode per selected reporting period.

- **CAP-2**
  - **intent:** The product can record native installation confirmation when the platform exposes it without presenting that incomplete signal as the total installed population.
  - **success:** A browser `appinstalled` callback produces a distinct installation-confirmation event; manual installation paths without that callback remain measurable when their standalone app is first launched.

- **CAP-3**
  - **intent:** Product operators can derive installed-PWA users, web-only users, and mixed-use users from documented PostHog recipes.
  - **success:** A documented query separates unique identified people who saw only `web`, at least one `standalone`, or both during the most recent 30 days; demo and internal traffic are excluded only through a deterministic, documented filter.

- **CAP-4**
  - **intent:** A product operator can consult a graphical PostHog dashboard for PWA adoption and compatibility.
  - **success:** A PostHog dashboard presents web-only, PWA-used, mixed-use, and native-install-confirmation metrics with the most recent 30 days preselected, an operator-changeable date range, and compatibility breakdowns.

- **CAP-5**
  - **intent:** A product operator can investigate whether web-only usage is associated with a browser, browser version, operating system, OS version, or device type.
  - **success:** PostHog can break down `pwa_access_mode_observed` by its server-parsed browser, browser version, OS, OS version, and device-type metadata; authorized operators can drill into the existing People records for the web-only segment without adding new identity properties.

## Constraints

- Events use only bounded, pseudonymous properties. They must not contain email, name, free text, third-party IDs, browser fingerprinting data, raw user agent, or full URL.
- Access mode is inferred from real browser state, including `display-mode: standalone` and iOS `navigator.standalone`; local storage is not authoritative evidence.
- Capture uses the centralized `ProductAnalyticsService`; the internal UUID remains the PostHog `distinct_id`, and existing People-property policy is unchanged.
- With no PostHog key, analytics remains a no-op as it is today in local, CI, development, and unconfigured staging environments.
- The dashboard opens on the most recent 30 days, but its date selector never limits event collection or later analysis.
- Compatibility analysis uses PostHog's server-parsed metadata for browser, browser version, OS, OS version, and device type. HatCast must not add raw user-agent strings, a device fingerprint, or new People properties for this purpose.
- No user-facing interface or permission behavior changes.

## Non-goals

- Measuring an iOS manual add-to-home-screen action at the instant it occurs.
- Identifying a physical device, tracking a person across unrelated devices, or inferring their browser beyond the two access-mode categories.
- An analytics dashboard inside HatCast.
- Changing the existing organizer-observability story or its event contract.
- Application build-version analysis; “PWA version” means the standalone access mode rather than a release number.

## Success signal

An operator opens the PostHog dashboard on its last-30-days view, sees PWA-used, web-only, mixed-use, and native-installation-confirmation metrics, then breaks web-only usage down by browser, version, OS, and device type. The result clearly labels native installation callbacks as partial confirmation rather than the number of people who installed HatCast.

## Assumptions

- A person who has launched HatCast in standalone mode at least once is treated as a PWA user, even when their platform does not expose an installation callback.
- “PWA version” in this request means the standalone PWA mode, not a HatCast build version.

## Open Questions

- Should people who use both modes appear as a separate mixed-use segment, or should a dashboard allocate them by their most recent mode?
- What deterministic signal can exclude demo and internal users from a global, non-troupe-scoped access-mode event?
