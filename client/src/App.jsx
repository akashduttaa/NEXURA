import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import ParticleField from './components/three/ParticleField';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import TimetablePage from './pages/TimetablePage';
import BlockchainPage from './pages/BlockchainPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <Router>
      {/* We added bg-nexura-bg and text-nexura-text along with transition utility classes. 
        This links your container colors to the active light/dark values we set up in index.css!
      */}
      <div className="relative min-h-screen bg-nexura-bg text-nexura-text transition-colors duration-300">
        <ParticleField />
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
            <Route path="/blockchain" element={<ProtectedRoute><BlockchainPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}