-- Prepared content is separate from all resettable test-game state.
CREATE TABLE advent_quizzes (
    quiz_day INTEGER PRIMARY KEY CHECK (quiz_day BETWEEN 1 AND 24),
    display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
    portrait_ref VARCHAR(255),
    statement_0 TEXT NOT NULL CHECK (length(trim(statement_0)) > 0),
    statement_1 TEXT NOT NULL CHECK (length(trim(statement_1)) > 0),
    statement_2 TEXT NOT NULL CHECK (length(trim(statement_2)) > 0),
    false_choice INTEGER NOT NULL CHECK (false_choice BETWEEN 0 AND 2),
    explanation TEXT
);

-- Legacy fictional answers cannot safely be paired with newly prepared content.
CREATE TABLE advent_content_transition (id INTEGER PRIMARY KEY CHECK (id = 1), reset_required BOOLEAN NOT NULL);
INSERT INTO advent_content_transition (id, reset_required)
SELECT 1, CASE WHEN EXISTS (SELECT 1 FROM advent_test_answers)
    OR EXISTS (SELECT 1 FROM advent_test_attempts)
    OR EXISTS (SELECT 1 FROM advent_test_generations)
    OR EXISTS (SELECT 1 FROM advent_test_replays)
    OR EXISTS (SELECT 1 FROM advent_test_member_state)
    OR EXISTS (SELECT 1 FROM advent_test_clock_advances)
    THEN TRUE ELSE FALSE END;
