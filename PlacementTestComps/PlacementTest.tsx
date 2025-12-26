"use client";
import React, { useState, useEffect } from "react";
import {
    User, Mail, Phone, ArrowRight, CheckCircle2,
    AlertCircle, ChevronRight, ChevronLeft, RotateCcw,
    Trophy, GraduationCap, ClipboardList, Loader2
} from "lucide-react";
import { BASE_URL, PAGE_ID } from "../../../config";

interface SubQuestion {
    Id: number;
    Title: string;
    ItemList: string[];
    Answer: string;
}

interface Question {
    Id: number;
    QuestionType: number; // 1: multiple-choice, 2: true-false, 3: reading-comprehension
    Title: string;
    Description?: string | null; // Large paragraph
    ItemList: string[];
    Answer: string;
    SubQuestions?: SubQuestion[]; // Optional sub-questions for reading
}

const dummyQuestions: Question[] = [
    {
        Id: 1,
        QuestionType: 1,
        Title: "Which of the following is the most widely spoken language in the world?",
        ItemList: ["English", "Mandarin Chinese", "Spanish", "Hindi"],
        Answer: "English"
    },
    {
        Id: 2,
        QuestionType: 2,
        Title: "JavaScript is exactly the same as Java.",
        ItemList: ["True", "False"],
        Answer: "False"
    },
    {
        Id: 3,
        QuestionType: 3,
        Title: "Reading: The Future of Remote Work",
        Description: "Remote work has transformed from a temporary solution during the global pandemic into a permanent fixture of the modern corporate landscape. While many employees appreciate the flexibility and lack of commute, companies are still navigating challenges related to corporate culture and spontaneous collaboration. Recent studies suggest that hybrid models—combining home and office days—are becoming the preferred standard for most Fortune 500 companies. This shift requires a new set of digital skills and a different approach to management that focuses on output rather than hours spent at a desk.",
        ItemList: [],
        Answer: "",
        SubQuestions: [
            {
                Id: 301,
                Title: "What is the primary reason remote work became popular according to the text?",
                ItemList: ["Technological advancements", "The global pandemic", "Fortune 500 mandates", "Digital skill acquisition"],
                Answer: "The global pandemic"
            },
            {
                Id: 302,
                Title: "True or False: Most companies are returning to 100% office-based work.",
                ItemList: ["True", "False"],
                Answer: "False"
            },
            {
                Id: 303,
                Title: "What is the new management focus mentioned in the passage?",
                ItemList: ["Hours spent at desk", "Corporate culture", "Spontaneous collaboration", "Output and results"],
                Answer: "Output and results"
            }
        ]
    },
    {
        Id: 4,
        QuestionType: 1,
        Title: "What is the value of Pi rounded to two decimal places?",
        ItemList: ["3.12", "3.14", "3.16", "3.18"],
        Answer: "3.14"
    },
    {
        Id: 5,
        QuestionType: 2,
        Title: "Water boils at 90 degrees Celsius at sea level.",
        ItemList: ["True", "False"],
        Answer: "False"
    }
];

type Step = "user-info" | "test" | "result";

