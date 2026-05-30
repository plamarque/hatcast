package com.hatcast.api.config

import com.hatcast.api.auth.dto.ErrorResponseBody
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.jwt.JwtException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatus(ex: ResponseStatusException): ResponseEntity<ErrorResponseBody> {
        val status = ex.statusCode
        return ResponseEntity.status(status).body(
            ErrorResponseBody(
                code = "HTTP_ERROR",
                message = ex.reason ?: "Erreur.",
            ),
        )
    }

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun handleDataIntegrity(
        ex: DataIntegrityViolationException,
    ): ResponseEntity<ErrorResponseBody> {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            ErrorResponseBody(
                code = "CONFLICT",
                message = "Donnée en conflit (contrainte). Vérifiez le slug ou les références.",
            ),
        )
    }

    @ExceptionHandler(JwtException::class)
    fun handleJwt(ex: JwtException): ResponseEntity<ErrorResponseBody> =
        ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            ErrorResponseBody(
                code = "AUTH_INVALID_ID_TOKEN",
                message = "Connexion impossible. Réessayez.",
            ),
        )

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponseBody> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ErrorResponseBody(
                code = "VALIDATION_ERROR",
                message = "Requête invalide.",
            ),
        )
}
