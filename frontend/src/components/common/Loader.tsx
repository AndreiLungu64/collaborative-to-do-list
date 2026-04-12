import React from 'react';

interface LoaderProps {
  className?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ className = '', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="dashboard-loading">
        <div className={`loader ${className}`.trim()} />
      </div>
    );
  }
  
  return <div className={`loader ${className}`.trim()} />;
};

export default Loader;
