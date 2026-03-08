/* ===== SCROLL PROGRESS BAR ===== */
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

/* ===== NAVBAR + SCROLL HANDLER ===== */
const navbar  = document.getElementById('navbar');
const bttBtn  = document.getElementById('bttBtn');
const sections = ['home', 'about', 'skills', 'testimonials', 'contact'];
const navAs   = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const y     = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;

  // Progress bar
  progressBar.style.transform = `scaleX(${y / total})`;

  // Navbar
  navbar.classList.toggle('scrolled', y > 50);
  bttBtn.classList.toggle('visible', y > 300);

  // Active nav link
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 120) current = id;
  });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
}, { passive: true });

/* ===== WORD SPLIT ===== */
function splitWords(el) {
  let idx = 0;

  function processNode(node, container) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(' ').forEach((word, i, arr) => {
        if (!word) return;
        const outer = document.createElement('span');
        outer.className = 'word-outer';
        const inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.textContent = word;
        inner.style.transitionDelay = `${idx++ * 0.07}s`;
        outer.appendChild(inner);
        container.appendChild(outer);
        // Preserve space between words (not after last word)
        if (i < arr.length - 1) container.appendChild(document.createTextNode(' '));
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        container.appendChild(document.createElement('br'));
      } else {
        // Recreate element (e.g. <em>) and recurse into its children
        const clone = document.createElement(node.tagName);
        Array.from(node.attributes).forEach(a => clone.setAttribute(a.name, a.value));
        Array.from(node.childNodes).forEach(child => processNode(child, clone));
        container.appendChild(clone);
      }
    }
  }

  const children = Array.from(el.childNodes);
  el.innerHTML = '';
  children.forEach(child => processNode(child, el));
  el.classList.add('words-split');
}

document.querySelectorAll('.section-title').forEach(el => splitWords(el));

/* ===== SCROLL REVEAL ===== */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // Trigger word animations on any split titles inside this reveal block
      e.target.querySelectorAll('.words-split').forEach(el => {
        el.classList.add('words-visible');
      });
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ===== CAROUSEL ===== */
const track    = document.getElementById('carouselTrack');
const dotsWrap = document.getElementById('carouselDots');
const slides   = track.querySelectorAll('.testi-card');
let cur = 0, timer;

slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.className = 'dot' + (i === 0 ? ' active' : '');
  b.setAttribute('aria-label', `Slide ${i + 1}`);
  b.addEventListener('click', () => { goTo(i); resetTimer(); });
  dotsWrap.appendChild(b);
});

function goTo(n) {
  cur = (n + slides.length) % slides.length;
  track.style.transform = `translateX(-${cur * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur));
}

function resetTimer() { clearInterval(timer); timer = setInterval(() => goTo(cur + 1), 5000); }

document.getElementById('prevBtn').addEventListener('click', () => { goTo(cur - 1); resetTimer(); });
document.getElementById('nextBtn').addEventListener('click', () => { goTo(cur + 1); resetTimer(); });

// Touch swipe
let tx = 0;
track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const d = tx - e.changedTouches[0].clientX;
  if (Math.abs(d) > 48) { goTo(d > 0 ? cur + 1 : cur - 1); resetTimer(); }
});

resetTimer();

/* ===== COPY EMAIL ===== */
function copyEmail() {
  const email = document.getElementById('emailText').textContent.trim();
  navigator.clipboard.writeText(email).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2200);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = email; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  });
}

/* ===== NUMBER COUNTER (about tag) ===== */
const aboutTag = document.querySelector('.about-tag');
if (aboutTag) {
  const counterObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      const end = 6, duration = 1400, t0 = performance.now();
      const tick = now => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        aboutTag.textContent = `${Math.round(eased * end)}+ Years ✦`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObs.disconnect();
    }
  }, { threshold: 0.8 });
  counterObs.observe(aboutTag);
}
