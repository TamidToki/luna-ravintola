// ===== DARK MODE TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Always start in light mode on page load.
body.classList.remove('dark-mode');
localStorage.removeItem('darkMode');
themeToggle.querySelector('i').classList.remove('fa-sun');
themeToggle.querySelector('i').classList.add('fa-moon');

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');

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

const supportedLangs = ['en', 'fi', 'sv'];
const swedishAutoMap = {
    "HOME": "HEM",
    "MENU": "MENY",
    "REVIEWS": "RECENSIONER",
    "CONTACT": "KONTAKTA",
    "Home": "Hem",
    "Menu": "Meny",
    "Reviews": "Recensioner",
    "Contact": "Kontakta",
    "The Best Pizza": "Bästa pizzan",
    "in Turku": "i Åbo",
    "Huge portions. Fresh ingredients. Unforgettable taste.": "Enorma portioner. Färska ingredienser. Oförglömlig smak.",
    "View Menu": "Visa menyn",
    "OPEN TODAY": "ÖPPET IDAG",
    "Family Owned": "Familjeägt",
    "Our Story": "Vår berättelse",
    "New in the Neighborhood": "Nytt i kvarteret",
    "At Luna Ravintola, we believe pizza is more than just food—it’s an experience. Located in the heart of Ilpoinen, we are a proud family-owned restaurant dedicated to one simple mission: serving the best, most generous portions in Turku. We use only the freshest ingredients, hand-picked daily, to create unforgettable flavors that keep our customers coming back.": "På Luna Ravintola tror vi att pizza är mer än bara mat – det är en upplevelse. Beläget i hjärtat av Ilpoinen, är vi en stolt familjeägd restaurang dedikerad till ett enkelt uppdrag: att servera de bästa och mest generösa portionerna i Åbo. Vi använder endast de färskaste råvarorna, handplockade dagligen, för att skapa oförglömliga smaker som får våra kunder att komma tillbaka.",
    "Kid Friendly": "Barnvänlig",
    "Takeaway": "Takeaway",
    "Dine In": "Ät in",
    "Our Menu": "Vår meny",
    "Delicious Choices": "Läckra val",
    "Pizzas": "Pizzor",
    "Hamburgers": "Hamburgare",
    "Kebab": "Kebab",
    "Rolls": "Rullar",
    "Chicken": "Kyckling",
    "Falafel": "Falafel",
    "Barbecue": "Utegrill",
    "Salads": "Sallader",
    "Drinks": "Drycker",
    "Gluten-free pizza base": "Glutenfri pizzabotten",
    "Luna Special": "Luna Special",
    "Kebab, salami, pepperoni, jalapeño, blue cheese, minced meat": "Kebab, salami, pepperoni, jalapeño, ädelost, köttfärs",
    "Margherita": "Margherita",
    "Cheese, pizza sauce, mozzarella": "Ost, pizzasås, mozzarella",
    "Bolognese": "Bolognese",
    "Minced meat": "Köttfärs",
    "Americana": "Americana",
    "Ham, blue cheese, pineapple": "Skinka, ädelost, ananas",
    "Kebab Pizza": "Kebab pizza",
    "Kebab, red onion, turkish pepper, cherry tomato": "Kebab, rödlök, turkisk peppar, körsbärstomat",
    "Chicken Pizza": "Kycklingpizza",
    "Chicken, blue cheese, pineapple": "Kyckling, ädelost, ananas",
    "Vegetarian Pizza": "Vegetarisk pizza",
    "Paprika, mushroom, olive, pineapple, feta cheese": "Paprika, svamp, oliv, ananas, fetaost",
    "Frutti di Mare": "Frutti di Mare",
    "Tuna, shrimp, mussel": "Tonfisk, räkor, musslor",
    "Julia": "Julia",
    "Ham, pineapple, shrimp, blue cheese": "Skinka, ananas, räkor, ädelost",
    "Quatro Stagione": "Quatro Stagione",
    "Ham, tuna, salami, shrimp": "Skinka, tonfisk, salami, räkor",
    "Romeo": "Romeo",
    "Salami, pepperoni, blue cheese, shrimp, pineapple": "Salami, pepperoni, ädelost, räkor, ananas",
    "Mexicana": "Mexicana",
    "Minced meat, pepperoni, salami, jalapeño, taco sauce": "Köttfärs, pepperoni, salami, jalapeño, tacosås",
    "Empire": "Imperium",
    "Ham, salami, shrimp, blue cheese, garlic, red onion, double cheese": "Skinka, salami, räkor, ädelost, vitlök, rödlök, dubbelost",
    "Helsinki": "helsingfors",
    "Minced meat, salami, ham, kebab": "Köttfärs, salami, skinka, kebab",
    "Finlandia": "Finlandia",
    "Ham, blue cheese, salami, bacon": "Skinka, ädelost, salami, bacon",
    "Beef Pizza": "Biff pizza",
    "Beef, salami, pepperoni, minced meat": "Nötkött, salami, pepperoni, köttfärs",
    "Fantasy 2 toppings": "Fantasy 2 toppings",
    "2 toppings of your choice": "2 valfria pålägg",
    "Fantasy 3 toppings": "Fantasy 3 toppings",
    "3 toppings of your choice": "3 valfria pålägg",
    "Fantasy 4 toppings": "Fantasy 4 toppings",
    "4 toppings of your choice": "4 valfria toppings",
    "Extra Toppings": "Extra pålägg",
    "Premium Toppings": "Premiumpålägg",
    "Normal": "Normal",
    "Family": "Familj",
    "Minced meat, chicken, shrimp, kebab, ham, pepperoni, salami, mussel, tuna, bacon": "Köttfärs, kyckling, räkor, kebab, skinka, pepperoni, salami, musslor, tonfisk, bacon",
    "Standard Toppings": "Standardpålägg",
    "Pineapple, blue cheese, egg, bbq sauce, feta cheese, mushroom, jalapeño, cheese, mozzarella, olive, paprika, red onion, onion, pickle, tomato, double cheese, turkish pepper, garlic, cherry tomato": "Ananas, ädelost, ägg, bbq-sås, fetaost, svamp, jalapeño, ost, mozzarella, oliv, paprika, rödlök, lök, pickle, tomat, dubbelost, turkisk peppar, vitlök, körsbärstomat",
    "Meal upgrade +3.00€ (Fries + 0.33l drink)": "Måltidsuppgradering +3,00€ (frites + 0,33 l dryck)",
    "Price": "Pris",
    "Kids Burger": "Barnburgare",
    "Cheeseburger": "Ostburgare",
    "Layered Burger": "Burger i lager",
    "SAUCES: Mild, Medium, Strong": "Såser: Mild, Medium, Stark",
    "Kebabs": "Kebab",
    "Pita Kebab": "Pita Kebab",
    "With French Fries": "Med pommes frites",
    "With Potato Wedges": "Med klyftpotatis",
    "With Salad": "Med sallad",
    "With Waffle Fries": "Med våfflor",
    "French Fries + Blue Cheese and Feta": "Pommes frites + Blåmögelost och Feta",
    "Iskender Kebab": "Iskender Kebab",
    "With Rice": "Med ris",
    "Roll Kebabs": "Rulla Kebab",
    "Roll Kebab": "Rullkebab",
    "Blue Cheese Roll": "Blåmögelostrulle",
    "Feta Roll": "Fetarulle",
    "Cheese Roll": "Ostrulle",
    "Cheddar Roll": "Cheddarrulle",
    "Chicken Dishes": "Kycklingrätter",
    "Chicken Pita": "Kyckling Pita",
    "Chicken with Rice": "Kyckling med ris",
    "Chicken Roll": "Kycklingrulle",
    "Falafels": "Falafel",
    "Falafel with Rice": "Falafel med ris",
    "Falafel Pita": "Falafel Pita",
    "Falafel Roll": "Falafelrulle",
    "Hot Wings": "Hot Wings",
    "10 PCS": "10 st",
    "15 PCS": "15 st",
    "20 PCS": "20 st",
    "25 PCS": "25 st",
    "Grill": "Grill",
    "French Fries": "Pommes frites",
    "Sausage Fries": "Korv Fries",
    "Kids Chicken Basket": "Kycklingkorg för barn",
    "Chicken Basket": "Kycklingkorg",
    "Fries, salad, tomato, cucumber, curry mayo, mayo": "Pommes frites, sallad, tomat, gurka, currymajo, majonnäs",
    "Chicken Salad": "Kycklingsallad",
    "Shrimp Salad": "Räksallad",
    "Tuna Salad": "Tonfisksallad",
    "Feta Salad": "Feta sallad",
    "0.33L": "0,33 L",
    "0.5L": "0,5 L",
    "1.5L": "1,5 L",
    "Based on 6 Google Reviews": "Baserat på 6 Google-recensioner",
    "What People Say": "Vad folk säger",
    "It’s been a while since I had such a good meal! The portions were huge and so so so delicious! We can’t wait to try the rest of the menu. We’ll be back for sure ❤️": "Det var ett tag sedan jag åt så god mat! Portionerna var enorma och så så läckra! Vi kan inte vänta med att prova resten av menyn. Vi kommer säkert tillbaka ❤️",
    "Best pizza in ages!! Really friendly service, fantastic new addition to the neighborhood. The owner and his wife are brilliant 🤩": "Bästa pizzan på evigheter!! Riktigt vänlig service, fantastiskt nytt tillskott till grannskapet. Ägaren och hans fru är lysande 🤩",
    "Clean place and friendly customer service. Pizza was a good size, fresh and tasty👌": "Rent ställe och vänlig kundservice. Pizza var en bra storlek, fräsch och välsmakande👌",
    "The food was very good and the service 10/10. Finally, Ilpoinen has a good restaurant after a long time. Go and try it! :)": "Maten var mycket bra och servicen 10/10. Äntligen har Ilpoinen en bra restaurang efter lång tid. Gå och prova! :)",
    "We moved to Turku recently and searched for our regular pizza place. Luna exceeded expectations. The base was juicy and tasty, and the staff is very friendly. Highly recommended!": "Vi flyttade till Åbo nyligen och letade efter vårt vanliga pizzaställe. Luna överträffade förväntningarna. Basen var saftig och välsmakande, och personalen är mycket vänlig. Rekommenderas varmt!",
    "Translate": "Översätta",
    "Very clean place, good pizza, and very friendly service.": "Mycket rent ställe, bra pizza och mycket vänlig service.",
    "See All Google Reviews": "Se alla Google-recensioner",
    "Mon-Thu:": "mån-tors:",
    "Fri-Sat:": "fre-lör:",
    "Sun:": "Sol:",
    "Call Us": "Ring oss",
    "Directions": "Vägbeskrivning"
};

