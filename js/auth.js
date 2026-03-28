// ============================================
// RozgaarConnect — Authentication Module
// ============================================

const Auth = {
  renderLogin() {
    return `
      <div class="auth-container fade-in">
        <div class="auth-card glass-card">
          <div class="auth-header">
            <div class="auth-logo">🤝</div>
            <h1 class="auth-title">${I18n.t('auth.login.title')}</h1>
            <p class="auth-subtitle">${I18n.t('auth.login.subtitle')}</p>
          </div>
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="login-phone">${I18n.t('auth.login.phone')}</label>
              <div class="input-wrapper">
                <span class="input-icon">📱</span>
                <input type="tel" id="login-phone" placeholder="10-digit number" maxlength="10" pattern="[0-9]{10}" required autocomplete="tel">
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-full" id="login-btn">
              <span>${I18n.t('auth.login.btn').replace('→', '').trim()}</span>
              <span class="btn-arrow">→</span>
            </button>
          </form>
          <div class="auth-divider"><span>${I18n.t('auth.login.no_account')}</span></div>
          <div class="auth-role-cards">
            <button class="role-card" data-role="worker" id="signup-worker-btn">
              <div class="role-icon">👷</div>
              <h3>${I18n.t('auth.role.worker')}</h3>
              <p>${I18n.t('auth.role.worker.desc')}</p>
            </button>
            <button class="role-card" data-role="employer" id="signup-employer-btn">
              <div class="role-icon">🏢</div>
              <h3>${I18n.t('auth.role.employer')}</h3>
              <p>${I18n.t('auth.role.employer.desc')}</p>
            </button>
          </div>

        </div>
      </div>
    `;
  },

  renderSignup(role) {
    const isWorker = role === 'worker';
    return `
      <div class="auth-container fade-in">
        <div class="auth-card glass-card">
          <div class="auth-header">
            <button class="btn-back" id="back-to-login">← Back</button>
            <div class="auth-logo">${isWorker ? '👷' : '🏢'}</div>
            <h1 class="auth-title">${I18n.t('auth.signup.title')}</h1>
            <p class="auth-subtitle">${isWorker ? I18n.t('auth.signup.subtitle.worker') : I18n.t('auth.signup.subtitle.employer')}</p>
          </div>
          <form id="signup-form" class="auth-form" data-role="${role}">
            <div class="form-group">
              <label for="signup-name">${isWorker ? I18n.t('auth.signup.name') : I18n.t('auth.signup.company')}</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input type="text" id="signup-name" placeholder="${isWorker ? 'Name' : 'Company'}" required>
              </div>
            </div>
            <div class="form-group">
              <label>${I18n.t('auth.signup.profile_pic')}</label>
              <div class="avatar-upload-widget" id="signup-avatar-widget">
                <div class="avatar-preview" id="signup-avatar-preview">
                  <span class="avatar-preview-emoji">${isWorker ? '👷' : '🏢'}</span>
                  <img id="signup-avatar-img" src="" style="display:none;width:100%;height:100%;object-fit:cover;border-radius:50%;">
                </div>
                <div class="avatar-upload-info">
                  <button type="button" class="btn btn-outline btn-sm" id="signup-avatar-btn">📷 Choose Photo</button>
                  <span class="avatar-hint">Optional · JPG, PNG, WebP</span>
                </div>
                <input type="file" id="signup-avatar" accept="image/*" style="display:none;">
              </div>
            </div>
            <div class="form-group">
              <label for="signup-phone">${I18n.t('auth.signup.phone')}</label>
              <div class="input-wrapper">
                <span class="input-icon">📱</span>
                <input type="tel" id="signup-phone" placeholder="10-digit number" maxlength="10" pattern="[0-9]{10}" required>
              </div>
            </div>
            ${isWorker ? `
            <div class="form-group">
              <label>${I18n.t('auth.signup.skills')}</label>
              <div class="skills-grid" id="skills-selector">
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
                <label for="signup-rate">${I18n.t('auth.signup.rate')}</label>
                <div class="input-wrapper">
                  <span class="input-icon">💰</span>
                  <input type="number" id="signup-rate" placeholder="600" min="100" max="5000" required>
                </div>
              </div>
              <div class="form-group">
                <label for="signup-exp">${I18n.t('auth.signup.exp')}</label>
                <div class="input-wrapper">
                  <span class="input-icon">📅</span>
                  <input type="text" id="signup-exp" placeholder="3 years" required>
                </div>
              </div>
            </div>
            ` : `
            <div class="form-group">
              <label for="signup-company">${I18n.t('auth.signup.company')}</label>
              <div class="input-wrapper">
                <span class="input-icon">🏗️</span>
                <input type="text" id="signup-company" placeholder="Company Name">
              </div>
            </div>
            `}
            <div class="form-group">
              <label>📍 ${I18n.t('auth.signup.location')}</label>
              <div class="location-picker">
                <button type="button" class="btn btn-outline btn-sm" id="detect-location-btn">
                  <span class="pulse-dot"></span> ${I18n.t('auth.signup.location.detect')}
                </button>
                <span class="location-label" id="location-display">Not set</span>
              </div>
              <div class="location-or-divider"><span>${I18n.t('auth.signup.location.or')}</span></div>
              <div class="map-picker-section">
                <p class="map-picker-hint">📍 <strong>Select your city</strong> to move the map, then <strong>click/drag the pin</strong> for exact location:</p>
                <div class="form-row form-row-2" style="margin-bottom: 8px;">
                  <div class="form-group" style="margin-bottom: 0;">
                    <select id="signup-state" class="filter-select full-width">
                      <option value="">${I18n.t('auth.signup.location.state_select')}</option>
                      ${INDIAN_STATES.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <select id="signup-city" class="filter-select full-width" disabled>
                      <option value="">${I18n.t('auth.signup.location.city_select')}</option>
                    </select>
                  </div>
                </div>
                <div id="signup-map" class="location-map" style="height: 250px; border-radius: var(--radius-md); border: 1px solid var(--border-color); z-index: 1;"></div>
                <div class="map-location-result" id="signup-map-result" style="margin-top: 8px; font-size: 0.9rem; color: var(--text-muted); display: none;">
                  <span class="map-pin-icon">📌</span>
                  <span id="signup-map-label"></span>
                </div>
              </div>
              <input type="hidden" id="signup-lat">
              <input type="hidden" id="signup-lng">
              <input type="hidden" id="signup-location-label">
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-full" id="signup-submit-btn">
              <span>${I18n.t('auth.signup.btn').replace('→', '').trim()}</span>
              <span class="btn-arrow">→</span>
            </button>
          </form>
        </div>
      </div>
    `;
  },

  bindLoginEvents() {
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = document.getElementById('login-phone').value.trim();
      if (phone.length !== 10) {
        Utils.showToast(I18n.t('toast.err_phone'), 'error');
        return;
      }
      const user = DataStore.getUserByPhone(phone);
      if (!user) {
        Utils.showToast(I18n.t('toast.err_no_account'), 'error');
        return;
      }
      DataStore.setCurrentUser(user);
      Utils.showToast(`Welcome back, ${user.name}!`, 'success');
      App.navigate(user.role === 'worker' ? 'worker-dashboard' : 'employer-dashboard');
    });

    document.getElementById('signup-worker-btn')?.addEventListener('click', () => {
      App.navigate('signup', { role: 'worker' });
    });
    document.getElementById('signup-employer-btn')?.addEventListener('click', () => {
      App.navigate('signup', { role: 'employer' });
    });
  },

  bindSignupEvents(role) {
    document.getElementById('back-to-login')?.addEventListener('click', () => App.navigate('login'));

    // Avatar pick button
    document.getElementById('signup-avatar-btn')?.addEventListener('click', () => {
      document.getElementById('signup-avatar')?.click();
    });
    document.getElementById('signup-avatar')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = document.getElementById('signup-avatar-img');
        const emoji = document.querySelector('#signup-avatar-preview .avatar-preview-emoji');
        if (img) { img.src = ev.target.result; img.style.display = 'block'; }
        if (emoji) emoji.style.display = 'none';
        const btn = document.getElementById('signup-avatar-btn');
        if (btn) btn.textContent = '✓ Photo Selected';
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('detect-location-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('detect-location-btn');
      btn.innerHTML = '<span class="spinner"></span> Detecting...';
      btn.disabled = true;
      try {
        const loc = await Utils.getCurrentLocation();
        this._setSignupLocation(loc);
        btn.innerHTML = '✓ Location Detected';
        btn.classList.add('btn-success-state');
      } catch (err) {
        btn.innerHTML = '<span class="pulse-dot"></span> Retry Detection';
        btn.disabled = false;
        Utils.showToast(err.message, 'error');
      }
    });

    // Map location picker
    setTimeout(() => {
      this.signupMap = Utils.initMapPicker({
        mapId: 'signup-map',
        stateId: 'signup-state',
        cityId: 'signup-city',
        latInputId: 'signup-lat',
        lngInputId: 'signup-lng',
        labelInputId: 'signup-location-label',
        resultLabelId: 'signup-map-label',
        resultContainerId: 'signup-map-result'
      });
    }, 100);

    document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('signup-submit-btn');
      const originalBtnHtml = btn.innerHTML;
      btn.innerHTML = '<span class="spinner"></span>...';
      btn.disabled = true;

      const name = document.getElementById('signup-name').value.trim();
      const phone = document.getElementById('signup-phone').value.trim();

      if (phone.length !== 10) {
        Utils.showToast(I18n.t('toast.err_phone'), 'error');
        btn.innerHTML = originalBtnHtml; btn.disabled = false;
        return;
      }
      if (DataStore.getUserByPhone(phone)) {
        Utils.showToast(I18n.t('toast.err_phone_exists'), 'error');
        btn.innerHTML = originalBtnHtml; btn.disabled = false;
        return;
      }

      const lat = parseFloat(document.getElementById('signup-lat').value);
      const lng = parseFloat(document.getElementById('signup-lng').value);
      const locLabel = document.getElementById('signup-location-label').value;

      if (!lat || !lng) {
        Utils.showToast(I18n.t('toast.err_no_location'), 'error');
        btn.innerHTML = originalBtnHtml; btn.disabled = false;
        return;
      }

      let compressedAvatar = role === 'worker' ? '👷' : '🏢';
      try {
        const fileInput = document.getElementById('signup-avatar');
        if (fileInput && fileInput.files.length > 0) {
          const b64 = await Utils.compressImage(fileInput.files[0]);
          if (b64) compressedAvatar = b64;
        }
      } catch (err) {
        Utils.showToast(err.message, 'error');
        btn.innerHTML = originalBtnHtml; btn.disabled = false;
        return;
      }

      const user = {
        id: DataStore.generateId(role === 'worker' ? 'w' : 'e'),
        name,
        phone,
        role,
        location: { lat, lng, label: locLabel },
        avatar: compressedAvatar,
      };

      if (role === 'worker') {
        const checkedSkills = [...document.querySelectorAll('#skills-selector input:checked')].map(cb => cb.value);
        if (checkedSkills.length === 0) {
          Utils.showToast(I18n.t('toast.select_skill'), 'error');
          btn.innerHTML = originalBtnHtml; btn.disabled = false;
          return;
        }
        user.skills = checkedSkills;
        user.dailyRate = parseInt(document.getElementById('signup-rate').value) || 500;
        user.experience = document.getElementById('signup-exp').value || '1 year';
        user.availability = 'available';
        user.completedJobs = 0;
      } else {
        user.company = document.getElementById('signup-company')?.value?.trim() || '';
      }

      user.rating = 0;
      user.reviewCount = 0;

      DataStore.addUser(user);
      DataStore.setCurrentUser(user);
      Utils.showToast(`Welcome to RozgaarConnect, ${name}!`, 'success');
      App.navigate(role === 'worker' ? 'worker-dashboard' : 'employer-dashboard');
    });
  },

  _setSignupLocation(loc) {
    document.getElementById('signup-lat').value = loc.lat;
    document.getElementById('signup-lng').value = loc.lng;
    document.getElementById('signup-location-label').value = loc.label;
    document.getElementById('location-display').textContent = `📍 ${loc.label}`;
    document.getElementById('location-display').classList.add('location-detected');
    Utils.showToast(`Location: ${loc.label}`, 'success');

    // Also update the map pin if it's initialized
    const mapEl = document.getElementById('signup-map');
    if (mapEl && mapEl.updateMapPin) {
      mapEl.leafletMap.flyTo([loc.lat, loc.lng], 16);
      mapEl.updateMapPin(loc.lat, loc.lng, false);
    }

    if (loc.state || loc.city) {
      Utils.autoFillLocationDropdowns('signup-state', 'signup-city', loc.state, loc.city);
    }
  },
};
