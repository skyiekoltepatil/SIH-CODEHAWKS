# SIH CODEHAWKS

![SIH-CODEHAWKS Logo](./sih-codehawks.png)

## 📖 Overview
**SIH CODEHAWKS** is a modern, responsive web application designed for comprehensive academic data collection and user profile management. Built on a robust React + Vite architecture, it seamlessly integrates with Google Firebase for secure user authentication and real-time database management.

The platform provides a highly structured dashboard where students or users can register, authenticate, and securely fill out detailed, categorized profile information. 

---

## ✨ Comprehensive Feature List

### 🔐 Authentication System (Firebase Auth)
- **Secure Registration & Login:** Create new accounts using an email and password.
- **Dynamic Session Management:** Real-time auth state listener using React Context (`AuthContext`) ensures protected routes are safe.
- **Forgot Password Workflow:** Users can request password reset emails directly to their registered email addresses.
- **In-App Password Management:** Authenticated users can securely change their password from within their dashboard (requires re-authentication).
- **Password Visibility Toggle:** Integrated eye icons to easily toggle password visibility on all password input fields.

### 📋 Interactive Profile Dashboard
A fully responsive, sidebar-navigated dashboard featuring horizontal tab sub-menus for extensive data entry. All data is automatically synced to **Firebase Firestore**.

**Data Collection Categories:**
1. **Personal Details:** First Name, Last Name, Official Email, Category, Caste, Domicile, Nationality, etc.
2. **Contact Details:** Phone Numbers, Permanent vs Local Addresses.
3. **Family Details:** Earning Parent Details, Income, and Career Choices.
4. **Educational & Examination Details:** Previous academic records, institutions, and alumni information.
5. **Bank Details:** Securely collected financial routing info.
6. **Upload Documents:** Interface for uploading necessary identification or academic documents.
7. **Identity & Religion, Physically Handicapped & Minority Status:** Additional specific demographic tabs.

### 🌐 Core Pages & Routing
The app utilizes `react-router-dom` for smooth Single Page Application (SPA) navigation.
- `/` - **Home Page:** Landing page and overview.
- `/about` - **About Us:** Information about the platform.
- `/schemes` - **Schemes:** Details on available academic/government schemes.
- `/services` - **Services:** Platform services and offerings.
- `/login` - **Login / Register Portal:** The gateway to the dashboard.
- `/dashboard/profile` - **Protected User Dashboard:** The core data entry application.

---

## 🛠 Tech Stack & Architecture

- **Frontend Framework:** [React 19](https://reactjs.org/) (bootstrapped with [Vite](https://vitejs.dev/))
- **Routing:** `react-router-dom`
- **State Management:** React Context API (`AuthContext`) + Hooks (`useState`, `useEffect`)
- **Backend Services:** [Firebase](https://firebase.google.com/)
  - **Firebase Authentication:** Handles user identities, sessions, and password resets.
  - **Firebase Firestore:** A NoSQL cloud database storing user profile structures securely.
- **Icons & UI:** [Lucide React](https://lucide.dev/) & FontAwesome 
- **Styling:** Custom Vanilla CSS utilizing Flexbox, CSS Grid, and modern UI/UX design tokens (Glassmorphism, gradients, micro-animations).

---

## 📂 Project Structure

```text
SIH-CODEHAWKS/
├── public/                 # Static assets (Favicon, logos, SVGs)
├── src/
│   ├── components/         # Reusable UI components (Navbar, AuthModal)
│   ├── context/            # React Context providers (AuthContext.jsx)
│   ├── pages/              # Main route components
│   │   ├── Dashboard/      # Protected dashboard views (Profile.jsx)
│   │   ├── Home.jsx        # Landing page
│   │   ├── Login.jsx       # Auth page
│   │   ├── About.jsx       # About page
│   │   ├── Schemes.jsx     # Schemes view
│   │   └── Services.jsx    # Services view
│   ├── App.jsx             # Main router and layout wrapper
│   ├── main.jsx            # React DOM entry point
│   └── firebase.js         # Firebase SDK initialization and exports
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite bundler configuration
└── vercel.json             # Vercel deployment configuration
```

---

## 💻 Local Development Setup

Follow these steps to run the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- A Google Firebase Account

### 1. Clone the repository
```bash
git clone https://github.com/your-username/SIH-CODEHAWKS.git
cd SIH-CODEHAWKS
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Build > Authentication** and enable **Email/Password**.
3. Navigate to **Build > Firestore Database** and click **Create Database**. Set your security rules (start in test mode for development).
4. Go to **Project Settings > General**, scroll down, and add a **Web App**.
5. Copy your Firebase config object.
6. Open `src/firebase.js` in this repository and replace the `firebaseConfig` object with your own credentials.

### 4. Start the development server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 📦 Deployment Instructions

This project is optimized for deployment on modern edge networks like **Vercel** or **Netlify**. A `vercel.json` file is already included for automatic Single Page Application (SPA) routing fallback.

### Deploying to Vercel:
1. Push your code to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Leave the Framework Preset as `Vite`.
5. Click **Deploy**.

### ⚠️ CRITICAL: Firebase Production Setup
When deploying to a live URL (e.g., `sih-codehawks.vercel.app`), Firebase will block authentication requests for security reasons by default. 

**You MUST whitelist your live domain:**
1. Go to the **Firebase Console**.
2. Navigate to **Authentication > Settings > Authorized domains**.
3. Click **Add domain**.
4. Paste your exact deployment URL (e.g., `sih-codehawks.vercel.app` — do not include `https://`).
5. Save. Your production authentication will now work!

---

## 📄 License
This project is open-source and available under the [MIT License](./LICENSE).
