package postgres

import (
    "context"
    "database/sql"

    "tocaldo/internal/models"
    "tocaldo/internal/repository"
)

type EventRepository struct {
    db *sql.DB
}

func New(db *sql.DB) repository.EventRepository {
    return &EventRepository{db: db}
}

func (r *EventRepository) List(ctx context.Context, from *string, to *string) ([]models.Event, error) {
    query := `
        SELECT id, day, start_time, duration, full_text, type
        FROM events
    `
    args := make([]interface{}, 0)
    if from != nil && to != nil {
        query += ` WHERE day = 'backlog' OR (day >= $1 AND day <= $2)`
        args = append(args, *from, *to)
    }
    query += ` ORDER BY id`

    rows, err := r.db.QueryContext(ctx, query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    events := make([]models.Event, 0)
    for rows.Next() {
        var ev models.Event
        var startTime sql.NullString
        if err := rows.Scan(&ev.ID, &ev.Day, &startTime, &ev.Duration, &ev.FullText, &ev.Type); err != nil {
            return nil, err
        }
        if startTime.Valid {
            ev.StartTime = &startTime.String
        }
        events = append(events, ev)
    }
    if err := rows.Err(); err != nil {
        return nil, err
    }
    return events, nil
}

func (r *EventRepository) Create(ctx context.Context, ev models.Event) (int64, error) {
    var id int64
    var startTime interface{}
    if ev.StartTime != nil {
        startTime = *ev.StartTime
    } else {
        startTime = nil
    }
    err := r.db.QueryRowContext(ctx, `
        INSERT INTO events (day, start_time, duration, full_text, type)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `, ev.Day, startTime, ev.Duration, ev.FullText, ev.Type).Scan(&id)
    if err != nil {
        return 0, err
    }
    return id, nil
}

func (r *EventRepository) Update(ctx context.Context, ev models.Event) error {
    var startTime interface{}
    if ev.StartTime != nil {
        startTime = *ev.StartTime
    } else {
        startTime = nil
    }
    _, err := r.db.ExecContext(ctx, `
        UPDATE events
        SET day = $2, start_time = $3, duration = $4, full_text = $5, type = $6
        WHERE id = $1
    `, ev.ID, ev.Day, startTime, ev.Duration, ev.FullText, ev.Type)
    return err
}

func (r *EventRepository) Delete(ctx context.Context, id int64) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM events WHERE id = $1`, id)
    return err
}
