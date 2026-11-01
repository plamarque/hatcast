-- Late discoveries are personal and never count toward the seasonal score.
ALTER TABLE advent_member_answers ADD COLUMN late BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE advent_member_generations ADD COLUMN late BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE advent_member_attempts ADD COLUMN late BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE advent_member_replays ADD COLUMN late BOOLEAN NOT NULL DEFAULT FALSE;
