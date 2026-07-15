import React from "react";
import { RiskAnalysis, Decision } from "../types";
import { Shield, ShieldAlert, ShieldX, Info } from "lucide-react";

interface RiskMatrixProps {
  decision: Decision;
}

export default function RiskMatrix({ decision }: RiskMatrixProps) {
  if (!decision.analysis || !decision.analysis.risks) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#161618] border border-white/10 text-slate-400">
        <Info className="w-8 h-8 text-slate-500 mb-2" />
        <p className="font-display">Risk Map Not Calculated</p>
      </div>
    );
  }

  const riskMap = decision.analysis.risks;

  const categories: { key: keyof RiskAnalysis; label: string; desc: string }[] = [
    { key: "financial", label: "Financial Risk", desc: "Capital exposure, direct/indirect costs, and budget overruns." },
    { key: "career", label: "Career Risk", desc: "Impact on professional growth, title, and job marketability." },
    { key: "technical", label: "Technical Risk", desc: "Complexity, scalability, single-point-failures, and implementation debt." },
    { key: "market", label: "Market Risk", desc: "Industry changes, competitive landscape, and demand fluctuation." },
    { key: "opportunity", label: "Opportunity Risk", desc: "What you miss out on by picking this option instead of others." },
    { key: "legal", label: "Legal/Regulatory", desc: "Compliance, licensing contracts, and legal liabilities." },
    { key: "personal", label: "Personal/Well-being", desc: "Stress, work-life balance, fatigue, and relation impacts." },
  ];

  const getRiskStyles = (level: string) => {
    switch (level) {
      case "Very High":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
          icon: <ShieldX className="w-4 h-4 text-rose-400" />
        };
      case "High":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
          icon: <ShieldAlert className="w-4 h-4 text-amber-400" />
        };
      case "Medium":
        return {
          bg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
          dot: "bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.6)]",
          icon: <ShieldAlert className="w-4 h-4 text-yellow-400" />
        };
      default: // Low
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
          icon: <Shield className="w-4 h-4 text-emerald-400" />
        };
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#161618] border border-white/10 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-medium font-display text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Multi-Dimensional Risk Analyzer
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          AI-calculated risk level matrix across critical domains, assessing risk exposure on a granular scale.
        </p>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.key} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#121214] border border-white/10 hover:border-white/20 transition-all duration-200 gap-4">
            <div className="flex-1">
              <span className="text-sm font-semibold text-slate-200 block font-display">{cat.label}</span>
              <span className="text-xs text-slate-400 mt-1 block leading-relaxed">{cat.desc}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {decision.options.map((opt) => {
                const optRisk = riskMap[opt.id] || riskMap[opt.title];
                const val = optRisk ? optRisk[cat.key] : "Low";
                const styles = getRiskStyles(val);

                return (
                  <div 
                    key={opt.id} 
                    className="flex flex-col items-start min-w-[130px] p-2 rounded-lg bg-white/[0.02] border border-white/10"
                  >
                    <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[120px] mb-1">
                      {opt.title}
                    </span>
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-medium w-full justify-between ${styles.bg}`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                        <span>{val}</span>
                      </div>
                      {styles.icon}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
