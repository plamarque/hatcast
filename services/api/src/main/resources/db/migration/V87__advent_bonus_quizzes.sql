-- Separate, additive storage keeps every existing daily quiz and game row intact.
-- The day primary key enforces at most one bonus assignment per day.
CREATE TABLE advent_bonus_quizzes (
    quiz_day INTEGER PRIMARY KEY CHECK (quiz_day BETWEEN 1 AND 24),
    character_key VARCHAR(255) NOT NULL UNIQUE,
    display_name TEXT NOT NULL CHECK (length(trim(display_name)) > 0),
    portrait_ref VARCHAR(255),
    statement_0 TEXT NOT NULL CHECK (length(trim(statement_0)) > 0),
    statement_1 TEXT NOT NULL CHECK (length(trim(statement_1)) > 0),
    statement_2 TEXT NOT NULL CHECK (length(trim(statement_2)) > 0),
    false_choice INTEGER NOT NULL CHECK (false_choice BETWEEN 0 AND 2),
    explanation TEXT,
    story_0 TEXT,
    story_1 TEXT,
    story_2 TEXT,
    content_revision BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE advent_bonus_answers (
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL REFERENCES advent_bonus_quizzes(quiz_day),
    answer_id UUID NOT NULL UNIQUE,
    choice INTEGER NOT NULL CHECK (choice BETWEEN 0 AND 2),
    correct_choice INTEGER NOT NULL CHECK (correct_choice BETWEEN 0 AND 2),
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reveal_at TIMESTAMP WITH TIME ZONE NOT NULL,
    seen_at TIMESTAMP WITH TIME ZONE,
    late BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, quiz_day)
);
CREATE TABLE advent_bonus_generations (
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL REFERENCES advent_bonus_quizzes(quiz_day),
    generation UUID NOT NULL,
    late BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, quiz_day)
);
CREATE TABLE advent_bonus_attempts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL REFERENCES advent_bonus_quizzes(quiz_day),
    cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    late BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE advent_bonus_replays (
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL REFERENCES advent_bonus_quizzes(quiz_day),
    late BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, quiz_day)
);
