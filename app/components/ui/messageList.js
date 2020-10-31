import {Message} from "../message.js";

export class MessageList {
    /** Все сообщения в чате */
    messages = [];

    constructor(el) {
        this.el = el;
    }

    /**
     * Добавление сообщения в поток
     * @param data данные о сообщении
     * @param ownMessage личное сообщение
     */
    addMessage(data, ownMessage = false) {
        data.own = ownMessage;
        this.renderMessage(data);
    }

    /**
     * Рендер сообщения
     * @param data данные о сообщении
     */
    renderMessage(data) {
        const fragment = document.createDocumentFragment();

        const prevMessageTheSameUser = this.messages[this.messages.length - 1]?.data?.user?.id === data.user.id;

        const message = new Message(data, prevMessageTheSameUser);
        this.messages.push(message);

        fragment.append(message.el);

        this.el.append(fragment);
    }

    /**
     * Рендер системного сообщения
     * @param systemMessage системное сообщение
     */
    renderSystemMessage(systemMessage) {
        this.el.append(systemMessage);
    }

    /**
     * Изменение аватаров в списке сообщений
     * @param userId идентификатор пользователя, которому необходимо заменить аватар
     */
    changeAvatarInMessageList(userId) {
        this.messages
            .filter(message => message.data.user.id === userId)
            .forEach(message => message.changeAvatar())
    }
}
