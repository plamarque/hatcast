package com.hatcast.api.troupe

enum class MemberImportRowOutcome {
    SUCCESS,
    SKIPPED,
    ERROR,
}

enum class MemberImportErrorCode {
    INVALID_EMAIL,
    USER_NOT_FOUND,
    INVALID_BASELINE_ROLE,
    INVALID_STATUS,
    LAST_ADMIN_VIOLATION,
    PARSE_ERROR,
}
