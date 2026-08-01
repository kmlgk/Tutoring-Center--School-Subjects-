/* ==========================================================================
   Brightpath Tutoring Center — Parent/Student Dashboard
   Mock data + rendering logic (dashboard.html only)
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Mock data — two children on one demo parent account
     ------------------------------------------------------------------ */
  var DASHBOARD_DATA = {
    aarav: {
      name: "Aarav Nair",
      grade: "Grade 8 · Middle School",
      classes: [
        { subject: "Algebra II", tutor: "Rohan Mehta", schedule: "Tue & Thu · 4:30 PM", mode: "Online" },
        { subject: "Physical Science", tutor: "Kavya Reddy", schedule: "Mon & Wed · 5:30 PM", mode: "In-person" },
        { subject: "English Literature", tutor: "Daniel Cross", schedule: "Fri · 4:00 PM", mode: "Online" },
        { subject: "Coding (Python)", tutor: "Aditya Rao", schedule: "Sat · 11:00 AM", mode: "In-person" }
      ],
      attendance: [
        { date: "2026-07-28", subject: "Algebra II", status: "Present" },
        { date: "2026-07-24", subject: "Physical Science", status: "Present" },
        { date: "2026-07-21", subject: "Algebra II", status: "Late" },
        { date: "2026-07-18", subject: "Coding (Python)", status: "Present" },
        { date: "2026-07-17", subject: "Physical Science", status: "Absent" },
        { date: "2026-07-14", subject: "Algebra II", status: "Present" },
        { date: "2026-07-11", subject: "English Literature", status: "Present" },
        { date: "2026-06-30", subject: "English Literature", status: "Present" },
        { date: "2026-06-26", subject: "Physical Science", status: "Present" },
        { date: "2026-06-23", subject: "Algebra II", status: "Present" }
      ],
      homework: [
        { id: "aar-hw-1", title: "Quadratic Equations Worksheet", subject: "Algebra II", due: "2026-08-03", description: "Complete problems 1–20 on factoring and the quadratic formula." },
        { id: "aar-hw-2", title: "Newton's Laws Lab Report", subject: "Physical Science", due: "2026-08-05", description: "Write up observations from the friction experiment, include a force diagram." },
        { id: "aar-hw-3", title: "Essay: Symbolism in To Kill a Mockingbird", subject: "English Literature", due: "2026-08-01", description: "750-word essay on the mockingbird motif, due before Friday's session." },
        { id: "aar-hw-4", title: "Python Loops Practice Set", subject: "Coding (Python)", due: "2026-08-07", description: "Finish exercises 5–12 on for-loops and while-loops in the shared notebook." }
      ],
      tests: [
        { subject: "Algebra II", title: "Unit Test — Quadratic Functions", date: "2026-08-10", syllabus: "Chapters 5–6: factoring, quadratic formula, graphing parabolas." },
        { subject: "Physical Science", title: "Midterm Exam", date: "2026-08-15", syllabus: "Motion, forces, energy and simple machines." },
        { subject: "Coding (Python)", title: "Skills Assessment", date: "2026-08-20", syllabus: "Python fundamentals, loops, and functions." }
      ]
    },
    ananya: {
      name: "Ananya Nair",
      grade: "Grade 5 · Primary",
      classes: [
        { subject: "Primary Math", tutor: "Meera Joshi", schedule: "Mon & Wed · 4:00 PM", mode: "In-person" },
        { subject: "English & Grammar", tutor: "Daniel Cross", schedule: "Tue & Thu · 4:00 PM", mode: "Online" },
        { subject: "General Science", tutor: "Kavya Reddy", schedule: "Fri · 3:30 PM", mode: "In-person" }
      ],
      attendance: [
        { date: "2026-07-30", subject: "Primary Math", status: "Present" },
        { date: "2026-07-29", subject: "English & Grammar", status: "Present" },
        { date: "2026-07-25", subject: "General Science", status: "Present" },
        { date: "2026-07-23", subject: "Primary Math", status: "Present" },
        { date: "2026-07-22", subject: "English & Grammar", status: "Late" },
        { date: "2026-07-18", subject: "General Science", status: "Absent" },
        { date: "2026-07-16", subject: "Primary Math", status: "Present" },
        { date: "2026-06-27", subject: "Primary Math", status: "Present" },
        { date: "2026-06-25", subject: "General Science", status: "Present" }
      ],
      homework: [
        { id: "ana-hw-1", title: "Fractions Practice Sheet", subject: "Primary Math", due: "2026-08-02", description: "Complete the fraction addition and subtraction worksheet, questions 1–15." },
        { id: "ana-hw-2", title: "Reading Comprehension: The Secret Garden", subject: "English & Grammar", due: "2026-08-04", description: "Read chapters 3–4 and answer the comprehension questions." },
        { id: "ana-hw-3", title: "Plant Life Cycle Poster", subject: "General Science", due: "2026-08-06", description: "Draw and label the stages of a plant's life cycle on chart paper." }
      ],
      tests: [
        { subject: "Primary Math", title: "Chapter Test — Fractions & Decimals", date: "2026-08-09", syllabus: "Fractions, decimals, and simple word problems." },
        { subject: "English & Grammar", title: "Spelling & Grammar Assessment", date: "2026-08-13", syllabus: "Weekly spelling list 1–10 and parts of speech." }
      ]
    }
  };

  var currentStudent = "aarav";

  /* ------------------------------------------------------------------
     Guard is handled inline in dashboard.html (before paint). This
     module only runs the rendering once the DOM is ready.
     ------------------------------------------------------------------ */

  function fmtDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  function fmtMonth(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  function daysUntil(iso) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(iso + "T00:00:00");
    var diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  }
  function countdownLabel(iso) {
    var diff = daysUntil(iso);
    if (diff < 0) return "completed";
    if (diff === 0) return "today";
    if (diff === 1) return "in 1 day";
    return "in " + diff + " days";
  }

  function homeworkStorageKey(studentKey) {
    return "bp_homework_" + studentKey;
  }
  function getDoneMap(studentKey) {
    try {
      return JSON.parse(localStorage.getItem(homeworkStorageKey(studentKey)) || "{}");
    } catch (e) {
      return {};
    }
  }
  function setDone(studentKey, hwId, done) {
    var map = getDoneMap(studentKey);
    map[hwId] = done;
    localStorage.setItem(homeworkStorageKey(studentKey), JSON.stringify(map));
  }

  /* ------------------------------------------------------------------
     Render: topbar + student switcher
     ------------------------------------------------------------------ */
  function renderTopbar() {
    var parentName = localStorage.getItem("bp_parent_name") || "Priya Nair";
    var welcome = document.querySelector("[data-welcome-name]");
    if (welcome) welcome.textContent = parentName.split(" ")[0];

    var switcher = document.querySelector("[data-student-switcher]");
    if (switcher) {
      switcher.value = currentStudent;
    }
  }

  /* ------------------------------------------------------------------
     Render: Overview panel
     ------------------------------------------------------------------ */
  function nextClass(student) {
    // Simplified: just surface the first class in the list as "next" for the demo.
    return student.classes[0];
  }

  function attendanceStats(student, monthOnly) {
    var now = new Date();
    var log = student.attendance;
    if (monthOnly) {
      log = log.filter(function (a) {
        var d = new Date(a.date + "T00:00:00");
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    var attended = log.filter(function (a) { return a.status === "Present" || a.status === "Late"; }).length;
    var total = log.length;
    var pct = total ? Math.round((attended / total) * 100) : 0;
    return { attended: attended, total: total, pct: pct };
  }

  function renderOverview(student) {
    var nc = nextClass(student);
    setText("[data-ov-next-subject]", nc.subject);
    setText("[data-ov-next-tutor]", "with " + nc.tutor);
    setText("[data-ov-next-time]", nc.schedule + " · " + nc.mode);

    var stats = attendanceStats(student, false);
    drawGauge(stats.pct);

    var doneMap = getDoneMap(currentStudent);
    var pending = student.homework.filter(function (h) { return !doneMap[h.id]; }).length;
    setText("[data-ov-homework-pending]", String(pending));

    var upcoming = student.tests.slice().sort(function (a, b) { return daysUntil(a.date) - daysUntil(b.date); })[0];
    if (upcoming) {
      setText("[data-ov-next-test-subject]", upcoming.subject);
      setText("[data-ov-next-test-countdown]", countdownLabel(upcoming.date));
    }
  }

  function setText(selector, text) {
    document.querySelectorAll(selector).forEach(function (el) { el.textContent = text; });
  }

  function drawGauge(pct) {
    var circle = document.querySelector("[data-gauge-circle]");
    var label = document.querySelector("[data-gauge-label]");
    if (!circle) return;
    var radius = circle.r.baseVal.value;
    var circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference + " " + circumference;
    var offset = circumference - (pct / 100) * circumference;
    requestAnimationFrame(function () {
      circle.style.strokeDashoffset = offset;
    });
    if (label) label.textContent = pct + "%";
  }

  /* ------------------------------------------------------------------
     Render: My Classes
     ------------------------------------------------------------------ */
  function renderClasses(student) {
    var container = document.querySelector("[data-classes-list]");
    if (!container) return;
    container.innerHTML = student.classes.map(function (c) {
      return (
        '<div class="folder-card p-5" style="--tab-color:#2F63B8" data-reveal="fade-up">' +
          '<span class="folder-tab-icon"><i class="fa-solid fa-book" aria-hidden="true"></i></span>' +
          '<div class="flex flex-wrap items-center justify-between gap-3">' +
            '<div>' +
              '<h3 class="font-display font-semibold text-lg text-ink dark:text-slate-100">' + c.subject + '</h3>' +
              '<p class="text-sm text-slate-600 dark:text-slate-400">Tutor: ' + c.tutor + '</p>' +
            '</div>' +
            '<div class="text-right rtl:text-left">' +
              '<p class="text-sm font-semibold text-primary-600 dark:text-primary-300">' + c.schedule + '</p>' +
              '<span class="inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ' +
                (c.mode === "Online" ? "bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-300" : "bg-secondary-50 text-secondary-700 dark:bg-slate-800 dark:text-secondary-300") +
                '">' + c.mode + '</span>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");
    initScrollRevealFor(container);
  }

  /* ------------------------------------------------------------------
     Render: Attendance
     ------------------------------------------------------------------ */
  function renderAttendance(student) {
    var container = document.querySelector("[data-attendance-list]");
    if (!container) return;

    var groups = {};
    student.attendance.forEach(function (a) {
      var key = fmtMonth(a.date);
      groups[key] = groups[key] || [];
      groups[key].push(a);
    });

    var statusStyles = {
      Present: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      Late: "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-300",
      Absent: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    };

    var html = "";
    Object.keys(groups).forEach(function (month) {
      var rows = groups[month];
      var monthStats = { attended: rows.filter(function (r) { return r.status !== "Absent"; }).length, total: rows.length };
      html += '<div class="mb-6" data-reveal="fade-up">';
      html += '<div class="flex items-center justify-between mb-2">';
      html += '<h3 class="font-display font-semibold text-ink dark:text-slate-100">' + month + '</h3>';
      html += '<span class="text-sm text-slate-500 dark:text-slate-400">' + monthStats.attended + ' of ' + monthStats.total + ' classes attended</span>';
      html += '</div>';
      html += '<div class="rounded-xl border border-slate-200 dark:border-ink-700 divide-y divide-slate-200 dark:divide-ink-700 overflow-hidden">';
      rows.forEach(function (r) {
        html += '<div class="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-ink-800">';
        html += '<div><p class="font-medium text-ink dark:text-slate-100">' + r.subject + '</p><p class="text-xs text-slate-500 dark:text-slate-400">' + fmtDate(r.date) + '</p></div>';
        html += '<span class="text-xs font-semibold px-2.5 py-1 rounded-full ' + statusStyles[r.status] + '">' + r.status + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
    initScrollRevealFor(container);
  }

  /* ------------------------------------------------------------------
     Render: Homework
     ------------------------------------------------------------------ */
  function renderHomework(student) {
    var container = document.querySelector("[data-homework-list]");
    if (!container) return;
    var doneMap = getDoneMap(currentStudent);

    container.innerHTML = student.homework.map(function (h) {
      var done = !!doneMap[h.id];
      return (
        '<div class="folder-card p-5 ' + (done ? "opacity-70" : "") + '" style="--tab-color:#E8A33D" data-reveal="fade-up">' +
          '<span class="folder-tab-icon"><i class="fa-solid fa-pencil" aria-hidden="true"></i></span>' +
          '<div class="flex items-start gap-4">' +
            '<label class="flex items-center gap-2 mt-1 cursor-pointer select-none">' +
              '<input type="checkbox" data-hw-checkbox data-hw-id="' + h.id + '" ' + (done ? "checked" : "") + ' class="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" aria-label="Mark ' + h.title + ' as done">' +
            '</label>' +
            '<div class="flex-1">' +
              '<div class="flex flex-wrap items-center justify-between gap-2">' +
                '<h3 class="font-display font-semibold text-ink dark:text-slate-100 ' + (done ? "line-through" : "") + '">' + h.title + '</h3>' +
                '<span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-300">' + h.subject + '</span>' +
              '</div>' +
              '<p class="text-sm text-slate-600 dark:text-slate-400 mt-1">' + h.description + '</p>' +
              '<p class="text-xs font-semibold text-secondary-700 dark:text-secondary-400 mt-2">Due ' + fmtDate(h.due) + '</p>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    container.querySelectorAll("[data-hw-checkbox]").forEach(function (box) {
      box.addEventListener("change", function () {
        setDone(currentStudent, box.getAttribute("data-hw-id"), box.checked);
        renderHomework(DASHBOARD_DATA[currentStudent]);
        renderOverview(DASHBOARD_DATA[currentStudent]);
      });
    });
    initScrollRevealFor(container);
  }

  /* ------------------------------------------------------------------
     Render: Test Schedule
     ------------------------------------------------------------------ */
  function renderTests(student) {
    var container = document.querySelector("[data-tests-list]");
    if (!container) return;
    container.innerHTML = student.tests.map(function (t) {
      return (
        '<div class="folder-card p-5" style="--tab-color:#2F63B8" data-reveal="fade-up">' +
          '<span class="folder-tab-icon"><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i></span>' +
          '<div class="flex flex-wrap items-start justify-between gap-3">' +
            '<div>' +
              '<h3 class="font-display font-semibold text-ink dark:text-slate-100">' + t.title + '</h3>' +
              '<p class="text-sm text-primary-700 dark:text-primary-300 font-medium">' + t.subject + '</p>' +
              '<p class="text-sm text-slate-600 dark:text-slate-400 mt-2">' + t.syllabus + '</p>' +
            '</div>' +
            '<div class="text-right rtl:text-left shrink-0">' +
              '<p class="text-sm font-semibold text-ink dark:text-slate-100">' + fmtDate(t.date) + '</p>' +
              '<span class="inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-300">' + countdownLabel(t.date) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");
    initScrollRevealFor(container);
  }

  /* ------------------------------------------------------------------
     Re-init scroll reveal for dynamically injected nodes
     ------------------------------------------------------------------ */
  function initScrollRevealFor(container) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var items = container.querySelectorAll("[data-reveal]");
    if (reduced) {
      items.forEach(function (el) { el.classList.add("reveal-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Full render pass for the active student
     ------------------------------------------------------------------ */
  function renderAll() {
    var student = DASHBOARD_DATA[currentStudent];
    document.querySelectorAll("[data-active-student-name]").forEach(function (el) { el.textContent = student.name; });
    document.querySelectorAll("[data-active-student-grade]").forEach(function (el) { el.textContent = student.grade; });
    renderTopbar();
    renderOverview(student);
    renderClasses(student);
    renderAttendance(student);
    renderHomework(student);
    renderTests(student);
  }

  /* ------------------------------------------------------------------
     Student switcher
     ------------------------------------------------------------------ */
  function initStudentSwitcher() {
    var switcher = document.querySelector("[data-student-switcher]");
    if (!switcher) return;
    switcher.addEventListener("change", function () {
      currentStudent = switcher.value;
      renderAll();
    });
  }

  /* ------------------------------------------------------------------
     Sidebar (mobile off-canvas)
     ------------------------------------------------------------------ */
  function initSidebar() {
    var toggle = document.querySelector("[data-sidebar-toggle]");
    var sidebar = document.getElementById("dash-sidebar");
    var backdrop = document.querySelector("[data-sidebar-backdrop]");
    if (!toggle || !sidebar) return;
    function open() {
      sidebar.classList.add("sidebar-open");
      if (backdrop) backdrop.classList.remove("hidden");
    }
    function close() {
      sidebar.classList.remove("sidebar-open");
      if (backdrop) backdrop.classList.add("hidden");
    }
    toggle.addEventListener("click", function () {
      sidebar.classList.contains("sidebar-open") ? close() : open();
    });
    if (backdrop) backdrop.addEventListener("click", close);
    sidebar.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth < 1024) close();
      });
    });
  }

  /* ------------------------------------------------------------------
     Active-section highlighting via IntersectionObserver
     ------------------------------------------------------------------ */
  function initSectionSpy() {
    var links = document.querySelectorAll("[data-dash-nav-link]");
    if (!links.length) return;
    var sections = Array.prototype.map.call(links, function (link) {
      return document.querySelector(link.getAttribute("href"));
    }).filter(Boolean);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = "#" + entry.target.id;
          links.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ------------------------------------------------------------------
     Logout
     ------------------------------------------------------------------ */
  function initLogout() {
    document.querySelectorAll("[data-logout]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        localStorage.removeItem("bp_auth");
        window.location.replace("login.html");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    initStudentSwitcher();
    initSidebar();
    initSectionSpy();
    initLogout();
  });
})();
