-- Rename equity_tag vocabulary to spectacle category (product term: Catégorie).
-- Must run before seed V26+ which reference events.category.

ALTER TABLE events RENAME COLUMN equity_tag TO category;

ALTER TABLE troupe_equity_tags RENAME TO troupe_categories;

ALTER TABLE troupe_categories
    RENAME CONSTRAINT troupe_equity_tags_troupe_slug TO troupe_categories_troupe_slug;
