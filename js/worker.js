// ============================================
// RozgaarConnect — Worker Module
// ============================================

const Worker = {
  currentFilters: {
    search: '',
    category: 'all',
    maxDistance: 50,
    minPay: 0,
    sortBy: 'distance',
  },

  renderDashboard() {
    const user = DataStore.getCurrentUser();
    if (!user) return Auth.renderLogin();

    const applications = DataStore.getApplicationsByWorker(user.id);
    const pendingCount = applications.filter(a => a.status === 'pending').length;
    const acceptedCount = applications.filter(a => a.status === 'accepted').length;

    return `
      <div class="dashboard fade-in">
        <!-- Profile Card -->
        <section class="profile-section">
          <div class="profile-card glass-card">
            <div class="profile-header">
              <div class="profile-avatar-large">${(user.avatar || '👷').startsWith('data:') ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : (user.avatar || '👷')}</div>
              <div class="profile-info">
                <h2 class="profile-name">${user.name}</h2>
                <p class="profile-location">📍 ${user.location?.label || 'Location not set'}</p>
                <div class="profile-meta">
                  <span class="rating" style="color:var(--warning)"><span class="stars">${Utils.renderStars(user.rating || 0)}</span> ${user.rating || 0} <span style="font-size:0.8rem;color:var(--text-light)">(${user.reviewCount || 0})</span></span>
                  <span class="meta-divider">•</span>
                  <span>${user.completedJobs || 0} ${I18n.t('common.completed')}</span>
                </div>
              </div>
              <div class="profile-rate">
                <span class="rate-amount">${Utils.formatPay(user.dailyRate)}</span>
                <span class="rate-label">/day</span>
              </div>
            </div>
            <div class="profile-skills">
              ${(user.skills || []).map(s => `<span class="skill-chip">${I18n.t('skill.' + s)}</span>`).join('')}
            </div>
            <div class="profile-actions">
              ${Utils.statusBadge(user.availability)}
              <button class="btn btn-outline btn-sm" id="toggle-availability-btn">
                ${user.availability === 'available' ? '⏸ Set Busy' : '▶ Set Available'}
              </button>
              <button class="btn btn-outline btn-sm" id="edit-profile-btn">✏️ Edit Profile</button>
            </div>
          </div>
        </section>

        <!-- Quick Stats -->
        <section class="stats-row">
          <div class="stat-card glass-card">
            <div class="stat-icon">📋</div>
            <div class="stat-number">${applications.length}</div>
            <div class="stat-label">Applied</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-number">${pendingCount}</div>
            <div class="stat-label">Pending</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">✅</div>
            <div class="stat-number">${acceptedCount}</div>
            <div class="stat-label">Accepted</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-number">${user.completedJobs || 0}</div>
            <div class="stat-label">Completed</div>
          </div>
        </section>

        <!-- Tabs -->
        <div class="tab-bar">
          <button class="tab-btn active" data-tab="jobs" id="tab-jobs-btn">🔍 ${I18n.t('worker.filter.jobs')}</button>
          <button class="tab-btn" data-tab="applications" id="tab-applications-btn">📋 ${I18n.t('worker.nav.apps')}</button>
        </div>

        <!-- Jobs Tab -->
        <section class="tab-content active" id="tab-jobs">
          ${this.renderJobFilters()}
          <div class="jobs-list" id="jobs-container">
            ${this.renderJobsList(user)}
          </div>
        </section>

        <!-- Applications Tab -->
        <section class="tab-content" id="tab-applications">
          ${this.renderApplications(user)}
        </section>
      </div>
    `;
  },

  renderJobFilters() {
    return `
      <div class="filters-bar glass-card">
        <div class="filter-row">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="job-search" placeholder="Search jobs..." class="search-input" value="${this.currentFilters.search}">
          </div>
          <select id="filter-category" class="filter-select">
            <option value="all">${I18n.t('worker.filter.all')}</option>
            ${SKILL_CATEGORIES.map(c => `<option value="${c.name}" ${this.currentFilters.category === c.name ? 'selected' : ''}>${c.icon} ${I18n.t('cat.' + c.name)}</option>`).join('')}
          </select>
          <select id="filter-sort" class="filter-select">
            <option value="distance" ${this.currentFilters.sortBy === 'distance' ? 'selected' : ''}>Nearest First</option>
            <option value="pay-high" ${this.currentFilters.sortBy === 'pay-high' ? 'selected' : ''}>Highest Pay</option>
            <option value="pay-low" ${this.currentFilters.sortBy === 'pay-low' ? 'selected' : ''}>Lowest Pay</option>
            <option value="recent" ${this.currentFilters.sortBy === 'recent' ? 'selected' : ''}>Most Recent</option>
          </select>
        </div>
        <div class="filter-row">
          <label class="range-filter">
            <span>Max Distance: <strong id="distance-value">${this.currentFilters.maxDistance}km</strong></span>
            <input type="range" min="1" max="100" value="${this.currentFilters.maxDistance}" id="filter-distance">
          </label>
          <label class="range-filter">
            <span>Min Pay: <strong id="pay-value">${Utils.formatPay(this.currentFilters.minPay)}</strong></span>
            <input type="range" min="0" max="2000" step="100" value="${this.currentFilters.minPay}" id="filter-pay">
          </label>
        </div>
      </div>
    `;
  },

  renderJobsList(user) {
    let jobs = DataStore.getOpenJobs();

    // Apply filters
    if (this.currentFilters.search) {
      const q = this.currentFilters.search.toLowerCase();
      jobs = jobs.filter(j => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q) ||
        j.skillsRequired.some(s => s.toLowerCase().includes(q)));
    }
    if (this.currentFilters.category !== 'all') {
      jobs = jobs.filter(j => j.category === this.currentFilters.category);
    }
    if (this.currentFilters.minPay > 0) {
      jobs = jobs.filter(j => j.pay >= this.currentFilters.minPay);
    }

    // Add distance
    jobs = jobs.map(j => ({ ...j, distance: Utils.calculateDistance(user.location, j.location) }));

    // Filter by distance
    jobs = jobs.filter(j => j.distance <= this.currentFilters.maxDistance);

    // Sort
    switch (this.currentFilters.sortBy) {
      case 'distance': jobs.sort((a, b) => a.distance - b.distance); break;
      case 'pay-high': jobs.sort((a, b) => b.pay - a.pay); break;
      case 'pay-low': jobs.sort((a, b) => a.pay - b.pay); break;
      case 'recent': jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate)); break;
    }

    if (jobs.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>${I18n.t('worker.empty.jobs')}</h3>
          <p>${I18n.t('worker.empty.jobs.desc')}</p>
        </div>
      `;
    }

    return jobs.map(job => {
      const employer = DataStore.getUserById(job.employerId);
      const hasApplied = DataStore.hasApplied(job.id, user.id);
      const matchScore = Utils.skillMatchScore(user.skills || [], job.skillsRequired);

      return `
        <div class="job-card glass-card ${hasApplied ? 'applied' : ''}" data-job-id="${job.id}">
          <div class="job-card-header">
            <div class="job-title-wrap">
              <h3 class="job-title">${job.title}</h3>
              <span class="job-employer">
                ${employer?.avatar || '🏢'} ${employer?.name || 'Unknown'} 
                ${employer?.rating > 0 ? `<span style="color:var(--warning);font-size:0.9rem">★ ${employer.rating}</span>` : ''}
              </span>
            </div>
            <div class="job-pay">
              <span class="pay-amount">${Utils.formatPay(job.pay)}</span>
              <span class="pay-period">/day</span>
            </div>
          </div>
          <p class="job-desc">${job.description}</p>
          <div class="job-meta">
            <span class="job-meta-item">📍 ${job.location.label} · <em>${Utils.formatDistance(job.distance)}</em></span>
            <span class="job-meta-item">⏱ ${job.duration}</span>
            <span class="job-meta-item">👥 ${job.slots} slot${job.slots > 1 ? 's' : ''}</span>
            <span class="job-meta-item">📅 ${Utils.formatDate(job.postedDate)}</span>
          </div>
          <div class="job-footer">
            <div class="job-skills">
              ${job.skillsRequired.map(s => `<span class="skill-chip ${(user.skills || []).includes(s) ? 'skill-match' : ''}">${I18n.t('skill.' + s)}</span>`).join('')}
            </div>
            ${matchScore > 0 ? `<span class="match-indicator">${Math.round(matchScore * 100)}% ${I18n.t('common.match')}</span>` : ''}
            ${hasApplied
        ? `<button class="btn btn-outline btn-sm" disabled>✓ ${I18n.t('worker.job.applied').replace('✓','').trim()}</button>`
        : `<button class="btn btn-primary btn-sm apply-btn" data-job-id="${job.id}">⚡ ${I18n.t('worker.job.apply').replace('→','').trim()}</button>`
      }
          </div>
        </div>
      `;
    }).join('');
  },

  renderApplications(user) {
    const applications = DataStore.getApplicationsByWorker(user.id);

    if (applications.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>${I18n.t('apps.empty')}</h3>
          <p>${I18n.t('apps.empty.desc')}</p>
        </div>
      `;
    }

    // Group by status
    const grouped = { accepted: [], pending: [], rejected: [], completed: [] };
    applications.forEach(a => {
      const job = DataStore.getJobById(a.jobId);
      if (job && job.status === 'completed' && a.status === 'accepted') {
        grouped['completed'].push(a);
      } else {
        if (grouped[a.status]) grouped[a.status].push(a);
        else grouped['pending'].push(a);
      }
    });

    let html = '';
    for (const [status, apps] of Object.entries(grouped)) {
      if (apps.length === 0) continue;
      html += `<h3 class="section-subtitle">${status.charAt(0).toUpperCase() + status.slice(1)} (${apps.length})</h3>`;
      html += apps.map(a => {
        const job = DataStore.getJobById(a.jobId);
        if (!job) return '';
        const employer = DataStore.getUserById(job.employerId);
        return `
          <div class="application-card glass-card">
            <div class="app-header">
              <h4>${job.title}</h4>
              ${Utils.statusBadge(a.status)}
            </div>
            <div class="app-details">
              <span>${(employer?.avatar || '🏢').startsWith('data:') ? `<img src="${employer.avatar}" style="width:20px;height:20px;object-fit:cover;border-radius:50%;vertical-align:middle;">` : (employer?.avatar || '🏢')} ${employer?.name || 'Unknown'}</span>
              <span>📍 ${job.location.label}</span>
              <span>💰 ${Utils.formatPay(job.pay)}/day</span>
              <span>📅 Applied ${Utils.formatDate(a.appliedDate)}</span>
            </div>
            ${job.status === 'completed' && a.status === 'accepted' ? `
            <div class="app-actions" style="margin-top: 1rem; text-align: right;">
              ${DataStore.getReviewByJobAndTo(job.id, user.id, employer.id) ? 
                `<span class="badge badge-success">★ Rated</span>` : 
                `<button class="btn btn-outline btn-sm rate-employer-btn" 
                  data-employer-id="${employer.id}" 
                  data-employer-name="${employer.name}" 
                  data-employer-avatar="${employer.avatar || ''}"
                  data-job-id="${job.id}" 
                  style="border-color:var(--warning);color:var(--warning)">★ Rate Employer</button>`}
            </div>
            ` : (a.status === 'pending') ? `
            <div class="app-actions" style="margin-top: 1rem; text-align: right;">
              <button class="btn btn-outline btn-sm withdraw-app-btn" data-app-id="${a.id}">
                ${I18n.t('worker.app.withdraw')}
              </button>
            </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
    return html;
  },

  renderEditProfile() {
    const user = DataStore.getCurrentUser();
    return `
      <div class="auth-container fade-in">
        <div class="auth-card glass-card">
          <div class="auth-header">
            <button class="btn-back" id="back-to-dashboard">← Back to Dashboard</button>
            <h1 class="auth-title">Edit Profile</h1>
          </div>
          <form id="edit-profile-form" class="auth-form">
            <div class="form-group">
              <label for="edit-name">Full Name</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input type="text" id="edit-name" value="${user.name}" required>
              </div>
            </div>
            <div class="form-group">
              <label>${I18n.t('auth.signup.profile_pic')}</label>
              <div class="avatar-upload-widget" id="edit-avatar-widget">
                <div class="avatar-preview" id="edit-avatar-preview">
                  ${(user.avatar || '').startsWith('data:') ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<span class="avatar-preview-emoji">${user.avatar || '\ud83d\udc77'}</span>`}
                  <img id="edit-avatar-img" src="" style="display:none;width:100%;height:100%;object-fit:cover;border-radius:50%;">
                </div>
                <div class="avatar-upload-info">
                  <button type="button" class="btn btn-outline btn-sm" id="edit-avatar-btn">📷 Change Photo</button>
                  <span class="avatar-hint">JPG, PNG, WebP</span>
                </div>
                <input type="file" id="edit-avatar" accept="image/*" style="display:none;">
              </div>
            </div>
            <div class="form-group">
              <label>Select Your Skills</label>
              <div class="skills-grid" id="edit-skills-selector">
                ${ALL_SKILLS.map(s => `
                  <label class="skill-chip-select">
                    <input type="checkbox" name="skills" value="${s}" ${(user.skills || []).includes(s) ? 'checked' : ''}>
                    <span>${s}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="edit-rate">Daily Rate (₹)</label>
                <div class="input-wrapper">
                  <span class="input-icon">💰</span>
                  <input type="number" id="edit-rate" value="${user.dailyRate}" min="100" max="5000" required>
                </div>
              </div>
              <div class="form-group">
                <label for="edit-exp">Experience</label>
                <div class="input-wrapper">
                  <span class="input-icon">📅</span>
                  <input type="text" id="edit-exp" value="${user.experience || ''}" required>
                </div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-full">
              <span>Save Changes</span>
              <span class="btn-arrow">→</span>
            </button>
          </form>
        </div>
      </div>
    `;
  },

  bindDashboardEvents() {
    const user = DataStore.getCurrentUser();

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');
      });
    });

    // Filters
    const refreshJobs = Utils.debounce(() => {
      const container = document.getElementById('jobs-container');
      if (container) container.innerHTML = this.renderJobsList(user);
      this._bindApplyButtons(user);
    }, 200);

    document.getElementById('job-search')?.addEventListener('input', (e) => {
      this.currentFilters.search = e.target.value;
      refreshJobs();
    });
    document.getElementById('filter-category')?.addEventListener('change', (e) => {
      this.currentFilters.category = e.target.value;
      refreshJobs();
    });
    document.getElementById('filter-sort')?.addEventListener('change', (e) => {
      this.currentFilters.sortBy = e.target.value;
      refreshJobs();
    });
    document.getElementById('filter-distance')?.addEventListener('input', (e) => {
      this.currentFilters.maxDistance = parseInt(e.target.value);
      document.getElementById('distance-value').textContent = `${e.target.value}km`;
      refreshJobs();
    });
    document.getElementById('filter-pay')?.addEventListener('input', (e) => {
      this.currentFilters.minPay = parseInt(e.target.value);
      document.getElementById('pay-value').textContent = Utils.formatPay(e.target.value);
      refreshJobs();
    });

    // Toggle availability
    document.getElementById('toggle-availability-btn')?.addEventListener('click', () => {
      const u = DataStore.getCurrentUser();
      u.availability = u.availability === 'available' ? 'busy' : 'available';
      DataStore.updateUser(u);
      DataStore.setCurrentUser(u);
      Utils.showToast(`${I18n.t('toast.status_set')} ${I18n.t('status.' + u.availability)}`, 'success');
      App.navigate('worker-dashboard');
    });

    // Edit profile
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      App.navigate('edit-profile');
    });

    // Withdraw application
    document.querySelectorAll('.withdraw-app-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        Utils.showConfirmModal(
          I18n.currentLang === 'hi'
            ? 'क्या आप वाकई यह आवेदन वापस लेना चाहते हैं?'
            : 'Are you sure you want to withdraw this application?',
          () => {
            DataStore.deleteApplication(btn.dataset.appId);
            Utils.showToast(I18n.t('toast.app_withdrawn'), 'success');
            App.navigate('worker-dashboard');
          },
          {
            title: I18n.currentLang === 'hi' ? 'आवेदन वापस लें?' : 'Withdraw Application?',
            confirmText: I18n.currentLang === 'hi' ? 'हाँ, वापस लें' : 'Yes, Withdraw',
            cancelText: I18n.currentLang === 'hi' ? 'रद्द करें' : 'Cancel',
            danger: true,
          }
        );
      });
    });

    // Rate employer
    document.querySelectorAll('.rate-employer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const employerId = btn.dataset.employerId;
        const employerName = btn.dataset.employerName;
        const employerAvatar = btn.dataset.employerAvatar || '';
        const jId = btn.dataset.jobId;
        const workerId = DataStore.getCurrentUser().id;
        
        Utils.showReviewModal(employerName, 'employer', (score, text) => {
          DataStore.addReview(jId, workerId, employerId, score, text);
          App.navigate('worker-dashboard'); // refresh view
        }, employerAvatar);
      });
    });

    this._bindApplyButtons(user);
  },

  _bindApplyButtons(user) {
    document.querySelectorAll('.apply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const jobId = btn.dataset.jobId;
        if (DataStore.hasApplied(jobId, user.id)) {
          Utils.showToast(I18n.t('toast.already_applied'), 'info');
          return;
        }
        DataStore.addApplication({
          id: DataStore.generateId('a'),
          jobId,
          workerId: user.id,
          status: 'pending',
          appliedDate: new Date().toISOString().split('T')[0],
        });
        Utils.showToast(I18n.t('toast.app_submitted'), 'success');
        btn.disabled = true;
        btn.textContent = '✓ Applied';
        btn.className = 'btn btn-outline btn-sm';

        // Update stats in stat cards
        const statCards = document.querySelectorAll('.stat-number');
        if (statCards[0]) statCards[0].textContent = DataStore.getApplicationsByWorker(user.id).length;
        if (statCards[1]) statCards[1].textContent = DataStore.getApplicationsByWorker(user.id).filter(a => a.status === 'pending').length;
      });
    });
  },

  bindEditProfileEvents() {
    document.getElementById('back-to-dashboard')?.addEventListener('click', () => App.navigate('worker-dashboard'));

    // Avatar pick button
    document.getElementById('edit-avatar-btn')?.addEventListener('click', () => {
      document.getElementById('edit-avatar')?.click();
    });
    document.getElementById('edit-avatar')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.getElementById('edit-avatar-img');
        const existingImg = document.querySelector('#edit-avatar-preview img:not(#edit-avatar-img)');
        const emoji = document.querySelector('#edit-avatar-preview .avatar-preview-emoji');
        if (img) { img.src = ev.target.result; img.style.display = 'block'; }
        if (existingImg) existingImg.style.display = 'none';
        if (emoji) emoji.style.display = 'none';
        const btn = document.getElementById('edit-avatar-btn');
        if (btn) btn.textContent = '✓ Photo Selected';
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('edit-profile-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = e.target.querySelector('button[type="submit"]');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<span class="spinner"></span>...';
      btn.disabled = true;

      const user = DataStore.getCurrentUser();
      user.name = document.getElementById('edit-name').value.trim();
      user.skills = [...document.querySelectorAll('#edit-skills-selector input:checked')].map(cb => cb.value);
      user.dailyRate = parseInt(document.getElementById('edit-rate').value) || 500;
      user.experience = document.getElementById('edit-exp').value || '1 year';
      
      try {
        const fileInput = document.getElementById('edit-avatar');
        if (fileInput && fileInput.files.length > 0) {
          const b64 = await Utils.compressImage(fileInput.files[0]);
          if (b64) user.avatar = b64;
        }
      } catch (err) {
        Utils.showToast(err.message, 'error');
        btn.innerHTML = originalHtml; btn.disabled = false;
        return;
      }

      if (user.skills.length === 0) {
        Utils.showToast(I18n.t('toast.select_skill'), 'error');
        btn.innerHTML = originalHtml; btn.disabled = false;
        return;
      }
      DataStore.updateUser(user);
      DataStore.setCurrentUser(user);
      Utils.showToast(I18n.t('toast.profile_updated'), 'success');
      App.navigate('worker-dashboard');
    });
  },
};
