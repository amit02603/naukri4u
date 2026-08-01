'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, AdminApplication } from '../../../services/adminService';

/**
 * Applications Page — Admin view of all job applications.
 * Fetches data from GET /admin/applications API with populated refs.
 */

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'applied': return 'badge badge-applied';
    case 'shortlisted': return 'badge badge-shortlisted';
    case 'rejected': return 'badge badge-rejected';
    case 'hired': return 'badge badge-applied';
    default: return 'badge badge-pending';
  }
}

export default function ApplicationsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: async () => {
      const res = await adminService.getApplications(1, 50);
      return res.data as AdminApplication[];
    },
  });

  return (
    <div>
      <h1 className="page-title">Applications</h1>
      {isLoading ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading applications...</p>
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Failed to load applications. Make sure you are logged in as admin.</p>
      ) : (data?.length ?? 0) > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Job</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((app) => (
              <tr key={app.id}>
                <td>{app.applicant?.phoneNumber || '—'}</td>
                <td>{app.job?.title || '—'}</td>
                <td>
                  <span className={getStatusBadgeClass(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </td>
                <td>{new Date(app.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{
          background: '#ffffff', borderRadius: 8, padding: '40px 24px',
          border: '1px solid #e2e8f0', textAlign: 'center',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No applications found</p>
        </div>
      )}
    </div>
  );
}
