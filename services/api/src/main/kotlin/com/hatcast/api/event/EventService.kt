package com.hatcast.api.event

import com.hatcast.api.event.dto.CreateEventRequest
import com.hatcast.api.event.dto.EventResponseDto
import com.hatcast.api.event.dto.PagedEventsResponse
import com.hatcast.api.event.dto.UpdateEventRequest
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.UUID

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val seasonRepository: SeasonRepository,
    private val troupeAccess: TroupeAccessService,
) {
    companion object {
        /** Fuseau pour la borne « début du jour civil » (liste à venir / agenda). */
        val AGENDA_ZONE: ZoneId = ZoneId.of("Europe/Paris")
    }

    @Transactional(readOnly = true)
    fun listForSeason(
        seasonId: UUID,
        page: Int,
        size: Int,
        scope: EventListScope,
    ): PagedEventsResponse {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(season.troupe.id)
        if (size < 1 || size > 100) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "size doit être entre 1 et 100")
        }
        if (page < 0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "page invalide")
        }
        val pr = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startsAt"))
        val p =
            when (scope) {
                EventListScope.ALL ->
                    eventRepository.findBySeason_IdOrderByStartsAtAsc(seasonId, pr)
                EventListScope.UPCOMING -> {
                    val from = startOfTodayInclusive(AGENDA_ZONE)
                    eventRepository.findUpcomingNonArchived(seasonId, from, pr)
                }
            }
        return PagedEventsResponse(
            content = p.content.map { EventResponseDto.from(it) },
            page = p.number,
            size = p.size,
            totalElements = p.totalElements,
            totalPages = p.totalPages,
        )
    }

    @Transactional
    fun create(
        seasonId: UUID,
        body: CreateEventRequest,
    ): EventResponseDto {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireCanManageTroupe(season.troupe.id)
        val titleTrim = body.title.trim()
        val now = Instant.now()
        val entity =
            EventEntity(
                season = season,
                title = titleTrim,
                description = body.description?.trim()?.takeIf { it.isNotEmpty() },
                location = body.location?.trim()?.takeIf { it.isNotEmpty() },
                startsAt = body.startsAt,
                archived = false,
                createdAt = now,
                updatedAt = now,
            )
        val saved = eventRepository.save(entity)
        season.eventCount += 1
        season.updatedAt = now
        seasonRepository.save(season)
        return EventResponseDto.from(saved)
    }

    @Transactional
    fun update(
        seasonId: UUID,
        eventId: UUID,
        body: UpdateEventRequest,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        troupeAccess.requireCanManageTroupe(e.season.troupe.id)
        if (body.title != null) {
            val t = body.title.trim()
            if (t.isEmpty()) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Titre vide")
            }
            e.title = t
        }
        if (body.startsAt != null) {
            e.startsAt = body.startsAt
        }
        if (body.description != null) {
            e.description = body.description.trim().takeIf { it.isNotEmpty() }
        }
        if (body.location != null) {
            e.location = body.location.trim().takeIf { it.isNotEmpty() }
        }
        e.updatedAt = Instant.now()
        return EventResponseDto.from(eventRepository.save(e))
    }

    @Transactional
    fun archive(
        seasonId: UUID,
        eventId: UUID,
    ): EventResponseDto {
        val e = loadEventInSeason(seasonId, eventId)
        troupeAccess.requireCanManageTroupe(e.season.troupe.id)
        e.archived = true
        e.updatedAt = Instant.now()
        return EventResponseDto.from(eventRepository.save(e))
    }

    private fun loadEventInSeason(
        seasonId: UUID,
        eventId: UUID,
    ): EventEntity {
        val e =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (e.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        return e
    }

    private fun startOfTodayInclusive(zone: ZoneId): Instant {
        val z: ZonedDateTime = ZonedDateTime.now(zone)
        return z.toLocalDate().atStartOfDay(zone).toInstant()
    }
}

enum class EventListScope {
    ALL,
    UPCOMING,
}
