"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ZenErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Zen Sanctuary Error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md"
                    >
                        <h2 className="text-3xl font-medium mb-4">The Resonance was Interrupted</h2>
                        <p className="text-muted-foreground mb-8">
                            Even in the sanctuary, sometimes the flow is disturbed. Take a breath and return to the center.
                        </p>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-80 transition-opacity"
                            onClick={() => this.setState({ hasError: false })}
                        >
                            Return to Sanctuary
                        </Link>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
