import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// EyeIcon with animated cross bar
function EyeIcon({ visible, animate }) {
  const lineRef = useRef(null);

  const LINE_LENGTH = Math.sqrt((20 - 4) ** 2 + (20 - 4) ** 2); // diagonal length for cross bar

  useEffect(() => {
    if (lineRef.current) {
      if (animate) {
        lineRef.current.style.transition = 'stroke-dashoffset 0.35s cubic-bezier(.4,0,.2,1)';
        lineRef.current.style.strokeDasharray = LINE_LENGTH;
        // Start fully hidden (dash offset = line length)
        lineRef.current.style.strokeDashoffset = LINE_LENGTH;
        // Trigger animation to draw line (dash offset 0)
        setTimeout(() => {
          lineRef.current.style.strokeDashoffset = 0;
        }, 10);
      } else {
        // Hide line instantly when not animating
        lineRef.current.style.transition = 'none';
        lineRef.current.style.strokeDasharray = LINE_LENGTH;
        lineRef.current.style.strokeDashoffset = visible ? 0 : LINE_LENGTH;
      }
    }
  }, [animate, visible, LINE_LENGTH]);

  return (
    <svg height="22" width="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <ellipse cx="12" cy="12" rx="9" ry="6" stroke="#fff" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" stroke="#fff" strokeWidth="2" />
      <line
        ref={lineRef}
        x1="4"
        y1="4"
        x2="20"
        y2="20"
        stroke="#fff"
        strokeWidth="2"
        style={{
          strokeDasharray: LINE_LENGTH,
          strokeDashoffset: visible ? 0 : LINE_LENGTH,
        }}
      />
    </svg>
  );
}

