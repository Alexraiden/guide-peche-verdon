// Main JavaScript for Lucas Guide de Pêche

const HERO_IMAGES = {
    'index.html': 'images/hero/optimized/hero-bateau-lac-1440.jpeg',
    'prestations.html': 'images/hero/optimized/prestations-hero-1440.jpeg',
    'tarifs.html': 'images/hero/optimized/tarifs-hero-1280.jpeg',
    'poissons.html': 'images/hero/optimized/nos-poissons-hero-1440.jpeg',
    'zones-peche.html': 'images/hero/optimized/hero-lieux-1440.jpeg'
};
const HEAD_SYNC_SELECTOR = [
    'meta[name="description"]',
    'link[rel="canonical"]',
    'link[rel="preload"][as="image"]',
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
    'script[type="application/ld+json"]'
].join(',');
const prefetched = new Set();

let currentInitController = null;
let isAppNavigating = false;

document.documentElement.classList.add('app-navigation');
document.addEventListener('DOMContentLoaded', initSite);
window.addEventListener('popstate', () => navigateApp(window.location.href, { push: false }));

function initSite() {
    if (currentInitController) {
        currentInitController.abort();
    }

    currentInitController = new AbortController();
    const { signal } = currentInitController;

    initStickyHeader(signal);
    initMobileMenu(signal);
    initScrollAnimations(signal);
    initSmoothScroll(signal);
    initFishAnimation(signal);
    initPagePrefetch(signal);
    initAppNavigation(signal);
}

/* === STICKY HEADER === */
function initStickyHeader(signal) {
    const header = document.querySelector('.header');
    if (!header) return;

    const syncHeader = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', syncHeader, { passive: true, signal });
    syncHeader();
}

/* === MOBILE MENU === */
function initMobileMenu(signal) {
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const body = document.body;

    if (!burger || !nav) return;

    const closeMenu = () => {
        nav.classList.remove('active');
        burger.classList.remove('active');
        body.style.overflow = '';
    };

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
    }, { signal });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu, { signal });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') &&
            !nav.contains(e.target) &&
            !burger.contains(e.target)) {
            closeMenu();
        }
    }, { signal });
}

/* === SCROLL ANIMATIONS === */
function initScrollAnimations(signal) {
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

    signal.addEventListener('abort', () => observer.disconnect(), { once: true });

    elements.forEach(el => {
        observer.observe(el);
    });
}

/* === SMOOTH SCROLL FOR ANCHOR LINKS === */
function initSmoothScroll(signal) {
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
        }, { signal });
    });
}

/* === FISH JUMP ANIMATION === */
function initFishAnimation(signal) {
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
        }, { signal });
    });
}

/* === LIGHT PREFETCH FOR INTERNAL NAVIGATION === */
function initPagePrefetch(signal) {
    const prefetchTarget = (link) => {
        const url = getInternalPageUrl(link);
        if (!url || isSamePageHash(url)) return;

        const pageName = getPageName(url);

        addPrefetch(url.href, 'document');

        if (HERO_IMAGES[pageName]) {
            addPrefetch(new URL(HERO_IMAGES[pageName], window.location.href).href, 'image');
        }
    };

    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('pointerenter', () => prefetchTarget(link), { passive: true, signal });
        link.addEventListener('focus', () => prefetchTarget(link), { passive: true, signal });
        link.addEventListener('touchstart', () => prefetchTarget(link), { passive: true, once: true, signal });
    });
}

/* === APP-LIKE INTERNAL PAGE NAVIGATION === */
function initAppNavigation(signal) {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link || shouldIgnoreClick(event)) return;

        const url = getInternalPageUrl(link);
        if (!url) return;

        if (isSamePage(url) && !url.hash) {
            event.preventDefault();
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            return;
        }

        if (isSamePageHash(url)) {
            event.preventDefault();
            history.pushState({}, '', url.href);
            scrollToTarget(url.hash);
            return;
        }

        event.preventDefault();
        navigateApp(url.href);
    }, { signal });
}

async function navigateApp(href, options = { push: true }) {
    if (isAppNavigating) return;

    const url = new URL(href, window.location.href);
    isAppNavigating = true;

    try {
        const pageName = getPageName(url);
        if (HERO_IMAGES[pageName]) {
            addPrefetch(new URL(HERO_IMAGES[pageName], window.location.href).href, 'image');
        }

        const response = await fetch(url.href, {
            headers: { 'X-Requested-With': 'fetch' }
        });

        if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);

        const html = await response.text();
        const nextDocument = new DOMParser().parseFromString(html, 'text/html');

        document.body.classList.add('page-is-leaving');
        await wait(170);

        syncHead(nextDocument);
        syncBodyAttributes(nextDocument.body);
        document.body.innerHTML = nextDocument.body.innerHTML;
        document.body.classList.add('page-is-entering');

        if (options.push) {
            history.pushState({}, '', url.href);
        }

        initSite();
        scrollToTarget(url.hash);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.remove('page-is-entering');
            });
        });
    } catch (error) {
        window.location.href = url.href;
    } finally {
        document.body.classList.remove('page-is-leaving');
        isAppNavigating = false;
    }
}

function shouldIgnoreClick(event) {
    return event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey;
}

function getInternalPageUrl(link) {
    if (link.target && link.target !== '_self') return null;
    if (link.hasAttribute('download')) return null;

    const url = new URL(link.getAttribute('href'), window.location.href);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const isHtmlPage = url.pathname.endsWith('/') || url.pathname.endsWith('.html');

    if (!isHttp || url.origin !== window.location.origin || !isHtmlPage) {
        return null;
    }

    return url;
}

function isSamePageHash(url) {
    return Boolean(url.hash) && isSamePage(url);
}

function isSamePage(url) {
    return getPageName(url) === getPageName(window.location);
}

function getPageName(urlLike) {
    const pathname = urlLike.pathname || window.location.pathname;
    return pathname.split('/').pop() || 'index.html';
}

function addPrefetch(href, as) {
    if (prefetched.has(href)) return;
    prefetched.add(href);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    if (as) link.as = as;
    document.head.appendChild(link);
}

function syncHead(nextDocument) {
    document.title = nextDocument.title;
    document.head.querySelectorAll(HEAD_SYNC_SELECTOR).forEach(element => element.remove());
    nextDocument.head.querySelectorAll(HEAD_SYNC_SELECTOR).forEach(element => {
        document.head.appendChild(element.cloneNode(true));
    });
}

function syncBodyAttributes(nextBody) {
    Array.from(document.body.attributes).forEach(attribute => {
        document.body.removeAttribute(attribute.name);
    });
    Array.from(nextBody.attributes).forEach(attribute => {
        document.body.setAttribute(attribute.name, attribute.value);
    });
}

function scrollToTarget(hash) {
    requestAnimationFrame(() => {
        if (!hash) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            return;
        }

        try {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
    });
}

function wait(duration) {
    return new Promise(resolve => window.setTimeout(resolve, duration));
}
