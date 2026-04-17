(function () {
  'use strict';

  /* ============================================================
     MOBILE DETECTION
  ============================================================ */
  function isMobile() {
    return window.innerWidth <= 768;
  }

  /* ============================================================
     1. HORIZONTAL SCROLL ENGINE (desktop only)
  ============================================================ */
  const track        = document.getElementById('track');
  const progressFill = document.getElementById('progressFill');
  let currentX = 0;

  function setDocumentHeight() {
    if (isMobile()) {
      document.body.style.height = '';
      track.style.transform = 'none';
      return;
    }
    const totalWidth = track.scrollWidth;
    const vw         = window.innerWidth;
    const vh         = window.innerHeight;
    document.body.style.height = `${totalWidth - vw + vh}px`;
  }

  function animateScroll() {
    if (isMobile()) {
      track.style.transform = 'none';
      if (progressFill) progressFill.style.width = '0%';
      requestAnimationFrame(animateScroll);
      return;
    }
    const targetX    = window.scrollY;
    const maxScrollY = document.body.scrollHeight - window.innerHeight;
    currentX += (targetX - currentX) * 0.1;
    if (Math.abs(currentX - targetX) < 0.05) currentX = targetX;
    track.style.transform = `translateX(${-currentX}px)`;
    const pct = maxScrollY > 0 ? (currentX / maxScrollY) * 100 : 0;
    if (progressFill) progressFill.style.width = `${Math.min(pct, 100)}%`;
    requestAnimationFrame(animateScroll);
  }

  window.addEventListener('resize', () => {
    setDocumentHeight();
    if (!isMobile()) currentX = window.scrollY;
  });

  setDocumentHeight();
  animateScroll();

  /* ============================================================
     2. PANEL NAVIGATION
  ============================================================ */
  window.scrollToPanel = function (id) {
    const panel = document.getElementById(id);
    if (!panel) return;
    if (isMobile()) {
      panel.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: panel.offsetLeft, behavior: 'smooth' });
  };

  /* ============================================================
     3. HERO WORD CYCLER
  ============================================================ */
  const words = document.querySelectorAll('.hero-word');
  let wordIndex = 0;

  if (words.length > 0) {
    function cycleWord() {
      const current = words[wordIndex];
      const next    = words[(wordIndex + 1) % words.length];
      current.classList.remove('active');
      current.classList.add('exiting');
      setTimeout(() => {
        current.classList.remove('exiting');
        wordIndex = (wordIndex + 1) % words.length;
        next.classList.add('active');
      }, 550);
    }
    setInterval(cycleWord, 2600);
  }

  /* ============================================================
     4. FAQ ACCORDION
  ============================================================ */
  document.querySelectorAll('.faq-question').forEach(function (q) {
    q.addEventListener('click', function () {
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ============================================================
     5. KEYBOARD NAVIGATION (desktop only)
  ============================================================ */
  const panels = [
    'panel-hero', 'panel-work', 'panel-static',
    'panel-motion', 'panel-about', 'panel-contact'
  ];

  function getCurrentPanelIndex() {
    const scrollY = window.scrollY;
    let closest   = 0;
    let closestDist = Infinity;
    panels.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const dist = Math.abs(el.offsetLeft - scrollY);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    return closest;
  }

  document.addEventListener('keydown', function (e) {
    if (isMobile()) return;
    const idx = getCurrentPanelIndex();
    if (e.key === 'ArrowRight' && idx < panels.length - 1) {
      scrollToPanel(panels[idx + 1]);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      scrollToPanel(panels[idx - 1]);
    } else if (e.key === 'Home') {
      scrollToPanel(panels[0]);
    } else if (e.key === 'End') {
      scrollToPanel(panels[panels.length - 1]);
    }
  });

  /* ============================================================
     6. SCROLL ARROW
  ============================================================ */
  const scrollArrow = document.getElementById('scrollArrow');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', function () {
      scrollToPanel('panel-work');
    });
  }

  /* ============================================================
     7. CUSTOM CURSOR (desktop only)
  ============================================================ */
  if (!isMobile()) {
    const cursorStyles = `
      .cursor-dot {
        position: fixed; top: 0; left: 0;
        width: 8px; height: 8px;
        background: #1a1a1a;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s, background 0.3s;
        opacity: 0;
      }
      .cursor-dot.visible { opacity: 1; }
      .cursor-dot.hover {
        width: 36px; height: 36px;
        background: transparent;
        border: 1px solid #1a1a1a;
      }
    `;
    const styleTag = document.createElement('style');
    styleTag.textContent = cursorStyles;
    document.head.appendChild(styleTag);

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.classList.add('visible');
    });
    document.addEventListener('mouseleave', () => dot.classList.remove('visible'));

    document.querySelectorAll('a, button, .work-half, .work-item, .static-card, .motion-card').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('hover'));
      el.addEventListener('mouseleave', () => dot.classList.remove('hover'));
    });

    (function moveCursor() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      dot.style.left = `${cx}px`;
      dot.style.top  = `${cy}px`;
      requestAnimationFrame(moveCursor);
    })();
  }

  /* ============================================================
     8. IMAGE LIGHTBOX
  ============================================================ */
  window.openLightbox = function (src, title) {
    const lb    = document.getElementById('lightbox');
    const img   = document.getElementById('lb-img');
    const label = document.getElementById('lb-title');
    img.src     = src;
    img.alt     = title;
    label.textContent = title;
    lb.classList.add('open');
  };

  window.closeLightbox = function () {
    const lb  = document.getElementById('lightbox');
    const img = document.getElementById('lb-img');
    lb.classList.remove('open');
    setTimeout(() => { img.src = ''; }, 400);
  };

  /* ============================================================
     9. VIDEO MODAL
  ============================================================ */
  window.openVideoModal = function (src) {
    const vm  = document.getElementById('videoModal');
    const vid = document.getElementById('vm-video');
    vid.src   = src;
    vm.classList.add('open');
    vid.play();
  };

  window.closeVideoModal = function () {
    const vm  = document.getElementById('videoModal');
    const vid = document.getElementById('vm-video');
    vm.classList.remove('open');
    vid.pause();
    setTimeout(() => { vid.src = ''; }, 400);
  };

  /* Video card hover preview (desktop only) */
  if (!isMobile()) {
    document.querySelectorAll('.motion-card-video').forEach(function (card) {
      const video = card.querySelector('video');
      if (!video) return;
      card.addEventListener('mouseenter', function () {
        video.play().catch(function () {});
      });
      card.addEventListener('mouseleave', function () {
        video.pause();
        video.currentTime = 0;
      });
    });
  }

  /* ============================================================
     10. ESCAPE KEY — closes any open modal
  ============================================================ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeLightbox();
      closeVideoModal();
    }
  });

  /* ============================================================
     11. RECALCULATE ON LOAD
  ============================================================ */
  if (document.fonts) document.fonts.ready.then(setDocumentHeight);
  window.addEventListener('load', () => {
    setDocumentHeight();
    if (!isMobile()) currentX = window.scrollY;
  });

})();