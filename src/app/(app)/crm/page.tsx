import React from 'react';

const CRMPage = () => {
  return (
    <div className="crm-page">
      <h1>Customer Resource Management</h1>
      <p>Welcome to the CRM page. Manage your customer resources efficiently.</p>
      <div className="crm-actions">
        <button>Add Customer</button>
        <button>View Customers</button>
        <button>Generate Reports</button>
      </div>
    </div>
  );
};

export default CRMPage;