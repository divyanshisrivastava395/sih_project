import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Keyboard,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Users,
  Droplet,
  HeartPulse,
  Home,
  MapPin,
  ArrowRight,
  Utensils,
} from 'lucide-react';
import { startSpeechCapture, isSpeechRecognitionSupported } from '../services/speechService';
import { parseResidentVoiceQuery } from '../services/geminiNluService';
import { ResidentVoiceQuery } from '../types/disaster';

interface VoiceAndTextInputSectionProps {
  userLocationName: string;
  onApplyStructuredRequirements: (reqs: {
    peopleCount: number;
    waterRequired: boolean;
    medicalRequired: boolean;
    foodRequired: boolean;
    sanitationRequired: boolean;
    safetyRequired: boolean;
  }) => void;
}

export const VoiceAndTextInputSection: React.FC<VoiceAndTextInputSectionProps> = ({
  userLocationName,
  onApplyStructuredRequirements,
}) => {
  // Input mode: 'voice' | 'text'
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  // Voice capture state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<{ stop: () => void } | null>(null);
  const [capturedSpeechText, setCapturedSpeechText] = useState<string>('');

  // Text input state
  const [textInput, setTextInput] = useState<string>('');

  // NLU Processing State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatusText, setProcessingStatusText] = useState<string>('');
  const [understoodRequest, setUnderstoodRequest] = useState<ResidentVoiceQuery | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset voice examples for immediate 1-tap testing
  const PRESET_QUERIES = [
    {
      label: 'Hindi: 6 people + water & medical',
      text: 'Mere parivaar mein 6 log hain. Humein paani aur medical facility ke saath safe jagah chahiye.',
    },
    {
      label: 'English: 4 people + food & water',
      text: 'Need a safe shelter for 4 people with drinking water and food supplies.',
    },
    {
      label: 'Hindi: Doctor & wheelchair for 2',
      text: 'Humein 2 logon ke liye doctor aur safe shelter chahiye.',
    },
  ];

  // Start / Stop Microphone Recording
  const handleToggleMic = () => {
    if (isRecording) {
      if (activeSession) activeSession.stop();
      setIsRecording(false);
      return;
    }

    setErrorMessage(null);
    setUnderstoodRequest(null);
    setCapturedSpeechText('');

    if (!isSpeechRecognitionSupported()) {
      setErrorMessage("Couldn't hear your request. You can try again or type your requirements.");
      return;
    }

    const session = startSpeechCapture(
      'hi-IN',
      (result) => {
        setCapturedSpeechText(result.transcript);
      },
      (err) => {
        setErrorMessage("Couldn't hear your request. You can try again or type your requirements.");
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    setActiveSession(session);
    setIsRecording(true);
  };

  // Send captured speech or typed text to Gemini NLU
  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) {
      setErrorMessage("Couldn't hear your request. You can try again or type your requirements.");
      return;
    }

    if (isRecording && activeSession) {
      activeSession.stop();
      setIsRecording(false);
    }

    setIsProcessing(true);
    setProcessingStatusText('Understanding your request...');
    setErrorMessage(null);

    try {
      const parsed = await parseResidentVoiceQuery(queryText, userLocationName);
      setUnderstoodRequest(parsed);
    } catch (err: any) {
      console.error('Error in request understanding:', err);
      setErrorMessage("Couldn't hear your request. You can try again or type your requirements.");
    } finally {
      setIsProcessing(false);
    }
  };

  // When speech ends and we have transcript, auto-trigger understanding
  const handleStopAndUnderstand = () => {
    if (activeSession) activeSession.stop();
    setIsRecording(false);
    if (capturedSpeechText.trim()) {
      handleProcessQuery(capturedSpeechText);
    } else {
      setErrorMessage("Couldn't hear your request. You can try again or type your requirements.");
    }
  };

  // Triggered when user clicks [ FIND SAFE PLACES ]
  const handleConfirmFindSafePlaces = () => {
    if (!understoodRequest) return;
    onApplyStructuredRequirements({
      peopleCount: understoodRequest.people || 4,
      waterRequired: Boolean(understoodRequest.water_required),
      medicalRequired: Boolean(understoodRequest.medical_required),
      foodRequired: Boolean(understoodRequest.food_required),
      sanitationRequired: Boolean(understoodRequest.sanitation_required),
      safetyRequired: true,
    });
  };

  return (
    <div className="bg-white border-2 border-emerald-300 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 select-none bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Citizen Voice & Text Intake
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">
            I Need a Safe Place
          </h3>
          <p className="text-xs text-slate-600">
            Speak or type naturally in your preferred language (Hindi, English, Bengali, etc.).
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              setInputMode('voice');
              setErrorMessage(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              inputMode === 'voice'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic size={14} className="text-emerald-600" />
            <span>🎙️ Speak</span>
          </button>

          <button
            onClick={() => {
              if (isRecording && activeSession) {
                activeSession.stop();
                setIsRecording(false);
              }
              setInputMode('text');
              setErrorMessage(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              inputMode === 'text'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard size={14} className="text-blue-600" />
            <span>⌨️ Type</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. VOICE INPUT MODE */}
      {/* ------------------------------------------------------------- */}
      {inputMode === 'voice' && (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-3 space-y-3">
            {/* Prominent Large Microphone Button */}
            <button
              onClick={isRecording ? handleStopAndUnderstand : handleToggleMic}
              disabled={isProcessing}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
                isRecording
                  ? 'bg-red-600 text-white ring-8 ring-red-200 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-6 ring-emerald-100 hover:ring-emerald-200'
              }`}
              title={isRecording ? 'Tap to finish speaking' : 'Tap to speak your request'}
            >
              {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
              <span className="text-[11px] font-extrabold uppercase mt-1">
                {isRecording ? 'Stop' : 'Tap & Speak'}
              </span>
            </button>

            {/* Status Label */}
            <div className="text-center space-y-1 max-w-md">
              {isRecording ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  <span className="text-sm font-black text-red-600 uppercase tracking-wide">
                    🔴 Listening...
                  </span>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                  <RefreshCw size={16} className="animate-spin text-emerald-600" />
                  <span>Understanding your request...</span>
                </div>
              ) : (
                <span className="text-sm font-bold text-slate-800 block">
                  🎙️ Speak your request
                </span>
              )}

              <p className="text-xs text-slate-500">
                {isRecording
                  ? 'Speak clearly: e.g. "Mere parivaar mein 6 log hain. Humein paani aur medical facility ke saath safe jagah chahiye."'
                  : 'Tap the microphone and speak your group size, water, medical or food needs.'}
              </p>
            </div>

            {/* Live Captured Speech Bubble */}
            {capturedSpeechText && (
              <div className="w-full max-w-xl bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Captured Speech:
                </span>
                <p className="font-semibold italic text-slate-900 leading-relaxed">
                  "{capturedSpeechText}"
                </p>
                {!isProcessing && !understoodRequest && (
                  <button
                    onClick={() => handleProcessQuery(capturedSpeechText)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>Understand Request</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TEXT INPUT MODE */}
      {/* ------------------------------------------------------------- */}
      {inputMode === 'text' && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-800 block">
            ⌨️ Type your request
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProcessQuery(textInput);
              }}
              placeholder="e.g. Mere parivaar mein 6 log hain. Humein paani aur medical facility ke saath safe jagah chahiye."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              onClick={() => handleProcessQuery(textInput)}
              disabled={isProcessing || !textInput.trim()}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isProcessing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              <span>Understand</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ERROR HANDLING: Standardized Error Fallback */}
      {/* ------------------------------------------------------------- */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3">
          <div className="flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{errorMessage}</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleToggleMic}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              TRY AGAIN
            </button>
            <button
              onClick={() => {
                setInputMode('text');
                setErrorMessage(null);
              }}
              className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              TYPE INSTEAD
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* UNDERSTOOD REQUEST (Structured Requirements Display) */}
      {/* ------------------------------------------------------------- */}
      {understoodRequest && (
        <div className="bg-slate-50 border-2 border-emerald-400 p-5 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                UNDERSTOOD REQUEST
              </h4>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
              Gemini NLU Verified
            </span>
          </div>

          {/* Structured Requirements Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Users size={12} className="text-blue-600" />
                People:
              </span>
              <strong className="text-sm font-bold text-slate-900 font-mono">
                {understoodRequest.people || 4}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Droplet size={12} className="text-blue-600" />
                Water:
              </span>
              <strong
                className={`text-xs font-bold ${
                  understoodRequest.water_required ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {understoodRequest.water_required ? 'Required' : 'Optional'}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <HeartPulse size={12} className="text-purple-600" />
                Medical:
              </span>
              <strong
                className={`text-xs font-bold ${
                  understoodRequest.medical_required ? 'text-purple-700' : 'text-slate-500'
                }`}
              >
                {understoodRequest.medical_required ? 'Required' : 'Optional'}
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Home size={12} className="text-emerald-600" />
                Purpose:
              </span>
              <strong className="text-xs font-bold text-slate-900">
                Safe Relocation
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                <MapPin size={12} className="text-red-600" />
                Location:
              </span>
              <strong className="text-xs font-bold text-slate-900 truncate block" title={userLocationName}>
                Current Location
              </strong>
            </div>
          </div>

          {/* Action Button: [ FIND SAFE PLACES ] */}
          <button
            onClick={handleConfirmFindSafePlaces}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition active:scale-[0.99] cursor-pointer"
          >
            <span>FIND SAFE PLACES</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Quick 1-Click Preset Scenario Buttons for Testing */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Speech & Text Examples:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCapturedSpeechText(preset.text);
                setTextInput(preset.text);
                handleProcessQuery(preset.text);
              }}
              className="text-left px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <span className="font-bold text-slate-900 mr-1.5">{preset.label}:</span>
              <span className="text-slate-500 italic">"{preset.text}"</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
