package com.hatcast.api.draw

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
class DrawPolicyResolutionServiceTest {
    @Autowired
    private lateinit var drawPolicyResolutionService: DrawPolicyResolutionService

    @Autowired
    private lateinit var drawFormulaRepository: DrawFormulaRepository

    @Autowired
    private lateinit var troupeRepository: com.hatcast.api.troupe.TroupeRepository

    private lateinit var troupeId: UUID

    @BeforeEach
    @Transactional
    fun setUp() {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Resolution Troupe",
                    slug = "resolution-troupe-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        troupeId = troupe.id
        drawFormulaRepository
            .findByTroupeIdAndIsSystem(troupeId, isSystem = true)
            .forEach { drawFormulaRepository.delete(it) }
        drawFormulaRepository
            .findByTroupeIdAndStatusOrderByNameAsc(troupeId, DrawFormulaStatus.PUBLISHED)
            .filter { !it.isSystem }
            .forEach { drawFormulaRepository.delete(it) }
    }

    @Test
    @Transactional
    fun `REF-R02 implicit default with empty catalogue yields system V1 only`() {
        val resolved = drawPolicyResolutionService.resolveImplicitDefault(troupeId)

        assertEquals(DrawPolicySource.IMPLICIT, resolved.policySource)
        assertEquals(DrawRuleMode.CHOICE, resolved.resolvedMode)
        assertEquals(listOf(DrawFormulaIds.systemV1(troupeId)), resolved.allowedFormulaIds)
        assertFalse(resolved.selectorVisible)
        assertEquals(DrawFormulaIds.systemV1(troupeId), resolved.effectiveFormulaId)
        assertTrue(resolved.categoryRules.isEmpty())
    }

    @Test
    @Transactional
    fun `REF-R03 implicit default with one published formula yields F1 and system V1`() {
        val f1 = savePublishedFormula(name = "V1 standard")

        val resolved = drawPolicyResolutionService.resolveImplicitDefault(troupeId)

        assertEquals(listOf(f1, DrawFormulaIds.systemV1(troupeId)), resolved.allowedFormulaIds)
        assertTrue(resolved.selectorVisible)
        assertEquals(null, resolved.effectiveFormulaId)
    }

    @Test
    @Transactional
    fun `implicit default excludes DRAFT formulas from allowed list`() {
        savePublishedFormula(name = "Published formula")
        saveDraftFormula(name = "Draft formula")

        val resolved = drawPolicyResolutionService.resolveImplicitDefault(troupeId)

        assertEquals(2, resolved.allowedFormulaIds.size)
        assertTrue(resolved.allowedFormulaIds.contains(DrawFormulaIds.systemV1(troupeId)))
        assertFalse(
            drawFormulaRepository
                .findByTroupeIdAndStatusOrderByNameAsc(troupeId, DrawFormulaStatus.DRAFT)
                .any { it.id in resolved.allowedFormulaIds },
        )
    }

    @Test
    @Transactional
    fun `REF-R10 implicit default includes all published non-system formulas plus system V1`() {
        val f1 = savePublishedFormula(name = "Formula 1")
        val f2 = savePublishedFormula(name = "Formula 2")

        val resolved = drawPolicyResolutionService.resolveImplicitDefault(troupeId)

        assertEquals(DrawPolicySource.IMPLICIT, resolved.policySource)
        assertEquals(DrawRuleMode.CHOICE, resolved.resolvedMode)
        assertEquals(
            listOf(f1, f2, DrawFormulaIds.systemV1(troupeId)),
            resolved.allowedFormulaIds,
        )
        assertTrue(resolved.selectorVisible)
    }

    private fun savePublishedFormula(name: String): UUID {
        val now = Instant.now()
        val entity =
            drawFormulaRepository.save(
                DrawFormulaEntity(
                    troupeId = troupeId,
                    name = name,
                    status = DrawFormulaStatus.PUBLISHED,
                    factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        return entity.id
    }

    private fun saveDraftFormula(name: String): UUID {
        val now = Instant.now()
        val entity =
            drawFormulaRepository.save(
                DrawFormulaEntity(
                    troupeId = troupeId,
                    name = name,
                    status = DrawFormulaStatus.DRAFT,
                    factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        return entity.id
    }
}
