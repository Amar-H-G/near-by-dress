import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <AdminNavbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="admin-content page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
