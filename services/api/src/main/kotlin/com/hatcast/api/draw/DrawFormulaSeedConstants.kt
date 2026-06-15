package com.hatcast.api.draw

object DrawFormulaSeedConstants {
    const val SYSTEM_V1_NAME = "V1 standard (système)"

    val SYSTEM_V1_FACTOR_CONFIG: DrawFactorConfig =
        listOf(
            DrawFactorConfigEntry(factorId = "equity_tag", enabled = true),
            DrawFactorConfigEntry(factorId = "past_participation", enabled = true),
        )

    val SYSTEM_V1_FACTOR_CONFIG_JSON: String =
        """[{"factorId":"equity_tag","enabled":true},{"factorId":"past_participation","enabled":true}]"""
}
