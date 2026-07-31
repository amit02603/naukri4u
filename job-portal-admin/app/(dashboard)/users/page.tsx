'use client';

import React from 'react';

/**
 * Users Page — Admin view of all platform users.
 * Shows a data table with Name, Phone, and Role columns.
 * Mock data matching client reference screenshots.
 */

const mockUsers = [
  { name: 'Rahul Sharma', phone: '9999999999', role: 'Recruiter' },
  { name: 'Ankit Rawat', phone: '7668942630', role: 'Employee' },
  { name: 'Akshay Gupta', phone: '9999999991', role: 'Recruiter' },
  { name: 'Ankit Thaiwal', phone: '7457088052', role: 'Employee' },
  { name: 'Admin Savvy', phone: '123456987', role: 'Admin' },
];

function getRoleBadgeClass(role: string): string {
  switch (role.toLowerCase()) {
    case 'recruiter': return 'badge badge-recruiter';
    case 'employee': return 'badge badge-employee';
    case 'admin': return 'badge badge-admin';
    default: return 'badge';
  }
}

export default function UsersPage() {
  return (
    <div>
      <h1 className="page-title">Users</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {mockUsers.map((user, idx) => (
            <tr key={idx}>
              <td>{user.name}</td>
              <td>{user.phone}</td>
              <td>
                <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
