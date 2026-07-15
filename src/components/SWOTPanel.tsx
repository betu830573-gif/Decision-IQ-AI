import React from "react";
import { SWOT } from "../types";
import { PlusCircle, MinusCircle, TrendingUp, AlertOctagon } from "lucide-react";

interface SWOTPanelProps {
  swot: SWOT;
  optionTitle: string;
  key?: React.Key;
}

export default function SWOTPanel({ swot, optionTitle }: SWOTPanelProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161618] p-6 shadow-sm">
      <h4 className="mb-4 text-sm font-medium tracking-wider text-slate-400 uppercase font-mono">
        SWOT Strategic Matrix – {optionTitle}
      </h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* STRENGTHS */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/10 bg-emerald-950/10 p-5">
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl"></div>
          <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400 font-display">
            <PlusCircle className="h-4.5 w-4.5 text-emerald-400" />
            Strengths (Internal)
          </h5>
          <ul className="space-y-2">
            {swot.strengths.length > 0 ? (
              swot.strengths.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"></span>
                  {str}
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No internal strengths identified</li>
            )}
          </ul>
        </div>

        {/* WEAKNESSES */}
        <div className="relative overflow-hidden rounded-xl border border-rose-500/10 bg-rose-950/10 p-5">
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-rose-500/10 to-transparent blur-xl"></div>
          <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-400 font-display">
            <MinusCircle className="h-4.5 w-4.5 text-rose-400" />
            Weaknesses (Internal)
          </h5>
          <ul className="space-y-2">
            {swot.weaknesses.length > 0 ? (
              swot.weaknesses.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400"></span>
                  {str}
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No internal weaknesses identified</li>
            )}
          </ul>
        </div>

        {/* OPPORTUNITIES */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-500/10 bg-indigo-950/10 p-5">
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-indigo-500/10 to-transparent blur-xl"></div>
          <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-400 font-display">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
            Opportunities (External)
          </h5>
          <ul className="space-y-2">
            {swot.opportunities.length > 0 ? (
              swot.opportunities.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400"></span>
                  {str}
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No external opportunities identified</li>
            )}
          </ul>
        </div>

        {/* THREATS */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/10 bg-amber-950/10 p-5">
          <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-amber-500/10 to-transparent blur-xl"></div>
          <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400 font-display">
            <AlertOctagon className="h-4.5 w-4.5 text-amber-400" />
            Threats (External)
          </h5>
          <ul className="space-y-2">
            {swot.threats.length > 0 ? (
              swot.threats.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"></span>
                  {str}
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No external threats identified</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
