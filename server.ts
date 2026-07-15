import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

// Initialize Gemini SDK on the server side
const aiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (aiApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI SDK initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini AI SDK:", error);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
}

// Ensure local JSON DB exists with mock data seed
function initDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const seedData = {
      users: [
        {
          id: "user-default",
          name: "Alex Carter",
          email: "alex@decisioniq.ai",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          preferences: {
            darkMode: true,
            voiceEnabled: true
          }
        }
      ],
      decisions: [
        {
          id: "dec-seed-1",
          userId: "user-default",
          title: "Career Transition: Corporate Lead vs. Startup CTO",
          description: "Evaluating two life-changing job offers: staying at a stable Fortune 500 company as a Lead Engineer with great benefits, or joining an early-stage Series A tech startup as CTO with high equity but higher risk.",
          category: "Career",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isFavorite: true,
          options: [
            {
              id: "opt-1",
              title: "Corporate Lead Engineer",
              description: "Maintain role at Fortune 500 company. High stability, 401k match, predictable hours, clear career ladder.",
              price: "160000",
              benefits: ["Excellent job stability", "Comprehensive health insurance & 401(k) matching", "Consistent work-life balance (40h/week)", "Clear title progression"],
              disadvantages: ["Bureaucratic processes and slower project shipping", "Lower ceiling for financial upside (no major equity)", "Limited influence over strategic business decisions"],
              riskLevel: "Low",
              expectedROI: "Steady 10% annual increase",
              timeRequired: "40 hours / week",
              difficulty: "Medium",
              customNotes: "Very safe option, good for starting a family, but might feel unfulfilling long-term."
            },
            {
              id: "opt-2",
              title: "Startup CTO (Series A)",
              description: "Join early stage generative AI startup as CTO. High influence, 5% equity stake, rapid development cycle.",
              price: "135000",
              benefits: ["High equity upside (5% stake)", "Complete architecture & technological autonomy", "Work with cutting-edge Generative AI stack", "Direct influence on company direction"],
              disadvantages: ["High failure risk (90% startups fail)", "Long hours (60+ hours / week)", "Potential founder conflict or funding crunches", "Lower base salary"],
              riskLevel: "High",
              expectedROI: "Uncapped (10x+ if exit occurs)",
              timeRequired: "60+ hours / week",
              difficulty: "Expert",
              customNotes: "High risk, high reward. Extremely exciting, but could lead to burnout if things go sideways."
            }
          ],
          analysis: {
            optionAnalyses: [
              {
                optionId: "opt-1",
                overallScore: 78,
                costScore: 90,
                riskScore: 95,
                futureGrowth: 60,
                timeInvestment: 80,
                returnValue: 65,
                successProbability: 92,
                swot: {
                  strengths: ["Highly structured environment", "Predictable career progression", "Great compensation packages"],
                  weaknesses: ["Slow learning speed", "Legacy codebase challenges", "Red tape"],
                  opportunities: ["Lead an internal department in 2 years", "Tuition reimbursement for MBA"],
                  threats: ["Technological stagnation", "Reorganizations and layoffs"]
                },
                prosAndCons: {
                  pros: ["Favorable work-life balance", "Premium health insurance", "Steady stock options vesting"],
                  cons: ["Boring corporate culture", "Limited stack autonomy"]
                }
              },
              {
                optionId: "opt-2",
                overallScore: 84,
                costScore: 50,
                riskScore: 35,
                futureGrowth: 95,
                timeInvestment: 40,
                returnValue: 90,
                successProbability: 45,
                swot: {
                  strengths: ["Complete control over technology", "Passionate, fast-moving team", "High ceiling equity"],
                  weaknesses: ["Understaffed engineering team", "Lack of operational processes"],
                  opportunities: ["Rapid expansion into enterprise B2B space", "Become a industry-recognized AI leader"],
                  threats: ["Runway risk", "Intense market competition in AI space"]
                },
                prosAndCons: {
                  pros: ["Work with state-of-the-art tech", "Build the core system from scratch"],
                  cons: ["Extremely high work pressure", "Unstable salary projections"]
                }
              }
            ],
            recommendation: {
              bestOptionId: "opt-2",
              reason: "Although the Corporate Lead role offers excellent security and higher immediate pay, your career objectives and skills align perfectly with the Startup CTO role. The Generative AI market is expanding exponentially, and a 5% equity stake offers life-changing upside that corporate advancement cannot match. Furthermore, the technical autonomy will accelerate your leadership skills by 3x.",
              confidenceScore: 82,
              summary: "A classic security vs. growth decision. Startup CTO is the superior option for rapid growth, autonomy, and asymmetric upside, assuming you are in a financial position to tolerate the runway risk.",
              alternativeRecommendation: "If you prioritize start of a family or have short-term financial liabilities, opt for the Corporate Lead role, but negotiate a 20% allocation of work hours to high-impact innovation projects to avoid stagnation.",
              improvementSuggestions: [
                "Negotiate a 10% base salary increase for the CTO role to cover immediate expenses.",
                "Verify the startup's current runway (should be at least 18 months).",
                "Ensure equity vesting includes a 1-year cliff with monthly vest thereafter."
              ]
            },
            risks: {
              "opt-1": {
                financial: "Low",
                career: "Medium",
                technical: "Low",
                market: "Low",
                opportunity: "High",
                legal: "Low",
                personal: "Low"
              },
              "opt-2": {
                financial: "High",
                career: "Low",
                technical: "Medium",
                market: "High",
                opportunity: "Low",
                legal: "Medium",
                personal: "High"
              }
            },
            predictions: [
              {
                optionId: "opt-1",
                bestCase: "Promoted to engineering manager within 12 months, salary increases to $190k, standard 10% bonus.",
                expectedCase: "Steady progression, average 5% merit increases, work remains comfortable with good work-life balance.",
                worstCase: "Mass layoffs affect the department, leading to displacement with a 3-month severance package.",
                futureScore: 72,
                probability: 90,
                timeline: "2-3 Years"
              },
              {
                optionId: "opt-2",
                bestCase: "Startup raises $15M Series B at a $100M valuation. Your 5% equity becomes worth millions. Product achieves high market fit.",
                expectedCase: "Startup achieves modest growth, raises next round of funding, your salary adjusts up to market rate ($170k). Equity is moderately valuable.",
                worstCase: "Startup fails to secure next funding round inside 12 months, shutting down and leaving equity worthless.",
                futureScore: 92,
                probability: 50,
                timeline: "2-3 Years"
              }
            ],
            decisionTree: {
              id: "root",
              label: "Career Choice",
              description: "Deciding direction for next 3-5 years",
              children: [
                {
                  id: "branch-corporate",
                  label: "Option A: Corporate Lead",
                  description: "Low risk path focusing on stable compensation",
                  children: [
                    { id: "node-corp-1", label: "Financial Security Achieved", value: "High confidence" },
                    { id: "node-corp-2", label: "Career Progression: Steady", value: "Medium learning speed" }
                  ]
                },
                {
                  id: "branch-startup",
                  label: "Option B: Startup CTO",
                  description: "High upside path focusing on product ownership",
                  children: [
                    { id: "node-start-1", label: "Funding Succeeds (50% prob)", value: "CTO equity values $2M+" },
                    { id: "node-start-2", label: "Funding Fails (50% prob)", value: "Re-enter market with CTO title" }
                  ]
                }
              ]
            },
            explainableAI: {
              why: "Startup CTO is recommended because your input indicates a high desire for learning, direct equity incentives, and technical ownership, which are severely limited in the Corporate option.",
              how: "Calculated by mapping weights: Equity Upside (35%), Work autonomy (25%), Career acceleration (20%), Compensation (20%). Startup CTO scored 88/100 on alignment while Corporate scored 64/100.",
              evidence: "Startups in the AI sector have experienced a 120% YoY increase in successful Series B raises compared to traditional SaaS. Autonomous roles have a 45% higher career retention rate according to industry studies.",
              tradeoffs: "By choosing the startup, you are actively sacrificing short-term stability (Corporate Lead risk is negligible) and immediate health/wellness predictability in exchange for accelerated learning and capital upside.",
              confidenceJustification: "82% confidence because the startup's cap table is clean and the technical stack aligns perfectly with your resume, though market volatility in Generative AI introduces minor uncertainty."
            },
            analyzedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          chatHistory: [
            {
              id: "msg-1",
              sender: "user",
              text: "Hi, I am worried about the work hours of the CTO role. Is it really worth the burnout?",
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "msg-2",
              sender: "ai",
              text: "That is a very valid concern. At early-stage startups, 60+ hour weeks are common. To make it 'worth it', you must negotiate strong boundaries: 1) Ensure you have complete control over building your engineering schedule, 2) Keep open discussions about mental health with the founders, and 3) Understand that startup equity operates as a marathon. If you feel the burnout risk is too high, the Corporate role offers a peaceful alternative where you can build personal projects on weekends.",
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: "dec-seed-2",
          userId: "user-default",
          title: "Purchasing a Work Laptop",
          description: "Evaluating whether to invest in a premium Apple MacBook Pro M3 Max or a high-performance Lenovo ThinkPad P1 Gen 6 for intensive software engineering, AI model running, and daily productivity.",
          category: "Finance & Purchasing",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isFavorite: false,
          options: [
            {
              id: "opt-lap-1",
              title: "MacBook Pro M3 Max (36GB RAM, 1TB SSD)",
              description: "Premium Apple laptop, highly optimized for power efficiency, screen quality, and UNIX development.",
              price: "32000",
              benefits: ["Incredible battery life (18-22 hours)", "Extremely silent operation", "Best-in-class display and trackpad", "High resale value"],
              disadvantages: ["Very expensive ($3,200)", "Not compatible with Windows-only software", "Limited options for upgrading RAM/SSD later"],
              riskLevel: "Low",
              expectedROI: "Saves 2 hours of compile time/week",
              timeRequired: "4-5 years lifecycle",
              difficulty: "Easy",
              customNotes: "Standard for modern software engineering teams."
            },
            {
              id: "opt-lap-2",
              title: "Lenovo ThinkPad P1 (64GB RAM, 2TB SSD, RTX 4080)",
              description: "Heavy-duty workstation laptop, excellent keyboard, native Windows/Linux development environment, expandable.",
              price: "28000",
              benefits: ["Expandable RAM and dual SSD slots", "Nvidia RTX 4080 is highly optimized for local AI model training", "Legendary ThinkPad keyboard and durability"],
              disadvantages: ["Poor battery life (4-6 hours max)", "Runs hot and loud under heavy workloads", "Bulky power brick"],
              riskLevel: "Low",
              expectedROI: "Allows local model training",
              timeRequired: "3-4 years lifecycle",
              difficulty: "Easy",
              customNotes: "Better if local GPU is strictly required for my ML tasks."
            }
          ]
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2));
    console.log("Database seeded successfully at:", DB_PATH);
  }
}

initDatabase();

// Utility helper to read and write database
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Database read error:", error);
    return { users: [], decisions: [] };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Database write error:", error);
  }
}

