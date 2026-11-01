# Product decisions and detailed follow-up

Stable Q-1–Q-8 identifiers are preserved. Adopted technical decisions AD-1–AD-15
are in the architecture companion and govern downstream work.

## Q-1 — Vocabulary: scope resolved

Common labels plus group customization of Groupe, Événement, Type and Sélection;
role names are catalog-managed. Group surfaces use local terms and multigroup
chrome common terms. Common forms are fallback; historical user content and audit
snapshots remain. **Follow-up:** precise French singular/plural/gender forms and
how they are presented, within the adopted contract. No general localization.

## Q-2 — Categories: visibility resolved

Category editing and statistical filters remain with or without draw; no hidden
editor, reset or merger with types. **Follow-up:** choose generic wording for the
default category without changing historical assignments.

## Q-3 — Confirmation: commitment and notifications resolved

Confirmation is per type with group fallback; existing event rules persist.
Without confirmation, organizer validation establishes a distinct **sélectionné**
commitment, with informational notification, withdrawal and no confirmation
request/task. Unlock preserves commitments; unchanged revalidation is silent;
validated replacement informs incoming and outgoing people; withdrawal is not
silently reversed. Recorded member/proxy confirmation remains distinct. **Follow-up:**
precise informative reminder copy and channels, without implying acceptance or
requesting confirmation; no status proves actual attendance.

## Q-4 — Simple participation: deferred

Simple coming/not-coming without selection was discussed for training but its
need is unconfirmed; Patrice prefers to wait for evidence before implementation.
The earlier 2.C active-scope choice is superseded. Keep CAP-10 and Q-4 reserved;
revisit lifecycle, answers and statistics only if the need is confirmed. Dispo /
Pas dispo remains the wording for the active selection journey.

## Q-5 — Linked series: deferred

Series were envisaged for training but the need is unconfirmed. The earlier 3.A
active-scope choice is superseded. Keep CAP-8 and Q-5 reserved; recurrence,
occurrence edits, notifications and preservation rules must be reconsidered if
need is confirmed. No series design is required now.

## Q-6 — Catalogs and dependencies: principal rules resolved

Autonomous group catalogs are initialized from existing models. Stable identities
survive rename; current labels appear in views/statistics, audit snapshots remain.
Archive retains existing needs/history. Preferences are independent per group;
existing preferences keep their meaning. New roles have their own availability,
selection and withdrawal counts; event totals count a person at most once.
Existing theatre groupings remain, without automatic custom-role classification.
Existing draw factors apply by role when draw is enabled; current parity scope is
preserved. **Follow-up:** exact labels, role ordering UI and any useful initial
Pottoks roles; no custom statistics-grouping editor is required.

## Q-7 — Settings: scope and initial defaults resolved

New events resolve draw from group, volunteering from group only and confirmation
from type or group fallback; existing events retain effective behavior. New groups
start with draw enabled, volunteering mandatory when volunteer places are offered,
and confirmation required. Existing group administration permissions remain the
basis for changes. **Follow-up:** compatible bootstrap and migration verification,
old-client transition and precise setting presentation, within the architecture
contract. Changes to defaults do not implicitly rewrite existing events.

## Q-8 — Actual attendance: outside scope

Availability, selection and confirmation do not prove actual attendance. No
check-in, attendance register or assiduity statistics are requested. Explore
separately only on explicit need.
