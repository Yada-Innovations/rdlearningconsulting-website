/* =============================================================
   RD Learning & Consulting — Main JS
   Mobile nav · Scroll animations · Nav scroll state · FAQ
   ============================================================= */

(function () {
  'use strict';

  /* ---- NAV SCROLL STATE ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- MOBILE NAV TOGGLE ---- */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileNav = document.querySelector('.nav__mobile');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('.nav__mobile-link, .nav__mobile-cta').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---- ACTIVE NAV LINK ---- */
  const path = window.location.pathname;
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const isHome = (href === '/' || href === '/index.html') && (path === '/' || path === '/index.html');
    const isMatch = !isHome && path.startsWith(href.replace(/\/$/, ''));
    if (isHome || isMatch) link.classList.add('active');
  });

  /* ---- SCROLL REVEAL ANIMATION ---- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else {
    // Fallback: show all
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ---- FAQ ACCORDION ---- */
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked (unless it was already open)
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- SCROLL PROGRESS BAR ---- */
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    const updateProgress = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---- STATS COUNTER ANIMATION ---- */
  const statNums = document.querySelectorAll('.stats-bar__num');
  if (statNums.length && 'IntersectionObserver' in window) {
    function animateCounter(el, target, duration) {
      const start = performance.now();
      // Preserve suffix (e.g. "+", "%") stored in a data attribute or trailing text node
      const suffix = el.dataset.suffix || '';
      const update = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = Math.round(eased * target);
        el.textContent = val + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Read target from data-target or current text content
          const raw = el.dataset.target || el.textContent.replace(/\D/g, '');
          const target = parseInt(raw, 10);
          if (!isNaN(target)) {
            // Store suffix (anything after digits) if not already set
            if (!el.dataset.suffix) {
              el.dataset.suffix = el.textContent.replace(/[\d,]/g, '').trim();
            }
            animateCounter(el, target, 1800);
          }
          statsObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNums.forEach(el => statsObserver.observe(el));
  }

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---- CONTACT FORM ---- */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      // If using Netlify Forms, this fires normally.
      // Add client-side validation here if desired.
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#e53e3e';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) {
        e.preventDefault();
        form.querySelector('[required]:invalid, [required][style*="e53e3e"]')?.focus();
      }
    });
  }

})();
