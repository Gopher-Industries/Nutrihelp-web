import {
  applyVoiceSettings,
  DEFAULT_VOICE_SETTINGS,
  getVoiceSettings,
  hasSpeechSynthesisSupport,
  saveVoiceSettings,
  VOICE_SETTINGS_CHANGED_EVENT,
  VOICE_SETTINGS_STORAGE_KEY,
} from "./voiceSettingsManager";

const setWindowProp = (key, value) => {
  Object.defineProperty(window, key, {
    configurable: true,
    writable: true,
    value,
  });
};

describe("voiceSettingsManager", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    setWindowProp("speechSynthesis", undefined);
    setWindowProp("SpeechSynthesisUtterance", undefined);
  });

  it("returns default settings when storage is empty", () => {
    expect(getVoiceSettings()).toEqual(DEFAULT_VOICE_SETTINGS);
  });

  it("normalizes and persists settings, and emits runtime event", () => {
    const onSettingsChanged = jest.fn();
    window.addEventListener(VOICE_SETTINGS_CHANGED_EVENT, onSettingsChanged);

    const result = saveVoiceSettings({
      enabled: 1,
      volume: 2.4,
      rate: -0.5,
      pitch: 9,
      autoPlay: "yes",
      voice: "",
    });

    expect(result).toEqual({
      enabled: true,
      volume: 1,
      rate: 0.5,
      pitch: 2,
      autoPlay: true,
      voice: "default",
    });

    expect(
      JSON.parse(localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY))
    ).toEqual(result);
    expect(onSettingsChanged).toHaveBeenCalledTimes(1);
  });

  it("applies runtime settings and selected voice", () => {
    const utterance = {};
    const voices = [{ voiceURI: "en-US-voice", name: "English Voice" }];

    const applied = applyVoiceSettings(
      utterance,
      {
        enabled: true,
        volume: 0.4,
        rate: 1.3,
        pitch: 0.9,
        voice: "en-US-voice",
      },
      voices
    );

    expect(applied).toBe(true);
    expect(utterance.volume).toBe(0.4);
    expect(utterance.rate).toBe(1.3);
    expect(utterance.pitch).toBe(0.9);
    expect(utterance.voice).toBe(voices[0]);
  });

  it("returns false when TTS is disabled", () => {
    const utterance = {};
    const applied = applyVoiceSettings(utterance, { enabled: false });
    expect(applied).toBe(false);
  });

  it("detects browser support correctly", () => {
    expect(hasSpeechSynthesisSupport()).toBe(false);

    setWindowProp("speechSynthesis", {});
    setWindowProp("SpeechSynthesisUtterance", function MockUtterance() {});
    expect(hasSpeechSynthesisSupport()).toBe(true);
  });
});
