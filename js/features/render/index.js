import { renderCalendar } from './calendar-render.js';
import { renderBacklog } from './backlog-render.js';

export function renderPlanner({ days, events, todayStr, calendarContainer, backlogContainer, createEventEl }) {
    renderCalendar({ days, events, todayStr, calendarContainer, createEventEl });
    renderBacklog({ events, backlogContainer, createEventEl });
}
