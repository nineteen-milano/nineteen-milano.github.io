(function () {
  const STORAGE_KEY = "nineteen-lang";
  const defaultLang = "it";
  let scrollHandlersBound = false;
  let lastRoute = null;

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && window.GUEST_CONTENT[saved]) return saved;
    const browser = (navigator.language || "it").slice(0, 2);
    return window.GUEST_CONTENT[browser] ? browser : defaultLang;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    render(lang);
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === "className") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach((c) => {
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  function renderSteps(steps) {
    const ol = el("ol", { className: "steps" });
    // Il passo sul codice d'accesso è marcato: con il link personale il codice
    // è già mostrato nella pagina, e dire "controlla i messaggi Airbnb" mentre
    // il codice è lì sopra confonde. personal.js lo toglie in quel caso.
    steps.forEach((step, i) => {
      const attrs = { html: step };
      if (i === 2) attrs["data-code-step"] = "1";
      ol.appendChild(el("li", attrs));
    });
    return ol;
  }

  function makeImg(src, alt, className) {
    const img = el("img", { src, alt, className, loading: "lazy", decoding: "async" });
    img.onerror = function onImgError() {
      if (this.dataset.fallback && this.src !== this.dataset.fallback) {
        this.src = this.dataset.fallback;
        return;
      }
      this.src = "images/placeholder.svg";
    };
    return img;
  }

  function renderCheckinSection(c) {
    const section = el("section", { className: "section-block reveal", id: "checkin" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.checkin.title }));
    inner.appendChild(renderSteps(c.checkin.steps));
    inner.appendChild(el("p", { className: "note", text: c.checkin.note }));
    const checkoutBox = el("div", { className: "subcard reveal" });
    checkoutBox.appendChild(el("h3", { text: c.checkin.checkoutTitle }));
    checkoutBox.appendChild(el("p", { html: c.checkin.checkout }));
    inner.appendChild(checkoutBox);
    section.appendChild(inner);
    return section;
  }

  function renderWifiSection(c) {
    const section = el("section", { className: "section-block section-block--accent reveal", id: "wifi" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.wifi.title }));
    const grid = el("div", { className: "wifi-grid" });
    const ssidBox = el("div", { className: "wifi-field" });
    ssidBox.appendChild(el("span", { className: "label", text: c.wifi.network }));
    ssidBox.appendChild(el("code", { className: "value", text: window.GUEST_WIFI.ssid }));
    const passBox = el("div", { className: "wifi-field" });
    passBox.appendChild(el("span", { className: "label", text: c.wifi.password }));
    passBox.appendChild(el("code", { className: "value", text: window.GUEST_WIFI.password }));
    grid.appendChild(ssidBox);
    grid.appendChild(passBox);
    inner.appendChild(grid);
    const copyBtn = el("button", { className: "btn btn--full", type: "button", text: c.wifi.copy });
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.GUEST_WIFI.password);
        copyBtn.textContent = c.wifi.copied;
        setTimeout(() => { copyBtn.textContent = c.wifi.copy; }, 2000);
      } catch (_) {
        copyBtn.textContent = window.GUEST_WIFI.password;
      }
    });
    inner.appendChild(copyBtn);
    section.appendChild(inner);
    return section;
  }

  function renderParkingSection(c) {
    const section = el("section", { className: "section-block reveal", id: "parking" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.parking.title }));

    const body = el("div", { className: "section-toggle__body" });
    c.parking.options.forEach((opt) => {
      const item = el("div", { className: "parking-item" });
      item.appendChild(el("h3", { text: opt.name }));
      item.appendChild(el("p", { text: opt.desc }));
      if (opt.tel) {
        item.appendChild(el("a", { className: "tel", href: `tel:${opt.tel.replace(/\s/g, "")}`, text: `Tel. ${opt.tel}` }));
      }
      body.appendChild(item);
    });
    inner.appendChild(wrapInToggle(c.parking.toggle, body));
    section.appendChild(inner);
    return section;
  }

  function renderGuideSection(lang) {
    const g = window.GUEST_GUIDE[lang].guide;
    const section = el("section", { className: "section-block reveal", id: "guide" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: g.title }));
    inner.appendChild(el("p", { className: "section-lead", text: g.lead }));
    g.blocks.forEach((block) => inner.appendChild(renderGuideBlock(block)));
    section.appendChild(inner);
    return section;
  }

  function renderDirectionsSection(lang) {
    const d = window.GUEST_LOCAL[lang].directions;
    const section = el("section", { className: "section-block reveal", id: "directions" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: d.title }));
    inner.appendChild(el("p", { className: "section-lead", text: d.lead }));

    const tabs = el("div", { className: "route-tabs", role: "tablist" });
    const panels = el("div", { className: "route-panels" });

    d.routes.forEach((route, idx) => {
      const tab = el("button", {
        className: `route-tab${idx === 0 ? " is-active" : ""}`,
        type: "button",
        text: route.label,
      });
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", idx === 0 ? "true" : "false");

      const panel = el("div", { className: `route-panel${idx === 0 ? " is-active" : ""}`, role: "tabpanel" });
      panel.appendChild(el("p", { className: "route-from", text: route.from }));

      const track = el("div", { className: "route-track" });
      route.steps.forEach((step) => {
        const stepEl = el("div", {
          className: `route-step route-step--${step.type}${step.type === "arrive" ? " route-step--highlight" : ""}`,
        });
        const marker = el("div", { className: "route-step__marker" });

        if (step.line) {
          const lineClass = step.type === "tram" ? "route-badge--tram" : `route-badge--${step.line.toLowerCase()}`;
          marker.appendChild(el("span", { className: `route-badge route-badge--${step.type} ${lineClass}`, text: step.line }));
        } else {
          const icons = { train: "🚆", walk: "🚶", stop: "↓", arrive: "🏠", bus: "🚌" };
          marker.appendChild(el("span", { className: `route-badge route-badge--${step.type}`, text: icons[step.type] || "•" }));
        }

        const body = el("div", { className: "route-step__body" });
        const titleText = step.direction ? `${step.name} (${step.direction})` : step.name;
        body.appendChild(el("h3", { className: "route-step__title", text: titleText }));
        body.appendChild(el("p", { className: "route-step__detail", text: step.detail }));
        stepEl.appendChild(marker);
        stepEl.appendChild(body);
        track.appendChild(stepEl);
      });
      panel.appendChild(track);

      tab.addEventListener("click", () => {
        tabs.querySelectorAll(".route-tab").forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        panels.querySelectorAll(".route-panel").forEach((p) => p.classList.remove("is-active"));
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        panel.classList.add("is-active");
      });

      tabs.appendChild(tab);
      panels.appendChild(panel);
    });

    inner.appendChild(tabs);
    inner.appendChild(panels);
    section.appendChild(inner);
    return section;
  }

  function renderRestaurantsSection(lang) {
    const r = window.GUEST_LOCAL[lang].restaurants;
    const section = el("section", { className: "section-block reveal", id: "restaurants" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: r.title }));
    inner.appendChild(el("p", { className: "section-lead", text: r.lead }));

    const toggle = el("details", { className: "section-toggle reveal" });
    toggle.appendChild(el("summary", { text: r.toggle }));

    const list = el("div", { className: "restaurant-list" });
    r.items.forEach((item) => {
      const card = el("article", {
        className: `restaurant-card${item.highlight ? " restaurant-card--highlight" : ""}`,
      });
      const head = el("div", { className: "restaurant-card__head" });
      head.appendChild(el("h3", { text: item.name }));
      head.appendChild(el("span", { className: "restaurant-card__tag", text: item.tag }));
      card.appendChild(head);
      card.appendChild(el("p", { className: "restaurant-card__desc", text: item.desc }));
      list.appendChild(card);
    });

    toggle.appendChild(list);
    toggle.appendChild(el("p", { className: "note note--inline", text: r.tip }));
    inner.appendChild(toggle);
    section.appendChild(inner);
    return section;
  }

  function renderContactSection(c) {
    const section = el("section", { className: "section-block reveal", id: "contact" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.contact.title }));
    inner.appendChild(el("p", { className: "section-lead", text: c.contact.lead }));
    inner.appendChild(el("a", {
      className: "btn btn--call",
      href: `tel:${c.contact.phoneTel}`,
      text: c.contact.phone,
    }));
    inner.appendChild(el("p", { className: "host", text: c.contact.host }));
    section.appendChild(inner);
    return section;
  }

  function renderMilanSection(c, lang) {
    const section = el("section", { className: "gallery-intro reveal", id: "milan" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.milan.title }));
    inner.appendChild(el("p", { className: "section-lead", text: c.milan.lead }));
    section.appendChild(inner);
    section.appendChild(renderMilanGallery(lang));
    return section;
  }

  function renderHouseGallery(c, lang) {
    const section = el("section", { className: "gallery-intro reveal", id: "house" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.house.title }));
    inner.appendChild(el("p", { className: "section-lead", text: c.house.lead }));
    section.appendChild(inner);
    section.appendChild(renderScrollGallery(window.GUEST_IMAGES.house, lang, "house"));
    return section;
  }

  function renderScrollGallery(items, lang, variant) {
    const wrap = el("div", { className: `scroll-gallery scroll-gallery--${variant}` });
    const track = el("div", { className: "scroll-gallery__track", tabindex: "0", role: "region" });
    track.setAttribute("aria-label", variant === "house" ? "Apartment photos" : "Milan photos");

    items.forEach((item, i) => {
      const slide = el("figure", { className: "scroll-gallery__slide reveal" });
      slide.style.setProperty("--i", String(i));
      const img = makeImg(item.src, item.alt[lang], "scroll-gallery__img");
      slide.appendChild(img);
      if (item.badge) {
        slide.appendChild(el("figcaption", { className: "scroll-gallery__badge", text: item.badge[lang] }));
      }
      track.appendChild(slide);
    });

    wrap.appendChild(track);
    wrap.appendChild(el("p", { className: "scroll-hint", text: lang === "it" ? "← scorri →" : "← scroll →" }));
    return wrap;
  }

  function bindScrollEffects() {
    if (scrollHandlersBound) return;
    scrollHandlersBound = true;

    const header = document.querySelector(".site-header");
    const heroEl = document.querySelector(".hero");
    const heroImg = document.querySelector(".hero__img");
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isNarrow = window.matchMedia("(max-width: 768px)").matches;

    // L'header resta sempre trasparente: il testo passa da chiaro a scuro
    // quando smette di stare sopra la foto dell'hero, non dopo un tot di
    // scroll fisso — con un hero più basso 24px lasciava il testo scuro
    // ancora sopra la foto, illeggibile.
    const onScroll = () => {
      const y = window.scrollY;
      if (header && heroEl) {
        header.classList.toggle("is-scrolled", heroEl.getBoundingClientRect().bottom <= header.offsetHeight);
      }
      if (heroImg && !isCoarsePointer && !isNarrow) {
        const offset = Math.min(y * 0.35, 120);
        heroImg.style.transform = `translate3d(0, ${offset}px, 0) scale(${1 + y * 0.00015})`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
      );
      reveals.forEach((node) => io.observe(node));
    } else {
      reveals.forEach((node) => node.classList.add("is-visible"));
    }

    document.querySelectorAll(".scroll-gallery__track").forEach((track) => {
      const hint = track.parentElement?.querySelector(".scroll-hint");
      track.addEventListener("scroll", () => {
        if (hint && track.scrollLeft > 8) hint.classList.add("is-hidden");
      }, { passive: true });

      track.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        if (track.scrollWidth <= track.clientWidth) return;
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }, { passive: false });
    });
  }

  function renderGuideBlock(block) {
    const details = el("details", { className: "faq-item reveal" });
    details.appendChild(el("summary", { text: block.title }));
    if (block.steps) details.appendChild(renderSteps(block.steps));
    if (block.html) details.appendChild(el("p", { html: block.html }));
    if (block.list) {
      const ul = el("ul", { className: "amenity-list" });
      block.list.forEach((item) => ul.appendChild(el("li", { text: item })));
      details.appendChild(ul);
    }
    if (block.items) {
      block.items.forEach((item) => {
        const row = el("div", { className: "parking-item" });
        row.appendChild(el("h3", { text: item.name }));
        row.appendChild(el("p", { text: item.desc }));
        details.appendChild(row);
      });
    }
    return details;
  }

  function wrapInToggle(label, content) {
    const details = el("details", { className: "section-toggle reveal" });
    details.appendChild(el("summary", { text: label }));
    details.appendChild(content);
    return details;
  }

  // Dati già scritti in guide-sections.js ma mai agganciati a una vista:
  // biglietti ATM (utili su "Come raggiungerci") e contatti utili (taxi,
  // farmacia, emergenze — utili su "Contatti").
  function renderTransportSection(lang) {
    const t = window.GUEST_GUIDE[lang].transport;
    const section = el("section", { className: "section-block reveal" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: t.title }));
    const body = el("div", { className: "section-toggle__body" });
    t.tickets.forEach((x) => {
      const item = el("div", { className: "parking-item" });
      item.appendChild(el("h3", { text: x.name }));
      item.appendChild(el("p", { text: x.desc }));
      body.appendChild(item);
    });
    inner.appendChild(wrapInToggle(t.toggle, body));
    section.appendChild(inner);
    return section;
  }

  function renderUsefulContactsSection(lang) {
    const u = window.GUEST_GUIDE[lang].useful;
    const section = el("section", { className: "section-block reveal" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: u.title }));
    const body = el("div", { className: "section-toggle__body" });
    u.items.forEach((item) => {
      const row = el("div", { className: "parking-item" });
      row.appendChild(el("h3", { text: item.label }));
      row.appendChild(item.href
        ? el("a", { className: "tel", href: item.href, text: item.value })
        : el("p", { text: item.value }));
      body.appendChild(row);
    });
    inner.appendChild(wrapInToggle(u.toggle, body));
    section.appendChild(inner);
    return section;
  }

  // Icone minimali inline (niente libreria esterna per un sito statico).
  function topicIconMarkup(id) {
    const attrs = 'viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const shapes = {
      checkin: '<rect x="6" y="3" width="12" height="18" rx="1"></rect>' +
        '<circle cx="14.5" cy="12" r="1" fill="currentColor" stroke="none"></circle>',
      directions: '<circle cx="12" cy="10" r="3"></circle>' +
        '<path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>',
      parking: '<circle cx="12" cy="12" r="9"></circle>' +
        '<text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="700" ' +
        'fill="currentColor" stroke="none" font-family="inherit">P</text>',
      wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"></path>' +
        '<path d="M1.42 9a16 16 0 0 1 21.16 0"></path>' +
        '<path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>' +
        '<line x1="12" y1="20" x2="12.01" y2="20"></line>',
      house: '<path d="M3 9l9-7 9 7"></path>' +
        '<path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"></path>' +
        '<path d="M9 21v-7h6v7"></path>',
      milan: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>' +
        '<line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>',
      contact: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 ' +
        '19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path>',
    };
    return `<svg ${attrs}>${shapes[id] || ""}</svg>`;
  }

  function renderCardGrid(c) {
    const section = el("section", { className: "card-grid-section reveal", id: "topics" });
    const inner = el("div", { className: "container" });
    const grid = el("div", { className: "card-grid" });
    Object.entries(c.topics).forEach(([id, topic]) => {
      const card = el("a", { className: "card-tile reveal", href: `#screen/${id}` });
      card.appendChild(el("span", { className: "card-tile__icon", html: topicIconMarkup(id) }));
      const body = el("div", { className: "card-tile__body" });
      body.appendChild(el("h3", { className: "card-tile__title", text: topic.title }));
      body.appendChild(el("p", { className: "card-tile__subtitle", text: topic.subtitle }));
      card.appendChild(body);
      grid.appendChild(card);
    });
    inner.appendChild(grid);
    section.appendChild(inner);
    return section;
  }

  // Nomi propri: non si traducono, restano uguali in ogni lingua del sito.
  const LANG_NAMES = { it: "Italiano", en: "English", es: "Español", fr: "Français", de: "Deutsch" };

  function renderLanguagesScreen(c, lang) {
    const section = el("section", { className: "section-block reveal" });
    const inner = el("div", { className: "container" });
    inner.appendChild(el("h2", { className: "section-title", text: c.language }));
    const list = el("div", { className: "lang-list" });
    Object.keys(window.GUEST_CONTENT).forEach((id) => {
      const isActive = id === lang;
      const row = el("button", {
        className: `lang-row${isActive ? " is-active" : ""}`,
        type: "button",
      });
      row.appendChild(el("span", { className: "lang-row__name", text: LANG_NAMES[id] || id.toUpperCase() }));
      if (isActive) {
        row.appendChild(el("span", {
          className: "lang-row__check",
          html: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
            'stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<polyline points="20 6 9 17 4 12"></polyline></svg>',
        }));
      }
      row.addEventListener("click", () => setLang(id));
      list.appendChild(row);
    });
    inner.appendChild(list);
    section.appendChild(inner);
    return section;
  }

  function renderScreenBack(c) {
    const bar = el("div", { className: "screen-back" });
    const inner = el("div", { className: "container" });
    const link = el("a", { className: "screen-back__link", href: "#" });
    link.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>' +
      `<span>${c.backHome}</span>`;
    inner.appendChild(link);
    bar.appendChild(inner);
    return bar;
  }

  // Ogni schermata è una o più sezioni già esistenti, solo riassemblate: il
  // contenuto di ciascuna non cambia, cambia solo come viene raggiunto.
  const SCREENS = {
    checkin: (c, lang) => [renderCheckinSection(c)],
    directions: (c, lang) => [renderDirectionsSection(lang), renderParkingSection(c), renderTransportSection(lang)],
    wifi: (c, lang) => [renderWifiSection(c)],
    house: (c, lang) => {
      const nodes = [renderGuideSection(lang)];
      if (window.GUEST_FEATURES?.showHouseGallery) nodes.push(renderHouseGallery(c, lang));
      return nodes;
    },
    milan: (c, lang) => [renderRestaurantsSection(lang), renderMilanSection(c, lang)],
    contact: (c, lang) => [renderContactSection(c), renderUsefulContactsSection(lang)],
  };

  // "lang" non è tra le card di casa (SCREENS): ci si arriva solo dal
  // pulsante lingua in header, come le altre schermate ha solo la barra
  // "indietro" sopra al contenuto.
  // Link mandati prima della riorganizzazione a card puntavano alle vecchie
  // ancore dei capitoli (#arrival, #once-in, #useful, #checkin, #top): senza
  // questa mappa un link già in mano a un ospite atterrerebbe in home invece
  // che nella sezione giusta.
  const LEGACY_ROUTES = { arrival: "checkin", "once-in": "wifi", useful: "milan", checkin: "checkin", top: "home" };

  function getRoute() {
    if (location.hash === "#screen/lang") return "lang";
    const m = /^#screen\/([a-z]+)$/.exec(location.hash);
    if (m && SCREENS[m[1]]) return m[1];
    const legacyId = location.hash.replace(/^#/, "");
    return LEGACY_ROUTES[legacyId] || "home";
  }

  function milanImageUrl(path) {
    return path.split("/").map((part, i, parts) => (i === parts.length - 1 ? encodeURIComponent(part) : part)).join("/");
  }

  function renderMilanGallery(lang) {
    const places = window.GUEST_GUIDE[lang].milan.places;
    const wrap = el("div", { className: "scroll-gallery scroll-gallery--milan milan-gallery" });
    const track = el("div", { className: "scroll-gallery__track", tabindex: "0", role: "region" });
    track.setAttribute("aria-label", lang === "it" ? "Luoghi a Milano" : "Places in Milan");

    places.forEach((place, i) => {
      const slide = el("article", { className: "milan-card scroll-gallery__slide reveal" });
      slide.style.setProperty("--i", String(i));
      slide.style.backgroundImage = `url("${milanImageUrl(place.image)}")`;
      const shade = el("div", { className: "milan-card__shade" });
      const content = el("div", { className: "milan-card__content" });
      content.appendChild(el("h3", { className: "milan-card__title", text: place.title }));
      content.appendChild(el("p", { className: "milan-card__desc", text: place.desc }));
      slide.appendChild(shade);
      slide.appendChild(content);
      track.appendChild(slide);
    });

    wrap.appendChild(track);
    wrap.appendChild(el("p", { className: "scroll-hint", text: lang === "it" ? "← scorri →" : "← scroll →" }));
    return wrap;
  }

  function renderHero(c, lang) {
    const hero = el("section", { className: "hero", id: "top" });
    const heroMedia = el("div", { className: "hero__media" });
    const cfg = window.GUEST_IMAGES.hero;
    const img = makeImg(cfg.src, cfg.alt[lang], "hero__img");
    if (cfg.fallback) img.dataset.fallback = cfg.fallback;
    img.fetchPriority = "high";
    img.loading = "eager";
    img.onerror = function () {
      if (this.dataset.fallback) this.src = this.dataset.fallback;
    };
    heroMedia.appendChild(img);
    heroMedia.appendChild(el("div", { className: "hero__shade" }));

    const heroContent = el("div", { className: "hero__content container" });
    heroContent.appendChild(el("p", { className: "hero-eyebrow", text: c.hero.subtitle }));
    heroContent.appendChild(el("h1", { text: c.hero.title }));
    heroContent.appendChild(el("p", { className: "hero-lead", text: c.hero.lead }));

    hero.appendChild(heroMedia);
    hero.appendChild(heroContent);
    return hero;
  }

  function render(lang) {
    scrollHandlersBound = false;
    const c = window.GUEST_CONTENT[lang];
    const route = getRoute();
    document.documentElement.lang = lang;
    document.title = c.meta.title;

    const root = document.getElementById("app");
    root.innerHTML = "";

    const header = el("header", { className: route === "home" ? "site-header" : "site-header site-header--solid" });
    const headerInner = el("div", { className: "container header-inner" });
    headerInner.appendChild(el("a", { className: "logo", href: "#", text: "Nineteen Milano" }));

    // Mostra la lingua ATTUALE (non più la prossima del ciclo): apre la
    // pagina "Lingua" invece di ciclare tra le 5 a furia di tap. L'iconcina
    // del globo c'è perché una sigla di due lettere da sola («IT», «EN»...)
    // non si legge subito come "cambia lingua" — sembra un badge qualsiasi.
    const langBtn = el("button", {
      className: "lang-toggle",
      type: "button",
      "aria-label": "Change language",
      html: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line>' +
        '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>' +
        `</svg><span>${lang.toUpperCase()}</span>`,
    });
    langBtn.addEventListener("click", () => { location.hash = "#screen/lang"; });

    headerInner.appendChild(langBtn);
    header.appendChild(headerInner);

    // Home: solo la griglia degli argomenti (check-in incluso, come le
    // altre card). Ogni percorso è una schermata dedicata con solo quel
    // contenuto e un rimando alla home.
    const main = el("main");
    if (route === "home") {
      main.appendChild(renderCardGrid(c));
    } else if (route === "lang") {
      main.appendChild(renderScreenBack(c));
      main.appendChild(renderLanguagesScreen(c, lang));
    } else {
      main.appendChild(renderScreenBack(c));
      SCREENS[route](c, lang).forEach((node) => main.appendChild(node));
    }

    const footer = el("footer", { className: "site-footer" });
    footer.appendChild(el("div", { className: "container", text: c.footer }));

    root.appendChild(header);
    if (route === "home") root.appendChild(renderHero(c, lang));
    root.appendChild(main);
    root.appendChild(footer);

    // La parte personale (personal.js) si aggancia qui: la guida si ridisegna a
    // ogni cambio lingua e il blocco ospite deve seguirla. Va notificato PRIMA
    // degli effetti di scroll: se quelli falliscono (browser senza matchMedia,
    // estensioni, jsdom) l'ospite deve comunque vedere la sua parte. Fuori
    // dalla home #checkin non esiste: personal.js lo gestisce già (no-op).
    document.dispatchEvent(new CustomEvent("guide:rendered", { detail: { lang } }));

    bindScrollEffects();

    // Scroll in cima solo quando si cambia davvero schermata, non ai cambi
    // lingua sulla stessa schermata (altrimenti si perderebbe la posizione).
    if (route !== lastRoute) window.scrollTo(0, 0);
    lastRoute = route;
  }

  // Un hashchange dentro la STESSA schermata (es. l'ancora #topics dell'hero)
  // non deve ridisegnare: lo scroll nativo del browser verso l'ancora
  // funziona solo se il DOM non viene ricostruito sotto ai suoi piedi.
  window.addEventListener("hashchange", () => {
    if (getRoute() !== lastRoute) render(getLang());
  });

  // La lingua della PRENOTAZIONE, quando personal.js la conosce. La guida da
  // sola può solo indovinare dal browser, e indovina su chi apre il link: se
  // l'host lo controlla dal proprio telefono italiano vede la guida in
  // italiano, anche per un ospite inglese. La scheda invece la lingua la sa.
  //
  // NON scavalca una scelta manuale: localStorage viene scritto solo da
  // setLang(), cioè solo quando qualcuno tocca il selettore. Se c'è, ha scelto
  // l'ospite e vince lui — anche se abbiamo sbagliato noi a registrarlo.
  document.addEventListener("guest:lingua", (e) => {
    const lang = e.detail && e.detail.lang;
    if (!lang || !window.GUEST_CONTENT[lang]) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    render(lang);
  });

  document.addEventListener("DOMContentLoaded", () => render(getLang()));
})();
