// ============================================
// RozgaarConnect — Utility Functions
// ============================================

const Utils = {
  /**
   * Calculate distance between two lat/lng points in km (Haversine formula)
   */
  calculateDistance(loc1, loc2) {
    if (!loc1 || !loc2) return Infinity;
    const R = 6371;
    const dLat = this._toRad(loc2.lat - loc1.lat);
    const dLng = this._toRad(loc2.lng - loc1.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(this._toRad(loc1.lat)) * Math.cos(this._toRad(loc2.lat)) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  _toRad(deg) { return deg * (Math.PI / 180); },

  /**
   * Format distance for display
   */
  formatDistance(km) {
    if (km === Infinity || isNaN(km)) return I18n.t('common.unknown_loc');
    if (km < 1) return `${Math.round(km * 1000)} ${I18n.t('util.m_away')}`;
    return `${km.toFixed(1)} ${I18n.t('util.km_away')}`;
  },

  /**
   * Format currency (INR)
   */
  formatPay(amount) {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  },

  /**
   * Format date relative
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return I18n.t('util.today');
    if (diffDays === 1) return I18n.t('util.yesterday');
    if (diffDays < 7) return `${diffDays} ${I18n.t('util.days_ago')}`;
    return date.toLocaleDateString(I18n.currentLang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' });
  },

  /**
   * Get status badge HTML
   */
  statusBadge(status) {
    const map = {
      'open': { text: I18n.t('status.open'), class: 'badge-success' },
      'closed': { text: I18n.t('status.closed'), class: 'badge-danger' },
      'pending': { text: I18n.t('status.pending'), class: 'badge-warning' },
      'accepted': { text: I18n.t('status.accepted'), class: 'badge-success' },
      'rejected': { text: I18n.t('status.rejected'), class: 'badge-danger' },
      'completed': { text: I18n.t('status.completed') || 'Completed', class: 'badge-info' },
      'available': { text: I18n.t('status.available') || 'Available', class: 'badge-success' },
      'busy': { text: I18n.t('status.busy') || 'Busy', class: 'badge-warning' },
    };
    const info = map[status] || { text: status, class: 'badge-default' };
    return `<span class="badge ${info.class}">${info.text}</span>`;
  },

  /**
   * Render star rating
   */
  renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    const gold = 'var(--warning)';
    const dim = 'rgba(255,255,255,0.18)';

    let html = '';
    for (let i = 0; i < full; i++) {
      html += `<span style="color:${gold}">★</span>`;
    }
    if (half) {
      // Overlay a clipped gold star on a dim star → genuine half-star
      html += `<span style="position:relative;display:inline-block;line-height:1">` +
              `<span style="color:${dim}">★</span>` +
              `<span style="position:absolute;left:0;top:0;color:${gold};overflow:hidden;width:50%;display:block">★</span>` +
              `</span>`;
    }
    for (let i = 0; i < empty; i++) {
      html += `<span style="color:${dim}">★</span>`;
    }
    return html;
  },

  /**
   * Skill matching score 0-1
   */
  skillMatchScore(workerSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 1;
    const matched = requiredSkills.filter(s => workerSkills.includes(s)).length;
    return matched / requiredSkills.length;
  },

  /**
   * Debounce function
   */
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  /**
   * Show an interactive review modal with blurred backdrop
   */
  showReviewModal(toUserName, role, onRatingSubmit, toUserAvatar = '') {
    const STAR_LABELS = ['', 'Terrible 😞', 'Poor 😕', 'Okay 😐', 'Good 👍', 'Excellent 🌟'];
    const roleName = role === 'employer' ? 'Employer' : 'Worker';
    const avatarContent = toUserAvatar && toUserAvatar.startsWith('data:')
      ? `<img src="${toUserAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
      : `<span>${toUserAvatar || (role === 'employer' ? '🏢' : '👷')}</span>`;

    const overlay = document.createElement('div');
    overlay.className = 'review-modal-overlay';

    overlay.innerHTML = `
      <div class="review-modal-card">
        <div class="review-modal-avatar">${avatarContent}</div>
        <h2 class="review-modal-title">Rate ${toUserName}</h2>
        <p class="review-modal-subtitle">How was your experience with this ${roleName}?</p>

        <div class="review-star-row" id="rm-stars">
          <span class="review-star" data-val="1">★</span>
          <span class="review-star" data-val="2">★</span>
          <span class="review-star" data-val="3">★</span>
          <span class="review-star" data-val="4">★</span>
          <span class="review-star" data-val="5">★</span>
        </div>
        <p class="review-star-label" id="rm-star-label">Tap a star to rate</p>

        <div class="review-textarea-wrap">
          <label for="rm-review-text">✏️ Write a Review <span style="font-weight:400;opacity:0.6">(Optional)</span></label>
          <textarea id="rm-review-text" class="review-textarea" rows="3"
            placeholder="Share your experience — was the work completed on time? Were they professional?"></textarea>
        </div>

        <div class="review-modal-actions">
          <button class="btn btn-outline" id="rm-cancel">Cancel</button>
          <button class="btn btn-primary" id="rm-submit" disabled>Submit Rating</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    let selectedRating = 0;
    const stars = overlay.querySelectorAll('.review-star');
    const label = overlay.querySelector('#rm-star-label');
    const submitBtn = overlay.querySelector('#rm-submit');

    const refresh = (hoverVal = selectedRating) => {
      stars.forEach(s => {
        const v = parseInt(s.dataset.val);
        s.classList.toggle('hovered', v <= hoverVal && hoverVal !== selectedRating);
        s.classList.toggle('selected', v <= selectedRating);
        // reset color via class, not style
        s.style.color = '';
      });
    };

    stars.forEach(star => {
      star.addEventListener('mouseover', () => {
        const v = parseInt(star.dataset.val);
        label.textContent = STAR_LABELS[v];
        stars.forEach(s => s.style.color = parseInt(s.dataset.val) <= v ? 'var(--warning)' : '');
      });
      star.addEventListener('mouseout', () => {
        label.textContent = selectedRating ? STAR_LABELS[selectedRating] : 'Tap a star to rate';
        stars.forEach(s => s.style.color = parseInt(s.dataset.val) <= selectedRating ? 'var(--warning)' : '');
      });
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.val);
        label.textContent = STAR_LABELS[selectedRating];
        stars.forEach(s => s.style.color = parseInt(s.dataset.val) <= selectedRating ? 'var(--warning)' : '');
        submitBtn.disabled = false;
      });
    });

    const close = () => {
      overlay.style.animation = 'overlayFadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    };

    // Click outside to close
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('#rm-cancel').addEventListener('click', close);
    submitBtn.addEventListener('click', () => {
      if (selectedRating > 0) {
        const reviewText = overlay.querySelector('#rm-review-text').value.trim();
        onRatingSubmit(selectedRating, reviewText);
        Utils.showToast(`⭐ ${selectedRating}/5 — Rating submitted!`, 'success');
        close();
      }
    });
  },


  /**
   * Show a custom confirmation modal (replaces native confirm())
   * @param {string} message - The confirmation message to show
   * @param {Function} onConfirm - Called when user clicks "Confirm"
   * @param {Object} opts - Optional: { title, confirmText, cancelText, danger }
   */
  showConfirmModal(message, onConfirm, opts = {}) {
    const {
      title = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      danger = false,
    } = opts;

    const overlay = document.createElement('div');
    overlay.className = 'review-modal-overlay confirm-modal-overlay';
    overlay.innerHTML = `
      <div class="review-modal-card confirm-modal-card">
        <div class="confirm-modal-icon">${danger ? '⚠️' : '❓'}</div>
        <h2 class="review-modal-title">${title}</h2>
        <p class="review-modal-subtitle confirm-modal-message">${message}</p>
        <div class="review-modal-actions">
          <button class="btn btn-outline" id="cm-cancel">${cancelText}</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cm-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.style.animation = 'overlayFadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('#cm-cancel').addEventListener('click', close);
    overlay.querySelector('#cm-confirm').addEventListener('click', () => {
      close();
      onConfirm();
    });
  },

  /**
   * Animate counter from 0 to target
   */
  animateCounter(element, target, duration = 1500) {
    let start = 0;
    const step = target / (duration / 16);
    const update = () => {
      start += step;
      if (start >= target) {
        element.textContent = target.toLocaleString('en-IN');
        return;
      }
      element.textContent = Math.floor(start).toLocaleString('en-IN');
      requestAnimationFrame(update);
    };
    update();
  },

  /**
   * Get current geolocation (returns promise) — uses real GPS only
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your Location', accuracy: pos.coords.accuracy, city: '', state: '' };
          // Reverse geocode to get human-readable address
          try {
            const addr = await Utils.reverseGeocode(loc.lat, loc.lng);
            loc.label = addr.label;
            loc.city = addr.city;
            loc.state = addr.state;
          } catch (e) {
            loc.label = `${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E`;
          }
          resolve(loc);
        },
        (err) => {
          let message = I18n.t('toast.loc_error');
          if (err.code === 1) message = I18n.t('toast.loc_denied');
          else if (err.code === 2) message = I18n.t('toast.loc_unavail');
          else if (err.code === 3) message = I18n.t('toast.loc_timeout');
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );
    });
  },

  /**
   * Reverse geocode lat/lng to address using OpenStreetMap Nominatim
   */
  async reverseGeocode(lat, lng) {
    const fallback = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        
        // Sometimes OSM specifies neighbourhood/suburb, but we only want reliable parts
        const area = a.suburb || a.village || a.neighbourhood || a.locality || '';
        const rawCity = a.city || a.town || a.county || '';
        const rawState = a.state || '';

        // Format a simpler label
        let labelParts = [];
        if (area && area !== rawCity) labelParts.push(area);
        if (rawCity) labelParts.push(rawCity);
        
        let finalLabel = labelParts.slice(0, 2).join(', ');
        if (!finalLabel) {
           finalLabel = data.display_name?.split(',').slice(0, 3).join(',').trim() || fallback;
        }

        return { 
          label: finalLabel,
          city: rawCity,
          state: rawState
        };
      }
      return { label: fallback, city: '', state: '' };
    } catch {
      return { label: fallback, city: '', state: '' };
    }
  },

  /**
   * Forward geocode address string to lat/lng using OpenStreetMap Nominatim
   */
  async forwardGeocode(address) {
    if (!address || address.trim().length < 3) {
      throw new Error('Please enter at least 3 characters for the address');
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address.trim())}&format=json&addressdetails=1&limit=1&countrycodes=in`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const result = data[0];
        const a = result.address || {};
        const parts = [a.neighbourhood || a.suburb || a.hamlet || '', a.city || a.town || a.village || a.county || '', a.state || ''].filter(Boolean);
        const label = parts.slice(0, 2).join(', ') || result.display_name?.split(',').slice(0, 3).join(',').trim() || address.trim();
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          label: label,
        };
      }
      throw new Error('Address not found. Try a more specific location (e.g. "Saket, Delhi")');
    } catch (err) {
      if (err.message.includes('Address not found') || err.message.includes('characters')) throw err;
      throw new Error('Could not look up address. Check your internet connection.');
    }
  },

  compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (!file.type.startsWith('image/')) {
        return reject(new Error(typeof I18n !== 'undefined' ? I18n.t('toast.invalid_img') : 'Invalid image file.'));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 250;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Auto-fill state and city dropdowns correctly
   */
  autoFillLocationDropdowns(stateId, cityId, rawState, rawCity) {
    if (!rawState) return;
    const stateSelect = document.getElementById(stateId);
    if (!stateSelect) return;

    // Try to match state (case-insensitive, ignoring "state" suffix)
    const stName = rawState.toLowerCase().replace(' state', '');
    const options = Array.from(stateSelect.options);
    const matchOpt = options.find(o => o.value.toLowerCase() === stName || o.value.toLowerCase().includes(stName));
    
    if (matchOpt && stateSelect.value !== matchOpt.value) {
      stateSelect.value = matchOpt.value;
      stateSelect.dispatchEvent(new Event('change')); // Populates cities
    }

    // Next populate city
    if (rawCity) {
      setTimeout(() => {
        const citySelect = document.getElementById(cityId);
        if (!citySelect) return;
        const cname = rawCity.toLowerCase();
        const cOpts = Array.from(citySelect.options);
        const cmatch = cOpts.find(o => o.value.toLowerCase() === cname || o.value.toLowerCase().includes(cname) || cname.includes(o.value.toLowerCase()));
        if (cmatch) {
          citySelect.value = cmatch.value;
        }
      }, 50); // slight delay since state change is sync but DOM might need a tick
    }
  },

  /**
   * Initialize Leaflet interactive Map Picker
   */
  initMapPicker(config) {
    const { 
      mapId, 
      stateId, 
      cityId, 
      latInputId, 
      lngInputId, 
      labelInputId, 
      resultLabelId, 
      resultContainerId,
      initialLocation
    } = config;

    // Check if map container exists
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer) return null;

    // Prevent re-initialization
    if (mapContainer._leaflet_id) return mapContainer;

    // Default to central India if no location
    const defaultLat = initialLocation?.lat || 20.5937;
    const defaultLng = initialLocation?.lng || 78.9629;
    const defaultZoom = initialLocation ? 15 : 4;

    const map = L.map(mapId).setView([defaultLat, defaultLng], defaultZoom);

    // Use OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker = null;

    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      marker = L.marker([initialLocation.lat, initialLocation.lng], { draggable: true }).addTo(map);
      updateLocationInputs(initialLocation.lat, initialLocation.lng, initialLocation.label);
    }

    // Fix map loading issue in hidden containers (like tabs/modals)
    setTimeout(() => { map.invalidateSize(); }, 200);

    const updateMapPin = async (lat, lng, doReverseGeocode = true) => {
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on('dragend', async (e) => {
          const pos = e.target.getLatLng();
          await updateMapPin(pos.lat, pos.lng, true);
        });
      }

      if (doReverseGeocode) {
        const resultEl = document.getElementById(resultLabelId);
        if (resultEl) resultEl.innerHTML = '<span class="spinner"></span> Locating...';
        document.getElementById(resultContainerId).style.display = 'block';

        let autoFillData = null;
        try {
          const address = await Utils.reverseGeocode(lat, lng);
          updateLocationInputs(lat, lng, address.label);
          autoFillData = address;
        } catch {
          updateLocationInputs(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }

        // Auto-fill State and City dropdowns if we got good data
        if (autoFillData) {
          Utils.autoFillLocationDropdowns(stateId, cityId, autoFillData.state, autoFillData.city);
        }
      }
    };

    function updateLocationInputs(lat, lng, label) {
      document.getElementById(latInputId).value = lat;
      document.getElementById(lngInputId).value = lng;
      document.getElementById(labelInputId).value = label;
      
      const resContainer = document.getElementById(resultContainerId);
      const resLabel = document.getElementById(resultLabelId);
      if (resContainer && resLabel) {
        resContainer.style.display = 'block';
        resLabel.textContent = label;
      }
    }

    // Map click
    map.on('click', async (e) => {
      await updateMapPin(e.latlng.lat, e.latlng.lng, true);
    });

    // State -> City dropdown handling
    document.getElementById(stateId)?.addEventListener('change', (e) => {
      const citySelect = document.getElementById(cityId);
      const state = e.target.value;
      citySelect.innerHTML = `<option value="">${I18n.t('auth.signup.location.city_select') || 'Select City'}</option>`;
      if (state && typeof INDIAN_STATES_CITIES !== 'undefined' && INDIAN_STATES_CITIES[state]) {
        INDIAN_STATES_CITIES[state].forEach(c => {
          citySelect.innerHTML += `<option value="${c}">${c}</option>`;
        });
        citySelect.disabled = false;
      } else {
        citySelect.disabled = true;
      }
    });

    // City select -> Fly map
    document.getElementById(cityId)?.addEventListener('change', async (e) => {
      const city = e.target.value;
      const state = document.getElementById(stateId)?.value || '';
      if (!city || !state) return;

      try {
        const query = `${city}, ${state}, India`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
          headers: { 'Accept-Language': 'en' }
        });
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          map.flyTo([lat, lng], 13);
          await updateMapPin(lat, lng, false);
          updateLocationInputs(lat, lng, `${city}, ${state}`);
        }
      } catch (err) {
        console.error('Failed to fly map to city', err);
      }
    });

    // Expose map to the DOM element for access
    mapContainer.leafletMap = map;
    mapContainer.leafletMarker = marker;
    mapContainer.updateMapPin = updateMapPin;

    return map;
  }
};

