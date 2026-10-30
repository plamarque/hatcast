# Sprint Change Proposal — Records Hygiene

**Date:** 2026-10-15  
**Scope:** planning tracker, issue registry, and deferred-work ledgers only.  
**Product/runtime impact:** none.

## 1. Trigger

Epic 22 is complete, but the repository's operational records mix live work,
completed history, accepted limitations, and superseded planning. This makes
the next work difficult to choose without reading historical material first.

## 2. Evidence

- `sprint-status.yaml` is valid and records Epic 22 as done.
- `deferred-work.md` has exactly two open, active DW entries: DW-127 and
  DW-128. Its other free-form notes are historical review context, not active
  DW items.
- `deferred-work-backlog.md` already provides the history archive and contains
  172 open historical entries.
- `ISSUES.md` has fixed items under `Open Issues`, items fixed locally but
  still awaiting a real operational gate, and genuinely unresolved issues.
- Epic 14 is explicitly superseded; several older epics remain in-progress in
  the tracker despite only historic or deferred work remaining.

## 3. Recommended approach

Archive rather than delete. Keep live queues small and readable; preserve every
historical record in dedicated appendices/files with its identifier and source.
No production behavior, data, or notification contract changes.

## 4. Proposed changes

### A. Deferred work

1. Keep DW-127 and DW-128 as the sole active queue.
2. Move the unstructured review notes currently below the active queue into a
   dated `Historical notes` section in `deferred-work-backlog.md`.
3. Do not promote or close any of the 172 archived open entries without a
   current code-level reassessment.

### B. Issue registry

1. Move entries whose status is already `Fixed` from `Open Issues` to the
   existing `Fixed` section, retaining their full evidence.
2. Keep entries marked `Fixed locally` in a clearly labelled
   `Pending verification or operational follow-up` subsection. They are not
   obsolete: for example, BUG-033 still needs an authorised production data
   repair.
3. Keep genuinely open defects and accepted limitations in the active section.
4. Re-verify BUG-031 before changing its status: Epic 22 changed its UI path,
   but no status change should be inferred without a direct regression check.

### C. Plan and tracker

1. Keep `sprint-status.yaml` as controller-generated history; do not hand-edit
   it or erase done story evidence.
2. Move explicitly superseded planning (starting with Epic 14) to an historical
   appendix in the canonical epic plan, with a short redirect to its successor.
3. Reconcile an epic from `in-progress` to `done` only after checking all of
   its current parsed stories. Do not use archival cleanup to claim delivery.
4. Create a short `Current roadmap` index that points only to epics with
   unfinished, non-superseded stories. This is a navigation aid, not a new
   source of truth.

## 5. Handoff and success criteria

**Scope classification:** Moderate documentation and tracking reorganisation.

Success means:

- active deferred-work file contains only active DW entries;
- `ISSUES.md` separates fixed, pending operational follow-up, and open items;
- superseded planning remains traceable but is not presented as current work;
- tracker validates through its controller with no illegal key or status;
- no source/runtime files, deployments, or production data are changed.

