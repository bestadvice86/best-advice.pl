(function () {
  // Zastepuje runtime WebWave: tryby RWD, lazy-load obrazow, menu mobilne, formularz, kotwice.
  var MODES = [[1200, 'rwdMode_1'], [768, 'rwdMode_2'], [480, 'rwdMode_3'], [0, 'rwdMode_4']];
  function mode() {
    var w = window.innerWidth;
    for (var i = 0; i < MODES.length; i++) if (w >= MODES[i][0]) return MODES[i][1];
  }
  var cur = null;
  function apply() {
    var m = mode();
    if (m === cur) return;
    cur = m;
    document.querySelectorAll('[data-ww_rwd]').forEach(function (el) {
      var j;
      try { j = JSON.parse(el.getAttribute('data-ww_rwd')); } catch (e) { return; }
      if (j['class'] && j['class'][m] != null) el.className = j['class'][m];
      var ls = j['data-lazy-load-src'];
      if (ls && ls[m]) el.setAttribute('src', ls[m]);
      ['backgroundSize', 'backgroundPosition'].forEach(function (k) {
        if (j[k] && j[k][m] != null) el.style[k] = j[k][m];
      });
    });
    document.querySelectorAll('img[data-lazy-load-src]').forEach(function (el) {
      var s = el.getAttribute('data-lazy-load-src');
      if (s && /^data:/.test(el.getAttribute('src') || 'data:')) el.setAttribute('src', s);
    });
    var menu = document.querySelector('.ww_menu_content');
    var menuObj = menu && menu.closest('.w-object');
    if (menuObj) menuObj.classList.toggle('mobileMenu', m !== 'rwdMode_1');
    closeMenu();
  }

  function wrapper() { return document.querySelector('.ww_menu_content_wrapper'); }
  function closeMenu() { var w = wrapper(); if (w) w.classList.remove('ba-open'); }
  document.addEventListener('click', function (e) {
    var icon = e.target.closest && e.target.closest('.mobileMenuIcon');
    var w = wrapper();
    if (icon && w) { e.preventDefault(); w.classList.toggle('ba-open'); return; }
    if (w && w.classList.contains('ba-open') && (e.target.closest('.ww_menu_item a') || !e.target.closest('.ww_menu_content_wrapper'))) closeMenu();
  });

  function anchorFromQuery() {
    var m = /[?&]anchorElement=([^&#]+)/.exec(location.search);
    if (m) { var el = document.getElementById(decodeURIComponent(m[1])); if (el) el.scrollIntoView(); }
  }

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
    apply();
    document.querySelectorAll('form.ww_form').forEach(initForm);
    anchorFromQuery();
    document.documentElement.classList.add('ba-ready');
  }
  window.addEventListener('resize', apply);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
