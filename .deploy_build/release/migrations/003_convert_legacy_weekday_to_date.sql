-- +goose Up
WITH base AS (
    SELECT (date_trunc('week', CURRENT_DATE)::date - INTERVAL '7 days')::date AS prev_monday
)
UPDATE events e
SET day = to_char(
    b.prev_monday +
    CASE e.day
        WHEN 'Saturday' THEN 5
        WHEN 'Sunday' THEN 6
    END,
    'YYYY-MM-DD'
)
FROM base b
WHERE e.day IN ('Saturday', 'Sunday');

-- +goose Down
-- irreversible data migration
SELECT 1;
