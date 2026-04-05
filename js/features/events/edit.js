export function startEdit({ el, evData, getEvents, updateEvent, render }) {
    const textDiv = el.querySelector('.evt-text');
    if (!textDiv) return;

    textDiv.setAttribute('contenteditable', 'true');
    textDiv.classList.add(
        'outline-none',
        'cursor-text',
        '[user-select:text]',
        '[-webkit-user-select:text]'
    );
    el.classList.add('is-editing');
    el.classList.add(
        '!cursor-text',
        'z-[50]',
        'shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
        '[user-select:text]',
        '[-webkit-user-select:text]'
    );
    el.draggable = false;
    textDiv.focus();

    const range = document.createRange();
    range.selectNodeContents(textDiv);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    let ignoreBlurUntil = 0;
    let modifierTs = 0;

    function markModifier(e) {
        if (e.key === 'Shift' || e.key === 'Control') {
            modifierTs = Date.now();
        }
    }

    function finishEdit(e) {
        if (e.type === 'keydown') {
            markModifier(e);
            if ((e.key === 'Shift' && e.ctrlKey) || (e.key === 'Control' && e.shiftKey)) {
                ignoreBlurUntil = Date.now() + 800;
                return;
            }
        }

        if (e.type === 'keydown' && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            textDiv.blur();
            return;
        }

        if (e.type === 'blur') {
            const now = Date.now();
            if (now < ignoreBlurUntil || now - modifierTs < 1000 || !document.hasFocus()) {
                setTimeout(() => textDiv.focus(), 0);
                return;
            }

            const newText = textDiv.innerText.trim();
            const event = getEvents().find((x) => x.id === evData.id);
            if (event) {
                event.fullText = newText;
                updateEvent(event).catch((err) => {
                    console.error('Failed to update event:', err);
                });
            }

            textDiv.setAttribute('contenteditable', 'false');
            textDiv.classList.remove(
                'outline-none',
                'cursor-text',
                '[user-select:text]',
                '[-webkit-user-select:text]'
            );
            el.classList.remove('is-editing');
            el.classList.remove(
                '!cursor-text',
                'z-[50]',
                'shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
                '[user-select:text]',
                '[-webkit-user-select:text]'
            );
            el.draggable = true;

            textDiv.removeEventListener('keydown', finishEdit);
            textDiv.removeEventListener('blur', finishEdit);
            window.removeEventListener('keydown', markModifier, true);
            window.removeEventListener('keyup', markModifier, true);

            render();
        }
    }

    textDiv.addEventListener('keydown', finishEdit);
    textDiv.addEventListener('blur', finishEdit);
    window.addEventListener('keydown', markModifier, true);
    window.addEventListener('keyup', markModifier, true);
}
