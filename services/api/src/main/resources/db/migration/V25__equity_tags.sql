-- Story 17.7: optional equity tag on events + troupe-scoped glossary.

CREATE TABLE troupe_equity_tags (
    id UUID PRIMARY KEY,
    troupe_id UUID NOT NULL REFERENCES troupes(id) ON DELETE CASCADE,
    slug VARCHAR(64) NOT NULL,
    label VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT troupe_equity_tags_troupe_slug UNIQUE (troupe_id, slug)
);

ALTER TABLE events ADD COLUMN equity_tag VARCHAR(64) NULL;
