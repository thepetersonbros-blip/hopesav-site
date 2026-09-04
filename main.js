/* Hope Bible Church — Mockup Option 2: Coastal Light */
(function () {
  'use strict';

  /* Demo override: visiting any page once with ?motion=1 forces full motion
     for the whole session, even if the device has "reduce motion" enabled.
     Lets the site be demoed on phones with the accessibility setting on. */
  if (/[?&]motion=1/.test(window.location.search)) {
    try { sessionStorage.setItem('forceMotion', '1'); } catch (e) {}
  }
  var forceMotion = false;
  try { forceMotion = sessionStorage.getItem('forceMotion') === '1'; } catch (e) {}
  if (forceMotion) document.documentElement.classList.add('force-motion');

  var prefersReduced = !forceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: transparent over hero, cream on scroll ---------- */
  var header = document.getElementById('siteHeader');
  function onHeaderScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
  }
  onHeaderScroll();
  window.addEventListener('scroll', onHeaderScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Dropdowns: hover works via CSS; click/tap toggles ---------- */
  var dropBtns = document.querySelectorAll('.has-dropdown > .nav-drop-btn');
  dropBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.parentElement;
      var willOpen = !li.classList.contains('open');
      document.querySelectorAll('.has-dropdown.open').forEach(function (o) {
        o.classList.remove('open');
        var b = o.querySelector('.nav-drop-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      li.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown.open').forEach(function (o) {
        o.classList.remove('open');
        var b = o.querySelector('.nav-drop-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ---------- Hero headline: word-by-word rise (all pages, mobile + desktop) ---------- */
  if (!prefersReduced) {
    document.querySelectorAll('.hero h1').forEach(function (h1) {
      var delay = 0.12;
      var step = 0.075;

      function wrapWords(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            /* text node: wrap each word, keep the whitespace between them */
            var parts = child.textContent.split(/(\s+)/);
            if (!parts.length) return;
            var frag = document.createDocumentFragment();
            parts.forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(part));
                return;
              }
              var w = document.createElement('span');
              w.className = 'hw';
              w.style.animationDelay = delay.toFixed(3) + 's';
              delay += step;
              w.textContent = part;
              frag.appendChild(w);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1) {
            /* element node (.hero-line wrappers, .serif-italic, etc.): recurse */
            wrapWords(child);
          }
        });
      }

      wrapWords(h1);
      h1.classList.add('words-split');

      /* eyebrow / sub-headline / meta / CTA buttons follow the headline words */
      var hero = h1.closest('.hero');
      if (hero) {
        var after = delay + 0.2;
        hero.querySelectorAll('.hero-fade').forEach(function (el, i) {
          el.style.animationDelay = (after + i * 0.14).toFixed(3) + 's';
        });
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .scripture[data-quote-reveal]');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (e) { return e.isIntersecting; });
      visible.forEach(function (entry, i) {
        io.unobserve(entry.target);
        /* small stagger so batches (e.g. everything in view at load) cascade in */
        setTimeout(function () { entry.target.classList.add('in'); }, i * 80);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    /* lets dynamically added elements (e.g. announcement cards) join the reveal system */
    window.__coastalObserve = function (el) { io.observe(el); };
  }

  /* ---------- Scripture pull-quotes: word-by-word line reveal ---------- */
  document.querySelectorAll('.scripture[data-quote-reveal]').forEach(function (q) {
    if (prefersReduced) return;
    var words = q.textContent.trim().split(/\s+/);
    q.textContent = '';
    words.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'qw';
      span.style.transitionDelay = (i * 42) + 'ms';
      span.textContent = word;
      q.appendChild(span);
      q.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Slow parallax drift on hero / band images ---------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (!prefersReduced && parallaxEls.length) {
    var ticking = false;
    var updateParallax = function () {
      parallaxEls.forEach(function (el) {
        var host = el.parentElement || el;
        var rect = host.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        var center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = 'translateY(' + (center * -speed).toFixed(1) + 'px)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Mock form handling + toast ---------- */
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 4200);
  }
  /* ---------- Forms: contact + newsletter ----------
     Submissions go to Web3Forms (free, no server needed) and land in the
     church inbox tied to the access key. Get a key at https://web3forms.com
     (enter the church email, the key arrives by email) and paste it below.
     Until a key is set, the form opens the visitor's email app instead,
     with the message pre-filled, so nothing is ever silently lost. */
  var FORM_ACCESS_KEY = '';
  var FORM_FALLBACK_EMAIL = 'david@hopesav.com';
  document.querySelectorAll('form.site-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var isNews = form.classList.contains('newsletter-form');
      var fd = new FormData(form);
      var first = fd.get('first-name') || '';
      var last = fd.get('last-name') || '';
      var email = fd.get('email') || '';
      var msg = fd.get('message') || '';
      var subject = isNews ? 'Email list signup: ' + first : 'Website message from ' + (first + ' ' + last).trim();
      if (!FORM_ACCESS_KEY) {
        var body = isNews
          ? 'Please add me to the Hope Bible Church email list.\n\nName: ' + first + '\nEmail: ' + email
          : 'Name: ' + first + ' ' + last + '\nEmail: ' + email + '\n\n' + msg;
        window.location.href = 'mailto:' + FORM_FALLBACK_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        showToast('Opening your email app to send this.');
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending\u2026'; }
      fd.append('access_key', FORM_ACCESS_KEY);
      fd.append('subject', subject);
      fd.append('from_name', 'Hope Bible Church website');
      if (email) fd.append('replyto', email);
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || !d.success) throw new Error('send failed');
          showToast(isNews ? 'You are on the list. Thank you!' : 'Thank you! Your message was sent.');
          form.reset();
        })
        .catch(function () {
          showToast('Something went wrong. Please email ' + FORM_FALLBACK_EMAIL + ' instead.');
        })
        .then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
    });
  });

  /* ---------- Sermons: series grid loads SoundCloud player ---------- */
  var seriesGrid = document.getElementById('seriesGrid');
  if (seriesGrid) {
    var playerTitle = document.getElementById('playerTitle');
    var playerArt = document.getElementById('playerArt');
    var playerFrame = document.getElementById('playerFrame');
    var playerWrap = document.getElementById('seriesPlayer');
    var cards = Array.prototype.slice.call(seriesGrid.querySelectorAll('.series-card'));

    function loadSeries(card, scroll) {
      cards.forEach(function (c) { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      card.classList.add('active');
      card.setAttribute('aria-pressed', 'true');
      var id = card.getAttribute('data-playlist');
      var title = card.getAttribute('data-title');
      var art = card.querySelector('img');
      playerTitle.textContent = title;
      if (art) { playerArt.src = art.src; playerArt.alt = title + ' sermon series artwork'; }
      playerFrame.title = title + ' sermon series on SoundCloud';
      playerWrap.classList.add('expanded');
      var noteEl = document.getElementById('playerNote');
      if (noteEl) noteEl.textContent = title + ' series playlist · Reload the page to hear the latest sermon.';
      /* Load the playlist only after the box finishes growing: the SoundCloud
         widget sizes its layout once at load, and loading mid-animation makes
         it render in its tiny-player mode. */
      var newSrc = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' + id +
        '&color=%23de7454&auto_play=false&show_teaser=false&visual=false';
      if (prefersReduced) { playerFrame.src = newSrc; }
      else { setTimeout(function () { playerFrame.src = newSrc; }, 360); }
      if (scroll) playerWrap.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () { loadSeries(card, true); });
    });

    /* No auto-load: the page pins the newest sermon (latest-sermon.json);
       clicking a series card below swaps the player to that playlist. */

    /* Simple series filter (search) */
    var filterInput = document.getElementById('seriesFilter');
    if (filterInput) {
      filterInput.addEventListener('input', function () {
        var q = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var match = card.getAttribute('data-title').toLowerCase().indexOf(q) !== -1;
          card.style.display = match ? '' : 'none';
        });
      });
    }
  }

  /* ---------- Announcements: driven by a shared Google Sheet ----------
     How it works:
     - Church staff edit a Google Sheet (tab "Announcements", columns:
       Title | When | Details | Link). Share it "Anyone with the link: Viewer".
     - Every page load fetches the sheet as CSV and renders the cards below.
     - Fallback chain: live sheet -> last good copy (localStorage) ->
       built-in demo rows (while no sheet is connected) -> friendly message.
     To connect the real sheet, paste its ID between the quotes: */
  var ANNC_SHEET_ID = '1Rh6HkYWKDfci81YBtaDqev_2fYPLMQfUjtXJejdN4A0';
  var ANNC_SHEET_TAB = 'Announcements';

  var ANNC_DEMO = [
    { title: 'Church Picnic at Lake Mayer', when: 'Sat, July 25 · 11 AM', details: 'Bring a side dish to share. Burgers, hot dogs, and drinks provided. Games for the kids!', link: '' },
    { title: 'Hope Kids VBS Signups Open', when: 'July 28–31', details: 'Vacation Bible School for kids 4–12. Sign up at the welcome table on Sunday.', link: '' },
    { title: 'Quarterly Members Meeting', when: 'Sun, Aug 2 · After Service', details: 'All members are encouraged to stay for the quarterly meeting in the fellowship hall.', link: '' }
  ];

  var anncGrid = document.getElementById('anncGrid');
  if (anncGrid) {
    var renderAnnc = function (rows) {
      if (!rows || !rows.length) return false;
      anncGrid.innerHTML = '';
      rows.slice(0, 6).forEach(function (r, i) {
        var card = document.createElement('article');
        card.className = 'annc-card reveal reveal-d' + Math.min(i, 3);
        if (r.when) {
          var when = document.createElement('p');
          when.className = 'annc-when'; when.textContent = r.when; card.appendChild(when);
        }
        var h = document.createElement('h3'); h.textContent = r.title; card.appendChild(h);
        if (r.details) { var p = document.createElement('p'); p.textContent = r.details; card.appendChild(p); }
        if (r.link) {
          var a = document.createElement('a'); a.href = r.link; a.textContent = 'Learn more';
          a.rel = 'noopener'; card.appendChild(a);
        }
        anncGrid.appendChild(card);
        if (window.__coastalObserve) window.__coastalObserve(card); else card.classList.add('in');
      });
      return true;
    };

    // minimal CSV parser (handles quoted fields with commas/newlines)
    var parseCSV = function (text) {
      var rows = [], row = [], cur = '', inQ = false;
      for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (inQ) {
          if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
          else cur += c;
        } else if (c === '"') inQ = true;
        else if (c === ',') { row.push(cur); cur = ''; }
        else if (c === '\n' || c === '\r') {
          if (cur !== '' || row.length) { row.push(cur); rows.push(row); row = []; cur = ''; }
          if (c === '\r' && text[i + 1] === '\n') i++;
        } else cur += c;
      }
      if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
      return rows;
    };

    var showFallback = function () {
      try {
        var cached = JSON.parse(localStorage.getItem('hopeAnnc') || 'null');
        if (renderAnnc(cached)) return;
      } catch (e) {}
      if (renderAnnc(ANNC_DEMO)) return;
      anncGrid.innerHTML = '<p class="annc-fallback">Announcements are updating, check back soon.</p>';
    };

    if (!ANNC_SHEET_ID) {
      showFallback(); // demo rows until the real sheet is connected
    } else {
      var url = 'https://docs.google.com/spreadsheets/d/' + ANNC_SHEET_ID +
        '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(ANNC_SHEET_TAB);
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 6000);
      fetch(url, ctrl ? { signal: ctrl.signal } : {})
        .then(function (res) { if (!res.ok) throw new Error(res.status); return res.text(); })
        .then(function (text) {
          if (timer) clearTimeout(timer);
          var rows = parseCSV(text);
          var head = (rows.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
          var idx = {
            title: head.indexOf('title'), when: head.indexOf('when'),
            details: head.indexOf('details'), link: head.indexOf('link')
          };
          var items = rows.map(function (r) {
            return {
              title: (idx.title > -1 ? r[idx.title] : '') || '',
              when: (idx.when > -1 ? r[idx.when] : '') || '',
              details: (idx.details > -1 ? r[idx.details] : '') || '',
              link: (idx.link > -1 ? r[idx.link] : '') || ''
            };
          }).filter(function (r) { return r.title.trim(); });
          if (renderAnnc(items)) {
            try { localStorage.setItem('hopeAnnc', JSON.stringify(items)); } catch (e) {}
          } else showFallback();
        })
        .catch(function () { if (timer) clearTimeout(timer); showFallback(); });
    }
  }
})();
