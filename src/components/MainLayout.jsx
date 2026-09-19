import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TopBar from './TopBar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <>
      <TopBar />
      <Navbar />
      <div id="app-container" style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
