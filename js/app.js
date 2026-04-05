import { loadEvents, createEventOnServer, updateEventOnServer, deleteEventOnServer } from './api/eventsApi.js';
import { createEventFactory } from './features/events/index.js';
import { renderPlanner } from './features/render/index.js';
import { startCurrentTimeIndicatorTicker } from './features/render/current-time-indicator.js';
import { bindBacklogCreation } from './features/backlog/index.js';
import { bindWeekNavigation, scrollToActiveDay } from './features/navigation/week-navigation.js';
import { initStaticControls } from './features/ui/static-controls.js';
import { createStore } from './state/store.js';
import { todayStr, getWeekDays, getVisibleBounds, buildDefaultEvents } from './utils/date.js';

const calendarContainer = document.getElementById('calendarMain');
const backlogContainer = document.getElementById('backlogContainer');
const backlogActions = document.querySelector('.backlog-actions');

const store = createStore();

function render() {
    renderPlanner({
        days: store.getDays(),
        events: store.getEvents(),
        todayStr,
        calendarContainer,
        backlogContainer,
        createEventEl: eventFeatures.createEventEl,
    });
}

const eventFeatures = createEventFactory({
    getEvents: () => store.getEvents(),
    setEvents: (next) => store.setEvents(next),
    render,
    updateEvent: updateEventOnServer,
    deleteEvent: deleteEventOnServer,
});

function loadWeek() {
    const weekStartDate = store.getWeekStartDate();
    const days = getWeekDays(weekStartDate);
    store.setDays(days);
    const bounds = getVisibleBounds(days, weekStartDate);

    return loadEvents(bounds.from, bounds.to)
        .then((loaded) => {
            if (!Array.isArray(loaded)) {
                throw new Error('invalid payload');
            }
            store.setEvents(loaded);
        })
        .catch((err) => {
            console.warn('Using default events due to API error:', err);
            store.setEvents(buildDefaultEvents(store.getDays()));
        })
        .then(() => {
            render();
        });
}

function createBacklogEvent(type) {
    const newEvent = {
        day: 'backlog',
        startTime: null,
        duration: 60,
        fullText: 'New Task',
        type: type || 'peach',
    };

    createEventOnServer(newEvent)
        .then((created) => {
            store.pushEvent(created);
            render();
            setTimeout(() => {
                const newEl = backlogContainer.querySelector(`.event-card[data-id="${created.id}"]`);
                if (newEl) eventFeatures.startEdit(newEl, created);
            }, 0);
        })
        .catch((err) => {
            console.error('Failed to create event:', err);
        });
}

function bootstrap() {
    loadWeek().then(() => {
        scrollToActiveDay(calendarContainer);
        initStaticControls();
        startCurrentTimeIndicatorTicker(calendarContainer);
    });

    bindBacklogCreation({
        backlogContainer,
        backlogActions,
        onCreate: createBacklogEvent,
    });

    bindWeekNavigation({
        calendarContainer,
        onNavigate: (dir) => {
            store.moveWeek(dir);
            loadWeek();
        },
    });
}

document.addEventListener('DOMContentLoaded', bootstrap);
