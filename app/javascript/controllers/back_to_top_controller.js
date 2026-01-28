import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.toggle()
    window.addEventListener("scroll", this.toggle.bind(this))
  }

  disconnect() {
    window.removeEventListener("scroll", this.toggle.bind(this))
  }

  toggle() {
    if (window.scrollY > 300) {
      this.element.classList.add("is-visible")
    } else {
      this.element.classList.remove("is-visible")
    }
  }

  scroll(event) {
    event.preventDefault()
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }
}
