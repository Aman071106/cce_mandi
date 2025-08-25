import React from "react";
import Button from "@/components/button/button";
import Link from "next/link";

const HomeHeader = () => {
  return (
    <div className="relative w-screen h-[80vh] overflow-hidden flex flex-col px-12 py-12 justify-center items-center md:items-start text-white">
      {/* Technical Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Circuit Board Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='circuit' width='100' height='100' patternUnits='userSpaceOnUse'%3e%3cpath d='M20,20 L80,20 L80,80 L20,80 Z M40,40 L60,40 M50,30 L50,70' fill='none' stroke='%2364748b' stroke-width='1'/%3e%3ccircle cx='20' cy='20' r='3' fill='%2364748b'/%3e%3ccircle cx='80' cy='80' r='3' fill='%2364748b'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23circuit)'/%3e%3c/svg%3e")`,
          }}
        ></div>
        
        {/* Animated Grid Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-pulse"></div>
          <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        </div>
        
        {/* Matrix-style Binary Rain Effect */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '10%', top: '0%', animationDelay: '0s' }}>01100100</div>
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '20%', top: '10%', animationDelay: '0.5s' }}>11010110</div>
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '30%', top: '5%', animationDelay: '1s' }}>10101010</div>
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '40%', top: '15%', animationDelay: '1.5s' }}>01011001</div>
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '50%', top: '8%', animationDelay: '2s' }}>11100011</div>
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '60%', top: '12%', animationDelay: '2.5s' }}>00110101</div>
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '70%', top: '3%', animationDelay: '3s' }}>10011100</div>
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '80%', top: '18%', animationDelay: '3.5s' }}>01100001</div>
          <div className="absolute text-green-400 text-xs font-mono animate-pulse" style={{ left: '90%', top: '7%', animationDelay: '4s' }}>11010011</div>
        </div>
        
        {/* Tech Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-blue-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
      </div>
      
      {/* Glass Morphism Content Container */}
      <div className="relative z-10 backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-4xl">
        <div className="text-4xl md:text-6xl font-semibold tracking-tight text-center md:text-left mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Technical Induction Program
          </span>{" "}
          <span className="text-yellow-400 font-bold text-5xl md:text-7xl drop-shadow-lg">
            '25
          </span>
        </div>
        <div className="text-xl md:text-2xl font-medium mb-8 text-cyan-200/90">
          by SnTC, IIT Mandi
        </div>
        <div className="flex justify-center md:justify-start">
          <Link href={"/events"}>
            <Button variant="transparent">Browse events</Button>
          </Link>
        </div>
      </div>
      
      {/* Floating Glass Panels */}
      <div className="absolute top-20 right-20 w-32 h-32 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl opacity-60 animate-pulse hidden md:block"></div>
      <div className="absolute bottom-32 left-16 w-24 h-24 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl opacity-40 animate-pulse hidden md:block" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-20 h-20 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl opacity-50 animate-pulse hidden md:block" style={{ animationDelay: '2s' }}></div>
      
      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 opacity-80"></div>
    </div>
  );
};

export default HomeHeader;