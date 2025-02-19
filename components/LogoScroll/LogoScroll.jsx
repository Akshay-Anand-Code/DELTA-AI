import React from 'react';
import { motion } from 'framer-motion';
import styles from './LogoScroll.module.css';

const LogoScroll = () => {
  const logos = [
    { name: 'ChatGPT 4.0', icon: 'openai.svg', invert: true },
    { name: 'FLUX 1.1', icon: null },
    { name: 'Claude 3.5', icon: 'claude.svg', invert: true },
    { name: 'MidJourney', icon: null },
    { name: 'LLaMA', icon: 'meta.svg' },
    { name: 'o1-preview', icon: 'openai.svg', invert: true },
  ];

  // Duplicate the logos array multiple times to ensure smooth scrolling
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="relative w-full py-4">
      <h4 className="text-[#46464c] font-inter font-semibold sm:text-base xss:text-sm text-center mb-4">
        ALL THE MODELS YOU WILL EVER NEED
      </h4>
      
      {/* Container with max width and center alignment */}
      <div className="max-w-[800px] mx-auto relative mb-4">
        <div className={`relative overflow-hidden ${styles.maskEdges}`}>
          {/* Enhanced gradient overlays */}
          <div className="absolute left-0 top-0 w-[200px] h-full bg-gradient-to-r from-black via-black to-transparent z-10 blur-[2px]"></div>
          <div className="absolute right-0 top-0 w-[200px] h-full bg-gradient-to-l from-black via-black to-transparent z-10 blur-[2px]"></div>
          
          {/* Scrolling Content */}
          <motion.div 
            className="flex whitespace-nowrap py-2"
            animate={{
              x: ["0%", "-50%"]
            }}
            transition={{
              x: {
                duration: 20,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop"
              }
            }}
            style={{
              gap: '2rem'
            }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div 
                key={index} 
                className="inline-flex items-center space-x-2 mx-4 hover:scale-110 transition-transform duration-200"
              >
                {logo.icon && (
                  <img 
                    src={logo.icon} 
                    className={`w-5 h-5 ${logo.invert ? 'invert' : ''}`} 
                    alt="" 
                  />
                )}
                <span className="text-base font-medium whitespace-nowrap text-[#cccccc] hover:text-white transition-colors">
                  {logo.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LogoScroll; 