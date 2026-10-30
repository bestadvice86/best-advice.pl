/* Śledzenie konwersji Google (GA4 + Google Ads) z banerem zgody (Consent Mode v2).
   Uzupełnij identyfikatory poniżej; dopóki są puste, skrypt nic nie ładuje i nie pokazuje banera. */
(function () {
  var CFG = {
    ga4: '',            // np. 'G-XXXXXXXXXX' (Google Analytics 4)
    ads: '',            // np. 'AW-1234567890' (Google Ads)
    labels: {           // etykiety konwersji z Google Ads (część po ukośniku w send_to)
      form: '',         // wysłany formularz kontaktowy
      tel: '',          // kliknięcie numeru telefonu
      mail: ''          // kliknięcie adresu e-mail
    }
  };
  var KEY = 'ba_consent_v1';
  var queue = [];
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  var loaded = false;
  function load() {
    if (loaded || !(CFG.ga4 || CFG.ads)) return;
    loaded = true;
    window.gtag = gtag;
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    gtag('js', new Date());
    if (CFG.ga4) gtag('config', CFG.ga4);
    if (CFG.ads) gtag('config', CFG.ads);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (CFG.ga4 || CFG.ads);
    document.head.appendChild(s);
    queue.splice(0).forEach(function (k) { send(k); });
  }

  function send(kind) {
    var ev = { form: 'generate_lead', tel: 'click_phone', mail: 'click_email' }[kind];
    if (CFG.ga4) gtag('event', ev, { method: kind });
    if (CFG.ads && CFG.labels[kind]) gtag('event', 'conversion', { send_to: CFG.ads + '/' + CFG.labels[kind] });
  }

  // Publiczne API dla ba.js (formularz) i nasłuch kliknięć tel:/mailto:
  window.baTrack = function (kind) {
    if (!(CFG.ga4 || CFG.ads)) return;
    if (loaded) send(kind); else if (read() === 'yes') queue.push(kind);
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (a) window.baTrack(/^tel:/.test(a.getAttribute('href')) ? 'tel' : 'mail');
  }, true);

  function banner() {
    if (document.getElementById('ba-cookie')) return;
    var d = document.createElement('div');
    d.id = 'ba-cookie';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'Zgoda na pliki cookie');
    d.innerHTML =
      '<p>Używamy plików cookie Google Analytics i Google Ads, aby mierzyć ruch na stronie i skuteczność reklam. ' +
      'Działają tylko po wyrażeniu zgody; możesz ją w każdej chwili zmienić, klikając „Ustawienia cookie” w stopce.</p>' +
      '<div class="ba-cookie-btns"><button type="button" data-v="no">Tylko niezbędne</button>' +
      '<button type="button" data-v="yes" class="ba-cookie-yes">Akceptuję</button></div>';
    d.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (!v) return;
      store(v);
      d.remove();
      if (v === 'yes') load();
      else if (loaded) location.reload();
    });
    document.body.appendChild(d);
  }
  window.baCookieSettings = function () { banner(); };

  function init() {
    if (!(CFG.ga4 || CFG.ads)) return;
    var c = read();
    if (c === 'yes') load(); else if (c !== 'no') banner();
    // link „Ustawienia cookie” w stopce
    var pp = document.querySelector('a[href*="1MoMojy1sLg7dtYYBq4965WhR7jFy95O6"]');
    if (pp && !document.getElementById('ba-cookie-link')) {
      var a = document.createElement('a');
      a.id = 'ba-cookie-link';
      a.href = '#';
      a.className = 'custom_link';
      a.textContent = 'Ustawienia cookie';
      a.style.cssText = 'display:block;margin-top:6px;color:var(--neutral1)';
      a.addEventListener('click', function (e) { e.preventDefault(); banner(); });
      pp.parentNode.appendChild(a);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
