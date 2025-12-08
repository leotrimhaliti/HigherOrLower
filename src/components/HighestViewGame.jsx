import React, { useState, useEffect } from 'react';
import { getRandomSet } from '@/data/videoData';
import SelectCard from '@/components/ui/SelectCard';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const HighestViewGame = () => {
    const [videos, setVideos] = useState([]);
    const [highestId, setHighestId] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameState, setGameState] = useState('loading'); // playing, revealed
    const [result, setResult] = useState(null); // correct, wrong

    useEffect(() => {
        const storedHighScore = localStorage.getItem('zigzag-highest-highscore') || 0;
        setHighScore(parseInt(storedHighScore));
        startNewRound();
    }, []);

    const startNewRound = () => {
        const set = getRandomSet(5);
        // Find the one with highest views
        const maxViews = Math.max(...set.map(v => v.views));
        const winner = set.find(v => v.views === maxViews);

        setVideos(set);
        setHighestId(winner.id);
        setSelectedId(null);
        setGameState('playing');
        setResult(null);
    };

    const handleSelect = (id) => {
        if (gameState !== 'playing') return;

        setSelectedId(id);
        setGameState('revealed');

        if (id === highestId) {
            setResult('correct');
            const newScore = score + 1;
            setScore(newScore);
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('zigzag-highest-highscore', newScore);
            }

            // Auto next ? Maybe manual is better for this mode as it takes time to read 5 titles.
            // Let's do manual "Next Round" or auto after delay? 
            // The user might want to see why they were wrong.
            // Let's add a "Next Round" button that appears.
        } else {
            setResult('wrong');
            // Reset score on loss? Or just keep playing?
            // "If you lose, you start over" implies streak.
            // But let's keep it friendly, maybe reset score like the other mode.
            // setScore(0); // If we want hardcore mode
        }
    };

    const handleNext = () => {
        if (result === 'wrong') {
            setScore(0);
        }
        startNewRound();
    };

    if (videos.length === 0) return <div>Loading...</div>;

    return (
        <div className="h-screen bg-background flex flex-col items-center justify-center p-4 font-sans text-foreground overflow-hidden select-none">
            {/* Header */}
            <header className="absolute top-0 w-full flex justify-between items-center p-6 px-10 z-50">
                <img src="/logo.jpg" alt="Zi8gzag Higher or Lower" className="h-12 md:h-14 w-auto object-contain" />
                <div className="flex gap-6 text-sm font-bold">
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs uppercase">Streak</span>
                        <span className="text-2xl">{score}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs uppercase">Best</span>
                        <span className="text-2xl text-yellow-500">{highScore}</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-col items-center w-full max-w-6xl z-10">

                <p className="text-muted-foreground text-sm max-w-md mb-6 text-center">
                    Pick the video with the <span className="text-green-500 font-bold">HIGHEST</span> views among these five.
                </p>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                    {videos.map((video) => (
                        <SelectCard
                            key={video.id}
                            video={video}
                            isRevealed={gameState === 'revealed'}
                            isSelected={selectedId === video.id}
                            isHighest={highestId === video.id}
                            onClick={() => handleSelect(video.id)}
                            disabled={gameState !== 'playing'}
                        />
                    ))}
                </div>

                {/* Result / Next Button */}
                {gameState === 'revealed' && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                        <Button
                            size="lg"
                            onClick={handleNext}
                            className={result === 'correct' ? "bg-green-600 hover:bg-green-500 text-xl px-10 py-6" : "bg-white text-black hover:bg-gray-200 text-xl px-10 py-6"}
                        >
                            {result === 'correct' ? (
                                <>
                                    <Trophy className="mr-2 w-6 h-6" /> Next Round
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 w-6 h-6" /> Play Again
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HighestViewGame;
