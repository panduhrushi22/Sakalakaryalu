'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Flame, Music, RefreshCw, AlertCircle } from 'lucide-react';

interface PlayerProps {
  audioUrl: string;
  mantraName: string;
}

export default function MantraAudioPlayer({ audioUrl, mantraName }: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // Default simulated length or fallback
  const [isSimulated, setIsSimulated] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Fallback: synthesized temple bell sound
  const playSimulatedTempleBell = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const now = ctx.currentTime;
      
      // 1. Strike oscillator (high frequency chime)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 1.5);
      
      gain1.gain.setValueAtTime(isMuted ? 0 : volume * 0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 2);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 2.1);

      // 2. Hum oscillator (lower fundamental resonance)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(220, now);
      
      gain2.gain.setValueAtTime(isMuted ? 0 : volume * 0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 3);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 3.1);
    } catch (e) {
      console.warn('Audio Context failed to start (browser policy requirement):', e);
    }
  };

  // Sync state for simulated fallback mode
  useEffect(() => {
    if (isSimulated) {
      if (isPlaying) {
        playSimulatedTempleBell();
        timerRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            if (prev >= duration) {
              setIsPlaying(false);
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            if (Math.floor(prev + 1) % 6 === 0) {
              playSimulatedTempleBell();
            }
            return prev + 1;
          });
        }, 1000);
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isSimulated, duration, volume, isMuted]);

  // Handle standard audio node playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !isSimulated) {
      audio.play().catch((err) => {
        console.error('Real audio playback failed, falling back to simulated bells:', err);
        setIsSimulated(true);
        setDuration(30);
        setCurrentTime(0);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, isSimulated]);

  // Handle audio properties
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Check URL type on mount/update
  useEffect(() => {
    if (!audioUrl || audioUrl.includes('simulated') || audioUrl === '') {
      setIsSimulated(true);
      setDuration(30);
    } else {
      setIsSimulated(false);
      setLoadError(null);
    }
  }, [audioUrl]);

  const togglePlay = () => {
    // Resume audio context if needed (browser autoplays restriction)
    if (isSimulated && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying(!isPlaying);
  };

  const resetPlayer = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSimulated) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isSimulated) {
      setDuration(audioRef.current.duration || 30);
    }
  };

  const handleAudioError = () => {
    console.warn(`Audio loading failed for ${audioUrl}. Activating crystal temple bells fallback.`);
    setIsSimulated(true);
    setDuration(30);
    setLoadError('Crystal bells fallback active');
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && !isSimulated) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="bg-gradient-to-r from-stone-900 to-stone-950 border-2 border-amber-500 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-4 text-amber-100 max-w-lg glow-saffron relative overflow-hidden">
      {/* Real HTML5 Audio Element */}
      {!isSimulated && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleAudioError}
          onEnded={handleAudioEnded}
          preload="none"
        />
      )}

      {/* Decorative divine light */}
      <div className="absolute top-0 right-0 p-1 opacity-20 bg-amber-500/20 rounded-bl-xl border-l border-b border-amber-500/40">
        <Music className="h-4.5 w-4.5 animate-pulse text-amber-400" />
      </div>

      {/* Control Button */}
      <button
        onClick={togglePlay}
        className="w-14 h-14 flex items-center justify-center bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 rounded-full transition-all shadow-lg flex-shrink-0 border border-amber-300 cursor-pointer"
        aria-label={isPlaying ? 'Pause Chanting' : 'Play Chanting'}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6 text-stone-950 fill-stone-950" />
        ) : (
          <Play className="h-6 w-6 text-stone-950 fill-stone-950 ml-1" />
        )}
      </button>

      {/* Progress & Info */}
      <div className="flex-grow w-full space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-cinzel text-sm font-bold tracking-wide text-amber-300 truncate max-w-[180px]">
            {mantraName}
          </span>
          <span className="text-[9px] tracking-wider text-amber-500/80 font-outfit uppercase bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/40 flex items-center gap-1">
            <Flame className="h-3 w-3 text-amber-500 animate-bounce" />
            {isSimulated ? (
              <span className="text-amber-400 font-semibold">Temple Bells Fallback</span>
            ) : (
              <span>Vedic Audio Stream</span>
            )}
          </span>
        </div>

        {/* Progress Bar slider */}
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 30}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-stone-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
            style={{
              background: `linear-gradient(to right, #f59e0b 0%, #d97706 ${(currentTime / (duration || 30)) * 100}%, #292524 ${(currentTime / (duration || 30)) * 100}%, #292524 100%)`
            }}
          />
        </div>

        {/* Time values & Volume */}
        <div className="flex items-center justify-between text-[11px] font-outfit text-stone-400">
          <span>{formatTime(currentTime)}</span>
          
          <div className="flex items-center gap-3">
            {/* Interactive Volume */}
            <div className="flex items-center gap-1.5 group">
              <button 
                onClick={toggleMute} 
                className="hover:text-amber-400 transition-colors cursor-pointer"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-3.5 w-3.5 text-stone-500" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-stone-400 hover:text-amber-400" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-12 h-1 bg-stone-800 rounded appearance-none cursor-pointer accent-amber-500 opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <button
        onClick={resetPlayer}
        className="p-2 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-amber-300 transition-colors flex-shrink-0 cursor-pointer"
        aria-label="Restart"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  );
}
