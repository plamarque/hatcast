-- PERF-16: server-side query statistics (PostgreSQL / Neon only — not loaded on H2 test profile).
-- If Neon tier rejects the extension, use Neon Query Insights as fallback (see DEVELOPMENT.md).
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
