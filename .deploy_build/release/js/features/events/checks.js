import { timeToMinutes } from '../../utils/time.js';

export function checkOverlap(getEvents, id, day, startTimeStr, durationMins) {
    if (day === 'backlog') return false;

    const events = getEvents();
    const newStart = timeToMinutes(startTimeStr);
    const newEnd = newStart + durationMins;

    return events.some((ev) => {
        if (ev.id === id) return false;
        if (ev.day !== day || ev.day === 'backlog') return false;

        const evStart = timeToMinutes(ev.startTime);
        const evEnd = evStart + ev.duration;
        return newStart < evEnd && newEnd > evStart;
    });
}