// REST APIs - Authentication
app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required signup fields" });
  }

  const db = readDB();
  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already exists" });
  }

  const newUser = {
    id: "user-" + Math.random().toString(36).substr(2, 9),
    name,
    email: email.toLowerCase(),
    avatar: `https://images.unsplash.com/photo-${['1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e', '1494790108377-be9c29b29330'][Math.floor(Math.random() * 4)]}?w=150&auto=format&fit=crop&q=80`,
    preferences: {
      darkMode: true,
      voiceEnabled: true
    }
  };

  db.users.push(newUser);
  writeDB(db);

  res.status(201).json({ user: newUser, token: newUser.id });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const db = readDB();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Real production login would check password hash, but for developer preview, we bypass/succeed
  res.status(200).json({ user, token: user.id });
});

// Middleware to get user from simple Auth header (Bearer <userId>)
function getAuthUser(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const db = readDB();
  const user = db.users.find((u: any) => u.id === token);
  return user || null;
}

app.get("/api/auth/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.status(200).json({ user });
});

app.patch("/api/auth/profile", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name, avatar, preferences } = req.body;
  const db = readDB();
  const dbUser = db.users.find((u: any) => u.id === user.id);
  if (!dbUser) {
    return res.status(404).json({ error: "User not found" });
  }

  if (name !== undefined) dbUser.name = name;
  if (avatar !== undefined) dbUser.avatar = avatar;
  if (preferences !== undefined) {
    dbUser.preferences = { ...dbUser.preferences, ...preferences };
  }

  writeDB(db);
  res.status(200).json({ user: dbUser });
});

