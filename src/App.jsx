import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import Game from './components/Game';
import HighestViewGame from './components/HighestViewGame';
import { cn } from '@/lib/utils';
import { Github } from 'lucide-react';

// Replace 'G-XXXXXXXXXX' with your actual Measurement ID
const TRACKING_ID = "G-12C2QS0H78";
ReactGA.initialize(TRACKING_ID);

function App() {
  const [mode, setMode] = useState('classic'); // 'classic' | 'highest'

  useEffect(() => {
    // Track page view on mount
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  useEffect(() => {
    // Track mode changes
    ReactGA.event({
      category: "Game Mode",
      action: "Change Mode",
      label: mode,
    });
  }, [mode]);

  return (
    <div className="relative min-h-[100dvh] bg-background overflow-hidden font-sans text-foreground select-none flex flex-col">
      {/* Global Header / Mode Switcher */}
      <div className="z-[60] flex justify-center p-1 md:p-4 shrink-0">
        <div className="flex bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/10">
          <button
            onClick={() => setMode('classic')}
            className={cn(
              "px-3 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300",
              mode === 'classic' ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-white"
            )}
          >
            Higher/Lower
          </button>
          <button
            onClick={() => setMode('highest')}
            className={cn(
              "px-3 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300",
              mode === 'highest' ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-white"
            )}
          >
            Pick Highest
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full overflow-y-auto flex flex-col">
        {mode === 'classic' ? <Game /> : <HighestViewGame />}
      </div>

      {/* Global Footer */}
      <footer className="w-full z-50 flex flex-col items-center gap-1 md:gap-2 shrink-0 pb-2 md:pb-6 bg-background">
        <p className="text-[10px] text-muted-foreground/30 uppercase tracking-widest pointer-events-none">
          Video views are approximate & subject to change
        </p>
        <a
          href="https://github.com/leotrimhaliti/HigherOrLower"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground/50 hover:text-white transition-all duration-300 block transform hover:scale-125"
          aria-label="GitHub Profile"
        >
          <Github className="w-8 h-8" />
        </a>
      </footer>
    </div>
  );
}

export default App;
