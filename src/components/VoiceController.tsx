import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Mic, MicOff, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { fetchVoiceSummary } from "../lib/api";

interface VoiceControllerProps {
  decisionId: string;
  onTranscriptReady?: (transcript: string) => void;
}

export default function VoiceController({ decisionId, onTranscriptReady }: VoiceControllerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMethod, setVoiceMethod] = useState<"browser" | "gemini">("browser");
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onTranscriptReady && transcript) {
          onTranscriptReady(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setErrorMessage(`Voice recognition failed: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopSpeaking();
    };
  }, [onTranscriptReady]);

  // Toggle Speech-to-Text Listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMessage("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking();
      recognitionRef.current.start();
    }
  };

  // Stop current audio synthesis
  const stopSpeaking = () => {
    // Stop browser synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop Gemini Audio playback
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }

    setIsSpeaking(false);
  };

  // Speak using Browser-Native Speech Synthesis
  const speakBrowser = (textToSpeak: string) => {
    if (!window.speechSynthesis) {
      setErrorMessage("Speech synthesis is not supported in this browser.");
      return;
    }

    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Speak using Gemini Premium AI TTS Model
  const speakGemini = async () => {
    stopSpeaking();
    setLoadingVoice(true);
    setErrorMessage(null);

    try {
      const data = await fetchVoiceSummary(decisionId);
      
      // Playback raw audio binary
      const binaryString = window.atob(data.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Initialize Web Audio Context (Gemini TTS returns 24kHz raw PCM/WAV)
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioCtx = audioCtxRef.current;
      
      // Decode audio data
      audioCtx.decodeAudioData(bytes.buffer, (buffer) => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        
        source.onended = () => {
          setIsSpeaking(false);
        };
        
        audioSourceRef.current = source;
        setIsSpeaking(true);
        setLoadingVoice(false);
        source.start(0);
      }, (err) => {
        console.error("Audio decode error, falling back to browser voice", err);
        // Fallback to browser voice synthesis
        setLoadingVoice(false);
        speakBrowser(data.text);
      });

    } catch (error: any) {
      console.warn("Gemini TTS synthesis failed or unauthorized, using browser voice fallback:", error);
      setLoadingVoice(false);
      // Fallback
      speakBrowser("Analysis completed. Please check your options comparisons below.");
    }
  };

  // Handle core Trigger for Voice Synthesis
  const triggerVoiceBriefing = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (voiceMethod === "gemini") {
      speakGemini();
    } else {
      // Find summary text to read
      const element = document.getElementById("ai-recommendation-summary");
      const summaryText = element ? element.innerText : "No active AI recommendation loaded. Please run the analyzer.";
      speakBrowser(summaryText);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#161618] border border-white/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-200 font-display">AI Voice Assistant Hub</h4>
        </div>

        {/* Voice Synth Selector */}
        <div className="flex rounded-lg bg-[#121214] p-1 border border-white/10">
          <button
            onClick={() => { stopSpeaking(); setVoiceMethod("browser"); }}
            className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
              voiceMethod === "browser"
                ? "bg-white/5 text-slate-100 font-medium"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => { stopSpeaking(); setVoiceMethod("gemini"); }}
            className={`px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              voiceMethod === "gemini"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Gemini HD
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
        {/* Play AI briefing Button */}
        <button
          onClick={triggerVoiceBriefing}
          disabled={loadingVoice}
          className={`relative flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
            isSpeaking
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
              : "bg-[#121214] border border-white/10 text-slate-100 hover:border-white/20"
          }`}
        >
          {loadingVoice ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Generating Audio...</span>
            </>
          ) : isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Stop Voice Briefing</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Listen to AI Briefing</span>
            </>
          )}

          {/* Waveform animation overlay */}
          {isSpeaking && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 h-3">
              <span className="w-0.75 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <span className="w-0.75 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              <span className="w-0.75 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <span className="w-0.75 h-1 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </span>
          )}
        </button>

        {/* Speak Option Toggle */}
        {onTranscriptReady && (
          <button
            onClick={toggleListening}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
              isListening
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse"
                : "bg-[#121214] border border-white/10 text-slate-100 hover:border-white/20"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-indigo-400" />
                <span>Listening... Speak Now</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-slate-400" />
                <span>Dictate (Voice Input)</span>
              </>
            )}

            {/* Listening indicator rings */}
            {isListening && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 h-3">
                <span className="w-0.75 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <span className="w-0.75 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                <span className="w-0.75 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </span>
            )}
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
