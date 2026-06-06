package com.hatcast.api.participant

enum class GuestSeasonWorkspaceMode {
    /** No season workspace (no invitation). */
    NONE,
    /** Partial workspace — Agenda + Historique, spectacles invités uniquement (invité événement). */
    EVENTS_ONLY,
    /** Partial workspace — Agenda tab only (invité saison). */
    AGENDA_ONLY,
    /** Full member season workspace. */
    FULL,
}
