import React from 'react';
import BiasDetection from '../components/BiasDetection';

const BiasDetectionPage = ({ data, loading, mc1Data, mc1BiasAnalysis }) => {
  return (
    <div className="page-container">
      <BiasDetection data={data} loading={loading} mc1Data={mc1Data} mc1BiasAnalysis={mc1BiasAnalysis} />
    </div>
  );
};

export default BiasDetectionPage;
