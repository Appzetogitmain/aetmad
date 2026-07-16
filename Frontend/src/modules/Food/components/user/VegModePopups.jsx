import React from 'react';
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, AlertCircle, RefreshCw, X } from "lucide-react";

const VegModePopups = ({ 
  showVegModePopup, 
  showSwitchOffPopup, 
  onCloseVegPopup, 
  onCloseSwitchOffPopup,
  onConfirmSwitchOff 
}) => {
  // Prevent body scroll when popups are open
  React.useEffect(() => {
    if (showVegModePopup || showSwitchOffPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showVegModePopup, showSwitchOffPopup]);

  return (
    <>
      {/* Pure Veg Mode Confirmation Overlay */}
      {createPortal(
        <AnimatePresence>
          {showVegModePopup && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCloseVegPopup}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                className="relative bg-gradient-to-b from-[#071a10]/95 to-[#0B3122]/95 backdrop-blur-3xl rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_80px_-15px_rgba(212,175,55,0.25)] overflow-hidden border border-[#D4AF37]/40 dark:border-[#D4AF37]/30"
              >
                {/* Ultra-Luxury Gold Grid & Orbs Overlay */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                }} />
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-20 -right-20 w-60 h-60 bg-[#D4AF37] rounded-full blur-[80px] pointer-events-none mix-blend-screen" 
                />

                <div className="relative text-center z-10">
                  <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1, bounce: 0.6 }}
                    whileHover={{ rotate: 10, scale: 1.05 }}
                    className="w-24 h-24 bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4AF37]/40 rotate-3 transition-transform border border-white/40"
                  >
                    <Leaf className="w-12 h-12 text-[#0B3122] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[32px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] mb-2 font-serif"
                  >
                    Pure Veg Mode
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#D4AF37]/70 text-[13px] leading-relaxed mb-8 font-medium px-2"
                  >
                    Experience dining tailored perfectly to your preferences. How shall we curate your menu?
                  </motion.p>
                  
                  <div className="flex flex-col gap-4">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      onClick={() => onCloseVegPopup("pure")}
                      className="group relative w-full py-4 px-6 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#0B3122] font-black rounded-2xl shadow-[0_10px_25px_-5px_rgba(212,175,55,0.5)] transition-all duration-300 transform active:scale-[0.98] whitespace-normal overflow-hidden border border-[#F3E5AB]/50 hover:shadow-[0_15px_35px_-5px_rgba(212,175,55,0.6)]"
                    >
                      <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative z-10 tracking-widest uppercase text-xs">Pure Veg Kitchens Only</span>
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => onCloseVegPopup("all")}
                      className="w-full py-4 px-6 bg-[#0B3122]/50 hover:bg-[#D4AF37]/10 backdrop-blur-md text-[#D4AF37] font-bold rounded-2xl transition-all duration-300 transform active:scale-[0.98] whitespace-normal border border-[#D4AF37]/30 hover:border-[#D4AF37]/60"
                    >
                      <span className="tracking-widest uppercase text-xs">Veg items from any kitchen</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Pure Veg Mode Switch Off Confirmation */}
      {createPortal(
        <AnimatePresence>
          {showSwitchOffPopup && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCloseSwitchOffPopup}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
                className="relative bg-gradient-to-b from-[#071a10]/95 to-[#0B3122]/95 backdrop-blur-3xl rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_80px_-15px_rgba(212,175,55,0.25)] overflow-hidden border border-[#D4AF37]/40"
              >
                {/* Ultra-Luxury Gold Grid & Orbs Overlay */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                }} />
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-20 -right-20 w-60 h-60 bg-[#D4AF37] rounded-full blur-[80px] pointer-events-none mix-blend-screen" 
                />

                <div className="relative text-center z-10">
                  <motion.div 
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1, bounce: 0.6 }}
                    whileHover={{ rotate: -10, scale: 1.05 }}
                    className="w-24 h-24 bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#D4AF37]/40 -rotate-3 transition-transform border border-white/40"
                  >
                    <AlertCircle className="w-12 h-12 text-[#0B3122] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" strokeWidth={2.5} />
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[32px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] mb-2 font-serif"
                  >
                    Switching Off?
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#D4AF37]/70 text-[13px] leading-relaxed mb-8 font-medium px-2"
                  >
                    This will re-enable non-vegetarian options in your curated feed. Continue?
                  </motion.p>
                  
                  <div className="flex flex-col gap-4">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      onClick={onConfirmSwitchOff}
                      className="group relative w-full py-4 px-6 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#0B3122] font-black rounded-2xl shadow-[0_10px_25px_-5px_rgba(212,175,55,0.5)] transition-all duration-300 transform active:scale-[0.98] whitespace-normal overflow-hidden flex items-center justify-center gap-2 border border-[#F3E5AB]/50 hover:shadow-[0_15px_35px_-5px_rgba(212,175,55,0.6)]"
                    >
                      <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <RefreshCw className="w-4 h-4 relative z-10" />
                      <span className="relative z-10 tracking-widest uppercase text-xs">Yes, Switch Off</span>
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={onCloseSwitchOffPopup}
                      className="w-full py-4 px-6 bg-[#0B3122]/50 hover:bg-[#D4AF37]/10 backdrop-blur-md text-[#D4AF37] font-bold rounded-2xl transition-all duration-300 transform active:scale-[0.98] whitespace-normal border border-[#D4AF37]/30 hover:border-[#D4AF37]/60"
                    >
                      <span className="tracking-widest uppercase text-xs">Keep it On</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default React.memo(VegModePopups);
