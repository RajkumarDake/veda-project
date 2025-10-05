import React from 'react';
import PixelBasedVisualization from '../components/PixelBasedVisualization';

const PixelVisualizationPage = ({ networkData }) => {
  return (
    <div className="page-container">
      <PixelBasedVisualization networkData={networkData} />
    </div>
  );
};

export default PixelVisualizationPage;
