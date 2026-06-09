package com.hatcast.api.notification

import com.hatcast.api.user.MemberGender

object NotificationGenderCopy {
    fun selectedPastParticiple(gender: MemberGender?): String = gendered(gender, "sélectionné", "sélectionnée", "sélectionné·e")

    fun enrolledPastParticiple(gender: MemberGender?): String = gendered(gender, "inscrit", "inscrite", "inscrit·e")

    fun readyAdjective(gender: MemberGender?): String = gendered(gender, "prêt", "prête", "prêt·e")

    fun nominatedPastParticiple(gender: MemberGender?): String = gendered(gender, "nommé", "nommée", "nommé·e")

    private fun gendered(
        gender: MemberGender?,
        male: String,
        female: String,
        inclusive: String,
    ): String =
        when (MemberGender.effective(gender)) {
            MemberGender.MALE -> male
            MemberGender.FEMALE -> female
            MemberGender.NON_SPECIFIED -> inclusive
        }
}
