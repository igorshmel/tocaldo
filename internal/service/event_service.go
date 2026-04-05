package service

import (
    "context"

    "tocaldo/internal/models"
    "tocaldo/internal/repository"
)

type EventService struct {
    repo repository.EventRepository
}

func NewEventService(repo repository.EventRepository) *EventService {
    return &EventService{repo: repo}
}

func (s *EventService) List(ctx context.Context, from *string, to *string) ([]models.Event, error) {
    return s.repo.List(ctx, from, to)
}

func (s *EventService) Create(ctx context.Context, ev models.Event) (int64, error) {
    return s.repo.Create(ctx, ev)
}

func (s *EventService) Update(ctx context.Context, ev models.Event) error {
    return s.repo.Update(ctx, ev)
}

func (s *EventService) Delete(ctx context.Context, id int64) error {
    return s.repo.Delete(ctx, id)
}
