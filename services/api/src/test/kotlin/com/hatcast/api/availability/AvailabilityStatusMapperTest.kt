package com.hatcast.api.availability

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class AvailabilityStatusMapperTest {
    @Test
    fun `toApi maps stored values and null to unknown`() {
        assertEquals("available", AvailabilityStatusMapper.toApi(StoredAvailabilityStatus.AVAILABLE))
        assertEquals("unavailable", AvailabilityStatusMapper.toApi(StoredAvailabilityStatus.UNAVAILABLE))
        assertEquals("unknown", AvailabilityStatusMapper.toApi(null))
    }

    @Test
    fun `toStored maps api values and unknown to null`() {
        assertEquals(StoredAvailabilityStatus.AVAILABLE, AvailabilityStatusMapper.toStored("available"))
        assertEquals(StoredAvailabilityStatus.UNAVAILABLE, AvailabilityStatusMapper.toStored("unavailable"))
        assertNull(AvailabilityStatusMapper.toStored("unknown"))
    }

    @Test
    fun `parseApi normalizes case`() {
        assertEquals("available", AvailabilityStatusMapper.parseApi("AVAILABLE"))
    }
}
