export function bindBacklogCreation({ backlogContainer, backlogActions, onCreate }) {
    backlogContainer.addEventListener('dblclick', (e) => {
        if (e.target.closest('.event-card')) return;
        onCreate('peach');
    });

    if (!backlogActions) return;

    backlogActions.addEventListener('click', (e) => {
        const btn = e.target.closest('.backlog-btn');
        if (!btn) return;
        onCreate(btn.dataset.type);
    });
}
