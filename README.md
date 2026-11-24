# 🚀 PitchPulse AI — On-Device Interview & Presentation Coach

**Speak with Confidence. Present with Impact. Improve with AI.**

PitchPulse AI is a privacy-first, multimodal interview and presentation coaching platform that helps users improve their speaking skills, facial engagement, eye contact, confidence, and delivery through real-time browser-based analysis.

Powered by **Google MediaPipe** and the browser's **Web Speech API**, PitchPulse AI transforms your webcam and microphone into a personal presentation coach — without requiring paid API keys, cloud video processing, or a mandatory AI backend.

---

## ✨ Key Features

### 🎥 1. Real-Time AI Facial Analysis
Powered by Google MediaPipe Face Landmarker.

- Real-time facial landmark tracking (478 points).
- Futuristic facial mesh visualization.
- Eye-contact estimation.
- Facial engagement and expression analysis.
- Head movement and composure tracking.
- Live visual telemetry.

### 🎙️ 2. Intelligent Speech & Delivery Analysis

Powered by the browser's Web Speech API.

- Live speech transcription.
- Real-time Words Per Minute (WPM) calculation.
- Optimal speaking pace indicator (120–150 WPM).
- Automatic filler-word detection.
- Highlights words such as:
  - Um
  - Uh
  - Like
  - Actually
  - Basically
  - You know
  - So

### ⚡ 3. Instant Demo Simulation

No webcam? No microphone? No problem!

Run the interactive demo with one click.

- Simulated facial tracking visualization.
- Animated telemetry metrics.
- Sample speech transcription.
- Highlighted filler words.
- Live confidence and eye-contact graphs.
- Automatically generated coaching scorecard.

**Experience the core product without any hardware permissions.**

### 📝 4. Script Practice Mode

Practice your delivery without activating your camera or microphone.

- Paste or type your presentation script.
- Choose from predefined interview prompts.
- Practice answering common interview questions.
- Analyze script content and delivery structure.

### 📊 5. Post-Session Coaching Dashboard

Get actionable insights after every practice session.

**Performance Metrics:**
- Overall Readiness Score.
- Eye Contact Score.
- Facial Engagement Score.
- Composure Score.
- Speaking Pace.
- Speech Clarity.
- Filler-Word Ratio.

**Visual Analytics:**
- Confidence timeline.
- Eye-contact performance chart.
- Session performance breakdown.
- Personalized improvement recommendations.

### 📥 6. Coaching Report & Session History

- Download coaching reports in TXT or JSON format.
- Save practice sessions locally.
- Track historical performance.
- Compare progress across multiple attempts.
- Access previous session insights through localStorage.

### 🤖 7. Optional Google Gemini Integration

An optional configuration for users who want deeper AI-powered content feedback.

- Optional Google AI Studio API key.
- No mandatory API key.
- Core application remains functional without Gemini.
- Optional content critique and presentation suggestions.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend application |
| Tailwind CSS | Modern responsive UI |
| Lucide React | Interface icons |
| Google MediaPipe | Facial landmark detection |
| Face Landmarker | Facial tracking and blendshapes |
| Web Speech API | Speech recognition |
| HTML5 Canvas | Real-time facial visualization |
| SVG | Performance timeline charts |
| Browser localStorage | Session history |
| Google Gemini API | Optional content critique |

---

## 🔐 Privacy First — On-Device Processing

PitchPulse AI is designed with privacy at its core.

- Facial analysis runs locally in the browser.
- Webcam video is not uploaded to a cloud server.
- Speech analysis uses browser-supported speech recognition.
- Session history is stored locally using localStorage.
- No paid backend is required for the core experience.

**Your camera feed stays on your device.**

*Note: Browser speech recognition implementations may use browser-vendor services for transcription. Strictly offline speech recognition is not guaranteed.*

---

## 🚀 Getting Started

### Prerequisites

- Node.js (18+ recommended)
- npm
- Modern browser (Chrome or Edge recommended)
- Webcam and microphone (optional for Demo Mode)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/pitchpulse-ai.git
```

**2. Navigate to the project**

```bash
cd pitchpulse-ai
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open in your browser**

```text
http://localhost:5173
```

For production deployment:

```bash
npm run build
npm run preview
```

---

## 🎯 Practice Prompts

PitchPulse AI includes practice scenarios designed for different communication situations.

| Practice Prompt | Objective |
|---|---|
| 30-Second Hackathon Pitch | Deliver a concise project pitch |
| Tell Me About Yourself | Improve interview introductions |
| Why Should We Hire You? | Practice persuasive communication |
| Project Presentation | Explain technical projects |
| General Speaking Practice | Improve overall delivery |

---

## 📈 Performance Scoring

PitchPulse AI combines multiple communication metrics into an overall readiness score.

| Metric | What It Measures |
|---|---|
| Eye Contact | Estimated visual attention and head orientation |
| Composure | Head movement stability |
| Engagement | Facial expression activity |
| Pacing | Speaking speed and WPM |
| Clarity | Filler-word frequency |

The final readiness score provides a simplified overview of presentation performance, not a clinical or scientifically validated assessment.

---

## 🧪 Browser Compatibility

| Feature | Requirement |
|---|---|
| Facial Tracking | MediaPipe + compatible browser |
| Webcam Analysis | Camera permission |
| Speech Recognition | Web Speech API support |
| Demo Simulation | No hardware required |
| Script Practice | No hardware required |
| Session History | Browser localStorage |
| Report Export | Browser download support |

**Recommended:** Latest Google Chrome or Microsoft Edge.

---

## 🗺️ Project Roadmap

- [x] Privacy-first product architecture
- [x] Browser-based AI analysis approach
- [x] Webcam-free demo experience
- [x] Script practice workflow
- [x] Speech analytics
- [x] Performance scorecard
- [x] Local session history
- [x] Exportable coaching reports
- [ ] Advanced personalized coaching
- [ ] Interview question recommendation engine
- [ ] Multilingual speech analytics
- [ ] Long-term performance analytics
- [ ] Optional AI-powered presentation critique

---

## 💡 Why PitchPulse AI?

Traditional interview preparation focuses on what you say.

PitchPulse AI focuses on **how you say it.**

It combines computer vision, speech analytics, and actionable feedback into one accessible platform — helping students, job seekers, developers, founders, and professionals become more confident communicators.

No expensive subscriptions. No mandatory API keys. No cloud video uploads.

Just practice, feedback, and progress.

---

## 🏗️ Built With

**React • Tailwind CSS • Google MediaPipe • Web Speech API • HTML Canvas**

<sub>Powered by Google MediaPipe On-Device AI — 100% Private, Zero Cloud Video Upload.</sub>

---

## 📄 License

This project is intended for educational, research, and personal development purposes.

Choose an appropriate open-source license before public distribution.

---

**PitchPulse AI — Practice Smarter. Speak Better. Stand Out.** 🎤