export default function PlacementTest() {
    // Flow State
    const [step, setStep] = useState<Step>("user-info");

    // User Info State
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [formError, setFormError] = useState("");

    // Test State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState(0);

    // Initial Data Fetch
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                // Endpoint follows the project's standard pattern for paginated data by page ID
                const url = `${BASE_URL}/questions/api/byPageId/byPage/${PAGE_ID}/1`;
                const response = await fetch(url);

                if (!response.ok) throw new Error("Could not connect to questions server.");

                const result = await response.json();
                const rawList = Array.isArray(result) ? result : (result?.data || []);

                if (rawList.length === 0) {
                    // Fallback to dummy data if server returns nothing
                    setQuestions(dummyQuestions);
                } else {
                    // Process questions: handle JSON strings for ItemList and structure SubQuestions
                    const processed = rawList.map((q: any) => ({
                        ...q,
                        ItemList: typeof q.ItemList === 'string' ? JSON.parse(q.ItemList) : (q.ItemList || []),
                        SubQuestions: q.SubQuestions?.map((sub: any) => ({
                            ...sub,
                            ItemList: typeof sub.ItemList === 'string' ? JSON.parse(sub.ItemList) : (sub.ItemList || [])
                        }))
                    }));
                    setQuestions(processed);
                }
            } catch (err) {
                console.error("Error loading questions:", err);
                setFetchError("Load failed. Using offline questions.");
                setQuestions(dummyQuestions);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // Handlers
    const handleStartTest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInfo.name || !userInfo.email) {
            setFormError("Please fill in at least your name and email.");
            return;
        }
        setStep("test");
    };

    const handleAnswer = (questionId: number, selectedOption: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            calculateResult();
            setStep("result");
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const calculateResult = () => {
        let finalScore = 0;
        let totalWeight = 0;

        questions.forEach(q => {
            if (q.SubQuestions && q.SubQuestions.length > 0) {
                totalWeight += q.SubQuestions.length;
                q.SubQuestions.forEach(sub => {
                    if (answers[sub.Id] === sub.Answer) finalScore += 1;
                });
            } else {
                totalWeight += 1;
                if (answers[q.Id] === q.Answer) finalScore += 1;
            }
        });
        setScore(finalScore);
    };

    const isQuestionAnswered = (q: Question) => {
        if (q.SubQuestions && q.SubQuestions.length > 0) {
            return q.SubQuestions.every(sub => answers[sub.Id]);
        }
        return !!answers[q.Id];
    };

    const getTotalPossibleScore = () => {
        return questions.reduce((acc, q) => acc + (q.SubQuestions?.length || 1), 0);
    };

    const resetTest = () => {
        setStep("user-info");
        setUserInfo({ name: "", email: "", phone: "" });
        setCurrentQuestionIndex(0);
        setAnswers({});
        setScore(0);
    };

    // UI Parts
    const ProgressBar = () => {
        if (questions.length === 0) return null;
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        return (
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-[var(--theme-primary-bg)] transition-all duration-700 ease-out shadow-[0_0_12px_var(--theme-primary-bg)]/40"
                    style={{ width: `${progress}%` }}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-20">
            <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">

                {/* Step 1: User Info */}
                {step === "user-info" && (
                    <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-[var(--theme-primary-bg)]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <GraduationCap size={40} className="text-[var(--theme-primary-bg)]" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-[var(--theme-text-primary)] mb-2">Language Placement Test</h1>
                            <p className="text-[var(--theme-text-secondary)]">Please provide your details to begin the assessment.</p>
                        </div>

                        <form onSubmit={handleStartTest} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--theme-text-primary)] ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--theme-primary-bg)] transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--theme-primary-bg)]/20 focus:border-[var(--theme-primary-bg)] transition-all outline-none text-gray-900"
                                        placeholder="John Doe"
                                        value={userInfo.name}
                                        onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--theme-text-primary)] ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--theme-primary-bg)] transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--theme-primary-bg)]/20 focus:border-[var(--theme-primary-bg)] transition-all outline-none text-gray-900"
                                        placeholder="john@example.com"
                                        value={userInfo.email}
                                        onChange={e => setUserInfo({ ...userInfo, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[var(--theme-text-primary)] ml-1">Phone Number (Optional)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--theme-primary-bg)] transition-colors">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--theme-primary-bg)]/20 focus:border-[var(--theme-primary-bg)] transition-all outline-none text-gray-900"
                                        placeholder="+1 234 567 890"
                                        value={userInfo.phone}
                                        onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                                    <AlertCircle size={16} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[var(--theme-primary-bg)] hover:opacity-90 disabled:opacity-50 text-white font-bold py-5 rounded-2xl shadow-lg shadow-[var(--theme-primary-bg)]/20 transition-all flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Preparing Test...
                                    </>
                                ) : (
                                    <>
                                        Start Assessment
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Test Phase */}
                {step === "test" && questions[currentQuestionIndex] && (
                    <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Header Info */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--theme-primary-bg)] mb-1">
                                    Assessment Stage
                                </span>
                                <span className="text-xs font-bold text-gray-400">
                                    {currentQuestionIndex + 1} of {questions.length} blocks
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary-bg)] animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    {questions[currentQuestionIndex].QuestionType === 3 ? "Reading Profiency" : "Grammar & Vocab"}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 mb-10">
                            <ProgressBar />

                            {questions[currentQuestionIndex].Description?.trim() && (
                                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 rounded-[2rem] p-8 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 shadow-sm transition-all">
                                    <h3 className="text-[10px] font-black text-[var(--theme-primary-bg)] uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                                        <div className="w-4 h-[1px] bg-[var(--theme-primary-bg)]"></div>
                                        Reading Material
                                    </h3>
                                    <p className="text-[var(--theme-text-secondary)] leading-loose text-lg font-serif italic text-justify pr-2">
                                        "{questions[currentQuestionIndex].Description}"
                                    </p>
                                </div>
                            )}

                            <div>
                                <div className="mb-3">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest inline-block ${questions[currentQuestionIndex].QuestionType === 1 ? 'bg-blue-100/50 text-blue-600' :
                                            questions[currentQuestionIndex].QuestionType === 2 ? 'bg-purple-100/50 text-purple-600' :
                                                'bg-emerald-100/50 text-emerald-600'
                                        }`}>
                                        {questions[currentQuestionIndex].QuestionType === 1 ? 'Multiple Choice' :
                                            questions[currentQuestionIndex].QuestionType === 2 ? 'True / False' :
                                                'Reading Comprehension'}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-[var(--theme-text-primary)] leading-tight tracking-tight">
                                    {questions[currentQuestionIndex].Title}
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {(questions[currentQuestionIndex].SubQuestions || [questions[currentQuestionIndex]]).map((q, qIdx) => {
                                const qType = questions[currentQuestionIndex].QuestionType;
                                const isTF = qType === 2 || (q.ItemList?.length === 2 && q.ItemList.includes("True") && q.ItemList.includes("False"));

                                return (
                                    <div key={q.Id} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${qIdx * 100}ms` }}>
                                        {questions[currentQuestionIndex].SubQuestions && (
                                            <div className="mb-6 flex items-start gap-4">
                                                <div className="shrink-0 w-8 h-8 rounded-xl bg-[var(--theme-primary-bg)] text-white flex items-center justify-center font-black text-xs shadow-lg shadow-[var(--theme-primary-bg)]/20">
                                                    {qIdx + 1}
                                                </div>
                                                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] leading-tight pt-1">
                                                    {q.Title}
                                                </h3>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4">
                                            {(isTF ? ["True", "False"] : q.ItemList).map((option, idx) => {
                                                const isSelected = answers[q.Id] === option;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleAnswer(q.Id, option)}
                                                        className={`
                                                            group flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden
                                                            ${isSelected
                                                                ? "border-[var(--theme-primary-bg)] bg-[var(--theme-primary-bg)]/5 shadow-inner"
                                                                : "border-gray-100 bg-white hover:border-[var(--theme-primary-bg)]/40 hover:shadow-xl hover:shadow-gray-200/40"}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <div className={`
                                                                w-8 h-8 rounded-xl border flex items-center justify-center text-[10px] font-black transition-all
                                                                ${isSelected
                                                                    ? "bg-[var(--theme-primary-bg)] border-[var(--theme-primary-bg)] text-white"
                                                                    : "bg-gray-50 border-gray-100 text-gray-400 group-hover:border-[var(--theme-primary-bg)]/30 group-hover:text-[var(--theme-primary-bg)]"}
                                                            `}>
                                                                {String.fromCharCode(65 + idx)}
                                                            </div>
                                                            <span className={`font-bold text-lg ${isSelected ? "text-[var(--theme-primary-bg)]" : "text-[var(--theme-text-primary)]"}`}>
                                                                {option}
                                                            </span>
                                                        </div>
                                                        <div className={`
                                                            relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                                            ${isSelected
                                                                ? "border-[var(--theme-primary-bg)] bg-[var(--theme-primary-bg)] scale-110 shadow-[0_0_12px_var(--theme-primary-bg)]/30"
                                                                : "border-gray-200 bg-white group-hover:border-gray-300"}
                                                        `}>
                                                            {isSelected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                                                        </div>
                                                        {isSelected && (
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--theme-primary-bg)]/5 rounded-full -mr-16 -mt-16 animate-pulse blur-3xl"></div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-12">
                            <button
                                onClick={handlePrev}
                                disabled={currentQuestionIndex === 0}
                                className="flex items-center gap-2 px-6 py-4 text-[var(--theme-text-secondary)] font-bold rounded-2xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronLeft size={20} />
                                Previous
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={!isQuestionAnswered(questions[currentQuestionIndex])}
                                className="bg-[var(--theme-primary-bg)] hover:opacity-90 disabled:opacity-50 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-[var(--theme-primary-bg)]/20 transition-all flex items-center gap-2 group"
                            >
                                {currentQuestionIndex === questions.length - 1 ? "Complete Test" : "Next Block"}
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Result Phase */}
                {step === "result" && (
                    <div className="p-8 md:p-12 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/20">
                            <Trophy size={48} className="text-white" />
                        </div>

                        <h1 className="text-4xl font-extrabold text-[var(--theme-text-primary)] mb-2">Well Done, {userInfo.name}!</h1>
                        <p className="text-[var(--theme-text-secondary)] mb-10">You have completed the placement assessment.</p>

                        <div className="bg-gray-50 rounded-[2rem] p-10 border border-gray-100 mb-10">
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Final Score</div>
                            <div className="text-6xl font-black text-[var(--theme-primary-bg)] mb-4">
                                {score} <span className="text-2xl text-gray-300 font-bold">/ {getTotalPossibleScore()}</span>
                            </div>
                            <div className="text-lg font-bold text-[var(--theme-text-primary)]">
                                {score === getTotalPossibleScore() ? "Perfect Score! 🌟" :
                                    score >= getTotalPossibleScore() * 0.7 ? "Great Job! 👍" :
                                        "Good Effort! Keep learning. 📚"}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={resetTest}
                                className="flex items-center justify-center gap-2 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                <RotateCcw size={18} />
                                Retake Test
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-[var(--theme-primary-bg)] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[var(--theme-primary-bg)]/20 hover:opacity-90 transition-all"
                            >
                                Return Home
                            </button>
                        </div>

                        <p className="mt-8 text-xs text-gray-400">
                            A copy of your results has been sent to <span className="font-semibold">{userInfo.email}</span>
                        </p>
                    </div>
                )}
            </div>
        </div >
    );
}
