(function () {
  const CHEVRON = `
    <svg class="summary-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M1 1L5 5L9 1" />
    </svg>
  `;

  const state = {
    lang: localStorage.getItem("cv-lang") === "en" ? "en" : "ru",
    allExpanded: false,
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function data() {
    return state.lang === "en" ? cvDataEn : cvDataRu;
  }

  function renderJob(job) {
    const company = job.companyUrl
      ? `<a href="${escapeHtml(job.companyUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(job.company)}</a>`
      : escapeHtml(job.company);

    const caseLink = job.caseLink
      ? `<p class="case-link"><a href="${escapeHtml(job.caseLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(job.caseLink.text)}</a></p>`
      : "";

    const location = job.locationAndType
      ? `<p class="job-sub">${escapeHtml(job.locationAndType)}</p>`
      : "";

    const highlight = job.highlight
      ? `<p><strong>${escapeHtml(job.highlight)}</strong></p>`
      : "";

    const paragraphs = (job.descriptionParagraphs || [])
      .map((para) => `<p>${escapeHtml(para)}</p>`)
      .join("");

    const bullets =
      job.bulletPoints && job.bulletPoints.length
        ? `<ul>${job.bulletPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : "";

    const subProjects = (job.subProjects || [])
      .map((sub) => {
        const subBullets = sub.bullets
          ? `<ul>${sub.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
          : "";
        const description = sub.description ? `<p>${escapeHtml(sub.description)}</p>` : "";
        return `
          <div class="subproject">
            <p class="subproject-title"><strong>${escapeHtml(sub.name)}</strong></p>
            ${description}
            ${subBullets}
          </div>
        `;
      })
      .join("");

    return `
      <section id="job-${escapeHtml(job.id)}" class="job" data-company="${escapeHtml(job.company)}">
        <div class="job-meta">
          <span class="job-company">${company}</span>
          <span class="job-dates">${escapeHtml(job.period)}</span>
        </div>
        ${location}
        <div class="job-head">
          <p class="job-title">${escapeHtml(job.title)}</p>
          ${caseLink}
        </div>
        <details ${state.allExpanded ? "open" : ""}>
          <summary>
            <span>${escapeHtml(job.summaryLabel || "Задача и процесс")}</span>
            ${CHEVRON}
          </summary>
          <div class="job-body">
            ${highlight}
            ${paragraphs}
            ${bullets}
            ${subProjects}
          </div>
        </details>
      </section>
    `;
  }

  function render(cv) {
    const jobs = cv.jobs.map(renderJob).join("");
    const courses = cv.courses
      .map((course) => {
        const meta = `${course.year ? `${course.year} · ` : ""}${course.provider}`;
        return `
          <li class="course-item">
            <span class="course-title">${escapeHtml(course.title)}</span>
            <span class="course-meta">${escapeHtml(meta)}</span>
          </li>
        `;
      })
      .join("");

    const languages = cv.languages
      .map(
        (item) => `
          <div class="lang">
            <strong>${escapeHtml(item.language)} – ${escapeHtml(item.level)}</strong>
            ${escapeHtml(item.description)}
          </div>
        `
      )
      .join("");

    const skillGroups = cv.skillGroups
      .map((group) => {
        const body =
          group.items && group.items.length
            ? `<ul class="skill-list">${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p>${escapeHtml(group.skills || "")}</p>`;
        return `
          <div class="skillgroup">
            <h3>${escapeHtml(group.title)}</h3>
            ${body}
          </div>
        `;
      })
      .join("");

    const prefs =
      cv.workPreferences && cv.workPreferences.length
        ? `
          <div class="pref-group">
            ${cv.workPreferencesTitle ? `<h3>${escapeHtml(cv.workPreferencesTitle)}</h3>` : ""}
            ${cv.workPreferences
              .map(
                (pref) => `
                  <div class="pref-item">
                    <p class="pref-title">${escapeHtml(pref.title)}</p>
                    <p class="pref-val">${escapeHtml(pref.value)}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        `
        : "";

    const intro = cv.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    const pdfUrl =
      cv.pdfUrl ||
      "https://github.com/coofx/CV/blob/main/%D0%A4%D1%80%D0%B5%D0%B8%CC%86%D0%BC%D0%BE%D0%B2%20%D0%98%D0%B3%D0%BE%D1%80%D1%8C%20%D0%90%D0%BD%D0%B0%D1%82%D0%BE%D0%BB%D1%8C%D0%B5%D0%B2%D0%B8%D1%87%20(1).pdf";

    document.documentElement.lang = cv.lang;
    document.title = cv.lang === "ru" ? "Игорь Невский – CV / Резюме" : "Igor Nevskiy – CV / Resume";

    document.getElementById("cv-app").innerHTML = `
      <div id="cv-toolbar" class="toolbar">
        <div class="wrap">
          <div class="toolbar-left">
            <a id="portfolio-back-link" class="back" href="${escapeHtml(cv.portfolioLink.url)}" target="_blank" rel="noopener noreferrer">
              ← ${escapeHtml(cv.portfolioLink.label)}
            </a>
            <nav class="langswitch" aria-label="${cv.lang === "ru" ? "Выбор языка" : "Language selection"}">
              <button id="lang-btn-en" type="button" class="${state.lang === "en" ? "is-active" : ""}">EN</button>
              <button id="lang-btn-ru" type="button" class="${state.lang === "ru" ? "is-active" : ""}">RU</button>
            </nav>
          </div>
          <div class="actions">
            <button id="printBtn" class="btn" type="button" aria-label="${cv.lang === "ru" ? "Распечатать резюме" : "Print resume"}">
              ${cv.lang === "ru" ? "Распечатать" : "Print"}
            </button>
            <a id="pdfBtn" class="btn btn-primary" href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${cv.lang === "ru" ? "Скачать резюме в формате PDF" : "Download resume in PDF format"}">
              ${cv.lang === "ru" ? "Скачать PDF" : "Download PDF"}
            </a>
          </div>
        </div>
      </div>

      <div class="wrap">
        <header id="cv-header" class="cv-head">
          <h1 class="name">${escapeHtml(cv.name)}</h1>
          <p class="role">${escapeHtml(cv.role)}</p>
          <p class="loc">${escapeHtml(cv.location)}</p>
          <p class="links">
            <a id="contact-portfolio" href="${escapeHtml(cv.portfolioLink.url)}" data-link="portfolio" target="_blank" rel="noopener noreferrer">${escapeHtml(cv.portfolioLink.label)}</a>
            <span class="dot">•</span>
            <a id="contact-telegram" href="${escapeHtml(cv.telegramLink.url)}" data-link="telegram" target="_blank" rel="noopener noreferrer">${escapeHtml(cv.telegramLink.label)}</a>
            <span class="dot">•</span>
            <a id="contact-cases" href="${escapeHtml(cv.casesLink.url)}" data-link="cases" target="_blank" rel="noopener noreferrer">${escapeHtml(cv.casesLink.label)}</a>
          </p>
          <div class="intro">${intro}</div>
        </header>

        <div class="grid">
          <main id="cv-main">
            <div class="experience-header">
              <h2>${escapeHtml(cv.experienceTitle)}</h2>
              <button id="toggle-all-jobs" type="button" class="expand-toggle">
                ${escapeHtml(state.allExpanded ? cv.collapseAllText : cv.expandAllText)}
              </button>
            </div>
            <div class="timeline">${jobs}</div>
            <section id="cv-courses" class="courses">
              <h2>${escapeHtml(cv.coursesTitle)}</h2>
              <ul>${courses}</ul>
            </section>
          </main>
          <aside id="cv-sidebar">
            <h2>${escapeHtml(cv.skillsTitle)}</h2>
            ${languages}
            ${skillGroups}
            ${prefs}
          </aside>
        </div>

        <footer id="cv-footer">
          <p class="links">
            <a id="footer-portfolio" href="${escapeHtml(cv.portfolioLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cv.portfolioLink.label)}</a>
            <span class="dot"> · </span>
            <a id="footer-telegram" href="${escapeHtml(cv.telegramLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cv.telegramLink.label)}</a>
            <span class="dot"> · </span>
            <a id="footer-cases" href="${escapeHtml(cv.casesLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cv.casesLink.label)}</a>
          </p>
          <p class="footer-note">${escapeHtml(cv.footerNote)}</p>
        </footer>
      </div>
    `;

    bindEvents();
  }

  function openAllDetails() {
    document.querySelectorAll("details:not([open])").forEach((el) => {
      el.open = true;
    });
  }

  function bindEvents() {
    document.getElementById("lang-btn-en").addEventListener("click", () => setLang("en"));
    document.getElementById("lang-btn-ru").addEventListener("click", () => setLang("ru"));
    document.getElementById("printBtn").addEventListener("click", handlePrint);
    document.getElementById("toggle-all-jobs").addEventListener("click", toggleExpandAll);
  }

  function setLang(lang) {
    if (state.lang === lang) return;
    state.lang = lang;
    localStorage.setItem("cv-lang", lang);
    render(data());
  }

  function handlePrint() {
    openAllDetails();
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.warn("Print trigger error:", err);
    }
  }

  function toggleExpandAll() {
    state.allExpanded = !state.allExpanded;
    document.querySelectorAll("details").forEach((el) => {
      el.open = state.allExpanded;
    });
    const cv = data();
    document.getElementById("toggle-all-jobs").textContent = state.allExpanded
      ? cv.collapseAllText
      : cv.expandAllText;
  }

  function setupPrintHooks() {
    let reclose = [];

    window.addEventListener("beforeprint", () => {
      reclose = [];
      document.querySelectorAll("details:not([open])").forEach((el) => {
        reclose.push(el);
        el.open = true;
      });
    });

    window.addEventListener("afterprint", () => {
      reclose.forEach((el) => {
        el.open = false;
      });
      reclose = [];
    });
  }

  function setupToolbarScroll() {
    let lastY = window.scrollY;
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          const toolbar = document.getElementById("cv-toolbar");
          if (toolbar) {
            toolbar.classList.toggle("toolbar--hidden", y > lastY && y > 80);
          }
          lastY = y;
          ticking = false;
        });
        ticking = true;
      },
      { passive: true }
    );
  }

  render(data());
  setupPrintHooks();
  setupToolbarScroll();
})();
