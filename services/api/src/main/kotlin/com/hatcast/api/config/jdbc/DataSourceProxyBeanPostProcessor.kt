package com.hatcast.api.config.jdbc

import net.ttddyy.dsproxy.ExecutionInfo
import net.ttddyy.dsproxy.listener.QueryExecutionListener
import net.ttddyy.dsproxy.support.ProxyDataSourceBuilder
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.stereotype.Component
import javax.sql.DataSource

@Component
@ConditionalOnProperty(prefix = "hatcast.jdbc", name = ["metrics-enabled"], havingValue = "true")
@EnableConfigurationProperties(HatcastJdbcProperties::class)
class DataSourceProxyBeanPostProcessor(
    private val properties: HatcastJdbcProperties,
) : BeanPostProcessor {
    private val log = LoggerFactory.getLogger(javaClass)

    override fun postProcessAfterInitialization(bean: Any, beanName: String): Any {
        if (bean !is DataSource || bean.javaClass.name.contains("ProxyDataSource")) {
            return bean
        }
        return ProxyDataSourceBuilder
            .create(bean)
            .name("hatcast")
            .listener(buildListener())
            .build()
    }

    private fun buildListener(): QueryExecutionListener =
        object : QueryExecutionListener {
            override fun beforeQuery(
                execInfo: ExecutionInfo,
                queryInfoList: MutableList<net.ttddyy.dsproxy.QueryInfo>,
            ) {
                // no-op
            }

            override fun afterQuery(
                execInfo: ExecutionInfo,
                queryInfoList: MutableList<net.ttddyy.dsproxy.QueryInfo>,
            ) {
                queryInfoList.forEach { queryInfo ->
                    val normalizedSql = queryInfo.query.replace(Regex("\\s+"), " ").trim()
                    val elapsedMs = execInfo.elapsedTime
                    RequestJdbcMetrics.record(normalizedSql, elapsedMs)
                    if (properties.queryLogEnabled) {
                        log.info(
                            "jdbc_query sql=\"{}\" durationMs={}",
                            truncateSql(normalizedSql),
                            elapsedMs,
                        )
                    } else if (elapsedMs >= properties.slowQueryThresholdMs) {
                        log.warn("jdbc_slow_query durationMs={}", elapsedMs)
                    }
                }
            }
        }

    private fun truncateSql(sql: String, maxLen: Int = 500): String =
        if (sql.length <= maxLen) sql else sql.take(maxLen) + "…"
}
