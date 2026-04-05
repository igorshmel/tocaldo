-- +goose Up
WITH bounds AS (
    SELECT
        date_trunc('week', CURRENT_DATE)::date AS curr_monday,
        (date_trunc('week', CURRENT_DATE)::date - INTERVAL '7 days')::date AS prev_monday
)
UPDATE events e
SET day = to_char((e.day::date + INTERVAL '7 days')::date, 'YYYY-MM-DD')
FROM bounds b
WHERE
    e.day ~ '^\d{4}-\d{2}-\d{2}$'
    AND e.day::date = b.prev_monday;

-- +goose Down
WITH bounds AS (
    SELECT date_trunc('week', CURRENT_DATE)::date AS curr_monday
)
UPDATE events e
SET day = to_char((e.day::date - INTERVAL '7 days')::date, 'YYYY-MM-DD')
FROM bounds b
WHERE
    e.day ~ '^\d{4}-\d{2}-\d{2}$'
    AND e.day::date = b.curr_monday;
