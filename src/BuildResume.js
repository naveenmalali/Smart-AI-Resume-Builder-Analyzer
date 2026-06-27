import React, { useState } from "react";
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow,TabStopType, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

const containerStyle = {
  maxWidth: "700px",
  margin: "48px auto",
  background: "#222",
  borderRadius: "12px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
  color: "#eee",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
};
const countryCallingCodes = [
  { code: "+1",   name: "United States" },
  { code: "+91",  name: "India" },
  { code: "+44",  name: "United Kingdom" },
  { code: "+61",  name: "Australia" },
  { code: "+81",  name: "Japan" },
  { code: "+49",  name: "Germany" },
  { code: "+86",  name: "China" },
  { code: "+33",  name: "France" },
  { code: "+7",   name: "Russia" },
  { code: "+39",  name: "Italy" },
  { code: "+34",  name: "Spain" },
  { code: "+234", name: "Nigeria" },
  { code: "+55",  name: "Brazil" },
  { code: "+27",  name: "South Africa" },
  { code: "+63",  name: "Philippines" },
  { code: "+62",  name: "Indonesia" },
  { code: "+64",  name: "New Zealand" },
  { code: "+82",  name: "South Korea" },
  { code: "+974", name: "Qatar" },
  // ...add as many more as you like
];

const sectionStyle = { marginBottom: "32px" };
const sectionTitleStyle = {
  borderBottom: "2px solid #90ee90",
  paddingBottom: "8px",
  marginBottom: "20px",
  fontSize: "22px",
  color: "#90ee90",
  fontWeight: "bold",
};
const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};
const fullWidthInputStyle = { gridColumn: "1 / -1" };
const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontWeight: "600",
  fontSize: "14px",
};
const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #555",
  backgroundColor: "#333",
  color: "#fff",
  fontSize: "16px",
  marginBottom: "16px",
};
const textareaStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #555",
  backgroundColor: "#333",
  color: "#fff",
  fontSize: "16px",
  minHeight: "80px",
  resize: "vertical",
  marginBottom: "16px",
};
const buttonStyle = {
  backgroundColor: "#90ee90",
  color: "#151515",
  padding: "12px 28px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "18px",
  cursor: "pointer",
  transition: "background-color 0.3s",
  marginTop: "10px",
  marginRight: "15px",
};
const projectLangTagStyle = {
  display: "inline-block",
  background: "#90ee90",
  color: "#151515",
  padding: "6px 12px",
  borderRadius: "20px",
  marginRight: "8px",
  marginBottom: "8px",
};

