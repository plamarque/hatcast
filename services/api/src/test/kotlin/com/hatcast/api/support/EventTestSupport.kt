package com.hatcast.api.support

import jakarta.servlet.http.Cookie
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

object EventTestSupport {
    fun openEventAvailability(
        mockMvc: MockMvc,
        cookie: Cookie,
        seasonId: UUID,
        eventId: UUID,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    /**
     * Ensures [category] exists in the troupe glossary before assigning it on an event.
     * Idempotent: seeds built-in `deplacements` via GET list, then POST (201 or 409).
     */
    fun ensureGlossaryCategory(
        mockMvc: MockMvc,
        cookie: Cookie,
        troupeId: UUID,
        category: String,
    ) {
        mockMvc
            .perform(get("/v1/troupes/$troupeId/categories").cookie(cookie))
            .andExpect(status().isOk)

        val status =
            mockMvc
                .perform(
                    post("/v1/troupes/$troupeId/categories")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{ "label": "$category", "slug": "$category" }""")
                        .with(csrf()),
                ).andReturn()
                .response.status
        if (status != 201 && status != 409) {
            error("Expected 201 or 409 when ensuring category '$category', got $status")
        }
    }
}
