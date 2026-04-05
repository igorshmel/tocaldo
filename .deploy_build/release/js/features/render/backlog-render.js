export function renderBacklog({ events, backlogContainer, createEventEl }) {
    backlogContainer.innerHTML = '';
    const backlogEvents = events.filter((e) => e.day === 'backlog');
    backlogEvents.forEach((ev) => {
        backlogContainer.appendChild(createEventEl(ev, true));
    });
    if (!backlogEvents.length) {
        const placeholder = document.createElement('div');
        placeholder.className = 'mt-2 text-center text-[0.8rem] italic text-[#ccc]';
        placeholder.textContent = 'Double click to add';
        backlogContainer.appendChild(placeholder);
    }
}
