import { useEffect, useState, useCallback } from 'react';
import { Trash2, UserCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../../shared/components/Pagination';
import { adminGetUsers, adminDeleteUser } from '../services/admin.service.js';
import toast from 'react-hot-toast';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const roleBadge = (role) => {
  const map = {
    admin:      { cls: 'badge-admin',    label: 'Admin' },
    shop_owner: { cls: 'badge-approved', label: 'Shop Owner' },
    customer:   { cls: 'badge-pending',  label: 'Customer' },
  };
  const r = map[role] || { cls: '', label: role };
  return <span className={`badge ${r.cls}`}>{r.label}</span>;
};

const Users = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotal]  = useState(1);
  const [search, setSearch]     = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminGetUsers({ page, limit: 10, search });
      setUsers(data.data || []);
      setTotal(data.totalPages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { queueMicrotask(loadUsers); }, [loadUsers]);

  // Reset to page 1 when search changes
  const handleSearch = useCallback((q) => {
    setSearch(q);
    setPage(1);
  }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminDeleteUser(toDelete._id);
      toast.success(`${toDelete.name} deleted`);
      setToDelete(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'avatar',
      label: '',
      width: 48,
      render: (u) => (
        <div className="admin-table-avatar">
          {u.name?.charAt(0).toUpperCase()}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (u) => (
        <div>
          <p className="admin-table-primary">{u.name}</p>
          <p className="admin-table-secondary">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => roleBadge(u.role),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (u) => <span className="admin-table-date">{formatDate(u.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (u) =>
        u.role !== 'admin' ? (
          <button
            className="admin-icon-btn admin-icon-btn-danger"
            onClick={() => setToDelete(u)}
            title="Delete user"
            id={`delete-user-${u._id}`}
          >
            <Trash2 size={15} />
          </button>
        ) : (
          <span className="admin-table-date">—</span>
        ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">User Management</h1>
          <p className="admin-page-subtitle">View and manage all registered users on the platform.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <SearchBar
          placeholder="Search by name or email..."
          onSearch={handleSearch}
          id="users-search"
        />
        <div className="admin-toolbar-info">
          <UserCircle size={16} />
          {loading ? '...' : `${users.length} users`}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyIcon="👥"
        emptyTitle="No users found"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmModal
        open={!!toDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${toDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        danger
        loading={deleting}
      />
    </div>
  );
};

export default Users;
