import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:3001"
  : "";

const LANGUAGE_CONFIG = {
  English: { code: "en-US", native: "English" },
  Telugu: { code: "te-IN", native: "తెలుగు" },
  Hindi: { code: "hi-IN", native: "हिन्दी" },
  Tamil: { code: "ta-IN", native: "தமிழ்" },
  Kannada: { code: "kn-IN", native: "ಕನ್ನಡ" },
  Malayalam: { code: "ml-IN", native: "മലയാളം" },
};

const WAKE_WORDS = [
  "arise",
  "a rise",
  "arise igris",
  "arrise",
  "aris",
  "ariss",
  "arrays",
  "array",
  "erase",
  "rice",
  "our eyes",
  "a race",
  "a rays",
];

const BOOT_STEPS = [
  "REACTOR ONLINE",
  "NEURAL CORE STABLE",
  "QUANTUM MEMORY LOADED",
  "VOICE ENGINE READY",
  "MEMORY MATRIX CONNECTED",
  "INTELLIGENCE MODULES LOADED",
  "INTERFACE SYNCHRONIZED",
];

const ACKNOWLEDGEMENTS = {
  English: "At your command.",
  Telugu: "మీ ఆదేశం కోసం సిద్ధంగా ఉన్నాను.",
  Hindi: "आपके आदेश के लिए तैयार हूँ।",
  Tamil: "உங்கள் கட்டளைக்காக தயாராக இருக்கிறேன்.",
  Kannada: "ನಿಮ್ಮ ಆದೇಶಕ್ಕಾಗಿ ಸಿದ್ಧವಾಗಿದ್ದೇನೆ.",
  Malayalam: "നിങ്ങളുടെ ആജ്ഞയ്ക്കായി തയ്യാറാണ്.",
};

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("IGRISUser") || "null");
  } catch {
    return null;
  }
};

