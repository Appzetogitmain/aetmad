import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Clock, Bookmark, BadgePercent } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { Card, CardContent } from "@food/components/ui/card"
import api from "@food/api"
import useAppBackNavigation from "@food/hooks/useAppBackNavigation"
import { toast } from "sonner"
import { API_BASE_URL } from "@food/api/config"
import OptimizedImage from "@food/components/OptimizedImage"
import { RestaurantGridSkeleton } from "@food/components/ui/loading-skeletons"
import { useDelayedLoading } from "@food/hooks/useDelayedLoading"
import { useLocation } from "@food/hooks/useLocation"
import { motion } from "framer-motion"
import foodPattern from "@food/assets/food_pattern_background.png"
// Import banner
import gourmetBanner from "@food/assets/groumetpagebanner.png"
const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}


export default function Gourmet() {
  const navigate = useNavigate()
  const goBack = useAppBackNavigation()
  const [favorites, setFavorites] = useState(new Set())
  const [gourmetRestaurants, setGourmetRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { location } = useLocation()
  const showGourmetSkeleton = useDelayedLoading(loading)

  const backendOrigin = (API_BASE_URL || "").replace(/\/api\/v1\/?$/, "")

  const resolveImageUrl = (url) => {
    if (typeof url !== "string") return ""
    const trimmed = url.trim()
    if (!trimmed) return ""
    if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) return trimmed
    if (!backendOrigin) return trimmed
    return `${backendOrigin.replace(/\/$/, "")}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`
  }

  // Fetch Gourmet restaurants from public API
  useEffect(() => {
    const fetchGourmetRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/food/hero-banners/gourmet/public')
        const data = response?.data?.data
        const list = data?.restaurants ?? (Array.isArray(data) ? data : [])
        setGourmetRestaurants(list)
      } catch (err) {
        debugError('Error fetching Gourmet restaurants:', err)
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load Gourmet restaurants'
        setError(errorMessage)
        toast.error(errorMessage)
        setGourmetRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    fetchGourmetRestaurants()
  }, [])

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className="relative min-h-screen bg-[#04120C] text-white">
      {/* Background Animated Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] mix-blend-screen"
        style={{ backgroundImage: `url(${foodPattern})`, backgroundSize: '150px' }}
      />
      
      {/* Cinematic Banner Section */}
      <div className="relative w-full overflow-hidden h-[50vh] md:h-[60vh] bg-[#071a10]">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-30 w-10 h-10 md:w-12 md:h-12 bg-black/40 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-colors shadow-2xl"
        >
          <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-white/80 hover:text-[#D4AF37]" />
        </button>

        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          {/* Subtle glowing ambient lights */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[120px] pointer-events-none mix-blend-screen" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#AA7C11] rounded-full blur-[150px] pointer-events-none mix-blend-screen" 
          />

          {/* Floating Luxury Gold Dust */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#D4AF37] rounded-full pointer-events-none opacity-0"
              animate={{
                y: [0, -100 - Math.random() * 200],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, Math.random() * 0.6 + 0.2, 0],
                scale: [0, Math.random() + 0.5, 0]
              }}
              initial={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              transition={{
                duration: Math.random() * 10 + 8,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}

          {/* High-Fashion Typography */}
          <div className="relative z-10 text-center flex flex-col items-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-[10px] md:text-xs font-black tracking-[0.4em] text-[#D4AF37] uppercase mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              The Michelin Experience
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
              className="text-4xl sm:text-6xl md:text-8xl lg:text-[140px] font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 tracking-[0.1em] sm:tracking-[0.2em] leading-none drop-shadow-2xl"
              style={{ fontWeight: 300 }}
            >
              GOURMET
            </motion.h1>
          </div>
          
          {/* Bottom Gradient Fade to Content */}
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#04120C] to-transparent pointer-events-none z-20" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 px-4 sm:px-6 md:px-8 lg:px-10 pb-10 md:pb-16 -mt-20 md:-mt-32 space-y-8 md:space-y-12">
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6">
            <h2 className="text-2xl sm:text-3xl font-serif text-[#D4AF37] tracking-widest uppercase">The Collection</h2>
            <p className="text-xs sm:text-sm font-bold text-gray-400 tracking-[0.2em] uppercase">
              {showGourmetSkeleton ? '...' : gourmetRestaurants.length} Exclusive Venues
            </p>
          </div>

          {/* Loading State */}
          {showGourmetSkeleton && <RestaurantGridSkeleton count={2} />}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-500 dark:text-red-400 text-center font-serif text-xl">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-6 bg-[#D4AF37] hover:bg-[#AA7C11] text-black">Retry</Button>
            </div>
          )}

          {/* Editorial Restaurant Cards */}
          {!showGourmetSkeleton && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {gourmetRestaurants.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-500 font-serif text-xl italic">No Gourmet venues available at the moment.</p>
                </div>
              ) : (
                gourmetRestaurants.map((item, index) => {
                  const restaurant = item.restaurant || item
                  const restaurantSlug = restaurant.slug || restaurant.restaurantName?.toLowerCase().replace(/\s+/g, "-") || restaurant.name?.toLowerCase().replace(/\s+/g, "-") || ""
                  const restaurantId = restaurant._id || restaurant.restaurantId || restaurant.id
                  const isFavorite = favorites.has(restaurantId)

                  // Calculate distance if coordinates are available
                  const calculateDistance = (lat1, lng1, lat2, lng2) => {
                    const R = 6371; // Earth's radius in kilometers
                    const dLat = ((lat2 - lat1) * Math.PI) / 180;
                    const dLng = ((lng2 - lng1) * Math.PI) / 180;
                    const a =
                      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos((lat1 * Math.PI) / 180) *
                        Math.cos((lat2 * Math.PI) / 180) *
                        Math.sin(dLng / 2) *
                        Math.sin(dLng / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    return R * c; // Distance in kilometers
                  };

                  let distanceStr = '1.2 km'
                  const restaurantLat = restaurant.location?.latitude || restaurant.location?.coordinates?.[1]
                  const restaurantLng = restaurant.location?.longitude || restaurant.location?.coordinates?.[0]
                  
                  if (location?.latitude && location?.longitude && restaurantLat && restaurantLng) {
                    const d = calculateDistance(location.latitude, location.longitude, restaurantLat, restaurantLng)
                    distanceStr = `${d.toFixed(1)} km`
                  } else if (restaurant.distance) {
                    distanceStr = restaurant.distance
                  }

                  // Get restaurant cover image with priority: coverImages > menuImages > profileImage
                  const coverImages = restaurant.coverImages && restaurant.coverImages.length > 0
                    ? restaurant.coverImages.map(img => img.url || img).filter(Boolean)
                    : []

                  const menuImages = restaurant.menuImages && restaurant.menuImages.length > 0
                    ? restaurant.menuImages.map(img => img.url || img).filter(Boolean)
                    : []

                  const rawRestaurantImage =
                    coverImages.length > 0
                      ? coverImages[0]
                      : (menuImages.length > 0
                        ? menuImages[0]
                        : (restaurant.profileImage?.url || restaurant.profileImage || restaurant.image || ""))

                  const restaurantImage = resolveImageUrl(rawRestaurantImage)

                  return (
                    <motion.div
                      key={restaurantId}
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.21, 1.02, 0.73, 1] }}
                    >
                      <Link to={`/user/restaurants/${restaurantSlug}`}>
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="relative w-full h-[450px] sm:h-[550px] md:h-[600px] overflow-hidden rounded-[4px] group cursor-pointer shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] border border-[#D4AF37]/15"
                        >
                        {/* Background Image */}
                        {restaurantImage ? (
                          <OptimizedImage
                            src={restaurantImage}
                            alt={restaurant.restaurantName || restaurant.name}
                            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-[#111] flex items-center justify-center">
                            <span className="text-gray-700 font-serif text-lg">No Image</span>
                          </div>
                        )}

                        {/* Heavy Cinematic Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#04120C] via-[#04120C]/50 to-black/10 opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                        
                        {/* Bookmark Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-6 right-6 h-12 w-12 bg-[#0B3122]/60 backdrop-blur-md rounded-full hover:bg-[#0B3122] border border-white/10 transition-colors z-20"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(restaurantId)
                          }}
                        >
                          <Bookmark className={`h-5 w-5 ${isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white/80"}`} strokeWidth={1.5} />
                        </Button>

                        {/* Content Section (Bottom) */}
                        <div className="absolute bottom-0 left-0 w-full p-8 sm:p-10 z-10 flex flex-col justify-end h-full">
                          {/* Offer Badge (Top of content) */}
                          {restaurant.offer && (
                            <div className="mb-4 self-start bg-transparent border border-[#D4AF37] px-4 py-1.5 rounded-full backdrop-blur-sm">
                              <span className="text-[#D4AF37] font-bold tracking-[0.2em] text-[10px] uppercase">{restaurant.offer}</span>
                            </div>
                          )}

                          <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white leading-tight mb-4 drop-shadow-xl group-hover:text-[#D4AF37] transition-colors duration-500">
                            {restaurant.restaurantName || restaurant.name}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-6 text-sm font-medium tracking-wide">
                            {/* Rating */}
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                              <span className="text-white text-lg">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                            
                            {/* Delivery Time */}
                            <div className="flex items-center gap-2 text-gray-300">
                              <Clock className="h-4 w-4" strokeWidth={1.5} />
                              <span>{restaurant.estimatedDeliveryTime || '25-30 mins'}</span>
                            </div>

                            {/* Distance */}
                            <div className="flex items-center gap-2 text-gray-400">
                              <span className="w-1 h-1 rounded-full bg-gray-500" />
                              <span>{distanceStr}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Light Sweep Effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out z-0 pointer-events-none mix-blend-screen" />
                      </motion.div>
                      </Link>
                    </motion.div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


