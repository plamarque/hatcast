-- Allow composition slots to reference event-only participants (Story 6.5 / AC #10).
ALTER TABLE event_composition_slots
    DROP CONSTRAINT event_composition_slots_participant_fk;

ALTER TABLE event_composition_slots
    RENAME COLUMN participant_id TO season_participant_id;

ALTER TABLE event_composition_slots
    ADD CONSTRAINT event_composition_slots_season_participant_fk
        FOREIGN KEY (season_participant_id) REFERENCES season_participants (id) ON DELETE SET NULL;

ALTER TABLE event_composition_slots
    ADD COLUMN event_participant_id UUID NULL
        REFERENCES event_participants (id) ON DELETE SET NULL;

ALTER TABLE event_composition_slots
    ADD CONSTRAINT event_composition_slots_participant_xor_chk CHECK (
        (season_participant_id IS NULL AND event_participant_id IS NULL)
        OR (season_participant_id IS NOT NULL AND event_participant_id IS NULL)
        OR (season_participant_id IS NULL AND event_participant_id IS NOT NULL)
    );
