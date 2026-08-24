import React, { useState, useEffect } from 'react';
import {
  startSpeechCapture,
  isSpeechRecognitionSupported,
  SUPPORTED_VOICE_LANGUAGES,
} from '../services/speechService';
import { parseResidentVoiceQuery } from '../services/geminiNluService';
import { ResidentVoiceQuery } from '../types/disaster';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  CheckCircle2,
  Globe,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Users,
  Droplet,
  HeartPulse,
  Home,
  MapPin,
  Keyboard,
} from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocationName: string;
  onApplyFilters: (query: ResidentVoiceQuery) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  userLocationName,
  onApplyFilters,
}) => {
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [transcript, setTranscript] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [extractedQuery, setExtractedQuery] = useState<ResidentVoiceQuery | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<{ stop: () => void } | null>(null);

  // Preset sample queries for quick demonstration
  const SAMPLE_UTTERANCES = [
    {
      title: 'Family of 6, Water & Medical',
      lang: 'Hindi / Hinglish',
      text: 'Mere parivaar mein 6 log hain. Humein paani aur medical facility ke saath safe jagah chahiye.',
    },
    {
      title: 'Safe Elevated Shelter',
      lang: 'English',
      text: 'Need safe elevated shelter for 4 people with drinking water, food and doctor.',
    },
    {
      title: 'Doctor & Safe Place',
      lang: 'Hindi',
      text: 'Ghar mein paani bhar gaya hai, 4 log hain, doctor aur surakshit shelter chahiye.',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      if (activeSession) activeSession.stop();
      setIsRecording(false);
      setTranscript('');
      setExtractedQuery(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleRecord = () => {
    if (isRecording) {
      if (activeSession) activeSession.stop();
      setIsRecording(false);
      if (transcript.trim()) {
        handleProcessTranscript(transcript);
      }
    } else {
      setErrorMessage(null);
      setExtractedQuery(null);
      setTranscript('');

      if (!isSpeechRecognitionSupported()) {
        setErrorMessage("Couldn't hear your request. You can try again or type your requirements.");
        return;
      }

      const session = startSpeechCapture(
        selectedLang,
        (res) => {
          setTranscript(res.transcript);
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
    }
  };

  const handleProcessTranscript = async (customText?: string) => {
    const textToProcess = customText || transcript;
    if (!textToProcess.trim()) {
      setErrorMessage("Couldn't hear your request. You can try again or type your requirements.");
      return;
    }

    if (isRecording && activeSession) {
      activeSession.stop();
      setIsRecording(false);
    }

    setIsParsing(true);
    setErrorMessage(null);

    try {
      const parsed = await parseResidentVoiceQuery(textToProcess, userLocationName);
      setExtractedQuery(parsed);
    } catch (err: any) {
      setErrorMessage("Couldn't hear your request. You can try again or type your requirements.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAndSearch = () => {
    if (extractedQuery) {
      onApplyFilters(extractedQuery);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs select-none">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Citizen Voice Request</h3>
              <p className="text-[11px] text-slate-500">
                Natural speech or text is translated into safe relocation requirements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Mode & Language Selector */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Globe size={14} className="text-blue-600" />
            <span className="font-semibold text-[11px]">Speech Language:</span>
          </div>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
          >
            {SUPPORTED_VOICE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Central Large Microphone Control */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <button
            onClick={handleToggleRecord}
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer ${
              isRecording
                ? 'bg-red-600 text-white ring-8 ring-red-100 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-6 ring-emerald-100'
            }`}
          >
            {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
            <span className="text-[10px] font-bold uppercase mt-0.5">
              {isRecording ? 'Stop' : 'Speak'}
            </span>
          </button>

          <div className="text-center">
            {isRecording ? (
              <span className="text-xs font-black text-red-600 uppercase tracking-wide block">
                🔴 Listening...
              </span>
            ) : isParsing ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                <RefreshCw size={13} className="animate-spin" />
                Understanding your request...
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-900 block">
                🎙️ Speak your request
              </span>
            )}
            <span className="text-[10px] text-slate-500 block mt-0.5">
              or type your requirements below
            </span>
          </div>
        </div>

        {/* Live / Typed Transcript */}
        <div className="space-y-1">
          <label className="text-xs text-slate-700 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Keyboard size={13} className="text-slate-500" />
              <span>Request Text:</span>
            </span>
            {transcript && (
              <button
                onClick={() => setTranscript('')}
                className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </label>
          <textarea
            rows={2}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g. Mere parivaar mein 6 log hain. Humein paani aur medical facility ke saath safe jagah chahiye."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none font-medium"
          />
        </div>

        {/* Process Transcript Button */}
        {!extractedQuery && transcript.trim() && (
          <button
            onClick={() => handleProcessTranscript()}
            disabled={isParsing}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            {isParsing ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Understanding your request...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Understand Request</span>
              </>
            )}
          </button>
        )}

        {/* Error Fallback */}
        {errorMessage && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleRecord}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => {
                  setErrorMessage(null);
                }}
                className="px-3 py-1 bg-white border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                TYPE INSTEAD
              </button>
            </div>
          </div>
        )}

        {/* Extracted Structured Query Display */}
        {extractedQuery && (
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-emerald-400 space-y-3">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5 uppercase">
                <CheckCircle2 size={15} className="text-emerald-600" />
                UNDERSTOOD REQUEST
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                Ready
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-medium">👥 People:</span>
                <strong className="text-slate-900 text-xs font-mono font-bold">
                  {extractedQuery.people || 4}
                </strong>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-medium">💧 Water:</span>
                <strong
                  className={`text-xs font-bold ${
                    extractedQuery.water_required ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {extractedQuery.water_required ? 'Required' : 'Optional'}
                </strong>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-medium">🏥 Medical:</span>
                <strong
                  className={`text-xs font-bold ${
                    extractedQuery.medical_required ? 'text-purple-700' : 'text-slate-500'
                  }`}
                >
                  {extractedQuery.medical_required ? 'Required' : 'Optional'}
                </strong>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-medium">🏠 Purpose:</span>
                <strong className="text-slate-900 text-xs font-bold">Safe Relocation</strong>
              </div>
            </div>

            <button
              onClick={handleConfirmAndSearch}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              <span>FIND SAFE PLACES</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Quick Sample Citizen Voice Presets */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Quick Examples:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {SAMPLE_UTTERANCES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(sample.text);
                  handleProcessTranscript(sample.text);
                }}
                className="text-left p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-700 transition cursor-pointer"
              >
                <div className="font-bold text-slate-900 truncate">{sample.title}</div>
                <p className="text-slate-500 text-[10px] truncate mt-0.5">"{sample.text}"</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
