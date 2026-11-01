# Configuration scope and event behavior

Product meaning of the accepted defaults and preservation rules. Technical
resolution, transition and authorization invariants are in the adopted
architecture companion.

| Setting | Configuration authority/scope | Effective event behavior |
|---|---|---|
| Random draw | Group default | Resolve for each new event; existing events retain their rule. |
| Volunteer obligation | One group default; no type override | Resolve for each new event; older rules remain effective. |
| Confirmation | Type chooses required, not required or group default | Resolve at creation; later defaults do not alter that event. |
| Default role needs | Group-owned type template | Copy as event needs; explicit event needs remain editable and are not overwritten by a default change. |
| Generic vocabulary | Common interface labels | Applies throughout the interface, including existing event screens. |
| Custom vocabulary | Groupe, Événement, Type and Sélection per group | Group-context surfaces use group terms; common terms are fallback and multigroup chrome. |

Existing groups and events preserve their behavior. New groups initially enable
draw, require volunteering when volunteer places are offered, and require
confirmation by default. A group administrator may change defaults; those
changes affect new events, not older ones. A group draw-default change is not a
kill switch for older events. Preserve event rules without creating a per-event
confirmation or volunteer-override editor. Categories and statistical filters
remain available with or without draw.

For an event without confirmation, organizer validation establishes an engagement
labelled **sélectionné**, distinct from **confirmé**. The member receives an
informational notification, can withdraw, and receives no confirmation task or
request. Unlock preserves engagements; revalidation without changes is silent;
withdrawal frees the place and is not reversed by revalidation. Validated
replacements notify the incoming and outgoing people; draft edits are silent.
Neither selection nor confirmation proves actual attendance.

| Given / When | Expected |
|---|---|
| An existing draw-enabled event; group draw default becomes disabled | Existing event retains draw; a new event uses disabled draw. |
| A type inherits the group confirmation default; the group default changes | Existing event retains its effective rule; new events resolve the updated default. |
| A type explicitly chooses confirmation; the group default changes | New events retain that explicit type choice. |
| An organizer validates a no-confirmation selection | Selected people are informed, without a second response; withdrawal remains possible. |
| Group volunteering becomes optional | New applicable events accept player-only, volunteer-only or both self/proxy answers when offered; older events retain their policy. |
| An event has disabled draw | Manual selection, category editing, statistics and participation colors remain. |
| A role is archived | It is not offered for new event needs; existing event needs and their candidacies/assignments remain usable. |
| Generic wording is introduced | Old and new screens use the common labels; personal content and audit snapshots are preserved. |

Simple participation and event series are deferred pending confirmation of need;
no creation, inheritance or editing boundary is specified for those capabilities.
