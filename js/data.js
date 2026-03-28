// ============================================
// RozgaarConnect — Data Layer (localStorage)
// ============================================

const DB_KEYS = {
  USERS: 'rc_users',
  JOBS: 'rc_jobs',
  APPLICATIONS: 'rc_applications',
  REVIEWS: 'rc_reviews',
  CURRENT_USER: 'rc_current_user',
  STATS: 'rc_stats',
  VERSION: 'rc_version',
};

// Bump this when you want to wipe old cached data
const DATA_VERSION = '3';

// --------------- No seed/demo data — app starts empty ---------------

const SKILL_CATEGORIES = [
  { name: 'Construction', icon: '🏗️', skills: ['Masonry', 'Plastering', 'Painting', 'Carpentry', 'Furniture'] },
  { name: 'Electrical & Plumbing', icon: '⚡', skills: ['Electrical', 'Plumbing', 'Welding', 'Fabrication'] },
  { name: 'Home Services', icon: '🏠', skills: ['Cleaning', 'Cooking', 'Laundry', 'Gardening', 'Childcare'] },
  { name: 'Transport & Loading', icon: '🚛', skills: ['Driving', 'Loading', 'Packing', 'Security'] },
  { name: 'Textile & Craft', icon: '🧵', skills: ['Tailoring', 'Embroidery', 'Polishing'] },
  { name: 'Agriculture', icon: '🌾', skills: ['Farming', 'Gardening'] },
];

const ALL_SKILLS = [...new Set(SKILL_CATEGORIES.flatMap(c => c.skills))].sort();

const INDIAN_STATES_CITIES = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Kurnool', 'Anantapur', 'Eluru'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Tawang', 'Ziro', 'Pasighat', 'Bomdila'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Durg', 'Korba', 'Rajnandgaon', 'Jagdalpur'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Mehsana'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat', 'Panchkula'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Hamirpur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belgaum', 'Davangere', 'Shimoga', 'Tumkur', 'Gulbarga'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Palakkad'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Kalyan'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bharatpur', 'Sikar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar', 'Secunderabad'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Ghaziabad', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Gorakhpur', 'Greater Noida'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Haldwani', 'Roorkee', 'Nainital', 'Kashipur'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Bardhaman', 'Kharagpur', 'Haldia'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini', 'Saket', 'Connaught Place'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua'],
  'Ladakh': ['Leh', 'Kargil'],
  'Andaman & Nicobar': ['Port Blair'],
  'Dadra & Nagar Haveli': ['Silvassa'],
  'Lakshadweep': ['Kavaratti'],
};

const INDIAN_STATES = Object.keys(INDIAN_STATES_CITIES).sort();


// --------------- Data Access ---------------

