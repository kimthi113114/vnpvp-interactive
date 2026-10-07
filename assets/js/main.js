/**
 * VNPVP Interactive Corporation - Main Application Scripts
 * Smooth UI interactions, terminal emulator, card spotlights & animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTerminalTabs();
  initSpotlightEffect();
  initStatsCounter();
  initFaqAccordion();
  initCopyButtons();
});

// 1. Mobile Menu Drawer
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
    setTimeout(() => {
      mobileMenu.classList.remove('opacity-0', '-translate-y-4');
    }, 10);
  });

  function closeMenu() {
    mobileMenu.classList.add('opacity-0', '-translate-y-4');
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
    }, 200);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  links.forEach(l => l.addEventListener('click', closeMenu));
}

// 2. Interactive Terminal Tab Selector
function initTerminalTabs() {
  const commands = {
    curl: 'curl -fsSL https://openforge.vnpvp.org/install.sh | bash',
    npm: 'npm install -g @vnpvp/forge-cli',
    cargo: 'cargo install vnpvp-forge',
    brew: 'brew install vnpvp/tap/forge',
    docker: 'docker pull ghcr.io/vnpvp/devsuite:latest'
  };

  const tabs = document.querySelectorAll('.term-tab');
  const cmdDisplay = document.getElementById('terminal-command');
  const copyBtn = document.getElementById('terminal-copy-btn');

  let activeKey = 'curl';

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-white/10', 'text-cyan-400', 'border-cyan-400');
        t.classList.add('text-slate-400', 'border-transparent');
      });

      tab.classList.add('bg-white/10', 'text-cyan-400', 'border-cyan-400');
      tab.classList.remove('text-slate-400', 'border-transparent');

      activeKey = tab.dataset.cmd;
      if (cmdDisplay && commands[activeKey]) {
        cmdDisplay.textContent = commands[activeKey];
      }
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = commands[activeKey] || (cmdDisplay ? cmdDisplay.textContent : '');
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
          showToast(`Command copied: ${activeKey}`);
        }
      });
    });
  }
}

// 3. Card Spotlight / Radial Cursor Glow
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

// 4. Metric Counter Animation
function initStatsCounter() {
  const counters = document.querySelectorAll('.counter-val');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1600;
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = formatCounterValue(target, counter.dataset.suffix || '');
              clearInterval(timer);
            } else {
              counter.textContent = formatCounterValue(Math.floor(current), counter.dataset.suffix || '');
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.2 });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) observer.observe(statsSection);
}

function formatCounterValue(val, suffix) {
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1) + 'M' + suffix;
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(0) + 'k' + suffix;
  }
  return val + suffix;
}

// 5. FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (!header || !content) return;

    header.addEventListener('click', () => {
      const isOpen = !content.classList.contains('hidden');

      // Close all others
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

// 6. Generic Copy Buttons
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-copy');
      if (val) {
        navigator.clipboard.writeText(val).then(() => {
          if (typeof showToast === 'function') {
            showToast('Copied to clipboard!');
          }
        });
      }
    });
  });
}
