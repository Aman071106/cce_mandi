import React from "react";

const ContactsHeader = () => {
  return (
    <div className="relative w-screen h-[60vh] overflow-hidden flex flex-col px-12 py-12 justify-end items-center md:items-start text-white">
      {/* Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
        {/* Technical Grid */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%236b7280' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e")`,
          }}
        ></div>
        
        {/* Subtle Structure Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-px h-full bg-gray-600 opacity-30"></div>
          <div className="absolute top-0 left-2/3 w-px h-full bg-gray-600 opacity-30"></div>
          <div className="absolute top-1/3 left-0 w-full h-px bg-gray-600 opacity-30"></div>
        </div>
        
        {/* Bottom Gradient for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      
      {/* Glass Content Container */}
      <div className="relative z-10 backdrop-blur-sm bg-black/20 border border-gray-700/40 rounded-xl p-6 md:p-8 shadow-xl max-w-4xl">
        <div className="text-4xl md:text-6xl font-bold tracking-tight text-center md:text-left mb-3 text-white">
          Contact Us
        </div>
        <div className="text-xl md:text-2xl text-gray-300 font-medium">
          Get in touch for any queries
        </div>
      </div>
      
      {/* Minimal Accent Element */}
      <div className="absolute bottom-20 right-20 w-2 h-16 bg-blue-500 opacity-70 hidden md:block"></div>
      
      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-700"></div>
    </div>
  );
};

export default ContactsHeader;