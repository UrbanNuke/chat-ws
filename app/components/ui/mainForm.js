export class MainForm {
    constructor(el) {
        this.el = el;
    }

    /** Спрятать компонент MainForm */
    show() {
        this.el.classList.remove('hidden')
    }

    /** Показать компонент MainForm */
    hide() {
        this.el.classList.add('hidden')
    }
}
