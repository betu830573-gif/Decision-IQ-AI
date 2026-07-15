import React, { useState, useEffect } from "react";
import {
  AnimatePresence,
  motion
} from "motion/react";
import {
  Brain,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  FileText,
  Clock,
  Sparkles,
  GitFork,
  CheckCircle,
  HelpCircle,
  Folder,
  Sliders,
  DollarSign,
  AlertCircle,
  LogOut,
  User as UserIcon,
  Search,
  ArrowRight,
  BarChart4,
  Copy,
  ChevronDown,
  Star,
  Printer,
  FileDown,
  Moon,
  Sun,
  Laptop,
  Check,
  Briefcase,
  Layers,
  GraduationCap,
  Globe,
  Settings,
  Flame,
  ShieldCheck,
  ChevronUp,
  Loader2,
  MessageSquare
} from "lucide-react";
import {
  signup,
  login,
  getMe,
  getDecisions,
  createDecision,
  updateDecision,
  deleteDecision,
  duplicateDecision,
  saveDecisionOptions,
  generateAIOptions,
  runAIDecisionAnalysis,
  runWhatIfSimulation,
  getDashboardStats,
  updateProfile,
  setAuthToken,
  getAuthToken
} from "./lib/api";
import { Decision, User, Option, DashboardStats } from "./types";
import OutcomeChart from "./components/OutcomeChart";
import DecisionTree from "./components/DecisionTree";
import SWOTPanel from "./components/SWOTPanel";
import RiskMatrix from "./components/RiskMatrix";
import DecisionChat from "./components/DecisionChat";
import VoiceController from "./components/VoiceController";

