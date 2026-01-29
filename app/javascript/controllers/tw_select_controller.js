import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button", "menu", "hidden", "label"]
  static values = {
    defaultLabel: String,
    defaultValue: String
  }

  connect() {
    // init valeurs par défaut si jamais
    if (this.hasHiddenTarget && !this.hiddenTarget.value && this.hasDefaultValueValue) {
      this.hiddenTarget.value = this.defaultValueValue
    }
    if (this.hasLabelTarget && !this.labelTarget.textContent.trim() && this.hasDefaultLabelValue) {
      this.labelTarget.textContent = this.defaultLabelValue
    }

    this._outside = this.outsideClick.bind(this)
    this._esc = this.onEsc.bind(this)
  }

  toggle() {
    this.isOpen() ? this.close() : this.open()
  }

  open() {
    this.menuTarget.hidden = false
    this.element.classList.add("is-open")
    this.buttonTarget.setAttribute("aria-expanded", "true")
    document.addEventListener("click", this._outside)
    window.addEventListener("keydown", this._esc)
  }

  close() {
    this.menuTarget.hidden = true
    this.element.classList.remove("is-open")
    this.buttonTarget.setAttribute("aria-expanded", "false")
    document.removeEventListener("click", this._outside)
    window.removeEventListener("keydown", this._esc)
  }

  pick(e) {
    const opt = e.currentTarget
    const value = opt.dataset.value
    const text = opt.textContent.trim()

    this.hiddenTarget.value = value
    this.labelTarget.textContent = text

    this.menuTarget.querySelectorAll(".tw-select__opt").forEach((el) => {
      el.classList.remove("is-active")
    })
    opt.classList.add("is-active")

    this.close()
  }

  outsideClick(e) {
    if (!this.element.contains(e.target)) this.close()
  }

  onEsc(e) {
    if (e.key === "Escape") this.close()
  }

  isOpen() {
    return this.menuTarget.hidden === false
  }
}
