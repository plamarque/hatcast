package com.hatcast.api.user

import com.hatcast.api.user.dto.UserCsvRowDto

object UserCsvCodec {
    val HEADER_COLUMNS = listOf("email", "displayName")

    fun parse(content: String): UserCsvParseResult {
        val trimmed = content.trim()
        if (trimmed.isEmpty()) {
            return UserCsvParseResult(rows = emptyList(), fileError = UserCsvFileError.EMPTY_FILE)
        }
        val records = parseRecords(trimmed)
        if (records.isEmpty()) {
            return UserCsvParseResult(rows = emptyList(), fileError = UserCsvFileError.EMPTY_FILE)
        }
        val header = records.first().map { it.trim().lowercase() }
        if (!header.contains("email")) {
            return UserCsvParseResult(rows = emptyList(), fileError = UserCsvFileError.MISSING_EMAIL_COLUMN)
        }
        val dataRows = records.drop(1)
        if (dataRows.size > MAX_IMPORT_ROWS) {
            return UserCsvParseResult(rows = emptyList(), fileError = UserCsvFileError.TOO_MANY_ROWS)
        }
        val parsedRows =
            dataRows.mapIndexed { index, values ->
                parseDataRow(rowNumber = index + 2, header = header, values = values)
            }
        return UserCsvParseResult(rows = parsedRows)
    }

    private fun parseDataRow(
        rowNumber: Int,
        header: List<String>,
        values: List<String>,
    ): UserCsvRowDto {
        val fields = header.indices.associate { index ->
            header[index] to values.getOrElse(index) { "" }.trim()
        }
        val email = fields["email"].orEmpty().trim().lowercase()
        if (email.isEmpty()) {
            return UserCsvRowDto.invalid(
                rowNumber = rowNumber,
                email = null,
                code = UserImportErrorCode.INVALID_EMAIL,
                message = "La colonne email est obligatoire.",
            )
        }
        if (!email.contains("@")) {
            return UserCsvRowDto.invalid(
                rowNumber = rowNumber,
                email = email,
                code = UserImportErrorCode.INVALID_EMAIL,
                message = "Email invalide.",
            )
        }
        val displayName = fields["displayname"]?.takeIf { it.isNotEmpty() }
        val gender =
            fields["gender"]?.takeIf { it.isNotEmpty() }?.let { MemberGender.fromV1Csv(it) }
        return UserCsvRowDto.valid(
            rowNumber = rowNumber,
            email = email,
            displayName = displayName,
            gender = gender,
        )
    }

    private fun parseRecords(content: String): List<List<String>> {
        val records = mutableListOf<List<String>>()
        val current = StringBuilder()
        val row = mutableListOf<String>()
        var inQuotes = false
        var i = 0
        while (i < content.length) {
            val ch = content[i]
            when {
                inQuotes && ch == '"' -> {
                    if (i + 1 < content.length && content[i + 1] == '"') {
                        current.append('"')
                        i++
                    } else {
                        inQuotes = false
                    }
                }
                !inQuotes && ch == '"' -> inQuotes = true
                !inQuotes && ch == ',' -> {
                    row.add(current.toString())
                    current.clear()
                }
                !inQuotes && (ch == '\n' || ch == '\r') -> {
                    if (ch == '\r' && i + 1 < content.length && content[i + 1] == '\n') {
                        i++
                    }
                    row.add(current.toString())
                    current.clear()
                    if (row.any { it.isNotEmpty() }) {
                        records.add(row.toList())
                    }
                    row.clear()
                }
                else -> current.append(ch)
            }
            i++
        }
        row.add(current.toString())
        if (row.any { it.isNotEmpty() }) {
            records.add(row.toList())
        }
        return records
    }

    const val MAX_IMPORT_ROWS = 5000
}

data class UserCsvParseResult(
    val rows: List<UserCsvRowDto>,
    val fileError: UserCsvFileError? = null,
)

enum class UserCsvFileError {
    EMPTY_FILE,
    MISSING_EMAIL_COLUMN,
    TOO_MANY_ROWS,
}

enum class UserImportRowOutcome {
    SUCCESS,
    SKIPPED,
    ERROR,
}

enum class UserImportErrorCode {
    INVALID_EMAIL,
    PARSE_ERROR,
}
