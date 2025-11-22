import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onBookNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookNow }) => {
  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-shark-950 text-white">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50 transform scale-105 animate-slow-zoom"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1560275619-4662e36fa65c?q=80&w=2600&auto=format&fit=crop")',
          backgroundPosition: 'center 30%' 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-shark-950 via-shark-900/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-shark-950/50 to-transparent"></div>

      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-center text-center max-w-5xl pt-20">
        <span className="inline-block py-1 px-3 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-sm">
          Fuvahmulah · Maldives
        </span>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight drop-shadow-2xl">
          Dive with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-teal-200">
            Tiger Sharks
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl leading-relaxed font-light drop-shadow-lg">
          Encounter the ocean's majestic predators in their natural habitat. 
          A world-class diving experience guided by local experts.
        </p>
        
        <button 
          onClick={onBookNow}
          className="group bg-teal-500 hover:bg-teal-400 text-shark-950 font-bold py-4 px-10 rounded-full transition-all duration-300 flex items-center gap-3 shadow-[0_0_40px_rgba(45,212,191,0.3)] hover:shadow-[0_0_60px_rgba(45,212,191,0.5)] transform hover:-translate-y-1"
        >
          Book Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce opacity-50">
           <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
              <div className="w-1 h-2 bg-white rounded-full"></div>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}</style>
    </div>
  );
};