export default function AuthPage({ onAuthSuccess, onAdminSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [focusedForm, setFocusedForm] = useState(null);
  const [colorToggle, setColorToggle] = useState(false);

  // Password visibility and animation states
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [animateUserCross, setAnimateUserCross] = useState(false);
  const [showUserConfirmPassword, setShowUserConfirmPassword] = useState(false);
  const [animateUserConfirmCross, setAnimateUserConfirmCross] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [animateAdminCross, setAnimateAdminCross] = useState(false);

  const toggleMode = (newMode) => {
    setMode(newMode);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (localStorage.getItem(email)) {
        setError('User with this email already exists.');
        return;
      }
      localStorage.setItem(email, JSON.stringify({ email, password }));
      setMode('login');
      setError('Signup successful! Please log in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      return;
    }
    const record = localStorage.getItem(email);
    if (!record) {
      setError('No user found with this email.');
      return;
    }
    const user = JSON.parse(record);
    if (user.password !== password) {
      setError('Incorrect password.');
      return;
    }
    onAuthSuccess?.();
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setAdminError('');
    if (adminEmail === 'admin@gmail.com' && adminPassword === 'admin@123') {
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('isAdminLoggedIn', 'true');
      onAdminSuccess?.();
      navigate('/admin-logins');
    } else {
      setAdminError('Incorrect admin credentials.');
    }
  };

  // Handlers to toggle visibility with animation triggers:
  const handleUserEyeClick = () => {
    if (!showUserPassword) {
      setAnimateUserCross(true);
      setTimeout(() => setAnimateUserCross(false), 400);
    }
    setShowUserPassword((v) => !v);
  };
  const handleUserConfirmEyeClick = () => {
    if (!showUserConfirmPassword) {
      setAnimateUserConfirmCross(true);
      setTimeout(() => setAnimateUserConfirmCross(false), 400);
    }
    setShowUserConfirmPassword((v) => !v);
  };
  const handleAdminEyeClick = () => {
    if (!showAdminPassword) {
      setAnimateAdminCross(true);
      setTimeout(() => setAnimateAdminCross(false), 400);
    }
    setShowAdminPassword((v) => !v);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#151515',
        color: '#eee',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: 20,
        gap: 40,
      }}
    >
      {/* Title with animated logo and text color synced */}
      <div style={styles.titleContainer}>
        <AnimatedSyncColorLogo colorToggle={colorToggle} setColorToggle={setColorToggle} />
        <h1
          style={{
            ...styles.titleText,
            color: colorToggle ? '#ffeb3b' : '#90ee90',
            transition: 'color 0.5s ease',
          }}
        >
          Renalyze
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 40,
          width: '100%',
          maxWidth: 900,
          flexWrap: 'wrap',
          position: 'relative',
        }}
      >
        {/* User Login/Signup Form */}
        <form
          onSubmit={handleUserSubmit}
          style={{
            ...styles.userForm,
            outline: focusedForm === 'user' ? '2px solid #90ee90' : 'none',
            zIndex: focusedForm === 'user' ? 10 : 1,
            position: 'relative',
            transition: 'outline 0.3s ease, transform 0.3s ease',
            transform: focusedForm === 'user' ? 'scale(1.05)' : 'scale(1)',
          }}
          onMouseEnter={() => setFocusedForm('user')}
          onMouseLeave={() => setFocusedForm(null)}
        >
          <div style={styles.toggleContainer}>
            {['login', 'signup'].map((m) => {
              const label = m === 'login' ? 'Login' : 'Signup';
              return (
                <div
                  key={m}
                  onClick={() => toggleMode(m)}
                  role="button"
                  tabIndex={0}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    lineHeight: '36px',
                    fontWeight: mode === m ? 'bold' : 'normal',
                    color: mode === m ? '#222' : '#bbb',
                    fontSize: 16,
                    userSelect: 'none',
                    zIndex: 2,
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </div>
              );
            })}
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: mode === 'login' ? '2px' : 'calc(50% + 2px)',
                width: '50%',
                height: 32,
                borderRadius: 20,
                background: '#90ee90',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 1,
              }}
            />
          </div>

          <label htmlFor="email" style={{ marginBottom: 6 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            required
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          {/* Password */}
          <div style={styles.inputWrapper}>
            <label htmlFor="password" style={{ marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <input
              id="password"
              type={showUserPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              required
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              style={styles.inputWithIcon}
            />
            <button
              type="button"
              onClick={handleUserEyeClick}
              tabIndex={-1}
              aria-label={showUserPassword ? 'Hide password' : 'Show password'}
              style={styles.eyeButton}
            >
              <EyeIcon visible={showUserPassword} animate={animateUserCross} />
            </button>
          </div>

          {/* Confirm password - signup */}
          {mode === 'signup' && (
            <div style={styles.inputWrapper}>
              <label htmlFor="confirmPassword" style={{ marginBottom: 6, display: 'block' }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showUserConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                required
                placeholder="Re-enter your password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.inputWithIcon}
              />
              <button
                type="button"
                onClick={handleUserConfirmEyeClick}
                tabIndex={-1}
                aria-label={showUserConfirmPassword ? 'Hide password' : 'Show password'}
                style={styles.eyeButton}
              >
                <EyeIcon visible={showUserConfirmPassword} animate={animateUserConfirmCross} />
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                color: '#f44336',
                marginBottom: 18,
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" style={styles.loginButton}>
            {mode === 'signup' ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        {/* Admin Login */}
        <form
          onSubmit={handleAdminSubmit}
          style={{
            ...styles.adminForm,
            outline: focusedForm === 'admin' ? '2px solid #ffeb3b' : 'none',
            zIndex: focusedForm === 'admin' ? 10 : 1,
            position: 'relative',
            transition: 'outline 0.3s ease, transform 0.3s ease',
            transform: focusedForm === 'admin' ? 'scale(1.05)' : 'scale(1)',
          }}
          onMouseEnter={() => setFocusedForm('admin')}
          onMouseLeave={() => setFocusedForm(null)}
        >
          <h2 style={{ marginBottom: 28, textAlign: 'center' }}>Admin Login</h2>

          <label htmlFor="adminEmail" style={{ marginBottom: 6 }}>
            Email
          </label>
          <input
            id="adminEmail"
            type="email"
            value={adminEmail}
            required
            placeholder="admin@gmail.com"
            onChange={(e) => setAdminEmail(e.target.value)}
            style={styles.adminInput}
          />

          <div style={styles.inputWrapper}>
            <label htmlFor="adminPassword" style={{ marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <input
              id="adminPassword"
              type={showAdminPassword ? 'text' : 'password'}
              value={adminPassword}
              required
              placeholder="Admin password"
              onChange={(e) => setAdminPassword(e.target.value)}
              style={styles.adminInputWithIcon}
            />
            <button
              type="button"
              onClick={handleAdminEyeClick}
              tabIndex={-1}
              aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
              style={styles.eyeButton}
            >
              <EyeIcon visible={showAdminPassword} animate={animateAdminCross} />
            </button>
          </div>

          {adminError && (
            <div
              style={{
                color: '#ff6f00',
                marginBottom: 18,
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              {adminError}
            </div>
          )}

          <button type="submit" style={styles.adminButton}>
            Admin Log In
          </button>
        </form>
      </div>
    </div>
  );
}

// AnimatedSyncColorLogo unchanged for brevity
function AnimatedSyncColorLogo({ colorToggle, setColorToggle }) {
  const radius = 26;
  const strokeLengthR = 230;
  const circleCircumference = 2 * Math.PI * radius;
  const [dashOffset, setDashOffset] = React.useState(strokeLengthR);
  const [dashOffsetCircle, setDashOffsetCircle] = React.useState(circleCircumference);
  const [localColorToggle, setLocalColorToggle] = React.useState(false);

  React.useEffect(() => {
    const animationDuration = 3000;
    let start = null;
    let requestId = null;

    function animate(time) {
      if (!start) start = time;
      const elapsed = Math.min(time - start, animationDuration);
      const progress = 1 - Math.pow(1 - elapsed / animationDuration, 3);
      setDashOffset(strokeLengthR * (1 - progress));
      setDashOffsetCircle(circleCircumference * (1 - progress));

      if (elapsed < animationDuration) {
        requestId = requestAnimationFrame(animate);
      } else {
        setLocalColorToggle((prev) => !prev);
        setDashOffset(strokeLengthR);
        setDashOffsetCircle(circleCircumference);
        start = null;
        requestId = requestAnimationFrame(animate);
      }
    }

    requestId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestId);
  }, [strokeLengthR, circleCircumference]);

  React.useEffect(() => {
    setColorToggle(localColorToggle);
  }, [localColorToggle, setColorToggle]);

  const strokeColor = localColorToggle ? '#ffeb3b' : '#90ee90';

  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Renalyze logo with synced color switch"
      role="img"
      style={{ display: 'block' }}
    >
      <circle
        cx="30"
        cy="30"
        r={radius}
        stroke={strokeColor}
        strokeWidth="3"
        fill="none"
        strokeDasharray={circleCircumference}
        strokeDashoffset={dashOffsetCircle}
        strokeLinecap="round"
        style={{ transition: 'stroke 0.5s ease' }}
      />
      <path
        d="
          M 16 42
          L 16 16
          L 29 16
          C 36 16, 36 24, 29 24
          L 22 24
          L 36 42"
        stroke={strokeColor}
        strokeWidth="4"
        fill="none"
        strokeDasharray={strokeLengthR}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke 0.5s ease' }}
      />
    </svg>
  );
}

const styles = {
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 36,
    fontWeight: 'bold',
    userSelect: 'none',
    transition: 'color 0.5s ease',
  },
  userForm: {
    background: '#222',
    borderRadius: 12,
    boxShadow: '0 0 15px rgba(0,240,128,0.2)',
    maxWidth: 380,
    minWidth: 320,
    width: '100%',
    padding: '36px 28px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  toggleContainer: {
    display: 'flex',
    background: '#333',
    borderRadius: 24,
    position: 'relative',
    marginBottom: 32,
    height: 36,
    cursor: 'pointer',
    userSelect: 'none',
    boxShadow: '0 2px 6px #0008 inset',
    justifyContent: 'space-between',
    padding: '0 4px',
  },
  input: {
    marginBottom: 18,
    borderRadius: 6,
    border: '1px solid #444',
    background: '#333',
    color: '#eee',
    padding: '9px 12px',
    fontSize: 15,
    width: '100%',
    boxSizing: 'border-box',
  },
  inputWithIcon: {
    borderRadius: 6,
    border: '1px solid #444',
    background: '#333',
    color: '#eee',
    padding: '9px 40px 9px 12px',
    fontSize: 15,
    width: '100%',
    marginBottom: 18,
    boxSizing: 'border-box',
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 18,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    zIndex: 2,
  },
  loginButton: {
    background: '#90ee90',
    color: '#222',
    border: 'none',
    borderRadius: 8,
    padding: '12px 0',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    cursor: 'pointer',
    marginTop: 6,
    transition: 'background-color 0.3s',
  },
  adminForm: {
    background: '#111',
    borderRadius: 12,
    boxShadow: '0 0 20px rgba(255, 255, 0, 0.6)',
    maxWidth: 280,
    width: '100%',
    padding: '36px 28px',
    display: 'flex',
    flexDirection: 'column',
    color: '#ffeb3b',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  adminInput: {
    marginBottom: 18,
    borderRadius: 6,
    border: '1px solid #ffa000',
    background: '#222',
    color: '#ffeb3b',
    padding: '9px 12px',
    fontSize: 15,
    width: '100%',
    boxSizing: 'border-box',
  },
  adminInputWithIcon: {
    borderRadius: 6,
    border: '1px solid #ffa000',
    background: '#222',
    color: '#ffeb3b',
    padding: '9px 40px 9px 12px',
    fontSize: 15,
    width: '100%',
    marginBottom: 18,
    boxSizing: 'border-box',
  },
  adminButton: {
    background: '#ffeb3b',
    color: '#222',
    border: 'none',
    borderRadius: 8,
    padding: '12px 0',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    cursor: 'pointer',
    marginTop: 6,
    transition: 'background-color 0.3s',
  },
};
