/* Talda MVP: accounts, uploads, item bank with Gemini, AI memo. Runs on top of engine.js (analytics). */
var ME = null;
var LANG_UI = (() => { try { return localStorage.getItem('talda-lang') || 'ru'; } catch (e) { return 'ru'; } })();
const T_ = (ru, kz) => (LANG_UI === 'kz' ? kz : ru);
const LABELS = {
  overview: ['Обзор', 'Шолу'], topics: ['Сложные темы', 'Күрделі тақырыптар'], textbooks: ['Учебники', 'Оқулықтар'],
  language: ['Языковой разрыв', 'Тілдік алшақтық'], roots: ['Корневые причины', 'Түпкі себептер'], hours: ['Учебные часы', 'Оқу сағаттары'],
  issues: ['Замечания', 'Ескертулер'], data: ['Данные', 'Деректер'], upload: ['Загрузка результатов', 'Нәтижелерді жүктеу'],
  items: ['Банк заданий', 'Тапсырмалар банкі'], schools: ['Школы и учителя', 'Мектептер мен мұғалімдер'],
};
const label = id => T_(...LABELS[id]);

/* ---------- API ---------- */
async function API(path, opts = {}) {
  const r = await fetch(path, { credentials: 'same-origin', ...opts });
  const ct = r.headers.get('content-type') || '';
  const body = ct.includes('json') ? await r.json() : await r.text();
  if (r.status === 401 && path !== '/api/login') { ME = null; render(); throw new Error(T_('Нужно войти', 'Кіру қажет')); }
  if (!r.ok) throw new Error((body && body.detail) ? (typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)) : String(body || r.statusText));
  return body;
}
const jpost = (p, data) => API(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

/* ---------- shared helpers (toast, copy) ---------- */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); }
function copyText(text) {
  const fallback = () => { const ta = document.createElement('textarea'); ta.value = text; document.querySelector('main').appendChild(ta); ta.select(); toast(T_('Текст выделен — нажмите Ctrl+C', 'Мәтін белгіленді — Ctrl+C басыңыз')); };
  try { navigator.clipboard.writeText(text).then(() => toast(T_('Скопировано', 'Көшірілді')), fallback); } catch (e) { fallback(); }
}
function issuesText() {
  return `Talda — замечания к учебной программе (${A.S.length} школ, ${A.nStu} учеников)\n\n` + A.issues.map((it, i) => `${i + 1}. [${SEV[it.sev]}] ${it.title}\n${it.body.map(b => '   • ' + b).join('\n')}\n   Что сделать: ${it.action}\n   Кому: ${it.who}${it.reach ? '; затрагивает: ' + it.reach : ''}`).join('\n\n');
}
function fullCSV(ds) {
  const out = ['student_id,school_id,district,area,small,lang,textbook,prev_score,topic_id,topic_hours,item_id,option'], R = ds.resp;
  for (let i = 0; i < R.n; i++) {
    const st = ds.students[R.stu[i]], s = ds.schools[st.s], it = ds.items[R.item[i]], t = ds.topics[it.t];
    out.push([`D${ds.seed}-${st.id}`, `D${ds.seed}-${s.id}`, s.district, s.area, s.small ? 1 : 0, s.lang, s.tb, s.prev, t.id, s.hours[t.id] || t.h, it.id, R.opt[i]].join(','));
  }
  return out.join('\n');
}

