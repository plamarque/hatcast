package com.hatcast.api.availability

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.dto.MyAvailabilityResponse
import com.hatcast.api.availability.dto.SetMyAvailabilityRequest
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class AvailabilityService(
    private val availabilityRepository: EventAvailabilityRepository,
    private val eventRepository: EventRepository,
    private val seasonRepository: SeasonRepository,
    private val troupeAccess: TroupeAccessService,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun getMyStatus(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): MyAvailabilityResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        return toResponse(findRow(event.id, principal.userId))
    }

    @Transactional
    fun setMyStatus(
        seasonId: UUID,
        eventId: UUID,
        body: SetMyAvailabilityRequest,
        principal: SessionUserPrincipal,
    ): MyAvailabilityResponse {
        val event = loadAuthorizedEvent(seasonId, eventId, principal)
        val apiStatus =
            try {
                AvailabilityStatusMapper.parseApi(body.status)
            } catch (_: IllegalArgumentException) {
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "status invalide")
            }
        val stored = AvailabilityStatusMapper.toStored(apiStatus)
        val existing = findRow(event.id, principal.userId)
        if (stored == null) {
            if (existing != null) {
                availabilityRepository.delete(existing)
            }
            return MyAvailabilityResponse(status = AvailabilityStatusMapper.UNKNOWN)
        }
        val now = Instant.now()
        val saved =
            if (existing != null) {
                existing.status = stored
                existing.updatedAt = now
                availabilityRepository.save(existing)
            } else {
                val user =
                    userRepository.findById(principal.userId).orElseThrow {
                        ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu")
                    }
                availabilityRepository.save(
                    EventAvailabilityEntity(
                        event = event,
                        user = user,
                        status = stored,
                        now = now,
                    ),
                )
            }
        return toResponse(saved)
    }

    @Transactional(readOnly = true)
    fun myStatusByEventIds(
        eventIds: Collection<UUID>,
        userId: UUID,
    ): Map<UUID, String> {
        if (eventIds.isEmpty()) {
            return emptyMap()
        }
        val rows = availabilityRepository.findByEvent_IdInAndUser_Id(eventIds, userId)
        val byEvent = rows.associate { it.event.id to AvailabilityStatusMapper.toApi(it.status) }
        return eventIds.associateWith { byEvent[it] ?: AvailabilityStatusMapper.UNKNOWN }
    }

    private fun loadAuthorizedEvent(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ): EventEntity {
        val season =
            seasonRepository
                .findById(seasonId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Saison inconnue") }
        troupeAccess.requireActiveMember(principal, season.troupe.id)
        val event =
            eventRepository
                .findById(eventId)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu") }
        if (event.season.id != seasonId) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
        }
        return event
    }

    private fun findRow(
        eventId: UUID,
        userId: UUID,
    ): EventAvailabilityEntity? = availabilityRepository.findByEvent_IdAndUser_Id(eventId, userId)

    private fun toResponse(row: EventAvailabilityEntity?): MyAvailabilityResponse =
        if (row == null) {
            MyAvailabilityResponse(status = AvailabilityStatusMapper.UNKNOWN)
        } else {
            MyAvailabilityResponse(
                status = AvailabilityStatusMapper.toApi(row.status),
                updatedAt = row.updatedAt,
            )
        }
}
