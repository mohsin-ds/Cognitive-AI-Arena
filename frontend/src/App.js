import React, { useState } from 'react';
import PathfindingVisualizer from './components/PathfindingVisualizer';
import TSPVisualizer from './components/TSPVisualizer';
import GameVisualizer from './components/GameVisualizer';
import WumpusVisualizer from './components/WumpusVisualizer';
import MLVisualizer from './components/MLVisualizer';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState(1);

  const modules = [
    { id: 1, name: "Pathfinding (Search)", icon: "📍" },
    { id: 2, name: "Optimization (TSP)", icon: "🛣️" },
    { id: 3, name: "Game Theory", icon: "🎮" },
    { id: 4, name: "Logical Reasoning", icon: "🧠" },
    { id: 5, name: "ML Predictor", icon: "🔮" }
  ];

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <h5 className="fw-bold m-0">Cognitive Arena</h5>
        </div>
        <nav className="sidebar-nav">
          {modules.map((m) => (
            <button
              key={m.id}
              className={`nav-item ${activeModule === m.id ? 'active' : ''}`}
              onClick={() => setActiveModule(m.id)}
            >
              <span className="nav-icon">{m.icon}</span>
              <span className="nav-text">{m.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <h4 className="fw-bold text-dark mb-0">
            {modules.find(m => m.id === activeModule).name}
          </h4>
          <span className="text-muted small d-none d-md-inline">AI Algorithm Visualization & Benchmarking Dashboard</span>
        </header>

        <div className="module-container">
          {activeModule === 1 && <PathfindingVisualizer />}
          {activeModule === 2 && <TSPVisualizer />}
          {activeModule === 3 && <GameVisualizer />}
          {activeModule === 4 && <WumpusVisualizer />}
          {activeModule === 5 && <MLVisualizer />}
        </div>
      </main>
    </div>
  );
}

export default App;