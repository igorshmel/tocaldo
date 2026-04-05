import { checkOverlap } from './checks.js';
import { startEdit } from './edit.js';
import { startResize } from './resize.js';
import { startDrag } from './drag.js';

export function createEventFactory(deps) {
    const {
        getEvents,
        setEvents,
        render,
        updateEvent,
        deleteEvent,
    } = deps;

    function createEventEl(ev, isBacklog) {
        const layoutClasses = isBacklog
            ? 'relative w-full h-8 pl-2 pr-[22px]'
            : 'absolute left-[65px] right-[5px] w-auto px-2';

        const typeClasses = {
            peach: 'bg-[#ffddc4]',
            green: 'bg-[#e2e3d1]',
            grey: 'bg-[#f9ead5]',
            yellow: 'bg-[#d7f1f6]',
        }[ev.type] || '';

        const el = document.createElement('div');
        el.className = `event-card evt-${ev.type} ${isBacklog ? 'in-backlog' : 'in-calendar'} ${layoutClasses} ${typeClasses} z-[5] flex items-center overflow-hidden rounded-[3px] text-[0.75rem] leading-[1.2] text-[#555] shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-[box-shadow,z-index] duration-200 cursor-grab hover:z-10`;
        el.style.paddingLeft = '8px';
        el.style.paddingRight = isBacklog ? '22px' : '8px';
        el.dataset.id = ev.id;
        el.innerHTML = `
            <div class="evt-text pointer-events-auto relative z-[15] w-full min-h-[1em] whitespace-nowrap overflow-hidden text-ellipsis">${ev.fullText}</div>
            ${isBacklog ? '<button type="button" class="event-delete absolute top-1 right-[6px] w-[14px] h-[14px] p-0 border-0 bg-transparent text-[#888] text-[12px] leading-[14px] cursor-pointer hover:text-[#555]" title="Delete">×</button>' : ''}
            <div class="resize-handle absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-20 ${isBacklog ? 'hidden' : ''}"></div>
        `;
        setupInteractions(el, ev);
        return el;
    }

    function setupInteractions(el, evData) {
        const handle = el.querySelector('.resize-handle');
        const deleteBtn = el.querySelector('.event-delete');

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteEvent(evData.id)
                    .then(() => {
                        setEvents(getEvents().filter((event) => event.id !== evData.id));
                        render();
                    })
                    .catch((err) => {
                        console.error('Failed to delete event:', err);
                    });
            });
        }

        if (evData.day !== 'backlog') {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                startResize({
                    e,
                    el,
                    evData,
                    getEvents,
                    updateEvent,
                });
            });
        }

        el.addEventListener('mousedown', (e) => {
            if (e.target === handle || e.target.isContentEditable) return;
            startDrag({
                e,
                el,
                evData,
                getEvents,
                render,
                updateEvent,
                checkOverlap: (id, day, startTime, duration) => checkOverlap(getEvents, id, day, startTime, duration),
            });
        });

        el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            startEdit({
                el,
                evData,
                getEvents,
                updateEvent,
                render,
            });
        });
    }

    return {
        createEventEl,
        startEdit: (el, evData) => startEdit({
            el,
            evData,
            getEvents,
            updateEvent,
            render,
        }),
    };
}
