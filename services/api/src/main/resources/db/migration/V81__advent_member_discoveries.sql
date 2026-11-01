CREATE TABLE advent_member_discoveries (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    discovered_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE advent_member_discovery_attempts (
    user_id UUID NOT NULL REFERENCES users(id),
    attempt_id UUID NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (user_id, attempt_id)
);

CREATE INDEX advent_discovery_attempts_expiry_idx ON advent_member_discovery_attempts (expires_at);
