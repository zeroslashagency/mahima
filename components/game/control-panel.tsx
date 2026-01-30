"use client";

import { motion } from "framer-motion";
import { Sliders, RotateCcw, PlayCircle } from "lucide-react";

interface ControlPanelProps {
    onReset: () => void;
    volume: number;
    onVolumeChange: (val: number) => void;
    onPreset: (type: string) => void;
}

export function ControlPanel({ onReset, volume, onVolumeChange, onPreset }: ControlPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed bottom-6 right-4 z-50 bg-background/70 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col items-center gap-6 md:right-6 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:p-6 md:gap-8"
        >
            {/* Master Reset */}
            <button
                onClick={onReset}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors md:p-4">
                    <RotateCcw size={22} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <span className="text-[9px] uppercase tracking-widest opacity-40 md:text-[10px]">Reset</span>
            </button>

            <div className="w-8 h-px bg-white/10 md:w-10" />

            {/* Volume Slider - Vertical */}
            <div className="flex flex-col items-center gap-3 h-40 md:gap-4 md:h-48">
                <Sliders size={14} className="opacity-40" />
                <div className="relative h-28 w-8 flex items-center justify-center md:h-32">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 -rotate-90 accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer md:w-32"
                    />
                </div>
                <span className="text-[9px] uppercase tracking-widest opacity-40 whitespace-nowrap rotate-90 mt-3 md:text-[10px] md:mt-4">Intensity</span>
            </div>

            <div className="w-8 h-px bg-white/10 md:w-10" />

            {/* Presets - Vertical */}
            <div className="flex flex-col items-center gap-2 md:gap-3">
                <button
                    onClick={() => onPreset("sleep")}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95 md:w-12 md:h-12"
                    title="Deep Sleep"
                >
                    <span className="text-[10px] font-bold">Zz</span>
                </button>
                <button
                    onClick={() => onPreset("clarity")}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95 md:w-12 md:h-12"
                    title="Clarity"
                >
                    <span className="text-[10px] font-bold">✨</span>
                </button>
            </div>

            <button
                className="p-3 bg-foreground text-background rounded-2xl hover:opacity-80 transition-opacity active:scale-95 mt-3 md:p-4 md:mt-4"
                aria-label="Start Guided Journey"
            >
                <PlayCircle size={22} />
            </button>
        </motion.div>
    );
}
