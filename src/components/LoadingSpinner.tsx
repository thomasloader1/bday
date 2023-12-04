import React from "react";

const LoadingSpinner = ({text = "Buscando invitacion", isComponent = false}) => {

  const sizeClass = isComponent ? "h-12 w-12" : "h-24 w-24";

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className={`animate-spin rounded-full border-t-4 border-orange-500 border-solid ${sizeClass}`}></div>
      <h2 className="mt-3">{text}</h2>
    </div>
  );
};

export default LoadingSpinner;