// REST APIs - Decisions
app.get("/api/decisions", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userDecisions = db.decisions.filter((d: any) => d.userId === user.id);
  res.status(200).json(userDecisions);
});

app.post("/api/decisions", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, category, deadline } = req.body;
  if (!title) return res.status(400).json({ error: "Decision title is required" });

  const db = readDB();
  const newDecision = {
    id: "dec-" + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    title,
    description: description || "",
    category: category || "General",
    deadline: deadline || "",
    options: [],
    analysis: null,
    chatHistory: [],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.decisions.push(newDecision);
  writeDB(db);

  res.status(201).json(newDecision);
});

app.get("/api/decisions/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const decision = db.decisions.find((d: any) => d.id === req.params.id && d.userId === user.id);
  if (!decision) return res.status(404).json({ error: "Decision not found" });

  res.status(200).json(decision);
});

app.put("/api/decisions/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, category, deadline, isFavorite } = req.body;
  const db = readDB();
  const decisionIndex = db.decisions.findIndex((d: any) => d.id === req.params.id && d.userId === user.id);
  if (decisionIndex === -1) return res.status(404).json({ error: "Decision not found" });

  const decision = db.decisions[decisionIndex];
  if (title !== undefined) decision.title = title;
  if (description !== undefined) decision.description = description;
  if (category !== undefined) decision.category = category;
  if (deadline !== undefined) decision.deadline = deadline;
  if (isFavorite !== undefined) decision.isFavorite = isFavorite;
  decision.updatedAt = new Date().toISOString();

  db.decisions[decisionIndex] = decision;
  writeDB(db);

  res.status(200).json(decision);
});

