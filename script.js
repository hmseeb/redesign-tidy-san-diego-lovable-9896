/* JD Junk Removal — site interactions */
(function () {
  'use strict';

  var ENDPOINT = 'https://vision.leadrai.com/api/forms/7ec757b05add3bfae41e8f1af092c8c2';

  /* ---------- current year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- hidden _page field ---------- */
  var pageField = document.getElementById('pageField');
  if (pageField) pageField.value = window.location.href;

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- header shadow on scroll ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.service-card, .steps li, .contact-card, .section-head, .area-cta, .form-card, .quote-copy, .process-intro, .chips'
  );
  if ('IntersectionObserver' in window && revealTargets.length) {
    var pending = [];

    var show = function (el) {
      if (el.classList.contains('visible')) return;
      el.classList.add('visible');
      io.unobserve(el);
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) show(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    Array.prototype.forEach.call(revealTargets, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      pending.push(el);
      io.observe(el);
    });

    /* Safety sweep: reveal anything that has entered or already scrolled past
       the viewport. IntersectionObserver samples asynchronously and can miss
       elements during fast or programmatic scrolling, which would otherwise
       leave a whole section stuck at opacity 0. */
    var ticking = false;
    var sweep = function () {
      ticking = false;
      var h = window.innerHeight || document.documentElement.clientHeight;
      pending = pending.filter(function (el) {
        if (el.classList.contains('visible')) return false;
        if (el.getBoundingClientRect().top < h) { show(el); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', onSweep);
        window.removeEventListener('resize', onSweep);
      }
    };
    var onSweep = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sweep);
    };

    window.addEventListener('scroll', onSweep, { passive: true });
    window.addEventListener('resize', onSweep);
    onSweep();

    /* Last-resort fallback: never leave content permanently invisible. */
    window.addEventListener('load', function () {
      setTimeout(function () {
        Array.prototype.forEach.call(revealTargets, show);
      }, 2500);
    });
  } else {
    Array.prototype.forEach.call(revealTargets, function (el) {
      el.classList.add('visible');
    });
  }

  /* ---------- quote form ---------- */
  var form = document.getElementById('quoteForm');
  var status = document.getElementById('formStatus');
  var errorEl = document.getElementById('formError');
  var submitBtn = document.getElementById('submitBtn');

  function showConfirmation(scroll) {
    if (!status) return;
    status.hidden = false;
    if (form) form.hidden = true;
    if (scroll) {
      status.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* Plain (no-JS) submissions come back with ?submitted=1 */
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('submitted') === '1') showConfirmation(true);
  } catch (err) { /* older browsers: form still works without this */ }

  function markInvalid(field, bad) {
    if (!field) return;
    field.classList.toggle('invalid', !!bad);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      var nameField = form.querySelector('[name="name"]');
      var phoneField = form.querySelector('[name="phone"]');
      var detailsField = form.querySelector('[name="What are we hauling"]');

      var missing = false;
      [nameField, phoneField, detailsField].forEach(function (f) {
        var bad = !f || !f.value.trim();
        markInvalid(f, bad);
        if (bad) missing = true;
      });

      if (missing) {
        e.preventDefault();
        if (errorEl) {
          errorEl.hidden = false;
          errorEl.textContent = 'Please add your name, phone number, and what we are hauling.';
        }
        var firstBad = form.querySelector('.invalid');
        if (firstBad) firstBad.focus();
        return;
      }

      if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

      /* Progressive enhancement: submit via fetch when available.
         Without JS (or if fetch fails) the plain POST below still works. */
      if (typeof window.fetch !== 'function') return;

      e.preventDefault();

      if (pageField) pageField.value = window.location.href;

      var payload = {};
      var data = new FormData(form);
      data.forEach(function (value, key) { payload[key] = value; });
      payload._page = window.location.href;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: res.ok }; });
        })
        .then(function (json) {
          if (json && json.ok) {
            showConfirmation(true);
            form.reset();
          } else {
            throw new Error('Submission rejected');
          }
        })
        .catch(function () {
          if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Sorry, that did not send. Please call (760) 710-9309 and we will take care of it.';
          }
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Request';
          }
        });
    });

    /* clear the invalid state as the visitor types */
    form.addEventListener('input', function (e) {
      if (e.target.classList && e.target.classList.contains('invalid') && e.target.value.trim()) {
        e.target.classList.remove('invalid');
      }
    });
  }
})();
