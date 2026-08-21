import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { X, Search, Clock, Loader2, Mic, UtensilsCrossed, Store, Sparkles } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { Input } from "@food/components/ui/input"
import { searchAPI } from "@/services/api"

const SEARCH_HISTORY_KEY = "user_recent_searches_v1"

export default function SearchOverlay({ isOpen, onClose, searchValue, onSearchChange }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [matchingFoods, setMatchingFoods] = useState([])
  const [matchingRestaurants, setMatchingRestaurants] = useState([])
  const [popularRestaurants, setPopularRestaurants] = useState([])
  const [popularFoods, setPopularFoods] = useState([])
  const [recentSuggestions, setRecentSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const trimmed = String(searchValue || "").trim()
  const hasMinThreeChars = trimmed.length >= 3
  const hasOneOrTwoChars = trimmed.length > 0 && trimmed.length < 3

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load initial popular data & history
  useEffect(() => {
    if (!isOpen) return

    const loadRecentSuggestions = () => {
      try {
        const raw = localStorage.getItem(SEARCH_HISTORY_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        if (Array.isArray(parsed)) {
          setRecentSuggestions(parsed.filter((item) => typeof item === "string" && item.trim()).slice(0, 8))
          return
        }
      } catch {}
      setRecentSuggestions([])
    }

    const fetchInitialData = async () => {
      try {
        const res = await searchAPI.unifiedSearch({ q: "" })
        if (res.data?.success && res.data?.data) {
          setPopularRestaurants(res.data.data.restaurants || [])
          setPopularFoods(res.data.data.dishes || [])
        }
      } catch (e) {
        console.error("Failed to load initial search data", e)
      }
    }

    loadRecentSuggestions()
    fetchInitialData()
  }, [isOpen])

  // Live 3-letter recommendation query
  useEffect(() => {
    if (!isOpen) return

    if (!hasMinThreeChars) {
      setMatchingFoods([])
      setMatchingRestaurants([])
      setIsSearching(false)
      return
    }

    let isCancelled = false
    setIsSearching(true)

    const timer = setTimeout(async () => {
      try {
        const res = await searchAPI.unifiedSearch({ q: trimmed })
        if (!isCancelled && res.data?.success && res.data?.data) {
          setMatchingRestaurants(res.data.data.restaurants || [])
          setMatchingFoods(res.data.data.dishes || [])
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Unified search recommendation error:", err)
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false)
        }
      }
    }, 150)

    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [isOpen, trimmed, hasMinThreeChars])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const saveRecentSearch = (term) => {
    const value = String(term || "").trim()
    if (!value) return

    setRecentSuggestions((prev) => {
      const next = [value, ...prev.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 8)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion)
    inputRef.current?.focus()
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (trimmed) {
      saveRecentSearch(trimmed)
      navigate(`/user/search?q=${encodeURIComponent(trimmed)}`)
      onClose()
      onSearchChange("")
    }
  }

  const handleFoodClick = (food) => {
    saveRecentSearch(food.name)
    if (food.restaurantId) {
      navigate(`/user/restaurants/${food.restaurantSlug || food.restaurantId}?dish=${food.id || food._id}`)
    } else {
      navigate(`/user/search?q=${encodeURIComponent(food.name)}`)
    }
    onClose()
    onSearchChange("")
  }

  const handleRestaurantClick = (restaurant) => {
    saveRecentSearch(restaurant.restaurantName || restaurant.name)
    navigate(`/user/restaurants/${restaurant.slug || restaurant._id || restaurant.id}`)
    onClose()
    onSearchChange("")
  }

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (transcript) {
        onSearchChange(transcript)
        saveRecentSearch(transcript)
      }
    }
    recognition.start()
  }

  if (!isOpen) return null

  const displayRestaurants = hasMinThreeChars ? matchingRestaurants : popularRestaurants
  const displayFoods = hasMinThreeChars ? matchingFoods : popularFoods

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-[#0a0a0a] animate-in fade-in duration-200">
      {/* Header with Search Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-[#141414] border-b border-gray-100 dark:border-white/10 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 sm:py-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <Input
                ref={inputRef}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search restaurants or dishes (e.g. Masala Papad, Aetmad)..."
                className="pl-12 pr-12 h-12 w-full bg-gray-50 dark:bg-[#1f1f1f] border-gray-200 dark:border-white/10 focus:border-[#a81e29] dark:focus:border-[#a81e29] rounded-2xl text-base dark:text-white placeholder:text-gray-400 font-medium"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                  isListening ? "text-[#a81e29] scale-110 animate-pulse" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Button>
          </form>

          {/* 3-letter threshold helper badge */}
          {hasOneOrTwoChars && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-200/80 dark:border-amber-800/40">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Type at least <strong>3 letters</strong> to see instant recommendations for restaurants & dishes</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full px-4 py-6 scrollbar-hide">
        {/* Recent Searches */}
        {!hasMinThreeChars && recentSuggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#a81e29]" />
              Recent Searches
            </h3>
            <div className="flex gap-2 flex-wrap">
              {recentSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200/80 dark:border-zinc-800 text-gray-700 dark:text-gray-300 text-xs font-medium transition-all"
                >
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Searching indicator */}
        {isSearching && (
          <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-[#a81e29]" />
            <span>Finding matching restaurants and dishes...</span>
          </div>
        )}

        {/* Recommended Restaurants Section */}
        {displayRestaurants.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-[#a81e29]" />
                {hasMinThreeChars ? `Matching Restaurants (${displayRestaurants.length})` : "Popular Restaurants"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayRestaurants.map((restaurant) => {
                const restName = restaurant.restaurantName || restaurant.name
                const restImage = restaurant.profileImage || restaurant.image || restaurant.logo || (Array.isArray(restaurant.images) && restaurant.images[0])
                const restCuisine = Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(", ") : (restaurant.cuisines || restaurant.cuisine || "Multi-cuisine")
                const restRating = restaurant.rating || 4.5
                const restDelivery = restaurant.estimatedDeliveryTimeMinutes ? `${restaurant.estimatedDeliveryTimeMinutes} mins` : (restaurant.deliveryTime || "25-30 mins")

                return (
                  <div
                    key={restaurant._id || restaurant.id}
                    onClick={() => handleRestaurantClick(restaurant)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#141414] shadow-xs hover:shadow-md hover:border-[#a81e29]/40 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0">
                      {restImage ? (
                        <img src={restImage} alt={restName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 bg-gray-100">
                          {restName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-[#a81e29] transition-colors">
                        {restName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {restCuisine}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">★ {restRating}</span>
                        <span>•</span>
                        <span>{restDelivery}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recommended Dishes Section */}
        {displayFoods.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#a81e29]" />
                {hasMinThreeChars ? `Matching Food Items & Dishes (${displayFoods.length})` : "Popular Dishes"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayFoods.map((food) => {
                const foodImage = food.image
                const isVeg = food.foodType === "Veg" || food.isVeg

                return (
                  <div
                    key={food._id || food.id}
                    onClick={() => handleFoodClick(food)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#141414] shadow-xs hover:shadow-md hover:border-[#a81e29]/40 transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0 relative border border-gray-100 dark:border-white/5">
                      {foodImage ? (
                        <img src={foodImage} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <UtensilsCrossed className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute top-1 left-1">
                        <div className={`w-3.5 h-3.5 border ${isVeg ? 'border-green-600 bg-white' : 'border-red-600 bg-white'} p-[1px] rounded-xs flex items-center justify-center shadow-xs`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-[#a81e29] transition-colors">
                        {food.name}
                      </h4>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {food.restaurantName ? `from ${food.restaurantName}` : (food.description || "Freshly prepared")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-black text-sm text-gray-900 dark:text-white">₹{Number(food.price || 0).toFixed(2)}</span>
                        {food.rating && (
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            ★ {food.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No results state for >= 3 chars */}
        {hasMinThreeChars && !isSearching && displayRestaurants.length === 0 && displayFoods.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              No results found for "{trimmed}"
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Try searching for dishes like Masala Papad, Burger, Pizza, Biryani, or restaurant names like Aetmad Foods.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
