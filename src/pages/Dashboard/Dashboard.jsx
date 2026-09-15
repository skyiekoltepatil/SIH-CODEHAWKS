import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="dashboard-layout" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <Outlet />
    </div>
  );
}
