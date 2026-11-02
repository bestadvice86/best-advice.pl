/* Baner zgody i zdarzenia konwersji Google Ads (Consent Mode v2, tryb zaawansowany).
   Tag Google (AW-17865634857) jest wczytywany w <head> każdej strony z domyślnym brakiem zgody.
   Bez zgody Google nie zapisuje plików cookie i otrzymuje wyłącznie anonimowe sygnały;
   po kliknięciu „Akceptuję” zgoda jest aktualizowana i pomiar działa w pełni. */
(function () {
  var ADS = 'AW-17865634857';
  var LABELS = {
    form: '1Xi1CJDN8q4dEKno_8ZC', // Formularz kontaktowy – best-advice.pl
    tel: 'kN5UCJPN8q4dEKno_8ZC',  // Kliknięcie w telefon – best-advice.pl
    mail: 'vLJpCJbN8q4dEKno_8ZC'  // Kliknięcie w e-mail – best-advice.pl
  };
  var KEY = 'ba_consent_v1';
  var POLICY = 'polityka-cookies.html';
  window.dataLayer = window.dataLayer || [];
  var gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function consent(granted) {
    var v = granted ? 'granted' : 'denied';
    gtag('consent', 'update', { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
  }

  window.baTrack = function (kind) {
    if (LABELS[kind]) gtag('event', 'conversion', { send_to: ADS + '/' + LABELS[kind] });
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
      '<p>Za Twoją zgodą używamy plików cookie Google Ads, aby mierzyć skuteczność naszych reklam ' +
      '(np. czy po kliknięciu reklamy wysłano zapytanie). Bez zgody pliki cookie nie są zapisywane, a do Google trafiają tylko anonimowe sygnały. ' +
      'Zgodę możesz zmienić w każdej chwili („Ustawienia cookie” w stopce). <a href="' + POLICY + '">Polityka cookies</a></p>' +
      '<div class="ba-cookie-btns"><button type="button" data-v="no">Tylko niezbędne</button>' +
      '<button type="button" data-v="yes" class="ba-cookie-yes">Akceptuję</button></div>';
    d.addEventListener('click', function (e) {
      var v = e.target.getAttribute && e.target.getAttribute('data-v');
      if (!v) return;
      store(v);
      consent(v === 'yes');
      d.remove();
    });
    document.body.appendChild(d);
  }
  window.baCookieSettings = function () { banner(); };

  function init() {
    if (read() === null && !/polityka-cookies/.test(location.pathname)) banner();
    var pp = document.querySelector('a[href*="1MoMojy1sLg7dtYYBq4965WhR7jFy95O6"]');
    if (pp && !document.getElementById('ba-cookie-link')) {
      var mk = function (id, text, href) {
        var a = document.createElement('a');
        a.id = id; a.href = href; a.className = 'custom_link'; a.textContent = text;
        a.style.cssText = 'display:block;margin-top:6px;color:var(--neutral1)';
        return a;
      };
      var s = mk('ba-cookie-link', 'Ustawienia cookie', '#');
      s.addEventListener('click', function (e) { e.preventDefault(); banner(); });
      pp.parentNode.appendChild(mk('ba-cookie-policy', 'Polityka cookies', POLICY));
      pp.parentNode.appendChild(s);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
