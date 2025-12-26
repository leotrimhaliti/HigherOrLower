import React from 'react';
import { motion } from 'framer-motion';
import { formatViews } from '@/data/videoData';
import { cn } from '@/lib/utils';

const Card = ({ video, isRevealed, isRightCard, result = null }) => {
    // result can be 'correct', 'wrong', or null

    const borderColor = result === 'correct'
        ? 'border-green-500'
        : result === 'wrong'
            ? 'border-red-500'
            : 'border-border';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "relative flex flex-col items-center justify-center p-1.5 md:p-6 w-full max-w-[170px] md:max-w-sm h-44 md:h-80 bg-card rounded-xl border-2 shadow-2xl overflow-hidden text-center",
                borderColor
            )}
        >
            {/* Background Image / Thumbnail with Overlay */}
            <div className="absolute inset-0 z-0 bg-black">
                {video.thumbnail ? (
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-contain opacity-50"
                        onError={(e) => {
                            // Try fallback resolutions
                            const src = e.target.src;
                            if (src.includes('maxresdefault.jpg')) {
                                e.target.src = src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                            } else if (src.includes('hqdefault.jpg')) {
                                e.target.src = src.replace('hqdefault.jpg', 'mqdefault.jpg');
                            } else if (src.includes('mqdefault.jpg')) {
                                e.target.src = src.replace('mqdefault.jpg', 'sddefault.jpg');
                            } else {
                                // Hide the broken image
                                e.target.style.display = 'none';
                            }
                        }}
                    />
                ) : (
                    /* Gradient placeholder when no thumbnail */
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-1 md:gap-4">
                <h2 className="text-xs md:text-xl font-bold text-white drop-shadow-md line-clamp-2 md:line-clamp-3">
                    "{video.title}"
                </h2>

                <p className="text-muted-foreground text-sm uppercase tracking-widest">
                    has
                </p>

                {isRevealed ? (
                    <motion.div
                        initial={isRightCard ? { scale: 0.5, opacity: 0 } : {}}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <span className={cn(
                            "text-lg md:text-4xl font-black tracking-tighter",
                            result === 'correct' ? "text-green-400" : result === 'wrong' ? "text-red-400" : "text-yellow-400"
                        )}>
                            {formatViews(video.views)}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground uppercase mt-1">
                            Views
                        </span>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center animate-pulse">
                        <span className="text-xl md:text-4xl font-black tracking-tighter text-white">
                            ???
                        </span>
                        <span className="text-sm font-medium text-muted-foreground uppercase mt-1">
                            Views
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Card;