export default function BuildResume() {
  const [formData, setFormData] = useState({
    name: "",
    fathersName: "",
    countryCode: "+91",
    contactNumber: "",
    mothersName: "",
    nationality: "",
    dob: "",
    gender: "",
    hobbies: "",
    languages: [],
    currentLanguage: "",
    dbms: "",
    office: "",
    operatingSystem: "",
    careerObjective: "",
    internshipExperience: "",
    schoolName: "",
    sslcPercentage: "",
    puCollegeName: "",
    puPercentage: "",
    diplomaCollegeName: "",
    diplomaPercentage: "",
    engineeringCollege: "",
    engineeringBoard: "",
    engineeringPercentage: "",
    engineeringYear: "",
    projects: [],
    currentProjectTitle: "",
    currentProjectDescription: "",
    currentProjectLanguages: [],
    currentProjectLanguage: "",
    editProjectIndex: -1,
    achievements: [],
    currentAchievement: "",
    certifications: [],
    currentCertification: "",
    personalSkills: [],
    currentPersonalSkill: "",
    extraCurricular: [],
    currentExtraCurricular: "",
    truthDeclaration: "",
    place: "",
    date: "",
    email: "",
    linkedin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add language to main languages list
  const addLanguage = () => {
    const lang = formData.currentLanguage.trim();
    if (lang && !formData.languages.includes(lang)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, lang],
        currentLanguage: "",
      }));
    }
  };

  const removeLanguage = (index) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  // Project Profile Language input handlers
  const addProjectLanguage = () => {
    const lang = formData.currentProjectLanguage.trim();
    if (lang && !formData.currentProjectLanguages.includes(lang)) {
      setFormData((prev) => ({
        ...prev,
        currentProjectLanguages: [...prev.currentProjectLanguages, lang],
        currentProjectLanguage: "",
      }));
    }
  };

  const removeProjectLanguage = (index) => {
    setFormData((prev) => ({
      ...prev,
      currentProjectLanguages: prev.currentProjectLanguages.filter((_, i) => i !== index),
    }));
  };

  // Add or Update Project
  const addOrUpdateProject = () => {
    if (!formData.currentProjectTitle.trim()) {
      alert("Please enter project title");
      return;
    }
    const project = {
      title: formData.currentProjectTitle.trim(),
      description: formData.currentProjectDescription.trim(),
      languages: [...formData.currentProjectLanguages],
    };
    if (formData.editProjectIndex === -1) {
      setFormData((prev) => ({
        ...prev,
        projects: [...prev.projects, project],
        currentProjectTitle: "",
        currentProjectDescription: "",
        currentProjectLanguages: [],
        currentProjectLanguage: "",
      }));
    } else {
      setFormData((prev) => {
        const updatedProjects = [...prev.projects];
        updatedProjects[prev.editProjectIndex] = project;
        return {
          ...prev,
          projects: updatedProjects,
          currentProjectTitle: "",
          currentProjectDescription: "",
          currentProjectLanguages: [],
          currentProjectLanguage: "",
          editProjectIndex: -1,
        };
      });
    }
  };

  const editProject = (index) => {
    const proj = formData.projects[index];
    setFormData((prev) => ({
      ...prev,
      currentProjectTitle: proj.title,
      currentProjectDescription: proj.description,
      currentProjectLanguages: [...proj.languages],
      currentProjectLanguage: "",
      editProjectIndex: index,
    }));
  };

  const cancelEdit = () => {
    setFormData((prev) => ({
      ...prev,
      currentProjectTitle: "",
      currentProjectDescription: "",
      currentProjectLanguages: [],
      currentProjectLanguage: "",
      editProjectIndex: -1,
    }));
  };

  const removeProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
      editProjectIndex: prev.editProjectIndex === index ? -1 : prev.editProjectIndex,
    }));
  };

  // Utility functions for DOCX with styling and separators
  const fontSize = 22; // 11 pt in half-points

  const makeHeading = (text) =>
    new Paragraph({
      children: [new TextRun({ text, bold: true, size: fontSize })],
      spacing: { after: 160 },
    });

  const makeParagraph = (text) =>
    new Paragraph({
      children: [new TextRun({ text, size: fontSize })],
      spacing: { after: 160 },
    });

  const makeManualSeparator = () =>
    new Paragraph({
      text: "_________________________________________________________________________________________",
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });

  // Helper for bullet lists in docx
  const makeBulletedList = (arr) =>
    Array.isArray(arr) && arr.length > 0
      ? arr.map(
          (item) =>
            new Paragraph({
              text: item,
              bullet: { level: 0 },
              spacing: { after: 120 },
              size: fontSize,
            })
        )
      : [new Paragraph({ text: "No items listed.", spacing: { after: 120 } })];

  const generateResume = async () => {
    const doc = new Document({
      styles: {
        default: {
          heading1: { run: { size: fontSize, bold: true, font: "Arial" }, paragraph: { spacing: { after: 160 } } },
          normal: { run: { size: fontSize, font: "Arial" } },
        },
      },
      sections: [
    {
      properties: {
        page: {
          margin: {
            top: 567,    // 1 cm = 567 twips
            right: 567,
            bottom: 567,
            left: 567,
          },
        },
      },
          children: [
            new Paragraph({
              children: [new TextRun({ text: formData.name || "Your Name", bold: true, size: fontSize * 4 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${formData.email || "email@example.com"} | ${formData.countryCode || ""} ${formData.contactNumber || "Contact Number"} | ${formData.linkedin || "LinkedIn ID"}`,
                  italics: true,
                  size: fontSize,
                  font: "Arial",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),

            makeHeading("Career Objective"),
            makeParagraph(formData.careerObjective || "N/A"),
            makeManualSeparator(),

            makeHeading("Educational Qualifications"),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Course")] }),
                    new TableCell({ children: [new Paragraph("School/College")] }),
                    new TableCell({ children: [new Paragraph("Board/University")] }),
                    new TableCell({ children: [new Paragraph("Percentage/CGPA")] }),
                    new TableCell({ children: [new Paragraph("Year of Passing")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("10th")] }),
                    new TableCell({ children: [new Paragraph(formData.schoolName || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.schoolBoard || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.sslcPercentage || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.schoolYear || "N/A")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Pre-University Course")] }),
                    new TableCell({ children: [new Paragraph(formData.puCollegeName || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.puBoard || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.puPercentage || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.puYear || "N/A")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Diploma")] }),
                    new TableCell({ children: [new Paragraph(formData.diplomaCollegeName || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.diplomaBoard || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.diplomaPercentage || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.diplomaYear || "N/A")] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("B.E")] }),
                    new TableCell({ children: [new Paragraph(formData.engineeringCollege || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.engineeringBoard || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.engineeringPercentage || "N/A")] }),
                    new TableCell({ children: [new Paragraph(formData.engineeringYear || "N/A")] }),
                  ],
                }),
              ],
            }),

            makeManualSeparator(),

            makeHeading("Internship Experience"),
            makeParagraph(formData.internshipExperience || "N/A"),
            makeManualSeparator(),

            makeHeading("Software Proficiency"),
            makeParagraph(`Languages: ${formData.languages.length > 0 ? formData.languages.join(", ") : "N/A"}`),
            makeParagraph(`DBMS: ${formData.dbms || "N/A"}`),
            makeParagraph(`Office: ${formData.office || "N/A"}`),
            makeParagraph(`Operating System: ${formData.operatingSystem || "N/A"}`),
            makeManualSeparator(),

            makeHeading("Achievements"),
            ...makeBulletedList(formData.achievements),
            makeManualSeparator(),

            makeHeading("Certifications"),
            ...makeBulletedList(formData.certifications),
            makeManualSeparator(),

            makeHeading("Project Profile"),
            ...(formData.projects.length > 0
              ? formData.projects.flatMap((proj) => [
                  makeParagraph(`Title: ${proj.title}`, fontSize),
                  makeParagraph(`Description: ${proj.description || "N/A"}`, fontSize),
                  makeParagraph(`Languages Used: ${proj.languages.length > 0 ? proj.languages.join(", ") : "N/A"}`, fontSize),
                ])
              : [makeParagraph("No projects added.")]),
            makeManualSeparator(),

            makeHeading("Personal Skills"),
...makeBulletedList(formData.personalSkills),

            makeManualSeparator(),

            makeHeading("Extra Curricular"),
            ...makeBulletedList(formData.extraCurricular),
            makeManualSeparator(),

            makeHeading("Personal Profile"),
            makeParagraph(`Father's Name: ${formData.fathersName || "N/A"}`),
            makeParagraph(`Mother's Name: ${formData.mothersName || "N/A"}`),
            makeParagraph(`Nationality: ${formData.nationality || "N/A"}`),
            makeParagraph(`Date of Birth: ${formData.dob || "N/A"}`),
            makeParagraph(`Gender: ${formData.gender || "N/A"}`),
            makeParagraph(`Hobbies: ${formData.hobbies || "N/A"}`),
            makeParagraph(`Languages: ${formData.languages.length > 0 ? formData.languages.join(", ") : "N/A"}`),
            makeManualSeparator(),

            makeHeading("Truth Declaration"),
            makeParagraph(formData.truthDeclaration || "I hereby declare that the above information is true to the best of my knowledge."),
            makeManualSeparator(),

            makeHeading("date and place"),

            // Paragraph for Place (left aligned)
new Paragraph({
  children: [
    new TextRun({
      text: `Place: ${formData.place || "N/A"}`,
      font: "Arial",
      size: fontSize,
    }),
  ],
  spacing: { before: 400 },
  alignment: AlignmentType.LEFT,
}),

// Paragraph for Date (left) and Your Name (right)
new Paragraph({
  tabStops: [
    {
      type: TabStopType.RIGHT,
      position: 9022, // right margin
    },
  ],
  children: [
    new TextRun({
      text: `Date: ${formData.date || "N/A"}`,
      font: "Arial",
      size: fontSize,
    }),
    new TextRun({
      text: "\t" + (formData.name || "Your Name"),
      font: "Arial",
      size: fontSize,
    }),
  ],
  spacing: { before: 100 },
  alignment: AlignmentType.LEFT,
}),

          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${formData.name || "resume"}.docx`);
  };
function sectionLine(doc, y) {
  y += 1; // space before line
  doc.setDrawColor(0, 0, 0); // Black color
  doc.setLineWidth(0.3);     // Thin line
  doc.line(15, y, 195, y);   // line from x=15 to x=195 across page
  return y + 8;             // space after line
}
function safeY(doc, y, gap = 30) {
  if (y + gap > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    return 20;
  }
  return y;
}

 const generatePDFResume = () => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(formData.name || "Your Name", 105, y, { align: "center" });
  y += 14;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${formData.email || "email@example.com"} | +${formData.countryCode || "91"} ${formData.contactNumber || "Contact Number"} | ${formData.linkedin || "LinkedIn ID"}`,
    105, y, { align: "center" }
  );
  y = sectionLine(doc, y + 6);

  function printSection(title, lines, bullets = false) {
    y = safeY(doc, y, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, 15, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    if (bullets && Array.isArray(lines)) {
      if (lines.length > 0) {
        lines.forEach(txt => {
          const wrapped = doc.splitTextToSize("- " + txt, 175);
          wrapped.forEach(line => { 
            y = safeY(doc, y, 6); 
            doc.text(line, 18, y); 
            y += 6; 
          });
        });
      } else {
        doc.text("No items listed.", 18, y);
        y += 6;
      }
    } else {
      (Array.isArray(lines) ? lines : [lines]).forEach(txt => {
        const wrapped = doc.splitTextToSize(txt || '', 175);
        wrapped.forEach(line => {
          y = safeY(doc, y, 6);
          doc.text(line, 18, y);
          y += 6;
        });
      });
    }
    y = sectionLine(doc, y);
  }

  printSection("Career Objective", [formData.careerObjective || "N/A"]);
  y = safeY(doc, y, 14);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Educational Qualifications", 15, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Course", "School/College", "Board/University", "Percentage/CGPA", "Year of Passing"]],
    body: [
      ["10th", formData.schoolName || "N/A", formData.schoolBoard || "N/A", formData.sslcPercentage || "N/A", formData.schoolYear || "N/A"],
      ["Pre-University Course", formData.puCollegeName || "N/A", formData.puBoard || "N/A", formData.puPercentage || "N/A", formData.puYear || "N/A"],
      ["Diploma", formData.diplomaCollegeName || "N/A", formData.diplomaBoard || "N/A", formData.diplomaPercentage || "N/A", formData.diplomaYear || "N/A"],
      ["B.E", formData.engineeringCollege || "N/A", formData.engineeringBoard || "N/A", formData.engineeringPercentage || "N/A", formData.engineeringYear || "N/A"],
    ],
    theme: "plain",
    headStyles: { fillColor: [200, 200, 200], fontStyle: "bold", fontSize: 11 },
    styles: { cellPadding: 2, font: "helvetica", fontSize: 11 }
  });
  y = doc.lastAutoTable.finalY + 6;
  y = sectionLine(doc, y);

  printSection("Internship Experience", [formData.internshipExperience || "N/A"]);
  printSection("Software Proficiency", [
    "Languages: " + (formData.languages?.length ? formData.languages.join(", ") : "N/A"),
    "DBMS: " + (formData.dbms || "N/A"),
    "Office: " + (formData.office || "N/A"),
    "Operating System: " + (formData.operatingSystem || "N/A")
  ]);

  printSection("Achievements", formData.achievements || [], true);
  printSection("Certifications", formData.certifications || [], true);

  // Project Profile (title bold, colon, description normal)
  if (formData.projects?.length) {
    y = safeY(doc, y, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Project Profile", 15, y);
    y += 6;
    formData.projects.forEach((p) => {
      // Project title bold, with colon
      doc.setFont("helvetica", "bold");
      const titleText = `${p.title || "NA"}:`;
      const wrappedTitle = doc.splitTextToSize(titleText, 165);
      wrappedTitle.forEach(line => {
        y = safeY(doc, y, 6);
        doc.text(line, 18, y);
        y += 6;
      });
      // Project description normal
      doc.setFont("helvetica", "normal");
      const wrappedDesc = doc.splitTextToSize((p.description || "NA"), 155);
      wrappedDesc.forEach(line => {
        y = safeY(doc, y, 6);
        doc.text(line, 25, y);
        y += 6;
      });
    });
    y = sectionLine(doc, y);
  } else {
    printSection("Project Profile", ["No projects added."]);
  }

  printSection("Personal Skills", formData.personalSkills || [], true);
  printSection("Extra Curricular", formData.extraCurricular || [], true);

  y = safeY(doc, y);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Personal Profile", 15, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  [
    `Father's Name: ${formData.fathersName || "N/A"}`,
    `Mother's Name: ${formData.mothersName || "N/A"}`,
    `Nationality: ${formData.nationality || "N/A"}`,
    `Date of Birth: ${formData.dob || "N/A"}`,
    `Gender: ${formData.gender || "N/A"}`,
    `Hobbies: ${formData.hobbies || "N/A"}`,
    `Languages: ${formData.languages?.length ? formData.languages.join(", ") : "N/A"}`
  ].forEach((txt) => {
    const wrapped = doc.splitTextToSize(txt, 175);
    wrapped.forEach(line => {
      y = safeY(doc, y, 6);
      doc.text(line, 18, y);
      y += 6;
    });
  });
  y = sectionLine(doc, y);

  printSection("Truth Declaration", [formData.truthDeclaration || "I hereby declare that the above information is true to the best of my knowledge."]);

  y = safeY(doc, y, 12);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Place: ${formData.place || "N/A"}`, 18, y);
  doc.text(`Date: ${formData.date || "N/A"}`, 85, y);
  doc.text(formData.name || "Your Name", 155, y);

  doc.save(`${formData.name || "resume"}-resume.pdf`);
};

  return (
    <div style={containerStyle}>
      {/* Animated, outlined heading */}
      <h1
        style={{
          fontSize: "28px",
          letterSpacing: "2px",
          fontFamily: "'Arial Black', Arial, sans-serif",
          textAlign: "center",
          marginBottom: "40px",
          color: "#90ee90"
        }}
      >Build Your Resume</h1>

      <form>
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Headline Information</h2>
          <div style={formGrid}>
            <div>
              <label htmlFor="name" style={labelStyle}>Name</label>
              <input
                type="text"
                id="name"
                name="name"
                style={inputStyle}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="contactNumber" style={labelStyle}>Contact Number</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    width: "160px",
                    marginBottom: 0,
                    paddingRight: "4px"
                  }}
                >
                  {countryCallingCodes.map(option => (
                    <option key={option.code} value={option.code}>
                      {option.name} ({option.code})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                style={inputStyle}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="linkedin" style={labelStyle}>LinkedIn ID</label>
              <input
                type="text"
                id="linkedin"
                name="linkedin"
                style={inputStyle}
                value={formData.linkedin || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Career Objective */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Career Objective</h2>
          <textarea
            name="careerObjective"
            value={formData.careerObjective}
            onChange={handleChange}
            placeholder="Write your career objective..."
            style={textareaStyle}
          />
        </section>

        {/* Educational Qualifications */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Educational Qualifications</h2>
          <div style={formGrid}>
            <div>
              <label htmlFor="schoolName" style={labelStyle}>
                School Name
              </label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                style={inputStyle}
                value={formData.schoolName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="sslcPercentage" style={labelStyle}>
                SSLC Percentage
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                id="sslcPercentage"
                name="sslcPercentage"
                style={inputStyle}
                value={formData.sslcPercentage}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="schoolBoard" style={labelStyle}>School Board/University</label>
              <input
                type="text"
                id="schoolBoard"
                name="schoolBoard"
                style={inputStyle}
                value={formData.schoolBoard}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="schoolYear" style={labelStyle}>Year of Passing (School)</label>
              <input
                type="text"
                id="schoolYear"
                name="schoolYear"
                style={inputStyle}
                value={formData.schoolYear}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="puCollegeName" style={labelStyle}>
                PU College Name
              </label>
              <input
                type="text"
                id="puCollegeName"
                name="puCollegeName"
                style={inputStyle}
                value={formData.puCollegeName}
                onChange={handleChange}
                disabled={formData.diplomaCollegeName.trim() !== ""}
              />
            </div>
            <div>
              <label htmlFor="puPercentage" style={labelStyle}>
                PU Percentage
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                id="puPercentage"
                name="puPercentage"
                style={inputStyle}
                value={formData.puPercentage}
                onChange={handleChange}
                disabled={formData.diplomaPercentage.trim() !== ""}
              />
            </div>
            <div>
              <label htmlFor="puBoard" style={labelStyle}>PU Board/University</label>
              <input
                type="text"
                id="puBoard"
                name="puBoard"
                style={inputStyle}
                value={formData.puBoard}
                onChange={handleChange}
                disabled={formData.diplomaCollegeName.trim() !== ""}
              />
            </div>
            <div>
              <label htmlFor="puYear" style={labelStyle}>Year of Passing (PU)</label>
              <input
                type="text"
                id="puYear"
                name="puYear"
                style={inputStyle}
                value={formData.puYear}
                onChange={handleChange}
                disabled={formData.diplomaCollegeName.trim() !== ""}
              />
            </div>
            <div>
              <label htmlFor="diplomaCollegeName" style={labelStyle}>
                Diploma College Name
              </label>
              <input
                type="text"
                id="diplomaCollegeName"
                name="diplomaCollegeName"
                style={inputStyle}
                value={formData.diplomaCollegeName}
                onChange={handleChange}
                disabled={formData.puCollegeName.trim() !== ""}
              />
            </div>
            <div>
              <label htmlFor="diplomaPercentage" style={labelStyle}>
                Diploma Percentage
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                id="diplomaPercentage"
                name="diplomaPercentage"
                style={inputStyle}
                value={formData.diplomaPercentage}
                onChange={handleChange}
                disabled={formData.puPercentage.trim() !== ""}
              />
            </div>
            <div>
              <label htmlFor="diplomaBoard" style={labelStyle}>Diploma Board/University</label>
              <input
                type="text"
                id="diplomaBoard"
                name="diplomaBoard"
                style={inputStyle}
                value={formData.diplomaBoard}
                onChange={handleChange}
                disabled={formData.puCollegeName.trim() !== ""}
              />
            </div>
            <div>
              <label htmlFor="diplomaYear" style={labelStyle}>Year of Passing (Diploma)</label>
              <input
                type="text"
                id="diplomaYear"
                name="diplomaYear"
                style={inputStyle}
                value={formData.diplomaYear}
                onChange={handleChange}
                disabled={formData.puCollegeName.trim() !== ""}
              />
            </div>
            <div style={fullWidthInputStyle}>
    <label htmlFor="engineeringCollege" style={labelStyle}>
      Engineering College Name & Details
    </label>
    <input
      type="text"
      id="engineeringCollege"
      name="engineeringCollege"
      style={inputStyle}
      value={formData.engineeringCollege}
      onChange={handleChange}
    />
  </div>
  <div>
    <label htmlFor="engineeringBoard" style={labelStyle}>Engineering Board/University</label>
    <input
      type="text"
      id="engineeringBoard"
      name="engineeringBoard"
      style={inputStyle}
      value={formData.engineeringBoard}
      onChange={handleChange}
    />
  </div>
  <div>
    <label htmlFor="engineeringPercentage" style={labelStyle}>Engineering Percentage/CGPA</label>
    <input
      type="number"
      step="0.01"
      min="0"
      max="100"
      id="engineeringPercentage"
      name="engineeringPercentage"
      style={inputStyle}
      value={formData.engineeringPercentage}
      onChange={handleChange}
    />
  </div>
  <div>
    <label htmlFor="engineeringYear" style={labelStyle}>Year of Passing (Engineering)</label>
    <input
      type="text"
      id="engineeringYear"
      name="engineeringYear"
      style={inputStyle}
      value={formData.engineeringYear}
      onChange={handleChange}
    />
  </div>
          </div>
        </section>

        {/* Internship Experience */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Internship Experience</h2>
          <textarea
            name="internshipExperience"
            value={formData.internshipExperience}
            onChange={handleChange}
            placeholder="Describe your internship experiences..."
            style={textareaStyle}
          />
        </section>

        {/* Software Proficiency */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Software Proficiency</h2>
          <label style={{ ...labelStyle, marginBottom: "8px" }}>Languages</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
            <input
              type="text"
              name="currentLanguage"
              value={formData.currentLanguage}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              placeholder="Enter language"
            />
            <button
              type="button"
              onClick={addLanguage}
              style={{ ...buttonStyle, padding: "8px 12px", margin: 0, height: "38px", alignSelf: "center" }}
            >
              Add
            </button>
          </div>
          <div style={{ marginBottom: "16px" }}>
            {formData.languages.map((lang, index) => (
              <div
                key={index}
                style={{
                  display: "inline-block",
                  background: "#90ee90",
                  color: "#151515",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  marginRight: "8px",
                  marginBottom: "8px",
                }}
              >
                {lang}
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  style={{
                    marginLeft: "8px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#151515",
                  }}
                  aria-label={`Remove language ${lang}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <label htmlFor="dbms" style={labelStyle}>
            DBMS
          </label>
          <input type="text" id="dbms" name="dbms" style={inputStyle} value={formData.dbms} onChange={handleChange} />
          <label htmlFor="office" style={labelStyle}>
            Office
          </label>
          <input type="text" id="office" name="office" style={inputStyle} value={formData.office} onChange={handleChange} />
          <label htmlFor="operatingSystem" style={labelStyle}>
            Operating System
          </label>
          <input
            type="text"
            id="operatingSystem"
            name="operatingSystem"
            style={inputStyle}
            value={formData.operatingSystem}
            onChange={handleChange}
          />
        </section>

        {/* Achievements and Certifications */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Achievements</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
            <input
              type="text"
              name="currentAchievement"
              value={formData.currentAchievement}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              placeholder="Add an achievement"
            />
            <button
              type="button"
              onClick={() => {
                const item = formData.currentAchievement.trim();
                if (item && !formData.achievements.includes(item)) {
                  setFormData(prev => ({
                    ...prev,
                    achievements: [...prev.achievements, item],
                    currentAchievement: "",
                  }));
                }
              }}
              style={{ ...buttonStyle, padding: "8px 12px", margin: 0, height: "38px", alignSelf: "center" }}
            >
              Add
            </button>
          </div>
          <ul style={{ color: "#eee", paddingLeft: "20px", marginTop: 0 }}>
            {formData.achievements.map((ach, idx) => (
              <li key={idx} style={{ marginBottom: "6px" }}>
                {ach}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      achievements: prev.achievements.filter((_, i) => i !== idx),
                    }));
                  }}
                  style={{ background: "transparent", border: "none", color: "#ff6f00", cursor: "pointer", fontWeight: "bold", marginLeft: "8px" }}
                  aria-label={`Remove achievement ${ach}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
        {/* Personal Skills Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Personal Skills</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
            <input
              type="text"
              name="currentPersonalSkill"
              value={formData.currentPersonalSkill}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              placeholder="Add a personal skill"
            />
            <button
              type="button"
              onClick={() => {
                const item = formData.currentPersonalSkill.trim();
                if (item && !formData.personalSkills.includes(item)) {
                  setFormData((prev) => ({
                    ...prev,
                    personalSkills: [...prev.personalSkills, item],
                    currentPersonalSkill: "",
                  }));
                }
              }}
              style={{ ...buttonStyle, padding: "8px 12px", margin: 0, height: "38px", alignSelf: "center" }}
            >
              Add
            </button>
          </div>
          <ul style={{ color: "#eee", paddingLeft: "20px", marginTop: 0 }}>
            {formData.personalSkills.map((skill, idx) => (
              <li key={idx} style={{ marginBottom: "6px" }}>
                {skill}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      personalSkills: prev.personalSkills.filter((_, i) => i !== idx),
                    }));
                  }}
                  style={{ background: "transparent", border: "none", color: "#ff6f00", cursor: "pointer", fontWeight: "bold", marginLeft: "8px" }}
                  aria-label={`Remove personal skill ${skill}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
        {/* Certifications */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
            <input
              type="text"
              name="currentCertification"
              value={formData.currentCertification}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              placeholder="Add a certification"
            />
            <button
              type="button"
              onClick={() => {
                const item = formData.currentCertification.trim();
                if (item && !formData.certifications.includes(item)) {
                  setFormData(prev => ({
                    ...prev,
                    certifications: [...prev.certifications, item],
                    currentCertification: "",
                  }));
                }
              }}
              style={{ ...buttonStyle, padding: "8px 12px", margin: 0, height: "38px", alignSelf: "center" }}
            >
              Add
            </button>
          </div>
          <ul style={{ color: "#eee", paddingLeft: "20px", marginTop: 0 }}>
            {formData.certifications.map((cert, idx) => (
              <li key={idx} style={{ marginBottom: "6px" }}>
                {cert}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      certifications: prev.certifications.filter((_, i) => i !== idx),
                    }));
                  }}
                  style={{ background: "transparent", border: "none", color: "#ff6f00", cursor: "pointer", fontWeight: "bold", marginLeft: "8px" }}
                  aria-label={`Remove certification ${cert}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
        {/* Extra Curricular Section */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Extra Curricular</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
            <input
              type="text"
              name="currentExtraCurricular"
              value={formData.currentExtraCurricular}
              onChange={handleChange}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              placeholder="Add an extracurricular activity"
            />
            <button
              type="button"
              onClick={() => {
                const item = formData.currentExtraCurricular.trim();
                if (item && !formData.extraCurricular.includes(item)) {
                  setFormData((prev) => ({
                    ...prev,
                    extraCurricular: [...prev.extraCurricular, item],
                    currentExtraCurricular: "",
                  }));
                }
              }}
              style={{ ...buttonStyle, padding: "8px 12px", margin: 0, height: "38px", alignSelf: "center" }}
            >
              Add
            </button>
          </div>
          <ul style={{ color: "#eee", paddingLeft: "20px", marginTop: 0 }}>
            {formData.extraCurricular.map((activity, idx) => (
              <li key={idx} style={{ marginBottom: "6px" }}>
                {activity}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      extraCurricular: prev.extraCurricular.filter((_, i) => i !== idx),
                    }));
                  }}
                  style={{ background: "transparent", border: "none", color: "#ff6f00", cursor: "pointer", fontWeight: "bold", marginLeft: "8px" }}
                  aria-label={`Remove extracurricular activity ${activity}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Project Profile */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Project Profile</h2>
          <input
            type="text"
            name="currentProjectTitle"
            placeholder="Project Title"
            style={{ ...inputStyle, marginBottom: "8px" }}
            value={formData.currentProjectTitle}
            onChange={(e) => setFormData((prev) => ({ ...prev, currentProjectTitle: e.target.value }))}
          />
          <textarea
            name="currentProjectDescription"
            placeholder="Project Description"
            style={{ ...textareaStyle, marginBottom: "8px" }}
            value={formData.currentProjectDescription}
            onChange={(e) => setFormData((prev) => ({ ...prev, currentProjectDescription: e.target.value }))}
          />
          <label style={{ ...labelStyle, marginBottom: "8px" }}>Languages Used</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
            <input
              type="text"
              name="currentProjectLanguage"
              value={formData.currentProjectLanguage}
              onChange={(e) => setFormData((prev) => ({ ...prev, currentProjectLanguage: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              placeholder="Enter a language"
            />
            <button
              type="button"
              onClick={() => {
                const lang = formData.currentProjectLanguage.trim();
                if (lang && !formData.currentProjectLanguages.includes(lang)) {
                  setFormData((prev) => ({
                    ...prev,
                    currentProjectLanguages: [...prev.currentProjectLanguages, lang],
                    currentProjectLanguage: "",
                  }));
                }
              }}
              style={{ ...buttonStyle, padding: "8px 12px", margin: 0, height: "38px", alignSelf: "center" }}
            >
              Add
            </button>
          </div>
          <div style={{ marginBottom: "10px" }}>
            {formData.currentProjectLanguages.map((lang, index) => (
              <span key={index} style={projectLangTagStyle}>
                {lang}
                <button
                  type="button"
                  aria-label={`Remove language ${lang}`}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      currentProjectLanguages: prev.currentProjectLanguages.filter((_, i) => i !== index),
                    }));
                  }}
                  style={{ marginLeft: "8px", background: "transparent", border: "none", cursor: "pointer", fontWeight: "bold", color: "#151515" }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div>
            <button type="button" style={buttonStyle} onClick={addOrUpdateProject}>
              {formData.editProjectIndex === -1 ? "Add Project" : "Update Project"}
            </button>
            {formData.editProjectIndex !== -1 && (
              <button type="button" style={{ ...buttonStyle, backgroundColor: "#e07c7c", marginLeft: 7 }} onClick={cancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
          {formData.projects.length > 0 &&
            formData.projects.map((proj, index) => (
              <div key={index} style={{ marginTop: "16px", padding: "12px", background: "#333", borderRadius: "8px" }}>
                <div>
                  <strong>Title:</strong> {proj.title}
                </div>
                <div>
                  <strong>Description:</strong> {proj.description || "N/A"}
                </div>
                <div>
                  <strong>Languages Used:</strong>{" "}
                  {proj.languages.length > 0 ? proj.languages.map((l, idx) => <span key={idx} style={projectLangTagStyle}>{l}</span>) : "N/A"}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <button type="button" onClick={() => editProject(index)} style={{ ...buttonStyle, padding: "5px 13px", backgroundColor: "#f4d97c", color: "#1d1d1d" }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => removeProject(index)} style={{ ...buttonStyle, padding: "5px 13px", backgroundColor: "#e07c7c", color: "#1d1d1d", marginLeft: 7 }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
        </section>

        {/* Personal Skills Freeform Text */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Personal Skills</h2>
          <textarea
            name="personalSkills"
            value={formData.personalSkills}
            onChange={(e) => setFormData((prev) => ({ ...prev, personalSkills: e.target.value }))}
            placeholder="List your personal skills..."
            style={textareaStyle}
          />
        </section>

        {/* Extra Curricular Freeform Text */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Extra Curricular</h2>
          <textarea
            name="extraCurricular"
            value={formData.extraCurricular}
            onChange={(e) => setFormData((prev) => ({ ...prev, extraCurricular: e.target.value }))}
            placeholder="List your extracurricular activities..."
            style={textareaStyle}
          />
        </section>

        {/* Personal Profile */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Personal Profile</h2>
          <div style={formGrid}>
            <div>
              <label htmlFor="fathersName" style={labelStyle}>Father's Name</label>
              <input type="text" id="fathersName" name="fathersName" style={inputStyle} value={formData.fathersName} onChange={(e) => setFormData((prev) => ({ ...prev, fathersName: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="mothersName" style={labelStyle}>Mother's Name</label>
              <input type="text" id="mothersName" name="mothersName" style={inputStyle} value={formData.mothersName} onChange={(e) => setFormData((prev) => ({ ...prev, mothersName: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="nationality" style={labelStyle}>Nationality</label>
              <input type="text" id="nationality" name="nationality" style={inputStyle} value={formData.nationality} onChange={(e) => setFormData((prev) => ({ ...prev, nationality: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="dob" style={labelStyle}>Date of Birth</label>
              <input type="date" id="dob" name="dob" style={inputStyle} value={formData.dob} onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="gender" style={labelStyle}>Gender</label>
              <input type="text" id="gender" name="gender" style={inputStyle} value={formData.gender} onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="hobbies" style={labelStyle}>Hobbies</label>
              <textarea id="hobbies" name="hobbies" style={textareaStyle} value={formData.hobbies} onChange={(e) => setFormData((prev) => ({ ...prev, hobbies: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="languages" style={labelStyle}>Languages</label>
              <textarea id="languages" name="languages" style={textareaStyle} value={formData.languages.join(", ")} readOnly />
            </div>
          </div>
        </section>

        {/* Truth Declaration */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Truth Declaration</h2>
          <textarea
            name="truthDeclaration"
            value={formData.truthDeclaration}
            onChange={(e) => setFormData((prev) => ({ ...prev, truthDeclaration: e.target.value }))}
            placeholder="Enter your truth declaration here..."
            style={textareaStyle}
          />
        </section>
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Date and Place</h2>
          <div style={formGrid}>
            <div>
              <label htmlFor="date" style={labelStyle}>
                Date
              </label>
              <input
                type="text"
                id="date"
                name="date"
                style={inputStyle}
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="place" style={labelStyle}>
                Place
              </label>
              <input
                type="text"
                id="place"
                name="place"
                style={inputStyle}
                value={formData.place}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button type="button" onClick={generateResume} style={buttonStyle}>
            Download Resume docx.
          </button>
           <button type="button" style={buttonStyle} onClick={generatePDFResume}>
        Download Resume PDF
      </button>
        </div>
      </form>
    </div>
  );
}