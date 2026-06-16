-- Story 19.16: draw formula catalogue + draw policies (Wave D persistence).

CREATE TABLE draw_formulas (
    id UUID PRIMARY KEY,
    troupe_id UUID NOT NULL REFERENCES troupes (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(16) NOT NULL,
    factor_config ${draw_factor_config_json_type} NOT NULL,
    version INT NOT NULL DEFAULT 1,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    -- Set to troupe_id when is_system = TRUE; enforces at-most-one system formula (H2 portable).
    system_troupe_key UUID,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX draw_formulas_troupe_status_idx ON draw_formulas (troupe_id, status);
CREATE UNIQUE INDEX draw_formulas_system_troupe_unique ON draw_formulas (system_troupe_key);

CREATE TABLE draw_policies (
    id UUID PRIMARY KEY,
    troupe_id UUID NOT NULL REFERENCES troupes (id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons (id) ON DELETE CASCADE,
    scope VARCHAR(16) NOT NULL,
    -- Nullable scope keys emulate partial unique indexes (H2 + PostgreSQL portable).
    troupe_scope_key UUID,
    season_scope_key UUID,
    default_rule ${draw_policy_rule_json_type} NOT NULL,
    category_rules ${draw_policy_rules_json_type} NOT NULL DEFAULT ${draw_policy_rules_json_default},
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX draw_policies_troupe_idx ON draw_policies (troupe_id);
${draw_policies_season_idx_sql};

-- At most one TROUPE-scoped policy per troupe; at most one SEASON-scoped policy per season.
CREATE UNIQUE INDEX draw_policies_troupe_scope_unique ON draw_policies (troupe_scope_key);
CREATE UNIQUE INDEX draw_policies_season_scope_unique ON draw_policies (season_scope_key);
