package com.hatcast.api.auth

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.io.Serializable
import java.util.UUID

/**
 * Principal stocké en session (champs sérialisables ; pas d’entité JPA pour éviter les problèmes de détachement).
 * Au moins un des identifiants externes (`googleSub` ou `idpUid`) est non null pour un utilisateur valide.
 */
class SessionUserPrincipal(
    val userId: UUID,
    val googleSub: String?,
    val idpUid: String?,
    val email: String?,
) : UserDetails, Serializable {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> =
        mutableListOf(SimpleGrantedAuthority("ROLE_USER"))

    override fun getPassword(): String = ""

    override fun getUsername(): String = idpUid ?: googleSub ?: userId.toString()

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = true
}
