package com.hatcast.api.user

enum class MemberGender(val wireValue: String) {
    MALE("male"),
    FEMALE("female"),
    NON_SPECIFIED("non_specified"),
    ;

    companion object {
        val ALLOWED_WIRE_VALUES: Set<String> = entries.map { it.wireValue }.toSet()

        fun fromWireOrNull(raw: String?): MemberGender? {
            if (raw.isNullOrBlank()) {
                return null
            }
            val normalized = raw.trim().lowercase().replace('-', '_')
            return entries.find { it.wireValue == normalized }
        }

        fun fromV1Csv(raw: String?): MemberGender {
            if (raw.isNullOrBlank()) {
                return NON_SPECIFIED
            }
            return when (raw.trim().lowercase()) {
                "male" -> MALE
                "female" -> FEMALE
                "non-specified", "non_specified", "unknown" -> NON_SPECIFIED
                else -> NON_SPECIFIED
            }
        }

        fun effective(stored: MemberGender?): MemberGender = stored ?: NON_SPECIFIED
    }
}
