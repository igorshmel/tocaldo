import {
    END_HOUR,
    MARGIN_TOP,
    PX_PER_MIN,
    START_HOUR,
} from '../../config/constants.js';

const CURRENT_TIME_SELECTOR = '[data-current-time-indicator="true"]';

let tickerTimeoutId = 0;

function getCurrentTimeMinutes(now = new Date()) {
    return now.getHours() * 60 + now.getMinutes() + (now.getSeconds() / 60);
}

function isWithinVisibleHours(totalMinutes) {
    return totalMinutes >= START_HOUR * 60 && totalMinutes < (END_HOUR + 1) * 60;
}

function positionIndicator(indicator, now = new Date()) {
    const totalMinutes = getCurrentTimeMinutes(now);

    if (!isWithinVisibleHours(totalMinutes)) {
        indicator.style.display = 'none';
        return;
    }

    indicator.style.display = '';
    indicator.style.top = `${(totalMinutes - START_HOUR * 60) * PX_PER_MIN + MARGIN_TOP}px`;
}

function scheduleNextTick(root) {
    const now = new Date();
    const delay = ((60 - now.getSeconds()) * 1000) - now.getMilliseconds() + 50;

    tickerTimeoutId = window.setTimeout(() => {
        updateCurrentTimeIndicators(root);
        scheduleNextTick(root);
    }, Math.max(delay, 1000));
}

export function appendCurrentTimeIndicator({ gridDiv, isToday }) {
    const indicator = document.createElement('div');
    indicator.dataset.currentTimeIndicator = 'true';
    indicator.className = `pointer-events-none absolute left-[60px] right-0 z-[6] ${isToday ? 'opacity-100' : 'opacity-70'}`;
    indicator.style.transform = 'translateY(-50%)';

    const line = document.createElement('div');
    line.className = `w-full bg-[#d74c4c] ${isToday ? 'h-[2px]' : 'h-px'}`;

    indicator.appendChild(line);
    gridDiv.appendChild(indicator);

    positionIndicator(indicator);
}

export function updateCurrentTimeIndicators(root = document) {
    const now = new Date();
    root.querySelectorAll(CURRENT_TIME_SELECTOR).forEach((indicator) => {
        positionIndicator(indicator, now);
    });
}

export function startCurrentTimeIndicatorTicker(root = document) {
    if (tickerTimeoutId) {
        window.clearTimeout(tickerTimeoutId);
        tickerTimeoutId = 0;
    }

    updateCurrentTimeIndicators(root);
    scheduleNextTick(root);
}
