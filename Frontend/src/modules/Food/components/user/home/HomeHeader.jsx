import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation as useRouterLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  Navigation,
  ChevronDown,
  Search,
  Mic,
  Bookmark,
  Wallet,
  Bell,
  BellOff,
  X,
  ShoppingCart,
  Pizza,
  Beef,
  ChefHat,
  Soup,
  Coffee,
  Milk,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@food/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@food/components/ui/popover";
import { Badge } from "@food/components/ui/badge";
import foodPattern from "@food/assets/food_pattern_background.png";
import useNotificationInbox from "@food/hooks/useNotificationInbox";
import { optimizeCloudinaryVideoUrl } from "@shared/utils/cloudinaryUtils";

const tabs = [
  {
    id: "food",
    name: "AETMADFOOD",
    icon: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
  },
  {
    id: "quick",
    name: "AETMADMART",
    icon: "https://cdn-icons-png.flaticon.com/512/3724/3724720.png",
    badge: "15 mins",
  },
];

const normalizeHex = (hex, fallback = "#8e24aa") => {
  const value = String(hex || "").trim();
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
};

const withAlpha = (color, alpha) => {
  if (!color) return `rgba(0, 0, 0, ${alpha})`;
  if (color.startsWith('var(')) {
    return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
  }
  const value = normalizeHex(color).slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const quickTheme = (baseColor, secondaryColor) => {
  const base = normalizeHex(baseColor, "#2f7a46");
  const secondary = secondaryColor ? normalizeHex(secondaryColor) : `color-mix(in srgb, ${base} 70%, black)`;
  return {
    topBg: `linear-gradient(180deg, ${secondary} 0%, ${base} 100%)`,
    accent: base,
    text: "#ffffff",
    activeBg: base,
    activeText: "#ffffff",
    inactiveBg: "rgba(0,0,0,0.3)",
    inactiveBorder: "rgba(255,255,255,0.08)",
  };
};

const foodTheme = (vegMode) => {
  const base = vegMode ? "#2f7a46" : "var(--primary-theme, #f97316)";
  return {
    topBg: vegMode
      ? `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%), ${base}`
      : `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 100%), ${base}`,
    accent: base,
    text: "#ffffff",
    activeBg: base,
    activeText: "#ffffff",
    inactiveBg: "rgba(0,0,0,0.25)",
    inactiveBorder: "rgba(255,255,255,0.08)",
  };
};


const isMeaningfulLocationValue = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return Boolean(
    normalized &&
    normalized !== "select location" &&
    normalized !== "current location"
  );
};

const buildLocationDisplay = (savedAddressText, location) => {
  if (isMeaningfulLocationValue(savedAddressText)) {
    const parts = String(savedAddressText)
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 3) {
      return {
        title: parts.slice(0, 2).join(", "),
        subtitle: parts.slice(2).join(", "),
      };
    }

    if (parts.length === 2) {
      return {
        title: parts.join(", "),
        subtitle: "Tap to choose delivery location",
      };
    }

    return {
      title: String(savedAddressText).trim(),
      subtitle: "Tap to choose delivery location",
    };
  }

  const fallbackTitle =
    location?.area || location?.city || "Select Location";
  const fallbackSubtitle =
    location?.address || location?.city || "Tap to choose delivery location";

  return {
    title: fallbackTitle,
    subtitle: fallbackSubtitle,
  };
};

