"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";
import { InteractiveBowl, getAudioContext, type InteractiveBowlHandle } from "@/components/game/interactive-bowl";
import { ControlPanel } from "@/components/game/control-panel";
import { ZenErrorBoundary } from "@/components/game/zen-error-boundary";
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from "framer-motion";
import { playContent } from "@/lib/cms";

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
        <LazyMotion features={domAnimation}>
            <ZenErrorBoundary>
                <PlayContent />
            </ZenErrorBoundary>
        </LazyMotion>
    );
}

function PlayContent() {
    const [activeBowl, setActiveBowl] = useState<string | null>(null);
    const [isResonating, setIsResonating] = useState(false);
    const [intensity, setIntensity] = useState(0.5);
    const [key, setKey] = useState(0); // For total reset
    const bowlRefs = useRef<(InteractiveBowlHandle | null)[]>([]);
    const reduceMotion = useReducedMotion();

    const activeColor = BOWLS.find(b => b.id === activeBowl)?.color || "#000000";

    // Keyboard Support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
            const target = e.target as HTMLElement | null;
            if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
            const num = parseInt(e.key);
            if (num >= 1 && num <= 7) {
                getAudioContext();
                bowlRefs.current[num - 1]?.strike();
            }
            if (e.key === "r") handleReset();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleReset = () => {
        setActiveBowl(null);
        setIsResonating(false);
        setKey(prev => prev + 1); // Remount bowls to kill sounds
    };

    const handlePreset = (type: string) => {
        handleReset();
        // In a real app, this would trigger an automated sequence
        console.log(`Starting ${type} preset journey`);
    };

    return (
        <main className="min-h-screen bg-background text-foreground overflow-hidden">
            <Header variant="pill-light" />

            {/* Back Link */}
            <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed top-28 left-6 z-50 md:left-20"
            >
                <Link href="/" className="text-sm font-medium opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
                    {playContent.backLink}
                </Link>
            </m.div>

            {/* Background Aura */}
            <AnimatePresence initial={false}>
                {activeBowl && (
                    <m.div
                        key={activeBowl}
                        className="fixed inset-0 pointer-events-none z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 2 }}
                        style={{ background: `radial-gradient(circle at center, ${activeColor}22 0%, transparent 70%)` }}
                    />
                )}
            </AnimatePresence>

            {/* Full Page Resonance Wave Overlay */}
            <AnimatePresence>
                {isResonating && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
                    >
                        <m.div
                            initial={{ scale: 1, opacity: 0.2 }}
                            animate={reduceMotion ? { scale: 1, opacity: 0.2 } : { scale: [1, 2, 1], opacity: [0.1, 0.3, 0.1] }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-[-50%] rounded-full will-change-transform"
                            style={{ background: `radial-gradient(circle at center, ${activeColor} 0%, ${activeColor}99 25%, transparent 60%)` }}
                        />

                        {/* Large Wave Effect */}
                        {!reduceMotion && (
                            <div className="absolute inset-0 opacity-10">
                                <m.div
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: [0, 1], opacity: [1, 0] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-1/2 left-1/2 -ml-[150vmax] -mt-[150vmax] h-[300vmax] w-[300vmax] rounded-full border-2"
                                    style={{ borderColor: activeColor }}
                                />
                                <m.div
                                    initial={{ scale: 0, opacity: 0.8 }}
                                    animate={{ scale: [0, 1], opacity: [0.8, 0] }}
                                    transition={{ duration: 10, delay: 5, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-1/2 left-1/2 -ml-[150vmax] -mt-[150vmax] h-[300vmax] w-[300vmax] rounded-full border"
                                    style={{ borderColor: activeColor }}
                                />
                            </div>
                        )}
                    </m.div>
                )}
            </AnimatePresence>

            <section className="relative z-10 px-6 pt-28 pb-28 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[90vh] md:pt-32 md:pb-40">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl font-medium tracking-tighter md:text-8xl mb-6">
                        {playContent.heading}
                    </h1>
                    <PlayDescription />
                </m.div>

                {/* Two-Row Staggered Grid Layout (As per user sketch) */}
                <div className="relative w-full max-w-5xl flex flex-col items-center gap-10 mt-8 md:mt-12" key={key}>
                    {/* Row 1: 3 Bowls */}
                    <div className="flex w-full max-w-[360px] flex-wrap justify-center gap-6 sm:max-w-[420px] sm:gap-8 md:max-w-none md:gap-24">
                        {BOWLS.slice(0, 3).map((bowl, index) => (
                            <BowlItem key={bowl.id} bowl={bowl} index={index} volume={intensity} onSelect={setActiveBowl} onResonance={setIsResonating} bowlRef={(handle) => { bowlRefs.current[index] = handle; }} />
                        ))}
                    </div>

                    {/* Row 2: 4 Bowls */}
                    <div className="flex w-full max-w-[360px] flex-wrap justify-center gap-6 sm:max-w-[420px] sm:gap-8 md:max-w-none md:gap-20">
                        {BOWLS.slice(3, 7).map((bowl, index) => (
                            <BowlItem key={bowl.id} bowl={bowl} index={index + 3} volume={intensity} onSelect={setActiveBowl} onResonance={setIsResonating} bowlRef={(handle) => { bowlRefs.current[index + 3] = handle; }} />
                        ))}
                    </div>

                    {/* Central Void / Focus Point - Subtle Background Decoration */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-5 hidden md:block">
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

function PlayDescription() {
    const { description, descriptionHighlight } = playContent;
    const highlightIndex = descriptionHighlight
        ? description.indexOf(descriptionHighlight)
        : -1;
    return (
        <p className="text-muted-foreground/60 text-lg md:text-xl max-w-2xl mx-auto font-light">
            {highlightIndex === -1 ? (
                description
            ) : (
                <>
                    {description.slice(0, highlightIndex)}
                    <span className="text-foreground font-medium">{descriptionHighlight}</span>
                    {description.slice(highlightIndex + descriptionHighlight.length)}
                </>
            )}
        </p>
    );
}

function BowlItem({ bowl, index, volume, onSelect, onResonance, bowlRef }: { bowl: BowlData, index: number, volume: number, onSelect: (id: string | null) => void, onResonance: (active: boolean) => void, bowlRef: (handle: InteractiveBowlHandle | null) => void }) {
    return (
        <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="flex flex-col items-center group"
        >
            <InteractiveBowl
                id={bowl.id}
                color={bowl.color}
                frequency={bowl.freqNum}
                volume={volume}
                onInteraction={(id: string | null) => onSelect(id)}
                onResonance={onResonance}
                ref={bowlRef}
            />

            <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none translate-y-2 group-hover:translate-y-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">
                    {bowl.label} ({index + 1})
                </p>
                <p className="text-sm font-medium text-foreground/80">{bowl.chakra}</p>
            </div>
        </m.div>
    );
}
