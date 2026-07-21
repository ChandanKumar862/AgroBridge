# AgroBridge 🌾

An AI-powered, sustainable agricultural marketplace that redirects imperfect Grade B/C and rotten produce from smallholder farms directly to commercial kitchens, animal sanctuaries, and organic compost yards. 

This repository delivers a premium, startup-quality full-stack platform built with a high-performance **React + Tailwind v3 + Vite** client and a robust **Node.js + Express** server. 

---

## 🌟 Architectural Features

### 🤖 Gemini AI Grading System
Sends uploaded visual crop media to the Gemini API (`gemini-2.5-flash`) for real-time inspect scans of skin blemishes, shapes, and textures. Instantly returns a quality Grade (A, B, C, or Rotten), visual reports, and suggest price offsets. Falls back to a smart heuristic metadata parser if keys are absent.

### 🗺️ Hexagonal Zoning Model
Clusters geographic coordinates into discrete axial zones (e.g. `HEX-14_22` representing 8km clusters) to map supply/demand locally, minimizing long-haul transport logistics and carbon burn.

### 🕒 Freshness Priority Sorting
Ranks listings utilizing a custom freshness calculation prioritizing older harvest lots first, ensuring near-overripe but pristine crops are purchased before rotting.

### 💳 Integrated Wallet & Razorpay Simulations
Commercial buyers procure Grade B crops at a 30-50% discount. Executes instant balance transfers securely between buyer and farmer wallets. Includes a fast Razorpay funding mockup.

### 🐄 & ♻️ Organic Waste Redirection
* **Grade C Lots** are instantly queued for matching nearby **Animal Care Sanctuaries** for low-cost, nutritious feed.
* **Rotten/Unusable yields** bypass the retail marketplace entirely and route to regional **Organic Composting Units**.

### 🎙️ Accessibility Voice Assist Uploader
Farmers can press a single microphone button to speak crop parameters (e.g., *"Tomatoes forty kilograms, price thirty rupees"*). Our HTML5 Speech Recognition splits transcripts and populates form entries instantly.

---

## 📂 Project Structure

```
agrobridge/
├── backend/
│   ├── src/
│   │   ├── config/          # Unified DB, Gemini AI, storage engines
│   │   ├── controllers/     # Authentication, Produce, Orders, Messaging, Analytics
│   │   ├── middleware/      # JWT guards, Multer memory storage
│   │   ├── routes/          # API REST version paths
│   │   └── app.js           # Server runner (localhost:5000)
│   ├── .env.example         # Production env templates
│   └── package.json         # Node server manifests
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static logos and icons
│   │   ├── components/      # Floating Navbar header
│   │   ├── context/         # AuthContext and Axios interceptors
│   │   ├── pages/           # Home, Marketplace, About, Features, Impact, Auth forms
│   │   │   └── Dashboards/  # Farmer, Buyer, Secondary (Animal/Compost), Admin panels
│   │   ├── App.jsx          # Route trees & Protected guardians
│   │   └── main.jsx         # React mounting shell
│   ├── index.html           # Font pre-fetchers and Map assets
│   ├── tailwind.config.js   # Earthy Emerald & Harvest Amber tokens
│   └── package.json         # Client build manifests
└── README.md
```

---

## 🚀 Rapid Local Setup Guide

Follow these quick commands to spin up the entire local workspace:

### 1. Install Backend Dependencies & Start Server
```powershell
cd backend
npm install
npm run dev
```
*Server launches on `http://localhost:5000`.*

### 2. Install Frontend Dependencies & Start React Client
```powershell
cd ../frontend
npm install
npm run dev
```
*Client compiles and hosts on `http://localhost:3000`.*

---

## 🔑 Preloaded Test Credentials

For fast review and grading, we have integrated **One-Click Quick Login shortcuts** inside the login terminal allowing you to check each dashboard role immediately:

| Role 👤 | Test Email 📧 | Password 🔑 | Dashboard Privileges |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@krishi.com` | `farmer123` | Upload produce with Voice Assist, scan AI grading metrics, check earnings wallet. |
| **Commercial Buyer** | `buyer@krishi.com` | `buyer123` | Browse split-pane listings, click SVG Hex zones, execute Razorpay wallet purchases. |
| **Animal Care** | `animal@krishi.com` | `animal123` | Pickup schedules for Grade C fodder, verify sanctuary collection logs. |
| **Compost Yard** | `compost@krishi.com` | `compost123` | Log nitrogen-heavy crop rot collection routes, track organic volume charts. |
| **Platform Admin** | `admin@agrobridge.com` | `admin123` | Moderator tables verifying/flagging crops, review fraud scans. |
