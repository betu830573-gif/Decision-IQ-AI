export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    darkMode?: boolean;
    voiceEnabled?: boolean;
  };
}

export interface Option {
  id: string;
  title: string;
  description: string;
  price?: number | string; // cost
  benefits: string[];
  disadvantages: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  expectedROI: string; // e.g. "High", "300%", "2x"
  timeRequired: string; // e.g. "6 months", "2 hours"
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  customNotes?: string;
}

export interface RiskAnalysis {
  financial: 'Low' | 'Medium' | 'High' | 'Very High';
  career: 'Low' | 'Medium' | 'High' | 'Very High';
  technical: 'Low' | 'Medium' | 'High' | 'Very High';
  market: 'Low' | 'Medium' | 'High' | 'Very High';
  opportunity: 'Low' | 'Medium' | 'High' | 'Very High';
  legal: 'Low' | 'Medium' | 'High' | 'Very High';
  personal: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface OutcomePrediction {
  optionId: string;
  bestCase: string;
  expectedCase: string;
  worstCase: string;
  futureScore: number; // 0-100
  probability: number; // 0-100 percentage
  timeline: string; // e.g. "1-2 years"
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface DecisionTreeNode {
  id: string;
  label: string;
  description?: string;
  value?: string;
  children?: DecisionTreeNode[];
}

export interface OptionAnalysis {
  optionId: string;
  overallScore: number; // 0-100
  costScore: number; // 0-100
  riskScore: number; // 0-100
  futureGrowth: number; // 0-100
  timeInvestment: number; // 0-100
  returnValue: number; // 0-100
  successProbability: number; // 0-100
  swot: SWOT;
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
}

export interface AIRecommendation {
  bestOptionId: string;
  reason: string;
  confidenceScore: number; // 0-100
  summary: string;
  alternativeRecommendation: string;
  improvementSuggestions: string[];
}

export interface ExplainableAI {
  why: string;
  how: string;
  evidence: string;
  tradeoffs: string;
  confidenceJustification: string;
}

export interface DecisionAnalysis {
  optionAnalyses: OptionAnalysis[];
  recommendation: AIRecommendation;
  risks: { [optionId: string]: RiskAnalysis };
  predictions: OutcomePrediction[];
  decisionTree: DecisionTreeNode;
  explainableAI: ExplainableAI;
  analyzedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface Decision {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  options: Option[];
  analysis?: DecisionAnalysis | null;
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  isFavorite?: boolean;
}

export interface DashboardStats {
  totalDecisions: number;
  completedDecisions: number;
  avgConfidence: number;
  mostUsedCategory: string;
  categoryDistribution: { name: string; value: number }[];
  timelineData: { date: string; decisions: number }[];
}
