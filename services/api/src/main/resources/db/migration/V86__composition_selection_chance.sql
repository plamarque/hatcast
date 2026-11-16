-- Add selection-time evidence without rewriting existing compositions or draw snapshots.
ALTER TABLE event_composition_slots ADD COLUMN selection_chance_percent INTEGER;
ALTER TABLE event_composition_slots ADD COLUMN selection_chance_at TIMESTAMPTZ;
ALTER TABLE event_composition_slots ADD COLUMN selection_chance_source VARCHAR(16);
