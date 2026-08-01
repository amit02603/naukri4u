'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, RecruiterProfile } from '../../../services/adminService';

/**
 * Recruiters Page — Admin view of all recruiter profiles.
 * Fetches data from GET /admin/recruiters API.
 */
export default function RecruitersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-recruiters'],
    queryFn: async () => {
      const res = await adminService.getRecruiters(1, 50);
      return res.data as RecruiterProfile[];
    },
  });

  return (
    <div>
      <h1 className="page-title">Recruiters</h1>
      {isLoading ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading recruiters...</p>
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Failed to load recruiters. Make sure you are logged in as admin.</p>
      ) : (data?.length ?? 0) > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Designation</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((recruiter) => (
              <tr key={recruiter.id}>
                <td>{recruiter.name}</td>
                <td>{recruiter.company}</td>
                <td>{recruiter.designation || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '40px 24px',
          border: '1px solid #e2e8f0', textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No recruiters found</p>
        </div>
      )}
    </div>
  );
}
