import React, { useState, useEffect } from 'react';
import './App.css';
import AdminPanel from './components/AdminPanel';
import PublicDashboard from './components/PublicDashboard';
import LoginForm from './components/LoginForm';
import ViewReceipt from './components/ViewReceipt';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewReceipt, setViewReceipt] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setViewReceipt(null);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowLoginModal(false);
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Receipt view page
  if (viewReceipt) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-content">
            <h1>🚩 जय हिंद 🙏</h1>
            <button onClick={() => setViewReceipt(null)} className="logout-btn">← Back to Admin</button>
          </div>
        </header>
        <ViewReceipt donor={viewReceipt} onBack={() => setViewReceipt(null)} />
      </div>
    );
  }

  return (
    <div className="app">
      {isAdmin ? (
        <>
          <header className="header">
            <div className="header-content">
              <h1>🚩 जय हिंद 🙏</h1>
              <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
            </div>
          </header>
          <AdminPanel onViewReceipt={setViewReceipt} />
        </>
      ) : (
        <>
          <header className="header">
            <div className="header-content">
              <h1>🚩 जय हिंद 🙏</h1>
               <button onClick={() => setShowLoginModal(true)} className="logout-btn">🔐 Admin Login</button>
            </div>
           
          </header>
          <PublicDashboard />

          {/* LOGIN MODAL */}
          {showLoginModal && (
            <div className="modal-overlay-login" onClick={() => setShowLoginModal(false)}>
              <div className="modal-content-login" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn-login" onClick={() => setShowLoginModal(false)}>×</button>
                <div className="login-modal-header">
                  <div className="login-icon">🔐</div>
                  <h2>Admin Login</h2>
                  <p>Enter your password to access admin dashboard</p>
                </div>
                <LoginForm setIsAdmin={handleLoginSuccess} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;