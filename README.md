# 🌿 BinWise AI — Intelligent Waste Segregation & Civic Recycling Platform

<div align="center">

![BinWise AI Banner](public/earth-safety-mission.jpg)

**Next-Generation Multi-Modal AI Powered Waste Sorting, CPCB 4-Bin Segregation & Circular Economy Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![CPCB Compliant](https://img.shields.io/badge/CPCB-Standard_Compliant-00875A?style=for-the-badge)](https://cpcb.nic.in/)

*Built by **Team Asynchronous** for **Smart India Hackathon (SIH 2026)***

[Live Demo](#-getting-started) • [Key Features](#-key-features) • [Architecture](#-architecture--workflow) • [CPCB Standards](#-cpcb-4-bin-matrix-standards) • [Tech Stack](#-tech-stack)

</div>

---

## 📌 Problem Statement & Mission

India generates over **62 million tonnes** of municipal solid waste every year, of which less than **25% is scientifically treated**. Mixed waste ends up in open landfills, poisoning groundwater with toxic leachate, releasing methane gas, and forcing hazardous incineration.

### 🎯 The BinWise Solution
**BinWise AI** bridges the gap between civic intent and environmental action by deploying:
1. **Multi-Modal AI Vision & NLP** to eliminate confusion around waste segregation at source.
2. **Official CPCB 4-Bin Matrix Standards** to ensure legal compliance and safe handling of hazardous/sanitary waste.
3. **Circular Economy Tracking** that maps the complete lifecycle journey of discarded items.
4. **Gamified Civic Rewards (Green Karma Points)** to incentivize millions of citizens to recycle responsibly.

---

## ✨ Key Features

### 1. 🤖 Neural AI Vision & Multi-Modal Scanner
- **Dual Input Modes**: Upload photos, take live camera snapshots, or enter descriptive text hints.
- **Powered by Google Gemini 2.0 Flash Vision**: Sub-second multimodal neural inference detecting materials, risk levels, and segregation bins.
- **Dynamic Confidence Scoring (95%+ Verified)**: Transparent AI certainty metrics ensuring high reliability for end users.

### 2. 🗂️ CPCB National 4-Bin Matrix Classification
Classifies every waste stream into one of the 4 statutory Central Pollution Control Board (CPCB) categories:
- 🟢 **Green Bin (Wet / Organic)**: Biodegradable kitchen waste, food peels, yard clippings $\rightarrow$ Biogas & Compost.
- 🔵 **Blue Bin (Dry / Recyclable)**: Clean plastics (PET, HDPE), cardboard, metals, glass $\rightarrow$ Industrial extrusion.
- 🔴 **Red Bin (Sanitary / Bio-Medical)**: Soiled bandages, masks, diapers, medicines $\rightarrow$ Safe thermal incineration & autoclaving.
- ⚫ **Black Bin (Hazardous / E-Waste)**: Lithium-ion batteries, cables, PCBs, fluorescent tubes $\rightarrow$ TSDF rare-metal extraction.

### 3. 🔄 End-to-End Waste Journey Lifecycle Tracker
Tracks discarded items across **5 transparent stages**:
1. `Scanned & Verified` $\rightarrow$ Neural classification complete.
2. `At-Home DIY / Segregation` $\rightarrow$ Pre-treatment and cleaning instructions.
3. `Hub Drop-Off` $\rightarrow$ Delivery to a certified municipal collection center.
4. `In Transit` $\rightarrow$ Dynamic transit timeline calculation (2 to 7 days).
5. `Resource Recovery & Recycled` $\rightarrow$ Industrial transformation into secondary raw materials (7 to 21 days).

### 4. 🛠️ Dual Resource Recovery Protocols
- **Industrial Process Guide**: Step-by-step technical blueprints (e.g. Rare-Metal Hydro-refining, Bioreactor Anaerobic Digestion, High-temp Gasification).
- **At-Home DIY Upcycling Project**: Practical zero-cost home projects (e.g. Self-watering planters, citrus peel bio-enzymes) with **Photo Proof Verification** to earn $+20$ GKP!

### 5. 📍 Certified Municipal Drop-Off Hub Locator
- Direct 1-click Google Maps integration locating nearest authorized CPCB collection centers and dry waste aggregation kiosks.
- Drop-off completion confirmation with Green Karma Points reward.

### 6. 🏆 Gamified Eco-Warriors Leaderboard
- Earn **Green Karma Points (GKP)** for every verified segregation action, DIY project, and hub drop-off.
- Live community leaderboard driving positive civic competition and habit formation.

### 7. 🛡️ Anti-Farming & Fraud Prevention Architecture (Roadmap)
- **Perceptual Hashing (pHash)**: 64-bit visual fingerprinting to instantly detect cropped, duplicate, or re-uploaded photos.
- **EXIF Metadata & Geotagging**: Live camera timestamp and GPS coordinates validation.
- **Gemini Vision Fraud Screening**: Automated detection of stock internet images and screenshots.

---

## 🏛️ Architecture & Workflow

```
[User Interface (Next.js 16 + Tailwind CSS)]
               │
               ▼  (FormData: Image + Text Prompt)
    [/api/waste/submit] Next.js Serverless Route
               │
      ┌────────┴──────────────────────────┐
      ▼                                   ▼
[Local FastAPI Backend]         [Google Gemini 2.0 Flash]
 (Optional Microservice)         (Vision & NLP Inference)
      │                                   │
      └────────┬──────────────────────────┘
               │
               ▼  (Structured JSON Output)
   { waste_type, hazard_level, gemini_confidence,
     transit_days, total_days, facility_name }
               │
               ▼
[Dynamic UI State Engine]
  ├── CPCB 4-Bin Card & Color Scheme
  ├── Hazard Risk Meter (Safe / Moderate / High / Critical)
  ├── 5-Stage Lifecycle Journey Tracker
  ├── Interactive DIY / Industrial Modals
  └── Green Karma Points (+50 GKP) & Leaderboard Sync
```

---

## 📊 CPCB 4-Bin Matrix Standards

| Bin Color | Official Category | Example Items | Processing Method | Facility Destination |
|:---:|:---:|:---|:---|:---|
| 🟢 **Green** | Wet / Organic | Food scraps, peels, vegetable rinds, garden leaves | Biomethanation & Vermicomposting | Municipal Biomethanation Plant |
| 🔵 **Blue** | Dry / Recyclable | PET bottles, cardboard, paper, aluminum cans, glass | Mechanical Granulation & Extrusion | Polymer Re-pelletization Plant |
| 🔴 **Red** | Sanitary Waste | Used diapers, bandages, masks, expired pills | High-temp Autoclaving & Incineration | Common Bio-Medical Facility (CBWTF) |
| ⚫ **Black** | Hazardous / E-Waste | Swollen batteries, chargers, motherboards, wires | TSDF Neutralization & Rare-Metal Refining | State TSDF & Hydro-refinery |

---

## 💻 Tech Stack

### Frontend & Application Layer
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) with Lucide React Icons
- **Design System**: Emerald-Teal Nature Glassmorphism (`from-emerald-600 via-emerald-700 to-teal-800`)
- **Language**: TypeScript

### AI & Machine Learning Engine
- **Vision & Multimodal AI**: [Google Gemini 2.0 Flash](https://ai.google.dev/)
- **NLP Prompt Engineering**: Context-grounded zero-shot classification with CPCB compliance rules
- **Computer Vision (Roadmap)**: OpenCV ImageHash (`pHash` / `dHash`) for duplicate fraud detection

### Backend & Microservices
- **Serverless API**: Next.js App Router Serverless Functions
- **Python Backend**: FastAPI, Pydantic Settings, Uvicorn (located in `/backend`)
- **Database & Storage**: PostgreSQL / Supabase Schema (`migrations/001_initial_schema.sql`)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm** or **pnpm** / **yarn**
- **Google Gemini API Key** ([Get one from Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/2606tarun-eng/BinWise-Ai.git
cd BinWise-Ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application!

---

## 🌐 Deployment on Vercel

1. Push your repository to GitHub.
2. Import the repository into **[Vercel](https://vercel.com/)**.
3. In **Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: `your_gemini_api_key`
4. Click **Deploy**. Both Frontend and Serverless AI API routes will be live instantly!

---

## 👥 Team Asynchronous (SIH 2026)

We are innovators building next-generation AI and smart civic infrastructure for a sustainable, zero-landfill India.

- **Theme**: Smart Automation / Waste Management / Clean & Green Technology
- **Hackathon**: Smart India Hackathon (SIH 2026)
- **Organization**: Ministry of Environment, Forest and Climate Change (MoEFCC) / CPCB

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
