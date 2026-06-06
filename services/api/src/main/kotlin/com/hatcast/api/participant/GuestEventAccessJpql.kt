package com.hatcast.api.participant

/**
 * Shared JPQL fragments for guest invitation scope (ADR-0021, story 3.25).
 * Parameter `:guestUserId` must be bound when used.
 */
object GuestEventAccessJpql {
    /** Season roster rows that expand to all in-scope season events (member sync or SEASON invitation). */
    const val SEASON_ROSTER_PARTICIPANT_FOR_USER =
        """
        SELECT sp FROM SeasonParticipantEntity sp
        LEFT JOIN sp.troupeMembership tm
        WHERE sp.season.id = :seasonId
          AND sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
          AND (
            sp.user.id = :guestUserId
            OR (
              tm IS NOT NULL
              AND tm.user.id = :guestUserId
              AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
            )
          )
          AND (
            sp.invitationScope IS NULL
            OR sp.invitationScope = com.hatcast.api.participant.InvitationScope.SEASON
          )
        """

    const val EVENT_IN_GUEST_SEASON_SCOPE =
        """
        EXISTS (
          SELECT 1 FROM SeasonParticipantEntity sp
          LEFT JOIN sp.troupeMembership tm
          WHERE sp.season.id = e.season.id
            AND sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              sp.user.id = :guestUserId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :guestUserId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
            AND (
              sp.invitationScope IS NULL
              OR sp.invitationScope = com.hatcast.api.participant.InvitationScope.SEASON
            )
            AND NOT EXISTS (
              SELECT 1 FROM EventParticipantExclusionEntity ex
              WHERE ex.id.eventId = e.id
                AND ex.id.seasonParticipantId = sp.id
            )
        )
        """

    const val EVENT_IN_GUEST_EVENT_SCOPE =
        """
        EXISTS (
          SELECT 1 FROM EventParticipantEntity ep
          LEFT JOIN ep.seasonParticipant sp
          LEFT JOIN sp.troupeMembership tm
          WHERE ep.event.id = e.id
            AND ep.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              ep.user.id = :guestUserId
              OR sp.user.id = :guestUserId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :guestUserId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        )
        """

    const val GUEST_ACCESSIBLE_EVENT =
        """
        (
          $EVENT_IN_GUEST_SEASON_SCOPE
          OR $EVENT_IN_GUEST_EVENT_SCOPE
        )
        """
}
