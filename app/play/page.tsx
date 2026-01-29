"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import { InteractiveBowl } from "@/components/game/interactive-bowl";
import { ControlPanel } from "@/components/game/control-panel";
import { ZenErrorBoundary } from "@/components/game/zen-error-boundary";
import { motion, AnimatePresence } from "framer-motion";

interface BowlData {
    id: string;
    color: string;
    label: string;
    freq: string;
    freqNum: number;
    chakra: string;
}

const BOWLS = [
    { id: "root", color: "#FF4D4D", label: "Root", freq: "396Hz", freqNum: 396, chakra: "Muladhara" },
    { id: "sacral", color: "#FFA64D", label: "Sacral", freq: "417Hz", freqNum: 417, chakra: "Svadhisthana" },
    { id: "plexus", color: "#FFFF4D", label: "Solar Plexus", freq: "528Hz", freqNum: 528, chakra: "Manipura" },
    { id: "heart", color: "#4DFF4D", label: "Heart", freq: "639Hz", freqNum: 639, chakra: "Anahata" },
    { id: "throat", color: "#4D4DFF", label: "Throat", freq: "741Hz", freqNum: 741, chakra: "Vishuddha" },
    { id: "third-eye", color: "#8A2BE2", label: "Third Eye", freq: "852Hz", freqNum: 852, chakra: "Ajna" },
    { id: "crown", color: "#EE82EE", label: "Crown", freq: "963Hz", freqNum: 963, chakra: "Sahasrara" },
];

export default function PlayPage() {
    return (
        <ZenErrorBoundary>
            <PlayContent />
        </ZenErrorBoundary>
    );
}

function PlayContent() {
    const [activeBowl, setActiveBowl] = useState<string | null>(null);
    const [isResonating, setIsResonating] = useState(false);
    const [intensity, setIntensity] = useState(0.5);
    const [key, setKey] = useState(0); // For total reset

    const activeColor = BOWLS.find(b => b.id === activeBowl)?.color || "#000000";

    // Keyboard Support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 7) {
                const bowl = BOWLS[num - 1];
                if (bowl) {
                    // Trigger strike visual/audio through ref would be better, but for now we'll just track active
                    setActiveBowl(bowl.id);
                }
            }
            if (e.key === "r") handleReset();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleReset = () => {
        setActiveBowl(null);
        setKey(prev => prev + 1); // Remount bowls to kill sounds
    };

    const handlePreset = (type: string) => {
        handleReset();
        // In a real app, this would trigger an automated sequence
        console.log(`Starting ${type} preset journey`);
    };

    return (
        <main className="min-h-screen bg-background text-foreground overflow-hidden">
            <Header />

            {/* Back Link */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-28 left-6 z-50 md:left-20"
            >
                <Link href="/" className="text-sm font-medium opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
                    ← Return to Sanctuary
                </Link>
            </motion.div>

            {/* Background Aura */}
            <motion.div
                className="fixed inset-0 pointer-events-none z-0"
                animate={{
                    background: activeBowl
                        ? `radial-gradient(circle at center, ${activeColor}22 0%, transparent 70%)`
                        : "radial-gradient(circle at center, transparent 0%, transparent 70%)"
                }}
                transition={{ duration: 2 }}
            />

            {/* Full Page Resonance Wave Overlay */}
            <AnimatePresence>
                {isResonating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 2, 1],
                                opacity: [0.1, 0.3, 0.1]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-[-50%] rounded-full blur-[120px]"
                            style={{ backgroundColor: activeColor }}
                        />

                        {/* Large SVG Wave Effect */}
                        <svg className="absolute inset-0 w-full h-full opacity-10">
                            <motion.circle
                                cx="50%" cy="50%" r="0"
                                fill="none"
                                stroke={activeColor}
                                strokeWidth="2"
                                animate={{ r: ["0%", "150%"], opacity: [1, 0] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.circle
                                cx="50%" cy="50%" r="0"
                                fill="none"
                                stroke={activeColor}
                                strokeWidth="1"
                                animate={{ r: ["0%", "150%"], opacity: [0.8, 0] }}
                                transition={{ duration: 10, delay: 5, repeat: Infinity, ease: "linear" }}
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="relative z-10 pt-32 pb-40 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[90vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl font-medium tracking-tighter md:text-8xl mb-6">
                        Zen Playground
                    </h1>
                    <p className="text-muted-foreground/60 text-lg md:text-xl max-w-2xl mx-auto font-light">
                        An immersive sound sanctuary. Use keys <span className="text-foreground font-medium">1-7</span> to strike bowls, or click and hold to hear them sing.
                    </p>
                </motion.div>

                {/* Two-Row Staggered Grid Layout (As per user sketch) */}
                <div className="relative w-full max-w-5xl flex flex-col items-center gap-12 mt-12" key={key}>
                    {/* Row 1: 3 Bowls */}
                    <div className="flex justify-center gap-12 md:gap-24">
                        {BOWLS.slice(0, 3).map((bowl, index) => (
                            <BowlItem key={bowl.id} bowl={bowl} index={index} onSelect={setActiveBowl} onResonance={setIsResonating} />
                        ))}
                    </div>

                    {/* Row 2: 4 Bowls */}
                    <div className="flex justify-center gap-12 md:gap-20">
                        {BOWLS.slice(3, 7).map((bowl, index) => (
                            <BowlItem key={bowl.id} bowl={bowl} index={index + 3} onSelect={setActiveBowl} onResonance={setIsResonating} />
                        ))}
                    </div>

                    {/* Central Void / Focus Point - Subtle Background Decoration */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-5">
                        <div className="absolute inset-0 border border-white/20 rounded-full" />
                        <div className="absolute inset-20 border border-white/10 rounded-full" />
                        <div className="absolute inset-40 border border-white/5 rounded-full" />
                    </div>
                </div>
            </section>

            <ControlPanel
                volume={intensity}
                onVolumeChange={setIntensity}
                onReset={handleReset}
                onPreset={handlePreset}
            />

            <FooterSection />
        </main>
    );
}

function BowlItem({ bowl, index, onSelect, onResonance }: { bowl: BowlData, index: number, onSelect: (id: string | null) => void, onResonance: (active: boolean) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="flex flex-col items-center group"
        >
            <InteractiveBowl
                id={bowl.id}
                color={bowl.color}
                frequency={bowl.freqNum}
                onInteraction={(id: string | null) => onSelect(id)}
                onResonance={onResonance}
            />

            <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none translate-y-2 group-hover:translate-y-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
                    {bowl.label} ({index + 1})
                </p>
                <p className="text-sm font-medium text-foreground/80">{bowl.chakra}</p>
            </div>
        </motion.div>
    );
}

function numToKey(num: number) {
    return num.toString();
}
