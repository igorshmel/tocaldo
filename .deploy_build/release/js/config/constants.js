export const START_HOUR = 7;
export const END_HOUR = 23;
export const SLOT_HEIGHT = 45;
export const MINS_PER_SLOT = 60;
export const PX_PER_MIN = SLOT_HEIGHT / MINS_PER_SLOT;

export const SNAP_MINS = 30;
export const SNAP_PX = SNAP_MINS * PX_PER_MIN;

export const MARGIN_TOP = 3;
export const MARGIN_BOTTOM = 3;
export const TOTAL_VERTICAL_GAP = MARGIN_TOP + MARGIN_BOTTOM;

export const API_BASE = '';

export const DEFAULT_EVENT_TEMPLATES = [
    { id: 1, day: 'Monday', startTime: '07:15', duration: 45, fullText: 'Shower: Get ready', type: 'peach' },
    { id: 2, day: 'Monday', startTime: '08:00', duration: 60, fullText: 'Work: Email', type: 'green' },
    { id: 3, day: 'Monday', startTime: '09:00', duration: 120, fullText: 'Work: Deep focus', type: 'green' },
    { id: 4, day: 'Monday', startTime: '12:30', duration: 30, fullText: 'Lunch', type: 'peach' },
    { id: 5, day: 'backlog', startTime: null, duration: 60, fullText: 'Grocery Shopping', type: 'grey' },
    { id: 6, day: 'backlog', startTime: null, duration: 60, fullText: 'Call Mom', type: 'peach' },
    { id: 7, day: 'backlog', startTime: null, duration: 90, fullText: 'Read Book', type: 'green' },
];
