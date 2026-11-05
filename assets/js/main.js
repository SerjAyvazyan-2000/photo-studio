(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Данные залов ---------- */
  const HALLS = [
    { id: 'interiors', name: 'Интерьеры', short: 'Интерьеры', area: 140, height: 6, hour: 2000, half: 2400, morning: 1400,
      img: 'assets/images/ecoloft-braids.jpg', alt: 'Зал ЭкоЛофт: стена из текстильных кос, монстера и ваза',
      text: 'Шесть локаций на одной территории: ЭкоЛофт с косами и асимметричным зеркалом, красный кирпич, подземная парковка, бордо со шторами, бежевая фактурная стена с креслами и бабл-уголок.',
      feat: ['6 локаций', 'ЭкоЛофт', 'Бордо', 'Кирпич', 'Подземная парковка', 'Модульный диван'] },
    { id: 'cyclo', name: 'Циклорама', short: 'Циклорама', area: 45, height: 6, hour: 2000, half: 2400, morning: 1400,
      visual: 'cyclo', text: 'Просторная белая циклорама с окнами на северо-запад. Нейтральный фон и ровный свет для портретов, предметки, рекламы и каталогов.',
      feat: ['Белый фон', 'Дневной свет', 'Портрет', 'Предметка', 'Реклама'] },
    { id: 'nude', name: 'Nude', short: 'Nude', area: 15, height: 3, hour: 1500, half: 2000, morning: 1000,
      img: 'assets/images/nude-mirror.jpg', alt: 'Съёмка у асимметричного зеркала в зале Nude',
      text: 'Отдельный зал в бежевой гамме с асимметричным зеркалом. Идеален для съёмки одежды, аксессуаров и бьюти-контента.',
      feat: ['Зеркало', 'Бежевая гамма', 'Одежда', 'Аксессуары'] },
    { id: 'podcast', name: 'Подкастная', short: 'Подкастная', area: 8, height: 3, hour: 2000, half: 2400, morning: null,
      img: 'assets/images/podcast-room.jpg', alt: 'Подкастная с двумя креслами и микрофонами',
      text: 'Изолированная комната для подкастов, интервью и экспертных рилс. Микрофоны, штативы и свет уже стоят — садитесь и пишите.',
      feat: ['2 кресла', 'Микрофоны', 'Софтбоксы', 'Суфлёр (доп.)'] },
    { id: 'foil', name: 'Фольга', short: 'Фольга', area: 6, height: 6, hour: 1400, half: 1400, morning: 1000,
      visual: 'foil', text: 'Фольгированная стена для эффектных фото на день рождения, вечеринку или праздничный рилс. Отдельная локация с шагом брони 30 минут.',
      feat: ['Праздничные фото', 'Бликующий фон', 'Шаг 30 мин'] },
    { id: 'full', name: 'Вся студия', short: 'Вся студия', area: 185, height: 6, hour: 3000, half: 4000, morning: 2100,
      visual: 'plan', text: 'Все залы и циклорама в вашем распоряжении. Для мероприятий, больших съёмок и команды до 15 человек — никаких ограничений.',
      feat: ['Все локации', 'Мероприятия', 'До 15 человек', 'Циклорама'] }
  ];
  const minPrice = h => h.half / 2; // стоимость минимальной брони 30 минут

  /* ---------- Затвор ---------- */
  const shutter = $('#shutter');
  const openShutter = () => {
    if (!shutter || shutter.classList.contains('is-open')) return;
    shutter.classList.add('is-open');
    doc.classList.add('is-loaded');
    if (!reduce) {
      const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f);
      setTimeout(() => f.remove(), 700);
    }
    setTimeout(() => $('.hero__title')?.classList.add('is-in'), reduce ? 0 : 350);
  };
  window.addEventListener('load', () => setTimeout(openShutter, reduce ? 0 : 450));
  setTimeout(openShutter, 1800); // страховка

  /* ---------- Разбивка заголовка на слова ---------- */
  $$('.split').forEach(el => {
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part; w.appendChild(i);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    $$('.w > span', el).forEach((s, i) => s.style.transitionDelay = (i * 0.06) + 's');
  });

  /* ---------- Залы: вкладки ---------- */
  const tabs = $('#hallTabs'), stage = $('#hallStage');
  const visual = h => {
    if (h.img) return `<img src="${h.img}" alt="${h.alt}" loading="lazy">`;
    if (h.visual === 'cyclo') return `<div class="v-cyclo"></div><span class="v-label mono">белая циклорама · 45 м²</span>`;
    if (h.visual === 'foil') return `<div class="v-foil"></div>`;
    return `<div class="v-plan"><svg viewBox="0 0 400 300" role="img" aria-label="Схема студии: все залы">
      <rect class="room" x="10" y="10" width="170" height="130" rx="4"/><text x="22" y="34">Циклорама</text><text class="dim" x="22" y="50">45 м²</text>
      <rect class="room" x="190" y="10" width="200" height="200" rx="4"/><text x="202" y="34">Интерьеры</text><text class="dim" x="202" y="50">140 м² · 6 локаций</text>
      <rect class="room" x="10" y="150" width="80" height="60" rx="4"/><text x="18" y="174">Nude</text><text class="dim" x="18" y="190">15 м²</text>
      <rect class="room" x="100" y="150" width="80" height="60" rx="4"/><text x="108" y="174">Подкаст</text><text class="dim" x="108" y="190">8 м²</text>
      <rect class="room" x="10" y="220" width="120" height="70" rx="4"/><text x="22" y="244">Гримёрка</text>
      <rect class="room" x="140" y="220" width="60" height="70" rx="4"/><text x="148" y="244">Фольга</text>
      <rect class="room" x="210" y="220" width="180" height="70" rx="4"/><text x="222" y="244">Вход · чай · кулер</text>
    </svg></div>`;
  };
  const renderHall = (id, focus) => {
    const h = HALLS.find(x => x.id === id) || HALLS[0];
    $$('.hall-tab', tabs).forEach(t => {
      const on = t.dataset.id === h.id;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    stage.innerHTML = `<article class="hall-card" role="tabpanel" id="panel-${h.id}" aria-labelledby="tab-${h.id}">
      <div class="hall-card__visual">${visual(h)}</div>
      <div class="hall-card__body">
        <p class="eyebrow mono">Зал</p>
        <h3>${h.name}</h3>
        <p>${h.text}</p>
        <dl class="specs">
          <div><dt class="mono">Площадь</dt><dd>${h.area} м²</dd></div>
          <div><dt class="mono">Потолки</dt><dd>${h.height} м</dd></div>
          <div><dt class="mono">От 1 часа</dt><dd>${fmt(h.hour)} ₽</dd></div>
          <div><dt class="mono">Будни 9–12</dt><dd>${h.morning ? fmt(h.morning) + ' ₽' : '—'}</dd></div>
        </dl>
        <ul class="feat">${h.feat.map(f => `<li>${f}</li>`).join('')}</ul>
        <div class="hall-card__foot">
          <p class="price-tag">от <b>${fmt(minPrice(h))} ₽</b> / 30 мин</p>
          <a href="#booking" class="btn btn--amber magnetic" data-hall="${h.id}">Забронировать ${h.short}</a>
        </div>
      </div></article>`;
  };
  HALLS.forEach((h, i) => {
    const b = document.createElement('button');
    b.className = 'hall-tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'tab-' + h.id; b.dataset.id = h.id;
    b.setAttribute('aria-controls', 'panel-' + h.id);
    b.innerHTML = `<span class="mono">0${i + 1}</span><span class="hall-tab__name">${h.name}</span><span class="hall-tab__price">от ${fmt(minPrice(h))} ₽</span>`;
    b.addEventListener('click', () => renderHall(h.id));
    tabs.appendChild(b);
  });
  tabs.addEventListener('keydown', e => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const list = $$('.hall-tab', tabs); const cur = list.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const next = (cur + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length;
    renderHall(list[next].dataset.id, true);
  });
  renderHall('interiors');

  /* ---------- Таблица цен ---------- */
  $('#priceRows').innerHTML = HALLS.map(h => `<tr>
    <td>${h.name}</td><td>${h.area} м²</td><td>${fmt(h.hour)} ₽/ч</td><td>${fmt(h.half / 2)} ₽</td>
    <td class="best">${h.morning ? fmt(h.morning) + ' ₽/ч' : '—'}</td></tr>`).join('');

  /* ---------- Калькулятор ---------- */
  const calc = { hall: 'interiors' };
  const chips = $('#calcHalls'), hoursEl = $('#calcHours'), morningEl = $('#calcMorning');
  HALLS.forEach(h => {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'chip'; c.textContent = h.short; c.dataset.id = h.id;
    c.addEventListener('click', () => { calc.hall = h.id; updateCalc(); });
    chips.appendChild(c);
  });
  let shownTotal = 0, rafId;
  const animateNum = (el, to) => {
    cancelAnimationFrame(rafId);
    if (reduce) { el.textContent = fmt(to); shownTotal = to; return; }
    const from = shownTotal, t0 = performance.now(), d = 500;
    const tick = t => {
      const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) rafId = requestAnimationFrame(tick); else shownTotal = to;
    };
    rafId = requestAnimationFrame(tick);
  };
  function updateCalc() {
    const h = HALLS.find(x => x.id === calc.hall);
    const hrs = parseFloat(hoursEl.value);
    $$('.chip', chips).forEach(c => c.setAttribute('aria-pressed', c.dataset.id === h.id));
    morningEl.disabled = !h.morning;
    if (!h.morning) morningEl.checked = false;
    let rate, note = '';
    if (morningEl.checked && h.morning && hrs >= 1) { rate = h.morning; note = 'Цена горячих часов: будни с 9:00 до 12:00.'; }
    else if (hrs < 1) { rate = h.half; note = 'Короткая бронь на 30 минут. От часа — дешевле.'; }
    else { rate = h.hour; }
    if (morningEl.checked && hrs < 1) note = 'Утренняя цена действует при брони от 1 часа.';
    if (!h.morning) note = 'Для подкастной цена одна в любое время.';
    if (hrs >= 1 && !morningEl.checked && h.morning) note = `Утром в будни было бы ${fmt(h.morning * hrs)} ₽ — экономия ${fmt((h.hour - h.morning) * hrs)} ₽.`;
    const total = rate * hrs;
    animateNum($('#calcTotal'), total);
    $('#calcRate').textContent = `${fmt(rate)} ₽/ч · ${h.short}`;
    $('#calcNote').textContent = note;
    const hText = hrs % 1 ? hrs.toString().replace('.', ',') : hrs;
    $('#calcHoursOut').textContent = hText + ' ч';
    hoursEl.style.setProperty('--p', ((hrs - 0.5) / 7.5 * 100) + '%');
    $('#calcBook').dataset.hall = h.id;
  }
  hoursEl.addEventListener('input', updateCalc);
  morningEl.addEventListener('change', updateCalc);
  updateCalc();

  /* ---------- Выбор зала в форме ---------- */
  const fHall = $('#fHall');
  HALLS.forEach(h => fHall.insertAdjacentHTML('beforeend', `<option value="${h.id}">${h.name} — от ${fmt(h.hour)} ₽/ч</option>`));
  fHall.insertAdjacentHTML('beforeend', '<option value="content">Контент под ключ</option>');
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-hall],[data-service]');
    if (!a) return;
    fHall.value = a.dataset.hall || (a.dataset.service ? 'content' : '');
  });
  try { $('#fDate').min = new Date().toISOString().slice(0, 10); } catch (e) {}

  /* ---------- Время в Оренбурге (UTC+5) ---------- */
  const orenNow = () => { const d = new Date(); return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 5 * 3600000); };
  const tickClock = () => {
    const d = orenNow(), hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
    $('#orenClock').textContent = `${hh}:${mm}`; $('#heroTime').textContent = `${hh}:${mm}`;
    const day = d.getDay(), h = d.getHours() + d.getMinutes() / 60, weekday = day >= 1 && day <= 5;
    const st = $('#orenStatus'); st.classList.remove('is-hot');
    if (weekday && h >= 9 && h < 12) { st.textContent = 'Горячие часы идут прямо сейчас — успейте забронировать.'; st.classList.add('is-hot'); }
    else if (h >= 9 && h < 21) st.textContent = 'Студия открыта до 21:00. Горячие часы — завтра утром в будни.';
    else st.textContent = 'Студия откроется в 9:00. Утренние часы в будни — со скидкой.';
  };
  tickClock(); setInterval(tickClock, 20000);

  /* ---------- Волна подкаста ---------- */
  const wave = $('#wave');
  for (let i = 0; i < 48; i++) {
    const b = document.createElement('i');
    b.style.setProperty('--h', (25 + Math.abs(Math.sin(i * 0.7)) * 55 + Math.random() * 20) + '%');
    b.style.setProperty('--d', (-Math.random() * 1.2) + 's');
    wave.appendChild(b);
  }

  /* ---------- Появление при прокрутке ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el, i) => { el.style.transitionDelay = ((i % 4) * 0.08) + 's'; io.observe(el); });
    setTimeout(() => reveals.forEach(el => el.classList.add('is-in')), 6000); // страховка
  } else reveals.forEach(el => el.classList.add('is-in'));

  /* ---------- Счётчики в hero ---------- */
  $$('[data-count]').forEach(el => {
    if (reduce) return;
    const to = +el.dataset.count; let t0;
    const run = t => { t0 ??= t; const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(run); };
    setTimeout(() => requestAnimationFrame(run), 700);
  });

  /* ---------- Скролл: шапка, прогресс, кадр, параллакс ---------- */
  const header = $('#header'), progress = $('#progress'), counter = $('#frameCounter'), mbar = $('#mbar');
  const parallax = $$('.parallax');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav a');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? y / max : 0;
    header.classList.toggle('is-scrolled', y > 20);
    header.classList.toggle('is-hidden', y > 600 && y > lastY && !$('#mobileMenu').classList.contains('is-open'));
    progress.style.transform = `scaleX(${p})`;
    counter.textContent = `кадр ${String(Math.max(1, Math.ceil(p * 36))).padStart(2, '0')}/36`;
    mbar.classList.toggle('is-on', y > 500);
    if (!reduce) parallax.forEach(el => { el.style.transform = `translate3d(0, ${y * parseFloat(el.dataset.speed)}px, 0)`; });
    let cur = '';
    sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur));
    lastY = y; ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Курсор-фокус и магнитные кнопки ---------- */
  if (fine && !reduce) {
    const cur = $('#focusCursor'); let cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('is-on'); });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    const loop = () => { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('mouseover', e => cur.classList.toggle('is-hover', !!e.target.closest('a, button, .shot, summary, label')));
    document.addEventListener('mousemove', e => {
      const m = e.target.closest('.magnetic');
      $$('.magnetic.is-mag').forEach(x => { if (x !== m) { x.style.transform = ''; x.classList.remove('is-mag'); } });
      if (!m) return;
      const r = m.getBoundingClientRect();
      m.classList.add('is-mag');
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    // наклон фото в hero
    const vf = $('.viewfinder');
    vf?.addEventListener('mousemove', e => {
      const r = vf.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      vf.querySelector('img').style.transform = `scale(1.06) translate(${x * -14}px, ${y * -14}px)`;
    });
    vf?.addEventListener('mouseleave', () => { vf.querySelector('img').style.transform = ''; });
  }

  /* ---------- Бургер ---------- */
  const burger = $('#burger'), menu = $('#mobileMenu');
  const setMenu = open => {
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', !open);
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('is-locked', open);
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Лайтбокс ---------- */
  const shots = $$('.shot'), lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let idx = 0, lastFocus;
  const show = i => { idx = (i + shots.length) % shots.length; const s = shots[idx]; lbImg.src = s.dataset.full; lbImg.alt = s.dataset.cap; lbCap.textContent = s.dataset.cap; lbImg.style.animation = 'none'; lbImg.offsetHeight; lbImg.style.animation = ''; };
  const openLb = i => { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.classList.add('is-locked'); $('#lbClose').focus(); };
  const closeLb = () => { lb.hidden = true; document.body.classList.remove('is-locked'); lastFocus?.focus(); };
  shots.forEach((s, i) => s.addEventListener('click', () => openLb(i)));
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  let sx = 0; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });

  /* ---------- Модалки политик ---------- */
  let openModal = null;
  const showModal = id => { lastFocus = document.activeElement; openModal = $('#modal-' + id); if (!openModal) return; openModal.hidden = false; document.body.classList.add('is-locked'); $('.modal__close', openModal).focus(); };
  const hideModal = () => { if (!openModal) return; openModal.hidden = true; openModal = null; if (!menu.classList.contains('is-open')) document.body.classList.remove('is-locked'); lastFocus?.focus(); };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-modal]'); if (t) { e.preventDefault(); showModal(t.dataset.modal); return; }
    if (e.target.closest('[data-close]') || e.target.classList.contains('modal')) hideModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (openModal) hideModal(); else if (!lb.hidden) closeLb(); else if (menu.classList.contains('is-open')) setMenu(false); }
    if (!lb.hidden && e.key === 'ArrowRight') show(idx + 1);
    if (!lb.hidden && e.key === 'ArrowLeft') show(idx - 1);
  });

  /* ---------- Cookie ---------- */
  const cookie = $('#cookie');
  if (!store.get('w186_cookie')) setTimeout(() => { cookie.hidden = false; }, 2200);
  const setCookie = v => { store.set('w186_cookie', v); cookie.hidden = true; };
  $('#cookieAccept').addEventListener('click', () => setCookie('all'));
  $('#cookieDecline').addEventListener('click', () => setCookie('necessary'));

  /* ---------- Маска телефона ---------- */
  const phone = $('#fPhone');
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (!d) { phone.value = ''; return; }
    if (d[0] === '8') d = '7' + d.slice(1); if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    let r = '+7';
    if (d.length > 1) r += ' (' + d.slice(1, 4);
    if (d.length >= 4) r += ') ' + d.slice(4, 7);
    if (d.length >= 7) r += '-' + d.slice(7, 9);
    if (d.length >= 9) r += '-' + d.slice(9, 11);
    phone.value = r;
  });

  /* ---------- Форма ---------- */
  const form = $('#bookingForm'), msg = $('#formMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#fName'), agree = $('#fAgree');
    let ok = true;
    [[name, name.value.trim().length >= 2], [phone, phone.value.replace(/\D/g, '').length === 11]].forEach(([el, v]) => { el.closest('.field').classList.toggle('is-error', !v); if (!v) ok = false; });
    agree.closest('.check').classList.toggle('is-error', !agree.checked);
    if (!agree.checked) ok = false;
    if (!ok) { msg.className = 'form__msg err'; msg.textContent = 'Проверьте имя, телефон и согласие на обработку данных.'; return; }
    msg.className = 'form__msg ok';
    msg.textContent = `Спасибо, ${name.value.trim()}! Заявка принята — администратор свяжется с вами, чтобы подтвердить время.`;
    form.reset(); fHall.value = '';
  });

  $('#year').textContent = new Date().getFullYear();
})();
