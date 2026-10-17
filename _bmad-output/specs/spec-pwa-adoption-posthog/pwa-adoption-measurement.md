# PWA adoption measurement contract

## Event catalogue

| Event | When emitted | Allowed properties | Use |
|---|---|---|---|
| `pwa_access_mode_observed` | Once per identified person and browser session after access mode is determined | `access_mode`: `standalone` \| `web` | Counts active use by mode. |
| `pwa_install_completed` | Only when the browser emits `appinstalled` | None unless a later spec approves a bounded provenance field | Confirms a native install callback; not a universal install counter. |

The implementation must preserve the existing PostHog identity lifecycle. It must never introduce a device identifier, raw user agent, URL, free text, or a new People property for access mode. Browser, browser version, OS, OS version, and device type are read in PostHog from its parsed event metadata rather than captured explicitly by HatCast.

## Definitions

- **PWA-used:** an identified person with at least one `pwa_access_mode_observed` event where `access_mode = standalone` in the reporting period.
- **Web-only:** an identified person with at least one `web` observation and no `standalone` observation in the reporting period.
- **Mixed-use:** an identified person with both observations in the reporting period. It is reported separately so the two primary populations remain interpretable.
- **Native-install confirmation:** an `appinstalled` event. It is a browser capability signal, not proof of manual iOS installation and not a substitute for PWA-used.

## Browser-state rules

1. `display-mode: standalone` means `standalone`.
2. On iOS, `navigator.standalone === true` means `standalone`.
3. Otherwise, the mode is `web`.
4. A cached `hatcast-pwa-installed` value may support user experience but must not determine analytics mode.

## PostHog reporting recipe

The dashboard defaults to the most recent **30 days**. Its date selector changes only the analysis window; it never limits capture or retention. For the selected period, count unique **identified** persons on `pwa_access_mode_observed`:

1. Filter `access_mode = standalone` for the PWA-used population.
2. Filter `access_mode = web`, then exclude persons with any `standalone` observation, for web-only.
3. Intersect the two sets for mixed-use.
4. Apply a documented deterministic demo/internal-traffic exclusion once the open question in the SPEC is resolved.

Do not derive “installed users” solely from `pwa_install_completed`; that event misses manual platform flows and may precede sign-in.

## PostHog dashboard layout

The dashboard lives in **PostHog**, not in HatCast. It has the following graphical insights, all initialized to the last 30 days:

1. PWA-used unique persons.
2. Web-only unique persons.
3. Mixed-use unique persons.
4. Native-install-confirmation event count, labelled as a partial platform signal rather than a people count.
5. Web-only unique persons broken down by browser and browser version.
6. Web-only unique persons broken down by OS, OS version, and device type.

The web-only segment supports an authorized PostHog drill-down to existing People records, making it possible to identify affected HatCast users without introducing any new identity property. The compatibility metadata is PostHog's parsed `$browser`, `$browser_version`, `$os`, `$os_version`, and `$device_type` data; HatCast does not send the raw user agent.

## Verification contract

- Unit tests cover standalone display mode, iOS standalone, and browser mode.
- Unit tests prove session-level deduplication and no capture while PostHog is disabled.
- Capture tests assert the complete property allow-list and reject prohibited data.
- A production verification checks PostHog Live Events for one `standalone` and one `web` observation using test accounts, then validates the documented query manually.
