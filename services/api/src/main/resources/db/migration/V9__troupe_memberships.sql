-- Epic 2.1 : adhésion utilisateur ↔ troupe + profil membre minimal (pseudo par troupe)
CREATE TABLE troupe_memberships (
    id UUID NOT NULL PRIMARY KEY,
    troupe_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT troupe_memberships_troupe_fk FOREIGN KEY (troupe_id) REFERENCES troupes (id) ON DELETE CASCADE,
    CONSTRAINT troupe_memberships_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT troupe_memberships_unique_user_troupe UNIQUE (troupe_id, user_id)
);

CREATE INDEX idx_troupe_memberships_user_id ON troupe_memberships (user_id);
CREATE INDEX idx_troupe_memberships_troupe_id ON troupe_memberships (troupe_id);
CREATE INDEX idx_troupe_memberships_user_status ON troupe_memberships (user_id, status);
