import React, { memo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { HeroBannerSkeleton } from "@food/components/ui/loading-skeletons";
import { optimizeCloudinaryVideoUrl } from "@shared/utils/cloudinaryUtils";
import OptimizedImage from "@food/components/OptimizedImage";

const BannerSection = memo(({
  showBannerSkeleton,
  heroBannerImages = [],
  heroBannersData = [],
  currentBannerIndex,
  setCurrentBannerIndex,
  navigate,
  backendOrigin = ""
}) => {
  const scrollRef = useRef(null);

  // Auto-scroll logic (Horizontal Sliding)
  useEffect(() => {
    if (!heroBannerImages || heroBannerImages.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const nextIndex = (prev + 1) % heroBannerImages.length;
        // Scroll the container to the next banner
        if (scrollRef.current) {
          const containerWidth = scrollRef.current.clientWidth;
          scrollRef.current.scrollTo({
            left: nextIndex * containerWidth,
            behavior: "smooth",
          });
        }
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [heroBannerImages, setCurrentBannerIndex]);

  // Sync scroll position when user manually scrolls
  const handleScroll = (e) => {
    if (!scrollRef.current) return;
    const scrollPosition = e.target.scrollLeft;
    const containerWidth = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollPosition / containerWidth);
    if (newIndex !== currentBannerIndex && newIndex >= 0 && newIndex < heroBannerImages.length) {
      setCurrentBannerIndex(newIndex);
    }
  };

  if (showBannerSkeleton) {
    return (
      <div className="h-full w-full">
        <HeroBannerSkeleton className="h-full w-full" />
      </div>
    );
  }

  if (!heroBannerImages || heroBannerImages.length === 0) return null;

  return (
    <div className="relative h-full w-full bg-transparent">
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}} />
        
        {heroBannerImages.map((image, index) => {
          const bannerData = heroBannersData[index];
          const isVideo = bannerData?.type === 'video' || (typeof image === 'string' && image.toLowerCase().endsWith('.mp4'));

          return (
            <div
              key={`${index}-${image}`}
              className="relative min-w-full h-full flex-shrink-0 snap-center snap-always cursor-pointer overflow-hidden bg-black"
              onClick={() => {
                const linkedRestaurants = bannerData?.linkedRestaurants || [];
                if (linkedRestaurants.length > 0) {
                  const firstRestaurant = linkedRestaurants[0];
                  const restaurantSlug = firstRestaurant.slug || firstRestaurant.restaurantId || firstRestaurant._id;
                  navigate(`/restaurants/${restaurantSlug}`);
                }
              }}
            >
              {isVideo ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                >
                  <source src={optimizeCloudinaryVideoUrl(image, { format: 'webm' })} type="video/webm" />
                  <source src={optimizeCloudinaryVideoUrl(image, { format: 'mp4' })} type="video/mp4" />
                  <source src={image} />
                </video>
              ) : (
                <OptimizedImage
                  src={image}
                  alt={`Hero Banner ${index + 1}`}
                  className="h-full w-full object-contain"
                  priority={index === 0}
                  backendOrigin={backendOrigin}
                  draggable={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 z-30 pointer-events-none bg-black/30 rounded-full backdrop-blur-sm">
        {heroBannerImages.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentBannerIndex === index ? "bg-[#F3E5AB] w-5 shadow-[0_0_5px_#D4AF37]" : "bg-white/50 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
});

export default BannerSection;
