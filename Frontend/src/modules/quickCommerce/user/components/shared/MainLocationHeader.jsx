import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useLocation as useRouterLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Lottie from "lottie-react";
import LocationDrawer from "./LocationDrawer";
import { useLocation } from "../../context/LocationContext";
import { useProductDetail } from "../../context/ProductDetailContext";
import { useCart } from "../../context/CartContext";
import { useSettings } from "@core/context/SettingsContext";
import { cn } from "@/lib/utils";
import {
  buildHeaderGradient,
  buildMiniCartColor,
  buildSearchBarBackgroundColor,
  shiftHex,
} from "../../utils/headerTheme";
import {
  getQuickCartPath,
  getQuickHomePath,
  getQuickSearchPath,
  getQuickWishlistPath,
} from "../../utils/routes";
import LogoImage from "@/assets/zozomenLogo.png";
import shoppingCartAnimation from "@/assets/lottie/shopping-cart.json";
import { Sparkles } from "lucide-react";
import { customerApi } from "../../services/customerApi";
import ThemeToggle from "../layout/ThemeToggle";

// MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import DevicesIcon from "@mui/icons-material/Devices";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import KitchenIcon from "@mui/icons-material/Kitchen";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import PetsIcon from "@mui/icons-material/Pets";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SpaIcon from "@mui/icons-material/Spa";
import ToysIcon from "@mui/icons-material/Toys";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import YardIcon from "@mui/icons-material/Yard";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import DiamondIcon from "@mui/icons-material/Diamond";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import BuildIcon from "@mui/icons-material/Build";
import LuggageIcon from "@mui/icons-material/Luggage";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import ChevronDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

const ICON_COMPONENTS = {
  electronics: DevicesIcon,
  fashion: CheckroomIcon,
  home: HomeIcon,
  food: LocalCafeIcon,
  sports: SportsSoccerIcon,
  books: MenuBookIcon,
  beauty: SpaIcon,
  toys: ToysIcon,
  automotive: DirectionsCarIcon,
  pets: PetsIcon,
  health: LocalHospitalIcon,
  garden: YardIcon,
  office: BusinessCenterIcon,
  music: MusicNoteIcon,
  jewelry: DiamondIcon,
  baby: ChildCareIcon,
  tools: BuildIcon,
  luggage: LuggageIcon,
  grocery: LocalGroceryStoreIcon,
};

const serviceTabs = [
  { name: "Superfast FoodWala" },
  { name: "SuperfastMart" },
];

const isMeaningfulLocationValue = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return Boolean(
    normalized &&
    normalized !== "select location" &&
    normalized !== "current location"
  );
};

const buildLocationDisplay = (addressText, currentLocation) => {
  if (isMeaningfulLocationValue(addressText)) {
    const parts = String(addressText)
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
      title: String(addressText).trim(),
      subtitle: "Tap to choose delivery location",
    };
  }

  const fallbackTitle = currentLocation?.city || "Select Location";
  const fallbackSubtitle = currentLocation?.name || "Tap to choose delivery location";

  return {
    title: fallbackTitle,
    subtitle: fallbackSubtitle,
  };
};

