package com.hatcast.api.user.dto

import com.hatcast.api.user.UserImportErrorCode
import com.hatcast.api.user.UserImportRowOutcome
import com.hatcast.api.user.MemberGender

data class UserImportSummaryDto(
    val success: Int,
    val skipped: Int,
    val error: Int,
)

data class UserImportRowResultDto(
    val rowNumber: Int,
    val outcome: UserImportRowOutcome,
    val email: String?,
    val code: UserImportErrorCode?,
    val message: String?,
)

data class UserImportResultDto(
    val summary: UserImportSummaryDto,
    val rows: List<UserImportRowResultDto>,
)

data class UserCsvRowDto(
    val rowNumber: Int,
    val valid: Boolean,
    val email: String?,
    val displayName: String?,
    val gender: MemberGender?,
    val errorCode: UserImportErrorCode?,
    val errorMessage: String?,
) {
    companion object {
        fun valid(
            rowNumber: Int,
            email: String,
            displayName: String?,
            gender: MemberGender? = null,
        ): UserCsvRowDto =
            UserCsvRowDto(
                rowNumber = rowNumber,
                valid = true,
                email = email,
                displayName = displayName,
                gender = gender,
                errorCode = null,
                errorMessage = null,
            )

        fun invalid(
            rowNumber: Int,
            email: String?,
            code: UserImportErrorCode,
            message: String,
        ): UserCsvRowDto =
            UserCsvRowDto(
                rowNumber = rowNumber,
                valid = false,
                email = email,
                displayName = null,
                gender = null,
                errorCode = code,
                errorMessage = message,
            )
    }
}
