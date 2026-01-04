# AI-Driven Penalty Enforcement & Reward Distribution Module 🚦

### A Core Component of the "GoodRoad" Intelligent Traffic Management System

![Status](https://img.shields.io/badge/Status-Prototype%20Ready-success)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20MongoDB%20%7C%20Gemini%20AI-blue)

## 📌 Overview
This module serves as the **financial and enforcement backbone** of the GoodRoad system. It automates the processing of traffic violations detected by dashcams, calculates penalty fees based on a unique revenue distribution model, and utilizes **Generative AI (Google Gemini)** to send professional, context-aware notifications to drivers.

Key capabilities include **automated violation processing**, **dynamic revenue allocation (Government/Reward/System)**, and **real-time driver analytics**.

---

## 🚀 Key Features

### 1. Automated Penalty Enforcement
- **Workflow:** Administrators review detected violations (Red Light, Pedestrian Crossing, etc.) and process them with a single click.
- **Points Logic:** Automatically deducts points from the driver's license based on violation severity.

### 2. Intelligent Revenue Distribution Model 💰
A transparency-first financial logic that splits every penalty fee into three distinct streams:
- **🏛️ Government Tax (60%):** Regulatory compliance and state revenue.
- **🎥 Reward Pool (25%):** Incentives for citizens who report violations via dashcam.
- **⚙️ System Maintenance (15%):** Operational revenue for the GoodRoad platform.

### 3. AI-Driven Driver Notifications 📧
- Integrated with **Google Gemini AI** to generate personalized email notifications.
- Emails include specific violation details, timestamps, penalty points added, and safety advice tailored to the offense type.

### 4. Driver Dashboard & Analytics 📊
- A comprehensive user portal for drivers to view:
  - **Violation History:** Monthly breakdown of offenses.
  - **Risk Assessment:** Real-time "Risk Level" (Low/High) based on recent behavior.
  - **Reward Earnings:** Tracking of rewards earned from submitting valid dashcam footage.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | Interactive Dashboards & Chart.js Visualizations |
| **Backend** | Python (FastAPI) | High-performance API for logic & database handling |
| **Database** | MongoDB | NoSQL storage for vehicle profiles & violation logs |
| **AI Engine** | Google Gemini API | Generative AI for dynamic email content generation |
| **Email Service** | EmailJS | Client-side transactional email delivery |

---

## 📸 System Previews

### 👮 Admin Enforcement Console
*The command center for processing violations. Displays the real-time fee breakdown before confirmation.*

### 📧 AI-Generated Notification
*Personalized warning emails sent immediately upon violation confirmation.*

### 🚗 Driver Dashboard
*Real-time analytics showing penalty points, risk levels, and reward contributions.*

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js & npm
- Python 3.9+
- MongoDB Instance
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone [https://github.com/kavindya-pabasara/GoodRoad-ReportingModule.git](https://github.com/kavindya-pabasara/GoodRoad-ReportingModule.git)
cd GoodRoad-ReportingModule

```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv

# Activate Virtual Environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
# source .venv/bin/activate

pip install -r requirements.txt

```

> **Important:** Create a `.env` file in the `backend` directory containing your `GEMINI_API_KEY`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev

```

---

## 🛡️ License

This project is developed as part of a Year 4 Research Project (GoodRoad).
All rights reserved © 2026.
