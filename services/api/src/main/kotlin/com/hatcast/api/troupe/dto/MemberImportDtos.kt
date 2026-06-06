package com.hatcast.api.troupe.dto

import com.hatcast.api.troupe.MemberImportErrorCode
import com.hatcast.api.troupe.MemberImportRowOutcome
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipStatus

data class MemberImportSummaryDto(
    val success: Int,
    val skipped: Int,
    val error: Int,
)

data class MemberImportRowResultDto(
    val rowNumber: Int,
    val outcome: MemberImportRowOutcome,
    val email: String?,
    val code: MemberImportErrorCode?,
    val message: String?,
)

data class MemberImportResultDto(
    val summary: MemberImportSummaryDto,
    val rows: List<MemberImportRowResultDto>,
)

data class MemberCsvRowDto(
    val rowNumber: Int,
    val valid: Boolean,
    val email: String?,
    val displayName: String?,
    val baselineRole: TroupeBaselineRole?,
    val status: TroupeMembershipStatus?,
    val errorCode: MemberImportErrorCode?,
    val errorMessage: String?,
) {
    companion object {
        fun valid(
            rowNumber: Int,
            email: String?,
            displayName: String?,
            baselineRole: TroupeBaselineRole?,
            status: TroupeMembershipStatus?,
        ): MemberCsvRowDto =
            MemberCsvRowDto(
                rowNumber = rowNumber,
                valid = true,
                email = email,
                displayName = displayName,
                baselineRole = baselineRole,
                status = status,
                errorCode = null,
                errorMessage = null,
            )

        fun invalid(
            rowNumber: Int,
            email: String?,
            code: MemberImportErrorCode,
            message: String,
        ): MemberCsvRowDto =
            MemberCsvRowDto(
                rowNumber = rowNumber,
                valid = false,
                email = email,
                displayName = null,
                baselineRole = null,
                status = null,
                errorCode = code,
                errorMessage = message,
            )
    }
}
