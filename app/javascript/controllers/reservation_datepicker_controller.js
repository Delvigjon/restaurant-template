import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "display",
    "hidden",
    "popover",
    "title",
    "days",
    "slots",
    "step2",
    "summary",
    "summaryText"
  ]

  static values = {
    maxDays: { type: Number, default: 21 },
    openOnConnect: { type: Boolean, default: true }
  }

  connect() {
    this.months = [
      "janvier","février","mars","avril","mai","juin",
      "juillet","août","septembre","octobre","novembre","décembre"
    ]

    // fenêtre autorisée
    this.today = this.strip(new Date())
    this.maxDate = new Date(this.today)
    this.maxDate.setDate(this.maxDate.getDate() + this.maxDaysValue)

    // vue courante
    this.viewYear = this.today.getFullYear()
    this.viewMonth = this.today.getMonth()

    // sélection
    this.selectedDate = null
    this.selectedTime = null

    // valeur existante (edit)
    const v = this.hiddenTarget.value
    if (v) {
      const parsed = this.parseISODateTime(v)
      if (parsed) {
        this.selectedDate = this.strip(parsed)
        this.selectedTime = this.toHM(parsed)
        this.setDisplay(parsed)
        this.viewYear = parsed.getFullYear()
        this.viewMonth = parsed.getMonth()
        this.showStep2AndSummary(parsed)
        this.close()
      } else {
        this.resetUI()
      }
    } else {
      this.resetUI()
    }

    this.render()

    if (this.openOnConnectValue && !this.hiddenTarget.value) {
      this.open()
    }
  }

  /* ---------- UI ---------- */

  open() { this.popoverTarget.hidden = false }
  close() { this.popoverTarget.hidden = true }

  edit() {
    this.open()
    if (this.hasStep2Target) this.step2Target.hidden = true
    this.render()
  }

  clear() {
    this.hiddenTarget.value = ""
    this.displayTarget.value = ""
    this.selectedDate = null
    this.selectedTime = null
    this.resetUI()
    this.render()
    this.open()
  }

  pickToday() {
    this.pickDate(new Date(this.today))
  }

  resetUI() {
    if (this.hasStep2Target) this.step2Target.hidden = true
    if (this.hasSummaryTarget) this.summaryTarget.hidden = true
  }

  /* ---------- NAV ---------- */

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

  /* ---------- RENDER ---------- */

  render() {
    this.titleTarget.textContent = `${this.months[this.viewMonth]} ${this.viewYear}`

    const first = new Date(this.viewYear, this.viewMonth, 1)
    const startDay = (first.getDay() + 6) % 7

    this.daysTarget.innerHTML = ""
    const frag = document.createDocumentFragment()

    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDay + 1
      const d = new Date(this.viewYear, this.viewMonth, dayNum)

      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "rs-cal__day"
      btn.textContent = d.getDate()

      if (d.getMonth() !== this.viewMonth) btn.classList.add("is-muted")
      if (this.same(d,this.today)) btn.classList.add("is-today")
      if (this.selectedDate && this.same(d,this.selectedDate)) btn.classList.add("is-selected")

      if (!this.inRange(d)) {
        btn.disabled = true
        btn.classList.add("is-disabled")
      }

      btn.addEventListener("click", () => this.pickDate(d))
      frag.appendChild(btn)
    }

    this.daysTarget.appendChild(frag)
    this.renderSlots()
  }

  pickDate(d) {
    if (!this.inRange(d)) return

    const newDate = this.strip(d)
    const dateChanged = !this.selectedDate || !this.same(newDate,this.selectedDate)

    this.selectedDate = newDate

    // reset heure si date change
    if (dateChanged) this.selectedTime = null

    this.render()
  }

  renderSlots() {
    this.slotsTarget.innerHTML = ""

    if (!this.selectedDate) {
      const p = document.createElement("p")
      p.className = "rs-cal__slotsEmpty"
      p.textContent = "Sélectionne d’abord une date."
      this.slotsTarget.appendChild(p)
      return
    }

    const slots = [
      "12:00","12:15","12:30","12:45","13:00","13:15","13:30",
      "19:00","19:15","19:30","19:45","20:00","20:15","20:30","20:45","21:00"
    ]

    const frag = document.createDocumentFragment()

    slots.forEach(hm=>{
      const b = document.createElement("button")
      b.type="button"
      b.className="rs-cal__slot"
      b.textContent=hm

      if (this.selectedTime===hm) b.classList.add("is-selected")

      b.addEventListener("click",()=>{
        this.selectedTime=hm
        this.syncHiddenAndDisplay()
      })

      frag.appendChild(b)
    })

    this.slotsTarget.appendChild(frag)
  }

  syncHiddenAndDisplay() {
    if (!this.selectedDate || !this.selectedTime) return

    const dt = this.combine(this.selectedDate,this.selectedTime)

    this.hiddenTarget.value=this.toISODateTime(dt)
    this.displayTarget.value=this.toFRDateTime(dt)

    this.showStep2AndSummary(dt)
    this.close()
  }

  showStep2AndSummary(dt){
    if(this.hasStep2Target) this.step2Target.hidden=false
    if(this.hasSummaryTarget){
      this.summaryTarget.hidden=false
      this.summaryTextTarget.textContent=`Réservation : ${this.toFRDateTime(dt)}`
    }
  }

  /* ---------- UTILS ---------- */

  inRange(d){
    const x=this.strip(d).getTime()
    return x>=this.today.getTime() && x<=this.maxDate.getTime()
  }

  strip(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()) }

  same(a,b){
    return a && b &&
      a.getFullYear()===b.getFullYear() &&
      a.getMonth()===b.getMonth() &&
      a.getDate()===b.getDate()
  }

  combine(dateOnly,hm){
    const [h,m]=hm.split(":").map(n=>parseInt(n,10))
    return new Date(dateOnly.getFullYear(),dateOnly.getMonth(),dateOnly.getDate(),h,m)
  }

  pad2(n){ return String(n).padStart(2,"0") }

  toHM(d){ return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}` }

  toISODateTime(d){
    return `${d.getFullYear()}-${this.pad2(d.getMonth()+1)}-${this.pad2(d.getDate())} ${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`
  }

  toFRDateTime(d){
    return `${this.pad2(d.getDate())}/${this.pad2(d.getMonth()+1)}/${d.getFullYear()} — ${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`
  }

  parseISODateTime(s){
    const m=s&&s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/)
    if(!m) return null
    return new Date(m[1],m[2]-1,m[3],m[4]||0,m[5]||0)
  }

  setDisplay(d){
    this.displayTarget.value=this.toFRDateTime(d)
  }
}
