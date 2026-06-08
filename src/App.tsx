import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Lock, Heart as HeartIcon, Sparkles } from 'lucide-react';
import TextHeart from './components/TextHeart';
// @ts-ignore
import angelAudio from './assets/Angel_final.mp3';

const Typewriter = ({ text, delay = 50, onComplete }: { text: string, delay?: number, onComplete?: () => void }) => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, delay, onComplete]);

  return <span className="font-mono">{currentText}</span>;
};

export default function App() {
  const [stage, setStage] = useState<'console' | 'reveal'>('console');
  const [consoleFinished, setConsoleFinished] = useState(false);
  const [password, setPassword] = useState('');
  const [promptFinished, setPromptFinished] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play audio helper - triggered synchronously inside the user click event handler
  const playMusic = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(angelAudio);
      audio.loop = true;
      audio.volume = 0.8;
      audio.play().catch(err => {
        console.warn("Audio play blocked by browser. Retrying on next interaction.", err);
      });
      audioRef.current = audio;
    }
  }, []);

  // Ensure audio is stopped on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleDecrypt = useCallback(() => {
    if (password === '25') {
      playMusic();
      setStage('reveal');
    } else {
      setError(true);
    }
  }, [password, playMusic]);

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] selection:bg-pink-deep/30"
    >
      <div className="scanline" />
      
      <AnimatePresence mode="wait">
        {stage === 'console' ? (
          <motion.div
            key="console"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-2xl p-8 font-mono text-sm md:text-base text-white/80"
          >
            <div className="space-y-2">
              <div className="flex gap-2 text-pink-soft/60">
                <span>[system]</span>
                <Typewriter 
                  text="Initializing heart.PROTOCOL_v2.0..." 
                  delay={30} 
                  onComplete={() => setConsoleFinished(true)}
                />
              </div>
              
              <div className="flex gap-2 h-6">
                <span>[status]</span>
                {consoleFinished && (
                    <motion.span 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-green-400"
                    >
                        READY
                    </motion.span>
                )}
              </div>

              {consoleFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 flex flex-col items-start gap-6 w-full"
                >
                  <p className="text-white/40 italic">
                    {">"} One encrypted package found for you.
                  </p>

                  <div className="flex flex-col gap-3 w-full max-w-sm">
                    <div className="flex gap-2 text-white/40 italic">
                      <span>[password]</span>
                      <Typewriter 
                        text="Enter decryption key:" 
                        delay={30} 
                        onComplete={() => setPromptFinished(true)}
                      />
                    </div>
                    
                    {promptFinished && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col gap-2"
                      >
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleDecrypt();
                            }
                          }}
                          placeholder="••••"
                          className="bg-transparent border-b border-pink-deep/30 focus:border-pink-deep/70 outline-none text-white/60 font-mono text-sm tracking-widest py-1 italic w-full"
                          autoFocus
                        />
                        {error && (
                          <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-xs font-mono"
                          >
                            [error] Decryption failed. Invalid credentials.
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {promptFinished && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <button
                        id="decrypt-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecrypt();
                        }}
                        className="group flex items-center gap-3 px-6 py-3 border border-pink-deep/30 bg-pink-deep/5 hover:bg-pink-deep/10 text-pink-soft transition-all duration-300 pointer-events-auto"
                      >
                        <Lock size={16} className="group-hover:rotate-12 transition-transform" />
                        <span className="font-mono tracking-widest uppercase text-xs">Decrypt Message</span>
                        <span className="terminal-cursor" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden"
          >
            <TextHeart />
            


            {/* Subtle tech overlays */}
            <div className="absolute top-8 left-8 text-[10px] font-mono text-white/10 uppercase tracking-widest space-y-1">
                <div>ln: 420</div>
                <div>id: 0xDEADBEEF</div>
                <div>type: organic_emotion</div>
            </div>
            
            <div className="absolute bottom-8 right-8 text-[10px] font-mono text-white/10 uppercase tracking-widest">
                heart_reveal // success
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

