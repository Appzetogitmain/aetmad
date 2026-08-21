import { useState, useMemo, useCallback, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Star,
  Clock,
  MapPin,
  ArrowLeft,
  Search,
  ShoppingBag,
  Sparkles,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle2,
  Navigation
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import AnimatedPage from "@food/components/user/AnimatedPage"
import { Card, CardContent } from "@food/components/ui/card"
import { Button } from "@food/components/ui/button"
import { useLocation } from "@food/hooks/useLocation"
import { useZone } from "@food/hooks/useZone"
import { useCart } from "@food/context/CartContext"
import OptimizedImage from "@food/components/OptimizedImage"
import api, { restaurantAPI } from "@food/api"
import { calculateDistance, formatDistance } from "@food/utils/common"

const RUPEE_SYMBOL = "₹"

export default function Takeaway() {
  const navigate = useNavigate()
  const { location } = useLocation()
  const { zoneId } = useZone(location)
  const { cart, addToCart, updateQuantity } = useCart()

  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all") // 'all', 'discount', 'veg', 'top_rated', 'near', 'fast'
  const [selectedSort, setSelectedSort] = useState("distance") // 'distance', 'rating', 'prep_time'

  // Fetch takeaway enabled restaurants
  const fetchTakeawayRestaurants = useCallback(async () => {
    try {
      setLoading(true)
      const lat = location?.latitude
      const lng = location?.longitude

      const params = {
        takeawayOnly: "true",
        ...(lat && lng ? { lat, lng } : {}),
        ...(zoneId ? { zoneId } : {})
      }

      const res = await api.get("/food/restaurants", { params })
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.restaurants)
        ? res.data.restaurants
        : Array.isArray(res.data)
        ? res.data
        : []

      // Keep only active restaurants with takeaway enabled
      const takeawayList = list.filter(
        (r) => r.isTakeawayEnabled !== false && r.status === "approved"
      )
      setRestaurants(takeawayList)
    } catch (err) {
      console.error("Failed to fetch takeaway restaurants:", err)
      toast.error("Could not load takeaway restaurants")
    } finally {
      setLoading(false)
    }
  }, [location?.latitude, location?.longitude, zoneId])

  useEffect(() => {
    fetchTakeawayRestaurants()
  }, [fetchTakeawayRestaurants])

  // Filter and Sort Restaurants
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants]

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.restaurantName?.toLowerCase().includes(q) ||
          r.cuisines?.some((c) => c.toLowerCase().includes(q)) ||
          r.area?.toLowerCase().includes(q)
      )
    }

    // Filter tags
    if (activeFilter === "discount") {
      result = result.filter(
        (r) => Number(r.takeawayDiscount || 0) > 0 || Boolean(r.offer)
      )
    } else if (activeFilter === "veg") {
      result = result.filter((r) => r.pureVegRestaurant === true)
    } else if (activeFilter === "top_rated") {
      result = result.filter((r) => Number(r.rating || 0) >= 4.0)
    } else if (activeFilter === "near") {
      result = result.filter((r) => {
        if (!location?.latitude || !location?.longitude || !r.location?.coordinates) return true
        const dist = calculateDistance(
          location.latitude,
          location.longitude,
          r.location.coordinates[1],
          r.location.coordinates[0]
        )
        return dist <= 3.0 // within 3 km
      })
    } else if (activeFilter === "fast") {
      result = result.filter(
        (r) => Number(r.estimatedDeliveryTimeMinutes || 30) <= 25
      )
    }

    // Sorting
    result.sort((a, b) => {
      if (selectedSort === "rating") {
        return Number(b.rating || 0) - Number(a.rating || 0)
      }
      if (selectedSort === "prep_time") {
        return (
          Number(a.estimatedDeliveryTimeMinutes || 25) -
          Number(b.estimatedDeliveryTimeMinutes || 25)
        )
      }
      // default: distance
      if (location?.latitude && location?.longitude) {
        const distA = a.location?.coordinates
          ? calculateDistance(
              location.latitude,
              location.longitude,
              a.location.coordinates[1],
              a.location.coordinates[0]
            )
          : 999
        const distB = b.location?.coordinates
          ? calculateDistance(
              location.latitude,
              location.longitude,
              b.location.coordinates[1],
              b.location.coordinates[0]
            )
          : 999
        return distA - distB
      }
      return 0
    })

    return result
  }, [restaurants, searchQuery, activeFilter, selectedSort, location])

  // Helper: Cart count
  const cartItemCount = useMemo(() => {
    return (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0)
  }, [cart?.items])

  return (
    <AnimatedPage className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg text-slate-900 dark:text-white">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <span>Self-Pickup / Takeaway</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span className="truncate max-w-[200px] sm:max-w-xs">
                  {location?.address || location?.area || "Near Your Location"}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/cart"
            className="relative p-2.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search Input Bar */}
        <div className="max-w-4xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search takeaway restaurants, dishes, or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Takeaway" },
            { id: "discount", label: "🎁 Extra Discount", icon: Percent },
            { id: "near", label: "📍 Near Me (< 3km)" },
            { id: "fast", label: "⚡ Quick Prep (< 25 min)" },
            { id: "top_rated", label: "⭐ Rating 4.0+" },
            { id: "veg", label: "🌱 Pure Veg" }
          ].map((chip) => {
            const Icon = chip.icon
            const isActive = activeFilter === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{chip.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* Takeaway Perks Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-4 sm:p-5 shadow-lg shadow-amber-500/10"
        >
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
              <Sparkles className="w-3 h-3 text-yellow-200" />
              <span>Smart Self-Pickup</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Skip The Delivery Queue & Save More
            </h2>
            <p className="text-xs sm:text-sm text-amber-50 max-w-lg leading-relaxed">
              Order food in advance, get live ready-for-pickup notifications, and collect directly from the restaurant counter with <strong>₹0 Delivery Fee</strong> and <strong>exclusive takeaway discounts</strong>!
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>₹0 Delivery Fee</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Fresh & Piping Hot</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Zero Waiting Line</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-sm">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            {loading ? "Searching outlets..." : `${filteredRestaurants.length} Outlets Available for Pickup`}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="distance" className="bg-white dark:bg-slate-900">Distance</option>
              <option value="rating" className="bg-white dark:bg-slate-900">Rating</option>
              <option value="prep_time" className="bg-white dark:bg-slate-900">Prep Time</option>
            </select>
          </div>
        </div>

        {/* Restaurant Cards List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">
              No Takeaway Outlets Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              We couldn't find any pickup outlets matching your filters. Try clearing your search or filter options.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setActiveFilter("all")
              }}
              variant="outline"
              className="rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant) => {
              const distanceMeters =
                location?.latitude && location?.longitude && restaurant.location?.coordinates
                  ? calculateDistance(
                      location.latitude,
                      location.longitude,
                      restaurant.location.coordinates[1],
                      restaurant.location.coordinates[0]
                    )
                  : null

              const takeawayDiscount = Number(restaurant.takeawayDiscount || 0)

              return (
                <motion.div
                  key={restaurant._id || restaurant.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-md transition-all rounded-2xl bg-white dark:bg-slate-900 group">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        {/* Restaurant Thumbnail */}
                        <div className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                          <OptimizedImage
                            src={restaurant.profileImage || restaurant.coverImages?.[0]?.url || restaurant.coverImages?.[0] || "/placeholder-restaurant.jpg"}
                            alt={restaurant.restaurantName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Pickup Badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <ShoppingBag className="w-3 h-3 text-amber-400" />
                            <span>Self-Pickup</span>
                          </div>

                          {/* Takeaway Discount Tag */}
                          {takeawayDiscount > 0 && (
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md">
                              <Percent className="w-3 h-3" />
                              <span>{takeawayDiscount}% OFF ON PICKUP</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link
                                  to={`/food/restaurants/${restaurant.slug || restaurant._id}`}
                                  className="font-bold text-base sm:text-lg text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                >
                                  {restaurant.restaurantName}
                                </Link>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                  {Array.isArray(restaurant.cuisines)
                                    ? restaurant.cuisines.join(", ")
                                    : restaurant.cuisines || "Multi-cuisine"}
                                </p>
                              </div>

                              {/* Rating Badge */}
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0 shadow-sm">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{Number(restaurant.rating || 4.2).toFixed(1)}</span>
                              </div>
                            </div>

                            {/* Location & Prep Info */}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                <span>
                                  {restaurant.area || restaurant.location?.area || "Indore"}
                                  {distanceMeters !== null && ` (${formatDistance(distanceMeters)})`}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span>
                                  {restaurant.estimatedDeliveryTimeMinutes || 20} mins prep
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              ⚡ Counter Ready • Zero Delivery Fee
                            </span>

                            <Link
                              to={`/food/restaurants/${restaurant.slug || restaurant._id}?orderType=takeaway`}
                              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-amber-500/20"
                            >
                              <span>Order for Pickup</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Recommended Dishes Horizontal Slider (if available) */}
                      {Array.isArray(restaurant.recommendedItems) && restaurant.recommendedItems.length > 0 && (
                        <div className="px-4 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60">
                          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Popular for Pickup
                          </div>
                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                            {restaurant.recommendedItems.map((item) => (
                              <div
                                key={item._id || item.id}
                                className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 min-w-[200px] max-w-[240px] shrink-0"
                              >
                                {item.image && (
                                  <OptimizedImage
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                    {item.name}
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                    {RUPEE_SYMBOL}{item.price}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    addToCart({
                                      ...item,
                                      restaurantId: restaurant._id,
                                      restaurantName: restaurant.restaurantName,
                                      orderType: "takeaway"
                                    })
                                    toast.success(`Added ${item.name} to pickup cart`)
                                  }}
                                  className="h-7 px-2 text-xs font-bold text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                >
                                  <Plus className="w-3.5 h-3.5 mr-0.5" />
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar (if cart has items) */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40"
          >
            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 dark:border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-300 dark:text-slate-600">
                    {cartItemCount} {cartItemCount === 1 ? "Item" : "Items"} in Cart
                  </div>
                  <div className="font-extrabold text-sm">
                    {RUPEE_SYMBOL}{cart.pricing?.total || cart.total || 0}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/cart")}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-md shadow-amber-500/30"
              >
                <span>Proceed to Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  )
}
