import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Navbar from './Navbar';
import HomeContent from './HomeContent';
import BuildResume from './BuildResume';
import Analyze from './Analyze';
import AiAnalyze from './AiAnalyze';     // Import the AI Analyze page
import AuthPage from './AuthPage';
import AdminDatabase from './AdminDatabase';

// Clear localStorage on app start (remove in production)
localStorage.removeItem('userRole');
localStorage.removeItem('isAdminLoggedIn');

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  duration: 0.2,
  ease: 'easeInOut',
};

function AnimatedRoutes({
  authState,
  handleLogout,
  authError,
  onUserAuthSuccess,
  onAdminAuthSuccess,
}) {
  const location = useLocation();

  if (!authState) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/*"
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
                style={{ height: '100%' }}
              >
                <AuthPage
                  onAuthSuccess={onUserAuthSuccess}
                  onAdminSuccess={onAdminAuthSuccess}
                  authError={authError}
                />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#151515',
        color: '#fff',
      }}
    >
      <Navbar onLogout={handleLogout} />
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {authState === 'admin' ? (
              <>
                <Route
                  path="/"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <HomeContent />
                    </motion.div>
                  }
                />
                <Route
                  path="/database"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <AdminDatabase />
                    </motion.div>
                  }
                />
                <Route
                  path="/build-resume"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <BuildResume />
                    </motion.div>
                  }
                />
                <Route
                  path="/analyze"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <Analyze />
                    </motion.div>
                  }
                />
                <Route
                  path="/ai-analyze"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <AiAnalyze />
                    </motion.div>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route
                  path="/"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <HomeContent />
                    </motion.div>
                  }
                />
                <Route
                  path="/build-resume"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <BuildResume />
                    </motion.div>
                  }
                />
                <Route
                  path="/analyze"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <Analyze />
                    </motion.div>
                  }
                />
                <Route
                  path="/ai-analyze"
                  element={
                    <motion.div
                      variants={pageVariants}
                      initial="initial"
                      animate="in"
                      exit="out"
                      transition={pageTransition}
                    >
                      <AiAnalyze />
                    </motion.div>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    setAuthState(null);
  }, []);

  const updateLoginTime = async (role) => {
    const loginTime = new Date().toISOString();
    try {
      const response = await fetch('/api/users/update-login-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole: role, loginTime }),
      });
      if (!response.ok) {
        throw new Error('Failed to update login time');
      }
    } catch (error) {
      console.error('Login time update error:', error);
      setAuthError(error.message);
    }
  };

  const onUserAuthSuccess = async () => {
    localStorage.setItem('userRole', 'user');
    await updateLoginTime('user');
    setAuthState('user');
  };

  const onAdminAuthSuccess = async () => {
    localStorage.setItem('userRole', 'admin');
    await updateLoginTime('admin');
    setAuthState('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setAuthState(null);
    setAuthError(null);
  };

  return (
    <Router>
      <AnimatedRoutes
        authState={authState}
        handleLogout={handleLogout}
        authError={authError}
        onUserAuthSuccess={onUserAuthSuccess}
        onAdminAuthSuccess={onAdminAuthSuccess}
      />
    </Router>
  );
}
export default App;