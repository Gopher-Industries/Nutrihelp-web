// Voice Settings Manager
// Centralized Text-to-Speech settings/runtime helpers.

export const VOICE_SETTINGS_STORAGE_KEY = "voiceSettings";
export const VOICE_SETTINGS_CHANGED_EVENT = "voiceSettingsChanged";

export const DEFAULT_VOICE_SETTINGS = Object.freeze({
  enabled: true,
  volume: 0.8,
  rate: 1.0,
  pitch: 1.0,
  autoPlay: false,
  voice: "default",
});

const clamp = (value, min, max) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

export const hasSpeechSynthesisSupport = () => {
  if (typeof window === "undefined") return false;
  return Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
};

export const sanitizeVoiceSettings = (settings = {}) => {
  const merged = { ...DEFAULT_VOICE_SETTINGS, ...(settings || {}) };

  return {
    enabled: Boolean(merged.enabled),
    volume: clamp(Number(merged.volume), 0, 1),
    rate: clamp(Number(merged.rate), 0.5, 2),
    pitch: clamp(Number(merged.pitch), 0.5, 2),
    autoPlay: Boolean(merged.autoPlay),
    voice:
      typeof merged.voice === "string" && merged.voice.trim().length > 0
        ? merged.voice
        : "default",
  };
};

/**
 * Get voice settings from localStorage with defaults.
 */
export const getVoiceSettings = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return { ...DEFAULT_VOICE_SETTINGS };
  }

  try {
    const saved = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (!saved) return { ...DEFAULT_VOICE_SETTINGS };
    return sanitizeVoiceSettings(JSON.parse(saved));
  } catch (error) {
    console.error("Error loading voice settings:", error);
    return { ...DEFAULT_VOICE_SETTINGS };
  }
};

/**
 * Save voice settings to localStorage and dispatch custom event.
 */
export const saveVoiceSettings = (settings) => {
  const normalizedSettings = sanitizeVoiceSettings(settings);

  if (typeof window === "undefined" || !window.localStorage) {
    return normalizedSettings;
  }

  try {
    localStorage.setItem(
      VOICE_SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizedSettings)
    );

    window.dispatchEvent(
      new CustomEvent(VOICE_SETTINGS_CHANGED_EVENT, {
        detail: normalizedSettings,
      })
    );
  } catch (error) {
    console.error("Error saving voice settings:", error);
  }

  return normalizedSettings;
};

/**
 * Resolve selected voice from current browser voices list.
 * `voice` setting stores SpeechSynthesisVoice.voiceURI.
 */
export const resolveSelectedVoice = (voices = [], voiceSetting = "default") => {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  if (!voiceSetting || voiceSetting === "default") return null;

  return (
    voices.find((voice) => voice.voiceURI === voiceSetting) ||
    voices.find((voice) => voice.name === voiceSetting) ||
    null
  );
};

/**
 * Apply voice settings to a SpeechSynthesisUtterance.
 */
export const applyVoiceSettings = (
  utterance,
  settings = null,
  availableVoices = []
) => {
  if (!utterance) return false;

  const voiceSettings = sanitizeVoiceSettings(settings || getVoiceSettings());
  if (!voiceSettings.enabled) return false;

  utterance.volume = voiceSettings.volume;
  utterance.rate = voiceSettings.rate;
  utterance.pitch = voiceSettings.pitch;

  const selectedVoice = resolveSelectedVoice(
    availableVoices,
    voiceSettings.voice
  );
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  return true;
};

/**
 * Test voice settings by speaking a sample sentence.
 */
export const testVoiceSettings = (settings, availableVoices = []) => {
  if (!hasSpeechSynthesisSupport()) return false;

  const normalized = sanitizeVoiceSettings(settings);
  if (!normalized.enabled) return false;

  const utterance = new window.SpeechSynthesisUtterance(
    "This is a test of your voice settings. You can adjust volume, speed, and pitch to your preference."
  );

  const voicesToUse =
    availableVoices.length > 0
      ? availableVoices
      : window.speechSynthesis.getVoices();

  if (!applyVoiceSettings(utterance, normalized, voicesToUse)) {
    return false;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
};
