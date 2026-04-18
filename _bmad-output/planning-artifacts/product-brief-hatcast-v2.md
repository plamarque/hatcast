# HatCast — Product Brief (Executive Summary)

_Source: discovery session with Patrice; scope aligned with HatCast V1 in production + intended V2 rewrite. Document language per BMAD `document_output_language`._

## Problem & vision

**HatCast** helps **improvisation troupes** plan shows and **build teams**: collect **availability** by role, **compose** lineups (manually or via **weighted lottery**), run a **validation** workflow, send **notifications**, and track **confirmations** and **withdrawals**. The product is **mobile-first**, usable in the browser, and intended as a **PWA** installed by troupe members. Delivery model is **SaaS**; **freemium** lets any troupe register and run seasons at no cost.

## Primary users

- **Troupe members** (most users): availability, viewing schedule and lineup, confirmations.
- **Organizers**: compose teams, announce phases, manage gaps after withdrawals.
- **Administrators**: troupe setup, members, seasons, spectacles, roles, and elevated tooling.
- **Guests (non-members)** (e.g. DJs, occasional contributors): *conceptually* invited for specific shows/roles; **full guest flows are likely premium** and not in initial scope.

## Core domain model

- **Troupe** as organization; **members** linked to user accounts.
- **Seasons** with **start/end dates**; **events (spectacles)** with date/time, venue (maps/directions, calendar export), title, description.
- **Event types** (cabaret, long form, freeform, match, catch, travel, surveys, etc.) with **icons** and **required vs optional roles**; troupes can **customize types** and **role counts**. Standard optional roles include volunteer, referee, assistant ref, lighting, coach, stage manager, etc. **Custom roles** per troupe.
- **Volunteer** role: **mandatory** in logic—being available for play/other roles implies availability as volunteer (product rule to phrase clearly in spec).
- **Role stacking**: same person in multiple roles when needed (e.g. stage manager + volunteer); **with/without replacement** per role configurable for lottery.

## Freemium & public discovery

- **Homepage directory**: troupes listed as **cards** (name, logo, short description, event count, participant count). **Freemium troupes cannot opt out** of public listing.
- **Freemium read access**: **non-members can browse** troupes, seasons, and spectacles (public “annuaire” + transparency). **Private events/seasons** reserved for a **future premium** tier (hypothesis to validate).

## Event lifecycle & statuses

1. **Availability collection** — event open for members to state availability.
2. **Team in preparation** — organizers compose; remains until **all** required confirmations are received.
3. **Team confirmed** — full confirmation achieved.

**Inactive** spectacles: **hidden** from members and visitors; **visible only to admins**; effectively inert.

## Availability & team tabs

- **Availability**: per user—**unknown / available / unavailable**; **checkboxes** for roles required by event type; **optional comment** for organizers. Organizers/admins may **set availability and confirmations on behalf of** members (must be **audited** as actor vs impacted user).
- **Team**: **slots** per role; **manual assign** (dropdown + autocomplete) from people **available for that role**.
- **Draft composition**: only **admins**, **troupe-level show organizers**, or **per-spectacle organizers** see work in progress; **members do not** until composition is **validated**.
- After **validation**, composition is **locked** unless **invalidated** (withdrawn from confirmation flow for rework).
- **Withdrawals** free slots and list people as declined; organizers **fill gaps** manually or with **partial lottery**; **notifications** when holes appear.

## Lottery (optional per troupe)

- **Weighted random** baseline: fairness signals (e.g. fewer past assignments in role/type → bonus; very recent play → malus; long absence → bonus). **Multiple algorithms** possible over time.
- **Sequenced draw UX**: animation; per role (fixed order), draw one person per slot; person removed from pool according to **with/without replacement** rules (including rare “same role twice” only if **explicitly allowed** in spectacle settings).
- **Transparency**: on availability views, show who is available per role and **estimated selection odds**; **click for personalized explanation** (calculation, bonuses/penalties, mechanics). **Pedagogical visualization** (e.g. tickets in a bag, different sizes, per-role bags).

## Communications

- **Announce “spectacle ready”** for availability (WhatsApp channel or **copy-paste** summary **without** team); **email + push** with deep link to event.
- **Share proposed** (non-final) composition via same channels.
- **Validated** composition: message focused on **confirm participation**.
- **All confirmed**: optional **recap** notification (“team confirmed”).

## Account & preferences

- Password, Google sign-in, reset, **change email**, **delete account**.
- **Preferred roles** → **pre-checked** on events for faster availability entry.
- **Notification preferences** by type and channel (email, push, and messaging channels as defined).
- **Online help**; **PWA install** CTA with **browser-specific** instructions.

## Administration

- Dedicated **admin UI**: troupe, members, seasons, spectacles; **season-level** and **spectacle-level** admins/organizers; full CRUD on spectacles and role templates.
- **User admin**: roles, listing, **last connection**, etc.
- **Preview** of **public card** stats (name, logo, event count, participants).

## Audit trail

- **Organizers and admins** can view a full **audit trail** per event: property changes (**before/after**), **availability** and **comments**, **confirmations**, **composition** changes (manual vs lottery), slot removals, withdrawals.
- **Actor vs subject** must be clear when someone acts **for another user**.
- **Timestamps** to **second** precision (date, hour, minute, second).

## Historical & analytics views (season)

- Besides **agenda** (events by month): **history** of **past** events, **by month**, expandable columns; collapsed month shows **participation counts** per player; expanded shows each show and **role played**.
- **Persistent stats**: player participations by show type; “decorum” roles (MC, referee, assistant, coach); **travel**; **volunteer** counts; **“demand satisfaction” %** (e.g. selections ÷ times available) to explain fairness.
- **Click person** → **profile**: availabilities vs spectacles offered, selection rate, withdrawals, **favorite roles**.
- **Calendar** “brick” view per month: color-coded **presence / absence / availability stated or not**.

## Premium (brainstorm only — not V1)

Validate via interviews and in-app tests: **private events/seasons**, advanced role customization, **lottery** access or premium variant, **notifications**, **audit trail**, **multi-role stacking**, **guest invitations** (scoped availability). **V1 does not implement premium.**

## Corollary (non-core)

- Help, **contact email** to product team, footer: **copyright**, **GitHub**, **license**, **version** + **changelog**.

## Strategic context (for planning)

Functional scope reflects **HatCast V1 in production** plus **UX directions for a full rewrite** and **new stack**; **legacy code is not the spec**—a **short reality check** against V1 (data model, gaps, migration) is recommended before PRD/architecture, without deep code archaeology.
