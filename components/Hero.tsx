import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onBookNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookNow }) => {
  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-shark-900 text-white">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: 'url("https://picsum.photos/id/15/1920/1080")' }} // Placeholder for ocean/cliff view
      />
      <div className="absolute inset-0 bg-gradient-to-t from-shark-900 via-shark-900/40 to-transparent"></div>

      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center items-start max-w-5xl">
        <span className="uppercase tracking-widest text-teal-400 font-bold mb-4 animate-fade-in-up">
          Fuvahmulah, Maldives
        </span>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Dive with the <br/> <span className="text-teal-400">Tiger Sharks</span>.
        </h1>
        <p className="text-xl text-shark-100 mb-10 max-w-xl">
          Experience the thrill of the world's most guaranteed tiger shark encounters. 
          Pristine reefs, pelagic magic, and luxury island living.
        </p>
        
        <button 
          onClick={onBookNow}
          className="group bg-teal-500 hover:bg-teal-400 text-shark-950 font-bold py-4 px-8 rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
        >
          Plan Your Expedition
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};