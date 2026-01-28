import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["display", "hidden", "title", "days", "slots", "timeWrap"]
  static values = {
    maxDays: { type: Number, default: 21 },
    showTime: { type: Boolean, default: true }
  }

  connect() {
    this.months = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
    this.firstDay = 1

    const today = new Date()
    this.viewYear = today.getFullYear()
    this.viewMonth = today.getMonth()
    this.selectedDate = null
    this.selectedTime = null

    // cache l'heure si showTime=false
    if (this.hasTimeWrapTarget && !this.showTimeValue) {
      this.timeWrapTarget.style.display = "none"
    }

    // si valeur déjà présente (edit)
    const v = this.hiddenTarget.value
    if (v) {
      const parsed = this.parseISODateTime(v)
      if (parsed) {
        this.selectedDate = parsed.date
        this.selectedTime = parsed.time
        this.viewYear = parsed.date.getFullYear()
        this.viewMonth = parsed.date.getMonth()
        this.setDisplay()
      }
    }

    this.render()
    this.renderSlots()
  }

  prevMonth() {
    this.viewMonth -= 1
    if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear -= 1 }
    this.render()
  }

  nextMonth() {
    this.viewMonth += 1
    if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear += 1 }
    this.render()
  }

  clear() {
    this.selectedDate = null
    this.selectedTime = null
    this.hiddenTarget.value = ""
    this.displayTarget.value = ""
    this.render()
    this.renderSlots()
  }

  // bouton "prochain créneau" (réservation)
  pickSoonest() {
    const d = new Date()
    // prochain jour dispo (aujourd’hui inclus) + premier créneau
    this.selectedDate = this.strip(d)
    this.selectedTime = this.showTimeValue ? "19:00" : null
    this.writeValue()
    this.setDisplay()
    this.render()
    this.renderSlots()
  }

  // (contact) bouton OK sans fermeture (inline)
  closeInline() {
    // ne fait rien, juste un bouton de validation visuelle
    this.displayTarget.focus()
  }

  render() {
    this.titleTarget.textContent = `${this.months[this.viewMonth]} ${this.viewYear}`

    const first = new Date(this.viewYear, this.viewMonth, 1)
    const startDay = (first.getDay() + 6) % 7
    const padStart = (startDay - (this.firstDay - 1) + 7) % 7

    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate()
    const prevMonthDays = new Date(this.viewYear, this.viewMonth, 0).getDate()

    const frag = document.createDocumentFragment()
    this.daysTarget.innerHTML = ""

    const today = this.strip(new Date())
    const max = new Date()
    max.setDate(max.getDate() + this.maxDaysValue)

    for (let i = 0; i < 42; i++) {
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "tw-cal__day"
      btn.setAttribute("role", "gridcell")

      let dayNum, dateObj

      if (i < padStart) {
        dayNum = prevMonthDays - padStart + i + 1
        dateObj = new Date(this.viewYear, this.viewMonth - 1, dayNum)
        btn.classList.add("is-muted")
      } else if (i >= padStart + daysInMonth) {
        dayNum = i - (padStart + daysInMonth) + 1
        dateObj = new Date(this.viewYear, this.viewMonth + 1, dayNum)
        btn.classList.add("is-muted")
      } else {
        dayNum = i - padStart + 1
        dateObj = new Date(this.viewYear, this.viewMonth, dayNum)
      }

      btn.textContent = String(dayNum)

      // disable hors fenêtre (aujourd’hui -> maxDays)
      const dStrip = this.strip(dateObj)
      const isBefore = dStrip.getTime() < today.getTime()
      const isAfter = dStrip.getTime() > this.strip(max).getTime()
      if (isBefore || isAfter) {
        btn.classList.add("is-disabled")
        btn.disabled = true
      }

      if (this.same(dStrip, today)) btn.classList.add("is-today")
      if (this.selectedDate && this.same(dStrip, this.selectedDate)) btn.classList.add("is-selected")

      btn.addEventListener("click", () => {
        if (btn.disabled) return
        this.selectedDate = dStrip
        // si showTime, on garde une heure si existante sinon on met une par défaut
        if (this.showTimeValue && !this.selectedTime) this.selectedTime = "19:00"
        this.writeValue()
        this.setDisplay()
        this.render()
        this.renderSlots()
      })

      frag.appendChild(btn)
    }

    this.daysTarget.appendChild(frag)
  }

  renderSlots() {
    if (!this.hasSlotsTarget) return
    this.slotsTarget.innerHTML = ""
    if (!this.showTimeValue) return

    // slots simples (tu pourras les rendre dynamiques plus tard)
    const slots = ["12:00","12:30","13:00","19:00","19:30","20:00","20:30","21:00"]

    slots.forEach((t) => {
      const b = document.createElement("button")
      b.type = "button"
      b.className = "tw-cal__slot"
      b.textContent = t
      if (!this.selectedDate) b.disabled = true
      if (this.selectedTime === t) b.classList.add("is-selected")

      b.addEventListener("click", () => {
        if (b.disabled) return
        this.selectedTime = t
        this.writeValue()
        this.setDisplay()
        this.renderSlots()
      })

      this.slotsTarget.appendChild(b)
    })
  }

  setDisplay() {
    if (!this.selectedDate) {
      this.displayTarget.value = ""
      return
    }
    const d = this.selectedDate
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()

    if (this.showTimeValue) {
      const time = this.selectedTime || "19:00"
      this.displayTarget.value = `${dd}/${mm}/${yyyy} — ${time}`
    } else {
      this.displayTarget.value = `${dd}/${mm}/${yyyy}`
    }
  }

  writeValue() {
    if (!this.selectedDate) {
      this.hiddenTarget.value = ""
      return
    }
    const d = this.selectedDate
    const isoDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`

    if (this.showTimeValue) {
      const time = this.selectedTime || "19:00"
      this.hiddenTarget.value = `${isoDate} ${time}`
    } else {
      this.hiddenTarget.value = isoDate
    }
  }

  // utils
  strip(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
  same(a,b) { return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate() }

  parseISODateTime(s) {
    // accepte "YYYY-MM-DD" ou "YYYY-MM-DD HH:MM"
    if (!s) return null
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?$/)
    if (!m) return null
    const date = new Date(+m[1], +m[2]-1, +m[3])
    if (isNaN(date)) return null
    const time = (m[4] && m[5]) ? `${m[4]}:${m[5]}` : null
    return { date, time }
  }
}
