# PWA lifecycle and release-note observability

This contract belongs to Story 11.5. Story 11.6 owns PWA/Web adoption and its separate dashboard. Canonical lifecycle worktree: `feat/11-5-observabilite-installation-pwa-posthog`. The draft `spec-posthog-install-update-dashboard.md` on `codex/posthog-install-update-dashboard` is superseded by the PO decisions recorded in 11.5.

## Client events

`ProductAnalyticsService` captures these only after the existing authenticated identity lifecycle, with no requests when PostHog is disabled. No new Person properties are introduced. Lifecycle payloads include `release_id` and `app_version` when a bundled release is available. `release_id` is `semver:git_hash` derived at Angular build time from the release artifact `public/version.txt`; it is embedded with Angular `--define` by `build-with-release.mjs`. Fetching the server's latest `version.txt` never changes that bundled identity. Plain `ng serve`/`ng test` omit release claims.

| Event | Custom fields beyond bundled release |
| --- | --- |
| `app_release_observed` | None; once per user/page lifetime after identification |
| `pwa_install_instructions_viewed` | `entry_point`: banner/account_menu/manual_instructions_retry; `fallback_reason`: native_prompt_unavailable/untrusted_development_origin/native_prompt_failure; bounded `instruction_variant` |
| `pwa_install_native_prompt_resolved` | `outcome`: accepted/dismissed |
| `pwa_install_completed` | None; native `appinstalled` callback only, partial platform coverage |
| `pwa_update_available` | `source`: version_ready/fallback; one hidden-to-visible banner transition |
| `pwa_update_dismissed` | None; visible banner dismissed |
| `pwa_update_apply_requested` | None; user requests activation |
| `pwa_update_applied` | `previous_release_id`, `delay_bucket`: under_1m/under_1h/under_1d/over_1d |
| `release_notes_opened` | `source`: account/after_update; `viewport_width`, `viewport_height` |
| `release_notes_closed` | `source`; `visible_time_bucket`: under_5s/5_to_15s/15_to_60s/over_60s; `scroll_bucket`: not_scrollable/under_25/25_to_50/50_to_75/75_to_100 |

An update confirmation requires a session-storage request owned by the identified user, no more than seven days old, and a changed bundled release after startup. It is consumed once. It does not prove the target candidate was applied, does not classify rollback versus upgrade, and cannot cover unrequested background upgrades or blocked storage. A request followed by an unchanged release remains pending until expiry or a changed release.

Notes capture the CSS viewport at opening (integer dimensions capped at 32768; unavailable dimensions are null). Device type comes from PostHog `$device_type` mapped to phone/tablet/desktop/unknown. OS/browser and available versions come from the opening event's `$os`, `$os_version`, `$browser`, `$browser_version`; unknown values are not inferred. No device model, raw user-agent, screen fingerprint, hardware data or replay screenshot is added. Only visible document time after successful nonempty content load contributes to close duration. Failed/empty loads send opening but no reading-close event. Scroll measures maximum scroll offset over the available scroll range, rather than claiming comprehension.

## CI ownership and credentials

After successful V2 production deployment, the independent `posthog-lifecycle` CI job captures `hatcast_release_promoted` (release fields, promotion timestamp, personless distinct ID and `$process_person_profile=false`) and provisions the dashboard **HatCast — Installation, mises à jour et nouveautés** and six managed SQL insights. Staging/RC/development do not run this job. It uses documented EU capture and project dashboard/insight APIs; no manually edited SQL variable or internal API is used.

Production GitHub environment configuration (values never committed):

- Existing secret `HATCAST_POSTHOG_PROJECT_API_KEY`: ingestion token.
- Secret `HATCAST_POSTHOG_PERSONAL_API_KEY`: restricted service operator key with dashboard read/write and insight read/write permissions on the intended project.
- Variable or secret `HATCAST_POSTHOG_PROJECT_ID`: numeric target project ID. The workflow accepts either location (variable takes precedence); the current production configuration uses an environment secret.

`node scripts/v2/posthog-lifecycle-dashboard.mjs` prints the reviewable manifest without network requests. `--apply` is the explicit mutation mode, run by CI after deployment. Objects are located by exact ownership description `hatcast-managed:lifecycle-v1` (insights have a stable suffix). Only owned insights are patched; unrelated dashboards and insights are preserved. Duplicate ownership stops the run. Serialized CI prevents concurrent duplication. Do not manually add the managed insights to another dashboard: CI owns their dashboard association.

The promotion event uses the successful deployment job's completion timestamp read from the GitHub Actions API (including on retry) and a stable UUID per release for ingestion deduplication. The query also uses the earliest observed timestamp per release, so reruns never move its original date. If capture or provisioning fails, the observability job fails visibly; the completed deployment remains deployed. Retry that failed job. The release ledger and client observation data begin with the first successful instrumented release; no historical dates or missing version evidence are fabricated. A server rollback to an older release needs a separate operational interpretation: the latest-release card remains the most recently first-promoted release.

## Dashboard interpretation

Default date window: last 30 days, adjustable by the operator. Client queries use `{filters}`; the global release-reference subquery intentionally spans retained promotion history. Table of people: latest client observation within the selected window, existing People name/email, client release, last-seen time, target release and `floor(elapsed days since latest promotion)` for clients with a different release. This is a named operator dashboard (same restricted product/PO access as the existing M4 People exception); no name/email is duplicated into event payloads. Missing promotion history yields no lag rows. Device observations can differ across a person's devices; the table reports the latest observed client, not an inventory of all devices or proof of current use.

The global lifecycle events have no troupe context. `is_demo_troupe != true` cannot reliably exclude demo sessions for them; keep the report production-only and state this limit until a bounded exclusion rule is approved. No alerts, subscriptions or digests are provisioned.

## Verification

Local tests cover client state, bounded payloads and repeated mock API provisioning. They do not prove real HogQL execution, credentials or SDK metadata enrichment. Before relying on the dashboard, validate the six queries through PostHog, inspect a real notes-opening event for viewport and available compatibility fields, and verify a two-release update request/startup sequence. Use a dedicated PostHog staging project if staging network evidence is required; the standard staging build has analytics disabled.
