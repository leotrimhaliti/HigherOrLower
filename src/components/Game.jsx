import React, { useState, useEffect } from 'react';
import { videoData, getRandomPair } from '@/data/videoData';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronUp, ChevronDown, RefreshCw, Trophy, Github } from 'lucide-react';
import { motion } from 'framer-motion';

const Game = () => {
    const [currentVideo, setCurrentVideo] = useState(null);
    const [nextVideo, setNextVideo] = useState(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameState, setGameState] = useState('loading'); // loading, playing, revealed, gameover
    const [result, setResult] = useState(null); // correct, wrong

    useEffect(() => {
        // Initial Load
        const storedHighScore = localStorage.getItem('zi8gzag-highscore') || 0;
        setHighScore(parseInt(storedHighScore));
        startNewGame();
    }, []);

    const getNewVideo = (excludeId) => {
        let newVid;
        do {
            newVid = videoData[Math.floor(Math.random() * videoData.length)];
        } while (newVid.id === excludeId);
        return newVid;
    };

    const startNewGame = () => {
        const pair = getRandomPair();
        setCurrentVideo(pair[0]);
        setNextVideo(pair[1]);
        setScore(0);
        setGameState('playing');
        setResult(null);
    };

    const handleGuess = (guess) => {
        if (gameState !== 'playing') return;

        setGameState('revealed');

        // Check correctness
        const isHigher = nextVideo.views >= currentVideo.views;
        const isCorrect = (guess === 'higher' && isHigher) || (guess === 'lower' && !isHigher);

        if (isCorrect) {
            setResult('correct');
            const newScore = score + 1;
            setScore(newScore);
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('zi8gzag-highscore', newScore);
            }

            // Delay before next round
            setTimeout(() => {
                setResult(null);
                setCurrentVideo(nextVideo);
                setNextVideo(getNewVideo(nextVideo.id));
                setGameState('playing');
            }, 1500);

        } else {
            setResult('wrong');
            setTimeout(() => {
                setGameState('gameover');
            }, 1000);
        }
    };

    if (!currentVideo || !nextVideo) return <div className="text-white">Loading...</div>;

    return (
        <div className="h-screen bg-background flex flex-col items-center justify-center p-4 font-sans text-foreground overflow-hidden select-none">
            {/* Header */}
            <header className="absolute top-0 w-full flex justify-between items-center p-6 px-10 z-50">
                <img src="/logo.jpg" alt="Zi8gzag Higher or Lower" className="h-12 md:h-14 w-auto object-contain" />
                <div className="flex gap-6 text-sm font-bold">
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs uppercase">Score</span>
                        <span className="text-2xl">{score}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs uppercase">Best</span>
                        <span className="text-2xl text-yellow-500">{highScore}</span>
                    </div>
                </div>
            </header>

            {/* Main Game Area */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-5xl mt-10">

                {/* Card A */}
                <div className="relative">
                    <Card video={currentVideo} isRevealed={true} />
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 md:hidden">
                        <ChevronDown className="w-8 h-8 text-muted-foreground animate-bounce" />
                    </div>
                </div>

                {/* VS Badge (Desktop) */}
                <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-accent border-4 border-background z-20 shrink-0 shadow-xl">
                    <span className="font-black text-xl italic">VS</span>
                </div>

                {/* Card B */}
                <div className="flex flex-col items-center gap-6">
                    <Card
                        video={nextVideo}
                        isRevealed={gameState === 'revealed' || gameState === 'gameover'}
                        isRightCard={true}
                        result={gameState === 'revealed' || gameState === 'gameover' ? result : null}
                    />

                    {/* Controls */}
                    {gameState === 'playing' && (
                        <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
                                onClick={() => handleGuess('higher')}
                            >
                                <ChevronUp className="mr-2 h-6 w-6" /> HIGHER
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full h-14 text-lg font-bold border-2 hover:bg-white/5 active:scale-95"
                                onClick={() => handleGuess('lower')}
                            >
                                <ChevronDown className="mr-2 h-6 w-6" /> LOWER
                            </Button>
                        </div>
                    )}

                    {/* Game Over Controls */}
                    {gameState === 'gameover' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-4 w-full p-6 bg-card border border-border rounded-xl shadow-2xl"
                        >
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-red-500 mb-1">GAME OVER!</h3>
                                <p className="text-muted-foreground">You scored {score} points</p>
                            </div>
                            <Button
                                size="lg"
                                className="w-full font-bold bg-white text-black hover:bg-gray-200"
                                onClick={startNewGame}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" /> PLAY AGAIN
                            </Button>
                        </motion.div>
                    )}
                </div>

            </div>

            {/* Confetti or VFX placeholder */}
            {result === 'correct' && (
                <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
                    <div className="w-full h-full bg-green-500/10 animate-pulse" />
                </div>
            )}
            {result === 'wrong' && (
                <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
                    <div className="w-full h-full bg-red-500/10 animate-pulse" />
                </div>
            )}

            {/* Footer */}
            <footer className="absolute bottom-6 z-50 flex flex-col items-center gap-2 animate-in fade-in duration-1000 delay-500">
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
};

export default Game;
