-- FR32: freemium default listed in public directory; admin opt-out UI deferred (Story 4.1).
ALTER TABLE troupes
    ADD COLUMN listed_in_directory BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE troupes SET listed_in_directory = TRUE WHERE listed_in_directory IS DISTINCT FROM TRUE;
