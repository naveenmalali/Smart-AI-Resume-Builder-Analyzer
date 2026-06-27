// resumeStructureEvaluator.js

import Typo from 'typo-js'; // needs npm install typo-js

// List of headings in the format exported by BuildResume.js
export const expectedSections = [
  "Career Objective",
  "Educational Qualifications",
  "Internship Experience",
  "Software Proficiency",
  "Achievements",
  "Certifications",
  "Project Profile",
  "Personal Skills",
  "Extra Curricular",
  "Personal Profile",
  "Truth Declaration",
  "Date and Place"
];

// Initialize spelling dictionary (assumes en_US aff/dic are bundled/accessible)
let dictionary;
try {
  dictionary = new Typo('en_US');
} catch {
  dictionary = null; // fallback if not found
}

/**
 * Evaluates overall resume structure as per BuildResume.js
 * @param {string} text - Raw resume text extracted from file
 * @returns {{ score: number, report: string, details: object }}
 */
export function evaluateResumeStructure(text) {
  let score = 0;
  const lowerText = text.toLowerCase();

  // 1. Section presence
  let foundSections = [];
  expectedSections.forEach(section => {
    if (lowerText.includes(section.toLowerCase())) {
      foundSections.push(section);
      score += 30 / expectedSections.length;
    }
  });

  // 2. Section order
  let orderScore = 0;
  let lastIndex = -1;
  let inOrder = true;
  expectedSections.forEach(section => {
    const idx = lowerText.indexOf(section.toLowerCase());
    if (idx !== -1 && idx < lastIndex) inOrder = false;
    if (idx !== -1) lastIndex = idx;
  });
  if (inOrder) orderScore = 15;
  score += orderScore;

  // 3. Manual separator check
  let alignmentScore = 0;
  const separatorCount = (text.match(/_{5,}/g) || []).length;
  if (separatorCount >= expectedSections.length - 3) alignmentScore = 15;
  score += alignmentScore;

  // 4. Spelling check
  const words = text.replace(/[^a-zA-Z ]/g, "").split(/\s+/);
  let misspelledCount = 0;
  if (dictionary) {
    words.forEach(w => {
      if (w.length > 2 && !dictionary.check(w)) {
        misspelledCount++;
      }
    });
  }
  let spellingScore = 0;
  if (words.length > 10) {
    const spellingAccuracy = Math.max(0, 1 - misspelledCount / words.length);
    spellingScore = spellingAccuracy * 20;
    score += spellingScore;
  }

  // 5. Reasonable length/content
  const wordCount = words.length;
  let lengthScore = 0;
  if (wordCount > 300 && wordCount < 800) lengthScore = 20;
  else if (wordCount > 150) lengthScore = 10;
  score += lengthScore;

  const totalScore = Math.round(Math.min(score, 100));

  // Report generation
  const reportLines = [
    `Sections Found (${foundSections.length}/${expectedSections.length}): ${foundSections.join(", ")}`,
    `Section Order: ${inOrder ? "Correct ✅" : "Incorrect ❌"}`,
    `Separators Found: ${separatorCount}`,
    `Spelling Errors: ${dictionary ? misspelledCount : "n/a"}`,
    `Word Count: ${wordCount}`,
    `Length Score: ${lengthScore}/20`,
    `⭐ Professional Resume Structure Score: ${totalScore}/100`
  ];

  return {
    score: totalScore,
    report: reportLines.join('\n'),
    details: {
      sections: foundSections,
      order: inOrder,
      separators: separatorCount,
      spelling: dictionary ? misspelledCount : null,
      words: wordCount,
      lengthScore,
    }
  };
}
