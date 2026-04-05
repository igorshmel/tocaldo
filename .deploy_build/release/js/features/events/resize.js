import {
    END_HOUR,
    START_HOUR,
    PX_PER_MIN,
    SNAP_PX,
    TOTAL_VERTICAL_GAP,
} from '../../config/constants.js';
import { timeToMinutes } from '../../utils/time.js';

export function startResize({ e, el, evData, getEvents, updateEvent }) {
    const startY = e.clientY;
    const startHeight = parseFloat(el.style.height);
    const thisStart = timeToMinutes(evData.startTime);
    let maxDurationMins = (END_HOUR + 1 - START_HOUR) * 60 - thisStart;

    getEvents()
        .filter((event) => event.day === evData.day && event.id !== evData.id)
        .forEach((event) => {
            const eventStart = timeToMinutes(event.startTime);
            if (eventStart >= thisStart) {
                const gap = eventStart - thisStart;
                if (gap < maxDurationMins) maxDurationMins = gap;
            }
        });

    const maxVisualHeight = maxDurationMins * PX_PER_MIN - TOTAL_VERTICAL_GAP;

    function move(moveEvent) {
        const diff = moveEvent.clientY - startY;
        let newVisualH = startHeight + diff;
        let newFullH = newVisualH + TOTAL_VERTICAL_GAP;
        newFullH = Math.round(newFullH / SNAP_PX) * SNAP_PX;
        if (newFullH < SNAP_PX) newFullH = SNAP_PX;

        let constrainedVisualH = newFullH - TOTAL_VERTICAL_GAP;
        if (constrainedVisualH > maxVisualHeight) constrainedVisualH = maxVisualHeight;
        el.style.height = `${constrainedVisualH}px`;
    }

    function up() {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);

        const h = parseFloat(el.style.height) + TOTAL_VERTICAL_GAP;
        const event = getEvents().find((x) => x.id === evData.id);
        if (event) {
            event.duration = h / PX_PER_MIN;
            updateEvent(event).catch((err) => {
                console.error('Failed to update event:', err);
            });
        }
    }

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}
