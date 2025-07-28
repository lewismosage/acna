import React from "react";

const NoLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen bg-white">{children}</div>;
};

export default NoLayout;