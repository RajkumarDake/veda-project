import React from 'react';
import MultiDashboardApproach from '../components/MultiDashboardApproach';

const MultiDashboardPage = ({ networkData }) => {
  return (
    <div className="page-container">
      <MultiDashboardApproach networkData={networkData} />
    </div>
  );
};

export default MultiDashboardPage;
