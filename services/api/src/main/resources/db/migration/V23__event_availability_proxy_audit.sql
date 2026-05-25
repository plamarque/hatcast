-- Story 5.5: proxy availability for name-only participants + audit actor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE event_availability ADD COLUMN id UUID;
UPDATE event_availability SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE event_availability ALTER COLUMN id SET NOT NULL;

ALTER TABLE event_availability ADD COLUMN season_participant_id UUID NULL;
ALTER TABLE event_availability ADD COLUMN event_participant_id UUID NULL;
ALTER TABLE event_availability ADD COLUMN recorded_by_user_id UUID NULL;

ALTER TABLE event_availability DROP CONSTRAINT event_availability_pkey;

ALTER TABLE event_availability ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE event_availability ADD PRIMARY KEY (id);

ALTER TABLE event_availability
    ADD CONSTRAINT event_availability_season_participant_fk
        FOREIGN KEY (season_participant_id) REFERENCES season_participants (id) ON DELETE CASCADE;

ALTER TABLE event_availability
    ADD CONSTRAINT event_availability_event_participant_fk
        FOREIGN KEY (event_participant_id) REFERENCES event_participants (id) ON DELETE CASCADE;

ALTER TABLE event_availability
    ADD CONSTRAINT event_availability_recorded_by_fk
        FOREIGN KEY (recorded_by_user_id) REFERENCES users (id);

CREATE UNIQUE INDEX uq_event_availability_event_user ON event_availability (event_id, user_id);

CREATE UNIQUE INDEX uq_event_availability_event_season_participant
    ON event_availability (event_id, season_participant_id);

CREATE UNIQUE INDEX uq_event_availability_event_event_participant
    ON event_availability (event_id, event_participant_id);

ALTER TABLE event_availability
    ADD CONSTRAINT event_availability_subject_chk CHECK (
        (user_id IS NOT NULL AND season_participant_id IS NULL AND event_participant_id IS NULL)
        OR (user_id IS NULL AND season_participant_id IS NOT NULL AND event_participant_id IS NULL)
        OR (user_id IS NULL AND season_participant_id IS NULL AND event_participant_id IS NOT NULL)
    );
