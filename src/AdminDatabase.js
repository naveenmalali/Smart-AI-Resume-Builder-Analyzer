import React, { useEffect, useState } from 'react';

export default function AdminDatabase() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedUsers = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Skip admin auth keys
      if (key === 'userRole' || key === 'isAdminLoggedIn') continue;

      try {
        const user = JSON.parse(localStorage.getItem(key));
        if (user && user.email) {
          storedUsers.push({
            email: user.email,
          });
        }
      } catch {
        // Ignore parse errors
      }
    }

    setUsers(storedUsers);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (users.length === 0) {
    return (
      <div style={styles.noData}>
        No user data available to display.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>User Login Database</h1>

      {/* Search bar with icon */}
      <div style={styles.searchBarContainer}>
        <span style={styles.searchIcon}>
          <svg
            height="20"
            width="20"
            viewBox="0 0 20 20"
            fill="#90ee90"
            style={{ display: 'block' }}
          >
            <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l4.39 4.4a1 1 0 0 1-1.42 1.4l-4.38-4.39zm-4.9-1.32a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchBar}
        />
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Email</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(({ email }, idx) => (
              <tr key={idx} style={styles.row}>
                <td style={styles.td}>{email || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={styles.td}>No matching results</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#151515',
    color: '#90ee90',
    padding: 24,
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  searchBarContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchBar: {
    width: '100%',
    padding: '10px 10px 10px 40px', // left padding for icon
    fontSize: 16,
    borderRadius: 5,
    border: '1px solid #444',
    backgroundColor: '#202020',
    color: '#90ee90',
    outline: 'none',
    boxSizing: 'border-box',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 18,
    backgroundColor: '#202020',
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerRow: {
    backgroundColor: '#2a2a2a',
  },
  th: {
    padding: '12px 16px',
    border: '1px solid #444',
    textAlign: 'left',
  },
  row: {
    borderBottom: '1px solid #444',
  },
  td: {
    padding: '12px 16px',
    border: '1px solid #444',
  },
  noData: {
    minHeight: '100vh',
    backgroundColor: '#151515',
    color: '#90ee90',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: 20,
  },
};
