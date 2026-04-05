-- +goose Up
CREATE TABLE IF NOT EXISTS events (
    id BIGINT PRIMARY KEY,
    day TEXT NOT NULL,
    start_time TEXT NULL,
    duration INTEGER NOT NULL,
    full_text TEXT NOT NULL,
    type TEXT NOT NULL
);

-- +goose Down
DROP TABLE IF EXISTS events;
