import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Tag, User, Truck, ShoppingBag } from "lucide-react"
import { useAuth } from "@core/context/AuthContext"

export default function BottomNavigation() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const pathname = location.pathname
  const profileSource = new URLSearchParams(location.search).get("from")
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    let initialHeight = window.innerHeight

    const handleResize = () => {
      const currentHeight = window.innerHeight
      if (initialHeight - currentHeight > 150) {
        setIsKeyboardOpen(true)
      } else {
        setIsKeyboardOpen(false)
        if (currentHeight > initialHeight) {
          initialHeight = currentHeight
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check active routes - support both /user/* and /* paths
  const isBakery = pathname.startsWith("/food/user/bakery")
  const isUnder250 = pathname === "/food/under-250" || pathname.startsWith("/food/user/under-250") || pathname === "/food/most-discounted" || pathname.startsWith("/food/user/most-discounted")
  const isSharedFoodProfile =
    (pathname === "/profile" || pathname.startsWith("/profile/")) &&
    profileSource !== "quick"
  const isOrders = pathname.includes("/orders")
  const isProfile =
    !isOrders &&
    (pathname.startsWith("/food/profile") ||
    pathname.startsWith("/food/user/profile") ||
    isSharedFoodProfile)
  const isDelivery =
    !isBakery &&
    !isUnder250 &&
    !isProfile &&
    (pathname === "/food" ||
      pathname === "/food/" ||
      pathname === "/food/user" ||
      (pathname.startsWith("/food/user") &&
        !pathname.includes("/bakery") &&
        !pathname.includes("/under-250") &&
        !pathname.includes("/most-discounted") &&
        !pathname.includes("/profile")))

  if (isKeyboardOpen) return null

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto">
      <div className="relative bg-white/95 backdrop-blur-lg dark:bg-[#141414]/95 border border-slate-200/80 dark:border-white/10 rounded-[26px] shadow-[0_12px_36px_rgba(0,0,0,0.14)] overflow-hidden">
        <div className="flex items-center justify-around h-auto px-1.5 py-1">
          {/* Delivery Tab */}
          <Link
            to="/food/user"
            replace
            className={`group flex flex-1 flex-col items-center gap-1 px-2 py-1.5 transition-all duration-200 relative ${isDelivery
                ? "text-[#0B3122] dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
              }`}
          >
            <Truck className={`h-5 w-5 transition-transform duration-200 ${isDelivery ? "text-[#0B3122] dark:text-emerald-400 fill-[#0B3122] dark:fill-emerald-400 scale-105" : "text-gray-500 dark:text-gray-400 group-hover:text-[#0B3122] dark:group-hover:text-emerald-400"}`} strokeWidth={1.5} />
            <span className={`text-[11px] font-medium ${isDelivery ? "text-[#0B3122] dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
              Delivery
            </span>
            {isDelivery && (
              <div className="absolute top-0 left-3 right-3 h-0.5 bg-[#0B3122] dark:bg-emerald-400 rounded-full" />
            )}
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200/80 dark:bg-gray-800" />

          {/* Most Discounted Tab */}
          <Link
            to="/food/user/most-discounted"
            className={`group flex flex-1 flex-col items-center gap-1 px-2 py-1.5 transition-all duration-200 relative ${isUnder250
                ? "text-[#0B3122] dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
              }`}
          >
            <Tag className={`h-5 w-5 transition-transform duration-200 ${isUnder250 ? "text-[#0B3122] dark:text-emerald-400 fill-[#0B3122] dark:fill-emerald-400 scale-105" : "text-gray-500 dark:text-gray-400 group-hover:text-[#0B3122] dark:group-hover:text-emerald-400"}`} strokeWidth={1.5} />
            <span className={`text-[11px] font-medium ${isUnder250 ? "text-[#0B3122] dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
              Discounts
            </span>
            {isUnder250 && (
              <div className="absolute top-0 left-3 right-3 h-0.5 bg-[#0B3122] dark:bg-emerald-400 rounded-full" />
            )}
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200/80 dark:bg-gray-800" />

          {/* Orders Tab */}
          <Link
            to={isAuthenticated ? "/user/orders" : "/user/auth/login"}
            state={!isAuthenticated ? { redirectTo: "/user/orders" } : undefined}
            className={`group flex flex-1 flex-col items-center gap-1 px-2 py-1.5 transition-all duration-200 relative ${isOrders
                ? "text-[#0B3122] dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
              }`}
          >
            <ShoppingBag className={`h-5 w-5 transition-transform duration-200 ${isOrders ? "text-[#0B3122] dark:text-emerald-400 fill-[#0B3122] dark:fill-emerald-400 scale-105" : "text-gray-500 dark:text-gray-400 group-hover:text-[#0B3122] dark:group-hover:text-emerald-400"}`} strokeWidth={1.5} />
            <span className={`text-[11px] font-medium ${isOrders ? "text-[#0B3122] dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
              Order
            </span>
            {isOrders && (
              <div className="absolute top-0 left-3 right-3 h-0.5 bg-[#0B3122] dark:bg-emerald-400 rounded-full" />
            )}
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200/80 dark:bg-gray-800" />

          {/* Profile Tab */}
          <Link
            to={isAuthenticated ? "/food/user/profile" : "/user/auth/login"}
            state={!isAuthenticated ? { redirectTo: "/food/user/profile" } : undefined}
            className={`group flex flex-1 flex-col items-center gap-1 px-2 py-1.5 transition-all duration-200 relative ${isProfile
                ? "text-[#0B3122] dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400"
              }`}
          >
            <User className={`h-5 w-5 transition-transform duration-200 ${isProfile ? "text-[#0B3122] dark:text-emerald-400 fill-[#0B3122] dark:fill-emerald-400 scale-105" : "text-gray-500 dark:text-gray-400 group-hover:text-[#0B3122] dark:group-hover:text-emerald-400"}`} />
            <span className={`text-[11px] font-medium ${isProfile ? "text-[#0B3122] dark:text-emerald-400 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
              Profile
            </span>
            {isProfile && (
              <div className="absolute top-0 left-3 right-3 h-0.5 bg-[#0B3122] dark:bg-emerald-400 rounded-full" />
            )}
          </Link>
        </div>
      </div>
    </div>
  )
}
