package com.hatcast.api.troupe.dto

import com.hatcast.api.troupe.TroupeCategoryEntity

data class TroupeCategoryDto(
    val slug: String,
    val label: String,
) {
    companion object {
        fun from(e: TroupeCategoryEntity): TroupeCategoryDto =
            TroupeCategoryDto(slug = e.slug, label = e.label)
    }
}
