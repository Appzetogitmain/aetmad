import React, { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExploreGridSkeleton } from "@food/components/ui/loading-skeletons";
import OptimizedImage from "@food/components/OptimizedImage";
import discoveryBg from "@food/assets/food_discovery_bg.png";
import multipleFoodCartonVideo from "../../../../../assets/multiple_food_carton.mp4";
import appzetoLogo from "@food/assets/appzetologo.png";

const ExploreMoreSection = memo(({
  exploreMoreHeading,
  showExploreSkeleton,
  finalExploreItems,
  backendOrigin = "",
  cardBgClass = "bg-gradient-to-b from-[#113d2d] via-[#082017] to-black",
  videoSrc,
  badgeText = "✨ Delicious",
  badgeBgClass = "bg-gradient-to-r from-[#0B3122]/95 to-[#061911]/95"
}) => {
  return (
    <section className="px-4 pt-1 pb-4">
        
        {/* User Provided Video Banner */}
        <div className="w-full flex justify-center mb-4 mt-1">
          <div className="relative w-[96%] max-w-[440px] rounded-[20px] overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.7)] border border-[#D4AF37]/30">
            {(() => {
              const src = videoSrc || multipleFoodCartonVideo;
              const isVideo = src.toLowerCase().endsWith('.mp4') || src.toLowerCase().endsWith('.webm');
              
              if (isVideo) {
                return (
                  <video 
                    src={src} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-[150px] sm:h-[200px] object-cover"
                  />
                );
              } else {
                return (
                  <img
                    src={src}
                    alt="Hero Banner"
                    className="w-full h-[150px] sm:h-[200px] object-cover"
                  />
                );
              }
            })()}
            {/* Functional Badge overlay tucked into corner to hide watermark without overlapping characters */}
            <div className={`absolute bottom-0 right-0 z-10 flex items-center justify-center ${badgeBgClass} px-2 py-0.5 rounded-tl-lg rounded-br-[20px] backdrop-blur-md border-t border-l border-[#D4AF37]/40 shadow-md`}>
              <span className="text-[#F3E5AB] text-[8px] font-bold tracking-widest uppercase">
                {badgeText}
              </span>
            </div>
          </div>
        </div>

        {/* Luxury Decorative Heading */}
        <div className="flex items-center justify-center gap-3 mb-3 mt-1">
          <div className="flex items-center gap-1.5 opacity-80">
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-[10px]">✦</span>
          </div>
          
          <h2 className="relative z-10 text-[12px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#F3E5AB] tracking-[0.2em] uppercase text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {exploreMoreHeading || "Explore More"}
          </h2>

          <div className="flex items-center gap-1.5 opacity-80">
            <span className="text-[#D4AF37] text-[10px]">✦</span>
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
          </div>
        </div>
        
        {showExploreSkeleton ? (
          <div className="relative z-10 w-full px-1 sm:px-2">
            <ExploreGridSkeleton count={3} className="grid-cols-3" />
          </div>
        ) : (
          <div className="relative z-10 flex overflow-x-auto hide-scrollbar gap-3 px-1 sm:px-2 pb-2 pt-1 w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style dangerouslySetInnerHTML={{__html: `
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}} />
            {finalExploreItems.map((item, index) => (
              <Link
                key={item.id || item._id || `explore-item-${index}`}
                to={item.href}
                className={`relative flex-shrink-0 w-[100px] h-[135px] sm:w-[120px] sm:h-[155px] group rounded-[20px] p-2 flex flex-col items-center justify-between border-[1.5px] border-[#D4AF37]/40 ${cardBgClass} shadow-[inset_0_0_15px_rgba(212,175,55,0.05),0_6px_15px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:border-[#D4AF37]/90 hover:shadow-[inset_0_0_20px_rgba(212,175,55,0.15),0_8px_25px_rgba(212,175,55,0.25)] hover:-translate-y-1.5`}
              >
                {/* Text Label */}
                <span className="text-[11px] sm:text-[13px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11] leading-snug mt-1.5 z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide group-hover:from-white group-hover:to-[#F3E5AB] transition-all duration-300">
                  {item.label}
                </span>
                
                {/* Image Container */}
                <div className="relative w-[54px] h-[54px] sm:w-[70px] sm:h-[70px] mt-auto mb-3.5 z-10 transition-transform duration-500 group-hover:scale-110 rounded-[12px] overflow-hidden border-[1px] border-[#D4AF37]/40 shadow-[0_4px_10px_rgba(0,0,0,0.7)] bg-[#04120C]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-20 pointer-events-none"></div>
                  <OptimizedImage
                    src={item.image}
                    alt={item.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Decorative Bottom Dots */}
                <div className="flex gap-1.5 mb-2 z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-[3px] h-[3px] rounded-full bg-gradient-to-br from-[#F3E5AB] to-[#D4AF37] shadow-[0_0_3px_#D4AF37]" />
                  <div className="w-[3px] h-[3px] rounded-full bg-gradient-to-br from-[#F3E5AB] to-[#D4AF37] shadow-[0_0_3px_#D4AF37]" />
                  <div className="w-[3px] h-[3px] rounded-full bg-gradient-to-br from-[#F3E5AB] to-[#D4AF37] shadow-[0_0_3px_#D4AF37]" />
                  <div className="w-[3px] h-[3px] rounded-full bg-gradient-to-br from-[#F3E5AB] to-[#D4AF37] shadow-[0_0_3px_#D4AF37]" />
                </div>
              </Link>
            ))}
          </div>
        )}
    </section>
  );
});

export default ExploreMoreSection;
