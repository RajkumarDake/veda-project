import React from 'react';
import TemporalBiasAnalysis from '../components/TemporalBiasAnalysis';

const TemporalBiasPage = ({ networkData, data, mc1Statistics, articles, loading, onProcessArticles }) => {
  return (
    <div className="page-container">
      <TemporalBiasAnalysis 
        networkData={networkData} 
        data={data} 
        mc1Statistics={mc1Statistics}
        articles={articles}
        loading={loading}
        onProcessArticles={onProcessArticles}
      />
    </div>
  );
};

export default TemporalBiasPage;
