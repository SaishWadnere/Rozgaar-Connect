# RozgaarConnect

**Find Work. Find Workers. Instantly.**

RozgaarConnect is a platform designed to bridge the gap between daily wage workers and local employers across India. Built as a fast, lightweight Single Page Application (SPA), it provides role-specific dashboards, multilingual support, and a robust interactive trust system (ratings and reviews).

**Live Demo:** [https://rozgaar-connect.vercel.app/](https://rozgaar-connect.vercel.app/)

---

## 🏗️ Architecture

The project strictly follows a **Vanilla JavaScript** architecture without modern frameworks (React, Vue, etc.) or complex build steps. Data persistence is managed entirely client-side via browser `localStorage`.

### Key Design Decisions
1. **Zero Backend Needed (MVP)**
   - Operates fully via browser storage simulating a relational database.
   - Designed for easy porting to a real backend (e.g., Firebase, Supabase, Node.js + MongoDB) when ready.
2. **Modular File Structure**
   - JavaScript code is separated by domain (`auth.js`, `worker.js`, `data.js`) rather than rendering everything in one massive script.
3. **Glassmorphism Design System**
   - Styled using custom CSS properties with dark mode accents, blurred backdrops (`backdrop-filter: blur`), and vibrant gradients.
4. **No Password Authentication**
   - Authentication relies strictly on 10-digit mobile numbers mapping to user accounts in storage, mimicking OTP-based flows common in India.

---

## 📁 Project Structure

```text
/rozgaar-connect
├── index.html         // Main entry HTML wrapper, includes navigation and central `#app` mount point
├── css/
│   └── styles.css     // Centralized stylesheet (design tokens, components, responsive rules)
└── js/
    ├── app.js         // Application Controller / Router (handles page navigation, event bindings)
    ├── data.js        // Data Layer (localStorage DB schema, CRUD methods)
    ├── auth.js        // Registration, Login, and session management
    ├── worker.js      // Worker Dashboard, job listings, application logic
    ├── employer.js    // Employer Dashboard, job postings, matching logic
    ├── utils.js       // Helpers (custom modals, geolocation, toast notifications, star rating UI)
    └── i18n.js        // Internationalization engine (English & Hindi)
```

---

## 🌟 Core Features

### 1. Two-Sided Marketplace
- **Workers** can set their skills (e.g., Carpentry, Painting), daily rate, and discover relevant job postings near them.
- **Employers** can post jobs, manage applicant pipelines (Accept/Reject), and mark jobs securely as completed.

### 2. Rating & Review Trust System
To foster reliability and trust, RozgaarConnect uses a sophisticated two-way review mechanism.
- Handled through a fully custom, interactive UI modal (`Utils.showReviewModal`), not native alerts.
- Uses `getReviewByJobAndTo()` internally to ensure reviews are tracked strictly on a per-worker, per-job basis.
- Half-star rating support using CSS superposition techniques without relying on generic image sprites or unreadable fonts.

### 3. Geolocation & Maps
- Utilizes the free open-source **Leaflet.js** map library and **OpenStreetMap (Nominatim API)**. 
- Integrated geocoding (address to coordinates) allows matching candidates based on proximity without requiring proprietary API keys.

### 4. Interactive Confirmations
Native browser dialogs (`window.confirm()`) have been eliminated across critical workflows (e.g., deleting a job, withdrawing an application, marking a job complete) in favor of the custom `showConfirmModal` UI to ensure aesthetic consistency and prevent blocking issues in embedded or strict browsers.

### 5. Multilingual Localization (i18n)
Full dual-language support for **English (`en`)** and **Hindi (`hi`)** out of the box, stored in session preferences for immediate translation switches.

---
