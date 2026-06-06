package com.hatcast.api.e2e

import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.e2e.dto.Story325FixtureResponse
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantExclusionRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.InvitationScope
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeExterneCarnetService
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
@Profile("e2e")
class E2eStory325FixtureService(
    private val troupeRepository: TroupeRepository,
    private val seasonRepository: SeasonRepository,
    private val eventRepository: EventRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val eventParticipantExclusionRepository: EventParticipantExclusionRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val compositionRepository: EventCompositionRepository,
    private val compositionSlotRepository: EventCompositionSlotRepository,
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val troupeExterneCarnetService: TroupeExterneCarnetService,
    private val userRepository: UserRepository,
) {
    @Transactional
    fun resetStory325(): Story325FixtureResponse {
        val troupe =
            troupeRepository.findById(SEED_TROUPE_ID).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Seed troupe missing")
            }
        val memberSeason =
            seasonRepository.findByTroupe_IdAndSlug(SEED_TROUPE_ID, MEMBER_SEASON_SLUG)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Member season seed missing")

        val carnetOnlyUser = ensureGuestUser(GUEST_CARNET_ONLY)
        val laetitiaUser = ensureGuestUser(GUEST_LAETITIA)
        val rubenUser = ensureGuestUser(GUEST_RUBEN)
        val piotrixUser = ensureGuestUser(GUEST_PIOTRIX)
        val multiUser = ensureGuestUser(GUEST_MULTI)

        listOf(carnetOnlyUser, laetitiaUser, rubenUser, piotrixUser, multiUser).forEach {
            purgeGuestInvitations(it.id)
        }

        ensureCarnetOnly(carnetOnlyUser)

        val laetitiaSeason = resetGuestSeason("Guest 325 Laetitia SEASON", LAETITIA_SEASON_SLUG)
        val laetitiaPublishedA =
            createEvent(
                laetitiaSeason,
                slug = "guest-325-laetitia-a",
                title = LAETITIA_EVENT_A_TITLE,
                startsAt = daysFromNow(45),
                published = true,
            )
        val laetitiaPublishedB =
            createEvent(
                laetitiaSeason,
                slug = "guest-325-laetitia-b",
                title = LAETITIA_EVENT_B_TITLE,
                startsAt = daysFromNow(60),
                published = true,
            )
        createEvent(
            laetitiaSeason,
            slug = "guest-325-laetitia-draft",
            title = LAETITIA_DRAFT_TITLE,
            startsAt = daysFromNow(75),
            published = false,
        )
        addSeasonScopedGuest(laetitiaSeason, laetitiaUser, "Laetitia Guest")

        val rubenSeason = resetGuestSeason("Guest 325 Ruben EVENT", RUBEN_SEASON_SLUG)
        val rubenInvitedFuture =
            createEvent(
                rubenSeason,
                slug = "guest-325-ruben-futur-invite",
                title = RUBEN_INVITED_FUTURE_TITLE,
                startsAt = daysFromNow(40),
                published = true,
            )
        createEvent(
            rubenSeason,
            slug = "guest-325-ruben-futur-sibling",
            title = RUBEN_SIBLING_FUTURE_TITLE,
            startsAt = daysFromNow(50),
            published = true,
        )
        createEvent(
            rubenSeason,
            slug = "guest-325-ruben-passe-invite",
            title = RUBEN_INVITED_PAST_TITLE,
            startsAt = daysFromNow(-40),
            published = true,
        ).also { pastInvited ->
            addEventScopedGuest(rubenSeason, pastInvited, rubenUser, "Ruben Guest")
        }
        createEvent(
            rubenSeason,
            slug = "guest-325-ruben-passe-sibling",
            title = RUBEN_SIBLING_PAST_TITLE,
            startsAt = daysFromNow(-50),
            published = true,
        )
        createEvent(
            rubenSeason,
            slug = "guest-325-ruben-brouillon-invite",
            title = RUBEN_UNPUBLISHED_TITLE,
            startsAt = daysFromNow(55),
            published = false,
        ).also { unpublishedInvited ->
            addEventScopedGuest(rubenSeason, unpublishedInvited, rubenUser, "Ruben Guest")
        }
        val rubenSeasonParticipant =
            addEventScopedGuest(rubenSeason, rubenInvitedFuture, rubenUser, "Ruben Guest")
        seedValidatedComposition(rubenInvitedFuture.id, rubenSeasonParticipant.id)

        val piotrixSeasonA = resetGuestSeason("Guest 325 Piotrix A", PIOTRIX_SEASON_A_SLUG)
        val piotrixInvitedEvent =
            createEvent(
                piotrixSeasonA,
                slug = "guest-325-piotrix-invite",
                title = PIOTRIX_INVITED_TITLE,
                startsAt = daysFromNow(35),
                published = true,
            )
        createEvent(
            piotrixSeasonA,
            slug = "guest-325-piotrix-sibling",
            title = "Piotrix sibling futur",
            startsAt = daysFromNow(65),
            published = true,
        )
        addEventScopedGuest(piotrixSeasonA, piotrixInvitedEvent, piotrixUser, "Piotrix Guest")

        val piotrixSeasonB = resetGuestSeason("Guest 325 Piotrix B", PIOTRIX_SEASON_B_SLUG)
        createEvent(
            piotrixSeasonB,
            slug = "guest-325-piotrix-b-event",
            title = "Piotrix saison B spectacle",
            startsAt = daysFromNow(42),
            published = true,
        )

        purgeGuestInvitations(multiUser.id)
        addSeasonScopedGuest(laetitiaSeason, multiUser, "Multi Guest")
        addEventScopedGuest(rubenSeason, rubenInvitedFuture, multiUser, "Multi Guest")

        return Story325FixtureResponse(
            troupeSlug = troupe.slug,
            memberSeasonSlug = memberSeason.slug,
            laetitiaSeasonSlug = laetitiaSeason.slug,
            laetitiaSeasonId = laetitiaSeason.id,
            laetitiaPublishedEventTitles = listOf(laetitiaPublishedA.title, laetitiaPublishedB.title),
            laetitiaDraftEventTitle = LAETITIA_DRAFT_TITLE,
            rubenSeasonSlug = rubenSeason.slug,
            rubenSeasonId = rubenSeason.id,
            rubenInvitedFutureSlug = rubenInvitedFuture.slug,
            rubenInvitedFutureTitle = RUBEN_INVITED_FUTURE_TITLE,
            rubenSiblingFutureTitle = RUBEN_SIBLING_FUTURE_TITLE,
            rubenInvitedPastTitle = RUBEN_INVITED_PAST_TITLE,
            rubenSiblingPastTitle = RUBEN_SIBLING_PAST_TITLE,
            rubenUnpublishedInvitedTitle = RUBEN_UNPUBLISHED_TITLE,
            piotrixSeasonASlug = piotrixSeasonA.slug,
            piotrixSeasonBSlug = piotrixSeasonB.slug,
            piotrixInvitedEventSlug = piotrixInvitedEvent.slug,
            piotrixInvitedEventTitle = PIOTRIX_INVITED_TITLE,
            multiAgendaEventTitles =
                listOf(
                    LAETITIA_EVENT_A_TITLE,
                    LAETITIA_EVENT_B_TITLE,
                    RUBEN_INVITED_FUTURE_TITLE,
                ),
        )
    }

    private fun ensureGuestUser(persona: GuestPersona): UserEntity {
        val existing = userRepository.findByGoogleSub(persona.googleSub)
        if (existing != null) {
            existing.email = persona.email
            existing.displayName = persona.displayName
            existing.memberDisplayName = persona.displayName
            existing.slug = persona.slug
            existing.updatedAt = Instant.now()
            return userRepository.save(existing)
        }
        val now = Instant.now()
        return userRepository.save(
            UserEntity(
                id = persona.userId,
                googleSub = persona.googleSub,
                email = persona.email,
                displayName = persona.displayName,
                memberDisplayName = persona.displayName,
                slug = persona.slug,
                activatedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    private fun ensureCarnetOnly(user: UserEntity) {
        purgeGuestInvitations(user.id)
        val carnet =
            troupeExterneCarnetService.upsertActiveExterne(
                troupeId = SEED_TROUPE_ID,
                displayName = "Carnet Only Guest",
                email = user.email,
                actorUserId = E2E_ACTOR_USER_ID,
            )
        carnet.user = user
        carnet.status = TroupeMembershipStatus.ACTIVE
        troupeMembershipRepository.save(carnet)
    }

    private fun purgeGuestInvitations(userId: UUID) {
        val now = Instant.now()
        val seasonRows =
            seasonParticipantRepository.findAllByUser_Id(userId).toMutableList()
        troupeMembershipRepository.findByTroupe_IdAndUser_Id(SEED_TROUPE_ID, userId)?.let { membership ->
            seasonRows.addAll(seasonParticipantRepository.findByTroupeMembership_Id(membership.id))
        }
        seasonRows.distinctBy { it.id }.forEach { row ->
            if (row.status == ParticipantStatus.ACTIVE) {
                row.status = ParticipantStatus.REMOVED
                row.removedAt = now
                row.updatedAt = now
                seasonParticipantRepository.save(row)
            }
        }
        eventParticipantRepository.findAllByUser_Id(userId).forEach { row ->
            if (row.status == ParticipantStatus.ACTIVE) {
                row.status = ParticipantStatus.REMOVED
                row.removedAt = now
                row.updatedAt = now
                eventParticipantRepository.save(row)
            }
        }
    }

    private fun resetGuestSeason(
        title: String,
        slug: String,
    ): SeasonEntity {
        val troupe =
            troupeRepository.findById(SEED_TROUPE_ID).orElseThrow {
                ResponseStatusException(HttpStatus.NOT_FOUND, "Seed troupe missing")
            }
        val existing = seasonRepository.findByTroupe_IdAndSlug(SEED_TROUPE_ID, slug)
        if (existing != null) {
            purgeSeason(existing.id)
            existing.title = title
            existing.archived = false
            existing.isActive = true
            existing.updatedAt = Instant.now()
            return seasonRepository.save(existing)
        }
        val now = Instant.now()
        return seasonRepository.save(
            SeasonEntity(
                troupe = troupe,
                slug = slug,
                title = title,
                archived = false,
                isActive = true,
                eventCount = 0,
                participantCount = 0,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    private fun purgeSeason(seasonId: UUID) {
        val events = eventRepository.findNonArchivedBySeasonId(seasonId)
        val eventIds = events.map { it.id }
        if (eventIds.isNotEmpty()) {
            availabilityRepository.deleteAll(availabilityRepository.findByEvent_IdIn(eventIds))
            compositionSlotRepository.deleteAll(compositionSlotRepository.findByEventIdIn(eventIds))
            for (eventId in eventIds) {
                compositionRepository.findById(eventId).ifPresent { compositionRepository.delete(it) }
            }
            for (event in events) {
                eventParticipantExclusionRepository
                    .findByIdEventId(event.id)
                    .forEach { eventParticipantExclusionRepository.delete(it) }
                val participants =
                    eventParticipantRepository.findByEvent_IdAndStatusOrderByDisplayNameAsc(
                        event.id,
                        ParticipantStatus.ACTIVE,
                    ) +
                        eventParticipantRepository.findByEvent_IdAndStatusOrderByDisplayNameAsc(
                            event.id,
                            ParticipantStatus.REMOVED,
                        )
                eventParticipantRepository.deleteAll(participants.distinctBy { it.id })
            }
            eventRepository.deleteAll(events)
        }
        listOf(ParticipantStatus.ACTIVE, ParticipantStatus.REMOVED).forEach { status ->
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, status)
                .forEach { seasonParticipantRepository.delete(it) }
        }
    }

    private fun createEvent(
        season: SeasonEntity,
        slug: String,
        title: String,
        startsAt: Instant,
        published: Boolean,
    ): EventEntity {
        val now = Instant.now()
        val saved =
            eventRepository.save(
                EventEntity(
                    season = season,
                    title = title,
                    slug = slug,
                    startsAt = startsAt,
                    roleSlots = mapOf("player" to 2, "mc" to 1),
                    availabilityOpenedAt = if (published) now else null,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        season.eventCount = eventRepository.findNonArchivedBySeasonId(season.id).size
        season.updatedAt = now
        seasonRepository.save(season)
        return saved
    }

    private fun addSeasonScopedGuest(
        season: SeasonEntity,
        user: UserEntity,
        displayName: String,
    ) {
        val carnet =
            troupeExterneCarnetService.upsertActiveExterne(
                troupeId = SEED_TROUPE_ID,
                displayName = displayName,
                email = user.email,
                actorUserId = E2E_ACTOR_USER_ID,
            )
        carnet.user = user
        troupeMembershipRepository.save(carnet)
        val now = Instant.now()
        seasonParticipantRepository
            .findBySeason_IdAndStatusAndTroupeMembership_Id(
                season.id,
                ParticipantStatus.REMOVED,
                carnet.id,
            )
            ?.let { removed ->
                removed.displayName = displayName
                removed.normalizedEmail = user.email?.lowercase()
                removed.user = user
                removed.troupeMembership = carnet
                removed.invitationScope = InvitationScope.SEASON
                removed.status = ParticipantStatus.ACTIVE
                removed.removedAt = null
                removed.removalSource = null
                removed.updatedAt = now
                seasonParticipantRepository.save(removed)
                refreshParticipantCount(season)
                return
            }
        seasonParticipantRepository
            .findBySeason_IdAndStatusAndTroupeMembership_Id(
                season.id,
                ParticipantStatus.ACTIVE,
                carnet.id,
            )
            ?.let {
                it.invitationScope = InvitationScope.SEASON
                it.updatedAt = now
                seasonParticipantRepository.save(it)
                refreshParticipantCount(season)
                return
            }
        seasonParticipantRepository.save(
            SeasonParticipantEntity(
                season = season,
                displayName = displayName,
                normalizedEmail = user.email?.lowercase(),
                user = user,
                troupeMembership = carnet,
                invitationScope = InvitationScope.SEASON,
                status = ParticipantStatus.ACTIVE,
                createdAt = now,
                updatedAt = now,
            ),
        )
        refreshParticipantCount(season)
    }

    private fun addEventScopedGuest(
        season: SeasonEntity,
        event: EventEntity,
        user: UserEntity,
        displayName: String,
    ): SeasonParticipantEntity {
        val carnet =
            troupeExterneCarnetService.upsertActiveExterne(
                troupeId = SEED_TROUPE_ID,
                displayName = displayName,
                email = user.email,
                actorUserId = E2E_ACTOR_USER_ID,
            )
        carnet.user = user
        troupeMembershipRepository.save(carnet)
        val now = Instant.now()
        val seasonRow =
            seasonParticipantRepository
                .findBySeason_IdAndStatusAndTroupeMembership_Id(
                    season.id,
                    ParticipantStatus.REMOVED,
                    carnet.id,
                )
                ?.also {
                    it.displayName = displayName
                    it.normalizedEmail = user.email?.lowercase()
                    it.user = user
                    it.troupeMembership = carnet
                    it.invitationScope = InvitationScope.EVENT
                    it.status = ParticipantStatus.ACTIVE
                    it.removedAt = null
                    it.removalSource = null
                    it.updatedAt = now
                    seasonParticipantRepository.save(it)
                }
                ?: seasonParticipantRepository
                    .findBySeason_IdAndStatusAndTroupeMembership_Id(
                        season.id,
                        ParticipantStatus.ACTIVE,
                        carnet.id,
                    )
                    ?.also {
                        it.invitationScope = InvitationScope.EVENT
                        it.user = user
                        it.updatedAt = now
                        seasonParticipantRepository.save(it)
                    }
                ?: seasonParticipantRepository.save(
                    SeasonParticipantEntity(
                        season = season,
                        displayName = displayName,
                        normalizedEmail = user.email?.lowercase(),
                        user = user,
                        troupeMembership = carnet,
                        invitationScope = InvitationScope.EVENT,
                        status = ParticipantStatus.ACTIVE,
                        createdAt = now,
                        updatedAt = now,
                    ),
                )
        eventParticipantRepository
            .findByEvent_IdAndStatusAndSeasonParticipant_TroupeMembership_Id(
                event.id,
                ParticipantStatus.REMOVED,
                carnet.id,
            )
            .firstOrNull()
            ?.let { removed ->
                removed.status = ParticipantStatus.ACTIVE
                removed.removedAt = null
                removed.updatedAt = now
                removed.seasonParticipant = seasonRow
                eventParticipantRepository.save(removed)
                refreshParticipantCount(season)
                return seasonRow
            }
        eventParticipantRepository
            .findByEvent_IdAndStatusAndSeasonParticipant_TroupeMembership_Id(
                event.id,
                ParticipantStatus.ACTIVE,
                carnet.id,
            )
            .firstOrNull()
            ?.let {
                refreshParticipantCount(season)
                return seasonRow
            }
        eventParticipantRepository.save(
            EventParticipantEntity(
                event = event,
                displayName = displayName,
                normalizedEmail = user.email?.lowercase(),
                user = user,
                seasonParticipant = seasonRow,
                status = ParticipantStatus.ACTIVE,
                createdAt = now,
                updatedAt = now,
            ),
        )
        refreshParticipantCount(season)
        return seasonRow
    }

    private fun seedValidatedComposition(
        eventId: UUID,
        seasonParticipantId: UUID,
    ) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                publishedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
        compositionSlotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = seasonParticipantId,
                participationStatus = SlotParticipationStatus.CONFIRMED,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    private fun refreshParticipantCount(season: SeasonEntity) {
        season.participantCount =
            seasonParticipantRepository.countBySeason_IdAndStatus(season.id, ParticipantStatus.ACTIVE).toInt()
        season.updatedAt = Instant.now()
        seasonRepository.save(season)
    }

    private fun daysFromNow(days: Long): Instant = Instant.now().plus(days, ChronoUnit.DAYS)

    private data class GuestPersona(
        val userId: UUID,
        val googleSub: String,
        val email: String,
        val displayName: String,
        val slug: String,
    )

    companion object {
        private val SEED_TROUPE_ID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        private val E2E_ACTOR_USER_ID = UUID.fromString("d0000001-0000-4000-8000-000000000022")

        const val MEMBER_SEASON_SLUG = "les-improbots-2026-2027"
        const val LAETITIA_SEASON_SLUG = "guest-325-laetitia"
        const val RUBEN_SEASON_SLUG = "guest-325-ruben"
        const val PIOTRIX_SEASON_A_SLUG = "guest-325-piotrix-a"
        const val PIOTRIX_SEASON_B_SLUG = "guest-325-piotrix-b"

        const val LAETITIA_EVENT_A_TITLE = "Laetitia show A"
        const val LAETITIA_EVENT_B_TITLE = "Laetitia show B"
        const val LAETITIA_DRAFT_TITLE = "Laetitia brouillon"
        const val RUBEN_INVITED_FUTURE_TITLE = "Ruben futur invité"
        const val RUBEN_SIBLING_FUTURE_TITLE = "Ruben sibling futur"
        const val RUBEN_INVITED_PAST_TITLE = "Ruben passé invité"
        const val RUBEN_SIBLING_PAST_TITLE = "Ruben sibling passé"
        const val RUBEN_UNPUBLISHED_TITLE = "Ruben brouillon invité"
        const val PIOTRIX_INVITED_TITLE = "Piotrix invité"

        private val GUEST_CARNET_ONLY =
            GuestPersona(
                userId = UUID.fromString("d0000001-0000-4000-8000-000000000701"),
                googleSub = "e2e-guest-carnet-only",
                email = "guest-carnet-only@e2e.hatcast.test",
                displayName = "Carnet Only",
                slug = "guest-carnet-only",
            )
        private val GUEST_LAETITIA =
            GuestPersona(
                userId = UUID.fromString("d0000001-0000-4000-8000-000000000702"),
                googleSub = "e2e-guest-laetitia",
                email = "guest-laetitia@e2e.hatcast.test",
                displayName = "Laetitia Guest",
                slug = "guest-laetitia",
            )
        private val GUEST_RUBEN =
            GuestPersona(
                userId = UUID.fromString("d0000001-0000-4000-8000-000000000703"),
                googleSub = "e2e-guest-ruben",
                email = "guest-ruben@e2e.hatcast.test",
                displayName = "Ruben Guest",
                slug = "guest-ruben",
            )
        private val GUEST_PIOTRIX =
            GuestPersona(
                userId = UUID.fromString("d0000001-0000-4000-8000-000000000704"),
                googleSub = "e2e-guest-piotrix",
                email = "guest-piotrix@e2e.hatcast.test",
                displayName = "Piotrix Guest",
                slug = "guest-piotrix",
            )
        private val GUEST_MULTI =
            GuestPersona(
                userId = UUID.fromString("d0000001-0000-4000-8000-000000000705"),
                googleSub = "e2e-guest-multi",
                email = "guest-multi@e2e.hatcast.test",
                displayName = "Multi Guest",
                slug = "guest-multi",
            )
    }
}
