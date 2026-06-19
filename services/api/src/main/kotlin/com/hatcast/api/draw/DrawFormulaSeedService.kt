package com.hatcast.api.draw

import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

class SystemDrawFormulaMutationException(
    message: String,
) : IllegalStateException(message)

@Service
class DrawFormulaSeedService(
    private val drawFormulaRepository: DrawFormulaRepository,
) {
    @Transactional
    fun ensureSystemFormula(troupeId: UUID): DrawFormulaEntity {
        val canonicalId = DrawFormulaIds.systemV1(troupeId)
        val existingById = drawFormulaRepository.findById(canonicalId)
        if (existingById.isPresent) {
            return existingById.get()
        }
        val existing =
            drawFormulaRepository
                .findByTroupeIdAndIsSystem(troupeId, isSystem = true)
                .firstOrNull()
        if (existing != null) {
            return existing
        }
        val now = Instant.now()
        return try {
            drawFormulaRepository.save(
                DrawFormulaEntity(
                    id = canonicalId,
                    troupeId = troupeId,
                    name = DrawFormulaSeedConstants.SYSTEM_V1_NAME,
                    description = null,
                    status = DrawFormulaStatus.PUBLISHED,
                    factorConfig = DrawFormulaSeedConstants.SYSTEM_V1_FACTOR_CONFIG,
                    version = 1,
                    isSystem = true,
                    systemTroupeKey = troupeId,
                    createdAt = now,
                    updatedAt = now,
                ),
            )
        } catch (_: DataIntegrityViolationException) {
            drawFormulaRepository.findById(canonicalId).orElseGet {
                drawFormulaRepository
                    .findByTroupeIdAndIsSystem(troupeId, isSystem = true)
                    .firstOrNull()
                    ?: throw SystemDrawFormulaMutationException(
                        "Failed to ensure system formula for troupe $troupeId",
                    )
            }
        }
    }

    @Transactional
    fun deleteFormula(id: UUID) {
        val entity =
            drawFormulaRepository.findById(id).orElseThrow {
                NoSuchElementException("Draw formula not found: $id")
            }
        if (entity.isSystem) {
            throw SystemDrawFormulaMutationException("System draw formulas cannot be deleted")
        }
        drawFormulaRepository.delete(entity)
    }

    @Transactional
    fun archiveFormula(id: UUID) {
        val entity =
            drawFormulaRepository.findById(id).orElseThrow {
                NoSuchElementException("Draw formula not found: $id")
            }
        if (entity.isSystem) {
            throw SystemDrawFormulaMutationException("System draw formulas cannot be archived")
        }
        entity.status = DrawFormulaStatus.ARCHIVED
        entity.updatedAt = Instant.now()
        drawFormulaRepository.save(entity)
    }
}
