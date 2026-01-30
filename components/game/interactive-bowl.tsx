"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface InteractiveBowlProps {
    color: string;
    frequency: number;
    volume: number;
    onInteraction: (id: string | null) => void;
    onResonance?: (active: boolean) => void;
    id: string;
}

export function InteractiveBowl({ color, frequency, volume, onInteraction, onResonance, id }: InteractiveBowlProps) {
    const [isSinging, setIsSinging] = useState(false);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const resonanceTimer = useRef<NodeJS.Timeout | null>(null);
    const controls = useAnimation();
    const audioContext = useRef<AudioContext | null>(null);
    const oscillator = useRef<OscillatorNode | null>(null);
    const gainNode = useRef<GainNode | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (oscillator.current) {
                try {
                    oscillator.current.stop();
                    oscillator.current.disconnect();
                } catch (e) {
                    // Ignore errors if already stopped
                }
            }
        };
    }, []);

    const initAudio = () => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    useEffect(() => {
        if (!audioContext.current || !gainNode.current) return;
        const targetGain = isSinging ? 0.2 * volume : 0;
        gainNode.current.gain.setTargetAtTime(targetGain, audioContext.current.currentTime, 0.08);
    }, [volume, isSinging]);

    const playStrike = () => {
        try {
            initAudio();
            if (!audioContext.current) return;

            const osc = audioContext.current.createOscillator();
            const gain = audioContext.current.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(frequency + (Math.random() * 2 - 1), audioContext.current.currentTime);

            gain.gain.setValueAtTime(0.4 * volume, audioContext.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 4);

            osc.connect(gain);
            gain.connect(audioContext.current.destination);

            osc.start();
            osc.stop(audioContext.current.currentTime + 4);

            // Add ripple effect
            const newRipple = { id: Date.now(), x: 50, y: 50 };
            setRipples(prev => [...prev, newRipple]);
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 2000);
        } catch (error) {
            console.error("Audio Strike Error:", error);
        }
    };

    const startSinging = () => {
        try {
            initAudio();
            if (!audioContext.current) return;

            setIsSinging(true);
            onInteraction(id);
            oscillator.current = audioContext.current.createOscillator();
            gainNode.current = audioContext.current.createGain();

            oscillator.current.type = "sine";
            oscillator.current.frequency.setValueAtTime(frequency, audioContext.current.currentTime);

            gainNode.current.gain.setValueAtTime(0, audioContext.current.currentTime);
            gainNode.current.gain.linearRampToValueAtTime(0.2 * volume, audioContext.current.currentTime + 1);

            oscillator.current.connect(gainNode.current);
            gainNode.current.connect(audioContext.current.destination);

            oscillator.current.start();

            // Start resonance timer
            resonanceTimer.current = setTimeout(() => {
                if (onResonance) onResonance(true);
            }, 1500);
        } catch (error) {
            console.error("Audio Sing Error:", error);
            setIsSinging(false);
        }
    };

    const stopSinging = () => {
        try {
            if (resonanceTimer.current) {
                clearTimeout(resonanceTimer.current);
                resonanceTimer.current = null;
            }
            if (onResonance) onResonance(false);

            if (gainNode.current && audioContext.current) {
                gainNode.current.gain.linearRampToValueAtTime(0, audioContext.current.currentTime + 0.8);
                const currentOsc = oscillator.current;
                setTimeout(() => {
                    try {
                        currentOsc?.stop();
                        currentOsc?.disconnect();
                    } catch (e) { }
                    setIsSinging(false);
                }, 800);
            } else {
                setIsSinging(false);
            }
        } catch (error) {
            console.error("Audio Stop Error:", error);
            setIsSinging(false);
        }
    };

    const handleStrike = async () => {
        onInteraction(id);
        playStrike();
        await controls.start({
            scale: [1, 1.15, 1],
            rotate: [0, 2, -2, 0],
            transition: { duration: 0.3, ease: "easeOut" }
        });
    };

    return (
        <div className="relative group cursor-pointer select-none">
            {/* Visual Glow Aura */}
            <AnimatePresence>
                {isSinging && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.4, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 2 }}
                        className="absolute inset-0 rounded-full blur-[60px]"
                        style={{ backgroundColor: color }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                    />
                )}
            </AnimatePresence>

            {/* Ripple Effects */}
            {ripples.map(ripple => (
                <motion.div
                    key={ripple.id}
                    initial={{ opacity: 0.6, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 2.5 }}
                    className="absolute inset-0 rounded-full border-2 pointer-events-none"
                    style={{ borderColor: color }}
                    transition={{ duration: 2, ease: "easeOut" }}
                />
            ))}

            {/* The 3D Zen Bowl Aesthetic */}
            <motion.div
                animate={controls}
                whileHover={{ scale: 1.05 }}
                onMouseDown={startSinging}
                onMouseUp={stopSinging}
                onMouseLeave={stopSinging}
                onTouchStart={startSinging}
                onTouchEnd={stopSinging}
                onClick={handleStrike}
                className="relative h-20 w-20 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-shadow duration-500 sm:h-24 sm:w-24 md:h-36 md:w-36 md:group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)]"
                style={{
                    background: `radial-gradient(circle at 30% 30%, white 0%, #f8f9fa 100%)`,
                }}
            >
                {/* Chakra Glow Layer (As per reference image) */}
                <div
                    className="absolute inset-0 opacity-40 blur-2xl"
                    style={{
                        background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`
                    }}
                />

                {/* Dotted Texture Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                        backgroundSize: '8px 8px'
                    }}
                />

                {/* Inner Polish / Rim Highlight */}
                <div className="absolute inset-0 border-[0.5px] border-white/60 rounded-full" />

                {/* Center Chakra Point */}
                <motion.div
                    className="w-2 h-2 rounded-full z-10"
                    animate={isSinging ? { scale: [1, 2.5, 1], opacity: [0.3, 1, 0.3] } : { opacity: 0.6 }}
                    style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
                />

                {/* Interaction Text */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] font-medium opacity-0 group-hover:opacity-40 transition-opacity duration-700 select-none">
                    {isSinging ? "Resonating" : "Zen"}
                </div>

                {/* Rim Glow during Singing */}
                <AnimatePresence>
                    {isSinging && (
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="absolute inset-0 border-[4px] border-t-white/80 border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
