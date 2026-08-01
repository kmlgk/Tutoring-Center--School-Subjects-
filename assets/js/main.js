/* ==========================================================================
   Brightpath Tutoring Center — shared site JavaScript (vanilla only)
   ========================================================================== */
(function () {
  "use strict";

  var DESKTOP_BREAKPOINT = 1280; // xl

  /* ------------------------------------------------------------------
     Theme (dark/light) — class strategy, localStorage, respects
     prefers-color-scheme on first visit only
     ------------------------------------------------------------------ */
  function initTheme() {
    var root = document.documentElement;
    var stored = localStorage.getItem("bp-theme");
    if (stored === "dark") {
      root.classList.add("dark");
    } else if (stored === "light") {
      root.classList.remove("dark");
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    }
    updateThemeIcons();

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        root.classList.toggle("dark");
        localStorage.setItem("bp-theme", root.classList.contains("dark") ? "dark" : "light");
        updateThemeIcons();
      });
    });
  }

  function updateThemeIcons() {
    var isDark = document.documentElement.classList.contains("dark");
    document.querySelectorAll("[data-theme-icon-sun]").forEach(function (el) {
      el.classList.toggle("hidden", isDark);
    });
    document.querySelectorAll("[data-theme-icon-moon]").forEach(function (el) {
      el.classList.toggle("hidden", !isDark);
    });
  }

  /* ------------------------------------------------------------------
     RTL / LTR toggle — localStorage
     ------------------------------------------------------------------ */
  function initDirection() {
    var root = document.documentElement;
    var stored = localStorage.getItem("bp-dir");
    if (stored === "rtl") {
      root.setAttribute("dir", "rtl");
    } else {
      root.setAttribute("dir", "ltr");
    }
    updateDirLabels();

    document.querySelectorAll("[data-dir-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isRtl = root.getAttribute("dir") === "rtl";
        root.setAttribute("dir", isRtl ? "ltr" : "rtl");
        localStorage.setItem("bp-dir", isRtl ? "ltr" : "rtl");
        updateDirLabels();
      });
    });
  }

  function updateDirLabels() {
    var isRtl = document.documentElement.getAttribute("dir") === "rtl";
    document.querySelectorAll("[data-dir-label]").forEach(function (el) {
      el.textContent = isRtl ? "LTR" : "RTL";
    });
  }

  /* ------------------------------------------------------------------
     Floating detached navbar — transitions to a pill on scroll
     ------------------------------------------------------------------ */
  function initHeaderScroll() {
    var header = document.getElementById("header-bar");
    var wrap = document.getElementById("site-header");
    if (!header || !wrap) return;
    var THRESHOLD = 80;

    function applyState() {
      var floating = window.scrollY > THRESHOLD;
      header.classList.toggle("header-floating", floating);
      wrap.classList.toggle("py-0", !floating);
    }
    applyState();
    window.addEventListener("scroll", applyState, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mobile top slide-down panel
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.getElementById("mobile-panel");
    if (!toggle || !panel) return;

    function open() {
      panel.classList.add("panel-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("overflow-hidden");
    }
    function close() {
      panel.classList.remove("panel-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("overflow-hidden");
    }
    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.contains("panel-open");
      isOpen ? close() : open();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) close();
    });
    panel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* ------------------------------------------------------------------
     Desktop "Subjects" dropdown — click always opens, closes via
     outside-click / Escape / focusout / mouseleave only (no toggle race)
     ------------------------------------------------------------------ */
  function initNavDropdown() {
    var wrap = document.querySelector("[data-dropdown-wrap]");
    if (!wrap) return;
    var trigger = wrap.querySelector("[data-dropdown-trigger]");
    var panel = wrap.querySelector("[data-dropdown-panel]");
    if (!trigger || !panel) return;

    function open() {
      panel.classList.add("dropdown-open");
      trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
      panel.classList.remove("dropdown-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
    wrap.addEventListener("mouseenter", open);
    wrap.addEventListener("mouseleave", close);
    wrap.addEventListener("focusout", function (e) {
      if (!wrap.contains(e.relatedTarget)) close();
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ------------------------------------------------------------------
     Generic accordion — data-accordion="single|multi"
     ------------------------------------------------------------------ */
  function initAccordions() {
    document.querySelectorAll("[data-accordion]").forEach(function (group) {
      var mode = group.getAttribute("data-accordion");
      var triggers = group.querySelectorAll(".accordion-trigger");
      triggers.forEach(function (trigger) {
        var panelId = trigger.getAttribute("aria-controls");
        var panel = document.getElementById(panelId);
        if (!panel) return;
        trigger.addEventListener("click", function () {
          var expanded = trigger.getAttribute("aria-expanded") === "true";
          if (mode === "single" && !expanded) {
            triggers.forEach(function (t) {
              if (t !== trigger) {
                t.setAttribute("aria-expanded", "false");
                var p = document.getElementById(t.getAttribute("aria-controls"));
                if (p) p.style.maxHeight = "0px";
              }
            });
          }
          trigger.setAttribute("aria-expanded", String(!expanded));
          panel.style.maxHeight = !expanded ? panel.scrollHeight + "px" : "0px";
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Details-based accordion (mobile Subjects submenu) — no JS needed,
     but keep aria in sync for screen readers via native <details>.
     ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
     Scroll reveal — vanilla IntersectionObserver
     ------------------------------------------------------------------ */
  function initScrollReveals() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      items.forEach(function (el) { el.classList.add("reveal-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute("data-reveal-delay");
          if (delay) entry.target.style.transitionDelay = delay + "ms";
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Vanilla count-up counters — data-counter="1200"
     ------------------------------------------------------------------ */
  function initCounters() {
    var items = document.querySelectorAll("[data-counter]");
    if (!items.length) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-counter-suffix") || "";
      var decimals = el.getAttribute("data-counter-decimals") ? parseInt(el.getAttribute("data-counter-decimals"), 10) : 0;
      if (reduced) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }
      var duration = 1600;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = target * eased;
        el.textContent = val.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(decimals) + suffix;
      }
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Grade-band expandable accordion list (Home — Subjects by Grade)
     ------------------------------------------------------------------ */
  function initGradeAccordion() {
    var rows = document.querySelectorAll("[data-grade-row]");
    if (!rows.length) return;
    rows.forEach(function (row) {
      var trigger = row.querySelector("[data-grade-trigger]");
      var panel = row.querySelector("[data-grade-panel]");
      if (!trigger || !panel) return;
      trigger.addEventListener("click", function () {
        var expanded = trigger.getAttribute("aria-expanded") === "true";
        rows.forEach(function (r) {
          if (r !== row) {
            var t = r.querySelector("[data-grade-trigger]");
            var p = r.querySelector("[data-grade-panel]");
            if (t) t.setAttribute("aria-expanded", "false");
            if (p) p.style.maxHeight = "0px";
          }
        });
        trigger.setAttribute("aria-expanded", String(!expanded));
        panel.style.maxHeight = !expanded ? panel.scrollHeight + "px" : "0px";
      });
    });
  }

  /* ------------------------------------------------------------------
     Horizontal scroll-snap strips — wheel redirect + drag-to-scroll
     ------------------------------------------------------------------ */
  function initHorizontalScrollStrips() {
    document.querySelectorAll(".scroll-strip").forEach(function (strip) {
      strip.addEventListener("wheel", function (e) {
        if (strip.scrollWidth <= strip.clientWidth) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          strip.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });

      var isDown = false, startX, scrollLeft, moved = false;
      strip.addEventListener("mousedown", function (e) {
        isDown = true;
        moved = false;
        strip.classList.add("is-dragging");
        startX = e.pageX - strip.offsetLeft;
        scrollLeft = strip.scrollLeft;
      });
      window.addEventListener("mouseup", function () {
        isDown = false;
        strip.classList.remove("is-dragging");
      });
      strip.addEventListener("mouseleave", function () {
        isDown = false;
        strip.classList.remove("is-dragging");
      });
      strip.addEventListener("mousemove", function (e) {
        if (!isDown) return;
        e.preventDefault();
        var x = e.pageX - strip.offsetLeft;
        var walk = x - startX;
        if (Math.abs(walk) > 5) moved = true;
        strip.scrollLeft = scrollLeft - walk;
      });
      strip.addEventListener("click", function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      }, true);
    });
  }

  /* ------------------------------------------------------------------
     Shared tutor bio modal — populated from data-* attributes
     ------------------------------------------------------------------ */
  function initTutorModal() {
    var overlay = document.getElementById("tutor-modal");
    if (!overlay) return;
    var panel = overlay.querySelector(".modal-panel");
    var closeBtn = overlay.querySelector("[data-modal-close]");
    var lastFocused = null;

    function fill(field, value) {
      var el = overlay.querySelector('[data-modal-field="' + field + '"]');
      if (!el) return;
      if (value) {
        el.textContent = value;
        el.closest("[data-modal-row]") && el.closest("[data-modal-row]").classList.remove("hidden");
      } else if (el.closest("[data-modal-row]")) {
        el.closest("[data-modal-row]").classList.add("hidden");
      }
    }

    function open(card) {
      lastFocused = document.activeElement;
      fill("name", card.getAttribute("data-name"));
      fill("role", card.getAttribute("data-role"));
      fill("qualification", card.getAttribute("data-qualification"));
      fill("experience", card.getAttribute("data-experience"));
      fill("subjects", card.getAttribute("data-subjects"));
      fill("grades", card.getAttribute("data-grades"));
      fill("bio", card.getAttribute("data-bio"));
      fill("availability", card.getAttribute("data-availability"));
      fill("methods", card.getAttribute("data-methods"));
      var ratingEl = overlay.querySelector('[data-modal-field="rating"]');
      if (ratingEl) {
        var rating = parseFloat(card.getAttribute("data-rating") || "0");
        var full = Math.round(rating);
        var stars = "";
        for (var i = 0; i < 5; i++) {
          stars += i < full ? '<i class="fa-solid fa-star" aria-hidden="true"></i>' : '<i class="fa-regular fa-star" aria-hidden="true"></i>';
        }
        ratingEl.innerHTML = stars;
        var ratingNumEl = overlay.querySelector('[data-modal-field="rating-num"]');
        if (ratingNumEl) ratingNumEl.textContent = card.getAttribute("data-rating") ? card.getAttribute("data-rating") + " / 5" : "";
      }
      var img = overlay.querySelector('[data-modal-field="img"]');
      if (img) {
        img.src = card.getAttribute("data-img");
        img.alt = card.getAttribute("data-img-alt") || card.getAttribute("data-name");
      }
      overlay.classList.remove("hidden");
      requestAnimationFrame(function () { overlay.classList.add("modal-open"); });
      document.body.classList.add("overflow-hidden");
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      overlay.classList.remove("modal-open");
      document.body.classList.remove("overflow-hidden");
      setTimeout(function () { overlay.classList.add("hidden"); }, 250);
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll("[data-tutor-card]").forEach(function (card) {
      card.addEventListener("click", function () { open(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(card);
        }
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("modal-open")) close();
      if (e.key === "Tab" && overlay.classList.contains("modal-open") && panel) {
        var focusables = panel.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     Tutor directory filter (tutors.html)
     ------------------------------------------------------------------ */
  function initTutorFilter() {
    var group = document.querySelector("[data-tutor-filter-group]");
    if (!group) return;
    var buttons = group.querySelectorAll("[data-filter]");
    var cards = document.querySelectorAll("[data-tutor-card]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        btn.setAttribute("aria-selected", "true");
        var filter = btn.getAttribute("data-filter");
        cards.forEach(function (card) {
          var matches = filter === "all" ||
            (card.getAttribute("data-filter-subject") || "").indexOf(filter) !== -1 ||
            (card.getAttribute("data-filter-grade") || "").indexOf(filter) !== -1;
          card.classList.toggle("hidden", !matches);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Subject catalog filter + pagination (subjects.html)
     Page size is fixed at a multiple of 3 (set via data-page-size on the
     grid, default 9 = a 3x3 grid) so every full page renders complete
     rows; only the final page of a result set may be shorter.
     ------------------------------------------------------------------ */
  function initSubjectFilter() {
    var group = document.querySelector("[data-subject-filter-group]");
    if (!group) return;
    var buttons = group.querySelectorAll("[data-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-subject-card]"));
    var noResults = document.querySelector("[data-subject-no-results]");
    var grid = document.querySelector("[data-subject-grid]");
    var pageSize = grid ? parseInt(grid.getAttribute("data-page-size"), 10) || 9 : 9;
    var pagination = document.querySelector("[data-subject-pagination]");
    var prevBtn = pagination ? pagination.querySelector("[data-page-prev]") : null;
    var nextBtn = pagination ? pagination.querySelector("[data-page-next]") : null;
    var pageIndicator = pagination ? pagination.querySelector("[data-page-indicator]") : null;

    var activeFilter = "all";
    var currentPage = 1;

    function matchesFilter(card, filter) {
      return filter === "all" ||
        (card.getAttribute("data-filter-subject") || "").indexOf(filter) !== -1 ||
        (card.getAttribute("data-filter-grade") || "").indexOf(filter) !== -1;
    }

    function render() {
      var matching = cards.filter(function (card) { return matchesFilter(card, activeFilter); });
      var totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;

      var pageStart = (currentPage - 1) * pageSize;
      var pageEnd = pageStart + pageSize;

      cards.forEach(function (card) {
        var idx = matching.indexOf(card);
        var onPage = idx !== -1 && idx >= pageStart && idx < pageEnd;
        card.classList.toggle("hidden", !onPage);
      });

      if (noResults) noResults.classList.toggle("hidden", matching.length !== 0);

      if (pagination) {
        pagination.classList.toggle("hidden", totalPages <= 1);
        if (pageIndicator) pageIndicator.textContent = "Page " + currentPage + " of " + totalPages;
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        btn.setAttribute("aria-selected", "true");
        activeFilter = btn.getAttribute("data-filter");
        currentPage = 1;
        render();
      });
    });

    if (prevBtn) prevBtn.addEventListener("click", function () {
      if (currentPage > 1) { currentPage--; render(); }
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      currentPage++; render();
    });

    render();
  }

  /* ------------------------------------------------------------------
     data-tilt — subtle pointer-driven 3D tilt on cards/panels
     ------------------------------------------------------------------ */
  function initTilt() {
    var items = document.querySelectorAll("[data-tilt]");
    if (!items.length) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.matchMedia("(hover: none)").matches) return;
    var MAX_DEG = 6;

    items.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var tiltX = (px - 0.5) * (MAX_DEG * 2);
        var tiltY = (0.5 - py) * (MAX_DEG * 2);
        el.style.setProperty("--tilt-x", tiltX.toFixed(2) + "deg");
        el.style.setProperty("--tilt-y", tiltY.toFixed(2) + "deg");
      });
      el.addEventListener("mouseleave", function () {
        el.style.setProperty("--tilt-x", "0deg");
        el.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  /* ------------------------------------------------------------------
     Quick Match hero mini-form (Home 2) — routes to trial-class.html
     with the picks pre-filled via query string (decorative, no backend)
     ------------------------------------------------------------------ */
  function initQuickMatch() {
    var form = document.getElementById("quick-match-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var subject = form.querySelector('[name="qm-subject"]').value;
      var grade = form.querySelector('[name="qm-grade"]').value;
      var format = form.querySelector('[name="qm-format"]').value;
      var params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (grade) params.set("grade", grade);
      if (format) params.set("format", format);
      var qs = params.toString();
      window.location.href = "trial-class.html" + (qs ? "?" + qs : "");
    });
  }

  /* ------------------------------------------------------------------
     Testimonial avatar switcher (Home 2 — spotlight testimonial)
     ------------------------------------------------------------------ */
  function initTestimonialSwitcher() {
    var widget = document.querySelector("[data-testimonial-widget]");
    if (!widget) return;
    var triggers = widget.querySelectorAll("[data-testimonial-trigger]");
    var panels = widget.querySelectorAll("[data-testimonial-panel]");
    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var id = trigger.getAttribute("data-testimonial-trigger");
        triggers.forEach(function (t) { t.setAttribute("aria-selected", String(t === trigger)); });
        panels.forEach(function (p) {
          p.classList.toggle("hidden", p.getAttribute("data-testimonial-panel") !== id);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     Custom vanilla lightbox (About — learning space gallery)
     ------------------------------------------------------------------ */
  function initLightbox() {
    var overlay = document.getElementById("lightbox-overlay");
    if (!overlay) return;
    var imgEl = overlay.querySelector("img");
    var captionEl = overlay.querySelector("[data-lightbox-caption]");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox-trigger]"));
    var current = 0;

    function show(index) {
      current = (index + items.length) % items.length;
      var el = items[current];
      imgEl.src = el.getAttribute("data-full") || el.querySelector("img").src;
      imgEl.alt = el.getAttribute("data-caption") || "";
      if (captionEl) captionEl.textContent = el.getAttribute("data-caption") || "";
    }
    function open(index) {
      show(index);
      overlay.classList.remove("hidden");
      requestAnimationFrame(function () { overlay.classList.add("modal-open"); });
      document.body.classList.add("overflow-hidden");
    }
    function close() {
      overlay.classList.remove("modal-open");
      document.body.classList.remove("overflow-hidden");
      setTimeout(function () { overlay.classList.add("hidden"); }, 250);
    }
    items.forEach(function (el, i) {
      el.addEventListener("click", function () { open(i); });
    });
    overlay.querySelectorAll("[data-lightbox-close]").forEach(function (btn) {
      btn.addEventListener("click", close);
    });
    overlay.querySelectorAll("[data-lightbox-next]").forEach(function (btn) {
      btn.addEventListener("click", function () { show(current + 1); });
    });
    overlay.querySelectorAll("[data-lightbox-prev]").forEach(function (btn) {
      btn.addEventListener("click", function () { show(current - 1); });
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("modal-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "ArrowLeft") show(current - 1);
    });
  }

  /* ------------------------------------------------------------------
     Form validation helpers
     ------------------------------------------------------------------ */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[0-9+\-() ]{7,20}$/;

  function showError(field, message) {
    var wrap = field.closest("[data-field-wrap]") || field.parentElement;
    wrap.classList.add("field-invalid");
    var err = wrap.querySelector(".form-field-error");
    if (err && message) err.textContent = message;
  }
  function clearError(field) {
    var wrap = field.closest("[data-field-wrap]") || field.parentElement;
    wrap.classList.remove("field-invalid");
  }

  function validateField(field) {
    var value = field.value.trim();
    var required = field.hasAttribute("required");
    if (required && !value) {
      showError(field, "This field is required.");
      return false;
    }
    if (field.type === "email" && value && !EMAIL_RE.test(value)) {
      showError(field, "Enter a valid email address.");
      return false;
    }
    if (field.getAttribute("data-phone") !== null && value && !PHONE_RE.test(value)) {
      showError(field, "Enter a valid phone number.");
      return false;
    }
    if (field.tagName === "SELECT" && required && (!value || value === "")) {
      showError(field, "Please make a selection.");
      return false;
    }
    clearError(field);
    return true;
  }

  function initForm(formId, onSuccess) {
    var form = document.getElementById(formId);
    if (!form) return;
    var fields = form.querySelectorAll("input, select, textarea");
    fields.forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) valid = false;
      });
      if (!valid) {
        var firstInvalid = form.querySelector(".field-invalid input, .field-invalid select, .field-invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      if (onSuccess) onSuccess(form);
    });
  }

  function revealSuccess(form) {
    var successEl = (form.parentElement || document).querySelector('[data-form-success="' + form.id + '"]');
    form.classList.add("hidden");
    if (successEl) successEl.classList.remove("hidden");
  }

  function initTrialForm() {
    var form = document.getElementById("trial-form");
    if (!form) return;
    var dateField = form.querySelector('[name="preferred-date"]');
    if (dateField) {
      var today = new Date();
      var yyyy = today.getFullYear();
      var mm = String(today.getMonth() + 1).padStart(2, "0");
      var dd = String(today.getDate()).padStart(2, "0");
      dateField.min = yyyy + "-" + mm + "-" + dd;
    }
    initForm("trial-form", revealSuccess);
  }

  function initContactForm() {
    initForm("contact-form", revealSuccess);
    var msg = document.getElementById("contact-message");
    var counter = document.querySelector("[data-char-counter]");
    if (msg && counter) {
      var max = parseInt(msg.getAttribute("maxlength") || "500", 10);
      function update() {
        counter.textContent = msg.value.length + " / " + max + " characters";
      }
      msg.addEventListener("input", update);
      update();
    }
  }

  /* ------------------------------------------------------------------
     Login (demo auth)
     ------------------------------------------------------------------ */
  function initLogin() {
    var form = document.getElementById("login-form");
    if (!form) return;
    var errorBox = document.getElementById("login-error");
    var toggleBtn = document.querySelector("[data-password-toggle]");
    var passwordField = document.getElementById("login-password");

    if (toggleBtn && passwordField) {
      toggleBtn.addEventListener("click", function () {
        var isPassword = passwordField.type === "password";
        passwordField.type = isPassword ? "text" : "password";
        toggleBtn.setAttribute("aria-pressed", String(isPassword));
        toggleBtn.textContent = isPassword ? "Hide" : "Show";
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("login-email").value.trim().toLowerCase();
      var password = passwordField.value;
      if (email === "parent@brightpath-demo.com" && password === "Demo@123") {
        localStorage.setItem("bp_auth", "1");
        localStorage.setItem("bp_parent_name", "Priya Nair");
        if (errorBox) errorBox.classList.add("hidden");
        window.location.href = "dashboard.html";
      } else {
        if (errorBox) errorBox.classList.remove("hidden");
      }
    });

    var forgotBtn = document.querySelector("[data-forgot-password]");
    if (forgotBtn) {
      forgotBtn.addEventListener("click", function (e) {
        e.preventDefault();
      });
    }
  }

  /* ------------------------------------------------------------------
     FAQ live search filter
     ------------------------------------------------------------------ */
  function initFaqSearch() {
    var input = document.querySelector("[data-faq-search]");
    if (!input) return;
    var items = document.querySelectorAll("[data-faq-item]");
    var noResults = document.querySelector("[data-faq-no-results]");

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var visibleCount = 0;
      items.forEach(function (item) {
        var text = item.textContent.toLowerCase();
        var match = !q || text.indexOf(q) !== -1;
        item.classList.toggle("hidden", !match);
        if (match) visibleCount++;
        var trigger = item.querySelector(".accordion-trigger");
        var panel = trigger ? document.getElementById(trigger.getAttribute("aria-controls")) : null;
        if (trigger && panel && q) {
          trigger.setAttribute("aria-expanded", match ? "true" : "false");
          panel.style.maxHeight = match ? panel.scrollHeight + "px" : "0px";
        }
      });
      if (noResults) noResults.classList.toggle("hidden", visibleCount !== 0);
    });
  }

  /* ------------------------------------------------------------------
     404 search box
     ------------------------------------------------------------------ */
  function init404Search() {
    var form = document.getElementById("notfound-search");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = document.getElementById("notfound-query").value.trim();
      window.location.href = "subjects.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initDirection();
    initHeaderScroll();
    initMobileMenu();
    initNavDropdown();
    initAccordions();
    initScrollReveals();
    initCounters();
    initGradeAccordion();
    initHorizontalScrollStrips();
    initTutorModal();
    initTutorFilter();
    initSubjectFilter();
    initTilt();
    initQuickMatch();
    initTestimonialSwitcher();
    initLightbox();
    initTrialForm();
    initContactForm();
    initLogin();
    initFaqSearch();
    init404Search();
  });
})();
