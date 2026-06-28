import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Store scores temporarily
const promptScoreCache = new Map();

// Configure CORS
if (process.env.NODE_ENV === "production") {
  const allowedOrigins = [
  "https://smart-ai-resume-builder-analyzer-omega.vercel.app",
];

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

app.use(express.json());

// Parse Gemini response
function parseAIResponse(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const score = Number(parsed.score);

    const scoreKey = Date.now().toString();

    if (!isNaN(score)) {
      promptScoreCache.set(scoreKey, score);

      setTimeout(() => {
        promptScoreCache.delete(scoreKey);
      }, 10 * 60 * 1000);
    }

    return {
      analysis: parsed.analysis || "",
      score: score || 0,
      pointsOfImprovement: parsed.pointsOfImprovement || "",
      missingSkills: parsed.missingSkills || [],
      scoreKey,
    };
  } catch (error) {
    console.error("JSON Parse Error:", error);

    return {
      analysis: text,
      score: 0,
      pointsOfImprovement: "",
      missingSkills: [],
      scoreKey: null,
    };
  }
}

// Resume Analysis API
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { text, branch, role } = req.body;

    if (!text || !branch || !role) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const prompt = `
You are an expert ATS Resume Analyzer.

Analyze the following resume carefully.

Resume:
${text}

Candidate Branch:
${branch}

Target Role:
${role}

Return ONLY valid JSON.

Example:

{
  "analysis":"Detailed ATS analysis...",
  "score":85,
  "pointsOfImprovement":"Improve projects, add measurable achievements...",
  "missingSkills":["React","Node.js","Docker"]
}

Do not return markdown.
Do not use triple backticks.
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    const parsed = parseAIResponse(response);

    res.json(parsed);
  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      error: "AI analysis failed",
    });
  }
});

// Health Check
app.get("/", (req, res) => {
  res.send("✅ Resume AI Backend Running Successfully");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});