const DataStore = {
  _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || null;
    } catch { return null; }
  },
  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  init() {
    // Wipe old data if version changed (e.g. demo data removed)
    const storedVersion = localStorage.getItem(DB_KEYS.VERSION);
    if (storedVersion !== DATA_VERSION) {
      Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.setItem(DB_KEYS.VERSION, DATA_VERSION);
    }
    if (!this._get(DB_KEYS.USERS)) {
      this._set(DB_KEYS.USERS, []);
      this._set(DB_KEYS.JOBS, []);
      this._set(DB_KEYS.APPLICATIONS, []);
      this._set(DB_KEYS.REVIEWS, []);
      this._set(DB_KEYS.STATS, { totalWorkers: 0, totalJobs: 0, totalMatches: 0 });
    }
  },

  resetData() {
    Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
    this.init();
  },

  // --- Users ---
  getUsers() { return this._get(DB_KEYS.USERS) || []; },
  getUserById(id) { return this.getUsers().find(u => u.id === id); },
  getUserByPhone(phone) { return this.getUsers().find(u => u.phone === phone); },
  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    this._set(DB_KEYS.USERS, users);
    const stats = this.getStats();
    if (user.role === 'worker') stats.totalWorkers++;
    this._set(DB_KEYS.STATS, stats);
  },
  updateUser(updatedUser) {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    this._set(DB_KEYS.USERS, users);
  },

  // --- Session ---
  setCurrentUser(user) { this._set(DB_KEYS.CURRENT_USER, user); },
  getCurrentUser() { return this._get(DB_KEYS.CURRENT_USER); },
  logout() { localStorage.removeItem(DB_KEYS.CURRENT_USER); },

  // --- Jobs ---
  getJobs() { return this._get(DB_KEYS.JOBS) || []; },
  getJobById(id) { return this.getJobs().find(j => j.id === id); },
  getJobsByEmployer(employerId) { return this.getJobs().filter(j => j.employerId === employerId); },
  getOpenJobs() { return this.getJobs().filter(j => j.status === 'open'); },
  addJob(job) {
    const jobs = this.getJobs();
    jobs.push(job);
    this._set(DB_KEYS.JOBS, jobs);
    const stats = this.getStats();
    stats.totalJobs++;
    this._set(DB_KEYS.STATS, stats);
  },
  updateJob(updatedJob) {
    const jobs = this.getJobs().map(j => j.id === updatedJob.id ? updatedJob : j);
    this._set(DB_KEYS.JOBS, jobs);
  },
  deleteJob(id) {
    const jobs = this.getJobs().filter(j => j.id !== id);
    this._set(DB_KEYS.JOBS, jobs);
    // Also delete associated applications
    const apps = this.getApplications().filter(a => a.jobId !== id);
    this._set(DB_KEYS.APPLICATIONS, apps);
  },

  // --- Applications ---
  getApplications() { return this._get(DB_KEYS.APPLICATIONS) || []; },
  getApplicationsByJob(jobId) { return this.getApplications().filter(a => a.jobId === jobId); },
  getApplicationsByWorker(workerId) { return this.getApplications().filter(a => a.workerId === workerId); },
  hasApplied(jobId, workerId) { return this.getApplications().some(a => a.jobId === jobId && a.workerId === workerId); },
  addApplication(app) {
    const apps = this.getApplications();
    apps.push(app);
    this._set(DB_KEYS.APPLICATIONS, apps);
    const stats = this.getStats();
    stats.totalMatches++;
    this._set(DB_KEYS.STATS, stats);
  },
  updateApplication(updatedApp) {
    const apps = this.getApplications().map(a => a.id === updatedApp.id ? updatedApp : a);
    this._set(DB_KEYS.APPLICATIONS, apps);
  },
  deleteApplication(id) {
    const apps = this.getApplications().filter(a => a.id !== id);
    this._set(DB_KEYS.APPLICATIONS, apps);
  },

  // --- Stats ---
  getStats() { return this._get(DB_KEYS.STATS) || { totalWorkers: 0, totalJobs: 0, totalMatches: 0 }; },

  // --- Reviews & Ratings ---
  getReviews() { return this._get(DB_KEYS.REVIEWS) || []; },
  getReviewsForUser(userId) { return this.getReviews().filter(r => r.toUserId === userId); },
  getReviewByJob(jobId, fromUserId) { return this.getReviews().find(r => r.jobId === jobId && r.fromUserId === fromUserId); },
  // Check if a specific reviewer has already rated a specific recipient on a specific job
  getReviewByJobAndTo(jobId, fromUserId, toUserId) { return this.getReviews().find(r => r.jobId === jobId && r.fromUserId === fromUserId && r.toUserId === toUserId); },
  
  addReview(jobId, fromUserId, toUserId, score, text = '') {
    if (this.getReviewByJobAndTo(jobId, fromUserId, toUserId)) return; // Prevent duplicate rating of the same person on the same job
    
    const reviews = this.getReviews();
    reviews.push({
      id: this.generateId('rev'),
      jobId,
      fromUserId,
      toUserId,
      score: parseFloat(score),
      text: text.trim(),
      date: new Date().toISOString()
    });
    this._set(DB_KEYS.REVIEWS, reviews);
    
    // Update global user rating & completed jobs if needed
    const targetUser = this.getUserById(toUserId);
    if (targetUser) {
      const userReviews = this.getReviewsForUser(toUserId);
      targetUser.reviewCount = userReviews.length;
      const totalScore = userReviews.reduce((sum, r) => sum + r.score, 0);
      targetUser.rating = targetUser.reviewCount > 0 ? (totalScore / targetUser.reviewCount).toFixed(1) : 0;
      this.updateUser(targetUser);
      
      // Also update CURRENT_USER if the target is the logged-in user (unlikely during rating, but safe)
      const cur = this.getCurrentUser();
      if (cur && cur.id === toUserId) this.setCurrentUser(targetUser);
    }
  },

  // --- Helpers ---
  generateId(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5); },
};
