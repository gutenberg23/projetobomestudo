
import React from "react";
import { ProfileMenu } from "./ProfileMenu";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Header = () => {
  return (
    <header className="fixed top-0 z-50 w-full h-[88px] bg-white border-b border-[#f8fafc]">
      <div className="flex items-center justify-between h-full px-5">
        <div className="flex min-w-60 items-center">
          <img
            src="https://app.lovable.dev/assets/logo.png"
            alt="Logo"
            className="w-[200px]"
          />
        </div>

        <div className="flex-1 mx-8 hidden md:block max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-10 bg-gray-50"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="block md:hidden">
            <ProfileMenu isMobile={true} />
          </div>
          <div className="hidden md:block">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
