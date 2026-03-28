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

## 🚀 Getting Started

### Prerequisites
Because this project does not parse ES Modules or require Webpack, you do not specifically need NodeJS installed.

### Run Locally
To run the project, simply spin up an HTTP development server. E.g.:

*Using VS Code:*
Launch via the [Live Server Extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

*Using Python:*
\`\`\`bash
# Run inside the project directory
python -m http.server 5500
\`\`\`

*Using Node / NPX:*
\`\`\`bash
npx serve .
\`\`\`

Then, navigate to `http://localhost:5500/` or the corresponding address to start exploring the platform.

### Testing Workflows
1. Click **I Need Work** and register a worker account (e.g., provide skills and rate). Logs into worker dashboard. Logout.
2. Click **I Need Workers** and register an employer account.
3. Post a new Job as an employer and ensure skills match the previously created worker. Logout.
4. Login as Worker again, click Apply on the new job. Logout.
5. Login as Employer, navigate to **View Applicants**, accept the applicant.
6. **Mark the Job Completed** to reveal the dynamic **Rate Worker** feature and finalize the gig loop!

---

## 🛠 Extending the Implementation

The `js/data.js` file handles interactions via the `DataStore` object:
If migrating to an API server, refactor the methods in `DataStore` from synchronous `localStorage` operations (`this._get` and `this._set`) to asynchronous `fetch()` calls. Due to modular separation, the rest of the application (UI state, routers) will remain largely unaffected.