app.delete("/api/decisions/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const initialLen = db.decisions.length;
  db.decisions = db.decisions.filter((d: any) => !(d.id === req.params.id && d.userId === user.id));

  if (db.decisions.length === initialLen) {
    return res.status(404).json({ error: "Decision not found" });
  }

  writeDB(db);
  res.status(200).json({ success: true, message: "Decision deleted" });
});

app.post("/api/decisions/:id/duplicate", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const decision = db.decisions.find((d: any) => d.id === req.params.id && d.userId === user.id);
  if (!decision) return res.status(404).json({ error: "Decision not found" });

  const duplicated = {
    ...decision,
    id: "dec-" + Math.random().toString(36).substr(2, 9),
    title: `${decision.title} (Copy)`,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.decisions.push(duplicated);
  writeDB(db);

  res.status(201).json(duplicated);
});

// REST APIs - Options
app.put("/api/decisions/:id/options", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { options } = req.body;
  if (!Array.isArray(options)) return res.status(400).json({ error: "Options must be an array" });

  const db = readDB();
  const decisionIndex = db.decisions.findIndex((d: any) => d.id === req.params.id && d.userId === user.id);
  if (decisionIndex === -1) return res.status(404).json({ error: "Decision not found" });

  // Add ids to options if they don't have them
  const formattedOptions = options.map((opt: any) => ({
    ...opt,
    id: opt.id || "opt-" + Math.random().toString(36).substr(2, 9),
    benefits: Array.isArray(opt.benefits) ? opt.benefits : [],
    disadvantages: Array.isArray(opt.disadvantages) ? opt.disadvantages : []
  }));

  db.decisions[decisionIndex].options = formattedOptions;
  db.decisions[decisionIndex].updatedAt = new Date().toISOString();
  writeDB(db);

  res.status(200).json(db.decisions[decisionIndex]);
});

