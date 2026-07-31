'use client';

import React from 'react';

/**
 * Employees Page — Admin view of all employees/candidates.
 * Shows a data table with Name, Phone, and Skills columns.
 * Mock data matching client reference screenshots.
 */

const mockEmployees = [
  { name: 'Ankit Rawat', phone: '7668942630', skills: 'React, Node.js' },
  { name: 'Ankit Thaiwal', phone: '7457088052', skills: 'Java, Spring Boot' },
];

export default function EmployeesPage() {
  return (
    <div>
      <h1 className="page-title">Employees</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Skills</th>
          </tr>
        </thead>
        <tbody>
          {mockEmployees.map((employee, idx) => (
            <tr key={idx}>
              <td>{employee.name}</td>
              <td>{employee.phone}</td>
              <td>{employee.skills}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
