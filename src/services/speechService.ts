// Native Web Speech Recognition & Speech Synthesis Service
// Provides speech capture, multi-language support, and client voice assistance

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export const SUPPORTED_VOICE_LANGUAGES = [
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'en-IN', name: 'English (India)' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)' },
  { code: 'mr-IN', name: 'मराठी (Marathi)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
  { code: 'as-IN', name: 'অসমীয়া (Assamese)' },
  { code: 'or-IN', name: 'ଓଡ଼ିଆ (Odia)' },
];

/**
 * Checks if browser supports Speech Recognition
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Starts standard browser speech recognition
 */
export function startSpeechCapture(
  langCode: string = 'hi-IN',
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (errorMsg: string) => void,
  onEnd: () => void
): { stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    onError("Couldn't hear your request. You can try again or type your requirements.");
    onEnd();
    return { stop: () => {} };
  }

  // @ts-ignore
  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = langCode;

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const text = finalTranscript || interimTranscript;
    if (text) {
      onResult({
        transcript: text,
        confidence: event.results[0] ? event.results[0][0].confidence : 0.9,
      });
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError("Couldn't hear your request. You can try again or type your requirements.");
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch (err: any) {
    console.warn('Failed to start speech recognition:', err);
    onError("Couldn't hear your request. You can try again or type your requirements.");
    onEnd();
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {}
    },
  };
}

/**
 * Text to speech audio output for citizens
 */
export function speakText(text: string, lang = 'hi-IN'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}
