CREATE TABLE advent_member_dismissals (
    user_id UUID NOT NULL REFERENCES users(id),
    dismissed_on DATE NOT NULL,
    PRIMARY KEY (user_id, dismissed_on)
);
