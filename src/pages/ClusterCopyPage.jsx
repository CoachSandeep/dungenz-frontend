import React from 'react';
import ClusterCopyForm from '../components/ClusterCopyForm';

const ClusterCopyPage = () => {
  return (
    <div style={{ padding: '40px' }}>
      <h2>🔁 Cluster Copy Workouts</h2>
      <p>Copy all workouts from one version to other versions for a specific date.</p>
      <ClusterCopyForm />
    </div>
  );
};

export default ClusterCopyPage;
