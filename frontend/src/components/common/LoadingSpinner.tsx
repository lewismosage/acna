import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-5 h-5 border-2 border-t-2 border-gray-300 border-t-yellow-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
