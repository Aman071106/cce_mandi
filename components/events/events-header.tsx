import React from "react";

const EventsHeader = () => {
  return (
    <div className="relative w-screen h-[60vh] overflow-hidden flex flex-col px-12 py-12 justify-end items-center md:items-start text-white">
      {/* Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900">
        {/* Technical Grid */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='50' height='50' patternUnits='userSpaceOnUse'%3e%3cpath d='M 50 0 L 0 0 0 50' fill='none' stroke='%23475569' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e")`,
          }}
        ></div>
        
        {/* Minimal Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-px h-full bg-slate-600 opacity-40"></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-slate-600 opacity-40"></div>
          <div className="absolute top-1/4 left-0 w-full h-px bg-slate-600 opacity-40"></div>
        </div>
        
        {/* Bottom Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>
      
      {/* Glass Content Container */}
      <div className="relative z-10 backdrop-blur-sm bg-black/20 border border-slate-700/40 rounded-xl p-6 md:p-8 shadow-xl max-w-4xl">
        <div className="text-4xl md:text-6xl font-bold tracking-tight text-center md:text-left mb-3 text-white">
          View Events
        </div>
        <div className="text-xl md:text-2xl text-gray-300 font-medium">
          See what&apos;s in it for you
        </div>
      </div>
      
      {/* Minimal Accent */}
      <div className="absolute bottom-20 right-20 w-16 h-2 bg-blue-500 opacity-70 hidden md:block"></div>
      
      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-700"></div>
    </div>
  );
};

export default EventsHeader;