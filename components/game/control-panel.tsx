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
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-background/60 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-8"
        >
            {/* Master Reset */}
            <button
                onClick={onReset}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                    <RotateCcw size={22} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <span className="text-[10px] uppercase tracking-widest opacity-40">Reset</span>
            </button>

            <div className="w-10 h-px bg-white/10" />

            {/* Volume Slider - Vertical */}
            <div className="flex flex-col items-center gap-4 h-48">
                <Sliders size={14} className="opacity-40" />
                <div className="relative h-32 w-8 flex items-center justify-center">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 -rotate-90 accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                </div>
                <span className="text-[10px] uppercase tracking-widest opacity-40 whitespace-nowrap rotate-90 mt-4">Intensity</span>
            </div>

            <div className="w-10 h-px bg-white/10" />

            {/* Presets - Vertical */}
            <div className="flex flex-col items-center gap-3">
                <button
                    onClick={() => onPreset("sleep")}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                    title="Deep Sleep"
                >
                    <span className="text-[10px] font-bold">Zz</span>
                </button>
                <button
                    onClick={() => onPreset("clarity")}
                    className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                    title="Clarity"
                >
                    <span className="text-[10px] font-bold">✨</span>
                </button>
            </div>

            <button
                className="p-4 bg-foreground text-background rounded-2xl hover:opacity-80 transition-opacity active:scale-95 mt-4"
                aria-label="Start Guided Journey"
            >
                <PlayCircle size={22} />
            </button>
        </motion.div>
    );
}
