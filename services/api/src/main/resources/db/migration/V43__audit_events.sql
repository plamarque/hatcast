-- Story 9.0: append-only unified audit journal (FR35 write path).
-- gen_random_uuid(): PostgreSQL 13+ core; H2 test profile registers alias in application-test.yml.

CREATE TABLE audit_events (
    id UUID NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    actor_user_id UUID NULL,
    subject_user_id UUID NULL,
    subject_season_participant_id UUID NULL,
    subject_event_participant_id UUID NULL,
    action_type VARCHAR(64) NOT NULL,
    troupe_id UUID NULL,
    season_id UUID NULL,
    event_id UUID NULL,
    before_json TEXT NULL,
    after_json TEXT NULL,
    metadata_json TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT audit_events_actor_fk FOREIGN KEY (actor_user_id) REFERENCES users (id)
);

CREATE INDEX idx_audit_events_troupe_time ON audit_events (troupe_id, occurred_at DESC);
CREATE INDEX idx_audit_events_season_time ON audit_events (season_id, occurred_at DESC);
CREATE INDEX idx_audit_events_event_time ON audit_events (event_id, occurred_at DESC);
CREATE INDEX idx_audit_events_subject_user ON audit_events (subject_user_id, occurred_at DESC);
