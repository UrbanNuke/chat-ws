export class User {
    constructor(data, uploadAvatar = null) {
        this.el = null;
        this.avatarEl = null;
        this.nick = data.nick;
        this.id = data.id;
        this.online = true;
        this.avatar = data.hasAvatar ? `assets/avatars/${this.id}.png?t=${new Date().getTime()}` : 'assets/img/default_avatar.png';
        this.uploadAvatar = uploadAvatar;
        this.createUserElement(this);
    }

    /** Последнее сообщение пользователя */
    lastMessage = '';

    /** Создание элемента user */
    createUserElement(user) {
        const userEl = document.createElement('div');
        userEl.classList.add('chat__user');
        userEl.innerHTML = `
            <div class="chat__user-avatar"></div>
            <div class="chat__user-info">
                <span class="chat__user-nick">${user.nick}</span>
                <span class="chat__user-last-message">${user.lastMessage}</span>
            </div>`;

        this.avatarEl = userEl.querySelector('.chat__user-avatar');
        this.avatarEl.style.backgroundImage = `url(${this.avatar})`;

        // смена аватара, возможна только для текущего пользователя
        if (this.uploadAvatar) {

            this.avatarEl.addEventListener('dragover', e => {
                if (e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
                    e.preventDefault();
                }
            });

            this.avatarEl.addEventListener('drop', e => {
                const file = e.dataTransfer.items[0].getAsFile();
                const reader = new FileReader();

                reader.readAsDataURL(file);
                reader.addEventListener('load', () => {
                    this.avatar = reader.result;
                    this.avatarEl.style.backgroundImage = `url(${this.avatar})`;
                    this.uploadAvatar(reader.result);
                });
                e.preventDefault();
            })
        }

        this.el = userEl;
    }

    /** Получение элемента user */
    getUserElement() {
        return this.el;
    }

    /** Удалить элемент пользователя из DOM */
    removeUser() {
        this.el.remove();
    }

    /**
     * Изменение последнего сообщения пользователя
     * @param message сообщение
     */
    changeLastMessage(message) {
        this.lastMessage = message;
        this.el.querySelector('.chat__user-last-message').textContent = this.lastMessage;
    }

    /** Обновить аватар пользователя */
    refreshAvatar() {
        this.avatar = `assets/avatars/${this.id}.png?t=${new Date().getTime()}`;
        this.avatarEl.style.backgroundImage = `url(${this.avatar})`;
    }
}
