import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const promptScoreCache = new Map(); // In-memory store for resume scores

// Configure CORS
if (process.env.NODE_ENV === "production") {
  const allowedOrigins = ["https://your-client-app.com"]; // replace as needed
  const corsOptions = {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}

app.use(express.json());

// Parse and extract only score integer from AI response
function parseAIResponse(text) {
  try {
    const parsed = JSON.parse(text);
    const score = parsed.score !== undefined ? Number(parsed.score) : null;

    // Store score temporarily with a unique key (use timestamp or UUID)
    const scoreKey = Date.now().toString();
    if (score !== null && !isNaN(score)) {
      promptScoreCache.set(scoreKey, score);
      // Optional: auto delete after e.g. 10 minutes
      setTimeout(() => promptScoreCache.delete(scoreKey), 10 * 60 * 1000);
      console.log(`Stored resume score: ${score} with key: ${scoreKey}`);
    }

    return {
      analysis: parsed.analysis || "",
      score,
      pointsOfImprovement: parsed.pointsOfImprovement || "",
      missingSkills: parsed.missingSkills || [],
      scoreKey, // include for reference if needed
    };
  } catch {
    return {
      analysis: text,
      score: null,
      pointsOfImprovement: "",
      missingSkills: [],
      scoreKey: null,
    };
  }
}

// AI Resume Analysis API
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { text, branch, role } = req.body;
    if (!text || !branch || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma:2b",
        prompt: `You are a resume analyzer. Analyze the following resume:\n\n${text}\n\nBranch: ${branch}\nRole: ${role}\n\nProvide strengths, weaknesses, improvement tips, and an overall resume score out of 100 indicating how well the resume matches the role and branch.`,
        stream: false,
      }),
    });

    const data = await response.json();
    const parsed = parseAIResponse(data.response);
    res.json(parsed);
  } catch (err) {
    console.error("AI analysis failed:", err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
