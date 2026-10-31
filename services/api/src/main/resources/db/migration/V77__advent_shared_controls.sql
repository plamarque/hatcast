-- The shared member game remains authoritative. Historical test data is preserved.
ALTER TABLE advent_member_lock ADD COLUMN test_offset_seconds BIGINT NOT NULL DEFAULT 0;
ALTER TABLE advent_member_lock ADD COLUMN test_session_id UUID;
CREATE TABLE advent_member_replays (
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL CHECK (quiz_day BETWEEN 1 AND 24),
    PRIMARY KEY (user_id, quiz_day)
);
