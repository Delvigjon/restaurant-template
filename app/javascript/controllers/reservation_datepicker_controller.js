import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["display", "hidden", "popover", "title", "days", "slots"]
  static values = {
    maxDays: { type: Number, default: 21 },
    openOnConnect: { type: Boolean, default: true } // 👈 calendrier affiché direct
  }

  connect() {
    this.months = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
    this.dows = ["L","M","M","J","V","S","D"]

    // fenêtre autorisée : today -> today+maxDays
    this.today = this.strip(new Date())
    this.maxDate = new Date(this.today)
    this.maxDate.setDate(this.maxDate.getDate() + this.maxDaysValue)

    // affichage courant
    this.viewYear = this.today.getFullYear()
    this.viewMonth = this.today.getMonth()

    // sélection en cours
    this.selectedDate = null  // Date (sans heure)
    this.selectedTime = null  // "HH:MM"

    // si valeur déjà présente (edit)
    const v = this.hiddenTarget.value
    if (v) {
      const parsed = this.parseISODateTime(v)
      if (parsed) {
        this.selectedDate = this.strip(parsed)
        this.selectedTime = this.toHM(parsed)
        this.setDisplay(parsed)
        this.viewYear = parsed.getFullYear()
        this.viewMonth = parsed.getMonth()
      }
    }

    this.boundDocClick = (e) => { if (!this.element.contains(e.target)) this.close() }
    this.boundKey = (e) => { if (e.key === "Escape") { this.close(); this.displayTarget.focus() } }

    this.render()

    // 🔥 calendrier visible sans clic (comme tu veux)
    if (this.openOnConnectValue) this.open()
  }

  disconnect() {
    document.removeEventListener("mousedown", this.boundDocClick)
    document.removeEventListener("keydown", this.boundKey)
  }

  open() {
    if (!this.popoverTarget.hidden) return
    this.render()
    this.popoverTarget.hidden = false
    document.addEventListener("mousedown", this.boundDocClick)
    document.addEventListener("keydown", this.boundKey)
  }

  close() {
    if (this.popoverTarget.hidden) return
    this.popoverTarget.hidden = true
    document.removeEventListener("mousedown", this.boundDocClick)
    document.removeEventListener("keydown", this.boundKey)
  }

  prevMonth() {
    this.viewMonth--
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear-- }
    this.render()
  }

  nextMonth() {
    this.viewMonth++
    if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++ }
    this.render()
  }

  clear() {
    this.hiddenTarget.value = ""
    this.displayTarget.value = ""
    this.selectedDate = null
    this.selectedTime = null
    this.render()
    this.close()
  }

  render() {
    this.titleTarget.textContent = `${this.months[this.viewMonth]} ${this.viewYear}`

    // Calcule le début de grille (Lundi-first)
    const first = new Date(this.viewYear, this.viewMonth, 1)
    const startDay = (first.getDay() + 6) % 7 // 0 = lundi
    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate()

    // On veut 42 cases
    this.daysTarget.innerHTML = ""
    const frag = document.createDocumentFragment()

    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDay + 1
      const d = new Date(this.viewYear, this.viewMonth, dayNum)
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "tw-cal__day"
      btn.setAttribute("role", "gridcell")

      // style “hors mois”
      if (d.getMonth() !== this.viewMonth) btn.classList.add("is-muted")

      // aujourd’hui
      if (this.same(d, this.today)) btn.classList.add("is-today")

      // sélection
      if (this.selectedDate && this.same(d, this.selectedDate)) btn.classList.add("is-selected")

      // limite 21 jours
      const inRange = this.inRange(d)
      if (!inRange) {
        btn.disabled = true
        btn.classList.add("is-disabled")
      }

      btn.textContent = String(d.getDate())
      btn.addEventListener("click", () => this.pickDate(d))

      frag.appendChild(btn)
    }

    this.daysTarget.appendChild(frag)

    // Slots horaires
    this.renderSlots()
  }

  pickDate(d) {
    if (!this.inRange(d)) return
    this.selectedDate = this.strip(d)

    // si pas d’heure déjà choisie, on met une valeur par défaut sympa
    if (!this.selectedTime) this.selectedTime = "19:30"

    this.syncHiddenAndDisplay()
    this.render()
  }

  renderSlots() {
    this.slotsTarget.innerHTML = ""

    // Si pas de date sélectionnée : on affiche des slots “inactifs”
    if (!this.selectedDate) {
      const p = document.createElement("p")
      p.className = "tw-cal__slotsEmpty"
      p.textContent = "Sélectionne d’abord une date."
      this.slotsTarget.appendChild(p)
      return
    }

    // Slots (à ajuster comme tu veux)
    const slots = [
      "12:00","12:15","12:30","12:45","13:00","13:15","13:30",
      "19:00","19:15","19:30","19:45","20:00","20:15","20:30","20:45","21:00"
    ]

    const frag = document.createDocumentFragment()

    slots.forEach((hm) => {
      const b = document.createElement("button")
      b.type = "button"
      b.className = "tw-cal__slot"
      b.textContent = hm

      if (this.selectedTime === hm) b.classList.add("is-selected")

      b.addEventListener("click", () => {
        this.selectedTime = hm
        this.syncHiddenAndDisplay()
        this.renderSlots()
      })

      frag.appendChild(b)
    })

    this.slotsTarget.appendChild(frag)
  }

  syncHiddenAndDisplay() {
    if (!this.selectedDate || !this.selectedTime) return

    const dt = this.combine(this.selectedDate, this.selectedTime)
    this.hiddenTarget.value = this.toISODateTime(dt)      // "YYYY-MM-DD HH:MM"
    this.displayTarget.value = this.toFRDateTime(dt)      // "dd/mm/yyyy — HH:MM"

    // utile si tu veux des validations en live
    this.displayTarget.dispatchEvent(new Event("input", { bubbles: true }))
  }

  // ---- Range (today -> today+maxDays) ----
  inRange(d) {
    const x = this.strip(d).getTime()
    return x >= this.today.getTime() && x <= this.maxDate.getTime()
  }

  // ---- Utils date ----
  strip(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
  same(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

  combine(dateOnly, hm) {
    const [h, m] = hm.split(":").map(n => parseInt(n, 10))
    return new Date(dateOnly.getFullYear(), dateOnly.getMonth(), dateOnly.getDate(), h, m, 0, 0)
  }

  pad2(n) { return String(n).padStart(2, "0") }
  toHM(d) { return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}` }

  // Hidden format: "YYYY-MM-DD HH:MM"
  toISODateTime(d) {
    return `${d.getFullYear()}-${this.pad2(d.getMonth() + 1)}-${this.pad2(d.getDate())} ${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`
  }

  // Display format: "dd/mm/yyyy — HH:MM"
  toFRDateTime(d) {
    return `${this.pad2(d.getDate())}/${this.pad2(d.getMonth() + 1)}/${d.getFullYear()} — ${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`
  }

  parseISODateTime(s) {
    // accepte "YYYY-MM-DD HH:MM" ou "YYYY-MM-DDTHH:MM"
    const m = s && s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/)
    if (!m) return null
    const y = +m[1], mo = +m[2] - 1, da = +m[3]
    const hh = m[4] ? +m[4] : 0
    const mm = m[5] ? +m[5] : 0
    const d = new Date(y, mo, da, hh, mm, 0, 0)
    return isNaN(d) ? null : d
  }

  setDisplay(d) {
    this.displayTarget.value = this.toFRDateTime(d)
  }
}
