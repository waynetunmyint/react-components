"use client";
import React from 'react';

interface LoadingCompProps {
    title?: string;
    subtitle?: string;
    steps?: string[];
    currentStep?: number;
    color?: 'amber' | 'blue' | 'emerald' | 'indigo' | 'rose';
    icon?: React.ReactNode;
}

const LoadingComp: React.FC<LoadingCompProps> = ({
    title = "Loading Content",
    subtitle = "Please wait while we fetch the latest data...",
    steps = ["Connecting", "Fetching", "Ready"],
    currentStep = 1,
    color = 'amber',
    icon
}) => {
    const colorClasses = {
        amber: {
            bg: 'bg-amber-100/30',
            primary: 'text-amber-500',
            border: 'border-t-amber-500',
            gradient: 'from-amber-400 to-amber-600',
            shadow: 'shadow-amber-200',
            glow: 'rgba(245,158,11,0.3)',
            stepActive: 'bg-amber-500 text-white',
            dotActive: 'bg-white'
        },
        blue: {
            bg: 'bg-blue-100/30',
            primary: 'text-blue-500',
            border: 'border-t-blue-500',
            gradient: 'from-blue-400 to-blue-600',
            shadow: 'shadow-blue-200',
            glow: 'rgba(59,130,246,0.3)',
            stepActive: 'bg-blue-500 text-white',
            dotActive: 'bg-white'
        },
        emerald: {
            bg: 'bg-emerald-100/30',
            primary: 'text-emerald-500',
            border: 'border-t-emerald-500',
            gradient: 'from-emerald-400 to-emerald-600',
            shadow: 'shadow-emerald-200',
            glow: 'rgba(16,185,129,0.3)',
            stepActive: 'bg-emerald-500 text-white',
            dotActive: 'bg-white'
        },
        indigo: {
            bg: 'bg-indigo-100/30',
            primary: 'text-indigo-500',
            border: 'border-t-indigo-500',
            gradient: 'from-indigo-400 to-indigo-600',
            shadow: 'shadow-indigo-200',
            glow: 'rgba(79,70,229,0.3)',
            stepActive: 'bg-indigo-500 text-white',
            dotActive: 'bg-white'
        },
        rose: {
            bg: 'bg-rose-100/30',
            primary: 'text-rose-500',
            border: 'border-t-rose-500',
            gradient: 'from-rose-400 to-rose-600',
            shadow: 'shadow-rose-200',
            glow: 'rgba(244,63,94,0.3)',
            stepActive: 'bg-rose-500 text-white',
            dotActive: 'bg-white'
        }
    };

    const activeColor = colorClasses[color];

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
            <div className="relative flex flex-col items-center">
                {/* Background Decorative Rings */}
                <div className={`absolute -z-10 w-48 h-48 ${activeColor.bg} rounded-full blur-3xl animate-pulse`}></div>
                <div className="absolute -z-10 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Loader Card Container */}
                <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] border border-white/50 flex flex-col items-center max-w-sm w-full mx-4 transition-all duration-700">

                    {/* Animated Icon Section */}
                    <div className="relative mb-8">
                        {/* Spinning outer ring */}
                        <div className={`w-24 h-24 border-[3px] border-slate-100 ${activeColor.border} rounded-full animate-spin`}></div>

                        {/* Centered Icon Container */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
                                {icon ? (
                                    <div className="animate-bounce">
                                        {icon}
                                    </div>
                                ) : (
                                    <span className={`text-2xl animate-bounce ${activeColor.primary}`}>
                                        {color === 'amber' ? '⚡' : color === 'blue' ? '💎' : color === 'emerald' ? '🌿' : color === 'indigo' ? '✨' : '🌸'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loading Typography */}
                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600">
                            {title}
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-[200px] mx-auto opacity-80">
                            {subtitle}
                        </p>
                    </div>

                    {/* Modern Progress Bar */}
                    <div className="mt-10 w-full overflow-hidden">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
                            <div
                                className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${activeColor.gradient} rounded-full animate-[loading_2s_ease-in-out_infinite]`}
                                style={{ boxShadow: `0 0 12px ${activeColor.glow}` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Steps Logic */}
                <div className="flex gap-4 mt-10">
                    {steps.map((step, i) => {
                        const isActive = i === currentStep;
                        const isCompleted = i < currentStep;

                        return (
                            <div
                                key={step}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 transform hover:scale-105 ${isActive ? `${activeColor.stepActive} shadow-lg ${activeColor.shadow}` :
                                    isCompleted ? 'bg-slate-800 text-white' : 'bg-white/50 text-slate-400 border border-slate-100'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? `${activeColor.dotActive} animate-ping` :
                                    isCompleted ? 'bg-emerald-400' : 'bg-slate-300'
                                    }`}></div>
                                {step}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loading {
                    0% { transform: translateX(-100%); width: 20%; }
                    50% { width: 50%; }
                    100% { transform: translateX(500%); width: 20%; }
                }
            `}} />
        </div>
    );
};

export default LoadingComp;
