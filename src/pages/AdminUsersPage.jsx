import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAdminUsers } from '../lib/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAdminUsers();
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load users: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const token = localStorage.getItem('delivery-token');
  if (!token) return <Navigate to="/login" replace />;

  const user = JSON.parse(localStorage.getItem('delivery-user') || '{}');
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <main className="bg-background-dark py-16"><div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="bg-white rounded-2xl p-6 shadow-sm"><div className="mb-6"><p className="eyebrow">Delivery<span className="text-primary-600">+</span></p><h1 className="text-2xl font-bold text-primary-900">User Management</h1></div>{error && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}{loading && <div className="text-center py-8"><div className="animate-spin rounded-full border-4 border-primary-600 border-t-transparent w-12 h-12 mx-auto"></div></div>}{!loading && users.length === 0 && <div className="text-center py-8"><p className="text-sm text-text-secondary">No users found.</p></div>}{!loading && users.length > 0 && <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{users.map((user) => (

<tr key={user.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>{user.role}</span></td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(user.status)}`}>{user.status}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex space-x-2"><button onClick={() => updateUserStatus(user.id, 'active')} className={user.status === 'active' ? 'bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700' : 'bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100'}>Active</button><button onClick={() => updateUserStatus(user.id, 'inactive')} className={user.status === 'inactive' ? 'bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700' : 'bg-yellow-50 text-yellow-600 px-2 py-1 rounded hover:bg-yellow-100'}>Inactive</button><button onClick={() => updateUserStatus(user.id, 'suspended')} className={user.status === 'suspended' ? 'bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700' : 'bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100'}>Suspend</button></div></td></tr>

))}</tbody></table></div>}</div></div></main>;
};

// Helper functions for badges
const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800';
    case 'rider': return 'bg-orange-100 text-orange-800';
    case 'customer': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'suspended': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const updateUserStatus = async (userId, status) => {
  // In a real app, this would call an API endpoint
  // For now, we'll just show an alert
  alert(`User ${userId} status updated to ${status}`);
  // In a real implementation, you would refresh the users list here
};

export default AdminUsersPage;