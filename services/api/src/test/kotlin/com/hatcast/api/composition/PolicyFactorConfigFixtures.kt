package com.hatcast.api.composition

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.kotlinModule
import com.fasterxml.jackson.module.kotlin.readValue
import com.hatcast.api.draw.DrawFactorConfig

/**
 * Loads factor configs from draw/golden/formulas/pipelines.json by REF-F id (19.18 policy tests).
 */
object PolicyFactorConfigFixtures {
    private val mapper = ObjectMapper().registerModule(kotlinModule())

    private val byId: Map<String, JsonNode> by lazy {
        val stream =
            requireNotNull(
                javaClass.classLoader.getResourceAsStream("draw/golden/formulas/pipelines.json"),
            ) { "Missing pipelines.json" }
        mapper.readValue<List<JsonNode>>(stream).associateBy { it.path("id").asText() }
    }

    fun factorConfigForRef(ref: String): DrawFactorConfig {
        val node =
            byId[ref]?.path("factorConfig")
                ?: error("Unknown factorConfigRef: $ref")
        return mapper.readValue(node.toString())
    }
}
