import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { Decision } from "../types";

interface OutcomeChartProps {
  decision: Decision;
}

export default function OutcomeChart({ decision }: OutcomeChartProps) {
  if (!decision.analysis || !decision.analysis.optionAnalyses) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl glass-card text-slate-400">
        <p className="mb-2 font-display">No Analytics Available</p>
        <p className="text-sm">Run the core AI Comparative Engine to populate visual models and projections.</p>
      </div>
    );
  }

  const { optionAnalyses, recommendation } = decision.analysis;

  // Radar chart data conversion
  // Parameters to plot: Overall, Cost Score, Risk Safety, Growth, Time Safety, Value
  const parameters = [
    { key: "overallScore", label: "Overall Score" },
    { key: "costScore", label: "Cost Score" },
    { key: "riskScore", label: "Risk Safety" },
    { key: "futureGrowth", label: "Future Growth" },
    { key: "timeInvestment", label: "Time Safety" },
    { key: "returnValue", label: "Return Value" },
  ];

  const radarData = parameters.map((param) => {
    const dataRow: { [key: string]: any } = { parameter: param.label };
    optionAnalyses.forEach((oa) => {
      const option = decision.options.find((o) => o.id === oa.optionId);
      if (option) {
        dataRow[option.title] = (oa as any)[param.key] || 0;
      }
    });
    return dataRow;
  });

  // Bar chart data conversion: Success Probability & Future Score
  const barData = optionAnalyses.map((oa) => {
    const option = decision.options.find((o) => o.id === oa.optionId);
    return {
      name: option ? (option.title.length > 15 ? option.title.substr(0, 15) + "..." : option.title) : "Unknown",
      "Overall Score": oa.overallScore,
      "Success Probability": oa.successProbability,
    };
  });

  const colors = ["#0ea5e9", "#a855f7", "#ec4899", "#10b981"];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Radar Chart Card */}
      <div className="p-6 rounded-2xl glass-panel">
        <h3 className="mb-4 text-lg font-medium tracking-tight font-display text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          Dimensional Capability Index
        </h3>
        <p className="mb-6 text-xs text-slate-400">
          Compares all options across core decision pillars. Higher indices signify better capabilities or lower relative drawbacks (e.g., higher Risk Safety represents lower overall risk).
        </p>
        <div className="w-full h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="parameter" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} />
              
              {optionAnalyses.map((oa, index) => {
                const option = decision.options.find((o) => o.id === oa.optionId);
                if (!option) return null;
                return (
                  <Radar
                    key={oa.optionId}
                    name={option.title}
                    dataKey={option.title}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.15}
                  />
                );
              })}
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(15, 23, 42, 0.9)", 
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#f1f5f9"
                }} 
              />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px", paddingTop: "10px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="p-6 rounded-2xl glass-panel">
        <h3 className="mb-4 text-lg font-medium tracking-tight font-display text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          Success Probability & Alignment
        </h3>
        <p className="mb-6 text-xs text-slate-400">
          Compares the overall alignment score with the statistical probability of a successful, low-friction realization of each alternative path.
        </p>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  color: "#f1f5f9"
                }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
              <Bar dataKey="Overall Score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Success Probability" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
