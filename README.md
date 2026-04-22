<div align="center">

# 🥗 Smart Nutrition Analyzer

### AI-Powered Personalized Nutrition Guidance & Food Label Transparency

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

<br/>

> 📱 Scan food labels · 🧠 Get AI analysis · 🔁 Personalized recommendations · 📊 Track your nutrition

<br/>

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Results & Performance](#-results--performance)
- [Screenshots](#-screenshots)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)
- [Authors](#-authors)

---

## 🔍 Overview

The **Smart Nutrition Analyzer** is an intelligent mobile application designed to simplify food label interpretation and provide **personalized dietary recommendations** using Artificial Intelligence.

With the increasing consumption of packaged foods, understanding nutritional information has become a challenge for everyday users. This app bridges that gap by combining cutting-edge AI, OCR, and Reinforcement Learning technologies into a seamless mobile experience.

| What it does | How |
|---|---|
| Reads food labels | OCR via Gemini Vision API |
| Interprets nutrition | NLP-based AI analysis |
| Personalizes suggestions | Reinforcement Learning (UCB, DQN, PG) |
| Stores your data | Firebase Firestore + Auth |
| Generates reports | PDF export via react-native-print |

---

## 🎯 Problem Statement

Understanding food labels is harder than it should be:

- 🔤 Technical nutritional terminology confuses users
- 📋 Inconsistent labeling formats across brands
- 🚫 No personalized insights based on individual health conditions

**Existing apps fall short because they:**
- Require tedious manual food entry
- Provide only generic, one-size-fits-all recommendations
- Cannot adapt to individual preferences over time

> 👉 This project solves all three using **AI + OCR + Reinforcement Learning**

---

## 💡 Key Features

### 📷 1. Food Label Scanning (OCR)
Upload one or more photos of a food package. The app uses **Gemini Vision API** to extract all text — ingredients, nutrition facts, weight, dates, and warnings — automatically.

### 🧠 2. AI-Based Nutrition Analysis
Using **Google Gemini NLP**, the app interprets extracted label text and returns:
- Calories, proteins, carbs, fats, sugars, sodium
- Ingredient-level health impact (good / neutral / bad)
- Personalized health rating (1–10)
- Healthier alternative suggestions

### 👤 3. Personalized Health Profiling
Users set up a profile with:
- Dietary goal (Weight Loss / Weight Gain / Maintenance / Fitness)
- Food likes and dislikes / allergies
- Medical conditions (Diabetes, High Blood Pressure, Heart Condition, etc.)
- Daily & weekly calorie and protein targets

### ⚠️ 4. Smart Health Warnings
Context-aware alerts tailored to your profile:
- *"High Sugar — not suitable for diabetes"*
- *"Good protein source for your fitness goal"*
- *"Expired product — do not consume"*

### 📊 5. Daily Nutrition Tracking
- Log meals via scan, common item search, or AI-estimated free text
- Real-time calorie and protein dashboard
- Visual trend charts (daily line chart + weekly bar chart)
- Nutrient gap analysis with food suggestions

### 🔁 6. Reinforcement Learning Recommendations
The **Smart Food Choices** screen uses a live RL backend with three algorithms:

| Algorithm | Strength |
|---|---|
| **UCB** (Upper Confidence Bound) | Best stability and consistency |
| **DQN** (Deep Q-Network) | Strong in complex scenarios |
| **PG** (Policy Gradient) | Learns nuanced preferences over time |

The RL agent learns from your 👍 / 👎 feedback and adapts meal suggestions to your current calorie budget, time of day, and vegetarian preference.

### 📄 7. Nutrition Report Generation
- Generate a full **PDF report** of your daily food log
- Includes totals for calories, protein, fat, carbs, sugar
- Per-item breakdown with meal type and time
- Vitamin and mineral details

### 🇮🇳 8. Indian Food Support
- Hybrid database combining **INDB-style nutritional data** with USDA nutrient entries
- AI estimation for regional Indian meals not in the database
- RL meal candidates specifically generated for Indian dietary patterns

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Camera  │  │  Food Search │  │   Manual Entry   │  │
│  │  / OCR   │  │  (Database)  │  │   (AI Estimate)  │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬─────────┘  │
│       │               │                   │             │
│       └───────────────▼───────────────────┘             │
│                       │                                 │
│              ┌────────▼────────┐                        │
│              │  Gemini API     │                        │
│              │  (NLP + Vision) │                        │
│              └────────┬────────┘                        │
│                       │                                 │
│         ┌─────────────▼──────────────┐                  │
│         │      RL Backend Server     │                  │
│         │   UCB  |  DQN  |  PG       │                  │
│         └─────────────┬──────────────┘                  │
│                       │                                 │
│              ┌────────▼────────┐                        │
│              │    Firebase     │                        │
│              │  Auth+Firestore │                        │
│              └─────────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

### 📱 Frontend
| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile app |
| TypeScript | Type-safe development |
| react-native-chart-kit | Nutrition trend charts |
| react-native-image-picker | Camera & gallery access |
| react-native-print | PDF report generation |

### 🧠 AI & Processing
| Technology | Purpose |
|---|---|
| Google Gemini 2.5 Flash | Food label OCR + NLP analysis |
| Gemini Vision API | Multi-image text extraction |
| AI Nutrition Estimator | Free-text food item analysis |

### 🔁 Machine Learning
| Algorithm | Description |
|---|---|
| UCB | Exploration-exploitation balance for food suggestions |
| DQN | Deep Q-Network for complex preference learning |
| Policy Gradient | Probabilistic meal recommendation |

### ☁️ Backend & Database
| Technology | Purpose |
|---|---|
| Firebase Authentication | User sign-in / sign-up / anonymous |
| Cloud Firestore | Real-time data sync across devices |
| Custom RL API Server | Python backend for RL recommendations |

---

## 📁 Project Structure

```
nutriscan/
├── App.tsx                        ← Root component (Firebase init, state, routing)
└── src/
    ├── config.ts                  ← Firebase config & App ID
    ├── theme.ts                   ← Color palette
    ├── styles.ts                  ← Global StyleSheet
    ├── types/
    │   └── index.ts               ← All TypeScript type definitions
    ├── utils/
    │   └── helpers.ts             ← getMealTypeByTime, extractNutrients, calculateRating
    ├── data/
    │   └── foodDatabase.ts        ← FULL_FOOD_DATABASE (fruits, vegetables, grains, proteins)
    ├── api/
    │   └── gemini.ts              ← callGeminiAPI, analyzeManualFoodItem, generateMealCandidates
    ├── components/
    │   └── index.tsx              ← CustomButton, Checkbox, Header, BottomNav
    └── screens/
        ├── index.ts               ← Barrel re-export
        ├── OnboardingScreen.tsx
        ├── LoginScreen.tsx
        ├── PreferencesScreen.tsx
        ├── HealthIssuesScreen.tsx
        ├── HomeScreen.tsx
        ├── ScanScreen.tsx
        ├── AnalysisScreen.tsx
        ├── AllergyTrackerScreen.tsx
        ├── ManualAllergyScreen.tsx
        ├── ManualEntryScreen.tsx
        ├── LogCommonItemScreen.tsx
        ├── ReportsScreen.tsx
        ├── FoodReportScreen.tsx
        ├── FoodChoicesScreen.tsx
        ├── LogHistoryScreen.tsx
        └── SettingsScreen.tsx
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js >= 18
- Android Studio / Xcode
- Java JDK 17
- React Native CLI

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/Smart-Nutrition-Analyzer.git
cd Smart-Nutrition-Analyzer
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Setup environment variables

Create a `.env` file in the root directory:

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
GEMINI_API_KEY=your_gemini_api_key
RL_URL=http://your-rl-backend-url:8000
```

### 4️⃣ iOS setup (Mac only)

```bash
cd ios && pod install && cd ..
```

### 5️⃣ Run the app

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

### 6️⃣ Build release APK

```bash
cd android && ./gradlew assembleRelease
```
> Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📈 Results & Performance

### Reinforcement Learning Algorithm Comparison

| Algorithm | Stability | Convergence Speed | Complex Scenarios |
|---|---|---|---|
| **UCB** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **DQN** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **PG** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

- ✅ UCB showed the **best stability and adaptability** for general users
- ✅ DQN performed best in **complex multi-variable scenarios**
- ✅ PG learned the most **nuanced long-term preferences**
- ✅ RL integration significantly improved personalization accuracy over static recommendations

---

## 📱 Screenshots

> Coming soon

| Home | Scan | Analysis | Reports |
|---|---|---|---|
| ![Home](screenshots/home.png) | ![Scan](screenshots/scan.png) | ![Analysis](screenshots/analysis.png) | ![Reports](screenshots/reports.png) |

---

## 🚧 Limitations

- OCR accuracy depends on **image quality and lighting**
- Requires an **active internet connection** (Firebase + Gemini API)
- Some Indian regional foods are **AI-estimated**, not from a verified database
- RL backend must be **self-hosted** (not included in this repo)

---

## 🚀 Future Enhancements

- [ ] 📷 **Food image recognition** — identify food directly from photos without a label
- [ ] 📦 **Barcode scanning** — instant product lookup via barcode
- [ ] 🌐 **Multilingual OCR** — support for regional Indian language labels
- [ ] 🧠 **LLM-based diet assistant** — conversational nutrition chatbot
- [ ] 📊 **Advanced AI diet planning** — full weekly meal plans with grocery lists
- [ ] ⌚ **Wearable integration** — sync with fitness trackers for activity-aware recommendations

---

## 👨‍💻 Authors

| Name | Role |
|---|---|
| **Muvva Adityavardhan** | AI Integration & RL Backend |
| **Venigalla Gopi Krishna** | Frontend & Firebase |
| **Kaushal Kulkarni** | Database & Nutrition Engine |
| **Konda Govardhan** | OCR & Report Generation |

---

## 🎓 Academic Project

> Developed as part of **B.Tech (CSE) Major Project**
>
> **Gokaraju Rangaraju Institute of Engineering and Technology**

---

## 🔐 Security

- Firebase Authentication with email/password and anonymous sign-in
- User data is **fully isolated** per UID in Firestore
- API keys stored securely in `.env` (never committed to Git)
- Add `.env` to your `.gitignore` before pushing

---

## 📄 License

This project is developed for academic purposes.
Feel free to **fork, contribute, and improve** this project!

---

<div align="center">

Made with ❤️ by the Smart Nutrition Analyzer Team

⭐ Star this repo if you found it useful!

</div>
