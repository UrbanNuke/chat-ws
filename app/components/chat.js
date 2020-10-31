import {AuthForm} from "./ui/authForm.js";
import {MainForm} from "./ui/mainForm.js";
import {UserList} from "./ui/userList.js";
import {MessageSender} from "./ui/messageSender.js";
import {MessageList} from "./ui/messageList.js";
import {WSHandler} from "./WSHandler.js";

export class Chat {
    /** Текущий пользователь */
    currentUser = null;

    constructor() {
        this.ui = {
            authForm: new AuthForm(
                document.getElementById('auth-form'),
                this.login.bind(this)
            ),
            mainForm: new MainForm(document.getElementById('chat')),
            userList: new UserList(
                document.getElementById('user-list'),
                document.getElementById('users-counter')
            ),
            messageList: new MessageList(document.getElementById('message-list')),
            messageSender: new MessageSender(
                document.getElementById('message-sender'),
                this.sendMessage.bind(this)
            )
        };
    }

    /**
     * Логин пользователя в чат
     * @param nick никнейм пользователя
     */
    login(nick) {
        this.wsHandler = new WSHandler(this.ui, this.currentUser)
        this.wsHandler.login(nick);
    }

    /**
     * Отправка сообщения в воркер
     * @param message сообщение
     */
    sendMessage(message) {
        this.wsHandler.sendMessage(message);
    }
}

