import { DEFAULT_EVENT_TEMPLATES } from '../config/constants.js';

export const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
});

export function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function getWeekDays(baseDate) {
    const start = new Date(baseDate);
    const week = [];
    for (let i = 0; i < 7; i += 1) {
        const next = new Date(start);
        next.setDate(start.getDate() + i);
        week.push(next);
    }

    const currentWeekStart = startOfWeek(new Date());
    const isCurrentWeek = toDateKey(currentWeekStart) === toDateKey(start);
    if (isCurrentWeek) {
        const todayDay = new Date().getDay();
        if (todayDay === 1) {
            const prev = new Date(start);
            prev.setDate(start.getDate() - 1);
            week.unshift(prev);
        } else if (todayDay === 0) {
            const next = new Date(start);
            next.setDate(start.getDate() + 7);
            week.push(next);
        }
    }

    return week.map((dayDate) => ({
        key: toDateKey(dayDate),
        name: dayDate.toLocaleDateString('en-US', { weekday: 'long' }),
        date: dayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        fullDate: dayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    }));
}

export function getVisibleBounds(weekDays, weekStartDate) {
    if (!weekDays.length) {
        const key = toDateKey(weekStartDate);
        return { from: key, to: key };
    }
    return { from: weekDays[0].key, to: weekDays[weekDays.length - 1].key };
}

export function buildDefaultEvents(weekDays) {
    const byName = new Map(weekDays.map((d) => [d.name, d.key]));
    return DEFAULT_EVENT_TEMPLATES.map((ev) => {
        if (ev.day === 'backlog') return { ...ev };
        return { ...ev, day: byName.get(ev.day) || ev.day };
    });
}
