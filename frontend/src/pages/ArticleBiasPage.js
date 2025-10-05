import React from 'react';
import ArticleBiasProfessional from '../components/ArticleBiasProfessional';

const ArticleBiasPage = ({ networkData, data, mc1Data }) => {
  return (
    <div className="page-container">
      <ArticleBiasProfessional 
        articles={data?.articles || []}
      />
    </div>
  );
};

export default ArticleBiasPage;
