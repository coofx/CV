(() => {
  const state = { lang: 'ru', allExpanded: false };
  const $ = (selector) => document.querySelector(selector);
  const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const safeUrl = (value = '') => /^https?:\/\//i.test(value) ? escapeHTML(value) : '#';
  const contact = (link) => `<a href="${safeUrl(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label)}</a>`;

  function renderHeader(data) {
    $('#cv-header').innerHTML = `
      <h1 class="name">${escapeHTML(data.name)}</h1>
      <p class="role">${escapeHTML(data.role)}</p>
      <p class="loc">${escapeHTML(data.location)}</p>
      <p class="links">${contact(data.portfolioLink)}<span class="dot">•</span>${contact(data.telegramLink)}<span class="dot">•</span>${contact(data.casesLink)}</p>
      <div class="intro">${data.intro.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('')}</div>`;
  }

  function renderJob(job) {
    const company = job.companyUrl
      ? `<a href="${safeUrl(job.companyUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(job.company)}</a>`
      : escapeHTML(job.company);
    const caseLink = job.caseLink
      ? `<p class="case-link"><a href="${safeUrl(job.caseLink.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(job.caseLink.text)}</a></p>`
      : '';
    const paragraphs = (job.descriptionParagraphs || []).map((text) => `<p>${escapeHTML(text)}</p>`).join('');
    const bullets = (job.bulletPoints || []).length
      ? `<ul>${job.bulletPoints.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul>`
      : '';
    const projects = (job.subProjects || []).map((project) => `
      <div class="subproject">
        <p class="subproject-title"><strong>${escapeHTML(project.name)}</strong></p>
        ${project.description ? `<p>${escapeHTML(project.description)}</p>` : ''}
        ${(project.bullets || []).length ? `<ul>${project.bullets.map((text) => `<li>${escapeHTML(text)}</li>`).join('')}</ul>` : ''}
      </div>`).join('');

    return `<section id="job-${escapeHTML(job.id)}" class="job" data-company="${escapeHTML(job.company)}">
      <div class="job-meta"><span class="job-company">${company}</span><span class="job-dates">${escapeHTML(job.period)}</span></div>
      ${job.locationAndType ? `<p class="job-sub">${escapeHTML(job.locationAndType)}</p>` : ''}
      <div class="job-head"><p class="job-title">${escapeHTML(job.title)}</p>${caseLink}</div>
      <details ${state.allExpanded ? 'open' : ''}>
        <summary><span>${escapeHTML(job.summaryLabel || (state.lang === 'ru' ? 'Задача и процесс' : 'Tasks & Process'))}</span>
          <svg class="summary-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1L5 5L9 1" /></svg>
        </summary>
        <div class="job-body">${paragraphs}${bullets}${projects}</div>
      </details>
    </section>`;
  }

  function renderMain(data) {
    $('#cv-main').innerHTML = `
      <div class="experience-header">
        <h2>${escapeHTML(data.experienceTitle)}</h2>
        <button id="toggle-all-jobs" type="button" class="expand-toggle">${escapeHTML(state.allExpanded ? data.collapseAllText : data.expandAllText)}</button>
      </div>
      <div class="timeline">${data.jobs.map(renderJob).join('')}</div>
      <section id="cv-courses" class="courses"><h2>${escapeHTML(data.coursesTitle)}</h2>
        <ul>${data.courses.map((course) => `<li class="course-item"><span class="course-title">${escapeHTML(course.title)}</span><span class="course-meta">${course.year ? `${escapeHTML(course.year)} · ` : ''}${escapeHTML(course.provider)}</span></li>`).join('')}</ul>
      </section>`;
    $('#toggle-all-jobs').addEventListener('click', () => {
      state.allExpanded = !state.allExpanded;
      renderMain(data);
    });
  }

  function renderSidebar(data) {
    const languages = data.languages.map((language) => `<div class="lang"><strong>${escapeHTML(language.language)} – ${escapeHTML(language.level)}</strong>${escapeHTML(language.description)}</div>`).join('');
    const groups = data.skillGroups.map((group) => `<div class="skillgroup"><h3>${escapeHTML(group.title)}</h3>${group.items?.length
      ? `<ul class="skill-list">${group.items.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`
      : `<p>${escapeHTML(group.skills || '')}</p>`}</div>`).join('');
    const preferences = data.workPreferences?.length ? `<div class="pref-group">
      ${data.workPreferencesTitle ? `<h3 style="font-size:var(--fs-sm);font-weight:500;margin:0 0 10px;color:var(--ink)">${escapeHTML(data.workPreferencesTitle)}</h3>` : ''}
      ${data.workPreferences.map((item) => `<div class="pref-item"><p class="pref-title">${escapeHTML(item.title)}</p><p class="pref-val">${escapeHTML(item.value)}</p></div>`).join('')}
    </div>` : '';
    $('#cv-sidebar').innerHTML = `<h2>${escapeHTML(data.skillsTitle)}</h2>${languages}${groups}${preferences}`;
  }

  function renderFooter(data) {
    $('#cv-footer').innerHTML = `<p class="links">${contact(data.portfolioLink)}<span class="dot"> · </span>${contact(data.telegramLink)}<span class="dot"> · </span>${contact(data.casesLink)}</p><p style="margin:8px 0 0;opacity:.8">${escapeHTML(data.footerNote)}</p>`;
  }

  function render() {
    const data = window.CV_DATA[state.lang];
    document.documentElement.lang = state.lang;
    document.title = `${data.name} – CV / ${state.lang === 'ru' ? 'Резюме' : 'Resume'}`;
    $('#lang-btn-ru').classList.toggle('is-active', state.lang === 'ru');
    $('#lang-btn-en').classList.toggle('is-active', state.lang === 'en');
    $('.langswitch').setAttribute('aria-label', state.lang === 'ru' ? 'Выбор языка' : 'Language selection');
    $('#pdfBtn').textContent = state.lang === 'ru' ? 'Сохранить PDF' : 'Save PDF';
    $('#pdfBtn').setAttribute('aria-label', state.lang === 'ru' ? 'Сохранить резюме в формате PDF' : 'Save resume as PDF');
    renderHeader(data);
    renderMain(data);
    renderSidebar(data);
    renderFooter(data);
  }

  $('#lang-btn-ru').addEventListener('click', () => { state.lang = 'ru'; render(); });
  $('#lang-btn-en').addEventListener('click', () => { state.lang = 'en'; render(); });
  $('#pdfBtn').addEventListener('click', () => window.print());

  let collapsedBeforePrint = [];
  window.addEventListener('beforeprint', () => {
    collapsedBeforePrint = [...document.querySelectorAll('details:not([open])')];
    collapsedBeforePrint.forEach((item) => { item.open = true; });
  });
  window.addEventListener('afterprint', () => {
    collapsedBeforePrint.forEach((item) => { item.open = false; });
    collapsedBeforePrint = [];
  });

  render();
})();
