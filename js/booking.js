(() => {
  const root = document.querySelector("[data-booking]");
  if (!root) return;

  const SERVICES = [
    {
      cat: "Massage",
      items: [
        { id: "hot-stone", name: "Hot Stone Massage", duration: 60, price: "€ 89,-", desc: "Warme stenen en oliën voor diepe ontspanning van lichaam en geest." },
        { id: "full-body", name: "Full Body Massage", duration: 50, price: "€ 79,-", desc: "Volledige lichaamsmassage (45–50 min) met warme, verzorgende oliën." },
      ],
    },
    {
      cat: "Facials",
      items: [
        { id: "classic-facial", name: "Clean Classic Facial", duration: 70, price: "€ 89,-", desc: "Reinigende en verzorgende gezichtsbehandeling voor een stralende huid." },
        { id: "botanische-facial", name: "Marokkaanse Botanische Facial", duration: 60, price: "€ 69,-", desc: "Botanische facial met natuurlijke Marokkaanse ingrediënten." },
      ],
    },
    {
      cat: "Head Spa",
      items: [
        { id: "marokkaanse-head", name: "Marokkaanse Head Spa", duration: 60, price: "€ 99,-", desc: "Ritueel met kruiden en olijfolie voor hoofdhuid en diepe rust." },
        { id: "japanse-head", name: "Japanse Head Spa", duration: 75, price: "€ 119,-", desc: "Japanse head spa met camelia-olie voor hoofdhuid, haar en stilte." },
      ],
    },
    {
      cat: "Hair Removal",
      items: [
        { id: "full-body-hr", name: "Full Body Hair Removal", duration: 45, price: "vanaf € 119,-", desc: "Armen, benen, handen, voeten en gezicht. Exclusief wenkbrauwen en schaamstreek." },
      ],
    },
    {
      cat: "Hand & Voet",
      items: [
        { id: "classic-hand", name: "Clean Classic Hand Spa", duration: 45, price: "€ 59,-", desc: "Verzorgende handbehandeling voor zachte, verzorgde handen." },
        { id: "classic-voet", name: "Clean Classic Voet Spa", duration: 55, price: "€ 79,-", desc: "Ontspannende voetverzorging van tip tot teen." },
        { id: "bot-hand", name: "Botanische Hand Spa", duration: 40, price: "€ 49,-", desc: "Botanische handverzorging met natuurlijke producten." },
        { id: "bot-voet", name: "Botanische Voet Spa", duration: 50, price: "€ 69,-", desc: "Botanische voetverzorging voor rust en zachte huid." },
      ],
    },
  ];

  const state = {
    step: 1,
    category: "Alles",
    service: null,
    date: null,
    time: null,
    monthOffset: 0,
  };

  const el = {
    title: root.querySelector("[data-booking-title]"),
    steps: root.querySelectorAll("[data-booking-step-indicator]"),
    panels: root.querySelectorAll("[data-booking-panel]"),
    cats: root.querySelector("[data-booking-cats]"),
    list: root.querySelector("[data-booking-list]"),
    calLabel: root.querySelector("[data-cal-label]"),
    calGrid: root.querySelector("[data-cal-grid]"),
    times: root.querySelector("[data-booking-times]"),
    summary: root.querySelector("[data-booking-summary]"),
    back: root.querySelector("[data-booking-back]"),
    next: root.querySelector("[data-booking-next]"),
    form: root.querySelector("[data-booking-form]"),
  };

  const titles = {
    1: "Kies behandeling",
    2: "Kies datum",
    3: "Kies tijd",
    4: "Jouw gegevens",
  };

  const pad = (n) => String(n).padStart(2, "0");
  const sameDay = (a, b) =>
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const openHours = (date) => {
    const day = date.getDay(); // 0 sun
    if (day === 0) return null;
    if (day === 6) return { start: 10 * 60, end: 15 * 60 };
    return { start: 9 * 60 + 30, end: 17 * 60 + 30 };
  };

  const hash = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  };

  const slotsFor = (date, duration) => {
    const hours = openHours(date);
    if (!hours) return [];
    const today = startOfDay(new Date());
    if (startOfDay(date) < today) return [];
    const slots = [];
    for (let m = hours.start; m + duration <= hours.end; m += 30) {
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${m}`;
      // Fake busy slots for a realistic demo calendar
      if (hash(key) % 5 === 0) continue;
      if (sameDay(date, new Date()) && m <= new Date().getHours() * 60 + new Date().getMinutes()) continue;
      slots.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    }
    return slots;
  };

  const fmtDate = (d) =>
    d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const canReach = (step) => {
    if (step === 1) return true;
    if (step === 2) return !!state.service;
    if (step === 3) return !!state.service && !!state.date;
    if (step === 4) return !!state.service && !!state.date && !!state.time;
    return false;
  };

  const updateStepButtons = () => {
    el.steps.forEach((s) => {
      const n = Number(s.dataset.bookingStepIndicator);
      s.classList.toggle("is-active", n === state.step);
      s.classList.toggle("is-done", n < state.step);
      s.disabled = !canReach(n);
      if (n === state.step) s.setAttribute("aria-current", "step");
      else s.removeAttribute("aria-current");
    });
  };

  const scrollBookingIntoView = () => {
    const header = document.querySelector(".site-header");
    const offset = (header?.offsetHeight || 0) + 12;
    const top = root.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const setStep = (step, opts = {}) => {
    if (!canReach(step)) return;
    state.step = step;
    el.title.textContent = titles[step];
    updateStepButtons();
    el.panels.forEach((p) => {
      p.hidden = Number(p.dataset.bookingPanel) !== step;
    });
    el.back.hidden = step === 1;
    el.next.hidden = step === 4;
    el.next.disabled = !canNext();
    el.next.textContent = step === 3 ? "Naar gegevens" : "Verder";
    if (step === 2) renderCalendar();
    if (step === 3) renderTimes();
    if (step === 4) renderSummary();
    if (opts.scroll !== false) requestAnimationFrame(scrollBookingIntoView);
  };

  const canNext = () => {
    if (state.step === 1) return !!state.service;
    if (state.step === 2) return !!state.date;
    if (state.step === 3) return !!state.time;
    return false;
  };

  const renderCats = () => {
    const cats = ["Alles", ...SERVICES.map((s) => s.cat)];
    el.cats.innerHTML = cats
      .map(
        (c) =>
          `<button type="button" class="booking-cat${c === state.category ? " is-active" : ""}" data-cat="${c}">${c}</button>`
      )
      .join("");
  };

  const renderList = () => {
    const groups = state.category === "Alles" ? SERVICES : SERVICES.filter((s) => s.cat === state.category);
    el.list.innerHTML = groups
      .map((g) => {
        const items = g.items
          .map((item) => {
            const checked = state.service?.id === item.id;
            return `<label class="booking-service${checked ? " is-selected" : ""}">
              <input type="radio" name="service" value="${item.id}" ${checked ? "checked" : ""}>
              <span class="booking-service-main">
                <span class="booking-service-top">
                  <span class="booking-service-name">${item.name}</span>
                  <span class="booking-service-price">${item.price}</span>
                </span>
                <span class="booking-service-meta">${item.duration} min</span>
                <span class="booking-service-desc">${item.desc}</span>
              </span>
            </label>`;
          })
          .join("");
        return `<div class="booking-group"><h3>${g.cat}</h3>${items}</div>`;
      })
      .join("");
  };

  const renderCalendar = () => {
    const base = new Date();
    const view = new Date(base.getFullYear(), base.getMonth() + state.monthOffset, 1);
    el.calLabel.textContent = view.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    const firstDow = (view.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const today = startOfDay(new Date());
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(`<span class="cal-cell is-empty"></span>`);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const hours = openHours(date);
      const available = hours && startOfDay(date) >= today && slotsFor(date, state.service?.duration || 60).length > 0;
      const selected = state.date && sameDay(state.date, date);
      const disabled = !available;
      cells.push(
        `<button type="button" class="cal-cell${selected ? " is-selected" : ""}${disabled ? " is-disabled" : ""}${sameDay(date, today) ? " is-today" : ""}" data-day="${d}" ${disabled ? "disabled" : ""}>${d}</button>`
      );
    }
    el.calGrid.innerHTML = cells.join("");
  };

  const renderTimes = () => {
    if (!state.date || !state.service) {
      el.times.innerHTML = `<p class="booking-empty">Kies eerst een datum.</p>`;
      return;
    }
    const slots = slotsFor(state.date, state.service.duration);
    if (!slots.length) {
      el.times.innerHTML = `<p class="booking-empty">Geen tijden beschikbaar op deze dag.</p>`;
      return;
    }
    el.times.innerHTML = slots
      .map(
        (t) =>
          `<button type="button" class="booking-time${state.time === t ? " is-selected" : ""}" data-time="${t}">${t}</button>`
      )
      .join("");
  };

  const renderSummary = () => {
    if (!state.service || !state.date || !state.time) return;
    el.summary.innerHTML = `
      <div><span>Behandeling</span><strong>${state.service.name}</strong></div>
      <div><span>Duur</span><strong>${state.service.duration} min</strong></div>
      <div><span>Prijs</span><strong>${state.service.price}</strong></div>
      <div><span>Datum</span><strong>${fmtDate(state.date)}</strong></div>
      <div><span>Tijd</span><strong>${state.time}</strong></div>`;

    const setVal = (name, val) => {
      const input = el.form.querySelector(`[name="${name}"]`);
      if (input) input.value = val;
    };
    setVal("behandeling", state.service.name);
    setVal("duur", `${state.service.duration} min`);
    setVal("prijs", state.service.price);
    setVal("gewenste_datum", fmtDate(state.date));
    setVal("gewenste_tijd", state.time);
  };

  el.cats.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.category = btn.dataset.cat;
    renderCats();
    renderList();
  });

  el.list.addEventListener("change", (e) => {
    const input = e.target.closest('input[name="service"]');
    if (!input) return;
    for (const g of SERVICES) {
      const found = g.items.find((i) => i.id === input.value);
      if (found) {
        state.service = found;
        break;
      }
    }
    state.date = null;
    state.time = null;
    renderList();
    el.next.disabled = !canNext();
    updateStepButtons();
  });

  root.querySelector("[data-cal-prev]")?.addEventListener("click", () => {
    state.monthOffset = Math.max(0, state.monthOffset - 1);
    renderCalendar();
  });
  root.querySelector("[data-cal-next]")?.addEventListener("click", () => {
    state.monthOffset = Math.min(2, state.monthOffset + 1);
    renderCalendar();
  });

  el.calGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-day]");
    if (!btn || btn.disabled) return;
    const view = new Date();
    view.setMonth(view.getMonth() + state.monthOffset);
    state.date = new Date(view.getFullYear(), view.getMonth(), Number(btn.dataset.day));
    state.time = null;
    renderCalendar();
    el.next.disabled = !canNext();
    updateStepButtons();
  });

  el.times.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-time]");
    if (!btn) return;
    state.time = btn.dataset.time;
    renderTimes();
    el.next.disabled = !canNext();
    updateStepButtons();
  });

  el.steps.forEach((s) => {
    s.addEventListener("click", () => {
      const n = Number(s.dataset.bookingStepIndicator);
      if (!canReach(n) || n === state.step) return;
      setStep(n);
    });
  });

  el.back.addEventListener("click", () => setStep(Math.max(1, state.step - 1)));
  el.next.addEventListener("click", () => {
    if (!canNext()) return;
    setStep(Math.min(4, state.step + 1));
  });

  el.form?.addEventListener("submit", () => {
    const btn = el.form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Bevestigen…";
    }
  });

  renderCats();
  renderList();
  setStep(1, { scroll: false });
})();
