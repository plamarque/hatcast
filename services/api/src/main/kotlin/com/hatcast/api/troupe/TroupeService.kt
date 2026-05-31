package com.hatcast.api.troupe

import com.hatcast.api.auth.PlatformAdminService
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.dto.CreateTroupeRequest
import com.hatcast.api.troupe.dto.TroupeAdminSummaryDto
import com.hatcast.api.troupe.dto.TroupeListItemDto
import com.hatcast.api.troupe.dto.UpdateTroupeRequest
import com.hatcast.api.user.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class TroupeService(
    private val troupeRepository: TroupeRepository,
    private val membershipRepository: TroupeMembershipRepository,
    private val userRepository: UserRepository,
    private val platformAdminService: PlatformAdminService,
    private val troupeAccess: TroupeAccessService,
    private val membershipService: TroupeMembershipService,
) {
    @Transactional
    fun create(
        body: CreateTroupeRequest,
        principal: SessionUserPrincipal,
    ): TroupeListItemDto {
        val nameTrim = body.name.trim()
        if (nameTrim.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la troupe ne peut pas être vide.")
        }
        val base = TroupeSlugGenerator.slugify(nameTrim)
        if (base.isEmpty()) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Le nom ne permet pas de générer un identifiant URL.",
            )
        }
        val user =
            userRepository
                .findById(principal.userId)
                .orElseThrow { ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur inconnu") }

        repeat(SLUG_RACE_RETRIES) {
            val slug = TroupeSlugGenerator.allocateUniqueSlug(base, troupeRepository)
            val troupeId = UUID.randomUUID()
            val now = Instant.now()
            try {
                val troupe =
                    troupeRepository.saveAndFlush(
                        TroupeEntity(
                            id = troupeId,
                            name = nameTrim,
                            slug = slug,
                            createdAt = now,
                        ),
                    )
                val membership =
                    membershipRepository.saveAndFlush(
                        TroupeMembershipEntity(
                            troupe = troupe,
                            user = user,
                            status = TroupeMembershipStatus.ACTIVE,
                            baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                            displayName = MemberDisplayNameResolver.resolve(user),
                            createdAt = now,
                            updatedAt = now,
                        ),
                    )
                return TroupeListItemDto.from(
                    troupe = troupe,
                    membership = membership,
                    activeMemberCount = 1L,
                    upcomingEventCount = 0L,
                )
            } catch (_: DataIntegrityViolationException) {
                // Slug race or unique constraint — retry with next candidate.
            }
        }
        throw ResponseStatusException(
            HttpStatus.CONFLICT,
            "Impossible de créer la troupe, réessayez.",
        )
    }

    @Transactional(readOnly = true)
    fun getBySlugForPlatformAdmin(
        slug: String,
        principal: SessionUserPrincipal,
    ): TroupeAdminSummaryDto {
        if (!platformAdminService.isPlatformAdmin(principal)) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Accès réservé aux administrateurs de la plateforme.",
            )
        }
        val normalized = slug.trim()
        if (normalized.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug de troupe invalide.")
        }
        val troupe =
            troupeRepository.findBySlug(normalized)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        return TroupeAdminSummaryDto.from(troupe)
    }

    @Transactional
    fun update(
        troupeId: UUID,
        body: UpdateTroupeRequest,
        principal: SessionUserPrincipal,
    ): TroupeListItemDto {
        troupeAccess.requireCanManageTroupe(principal, troupeId)
        val nameTrim = body.name.trim()
        if (nameTrim.isEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nom de la troupe ne peut pas être vide.")
        }
        val troupe =
            troupeRepository.findById(troupeId).orElse(null)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        troupe.name = nameTrim
        val saved = troupeRepository.save(troupe)
        return membershipService.buildTroupeListItemForViewer(principal, saved)
    }

    @Transactional
    fun updateJoinPolicy(
        troupeId: UUID,
        joinPolicy: TroupeJoinPolicy,
    ): TroupeAdminSummaryDto {
        val troupe =
            troupeRepository.findById(troupeId).orElse(null)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Troupe inconnue")
        troupe.joinPolicy = joinPolicy
        return TroupeAdminSummaryDto.from(troupeRepository.save(troupe))
    }

    companion object {
        private const val SLUG_RACE_RETRIES = 5
    }
}