const lightenHex = (hex, amount = 0.18) => {
  const normalized = String(hex || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return hex;

  const clamp = (value) => Math.max(0, Math.min(255, value));
  const toHex = (value) => clamp(value).toString(16).padStart(2, "0");
  const mix = (channel) => Math.round(channel + (255 - channel) * amount);

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
};

/** Full-width bottom stroke + tab curve; l/r are 0–100% of column where the inner bump sits. */
function buildActiveTabPath(l, r) {
  const y = 20;
  const mapX = (x) => l + ((x - 1.5) / (98.5 - 1.5)) * (r - l);
  return `M 0 ${y} L ${l} ${y} L ${l} 12 C ${mapX(2.6)} 7 ${mapX(8.2)} 1.55 ${mapX(15)} 1.55 L ${mapX(85)} 1.55 C ${mapX(91.8)} 1.55 ${mapX(97.4)} 7 ${mapX(98.5)} 12 V ${y} L 100 ${y}`;
}

function CategoryNavColumn({
  cat,
  isActive,
  categoryAccent,
  onCategorySelect,
}) {
  const iconColor = "#ffffff";
  const colRef = useRef(null);
  const labelRef = useRef(null);
  const [lr, setLr] = useState({ l: 22, r: 78 });

  const measure = () => {
    if (!isActive || !colRef.current || !labelRef.current) return;
    const col = colRef.current.getBoundingClientRect();
    const lab = labelRef.current.getBoundingClientRect();
    if (col.width < 4) return;
    const pad = 5;
    const l = Math.max(0, ((lab.left - col.left - pad) / col.width) * 100);
    const r = Math.min(100, ((lab.right - col.left + pad) / col.width) * 100);
    if (r - l > 6) setLr({ l, r });
  };

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (colRef.current) ro.observe(colRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isActive, cat.name]);

  const pathD = isActive ? buildActiveTabPath(lr.l, lr.r) : "";

  return (
    <motion.div
      ref={colRef}
      layout
      whileTap={{ scale: 0.96 }}
      transition={{
        layout: { type: "spring", stiffness: 520, damping: 38, mass: 0.55 },
      }}
      onClick={() => onCategorySelect && onCategorySelect(cat)}
      style={{
        borderBottomColor: isActive ? "transparent" : categoryAccent,
      }}
      className="relative z-[2] flex min-w-[48px] shrink-0 cursor-pointer flex-col items-center gap-0.5 border-b-2 px-2 pb-0.5 pt-0.5 snap-start md:min-w-[58px]">
      <div className="relative z-10 flex h-9 w-9 items-center justify-center md:h-11 md:w-11">
        {typeof cat.icon === "function" ||
          (typeof cat.icon === "object" && cat.icon.$$typeof) ? (
          <cat.icon
            sx={{
              fontSize: { xs: 20, md: 24 },
              color: iconColor,
              opacity: isActive ? 1 : 0.92,
              transition: "opacity 0.2s, transform 0.2s",
            }}
          />
        ) : (
          <img
            src={cat.icon}
            alt={cat.name}
            className="h-4 w-4 object-contain md:h-5 md:w-5"
            style={{ opacity: isActive ? 1 : 0.92 }}
          />
        )}
      </div>
      <div className="relative mt-px w-full">
        <span
          ref={labelRef}
          className={cn(
            "relative z-10 mx-auto block max-w-[72px] truncate px-1 pb-1 text-center text-[9px] uppercase tracking-tight md:max-w-[88px] md:text-[11px]",
            isActive ? "font-black" : "font-semibold",
          )}
          style={{
            color: "#ffffff",
            opacity: isActive ? 1 : 0.94,
          }}>
          {cat.name}
        </span>
      </div>
      {isActive && (
        <motion.svg
          layoutId="active-category-curve"
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[6] h-[22px] w-full overflow-visible"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          shapeRendering="geometricPrecision"
          transition={{
            layout: { type: "spring", stiffness: 560, damping: 40, mass: 0.5 },
          }}>
          <path
            d={pathD}
            fill="none"
            stroke={categoryAccent}
            strokeWidth="2"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}
    </motion.div>
  );
}

const MainLocationHeader = ({
  categories: externalCategories = [],
  activeCategory,
  onCategorySelect,
  embedded = false,
  embeddedHeaderColor = null,
  forceHeaderColor = null,
  showTopContent = true,
  showSearchBar = true,
  showCategories = true,
  showLocation = true,
}) => {
  const { scrollY } = useScroll();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const { currentLocation, refreshLocation, isFetchingLocation } =
    useLocation();
  const { isOpen: isProductDetailOpen } = useProductDetail();
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const appName = settings?.appName || "SuperfastMart";
  const logoUrl = settings?.logoUrl || LogoImage;
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const cartPath = getQuickCartPath(routerLocation.pathname);
  const homePath = getQuickHomePath(routerLocation.pathname);
  const searchPath = getQuickSearchPath(routerLocation.pathname);
  const wishlistPath = getQuickWishlistPath();

  const { title: locationTitle, subtitle: locationSubtitle } = React.useMemo(
    () => buildLocationDisplay(currentLocation.name, currentLocation),
    [currentLocation],
  );

  const [internalCategories, setInternalCategories] = useState([]);

  useEffect(() => {
    // Only fetch if showCategories is true and no external categories provided
    if (showCategories && externalCategories.length === 0) {
      customerApi.getCategories().then((res) => {
        if (res.data.success) {
          const dbCats = res.data.results || res.data.result || [];
          const headers = dbCats
            .filter((cat) => cat.type === "header")
            .map((cat) => ({
              ...cat,
              id: cat._id,
              icon: (cat.iconId && ICON_COMPONENTS[cat.iconId]) || Sparkles,
            }));
          setInternalCategories(headers);
        }
      });
    }
  }, [showCategories, externalCategories.length]);

  const categories = (externalCategories.length > 0 ? externalCategories : internalCategories)
    .filter(cat => !serviceTabs.some(tab => tab.name.toLowerCase() === cat.name?.toLowerCase()));

  // Search Logic
  const handleSearchClick = () => {
    navigate(searchPath);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      navigate(searchPath, { state: { query: e.target.value } });
    }
  };

  // Search placeholder animation
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search ");
  const [typingState, setTypingState] = useState({
    textIndex: 0,
    charIndex: 0,
    isDeleting: false,
    isPaused: false,
  });

  const staticText = "Search ";
  const typingPhrases = [
    '"bread"',
    '"milk"',
    '"chocolate"',
    '"eggs"',
    '"chips"',
  ];

  useEffect(() => {
    const { textIndex, charIndex, isDeleting, isPaused } = typingState;
    const currentPhrase = typingPhrases[textIndex];

    if (isPaused) {
      const timeout = setTimeout(() => {
        setTypingState((prev) => ({
          ...prev,
          isPaused: false,
          isDeleting: true,
        }));
      }, 2000); // Pause after full phrase
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (charIndex < currentPhrase.length) {
            setSearchPlaceholder(
              staticText + currentPhrase.substring(0, charIndex + 1),
            );
            setTypingState((prev) => ({
              ...prev,
              charIndex: prev.charIndex + 1,
            }));
          } else {
            // Finished typing
            setTypingState((prev) => ({ ...prev, isPaused: true }));
          }
        } else {
          // Deleting
          if (charIndex > 0) {
            setSearchPlaceholder(
              staticText + currentPhrase.substring(0, charIndex - 1),
            );
            setTypingState((prev) => ({
              ...prev,
              charIndex: prev.charIndex - 1,
            }));
          } else {
            // Finished deleting
            setTypingState((prev) => ({
              ...prev,
              isDeleting: false,
              textIndex: (prev.textIndex + 1) % typingPhrases.length,
            }));
          }
        }
      },
      isDeleting ? 50 : 100,
    ); // 50ms deleting speed, 100ms typing speed

    return () => clearTimeout(timeout);
  }, [typingState]);

  // Smooth scroll interpolations.
  // In embedded mode this header lives inside the main food page, so collapsing
  // it on page scroll causes the category rail to "compact" or glitch.
  const rawHeaderTopPadding = useTransform(scrollY, [0, 160], [16, 12]);
  const rawHeaderBottomPadding = useTransform(scrollY, [0, 160], [4, 3]);
  const rawHeaderRoundness = useTransform(scrollY, [0, 160], [0, 24]);
  const rawBgOpacity = useTransform(scrollY, [0, 160], [1, 0.98]);

  // Content animations
  const rawContentHeight = useTransform(scrollY, [0, 160], ["64px", "0px"]);
  const rawContentOpacity = useTransform(scrollY, [0, 160], [1, 0]);
  const rawNavHeight = useTransform(scrollY, [0, 200], ["60px", "56px"]);
  const rawNavOpacity = useTransform(scrollY, [0, 200], [1, 1]);
  const rawNavMargin = useTransform(scrollY, [0, 200], [4, 2]);
  const rawCategorySpacing = useTransform(scrollY, [0, 200], [3, 1]);
  const rawCartOpacity = useTransform(scrollY, [0, 110, 150], [1, 0.7, 0]);
  const rawCartScale = useTransform(scrollY, [0, 110, 150], [1, 0.9, 0.75]);

  const rawDisplayContent = useTransform(scrollY, (value) =>
    value > 160 ? "none" : "block",
  );
  const rawDisplayNav = useTransform(scrollY, () => "flex");
  const rawDisplayCart = useTransform(scrollY, (value) =>
    value > 150 ? "none" : "block",
  );

  const headerTopPadding = embedded ? 16 : rawHeaderTopPadding;
  const headerBottomPadding = embedded ? 4 : rawHeaderBottomPadding;
  const headerRoundness = embedded ? 0 : rawHeaderRoundness;
  const bgOpacity = embedded ? 1 : rawBgOpacity;
  const contentHeight = embedded ? "64px" : rawContentHeight;
  const contentOpacity = embedded ? 1 : rawContentOpacity;
  const navHeight = embedded ? "60px" : rawNavHeight;
  const navOpacity = embedded ? 1 : rawNavOpacity;
  const navMargin = embedded ? 0 : rawNavMargin;
  const categorySpacing = embedded ? -2 : rawCategorySpacing;
  const cartOpacity = embedded ? 1 : rawCartOpacity;
  const cartScale = embedded ? 1 : rawCartScale;
  const displayContent = embedded ? "block" : rawDisplayContent;
  const displayNav = embedded ? "flex" : rawDisplayNav;
  const baseHeaderColor =
    forceHeaderColor || (embedded && embeddedHeaderColor) || activeCategory?.headerColor || null;
  const headerGradient = forceHeaderColor
    ? forceHeaderColor
    : baseHeaderColor
      ? embedded
        ? `linear-gradient(180deg, ${baseHeaderColor} 0%, ${lightenHex(baseHeaderColor, 0.2)} 100%)`
        : buildHeaderGradient(baseHeaderColor)
    : "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
  const searchBarBg = buildSearchBarBackgroundColor(baseHeaderColor || "#1e293b");
  const categoryAccent = "#ffffff";

  useEffect(() => {
    const c = buildMiniCartColor(baseHeaderColor || "#1e293b");
    document.documentElement.style.setProperty("--customer-mini-cart-color", c);
    return () => {
      document.documentElement.style.removeProperty(
        "--customer-mini-cart-color",
      );
    };
  }, [baseHeaderColor]);

  return (
    <>
      <div
        className={cn(
          embedded
            ? "sticky top-0 z-40"
            : "fixed top-0 left-0 right-0 z-[200]",
          isProductDetailOpen && "hidden md:block"
        )}>
        <div
          className={cn(
            "px-4 pt-4 pb-4 transition-all duration-300",
            embedded
              ? "shadow-none"
              : "shadow-sm"
          )}
          style={{ background: headerGradient }}
        >
          
          {/* Header Top Row: Menu + Location + Basket */}
          <div className="flex items-center justify-between mb-4 mt-1">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Location */}
              <button
                type="button"
                onClick={() => setIsLocationOpen(true)}
                className="flex flex-col text-left text-white overflow-hidden flex-1 active:scale-95 transition-transform"
              >
                <span className="text-[11px] font-medium text-white/90">
                  Delivery Location
                </span>
                <div className="flex items-center gap-1 w-full mt-0.5">
                  <span className="text-[14px] font-bold truncate">
                    {locationTitle}
                  </span>
                  <ChevronDownIcon sx={{ fontSize: 16, color: "#ffffff", opacity: 0.9 }} />
                </div>
                {locationSubtitle && locationSubtitle !== "Tap to choose delivery location" && (
                  <span className="text-[10px] font-medium text-white/80 truncate w-full">
                    {locationSubtitle}
                  </span>
                )}
              </button>
            </div>

            {/* Header Action Icons: Notification, Wallet, Cart */}
            <div className="flex items-center gap-3 shrink-0 -mt-2">
              {/* Notification */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/notifications")}
                className="text-white relative shrink-0"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </motion.button>
              
              {/* Wallet */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate("/quick/wallet")}
                className="text-white relative shrink-0"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
                </svg>
              </motion.button>

              {/* Shopping Basket */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(cartPath)}
                className="text-white relative shrink-0"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full">
            <motion.div
              onClick={handleSearchClick}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full h-[44px] flex items-center bg-white cursor-pointer px-4 shadow-sm"
            >
              <SearchIcon sx={{ color: "#9CA3AF", fontSize: 22 }} />
              <input
                type="text"
                placeholder="Search for Product"
                readOnly
                className="flex-1 min-w-0 bg-transparent border-none outline-none pl-2 text-slate-700 font-medium placeholder:text-slate-400 text-[14px] cursor-pointer"
              />
            </motion.div>
          </div>

        </div>
      </div>

      <LocationDrawer
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />
    </>
  );
};

export default MainLocationHeader;
