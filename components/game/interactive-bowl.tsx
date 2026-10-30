"use client";

import { m, useAnimation, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useImperativeHandle, type Ref, type PointerEvent } from "react";

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!sharedAudioContext) {
        const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextCtor) return null;
        sharedAudioContext = new AudioContextCtor();
    }
    if (sharedAudioContext.state === "suspended") {
        sharedAudioContext.resume().catch(() => { });
    }
    return sharedAudioContext;
}

const HOLD_THRESHOLD_MS = 250;

export interface InteractiveBowlHandle {
    strike: () => void;
}

interface InteractiveBowlProps {
    color: string;
    frequency: number;
    volume: number;
    onInteraction: (id: string | null) => void;
    onResonance?: (active: boolean) => void;
    id: string;
    ref?: Ref<InteractiveBowlHandle>;
}

export function InteractiveBowl({ color, frequency, volume, onInteraction, onResonance, id, ref }: InteractiveBowlProps) {
    const [isSinging, setIsSinging] = useState(false);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const resonanceTimer = useRef<NodeJS.Timeout | null>(null);
    const holdTimer = useRef<NodeJS.Timeout | null>(null);
    const singingRef = useRef(false);
    const controls = useAnimation();
    const reduceMotion = useReducedMotion();
    const oscillator = useRef<OscillatorNode | null>(null);
    const gainNode = useRef<GainNode | null>(null);

    useEffect(() => {
        return () => {
            if (holdTimer.current) clearTimeout(holdTimer.current);
            if (resonanceTimer.current) clearTimeout(resonanceTimer.current);
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

    useEffect(() => {
        const ctx = sharedAudioContext;
        if (!ctx || !gainNode.current) return;
        const targetGain = isSinging ? 0.2 * volume : 0;
        gainNode.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.08);
    }, [volume, isSinging]);

    const playStrike = () => {
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(frequency + (Math.random() * 2 - 1), ctx.currentTime);

            gain.gain.setValueAtTime(Math.max(0.4 * volume, 0.0001), ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 4);
            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
            };

            const newRipple = { id: Date.now() + Math.random(), x: 50, y: 50 };
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
            const ctx = getAudioContext();
            if (!ctx) return;

            singingRef.current = true;
            setIsSinging(true);
            onInteraction(id);
            oscillator.current = ctx.createOscillator();
            gainNode.current = ctx.createGain();

            oscillator.current.type = "sine";
            oscillator.current.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.current.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.current.gain.linearRampToValueAtTime(0.2 * volume, ctx.currentTime + 1);

            oscillator.current.connect(gainNode.current);
            gainNode.current.connect(ctx.destination);

            oscillator.current.start();

            resonanceTimer.current = setTimeout(() => {
                if (onResonance) onResonance(true);
            }, 1500);
        } catch (error) {
            console.error("Audio Sing Error:", error);
            singingRef.current = false;
            setIsSinging(false);
        }
    };

    const stopSinging = () => {
        singingRef.current = false;
        try {
            if (resonanceTimer.current) {
                clearTimeout(resonanceTimer.current);
                resonanceTimer.current = null;
            }
            if (onResonance) onResonance(false);

            const ctx = sharedAudioContext;
            if (gainNode.current && ctx) {
                const currentGain = gainNode.current;
                currentGain.gain.cancelScheduledValues(ctx.currentTime);
                currentGain.gain.setValueAtTime(currentGain.gain.value, ctx.currentTime);
                currentGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
                const currentOsc = oscillator.current;
                oscillator.current = null;
                gainNode.current = null;
                setTimeout(() => {
                    try {
                        currentOsc?.stop();
                        currentOsc?.disconnect();
                        currentGain.disconnect();
                    } catch (e) { }
                    if (!singingRef.current) setIsSinging(false);
                }, 800);
            } else {
                setIsSinging(false);
            }
        } catch (error) {
            console.error("Audio Stop Error:", error);
            setIsSinging(false);
        }
    };

    const handleStrike = () => {
        onInteraction(id);
        playStrike();
        if (reduceMotion) return;
        controls.start({
            scale: [1, 1.15, 1],
            rotate: [0, 2, -2, 0],
            transition: { duration: 0.3, ease: "easeOut" }
        });
    };

    useImperativeHandle(ref, () => ({ strike: handleStrike }));

    const clearHoldTimer = () => {
        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
            return true;
        }
        return false;
    };

    const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        getAudioContext();
        clearHoldTimer();
        if (singingRef.current) stopSinging();
        holdTimer.current = setTimeout(() => {
            holdTimer.current = null;
            startSinging();
        }, HOLD_THRESHOLD_MS);
    };

    const handlePointerUp = () => {
        if (clearHoldTimer()) {
            handleStrike();
        } else if (singingRef.current) {
            stopSinging();
        }
    };

    const handlePointerAbort = () => {
        clearHoldTimer();
        if (singingRef.current) stopSinging();
    };

    return (
        <div className="relative group cursor-pointer select-none">
            {/* Visual Glow Aura */}
            <AnimatePresence>
                {isSinging && (
                    <m.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.4, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 2, transition: { duration: 0.8 } }}
                        className="absolute inset-[-40%] rounded-full pointer-events-none"
                        style={{ background: `radial-gradient(circle at center, ${color} 0%, ${color} 30%, transparent 70%)` }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                    />
                )}
            </AnimatePresence>

            {/* Ripple Effects */}
            {ripples.map(ripple => (
                <m.div
                    key={ripple.id}
                    initial={{ opacity: 0.6, scale: 0.8 }}
                    animate={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 2.5 }}
                    className="absolute inset-0 rounded-full border-2 pointer-events-none"
                    style={{ borderColor: color }}
                    transition={{ duration: 2, ease: "easeOut" }}
                />
            ))}

            {/* The 3D Zen Bowl Aesthetic */}
            <m.div
                animate={controls}
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerAbort}
                onPointerCancel={handlePointerAbort}
                onContextMenu={(e) => e.preventDefault()}
                className="relative h-20 w-20 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-shadow duration-500 touch-none sm:h-24 sm:w-24 md:h-36 md:w-36 md:group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)]"
                style={{
                    background: `radial-gradient(circle at 30% 30%, white 0%, #f8f9fa 100%)`,
                    WebkitTouchCallout: "none",
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
                <m.div
                    className="w-2 h-2 rounded-full z-10"
                    animate={isSinging && !reduceMotion ? { scale: [1, 2.5, 1], opacity: [0.3, 1, 0.3] } : { opacity: isSinging ? 1 : 0.6 }}
                    style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}
                />

                {/* Interaction Text */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] font-medium opacity-0 group-hover:opacity-40 transition-opacity duration-700 select-none">
                    {isSinging ? "Resonating" : "Zen"}
                </div>

                {/* Rim Glow during Singing */}
                <AnimatePresence>
                    {isSinging && (
                        <m.div
                            initial={{ rotate: 0, opacity: 0 }}
                            animate={reduceMotion ? { opacity: 1 } : { rotate: 360, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={reduceMotion ? { duration: 0.3 } : { rotate: { repeat: Infinity, duration: 2, ease: "linear" }, opacity: { duration: 0.3 } }}
                            className="absolute inset-0 border-[4px] border-t-white/80 border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"
                        />
                    )}
                </AnimatePresence>
            </m.div>
        </div>
    );
}
