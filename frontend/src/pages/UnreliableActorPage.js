import React from 'react';
import UnreliableActorDetection from '../components/UnreliableActorDetection';

const UnreliableActorPage = ({ networkData }) => {
  return (
    <div className="page-container">
      <UnreliableActorDetection networkData={networkData} />
    </div>
  );
};

export default UnreliableActorPage;
