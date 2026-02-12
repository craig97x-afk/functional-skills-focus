"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type A11ySettings = {
  position: "left" | "right" | "hidden";
  size: "normal" | "large";
  language: string;
  needs: {
    motor: boolean;
    colorBlind: boolean;
    vision: boolean;
    cognitive: boolean;
    epileptic: boolean;
    adhd: boolean;
  };
  visual: {
    contrast: number;
    saturation: number;
    highlightLinks: boolean;
  };
  content: {
    textScale: number;
    textAlign: "left" | "center" | "right" | "justify";
    letterSpacing: number;
    lineSpacing: number;
    readableFont: boolean;
  };
  reading: {
    textToSpeech: boolean;
    muteSound: boolean;
    hideImages: boolean;
    stopAnimations: boolean;
    readerView: boolean;
    pageStructure: boolean;
  };
};

const STORAGE_KEY = "fsf-a11y";

const defaultSettings: A11ySettings = {
  position: "right",
  size: "normal",
  language: "en",
  needs: {
    motor: false,
    colorBlind: false,
    vision: false,
    cognitive: false,
    epileptic: false,
    adhd: false,
  },
  visual: {
    contrast: 1,
    saturation: 1,
    highlightLinks: false,
  },
  content: {
    textScale: 1,
    textAlign: "left",
    letterSpacing: 0,
    lineSpacing: 1.4,
    readableFont: false,
  },
  reading: {
    textToSpeech: false,
    muteSound: false,
    hideImages: false,
    stopAnimations: false,
    readerView: false,
    pageStructure: false,
  },
};

const languageOptions = [
  { value: "en", label: "English" },
  { value: "cy", label: "Welsh" },
  { value: "pl", label: "Polish" },
  { value: "ur", label: "Urdu" },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const mergeSettings = (
  base: A11ySettings,
  override: Partial<A11ySettings>
): A11ySettings => ({
  ...base,
  ...override,
  needs: { ...base.needs, ...override.needs },
  visual: { ...base.visual, ...override.visual },
  content: { ...base.content, ...override.content },
  reading: { ...base.reading, ...override.reading },
});

const applyPresets = (settings: A11ySettings): A11ySettings => {
  const next = mergeSettings(settings, {});

  if (settings.needs.vision) {
    next.content.textScale = Math.max(next.content.textScale, 1.15);
    next.content.lineSpacing = Math.max(next.content.lineSpacing, 1.5);
    next.visual.contrast = Math.max(next.visual.contrast, 1.1);
  }

  if (settings.needs.motor) {
    next.content.textScale = Math.max(next.content.textScale, 1.05);
  }

  if (settings.needs.colorBlind) {
    next.visual.contrast = Math.max(next.visual.contrast, 1.05);
    next.visual.highlightLinks = true;
  }

  if (settings.needs.cognitive) {
    next.reading.readerView = true;
  }

  if (settings.needs.adhd) {
    next.reading.stopAnimations = true;
    next.visual.highlightLinks = true;
  }

  if (settings.needs.epileptic) {
    next.reading.stopAnimations = true;
  }

  next.visual.contrast = clamp(next.visual.contrast, 0.9, 1.4);
  next.visual.saturation = clamp(next.visual.saturation, 0.8, 1.3);
  next.content.textScale = clamp(next.content.textScale, 1, 1.3);
  next.content.letterSpacing = clamp(next.content.letterSpacing, 0, 0.08);
  next.content.lineSpacing = clamp(next.content.lineSpacing, 1.2, 1.8);

  return next;
};

const applySettings = (settings: A11ySettings) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const body = document.body;

  root.style.setProperty("--a11y-text-scale", String(settings.content.textScale));
  root.style.setProperty(
    "--a11y-letter-spacing",
    `${settings.content.letterSpacing}em`
  );
  root.style.setProperty("--a11y-line-height", String(settings.content.lineSpacing));
  root.style.setProperty("--a11y-contrast", String(settings.visual.contrast));
  root.style.setProperty("--a11y-saturation", String(settings.visual.saturation));

  body.dataset.a11yHighlightLinks = String(settings.visual.highlightLinks);
  body.dataset.a11yHideImages = String(settings.reading.hideImages);
  body.dataset.a11yStopAnimations = String(settings.reading.stopAnimations);
  body.dataset.a11yReaderView = String(settings.reading.readerView);
  body.dataset.a11yPageStructure = String(settings.reading.pageStructure);
  body.dataset.a11yReadableFont = String(settings.content.readableFont);
  body.dataset.a11yTextAlign = settings.content.textAlign;
  body.dataset.a11yWidgetSize = settings.size;
  body.dataset.a11yWidgetPosition = settings.position;
  body.dataset.a11yMotor = String(settings.needs.motor);
  body.dataset.a11yFocus = String(settings.needs.cognitive);
  body.dataset.a11yAdhd = String(settings.needs.adhd);
  body.dataset.a11yColorBlind = String(settings.needs.colorBlind);

  root.lang = settings.language || "en";
};

