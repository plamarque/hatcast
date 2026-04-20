-- V2 cible : troupes + saisons (Postgres / H2 test en mode PostgreSQL)
CREATE TABLE troupes (
    id UUID NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE seasons (
    id UUID NOT NULL PRIMARY KEY,
    troupe_id UUID NOT NULL,
    slug VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    event_count INT NOT NULL DEFAULT 0,
    participant_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT seasons_troupe_fk FOREIGN KEY (troupe_id) REFERENCES troupes (id) ON DELETE CASCADE,
    CONSTRAINT seasons_troupe_slug UNIQUE (troupe_id, slug)
);

CREATE INDEX idx_seasons_troupe_created ON seasons (troupe_id, created_at DESC);

-- Troupe seed (La Malice) — id aligné sur hatcast.troupe.seed-troupe-id
INSERT INTO troupes (id, name, slug, created_at)
VALUES (
    'a0000001-0000-4000-8000-000000000001',
    'La Malice',
    'la-malice',
    CURRENT_TIMESTAMP
);
