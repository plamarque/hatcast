# La Malice draw configuration

Requires explicit authorization for production. Use the existing admin operations for La Malice.

1. Before changing anything, export the troupe and season policies, the category record, the custom formula record and the exact event IDs currently tagged `aperocks`. Capture composition and chance snapshot counts for those events. Confirm none uses the travel template, identify the troupe's V1 standard formula and verify whether any season policy overrides the troupe rule. The read-only check on November 14 found 9 events, 4 validated compositions and 28 eligible selections.
2. Set V1 standard as the mandatory default and remove the Aperocks override. Make any required season policy change in the same scope. Verify formula resolution for ordinary, CCAS and travel events.
3. Check the category removal preview against the exported IDs and count. Remove the La Malice category through the existing admin operation. Verify those exact events now resolve as ordinary and their compositions and snapshot rows remain present. Verify another troupe's category is unaffected.
4. Archive the custom Aperocks formula only after removing all policy references. Verify that it is absent from active choices. Check live Dispos and organizer draw context for standard formula and the expected category histories. Do not launch a real draw as a verification step.

To roll back, recreate the category with its previous slug and label, restore the category on the captured events only, republish the archived formula, and restore the exported policies. Verify the affected events and formula resolution. The recreated category record has a new ID.

Verify the deployed application shows recorded percentages without reconstructed factors or ranking for past draws (BUG-120) before changing the production policy.
