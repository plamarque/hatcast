package com.hatcast.api.draw

import org.junit.jupiter.api.Assertions.assertThrows
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
class DrawFormulaSeedServiceTest {
    @Autowired
    private lateinit var drawFormulaSeedService: DrawFormulaSeedService

    @Autowired
    private lateinit var troupeRepository: com.hatcast.api.troupe.TroupeRepository

    private lateinit var troupeId: UUID
    private lateinit var systemFormulaId: UUID

    @BeforeEach
    @Transactional
    fun setUp() {
        val now = Instant.now()
        val troupe =
            troupeRepository.save(
                com.hatcast.api.troupe.TroupeEntity(
                    id = UUID.randomUUID(),
                    name = "Seed Service Troupe",
                    slug = "seed-service-troupe-${UUID.randomUUID()}",
                    createdAt = now,
                ),
            )
        troupeId = troupe.id
        systemFormulaId = drawFormulaSeedService.ensureSystemFormula(troupeId).id
    }

    @Test
    @Transactional
    fun `deleteFormula rejects system formula`() {
        assertThrows(SystemDrawFormulaMutationException::class.java) {
            drawFormulaSeedService.deleteFormula(systemFormulaId)
        }
    }

    @Test
    @Transactional
    fun `archiveFormula rejects system formula`() {
        assertThrows(SystemDrawFormulaMutationException::class.java) {
            drawFormulaSeedService.archiveFormula(systemFormulaId)
        }
    }
}
