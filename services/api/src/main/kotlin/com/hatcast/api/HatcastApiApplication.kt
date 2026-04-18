package com.hatcast.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class HatcastApiApplication

fun main(args: Array<String>) {
    runApplication<HatcastApiApplication>(*args)
}
