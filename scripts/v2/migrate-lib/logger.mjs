/**
 * Structured step logging for migrate:v2:run (stdout + JSONL file).
 */

import { appendFileSync, mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'

export function createLogger(runLogPath) {
  mkdirSync(dirname(runLogPath), { recursive: true })
  writeFileSync(runLogPath, '', 'utf8')

  /** @param {'info'|'warn'|'error'} level */
  function log(level, step, message, extra = {}) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      step,
      message,
      ...extra,
    }
    const line = JSON.stringify(entry)
    appendFileSync(runLogPath, `${line}\n`, 'utf8')
    const prefix = `[STEP ${step}]`
    if (level === 'error') {
      console.error(`${prefix} ERROR — ${message}`)
    } else if (level === 'warn') {
      console.warn(`${prefix} WARN — ${message}`)
    } else {
      console.log(`${prefix} ${message}`)
    }
  }

  return {
    info(step, message, extra) {
      log('info', step, message, extra)
    },
    warn(step, message, extra) {
      log('warn', step, message, extra)
    },
    error(step, message, extra) {
      log('error', step, message, extra)
    },
    async runStep(step, fn) {
      const started = Date.now()
      try {
        const result = await fn()
        const ms = Date.now() - started
        log('info', step, `OK (${(ms / 1000).toFixed(1)}s)`, { durationMs: ms, status: 'ok' })
        return result
      } catch (err) {
        const ms = Date.now() - started
        const message = err instanceof Error ? err.message : String(err)
        log('error', step, message, { durationMs: ms, status: 'fail' })
        throw err
      }
    },
  }
}
