/* ==========================================================================
   APEX ATHLETICS - MAIN JAVASCRIPT
   Edit phone number and WhatsApp message templates below
   ========================================================================== */

/* ========================
   CONFIGURATION (EDITABLE)
   ======================== */
const CONFIG = {
    // Contact details (edit if needed)
    contactEmail: 'princemangukiya105@gmail.com',
    // WhatsApp number — include country code if required by WhatsApp (no + or spaces)
    whatsappNumber: '7039761021',

    // ✏️ Auto-slide interval for testimonials slider (in ms)
    sliderInterval: 5000,
};

/* ========================
   DOM READY INIT
   ======================== */
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initScrollReveal();
    initActiveNavHighlight();
    initTestimonialsSlider();
    initVideoPlayer();
    initWhatsAppLinks();
    initContactForm();
    initSmoothScroll();
});

/* ========================
   HEADER — scroll glass effect
   ======================== */
function initHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    const onScroll = () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
}

/* ========================
   MOBILE MENU
   ======================== */
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const menu   = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    const close = () => {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('active');
        toggle.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close when a nav link is clicked
    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', close);
    });

    // Close when clicking outside menu
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            close();
        }
    });
}

/* ========================
   SCROLL REVEAL ANIMATIONS
   ======================== */
function initScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal');
    if (!elements.length) return;

    // Stagger delay for sibling cards in a grid
    document.querySelectorAll('.about-grid, .plans-grid, .trainers-grid, .gallery-preview-grid').forEach(grid => {
        grid.querySelectorAll('.scroll-reveal').forEach((el, i) => {
            el.style.transitionDelay = `${i * 0.12}s`;
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
}

/* ========================
   ACTIVE NAV LINK ON SCROLL
   ======================== */
function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link');
    if (!sections.length || !links.length) return;

    const onScroll = () => {
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 100;
            if (window.scrollY >= top) current = sec.getAttribute('id');
        });

        links.forEach(link => {
            link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${current}`
            );
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ========================
   TESTIMONIALS SLIDER
   ======================== */
function initTestimonialsSlider() {
    const container = document.getElementById('sliderContainer');
    const dotsWrap  = document.getElementById('sliderDots');
    const prevBtn   = document.getElementById('prevBtn');
    const nextBtn   = document.getElementById('nextBtn');
    if (!container) return;

    const slides = Array.from(container.querySelectorAll('.review-slide'));
    let current  = 0;
    let timer    = null;

    // Build dot indicators
    if (dotsWrap) {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active-dot' : '');
            dot.setAttribute('aria-label', `Go to review ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        });
    }

    const getDots = () => dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];

    function goTo(index) {
        slides[current].classList.remove('active-slide');
        getDots()[current]?.classList.remove('active-dot');

        current = (index + slides.length) % slides.length;

        slides[current].classList.add('active-slide');
        getDots()[current]?.classList.add('active-dot');

        resetTimer();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(next, CONFIG.sliderInterval);
    }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    // Touch / drag swipe support
    let touchStartX = 0;
    container.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener('touchend',   e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    });

    // Keyboard arrow support when slider is in view
    document.addEventListener('keydown', e => {
        const rect = container.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft')  prev();
    });

    // Start auto-slide
    resetTimer();

    // Pause on hover
    container.addEventListener('mouseenter', () => clearInterval(timer));
    container.addEventListener('mouseleave', resetTimer);
}

/* ========================
   VIDEO PLAYER (PLAY / PAUSE toggle)
   ======================== */
function initVideoPlayer() {
    const playBtn   = document.getElementById('playBtn');
    const video     = document.getElementById('trainingVideo');
    const overlay   = document.querySelector('.video-overlay-play');
    if (!playBtn || !video || !overlay) return;

    const source = video.querySelector('#trainingSource');
    const updateVideoSource = () => {
        const portraitSrc = video.dataset.portraitSrc?.trim();
        const landscapeSrc = video.dataset.landscapeSrc?.trim();
        const usePortrait = window.matchMedia('(orientation: portrait)').matches || window.innerWidth <= 768;
        const selectedSrc = usePortrait ? portraitSrc || landscapeSrc : landscapeSrc || portraitSrc;
        if (!selectedSrc || !source) return;
        if (source.getAttribute('src') !== selectedSrc) {
            source.src = selectedSrc;
            video.load();
        }
    };

    updateVideoSource();
    window.addEventListener('resize', updateVideoSource);
    window.addEventListener('orientationchange', updateVideoSource);

    playBtn.addEventListener('click', () => {
        video.style.display = 'block';
        overlay.style.display = 'none';
        video.play().catch(() => {});
    });

    video.addEventListener('ended', () => {
        video.style.display = 'none';
        overlay.style.display = '';
    });
}

