-- Story 2.12d: organizer-set gender on participant rows (ADR 0020)
ALTER TABLE season_participants
    ADD COLUMN gender VARCHAR(32);

ALTER TABLE event_participants
    ADD COLUMN gender VARCHAR(32);