export default function HomeHeader({
  activeTab,
  setActiveTab,
  location,
  savedAddressText,

  handleLocationClick,
  handleSearchFocus,
  placeholderIndex,
  placeholders,
  vegMode = false,
  onVegModeChange,
  headerVideoUrl,
  quickThemeColor,
  quickSecondaryThemeColor,
  onQuickTabIntent,
  bannerComponent,
  exploreMoreComponent,
  hideExtras = false,
}) {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const routerLocation = useRouterLocation();
  const videoRef = useRef(null);
  const { scrollY } = useScroll();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      if (latest > 120 && !isSticky) setIsSticky(true);
      else if (latest <= 120 && isSticky) setIsSticky(false);
    });
  }, [scrollY, isSticky]);

  const [notifications, setNotifications] = useState(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("food_user_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const {
    items: broadcastNotifications,
    unreadCount: broadcastUnreadCount,
    dismiss: dismissBroadcastNotification,
  } = useNotificationInbox("user", { limit: 20 });

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem("food_user_notifications");
      setNotifications(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener("notificationsUpdated", sync);
    return () => window.removeEventListener("notificationsUpdated", sync);
  }, []);

  const theme = useMemo(() => {
    if (activeTab === "quick") return quickTheme(quickThemeColor, quickSecondaryThemeColor);
    return foodTheme(vegMode);
  }, [activeTab, quickThemeColor, quickSecondaryThemeColor, vegMode]);
  const isFood = activeTab === "food";
  const walletPath = isFood ? "/food/user/wallet" : "/quick/wallet";
  const { title: locationTitle, subtitle: locationSubtitle } = useMemo(
    () => buildLocationDisplay(savedAddressText, location),
    [savedAddressText, location],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isFood) {
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => { });
      }
      return;
    }

    video.pause();
  }, [isFood]);

  const mergedNotifications = useMemo(() => {
    const localItems = Array.isArray(notifications)
      ? notifications.map((item) => ({ ...item, source: "local" }))
      : [];
    const remoteItems = (broadcastNotifications || []).map((item) => ({
      ...item,
      id: item.id || item._id,
      source: "broadcast",
      time: item.createdAt
        ? new Date(item.createdAt).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        : "Just now",
    }));
    return [...remoteItems, ...localItems].sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp || 0).getTime() -
        new Date(a.createdAt || a.timestamp || 0).getTime(),
    );
  }, [broadcastNotifications, notifications]);

  const unreadCount =
    notifications.filter((item) => !item.read).length + broadcastUnreadCount;

  const removeNotification = (id, source) => {
    if (source === "broadcast") {
      dismissBroadcastNotification(id);
      return;
    }
    setNotifications((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem("food_user_notifications", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("notificationsUpdated"));
      return next;
    });
  };

  const handleVoiceSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        if (activeTab === "quick") {
          navigate("/quick/search", { state: { query: transcript } });
        } else {
          // For food search, we might need to trigger the overlay or redirect to a dedicated search page
          // Based on Home.jsx, it opens an overlay. But we can redirect to the search page if available.
          navigate("/food/user/search", { state: { query: transcript } });
        }
      }
    };
    recognition.start();
  };

  return (
    <div className="w-full bg-white relative">
      <div className="w-full bg-[#0B3122] px-4 pb-4 relative">
        <div className="flex items-center justify-between pt-4 mb-3 relative z-10">
          <button
            type="button"
            className="flex items-start gap-2 cursor-pointer flex-1 min-w-0 bg-transparent border-0 p-0 text-left outline-none"
            onClick={handleLocationClick}
          >
            <>
              <Navigation
                className="h-[14px] w-[14px] rotate-[15deg] mt-[5px] shrink-0 text-[#D4AF37] fill-[#D4AF37]"
                strokeWidth={2.5}
              />
              <div className="flex min-w-0 max-w-[190px] flex-col">
                <div className="flex items-center gap-[3px]">
                  <span className="truncate text-[16px] font-serif font-bold tracking-wide text-white drop-shadow-sm">
                    {locationTitle}
                  </span>
                  <ChevronDown className="h-[14px] w-[14px] shrink-0 text-white opacity-80" strokeWidth={3} />
                </div>
                <span className="max-w-[190px] truncate text-[11px] font-light tracking-wide text-white/80">
                  {locationSubtitle}
                </span>
              </div>
            </>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {!hideExtras && (
              <>
                <Link
                  to={walletPath}
                  className="h-[38px] w-[38px] rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 flex items-center justify-center shadow-md transition-all hover:bg-white/20"
                  aria-label="Open wallet"
                >
                  <Wallet className="h-[19px] w-[19px] text-white/90" strokeWidth={1.5} />
                </Link>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="relative h-[38px] w-[38px] rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 flex items-center justify-center shadow-md transition-all hover:bg-white/20"
                    >
                      <Bell className="h-[18px] w-[18px] text-white/90" strokeWidth={1.5} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[#D4AF37] border border-[#0B3122] shadow-sm" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 overflow-hidden border-none shadow-2xl rounded-2xl mt-2" align="end">
                    <div className="bg-white">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          Notifications
                          {unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-600 border-none text-[10px] h-4">
                              {unreadCount} New
                            </Badge>
                          )}
                        </h3>
                        <Link to="/food/user/notifications" className="text-xs font-bold text-red-600">
                          {mergedNotifications.length > 0 ? "View All" : ""}
                        </Link>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {mergedNotifications.length > 0 ? (
                          mergedNotifications.slice(0, 5).map((item, index) => (
                            <div key={item.id || `notif-${index}`} className="p-4 flex items-start gap-3 border-b border-gray-50 last:border-0">
                              <div className="mt-1 p-2 rounded-full bg-red-100/50 text-red-600">
                                <Bell className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className="text-sm font-bold text-gray-900 truncate">{item.title}</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.time}</span>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        removeNotification(item.id, item.source);
                                      }}
                                      className="rounded-full p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.message}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center flex flex-col items-center gap-2">
                            <BellOff className="h-10 w-10 text-gray-200" />
                            <p className="text-xs text-gray-400 font-medium">All caught up!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Link
                  to="/food/user/cart"
                  className="h-[38px] w-[38px] rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 flex items-center justify-center shadow-md transition-all hover:bg-white/20"
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-[20px] w-[20px] text-white/90" strokeWidth={1.5} />
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="w-full mb-4">
          <div className="flex items-center gap-2">
            <div
              className="flex-1 rounded-full h-[44px] flex items-center px-4 cursor-pointer relative overflow-hidden bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-gray-100/50 text-left transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
              onClick={handleSearchFocus}
            >
              <Search className="h-[22px] w-[22px] mr-2 flex-shrink-0 text-[#9CA3AF]" strokeWidth={2} />
              <div className="flex-1 overflow-hidden relative h-[22px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 whitespace-nowrap leading-[22px] text-[14px] font-light tracking-wide text-gray-500"
                  >
                    {placeholders?.[placeholderIndex] || "Search for Food or Restaurants"}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-[1px] h-[16px] bg-gray-200" />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={cn(
                    "h-[28px] w-[28px] rounded-full flex items-center justify-center transition-all",
                    isListening ? "bg-red-500 scale-110 animate-pulse" : "hover:bg-gray-100"
                  )}
                >
                  <Mic className={cn("h-[16px] w-[16px]", isListening ? "text-white" : "text-[#9CA3AF]")} strokeWidth={2.3} />
                </button>
              </div>
            </div>

            {!hideExtras && (
              <div className="px-2 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center mb-0.5">
                  <span className="text-[9px] font-bold tracking-[1px] text-[#D4AF37] leading-none drop-shadow-sm">VEG</span>
                  <span className="text-[7px] font-black tracking-[0.5px] text-white/90 leading-none mt-0.5 drop-shadow-sm">MODE</span>
                </div>
                <div className="scale-[0.80] origin-top">
                  <Switch
                    checked={vegMode}
                    onCheckedChange={(checked) => onVegModeChange?.(checked)}
                    className="data-[state=checked]:bg-[#D4AF37] data-[state=unchecked]:bg-white/20 border border-white/10 shadow-inner"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {exploreMoreComponent && (
          <div className="w-full mb-0">
            {exploreMoreComponent}
          </div>
        )}
      </div>

      {/* TABS CONTAINER */}
      <div className="flex w-full h-[48px] relative z-20 -mt-6 bg-[#F5E6EA] shadow-[inset_0px_3px_5px_rgba(0,0,0,0.03)] border-b border-[#EED8DE]">
        {/* Left Tab: Superfast Food (Active Dropdown) */}
        <div className="w-[50%] h-[48px] bg-[#0B3122] rounded-b-2xl flex items-center justify-center shadow-md relative z-10 -mt-[1px]">
          <span className="text-white text-[12px] font-extrabold uppercase tracking-widest drop-shadow-sm">Aetmad Food</span>
        </div>

        {/* Right Tab: Superfast Mart */}
        <button 
          onClick={() => {
            if (onQuickTabIntent) onQuickTabIntent();
            setActiveTab("quick");
          }}
          className="w-[50%] h-full flex items-center justify-center bg-[#F5E6EA] text-gray-600 font-bold text-[12px] uppercase tracking-widest cursor-pointer hover:bg-[#EED8DE] hover:text-gray-800 transition-all relative z-0"
        >
          Aetmad Mart
        </button>
      </div>

      <div className="px-4 pt-4 pb-1">
        <div className="relative w-full h-[120px] bg-gradient-to-br from-[#0B3122] via-[#072417] to-black rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden flex flex-row border border-[#D4AF37]/20">
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-2 border-[#D4AF37]/40 shadow-[0_8px_20px_rgba(0,0,0,0.4)] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" alt="burger" className="w-full h-full object-cover" />
          </div>
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-2 border-[#D4AF37]/40 shadow-[0_8px_20px_rgba(0,0,0,0.4)] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80" alt="pizza" className="w-full h-full object-cover" />
          </div>
          
          <div className="z-10 flex flex-col items-center justify-center w-full text-center mt-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider text-[#D4AF37]/80 uppercase">UPTO</span>
              <div className="bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] text-white rounded-full w-[44px] h-[44px] flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(212,175,55,0.3)] border border-[#F3E5AB]/40">
                <span className="text-[18px] font-black leading-none">60%</span>
              </div>
              <span className="text-[10px] font-bold tracking-wider text-[#D4AF37]/80 uppercase">OFF</span>
            </div>
            <h3 className="text-[28px] font-serif font-black text-white leading-none tracking-tight mb-1 mt-1 drop-shadow-md">Food</h3>
            <p className="text-white/70 text-[10px] font-light tracking-wide">Order your favorite meals online and easy</p>
          </div>
        </div>
      </div>

      {bannerComponent && (
        <div className="relative z-10 w-full pb-0 pt-0">
          {bannerComponent}
        </div>
      )}
    </div>
  );
}
