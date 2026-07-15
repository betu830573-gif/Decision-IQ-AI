import { Decision, User, Option, DashboardStats } from "../types";

const API_BASE = "/api";

// Fetch token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem("decisioniq_token");
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("decisioniq_token", token);
  } else {
    localStorage.removeItem("decisioniq_token");
  }
}

// Fetch headers
function getHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// API client functions
export async function signup(name: string, email: string, passwordString: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password: passwordString }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Signup failed");
  }
  return res.json();
}

export async function login(email: string, passwordString: string): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: passwordString }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Login failed");
  }
  return res.json();
}

export async function getMe(): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  return res.json();
}

export async function updateProfile(data: { name?: string; avatar?: string; preferences?: { darkMode?: boolean; voiceEnabled?: boolean } }): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update profile");
  }
  return res.json();
}

export async function getDecisions(): Promise<Decision[]> {
  const res = await fetch(`${API_BASE}/decisions`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch decisions");
  }
  return res.json();
}

export async function createDecision(title: string, description: string, category: string, deadline?: string): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ title, description, category, deadline }),
  });
  if (!res.ok) {
    throw new Error("Failed to create decision");
  }
  return res.json();
}

export async function updateDecision(id: string, updates: Partial<Decision>): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error("Failed to update decision");
  }
  return res.json();
}

export async function deleteDecision(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/decisions/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete decision");
  }
}

export async function duplicateDecision(id: string): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions/${id}/duplicate`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to duplicate decision");
  }
  return res.json();
}

export async function saveDecisionOptions(id: string, options: Option[]): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions/${id}/options`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ options }),
  });
  if (!res.ok) {
    throw new Error("Failed to save options");
  }
  return res.json();
}

export async function generateAIOptions(id: string): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions/${id}/generate-options`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to auto-generate options with Gemini");
  }
  return res.json();
}

export async function runAIDecisionAnalysis(id: string): Promise<Decision> {
  const res = await fetch(`${API_BASE}/decisions/${id}/analyze`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "AI Analysis failed");
  }
  return res.json();
}

export async function runWhatIfSimulation(id: string, scenario: string): Promise<{
  updatedScores: { optionId: string; overallScore: number; costScore: number; riskScore: number; successProbability: number }[];
  updatedRecommendation: { bestOptionId: string; reason: string; confidenceScore: number; summary: string };
}> {
  const res = await fetch(`${API_BASE}/decisions/${id}/what-if`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ scenario }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "What-if simulation failed");
  }
  return res.json();
}

export async function sendDecisionChatMessage(id: string, message: string): Promise<{ chatHistory: any[]; reply: any }> {
  const res = await fetch(`${API_BASE}/decisions/${id}/chat`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Chat message failed");
  }
  return res.json();
}

export async function fetchVoiceSummary(id: string): Promise<{ audio: string; text: string }> {
  const res = await fetch(`${API_BASE}/decisions/${id}/voice-summary`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Voice summary synthesis failed");
  }
  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard statistics");
  }
  return res.json();
}
