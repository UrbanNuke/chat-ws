export class AuthForm {
    constructor(el, login) {
        this.el = el;
        this.login = login;

        const nickInput = this.el.querySelector('.auth-form__nick-input');
        const loginBtn = this.el.querySelector('.auth-form__enter-btn');

        loginBtn.addEventListener('click', () => {
            const nickName = nickInput.value.trim();
            if (!nickName) {
                console.error('Не введён никнейм');
                return;
            }

            this.login(nickName);
        });
    }

    /** Спрятать компонент AuthForm */
    show() {
        this.el.classList.remove('hidden')
    }

    /** Показать компонент AuthForm */
    hide() {
        this.el.classList.add('hidden')
    }
}
