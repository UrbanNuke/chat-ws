import {SystemMessage} from "./systemMessage.js";
import {User} from "./user.js";

export class WSHandler {

    constructor(ui, currentUser) {
        this.ui = ui;
        this.currentUser = currentUser;
    }

    /** Открытие ws соединения */
    openConnection() {
        return new Promise(resolve => {
            this.ws = new WebSocket('ws://localhost:8080');

            this.ws.onmessage = response => {
                const serverData = JSON.parse(response.data);
                const {type, data} = serverData;

                switch (type) {
                    case 'login':
                        this.onLogin(data);
                        break;
                    case 'enterToChat':
                        this.onEnterToChat(data.user);
                        break;
                    case 'leaveFromChat':
                        this.onLeaveFromChat(data.user.id);
                        break;
                    case 'message':
                        this.onMessage(data);
                        break;
                    case 'avatarChanged':
                        this.onAvatarChanged(data);
                        break;
                    default:
                        break;
                }
            }

            this.ws.onclose = async (e) => {
                console.log('closed', e);
            }

            this.ws.onerror = (e) => {
                console.log(e);
            }

            this.ws.onopen = () => {
                resolve();
            }
        });
    }

    /**
     * Логин пользователя
     * @param nick ник
     */
    async login(nick) {
        await this.openConnection();
        const data = {type: 'login', data: {nick}};
        this.ws.send(JSON.stringify(data));
    }

    /**
     * Обработка логина пользователя
     * @param data данные пользователя
     */
    onLogin(data) {
        this.currentUser = new User(data.user, this.uploadAvatar.bind(this));
        const othersUsers = data.otherUsers.map(user => new User(user));
        this.ui.userList.addUsersToList([this.currentUser, ...othersUsers]);
        this.ui.authForm.hide();
        this.ui.mainForm.show();
        const wsData = {type: 'enterToChat', data: {user: this.currentUser}}
        this.ws.send(JSON.stringify(wsData));
    }

    /**
     * Обработка входа в чат нового юзера
     * @param user новый юзера
     */
    onEnterToChat(user) {
        const systemMessage = new SystemMessage(user.nick);
        const newUser = new User(user);
        this.ui.userList.addUserToList(newUser);
        this.ui.messageList.renderSystemMessage(systemMessage.getSystemMessageElement());
    }

    /**
     * Обработка выхода из юзера чата
     * @param id идентификатор юзера
     */
    onLeaveFromChat(id) {
        const user = this.ui.userList.getUserById(id);
        const systemMessage = new SystemMessage(user.nick, false);
        this.ui.userList.removeUserFromList(user);
        this.ui.messageList.renderSystemMessage(systemMessage.getSystemMessageElement());
    }

    /**
     * Отправка сообщения
     * @param message сообщение
     */
    sendMessage(message) {
        const wsData = {
            type: 'message',
            data: {
                user: this.currentUser,
                message: {
                    text: message,
                    date: new Date()
                }
            }
        }
        this.ws.send(JSON.stringify(wsData));
    }

    /**
     * Обработка новых сообщений от сервера
     * @param data данные о сообщении
     */
    onMessage(data) {
        const ownMessage = data.user.id === this.currentUser.id;
        const user = this.ui.userList.getUserById(data.user.id);
        user.changeLastMessage(data.message.text);
        data.user = user;
        this.ui.messageList.addMessage(data, ownMessage);
    }

    /**
     * Загрузка аватара на БЕ
     * @param data аватар
     */
    uploadAvatar(data) {
        fetch('http://localhost:8081/chat/upload-avatar', {
            method: 'post',
            body: JSON.stringify({
                id: this.currentUser.id,
                image: data,
            }),
        });
    }

    /**
     * Обработка события изменения автара юзера
     * @param data данные с сервера
     */
    onAvatarChanged(data) {
        const {userId} = data;
        const user = this.ui.userList.getUserById(userId);
        user.refreshAvatar();
        this.ui.messageList.changeAvatarInMessageList(userId)
    }
}