export default function AccessibilityWidget() {
  const [settings, setSettings] = useState<A11ySettings>(defaultSettings);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceCount, setVoiceCount] = useState(0);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<string | null>(null);
  const cancelSpeakRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<A11ySettings>;
        setSettings(mergeSettings(defaultSettings, parsed));
      }
    } catch {
      setSettings(defaultSettings);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
      setVoiceCount(voicesRef.current.length);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const appliedSettings = useMemo(() => applyPresets(settings), [settings]);

  useEffect(() => {
    applySettings(appliedSettings);

    if (mounted) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [appliedSettings, settings, mounted]);

  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleHotkey);
    return () => window.removeEventListener("keydown", handleHotkey);
  }, []);

  useEffect(() => {
    const media = document.querySelectorAll("video, audio");
    media.forEach((element) => {
      const item = element as HTMLMediaElement;
      if (appliedSettings.reading.muteSound) {
        item.muted = true;
        item.volume = 0;
      } else {
        item.muted = false;
      }
    });
  }, [appliedSettings.reading.muteSound]);

  useEffect(() => {
    if (!appliedSettings.reading.textToSpeech && typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
      cancelSpeakRef.current = true;
      setIsSpeaking(false);
      setTtsError(null);
      setTtsStatus(null);
    }
  }, [appliedSettings.reading.textToSpeech]);

  const updateSettings = (patch: Partial<A11ySettings>) => {
    setSettings((prev) => mergeSettings(prev, patch));
  };

  const toggleNeed = (key: keyof A11ySettings["needs"]) => {
    updateSettings({
      needs: { ...settings.needs, [key]: !settings.needs[key] },
    });
  };

  const toggleReading = (key: keyof A11ySettings["reading"]) => {
    updateSettings({
      reading: { ...settings.reading, [key]: !settings.reading[key] },
    });
  };

  const toggleVisual = (key: keyof A11ySettings["visual"]) => {
    updateSettings({
      visual: { ...settings.visual, [key]: !settings.visual[key] },
    });
  };

  const toggleContent = (key: keyof A11ySettings["content"]) => {
    updateSettings({
      content: { ...settings.content, [key]: !settings.content[key] },
    });
  };

  const speakPage = () => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) {
      setTtsError("Text‑to‑speech isn’t available in this browser.");
      setTtsStatus("Unavailable");
      return;
    }

    const main = document.querySelector("main");
    const rawContent = (main?.textContent || document.body.textContent || "").trim();
    const content = rawContent.replace(/\s+/g, " ").trim();
    if (!content) {
      setTtsError("No readable text found on this page.");
      setTtsStatus("No text");
      return;
    }

    const getVoices = () => {
      if (voicesRef.current.length > 0) return voicesRef.current;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
      }
      return voices;
    };

    const maxChunk = 700;
    const chunks: string[] = [];
    const maxChars = 6000;
    const limited = content.slice(0, maxChars);
    for (let i = 0; i < limited.length; i += maxChunk) {
      chunks.push(limited.slice(i, i + maxChunk));
    }

    let index = 0;
    cancelSpeakRef.current = false;

    const voices = getVoices();
    setVoiceCount(voices.length);
    setTtsError(null);
    setTtsStatus("Starting…");
    if (voices.length === 0) {
      setTtsError(
        "No voices available. Check device speech settings or install a voice."
      );
      setTtsStatus("No voices");
      return;
    }
    const preferredLang = appliedSettings.language || "en";
    const voiceMatch =
      voices.find((voice) => voice.lang?.toLowerCase().startsWith(preferredLang)) ||
      voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ||
      voices[0];

    const speakNext = () => {
      if (cancelSpeakRef.current) return;
      if (index >= chunks.length) {
        setIsSpeaking(false);
        setTtsStatus("Done");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = preferredLang;
      if (voiceMatch) utterance.voice = voiceMatch;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setTtsStatus("Speaking");
      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setTtsStatus("Error");
      };
      window.speechSynthesis.speak(utterance);
    };

    const start = () => {
      if (cancelSpeakRef.current) return;
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        setTimeout(start, 200);
        return;
      }
      setIsSpeaking(true);
      setTimeout(() => {
        speakNext();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        setTimeout(() => {
          if (!window.speechSynthesis.speaking) {
            setTtsStatus("Retrying…");
            window.speechSynthesis.cancel();
            setTimeout(speakNext, 150);
          }
        }, 800);
      }, 250);
    };

    start();
  };

  const speakTest = () => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) {
      setTtsError("Text‑to‑speech isn’t available in this browser.");
      setTtsStatus("Unavailable");
      return;
    }
    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    setVoiceCount(voices.length);
    setTtsError(null);
    setTtsStatus("Starting…");
    if (voices.length === 0) {
      setTtsError(
        "No voices available. Check device speech settings or install a voice."
      );
      setTtsStatus("No voices");
      return;
    }
    window.speechSynthesis.cancel();
    const voiceMatch =
      voices.find((voice) =>
        voice.lang?.toLowerCase().startsWith(appliedSettings.language || "en")
      ) || voices[0];
    const utterance = new SpeechSynthesisUtterance(
      "Accessibility speech test."
    );
    utterance.lang = appliedSettings.language || "en";
    if (voiceMatch) utterance.voice = voiceMatch;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setTtsStatus("Speaking");
    utterance.onend = () => {
      setIsSpeaking(false);
      setTtsStatus("Done");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setTtsStatus("Error");
    };
    const start = () => {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        setTimeout(start, 200);
        return;
      }
      setIsSpeaking(true);
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 200);
    };
    start();
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined") return;
    cancelSpeakRef.current = true;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const resetDefaults = () => {
    setSettings(defaultSettings);
  };

  if (settings.position === "hidden" && !open) {
    return null;
  }

  const sideClass = settings.position === "left" ? "left-6" : "right-6";
  const optionClass = (active: boolean) =>
    `a11y-option ${active ? "a11y-option-active" : ""}`;

  return (
    <div
      className={`a11y-widget ${sideClass}`}
      style={{ position: "fixed", top: "50%", transform: "translateY(-50%)" }}
    >
      {!open ? (
        <button
          type="button"
          aria-label="Open accessibility menu"
          className="a11y-fab"
          onClick={() => setOpen(true)}
        >
          <span className="a11y-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" focusable="false">
              <path
                d="M12 4.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm-7 6.75a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.54.72l-3.46 1.05v6.98a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-4.5h-1.5v4.5a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1-.75-.75v-6.98l-3.46-1.05a.75.75 0 0 1-.54-.72v-.5Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="sr-only">Accessibility</span>
        </button>
      ) : (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility menu">
          <div className="a11y-panel-header">
            <div>
              <div className="a11y-panel-title">Accessibility</div>
              <div className="a11y-panel-subtitle">Press Alt + A to toggle</div>
            </div>
            <button
              type="button"
              className="a11y-close"
              aria-label="Close accessibility menu"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">Widget size</div>
            <div className="a11y-option-row">
              <button
                type="button"
                className={optionClass(settings.size === "normal")}
                onClick={() => updateSettings({ size: "normal" })}
              >
                Normal
              </button>
              <button
                type="button"
                className={optionClass(settings.size === "large")}
                onClick={() => updateSettings({ size: "large" })}
              >
                Large
              </button>
            </div>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">Widget position</div>
            <div className="a11y-option-row">
              <button
                type="button"
                className={optionClass(settings.position === "left")}
                onClick={() => updateSettings({ position: "left" })}
              >
                Left
              </button>
              <button
                type="button"
                className={optionClass(settings.position === "right")}
                onClick={() => updateSettings({ position: "right" })}
              >
                Right
              </button>
              <button
                type="button"
                className={optionClass(settings.position === "hidden")}
                onClick={() => updateSettings({ position: "hidden" })}
              >
                Hide
              </button>
            </div>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">Language</div>
            <select
              className="a11y-select"
              value={settings.language}
              onChange={(event) => updateSettings({ language: event.target.value })}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">Access needs</div>
            <div className="a11y-option-row">
              <button
                type="button"
                className={optionClass(settings.needs.motor)}
                onClick={() => toggleNeed("motor")}
              >
                Motor impairment
              </button>
              <button
                type="button"
                className={optionClass(settings.needs.colorBlind)}
                onClick={() => toggleNeed("colorBlind")}
              >
                Colour blindness
              </button>
              <button
                type="button"
                className={optionClass(settings.needs.vision)}
                onClick={() => toggleNeed("vision")}
              >
                Vision impairment
              </button>
              <button
                type="button"
                className={optionClass(settings.needs.cognitive)}
                onClick={() => toggleNeed("cognitive")}
              >
                Cognitive focus
              </button>
              <button
                type="button"
                className={optionClass(settings.needs.epileptic)}
                onClick={() => toggleNeed("epileptic")}
              >
                Epileptic safe
              </button>
              <button
                type="button"
                className={optionClass(settings.needs.adhd)}
                onClick={() => toggleNeed("adhd")}
              >
                ADHD friendly
              </button>
            </div>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">Visual settings</div>
            <div className="a11y-field">
              <label htmlFor="a11y-contrast">Contrast</label>
              <select
                id="a11y-contrast"
                className="a11y-select"
                value={settings.visual.contrast}
                onChange={(event) =>
                  updateSettings({
                    visual: {
                      ...settings.visual,
                      contrast: Number(event.target.value),
                    },
                  })
                }
              >
                <option value={1}>Normal</option>
                <option value={1.1}>High</option>
                <option value={1.2}>Higher</option>
                <option value={1.3}>Max</option>
              </select>
            </div>
            <div className="a11y-field">
              <label htmlFor="a11y-saturation">Saturation</label>
              <select
                id="a11y-saturation"
                className="a11y-select"
                value={settings.visual.saturation}
                onChange={(event) =>
                  updateSettings({
                    visual: {
                      ...settings.visual,
                      saturation: Number(event.target.value),
                    },
                  })
                }
              >
                <option value={0.9}>Low</option>
                <option value={1}>Normal</option>
                <option value={1.1}>High</option>
                <option value={1.2}>Higher</option>
              </select>
            </div>
            <button
              type="button"
              className={optionClass(settings.visual.highlightLinks)}
              onClick={() => toggleVisual("highlightLinks")}
            >
              Highlight links
            </button>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">Content settings</div>
            <div className="a11y-field">
              <label htmlFor="a11y-text-size">Text size</label>
              <select
                id="a11y-text-size"
                className="a11y-select"
                value={settings.content.textScale}
                onChange={(event) =>
                  updateSettings({
                    content: {
                      ...settings.content,
                      textScale: Number(event.target.value),
                    },
                  })
                }
              >
                <option value={1}>Normal</option>
                <option value={1.1}>Large</option>
                <option value={1.2}>Extra large</option>
                <option value={1.3}>Max</option>
              </select>
            </div>
            <div className="a11y-field">
              <label htmlFor="a11y-text-align">Text alignment</label>
              <select
                id="a11y-text-align"
                className="a11y-select"
                value={settings.content.textAlign}
                onChange={(event) =>
                  updateSettings({
                    content: {
                      ...settings.content,
                      textAlign: event.target.value as A11ySettings["content"]["textAlign"],
                    },
                  })
                }
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
            <div className="a11y-field">
              <label htmlFor="a11y-letter-spacing">Letter spacing</label>
              <select
                id="a11y-letter-spacing"
                className="a11y-select"
                value={settings.content.letterSpacing}
                onChange={(event) =>
                  updateSettings({
                    content: {
                      ...settings.content,
                      letterSpacing: Number(event.target.value),
                    },
                  })
                }
              >
                <option value={0}>Normal</option>
                <option value={0.02}>Wide</option>
                <option value={0.04}>Wider</option>
                <option value={0.08}>Max</option>
              </select>
            </div>
            <div className="a11y-field">
              <label htmlFor="a11y-line-spacing">Line spacing</label>
              <select
                id="a11y-line-spacing"
                className="a11y-select"
                value={settings.content.lineSpacing}
                onChange={(event) =>
                  updateSettings({
                    content: {
                      ...settings.content,
                      lineSpacing: Number(event.target.value),
                    },
                  })
                }
              >
                <option value={1.3}>Normal</option>
                <option value={1.5}>Comfort</option>
                <option value={1.7}>Extra</option>
                <option value={1.8}>Max</option>
              </select>
            </div>
            <button
              type="button"
              className={optionClass(settings.content.readableFont)}
              onClick={() => toggleContent("readableFont")}
            >
              Readable font
            </button>
          </div>

          <div className="a11y-section">
            <div className="a11y-section-title">Reading supports</div>
            <div className="a11y-option-row">
              <button
                type="button"
                className={optionClass(settings.reading.textToSpeech)}
                onClick={() => toggleReading("textToSpeech")}
              >
                Text to speech
              </button>
              <button
                type="button"
                className={optionClass(settings.reading.muteSound)}
                onClick={() => toggleReading("muteSound")}
              >
                Mute sound
              </button>
              <button
                type="button"
                className={optionClass(settings.reading.hideImages)}
                onClick={() => toggleReading("hideImages")}
              >
                Hide images
              </button>
              <button
                type="button"
                className={optionClass(settings.reading.stopAnimations)}
                onClick={() => toggleReading("stopAnimations")}
              >
                Stop animations
              </button>
              <button
                type="button"
                className={optionClass(settings.reading.readerView)}
                onClick={() => toggleReading("readerView")}
              >
                Reader view
              </button>
              <button
                type="button"
                className={optionClass(settings.reading.pageStructure)}
                onClick={() => toggleReading("pageStructure")}
              >
                Page structure
              </button>
            </div>
            <div className="a11y-option-row">
              <button
                type="button"
                className={optionClass(settings.reading.textToSpeech && !isSpeaking)}
                onClick={speakPage}
                disabled={!settings.reading.textToSpeech}
              >
                Read page
              </button>
              <button
                type="button"
                className={optionClass(isSpeaking)}
                onClick={stopSpeaking}
                disabled={!settings.reading.textToSpeech}
              >
                Stop
              </button>
              <button
                type="button"
                className={optionClass(false)}
                onClick={speakTest}
                disabled={!settings.reading.textToSpeech}
              >
                Test voice
              </button>
            </div>
            {settings.reading.textToSpeech && (
              <div className="text-xs text-[color:var(--muted-foreground)]">
                Voices available: {voiceCount || 0}
                {ttsStatus ? ` · ${ttsStatus}` : ""}
                {ttsError ? ` · ${ttsError}` : ""}
              </div>
            )}
          </div>

          <div className="a11y-section a11y-section-footer">
            <button type="button" className="a11y-reset" onClick={resetDefaults}>
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
