package com.hatcast.api.inbox

import com.hatcast.api.agenda.AgendaTimeBoundary
import com.hatcast.api.agenda.UserAgendaRepository
import com.hatcast.api.agenda.UserAgendaRow
import com.hatcast.api.agenda.dto.UserAgendaItemDto
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.composition.CompositionLinkedParticipantResolver
import com.hatcast.api.composition.CompositionLifecycleEnrichmentService
import com.hatcast.api.event.EventParticipantFocusService
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.dto.ParticipantFocusSummaryDto
import com.hatcast.api.inbox.dto.InboxActionDto
import com.hatcast.api.inbox.dto.InboxActionType
import com.hatcast.api.inbox.dto.InboxSeasonGlanceQueryDto
import com.hatcast.api.inbox.dto.InboxShortcutsDto
import com.hatcast.api.inbox.dto.MeInboxResponse
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonStatisticsService
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

private const val INBOX_UPCOMING_PAGE_SIZE = 50

@Service
class MeInboxService(
  private val userAgendaRepository: UserAgendaRepository,
  private val meInboxRepository: MeInboxRepository,
  private val availabilityService: AvailabilityService,
  private val eventRepository: EventRepository,
  private val seasonParticipantRepository: SeasonParticipantRepository,
  private val eventParticipantRepository: EventParticipantRepository,
  private val compositionLifecycleEnrichment: CompositionLifecycleEnrichmentService,
  private val participantFocusService: EventParticipantFocusService,
) {
  @Transactional(readOnly = true)
  fun getInbox(principal: SessionUserPrincipal): MeInboxResponse {
    val userId = principal.userId
    val noParticipation = participationContext(userId).noParticipation
    val from = AgendaTimeBoundary.startOfTodayInclusive()
    val referenceNow = Instant.now()

    val upcomingPage =
      userAgendaRepository.findUpcomingForUser(
        userId = userId,
        fromInclusive = from,
        troupeId = null,
        seasonId = null,
        pageable = PageRequest.of(0, INBOX_UPCOMING_PAGE_SIZE),
      )
    val upcomingRows = upcomingPage.content
    val rowsByEventId = upcomingRows.associateBy { it.eventId }

    val eventIds = upcomingRows.map { it.eventId }
    val availabilityByEvent = availabilityService.myStatusByEventIds(eventIds, userId)
    val lifecycleByEvent =
      compositionLifecycleEnrichment.loadViewsByEventIdsAcrossSeasons(eventIds, principal)

    val availabilityActions =
      upcomingRows
        .filter { row ->
          availabilityByEvent[row.eventId] == AvailabilityStatusMapper.UNKNOWN &&
            AgendaTimeBoundary.isWithinCalendarDaysFromNow(
              row.startsAt,
              referenceNow,
              AgendaTimeBoundary.INBOX_AVAILABILITY_HORIZON_DAYS,
            )
        }.map { InboxActionDto.availabilityUnknown(it) }

    val pendingSlots = meInboxRepository.findPendingConfirmationSlotsForUser(userId, from)
    val missingEventIds = pendingSlots.map { it.eventId }.filter { it !in rowsByEventId }.toSet()
    val extraRows =
      if (missingEventIds.isEmpty()) {
        emptyList()
      } else {
        userAgendaRepository.findParticipatedEventsByIds(userId, missingEventIds)
      }
    val allRowsByEventId = rowsByEventId + extraRows.associateBy { it.eventId }

    val slotEventIds = pendingSlots.map { it.eventId }.toSet()
    val eventsById =
      if (slotEventIds.isEmpty()) {
        emptyMap()
      } else {
        eventRepository.findAllById(slotEventIds).associateBy { it.id }
      }
    val viewerIdsByEventId = mutableMapOf<UUID, Set<UUID>>()

    val confirmActions =
      pendingSlots.mapNotNull { slot ->
        val row = allRowsByEventId[slot.eventId] ?: return@mapNotNull null
        val assigneeId = slot.seasonParticipantId ?: slot.eventParticipantId ?: return@mapNotNull null
        val event = eventsById[slot.eventId] ?: return@mapNotNull null
        val viewerIds =
          viewerIdsByEventId.getOrPut(slot.eventId) {
            CompositionLinkedParticipantResolver.resolveViewerParticipantIds(
              season = event.season,
              eventId = slot.eventId,
              userId = userId,
              seasonParticipantRepository = seasonParticipantRepository,
              eventParticipantRepository = eventParticipantRepository,
            )
          }
        if (assigneeId !in viewerIds) {
          return@mapNotNull null
        }
        val roleLabel = SeasonStatisticsService.ROLE_LABELS[slot.roleKey] ?: slot.roleKey
        InboxActionDto.compositionConfirmPending(row, slot.roleKey, roleLabel)
      }

    val actions = sortActions(availabilityActions + confirmActions)

    val nextEventRow = upcomingRows.firstOrNull()
    val nextEvent =
      nextEventRow?.let { row ->
        val availability = availabilityByEvent[row.eventId]
        UserAgendaItemDto.from(
          row = row,
          myAvailabilityStatus = availability,
          teamStatusBadge = lifecycleByEvent[row.eventId]?.teamStatusBadge?.toDto(),
          participantFocus = participantFocusForRow(row, availability, principal),
        )
      }

    val glanceSource = nextEventRow ?: upcomingRows.firstOrNull()
    val shortcuts =
      InboxShortcutsDto(
        lastSeasonSlug = glanceSource?.seasonSlug,
        seasonGlanceQuery =
          InboxSeasonGlanceQueryDto(
            troupeId = glanceSource?.troupeId,
            seasonId = glanceSource?.seasonId,
          ),
      )

    return MeInboxResponse(
      actions = actions,
      nextEvent = nextEvent,
      shortcuts = shortcuts,
      noParticipation = noParticipation,
    )
  }

  private fun sortActions(actions: List<InboxActionDto>): List<InboxActionDto> =
    actions.sortedWith(
      compareBy<InboxActionDto> { it.startsAt }
        .thenBy { typeSortOrder(it.type) },
    )

  private fun typeSortOrder(type: InboxActionType): Int =
    when (type) {
      InboxActionType.COMPOSITION_CONFIRM_PENDING -> 0
      InboxActionType.AVAILABILITY_UNKNOWN -> 1
    }

  private fun participantFocusForRow(
    row: UserAgendaRow,
    myAvailabilityStatus: String?,
    principal: SessionUserPrincipal,
  ): ParticipantFocusSummaryDto? {
    val event = eventRepository.findById(row.eventId).orElse(null) ?: return null
    val focusParticipantId =
      participantFocusService.resolveFocusParticipantId(row.seasonId, null, principal)
        ?: return null
    return participantFocusService
      .summariesByEventIds(
        season = event.season,
        eventIds = listOf(row.eventId),
        focusParticipantId = focusParticipantId,
        availabilityByEvent =
          mapOf(
            row.eventId to (myAvailabilityStatus ?: AvailabilityStatusMapper.UNKNOWN),
          ),
        principal = principal,
      )[row.eventId]
  }

  private fun participationContext(userId: UUID): ParticipationContext {
    val seasonIds =
      (
        userAgendaRepository.findParticipatingSeasonIdsFromSeason(userId) +
          userAgendaRepository.findParticipatingSeasonIdsFromEventOnly(userId)
      ).toSet()
    return ParticipationContext(noParticipation = seasonIds.isEmpty())
  }
}

private data class ParticipationContext(
  val noParticipation: Boolean,
)
