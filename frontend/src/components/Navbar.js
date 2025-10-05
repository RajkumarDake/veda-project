import React, { useState } from 'react';
import '../styles/Navbar.css';

const Navbar = ({ onNavigate }) => {
  const [sidenavOpen, setSidenavOpen] = useState(false);

  const toggleSidenav = () => {
    setSidenavOpen(!sidenavOpen);
  };

  const handleNavigation = (view) => {
    onNavigate(view);
    setSidenavOpen(false); // Close sidebar after navigation
  };

  return (
    <header className="main-header">
      <div className={`sidenav ${sidenavOpen ? 'sidenav-open' : ''}`}>
        <div className="sidenav-logo">
          <a href="#" className="logo-link" onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}>
            <img
              src="https://demos.adminmart.com/free/bootstrap/freedash-lite/src/assets/images/freedashDark.svg"
              alt="FishEye Watcher"
              className="logo-img"
            />
          </a>
        </div>
        <div className="sidenav-menu">
          <ul className="sidenav-list">
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}
              >
                <i className="fas fa-home"></i>
                <span>Home</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link active"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('dashboard'); }}
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <hr />
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('bias-detection'); }}
              >
                <i className="fas fa-search"></i>
                <span>Bias Detection</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('article-bias'); }}
              >
                <i className="fas fa-newspaper"></i>
                <span>Article Bias</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('network'); }}
              >
                <i className="fas fa-project-diagram"></i>
                <span>Network View</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('analyst-bias'); }}
              >
                <i className="fas fa-user-tie"></i>
                <span>Analyst Bias</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('temporal-bias'); }}
              >
                <i className="fas fa-chart-line"></i>
                <span>Temporal Analysis</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('advanced-analytics'); }}
              >
                <i className="fas fa-chart-bar"></i>
                <span>Advanced Analytics</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('sentiment-analysis'); }}
              >
                <i className="fas fa-heart"></i>
                <span>Sentiment Analysis</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('multi-dashboard'); }}
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Multi-Dashboard</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a
                className="sidenav-link"
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation('knowledge-graph'); }}
              >
                <i className="fas fa-project-diagram"></i>
                <span>Knowledge Graph</span>
              </a>
            </li>
          </ul>
          <hr />
          <ul className="sidenav-list">
            <li className="sidenav-item">
              <a className="sidenav-link" href="#" onClick={() => alert('Settings coming soon!')}>
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </a>
            </li>
            <li className="sidenav-item">
              <a className="sidenav-link" href="#" onClick={() => alert('Help coming soon!')}>
                <i className="fas fa-question-circle"></i>
                <span>Help</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <nav className="top-navbar">
        <div className="navbar-container">
          <h1 className="navbar-logo" onClick={() => handleNavigation('home')} style={{cursor: 'pointer'}}>🐟 FishEye Watcher</h1>
          <button className="sidenav-toggle" onClick={toggleSidenav}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="navbar-right">
            <span className="navbar-brand">FishEye Watcher</span>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
