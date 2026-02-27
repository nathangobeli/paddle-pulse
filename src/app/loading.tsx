export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 font-[family-name:var(--font-geist-sans)] selection:bg-[#93e9be]/30 selection:text-[#93e9be]">
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#93e9be]/5 blur-[150px] pointer-events-none rounded-full" />

            <main className="flex flex-col gap-10 items-center w-full max-w-5xl relative z-10 animate-pulse">
                {/* Header Section Skeleton */}
                <div className="text-center w-full space-y-4 flex flex-col items-center">
                    <div className="h-16 md:h-20 w-3/4 max-w-md bg-slate-800 rounded-xl" />

                    <div className="w-full max-w-md relative mb-8">
                        <div className="w-full bg-slate-800/50 border border-slate-700 rounded-full h-[50px]" />
                    </div>

                    <div className="h-6 w-48 bg-slate-800 rounded-full mt-4" />
                </div>

                {/* Dashboard Skeleton */}
                <div className="w-full space-y-8">

                    {/* Controls Bar Skeleton */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                        <div className="h-10 w-full md:w-64 bg-slate-800/80 rounded-xl" />
                        <div className="h-10 w-full md:w-64 bg-slate-800/80 rounded-xl" />
                    </div>

                    {/* Top Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-800 h-[200px]">
                                <div className="h-10 w-10 bg-slate-800 rounded-full mb-4" />
                                <div className="h-4 w-20 bg-slate-800 rounded-full mb-2" />
                                <div className="h-12 w-24 bg-slate-800 rounded-xl" />
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {/* Tide Graph Card Skeleton */}
                        <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-800 min-h-[300px]" />

                        {/* Sunrise/Sunset Card Skeleton */}
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-800 min-h-[300px]">
                            <div className="w-full space-y-8">
                                <div className="flex flex-col gap-2">
                                    <div className="h-4 w-32 bg-slate-800 rounded-full" />
                                    <div className="h-10 w-24 bg-slate-800 rounded-xl" />
                                </div>
                                <div className="w-full h-px bg-slate-700" />
                                <div className="flex justify-between items-center">
                                    <div className="h-8 w-20 bg-slate-800 rounded-xl" />
                                    <div className="h-10 w-10 bg-slate-800 rounded-full" />
                                </div>
                                <div className="w-full h-px bg-slate-700" />
                                <div className="flex justify-between items-center">
                                    <div className="h-8 w-20 bg-slate-800 rounded-xl" />
                                    <div className="h-10 w-10 bg-slate-800 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Rain Chances Graph Skeleton */}
                        <div className="md:col-span-3 flex flex-col items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-800 mt-2 min-h-[300px]" />

                        {/* UV Index Graph Skeleton */}
                        <div className="md:col-span-3 flex flex-col items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-800 mt-2 min-h-[300px]" />
                    </div>

                    {/* Go/No-Go Badge Skeleton */}
                    <div className="w-full mt-4 h-24 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800" />
                </div>
            </main>
        </div>
    );
}