// REST APIs - AI Assistant Generate Options
app.post("/api/decisions/:id/generate-options", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const decision = db.decisions.find((d: any) => d.id === req.params.id && d.userId === user.id);
  if (!decision) return res.status(404).json({ error: "Decision not found" });

  if (!ai) {
    return res.status(503).json({ error: "Gemini API client not initialized. Please configure GEMINI_API_KEY." });
  }

  try {
    const prompt = `
      You are an expert AI Decision Intelligence Assistant.
      The user wants to make a decision. Here is the decision information:
      Decision Title: "${decision.title}"
      Decision Context/Description: "${decision.description}"

      Based on this context, suggest exactly 2 or 3 of the most relevant, highly contrasting, and practical options the user should evaluate.
      Return a JSON array where each object strictly follows this structure:
      {
        "title": "Short option name",
        "description": "Short explanation of this option",
        "price": "Estimate of cost or budget required (e.g. '$1500' or 'None')",
        "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
        "disadvantages": ["Disadvantage 1", "Disadvantage 2", "Disadvantage 3"],
        "riskLevel": "Low" | "Medium" | "High" | "Very High",
        "expectedROI": "Estimated return value or career impact",
        "timeRequired": "Expected hours or commitment timeline",
        "difficulty": "Easy" | "Medium" | "Hard" | "Expert",
        "customNotes": "Short personal note or advisory"
      }

      Provide ONLY valid JSON as a flat list of these options. Do not include markdown codeblocks or any explanatory text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    const parsedOptions = JSON.parse(text.trim());

    // Give each option a fresh ID
    const savedOptions = parsedOptions.map((opt: any) => ({
      ...opt,
      id: "opt-" + Math.random().toString(36).substr(2, 9),
      benefits: Array.isArray(opt.benefits) ? opt.benefits : [],
      disadvantages: Array.isArray(opt.disadvantages) ? opt.disadvantages : []
    }));

    decision.options = savedOptions;
    decision.updatedAt = new Date().toISOString();
    writeDB(db);

    res.status(200).json(decision);
  } catch (error: any) {
    console.error("Generate options error:", error);
    res.status(500).json({ error: "Failed to generate options with AI: " + error.message });
  }
});

// REST APIs - AI Decision Analyzer
app.post("/api/decisions/:id/analyze", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const decisionIndex = db.decisions.findIndex((d: any) => d.id === req.params.id && d.userId === user.id);
  if (decisionIndex === -1) return res.status(404).json({ error: "Decision not found" });

  const decision = db.decisions[decisionIndex];
  if (decision.options.length < 2) {
    return res.status(400).json({ error: "You must add at least 2 options to compare before generating an AI analysis." });
  }

  if (!ai) {
    return res.status(503).json({ error: "Gemini API client not initialized. Please configure GEMINI_API_KEY." });
  }

  try {
    const prompt = `
      You are DecisionIQ AI, a world-class Decision Science engine.
      Analyze this decision and compare all provided options.

      Decision Title: "${decision.title}"
      Decision Description: "${decision.description}"

      Options to evaluate:
      ${JSON.stringify(decision.options, null, 2)}

      Tasks to complete:
      1. Rate each option across scores: overallScore (0-100), costScore (0-100), riskScore (0-100 where higher means safer/lower risk), futureGrowth (0-100), timeInvestment (0-100 where higher means less time needed), returnValue (0-100), successProbability (0-100).
      2. Provide custom SWOT analysis (strengths, weaknesses, opportunities, threats arrays) for each option.
      3. Create short pros and cons list for each option.
      4. Select the absolute BEST option (bestOptionId matching one of the input option IDs), and write an extensive, professional reasoning paragraph, a summary, an alternative option recommendation, and practical improvement suggestions.
      5. Calculate different risk categories (financial, career, technical, market, opportunity, legal, personal) as "Low", "Medium", "High", or "Very High" for each option.
      6. Draft outcome predictions (Best Case, Expected Case, Worst Case) with a numeric future score (0-100), a probability (0-100), and a timeline.
      7. Create a Decision Tree with a root node (labeled with the decision context) branching into options, and then branching into key event outcomes.
      8. Complete the Explainable AI questionnaire: "why", "how", "evidence", "tradeoffs", "confidenceJustification".

      You MUST respond with a single valid JSON object that strictly adheres to this structure:
      {
        "optionAnalyses": [
          {
            "optionId": "must match input option ID",
            "overallScore": 85,
            "costScore": 70,
            "riskScore": 60,
            "futureGrowth": 90,
            "timeInvestment": 50,
            "returnValue": 80,
            "successProbability": 75,
            "swot": {
              "strengths": ["string"],
              "weaknesses": ["string"],
              "opportunities": ["string"],
              "threats": ["string"]
            },
            "prosAndCons": {
              "pros": ["string"],
              "cons": ["string"]
            }
          }
        ],
        "recommendation": {
          "bestOptionId": "must match one of the input option IDs",
          "reason": "Detailed expert reasoning text...",
          "confidenceScore": 85,
          "summary": "Short action-oriented summary...",
          "alternativeRecommendation": "Advice on what to do if primary fails...",
          "improvementSuggestions": ["Suggestion 1", "Suggestion 2"]
        },
        "risks": {
          "OPTION_ID_1": {
            "financial": "Low" | "Medium" | "High" | "Very High",
            "career": "Low" | "Medium" | "High" | "Very High",
            "technical": "Low" | "Medium" | "High" | "Very High",
            "market": "Low" | "Medium" | "High" | "Very High",
            "opportunity": "Low" | "Medium" | "High" | "Very High",
            "legal": "Low" | "Medium" | "High" | "Very High",
            "personal": "Low" | "Medium" | "High" | "Very High"
          }
        },
        "predictions": [
          {
            "optionId": "must match input option ID",
            "bestCase": "Best case text...",
            "expectedCase": "Expected case text...",
            "worstCase": "Worst case text...",
            "futureScore": 80,
            "probability": 70,
            "timeline": "e.g. 1-2 years"
          }
        ],
        "decisionTree": {
          "id": "root",
          "label": "Decision Node",
          "description": "Core context",
          "children": [
            {
              "id": "branch-1",
              "label": "Option Title Branch",
              "description": "Option sub-description",
              "children": [
                { "id": "leaf-1", "label": "Outcome A (Successful)", "value": "e.g. High ROI" },
                { "id": "leaf-2", "label": "Outcome B (Fails)", "value": "e.g. Mitigated" }
              ]
            }
          ]
        },
        "explainableAI": {
          "why": "Clear explanation of why this option is superior...",
          "how": "Formulaic mapping/weighting mechanism...",
          "evidence": "Academic or industry empirical references...",
          "tradeoffs": "What you lose by picking this option...",
          "confidenceJustification": "Rationale for confidence score..."
        }
      }

      Return ONLY valid JSON. Avoid markdown formatting inside the text fields.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const analysisData = JSON.parse(text.trim());
    analysisData.analyzedAt = new Date().toISOString();

    decision.analysis = analysisData;
    decision.updatedAt = new Date().toISOString();
    writeDB(db);

    res.status(200).json(decision);
  } catch (error: any) {
    console.error("Analysis generation error:", error);
    res.status(500).json({ error: "Failed to generate decision analysis: " + error.message });
  }
});

