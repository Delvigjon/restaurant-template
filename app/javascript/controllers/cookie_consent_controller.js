import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["banner"]

  connect() {
    // 0 = non défini, 1 = accepté, -1 = refusé
    const value = this._read()
    if (!value) this.show()
  }

  accept() {
    this._write("1")
    this.hide()
    this._dispatch("accepted")
  }

  reject() {
    this._write("-1")
    this.hide()
    this._dispatch("rejected")
  }

  show() {
    this.bannerTarget.hidden = false
    // accessibilité : focus sur le premier bouton
    const btn = this.bannerTarget.querySelector("button")
    if (btn) btn.focus()
  }

  hide() {
    this.bannerTarget.hidden = true
  }

  _dispatch(name) {
    window.dispatchEvent(new CustomEvent(`cookie:${name}`))
  }

  _read() {
    try {
      return localStorage.getItem("cookie_consent")
    } catch (e) {
      return null
    }
  }

  _write(val) {
    try {
      localStorage.setItem("cookie_consent", val)
    } catch (e) {
      // no-op
    }
  }
}
