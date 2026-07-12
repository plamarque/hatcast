package com.hatcast.api.participant

/**
 * Resolves effective participation mode (ADR-0022): explicit column wins; legacy fallback from invitation_scope + membership link.
 */
fun SeasonParticipantEntity.effectiveParticipationMode(): SeasonParticipationMode? =
    participationMode
        ?: when (invitationScope) {
            InvitationScope.SEASON -> SeasonParticipationMode.GUEST_SEASON
            InvitationScope.EVENT -> SeasonParticipationMode.GUEST_EVENT
            null ->
                if (troupeMembership != null) {
                    SeasonParticipationMode.MEMBER_SYNC
                } else {
                    null
                }
        }

fun SeasonParticipantEntity.grantsMemberSeasonWorkspace(): Boolean =
    effectiveParticipationMode() == SeasonParticipationMode.MEMBER_SYNC

fun SeasonParticipantEntity.grantsGuestSeasonWorkspace(): Boolean =
    when (effectiveParticipationMode()) {
        SeasonParticipationMode.GUEST_SEASON -> true
        SeasonParticipationMode.GUEST_EVENT -> false
        SeasonParticipationMode.MEMBER_SYNC -> false
        null -> invitationScope == InvitationScope.SEASON
    }

fun SeasonParticipantEntity.grantsGuestEventWorkspace(): Boolean =
    when (effectiveParticipationMode()) {
        SeasonParticipationMode.GUEST_EVENT -> true
        SeasonParticipationMode.GUEST_SEASON,
        SeasonParticipationMode.MEMBER_SYNC,
        -> false
        null -> invitationScope == InvitationScope.EVENT
    }
