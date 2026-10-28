(function () {
  // Zastepuje runtime WebWave: tryby RWD, lazy-load obrazow, kadrowanie, poradnik, liczniki, menu mobilne, formularz, kotwice.
  var MODES = [[1200, 'rwdMode_1'], [768, 'rwdMode_2'], [480, 'rwdMode_3'], [0, 'rwdMode_4']];
  var FIT = { imageCrop: 'cover', imageFit: 'contain', imageStretch: 'fill' };
  var HAMBURGER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="rgb(159,189,224)"><path d="M5.5 8.5h21a1 1 0 0 1 0 2h-21a1 1 0 0 1 0-2zm0 6.5h21a1 1 0 0 1 0 2h-21a1 1 0 0 1 0-2zm0 6.5h21a1 1 0 0 1 0 2h-21a1 1 0 0 1 0-2z"/></svg>');
  function mode() {
    var w = window.innerWidth;
    for (var i = 0; i < MODES.length; i++) if (w >= MODES[i][0]) return MODES[i][1];
  }
  var cur = null;
  function apply() {
    var m = mode();
    layoutFeed();
    if (m === cur) return;
    cur = m;
    document.querySelectorAll('[data-ww_rwd]').forEach(function (el) {
      var j;
      try { j = JSON.parse(el.getAttribute('data-ww_rwd')); } catch (e) { return; }
      if (j['class'] && j['class'][m] != null) el.className = j['class'][m];
      var ls = j['data-lazy-load-src'];
      if (ls && ls[m]) el.setAttribute('src', ls[m]);
      if (el.tagName === 'IMG' && el.parentElement && el.parentElement.classList.contains('ww_image_wrapper')) {
        var bs = (j.backgroundSize && j.backgroundSize[m]) || el.getAttribute('backgroundsize');
        var bp = (j.backgroundPosition && j.backgroundPosition[m]) || el.getAttribute('backgroundposition') || '50% 50%';
        el.style.cssText = 'width:100%;height:100%;object-fit:' + (FIT[bs] || 'cover') + ';object-position:' + bp;
      }
    });
    document.querySelectorAll('img[data-lazy-load-src]').forEach(function (el) {
      var s = el.getAttribute('data-lazy-load-src');
      if (s && /^data:/.test(el.getAttribute('src') || 'data:')) el.setAttribute('src', s);
    });
    document.querySelectorAll('img.image-uninitialized').forEach(function (el) { el.classList.remove('image-uninitialized'); });
    var icon = document.querySelector('.mobileMenuIcon');
    if (icon && !icon.getAttribute('src')) { icon.setAttribute('src', HAMBURGER); icon.style.height = '100%'; }
    var menu = document.querySelector('.ww_menu_content');
    var menuObj = menu && menu.closest('.w-object');
    if (menuObj) menuObj.classList.toggle('mobileMenu', m !== 'rwdMode_1');
    closeMenu();
  }

  function lazyStyles() {
    document.querySelectorAll('[data-lazy-load-style]').forEach(function (el) {
      el.setAttribute('style', (el.getAttribute('style') || '') + ';' + el.getAttribute('data-lazy-load-style'));
    });
  }

  // Poradnik (newsfeed): 3 kolumny na szerokim ekranie, 1 na waskim + strzalki
  function layoutFeed() {
    document.querySelectorAll('.feed_content').forEach(function (fc) {
      var W = fc.parentElement.clientWidth;
      var items = fc.querySelectorAll('.feed_item');
      var cols = W >= 700 ? Math.min(3, items.length) : 1;
      var pages = Math.ceil(items.length / cols);
      var page = (parseInt(fc.getAttribute('data-ba-page'), 10) || 0) % pages;
      var iw = Math.floor((W - (cols - 1) * 16) / cols);
      var root = fc.closest('.w-object') || fc.parentElement;
      root.querySelectorAll('.feed_pagination_prev_icon, .feed_pagination_next_icon').forEach(function (a) {
        a.style.display = pages > 1 ? '' : 'none';
        a.style.cursor = 'pointer';
        if (!a.getAttribute('data-ba-bound')) {
          a.setAttribute('data-ba-bound', '1');
          a.addEventListener('click', function (e) {
            e.preventDefault();
            var d = a.classList.contains('feed_pagination_prev_icon') ? -1 : 1;
            var p = (parseInt(fc.getAttribute('data-ba-page'), 10) || 0) + d;
            fc.setAttribute('data-ba-page', String((p + 100 * pages) % pages));
            layoutFeed();
          });
        }
      });
      fc.style.cssText = 'width:' + W + 'px;display:flex;flex-wrap:wrap;gap:16px';
      items.forEach(function (it, idx) {
        it.style.cssText = 'float:none;margin:0;width:' + iw + 'px;display:' + (Math.floor(idx / cols) === page ? 'block' : 'none');
        it.querySelectorAll('.feed_thumbnail_wrapper,.feed_thumbnail,.feed_thumbnail_image').forEach(function (e) {
          e.style.width = iw + 'px';
          e.style.height = Math.round(iw * 259 / 389) + 'px';
          if (e.classList.contains('feed_thumbnail')) e.style.display = 'block';
        });
      });
    });
  }

  // Liczniki (animacja od 0 do wartosci, jak w WebWave)
  function counters() {
    var ids = ['element_533_content', 'element_535_content', 'element_537_content', 'element_539_content'];
    var els = ids.map(function (id) { return document.querySelector('#' + id + ' h2'); }).filter(Boolean);
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var h = en.target, end = parseInt(h.getAttribute('data-ba-end'), 10), t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min(1, (t - t0) / 1500);
          h.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    els.forEach(function (h) {
      var v = parseInt(h.textContent, 10);
      if (isNaN(v)) return;
      h.setAttribute('data-ba-end', v);
      h.textContent = '0';
      io.observe(h);
    });
  }

  // Menu mobilne
  function wrapper() { return document.querySelector('.ww_menu_content_wrapper'); }
  function closeMenu() { var w = wrapper(); if (w) w.classList.remove('ba-open'); }
  document.addEventListener('click', function (e) {
    var icon = e.target.closest && e.target.closest('.mobileMenuIcon');
    var w = wrapper();
    if (icon && w) { e.preventDefault(); w.classList.toggle('ba-open'); return; }
    if (w && w.classList.contains('ba-open') && (e.target.closest('.ww_menu_item a') || !e.target.closest('.ww_menu_content_wrapper'))) closeMenu();
  });

  // Stare linki ?anchorElement=... (Google Ads, zakladki)
  function anchorFromQuery() {
    var m = /[?&]anchorElement=([^&#]+)/.exec(location.search);
    if (m) { var el = document.getElementById(decodeURIComponent(m[1])); if (el) el.scrollIntoView(); }
  }

  // Formularz kontaktowy -> FormSubmit (fallback: mailto)
  var ENDPOINT = 'https://formsubmit.co/ajax/sekretariat@best-advice.pl';
  function initForm(form) {
    var btn = form.querySelector('.ww_submit_button_content');
    var info = form.querySelector('.ww_form_frame_info_wrapper');
    var ok = info && info.querySelector('.ww_form_frame_info');
    var err = info && info.querySelector('.ww_form_frame_info_error');
    function show(success, text) {
      if (!info) return;
      info.style.display = 'block';
      if (ok) ok.style.display = success ? 'block' : 'none';
      if (err) { err.style.display = success ? 'none' : 'block'; if (text) err.textContent = text; }
    }
    function send(e) {
      if (e) e.preventDefault();
      var data = {}, missing = false, reply = '';
      form.querySelectorAll('td[label]').forEach(function (td) {
        var i = td.querySelector('input, textarea');
        var v = (i && i.value || '').trim();
        if (td.getAttribute('data-required') === 'true' && !v) missing = true;
        var label = td.getAttribute('label');
        data[label] = v;
        if (/mail/i.test(label)) reply = v;
      });
      if (missing) { show(false, 'Proszę wypełnić wszystkie wymagane pola!'); return; }
      if (reply && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(reply)) { show(false, 'Proszę podać poprawny adres e-mail.'); return; }
      data._subject = 'Formularz kontaktowy - best-advice.pl';
      data._template = 'table';
      data._captcha = 'false';
      if (reply) data._replyto = reply;
      btn.style.opacity = '0.6';
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && (j.success === true || j.success === 'true')) {
            show(true);
            form.querySelectorAll('input, textarea').forEach(function (i) { i.value = ''; });
            if (window.gtag) window.gtag('event', 'generate_lead');
          } else throw new Error('fail');
        })
        .catch(function () {
          var body = Object.keys(data).filter(function (k) { return k[0] !== '_'; }).map(function (k) { return k + ': ' + data[k]; }).join('\n');
          location.href = 'mailto:sekretariat@best-advice.pl?subject=' + encodeURIComponent('Zapytanie ze strony best-advice.pl') + '&body=' + encodeURIComponent(body);
        })
        .then(function () { btn.style.opacity = ''; });
    }
    if (btn) { btn.style.cursor = 'pointer'; btn.addEventListener('click', send); }
    form.addEventListener('submit', send);
  }

  function init() {
    lazyStyles();
    apply();
    counters();
    document.querySelectorAll('form.ww_form').forEach(initForm);
    anchorFromQuery();
    document.documentElement.classList.add('ba-ready');
  }
  window.addEventListener('resize', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