/* ========================
   DYNAMIC WHATSAPP LINKS
   Build personalised pre-filled messages from plan data attributes
   ======================== */
function initWhatsAppLinks() {
    const planCards = document.querySelectorAll('.plan-card[data-plan]');
    planCards.forEach(card => {
        const planName = card.dataset.plan || 'a membership';
        const tierEl   = card.querySelector('.plan-tier');
        const amountEl = card.querySelector('.plan-price .amount');
        const tier   = tierEl   ? tierEl.textContent.trim()   : planName;
        const amount = amountEl ? `$${amountEl.textContent.trim()}/mo` : '';

        const message = encodeURIComponent(
            `Hi! I'm interested in the ${tier} (${amount}) membership plan at APEX ATHLETICS. Could you please share more details?`
        );

        const btn = card.querySelector('.whatsapp-btn');
        if (btn) {
            btn.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
        }
    });
}

/* ========================
   CONTACT FORM — mock submit with success state
   ======================== */
function initContactForm() {
    const form       = document.getElementById('contactForm');
    const successMsg = document.getElementById('successMessage');
    const resetBtn   = document.getElementById('resetFormBtn');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.btn-submit');
        const originalHTML = submitBtn.innerHTML;

        // Prepare form data
        const name = (form.querySelector('#formName')?.value || '').trim();
        const email = (form.querySelector('#formEmail')?.value || '').trim();
        const phone = (form.querySelector('#formPhone')?.value || '').trim();
        const plan = (form.querySelector('#formPlan')?.options[form.querySelector('#formPlan').selectedIndex]?.text || '').trim();
        const message = (form.querySelector('#formMessage')?.value || '').trim();
        const method = form.querySelector('input[name="contactMethod"]:checked')?.value || 'email';

        // Build a friendly message
        const bodyText = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nPlan: ${plan}\n\nMessage:\n${message}`;

        // Loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Sending…</span>
        `;

        // Route based on user's preferred contact method
        if (method === 'whatsapp') {
            // Use WhatsApp web link; ensure phone number is correct for your region
            const waNumber = CONFIG.whatsappNumber;
            const waMessage = encodeURIComponent(`Hi, I am ${name} (${phone || email}). I am interested in: ${plan}. ${message}`);
            const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;
            // Open WhatsApp in a new tab
            window.open(waUrl, '_blank');

            // Show success UI after a short delay
            setTimeout(() => {
                form.style.display = 'none';
                if (successMsg) successMsg.style.display = 'flex';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }, 900);
        } else {
            // Email flow: open default mail client with prefilled subject/body
            const to = CONFIG.contactEmail || form.querySelector('#formEmail')?.value || '';
            const subject = encodeURIComponent(`APEX ATHLETICS Inquiry from ${name}`);
            const body = encodeURIComponent(bodyText);
            const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

            // Trigger mailto
            window.location.href = mailto;

            // Show success UI after a short delay (user's mail client will open)
            setTimeout(() => {
                form.style.display = 'none';
                if (successMsg) successMsg.style.display = 'flex';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
            }, 900);
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (successMsg) successMsg.style.display = 'none';
            form.style.display = 'block';
            form.reset();
        });
    }
}

/* ========================
   SMOOTH SCROLL (fallback for older browsers)
   ======================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = 80; // header height offset
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

/* ========================
   HERO FADE-IN SEQUENCE
   ======================== */
(() => {
    const items = document.querySelectorAll('.hero-content .fade-in');
    items.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        el.style.transitionDelay = `${0.3 + i * 0.18}s`;

        // Trigger after a tick so the browser paints the initial state first
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        });
    });
})();

/* ========================
   SPINNER KEYFRAME (injected dynamically)
   ======================== */
const spinStyle = document.createElement('style');
spinStyle.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin-icon { animation: spin 0.8s linear infinite; }
`;
document.head.appendChild(spinStyle);
