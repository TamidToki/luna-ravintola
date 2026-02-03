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
let currentLang = localStorage.getItem('lang') || 'en';

// Apply saved language on load
if (currentLang === 'fi') {
    applyLanguage('fi');
    langText.textContent = 'FI';
}

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'fi' : 'en';
    localStorage.setItem('lang', currentLang);
    applyLanguage(currentLang);
    langText.textContent = currentLang.toUpperCase();
});

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

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        categories.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const categoryId = btn.dataset.category;
        document.getElementById(categoryId).classList.add('active');
    });
});

// ===== SCROLL ANIMATIONS =====
const animatedElements = document.querySelectorAll('.animate-on-scroll');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.1 });

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
