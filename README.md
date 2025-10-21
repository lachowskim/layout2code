# Portfolio Website

A modern, responsive portfolio website showcasing web development services and projects with stunning animations and glassmorphism design.

## 🌟 Overview

This is a professional portfolio website built with modern web technologies, featuring smooth scroll animations, glassmorphism UI effects, and a fully responsive design. The site demonstrates expertise in design-to-code implementation, WordPress development, and modern web frameworks.

## ✨ Features

- **Modern UI/UX Design** - Glassmorphism effects with smooth animations
- **Responsive Layout** - Mobile-first approach with seamless adaptation across all devices
- **Smooth Scrolling** - Custom scroll-based animations and section transitions
- **Interactive Services Section** - Accordion-style service categories with GSAP animations
- **Dynamic Navigation** - Sticky header with animated logo and mobile burger menu
- **Portfolio Showcase** - Project gallery with hover effects and live links
- **Contact Form** - Integrated contact form with Formspree
- **Performance Optimized** - Minified assets, lazy loading, and optimized animations

## 🛠️ Tech Stack

### Core Technologies
- **HTML5** - Semantic markup with Nunjucks templating
- **SCSS/SASS** - Modular styling with custom functions and mixins
- **JavaScript (ES6+)** - Modular architecture with separate concerns
- **Gulp** - Automated build system and task runner

### Build Tools & Optimization
- **Gulp 5.0** - Task automation and build pipeline
- **Gulp Dart Sass** - SCSS compilation
- **PostCSS** - CSS processing with Autoprefixer
- **Terser** - JavaScript minification
- **Sourcemaps** - Development debugging support
- **Gulp Concat** - Module bundling

### UI/UX Enhancements
- **GSAP** - Advanced animations (optional integration)
- **Glassmorphism** - Modern frosted glass UI effects
- **Custom Scroll Effects** - Parallax and section-based animations
- **Responsive Design** - Mobile-first approach

### Templating
- **Nunjucks** - HTML templating engine for modular components

## 📁 Project Structure

```
Strona_Portfolio/
├── src/                          # Source files
│   ├── scss/                     # SCSS stylesheets
│   │   ├── main.scss            # Main stylesheet entry
│   │   ├── _base.scss           # Base styles and resets
│   │   ├── _functions.scss      # SCSS functions and mixins
│   │   └── _reset.scss          # CSS reset
│   ├── js/                       # JavaScript modules
│   │   ├── script.js            # Main script entry point
│   │   ├── dom-helpers.js       # DOM manipulation utilities
│   │   ├── navigation.js        # Navigation & menu logic
│   │   ├── scroll.js            # Scroll effects and animations
│   │   ├── ui.js                # UI interactions
│   │   └── effects.js           # Visual effects
│   ├── pages/                    # HTML pages
│   │   └── index.html           # Main page template
│   └── templates/                # Nunjucks templates
│       ├── header-template.html # Header component
│       ├── footer-template.html # Footer component
│       └── structure-template.html # Base layout
├── dist/                         # Compiled production files
│   ├── index.html               # Compiled HTML
│   ├── style.css                # Compiled CSS
│   ├── style.css.map            # CSS sourcemap
│   ├── js/
│   │   ├── script.js            # Bundled & minified JS
│   │   └── script.js.map        # JS sourcemap
│   └── img/                     # Images and assets
├── gulpfile.js                   # Gulp configuration
├── gulp.config.json              # Gulp settings
├── package.json                  # Dependencies
└── README.md                     # Documentation

```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14.0 or higher)
- **npm** (v6.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone [YOUR_REPOSITORY_URL]
   cd Strona_Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   gulp
   ```
   This will:
   - Compile SCSS to CSS
   - Bundle and minify JavaScript
   - Process Nunjucks templates
   - Generate sourcemaps
   - Watch for file changes

### Build Commands

```bash
# Start development with watch mode
gulp

# Individual tasks
gulp scssTask      # Compile SCSS
gulp jsTask        # Bundle & minify JavaScript
gulp nunjucksTask  # Process HTML templates
```

## 🎨 Customization

### Styling
Edit SCSS files in `src/scss/`:
- `main.scss` - Main styles and imports
- `_base.scss` - Typography, colors, base elements
- `_functions.scss` - Custom SCSS functions and mixins
- `_reset.scss` - CSS reset and normalize

### JavaScript
Modular JS files in `src/js/`:
- `script.js` - Main application entry
- `dom-helpers.js` - Reusable DOM utilities
- `navigation.js` - Navigation and menu logic
- `scroll.js` - Scroll animations and effects
- `ui.js` - UI interactions
- `effects.js` - Visual effects and animations

### HTML Templates
Nunjucks templates in `src/templates/` and pages in `src/pages/`

### Colors & Theme
Update color palette in `src/scss/main.scss`:
```scss
$colors-stack: (
    black: (#000000, #121212, #151515, #4f4942),
    grey: (#f2f2f2, #838383),
    white: (#ffffff, #f7f7f7),
    orange: (#db6400, #ffa62b, #f1b247, #b88674),
    // Add your custom colors...
);
```

## 📦 Deployment

### Production Build
The `dist/` folder contains production-ready files:
- Minified CSS with autoprefixer
- Bundled and minified JavaScript
- Compiled HTML from Nunjucks templates
- Optimized assets

### Deployment Options
- **GitHub Pages** - Deploy `dist/` folder
- **Netlify** - Connect repository and set build command to `gulp`
- **Vercel** - Similar to Netlify
- **Traditional Hosting** - Upload `dist/` folder contents via FTP

### GitHub Pages Deployment
```bash
# [ADD YOUR DEPLOYMENT STEPS HERE]
```

## 🌐 Services Offered

This portfolio showcases expertise in:
- **Design-to-Code Implementation** - Pixel-perfect coding from Figma, Photoshop, or Adobe XD
- **WordPress Development** - Custom themes and plugin integration
- **API Integrations** - Payment systems, CRM, and external services
- **Performance Optimization** - Core Web Vitals, speed optimization
- **Modern Frameworks** - React, Vue, Astro, Eleventy
- **Responsive Web Development** - Mobile-first approach

## 📄 License

[ADD YOUR LICENSE HERE]

## 👤 Author

**[YOUR NAME]**

- Website: [YOUR WEBSITE URL]
- GitHub: [@[YOUR_GITHUB_USERNAME]]([YOUR_GITHUB_URL])
- Email: [YOUR_EMAIL]
- LinkedIn: [YOUR_LINKEDIN_URL]

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show Your Support

Give a ⭐️ if you like this project!

## 📝 Notes

- Built with modern web standards and best practices
- Fully responsive and accessible design
- Optimized for performance and SEO
- Cross-browser compatible

---

**Made with ❤️ and modern web technologies**

