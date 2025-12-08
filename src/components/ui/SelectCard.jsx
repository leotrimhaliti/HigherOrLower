import React from 'react';
import { motion } from 'framer-motion';
import { formatViews } from '@/data/videoData';
import { cn } from '@/lib/utils';

const SelectCard = ({ video, isRevealed, isSelected, isHighest, onClick, disabled }) => {
    let borderColor = 'border-border';
    let textColor = 'text-yellow-400';

    if (isRevealed) {
        if (isHighest) {
            borderColor = 'border-green-500';
            textColor = 'text-green-400';
        } else if (isSelected) {
            borderColor = 'border-red-500';
            textColor = 'text-red-400';
        } else {
            borderColor = 'border-border/50 opacity-50'; // Dim others
        }
    } else if (isSelected) {
        borderColor = 'border-blue-500'; // Selected state before reveal? (not applicable here as reveal is immediate)
    }

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, borderColor: 'rgba(255,255,255,0.5)' } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "relative flex flex-col items-center justify-center p-2 md:p-4 w-full h-36 md:h-48 lg:h-56 bg-card rounded-xl border-2 shadow-xl overflow-hidden text-center transition-colors duration-300",
                borderColor,
                disabled && !isRevealed ? "cursor-default" : "cursor-pointer"
            )}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0 bg-black">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-contain opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-2 w-full h-full justify-between py-2">
                <h2 className="text-sm md:text-base font-bold text-white drop-shadow-md line-clamp-3 leading-tight">
                    {video.title}
                </h2>

                {isRevealed ? (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <span className={cn(
                            "text-xl md:text-2xl font-black tracking-tighter",
                            textColor
                        )}>
                            {formatViews(video.views)}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                            Views
                        </span>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center mt-auto mb-2 opacity-80">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-1 rounded-full bg-black/40">
                            Select
                        </span>
                    </div>
                )}
            </div>
        </motion.button>
    );
};

export default SelectCard;
