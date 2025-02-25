
import React from "react";

export const Stats = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <p className="text-xl md:text-2xl text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu egestas dolor. Vestibulum orci sapien, tristique a congue non.
        </p>
      </div>
      <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-8">
        <div className="text-center">
          <div className="text-[rgba(241,28,227,1)] text-4xl md:text-5xl font-bold mb-2">1,3M</div>
          <p className="text-gray-600">de questões para você praticar</p>
        </div>
        <div className="text-center">
          <div className="text-[rgba(241,28,227,1)] text-4xl md:text-5xl font-bold mb-2">+165k</div>
          <p className="text-gray-600">vagas disponíveis em concursos públicos em 2025</p>
        </div>
        <div className="text-center">
          <div className="text-[rgba(241,28,227,1)] text-4xl md:text-5xl font-bold mb-2">1,3M</div>
          <p className="text-gray-600">de questões para você praticar</p>
        </div>
      </div>
    </div>
  );
};