/* ---------- navigation (overrides engine.js) ---------- */
function allowedViews() {
  if (!ME) return [];
  const analytics = A ? (ME.role === 'methodologist' ? ['overview', 'topics', 'textbooks', 'language', 'roots', 'hours', 'issues', 'data'] : ['overview', 'topics', 'roots', 'issues']) : [];
  return [...analytics, 'upload', 'items', ...(ME.role === 'methodologist' ? ['schools'] : [])];
}
function view() { const h = location.hash.slice(1), al = allowedViews(); return al.includes(h) ? h : al[0]; }
function nav() {
  const cur = view(), nHigh = A ? A.issues.filter(i => i.sev !== 'low').length : 0;
  $('#nav').innerHTML = allowedViews().map(id => `<a href="#${id}" class="${id === cur ? 'on' : ''}">${label(id)}${id === 'issues' && nHigh ? `<span class="cnt">${nHigh}</span>` : ''}</a>`).join('');
  const school = ME.school ? `${esc(ME.school.name)} · ${esc(ME.school.district)}` : T_('Вся область', 'Бүкіл облыс');
  $('#srcBadge').innerHTML = `<strong>${esc(ME.name)}</strong><br>${ME.role === 'methodologist' ? T_('Методист', 'Әдіскер') : T_('Учитель', 'Мұғалім')} · ${school}<br>
    ${A ? `${A.S.length} ${T_('школ', 'мектеп')} · ${A.nStu} ${T_('учеников', 'оқушы')}` : T_('Данных пока нет', 'Әзірге деректер жоқ')}
    <div class="row" style="margin-top:8px"><button class="btn small" data-act="lang">${LANG_UI === 'kz' ? 'Русский' : 'Қазақша'}</button><button class="btn small" data-act="logout">${T_('Выйти', 'Шығу')}</button></div>`;
}
function render() {
  if (!ME) { $('#nav').innerHTML = ''; $('#srcBadge').innerHTML = ''; $('#view').innerHTML = R.login(); return; }
  nav(); const v = view(); $('#view').innerHTML = R[v](); if (AFTER[v]) AFTER[v]();
}

/* ---------- login ---------- */
R.login = () => `
  <div class="head"><span class="eyebrow">Talda</span><h1>${T_('Вход для методистов и учителей', 'Әдіскерлер мен мұғалімдерге кіру')}</h1>
  <p class="lede">${T_('Данные о результатах учеников видны только авторизованным сотрудникам. Учитель видит свою школу, методист — всю область.', 'Оқушылар нәтижелерін тек авторизацияланған қызметкерлер көреді. Мұғалім өз мектебін, әдіскер бүкіл облысты көреді.')}</p></div>
  <form class="card" id="loginForm" style="max-width:420px">
    <label class="fld"><span>${T_('Логин', 'Логин')}</span><input type="text" id="lg-login" autocomplete="username" required></label>
    <label class="fld"><span>${T_('Пароль', 'Құпиясөз')}</span><input type="password" id="lg-pass" autocomplete="current-password" required></label>
    <div class="row"><button class="btn primary" type="submit">${T_('Войти', 'Кіру')}</button><button class="btn" type="button" data-act="lang">${LANG_UI === 'kz' ? 'Русский' : 'Қазақша'}</button></div>
    <p class="small no" id="lg-err"></p>
  </form>`;

