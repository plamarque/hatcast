---
title: 'Profile gender designation copy (Mon profil)'
type: 'feature'
created: '2026-06-09'
status: 'done'
route: 'one-shot'
baseline_commit: e06efe06f9433011d21ef47a0e477f734fb79de3
---

## Intent

**Problem:** On Mon compte → Mon profil, the gender block used abstract labels (Féminin / Non spéc. / Masculin) and a generic question, while the product elsewhere designates members with role labels (Comédienne / Comédien·ne / Comédien).

**Approach:** Introduce profile-specific field label (`Je me désigne plutôt comme `) and role-designation toggle options, refactor the profile tab template to iterate those options, and keep organizer participant dialogs on the existing gender-oriented copy.

## Spec Change Log

- **2026-06-09** — Field label refined from « Je préfère qu’on me désigne comme » to « Je me désigne plutôt comme » (shorter, first-person wording).

## Suggested Review Order

**Profile copy constants**

- Profile-only question (« Je me désigne plutôt comme ») and role-designation toggle labels live beside shared gender helpers.
  [`member-gender.ts:59`](../../apps/web/src/app/core/account/member-gender.ts#L59)

- Organizer dialogs keep Féminin / Non spéc. / Masculin via unchanged `MEMBER_GENDER_OPTIONS`.
  [`member-gender.ts:74`](../../apps/web/src/app/core/account/member-gender.ts#L74)

**Mon profil UI**

- Profile tab binds profile constants and reuses `@for` toggle loop with tone CSS classes.
  [`account-profile-tab.ts:71`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.ts#L71)

- Template renders designation toggles from `genderOptions` with accessible aria labels.
  [`account-profile-tab.html:120`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.html#L120)

**Tests**

- Spec asserts new question text and all three profile toggle labels distinctly.
  [`account-profile-tab.spec.ts:250`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.spec.ts#L250)
