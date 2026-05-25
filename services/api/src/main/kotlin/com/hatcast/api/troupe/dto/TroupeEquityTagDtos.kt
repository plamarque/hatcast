package com.hatcast.api.troupe.dto

import com.hatcast.api.troupe.TroupeEquityTagEntity

data class TroupeEquityTagDto(
    val slug: String,
    val label: String,
) {
    companion object {
        fun from(e: TroupeEquityTagEntity): TroupeEquityTagDto =
            TroupeEquityTagDto(slug = e.slug, label = e.label)
    }
}
