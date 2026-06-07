# Editorial rules — GitHub Release notes (English)

Inspired by the [Argil playbook — product updates](https://www.argil.io/playbooks/product/writing-product-updates-and-releases).

Used for the `changes_en` field in cutover JSON — published on GitHub when `./scripts/deploy_prod.sh` creates the prod tag `vX.Y.Z`.

## Principles

1. **Outcome before output** — what the user can do or notice, not what the team shipped.
2. **"So what?" test** — the benefit must be obvious in 3 seconds; otherwise drop the line.
3. **Headline = benefit** — "Confirm your availability from the schedule", not "New status handler".
4. **Short and scannable** — max 5 bullets per version; one idea per line (~120 characters).
5. **Zero noise** — when in doubt, omit. An empty list is fine for a technical-only RC.
6. **Grounded** — every bullet must reflect a real change (commit / story / diff); no invention.

## Include

- New action or journey (login, availability, lineup, notifications, account…)
- Bug fix that affected real usage
- Visible improvement (mobile, clarity, perceived speed)

## Exclude

- CI, deployment, migrations, internal refactors, tests, lint, dependencies
- File names, Angular classes, API routes, ADRs, technical docs
- Imperceptible CSS tweaks
- "Stability / performance" without a concrete user-facing example
- Commit subjects translated word for word

## HatCast vocabulary (OK)

team, league, season, show, availability, lineup, MC, DJ, org, PWA, schedule, roster, guest, mix

## Wording

- Use **you / your** (informal but clear)
- Replace "modal" with **dialog** or **window**
- Optional domain prefix: `✨ Team — …`, `🐛 Lineup — …`, `✨ Schedule — …`

## Emojis

| Emoji | Usage |
|-------|--------|
| ✨ | User-facing new feature |
| 🐛 | Felt bug fix |
| 🔧 | Visible improvement (not invisible technical work) |
