import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Schemes from './pages/Schemes';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard/Dashboard';
import Applications from './pages/Dashboard/Applications';
import Profile from './pages/Dashboard/Profile';
import AIAssistant from './pages/Dashboard/AIAssistant';
import VirtualIdCard from './pages/Dashboard/VirtualIdCard';
import Login from './pages/Login';
import MockSite from './pages/Demo/MockSite';
import MockSiteSSO from './pages/Demo/MockSiteSSO';
import MockSiteLookup from './pages/Demo/MockSiteLookup';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="schemes" element={<Schemes />} />
            <Route path="services" element={<Services />} />
            <Route path="login" element={<Login />} />
            
            <Route path="dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="applications" replace />} />
              <Route path="applications" element={<Applications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="id-card" element={<VirtualIdCard />} />
            </Route>

            {/* Mock Sites Demo Routes */}
            <Route path="mock-b" element={<MockSite siteName="Mock Site B" collectionName="mock_site_b" />} />
            <Route path="mock-c" element={<MockSiteLookup siteName="Mock Site C" />} />
            <Route path="mock-d" element={<MockSiteSSO siteName="Mock Site D" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
