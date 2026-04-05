export function bindWeekNavigation({ calendarContainer, onNavigate }) {
    calendarContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.week-nav');
        if (!btn) return;
        onNavigate(btn.dataset.nav);
    });
}

export function scrollToActiveDay(calendarContainer) {
    setTimeout(() => {
        const active = document.querySelector('.day-header-box.active');
        if (!active) return;
        const col = active.closest('.day-column');
        const idx = Array.from(calendarContainer.children).indexOf(col);
        const w = col.offsetWidth;
        const target = idx > 0 ? idx - 1 : 0;
        calendarContainer.scrollTo({ left: target * w, behavior: 'smooth' });
    }, 100);
}
