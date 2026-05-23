package com.hatcast.api.troupe

import com.hatcast.api.troupe.dto.MemberCsvRowDto

object TroupeMemberCsvCodec {
    val HEADER_COLUMNS = listOf("email", "displayName", "baselineRole", "status")

    fun formatExport(
        memberships: Sequence<TroupeMembershipEntity>,
    ): String =
        buildString {
            appendLine(formatCsvLine(HEADER_COLUMNS))
            memberships.forEach { membership ->
                appendLine(
                    formatCsvLine(
                        listOf(
                            membership.user.email.orEmpty(),
                            membership.displayName,
                            membership.baselineRole.name,
                            membership.status.name.lowercase(),
                        ),
                    ),
                )
            }
        }

    fun parse(content: String): MemberCsvParseResult {
        val trimmed = content.removePrefix("\uFEFF").trim()
        if (trimmed.isEmpty()) {
            return MemberCsvParseResult(
                rows = emptyList(),
                fileError = MemberCsvFileError.EMPTY_FILE,
            )
        }
        val records = parseRecords(trimmed)
        if (records.isEmpty()) {
            return MemberCsvParseResult(
                rows = emptyList(),
                fileError = MemberCsvFileError.EMPTY_FILE,
            )
        }
        val header = records.first().map { it.trim().lowercase() }
        if (!header.contains("email")) {
            return MemberCsvParseResult(
                rows = emptyList(),
                fileError = MemberCsvFileError.MISSING_EMAIL_COLUMN,
            )
        }
        val dataRows = records.drop(1)
        if (dataRows.size > MAX_IMPORT_ROWS) {
            return MemberCsvParseResult(
                rows = emptyList(),
                fileError = MemberCsvFileError.TOO_MANY_ROWS,
            )
        }
        val parsedRows =
            dataRows.mapIndexed { index, values ->
                parseDataRow(rowNumber = index + 2, header = header, values = values)
            }
        return MemberCsvParseResult(rows = parsedRows)
    }

    private fun parseDataRow(
        rowNumber: Int,
        header: List<String>,
        values: List<String>,
    ): MemberCsvRowDto {
        val fields = header.indices.associate { index ->
            header[index] to values.getOrElse(index) { "" }.trim()
        }
        val email = fields["email"].orEmpty().trim().lowercase()
        if (email.isEmpty()) {
            return MemberCsvRowDto.invalid(
                rowNumber = rowNumber,
                email = null,
                code = MemberImportErrorCode.INVALID_EMAIL,
                message = "La colonne email est obligatoire.",
            )
        }
        if (!email.contains("@")) {
            return MemberCsvRowDto.invalid(
                rowNumber = rowNumber,
                email = email,
                code = MemberImportErrorCode.INVALID_EMAIL,
                message = "Email invalide.",
            )
        }
        val displayName = fields["displayname"]?.takeIf { it.isNotEmpty() }
        val baselineRole =
            fields["baselinerole"]?.takeIf { it.isNotEmpty() }?.let { raw ->
                runCatching { TroupeBaselineRole.valueOf(raw.trim().uppercase()) }
                    .getOrElse {
                        return MemberCsvRowDto.invalid(
                            rowNumber = rowNumber,
                            email = email,
                            code = MemberImportErrorCode.INVALID_BASELINE_ROLE,
                            message = "Rôle de base invalide : $raw",
                        )
                    }
            }
        val status =
            fields["status"]?.takeIf { it.isNotEmpty() }?.let { raw ->
                when (raw.trim().lowercase()) {
                    "active" -> TroupeMembershipStatus.ACTIVE
                    "inactive" -> TroupeMembershipStatus.INACTIVE
                    else ->
                        return MemberCsvRowDto.invalid(
                            rowNumber = rowNumber,
                            email = email,
                            code = MemberImportErrorCode.INVALID_STATUS,
                            message = "Statut invalide : $raw",
                        )
                }
            }
        return MemberCsvRowDto.valid(
            rowNumber = rowNumber,
            email = email,
            displayName = displayName,
            baselineRole = baselineRole,
            status = status,
        )
    }

    private fun formatCsvLine(values: List<String>): String =
        values.joinToString(",") { value ->
            if (value.any { it == ',' || it == '"' || it == '\n' || it == '\r' }) {
                "\"${value.replace("\"", "\"\"")}\""
            } else {
                value
            }
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

data class MemberCsvParseResult(
    val rows: List<MemberCsvRowDto>,
    val fileError: MemberCsvFileError? = null,
)

enum class MemberCsvFileError {
    EMPTY_FILE,
    MISSING_EMAIL_COLUMN,
    TOO_MANY_ROWS,
}
