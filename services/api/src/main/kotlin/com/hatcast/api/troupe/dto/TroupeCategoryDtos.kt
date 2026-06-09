package com.hatcast.api.troupe.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.hatcast.api.troupe.TroupeCategoryEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class TroupeCategoryDto(
    val slug: String,
    val label: String,
) {
    companion object {
        fun from(e: TroupeCategoryEntity): TroupeCategoryDto =
            TroupeCategoryDto(slug = e.slug, label = e.label)
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateTroupeCategoryRequest(
    @field:NotBlank(message = "Le libellé ne peut pas être vide.")
    @field:Size(max = 128)
    val label: String,
    @field:Size(max = 64)
    val slug: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateTroupeCategoryLabelRequest(
    @field:NotBlank(message = "Le libellé ne peut pas être vide.")
    @field:Size(max = 128)
    val label: String,
)

data class CategoryDeletePreviewDto(
    val eventCount: Long,
)

data class CategoryDeleteResultDto(
    val affectedEventCount: Long,
)
