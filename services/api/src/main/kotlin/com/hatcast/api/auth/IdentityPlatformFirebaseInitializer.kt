package com.hatcast.api.auth

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.io.File
import java.io.FileInputStream

/**
 * Initialise Firebase Admin pour la vérification des ID tokens Identity Platform.
 *
 * - **Local :** [GOOGLE_APPLICATION_CREDENTIALS] → fichier JSON de compte de service (même projet GCP que le client).
 * - **Cloud Run / GCP :** si aucun fichier utilisable, [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials)
 *   du **compte de service d’exécution** + identifiant de projet ([GOOGLE_CLOUD_PROJECT], etc.).
 */
@Component
@Profile("!test")
class IdentityPlatformFirebaseInitializer {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostConstruct
    fun initialize() {
        if (FirebaseApp.getApps().isNotEmpty()) {
            return
        }
        val gacPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if (!gacPath.isNullOrBlank()) {
            val file = File(gacPath)
            if (file.isFile) {
                try {
                    FileInputStream(file).use { stream ->
                        val options =
                            FirebaseOptions
                                .builder()
                                .setCredentials(GoogleCredentials.fromStream(stream))
                                .build()
                        FirebaseApp.initializeApp(options)
                    }
                    log.info("Identity Platform: Firebase Admin initialisé depuis GOOGLE_APPLICATION_CREDENTIALS.")
                    return
                } catch (ex: Exception) {
                    log.warn("Identity Platform: échec d’initialisation depuis le fichier de credentials", ex)
                }
            } else {
                log.warn("Identity Platform: fichier de credentials introuvable: {}", gacPath)
            }
        }

        val projectId = resolveGcpProjectId()
        if (projectId.isNullOrBlank()) {
            log.warn(
                "Identity Platform: pas de Firebase Admin (fichier absent ou invalide, et pas de projet GCP pour ADC). " +
                    "Définissez GOOGLE_APPLICATION_CREDENTIALS en local, ou sur Cloud Run un compte de service avec rôles Identity/Firebase et GOOGLE_CLOUD_PROJECT.",
            )
            return
        }
        try {
            val credentials = GoogleCredentials.getApplicationDefault()
            val options =
                FirebaseOptions
                    .builder()
                    .setCredentials(credentials)
                    .setProjectId(projectId)
                    .build()
            FirebaseApp.initializeApp(options)
            log.info(
                "Identity Platform: Firebase Admin initialisé via Application Default Credentials (projet {}).",
                projectId,
            )
        } catch (ex: Exception) {
            log.warn(
                "Identity Platform: échec d’initialisation via ADC (vérifier le compte de service Cloud Run et les rôles Firebase/Auth).",
                ex,
            )
        }
    }

    private fun resolveGcpProjectId(): String? =
        sequenceOf(
            System.getenv("GOOGLE_CLOUD_PROJECT"),
            System.getenv("GCP_PROJECT"),
            System.getenv("HATCAST_GCP_PROJECT_ID"),
        ).firstOrNull { !it.isNullOrBlank() }
}
