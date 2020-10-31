export class MessageSender {

    constructor(el, sendMessage) {
        this.el = el;

        const inputField = el.querySelector('.chat__message-input');
        const sendBtn = el.querySelector('.chat__message-send-btn');

        const handleListener = () => {
            const message = inputField.value.trim();
            sendMessage(message);
            inputField.value = '';
        }

        sendBtn.addEventListener('click', () => {
            handleListener();
        });

        inputField.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                handleListener();
            }
        })
    }
}
