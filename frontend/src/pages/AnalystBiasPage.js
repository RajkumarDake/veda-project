import React from 'react';
import AnalystBias from '../components/AnalystBias';

const AnalystBiasPage = ({ networkData }) => {
  return (
    <div className="page-container">
      <AnalystBias networkData={networkData} />
    </div>
  );
};

export default AnalystBiasPage;
