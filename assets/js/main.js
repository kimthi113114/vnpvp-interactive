/**
 * VNPVP Interactive Corporation - Enhanced Animations & UI Dynamics
 * Features:
 * - Live auto-typing terminal simulation with command cycling
 * - Scroll-triggered reveal animations (IntersectionObserver)
 * - 3D card tilt & spotlight micro-interactions
 * - Smooth FAQ accordion & interactive copy helpers
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTypingTerminal();
  initScrollReveal();
  initCard3DTilt();
  initSpotlightEffect();
  initStatsCounter();
  initFaqAccordion();
  initCopyButtons();
});

// 1. Mobile Menu Drawer
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  links.forEach(l => {
    l.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

// 2. Live Auto-Typing Terminal Simulation
function initTypingTerminal() {
  const cmdElem = document.getElementById('terminal-command');
  const outputElem = document.getElementById('terminal-output');
  const copyBtn = document.getElementById('terminal-copy-btn');
  if (!cmdElem) return;

  const scenarios = [
    {
      cmd: "git clone https://github.com/kimthi113114/vnpvp-interactive.git",
      logs: [
        '<span class="text-slate-300">[INFO] VNPVP Interactive Corporation &mdash; Initial Architecture Sprint</span>',
        '<span class="text-amber-300/90">&bull; Stage: Core Parser & AST Synthesis Engine in active implementation</span>',
        '<span class="text-slate-400">&bull; Non-Profit Charter: 100% Free, Permissive MIT License, Zero Commercial Telemetry</span>',
        '<span class="text-emerald-400">&check; Milestone 1 Complete: System Blueprint & In-Browser Prototype Verified</span>',
        '<span class="text-cyan-300">&gt; Target Release: Q4 2026 Developer Early Access</span>'
      ]
    },
    {
      cmd: "forge build --monorepo --release",
      logs: [
        '<span class="text-cyan-400">[FORGE] Analyzing 12 local packages with zero-telemetry engine...</span>',
        '<span class="text-slate-300">&bull; Constructing deterministic DAG build pipeline</span>',
        '<span class="text-emerald-400">&check; Rust core compiler executed in 42ms (zero cloud dependencies)</span>',
        '<span class="text-slate-400">&bull; All binaries verified: 0 bytes outbound tracking detected</span>'
      ]
    },
    {
      cmd: "mock-edge --contract ./openapi.yaml --port 8080",
      logs: [
        '<span class="text-indigo-400">[MOCK-EDGE] Initializing offline API simulation engine...</span>',
        '<span class="text-slate-300">&bull; Loaded 28 endpoints with OpenAPI 3.1 strict schema validation</span>',
        '<span class="text-emerald-400">&check; Mock server ready on http://127.0.0.1:8080 (0.1ms latency)</span>'
      ]
    },
    {
      cmd: "pulse analyze ./src --strict --complexity-limit 15",
      logs: [
        '<span class="text-purple-400">[PULSE-AST] Scanning Abstract Syntax Tree across 142 source files...</span>',
        '<span class="text-slate-300">&bull; Cognitive complexity score: 98.4% optimal</span>',
        '<span class="text-emerald-400">&check; Zero circular dependencies found. Ready for review.</span>'
      ]
    }
  ];

  let currentScenario = 0;
  let charIdx = 0;
  let isDeleting = false;
  let isPaused = false;
  let currentCmd = scenarios[0].cmd;

  function typeStep() {
    if (isPaused) {
      setTimeout(typeStep, 300);
      return;
    }

    const targetText = scenarios[currentScenario].cmd;

    if (!isDeleting) {
      charIdx++;
      cmdElem.innerHTML = targetText.slice(0, charIdx) + '<span class="cursor-caret"></span>';

      if (charIdx === targetText.length) {
        currentCmd = targetText;
        if (outputElem && scenarios[currentScenario].logs) {
          outputElem.innerHTML = scenarios[currentScenario].logs.map(l => `<p>${l}</p>`).join('');
        }
        // Pause at full text
        setTimeout(() => {
          isDeleting = true;
          typeStep();
        }, 4000);
        return;
      }
      setTimeout(typeStep, 45 + Math.random() * 30);
    } else {
      charIdx--;
      cmdElem.innerHTML = targetText.slice(0, charIdx) + '<span class="cursor-caret"></span>';

      if (charIdx === 0) {
        isDeleting = false;
        currentScenario = (currentScenario + 1) % scenarios.length;
        setTimeout(typeStep, 600);
        return;
      }
      setTimeout(typeStep, 20);
    }
  }

  typeStep();

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentCmd).then(() => {
        if (typeof showToast === 'function') {
          showToast(`Đã sao chép: ${currentCmd}`);
        }
      });
    });
  }
}

// 3. Scroll Reveal Animation (IntersectionObserver)
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// 4. Interactive 3D Tilt Effect on Cards
function initCard3DTilt() {
  const cards = document.querySelectorAll('.glass-card');
  if (window.innerWidth < 768) return; // Disable on touch mobile for battery

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

// 5. Card Spotlight Cursor Coordinates
function initSpotlightEffect() {
  const cards = document.querySelectorAll('.spotlight-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// 6. Smooth Stats Counter Animation
function initStatsCounter() {
  const counters = document.querySelectorAll('.counter-val');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          if (!target) return;
          const duration = 1500;
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target + (counter.dataset.suffix || '');
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current) + (counter.dataset.suffix || '');
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.2 });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) observer.observe(statsSection);
}

// 7. FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (!header || !content) return;

    header.addEventListener('click', () => {
      const isOpen = !content.classList.contains('hidden');

      faqItems.forEach(other => {
        const otherContent = other.querySelector('.faq-content');
        const otherIcon = other.querySelector('.faq-icon');
        if (otherContent) otherContent.classList.add('hidden');
        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
      });

      if (!isOpen) {
        content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}

// 8. Generic Copy Buttons
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-copy');
      if (val) {
        navigator.clipboard.writeText(val).then(() => {
          if (typeof showToast === 'function') {
            showToast('Đã sao chép vào bộ nhớ tạm!');
          }
        });
      }
    });
  });
}
