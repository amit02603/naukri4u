'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, AdminUser } from '../../../services/adminService';

/**
 * Users Page — Admin view of all platform users.
 * Fetches data from GET /admin/users API.
 */

function getRoleBadgeClass(role: string | null): string {
  switch (role?.toLowerCase()) {
    case 'employer': return 'badge badge-recruiter';
    case 'employee': return 'badge badge-employee';
    case 'admin': return 'badge badge-admin';
    default: return 'badge';
  }
}

export default function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await adminService.getUsers(1, 50);
      return res.data as AdminUser[];
    },
  });

  return (
    <div>
      <h1 className="page-title">Users</h1>
      {isLoading ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading users...</p>
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Failed to load users. Make sure you are logged in as admin.</p>
      ) : (data?.length ?? 0) > 0 ? (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Phone Number</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{user.id}</td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role || 'Unassigned'}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{user.status}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '40px 24px',
          border: '1px solid #e2e8f0', textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No users found</p>
        </div>
      )}
    </div>
  );
}
