import {
    PX_PER_MIN,
    MARGIN_TOP,
    TOTAL_VERTICAL_GAP,
    START_HOUR,
    END_HOUR,
} from '../../config/constants.js';
import { timeToMinutes } from '../../utils/time.js';
import { toDateKey } from '../../utils/date.js';
import { appendCurrentTimeIndicator } from './current-time-indicator.js';

export function renderCalendar({ days, events, todayStr, calendarContainer, createEventEl }) {
    calendarContainer.innerHTML = '';
    const todayKey = toDateKey(new Date());
    const showCurrentTimeIndicator = days.some((day) => day.key === todayKey);

    days.forEach((day, idx) => {
        const col = document.createElement('div');
        col.className = 'day-column relative flex min-w-[33.333%] flex-[0_0_33.333%] flex-col snap-start border-r border-[#e3dbce] bg-[#fff7ea] last:border-r-0';
        col.dataset.dayKey = day.key;
        const active = day.fullDate === todayStr ? 'active' : '';

        const navLeft = idx === 0
            ? `
                <button class="week-nav week-nav-left absolute left-2 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-0 bg-white/25 p-0 cursor-pointer text-white"
                        style="top:50%;transform:translateY(-50%);"
                        data-nav="prev" title="Previous week" aria-label="Previous week">
                    <svg viewBox="0 0 10 10" class="h-[10px] w-[10px]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M6.8 1.4 3.2 5l3.6 3.6"></path>
                    </svg>
                </button>
            `
            : '';
        const navRight = idx === days.length - 1
            ? `
                <button class="week-nav week-nav-right absolute right-2 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-0 bg-white/25 p-0 cursor-pointer text-white"
                        style="top:50%;transform:translateY(-50%);"
                        data-nav="next" title="Next week" aria-label="Next week">
                    <svg viewBox="0 0 10 10" class="h-[10px] w-[10px]" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M3.2 1.4 6.8 5 3.2 8.6"></path>
                    </svg>
                </button>
            `
            : '';

        col.innerHTML = `
            <div class="day-header-container relative z-10 bg-[#fff7ea] px-5 pt-5 pb-[10px] text-center">
                <div class="day-header-box relative w-full rounded-[4px] py-[10px] text-white shadow-[0_2px_5px_rgba(0,0,0,0.1)] ${active ? 'bg-[#cbd1c7]' : 'bg-[#bababa]'} ${active}">
                    ${navLeft}
                    <h2 class="text-center text-[1.2rem] font-normal uppercase tracking-[1px]">${day.name}</h2>
                    ${navRight}
                </div>
            </div>
            <div class="day-date border-b border-[#f0f0f0] bg-[#fff7ea] py-[5px] pb-[15px] text-center text-[0.85rem] font-light text-[#aaa]">${day.date}</div>
        `;

        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid-container relative flex-1 w-full';

        for (let h = START_HOUR; h <= END_HOUR; h += 1) {
            const slot = document.createElement('div');
            slot.className = 'time-slot box-border grid h-[45px] grid-cols-[60px_1fr] border-b border-[#f6edde]';
            const hStr = h.toString().padStart(2, '0');
            slot.innerHTML = `<div class="ts-time flex items-center justify-center border-r border-[#fafafa] text-[0.7rem] text-[#999] [font-variant-numeric:tabular-nums]">${hStr}:00</div>`;
            gridDiv.appendChild(slot);
        }

        events.filter((e) => e.day === day.key).forEach((ev) => {
            const el = createEventEl(ev, false);
            const top = timeToMinutes(ev.startTime) * PX_PER_MIN;
            const height = ev.duration * PX_PER_MIN;
            el.style.top = `${top + MARGIN_TOP}px`;
            el.style.height = `${height - TOTAL_VERTICAL_GAP}px`;
            gridDiv.appendChild(el);
        });

        if (showCurrentTimeIndicator) {
            appendCurrentTimeIndicator({
                gridDiv,
                isToday: day.key === todayKey,
            });
        }

        col.appendChild(gridDiv);
        calendarContainer.appendChild(col);
    });
}