/* ---------- upload ---------- */
R.upload = () => {
  const m = ME.role === 'methodologist';
  return `
  <div class="head"><span class="eyebrow">${T_('Данные', 'Деректер')}</span><h1>${label('upload')}</h1>
  <p class="lede">${m ? T_('Загрузите выгрузку результатов по области (CSV или Excel) или демо-выборку для презентации.', 'Облыс бойынша нәтижелерді (CSV немесе Excel) немесе таныстыруға арналған демо-деректерді жүктеңіз.')
      : T_('Загрузите результаты класса: одна строка — один ученик, по колонке на каждое задание. В ячейке — буква выбранного ответа.', 'Сынып нәтижелерін жүктеңіз: бір жол — бір оқушы, әр тапсырмаға бір баған. Ұяшықта — таңдалған жауаптың әрпі.')}</p></div>
  <section class="grid2">
    <div class="card"><h2>${T_('Файл с результатами', 'Нәтижелер файлы')}</h2>
      <input type="file" id="upFile" accept=".csv,.xlsx,text/csv">
      <div class="row"><button class="btn primary" data-act="upload">${T_('Загрузить', 'Жүктеу')}</button></div>
      <p class="small" id="upMsg"></p>
      <p class="note">${m ? T_('Полный формат: ', 'Толық формат: ') + '<span class="ex">student_id, school_id, district, area, small, lang, textbook, prev_score, topic_id, topic_hours, item_id, option</span>'
        : T_('Формат класса: ', 'Сынып форматы: ') + '<span class="ex">student_id, T1.1, T1.2, … T12.3</span>. ' + T_('Ответ: буква A–D. Для базовых заданий T*.1–T*.3: A — верно, B–D — типичные ошибки 1–3. Для заданий из банка буквы переводятся по их разметке.', 'Жауап: A–D әрпі. T*.1–T*.3 базалық тапсырмалары үшін: A — дұрыс, B–D — 1–3 қателер.')}</p>
      ${m ? '' : `<button class="btn" data-act="copyTemplate">${T_('Скопировать шаблон', 'Үлгіні көшіру')}</button>`}
    </div>
    ${m ? `<div class="card"><h2>${T_('Демо-выборка', 'Демо-деректер')}</h2>
      <p class="note">${T_('82 синтетические школы Жамбылской области, ~96 000 ответов. В данные вшиты закономерности, которые система должна найти сама (проверка — во вкладке «Данные»).', 'Жамбыл облысының 82 синтетикалық мектебі, ~96 000 жауап.')}</p>
      <div class="row"><input type="number" id="seed" value="2026" aria-label="seed"><button class="btn" data-act="demo">${T_('Загрузить демо', 'Демо жүктеу')}</button></div></div>` : ''}
  </section>
  <section class="card"><h2>${T_('История загрузок', 'Жүктеу тарихы')}</h2><div class="scroll" id="upList"><p class="muted">…</p></div></section>`;
};
AFTER.upload = async () => {
  try {
    const ups = await API('/api/uploads'); if (!$('#upList')) return;
    $('#upList').innerHTML = ups.length ? `<table><thead><tr><th>${T_('Файл', 'Файл')}</th><th>${T_('Автор', 'Автор')}</th><th class="n">${T_('Ответов', 'Жауаптар')}</th><th class="n">${T_('Учеников', 'Оқушылар')}</th><th class="n">${T_('Школ', 'Мектептер')}</th><th>${T_('Дата', 'Күні')}</th><th></th></tr></thead><tbody>
      ${ups.map(u => `<tr><td>${esc(u.filename)}${u.is_demo ? ' <span class="pill sev-low">demo</span>' : ''}</td><td>${esc(u.author)}</td><td class="n">${u.n_rows.toLocaleString('ru')}</td><td class="n">${u.students}</td><td class="n">${u.schools}</td><td class="small">${new Date(u.created * 1000).toLocaleString('ru')}</td>
      <td><button class="btn small" data-del="${u.id}">${T_('Удалить', 'Жою')}</button></td></tr>`).join('')}</tbody></table>`
      : `<p class="muted">${T_('Загрузок пока нет.', 'Әзірге жүктеулер жоқ.')}</p>`;
  } catch (e) { if ($('#upList')) $('#upList').textContent = e.message; }
};
async function sendFile(file, name) {
  const fd = new FormData(); fd.append('file', file, name || file.name);
  return API('/api/upload', { method: 'POST', body: fd });
}

