CREATE TABLE advent_test_replays (
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL,
    PRIMARY KEY (user_id, quiz_day)
);

ALTER TABLE advent_test_answers ADD COLUMN replay_token UUID;
