import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { getAdminUsers, updateAdminUserStatus } from '../lib/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem('delivery-token');
  const currentUser = JSON.parse(localStorage.getItem('delivery-user') || '{}');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAdminUsers();
      setUsers(usersData.users || usersData || []);
    } catch (err) {
      setError('Failed to load user directory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && currentUser?.role === 'admin') {
      loadUsers();
    }
  }, []);

  if (!token) return <Navigate to="/login" replace />;
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      setUpdatingId(userId);
      setError('');
      setSuccess('');
      await updateAdminUserStatus(userId, newStatus);
      setSuccess(`User #${userId} status changed to ${newStatus}`);
      await loadUsers();
    } catch (err) {
      setError('Failed to update status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Administration
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                User Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {users.length} registered accounts across customer, rider, and admin roles.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
            {success}
          </div>
        )}

        {/* Directory Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <span className="inline-block spin text-xl text-red-600 mb-2">⚙</span>
                      <p>Loading users...</p>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        #{u.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-medium">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize ${
                          u.status === 'active' 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            disabled={updatingId === u.id || u.status === 'active'}
                            onClick={() => handleUpdateStatus(u.id, 'active')}
                            className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition font-medium"
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === u.id || u.status === 'inactive'}
                            onClick={() => handleUpdateStatus(u.id, 'inactive')}
                            className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition font-medium"
                          >
                            Inactive
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === u.id || u.status === 'suspended'}
                            onClick={() => handleUpdateStatus(u.id, 'suspended')}
                            className="px-2.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 transition font-medium"
                          >
                            Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
};

export default AdminUsersPage;