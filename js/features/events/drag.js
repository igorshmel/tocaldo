import { MARGIN_TOP, PX_PER_MIN, SNAP_PX } from '../../config/constants.js';
import { minutesToTime, timeToMinutes } from '../../utils/time.js';

export function startDrag({
    e,
    el,
    evData,
    getEvents,
    render,
    updateEvent,
    checkOverlap,
}) {
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = el.getBoundingClientRect();

    let placeholder = null;
    if (evData.day === 'backlog') {
        placeholder = document.createElement('div');
        placeholder.className = 'event-card in-backlog';
        placeholder.style.visibility = 'hidden';
        placeholder.style.height = `${rect.height}px`;
        el.parentNode.insertBefore(placeholder, el);
    }

    el.style.position = 'fixed';
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.width = `${rect.width}px`;
    el.style.zIndex = 1000;
    el.style.opacity = 0.9;
    el.style.cursor = 'grabbing';

    let hasMoved = false;

    function move(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            hasMoved = true;
            el.style.left = `${rect.left + dx}px`;
            el.style.top = `${rect.top + dy}px`;
        }
    }

    function up(upEvent) {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        if (placeholder) placeholder.remove();

        if (!hasMoved) {
            resetStyles();
            return;
        }

        el.style.display = 'none';
        const elemBelow = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
        el.style.display = '';

        const backlogTarget = elemBelow?.closest('.backlog-area');
        const col = elemBelow?.closest('.day-column');
        let targetGrid = elemBelow?.closest('.grid-container');

        if (backlogTarget) {
            const event = getEvents().find((x) => x.id === evData.id);
            if (event) {
                event.day = 'backlog';
                event.startTime = null;
                updateEvent(event).catch((err) => {
                    console.error('Failed to update event:', err);
                });
                render();
            } else {
                resetStyles();
            }
            return;
        }

        if (!targetGrid && col) {
            targetGrid = col.querySelector('.grid-container');
        }

        if (col && targetGrid) {
            const gridRect = targetGrid.getBoundingClientRect();
            const offsetY = startY - rect.top;
            const visualTop = (upEvent.clientY - offsetY) - gridRect.top;

            let logicalTop = visualTop - MARGIN_TOP;
            let snappedLogicalTop = Math.round(logicalTop / SNAP_PX) * SNAP_PX;
            if (snappedLogicalTop < 0) snappedLogicalTop = 0;

            const newMins = snappedLogicalTop / PX_PER_MIN;
            const newTime = minutesToTime(newMins);
            const targetDay = col.dataset.dayKey;

            if (!checkOverlap(evData.id, targetDay, newTime, evData.duration)) {
                const event = getEvents().find((x) => x.id === evData.id);
                if (event) {
                    event.day = targetDay;
                    event.startTime = newTime;
                    updateEvent(event).catch((err) => {
                        console.error('Failed to update event:', err);
                    });
                    render();
                }
            } else {
                render();
            }
        } else {
            render();
        }
    }

    function resetStyles() {
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.width = '';
        el.style.zIndex = '';
        el.style.opacity = '';
        el.style.cursor = '';
        if (evData.day !== 'backlog') {
            const top = timeToMinutes(evData.startTime) * PX_PER_MIN;
            el.style.top = `${top + MARGIN_TOP}px`;
        }
    }

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}
