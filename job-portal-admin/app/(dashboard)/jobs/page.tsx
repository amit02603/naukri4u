'use client';

import React from 'react';

/**
 * Jobs Page — Admin view of all job postings.
 * Shows a data table with Title, Company, and Created columns.
 * Mock data matching client reference screenshots.
 */

const mockJobs = [
  { title: '.NET Developer', company: 'Arohar Technologies', created: '2026-06-03T07:02:13.77903Z' },
  { title: 'Java Developer', company: 'Arohar Technologies', created: '2026-06-03T07:40:41.89041Z' },
  { title: 'Salesforce Developer', company: 'Evon Technologies', created: '2026-06-03T07:43:53.7316Z' },
];

export default function JobsPage() {
  return (
    <div>
      <h1 className="page-title">Jobs</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {mockJobs.map((job, idx) => (
            <tr key={idx}>
              <td>{job.title}</td>
              <td>{job.company}</td>
              <td>{job.created}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
