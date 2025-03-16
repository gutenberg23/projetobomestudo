import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AssuntosLoading: React.FC = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
};

export default AssuntosLoading;
