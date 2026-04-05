import { START_HOUR } from '../config/constants.js';

export function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    return (parts[0] - START_HOUR) * 60 + parts[1];
}

export function minutesToTime(totalMins) {
    const h = Math.floor(totalMins / 60) + START_HOUR;
    const m = Math.round(totalMins % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
