'use client';

import React from 'react';

/**
 * Applications Page — Admin view of all job applications.
 * Shows a data table with Candidate, Job, Status, and Date columns.
 * Mock data matching client reference screenshots.
 */

const mockApplications = [
  { candidate: 'Ankit Rawat', job: '.NET Developer', status: 'Applied', date: '2026-06-03T08:45:53.793835Z' },
];

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'applied': return 'badge badge-applied';
    case 'pending': return 'badge badge-pending';
    case 'rejected': return 'badge badge-rejected';
    case 'shortlisted': return 'badge badge-shortlisted';
    default: return 'badge';
  }
}

export default function ApplicationsPage() {
  return (
    <div>
      <h1 className="page-title">Applications</h1>
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
          {mockApplications.map((app, idx) => (
            <tr key={idx}>
              <td>{app.candidate}</td>
              <td>{app.job}</td>
              <td>
                <span className={getStatusBadgeClass(app.status)}>{app.status}</span>
              </td>
              <td>{app.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
