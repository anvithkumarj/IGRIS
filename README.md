# ⚔️ IGRIS

> **An intelligent voice-driven AI assistant interface inspired by the presence and command system of Igris.**

Igris is a modern AI assistant interface built with **React and Vite**, designed around a futuristic command-center experience. It combines conversational AI, voice interaction, speech recognition, multilingual communication, audio responses, and a highly immersive HUD-style interface.

The goal of Igris is simple:

**You speak. Igris listens. You command. Igris responds.**

---

## ✨ Features

### 🎙️ Voice Interaction
- Wake-word activation using **"Igris"**
- Voice-based conversations
- Microphone input through the browser
- Speech recognition and transcription
- Continuous listening support
- Real-time recognition feedback

### 🧠 Conversational AI
- Ask questions naturally using voice or text
- AI-generated responses
- Conversation history displayed inside the interface
- Supports communication in the user's preferred language
- Multilingual speech interaction

### 🔊 Voice Responses
- AI responses can be converted into speech
- Audio playback directly through the interface
- Designed for a hands-free assistant experience

### 🖥️ Futuristic Interface
- Custom Igris-themed HUD
- Animated AI core
- Dynamic rings and waveform visualizations
- System console
- Status indicators
- Interactive control panels
- Responsive layout

### ⚡ Modern Web Stack
- React
- Vite
- Node.js
- Express
- Web Speech API
- REST API communication
- Modular component architecture

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React** | Frontend UI and application logic |
| **Vite** | Development server and production bundling |
| **Node.js** | Backend runtime |
| **Express** | Backend API server |
| **JavaScript** | Application logic |
| **CSS** | HUD interface and animations |
| **Web Speech API** | Voice recognition and speech interaction |
| **Git & GitHub** | Version control and source management |

---

## 📁 Project Structure

```text
IGRIS/
│
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── igris-logo.png
│
├── server/
│   ├── audio/
│   └── server.js
│
├── src/
│   ├── components/
│   │   ├── AICore.jsx
│   │   ├── BootScreen.jsx
│   │   ├── Buttons.jsx
│   │   ├── Console.jsx
│   │   ├── ConversationalPanel.jsx
│   │   ├── Core.jsx
│   │   ├── HUD.jsx
│   │   ├── InfoPanel.jsx
│   │   ├── LeftPanel.jsx
│   │   ├── RightPanel.jsx
│   │   ├── Rings.jsx
│   │   ├── TopBar.jsx
│   │   └── Wave.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js
