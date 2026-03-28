// ============================================
// RozgaarConnect — Employer Module
// ============================================

const Employer = {
  renderDashboard() {
    const user = DataStore.getCurrentUser();
    if (!user) return Auth.renderLogin();

    const jobs = DataStore.getJobsByEmployer(user.id);
    const allApps = jobs.flatMap(j => DataStore.getApplicationsByJob(j.id));
    const openJobs = jobs.filter(j => j.status === 'open').length;
    const pendingApps = allApps.filter(a => a.status === 'pending').length;

    return `
      <div class="dashboard fade-in">
        <!-- Employer Profile -->
        <section class="profile-section">
          <div class="profile-card glass-card">
            <div class="profile-header">
              <div class="profile-avatar-large">${(user.avatar || '🏢').startsWith('data:') ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : (user.avatar || '🏢')}</div>
              <div class="profile-info">
                <h2 class="profile-name">${user.name}</h2>
                ${user.company ? `<p class="profile-company">${user.company}</p>` : ''}
                <p class="profile-location">📍 ${user.location?.label || 'Location not set'}</p>
                <p class="profile-rating" style="margin-top:0.25rem;">
                  <span style="color:var(--warning);font-size:1.1rem">${Utils.renderStars(user.rating || 0)}</span>
                  <span style="color:var(--text-light);font-size:0.9rem">(${user.rating || 0} / 5.0 - ${user.reviewCount || 0} reviews)</span>
                </p>
              </div>
              <div class="profile-actions employer-profile-actions">
                <button class="btn btn-outline btn-sm" id="edit-emp-profile-btn">
                  ✏️ ${I18n.t('employer.edit_profile')}
                </button>
                <button class="btn btn-primary btn-sm" id="post-job-btn">
                  ${I18n.t('employer.post.btn')}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Stats -->
        <section class="stats-row">
          <div class="stat-card glass-card">
            <div class="stat-icon">📋</div>
            <div class="stat-number">${jobs.length}</div>
            <div class="stat-label">${I18n.t('employer.stats.jobs')}</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">🟢</div>
            <div class="stat-number">${openJobs}</div>
            <div class="stat-label">${I18n.t('employer.stats.open')}</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">👥</div>
            <div class="stat-number">${allApps.length}</div>
            <div class="stat-label">${I18n.t('employer.stats.applicants')}</div>
          </div>
          <div class="stat-card glass-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-number">${pendingApps}</div>
            <div class="stat-label">${I18n.t('employer.stats.pending')}</div>
          </div>
        </section>

        <!-- Job Listings -->
        <section class="section">
          <h2 class="section-title">${I18n.t('employer.jobs.title')}</h2>
          <div class="employer-jobs-list" id="employer-jobs">
            ${this.renderEmployerJobs(jobs)}
          </div>
        </section>
      </div>
    `;
  },

  renderEmployerJobs(jobs) {
    if (jobs.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>${I18n.t('employer.jobs.empty')}</h3>
          <p>${I18n.t('employer.jobs.empty.desc')}</p>
        </div>
      `;
    }

    return jobs.map(job => {
      const applications = DataStore.getApplicationsByJob(job.id);
      const pending = applications.filter(a => a.status === 'pending').length;
      const accepted = applications.filter(a => a.status === 'accepted').length;

      return `
        <div class="employer-job-card glass-card" data-job-id="${job.id}">
          <div class="ejob-header">
            <div>
              <h3 class="ejob-title">${job.title}</h3>
              <div class="ejob-meta">
                <span>📍 ${job.location.label}</span>
                <span>💰 ${Utils.formatPay(job.pay)}/day</span>
                <span>⏱ ${job.duration}</span>
                <span>👥 ${job.slots} slots</span>
              </div>
            </div>
            <div class="ejob-status-wrap">
              ${Utils.statusBadge(job.status)}
              <span class="ejob-date">${Utils.formatDate(job.postedDate)}</span>
            </div>
          </div>
          <div class="ejob-skills">
            ${job.skillsRequired.map(s => `<span class="skill-chip">${I18n.t('skill.' + s)}</span>`).join('')}
          </div>
          <div class="ejob-applicants">
            <div class="applicant-summary">
              <span class="app-count">${applications.length} applicants</span>
              ${pending > 0 ? `<span class="badge badge-warning">${pending} pending</span>` : ''}
              ${accepted > 0 ? `<span class="badge badge-success">${accepted} accepted</span>` : ''}
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem;">
              ${job.status !== 'completed' && accepted > 0 ? 
                `<button class="btn btn-outline btn-sm complete-job-btn" data-job-id="${job.id}" style="border-color: var(--success); color: var(--success);">✓ Mark Completed</button>` : 
              ''}
              <button class="btn btn-outline btn-sm delete-job-btn" data-job-id="${job.id}" style="border-color: var(--danger); color: var(--danger);">
                ${I18n.t('employer.job.delete')}
              </button>
              <button class="btn btn-outline btn-sm view-applicants-btn" data-job-id="${job.id}">
                ${I18n.t('employer.jobs.view_apps')}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderEditProfile() {
    const user = DataStore.getCurrentUser();
    return `
      <div class="auth-container fade-in">
        <div class="auth-card glass-card">
          <div class="auth-header">
            <button class="btn-back" id="back-to-dashboard">← Back to Dashboard</button>
            <h1 class="auth-title">${I18n.t('employer.edit_profile')}</h1>
          </div>
          <form id="edit-emp-profile-form" class="auth-form">
            <div class="form-group">
              <label for="edit-name">Name</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input type="text" id="edit-name" value="${user.name}" required>
              </div>
            </div>
            <div class="form-group">
              <label for="edit-company">Company</label>
              <div class="input-wrapper">
                <span class="input-icon">🏗️</span>
                <input type="text" id="edit-company" value="${user.company || ''}">
              </div>
            </div>
            <div class="form-group">
              <label>${I18n.t('auth.signup.profile_pic')}</label>
              <div class="avatar-upload-widget" id="edit-emp-avatar-widget">
                <div class="avatar-preview" id="edit-emp-avatar-preview">
                  ${(user.avatar || '').startsWith('data:') ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<span class="avatar-preview-emoji">${user.avatar || '\ud83c\udfe2'}</span>`}
                  <img id="edit-emp-avatar-img" src="" style="display:none;width:100%;height:100%;object-fit:cover;border-radius:50%;">
                </div>
                <div class="avatar-upload-info">
                  <button type="button" class="btn btn-outline btn-sm" id="edit-emp-avatar-btn">📷 Change Photo</button>
                  <span class="avatar-hint">JPG, PNG, WebP</span>
                </div>
                <input type="file" id="edit-avatar" accept="image/*" style="display:none;">
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-full">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    `;
  },

  renderPostJob() {
    const user = DataStore.getCurrentUser();
    return `
      <div class="auth-container fade-in">
        <div class="auth-card glass-card" style="max-width:640px">
          <div class="auth-header">
            <button class="btn-back" id="back-to-emp-dash">← Back to Dashboard</button>
            <h1 class="auth-title">Post a New Job</h1>
            <p class="auth-subtitle">Describe the work and find skilled workers</p>
          </div>
          <form id="post-job-form" class="auth-form">
            <div class="form-group">
              <label for="job-title">Job Title</label>
              <div class="input-wrapper">
                <span class="input-icon">📝</span>
                <input type="text" id="job-title" placeholder="e.g. Wall Painting — 2 BHK Flat" required>
              </div>
            </div>
            <div class="form-group">
              <label for="job-category">${I18n.t('post.field.category')}</label>
              <select id="job-category" class="filter-select full-width" required>
                ${SKILL_CATEGORIES.map(c => `<option value="${c.name}">${c.icon} ${I18n.t('cat.' + c.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="job-description">${I18n.t('post.field.desc')}</label>
              <textarea id="job-description" rows="3" class="form-textarea" placeholder="Describe the work in detail..." required></textarea>
            </div>
            <div class="form-group">
              <label>${I18n.t('post.field.skills')}</label>
              <div class="skills-grid" id="job-skills-selector">
                ${ALL_SKILLS.map(s => `
                  <label class="skill-chip-select">
                    <input type="checkbox" name="skills" value="${s}">
                    <span>${I18n.t('skill.' + s)}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="job-pay">${I18n.t('post.field.pay')}</label>
                <div class="input-wrapper">
                  <span class="input-icon">💰</span>
                  <input type="number" id="job-pay" placeholder="700" min="100" max="10000" required>
                </div>
              </div>
              <div class="form-group">
                <label for="job-duration">${I18n.t('post.field.duration')}</label>
                <div class="input-wrapper">
                  <span class="input-icon">⏱</span>
                  <input type="text" id="job-duration" placeholder="3 ${I18n.t('common.days')}" required>
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="job-slots">${I18n.t('post.field.slots')}</label>
                <div class="input-wrapper">
                  <span class="input-icon">👥</span>
                  <input type="number" id="job-slots" placeholder="2" min="1" max="20" value="1" required>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>📍 Job Location</label>
              <div class="location-picker">
                <button type="button" class="btn btn-outline btn-sm" id="detect-job-location-btn">
                  <span class="pulse-dot"></span> Use My Location
                </button>
                <span class="location-label" id="job-location-display">${user.location?.label || 'Not set'}</span>
              </div>
              <div class="location-or-divider"><span>OR pick on map</span></div>
              <div class="map-picker-section">
                <p class="map-picker-hint">📍 <strong>Select the job city</strong> to move the map, then <strong>click/drag the pin</strong> for exact location:</p>
                <div class="form-row form-row-2" style="margin-bottom: 8px;">
                  <div class="form-group" style="margin-bottom: 0;">
                    <select id="job-state" class="filter-select full-width">
                      <option value="">Select State</option>
                      ${INDIAN_STATES.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <select id="job-city" class="filter-select full-width" disabled>
                      <option value="">Select City</option>
                    </select>
                  </div>
                </div>
                <div id="job-map" class="location-map" style="height: 250px; border-radius: var(--radius-md); border: 1px solid var(--border-color); z-index: 1;"></div>
                <div class="map-location-result" id="job-map-result" style="margin-top: 8px; font-size: 0.9rem; color: var(--text-muted); display: none;">
                  <span class="map-pin-icon">📌</span>
                  <span id="job-map-label"></span>
                </div>
              </div>
              <input type="hidden" id="job-lat" value="${user.location?.lat || ''}">
              <input type="hidden" id="job-lng" value="${user.location?.lng || ''}">
              <input type="hidden" id="job-location-label" value="${user.location?.label || ''}">
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-full" id="submit-job-btn">
              <span>Post Job</span>
              <span class="btn-arrow">→</span>
            </button>
          </form>
        </div>
      </div>
    `;
  },

  renderApplicants(jobId) {
    const job = DataStore.getJobById(jobId);
    if (!job) return '<p>Job not found.</p>';

    const user = DataStore.getCurrentUser(); // ← employer (the rater)
    const applications = DataStore.getApplicationsByJob(jobId);

    return `
      <div class="dashboard fade-in">
        <div class="page-header">
          <button class="btn-back" id="back-to-emp-dash">← Back to Dashboard</button>
          <h1 class="page-title">${job.title}</h1>
          <p class="page-subtitle">${job.location.label} · ${Utils.formatPay(job.pay)}/day · ${job.duration}</p>
        </div>

        <section class="section">
          <h2 class="section-title">Applicants (${applications.length})</h2>
          ${applications.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">👥</div>
              <h3>No Applicants Yet</h3>
              <p>Workers will see your job listing and apply soon.</p>
            </div>
          ` : `
            <div class="applicants-list">
              ${applications.map(app => {
      const worker = DataStore.getUserById(app.workerId);
      if (!worker) return '';
      const matchScore = Utils.skillMatchScore(worker.skills || [], job.skillsRequired);
      return `
                  <div class="applicant-card glass-card">
                    <div class="applicant-header">
                      <div class="applicant-avatar">${(worker.avatar || '👷').startsWith('data:') ? `<img src="${worker.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : (worker.avatar || '👷')}</div>
                      <div class="applicant-info">
                        <h3>${worker.name}</h3>
                        <div class="applicant-meta">
                          <span>📍 ${worker.location?.label || 'Unknown'}</span>
                          <span>💰 ${Utils.formatPay(worker.dailyRate)}/day</span>
                          <span>📅 ${worker.experience || ''}</span>
                        </div>
                        <div class="applicant-meta">
                          ${worker.rating > 0 ? `<span class="rating"><span class="stars">${Utils.renderStars(worker.rating)}</span> ${worker.rating}</span>` : '<span class="rating">New Worker</span>'}
                          <span>${worker.completedJobs || 0} jobs completed</span>
                          <span class="match-indicator">${Math.round(matchScore * 100)}% skill match</span>
                        </div>
                        <div class="applicant-skills">
                          ${(worker.skills || []).map(s => `<span class="skill-chip ${job.skillsRequired.includes(s) ? 'skill-match' : ''}">${s}</span>`).join('')}
                        </div>
                      </div>
                      <div class="applicant-actions">
                        ${app.status === 'pending' && job.status !== 'completed' ? `
                          <button class="btn btn-primary btn-sm accept-btn" data-app-id="${app.id}">✓ Accept</button>
                          <button class="btn btn-danger btn-sm reject-btn" data-app-id="${app.id}">✗ Reject</button>
                        ` : ''}
                        
                        ${app.status !== 'pending' ? Utils.statusBadge(app.status) : ''}
                        
                        ${job.status === 'completed' && app.status === 'accepted' ? 
                          (DataStore.getReviewByJobAndTo(job.id, user.id, worker.id) ? 
                            `<span class="badge badge-success">★ Rated</span>` : 
                            `<button class="btn btn-outline btn-sm rate-worker-btn" 
                              data-worker-id="${worker.id}" 
                              data-worker-name="${worker.name}" 
                              data-worker-avatar="${worker.avatar || ''}"
                              data-job-id="${job.id}" 
                              style="border-color:var(--warning);color:var(--warning)">★ Rate Worker</button>`
                          ) : ''
                        }
                      </div>
                    </div>
                  </div>
                `;
    }).join('')}
            </div>
          `}
        </section>
      </div>
    `;
  },

  bindDashboardEvents() {
    document.getElementById('post-job-btn')?.addEventListener('click', () => {
      App.navigate('post-job');
    });

    document.getElementById('edit-emp-profile-btn')?.addEventListener('click', () => {
      App.navigate('employer-edit-profile');
    });

    document.querySelectorAll('.view-applicants-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.navigate('applicants', { jobId: btn.dataset.jobId });
      });
    });

    document.querySelectorAll('.delete-job-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Utils.showConfirmModal(
          I18n.currentLang === 'hi'
            ? 'क्या आप वाकई इस काम को हटाना चाहते हैं? सभी आवेदन भी हटा दिए जाएंगे।'
            : 'Are you sure you want to delete this listing? All applications will also be removed.',
          () => {
            DataStore.deleteJob(btn.dataset.jobId);
            Utils.showToast(I18n.t('toast.job_deleted'), 'success');
            App.navigate('employer-dashboard');
          },
          {
            title: I18n.currentLang === 'hi' ? 'लिस्टिंग हटाएँ?' : 'Delete Listing?',
            confirmText: I18n.currentLang === 'hi' ? 'हाँ, हटाएँ' : 'Yes, Delete',
            cancelText: I18n.currentLang === 'hi' ? 'रद्द करें' : 'Cancel',
            danger: true,
          }
        );
      });
    });

    document.querySelectorAll('.complete-job-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Utils.showConfirmModal(
          'Marking this job as completed will let you rate your workers. This cannot be undone.',
          () => {
            const job = DataStore.getJobById(btn.dataset.jobId);
            if (job) {
              job.status = 'completed';
              DataStore.updateJob(job);

              // Increment completedJobs for accepted workers
              const apps = DataStore.getApplicationsByJob(job.id).filter(a => a.status === 'accepted');
              apps.forEach(app => {
                const worker = DataStore.getUserById(app.workerId);
                if (worker) {
                  worker.completedJobs = (worker.completedJobs || 0) + 1;
                  DataStore.updateUser(worker);
                }
              });

              Utils.showToast('🎉 Job marked as completed!', 'success');
              App.navigate('employer-dashboard');
            }
          },
          {
            title: 'Mark Job as Completed?',
            confirmText: '✓ Mark Completed',
            cancelText: 'Not Yet',
          }
        );
      });
    });
  },

  bindEditProfileEvents() {
    document.getElementById('back-to-dashboard')?.addEventListener('click', () => App.navigate('employer-dashboard'));

    // Avatar pick button
    document.getElementById('edit-emp-avatar-btn')?.addEventListener('click', () => {
      document.getElementById('edit-avatar')?.click();
    });
    document.getElementById('edit-avatar')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.getElementById('edit-emp-avatar-img');
        const existingImg = document.querySelector('#edit-emp-avatar-preview img:not(#edit-emp-avatar-img)');
        const emoji = document.querySelector('#edit-emp-avatar-preview .avatar-preview-emoji');
        if (img) { img.src = ev.target.result; img.style.display = 'block'; }
        if (existingImg) existingImg.style.display = 'none';
        if (emoji) emoji.style.display = 'none';
        const btn = document.getElementById('edit-emp-avatar-btn');
        if (btn) btn.textContent = '✓ Photo Selected';
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('edit-emp-profile-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = e.target.querySelector('button[type="submit"]');
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<span class="spinner"></span>...';
      btn.disabled = true;

      const user = DataStore.getCurrentUser();
      user.name = document.getElementById('edit-name').value.trim();
      user.company = document.getElementById('edit-company').value.trim();
      
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

      DataStore.updateUser(user);
      DataStore.setCurrentUser(user);
      Utils.showToast(I18n.t('toast.profile_updated'), 'success');
      App.navigate('employer-dashboard');
    });
  },

  bindPostJobEvents() {
    document.getElementById('back-to-emp-dash')?.addEventListener('click', () => App.navigate('employer-dashboard'));

    document.getElementById('detect-job-location-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('detect-job-location-btn');
      btn.innerHTML = '<span class="spinner"></span> Detecting...';
      btn.disabled = true;
      try {
        const loc = await Utils.getCurrentLocation();
        this._setJobLocation(loc);
        btn.innerHTML = '✓ Location Set';
        btn.classList.add('btn-success-state');
      } catch (err) {
        btn.innerHTML = '<span class="pulse-dot"></span> Retry Detection';
        btn.disabled = false;
        Utils.showToast(err.message, 'error');
      }
    });

    // Map location picker
    const user = DataStore.getCurrentUser();
    setTimeout(() => {
      this.jobMap = Utils.initMapPicker({
        mapId: 'job-map',
        stateId: 'job-state',
        cityId: 'job-city',
        latInputId: 'job-lat',
        lngInputId: 'job-lng',
        labelInputId: 'job-location-label',
        resultLabelId: 'job-map-label',
        resultContainerId: 'job-map-result',
        initialLocation: user?.location
      });
    }, 100);

    // Update skills based on category
    document.getElementById('job-category')?.addEventListener('change', (e) => {
      const cat = SKILL_CATEGORIES.find(c => c.name === e.target.value);
      if (cat) {
        document.querySelectorAll('#job-skills-selector input').forEach(cb => {
          cb.checked = cat.skills.includes(cb.value);
        });
      }
    });

    document.getElementById('post-job-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = DataStore.getCurrentUser();
      const skills = [...document.querySelectorAll('#job-skills-selector input:checked')].map(cb => cb.value);
      if (skills.length === 0) {
        Utils.showToast(I18n.t('toast.select_skill'), 'error');
        return;
      }

      const job = {
        id: DataStore.generateId('j'),
        employerId: user.id,
        title: document.getElementById('job-title').value.trim(),
        category: document.getElementById('job-category').value,
        description: document.getElementById('job-description').value.trim(),
        skillsRequired: skills,
        location: {
          lat: parseFloat(document.getElementById('job-lat').value) || user.location?.lat,
          lng: parseFloat(document.getElementById('job-lng').value) || user.location?.lng,
          label: document.getElementById('job-location-label').value || user.location?.label || 'Location',
        },
        pay: parseInt(document.getElementById('job-pay').value),
        duration: document.getElementById('job-duration').value.trim(),
        slots: parseInt(document.getElementById('job-slots').value) || 1,
        postedDate: new Date().toISOString().split('T')[0],
        status: 'open',
      };

      DataStore.addJob(job);
      Utils.showToast(I18n.t('toast.job_posted'), 'success');
      App.navigate('employer-dashboard');
    });
  },

  bindApplicantsEvents(jobId) {
    document.getElementById('back-to-emp-dash')?.addEventListener('click', () => App.navigate('employer-dashboard'));

    document.querySelectorAll('.accept-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = DataStore.getApplications().find(a => a.id === btn.dataset.appId);
        if (app) {
          app.status = 'accepted';
          DataStore.updateApplication(app);
          Utils.showToast(I18n.t('toast.app_accepted'), 'success');
          App.navigate('applicants', { jobId });
        }
      });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = DataStore.getApplications().find(a => a.id === btn.dataset.appId);
        if (app) {
          app.status = 'rejected';
          DataStore.updateApplication(app);
          Utils.showToast(I18n.t('toast.app_rejected'), 'info');
          App.navigate('applicants', { jobId });
        }
      });
    });

    document.querySelectorAll('.rate-worker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const workerId = btn.dataset.workerId;
        const workerName = btn.dataset.workerName;
        const workerAvatar = btn.dataset.workerAvatar || '';
        const jId = btn.dataset.jobId;
        const employerId = DataStore.getCurrentUser().id;
        
        Utils.showReviewModal(workerName, 'worker', (score, text) => {
          DataStore.addReview(jId, employerId, workerId, score, text);
          App.navigate('applicants', { jobId: jId }); // refresh view
        }, workerAvatar);
      });
    });
  },

  _setJobLocation(loc) {
    document.getElementById('job-lat').value = loc.lat;
    document.getElementById('job-lng').value = loc.lng;
    document.getElementById('job-location-label').value = loc.label;
    document.getElementById('job-location-display').textContent = `📍 ${loc.label}`;
    document.getElementById('job-location-display').classList.add('location-detected');
    Utils.showToast(`Location: ${loc.label}`, 'success');

    // Also update the map pin if it's initialized
    const mapEl = document.getElementById('job-map');
    if (mapEl && mapEl.updateMapPin) {
      mapEl.leafletMap.flyTo([loc.lat, loc.lng], 16);
      mapEl.updateMapPin(loc.lat, loc.lng, false);
    }

    if (loc.state || loc.city) {
      Utils.autoFillLocationDropdowns('job-state', 'job-city', loc.state, loc.city);
    }
  },
};
