import React, { useState, useRef, useEffect } from 'react';
import ParticleText, { ParticleTextRef } from '../ui/ParticleText';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isHiding, setIsHiding] = useState(false);
  const [canClick, setCanClick] = useState(false);
  const lightParticleRef = useRef<ParticleTextRef>(null);
  const darkParticleRef = useRef<ParticleTextRef>(null);

  useEffect(() => {
    // Allow clicking after the initial particles gather (approx 1.5s)
    const timer = setTimeout(() => {
      setCanClick(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenSite = () => {
    if (!canClick) return;
    setCanClick(false);
    
    // Trigger the explode animation on both light and dark text
    lightParticleRef.current?.explode();
    darkParticleRef.current?.explode();

    // Wait for the explode animation to play, then fade out the screen
    setTimeout(() => {
      setIsHiding(true);
      // Wait for the fade out to finish before unmounting
      setTimeout(onComplete, 800);
    }, 1200); // 1.2 seconds for the explode effect
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#09090b] transition-opacity duration-700 ${
        isHiding ? 'opacity-0' : 'opacity-100'
      } ${canClick ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleOpenSite}
    >
      <div className="w-full h-full flex items-center justify-center relative pointer-events-none">
        <ParticleText
          ref={lightParticleRef}
          text="WeatherGPT"
          particleSize={3}
          density={4}
          color="#18181b"
          highlightColor="#3b82f6"
          gatherDuration={1500}
          scatter={1200}
          className="dark:hidden"
          fontSize="5rem"
          fontWeight={900}
        />
        <ParticleText
          ref={darkParticleRef}
          text="WeatherGPT"
          particleSize={3}
          density={4}
          color="#f4f4f5"
          highlightColor="#60a5fa"
          gatherDuration={1500}
          scatter={1200}
          className="hidden dark:block"
          fontSize="5rem"
          fontWeight={900}
        />
      </div>

      {canClick && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="absolute bottom-10 text-sm text-zinc-400 font-medium tracking-widest animate-pulse"
        >
          CLICK ANYWHERE TO ENTER
        </motion.div>
      )}
    </div>
  );
}
