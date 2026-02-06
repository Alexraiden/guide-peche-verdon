// Main JavaScript for Lucas Guide de Pêche

document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initFishAnimation();
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

