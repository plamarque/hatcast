> Excluded from research findings by Patrice on 2026-10-23: historical release/build/test mechanics were changing. Retained as an acquisition trace only; do not use to estimate B gains or compare paths.

# Timing and delivery evidence digest

Sources: imports/jobs-<run>.json (GitHub Actions REST, plamarque/hatcast, accessed 2026-10-23); imports/actions-runs-page1.json and page2.json. Seven selected September–October stable production tag-triggered deploy runs occur in these two API pages (which also contain earlier out-of-cohort runs); every tag SHA matches its final staging run. Timing below measures final candidate staging steps, not decision-to-prod or human work. Date labels come from run timestamps, not Git tag annotation dates.

| Release | T1 execution | T2 execution | Build/push | Deploy step | T1+T2 test execution |
| --- | ---: | ---: | ---: | ---: | ---: |
| v2.4.6 | 4:46 | 4:03 | 2:52 | 0:13 | 8:49 |
| v2.5.0 | 4:16 | 3:02 | 3:12 | 1:09 | 7:18 |
| v2.6.0 | 4:23 | 3:05 | 3:06 | 0:59 | 7:28 |
| v2.6.1 | 4:25 | 3:12 | 3:11 | 1:10 | 7:37 |
| v2.6.2 | 3:58 | 3:20 | 2:54 | 0:58 | 7:18 |
| v2.6.3 | 3:10 | 2:59 | 2:55 | 1:10 | 6:09 |
| v2.7.0 | 4:43 | 3:05 | 2:22 | 1:10 | 7:48 |

## Findings and limits

All seven final staging runs execute both T1 and E1 Playwright steps successfully according to step status. Step success does not attest complete first-attempt assertion coverage; runtime skips/retries remain separate and unmeasured here. All seven production tags have a deploy workflow run; latest v2.6.3 and v2.7.0 show successful deploy job and failed posthog-lifecycle job, so aggregate workflow failure is not a failed application deploy. This is recorded deployment outcome, not a fresh read of current cloud traffic.

T1 execution spans 3:10–4:46; T2 execution spans 2:59–4:03. Their serial sum is 6:09–8:49 per final staging cycle. This is the observed test-execution budget, NOT additional time B would save: targeted tests and common cloud checks remain, A overlaps build/T1, and setup/human waits are not removed by test selection. Build/push spans 2:22–3:12, production build remains separate. Sum of parallel build/test durations is not elapsed delivery time. There are no targeted-lane runtimes or measured classifier/human-smoke durations; net B benefit cannot be estimated reliably from these data alone. A-only gains from eliminating a staging cycle/local preflights must not be attributed again to B.

Publisher is the same repository owner for Git and GitHub; no independent production telemetry exists in this digest. Confidence in timestamps/step status is medium (single primary publisher); causal assertions about escaped bugs or potential speed are unverified and not made. Sources are immutable historical observations; relevance must be revisited after A measurements on 2–3 new user-facing maintenance releases.
