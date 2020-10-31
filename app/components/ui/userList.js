import {Utils} from "../utils.js";

export class UserList {
    constructor(el, counter) {
        this.el = el;
        this.users = new Map();
        this.counter = counter;
        this.counterCases = ['участник', 'участника', 'участников'];
    }

    /**
     * Получение пользователя по id
     * @param id идентификатор
     */
    getUserById(id) {
        return this.users.get(id);
    }

    /**
     * Добавление нового юзера
     * @param user юзер
     */
    addUserToList(user) {
        this.users.set(user.id, user);
        this.el.append(user.getUserElement());
        this.counter.textContent = `${this.users.size} ${Utils.declOfNum(this.users.size, this.counterCases)}`;
    }

    /**
     * Добавление массива юзеров в список
     * @param users юзеры
     */
    addUsersToList(users) {
        users.forEach(user => this.addUserToList(user));
    }

    /**
     * Удаление юзера из списка
     * @param user юзер
     */
    removeUserFromList(user) {
        user.online = false;
        user.removeUser();
        this.users.delete(user.id);
        this.counter.textContent = `${this.users.size} ${Utils.declOfNum(this.users.size, this.counterCases)}`;
    }
}
