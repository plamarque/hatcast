package com.hatcast.api.draw

import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
@Tag("19.18")
@Tag("REF-V")
class DrawPolicyValidatorTest {
    @Autowired
    private lateinit var drawPolicyValidator: DrawPolicyValidator

    @Autowired
    private lateinit var drawFormulaRepository: DrawFormulaRepository

    @Autowired
    private lateinit var troupeCategoryRepository: com.hatcast.api.troupe.TroupeCategoryRepository

    @Autowired
    private lateinit var troupeRepository: com.hatcast.api.troupe.TroupeRepository

    private lateinit var troupeId: UUID
    private lateinit var otherTroupeId: UUID
    private lateinit var localFormulaId: UUID
    private lateinit var foreignFormulaId: UUID

    @BeforeEach
    @Transactional
    fun setUp() {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Validator Troupe",
                    slug = "validator-troupe-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        troupeId = troupe.id
        val otherTroupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Other Troupe",
                    slug = "other-troupe-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        otherTroupeId = otherTroupe.id

        localFormulaId =
            drawFormulaRepository
                .save(
                    DrawFormulaEntity(
                        troupeId = troupeId,
                        name = "Local formula",
                        status = DrawFormulaStatus.PUBLISHED,
                        factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                        createdAt = now,
                        updatedAt = now,
                    ),
                ).id
        foreignFormulaId =
            drawFormulaRepository
                .save(
                    DrawFormulaEntity(
                        troupeId = otherTroupeId,
                        name = "Foreign formula",
                        status = DrawFormulaStatus.PUBLISHED,
                        factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                        createdAt = now,
                        updatedAt = now,
                    ),
                ).id

        troupeCategoryRepository.save(
            com.hatcast.api.troupe.TroupeCategoryEntity(
                troupe = troupe,
                slug = "match",
                label = "Match",
                createdAt = now,
            ),
        )
    }

    @Test
    fun `rejects foreign troupe formula reference in category rules`() {
        val rules =
            listOf(
                DrawCategoryRule(
                    category = "match",
                    mode = DrawRuleMode.CHOICE,
                    allowedFormulaIds = listOf(foreignFormulaId.toString()),
                ),
            )

        assertThrows(DrawPolicyValidationException::class.java) {
            drawPolicyValidator.validateCategoryRules(troupeId, rules)
        }
    }

    @Test
    fun `rejects unknown category slug`() {
        val rules =
            listOf(
                DrawCategoryRule(
                    category = "unknown-slug",
                    mode = DrawRuleMode.CHOICE,
                    allowedFormulaIds = listOf(localFormulaId.toString()),
                ),
            )

        assertThrows(DrawPolicyValidationException::class.java) {
            drawPolicyValidator.validateCategoryRules(troupeId, rules)
        }
    }

    @Test
    fun `rejects duplicate category values`() {
        val rules =
            listOf(
                DrawCategoryRule(
                    category = "match",
                    mode = DrawRuleMode.CHOICE,
                    allowedFormulaIds = listOf(localFormulaId.toString()),
                ),
                DrawCategoryRule(
                    category = "match",
                    mode = DrawRuleMode.MANDATORY,
                    mandatoryFormulaId = localFormulaId.toString(),
                ),
            )

        assertThrows(DrawPolicyValidationException::class.java) {
            drawPolicyValidator.validateCategoryRules(troupeId, rules)
        }
    }

    @Test
    fun `accepts valid category and local formula references`() {
        val rules =
            listOf(
                DrawCategoryRule(
                    category = "match",
                    mode = DrawRuleMode.CHOICE,
                    allowedFormulaIds = listOf(localFormulaId.toString()),
                ),
                DrawCategoryRule(
                    category = null,
                    mode = DrawRuleMode.MANDATORY,
                    mandatoryFormulaId = localFormulaId.toString(),
                ),
            )

        assertDoesNotThrow {
            drawPolicyValidator.validateCategoryRules(troupeId, rules)
        }
    }

    @Test
    fun `rejects CHOICE with empty allowedFormulaIds`() {
        assertThrows(DrawPolicyValidationException::class.java) {
            drawPolicyValidator.validateChoiceRule(emptyList())
        }
    }

    @Test
    fun `rejects duplicate formula ids in CHOICE rule`() {
        assertThrows(DrawPolicyValidationException::class.java) {
            drawPolicyValidator.validateChoiceRule(listOf(localFormulaId.toString(), localFormulaId.toString()))
        }
    }

    @Test
    fun `rejects DRAFT formula reference`() {
        val draftId =
            drawFormulaRepository
                .save(
                    DrawFormulaEntity(
                        troupeId = troupeId,
                        name = "Draft formula",
                        status = DrawFormulaStatus.DRAFT,
                        factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                        createdAt = Instant.now(),
                        updatedAt = Instant.now(),
                    ),
                ).id
        assertThrows(DrawPolicyValidationException::class.java) {
            drawPolicyValidator.validateFormulaReference(troupeId, draftId.toString())
        }
    }

    @Test
    fun `rejects ARCHIVED formula reference`() {
        val archivedId =
            drawFormulaRepository
                .save(
                    DrawFormulaEntity(
                        troupeId = troupeId,
                        name = "Archived formula",
                        status = DrawFormulaStatus.ARCHIVED,
                        factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                        createdAt = Instant.now(),
                        updatedAt = Instant.now(),
                    ),
                ).id
        assertThrows(DrawPolicyValidationException::class.java) {
            drawPolicyValidator.validateFormulaReference(troupeId, archivedId.toString())
        }
    }

    @Test
    fun `accepts PUBLISHED formula reference`() {
        assertDoesNotThrow {
            drawPolicyValidator.validateFormulaReference(troupeId, localFormulaId.toString())
        }
    }
}
