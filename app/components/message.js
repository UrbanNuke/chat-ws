export class Message {
    constructor(data, prevMessageTheSameUser) {
        this.data = data;
        this.el = this.createMessageEl(this.data, prevMessageTheSameUser);
    }

    /**
     * Создание элемента "сообщение"
     * @param data данные для сообщения
     * @param prevMessageTheSameUser пред. сообщение от того же отправителя
     */
    createMessageEl(data, prevMessageTheSameUser) {
        let {date, text} = data.message;

        const messageEl = document.createElement('div');
        messageEl.classList.add('chat__message');
        if (data.own) {
            messageEl.classList.add('chat__message--own');
        }

        date = new Date(Date.parse(date)).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});

        messageEl.innerHTML = `
            <div class="chat__message-avatar
                avatar-${data.user.id}
                ${data.own ? 'chat__message-avatar--own' : ''}
                ${prevMessageTheSameUser ? 'chat__message-avatar--not-visible' : ''}">
            </div>
            <div class="chat__message-wrapper ">
                <span class="chat__message-text">${text}</span>
                <span class="chat__message-date">${date}</span>
            </div>
        `;

        const avatar = messageEl.querySelector('.chat__message-avatar');
        avatar.style.backgroundImage = `url(${data.user.avatar})`;

        return messageEl;
    }

    /** Изменение аватара сообщения */
    changeAvatar() {
        const avatar = this.el.querySelector('.chat__message-avatar');
        avatar.style.backgroundImage = `url(${this.data.user.avatar})`;
    }
}
