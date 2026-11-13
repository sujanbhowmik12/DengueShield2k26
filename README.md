
🦟 DengueShield — Smart Dengue Surveillance Platform

<p align="center">
  <img src="https://img.shields.io/badge/Project-DengueShield-0D9488?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge&logo=google" />
</p><p align="center">
  <b>An AI-powered platform for dengue awareness, public health monitoring, and environmental surveillance.</b>
</p><p align="center">
  🌐 <b>Live Demo:</b> https://denguehield2k26.vercel.app/
  <br/>
  💻 <b>GitHub Repository:</b> https://github.com/sujanbhowmik12/DengueShield2k26
</p>---

📌 About The Project

DengueShield is an intelligent, location-based dengue surveillance and awareness platform designed to help users explore public dengue reports, monitor environmental conditions, understand potential dengue-related risks, and access reliable health guidance.

The platform combines public health data, climate information, interactive mapping, and Google's Gemini AI voice technology to make dengue-related information more accessible and understandable.

Our goal is to use technology and data visualization to support dengue awareness and informed public health decisions.

✨ Key Features

- 📊 Dengue Surveillance Dashboard – Explore the latest available public dengue case reports and monthly trends.
- 📍 Location-Based Monitoring – Search for a city or use browser geolocation to explore location-specific information.
- 🗺️ Interactive Map – Visualize selected locations using Leaflet and OpenStreetMap.
- 🌦️ Environmental Monitoring – Explore temperature, humidity, rainfall, and elevation data.
- 🧮 Environmental Suitability Index – View an educational environmental indicator based on climate and elevation factors.
- 🤖 AI Voice Assistant – Interact with a dengue-focused voice assistant powered by Gemini Live.
- 🚨 WHO Outbreak Notices – Explore relevant recent dengue-related notices from the WHO Disease Outbreak News service.
- 🩺 Health Awareness – Access general dengue symptoms, warning signs, prevention information, and health guidance.
- 🎨 Modern Dashboard UI – Responsive dashboard with light and dark themes.

🛠️ Technology Stack

Technology| Purpose
Next.js| Frontend framework and API routes
React.js| User interface
JavaScript| Application logic
CSS| Styling and responsive design
Leaflet.js| Interactive maps
OpenStreetMap| Map data and tiles
Gemini Live API| AI-powered voice interaction
Open-Meteo API| Weather, climate, geocoding and elevation
Global Dengue Observatory| Public dengue case data
WHO| Outbreak notices and health guidance
NCVBDC| Indian state/UT dengue reporting

🏗️ Project Architecture

DengueShield/
│
├── app/
│   ├── api/
│   │   ├── cases/
│   │   │   └── route.js
│   │   ├── alerts/
│   │   │   └── route.js
│   │   └── voice-token/
│   │       └── route.js
│   │
│   ├── page.js
│   ├── layout.js
│   └── globals.css
│
├── components/
├── data/
├── lib/
├── public/
│
├── .env.example
├── package.json
├── PROJECT_REPORT.md
└── README.md

⚙️ Installation & Setup

Follow these steps to run DengueShield locally.

1. Clone the repository

git clone https://github.com/sujanbhowmik12/DengueShield2k26.git

2. Navigate to the project directory

cd DengueShield2k26

3. Install dependencies

npm install

4. Configure environment variables

Create a ".env.local" file in the root directory.

GEMINI_API_KEY=your_gemini_api_key

The Gemini API key is optional for the main dashboard but required for the AI voice assistant.

5. Start the development server

npm run dev

Open your browser and visit:

http://localhost:3000

6. Build for production

npm run build
npm start

🔑 API & Data Sources

DengueShield uses publicly available data and services:

- "Global Dengue Observatory" (https://globaldengueobservatory.org/) – Public dengue surveillance data.
- "WHO" (https://www.who.int/) – Dengue health information and outbreak notices.
- "NCVBDC India" (https://ncvbdc.mohfw.gov.in/) – National dengue statistics.
- "Open-Meteo" (https://open-meteo.com/) – Weather and environmental information.
- "OpenStreetMap" (https://www.openstreetmap.org/) – Interactive mapping.
- "Google Gemini" (https://ai.google.dev/) – AI-powered voice assistant.

⚠️ Important Disclaimer

DengueShield is an educational and public-health awareness prototype. It is not a medical diagnostic tool, an official surveillance system, or a clinically validated outbreak prediction platform.

The environmental suitability index is illustrative and does not represent an individual's infection probability or predict future dengue cases.

Public health data may be delayed, incomplete, or unavailable for certain locations. Always consult qualified healthcare professionals and local health authorities for medical advice and official updates.

🚀 Future Improvements

- Advanced dengue data visualization and analytics.
- More regional public health data integration.
- Improved multilingual AI assistance.
- Enhanced community-level awareness and reporting.
- More comprehensive environmental monitoring.
- Improved accessibility and mobile experience.

👥 Project Team

DengueShield — 2K26

Developed as an interdisciplinary technology project with a focus on public health awareness, software engineering, environmental science, and AI.

❤️ Acknowledgements

Special thanks to the open-source community, public health organizations, and data providers whose resources make this project possible.

---

<p align="center">
  <b>🦟 DengueShield — Technology for a Healthier Tomorrow.</b>
</p><p align="center">
  ⭐ If you find this project useful, consider giving this repository a star!
</p>
