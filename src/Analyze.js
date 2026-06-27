import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import ConfettiExplosion from 'react-confetti-explosion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import branchesData from './jobRolesKeywords';

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

function calculateMatchScore(resumeText, keywords) {
  const text = resumeText.toLowerCase();
  let matches = 0;
  keywords.forEach((kw) => {
    if (text.includes(kw.toLowerCase())) {
      matches++;
    }
  });
  return (matches / keywords.length) * 100;
}

function getStrokeColor(percent) {
  if (percent > 80) return '#4caf50';
  if (percent > 65) return '#ffeb3b';
  return '#f44336';
}

function getMissingSkills(resumeText, roleKeywords) {
  const text = resumeText.toLowerCase();
  return roleKeywords.filter((keyword) => !text.includes(keyword.toLowerCase()));
}

async function checkGrammar(text) {
  try {
    const response = await fetch('https://api.languagetoolplus.com/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        text,
        language: 'en-US',
      }),
    });
    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Grammar check failed:', error);
    return [];
  }
}

export default function Analyze() {
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [report, setReport] = useState('');
  const [showExplosion, setShowExplosion] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [branchRoleScores, setBranchRoleScores] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [grammarErrors, setGrammarErrors] = useState([]);
  const branchOptions = branchesData.map((b) => b.branch);
  const rolesForSelectedBranch = selectedBranch
    ? branchesData.find((b) => b.branch === selectedBranch)?.roles || []
    : [];

  const handleBranchChange = (e) => {
    const branch = e.target.value;
    setSelectedBranch(branch);
    setSelectedRole('');
    setBranchRoleScores([]);
    setScore(null);
    setReport('');
    setShowExplosion(false);
    setFileName(null);
    setResumeText('');
    setError(null);
    setGrammarErrors([]);
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    setShowExplosion(false);
    if (role && branchRoleScores.length > 0) {
      const found = branchRoleScores.find((r) => r.role === role);
      if (found) handleShowExplosion(found.score);
    }
  };

  const handleShowExplosion = (matchedScore) => {
    if (matchedScore && matchedScore > 80) {
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 2000);
    }
  };

  const analyzeTextContent = (text) => {
    if (!text) {
      setScore(0);
      setReport('Resume text unavailable.');
      return;
    }
    const normalizedText = text.toLowerCase();

    const requiredSections = [
      'personal details', 'education', 'achievements', 'certifications', 'skills', 'experience',
      'career objective', 'internship experience', 'project profile', 'software proficiency',
      'extra curricular activities', 'personal profile', 'declaration', 'date', 'place',
    ];

    const foundSections = requiredSections.filter((s) => normalizedText.includes(s));
    const missingSections = requiredSections.filter((s) => !normalizedText.includes(s));

    const lengthScore = Math.min(text.length / 1000, 1) * 40;
    const sectionScore = (foundSections.length / requiredSections.length) * 30;
    const alignmentScore = 15;
    const fontScore = 15;

    const grammarPenalty = Math.min(grammarErrors.length * 1, 10);

    const totalScore = Math.round(
      lengthScore + sectionScore + alignmentScore + fontScore - grammarPenalty
    );

    setScore(totalScore);

    setReport(
      `Resume Length Score: ${lengthScore.toFixed(1)} / 40\n` +
      `Sections Found (${foundSections.length}/${requiredSections.length}): ${foundSections.join(', ')}\n` +
      `Section Score: ${sectionScore.toFixed(1)} / 30\n` +
      `Alignment Score: ${alignmentScore} / 15 (default)\n` +
      `Font Size Score: ${fontScore} / 15 (default)\n` +
      `Grammar Penalty: ${grammarPenalty.toFixed(1)} / 10\n` +
      '-------------------------\n' +
      `Overall Resume Quality Score: ${totalScore} / 100`
    );

    handleShowExplosion(totalScore);
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setError(null);
      setScore(null);
      setReport('');
      setBranchRoleScores([]);
      setShowExplosion(false);
      setGrammarErrors([]);

      if (!selectedBranch) {
        setError('Please select a branch of engineering before uploading a resume.');
        return;
      }
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setFileName(file.name);
      const ext = file.name.split('.').pop().toLowerCase();

      try {
        let text = '';
        if (ext === 'txt') {
          text = await file.text();
        } else if (ext === 'docx') {
          const arrayBuffer = await file.arrayBuffer();
          const { value } = await mammoth.extractRawText({ arrayBuffer });
          text = value;
        } else if (ext === 'pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            fullText += strings.join(' ') + '\n';
          }
          text = fullText;
        } else {
          setError('Unsupported file type. Please upload a .txt, .docx, or .pdf file.');
          return;
        }

        if (!text.trim()) {
          setError('Resume file appears empty.');
          return;
        }
        setResumeText(text);

        const branchObj = branchesData.find((b) => b.branch === selectedBranch);
        if (branchObj) {
          const roleScores = branchObj.roles.map((role) => ({
            role: role.title,
            score: calculateMatchScore(text, role.keywords),
          }));
          setBranchRoleScores(roleScores);

          if (!selectedRole) {
            const topRole = roleScores.reduce((prev, curr) =>
              curr.score > prev.score ? curr : prev
            );
            setSelectedRole(topRole.role);
            handleShowExplosion(topRole.score);
          } else {
            const selectedRoleScore =
              roleScores.find((r) => r.role === selectedRole)?.score || 0;
            handleShowExplosion(selectedRoleScore);
          }

          analyzeTextContent(text);

          const grammarResults = await checkGrammar(text);
          setGrammarErrors(grammarResults);
        }
      } catch (err) {
        setError('Error reading file: ' + err.message);
        console.error(err);
      }
    },
    [selectedBranch, selectedRole]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.txt,.docx,.pdf',
    multiple: false,
  });

  const selectedRolePercent =
    selectedRole && branchRoleScores.length > 0
      ? branchRoleScores.find((r) => r.role === selectedRole)?.score ?? 0
      : 0;

  const selectedRoleObj =
    selectedBranch && selectedRole
      ? branchesData
          .find((b) => b.branch === selectedBranch)
          ?.roles.find((r) => r.title === selectedRole)
      : null;

  const missingSkills =
    resumeText && selectedRoleObj
      ? getMissingSkills(resumeText, selectedRoleObj.keywords)
      : [];

  const [dropzoneHover, setDropzoneHover] = useState(false);

  const selectStyle = {
    width: '100%',
    fontSize: 16,
    padding: 8,
    borderRadius: 6,
    border: '1px solid #444',
    backgroundColor: '#1a1a1a',
    color: '#eee',
    cursor: 'pointer',
  };

  const disabledSelectStyle = {
    backgroundColor: '#333',
    cursor: 'not-allowed',
  };

  const dropzoneBaseStyle = {
    border: '3px dashed #90ee90',
    borderRadius: 12,
    padding: 42,
    textAlign: 'center',
    backgroundColor: '#2a2a2a',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    marginBottom: 32,
    userSelect: 'none',
    transform: 'scale(1)',
  };

  const dropzoneActiveStyle = {
    transform: 'scale(1.05)',
  };

  const dropzoneHoverStyle = {
    transform: 'scale(1.05)',
  };

  return (
    <div
      style={{
        maxWidth: 850,
        margin: '48px auto',
        background: '#222',
        padding: 40,
        borderRadius: 12,
        color: '#eee',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        minHeight: 600,
      }}
    >
      {showExplosion && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <ConfettiExplosion
            colors={['#ff4444', '#f4c242', '#42f46e', '#4287f4', '#d742f4', '#f44174']}
            particleCount={100}
            duration={2000}
            force={0.8}
            dragFriction={0.12}
            gravity={0.3}
          />
        </div>
      )}

      <h1 style={{ color: '#90ee90', textAlign: 'center', marginBottom: 28 }}>
        Resume Analyzer
      </h1>

      <div style={{ marginBottom: 22, display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        <label style={{ flexGrow: 1 }}>
          <span style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
            Select Engineering Branch:
          </span>
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            style={selectStyle}
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
          <span style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
            Select Job Role:
          </span>
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            disabled={!selectedBranch || rolesForSelectedBranch.length === 0}
            style={
              !selectedBranch
                ? { ...selectStyle, ...disabledSelectStyle }
                : selectStyle
            }
          >
            <option value="">-- Select Role --</option>
            {rolesForSelectedBranch.map((role) => (
              <option key={role.title} value={role.title}>
                {role.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        {...getRootProps()}
        onMouseEnter={() => setDropzoneHover(true)}
        onMouseLeave={() => setDropzoneHover(false)}
        style={{
          ...dropzoneBaseStyle,
          ...(isDragActive ? dropzoneActiveStyle : {}),
          ...(dropzoneHover && !isDragActive ? dropzoneHoverStyle : {}),
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop your resume file here ...</p>
        ) : (
          <p>Drag & drop your resume file here, or click to select a file</p>
        )}
      </div>

      {fileName && (
        <p>
          <strong>Selected File: </strong>
          {fileName}
        </p>
      )}

      {error && (
        <p style={{ color: '#ff6666', whiteSpace: 'pre-wrap', marginTop: 8 }}>{error}</p>
      )}

      {score !== null && (
        <div
          style={{
            backgroundColor: '#181818',
            padding: 24,
            borderRadius: 12,
            marginBottom: 32,
            color: '#ccc',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginTop: 0, color: '#90ee90' }}>Overall Resume Quality</h2>
          <div style={{ width: 140, height: 140, margin: 'auto' }}>
            <CircularProgressbar
              value={score}
              text={`${score}%`}
              strokeWidth={9}
              styles={buildStyles({
                textSize: '28px',
                pathColor: getStrokeColor(score),
                textColor: '#fff',
                trailColor: '#333',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              marginTop: 16,
              fontSize: 15,
              color: '#ddd',
              maxWidth: 620,
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'left',
            }}
          >
            {report}
          </pre>
        </div>
      )}

      {grammarErrors.length > 0 && (
        <div style={{ color: '#ffcc00', marginTop: 20, maxHeight: 200, overflowY: 'auto', textAlign: 'left' }}>
          <h4>Grammar Issues Found:</h4>
          <ul>
            {grammarErrors.map(({ message, replacements }, index) => (
              <li key={index}>
                <strong>{message}</strong>
                {replacements.length > 0 && (
                  <div>Suggestions: {replacements.map(r => r.value).join(', ')}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedRole && branchRoleScores.length > 0 && (
        <div
          style={{
            backgroundColor: '#151515',
            padding: 24,
            borderRadius: 12,
            color: '#eee',
            maxWidth: 750,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <h2 style={{ color: '#90ee90', marginTop: 0, marginBottom: 18 }}>
            Job Role Fit Percentages in {selectedBranch}
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 40,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ minWidth: 180, textAlign: 'center' }}>
              <CircularProgressbar
                value={selectedRolePercent}
                text={`${Math.round(selectedRolePercent)}%`}
                strokeWidth={9}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: getStrokeColor(selectedRolePercent),
                  textColor: '#fff',
                  trailColor: '#333',
                  pathTransitionDuration: 0.5,
                })}
              />
              <p style={{ marginTop: 10, fontWeight: 'bold' }}>{selectedRole}</p>

              {resumeText && selectedRoleObj && (
                <>
                  {missingSkills.length === 0 ? (
                    <p
                      style={{
                        marginTop: 12,
                        color: '#4caf50',
                        fontWeight: 'bold',
                        fontSize: 14,
                      }}
                    >
                      Great! Your resume contains all the key skills for this role.
                    </p>
                  ) : (
                    <div
                      style={{
                        marginTop: 12,
                        textAlign: 'left',
                        fontSize: 14,
                        maxHeight: 150,
                        overflowY: 'auto',
                      }}
                    >
                      <p style={{ fontWeight: 'bold', marginBottom: 6 }}>
                        Missing skills for <em>{selectedRole}</em>:
                      </p>
                      <ul style={{ marginTop: 0, paddingLeft: 20, color: '#f44336' }}>
                        {missingSkills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 300 }}>
              <h3 style={{ marginTop: 0, marginBottom: 12 }}>All Job Roles:</h3>
              <ul style={{ paddingLeft: 20, maxHeight: 250, overflowY: 'auto' }}>
                {branchRoleScores.map(({ role, score }) => (
                  <li
                    key={role}
                    style={{
                      fontWeight: role === selectedRole ? 'bold' : 'normal',
                      color: role === selectedRole ? '#90ee90' : '#ccc',
                      fontSize: 16,
                      marginBottom: 6,
                    }}
                  >
                    {role}: {score.toFixed(2)}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p
            style={{
              fontSize: 13,
              marginTop: 16,
              color: '#bbb',
              textAlign: 'center',
            }}
          ></p>
        </div>
      )}
    </div>
  );
}