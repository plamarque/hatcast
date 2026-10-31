-- Member game is independent of the resettable development test game.
CREATE TABLE advent_member_lock (id INTEGER PRIMARY KEY CHECK (id = 1));
INSERT INTO advent_member_lock (id) VALUES (1);
CREATE TABLE advent_member_answers (
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL CHECK (quiz_day BETWEEN 1 AND 24),
    answer_id UUID NOT NULL,
    choice INTEGER NOT NULL CHECK (choice BETWEEN 0 AND 2),
    correct_choice INTEGER NOT NULL CHECK (correct_choice BETWEEN 0 AND 2),
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reveal_at TIMESTAMP WITH TIME ZONE NOT NULL,
    seen_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, quiz_day),
    UNIQUE (answer_id)
);
-- Populated only by the verified offline fixture, never from the private catalogue.
CREATE TABLE advent_member_demo_quizzes (
    quiz_day INTEGER PRIMARY KEY CHECK (quiz_day BETWEEN 1 AND 24),
    display_name TEXT NOT NULL,
    statement_0 TEXT NOT NULL,
    statement_1 TEXT NOT NULL,
    statement_2 TEXT NOT NULL,
    false_choice INTEGER NOT NULL CHECK (false_choice BETWEEN 0 AND 2)
);

CREATE TABLE advent_member_generations (
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL CHECK (quiz_day BETWEEN 1 AND 24),
    generation UUID NOT NULL,
    PRIMARY KEY (user_id, quiz_day)
);
CREATE TABLE advent_member_attempts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    quiz_day INTEGER NOT NULL CHECK (quiz_day BETWEEN 1 AND 24),
    cancelled BOOLEAN NOT NULL DEFAULT FALSE
);