function App() {
  const savedUser = getSavedUser();

  const [screen, setScreen] = useState(
    savedUser ? "DASHBOARD" : "SETUP"
  );

  const [name, setName] = useState(savedUser?.name || "");

  const [language, setLanguage] = useState(
    savedUser?.language || "Telugu"
  );

  const [bootProgress, setBootProgress] = useState(0);

  const [bootMessage, setBootMessage] = useState(
    "INITIALIZING CORE..."
  );

  const [status, setStatus] = useState(
    savedUser ? "STANDBY" : "SETUP"
  );

  const [transcript, setTranscript] = useState("");

  const [englishText, setEnglishText] = useState("");

  const [igrisReply, setIgrisReply] = useState("");

  const [systemLog, setSystemLog] = useState(
    "AWAITING COMMAND..."
  );

  const [error, setError] = useState("");

  const [isActive, setIsActive] = useState(false);

  const recognitionRef = useRef(null);

const recognitionModeRef = useRef(null);

const microphoneStreamRef = useRef(null);

const activeRef = useRef(false);

  const speakingRef = useRef(false);

  const mountedRef = useRef(true);

  const bootTimerRef = useRef(null);

  const restartTimerRef = useRef(null);

  const requestIdRef = useRef(0);
  const beginListeningRef = useRef(null);
  const handleRecognizedSpeechRef = useRef(null);

  const languageCode =
    LANGUAGE_CONFIG[language]?.code || "en-US";

  const addLog = useCallback((message) => {
    if (mountedRef.current) {
      setSystemLog(message);
    }
  }, []);

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;

    recognitionRef.current = null;
    recognitionModeRef.current = null;

    if (!recognition) return;

    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;

    try {
      recognition.stop();
    } catch {
      // Recognition already stopped.
    }
  }, []);

  const stopSpeech = useCallback(() => {
    speakingRef.current = false;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakBrowser = useCallback(
    (text, onEnd) => {
      const value = String(text || "").trim();

      if (!value || !("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(value);

      utterance.lang = languageCode;
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.volume = 1;

      const voices =
        window.speechSynthesis.getVoices();

      const voice =
        voices.find(
          (item) =>
            item.lang.toLowerCase() ===
            languageCode.toLowerCase()
        ) ||
        voices.find((item) =>
          item.lang
            .toLowerCase()
            .startsWith(
              languageCode.split("-")[0]
            )
        );

      if (voice) {
        utterance.voice = voice;
      }

      speakingRef.current = true;

      setStatus("SPEAKING");

      let finished = false;

      const finish = () => {
        if (finished) return;

        finished = true;
        speakingRef.current = false;

        onEnd?.();
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);
    },
    [languageCode]
  );

  const playServerAudio = useCallback(
    async (audioPath, fallbackText, onEnd) => {
      if (!audioPath) {
        speakBrowser(fallbackText, onEnd);
        return;
      }

      try {
        const audioUrl =
          /^https?:\/\//i.test(audioPath)
            ? audioPath
            : `${API_BASE_URL}${audioPath}`;

        const audio = new Audio(audioUrl);

        speakingRef.current = true;

        setStatus("SPEAKING");

        audio.onended = () => {
          speakingRef.current = false;
          onEnd?.();
        };

        audio.onerror = () => {
          speakingRef.current = false;
          speakBrowser(fallbackText, onEnd);
        };

        await audio.play();
      } catch {
        speakingRef.current = false;
        speakBrowser(fallbackText, onEnd);
      }
    },
    [speakBrowser]
  );

  const beginListening = useCallback(
    (mode = "wake") => {
      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError(
          "Speech recognition is unavailable. Use Chrome or Edge."
        );

        setStatus("ERROR");

        return;
      }

      if (
        !activeRef.current ||
        speakingRef.current
      ) {
        return;
      }

      stopRecognition();

      setError("");

      recognitionModeRef.current = mode;

      const recognition =
        new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.lang =
        mode === "wake"
          ? "en-IN"
          : languageCode;

     recognition.onstart = () => {
  if (
    !mountedRef.current ||
    !activeRef.current
  ) {
    return;
  }

  setStatus(
    mode === "wake"
      ? "AWAITING WAKE"
      : "LISTENING"
  );

  addLog(
    mode === "wake"
      ? 'LISTENING FOR "ARISE"...'
      : "LISTENING FOR COMMAND..."
  );

  addLog("🎤 AUDIO CAPTURE STARTED");
};

recognition.onaudiostart = () => {
  addLog("🎤 AUDIO STREAM STARTED");
};

recognition.onsoundstart = () => {
  addLog("🔊 SOUND DETECTED");
};

recognition.onspeechstart = () => {
  addLog("🗣️ SPEECH DETECTED");
};

recognition.onspeechend = () => {
  addLog("🗣️ SPEECH ENDED");
};

recognition.onsoundend = () => {
  addLog("🔇 SOUND ENDED");
};

recognition.onaudioend = () => {
  addLog("🎤 AUDIO CAPTURE ENDED");
};

recognition.onnomatch = () => {
  addLog("⚠️ SPEECH NOT RECOGNIZED");
};

recognition.onresult = (event) => {
  let finalText = "";
  let interimText = "";

  for (
    let i = event.resultIndex;
    i < event.results.length;
    i += 1
  ) {
    const chunk =
      event.results[i][0]?.transcript || "";

    if (event.results[i].isFinal) {
      finalText += `${chunk} `;
    } else {
      interimText += chunk;
    }
  }

  const liveText =
    `${finalText} ${interimText}`.trim();

  if (liveText) {
    setTranscript(liveText);

    addLog(
      `🎧 HEARD: "${liveText}"`
    );
  }

  if (!finalText.trim()) {
    return;
  }

  addLog(
    `✅ FINAL: "${finalText.trim()}"`
  );

  handleRecognizedSpeechRef.current?.(
    finalText.trim(),
    mode
  );
};
      recognition.onerror = (event) => {
        if (!mountedRef.current) {
          return;
        }

        if (event.error === "aborted") {
          return;
        }

        if (event.error === "not-allowed") {
          setError(
            "Microphone permission was denied. Allow microphone access and try again."
          );
        } else if (
          event.error === "audio-capture"
        ) {
          setError(
            "No microphone was detected. Check your Windows/browser microphone settings."
          );
        } else if (
          event.error !== "no-speech"
        ) {
          setError(
            `Voice engine error: ${event.error}`
          );
        }

        if (
          activeRef.current &&
          !speakingRef.current
        ) {
          setStatus(
            mode === "wake"
              ? "AWAITING WAKE"
              : "STANDBY"
          );
        }
      };

      recognition.onend = () => {
        if (
          recognitionRef.current ===
          recognition
        ) {
          recognitionRef.current = null;
        }

        if (
          !mountedRef.current ||
          !activeRef.current ||
          speakingRef.current
        ) {
          return;
        }

        restartTimerRef.current = window.setTimeout(
  () => beginListeningRef.current?.(mode),
  250
);
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch {
        recognitionRef.current = null;

        if (activeRef.current) {
          restartTimerRef.current = window.setTimeout(
  () => beginListeningRef.current?.(mode),
  300
);
        }
      }
    },
    [
      addLog,
      languageCode,
      stopRecognition,
    ]
  );

  const sendQuestion = useCallback(
    async (question) => {
      const requestId =
        ++requestIdRef.current;

      setStatus("THINKING");

      addLog(
        "COMMAND RECEIVED — ANALYZING..."
      );

      setError("");

      try {
       const response = await fetch(
  `${API_BASE_URL}/api/ask`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
  question,
  name,
  language,
}),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data =
          await response.json();

        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        const reply = String(
          data.answer ||
            data.response ||
            data.reply ||
            ""
        ).trim();

        const english = String(data.answer || "").trim();
        if (!reply) {
          throw new Error(
            "The server returned an empty answer."
          );
        }

        setIgrisReply(reply);

        setEnglishText(english);

        setStatus("SPEAKING");

        addLog(
          "RESPONSE READY — IGRIS SPEAKING..."
        );

        const finish = () => {
          if (
            !mountedRef.current ||
            !activeRef.current
          ) {
            return;
          }

          setStatus("LISTENING");

          setTranscript("");

          addLog(
            'READY — SAY "ARISE" OR SPEAK A COMMAND...'
          );

          window.setTimeout(
  () => beginListeningRef.current?.("question"),
  250
);
        };

        if (data.audio) {
          await playServerAudio(
            data.audio,
            reply,
            finish
          );
        } else {
          speakBrowser(reply, finish);
        }
      } catch (err) {
        console.error(
          "IGRIS API ERROR:",
          err
        );

        if (!mountedRef.current) {
          return;
        }

        setError(
          "Igris could not reach the core server."
        );

        setIgrisReply(
          "Unable to connect to my core server."
        );

        setStatus("ERROR");

        addLog(
          "CORE CONNECTION ERROR"
        );

        if (activeRef.current) {
          window.setTimeout(() => {
            if (activeRef.current) {
              beginListeningRef.current?.("question");
            }
          }, 1200);
        }
      }
    },
    [
      addLog,
      beginListeningRef,
      language,
      name,
      playServerAudio,
      speakBrowser,
    ]
  );

  const deactivateIgris = useCallback(() => {
    activeRef.current = false;

    setIsActive(false);

    stopRecognition();

    stopSpeech();

    if (restartTimerRef.current) {
      window.clearTimeout(
        restartTimerRef.current
      );
    }

    setTranscript("");

    setStatus("STANDBY");

    addLog("IGRIS STANDING BY");
  }, [
    addLog,
    stopRecognition,
    stopSpeech,
  ]);

  const handleRecognizedSpeech =
    useCallback(
      (text, mode) => {
        const normalized = text
          .toLowerCase()
          .replace(/[.,!?]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        setTranscript(text);

        if (mode === "wake") {
          const woke =
            WAKE_WORDS.some((phrase) =>
              normalized.includes(phrase)
            );

          if (!woke) {
            addLog(
              'WAKE WORD NOT DETECTED — LISTENING...'
            );

            return;
          }

          stopRecognition();

          setStatus("ONLINE");

          addLog(
            "WAKE WORD ACCEPTED — IGRIS ONLINE"
          );

          speakBrowser(
            ACKNOWLEDGEMENTS[language] ||
              ACKNOWLEDGEMENTS.English,
            () => {
              if (activeRef.current) {
                setTranscript("");

                beginListeningRef.current?.("question");
              }
            }
          );

          return;
        }

        const stopCommands = [
          "igris rest",
          "igris standby",
          "igris stop",
          "igris sleep",
          "igres rest",
          "egress rest",
        ];

        if (
          stopCommands.some(
            (command) =>
              normalized === command ||
              normalized.includes(command)
          )
        ) {
          deactivateIgris();
          return;
        }

        stopRecognition();

        sendQuestion(text);
      },
      [
        addLog,
        beginListeningRef,
        deactivateIgris,
        language,
        sendQuestion,
        speakBrowser,
        stopRecognition,
      ]
    );

  useEffect(() => {
    handleRecognizedSpeechRef.current =
      handleRecognizedSpeech;
  }, [handleRecognizedSpeech]);

  useEffect(() => {
  beginListeningRef.current =
    beginListening;
}, [beginListening]);

  const activateIgris = useCallback(async () => {
  if (screen !== "DASHBOARD") {
    return;
  }

  setError("");

  if (!navigator.mediaDevices?.getUserMedia) {
    setError(
      "Microphone access is unavailable in this browser."
    );

    setStatus("ERROR");

    return;
  }

  try {
    const existingStream =
      microphoneStreamRef.current;

    if (
      !existingStream ||
      existingStream
        .getAudioTracks()
        .every((track) => track.readyState === "ended")
    ) {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      microphoneStreamRef.current = stream;
    }

    setIsActive(true);

    activeRef.current = true;

    setTranscript("");

    setIgrisReply("");

    setStatus("AWAITING WAKE");

    addLog(
      'IGRIS ACTIVE — SAY "ARISE"'
    );

    beginListeningRef.current?.("wake");
  } catch (error) {
    console.error(
      "Microphone activation failed:",
      error
    );

    activeRef.current = false;

    setIsActive(false);

    setStatus("ERROR");

    if (error?.name === "NotAllowedError") {
      setError(
        "Microphone permission was denied. Allow microphone access and try again."
      );
    } else if (
      error?.name === "NotFoundError"
    ) {
      setError(
        "No microphone was detected. Connect a microphone and try again."
      );
    } else {
      setError(
        "Unable to access the microphone. Check your browser and microphone settings."
      );
    }
  }
}, [
  addLog,
  beginListeningRef,
  screen,
]);

  const initializeIGRIS = () => {
    const cleanName =
      name.trim();

    if (!cleanName) {
      setError(
        "Enter your user name before initializing Igris."
      );

      return;
    }

    const userData = {
      name: cleanName,
      language,
    };

    localStorage.setItem(
      "IGRISUser",
      JSON.stringify(userData)
    );

    stopRecognition();

    stopSpeech();

    activeRef.current = false;

    setIsActive(false);

    setStatus("BOOTING");

    setScreen("BOOT");

    setBootProgress(0);

    setBootMessage(
      "INITIALIZING CORE..."
    );

    setError("");

    let step = 0;

    bootTimerRef.current =
      window.setInterval(() => {
        step += 1;

        const progress = Math.min(
          100,
          Math.round(
            (step /
              BOOT_STEPS.length) *
              100
          )
        );

        setBootProgress(progress);

        setBootMessage(
          progress === 100
            ? "IGRIS ONLINE"
            : BOOT_STEPS[
                step - 1
              ]
        );

        if (progress === 100) {
          window.clearInterval(
            bootTimerRef.current
          );

          bootTimerRef.current =
            null;

          window.setTimeout(() => {
            if (
              !mountedRef.current
            ) {
              return;
            }

            setScreen("DASHBOARD");

            setStatus("STANDBY");

            addLog(
              "SYSTEM READY — AWAITING OPERATOR"
            );
          }, 650);
        }
      }, 420);
  };

  const resetUser = () => {
    deactivateIgris();

    localStorage.removeItem(
      "IGRISUser"
    );

    setName("");

    setLanguage("Telugu");

    setTranscript("");

    setEnglishText("");

    setIgrisReply("");

    setError("");

    setScreen("SETUP");

    setStatus("SETUP");
  };

  useEffect(() => {
    mountedRef.current = true;

    if (
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      mountedRef.current = false;

      activeRef.current = false;

      if (bootTimerRef.current) {
        window.clearInterval(
          bootTimerRef.current
        );
      }

      if (restartTimerRef.current) {
        window.clearTimeout(
          restartTimerRef.current
        );
      }

      stopRecognition();

      stopSpeech();
    };
  }, [
    stopRecognition,
    stopSpeech,
  ]);

  /*
   * ================================
   * SETUP SCREEN
   * ================================
   */

  if (screen === "SETUP") {
    return (
      <main className="igris-app setup-screen">

        <div className="ambient-grid" />

        <div className="scan-line" />

        <section className="setup-card">

          <div className="setup-content">

            <div className="eyebrow">
              IGRIS AI OPERATING SYSTEM
            </div>

            <h1>IGRIS</h1>

            <p className="setup-subtitle">
              INITIAL SYSTEM BOOT SEQUENCE
            </p>

            <div className="boot-lines">

              <span>
                ✓ REACTOR ONLINE
              </span>

              <span>
                ✓ NEURAL CORE STABLE
              </span>

              <span>
                ✓ QUANTUM MEMORY LOADED
              </span>

              <span className="active-line">
                ► AWAITING USER AUTHENTICATION...
              </span>

            </div>

            <div className="setup-form">

              <label htmlFor="igris-name">
                USER IDENTIFICATION
              </label>

              <input
                id="igris-name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    initializeIGRIS();
                  }
                }}
                placeholder="ENTER YOUR CODENAME..."
                autoComplete="name"
              />

              <label htmlFor="igris-language">
                LANGUAGE PROTOCOL
              </label>

              <select
                id="igris-language"
                value={language}
                onChange={(event) =>
                  setLanguage(
                    event.target.value
                  )
                }
              >

                {Object.entries(
                  LANGUAGE_CONFIG
                ).map(
                  ([key, value]) => (
                    <option
                      key={key}
                      value={key}
                    >
                      {value.native}
                    </option>
                  )
                )}

              </select>

              {error && (
                <div className="setup-error">
                  {error}
                </div>
              )}

              <button
                className="initialize-btn"
                onClick={
                  initializeIGRIS
                }
              >
                INITIALIZE IGRIS
              </button>

            </div>

          </div>

          <div className="setup-visual">

            <div className="reactor setup-reactor">

              <div className="reactor-aura" />

              <div className="reactor-ring ring-one" />

              <div className="reactor-ring ring-two" />

              <div className="reactor-ring ring-three" />

              <div className="reactor-core" />

              <i className="orbit-dot dot-top" />
              <i className="orbit-dot dot-right" />
              <i className="orbit-dot dot-bottom" />
              <i className="orbit-dot dot-left" />

            </div>

            <h2>
              IGRIS NEURAL CORE
            </h2>

            <p>
              Awaiting Authorized Operator...
            </p>

          </div>

        </section>

      </main>
    );
  }

  /*
   * ================================
   * BOOT SCREEN
   * ================================
   */

  if (screen === "BOOT") {
    return (
      <main className="igris-app boot-screen">

        <div className="ambient-grid" />

        <section className="boot-card">

          <div className="boot-reactor reactor">

            <div className="reactor-aura" />

            <div className="reactor-ring ring-one" />

            <div className="reactor-ring ring-two" />

            <div className="reactor-ring ring-three" />

            <div className="reactor-core" />

          </div>

          <div className="boot-label">
            IGRIS SYSTEM INITIALIZATION
          </div>

          <h1>
            {bootProgress}%
          </h1>

          <p>
            {bootMessage}
          </p>

          <div className="progress-track">

            <span
              style={{
                width: `${bootProgress}%`,
              }}
            />

          </div>

        </section>

      </main>
    );
  }

  /*
   * ================================
   * MAIN DASHBOARD
   * ================================
   */

  return (
    <main
      className={`igris-app dashboard ${status.toLowerCase()}`}
    >

      <header className="top-bar">

        <div className="brand-mini">
          IGRIS AI SYSTEM
        </div>

        <div className="top-status">

          <span
            className={`status-dot ${
              isActive ? "live" : ""
            }`}
          />

          {status}

        </div>

        <div className="top-language">
          {LANGUAGE_CONFIG[
            language
          ]?.native || language}
        </div>

      </header>

      <section className="dashboard-layout">

        {/* LEFT SYSTEM PANEL */}

        <aside className="system-panel glass-panel">

          <div className="panel-title">
            SYSTEM
          </div>

          <div className="info-card status-card">

            <span>
              STATUS
            </span>

            <strong>
              {status}
            </strong>

            <div className="meter">

              <i
                style={{
                  width: `${
                    isActive
                      ? 100
                      : 86
                  }%`,
                }}
              />

            </div>

          </div>

          <div className="info-card">

            <span>
              USER
            </span>

            <strong>
              {name || "UNKNOWN"}
            </strong>

          </div>

          <div className="info-card">

            <span>
              LANGUAGE
            </span>

            <strong>
              {LANGUAGE_CONFIG[
                language
              ]?.native || language}
            </strong>

          </div>

          <div className="info-card">

            <span>
              NEURAL CORE
            </span>

            <strong>
              100%
            </strong>

            <div className="meter">

              <i
                style={{
                  width: "100%",
                }}
              />

            </div>

          </div>

        </aside>

        {/* CENTER IGRIS CORE */}

        <section className="center-stage">

          <div
            className={`planet-system ${
              isActive
                ? "active"
                : ""
            }`}
          >

            <div className="planet-glow" />

            <div className="planet-ring planet-ring-a" />

            <div className="planet-ring planet-ring-b" />

            <div className="planet-ring planet-ring-c" />

            <div className="planet-orbit orbit-a">
              <i />
            </div>

            <div className="planet-orbit orbit-b">
              <i />
            </div>

            <div className="planet-core">

              <span className="planet-highlight" />

              <span className="planet-shine" />

            </div>

          </div>

          <div className="planet-status">

            {status ===
            "AWAITING WAKE"
              ? 'SAY "ARISE"'
              : status}

          </div>

          <div className="identity-block">

            <h1>
              IGRIS
            </h1>

            <p>
              ARTIFICIAL INTELLIGENCE SYSTEM
            </p>

          </div>

          <div className="command-row">

            <button
              className="igris-action primary-action"
              onClick={
                activateIgris
              }
              disabled={isActive}
            >
              {isActive
                ? "IGRIS ACTIVE"
                : "TALK TO IGRIS"}
            </button>

            <button
              className="igris-action stop-action"
              onClick={
                deactivateIgris
              }
              disabled={!isActive}
            >
              STOP IGRIS
            </button>

          </div>

          <button
            className="reset-link"
            onClick={resetUser}
          >
            RESET USER
          </button>

        </section>

        {/* RIGHT CONSOLE */}

        <aside className="console-panel glass-panel">

          <div className="console-header">

            <span>
              IGRIS CONSOLE
            </span>

            <span className="console-live">
              ● LIVE
            </span>

          </div>

          <div className="console-body">

            <div className="console-line">

              <b>
                USER &gt;
              </b>{" "}

              {transcript ||
                "Awaiting command..."}

            </div>

            <div className="console-line igris-line">

              <b>
                IGRIS &gt;
              </b>{" "}

              {systemLog}

            </div>

            {igrisReply && (
              <div className="response-card">

                <span>
                  VOICE RESPONSE
                </span>

                <p>
                  {igrisReply}
                </p>

              </div>
            )}

            {englishText && (
              <div className="response-card english-card">

                <span>
                  ENGLISH TRANSCRIPTION
                </span>

                <p>
                  {englishText}
                </p>

              </div>
            )}

          </div>

          {error && (
            <div className="console-error">
              {error}
            </div>
          )}

          <div className="console-footer">

            <span>
              WAKE WORD
            </span>

            <strong>
              ARISE
            </strong>

          </div>

        </aside>

      </section>

    </main>
  );
}

export default App;