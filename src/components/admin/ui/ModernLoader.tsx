import React from 'react';
import { motion } from 'framer-motion';

export function ModernLoader({ text = "Loading Data..." }: { text?: string }) {
  return (
    <div className="!flex !flex-col !items-center !justify-center !min-h-[60vh] !w-full !gap-6">
      <div className="!relative !flex !items-center !justify-center !w-10 !h-10">
        {/* Outer pulsing ring */}
        <motion.div
          className="!absolute !inset-0 !rounded-full !border-2 !border-blue-500/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Inner spinning ring */}
        <motion.div
          className="!absolute !inset-2 !rounded-full !border-2 !border-t-blue-600 !border-r-blue-600 !border-b-transparent !border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center dot */}
        {/* <div className="!w-3 !h-3 !bg-blue-600 !rounded-full !shadow-[0_0_10px_rgba(37,99,235,0.5)]" /> */}
      </div>
      
      <motion.div 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="!flex !items-center !gap-2"
      >
        <span className="!text-xs !font-bold !tracking-[0.2em] !uppercase !text-blue-600 dark:!text-blue-400">
          {text}
        </span>
      </motion.div>
    </div>
  );
}
