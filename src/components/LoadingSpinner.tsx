import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full border-t-4 border-orange-500 border-solid h-24 w-24"></div>
      <h2 className="mt-3">Buscando invitacion</h2>
    </div>
  );
};

export default LoadingSpinner;