/* ---------- item bank with Gemini ---------- */
var ITEM_DRAFT = null;
const topicsList = () => (DS ? DS.topics : buildTopics());
R.items = () => {
  const ts = topicsList();
  return `
  <div class="head"><span class="eyebrow">${T_('Диагностические задания', 'Диагностикалық тапсырмалар')}</span><h1>${label('items')}</h1>
  <p class="lede">${T_('Каждый неверный вариант ответа должен указывать на конкретную ошибку. ИИ (Gemini) размечает новое задание за секунды: определяет тему, связывает варианты с ошибками и проверяет корректность. Методист проверяет и сохраняет.', 'Әр қате жауап нақты қатеге сілтеуі керек. ЖИ (Gemini) жаңа тапсырманы бірнеше секундта белгілейді, әдіскер тексеріп сақтайды.')}</p></div>
  <section class="card"><div class="row between"><h2>${T_('Новое задание', 'Жаңа тапсырма')}</h2><span class="small muted">${ME.ai.enabled ? 'Gemini: ' + esc(ME.ai.model) : T_('ИИ выключен — разметьте вручную', 'ЖИ өшірулі')}</span></div>
    <label class="fld"><span>${T_('Условие', 'Шарты')}</span><textarea id="it-stem" style="min-height:70px;font-family:var(--f-body)" placeholder="${T_('Например: Найдите угловой коэффициент прямой y = 2x + 5', 'Мысалы: y = 2x + 5 түзуінің бұрыштық коэффициентін табыңыз')}"></textarea></label>
    ${[0, 1, 2, 3].map(i => `<label class="fld opt"><input type="radio" name="it-correct" value="${i}" ${i === 0 ? 'checked' : ''} aria-label="${T_('верный', 'дұрыс')} ${'ABCD'[i]}"><b>${'ABCD'[i]}</b><input type="text" id="it-o${i}" style="width:100%"></label>`).join('')}
    <p class="note">${T_('Отметьте кружком верный вариант.', 'Дұрыс нұсқаны белгілеңіз.')}</p>
    <div class="row"><button class="btn primary" data-act="aiTag" ${ME.ai.enabled ? '' : 'disabled'}>${T_('Разметить с помощью ИИ', 'ЖИ көмегімен белгілеу')}</button><button class="btn" data-act="manualTag">${T_('Разметить вручную', 'Қолмен белгілеу')}</button></div>
    <div id="it-draft"></div></section>
  <section class="card"><h2>${T_('Задания в банке', 'Банктегі тапсырмалар')}</h2><div class="scroll" id="it-list"><p class="muted">…</p></div></section>`;
};
AFTER.items = async () => {
  try {
    const items = await API('/api/items'), ts = topicsList(); if (!$('#it-list')) return;
    $('#it-list').innerHTML = items.length ? `<table><thead><tr><th>ID</th><th>${T_('Тема', 'Тақырып')}</th><th>${T_('Условие', 'Шарты')}</th><th>${T_('Разметка вариантов', 'Нұсқалар')}</th></tr></thead><tbody>
      ${items.map(it => { const t = ts.find(x => x.id === it.topic_id); return `<tr><td class="num">${esc(it.id)}</td><td>${esc(t ? t.name : it.topic_id)}</td><td>${esc(it.stem)}</td>
      <td class="small">${it.options.map((o, i) => `<b>${'ABCD'[i]}</b> ${esc(o)} → ${it.mapping[i] === 0 ? '✓' : esc(t ? t.mis[it.mapping[i] - 1] : '#' + it.mapping[i])}`).join('<br>')}</td></tr>`; }).join('')}</tbody></table>`
      : `<p class="muted">${T_('Пока пусто. Добавленные задания получают ID вида T9.4 — используйте его как колонку в файле результатов.', 'Әзірге бос.')}</p>`;
  } catch (e) { if ($('#it-list')) $('#it-list').textContent = e.message; }
};
function readItemForm() {
  const stem = $('#it-stem').value.trim(), options = [0, 1, 2, 3].map(i => $('#it-o' + i).value.trim());
  const correct = +document.querySelector('input[name=it-correct]:checked').value;
  if (!stem || options.some(o => !o)) throw new Error(T_('Заполните условие и все 4 варианта', 'Шартты және 4 нұсқаны толтырыңыз'));
  return { stem, options, correct };
}
function showDraft(d) {
  ITEM_DRAFT = d; const ts = topicsList(), t = ts.find(x => x.id === d.topic_id) || ts[0];
  $('#it-draft').innerHTML = `<div class="card" style="background:var(--sunk)">
    <label class="fld"><span>${T_('Тема', 'Тақырып')}</span><select id="dr-topic">${ts.map(x => `<option value="${x.id}" ${x.id === t.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
    ${d.options.map((o, i) => i === d.correct ? `<div><b>${'ABCD'[i]}</b> ${esc(o)} — <span class="ok">${T_('верный', 'дұрыс')}</span></div>`
      : `<label class="fld"><span><b>${'ABCD'[i]}</b> ${esc(o)}${d.why && d.why[i] ? ` <span class="muted small">— ${esc(d.why[i])}</span>` : ''}</span><select id="dr-m${i}">${t.mis.map((m, k) => `<option value="${k + 1}" ${d.mapping[i] === k + 1 ? 'selected' : ''}>${k + 1}. ${esc(m)}</option>`).join('')}</select></label>`).join('')}
    ${d.warnings && d.warnings.length ? `<div class="act no">${T_('Замечания ИИ', 'ЖИ ескертулері')}: ${d.warnings.map(esc).join('; ')}</div>` : ''}
    ${d.explanation ? `<p class="note">${esc(d.explanation)}</p>` : ''}
    <div class="row"><button class="btn primary" data-act="saveItem">${T_('Сохранить в банк', 'Банкке сақтау')}</button></div></div>`;
  $('#dr-topic').addEventListener('change', e => { ITEM_DRAFT.topic_id = e.target.value; showDraft(ITEM_DRAFT); });
}

/* ---------- schools ---------- */
R.schools = () => `
  <div class="head"><span class="eyebrow">${T_('Администрирование', 'Әкімшілік')}</span><h1>${label('schools')}</h1>
  <p class="lede">${T_('Создайте школу и учётную запись учителя. Учитель будет загружать результаты только своей школы.', 'Мектеп пен мұғалім есептік жазбасын жасаңыз.')}</p></div>
  <form class="card" id="schoolForm"><h2>${T_('Новая школа', 'Жаңа мектеп')}</h2>
    <div class="formgrid">
      <label class="fld"><span>${T_('Код (латиницей)', 'Коды (латынша)')}</span><input type="text" id="sc-id" required pattern="[A-Za-z0-9_\\-]{1,32}" placeholder="TRZ-12"></label>
      <label class="fld"><span>${T_('Название', 'Атауы')}</span><input type="text" id="sc-name" required placeholder="СШ №12"></label>
      <label class="fld"><span>${T_('Район', 'Аудан')}</span><input type="text" id="sc-district" required placeholder="г. Тараз"></label>
      <label class="fld"><span>${T_('Местность', 'Аймақ')}</span><select id="sc-area"><option value="urban">${T_('город', 'қала')}</option><option value="rural">${T_('село', 'ауыл')}</option></select></label>
      <label class="fld"><span>${T_('Язык обучения', 'Оқыту тілі')}</span><select id="sc-lang"><option value="kz">${T_('казахский', 'қазақ')}</option><option value="ru">${T_('русский', 'орыс')}</option></select></label>
      <label class="fld"><span>${T_('Учебник', 'Оқулық')}</span><input type="text" id="sc-tb" value="A" maxlength="8"></label>
      <label class="fld"><span>${T_('Прошлый средний балл (0–100)', 'Өткен орташа балл')}</span><input type="number" id="sc-prev" value="50" min="0" max="100"></label>
      <label class="fld"><span><input type="checkbox" id="sc-small"> ${T_('малокомплектная', 'шағын жинақты')}</span></label>
      <label class="fld"><span>${T_('Логин учителя', 'Мұғалім логині')}</span><input type="text" id="sc-tlogin" autocomplete="off"></label>
      <label class="fld"><span>${T_('Имя учителя', 'Мұғалім аты')}</span><input type="text" id="sc-tname" autocomplete="off"></label>
      <label class="fld"><span>${T_('Пароль учителя (от 6 символов)', 'Мұғалім құпиясөзі')}</span><input type="password" id="sc-tpass" autocomplete="new-password"></label>
    </div>
    <div class="row"><button class="btn primary" type="submit">${T_('Сохранить', 'Сақтау')}</button><span class="small" id="sc-msg"></span></div></form>
  <section class="card"><h2>${T_('Школы', 'Мектептер')}</h2><div class="scroll" id="sc-list"><p class="muted">…</p></div></section>`;
AFTER.schools = async () => {
  try {
    const ss = await API('/api/schools'); if (!$('#sc-list')) return;
    $('#sc-list').innerHTML = `<table><thead><tr><th>${T_('Код', 'Код')}</th><th>${T_('Название', 'Атауы')}</th><th>${T_('Район', 'Аудан')}</th><th>${T_('Язык', 'Тіл')}</th><th>${T_('Учебник', 'Оқулық')}</th><th class="n">${T_('Учеников', 'Оқушылар')}</th><th>${T_('Учителя', 'Мұғалімдер')}</th></tr></thead><tbody>
      ${ss.slice(0, 300).map(s => `<tr><td class="num">${esc(s.id)}</td><td>${esc(s.name)}</td><td>${esc(s.district)}</td><td>${LANG_SHORT[s.lang]}</td><td>${esc(s.textbook)}</td><td class="n">${s.students}</td><td>${esc(s.teachers || '—')}</td></tr>`).join('')}</tbody></table>`;
  } catch (e) { if ($('#sc-list')) $('#sc-list').textContent = e.message; }
};

/* ---------- data & issues (extend engine views) ---------- */
R.data = () => {
  const byD = A.districts.map(d => { const g = A.S.filter(s => s.district === d); return { d, n: g.length, stu: A.studentsWhere(s => s.district === d), kz: g.filter(s => s.lang === 'kz').length / g.length, small: g.filter(s => s.small).length, tb: A.tbs.map(x => g.filter(s => s.tb === x).length) }; });
  let val = null; try { if (ME.has_demo) val = validation(); } catch (e) { val = null; }
  return `<div class="head"><span class="eyebrow">${T_('Источник', 'Дереккөз')}</span><h1>${label('data')}</h1>
  <p class="lede">${T_('Данные загружаются из базы: всё, что загрузили методисты и учителя. Управление — во вкладке «Загрузка результатов».', 'Деректер базадан жүктеледі.')}</p></div>
  ${val ? `<section class="card"><h2>${T_('Проверка на демо-выборке: заложено → найдено', 'Демо-деректерде тексеру')}</h2>
    <ul class="checks">${val.map(v => `<li><b class="${v.ok ? 'ok' : 'no'}">${v.ok ? '✓' : '✗'}</b><span>${esc(v.label)}${v.detail ? ` <span class="muted small">— ${esc(v.detail)}</span>` : ''}</span></li>`).join('')}</ul>
    <p class="note">${T_('Проверка корректна, только если в базе одна демо-выборка без других данных.', 'Тек бір демо-деректер болғанда дұрыс.')}</p></section>` : ''}
  <section class="card"><h2>${T_('Состав выборки', 'Іріктеме құрамы')}</h2><div class="scroll"><table><thead><tr><th>${T_('Район', 'Аудан')}</th><th class="n">${T_('Школ', 'Мектеп')}</th><th class="n">МКШ</th><th class="n">${T_('Учеников', 'Оқушы')}</th><th class="n">${T_('Каз. язык', 'Қаз. тілі')}</th>${A.tbs.map(x => `<th class="n">${tbName(x)}</th>`).join('')}</tr></thead><tbody>
    ${byD.map(r => `<tr><td>${esc(r.d)}</td><td class="n">${r.n}</td><td class="n">${r.small}</td><td class="n">${r.stu}</td><td class="n">${pct(r.kz)}</td>${r.tb.map(v => `<td class="n">${v}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div></section>`;
};
const _issuesView = R.issues;
R.issues = () => _issuesView() + `
  <section class="card"><div class="row between"><h2>${T_('Служебная записка (ИИ)', 'Қызметтік хат (ЖИ)')}</h2>
    <div class="row"><select id="repLang" aria-label="language"><option value="ru" ${LANG_UI === 'ru' ? 'selected' : ''}>Русский</option><option value="kz" ${LANG_UI === 'kz' ? 'selected' : ''}>Қазақша</option></select>
    <button class="btn primary" data-act="aiReport" ${ME.ai.enabled ? '' : 'disabled'}>${T_('Написать записку', 'Хат жазу')}</button></div></div>
    <p class="note">${ME.ai.enabled ? T_('Gemini пишет записку для управления образования только по цифрам из замечаний выше.', 'Gemini тек жоғарыдағы деректер бойынша жазады.') : T_('ИИ выключен: администратор должен добавить GEMINI_API_KEY.', 'ЖИ өшірулі.')}</p>
    <div id="repOut"></div></section>`;

/* ---------- data loading ---------- */
function dsFromJSON(j) {
  if (!j.r.length) return null;
  const base = buildTopics(), known = Object.fromEntries(base.map(t => [t.id, t])), order = base.map(t => t.id);
  const rank = id => { const i = order.indexOf(id); return i < 0 ? 999 : i; };
  const tids = [...new Set(j.items.map(id => id.split('.')[0]))].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const topics = tids.map(id => known[id] ? { ...known[id] } : { id, name: id, h: 8, pre: [], mis: ['Ошибка 1', 'Ошибка 2', 'Ошибка 3'], ex: ['', '', ''] });
  const ids = new Set(tids); topics.forEach(t => t.pre = t.pre.filter(p => ids.has(p)));
  const tIdx = Object.fromEntries(tids.map((id, i) => [id, i]));
  const n = j.r.length / 3, stu = new Int32Array(n), item = new Int32Array(n), opt = new Uint8Array(n);
  for (let i = 0; i < n; i++) { stu[i] = j.r[3 * i]; item[i] = j.r[3 * i + 1]; opt[i] = j.r[3 * i + 2]; }
  return { source: 'db', topics, items: j.items.map(id => ({ id, t: tIdx[id.split('.')[0]] })),
    schools: j.schools.map(s => ({ id: s.id, name: s.name, district: s.district, area: s.area, small: !!s.small, lang: s.lang, tb: s.textbook, prev: s.prev_score, hours: s.hours || {} })),
    students: j.students.map(([id, s]) => ({ id, s })), resp: { stu, item, opt, n } };
}
async function reloadData() {
  DS = dsFromJSON(await API('/api/dataset'));
  A = DS ? analyze(DS) : null; plan = null; selTopic = null; render();
}
async function gzipBlob(text) {
  if (!window.CompressionStream) return null;
  return new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
}
async function boot() {
  try { ME = await API('/api/me'); } catch (e) { ME = null; }
  if (ME) { try { await reloadData(); return; } catch (e) { toast(e.message); } }
  render();
}

/* ---------- events ---------- */
document.addEventListener('submit', async e => {
  e.preventDefault();
  if (e.target.id === 'loginForm') {
    try { await jpost('/api/login', { login: $('#lg-login').value, password: $('#lg-pass').value }); location.hash = ''; await boot(); }
    catch (err) { $('#lg-err').textContent = err.message; }
  }
  if (e.target.id === 'schoolForm') {
    try {
      await jpost('/api/schools', { id: $('#sc-id').value.trim(), name: $('#sc-name').value.trim(), district: $('#sc-district').value.trim(), area: $('#sc-area').value, lang: $('#sc-lang').value,
        textbook: $('#sc-tb').value.trim() || 'A', prev_score: +$('#sc-prev').value || 50, small: $('#sc-small').checked,
        teacher_login: $('#sc-tlogin').value.trim() || null, teacher_name: $('#sc-tname').value.trim() || null, teacher_password: $('#sc-tpass').value || null });
      toast(T_('Школа сохранена', 'Мектеп сақталды')); render();
    } catch (err) { $('#sc-msg').textContent = err.message; $('#sc-msg').className = 'small no'; }
  }
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-topic],[data-act],[data-del]'); if (!b) return;
  if (b.dataset.topic != null) { selTopic = +b.dataset.topic; render(); return; }
  if (b.dataset.del) {
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = T_('Точно удалить?', 'Жою керек пе?'); return; }
    try { await API('/api/uploads/' + b.dataset.del, { method: 'DELETE' }); toast(T_('Загрузка удалена', 'Жойылды')); await reloadData(); } catch (err) { toast(err.message); }
    return;
  }
  const a = b.dataset.act;
  try {
    if (a === 'lang') { LANG_UI = LANG_UI === 'kz' ? 'ru' : 'kz'; try { localStorage.setItem('talda-lang', LANG_UI); } catch (_) {} document.documentElement.lang = LANG_UI === 'kz' ? 'kk' : 'ru'; render(); }
    if (a === 'logout') { await jpost('/api/logout', {}); ME = null; DS = null; A = null; render(); }
    if (a === 'opt') { plan = [...A.opt]; A.T.forEach((t, i) => $('#h-' + i).value = plan[i]); updHours(); toast(T_('План рассчитан', 'Жоспар есептелді')); }
    if (a === 'reset') { plan = [...A.plan0]; A.T.forEach((t, i) => $('#h-' + i).value = plan[i]); updHours(); }
    if (a === 'copyIssues') copyText(issuesText());
    if (a === 'copyTemplate') copyText('student_id,' + buildTopics().flatMap(t => [1, 2, 3].map(k => `${t.id}.${k}`)).join(',') + '\nученик-01,' + buildTopics().flatMap(() => ['A', 'B', 'A']).join(','));
    if (a === 'upload') {
      const f = $('#upFile').files[0]; if (!f) { $('#upMsg').textContent = T_('Выберите файл', 'Файлды таңдаңыз'); return; }
      $('#upMsg').textContent = T_('Загружаю…', 'Жүктелуде…');
      const r = await sendFile(f); $('#upMsg').textContent = `${T_('Готово', 'Дайын')}: ${r.rows} ${T_('ответов', 'жауап')}, ${r.students} ${T_('учеников', 'оқушы')}`; await reloadData(); location.hash = 'overview';
    }
    if (a === 'demo') {
      const s = parseInt($('#seed').value) || 2026; b.disabled = true; b.textContent = T_('Загружаю…', 'Жүктелуде…');
      const csv = fullCSV(generate(s)), gz = await gzipBlob(csv);
      await (gz ? sendFile(gz, `demo-${s}.csv.gz`) : sendFile(new Blob([csv], { type: 'text/csv' }), `demo-${s}.csv`));
      ME = await API('/api/me'); await reloadData(); location.hash = 'overview'; toast(T_('Демо-выборка загружена', 'Демо жүктелді'));
    }
    if (a === 'manualTag') { const f = readItemForm(); showDraft({ ...f, topic_id: topicsList()[0].id, mapping: f.options.map((_, i) => i === f.correct ? 0 : 1) }); }
    if (a === 'aiTag') {
      const f = readItemForm(); b.disabled = true; b.textContent = T_('Gemini думает…', 'Gemini ойлануда…');
      try {
        const r = await jpost('/api/ai/tag-item', { ...f, topics: topicsList().map(t => ({ id: t.id, name: t.name, mis: t.mis })) });
        const mapping = f.options.map((_, i) => 0), why = [];
        (r.distractors || []).forEach(d => { const i = 'ABCD'.indexOf(String(d.option).trim().toUpperCase()[0]); if (i >= 0 && i !== f.correct) { mapping[i] = clamp(parseInt(d.misconception) || 1, 1, 3); why[i] = d.why; } });
        f.options.forEach((_, i) => { if (i !== f.correct && !mapping[i]) mapping[i] = 1; });
        const warnings = [...(r.warnings || [])]; if (r.correct_is_right === false) warnings.unshift(T_('ИИ сомневается, что отмеченный ответ верный', 'ЖИ белгіленген жауаптың дұрыстығына күмәнданады'));
        showDraft({ ...f, topic_id: r.topic_id, mapping, why, warnings: warnings.filter(Boolean), explanation: r.explanation });
      } finally { b.disabled = false; b.textContent = T_('Разметить с помощью ИИ', 'ЖИ көмегімен белгілеу'); }
    }
    if (a === 'saveItem') {
      const d = ITEM_DRAFT, mapping = d.options.map((_, i) => i === d.correct ? 0 : +$('#dr-m' + i).value);
      const r = await jpost('/api/items', { topic_id: $('#dr-topic').value, stem: d.stem, options: d.options, correct: d.correct, mapping, explanation: d.explanation || '' });
      toast(`${T_('Сохранено как', 'Сақталды')} ${r.id}`); ITEM_DRAFT = null; render();
    }
    if (a === 'aiReport') {
      b.disabled = true; b.textContent = T_('Gemini пишет…', 'Gemini жазуда…');
      try {
        const r = await jpost('/api/ai/report', { issues: A.issues.map(({ sev, kind, title, body, action, who, reach }) => ({ sev: SEV[sev], kind, title, body, action, who, reach })), lang: $('#repLang').value,
          context: `${A.S.length} школ, ${A.nStu} учеников, ${A.nResp} ответов, алгебра 7 класс` });
        $('#repOut').innerHTML = `<textarea id="repText" style="min-height:320px;font-family:var(--f-body);font-size:14px">${esc(r.text)}</textarea><div class="row"><button class="btn" data-act="copyRep">${T_('Скопировать', 'Көшіру')}</button></div>`;
      } finally { b.disabled = false; b.textContent = T_('Написать записку', 'Хат жазу'); }
    }
    if (a === 'copyRep') copyText($('#repText').value);
  } catch (err) { toast(err.message); }
});
window.addEventListener('hashchange', () => { if (ME) { render(); window.scrollTo(0, 0); } });
document.documentElement.lang = LANG_UI === 'kz' ? 'kk' : 'ru';
boot();
