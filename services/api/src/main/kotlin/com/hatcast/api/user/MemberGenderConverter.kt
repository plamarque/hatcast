package com.hatcast.api.user

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class MemberGenderConverter : AttributeConverter<MemberGender?, String?> {
    override fun convertToDatabaseColumn(attribute: MemberGender?): String? = attribute?.wireValue

    override fun convertToEntityAttribute(dbData: String?): MemberGender? = MemberGender.fromWireOrNull(dbData)
}