// REST APIs - What-if Simulator Recalculation
app.post("/api/decisions/:id/what-if", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { scenario } = req.body;
  if (!scenario) return res.status(400).json({ error: "Scenario description is required" });

  const db = readDB();
  const decision = db.decisions.find((d: any) => d.id === req.params.id && d.userId === user.id);
  if (!decision) return res.status(404).json({ error: "Decision not found" });
  if (!decision.analysis) return res.status(400).json({ error: "Please run initial analysis first" });

  if (!ai) {
    return res.status(503).json({ error: "Gemini API client not initialized. Please configure GEMINI_API_KEY." });
  }

  try {
    const prompt = `
      You are DecisionIQ AI's What-if Simulation engine.
      The user is testing a hypothetical scenario: "${scenario}"
      
      Original Decision: "${decision.title}"
      Description: "${decision.description}"
      Options: ${JSON.stringify(decision.options, null, 2)}
      Original Analysis: ${JSON.stringify(decision.analysis, null, 2)}

      Recalculate the overall scores, cost scores, risk scores, and success probabilities for every option in light of this hypothetical scenario.
      Also generate a revised recommendation block showing the updated bestOptionId, updated reasoning (specifically referencing how the what-if scenario changes things), and updated confidence score.

      Return ONLY a JSON response in this strict structure:
      {
        "updatedScores": [
          {
            "optionId": "must match an option ID",
            "overallScore": 88,
            "costScore": 75,
            "riskScore": 65,
            "successProbability": 80
          }
        ],
        "updatedRecommendation": {
          "bestOptionId": "must match one of the option IDs",
          "reason": "Explain how the scenario of '${scenario}' shifts the leverage. E.g. If budget increased, more expensive options become safer or more practical...",
          "confidenceScore": 90,
          "summary": "Short revised summary"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    res.status(200).json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("What-if simulator error:", error);
    res.status(500).json({ error: "Failed to recalculate what-if scenario: " + error.message });
  }
});

// REST APIs - Decision AI Chat Assistant
app.post("/api/decisions/:id/chat", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message text is required" });

  const db = readDB();
  const decisionIndex = db.decisions.findIndex((d: any) => d.id === req.params.id && d.userId === user.id);
  if (decisionIndex === -1) return res.status(404).json({ error: "Decision not found" });

  const decision = db.decisions[decisionIndex];

  if (!ai) {
    return res.status(503).json({ error: "Gemini API client not initialized. Please configure GEMINI_API_KEY." });
  }

  try {
    // Generate context summary for the chat
    const contextStr = `
      You are an expert AI decision intelligence advisor chatting with a user about their decision:
      Decision: "${decision.title}"
      Description: "${decision.description}"
      Current Options: ${JSON.stringify(decision.options.map(o => ({ id: o.id, title: o.title, description: o.description })), null, 2)}
      AI Analysis Analysis Details: ${decision.analysis ? JSON.stringify({
        bestOptionId: decision.analysis.recommendation.bestOptionId,
        reason: decision.analysis.recommendation.reason,
        confidence: decision.analysis.recommendation.confidenceScore
      }) : "No formal analysis has been performed yet."}

      Provide helpful, highly specific, objective, and supportive advice. Focus on tradeoffs, risk mitigation, and clarifying the user's values. Keep response concise, friendly, and structured.
    `;

    const userMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      sender: "user" as const,
      text: message,
      timestamp: new Date().toISOString()
    };

    decision.chatHistory.push(userMessage);

    // Build chat history part for Gemini
    const historyPrompt = decision.chatHistory.slice(-10).map((msg: any) => 
      `${msg.sender === "user" ? "User" : "Advisor"}: ${msg.text}`
    ).join("\n");

    const fullPrompt = `
      ${contextStr}

      Here is the recent conversation history:
      ${historyPrompt}

      Advisor:
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt
    });

    const text = response.text || "I apologize, but I could not formulate a response at this time. Let's look at your options together.";

    const aiMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      sender: "ai" as const,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    decision.chatHistory.push(aiMessage);
    decision.updatedAt = new Date().toISOString();
    
    db.decisions[decisionIndex] = decision;
    writeDB(db);

    res.status(200).json({ chatHistory: decision.chatHistory, reply: aiMessage });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: "Chat failed: " + error.message });
  }
});

