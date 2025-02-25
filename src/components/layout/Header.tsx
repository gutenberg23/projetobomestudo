
import React from "react";
import { Search, Menu, HelpCircle, MessageSquare, Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

export const Header = () => {
  return (
    <header className="bg-white min-h-[88px] w-full flex items-center justify-between flex-wrap px-2.5 border-b border-[rgba(247,248,250,1)] fixed top-0 left-0 z-50">
      <div className="flex min-h-[88px] flex-col items-stretch justify-center w-[194px] py-8">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/ee47f81d3df30406eedeb997df60ffc12cce0b3965827fc005f4c7a2da4ca470"
          alt="Company Logo"
          className="aspect-[8.06] object-contain w-[194px] md:w-[194px] w-[120px]"
        />
      </div>

      <div className="hidden md:flex min-w-60 min-h-[88px] items-center gap-2.5 py-[19px]">
        <div className="flex min-w-60 min-h-[50px] items-center gap-[26px] flex-wrap">
          <div className="bg-slate-50 border flex min-w-60 min-h-[50px] max-w-[400px] items-center w-[350px] px-5 py-[11px] rounded-[5px] border-[rgba(237,240,245,1)]">
            <input
              type="text"
              placeholder="Pesquisar"
              className="flex-1 bg-transparent text-[15px] text-[rgba(38,47,60,1)] outline-none"
            />
            <button className="bg-white border flex items-center justify-center w-7 h-7 rounded-[3px] border-[rgba(238,241,246,1)]">
              <Search className="w-4 h-4" />
            </button>
          </div>

          <button className="flex items-center justify-center w-[35px] h-[35px] rounded-lg">
            <HelpCircle className="w-[30px] h-[30px] transition-all duration-300 hover:fill-current [&:hover]:drop-shadow-[0_0_8px_rgba(254,130,110,0.5)] [background:linear-gradient(to_right,#CC20E7,#FF2BA3,#FE826E)] [-webkit-background-clip:text] [background-clip:text] [color:transparent] hover:opacity-80" />
          </button>

          <button className="flex items-center justify-center w-[35px] h-[35px] rounded-lg">
            <MessageSquare className="w-[30px] h-[30px] transition-all duration-300 hover:fill-current [&:hover]:drop-shadow-[0_0_8px_rgba(254,130,110,0.5)] [background:linear-gradient(to_right,#CC20E7,#FF2BA3,#FE826E)] [-webkit-background-clip:text] [background-clip:text] [color:transparent] hover:opacity-80" />
          </button>

          <button className="flex items-center justify-center w-[35px] h-[35px] rounded-lg">
            <Bell className="w-[30px] h-[30px] transition-all duration-300 hover:fill-current [&:hover]:drop-shadow-[0_0_8px_rgba(254,130,110,0.5)] [background:linear-gradient(to_right,#CC20E7,#FF2BA3,#FE826E)] [-webkit-background-clip:text] [background-clip:text] [color:transparent] hover:opacity-80" />
          </button>

          <Avatar className="w-[50px] h-[50px] border-2 border-white shadow-[0px_1px_4px_rgba(0,0,0,0.05)]">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <button className="md:hidden">
        <Menu className="w-6 h-6" />
      </button>
    </header>
  );
};
