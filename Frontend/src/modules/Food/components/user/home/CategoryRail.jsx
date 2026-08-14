import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowDownUp } from "lucide-react";
import { CategoryChipRowSkeleton } from "@food/components/ui/loading-skeletons";
import OptimizedImage from "@food/components/OptimizedImage";
import foodPattern from "@food/assets/food_pattern_background.png";

const CategoryRail = memo(({ 
  displayCategories, 
  showCategorySkeleton,
  navigate,
  backendOrigin = ""
}) => {
  return (
    <section className="px-4 pt-1 pb-1 space-y-2">
      <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 tracking-wide">
        What's on your mind?
      </h2>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Offers Card - Rounded Square */}
        <div 
          className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/user/most-discounted")}
        >
          <div className="relative w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full flex flex-col items-center justify-center p-1 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-transform duration-300 group-hover:scale-110 group-active:scale-95 group-hover:shadow-[0_0_35px_rgba(212,175,55,0.7)]">
            
            {/* Background layers wrapper (handles clipping) */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0">
              {/* Cyber Spinning Gold Gradient Border */}
              <div className="absolute w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_270deg,#D4AF37_360deg)] animate-[spin_2s_linear_infinite] -top-1/2 -left-1/2" />
              
              {/* Inner Home Page Green Core */}
              <div className="absolute inset-[2px] rounded-full bg-[#0B3122] shadow-[inset_0_0_15px_rgba(212,175,55,0.2)]" />
              
              {/* Pulsing Core Glow */}
              <div className="absolute inset-0 bg-[#D4AF37]/15 animate-pulse rounded-full" />
            </div>

            {/* Text Content (Shifted Upwards) */}
            <div className="flex flex-col items-center z-10 -mt-1 text-center">
              <span className="text-[8px] sm:text-[9px] font-black text-[#D4AF37] tracking-widest drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] leading-none mb-0.5">MOST</span>
              <span className="text-[9px] sm:text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3E5AB] to-[#D4AF37] tracking-tighter leading-tight drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] uppercase">DISCOUNTED</span>
            </div>
            
            {/* Overlapping Explore Pill */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center px-2.5 py-[1.5px] bg-[#0B3122] rounded-full shadow-[0_4px_10px_rgba(212,175,55,0.6)] z-20 border border-[#D4AF37] group-hover:bg-[#D4AF37] transition-colors duration-300">
              <span className="text-[7px] font-extrabold text-[#D4AF37] group-hover:text-[#0B3122] uppercase tracking-[0.15em] shadow-sm leading-none pt-[1px]">Explore</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">Offers</span>
        </div>

        {!showCategorySkeleton && displayCategories.map((category, index) => (
          <Link
            key={category.id || index}
            to={`/user/category/${category.slug || category.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            <div className="w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden shadow-sm border border-gray-100 transition-transform group-hover:scale-110">
              <OptimizedImage
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                backendOrigin={backendOrigin}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate w-full text-center">
              {category.name}
            </span>
          </Link>
        ))}

        {showCategorySkeleton && <CategoryChipRowSkeleton className="flex-shrink-0" />}
      </div>
    </section>
  );
});

export default CategoryRail;
