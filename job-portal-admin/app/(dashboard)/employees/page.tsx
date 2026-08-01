'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, EmployeeProfile } from '../../../services/adminService';

/**
 * Employees Page — Admin view of all employee profiles.
 * Fetches data from GET /admin/employees API.
 */
export default function EmployeesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: async () => {
      const res = await adminService.getEmployees(1, 50);
      return res.data as EmployeeProfile[];
    },
  });

  return (
    <div>
      <h1 className="page-title">Employees</h1>
      {isLoading ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading employees...</p>
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Failed to load employees. Make sure you are logged in as admin.</p>
      ) : (data?.length ?? 0) > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Skills</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.name}</td>
                <td>{employee.phone || '—'}</td>
                <td>{employee.skills || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '40px 24px',
          border: '1px solid #e2e8f0', textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No employees found</p>
        </div>
      )}
    </div>
  );
}
