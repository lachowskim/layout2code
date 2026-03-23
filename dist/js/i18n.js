(function() {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  const STORAGE_KEY = 'portfolioLanguage';
  const SUPPORTED = ['en', 'pl'];

  const sectionNames = {
    en: { banner: 'Home', about: 'About', services: 'Services', portfolio: 'Portfolio', form: 'Contact' },
    pl: { banner: 'Start', about: 'O mnie', services: 'Usługi', portfolio: 'Portfolio', form: 'Kontakt' }
  };

  const translations = {
    en: {
      nav: { home: 'HOME', about: 'ABOUT ME', contact: 'CONTACT' },
      toggle: { target: 'PL', aria: 'Switch language to Polish' },
      banner: {
        title: 'Hi,<br> I\'m <span class="highlight-word">Freelancer</span>',
        subtitle: 'Looking for <span class="highlight-word">opportunity</span> <br>to bring <span class="highlight-word">your</span> designs to <span class="highlight-word">life</span>',
        cta: 'Let\'s Talk'
      },
      about: {
        heading: 'About',
        lead: 'Looking for precise <span class="highlight-word">design-to-code</span> implementation?',
        description: 'I transform your vision into seamless, <span class="highlight-word">responsive websites </span>with <span class="highlight-word">clean code</span> and professional WordPress integration.',
        cta: 'Let\'s build something <span class="highlight-word glow-word">yours</span>.'
      },
      services: {
        heading: 'Services',
        title1: 'Design-to-Code Implementation',
        tag1: 'From concept to pixel-perfect reality',
        item11: '<strong>Pixel-perfect coding</strong> from Figma, Photoshop, or Adobe XD',
        item12: '<strong>Responsive Web Development</strong> with mobile-first approach',
        item13: '<strong>Semantic HTML5 structure</strong> for accessibility and SEO',
        cta1: 'Start Your Project',
        title2: 'WordPress & API Integrations',
        tag2: 'Custom solutions & external connections',
        item21: '<strong>WordPress Theme Customization</strong> from scratch or existing themes',
        item22: '<strong>API Integrations</strong> with payment systems, CRM, and external services',
        item23: '<strong>Admin panel integration</strong> with required functionality',
        cta2: 'Discuss Integration',
        title3: 'Modern Frameworks & Performance',
        tag3: 'Speed, optimization, and modern tech',
        item31: '<strong>Website Performance Optimization</strong> — Core Web Vitals & speed',
        item32: '<strong>UI/UX Animations with GSAP</strong> for smooth micro-interactions',
        item33: '<strong>Modern frameworks</strong> — React, Vue, Astro, Eleventy',
        cta3: 'Optimize Your Site'
      },
      portfolio: {
        heading: 'Portfolio',
        name: 'Aleksandra Lachowska',
        subtitle: 'Dietitian Website — Design-to-Code Implementation & WordPress Engineering',
        description: 'Implemented a pre-designed UI into a fully functional custom WordPress build, focusing on performance, responsiveness, and maintainable architecture. <br>Delivered a production-ready website with optimized <br>structure, clean code, and scalable <br>content management.',
        overviewTitle: 'Overview',
        overviewText: 'Implemented a pre-designed UI into a custom WordPress build, ensuring performance, responsiveness, and clean architecture.',
        roleTitle: 'My Role',
        role1: 'WordPress Developer',
        role2: 'Frontend Implementation',
        role3: 'Technical SEO & Performance Optimization',
        stackTitle: 'Tech Stack',
        stack1: 'WordPress (Custom Theme Development)',
        stack2: 'Custom Content Architecture',
        stack3: 'JavaScript (AJAX, GSAP Animations)',
        stack4: 'ACF & Flexible Content',
        keyTitle: 'Key Contributions',
        key11: 'Frontend Implementation',
        key12: 'Pixel-perfect build from provided design',
        key21: 'Wordpress Integration',
        key22: 'Custom theme architecture & CMS integration',
        key31: 'Dynamic Content Setup',
        key32: 'Flexible layouts & reusable content sections',
        key41: 'Performance Optimization',
        key42: 'Clean code, asset optimization & responsiveness',
        cta: 'View Project'
      },
      form: {
        namePh: 'Your Name',
        emailPh: 'Your Email',
        msgPh: 'Message',
        send: 'SEND',
        subtext: 'I\'ll get back to you within 24 hours',
        heading: 'Let\'s Work Together',
        d1: '<i class="fa fa-comment-o"></i> Have a project in mind or any questions?<br>',
        d2: '<i class="fa fa-hand-o-right"></i> I\'m here to help. Feel free to reach out!'
      }
    },
    pl: {
      nav: { home: 'START', about: 'O MNIE', contact: 'KONTAKT' },
      toggle: { target: 'EN', aria: 'Przełącz język na angielski' },
      banner: {
        title: 'Cześć,<br> jestem <span class="highlight-word">freelancerem</span>',
        subtitle: 'Szukasz <span class="highlight-word">specjalisty</span>, który zamieni <span class="highlight-word">Twój</span> projekt w nowoczesną <span class="highlight-word">stronę</span>?',
        cta: 'Daj znać'
      },
      about: {
        heading: 'O mnie',
        lead: 'Szukasz precyzyjnego wdrożenia <span class="highlight-word">designu w kod</span>?',
        description: 'Zamieniam Twoją wizję w dopracowane, <span class="highlight-word">responsywne strony internetowe</span> z <span class="highlight-word">czystym kodem</span> i profesjonalną integracją WordPress.',
        cta: 'Stwórzmy coś naprawdę <span class="highlight-word">Twojego</span>.'
      },
      services: {
        heading: 'Usługi',
        title1: 'Wdrożenie projektu do kodu',
        tag1: 'Od projektu do gotowej strony',
        item11: '<strong>Precyzyjne kodowanie</strong> na podstawie Figma, Photoshop lub Adobe XD',
        item12: '<strong>Responsywny frontend</strong> w podejściu mobile-first',
        item13: '<strong>Semantyczny HTML5</strong> z myślą o SEO i dostępności',
        cta1: 'Start projektu',
        title2: 'WordPress i integracje API',
        tag2: 'Dedykowane wdrożenia i integracje',
        item21: '<strong>Dostosowanie motywów WordPress</strong> od zera lub z gotowych szablonów',
        item22: '<strong>Integracje API</strong> z płatnościami, CRM i usługami zewnętrznymi',
        item23: '<strong>Panel administracyjny</strong> dopasowany do Twoich potrzeb',
        cta2: 'Omów integrację',
        title3: 'Frameworki i wydajność',
        tag3: 'Nowoczesny stack nastawiony na wydajność',
        item31: '<strong>Optymalizacja wydajności</strong> — Core Web Vitals',
        item32: '<strong>Animacje UI/UX w GSAP</strong> dla płynnych interakcji',
        item33: '<strong>Nowoczesne frameworki</strong> — React, Vue, Astro',
        cta3: 'Optymalizuj stronę'
      },
      portfolio: {
        heading: 'Portfolio',
        name: 'Aleksandra Lachowska',
        subtitle: 'Strona dietetyczki — wdrożenie projektu i rozwój WordPress',
        description: 'Przekształciłem gotowy projekt UI w w pełni działającą stronę WordPress, stawiając na wydajność, responsywność i prostą dalszą rozbudowę.<br>Efektem jest w pełni działająca strona — zoptymalizowana,<br>przejrzyście zakodowana i wygodna<br>w zarządzaniu treścią.',
        overviewTitle: 'Podsumowanie',
        overviewText: 'Wdrożenie gotowego projektu UI do customowego motywu WordPress z naciskiem na wydajność, pełną responsywność i przejrzystą architekturę kodu.',
        roleTitle: 'Moja rola',
        role1: 'WordPress Developer',
        role2: 'Wdrożenie frontendu',
        role3: 'Technical SEO i optymalizacja wydajności',
        stackTitle: 'Tech Stack',
        stack1: 'WordPress (Custom Theme Development)',
        stack2: 'Custom Content Architecture',
        stack3: 'JavaScript (AJAX, GSAP Animations)',
        stack4: 'ACF & Flexible Content',
        keyTitle: 'Najważniejsze elementy',
        key11: 'Wdrożenie frontendu',
        key12: 'Pixel-perfect implementacja na podstawie projektu',
        key21: 'Integracja WordPress',
        key22: 'Customowa architektura motywu i integracja CMS',
        key31: 'Dynamiczny Layout',
        key32: 'Elastyczne layouty i sekcje wielokrotnego użytku',
        key41: 'Optymalizacja wydajności',
        key42: 'Czysty kod, optymalizacja zasobów i pełna responsywność',
        cta: 'Zobacz projekt'
      },
      form: {
        namePh: 'Twoje imię',
        emailPh: 'Twój e-mail',
        msgPh: 'Wiadomość',
        send: 'WYŚLIJ',
        subtext: 'Odpowiem w ciągu 24 godzin',
        heading: 'Porozmawiajmy',
        d1: '<i class="fa fa-comment-o"></i> Masz pomysł na projekt albo pytanie?<br>',
        d2: '<i class="fa fa-hand-o-right"></i> Chętnie pomogę - napisz śmiało!'
      }
    }
  };

  let currentLanguage = 'en';
  let isInitialized = false;

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function setHtml(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = value;
  }

  function setPlaceholder(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('placeholder', value);
  }

  function updateSectionNames(lang) {
    const names = sectionNames[lang] || sectionNames.en;
    Object.keys(names).forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) section.dataset.name = names[sectionId];
    });
  }

  function updateDots() {
    const labels = document.querySelectorAll('.section-dot-container .section-dot-label');
    if (!labels.length || !window.sections) return;

    labels.forEach((label, idx) => {
      const section = window.sections[idx];
      if (!section) return;
      label.textContent = section.dataset.name || section.id;
    });
  }

  function refreshDynamicHeader() {
    if (!window.Portfolio || !window.Portfolio.ui) return;
    if (typeof window.currentSection !== 'number' || window.currentSection === 0) return;

    if (window.Portfolio.ui.clearAllHeaderTitles) window.Portfolio.ui.clearAllHeaderTitles();
    if (window.Portfolio.ui.addHeaderTitle) window.Portfolio.ui.addHeaderTitle(window.currentSection);
  }

  function updateToggle(lang) {
    const btn = document.getElementById('language-toggle');
    const label = btn ? btn.querySelector('.language-toggle-label') : null;
    if (!btn || !label) return;

    const data = translations[lang] || translations.en;
    label.textContent = data.toggle.target;
    btn.setAttribute('aria-label', data.toggle.aria);
    btn.setAttribute('data-next-lang', lang === 'en' ? 'pl' : 'en');
  }

  function applyLanguage(lang) {
    const t = translations[lang] || translations.en;

    document.documentElement.setAttribute('lang', lang);
    document.title = 'Michał Lachowski Front End Developer';

    setText('#menuToggle .menu a[href="#banner"]', t.nav.home);
    setText('#menuToggle .menu a[href="#about"]', t.nav.about);
    setText('#menuToggle .menu a[href="#form"]', t.nav.contact);

    setHtml('#banner .headline-text h1', t.banner.title);
    setHtml('#banner .headline-text h2', t.banner.subtitle);
    setText('#banner .headline-text .btn', t.banner.cta);

    setText('#about .headline h1', t.about.heading);
    setHtml('#about .about-text p:nth-of-type(1)', t.about.lead);
    setHtml('#about .about-text p:nth-of-type(2)', t.about.description);
    setHtml('#about .about-text .cta-link', t.about.cta);

    setText('#services .headline h1', t.services.heading);
    setText('#services article[data-category="design-to-code"] .category-title', t.services.title1);
    setText('#services article[data-category="design-to-code"] .category-tagline', t.services.tag1);
    setHtml('#services article[data-category="design-to-code"] .service-item:nth-of-type(1) .service-text', t.services.item11);
    setHtml('#services article[data-category="design-to-code"] .service-item:nth-of-type(2) .service-text', t.services.item12);
    setHtml('#services article[data-category="design-to-code"] .service-item:nth-of-type(3) .service-text', t.services.item13);
    setText('#services article[data-category="design-to-code"] .category-cta', t.services.cta1);

    setText('#services article[data-category="wordpress-api"] .category-title', t.services.title2);
    setText('#services article[data-category="wordpress-api"] .category-tagline', t.services.tag2);
    setHtml('#services article[data-category="wordpress-api"] .service-item:nth-of-type(1) .service-text', t.services.item21);
    setHtml('#services article[data-category="wordpress-api"] .service-item:nth-of-type(2) .service-text', t.services.item22);
    setHtml('#services article[data-category="wordpress-api"] .service-item:nth-of-type(3) .service-text', t.services.item23);
    setText('#services article[data-category="wordpress-api"] .category-cta', t.services.cta2);

    setText('#services article[data-category="frameworks-performance"] .category-title', t.services.title3);
    setText('#services article[data-category="frameworks-performance"] .category-tagline', t.services.tag3);
    setHtml('#services article[data-category="frameworks-performance"] .service-item:nth-of-type(1) .service-text', t.services.item31);
    setHtml('#services article[data-category="frameworks-performance"] .service-item:nth-of-type(2) .service-text', t.services.item32);
    setHtml('#services article[data-category="frameworks-performance"] .service-item:nth-of-type(3) .service-text', t.services.item33);
    setText('#services article[data-category="frameworks-performance"] .category-cta', t.services.cta3);

    setText('#portfolio .headline h1', t.portfolio.heading);
    setText('#portfolio .left h1', t.portfolio.name);
    setText('#portfolio .left h3', t.portfolio.subtitle);
    setHtml('#portfolio .left p', t.portfolio.description);
    setText('#portfolio .portfolio-block:nth-of-type(1) h4', t.portfolio.overviewTitle);
    setText('#portfolio .portfolio-block:nth-of-type(1) p', t.portfolio.overviewText);
    setText('#portfolio .portfolio-block:nth-of-type(2) h4', t.portfolio.roleTitle);
    setText('#portfolio .portfolio-block:nth-of-type(2) li:nth-of-type(1)', t.portfolio.role1);
    setText('#portfolio .portfolio-block:nth-of-type(2) li:nth-of-type(2)', t.portfolio.role2);
    setText('#portfolio .portfolio-block:nth-of-type(2) li:nth-of-type(3)', t.portfolio.role3);
    setText('#portfolio .portfolio-block:nth-of-type(3) h4', t.portfolio.stackTitle);
    setText('#portfolio .portfolio-block:nth-of-type(3) li:nth-of-type(1)', t.portfolio.stack1);
    setText('#portfolio .portfolio-block:nth-of-type(3) li:nth-of-type(2)', t.portfolio.stack2);
    setText('#portfolio .portfolio-block:nth-of-type(3) li:nth-of-type(3)', t.portfolio.stack3);
    setText('#portfolio .portfolio-block:nth-of-type(3) li:nth-of-type(4)', t.portfolio.stack4);
    setText('#portfolio .portfolio-block:nth-of-type(4) h4', t.portfolio.keyTitle);
    setText('#portfolio .key-wins li:nth-of-type(1) strong', t.portfolio.key11);
    setText('#portfolio .key-wins li:nth-of-type(1) span', t.portfolio.key12);
    setText('#portfolio .key-wins li:nth-of-type(2) strong', t.portfolio.key21);
    setText('#portfolio .key-wins li:nth-of-type(2) span', t.portfolio.key22);
    setText('#portfolio .key-wins li:nth-of-type(3) strong', t.portfolio.key31);
    setText('#portfolio .key-wins li:nth-of-type(3) span', t.portfolio.key32);
    setText('#portfolio .key-wins li:nth-of-type(4) strong', t.portfolio.key41);
    setText('#portfolio .key-wins li:nth-of-type(4) span', t.portfolio.key42);
    setText('#portfolio .portfolio-next .btn', t.portfolio.cta);

    setPlaceholder('#form input[name="name"]', t.form.namePh);
    setPlaceholder('#form input[name="_replyto"]', t.form.emailPh);
    setPlaceholder('#form textarea[name="message"]', t.form.msgPh);
    setText('#form .button-wrapper .btn', t.form.send);
    setText('#form .button-subtext', t.form.subtext);
    setText('#form .form-main-heading', t.form.heading);
    setHtml('#form .form-description', t.form.d1 + t.form.d2);

    if (window.CONFIG && window.CONFIG.scrollMessage) {
      window.CONFIG.scrollMessage.message = lang === 'pl' ? 'Spokojnie, powoli?' : 'Not too fast?';
    }

    updateSectionNames(lang);
    updateDots();
    updateToggle(lang);
    refreshDynamicHeader();
  }

  function setLanguage(lang, persist) {
    const next = SUPPORTED.indexOf(lang) !== -1 ? lang : 'en';
    currentLanguage = next;
    applyLanguage(currentLanguage);
    if (persist !== false) {
      localStorage.setItem(STORAGE_KEY, currentLanguage);
    }
  }

  function toggleLanguage() {
    setLanguage(currentLanguage === 'en' ? 'pl' : 'en', true);
  }

  function init() {
    if (isInitialized) return;
    isInitialized = true;

    const stored = localStorage.getItem(STORAGE_KEY);
    currentLanguage = SUPPORTED.indexOf(stored) !== -1 ? stored : 'en';

    applyLanguage(currentLanguage);

    const btn = document.getElementById('language-toggle');
    if (btn) btn.addEventListener('click', toggleLanguage);
  }

  window.Portfolio.i18n = {
    init,
    setLanguage,
    getLanguage: function() { return currentLanguage; },
    toggle: toggleLanguage
  };
})();

