import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 animate-fadeInUp">
          Company Accounting Sheets
        </h1>
      </div>
    </div>
  );
};

export default SplashScreen;
