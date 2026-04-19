import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { 
  Calculator, 
  Home, 
  Percent, 
  Calendar, 
  TrendingUp, 
  Info,
  ChevronDown,
  Download,
  Table as TableIcon,
  BarChart3,
  ShieldCheck,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Sun,
  Moon,
  Languages
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Translations dictionary
const translations = {
  ID: {
    appName: "KPR Rumah Kita",
    appSubName: "Simulasi Kredit Pemilikan Rumah",
    parameters: "Parameter KPR",
    realizationDate: "Tanggal Realisasi Pinjaman",
    loanAmount: "Jumlah Pinjaman (Plafon)",
    interestScheme: "Skema Suku Bunga",
    fixed: "Tetap (Fixed)",
    tiered: "Berjenjang (Tiered)",
    fixedRate: "Suku Bunga Fixed (%)",
    fixedPeriod: "Masa Fixed (Tahun)",
    floatingRate: "Suku Bunga Floating (%)",
    tenor: "Tenor Total (Tahun)",
    addTier: "Tambah Jenjang",
    yearSuffix: "Tahun",
    analysis: "Analisis Pembayaran",
    schedule: "Jadwal Amortisasi",
    monthlyPayment: "Cicilan Per Bulan",
    totalPayment: "Total Pembayaran",
    totalInterest: "Total Bunga",
    maturityDate: "Tanggal Jatuh Tempo",
    paymentSummary: "Ringkasan Pembayaran",
    principalPaid: "Total Pokok",
    interestPaid: "Total Bunga",
    remainingBalance: "Sisa Pinjaman",
    month: "Bulan",
    date: "Tanggal",
    payment: "Angsuran",
    principal: "Pokok",
    interest: "Bunga",
    balance: "Saldo",
    chartTitle: "Proyeksi Saldo Pinjaman",
    chartSubTitle: "Pokok vs Bunga",
    summaryTitle: "Komposisi Total",
    summarySubTitle: "Selama Masa Kredit",
    maturitySubtitle: "Estimasi Lunas",
    tierYear: "Thn",
    tierRate: "Bunga",
    delete: "Hapus",
    fixedMode: "Mode Tetap",
    startCalendar: "Pilih Tanggal",
    monthlyData: "Data Angsuran",
    amortizationTitle: "Tabel Jadwal Amortisasi",
    amortizationSub: "Detail rincian pembayaran pokok dan bunga bulan demi bulan",
    analysisVisual: "Visualisasi Analisis",
    amortizationSchedule: "Jadwal Angsuran",
    detailedReport: "Laporan Detail & Analisis",
    floatingMode: "Mode Mengambang (Floating)",
    maturityDesc: "Estimasi waktu hingga pinjaman lunas sepenuhnya",
    balanceTrend: "Proyeksi Sisa Pinjaman",
    financialData: "Data Keuangan (Opsional)",
    monthlyIncome: "Penghasilan Bulanan",
    dsrAnalysis: "Untuk analisis rasio hutang (DSR).",
    aiAdvisorTitle: "Penasihat Cerdas AI",
    aiAdvisorDesc: "Dapatkan analisis mendalam mengenai simulasi kredit Anda. Apakah cicilan ini aman untuk keuangan Anda? Bagaimana strategi pelunasannya?",
    askAiButton: "Minta Analisis AI",
    aiAnalyzing: "Menganalisis...",
    poweredByGemini: "Powered by Gemini",
    analysisResult: "Hasil Analisis AI"
  },
  EN: {
    appName: "Our Home Mortgage",
    appSubName: "Home Loan Simulation",
    parameters: "Mortgage Parameters",
    realizationDate: "Loan Realization Date",
    loanAmount: "Loan Amount (Principal)",
    interestScheme: "Interest Scheme",
    fixed: "Fixed Rate",
    tiered: "Tiered Rate",
    fixedRate: "Fixed Rate (%)",
    fixedPeriod: "Fixed Period (Years)",
    floatingRate: "Floating Rate (%)",
    tenor: "Total Tenor (Years)",
    addTier: "Add Tier",
    yearSuffix: "Years",
    analysis: "Payment Analysis",
    schedule: "Amortization Schedule",
    monthlyPayment: "Monthly Payment",
    totalPayment: "Total Payment",
    totalInterest: "Total Interest",
    maturityDate: "Maturity Date",
    paymentSummary: "Payment Summary",
    principalPaid: "Total Principal",
    interestPaid: "Total Interest",
    remainingBalance: "Remaining Balance",
    month: "Month",
    date: "Date",
    payment: "Installment",
    principal: "Principal",
    interest: "Interest",
    balance: "Balance",
    chartTitle: "Loan Balance Projection",
    chartSubTitle: "Principal vs Interest",
    summaryTitle: "Total Composition",
    summarySubTitle: "Throughout Loan Term",
    maturitySubtitle: "Estimated Payoff",
    tierYear: "Yrs",
    tierRate: "Rate",
    delete: "Delete",
    fixedMode: "Fixed Mode",
    startCalendar: "Pick Date",
    monthlyData: "Installment Data",
    amortizationTitle: "Amortization Schedule Table",
    amortizationSub: "Month-by-month breakdown of principal and interest payments",
    analysisVisual: "Analysis Visualization",
    amortizationSchedule: "Amortization Table",
    detailedReport: "Detailed Report & Analysis",
    floatingMode: "Floating Mode",
    maturityDesc: "Estimated time until the loan is fully paid off",
    balanceTrend: "Loan Balance Projection",
    financialData: "Financial Data (Optional)",
    monthlyIncome: "Monthly Income",
    dsrAnalysis: "For debt service ratio (DSR) analysis.",
    aiAdvisorTitle: "AI Smart Advisor",
    aiAdvisorDesc: "Get in-depth analysis of your credit simulation. Is this installment safe for your finances? What is the repayment strategy?",
    askAiButton: "Ask for AI Analysis",
    aiAnalyzing: "Analyzing...",
    poweredByGemini: "Powered by Gemini",
    analysisResult: "AI Analysis Result"
  }
};

// Format currency
const formatCurrency = (value: number, lang: "ID" | "EN") => {
  const formattedNumber = new Intl.NumberFormat(lang === "ID" ? "id-ID" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
  return `Rp${formattedNumber}`;
};

// Format date
const formatDate = (date: Date, lang: "ID" | "EN") => {
  return new Intl.DateTimeFormat(lang === "ID" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatShortDate = (date: Date, lang: "ID" | "EN") => {
  return new Intl.DateTimeFormat(lang === "ID" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
};

// Format number with thousand separator
const formatNumberByLang = (value: number, lang: "ID" | "EN") => {
  return new Intl.NumberFormat(lang === "ID" ? "id-ID" : "en-US").format(value);
};

interface AmortizationItem {
  month: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

interface RateTier {
  rate: number;
  years: number;
}

export default function App() {
  const [lang, setLang] = useState<"ID" | "EN">(() => {
    return (localStorage.getItem("app-lang") as "ID" | "EN") || "ID";
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("app-theme") === "dark";
  });

  const [loanAmount, setLoanAmount] = useState<number>(664000000);
  const [realizationDate, setRealizationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [interestScheme, setInterestScheme] = useState<"fixed" | "tiered">("fixed");
  
  const [fixedRate, setFixedRate] = useState<number>(5.75);
  const [fixedYears, setFixedYears] = useState<number>(5);
  
  const [tieredRates, setTieredRates] = useState<RateTier[]>([
    { rate: 5.75, years: 5 }
  ]);

  const [floatingRate, setFloatingRate] = useState<number>(11.0);
  const [tenor, setTenor] = useState<number>(20);
  const [activeTab, setActiveTab] = useState<"analysis" | "schedule">("analysis");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(25000000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleAiAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analisis simulasi KPR berikut dalam Bahasa ${lang === "ID" ? "Indonesia" : "Inggris"}:
      - Plafon Pinjaman: ${formatCurrency(loanAmount, lang)}
      - Tenor: ${tenor} tahun
      - Skema: ${interestScheme === "fixed" ? "Fixed" : "Berjenjang"}
      - Suku Bunga Floating: ${floatingRate}%
      - Penghasilan Bulanan: ${formatCurrency(monthlyIncome, lang)}
      
      Pertanyaan:
      1. Apakah cicilan ini aman dengan penghasilan tersebut (berdasarkan DSR)?
      2. Berikan saran strategi pelunasan atau pengelolaan cicilan ini.
      
      Berikan jawaban yang ringkas, profesional, dan dalam format Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiAnalysis(response.text || "Gagal mendapatkan analisis.");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("Maaf, terjadi kesalahan saat menghubungi asisten AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem("app-lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("app-theme", isDark ? "dark" : "light");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Calculations
  const results = useMemo(() => {
    const totalMonths = tenor * 12;
    
    // Construct all steps: [{ rate, months }]
    interface RateStep { rate: number; months: number; }
    const steps: RateStep[] = [];
    
    if (interestScheme === "fixed") {
      const fMonths = Math.min(fixedYears * 12, totalMonths);
      steps.push({ rate: fixedRate, months: fMonths });
    } else {
      let currentFixedMonths = 0;
      tieredRates.forEach(tier => {
        const m = Math.min(tier.years * 12, Math.max(0, totalMonths - currentFixedMonths));
        if (m > 0) {
          steps.push({ rate: tier.rate, months: m });
          currentFixedMonths += m;
        }
      });
    }

    // Add final floating step
    const totalFixedMonths = steps.reduce((sum, s) => sum + s.months, 0);
    if (totalFixedMonths < totalMonths) {
      steps.push({ rate: floatingRate, months: totalMonths - totalFixedMonths });
    }

    // Amortization Schedule
    const schedule: AmortizationItem[] = [];
    let remaining = loanAmount;
    let totalInterest = 0;
    let currentMonth = 0;
    
    // Track monthly payments for summary
    const stepPayments: number[] = [];
    
    const startDate = new Date(realizationDate);

    steps.forEach((step) => {
      const ratePerMonth = step.rate / 100 / 12;
      const remainingTenorAtStep = totalMonths - currentMonth;
      
      // Recalculate monthly payment for this step
      let monthlyPayment = 0;
      if (ratePerMonth > 0) {
        monthlyPayment = remaining * (ratePerMonth / (1 - Math.pow(1 + ratePerMonth, -remainingTenorAtStep)));
      } else {
        monthlyPayment = remaining / remainingTenorAtStep;
      }
      
      stepPayments.push(monthlyPayment);

      for (let i = 1; i <= step.months; i++) {
        currentMonth++;
        const interestPayment = Math.round(remaining * ratePerMonth);
        const principalPayment = monthlyPayment - interestPayment;
        remaining = Math.max(0, remaining - principalPayment);
        totalInterest += interestPayment;
        
        // Calculate date for this month
        const installmentDate = new Date(startDate);
        installmentDate.setMonth(startDate.getMonth() + currentMonth);

        schedule.push({
          month: currentMonth,
          date: installmentDate,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          remainingBalance: remaining,
        });
      }
    });

    const totalPayment = loanAmount + totalInterest;
    
    const maturityDate = new Date(startDate);
    maturityDate.setFullYear(startDate.getFullYear() + tenor);

    return {
      monthlyPaymentFixed: Math.floor(stepPayments[0] || 0),
      monthlyPaymentFloating: interestScheme === "tiered" && stepPayments.length > 0
        ? Math.floor(stepPayments[stepPayments.length - 1]) 
        : Math.floor(stepPayments[1] || 0),
      allStepPayments: stepPayments.map(p => Math.floor(p)),
      totalPayment,
      totalInterest,
      schedule,
      totalMonths,
      totalFixedMonths,
      maturityDate
    };
  }, [loanAmount, interestScheme, fixedRate, fixedYears, tieredRates, floatingRate, tenor, realizationDate]);

  const pieData = [
    { name: t.principalPaid, value: loanAmount, color: isDark ? "#38BDF8" : "#0F172A" },
    { name: t.totalInterest, value: results.totalInterest, color: "#F97316" },
  ];

  // Group schedule into years for better visualization
  const yearlyData = useMemo(() => {
    return results.schedule.filter((_, idx) => (idx + 1) % 12 === 0).map((item, idx) => ({
      year: idx + 1,
      balance: item.remainingBalance,
      principalPaid: loanAmount - item.remainingBalance,
    }));
  }, [results.schedule, loanAmount]);

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300",
      isDark ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"
    )}>
      {/* Header */}
      <header className={cn(
        "border-b sticky top-0 z-50 transition-colors duration-300",
        isDark ? "bg-slate-900/80 border-slate-800 backdrop-blur-md" : "bg-white border-slate-200"
      )}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
              isDark ? "bg-orange-600 shadow-orange-900/20" : "bg-slate-900 shadow-slate-200"
            )}>
              <Home size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className={cn(
                "text-lg font-bold tracking-tight leading-none",
                isDark ? "text-slate-100" : "text-slate-900"
              )}>{t.appName}</h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mt-1">{t.appSubName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button 
              onClick={() => setLang(lang === "ID" ? "EN" : "ID")}
              className={cn(
                "p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all",
                isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              <Languages size={16} />
              <span className="hidden sm:inline">{lang}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "p-2 rounded-lg transition-all",
                isDark ? "bg-slate-800 text-yellow-500 hover:bg-slate-700 hover:text-yellow-400" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Main Grid: Left (Params) & Right (Results) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Inputs & Info */}
          <div className="lg:col-span-4 space-y-14 flex flex-col h-full">
            {/* Parameters Card */}
            <div className={cn(
              "rounded-2xl border p-8 shadow-sm transition-colors duration-300",
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <div className="flex items-center gap-2 mb-8">
                <Calculator className="text-orange-500" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{t.parameters}</h2>
              </div>
              
              <div className="space-y-8">
                {/* Realization Date */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t.realizationDate}
                  </label>
                  <div className="relative group h-[52px]">
                    {/* 1. Visual Display Layer (Text and Icons) */}
                    <div className={cn(
                      "absolute inset-0 border rounded-xl flex items-center pl-12 pr-10 font-semibold transition-all z-0 shadow-sm",
                      isDark ? "bg-slate-800 border-slate-700 text-slate-100 group-hover:border-orange-500/50" : "bg-slate-50 border-slate-200 text-slate-900 group-hover:border-orange-400 group-hover:bg-white"
                    )}>
                      {realizationDate ? formatDate(new Date(realizationDate), lang) : t.startCalendar}
                    </div>
                    
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 z-10 pointer-events-none">
                      <Calendar size={18} />
                    </span>
                    
                    {/* 2. Interaction Layer: The Native Input */}
                    {/* We use a custom CSS class to make the picker indicator cover the whole area */}
                    <input 
                      type="date" 
                      value={realizationDate}
                      onChange={(e) => setRealizationDate(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 datepicker-trigger"
                    />
                    
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none group-hover:text-orange-500 transition-colors">
                      <ChevronDown size={16} />
                    </span>
                  </div>
                </div>

                {/* Loan Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                    {t.loanAmount}
                    <span className={isDark ? "text-slate-100" : "text-slate-900"}>{formatCurrency(loanAmount, lang)}</span>
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm">Rp</span>
                    <input 
                      type="text" 
                      value={loanAmount === 0 ? "" : formatNumberByLang(loanAmount, lang)} 
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        const val = raw === "" ? 0 : Number(raw);
                        setLoanAmount(val);
                      }}
                      onFocus={(e) => e.target.select()}
                      className={cn(
                        "w-full border rounded-xl py-3 pl-12 pr-4 font-semibold outline-none transition-all",
                        isDark ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      )}
                    />
                  </div>
                  <input 
                    type="range" 
                    min={100000000} 
                    max={10000000000} 
                    step={50000000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                {/* Tenor Total */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                    {t.tenor}
                    <span className={isDark ? "text-slate-100" : "text-slate-900"}>{tenor} {t.yearSuffix}</span>
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar size={18} />
                    </span>
                    <select 
                      value={tenor}
                      onChange={(e) => {
                        const newTenor = Number(e.target.value);
                        setTenor(newTenor);
                        // Fix existing fixed periods if they exceed new tenor
                        if (interestScheme === "fixed" && fixedYears > newTenor) {
                           setFixedYears(newTenor);
                        }
                      }}
                      className={cn(
                        "w-full border rounded-xl py-3 pl-12 pr-4 font-semibold appearance-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all",
                        isDark ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      )}
                    >
                      {[1, 3, 5, 8, 10, 12, 15, 20, 25, 30].map(y => (
                        <option key={y} value={y} className="dark:bg-slate-800">{y} {t.yearSuffix}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* SKEMA SUKU BUNGA SECTION */}
                <div className="space-y-6 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">{t.interestScheme}</h3>
                  
                  {/* Tab Selector */}
                  <div className={cn(
                    "flex p-1 rounded-xl gap-1",
                    isDark ? "bg-slate-800" : "bg-slate-100"
                  )}>
                    <button 
                      onClick={() => setInterestScheme("fixed")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all",
                        interestScheme === "fixed" 
                          ? (isDark ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") 
                          : "text-slate-500 hover:text-slate-400"
                      )}
                    >
                      <ShieldCheck size={14} className={interestScheme === "fixed" ? "text-orange-500" : ""} />
                      {t.fixed}
                    </button>
                    <button 
                      onClick={() => setInterestScheme("tiered")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all",
                        interestScheme === "tiered" 
                          ? (isDark ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") 
                          : "text-slate-500 hover:text-slate-400"
                      )}
                    >
                      <TrendingUp size={14} className={interestScheme === "tiered" ? "text-orange-500" : ""} />
                      {t.tiered}
                    </button>
                  </div>

                  {/* Fixed Scheme View */}
                  {interestScheme === "fixed" && (
                    <div className={cn(
                      "border rounded-2xl p-5 space-y-4 shadow-sm ring-1",
                      isDark ? "bg-slate-800/20 border-slate-800 ring-slate-800" : "bg-white border-slate-100 ring-slate-100"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">1</div>
                        <span className={cn("text-sm font-bold", isDark ? "text-slate-200" : "text-slate-700")}>{t.fixedRate} (Promo)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.tierRate} (%)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              step={0.01}
                              value={fixedRate === 0 ? "" : fixedRate} 
                              onChange={(e) => setFixedRate(e.target.value === "" ? 0 : Number(e.target.value))}
                              onFocus={(e) => e.target.select()}
                              className={cn(
                                "w-full border rounded-xl py-2.5 px-4 font-bold text-sm outline-none transition-all",
                                isDark ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                              )}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.tierYear} ({t.yearSuffix})</label>
                          <div className="relative">
                             <input 
                              type="number" 
                              value={fixedYears === 0 ? "" : fixedYears} 
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : Number(e.target.value);
                                setFixedYears(Math.min(val, tenor));
                              }}
                              onFocus={(e) => e.target.select()}
                              className={cn(
                                "w-full border rounded-xl py-2.5 px-4 font-bold text-sm outline-none transition-all",
                                isDark ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                              )}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">{t.tierYear}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tiered Scheme View */}
                  {interestScheme === "tiered" && (
                    <div className="space-y-3">
                      <div className={cn(
                        "border rounded-2xl p-5 space-y-4 shadow-sm ring-1",
                        isDark ? "bg-slate-800/20 border-slate-800 ring-slate-800" : "bg-white border-slate-100 ring-slate-100"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">1</div>
                            <span className={cn("text-sm font-bold", isDark ? "text-slate-200" : "text-slate-700")}>{t.tiered}</span>
                          </div>
                          {tieredRates.length < 5 && (
                            <button 
                              onClick={() => {
                                const totalUsed = tieredRates.reduce((sum, t) => sum + t.years, 0);
                                if (totalUsed < tenor) {
                                  setTieredRates([...tieredRates, { rate: 9.0, years: 1 }]);
                                }
                              }}
                              className="bg-orange-500/10 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-500 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                              <Plus size={14} strokeWidth={3} />
                              {t.addTier}
                            </button>
                          )}
                        </div>

                        {tieredRates.map((tier, idx) => (
                           <div key={idx} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 first:border-0 first:pt-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.tiered} {idx + 1}</span>
                                {tieredRates.length > 1 && (
                                  <button 
                                    onClick={() => setTieredRates(tieredRates.filter((_, i) => i !== idx))}
                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400">{t.tierRate} (%)</label>
                                  <div className="relative">
                                    <input 
                                      type="number" 
                                      step={0.01}
                                      value={tier.rate} 
                                      onChange={(e) => {
                                        const newRates = [...tieredRates];
                                        newRates[idx].rate = Number(e.target.value);
                                        setTieredRates(newRates);
                                      }}
                                      onFocus={(e) => e.target.select()}
                                      className={cn(
                                        "w-full border rounded-xl py-2 px-3 font-bold text-xs outline-none transition-all",
                                        isDark ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                                      )}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-[10px]">%</span>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-slate-400">{t.tierYear} ({t.yearSuffix})</label>
                                  <div className="relative">
                                    <input 
                                      type="number" 
                                      value={tier.years} 
                                      onChange={(e) => {
                                        const newRates = [...tieredRates];
                                        const val = Number(e.target.value);
                                        const otherYears = tieredRates.reduce((sum, t, i) => i === idx ? sum : sum + t.years, 0);
                                        newRates[idx].years = Math.max(0, Math.min(val, tenor - otherYears));
                                        setTieredRates(newRates);
                                      }}
                                      onFocus={(e) => e.target.select()}
                                      className={cn(
                                        "w-full border rounded-xl py-2 px-3 font-bold text-xs outline-none transition-all",
                                        isDark ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                                      )}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-[10px]">{t.tierYear}</span>
                                  </div>
                                </div>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Floating Section (Common) */}
                  <div className={cn(
                    "border rounded-2xl p-6 space-y-6 shadow-sm",
                    isDark ? "bg-red-900/10 border-red-900/40" : "bg-red-50/30 border-red-100"
                  )}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">2</div>
                      <span className={cn("text-sm font-bold", isDark ? "text-red-400" : "text-red-700")}>{t.floatingRate}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.tierRate} (%)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            step={0.1}
                            value={floatingRate === 0 ? "" : floatingRate} 
                            onChange={(e) => setFloatingRate(e.target.value === "" ? 0 : Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            className={cn(
                              "w-full border rounded-xl py-2.5 px-4 font-bold text-sm outline-none transition-all",
                              isDark ? "bg-slate-800 border-red-900/50 text-slate-100 focus:ring-2 focus:ring-red-500/20 focus:border-red-500" : "bg-white border-red-200 text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            )}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-200 font-bold text-xs">%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fixed Period</label>
                        <div className="relative">
                          <div className={cn(
                            "w-full border rounded-xl py-2.5 px-4 font-bold text-sm cursor-not-allowed",
                            isDark ? "bg-slate-800/50 border-slate-700 text-slate-500" : "bg-white/50 border-red-100 text-slate-500"
                          )}>
                            {Math.max(0, tenor - (interestScheme === "fixed" ? fixedYears : tieredRates.reduce((sum, t) => sum + t.years, 0)))} {t.yearSuffix}
                          </div>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-200 font-bold text-xs text-right">{t.tierYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Annuity Info Box */}
            <div className={cn(
              "border rounded-2xl p-6 flex gap-3 mt-4",
              isDark ? "bg-orange-900/10 border-orange-900/30" : "bg-orange-50 border-orange-100"
            )}>
              <Info className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
              <p className={cn(
                "text-[11px] leading-relaxed font-medium",
                isDark ? "text-orange-200" : "text-orange-800"
              )}>
                {lang === "ID" 
                  ? "Perhitungan ini menggunakan metode Anuitas yang umum digunakan oleh bank di Indonesia. Cicilan per bulan tetap, namun porsi pokok meningkat seiring waktu."
                  : "This calculation uses the Annuity method commonly used by banks. Monthly installments are fixed, but the principal portion increases over time."}
              </p>
            </div>
          </div>

          {/* Right Column: Results & Analysis */}
          <div className="lg:col-span-8 space-y-10">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Calculator size={120} />
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {/* Fixed Payments */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          {interestScheme === "fixed" ? t.fixed : t.tiered}
                        </h3>
                        
                        {interestScheme === "fixed" ? (
                          <div>
                            <div className="text-4xl font-black mb-1 tracking-tight">
                              {formatCurrency(results.monthlyPaymentFixed, lang)}
                            </div>
                            <p className="text-xs text-slate-500 font-medium italic">/ {t.month} ({t.fixedMode})</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                             {results.allStepPayments.slice(0, tieredRates.length).map((payment, idx) => (
                               <div key={idx} className="flex justify-between items-end border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                                  <div>
                                     <p className="text-[10px] text-slate-500 uppercase font-bold">{t.tiered} {idx + 1} ({tieredRates[idx].years} {t.yearSuffix})</p>
                                     <p className="text-lg font-bold">{formatCurrency(payment, lang)}</p>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-medium italic">{t.tierYear} {tieredRates.slice(0, idx).reduce((s, t) => s + t.years, 0) + 1} - {tieredRates.slice(0, idx + 1).reduce((s, t) => s + t.years, 0)}</p>
                               </div>
                             ))}
                          </div>
                        )}
                    </div>

                    {/* Floating Payment */}
                    {results.monthlyPaymentFloating > 0 && (
                        <div className="pt-4 border-t border-slate-800">
                           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">{t.floatingMode}</h3>
                            <div className={cn(
                              "font-bold mb-1 tracking-tight text-orange-400",
                              interestScheme === "fixed" ? "text-2xl" : "text-xl"
                            )}>
                              {formatCurrency(results.monthlyPaymentFloating, lang)}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium italic">/ {t.month} ({t.floatingRate})</p>
                        </div>
                    )}
                </div>
              </div>

              <div className={cn(
                "rounded-2xl border p-8 shadow-sm transition-all duration-300",
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              )}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t.totalInterest}</h3>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(results.totalInterest, lang)}</div>
                  </div>
                  <div className={cn("h-[1px]", isDark ? "bg-slate-800" : "bg-slate-100")} />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t.totalPayment}</h3>
                    <div className={cn("text-2xl font-bold", isDark ? "text-slate-100" : "text-slate-900")}>{formatCurrency(results.totalPayment, lang)}</div>
                  </div>
                  <div className={cn("h-[1px]", isDark ? "bg-slate-800" : "bg-slate-100")} />
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-tight text-slate-400 mb-1">{t.maturityDate}</h2>
                    <div className={cn("text-xl font-bold flex items-center gap-2", isDark ? "text-slate-100" : "text-slate-900")}>
                      <Calendar size={20} className="text-orange-500" />
                      {formatDate(results.maturityDate, lang)}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic mt-1">{t.maturityDesc}</p>
                  </div>
                </div>
            </div>
          </div>

            {/* Detailed Amortization Table Section */}
            <div className={cn(
              "rounded-3xl border shadow-sm overflow-hidden",
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black tracking-tight">{t.detailedReport}</h2>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">{t.amortizationSub}</p>
                </div>
                <div className={cn(
                   "flex p-1 rounded-xl gap-1",
                   isDark ? "bg-slate-800" : "bg-slate-100"
                )}>
                  <button 
                    onClick={() => setActiveTab("analysis")}
                    className={cn(
                      "flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all",
                      activeTab === "analysis" 
                        ? (isDark ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") 
                        : "text-slate-500 hover:text-slate-400"
                    )}
                  >
                    <BarChart3 size={14} />
                    {t.analysisVisual}
                  </button>
                  <button 
                    onClick={() => setActiveTab("schedule")}
                    className={cn(
                      "flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all",
                      activeTab === "schedule" 
                        ? (isDark ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") 
                        : "text-slate-500 hover:text-slate-400"
                    )}
                  >
                    <TableIcon size={14} />
                    {t.amortizationSchedule}
                  </button>
                </div>
              </div>
              
              <div className="p-0">
                  {activeTab === "analysis" ? (
                    <div className="animate-in fade-in duration-500 p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {/* Composition Chart */}
                      <div className="flex flex-col items-center">
                        <div className="mb-6 w-full text-center lg:text-left">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">{t.summaryTitle}</h3>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t.summarySubTitle}</p>
                        </div>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <Tooltip 
                                formatter={(val: any) => val !== undefined ? formatCurrency(val, lang) : ""}
                                contentStyle={{ 
                                  borderRadius: '12px', 
                                  border: 'none', 
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                  color: isDark ? '#F1F5F9' : '#0F172A'
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      {/* Trend Chart */}
                      <div className="flex flex-col">
                        <div className="mb-6 w-full text-center lg:text-left">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">{t.balanceTrend}</h3>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t.chartSubTitle}</p>
                        </div>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={yearlyData}>
                               <defs>
                                 <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#F97316" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#E2E8F0"} />
                               <XAxis dataKey="year" fontSize={10} tick={{fill: '#94A3B8'}} />
                               <YAxis fontSize={10} tick={{fill: '#94A3B8'}} tickFormatter={(v) => `Rp${v/1000000}M`} />
                               <Tooltip 
                                 formatter={(val: any) => val !== undefined ? formatCurrency(val, lang) : ""}
                                 contentStyle={{ 
                                   borderRadius: '12px', 
                                   border: 'none', 
                                   boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                   backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                   color: isDark ? '#F1F5F9' : '#0F172A'
                                 }}
                               />
                               <Area type="monotone" dataKey="balance" stroke="#F97316" strokeWidth={3} fill="url(#colorBalance)" />
                             </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-500">
                      <div className="overflow-x-auto border rounded-xl overflow-y-auto max-h-[600px] m-4 sm:m-6 border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left border-collapse min-w-[750px]">
                          <thead>
                            <tr className={cn(
                               "border-b sticky top-0 z-10",
                               isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-100"
                            )}>
                              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t.month}</th>
                              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t.date}</th>
                              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t.principal}</th>
                              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t.interest}</th>
                              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">{t.balance}</th>
                            </tr>
                          </thead>
                          <tbody className={cn("divide-y", isDark ? "divide-slate-800" : "divide-slate-50")}>
                            {results.schedule.map((item) => {
                              const isYearEnd = item.month % 12 === 0;
                              const isFixedPeriod = item.month <= results.totalFixedMonths;
                              const isTransition = item.month === results.totalFixedMonths;
                              
                              return (
                                <Fragment key={item.month}>
                                  <tr className={cn(
                                    "transition-colors",
                                    isDark 
                                      ? (isFixedPeriod ? "hover:bg-slate-800/50" : "bg-red-950/20 hover:bg-red-950/30") 
                                      : (isFixedPeriod ? "hover:bg-slate-50" : "bg-red-50/20 hover:bg-red-50/40")
                                  )}>
                                    <td className={cn("px-4 py-4 font-semibold flex items-center gap-2", isDark ? "text-slate-100" : "text-slate-900")}>
                                      {item.month}
                                      {!isFixedPeriod && <span className="text-[8px] bg-red-500/20 text-red-500 px-1 py-0.5 rounded font-black tracking-tighter">FLOAT</span>}
                                    </td>
                                    <td className="px-4 py-4 text-slate-500 font-bold text-xs uppercase">
                                      {formatShortDate(item.date, lang)}
                                    </td>
                                    <td className={cn("px-4 py-4 font-medium", isDark ? "text-slate-300" : "text-slate-600")}>{formatCurrency(item.principal, lang)}</td>
                                    <td className={cn("px-4 py-4 font-medium", isDark ? "text-slate-300" : "text-slate-600")}>{formatCurrency(item.interest, lang)}</td>
                                    <td className={cn("px-4 py-4 font-bold", isDark ? "text-slate-100" : "text-slate-900")}>{formatCurrency(item.remainingBalance, lang)}</td>
                                  </tr>
                                  {isTransition && item.month < results.totalMonths && (
                                    <tr className="bg-orange-600">
                                      <td colSpan={5} className="px-6 py-2 text-center text-[10px] font-black text-white uppercase tracking-[0.3em]">
                                         {lang === "ID" ? "PERIODE FIXED BERAKHIR • MULAI BUNGA FLOATING" : "FIXED PERIOD ENDS • FLOATING RATE STARTS"}
                                      </td>
                                    </tr>
                                  )}
                                  {isYearEnd && !isTransition && item.month < results.totalMonths && (
                                    <tr className={isDark ? "bg-slate-800/80 border-b-2 border-slate-700" : "bg-slate-100 border-b-2 border-slate-200"}>
                                      <td colSpan={5} className="px-6 py-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                         {lang === "ID" ? `AKHIR TAHUN ${item.month / 12} (${item.date.getFullYear()})` : `END OF YEAR ${item.month / 12} (${item.date.getFullYear()})`}
                                      </td>
                                    </tr>
                                  )}
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
        </div>
      </div>

        {/* Lower Row: Financial Data & AI advisor */}
        <div className="hidden  flex flex-col lg:flex-row gap-12 items-start mt-16"> //hilangkan kata hidden jika ingin memunculkan menu financial data dan ai advisor
          {/* Financial Data Section */}
          <div className="w-full lg:w-96 lg:flex-none h-full">
            <div className={cn(
              "rounded-2xl border p-8 shadow-sm transition-all duration-300 h-full",
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
              <h3 className={cn("text-xs font-bold uppercase tracking-wider text-slate-400 mb-6", isDark ? "text-slate-400" : "text-slate-500")}>
                {t.financialData}
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className={cn("text-[10px] font-bold text-slate-400 uppercase tracking-widest")}>
                    {t.monthlyIncome}
                  </label>
                  <div className="relative group">
                    <div className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 font-bold transition-colors",
                      isDark ? "text-slate-600 group-focus-within:text-orange-500" : "text-slate-300 group-focus-within:text-orange-500"
                    )}>
                      Rp
                    </div>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={formatNumberByLang(monthlyIncome, lang)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setMonthlyIncome(Number(val));
                      }}
                      onFocus={(e) => e.target.select()}
                      className={cn(
                        "w-full border rounded-xl py-3 pl-12 pr-4 font-bold text-sm outline-none transition-all",
                        isDark 
                          ? "bg-slate-800 border-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" 
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Smart Advisor Section */}
          <div className="flex-1 h-full">
            <div className={cn(
              "rounded-3xl p-8 relative overflow-hidden shadow-xl border border-transparent transition-all duration-500 h-full",
              isDark 
                ? "bg-slate-900/80 border-slate-800/50" 
                : "bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white"
            )}>
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className={cn("text-xl font-black tracking-tight", isDark ? "text-slate-100" : "text-white")}>
                        {t.aiAdvisorTitle}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.poweredByGemini}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!aiAnalysis && (
                    <button 
                      onClick={handleAiAnalysis}
                      disabled={isAnalyzing}
                      className={cn(
                        "group relative px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-3 transition-all active:scale-95 shadow-lg",
                        isAnalyzing
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-white text-slate-900 hover:shadow-white/10"
                      )}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Sparkles className="text-orange-500 group-hover:rotate-12 transition-transform" size={18} />
                      )}
                      {isAnalyzing ? t.aiAnalyzing : t.askAiButton}
                    </button>
                  )}
                </div>

                {!aiAnalysis ? (
                  <p className={cn(
                    "text-sm font-medium leading-relaxed max-w-2xl",
                    isDark ? "text-slate-400" : "text-slate-300"
                  )}>
                    {t.aiAdvisorDesc}
                  </p>
                ) : (
                  <div className={cn(
                    "p-6 rounded-2xl space-y-4 border transition-all duration-500 animate-in fade-in slide-in-from-bottom-4",
                    isDark ? "bg-slate-800/50 border-slate-700" : "bg-white/5 border-white/10"
                  )}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-orange-500">{t.analysisResult}</h4>
                      <button 
                        onClick={() => setAiAnalysis(null)}
                        className="text-[10px] font-bold opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
                      >
                        {lang === "ID" ? "TUTUP" : "CLOSE"}
                      </button>
                    </div>
                    <div className={cn(
                      "prose prose-sm prose-invert max-w-none",
                      "prose-p:leading-relaxed prose-p:text-slate-300 prose-strong:text-orange-400 prose-li:text-slate-300",
                      isDark ? "prose-p:text-slate-400 prose-li:text-slate-400" : ""
                    )}>
                      <Markdown>{aiAnalysis}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={cn(
        "mt-6 border-t py-4 mb-2 transition-colors duration-300",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-medium mb-3">
            {lang === "ID" 
              ? "© 2026 KPR Rumah Kita. Dibuat untuk simulasi finansial cerdas." 
              : "© 2026 Our Home Mortgage. Created for smart financial simulation."}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {/* BCA */}
            <div className="flex flex-col items-center group cursor-default">
              <div className={cn(
                "font-black text-xl tracking-tighter transition-all duration-300 group-hover:scale-110",
                isDark ? "text-[#4A90E2]" : "text-[#0060AF]"
              )}>
                BCA
              </div>
            </div>

            {/* Mandiri */}
            <div className="flex flex-col items-center group cursor-default">
              <div className={cn(
                "font-black text-lg tracking-tighter italic transition-all duration-300 group-hover:scale-110",
                isDark ? "text-[#FFD700]" : "text-[#003D79]"
              )}>
                mandiri
              </div>
            </div>

            {/* BRI */}
            <div className="flex flex-col items-center group cursor-default">
              <div className={cn(
                "font-black text-xl tracking-tighter transition-all duration-300 group-hover:scale-110",
                isDark ? "text-[#00AEEF]" : "text-[#00529C]"
              )}>
                BRI
              </div>
            </div>

            {/* BNI */}
            <div className="flex flex-col items-center group cursor-default">
              <div className={cn(
                "font-black text-xl tracking-tighter italic transition-all duration-300 group-hover:scale-110",
                isDark ? "text-[#F15A22]" : "text-[#F15A22]"
              )}>
                BNI
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
