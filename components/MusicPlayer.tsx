'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX, Play, Pause } from 'lucide-react';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showControls, setShowControls] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setAudioError(true);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (val: number) => {
    setVolume(val);
    const audio = audioRef.current;
    if (audio) audio.volume = val;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Hidden audio element — will use /music/wedding-song.mp3 when provided */}
      <audio ref={audioRef} loop preload="none" onError={() => setAudioError(true)}>
        <source src="/music/wedding-song.mp3" type="audio/mpeg" />
      </audio>

      <motion.div
        className="relative"
        onHoverStart={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Expanded controls panel */}
        <AnimatePresence>
          {showControls && !audioError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 bg-ivory/95 backdrop-blur-sm rounded-2xl shadow-lg border border-blush-deep/20 p-4 w-48"
            >
              <p className="font-body text-xs text-ink-light text-center mb-3 tracking-wider uppercase">
                {playing ? 'Now Playing' : 'Paused'}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <VolumeX
                  className="w-4 h-4 text-ink-light cursor-pointer hover:text-blush-deep transition-colors"
                  onClick={toggleMute}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={(e) => handleVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-blush-deep"
                />
                <Volume2
                  className="w-4 h-4 text-ink-light cursor-pointer hover:text-blush-deep transition-colors"
                  onClick={() => handleVolume(0.6)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-blush-deep to-blush-deep/80 shadow-lg flex items-center justify-center border-2 border-ivory/80 backdrop-blur-sm"
          aria-label={playing ? 'Pause music' : 'Play music'}
        >
          {playing ? (
            <Pause className="w-6 h-6 text-ivory" />
          ) : (
            <Play className="w-6 h-6 text-ivory ml-0.5" />
          )}
        </motion.button>

        {/* Floating music note when playing */}
        {playing && !audioError && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Music className="w-4 h-4 text-blush-deep" />
          </motion.div>
        )}

        {/* Error / no-music state */}
        {audioError && (
          <div className="absolute -top-8 right-0 whitespace-nowrap">
            <p className="font-body text-[10px] text-ink-light/60">Music coming soon</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
