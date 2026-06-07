package com.hatcast.api.auth

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.notification.UserPushSubscriptionRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.context.ApplicationEventPublisher
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class AccountDeletionService(
    private val userRepository: UserRepository,
    private val membershipRepository: TroupeMembershipRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val pushSubscriptionRepository: UserPushSubscriptionRepository,
    private val avatarService: AvatarService,
    private val googleIdTokenService: GoogleIdTokenService,
    private val idpIdTokenVerifier: ObjectProvider<IdpIdTokenVerifier>,
    private val auditRecorder: AuditEventRecorder,
    private val eventPublisher: ApplicationEventPublisher,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun deleteAccount(
        principal: SessionUserPrincipal,
        idToken: String,
    ) {
        val user =
            userRepository.findById(principal.userId).orElseThrow {
                ResponseStatusException(HttpStatus.UNAUTHORIZED)
            }

        if (user.deletedAt != null) {
            throw ResponseStatusException(
                HttpStatus.CONFLICT,
                "Ce compte a déjà été supprimé.",
            )
        }

        ensureNotSoleActiveAdmin(user)
        verifyReAuthToken(user, idToken.trim())

        val now = Instant.now()
        val idpUidForCleanup = user.idpUid

        purgeAvatar(user)
        pushSubscriptionRepository.deleteAllByUserId(user.id)
        deactivateMembershipsWithoutSeasonSync(user.id, now)
        anonymizeLinkedParticipants(user.id, now)
        anonymizeUser(user, now)

        userRepository.save(user)

        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.ACCOUNT_DELETED,
                actorUserId = user.id,
                metadata = mapOf("initiatedBy" to "self"),
            ),
        )

        if (!idpUidForCleanup.isNullOrBlank()) {
            eventPublisher.publishEvent(
                IdentityPlatformUserDeletionRequestedEvent(
                    userId = user.id,
                    idpUid = idpUidForCleanup,
                ),
            )
        }
    }

    private fun ensureNotSoleActiveAdmin(user: UserEntity) {
        val adminMemberships =
            membershipRepository
                .findActiveByUserId(user.id)
                .filter { it.baselineRole == TroupeBaselineRole.TROUPE_ADMIN }

        for (membership in adminMemberships) {
            val adminCount =
                membershipRepository.countByTroupe_IdAndStatusAndBaselineRole(
                    membership.troupe.id,
                    TroupeMembershipStatus.ACTIVE,
                    TroupeBaselineRole.TROUPE_ADMIN,
                )
            if (adminCount <= 1) {
                val troupeLabel =
                    membership.troupe.name?.trim()?.takeIf { it.isNotEmpty() }
                        ?: membership.troupe.slug
                throw ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Impossible de supprimer votre compte : vous êtes le dernier administrateur actif de la troupe « $troupeLabel ». Transférez d’abord le rôle administrateur.",
                )
            }
        }
    }

    private fun verifyReAuthToken(
        user: UserEntity,
        idToken: String,
    ) {
        if (user.googleSub != null) {
            runCatching {
                val jwt = googleIdTokenService.validateAndParse(idToken)
                val sub = jwt.subject ?: throw invalidReAuth()
                if (sub == user.googleSub) {
                    return
                }
            }
        }

        val verifier = idpIdTokenVerifier.ifAvailable
        if (user.idpUid != null && verifier != null) {
            runCatching {
                val payload = verifier.verify(idToken)
                if (payload.uid == user.idpUid) {
                    return
                }
            }
        }

        throw ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Ré-authentification requise. Vérifiez votre mot de passe ou reconnectez-vous avec Google.",
        )
    }

    private fun invalidReAuth(): Nothing =
        throw ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Ré-authentification requise. Vérifiez votre mot de passe ou reconnectez-vous avec Google.",
        )

    private fun purgeAvatar(user: UserEntity) {
        if (user.avatarUrl != null) {
            runCatching { avatarService.deleteAvatar(user.id) }
                .onFailure { log.warn("Avatar purge failed for user {}", user.id, it) }
        }
    }

    private fun deactivateMembershipsWithoutSeasonSync(
        userId: UUID,
        now: Instant,
    ) {
        val memberships = membershipRepository.findActiveByUserId(userId)
        for (membership in memberships) {
            membership.status = TroupeMembershipStatus.INACTIVE
            membership.updatedAt = now
        }
        membershipRepository.saveAll(memberships)
    }

    private fun anonymizeLinkedParticipants(
        userId: UUID,
        now: Instant,
    ) {
        seasonParticipantRepository.findAllByUser_Id(userId).forEach { participant ->
            participant.normalizedEmail = null
            participant.user = null
            participant.updatedAt = now
        }
        eventParticipantRepository.findAllByUser_Id(userId).forEach { participant ->
            participant.normalizedEmail = null
            participant.user = null
            participant.updatedAt = now
        }
        seasonParticipantRepository.flush()
        eventParticipantRepository.flush()
    }

    private fun anonymizeUser(
        user: UserEntity,
        now: Instant,
    ) {
        user.email = null
        user.displayName = null
        user.memberDisplayName = null
        user.gender = null
        user.avatarUrl = null
        user.avatarUpdatedAt = null
        user.pushNotificationsEnabled = false
        user.notificationPreferences = emptyMap()
        user.deletedAt = now
        user.updatedAt = now
        // google_sub / idp_uid retained for sign-in block (AC 6) until IdP user deleted.
        // idp_uid cleared post-commit in IdentityPlatformUserDeletionEventListener.
    }
}
