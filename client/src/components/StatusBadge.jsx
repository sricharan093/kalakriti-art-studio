import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const normalized = status.toLowerCase();
  return (
    <span className={`badge badge-${normalized}`}>
      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
      {status}
    </span>
  );
};
