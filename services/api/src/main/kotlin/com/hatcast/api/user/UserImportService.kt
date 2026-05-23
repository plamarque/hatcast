package com.hatcast.api.user

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.TroupeMembershipService
import com.hatcast.api.user.dto.UserCsvRowDto
import com.hatcast.api.user.dto.UserImportResultDto
import com.hatcast.api.user.dto.UserImportRowResultDto
import com.hatcast.api.user.dto.UserImportSummaryDto
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class UserImportService(
    private val membershipService: TroupeMembershipService,
    private val userAccountService: UserAccountService,
) {
    @Transactional
    fun importUsersCsv(
        troupeId: UUID,
        csvContent: String,
        principal: SessionUserPrincipal,
    ): UserImportResultDto {
        membershipService.requireTroupeAdmin(principal.userId, troupeId)
        val parsed = UserCsvCodec.parse(csvContent)
        parsed.fileError?.let { error ->
            val message =
                when (error) {
                    UserCsvFileError.EMPTY_FILE -> "Le fichier CSV est vide."
                    UserCsvFileError.MISSING_EMAIL_COLUMN -> "La colonne email est obligatoire dans l'en-tête."
                    UserCsvFileError.TOO_MANY_ROWS ->
                        "Le fichier dépasse la limite de ${UserCsvCodec.MAX_IMPORT_ROWS} lignes."
                }
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, message)
        }
        val rowResults = parsed.rows.map { row -> importRow(row) }
        return UserImportResultDto(
            summary =
                UserImportSummaryDto(
                    success = rowResults.count { it.outcome == UserImportRowOutcome.SUCCESS },
                    skipped = rowResults.count { it.outcome == UserImportRowOutcome.SKIPPED },
                    error = rowResults.count { it.outcome == UserImportRowOutcome.ERROR },
                ),
            rows = rowResults,
        )
    }

    private fun importRow(row: UserCsvRowDto): UserImportRowResultDto {
        if (!row.valid) {
            return UserImportRowResultDto(
                rowNumber = row.rowNumber,
                outcome = UserImportRowOutcome.ERROR,
                email = row.email,
                code = row.errorCode ?: UserImportErrorCode.PARSE_ERROR,
                message = row.errorMessage ?: "Ligne invalide.",
            )
        }
        val email = row.email ?: return rowError(row.rowNumber, null, UserImportErrorCode.INVALID_EMAIL, "Email manquant.")
        return try {
            when (val outcome = userAccountService.importMigrationUser(email, row.displayName)) {
                UserAccountImportOutcome.CREATED ->
                    rowSuccess(row.rowNumber, email, "Compte créé — en attente de première connexion.")
                UserAccountImportOutcome.UPDATED ->
                    rowSuccess(row.rowNumber, email, "Profil mis à jour — en attente de première connexion.")
                UserAccountImportOutcome.SKIPPED ->
                    UserImportRowResultDto(
                        rowNumber = row.rowNumber,
                        outcome = UserImportRowOutcome.SKIPPED,
                        email = email,
                        code = null,
                        message = "Compte déjà actif ou inchangé.",
                    )
            }
        } catch (_: IllegalArgumentException) {
            rowError(row.rowNumber, email, UserImportErrorCode.INVALID_EMAIL, "Email invalide.")
        }
    }

    private fun rowSuccess(
        rowNumber: Int,
        email: String,
        message: String,
    ) = UserImportRowResultDto(
        rowNumber = rowNumber,
        outcome = UserImportRowOutcome.SUCCESS,
        email = email,
        code = null,
        message = message,
    )

    private fun rowError(
        rowNumber: Int,
        email: String?,
        code: UserImportErrorCode,
        message: String,
    ) = UserImportRowResultDto(
        rowNumber = rowNumber,
        outcome = UserImportRowOutcome.ERROR,
        email = email,
        code = code,
        message = message,
    )
}

enum class UserAccountImportOutcome {
    CREATED,
    UPDATED,
    SKIPPED,
}
