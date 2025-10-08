import React from 'react';
import AlgorithmBias from '../components/AlgorithmBias';

const AlgorithmBiasPage = ({ mc1BiasAnalysis }) => {
  return (
    <div className="page-container">
      <AlgorithmBias mc1BiasAnalysis={mc1BiasAnalysis} />
    </div>
  );
};

export default AlgorithmBiasPage;


