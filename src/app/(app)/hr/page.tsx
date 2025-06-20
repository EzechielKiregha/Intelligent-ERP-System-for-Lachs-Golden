import React from 'react';
import AuthGuard from '../_components/AuthGuard';

const HRPage: React.FC = () => {
  return (
    <AuthGuard>
      <div>
        <h1>Human Resources</h1>
        <p>Welcome to the Human Resources page. Here you can manage employee information, payroll, and more.</p>
        <section>
          <h2>Employee Management</h2>
          <ul>
            <li>View Employee Details</li>
            <li>Add New Employees</li>
            <li>Update Employee Records</li>
          </ul>
        </section>
        <section>
          <h2>Payroll</h2>
          <ul>
            <li>View Payroll Information</li>
            <li>Generate Payslips</li>
            <li>Manage Benefits</li>
          </ul>
        </section>
      </div>
    </AuthGuard>
  );
};

export default HRPage;