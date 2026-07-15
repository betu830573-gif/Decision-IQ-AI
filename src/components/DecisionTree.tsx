import React, { useState } from "react";
import { DecisionTreeNode } from "../types";
import { GitFork, ChevronDown, ChevronRight, CornerDownRight, Zap } from "lucide-react";

interface DecisionTreeProps {
  tree: DecisionTreeNode;
}

export default function DecisionTree({ tree }: DecisionTreeProps) {
  return (
    <div className="p-6 rounded-2xl glass-panel">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium font-display text-slate-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-sky-400" />
            AI Decision Tree Generator
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Explorable branch analysis mapping out options, secondary triggers, and long-term conditional outcomes.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 overflow-x-auto">
        <div className="min-w-[500px]">
          <TreeNodeRow node={tree} depth={0} isLast={true} />
        </div>
      </div>
    </div>
  );
}

interface TreeNodeRowProps {
  node: DecisionTreeNode;
  depth: number;
  isLast: boolean;
  key?: React.Key;
}

function TreeNodeRow({ node, depth, isLast }: TreeNodeRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col select-none">
      <div className="flex items-start my-1.5 relative">
        {/* Branch connector line graphics */}
        {depth > 0 && (
          <div className="absolute left-[-20px] top-4 w-4 h-12 border-l border-b border-slate-800 rounded-bl-lg pointer-events-none" />
        )}

        {/* Node Content Card */}
        <div 
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
          className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer max-w-md ${
            depth === 0 
              ? "bg-slate-900 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
              : depth === 1
              ? "bg-slate-900/60 border-purple-500/20 hover:border-purple-500/40"
              : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {/* Collapse/Expand Toggle Indicator */}
          {hasChildren ? (
            <button className="p-0.5 rounded bg-slate-800 text-slate-400 group-hover:text-slate-200">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center text-slate-500">
              <CornerDownRight className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Node text and details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm tracking-tight ${
                depth === 0 ? "text-sky-400 font-semibold text-base font-display" : "text-slate-200"
              }`}>
                {node.label}
              </span>
              {node.value && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-2.5 h-2.5" />
                  {node.value}
                </span>
              )}
            </div>
            {node.description && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {node.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Render children recursively if expanded */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col relative">
          {/* Vertical connecting line */}
          <div 
            className="absolute border-l border-slate-800 pointer-events-none" 
            style={{ 
              left: `${(depth + 1) * 24 - 10}px`, 
              top: "4px", 
              bottom: "20px" 
            }} 
          />
          {node.children!.map((child, idx) => (
            <TreeNodeRow 
              key={child.id || idx} 
              node={child} 
              depth={depth + 1} 
              isLast={idx === node.children!.length - 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
