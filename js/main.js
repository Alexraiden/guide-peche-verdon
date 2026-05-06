// Main JavaScript for Lucas Guide de Pêche

document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initFishAnimation();
    initPagePrefetch();
});

/* === STICKY HEADER === */
function initStickyHeader() {
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Initial check
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }
}

/* === MOBILE MENU === */
function initMobileMenu() {
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const body = document.body;

    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('active');
        burger.classList.toggle('active');

        // Prevent background scrolling
        if (nav.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            burger.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') &&
            !nav.contains(e.target) &&
            !burger.contains(e.target)) {
            nav.classList.remove('active');
            burger.classList.remove('active');
            body.style.overflow = '';
        }
    });
}

/* === SCROLL ANIMATIONS === */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-reveal');

    if (typeof IntersectionObserver === 'undefined') {
        // Fallback for older browsers
        elements.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    elements.forEach(el => {
        observer.observe(el);
    });
}

/* === SMOOTH SCROLL FOR ANCHOR LINKS === */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* === FISH JUMP ANIMATION === */
function initFishAnimation() {
    const primaryButtons = document.querySelectorAll('.btn-primary');
    const body = document.body;

    primaryButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const fish = document.createElement('div');
            fish.className = 'jumping-fish';
            fish.innerHTML = '🐟';

            // Random horizontal position
            const randomX = Math.floor(Math.random() * 90); // 0 to 90vw
            fish.style.left = `${randomX}vw`;

            body.appendChild(fish);

            // Cleanup after animation
            fish.addEventListener('animationend', () => {
                fish.remove();
            });
        });
    });
}

/* === LIGHT PREFETCH FOR INTERNAL NAVIGATION === */
function initPagePrefetch() {
    const prefetched = new Set();
    const heroImages = {
        'index.html': 'images/hero/optimized/hero-bateau-lac-1440.jpeg',
        'prestations.html': 'images/hero/optimized/prestations-hero-1440.jpeg',
        'tarifs.html': 'images/hero/optimized/tarifs-hero-1280.jpeg',
        'poissons.html': 'images/hero/optimized/nos-poissons-hero-1440.jpeg',
        'zones-peche.html': 'images/hero/optimized/hero-lieux-1440.jpeg'
    };

    const addPrefetch = (href, as) => {
        if (prefetched.has(href)) return;
        prefetched.add(href);

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        if (as) link.as = as;
        document.head.appendChild(link);
    };

    const prefetchTarget = (link) => {
        const url = new URL(link.getAttribute('href'), window.location.href);

        if (url.origin !== window.location.origin || url.hash && url.pathname === window.location.pathname) {
            return;
        }

        const pageName = url.pathname.split('/').pop() || 'index.html';

        addPrefetch(url.href, 'document');

        if (heroImages[pageName]) {
            addPrefetch(new URL(heroImages[pageName], window.location.href).href, 'image');
        }
    };

    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('pointerenter', () => prefetchTarget(link), { passive: true });
        link.addEventListener('focus', () => prefetchTarget(link), { passive: true });
        link.addEventListener('touchstart', () => prefetchTarget(link), { passive: true, once: true });
    });
}
