import React, { useState, useEffect } from 'react';

function TypingCursor({ words, typingSpeed = 150, pauseTime = 1500 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentWord = words[currentWordIndex];

    if (!isDeleting && displayedText.length < currentWord.length) {
      timer = setTimeout(() => {
        setDisplayedText(currentWord.slice(0, displayedText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && displayedText.length === currentWord.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
    } else if (isDeleting && displayedText.length > 0) {
      timer = setTimeout(() => {
        setDisplayedText(currentWord.slice(0, displayedText.length - 1));
      }, typingSpeed / 2);
    } else if (isDeleting && displayedText.length === 0) {
      setIsDeleting(false);
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, words, currentWordIndex, typingSpeed, pauseTime]);

  return (
    <h2
      aria-label="Typing animation"
      style={{
        display: 'inline-block',
        fontFamily: "'Courier New', Courier, monospace",
        fontWeight: 'bold',
        fontSize: '2rem',
        color: '#2dd4bf',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        margin: '0 auto 15px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {displayedText}
      <span
        style={{
          display: 'inline-block',
          width: '3px',
          height: '1.5em',
          backgroundColor: '#2dd4bf',
          verticalAlign: 'bottom',
          marginLeft: '4px',
          animation: 'blink 1s step-start 0s infinite',
          fontWeight: 'bold',
        }}
      />
      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </h2>
  );
}

function HomeContent() {
  const words = ['Build', 'Analyze', 'Ensure', 'Optimize', 'Stand out'];

  return (
    <div style={{ width: '100vw', margin: 0, padding: 0, background: '#151515', minHeight: '100vh' }}>
      <div
        style={{
          padding: '40px',
          maxWidth: '900px',
          margin: '40px auto',
          color: '#D1FAE5',
          background: '#202020',
          borderRadius: '16px',
          boxShadow: '0 6px 32px rgba(0,0,0,0.48)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#90ee90', fontWeight: 700, fontSize: '2.3rem', marginBottom: '30px' }}>
          Welcome to Renalyze, Your Ultimate Career Toolkit
        </h1>
        <p style={{ fontSize: '1.18rem', lineHeight: 1.6, marginBottom: '20px' }}>
          Elevate your career journey with intuitive tools designed to make you stand out. Whether building your resume from scratch or
          perfecting it for your next big interview, we empower you every step of the way.
        </p>

        <TypingCursor words={words} />

        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginTop: '48px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Build Resume Card */}
          <div
            style={{
              flexBasis: '320px',
              background: '#1f2937',
              borderRadius: '12px',
              padding: '28px 24px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(45, 212, 191, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
            }}
          >
            <h2 style={{ color: '#ff6f00', fontSize: '1.24rem' }}>Effortless Resume Builder</h2>
            <p style={{ color: '#e6ffe6', marginTop: '12px', lineHeight: 1.6 }}>
              Guided steps, modern templates, and customized sections let you build a resume that highlights your unique strengths and achievements.
              Export to PDF, share links, or save versions for every application.
            </p>
          </div>

          {/* Resume Analyzer Card */}
          <div
            style={{
              flexBasis: '320px',
              background: '#1e252f',
              borderRadius: '12px',
              padding: '28px 24px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.12)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(45, 212, 191, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.12)';
            }}
          >
            <h2 style={{ color: '#ff6f00', fontSize: '1.24rem' }}>Powerful Resume Analyzer</h2>
            <p style={{ color: '#dbeafe', marginTop: '12px', lineHeight: 1.6 }}>
              Paste or upload your resume for instant, AI-driven feedback: skill gaps, formatting, ATS-readiness, and targeted suggestions.
              See how your resume compares for specific job roles.
            </p>
          </div>

          {/* Analyze Manual Calculator Card */}
          <div
            style={{
              flexBasis: '320px',
              background: '#1c2a37',
              borderRadius: '12px',
              padding: '28px 24px',
              boxShadow: '0 2px 20px rgba(0,0,0,0.10)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(45, 212, 191, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.10)';
            }}
          >
            <h2 style={{ color: '#ff6f00', fontSize: '1.24rem' }}>Resume Analyzer</h2>
            <p style={{ color: '#a9d7f5', marginTop: '12px', lineHeight: 1.6 }}>
              Our Analyze module works as a manual calculator for resume quality, using JavaScript to parse and evaluate structural and content elements.
            </p>
            <p style={{ color: '#a9d7f5', marginTop: '12px', lineHeight: 1.6 }}>
              This approach provides clear, actionable feedback on formatting, completeness, and readability, helping you refine your resume with precision beyond AI automation.
            </p>
          </div>
        </div>

        <hr style={{ margin: '44px 0', border: '1px solid #333' }} />

        <h3 style={{ color: '#90ee90', fontWeight: 500 }}>Why Choose Us?</h3>
        <ul
          style={{
            fontSize: '1.1rem',
            color: '#bbffbb',
            margin: '28px 0',
            lineHeight: '1.8',
            textAlign: 'left',
            maxWidth: '620px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <li>Modern, eye-catching, and professional templates</li>
          <li>Actionable insights tailored to your goals</li>
          <li>No more guesswork—get feedback that matters</li>
          <li>Built for all career stages, from entry-level to executive</li>
        </ul>
        <>
          <p
            style={{
              color: '#fff',
              marginTop: '12px',
              fontSize: '1.16rem',
              fontWeight: '600',
              animation: 'electricGlow 1.2s ease-in-out infinite',
              textShadow:
                '0 0 8px #2dd4bf, 0 0 15px #2dd4bf, 0 0 25px #2dd4bf, 0 0 35px #14b8a6, 0 0 45px #14b8a6, 0 0 60px #14b8a6',
            }}
          >
            Start optimizing your career toolkit today!
          </p>
          <style>{`
            @keyframes electricGlow {
              0%, 100% {
                text-shadow:
                  0 0 2px #2dd4bf,
                  0 0 5px #2dd4bf,
                  0 0 10px #2dd4bf,
                  0 0 20px #14b8a6,
                  0 0 30px #14b8a6,
                  0 0 40px #14b8a6;
                opacity: 1;
              }
              25%, 75% {
                opacity: 0.85;
              }
            }
          `}</style>
        </>
      </div>
    </div>
  );
}

export default HomeContent;
