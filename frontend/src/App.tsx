import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import ReportView from './pages/ReportView';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600">AI Interview Assistant</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setup" element={<InterviewSetup />} />
            <Route path="/interview/:id" element={<InterviewSession />} />
            <Route path="/report/:id" element={<ReportView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
