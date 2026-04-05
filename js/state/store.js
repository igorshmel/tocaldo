import { startOfWeek } from '../utils/date.js';

export function createStore() {
    const state = {
        events: [],
        weekOffset: 0,
        weekStartDate: startOfWeek(new Date()),
        days: [],
    };

    return {
        getEvents() {
            return state.events;
        },
        setEvents(next) {
            state.events = next;
        },
        pushEvent(event) {
            state.events.push(event);
        },
        getDays() {
            return state.days;
        },
        setDays(next) {
            state.days = next;
        },
        getWeekStartDate() {
            return state.weekStartDate;
        },
        moveWeek(direction) {
            if (direction === 'prev') state.weekOffset -= 1;
            if (direction === 'next') state.weekOffset += 1;

            state.weekStartDate = startOfWeek(new Date());
            state.weekStartDate.setDate(state.weekStartDate.getDate() + (state.weekOffset * 7));
            return state.weekStartDate;
        },
    };
}
