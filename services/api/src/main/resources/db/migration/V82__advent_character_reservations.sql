-- Reservation metadata is private and does not make an incomplete quiz playable.
CREATE TABLE advent_character_reservations (
    quiz_day INTEGER PRIMARY KEY CHECK (quiz_day BETWEEN 1 AND 24),
    character_key VARCHAR(255) UNIQUE,
    display_name TEXT NOT NULL,
    portrait_ref TEXT
);
-- Existing rows remain unbound until the operator matches them to the catalogue.
INSERT INTO advent_character_reservations (quiz_day, display_name, portrait_ref)
SELECT quiz_day, display_name, portrait_ref FROM advent_quizzes;

-- Local deletion suppresses fictional offline seeding until new content is prepared.
CREATE TABLE advent_local_deleted_days (quiz_day INTEGER PRIMARY KEY CHECK (quiz_day BETWEEN 1 AND 24));
