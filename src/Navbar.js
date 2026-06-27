import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const navStyle = {
  backgroundColor: '#90ee90',
  display: 'flex',
  justifyContent: 'center', // Keep center alignment for nav items
  alignItems: 'center',
  padding: '8px 0',
  position: 'sticky',
  top: 0,
  width: '100%',
  zIndex: 1000,
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  minHeight: 45,
  position: 'relative', // for absolute children like hamburger on small
};

const baseLinkStyle = {
  color: '#151515',
  textDecoration: 'none',
  fontSize: '18px',
  margin: '0 24px',
  fontWeight: 'bold',
  paddingBottom: 2,
  position: 'relative',
  display: 'inline-block',
  transition: 'color 0.3s ease, font-size 0.3s ease',
};

const baseLogoutButtonStyle = {
  position: 'absolute',
  right: 24,
  backgroundColor: '#f44336',
  border: 'none',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: 14,
  userSelect: 'none',
  transition: 'background-color 0.2s, transform 0.15s, opacity 0.4s',
};

const hamburgerStyle = {
  display: 'none', // hidden by default, visible on small screens below
  flexDirection: 'column',
  justifyContent: 'space-around',
  width: 24,
  height: 24,
  cursor: 'pointer',
  position: 'absolute',
  left: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1100,
};

const barStyle = {
  width: '100%',
  height: 3,
  backgroundColor: '#151515',
  borderRadius: 2,
  transition: 'all 0.3s ease',
};

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);
  const [activeLogout, setActiveLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('userRole');
      if (onLogout) onLogout();
      navigate('/');
    }, 400);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/build-resume', label: 'BuildResume' },
    { to: '/analyze', label: 'Analyze' },
    { to: '/ai-analyze', label: 'Analyze with AI' },
  ];
  if (userRole === 'admin') {
    navLinks.push({ to: '/database', label: 'Database' });
  }

  let logoutButtonStyle = { ...baseLogoutButtonStyle };
  if (hoveredLogout) {
    logoutButtonStyle = {
      ...logoutButtonStyle,
      backgroundColor: '#d32f2f',
      transform: activeLogout ? 'scale(0.96)' : 'scale(1.05)',
    };
  }
  if (activeLogout) {
    logoutButtonStyle = {
      ...logoutButtonStyle,
      backgroundColor: '#b71c1c',
      transform: 'scale(0.93)',
    };
  }
  if (loggingOut) {
    logoutButtonStyle = {
      ...logoutButtonStyle,
      opacity: 0,
      transform: 'scale(0.85)',
      pointerEvents: 'none',
    };
  }

  return (
    <>
      <style>{`
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 100%;
          background-color: #ff6f00;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.3s ease;
        }
        .nav-link.hovered::after {
          transform: scaleX(1);
        }
        .nav-link.hovered {
          color: #ff6f00 !important;
          font-size: 20px !important;
          transition: color 0.3s ease, font-size 0.3s ease;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .hamburger {
            display: flex !important; /* show hamburger on small screens */
          }
          .nav-links {
            display: none; /* hide nav links by default on small screens */
          }
          .nav-links.open {
            display: flex !important; /* show nav links vertically when menuOpen */
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #90ee90;
            flex-direction: column;
            align-items: center;
            padding: 12px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            z-index: 999;
          }
          .nav-link {
            margin: 12px 0 !important;
            font-size: 18px !important;
            text-align: center;
          }
          button.logout-btn {
            position: static !important;
            margin: 12px auto 0;
            display: block;
            width: 90%;
            max-width: 250px;
          }
        }
      `}</style>

      <nav style={navStyle}>
        <div
          className="hamburger"
          style={hamburgerStyle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          role="button"
          tabIndex={0}
          onKeyDown={e => { if(e.key === 'Enter') setMenuOpen(!menuOpen); }}
        >
          <div style={{ ...barStyle, transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <div style={{ ...barStyle, opacity: menuOpen ? 0 : 1 }} />
          <div style={{ ...barStyle, transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </div>

        <div className={`nav-links${menuOpen ? ' open' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
          {navLinks.map(({ to, label }) => {
            const isHovered = hoveredLink === label;
            return (
              <Link
                key={label}
                to={to}
                className={`nav-link${isHovered ? ' hovered' : ''}`}
                style={baseLinkStyle}
                onClick={() => setMenuOpen(false)} // close menu on link click
                onMouseEnter={() => setHoveredLink(label)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {label}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            style={logoutButtonStyle}
            title="Logout"
            className="logout-btn"
            onMouseEnter={() => setHoveredLogout(true)}
            onMouseLeave={() => { setHoveredLogout(false); setActiveLogout(false); }}
            onMouseDown={() => setActiveLogout(true)}
            onMouseUp={() => setActiveLogout(false)}
            disabled={loggingOut}
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
