
import React from "react";
import { ProfileMenu } from "./ProfileMenu";

export const Header = () => {
  return (
    <header className="fixed top-0 z-50 w-full h-[88px] bg-white border-b border-[#f8fafc]">
      <div className="flex min-w-60 w-full items-center justify-between px-2.5">
        <div className="flex justify-center items-center w-full max-w-[278px] py-[13px]">
          <img
            src="https://app.lovable.dev/assets/logo.png"
            alt="Logo"
            className="w-[200px]"
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
