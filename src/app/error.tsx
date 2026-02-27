"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 font-[family-name:var(--font-geist-sans)] selection:bg-[#93e9be]/30 selection:text-[#93e9be]">
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-rose-500/5 blur-[150px] pointer-events-none rounded-full" />

            <main className="flex flex-col gap-6 items-center w-full max-w-lg relative z-10 bg-slate-900/80 backdrop-blur-md p-10 rounded-3xl border border-rose-500/20 shadow-2xl text-center">

                <div className="text-rose-400 bg-rose-500/10 p-4 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-black text-white tracking-tight">
                    Rough Waters Ahead
                </h1>

                <p className="text-slate-400 text-lg leading-relaxed">
                    We couldn't fetch the latest weather conditions. The marine APIs might be experiencing turbulence or the location is invalid.
                </p>

                <button
                    onClick={() => reset()}
                    className="mt-6 px-8 py-4 bg-[#93e9be]/10 text-[#93e9be] hover:bg-[#93e9be]/20 border border-[#93e9be]/50 rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                    Check Again
                </button>

            </main>
        </div>
    );
}
