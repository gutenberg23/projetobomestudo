import React from "react";

interface DashboardHeaderProps {}

export const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#272f3c]">Dashboard</h1>
      </div>
    </>
  );
};