export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "new-decision" | "compare" | "profile">("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activeDecision, setActiveDecision] = useState<Decision | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Form & Loader States
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // New Decision Fields
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Career");
  const [newDeadline, setNewDeadline] = useState("");

  // Options editor states
  const [optionsList, setOptionsList] = useState<Option[]>([]);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [optTitle, setOptTitle] = useState("");
  const [optDesc, setOptDesc] = useState("");
  const [optCost, setOptCost] = useState("");
  const [optROI, setOptROI] = useState("");
  const [optRisk, setOptRisk] = useState<'Low' | 'Medium' | 'High' | 'Very High'>('Medium');
  const [optDifficulty, setOptDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Expert'>('Medium');
  const [optTime, setOptTime] = useState("");
  const [optBenefitsText, setOptBenefitsText] = useState("");
  const [optDisadvantagesText, setOptDisadvantagesText] = useState("");
  const [optNotes, setOptNotes] = useState("");

  // AI & simulation processing triggers
  const [aiGeneratingOptions, setAiGeneratingOptions] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [whatIfInput, setWhatIfInput] = useState("");
  const [whatIfResults, setWhatIfResults] = useState<any | null>(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Notifications or Info message toast banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-authenticate if token exists
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthLoading(true);
      getMe()
        .then(({ user }) => {
          setCurrentUser(user);
          setCurrentView("dashboard");
          loadData();
        })
        .catch((err) => {
          console.error(err);
          setAuthToken(null);
        })
        .finally(() => {
          setAuthLoading(false);
        });
    }
  }, []);

  const triggerToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Decisions & Dashboard Statistics
  const loadData = async () => {
    try {
      const decList = await getDecisions();
      setDecisions(decList);
      const stats = await getDashboardStats();
      setDashboardStats(stats);

      // Maintain active decision if already set
      if (activeDecision) {
        const freshActive = decList.find(d => d.id === activeDecision.id);
        if (freshActive) {
          setActiveDecision(freshActive);
          setOptionsList(freshActive.options || []);
        }
      }
    } catch (err) {
      console.error("Failed to load user records", err);
    }
  };

  // Authentication Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === "signup") {
        const { user, token } = await signup(authName, authEmail, authPassword);
        setAuthToken(token);
        setCurrentUser(user);
        triggerToast(`Welcome to DecisionIQ AI, ${user.name}!`);
      } else {
        const { user, token } = await login(authEmail, authPassword);
        setAuthToken(token);
        setCurrentUser(user);
        triggerToast(`Signed in successfully! Welcome back, ${user.name}.`);
      }
      setCurrentView("dashboard");
      await loadData();
    } catch (err: any) {
      setAuthError(err.message || "Authentication transaction failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setDecisions([]);
    setActiveDecision(null);
    setDashboardStats(null);
    setCurrentView("landing");
    triggerToast("Logged out successfully");
  };

  // Create Decision Submission
  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await createDecision(newTitle, newDesc, newCategory, newDeadline);
      triggerToast("Decision path established.");
      await loadData();
      setActiveDecision(created);
      setOptionsList([]);
      setNewTitle("");
      setNewDesc("");
      setNewDeadline("");
      setCurrentView("compare");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to write new decision record.", "error");
    }
  };

  // Add Option to List
  const handleAddOption = () => {
    if (!optTitle.trim()) {
      triggerToast("Option title is required.", "error");
      return;
    }

    const benefits = optBenefitsText
      .split("\n")
      .map(b => b.trim())
      .filter(b => b.length > 0);
    
    const disadvantages = optDisadvantagesText
      .split("\n")
      .map(d => d.trim())
      .filter(d => d.length > 0);

    const newOpt: Option = {
      id: "opt-temp-" + Math.random().toString(36).substr(2, 9),
      title: optTitle,
      description: optDesc,
      price: optCost,
      expectedROI: optROI,
      riskLevel: optRisk,
      difficulty: optDifficulty,
      timeRequired: optTime,
      benefits,
      disadvantages,
      customNotes: optNotes
    };

    const updatedOptions = [...optionsList, newOpt];
    setOptionsList(updatedOptions);

    // Reset fields
    setOptTitle("");
    setOptDesc("");
    setOptCost("");
    setOptROI("");
    setOptTime("");
    setOptNotes("");
    setOptBenefitsText("");
    setOptDisadvantagesText("");
    setIsAddingOption(false);
    triggerToast("Option added to comparison workspace.");
  };

  // Delete Option from List
  const handleDeleteOption = (id: string) => {
    const updated = optionsList.filter(o => o.id !== id);
    setOptionsList(updated);
    triggerToast("Option removed.");
  };

  // Save current Option list to Backend DB
  const handleSaveOptions = async () => {
    if (!activeDecision) return;
    try {
      const updatedDecision = await saveDecisionOptions(activeDecision.id, optionsList);
      setActiveDecision(updatedDecision);
      await loadData();
      triggerToast("Options saved and synced successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save options to cloud.", "error");
    }
  };

  // Trigger Gemini AI Options Auto-Generator
  const handleAIGenerateOptions = async () => {
    if (!activeDecision) return;
    setAiGeneratingOptions(true);
    try {
      const updated = await generateAIOptions(activeDecision.id);
      setActiveDecision(updated);
      setOptionsList(updated.options || []);
      await loadData();
      triggerToast("Gemini parsed context and generated premium options!");
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Failed to call Gemini AI generator.", "error");
    } finally {
      setAiGeneratingOptions(false);
    }
  };

  // Trigger Gemini Core Comparative Analytics
  const handleAIRunAnalysis = async () => {
    if (!activeDecision) return;
    if (optionsList.length < 2) {
      triggerToast("Please register at least 2 options to start comparative analytics.", "info");
      return;
    }

    setAiAnalyzing(true);
    setWhatIfResults(null);
    setWhatIfInput("");

    try {
      // Auto-save active option list first
      await saveDecisionOptions(activeDecision.id, optionsList);
      
      // Trigger Core AI Analysis
      const analyzed = await runAIDecisionAnalysis(activeDecision.id);
      setActiveDecision(analyzed);
      await loadData();
      triggerToast("AI analysis complete! Metrics & SWOT initialized.", "success");
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Failed to trigger AI reasoning model.", "error");
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Trigger What-If Recalculator
  const handleWhatIfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDecision || !whatIfInput.trim()) return;

    setWhatIfLoading(true);
    try {
      const data = await runWhatIfSimulation(activeDecision.id, whatIfInput);
      setWhatIfResults(data);
      triggerToast("What-if parameter space recalculated.");
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || "Simulation failed.", "error");
    } finally {
      setWhatIfLoading(false);
    }
  };

  // Duplicate decision
  const handleDuplicate = async (id: string) => {
    try {
      const dup = await duplicateDecision(id);
      triggerToast(`Duplicated into: ${dup.title}`);
      await loadData();
    } catch (err) {
      console.error(err);
      triggerToast("Failed to duplicate path.", "error");
    }
  };

  // Delete decision
  const handleDeleteDecision = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this decision? This is irreversible.")) return;
    try {
      await deleteDecision(id);
      triggerToast("Decision path removed.");
      if (activeDecision?.id === id) {
        setActiveDecision(null);
      }
      await loadData();
      setCurrentView("dashboard");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to delete decision.", "error");
    }
  };

  // Export Data: CSV Format
  const handleExportCSV = () => {
    if (!activeDecision) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Option,Description,Price/Cost,Risk Level,Expected ROI,Time Required,Difficulty\n";

    activeDecision.options.forEach(opt => {
      const title = `"${opt.title.replace(/"/g, '""')}"`;
      const desc = `"${opt.description.replace(/"/g, '""')}"`;
      const price = `"${(opt.price || '').toString().replace(/"/g, '""')}"`;
      const risk = `"${opt.riskLevel}"`;
      const roi = `"${opt.expectedROI.replace(/"/g, '""')}"`;
      const time = `"${opt.timeRequired.replace(/"/g, '""')}"`;
      const diff = `"${opt.difficulty}"`;

      csvContent += `${title},${desc},${price},${risk},${roi},${time},${diff}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeDecision.title.replace(/\s+/g, "_")}_comparison.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Comparative CSV downloaded successfully!");
  };

  // Trigger browser print (CSS is styled inside print sheets)
  const handlePrint = () => {
    window.print();
  };

  // Set as favorite
  const toggleFavorite = async (dec: Decision) => {
    try {
      const updated = await updateDecision(dec.id, { isFavorite: !dec.isFavorite });
      await loadData();
      if (activeDecision?.id === dec.id) {
        setActiveDecision(updated);
      }
      triggerToast(updated.isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      console.error(err);
    }
  };

  // Sync profile details
  const handleProfileUpdate = async (name: string, darkMode: boolean) => {
    try {
      const { user } = await updateProfile({ name, preferences: { darkMode } });
      setCurrentUser(user);
      triggerToast("Profile updated");
    } catch (err) {
      console.error(err);
    }
  };

  // Filter and Search Logic for Decisions
  const filteredDecisions = decisions.filter(dec => {
    const matchesSearch = dec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dec.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || dec.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate high risk ratio or summary count for options
  const hasAnalysis = activeDecision && activeDecision.analysis;

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white relative bg-[#09090b] text-gray-100 overflow-x-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent">
      
      {/* Absolute Premium Atmospheric Glow background lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none"></div>

      {/* Global Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
              toastMessage.type === "success" 
                ? "bg-slate-900/95 border-emerald-500/30 text-emerald-400" 
                : toastMessage.type === "error"
                ? "bg-slate-900/95 border-rose-500/30 text-rose-400"
                : "bg-slate-900/95 border-sky-500/30 text-sky-400"
            }`}>
              <Sparkles className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium leading-relaxed flex-1">{toastMessage.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setCurrentView(currentUser ? "dashboard" : "landing")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <div className="w-full h-full rounded-[10px] bg-[#161618] flex items-center justify-center">
              <Brain className="w-5.5 h-5.5 text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              DecisionIQ <span className="text-indigo-400">AI</span>
            </span>
            <span className="block text-[9px] text-slate-500 font-mono tracking-wider uppercase">Think Smarter. Decide Better.</span>
          </div>
        </div>

        {/* Action Tray */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <button 
                onClick={() => { setCurrentView("dashboard"); }} 
                className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors ${
                  currentView === "dashboard" ? "bg-white/5 text-indigo-400 border border-white/10" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => { setCurrentView("profile"); }} 
                className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === "profile" ? "bg-white/5 text-indigo-400 border border-white/10" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <img src={currentUser.avatar} alt="Avatar" className="w-4 h-4 rounded-full border border-white/10" />
                <span>{currentUser.name.split(" ")[0]}</span>
              </button>
              <button 
                onClick={handleLogout} 
                className="text-xs font-medium text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setAuthMode("login"); setCurrentView("landing"); document.getElementById("auth-form-anchor")?.scrollIntoView({ behavior: "smooth" }); }} 
                className="text-xs font-medium text-slate-400 hover:text-slate-200 px-4 py-2 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => { setAuthMode("signup"); setCurrentView("landing"); document.getElementById("auth-form-anchor")?.scrollIntoView({ behavior: "smooth" }); }} 
                className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/20"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Render Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        
        {/* ================= LANDING VIEW ================= */}
        {currentView === "landing" && (
          <div className="flex flex-col gap-24 py-12">
            
            {/* HERO SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5" />
                  Introducing DecisionIQ Pro v2.5
                </span>
                
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-display text-white leading-tight">
                  Smarter Decisions. <br />
                  <span className="text-gradient">Data-Driven Certainty.</span>
                </h1>
                
                <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl">
                  Stop comparing options on manual spreadsheets or guessing based on emotion. DecisionIQ AI employs advanced multi-dimensional game-theory modeling and predictive risk assessment to evaluate careers, business priorities, financial investments, and lifestyle choices.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                  <button
                    onClick={() => { setAuthMode("signup"); document.getElementById("auth-form-anchor")?.scrollIntoView({ behavior: "smooth" }); }}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-medium shadow-xl shadow-indigo-500/10 hover:opacity-95 transition-all text-sm group"
                  >
                    Analyze Your First Decision
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a
                    href="#features"
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#161618] border border-white/10 text-slate-300 hover:text-slate-100 transition-colors text-sm"
                  >
                    Explore Features
                  </a>
                </div>

                {/* Micro stat indicators */}
                <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8 mt-4 w-full">
                  <div>
                    <span className="block text-2xl font-bold font-display text-white">99.4%</span>
                    <span className="text-xs text-slate-500 font-mono">MODEL ACCURACY</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold font-display text-white">14,200+</span>
                    <span className="text-xs text-slate-500 font-mono">SAVED DECISIONS</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-bold font-display text-white">&lt; 3 Sec</span>
                    <span className="text-xs text-slate-500 font-mono">LATENCY DURATION</span>
                  </div>
                </div>
              </div>

              {/* Floating Hero Graphical Showcase Card */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 blur-2xl animate-pulse"></div>
                <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl flex flex-col gap-6 animate-float">
                  
                  {/* Mock Decision Card */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Brain className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 font-mono block">DECISION TEMPLATE</span>
                        <span className="text-sm font-semibold text-white font-display">Choosing a Master's Program</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">HIGH ALIGNMENT</span>
                  </div>

                  {/* Options bar mockup */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-200 block">Option A: MBA program</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Estimated Salary: $145,000</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-indigo-400 font-mono block">Score: 88</span>
                        <span className="text-[9px] text-emerald-500 block font-mono">Risk: Low</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/15 flex items-center justify-between opacity-70">
                      <div>
                        <span className="text-xs font-medium text-slate-400 block">Option B: M.Tech program</span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Estimated Salary: $120,000</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 font-mono block">Score: 71</span>
                        <span className="text-[9px] text-amber-500 block font-mono">Risk: Medium</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations mockup */}
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                    <span className="font-semibold block mb-1 flex items-center gap-1 text-indigo-200">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      AI Recommendation Summary:
                    </span>
                    "The MBA program offers a 35% higher return-on-investment, 2x faster networking capabilities, and mitigates overall opportunity risks by aligning with your entrepreneurial targets."
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURES SECTION */}
            <div id="features" className="flex flex-col gap-12 border-t border-white/10 pt-24 scroll-mt-20">
              <div className="text-center flex flex-col items-center gap-4">
                <span className="text-xs font-mono tracking-widest text-purple-400 uppercase font-bold">Comprehensive Capabilities</span>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-display text-white">
                  Built For Complex Decision Environments
                </h2>
                <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
                  Evaluate, simulate, and formulate responses with a high-fidelity intelligence platform engineered using cutting-edge Decision Theory.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Feature 1 */}
                <div className="p-6 rounded-2xl glass-card hover:border-white/10 transition-all flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-200">AI Options Auto-Generator</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Simply describe your decision in standard natural language. Gemini automatically extracts options, formulates prices, and compiles baseline advantages.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 rounded-2xl glass-card hover:border-white/10 transition-all flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-200">Dynamic What-If Simulator</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instantly simulate changing constraints: "What if my budget increases by 20%?" or "What if the market crashes?". Recalculate options instantly.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 rounded-2xl glass-card hover:border-white/10 transition-all flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-200">Interactive Decision Trees</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Visualize branches, critical paths, and probability weights inside beautiful, expandable AI-generated hierarchical node trees.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-6 rounded-2xl glass-card hover:border-white/10 transition-all flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-200">Multi-Dimensional Risk Matrix</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Calculate specific risk levels across seven distinct dimensions: Financial, Career, Technical, Market, Opportunity, Legal, and Personal well-being.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="p-6 rounded-2xl glass-card hover:border-white/10 transition-all flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-200">Explainable AI & SWOT</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Get answers with detailed reason, empirical evidence, and formula breakdowns. Review full SWOT quadrants compiled specifically for each alternative option.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="p-6 rounded-2xl glass-card hover:border-white/10 transition-all flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-200">Voice Assistant & Chat</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dictate notes, run verbal briefings with state-of-the-art Gemini HD voice synthesis, and chat directly in real-time with your AI decision architect.
                  </p>
                </div>

              </div>
            </div>

            {/* AUTHENTICATION PORT / GET STARTED ANCHOR */}
            <div id="auth-form-anchor" className="border-t border-white/10 pt-24 max-w-lg w-full mx-auto text-center flex flex-col gap-8 scroll-mt-20">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-display text-white">
                  {authMode === "login" ? "Welcome Back" : "Formulate Smarter Decisions Today"}
                </h2>
                <p className="text-xs text-slate-400 mt-2">
                  {authMode === "login" 
                    ? "Enter your credentials to access your active decision trees." 
                    : "Create a free localized secure profile to persist your comparison dashboard."}
                </p>
              </div>

              <div className="p-8 rounded-2xl glass-panel border border-white/10 shadow-2xl text-left bg-[#161618]">
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  
                  {authMode === "signup" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Alex Carter"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#121214] border border-white/10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@decisioniq.ai"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#121214] border border-white/10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#121214] border border-white/10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                    />
                  </div>

                  {authError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Auth...</span>
                      </>
                    ) : (
                      <span>{authMode === "login" ? "Sign In to Workspace" : "Generate Free Account"}</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
                  {authMode === "login" ? (
                    <p>
                      Don't have an account?{" "}
                      <button onClick={() => setAuthMode("signup")} className="text-indigo-400 font-medium hover:underline cursor-pointer">
                        Create account
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{" "}
                      <button onClick={() => setAuthMode("login")} className="text-indigo-400 font-medium hover:underline cursor-pointer">
                        Log in here
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= DASHBOARD VIEW ================= */}
        {currentView === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight font-display text-white">
                  Welcome back, {currentUser?.name}!
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluate current pipelines or establish fresh decision-intelligence matrix options.
                </p>
              </div>

              <button
                onClick={() => setCurrentView("new-decision")}
                className="flex items-center justify-center gap-2 px-4.5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Establish Decision Path</span>
              </button>
            </div>

            {/* Visual Stats Bar */}
            {dashboardStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Stat 1 */}
                <div className="p-5 rounded-2xl glass-panel flex items-center gap-4 border border-white/10 bg-[#161618]">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Folder className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Total Decisions</span>
                    <span className="text-2xl font-bold font-display text-white">{dashboardStats.totalDecisions}</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-5 rounded-2xl glass-panel flex items-center gap-4 border border-white/5">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                    <CheckCircle className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">AI Analyzed</span>
                    <span className="text-2xl font-bold font-display text-white">{dashboardStats.completedDecisions}</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="p-5 rounded-2xl glass-panel flex items-center gap-4 border border-white/10 bg-[#161618]">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Award className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Avg Confidence</span>
                    <span className="text-2xl font-bold font-display text-white">{dashboardStats.avgConfidence}%</span>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="p-5 rounded-2xl glass-panel flex items-center gap-4 border border-white/10 bg-[#161618]">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
                    <Layers className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Dominant Sector</span>
                    <span className="text-lg font-bold font-display text-white truncate max-w-[150px] block">{dashboardStats.mostUsedCategory}</span>
                  </div>
                </div>

              </div>
            )}

            {/* List & Search View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Decisions Feed Left */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300 font-mono tracking-widest uppercase flex items-center gap-1.5 shrink-0">
                    <Check className="w-4 h-4 text-indigo-400" />
                    Active Comparison Pathways
                  </h3>

                  {/* Search bar */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search decisions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121214] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {["All", "Career", "Finance & Purchasing", "Entrepreneurship", "Education", "Travel", "General"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        categoryFilter === cat
                          ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold"
                          : "bg-[#161618] border border-white/10 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Decisions Table Cards */}
                <div className="space-y-4">
                  {filteredDecisions.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-900/10 border border-slate-850 flex flex-col items-center justify-center text-slate-400">
                      <HelpCircle className="w-10 h-10 text-slate-700 mb-2.5" />
                      <p className="font-medium font-display">No Decisions Configured</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Establish your first comparison workspace or reset your filters.
                      </p>
                    </div>
                  ) : (
                    filteredDecisions.map((dec) => {
                      const optLen = dec.options?.length || 0;
                      const isCompleted = dec.analysis !== null;

                      return (
                        <div
                          key={dec.id}
                          className="group relative p-5.5 rounded-2xl bg-[#161618] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm"
                        >
                          {/* Star indicator right top corner */}
                          <button 
                            onClick={() => toggleFavorite(dec)}
                            className="absolute top-4 right-4 p-1 rounded-md text-slate-600 hover:text-yellow-400 transition-colors cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${dec.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          </button>

                          <div className="space-y-2 flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#121214] text-slate-400 border border-white/5">
                                {dec.category}
                              </span>
                              {dec.deadline && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                  <Clock className="w-3 h-3" />
                                  Due {new Date(dec.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <h4 
                              onClick={() => { setActiveDecision(dec); setOptionsList(dec.options || []); setCurrentView("compare"); }}
                              className="text-base font-semibold text-slate-100 hover:text-indigo-400 cursor-pointer font-display transition-colors truncate"
                            >
                              {dec.title}
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 max-w-2xl">
                              {dec.description || "No context specified."}
                            </p>
                          </div>

                          {/* Quick details */}
                          <div className="flex items-center gap-4 justify-between md:justify-end shrink-0 pt-3 md:pt-0 border-t border-slate-900 md:border-none">
                            <div className="flex items-center gap-6">
                              <div className="text-left md:text-right">
                                <span className="block text-[10px] text-slate-500 font-mono">OPTIONS</span>
                                <span className="text-sm font-bold text-slate-200 font-display">{optLen}</span>
                              </div>

                              <div className="text-left md:text-right">
                                <span className="block text-[10px] text-slate-500 font-mono">AI RATING</span>
                                {isCompleted ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 font-mono">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {dec.analysis?.recommendation.confidenceScore}%
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500 font-mono italic">Pending</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 ml-2">
                              <button
                                onClick={() => { setActiveDecision(dec); setOptionsList(dec.options || []); setCurrentView("compare"); }}
                                className="p-2 rounded-lg bg-[#121214] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition-all cursor-pointer"
                                title="Open Workspace"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(dec.id)}
                                className="p-2 rounded-lg bg-[#121214]/40 border border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDecision(dec.id)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Side Stats Widgets */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Seed Data Guide banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    <h4 className="text-sm font-bold font-display text-slate-200">DecisionIQ Playbook</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Test comparative engines with pre-loaded scenarios! Explore the <b>"Corporate vs. Startup CTO"</b> or <b>"Work Laptop Choice"</b> paths to see SWOT panels, Radar indices, decision trees, and simulation charts in action instantly.
                  </p>
                </div>

                {/* Category stats donut mockup */}
                {dashboardStats && dashboardStats.categoryDistribution.length > 0 && (
                  <div className="p-5.5 rounded-2xl glass-panel border border-slate-850/60">
                    <h4 className="text-xs font-mono tracking-widest text-slate-400 uppercase font-semibold mb-4 flex items-center gap-2">
                      <BarChart4 className="w-4 h-4 text-sky-400" />
                      Domain Allocation
                    </h4>
                    
                    <div className="space-y-3.5">
                      {dashboardStats.categoryDistribution.map((cat, idx) => {
                        const total = dashboardStats.totalDecisions || 1;
                        const pct = Math.round((cat.value / total) * 100);
                        
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-300">{cat.name}</span>
                              <span className="font-mono text-slate-400">{cat.value} ({pct}%)</span>
                            </div>
                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${
                                  idx % 3 === 0 
                                    ? "from-sky-500 to-sky-400" 
                                    : idx % 3 === 1 
                                    ? "from-purple-500 to-purple-400" 
                                    : "from-rose-500 to-rose-400"
                                }`} 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* ================= NEW DECISION FORMS ================= */}
        {currentView === "new-decision" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            
            <div className="border-b border-slate-900 pb-5">
              <h1 className="text-2xl font-bold font-display text-white">Create New Decision Path</h1>
              <p className="text-xs text-slate-400 mt-1">
                Provide basic parameters and constraints. You can describe options manually later or let Gemini auto-generate options.
              </p>
            </div>

            <form onSubmit={handleCreateDecision} className="p-6 rounded-2xl bg-[#161618] border border-white/10 space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">Decision Title / Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Which work laptop should I buy? or Buying an investment property"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#121214] border border-white/10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">Description / Context</label>
                <textarea
                  placeholder="Provide background context (e.g., budget limits, timelines, preferences). The more details you provide, the smarter Gemini's comparative engine will perform!"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[#121214] border border-white/10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#121214] border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40 transition-colors"
                  >
                    {["Career", "Finance & Purchasing", "Entrepreneurship", "Education", "Travel", "General"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">Target Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#121214] border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/40 transition-colors"
                  />
                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentView("dashboard")}
                  className="px-4.5 py-2.5 rounded-xl border border-white/10 hover:bg-[#121214] text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  Establish Path
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ================= COMPARE VIEW (WORKSPACE) ================= */}
        {currentView === "compare" && activeDecision && (
          <div className="space-y-8 animate-fadeIn printable-area">
            
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-900 pb-6">
              <div className="space-y-2 max-w-4xl">
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentView("dashboard")} 
                    className="text-xs text-sky-400 hover:underline mr-2 flex items-center gap-1 shrink-0 font-mono"
                  >
                    &larr; Dashboard
                  </button>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {activeDecision.category}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight font-display text-white">
                  {activeDecision.title}
                </h1>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  {activeDecision.description || "No context specified."}
                </p>
              </div>

              {/* Action shortcuts */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-medium"
                  title="Export Options to CSV"
                >
                  <FileDown className="w-4 h-4 text-sky-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-medium"
                  title="Print PDF Report"
                >
                  <Printer className="w-4 h-4 text-purple-400" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* OPTIONS PANEL & EDITORS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Options Listing & Creator (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-300 font-mono tracking-widest uppercase flex items-center gap-1.5">
                    <Sliders className="w-4.5 h-4.5 text-sky-400" />
                    Comparison Options ({optionsList.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAIGenerateOptions}
                      disabled={aiGeneratingOptions}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-purple-300 transition-all text-xs font-medium disabled:opacity-50"
                    >
                      {aiGeneratingOptions ? (
                        <>
                          <Loader2 className="w-3 animate-spin" />
                          <span>AI generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Auto-Options</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setIsAddingOption(!isAddingOption)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-slate-950 transition-all text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Option Form */}
                <AnimatePresence>
                  {isAddingOption && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden p-5.5 rounded-2xl glass-panel border border-white/10 space-y-4"
                    >
                      <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-200">
                        Register New Option Alternative
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Option Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Apple MacBook Pro"
                            value={optTitle}
                            onChange={(e) => setOptTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Estimate Price/Cost</label>
                          <input
                            type="text"
                            placeholder="e.g. $3200"
                            value={optCost}
                            onChange={(e) => setOptCost(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-mono uppercase block">Description</label>
                        <textarea
                          placeholder="Brief explanation of this option..."
                          value={optDesc}
                          onChange={(e) => setOptDesc(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Expected ROI</label>
                          <input
                            type="text"
                            placeholder="e.g. High, 3x"
                            value={optROI}
                            onChange={(e) => setOptROI(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Risk Rating</label>
                          <select
                            value={optRisk}
                            onChange={(e: any) => setOptRisk(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Very High">Very High</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Time Commitment</label>
                          <input
                            type="text"
                            placeholder="e.g. 40 hours/week"
                            value={optTime}
                            onChange={(e) => setOptTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Benefits (one per line)</label>
                          <textarea
                            placeholder="Excellent performance..."
                            value={optBenefitsText}
                            onChange={(e) => setOptBenefitsText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-mono uppercase block">Disadvantages (one per line)</label>
                          <textarea
                            placeholder="Very expensive..."
                            value={optDisadvantagesText}
                            onChange={(e) => setOptDisadvantagesText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingOption(false)}
                          className="px-3.5 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-slate-950 font-semibold text-xs transition-all shadow-sm"
                        >
                          Add Option Alternative
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Option alternative list */}
                <div className="space-y-4">
                  {optionsList.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl bg-slate-900/10 border border-dashed border-slate-800 text-slate-500 text-xs flex flex-col items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-slate-700 mb-2" />
                      <span>No option alternatives established yet. Click <b>"Add Option"</b> or let <b>"AI Auto-Options"</b> generate them.</span>
                    </div>
                  ) : (
                    optionsList.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-5 rounded-2xl glass-panel border border-slate-850 flex flex-col gap-3 relative hover:border-slate-800 transition-all"
                      >
                        {/* Remove Option Button */}
                        <button
                          onClick={() => handleDeleteOption(opt.id)}
                          className="absolute top-4 right-4 p-1 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-1 pr-6">
                          <h4 className="text-sm font-semibold text-slate-200 block font-display">{opt.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{opt.description || "No description provided."}</p>
                        </div>

                        {/* Badges metadata info */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900 mt-1">
                          {opt.price && (
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              Cost: {opt.price}
                            </span>
                          )}
                          {opt.riskLevel && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              opt.riskLevel === 'Low' 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : opt.riskLevel === 'High' || opt.riskLevel === 'Very High'
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                            }`}>
                              Risk: {opt.riskLevel}
                            </span>
                          )}
                          {opt.expectedROI && (
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              ROI: {opt.expectedROI}
                            </span>
                          )}
                          {opt.timeRequired && (
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              Time: {opt.timeRequired}
                            </span>
                          )}
                        </div>

                        {/* Pros and cons indicators */}
                        {(opt.benefits.length > 0 || opt.disadvantages.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {opt.benefits.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Benefits</span>
                                <ul className="space-y-1">
                                  {opt.benefits.slice(0, 3).map((b, idx) => (
                                    <li key={idx} className="text-[11px] text-slate-400 leading-relaxed truncate">
                                      &bull; {b}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {opt.disadvantages.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Drawbacks</span>
                                <ul className="space-y-1">
                                  {opt.disadvantages.slice(0, 3).map((d, idx) => (
                                    <li key={idx} className="text-[11px] text-slate-400 leading-relaxed truncate">
                                      &bull; {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Save options button */}
                {optionsList.length > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/10 border border-slate-850">
                    <span className="text-xs text-slate-400">Ensure any manual adjustments or new options are saved.</span>
                    <button
                      onClick={handleSaveOptions}
                      className="px-4.5 py-2 rounded-xl border border-sky-500/20 hover:border-sky-500/40 bg-sky-500/5 text-sky-400 text-xs font-semibold transition-all"
                    >
                      Save Workspace
                    </button>
                  </div>
                )}
              </div>

              {/* Core Intelligence trigger panel (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-transparent border border-white/5 shadow-2xl space-y-6">
                  
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200 font-display">Core Reasoning Engine</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Trigger detailed comparative algorithms.</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Once options are set, DecisionIQ's reasoning engine will analyze financial projections, opportunities, and risks. This generates comparative tables, radar indices, SWOT arrays, outcome timelines, and decision trees.
                  </p>

                  <button
                    onClick={handleAIRunAnalysis}
                    disabled={aiAnalyzing || optionsList.length < 2}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-purple-500 to-rose-500 hover:opacity-95 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2.5 disabled:bg-slate-850 disabled:text-slate-600 disabled:opacity-50"
                  >
                    {aiAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Formulating Analysis Matrix...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Trigger Comparative AI</span>
                      </>
                    )}
                  </button>

                  {optionsList.length < 2 && (
                    <div className="flex items-center gap-2 text-[10px] text-amber-500 bg-amber-500/5 p-2 rounded border border-amber-500/10">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Establish at least 2 options to compare prior to triggering the AI.</span>
                    </div>
                  )}
                </div>

                {/* Voice assistance inside sidebar */}
                <VoiceController decisionId={activeDecision.id} />

              </div>
            </div>

            {/* AI COMPARATIVE ANALYTICS VISUAL RESULTS PANELS */}
            {activeDecision.analysis ? (
              <div className="space-y-10 border-t border-slate-900 pt-10">
                
                {/* 1. BEST OPTION REVEAL RECOMMENDATION BANNER */}
                <div className="p-6.5 rounded-3xl bg-gradient-to-br from-purple-500/15 via-sky-500/10 to-transparent border border-purple-500/30 shadow-2xl relative overflow-hidden flex flex-col gap-4">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent blur-2xl pointer-events-none"></div>

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Primary AI Recommendation
                    </span>
                    
                    <span className="text-xs text-slate-400 font-mono">
                      CONFIDENCE: <b className="text-white font-bold">{activeDecision.analysis.recommendation.confidenceScore}%</b>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-semibold tracking-tight font-display text-white">
                      Recommended: {" "}
                      <span className="text-sky-400 underline decoration-sky-400/30 underline-offset-4">
                        {
                          (activeDecision.options.find(o => o.id === activeDecision.analysis?.recommendation.bestOptionId) || 
                           { title: "Option Alternative" }).title
                        }
                      </span>
                    </h2>
                    
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans pt-1">
                      {activeDecision.analysis.recommendation.reason}
                    </p>
                  </div>

                  {/* Summary card read-out */}
                  <div 
                    id="ai-recommendation-summary"
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed"
                  >
                    <b className="text-white font-semibold">Summary Briefing:</b> {activeDecision.analysis.recommendation.summary}
                  </div>

                  {/* Alternative strategy */}
                  {activeDecision.analysis.recommendation.alternativeRecommendation && (
                    <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-900 pt-3">
                      <span className="text-slate-300 font-semibold uppercase font-mono tracking-wider text-[10px] block mb-1">
                        Fallback / Alternative Strategy:
                      </span>
                      {activeDecision.analysis.recommendation.alternativeRecommendation}
                    </div>
                  )}

                  {/* Suggestions for improvement */}
                  {activeDecision.analysis.recommendation.improvementSuggestions?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-slate-300 font-semibold uppercase font-mono tracking-wider text-[10px] block">
                        Tactical Action Plan:
                      </span>
                      <ul className="space-y-1.5 pl-1">
                        {activeDecision.analysis.recommendation.improvementSuggestions.map((sug, idx) => (
                          <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 2. MODERN RECHARTS CHARTS COMPARISONS */}
                <OutcomeChart decision={activeDecision} />

                {/* 3. DYNAMIC WHAT-IF SIMULATOR */}
                <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold font-display text-slate-100">Dynamic What-if Simulator</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Recalculate parameters on the fly with hypothetical scenario models.</p>
                    </div>
                  </div>

                  <form onSubmit={handleWhatIfSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
                    <input
                      type="text"
                      required
                      placeholder="e.g. What if my budget increases by 25%? or What if the market crashes next year?"
                      value={whatIfInput}
                      onChange={(e) => setWhatIfInput(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none w-full"
                    />
                    <button
                      type="submit"
                      disabled={whatIfLoading || !whatIfInput.trim()}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-semibold transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
                    >
                      {whatIfLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <span>Recalculate Bounds</span>
                      )}
                    </button>
                  </form>

                  {/* Render simulated scores comparison results */}
                  <AnimatePresence>
                    {whatIfResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-5 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-4"
                      >
                        <h4 className="text-xs font-bold font-mono text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-sky-400" />
                          Simulated Scenario Outcome Matrix
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                          
                          {/* Simulated Scores table */}
                          <div className="space-y-3.5">
                            <span className="text-[10px] font-mono text-slate-400 block uppercase font-medium">Recalculated Parameter Indices:</span>
                            {whatIfResults.updatedScores?.map((score: any) => {
                              const option = activeDecision.options.find(o => o.id === score.optionId);
                              if (!option) return null;

                              return (
                                <div key={score.optionId} className="space-y-1.5 p-3 rounded-lg bg-slate-950/40 border border-slate-850">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-200">{option.title}</span>
                                    <span className="font-mono text-slate-400">Alignment: {score.overallScore}%</span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-900 mt-1">
                                    <span>Cost safety: {score.costScore}</span>
                                    <span>Risk safety: {score.riskScore}</span>
                                    <span>Prob: {score.successProbability}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Simulated Recommendation response */}
                          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3.5">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono text-purple-400 block uppercase font-medium">Revised Best Strategy:</span>
                              <span className="text-sm font-semibold text-white font-display block">
                                {
                                  (activeDecision.options.find(o => o.id === whatIfResults.updatedRecommendation?.bestOptionId) || 
                                   { title: "Option Alternative" }).title
                                }
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {whatIfResults.updatedRecommendation?.reason}
                            </p>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. SWOT MATRIX PER OPTION & RISKS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <RiskMatrix decision={activeDecision} />
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-slate-300 font-mono tracking-widest uppercase flex items-center gap-1.5">
                      <Layers className="w-4.5 h-4.5 text-purple-400" />
                      SWOT Strategic Quadrants
                    </h3>
                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                      {activeDecision.analysis.optionAnalyses.map((oa) => {
                        const option = activeDecision.options.find(o => o.id === oa.optionId);
                        if (!option) return null;
                        return (
                          <SWOTPanel key={oa.optionId} swot={oa.swot} optionTitle={option.title} />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 5. TREE GENERATOR & EXPLAINABLE AI */}
                {activeDecision.analysis.decisionTree && (
                  <DecisionTree tree={activeDecision.analysis.decisionTree} />
                )}

                {/* 6. EXPLAINABLE AI REPORT */}
                <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold font-display text-slate-100">Explainable AI Audit Report</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Understand how parameters and variables are weighted behind the scenes.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Weightings explain block */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900">
                        <span className="text-[10px] font-mono text-emerald-400 block uppercase font-medium mb-1">Mathematical Formula Alignment:</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activeDecision.analysis.explainableAI?.how || "Parameters calculated by compiling cost thresholds, capability index weights, and risk boundaries."}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900">
                        <span className="text-[10px] font-mono text-sky-400 block uppercase font-medium mb-1">Empirical Evidence & Justification:</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activeDecision.analysis.explainableAI?.evidence || "Industry trends and career stability ratios parsed from official databases."}
                        </p>
                      </div>
                    </div>

                    {/* Tradeoffs explain block */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900">
                        <span className="text-[10px] font-mono text-rose-400 block uppercase font-medium mb-1">Trade-offs & Sacrifices:</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activeDecision.analysis.explainableAI?.tradeoffs || "Choosing the highly aligned path involves sacrificing short term volatility bounds."}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900">
                        <span className="text-[10px] font-mono text-purple-400 block uppercase font-medium mb-1 font-semibold">Confidence Score Justification:</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activeDecision.analysis.explainableAI?.confidenceJustification || "Confidence rated high due to comprehensive benefits metrics listed."}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 7. ADVISOR CHAT MODULE */}
                <div className="border-t border-slate-900 pt-10">
                  <h3 className="text-sm font-semibold text-slate-300 font-mono tracking-widest uppercase mb-6 flex items-center gap-1.5">
                    <MessageSquare className="w-4.5 h-4.5 text-sky-400" />
                    Interactive Advisor Chat
                  </h3>
                  <DecisionChat 
                    decision={activeDecision} 
                    onChatUpdated={(updatedHistory) => {
                      if (activeDecision) {
                        setActiveDecision({ ...activeDecision, chatHistory: updatedHistory });
                      }
                    }} 
                  />
                </div>

              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-slate-900/10 border border-dashed border-slate-800 text-slate-400 flex flex-col items-center justify-center max-w-lg mx-auto">
                <Brain className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
                <h4 className="text-base font-semibold font-display text-slate-200">Comparative Intelligence Offline</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You have not triggered the comparative AI analyzer yet. Click the <b>"Trigger Comparative AI"</b> button to compile scores, SWOTs, predictions, decision trees, and explanations!
                </p>
              </div>
            )}

          </div>
        )}

        {/* ================= USER PROFILE VIEW ================= */}
        {currentView === "profile" && currentUser && (
          <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
            
            <div className="border-b border-slate-900 pb-5 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display text-white">Your Profile Settings</h1>
                <p className="text-xs text-slate-400 mt-1">Configure localized preferences and review user metadata.</p>
              </div>
              <button 
                onClick={() => setCurrentView("dashboard")} 
                className="text-xs text-sky-400 hover:underline"
              >
                Back to Dashboard
              </button>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-6">
              
              <div className="flex items-center gap-4 border-b border-slate-900 pb-5">
                <img src={currentUser.avatar} alt="Avatar" className="w-16 h-16 rounded-full border border-sky-500/20 shadow-lg" />
                <div>
                  <span className="block text-sm font-semibold text-white font-display">{currentUser.name}</span>
                  <span className="block text-xs text-slate-500 font-mono">{currentUser.email}</span>
                </div>
              </div>

              {/* Profile fields */}
              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-medium">Update User Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    id="profile-name-input"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-sky-500/40"
                  />
                </div>

                {/* Simulated Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-900 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">AI Voice Assistant Speech Mode</span>
                    <span className="text-slate-500 mt-0.5 block">Trigger auditory descriptions immediately when predictions finish.</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={currentUser.preferences?.voiceEnabled}
                    id="profile-voice-toggle"
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/50 border border-slate-900 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">Premium Dark Obsidian Canvas</span>
                    <span className="text-slate-500 mt-0.5 block">Utilize highly polarized low-light shades.</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={currentUser.preferences?.darkMode}
                    disabled
                    className="w-4 h-4 rounded text-sky-500 bg-slate-900 opacity-60"
                  />
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  onClick={() => {
                    const name = (document.getElementById("profile-name-input") as HTMLInputElement).value;
                    const voice = (document.getElementById("profile-voice-toggle") as HTMLInputElement).checked;
                    handleProfileUpdate(name, voice);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-sky-500/10"
                >
                  Save Profile Configuration
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Futuristic Glass Footer */}
      <footer className="w-full border-t border-slate-900/60 py-6 px-6 text-center text-slate-500 text-[10px] font-mono tracking-wider bg-slate-950/80 shrink-0">
        <p>&copy; {new Date().getFullYear()} DECISIONIQ AI CORP. POWERED BY GOOGLE GENAI LLM ENGINE. ALL RIGHTS RESERVED.</p>
        <p className="mt-1 text-slate-600">PRODUCTION BUILD V2.5.0-STABLE. RUNNING ON ISOLATED SANDBOXCONTAINER 3000.</p>
      </footer>

    </div>
  );
}