// REST APIs - AI Speech Voice Assistant (TTS)
app.post("/api/decisions/:id/voice-summary", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const decision = db.decisions.find((d: any) => d.id === req.params.id && d.userId === user.id);
  if (!decision) return res.status(404).json({ error: "Decision not found" });

  if (!ai) {
    return res.status(503).json({ error: "Gemini API client not initialized. Please configure GEMINI_API_KEY." });
  }

  try {
    // Compile speech text
    let textToSpeak = `Here is your decision summary for ${decision.title}. `;
    if (decision.analysis) {
      const bestOpt = decision.options.find(o => o.id === decision.analysis?.recommendation.bestOptionId);
      textToSpeak += `Based on our AI analysis, the best recommended option is ${bestOpt ? bestOpt.title : 'Option'}. `;
      textToSpeak += `Our AI has a confidence rating of ${decision.analysis.recommendation.confidenceScore} percent. `;
      textToSpeak += `${decision.analysis.recommendation.summary}`;
    } else {
      textToSpeak += `You have currently added ${decision.options.length} options. Please trigger the core intelligence engine to run a detailed comparative risk and SWOT analysis.`;
    }

    // Call Gemini Text to Speech
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: textToSpeak }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Beautiful friendly speaker
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.status(200).json({ audio: base64Audio, text: textToSpeak });
    } else {
      res.status(500).json({ error: "Failed to synthesize speech audio from Gemini model response." });
    }
  } catch (error: any) {
    console.error("Voice synthesis error:", error);
    res.status(500).json({ error: "Failed to synthesize speech: " + error.message });
  }
});

