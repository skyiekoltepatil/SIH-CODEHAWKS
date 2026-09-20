import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard/Dashboard';
import Applications from './pages/Dashboard/Applications';
import Profile from './pages/Dashboard/Profile';
import AIAssistant from './pages/Dashboard/AIAssistant';
import VirtualIdCard from './pages/Dashboard/VirtualIdCard';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import SchemeApplication from './pages/Dashboard/SchemeApplication';
import Faq from './pages/Dashboard/Faq';

import Login from './pages/Login';
import MockSite from './pages/Demo/MockSite';
import MockSiteSSO from './pages/Demo/MockSiteSSO';
import MockSiteLookup from './pages/Demo/MockSiteLookup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

import { useEffect } from 'react';

function App() {
  useEffect(() => {
    try {
      const a11y = localStorage.getItem('a11ySettings');
      if (a11y) {
        const activeSettings = JSON.parse(a11y);
        for (const setting in activeSettings) {
          if (activeSettings[setting]) {
            document.body.classList.add(`a11y-${setting}`);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load a11y settings', e);
    }
  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="schemes" element={<Schemes />} />
              <Route path="schemes/:schemeId" element={<SchemeDetails />} />
              <Route path="services" element={<Services />} />
              <Route path="login" element={<Login />} />

              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="applications" element={<Applications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="id-card" element={<VirtualIdCard />} />
                <Route path="apply/:schemeId" element={<SchemeApplication />} />
              </Route>

              <Route path="faqs" element={<Faq />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms-of-service" element={<TermsOfService />} />

              {/* Mock Sites Demo Routes */}
              <Route
                path="mock-b"
                element={<MockSite siteName="Mock Site B" collectionName="mock_site_b" />}
              />
              <Route path="mock-c" element={<MockSiteLookup siteName="Mock Site C" />} />
              <Route path="mock-d" element={<MockSiteSSO siteName="Mock Site D" />} />
            </Route>
          </Routes>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
