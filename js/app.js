// ============================================
// RozgaarConnect — Main Application Controller
// ============================================

const App = {
  currentPage: 'landing',
  params: {},

  init() {
    DataStore.init();
    const user = DataStore.getCurrentUser();
    if (user) {
      LocationTracker.start();
      this.navigate(user.role === 'worker' ? 'worker-dashboard' : 'employer-dashboard');
    } else {
      this.navigate('landing');
    }
  },

  navigate(page, params = {}) {
    this.currentPage = page;
    this.params = params;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  render() {
    const app = document.getElementById('app');
    const user = DataStore.getCurrentUser();

    // Build page content
    let content = '';
    let showNav = false;

    switch (this.currentPage) {
      case 'landing':
        content = this.renderLanding();
        break;
      case 'login':
        content = Auth.renderLogin();
        break;
      case 'signup':
        content = Auth.renderSignup(this.params.role || 'worker');
        break;
      case 'worker-dashboard':
        showNav = true;
        content = Worker.renderDashboard();
        break;
      case 'employer-dashboard':
        showNav = true;
        content = Employer.renderDashboard();
        break;
      case 'post-job':
        showNav = true;
        content = Employer.renderPostJob();
        break;
      case 'applicants':
        showNav = true;
        content = Employer.renderApplicants(this.params.jobId);
        break;
      case 'edit-profile':
        showNav = true;
        content = Worker.renderEditProfile();
        break;
      case 'employer-edit-profile':
        showNav = true;
        content = Employer.renderEditProfile();
        break;
      default:
        content = this.renderLanding();
    }

    app.innerHTML = `
      ${showNav ? this.renderNav(user) : ''}
      <main class="main-content ${showNav ? 'with-nav' : ''}">${content}</main>
      <div id="toast-container" class="toast-container"></div>
    `;

    // Bind events after render
    this.bindEvents();
  },

  renderNav(user) {
    if (!user) return '';
    return `
      <nav class="top-nav glass-nav">
        <div class="nav-inner">
          <a class="nav-brand" id="nav-home-link">
            <span class="brand-icon">🤝</span>
            <span class="brand-text">Rozgaar<span class="brand-accent">Connect</span></span>
          </a>
          <div class="nav-right">
            <select class="btn btn-outline btn-xs" id="lang-toggle" onchange="I18n.setLanguage(this.value)">
              <option value="en" ${I18n.currentLang === 'en' ? 'selected' : ''}>ENG</option>
              <option value="hi" ${I18n.currentLang === 'hi' ? 'selected' : ''}>हिंदी</option>
            </select>
            <span class="nav-user">
              <span class="nav-avatar">${(user.avatar || '👤').startsWith('data:') ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : (user.avatar || '👤')}</span>
              <span class="nav-name">${user.name}</span>
            </span>
            <button class="btn btn-outline btn-xs" id="logout-btn">${I18n.t('nav.logout')}</button>
          </div>
        </div>
      </nav>
    `;
  },

  renderLanding() {
    const stats = DataStore.getStats();
    return `
      <div class="landing fade-in">
        <!-- Landing Logo -->
        <header class="landing-logo" style="position: absolute; top: 24px; left: 24px; z-index: 10; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 2rem; line-height: 1;">🤝</span>
          <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px;">Rozgaar<span style="color: var(--accent-primary);">Connect</span></span>
        </header>

        <!-- Hero -->
        <section class="hero">
          <div class="hero-bg-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>
          <div class="hero-content">
            <div class="hero-badge">${I18n.t('landing.badge')}</div>
            <h1 class="hero-title">
              ${I18n.t('landing.title.1')}<br>
              <span class="gradient-text">${I18n.t('landing.title.2')}</span><br>
              ${I18n.t('landing.title.3')}
            </h1>
            <p class="hero-subtitle">
              ${I18n.t('landing.subtitle')}
            </p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" id="cta-worker">
                <span>${I18n.t('landing.cta.worker')}</span>
                <span class="btn-arrow">→</span>
              </button>
              <button class="btn btn-secondary btn-lg" id="cta-employer">
                <span>${I18n.t('landing.cta.employer')}</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Stats -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-block">
              <div class="stat-num" data-target="3450">0</div>
              <div class="stat-text">${I18n.t('landing.stats.workers')}</div>
            </div>
            <div class="stat-block">
              <div class="stat-num" data-target="1284">0</div>
              <div class="stat-text">${I18n.t('landing.stats.jobs')}</div>
            </div>
            <div class="stat-block">
              <div class="stat-num" data-target="2790">0</div>
              <div class="stat-text">${I18n.t('landing.stats.matches')}</div>
            </div>
          </div>
        </section>

        <!-- How it Works -->
        <section class="how-section">
          <h2 class="section-heading">${I18n.t('landing.how.title')}</h2>
          <div class="steps-grid">
            <div class="step-card glass-card">
              <div class="step-number">01</div>
              <div class="step-icon">📝</div>
              <h3>${I18n.t('landing.how.step1.title')}</h3>
              <p>${I18n.t('landing.how.step1.desc')}</p>
            </div>
            <div class="step-card glass-card">
              <div class="step-number">02</div>
              <div class="step-icon">🔍</div>
              <h3>${I18n.t('landing.how.step2.title')}</h3>
              <p>${I18n.t('landing.how.step2.desc')}</p>
            </div>
            <div class="step-card glass-card">
              <div class="step-number">03</div>
              <div class="step-icon">🤝</div>
              <h3>${I18n.t('landing.how.step3.title')}</h3>
              <p>${I18n.t('landing.how.step3.desc')}</p>
            </div>
          </div>
        </section>

        <!-- Categories -->
        <section class="categories-section">
          <h2 class="section-heading">${I18n.t('landing.cat.title')}</h2>
          <div class="categories-grid">
            ${SKILL_CATEGORIES.map(cat => `
              <div class="category-card glass-card">
                <div class="cat-icon">${cat.icon}</div>
                <h3>${I18n.t('cat.' + cat.name)}</h3>
                <p>${cat.skills.slice(0, 3).map(s => I18n.t('skill.' + s)).join(', ')}${cat.skills.length > 3 ? '...' : ''}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- CTA -->
        <section class="bottom-cta">
          <div class="glass-card cta-card">
            <h2>${I18n.t('landing.cta.bottom.title')}</h2>
            <p>${I18n.t('landing.cta.bottom.desc')}</p>
            <button class="btn btn-primary btn-lg" id="cta-bottom">${I18n.t('landing.cta.bottom.btn')}</button>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <div class="footer-inner">
            <div class="footer-brand">
              <span class="brand-icon">🤝</span>
              <span>Rozgaar<span class="brand-accent">Connect</span></span>
            </div>
            <p>${I18n.t('landing.footer.tagline')}</p>
            <p class="footer-copy">${I18n.t('landing.footer.copyright')}</p>
          </div>
        </footer>
      </div>
    `;
  },

  bindEvents() {
    // Landing CTAs
    document.getElementById('cta-worker')?.addEventListener('click', () => this.navigate('signup', { role: 'worker' }));
    document.getElementById('cta-employer')?.addEventListener('click', () => this.navigate('signup', { role: 'employer' }));
    document.getElementById('cta-bottom')?.addEventListener('click', () => this.navigate('login'));

    // Nav
    document.getElementById('nav-home-link')?.addEventListener('click', () => {
      const user = DataStore.getCurrentUser();
      if (user) this.navigate(user.role === 'worker' ? 'worker-dashboard' : 'employer-dashboard');
    });
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      LocationTracker.stop();
      DataStore.logout();
      Utils.showToast(I18n.t('toast.logged_out'), 'info');
      this.navigate('landing');
    });

    // Page-specific bindings
    switch (this.currentPage) {
      case 'login':
        Auth.bindLoginEvents();
        break;
      case 'signup':
        Auth.bindSignupEvents(this.params.role || 'worker');
        break;
      case 'worker-dashboard':
        LocationTracker.start();
        Worker.bindDashboardEvents();
        break;
      case 'employer-dashboard':
        Employer.bindDashboardEvents();
        break;
      case 'post-job':
        Employer.bindPostJobEvents();
        break;
      case 'applicants':
        Employer.bindApplicantsEvents(this.params.jobId);
        break;
      case 'edit-profile':
        Worker.bindEditProfileEvents();
        break;
      case 'employer-edit-profile':
        Employer.bindEditProfileEvents();
        break;
    }

    // Animate stats counters on landing
    if (this.currentPage === 'landing') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num').forEach(el => {
              Utils.animateCounter(el, parseInt(el.dataset.target));
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      const statsSection = document.querySelector('.stats-section');
      if (statsSection) observer.observe(statsSection);
    }
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
