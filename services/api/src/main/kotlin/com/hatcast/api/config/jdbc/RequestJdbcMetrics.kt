package com.hatcast.api.config.jdbc

import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong

/** Per-request JDBC counters (thread-local). Cleared by [JdbcRequestMetricsFilter]. */
object RequestJdbcMetrics {
    data class QueryEntry(
        val sql: String,
        val durationMs: Long,
    )

    data class Snapshot(
        val statementCount: Int,
        val totalMs: Long,
        val queries: List<QueryEntry>,
    )

    private val statementCount = ThreadLocal.withInitial { AtomicInteger(0) }
    private val totalMs = ThreadLocal.withInitial { AtomicLong(0) }
    private val queries = ThreadLocal.withInitial { mutableListOf<QueryEntry>() }

    fun record(sql: String, durationMs: Long) {
        statementCount.get().incrementAndGet()
        totalMs.get().addAndGet(durationMs)
        queries.get().add(QueryEntry(sql = sql, durationMs = durationMs))
    }

    fun snapshot(): Snapshot =
        Snapshot(
            statementCount = statementCount.get().get(),
            totalMs = totalMs.get().get(),
            queries = queries.get().toList(),
        )

    fun clear() {
        statementCount.get().set(0)
        totalMs.get().set(0)
        queries.get().clear()
    }

    fun remove() {
        statementCount.remove()
        totalMs.remove()
        queries.remove()
    }
}
