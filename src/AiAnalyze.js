import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf";
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry";
import branchesData from "./jobRolesKeywords";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function AiAnalyze() {
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [branch, setBranch] = useState("");
  const [role, setRole] = useState("");
  const [fullAnalysis, setFullAnalysis] = useState("");
  const [displayedAnalysis, setDisplayedAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

  const [dropzoneHover, setDropzoneHover] = useState(false);

  const branchOptions = branchesData.map((b) => b.branch);
  const rolesForSelectedBranch = branch
    ? branchesData.find((b) => b.branch === branch)?.roles || []
    : [];

  const handleBranchChange = (e) => {
    setBranch(e.target.value);
    setRole("");
    setTextContent("");
    setFullAnalysis("");
    setDisplayedAnalysis("");
    setFile(null);
    setError(null);
    clearTimeout(timeoutRef.current);
    indexRef.current = 0;
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setError(null);
  };

  const handleFileChange = useCallback(async (e) => {
    setError(null);
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!selectedFile) return;

    try {
      let extractedText = "";
      if (selectedFile.type === "application/pdf") {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await getDocument(new Uint8Array(arrayBuffer)).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText += content.items.map((it) => it.str).join(" ") + "\n";
        }
      } else if (
        selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        setError("Unsupported file type. Please upload PDF or DOCX.");
        return;
      }

      if (!extractedText.trim()) {
        setError("Resume file appears empty.");
        return;
      }
      setTextContent(extractedText);
    } catch (err) {
      setError("Failed to read file. " + err.message);
      console.error(err);
    }
  }, []);

  // Drag and Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    setDropzoneHover(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDropzoneHover(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDropzoneHover(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      // Create synthetic event for reuse of handleFileChange
      const syntheticEvent = {
        target: {
          files: [droppedFile],
        },
      };
      handleFileChange(syntheticEvent);
    }
  };

  // Typing effect
  useEffect(() => {
    if (!loading || !fullAnalysis) return;

    if (indexRef.current >= fullAnalysis.length) {
      setLoading(false);
      indexRef.current = 0;
      return;
    }

    const chunkSize = 5;
    let nextChunkEnd = indexRef.current + chunkSize;

    while (
      nextChunkEnd < fullAnalysis.length &&
      fullAnalysis.charAt(nextChunkEnd) !== " " &&
      fullAnalysis.charAt(nextChunkEnd) !== "\n"
    ) {
      nextChunkEnd++;
    }

    const nextChunk = fullAnalysis.slice(indexRef.current, nextChunkEnd);
    setDisplayedAnalysis((prev) => prev + nextChunk);
    indexRef.current = nextChunkEnd;

    timeoutRef.current = setTimeout(() => {}, 8);

    return () => clearTimeout(timeoutRef.current);
  }, [displayedAnalysis, loading, fullAnalysis]);

  const handleAnalyzeAI = async () => {
    if (!textContent || !branch || !role) {
      alert("Please upload resume, select branch and role");
      return;
    }
    setLoading(true);
    setDisplayedAnalysis("Analyzing... Generating response...");
    setFullAnalysis("");
    indexRef.current = 0;
    clearTimeout(timeoutRef.current);
    try {
      const res = await axios.post("http://localhost:5000/api/analyze-resume", {
        text: textContent,
        branch,
        role,
      });
      setFullAnalysis(res.data.analysis || "");
      setDisplayedAnalysis("");
    } catch (err) {
      console.error(err);
      alert("AI analysis failed.");
      setError("AI analysis failed.");
      setLoading(false);
    }
  };

  const dropzoneBaseStyle = {
    border: "3px dashed #90ee90",
    borderRadius: 12,
    padding: 42,
    textAlign: "center",
    backgroundColor: "#2a2a2a",
    cursor: "pointer",
    transition: "transform 0.3s ease",
    marginBottom: 32,
    userSelect: "none",
    transform: "scale(1)",
  };

  const dropzoneHoverStyle = {
    transform: "scale(1.05)",
  };

  return (
    <div
      style={{
        maxWidth: 850,
        margin: "48px auto",
        background: "#222",
        padding: 40,
        borderRadius: 12,
        color: "#eee",
        fontFamily: "Arial, sans-serif",
        minHeight: 600,
      }}
    >
      <h1
        style={{
          fontSize: "2.8rem",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 28,
          background:
            "linear-gradient(270deg, #ff4d4d, #f4c242, #42f46e, #4287f4, #d742f4, #f44174)",
          backgroundSize: "400% 400%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "glitter 3s ease infinite",
          userSelect: "none",
        }}
      >
        AI-Powered Resume Analyzer
      </h1>

      <style>
        {`
          @keyframes glitter {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
          .typing-cursor {
            display: inline-block;
            width: 1ch;
            animation: blink 1.2s infinite;
            color: #44d;
            font-weight: bold;
            user-select: none;
          }
        `}
      </style>

      {/* Branch & Role Select */}
      <div
        style={{ marginBottom: 22, display: "flex", gap: 30, flexWrap: "wrap" }}
      >
        <label style={{ flexGrow: 1 }}>
          <span style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
            Select Engineering Branch:
          </span>
          <select
            value={branch}
            onChange={handleBranchChange}
            style={{
              width: "100%",
              fontSize: 16,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #444",
              backgroundColor: "#1a1a1a",
              color: "#eee",
              cursor: "pointer",
            }}
          >
            <option value="">-- Select Branch --</option>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </label>
        <label style={{ flexGrow: 1 }}>
          <span style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>
            Select Job Role:
          </span>
          <select
            value={role}
            onChange={handleRoleChange}
            disabled={!branch || rolesForSelectedBranch.length === 0}
            style={{
              width: "100%",
              fontSize: 16,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #444",
              backgroundColor: !branch ? "#333" : "#1a1a1a",
              color: "#eee",
              cursor: !branch ? "not-allowed" : "default",
            }}
          >
            <option value="">-- Select Role --</option>
            {rolesForSelectedBranch.map((r) => (
              <option key={r.title} value={r.title}>
                {r.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Resume Upload */}
      <div
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        onMouseEnter={() => setDropzoneHover(true)}
        onMouseLeave={() => setDropzoneHover(false)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          ...dropzoneBaseStyle,
          ...(dropzoneHover ? dropzoneHoverStyle : {}),
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept=".pdf,.docx"
        />
        {file ? (
          <p style={{ marginTop: 12 }}>
            <strong>Selected File: </strong> {file.name}
          </p>
        ) : (
          <p>Drag & drop your resume file here, or click to select a file</p>
        )}
        {error && (
          <p style={{ color: "#ff6666", marginTop: 8, whiteSpace: "pre-wrap" }}>
            {error}
          </p>
        )}
      </div>

      {/* Detailed Analysis */}
      {displayedAnalysis && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#fff",
            borderRadius: 10,
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.3)",
            maxHeight: "none",
            overflowY: "visible",
            color: "#000",
            whiteSpace: "pre-wrap",
            fontFamily: "Consolas, monospace",
            fontSize: "1rem",
            maxWidth: "100%",
          }}
        >
          <h3
            style={{
              borderBottom: "1px solid #ddd",
              paddingBottom: 6,
              color: "#000",
            }}
          >
            AI Analysis Result
          </h3>
          <pre
            style={{
              margin: 0,
              overflowWrap: "break-word",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              color: "#000",
            }}
          >
            {displayedAnalysis} {loading && <span className="typing-cursor">|</span>}
          </pre>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={handleAnalyzeAI}
        disabled={loading}
        style={{
          background: "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
          padding: "12px 24px",
          fontSize: 16,
          display: "block",
          margin: "32px auto 0",
        }}
      >
        {loading ? "Analyzing..." : "AI Analysis"}
      </button>
    </div>
  );
}
