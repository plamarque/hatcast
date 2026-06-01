package com.hatcast.api.notification

import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import java.security.Security

class NotificationConfigurationTest {
    @Test
    fun `registers BouncyCastle provider`() {
        NotificationConfiguration()

        assertNotNull(Security.getProvider(BouncyCastleProvider.PROVIDER_NAME))
    }
}
