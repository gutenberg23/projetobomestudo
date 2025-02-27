
import React from "react";
import { ProfileMenu } from "./ProfileMenu";

export const Header = () => {
  return (
    <header className="fixed top-0 z-50 w-full h-[88px] bg-white border-b border-[#f8fafc]">
      <div className="flex items-center justify-between h-full px-5">
        <div className="flex items-center">
          <img
            src="https://app.lovable.dev/assets/logo.png"
            alt="Logo"
            className="h-16 w-auto"
          />
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
