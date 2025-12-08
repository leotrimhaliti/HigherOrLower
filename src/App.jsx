import React, { useState } from 'react';
import Game from './components/Game';
import HighestViewGame from './components/HighestViewGame';
import { cn } from '@/lib/utils'; // Assuming cn utility is available or just use template literals

function App() {
  const [mode, setMode] = useState('classic'); // 'classic' | 'highest'

  return (
    <div className="relative min-h-screen bg-background overflow-hidden font-sans text-foreground select-none">
      {/* Global Header / Mode Switcher */}
      <div className="absolute top-0 left-0 right-0 z-[60] flex justify-center p-4">
        <div className="flex bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/10">
          <button
            onClick={() => setMode('classic')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
              mode === 'classic' ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-white"
            )}
          >
            Higher/Lower
          </button>
          <button
            onClick={() => setMode('highest')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300",
              mode === 'highest' ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-white"
            )}
          >
            Pick Highest
          </button>
        </div>
      </div>

      {mode === 'classic' ? <Game /> : <HighestViewGame />}
    </div>
  );
}

export default App;
