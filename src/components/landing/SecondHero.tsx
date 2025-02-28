import React from "react";
export const SecondHero = () => {
  return <div className="w-full px-2.5 py-16 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[rgba(38,47,60,1)]">
            All the cool features
          </h2>
          <p className="text-gray-600">
            Mauris consequat, cursus pharetra et, habitasse rhoncus quis odio ac. In et dolor eu donec maecenas nulla. Cum sed orci, sit pellentesque quisque feugiat cras ullamcorper. Ultrices in amet, ullamcorper non viverra a, neque orci.
          </p>
          <a href="#" className="text-blue-600 flex items-center gap-2 hover:underline">
            View all the features
            <span className="text-xl">→</span>
          </a>
        </div>
        <div className="flex-1">
          <img alt="Features showcase" className="w-full h-auto rounded-lg" src="/lovable-uploads/72f4e3ba-f775-45ec-a63f-d01db14a5b60.jpg" />
        </div>
      </div>
    </div>;
};