// ============================================
// Real-Time Location Tracker
// ============================================
const LocationTracker = {
  watchId: null,
  lastUpdate: 0,
  UPDATE_INTERVAL: 30000, // Update stored location every 30 seconds

  /**
   * Start watching user's location in real-time
   */
  start() {
    if (!navigator.geolocation) return;
    if (this.watchId !== null) this.stop(); // Clear any existing watch

    this.watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - this.lastUpdate < this.UPDATE_INTERVAL) return;
        this.lastUpdate = now;

        const user = DataStore.getCurrentUser();
        if (!user) return;

        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;

        // Only update if moved more than ~50 meters
        if (user.location) {
          const moved = Utils.calculateDistance(user.location, { lat: newLat, lng: newLng });
          if (moved < 0.05) return;
        }

        // Reverse geocode
        let label;
        try {
          const addr = await Utils.reverseGeocode(newLat, newLng);
          label = addr.label;
        } catch {
          label = `${newLat.toFixed(4)}°N, ${newLng.toFixed(4)}°E`;
        }

        user.location = { lat: newLat, lng: newLng, label, accuracy: pos.coords.accuracy };
        DataStore.updateUser(user);
        DataStore.setCurrentUser(user);

        // Update location display on dashboard if visible
        const locEl = document.querySelector('.profile-location');
        if (locEl) locEl.textContent = `📍 ${label}`;

        console.log(`[LocationTracker] Updated: ${label} (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        console.warn('[LocationTracker] Watch error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 30000 }
    );
    console.log('[LocationTracker] Started real-time tracking');
  },

  /**
   * Stop watching user's location
   */
  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('[LocationTracker] Stopped tracking');
    }
  },
};
