'use client';

import React from 'react';

/**
 * Recruiters Page — Admin view of all recruiters.
 * Shows a data table with Name and Company columns.
 * Mock data matching client reference screenshots.
 */

const mockRecruiters = [
  { name: 'Rahul Sharma', company: 'Arohar Technologies' },
  { name: 'Akshay Gupta', company: 'Evon Technologies' },
];

export default function RecruitersPage() {
  return (
    <div>
      <h1 className="page-title">Recruiters</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {mockRecruiters.map((recruiter, idx) => (
            <tr key={idx}>
              <td>{recruiter.name}</td>
              <td>{recruiter.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
