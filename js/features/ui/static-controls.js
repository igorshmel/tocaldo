export function initStaticControls() {
    document.querySelectorAll('.check-box').forEach((box) => {
        box.onclick = () => {
            box.classList.toggle('checked');
            box.classList.toggle('bg-[#fddeca]');
            box.classList.toggle('border-[#aaa]');
        };
    });

    document.querySelectorAll('.custom-radio').forEach((radio) => {
        radio.onclick = () => radio.classList.toggle('checked');
    });
}
