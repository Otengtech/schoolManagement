import React from "react";

const Loader = ({ size = "md", color = "bg-green-600" }) => {
  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <span
        className={`${sizes[size]} ${color} rounded-full animate-bounce`}
        style={{ animationDelay: "0s" }}
      />
      <span
        className={`${sizes[size]} ${color} rounded-full animate-bounce`}
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className={`${sizes[size]} ${color} rounded-full animate-bounce`}
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
};

export default Loader;
