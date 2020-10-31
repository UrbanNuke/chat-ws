export class SystemMessage {
    constructor(nick, enter = true) {
        this.nick = nick;
        this.enter = enter;
        this.el = this.createSystemMessage(nick);
    }

    /** Создание элемента SystemMessage */
    createSystemMessage(nick) {
        const systemMessageEl = document.createElement('p');
        systemMessageEl.classList.add('chat__system-message');
        console.log(this.enter);
        systemMessageEl.innerHTML = `Пользователь <b>${nick}</b> ${this.enter ? 'вошёл в чат' : 'вышел из чата'}`;
        return systemMessageEl;
    }

    /** Получение элемента SystemMessage */
    getSystemMessageElement() {
        return this.el;
    }
}
