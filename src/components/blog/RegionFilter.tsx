
import React from "react";
import { Region, RegionFilter as RegionFilterType } from "./types";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface RegionFilterProps {
  regions: RegionFilterType[];
  activeRegion: Region | null;
  onSelectRegion: (region: Region | null) => void;
}

export const RegionFilter: React.FC<RegionFilterProps> = ({ 
  regions, 
  activeRegion, 
  onSelectRegion 
}) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-7 gap-2">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => onSelectRegion(activeRegion === region.value ? null : region.value)}
            className={cn(
              "py-2 px-3 text-center text-sm font-medium rounded-md transition-colors",
              activeRegion === region.value
                ? "bg-[#ea2be2] text-white"
                : "bg-white hover:bg-gray-100 text-[#67748a]"
            )}
          >
            {region.name}
          </button>
        ))}
      </div>
    </div>
  );
};
