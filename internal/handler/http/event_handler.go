package http

import (
    "encoding/json"
    "net/http"
    "strconv"
    "strings"

    "tocaldo/internal/models"
    "tocaldo/internal/service"
)

type EventHandler struct {
    svc *service.EventService
}

func NewEventHandler(svc *service.EventService) *EventHandler {
    return &EventHandler{svc: svc}
}

func (h *EventHandler) Register(mux *http.ServeMux) {
    mux.HandleFunc("/api/events", h.handleEvents)
    mux.HandleFunc("/api/events/", h.handleEventByID)
}

func (h *EventHandler) handleEvents(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        h.listEvents(w, r)
    case http.MethodPost:
        h.createEvent(w, r)
    case http.MethodOptions:
        w.WriteHeader(http.StatusNoContent)
    default:
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
    }
}

func (h *EventHandler) handleEventByID(w http.ResponseWriter, r *http.Request) {
    id, ok := parseID(r.URL.Path)
    if !ok {
        http.Error(w, "invalid id", http.StatusBadRequest)
        return
    }

    switch r.Method {
    case http.MethodPut:
        h.updateEvent(w, r, id)
    case http.MethodDelete:
        h.deleteEvent(w, r, id)
    case http.MethodOptions:
        w.WriteHeader(http.StatusNoContent)
    default:
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
    }
}

func (h *EventHandler) listEvents(w http.ResponseWriter, r *http.Request) {
    from := strings.TrimSpace(r.URL.Query().Get("from"))
    to := strings.TrimSpace(r.URL.Query().Get("to"))

    var fromPtr *string
    var toPtr *string
    if from != "" && to != "" {
        fromPtr = &from
        toPtr = &to
    }

    events, err := h.svc.List(r.Context(), fromPtr, toPtr)
    if err != nil {
        http.Error(w, "failed to list events", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    _ = json.NewEncoder(w).Encode(events)
}

func (h *EventHandler) createEvent(w http.ResponseWriter, r *http.Request) {
    var ev models.Event
    if err := json.NewDecoder(r.Body).Decode(&ev); err != nil {
        http.Error(w, "invalid json", http.StatusBadRequest)
        return
    }

    id, err := h.svc.Create(r.Context(), ev)
    if err != nil {
        http.Error(w, "failed to create event", http.StatusInternalServerError)
        return
    }

    ev.ID = id
    w.Header().Set("Content-Type", "application/json")
    _ = json.NewEncoder(w).Encode(ev)
}

func (h *EventHandler) updateEvent(w http.ResponseWriter, r *http.Request, id int64) {
    var ev models.Event
    if err := json.NewDecoder(r.Body).Decode(&ev); err != nil {
        http.Error(w, "invalid json", http.StatusBadRequest)
        return
    }
    ev.ID = id
    if err := h.svc.Update(r.Context(), ev); err != nil {
        http.Error(w, "failed to update event", http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}

func (h *EventHandler) deleteEvent(w http.ResponseWriter, r *http.Request, id int64) {
    if err := h.svc.Delete(r.Context(), id); err != nil {
        http.Error(w, "failed to delete event", http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}

func parseID(path string) (int64, bool) {
    if !strings.HasPrefix(path, "/api/events/") {
        return 0, false
    }
    idStr := strings.TrimPrefix(path, "/api/events/")
    if idStr == "" {
        return 0, false
    }
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil {
        return 0, false
    }
    return id, true
}