// REST APIs - Get Dashboard Stats
app.get("/api/dashboard/stats", (req, res) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const db = readDB();
  const userDecisions = db.decisions.filter((d: any) => d.userId === user.id);

  const totalDecisions = userDecisions.length;
  const completedDecisions = userDecisions.filter((d: any) => d.analysis !== null).length;

  let sumConfidence = 0;
  let countConfidence = 0;
  const categoryCounts: { [cat: string]: number } = {};

  userDecisions.forEach((d: any) => {
    if (d.analysis?.recommendation?.confidenceScore) {
      sumConfidence += d.analysis.recommendation.confidenceScore;
      countConfidence++;
    }
    const cat = d.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const avgConfidence = countConfidence > 0 ? Math.round(sumConfidence / countConfidence) : 0;

  let mostUsedCategory = "N/A";
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedCategory = cat;
    }
  });

  const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  // Generate timeline data for recent 7 days
  const timelineData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const matchStr = d.toISOString().split('T')[0];
    const count = userDecisions.filter((dec: any) => dec.createdAt.startsWith(matchStr)).length;
    timelineData.push({ date: dateStr, decisions: count });
  }

  res.status(200).json({
    totalDecisions,
    completedDecisions,
    avgConfidence,
    mostUsedCategory,
    categoryDistribution,
    timelineData
  });
});

// Vite middleware and static serving
async function startServer() {
  // Setup Vite dev server middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite Development Server Middleware mounted.");
  } else {
    // Serve production built frontend files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DecisionIQ AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