// Always start in English on each page load.
let currentLang = 'en';
applyLanguage('en');
langText.textContent = 'EN';

langToggle.addEventListener('click', () => {
    const currentIndex = supportedLangs.indexOf(currentLang);
    currentLang = supportedLangs[(currentIndex + 1) % supportedLangs.length];
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
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
        let text = el.dataset.en;
        if (lang === 'fi') {
            text = el.dataset.fi || el.dataset.en;
        } else if (lang === 'sv') {
            text = el.dataset.sv || swedishAutoMap[el.dataset.en] || el.dataset.fi || el.dataset.en;
        }
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
            btnText.textContent = currentLang === 'fi' ? 'Alkuperäinen' : (currentLang === 'sv' ? 'Original' : 'Original');
            isTranslated = true;
        } else {
            // Show original Finnish
            reviewText.textContent = '"' + reviewText.dataset.fi + '"';
            btnText.textContent = currentLang === 'fi' ? 'Käännä' : (currentLang === 'sv' ? 'Översätt' : 'Translate');
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

function syncStickyOffset() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const offset = navbar.offsetHeight + 8;
    document.documentElement.style.setProperty('--sticky-offset', `${offset}px`);
}

syncStickyOffset();
window.addEventListener('resize', syncStickyOffset);

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
    syncStickyOffset();
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
