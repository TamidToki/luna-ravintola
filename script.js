// ===== DARK MODE TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);

    const icon = themeToggle.querySelector('i');
    if (isDark) {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }
});

// ===== LANGUAGE TOGGLE (EN/FI) =====
const langToggle = document.getElementById('lang-toggle');
const langText = document.getElementById('lang-text');

// Always start in English on each page load.
let currentLang = 'en';
applyLanguage('en');
langText.textContent = 'EN';

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'fi' : 'en';
    applyLanguage(currentLang);
    langText.textContent = currentLang.toUpperCase();
});

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function initGlobalParticles() {
    const container = document.querySelector('.global-particles');
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const icons = ['fa-pizza-slice', 'fa-burger', 'fa-bottle-water', 'fa-pepper-hot', 'fa-hotdog', 'fa-star'];
    const count = window.matchMedia('(max-width: 900px)').matches ? 26 : 48;
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const icon = document.createElement('i');
        const iconClass = icons[Math.floor(Math.random() * icons.length)];
        icon.className = `fas ${iconClass} gp`;
        icon.style.setProperty('--x', `${randomInRange(2, 96).toFixed(1)}%`);
        icon.style.setProperty('--y', `${randomInRange(2, 96).toFixed(1)}%`);
        icon.style.setProperty('--o', `${randomInRange(0.18, 0.42).toFixed(2)}`);
        icon.style.setProperty('--s', `${randomInRange(0.95, 2.05).toFixed(2)}rem`);
        icon.style.setProperty('--d', `${randomInRange(12, 34).toFixed(1)}s`);
        icon.style.setProperty('--delay', `${randomInRange(-28, 0).toFixed(1)}s`);
        icon.style.setProperty('--dx1', `${randomInRange(-50, 50).toFixed(1)}px`);
        icon.style.setProperty('--dy1', `${randomInRange(-44, -8).toFixed(1)}px`);
        icon.style.setProperty('--dx2', `${randomInRange(-58, 58).toFixed(1)}px`);
        icon.style.setProperty('--dy2', `${randomInRange(-70, -18).toFixed(1)}px`);
        icon.style.setProperty('--r1', `${randomInRange(-20, 20).toFixed(1)}deg`);
        icon.style.setProperty('--r2', `${randomInRange(-20, 20).toFixed(1)}deg`);
        icon.style.setProperty('--sc1', `${randomInRange(0.88, 1.18).toFixed(2)}`);
        icon.style.setProperty('--sc2', `${randomInRange(0.82, 1.12).toFixed(2)}`);
        container.appendChild(icon);
    }
}

initGlobalParticles();

function applyLanguage(lang) {
    const elements = document.querySelectorAll('[data-en][data-fi]');
    elements.forEach(el => {
        const text = lang === 'fi' ? el.dataset.fi : el.dataset.en;
        if (text) {
            el.textContent = text;
        }
    });
}

// ===== TRANSLATE BUTTON FOR INDIVIDUAL REVIEWS =====
document.querySelectorAll('.translate-btn').forEach(btn => {
    let isTranslated = false;
    btn.addEventListener('click', function () {
        const reviewCard = this.closest('.review-card');
        const reviewText = reviewCard.querySelector('.review-text');
        const btnText = this.querySelector('span');

        if (!isTranslated) {
            // Show English translation
            reviewText.textContent = '"' + reviewText.dataset.en + '"';
            btnText.textContent = currentLang === 'en' ? 'Original' : 'Alkuperäinen';
            isTranslated = true;
        } else {
            // Show original Finnish
            reviewText.textContent = '"' + reviewText.dataset.fi + '"';
            btnText.textContent = currentLang === 'en' ? 'Translate' : 'Käännä';
            isTranslated = false;
        }
    });
});

// ===== MOBILE MENU =====
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu-overlay');
const closeMenu = document.querySelector('.close-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu-links a');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== MENU CATEGORY TABS =====
const tabBtns = document.querySelectorAll('.tab-btn');
const categories = document.querySelectorAll('.menu-category');

function scrollToActiveCategoryTop(categoryElement) {
    const navbar = document.querySelector('.navbar');
    const tabsWrapper = document.querySelector('.menu-tabs-wrapper');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    const tabsHeight = tabsWrapper ? tabsWrapper.offsetHeight : 0;
    const extraSpacing = 42;
    const targetTop = window.scrollY + categoryElement.getBoundingClientRect().top - (navbarHeight + tabsHeight + extraSpacing);

    window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: 'smooth'
    });
}

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        categories.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const categoryId = btn.dataset.category;
        const content = document.getElementById(categoryId);
        if (content) {
            content.classList.add('active');

            // Wait for the active class to apply before calculating offsets.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToActiveCategoryTop(content);
                });
            });
        }
    });
});

// ===== SCROLL ANIMATIONS =====
const animatedElements = document.querySelectorAll('.animate-on-scroll');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Stop observing once visible to save performance
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0, rootMargin: "0px 0px -50px 0px" });

animatedElements.forEach(el => observer.observe(el));

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== HERO SLIDESHOW =====
const slides = document.querySelectorAll('.hero-slideshow .slide');
let currentSlide = 0;

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

setInterval(nextSlide, 4000);
