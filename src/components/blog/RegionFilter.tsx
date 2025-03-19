
import React from "react";
import { Region, RegionFilter as RegionFilterType } from "./types";
import { cn } from "@/lib/utils";

interface RegionFilterProps {
  regions: RegionFilterType[];
  activeRegion: string | null;
  onSelectRegion: (region: string | null) => void;
}

export const RegionFilter: React.FC<RegionFilterProps> = ({
  regions,
  activeRegion,
  onSelectRegion
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => onSelectRegion(activeRegion === region.id ? null : region.id)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
              activeRegion === region.id
                ? "bg-[#5f2ebe]/20 text-[#5f2ebe] border border-[#5f2ebe]"
                : "bg-gray-100 hover:bg-gray-200 text-[#67748a]"
            )}
          >
            {region.name}
          </button>
        ))}
      </div>
    </div>
  );
};
