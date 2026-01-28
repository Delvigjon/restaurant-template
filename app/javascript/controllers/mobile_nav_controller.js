import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel", "sheet", "burger"]

  connect() {
    this._previousOverflow = null
  }

  open() {
    if (!this.hasPanelTarget) return

    this.panelTarget.hidden = false
    this.panelTarget.classList.add("is-open")

    // a11y
    if (this.hasBurgerTarget) {
      this.burgerTarget.setAttribute("aria-expanded", "true")
    }

    // lock scroll
    this._previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
  }

  close() {
    if (!this.hasPanelTarget) return

    this.panelTarget.classList.remove("is-open")

    if (this.hasBurgerTarget) {
      this.burgerTarget.setAttribute("aria-expanded", "false")
    }

    // small delay to allow animation
    window.setTimeout(() => {
      this.panelTarget.hidden = true
      document.body.style.overflow = this._previousOverflow || ""
    }, 180)
  }

  esc(event) {
    if (event.key === "Escape") this.close()
  }
}
