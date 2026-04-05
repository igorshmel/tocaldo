-- +goose Up
-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'events_id_seq') THEN
        CREATE SEQUENCE events_id_seq;
    END IF;
END$$;
-- +goose StatementEnd

ALTER TABLE events ALTER COLUMN id SET DEFAULT nextval('events_id_seq');

SELECT setval('events_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM events), 0), 1), false);

-- +goose Down
ALTER TABLE events ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS events_id_seq;
