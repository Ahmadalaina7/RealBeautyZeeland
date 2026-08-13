(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const drop = document.querySelector(".nav-drop");
  const dropBtn = drop?.querySelector("button");
  const mobileMq = window.matchMedia("(max-width: 1080px)");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  let scrollTick = false;
  const onScrollRaf = () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      onScroll();
      scrollTick = false;
    });
  };
  onScroll();
  window.addEventListener("scroll", onScrollRaf, { passive: true });

  const setMenuOpen = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (!open && drop) {
      drop.classList.remove("open");
      dropBtn?.setAttribute("aria-expanded", "false");
    }
  };

  toggle?.addEventListener("click", () => {
    setMenuOpen(!nav.classList.contains("open"));
  });

  dropBtn?.addEventListener("click", (e) => {
    if (!mobileMq.matches) return;
    e.preventDefault();
    e.stopPropagation();
    const open = drop.classList.toggle("open");
    dropBtn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    if (!drop || drop.contains(e.target)) return;
    if (!mobileMq.matches) {
      drop.classList.remove("open");
      dropBtn?.setAttribute("aria-expanded", "false");
    }
  });

  nav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav?.classList.contains("open")) {
      setMenuOpen(false);
      toggle?.focus();
    }
  });

  const onViewportChange = () => {
    if (!mobileMq.matches) setMenuOpen(false);
  };
  if (mobileMq.addEventListener) {
    mobileMq.addEventListener("change", onViewportChange);
  } else {
    mobileMq.addListener(onViewportChange);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const next = document.querySelector('input[name="_next"]');
  if (next) {
    const base = window.location.origin + window.location.pathname.replace(/[^/]+$/, "");
    next.value = new URL("bedankt.html", base).href;
  }

  const form = document.querySelector(".js-contact-form");
  form?.addEventListener("submit", () => {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Verzenden…";
    }
  });
})();
