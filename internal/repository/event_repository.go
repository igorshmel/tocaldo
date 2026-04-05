package repository

import (
    "context"
    "tocaldo/internal/models"
)

type EventRepository interface {
    List(ctx context.Context, from *string, to *string) ([]models.Event, error)
    Create(ctx context.Context, ev models.Event) (int64, error)
    Update(ctx context.Context, ev models.Event) error
    Delete(ctx context.Context, id int64) error
}
