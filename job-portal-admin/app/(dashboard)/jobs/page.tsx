'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, AdminJob } from '../../../services/adminService';

/**
 * Jobs Page — Admin view of all job postings.
 * Fetches data from GET /admin/jobs API.
 */

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'active': return 'badge badge-applied';
    case 'pending': return 'badge badge-pending';
    case 'closed': return 'badge badge-rejected';
    default: return 'badge';
  }
}

export default function JobsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: async () => {
      const res = await adminService.getJobs(1, 50);
      return res.data as AdminJob[];
    },
  });

  return (
    <div>
      <h1 className="page-title">Jobs</h1>
      {isLoading ? (
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading jobs...</p>
      ) : error ? (
        <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Failed to load jobs. Make sure you are logged in as admin.</p>
      ) : (data?.length ?? 0) > 0 ? (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((job) => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>
                    <span className={getStatusBadgeClass(job.status)}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(job.createdAt).toLocaleDateString()}</td>
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
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No jobs posted yet</p>
        </div>
      )}
    </div>
  );
}
