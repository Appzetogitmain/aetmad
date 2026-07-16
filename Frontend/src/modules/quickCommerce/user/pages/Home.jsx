import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  ChevronDown,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Heart,
  Snowflake,
  Dog,
} from "lucide-react";

// MUI Icons (shared with admin & icon selector)
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
import AppleIcon from "@mui/icons-material/Apple";
import EggIcon from "@mui/icons-material/Egg";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import CookieIcon from "@mui/icons-material/Cookie";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import AcUnitIcon from "@mui/icons-material/AcUnit";

import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowRightIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VerifiedIcon from "@mui/icons-material/Verified";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SavingsIcon from "@mui/icons-material/Savings";

import { getIconSvg } from "@/shared/constants/categoryIcons";
import { motion, useScroll, useTransform } from "framer-motion";
import { customerApi } from "../services/customerApi";
import { adminAPI } from "@food/api";
import { normalizeImageUrl } from "@food/utils/imageUtils";
import { toast } from "sonner";
import ProductCard from "../components/shared/ProductCard";
import MainLocationHeader from "../components/shared/MainLocationHeader";
import MiniCart from "../components/shared/MiniCart";
import ProductDetailSheet from "../components/shared/ProductDetailSheet";
import Footer from "../components/layout/Footer";
import BottomNav from "../components/layout/BottomNav";
import MobileFooterMessage from "../components/layout/MobileFooterMessage";
import { useProductDetail } from "../context/ProductDetailContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@food/components/ui/skeleton";
import CardBanner from "@/assets/CardBanner.webp";
import SectionRenderer from "../components/experience/SectionRenderer";
import ExperienceBannerCarousel from "../components/experience/ExperienceBannerCarousel";
import { useLocation } from "../context/LocationContext";
import { resolveQuickImageUrl } from "../utils/image";
import { getCloudinarySrcSet } from "@/shared/utils/cloudinaryUtils";
import { useQuickHomeData } from "../hooks/useQuickHomeData";
import {
  getSideImageByKey,
  getBackgroundColorByValue,
  getBackgroundGradientByValue,
} from "@/shared/constants/offerSectionOptions";
import {
  getQuickCartPath,
  getQuickCategoriesPath,
  getQuickCategoryPath,
} from "../utils/routes";

const DEFAULT_CATEGORY_THEME = {
  gradient: "linear-gradient(to bottom, #F7C332, #F7E08F)",
  shadow: "shadow-yellow-500/20",
  accent: "text-[#1A1A1A]",
};

const CATEGORY_METADATA = {
  All: {
    icon: HomeIcon,
    theme: DEFAULT_CATEGORY_THEME,
    banner: {
      title: "HOUSEFULL",
      subtitle: "SALE",
      floatingElements: "sparkles",
    },
  },
  Grocery: {
    icon: LocalGroceryStoreIcon,
    theme: {
      gradient: "linear-gradient(to bottom, var(--primary-theme, #cc2532), #ff5252)",
      shadow: "shadow-red-500/20",
      accent: "text-red-900",
    },
    banner: {
      title: "SUPERSAVER",
      subtitle: "FRESH & FAST",
      floatingElements: "leaves",
    },
  },
  Wedding: {
    icon: CardGiftcardIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #FF4D6D, #FF8FA3)",
      shadow: "shadow-rose-500/20",
      accent: "text-rose-900",
    },
    banner: { title: "WEDDING", subtitle: "BLISS", floatingElements: "hearts" },
  },
  "Home & Kitchen": {
    icon: KitchenIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #BC6C25, #DDA15E)",
      shadow: "shadow-amber-500/20",
      accent: "text-amber-900",
    },
    banner: { title: "HOME", subtitle: "KITCHEN", floatingElements: "smoke" },
  },
  Electronics: {
    icon: DevicesIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #7209B7, #B5179E)",
      shadow: "shadow-purple-500/20",
      accent: "text-purple-900",
    },
    banner: {
      title: "TECH FEST",
      subtitle: "GADGETS",
      floatingElements: "tech",
    },
  },
  Kids: {
    icon: ChildCareIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #4CC9F0, #A0E7E5)",
      shadow: "shadow-blue-500/20",
      accent: "text-blue-900",
    },
    banner: {
      title: "LITTLE ONE",
      subtitle: "CARE",
      floatingElements: "bubbles",
    },
  },
  "Pet Supplies": {
    icon: PetsIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #FB8500, #FFB703)",
      shadow: "shadow-yellow-500/20",
      accent: "text-yellow-900",
    },
    banner: { title: "PAWSOME", subtitle: "DEALS", floatingElements: "bones" },
  },
  Sports: {
    icon: SportsSoccerIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #4361EE, #4895EF)",
      shadow: "shadow-indigo-500/20",
      accent: "text-indigo-900",
    },
    banner: { title: "SPORTS", subtitle: "GEAR", floatingElements: "confetti" },
  },
  "Fruits & Vegetables": {
    icon: AppleIcon,
    theme: { gradient: "linear-gradient(to bottom, #4CAF50, #81C784)", shadow: "shadow-green-500/20", accent: "text-green-900" },
    banner: { title: "FRESH", subtitle: "VEGGIES & FRUITS", floatingElements: "leaves" },
  },
  "Dairy, Bread & Eggs": {
    icon: EggIcon,
    theme: { gradient: "linear-gradient(to bottom, #FFD54F, #FFE082)", shadow: "shadow-yellow-500/20", accent: "text-yellow-900" },
    banner: { title: "DAIRY FRESH", subtitle: "BREAD & EGGS", floatingElements: "bubbles" },
  },
  "Cold Drinks & Juices": {
    icon: LocalDrinkIcon,
    theme: { gradient: "linear-gradient(to bottom, #29B6F6, #4FC3F7)", shadow: "shadow-blue-500/20", accent: "text-blue-900" },
    banner: { title: "CHILLED", subtitle: "DRINKS & JUICES", floatingElements: "bubbles" },
  },
  "Snacks & Munchies": {
    icon: FastfoodIcon,
    theme: { gradient: "linear-gradient(to bottom, #FF7043, #FF8A65)", shadow: "shadow-[var(--primary-theme)]/20", accent: "text-orange-900" },
    banner: { title: "SNACKS", subtitle: "MUNCHIES TIME", floatingElements: "sparkles" },
  },
  "Bakery & Biscuits": {
    icon: CookieIcon,
    theme: { gradient: "linear-gradient(to bottom, #8D6E63, #A1887F)", shadow: "shadow-brown-500/20", accent: "text-amber-950" },
    banner: { title: "BAKERY", subtitle: "BISCUITS & MORE", floatingElements: "smoke" },
  },
  "Instant & Frozen Food": {
    icon: AcUnitIcon,
    theme: { gradient: "linear-gradient(to bottom, #26C6DA, #4DD0E1)", shadow: "shadow-cyan-500/20", accent: "text-cyan-900" },
    banner: { title: "INSTANT", subtitle: "FROZEN FOODS", floatingElements: "tech" },
  },
};

const ALL_CATEGORY = {
  id: "all",
  _id: "all",
  name: "All",
  icon: HomeIcon,
  theme: DEFAULT_CATEGORY_THEME,
  headerColor: "#800020",
  banner: {
    title: "HOUSEFULL",
    subtitle: "SALE",
    floatingElements: "sparkles",
    textColor: "text-black",
  },
};

const categories = [
  {
    id: 1,
    name: "All",
    icon: HomeIcon,
    theme: DEFAULT_CATEGORY_THEME,
    banner: {
      title: "HOUSEFULL",
      subtitle: "SALE",
      floatingElements: "sparkles",
      textColor: "text-black",
    },
  },
  {
    id: 5,
    name: "Electronics",
    icon: DevicesIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #7209B7, #B5179E)",
      shadow: "shadow-purple-500/20",
      accent: "text-purple-900",
    },
    banner: {
      title: "TECH FEST",
      subtitle: "GADGETS",
      floatingElements: "tech",
      textColor: "text-white",
    },
  },
  {
    id: 2,
    name: "Grocery",
    icon: LocalGroceryStoreIcon,
    theme: {
      gradient: "linear-gradient(to bottom, var(--primary-theme, #cc2532), #ff5252)",
      shadow: "shadow-red-500/20",
      accent: "text-red-900",
    },
    banner: {
      title: "SUPERSAVER",
      subtitle: "FRESH & FAST",
      floatingElements: "leaves",
      textColor: "text-white",
    },
  },
  {
    id: 10,
    name: "Home & Kitchen",
    icon: KitchenIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #BC6C25, #DDA15E)",
      shadow: "shadow-amber-500/20",
      accent: "text-amber-900",
    },
    banner: {
      title: "HOME",
      subtitle: "KITCHEN",
      floatingElements: "smoke",
      textColor: "text-white",
    },
  },
  {
    id: 7,
    name: "Kids",
    icon: ChildCareIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #4CC9F0, #A0E7E5)",
      shadow: "shadow-blue-500/20",
      accent: "text-blue-900",
    },
    banner: {
      title: "LITTLE ONE",
      subtitle: "CARE",
      floatingElements: "bubbles",
      textColor: "text-white",
    },
  },
  {
    id: 8,
    name: "Pet Supplies",
    icon: PetsIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #FB8500, #FFB703)",
      shadow: "shadow-yellow-500/20",
      accent: "text-yellow-900",
    },
    banner: {
      title: "PAWSOME",
      subtitle: "DEALS",
      floatingElements: "bones",
      textColor: "text-white",
    },
  },
  {
    id: 11,
    name: "Sports",
    icon: SportsSoccerIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #4361EE, #4895EF)",
      shadow: "shadow-indigo-500/20",
      accent: "text-indigo-900",
    },
    banner: {
      title: "SPORTS",
      subtitle: "GEAR",
      floatingElements: "confetti",
      textColor: "text-white",
    },
  },
  {
    id: 3,
    name: "Wedding",
    icon: CardGiftcardIcon,
    theme: {
      gradient: "linear-gradient(to bottom, #FF4D6D, #FF8FA3)",
      shadow: "shadow-rose-500/20",
      accent: "text-rose-900",
    },
    banner: {
      title: "WEDDING",
      subtitle: "BLISS",
      floatingElements: "hearts",
      textColor: "text-white",
    },
  },
];

// Map icon ids saved from admin/category icon selector to MUI icons
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
  art: ColorLensIcon,
  grocery: LocalGroceryStoreIcon,
};

const bestsellerCategories = [
  {
    id: 1,
    name: "Chips & Namkeen",
    images: [
      "",
      "",
      "",
      "",
    ],
  },
  {
    id: 2,
    name: "Bakery & Biscuits",
    images: [
      "",
      "",
      "",
      "",
    ],
  },
  {
    id: 3,
    name: "Vegetable & Fruits",
    images: [
      "",
      "",
      "",
      "",
    ],
  },
  {
    id: 4,
    name: "Oil, Ghee & Masala",
    images: [
      "",
      "",
      "",
      "",
    ],
  },
  {
    id: 5,
    name: "Sweet & Chocolates",
    images: [
      "",
      "",
      "",
      "",
    ],
  },
  {
    id: 6,
    name: "Drinks & Juices",
    images: [
      "",
      "",
      "",
      "",
    ],
  },
];

const MARQUEE_MESSAGES = [
  "24/7 Delivery",
  "Minimum Order ₹99",
  "Save Big on Essentials!",
];

const QUICK_THEME_STORAGE_KEY = "food.quick.headerColor";
const QUICK_HEADER_RETURN_STORAGE_KEY = "food.quick.headerReturn";

const quickCategoryPalettes = [
  { bgFrom: "#ffd96a", bgVia: "#ffeaa0", bgTo: "#fff0c7", glowColor: "rgba(255,184,0,0.18)", frameColor: "#f0d98a" },
  { bgFrom: "#9fe88c", bgVia: "#c3f1b2", bgTo: "#e4f8da", glowColor: "rgba(126,220,141,0.18)", frameColor: "#bfe3b7" },
  { bgFrom: "#f3a25d", bgVia: "#f9c48b", bgTo: "#fee0bf", glowColor: "rgba(255,139,61,0.16)", frameColor: "#efc08e" },
  { bgFrom: "#b8eff0", bgVia: "#d5f7f5", bgTo: "#edfdfc", glowColor: "rgba(122,215,215,0.16)", frameColor: "#b9e5e3" },
];

const getQuickCategoryImage = (category = {}) => {
  const candidate =
    category?.image ||
    category?.icon ||
    category?.thumbnail ||
    category?.imageUrl ||
    category?.iconUrl ||
    category?.media?.image ||
    category?.media?.url ||
    "";

  return (
    resolveQuickImageUrl(candidate) ||
    "https://cdn-icons-png.flaticon.com/128/2321/2321831.png"
  );
};

function QuickHomeLoadingState({ embedded }) {
  return (
    <div className={cn("pb-8", embedded ? "pt-0" : "pt-4 md:pt-6")}>
      <div className="block md:hidden">
        <Skeleton className="h-[190px] w-full rounded-none" />
      </div>

      <div className="px-4 py-4 md:px-8 lg:px-[50px]">
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex min-w-[84px] flex-col items-center gap-2 md:min-w-[112px]">
              <Skeleton className="h-[96px] w-[84px] rounded-[22px] md:h-[126px] md:w-[112px]" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 md:px-8 lg:px-[50px]">
        <div className="rounded-[28px] border border-[#0c831f]/10 bg-white/80 dark:bg-card/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-8 w-52 rounded-full" />
            </div>
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>

          <div className="flex gap-3 overflow-hidden md:gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="w-[140px] shrink-0 space-y-3">
                <Skeleton className="h-[132px] w-full rounded-[20px]" />
                <Skeleton className="h-3 w-5/6 rounded-full" />
                <Skeleton className="h-3 w-2/3 rounded-full" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const Home = ({ embedded = false, onThemeChange, embeddedHeaderColor = null }) => {
  const { scrollY } = useScroll();
  const { isOpen: isProductDetailOpen } = useProductDetail();
  const { currentLocation } = useLocation();
  const navigate = useNavigate();
  const routePathname = typeof window !== "undefined" ? window.location.pathname : "";
  const quickCatsRef = useRef(null);
  const [foodCategories, setFoodCategories] = useState([]);
  
  useEffect(() => {
    adminAPI.getPublicCategories().then(res => {
      const list = res?.data?.data?.categories || res?.data?.categories || [];
      const transformed = list.map((cat, idx) => ({
        id: String(cat?.id || cat?._id || cat?.slug || idx),
        name: cat?.name || "",
        slug: cat?.slug || String(cat?.name || "").toLowerCase().replace(/\s+/g, "-"),
        image: cat?.image || cat?.imageUrl || ""
      }));
      setFoodCategories(transformed);
    }).catch(err => console.error(err));
  }, []);

  // --- Core Data Hook (Optimized & Cached) ---
  const {
    categories,
    activeCategory,
    setActiveCategory,
    products,
    categoryProducts,
    quickCategories,
    experienceSections,
    offerSections,
    categoryMap,
    subcategoryMap,
    headerSections,
    heroConfig,
    isLoading,
    isBootstrapped
  } = useQuickHomeData({ currentLocation });

  const [mobileBannerIndex, setMobileBannerIndex] = useState(0);
  const [isInstantBannerJump, setIsInstantBannerJump] = useState(false);
  const [pendingReturn, setPendingReturn] = useState(null);

  useLayoutEffect(() => {
    if (!embedded || typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [embedded, routePathname]);

  const scrollQuickCats = (direction) => {
    if (quickCatsRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      quickCatsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (typeof onThemeChange !== "function") return;
    const resolvedColor = activeCategory?.headerColor || ALL_CATEGORY.headerColor;
    if (typeof window !== "undefined" && resolvedColor) {
      window.sessionStorage.setItem(QUICK_THEME_STORAGE_KEY, resolvedColor);
    }
    onThemeChange({
      name: activeCategory?.name || ALL_CATEGORY.name,
      color: resolvedColor,
    });
  }, [activeCategory, onThemeChange]);

  const isInitialPageLoading = !isBootstrapped;
  const hasHeroBanners = (heroConfig?.banners?.items || []).length > 0;
  const isBannersLoading = isLoading && !hasHeroBanners;
  const shouldShowHeroFallback = !isInitialPageLoading && !isLoading && !hasHeroBanners;
  const isProductsLoading = isLoading && products.length === 0;

  // Autoplay for Mobile Banner Carousel
  useEffect(() => {
    const totalSlides = 3;
    const intervalId = setInterval(() => {
      setMobileBannerIndex((prev) => (prev >= totalSlides - 1 ? prev : prev + 1));
    }, 3500);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isInstantBannerJump) return;
    const id = requestAnimationFrame(() => setIsInstantBannerJump(false));
    return () => cancelAnimationFrame(id);
  }, [isInstantBannerJump]);

  const handleBannerTransitionEnd = () => {
    const totalSlides = 3;
    if (mobileBannerIndex === totalSlides - 1) {
      setIsInstantBannerJump(true);
      setMobileBannerIndex(0);
    }
  };

  const bestsellerCategories = useMemo(() => {
    const grouped = {};
    products.forEach((p) => {
      const catId = p.categoryId?._id || "other";
      const catName = p.categoryId?.name || "Other";
      if (!grouped[catId]) grouped[catId] = { id: catId, name: catName, images: [] };
      if (grouped[catId].images.length < 4) grouped[catId].images.push(p.image);
    });
    return Object.values(grouped).slice(0, 6);
  }, [products]);

  const productsById = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p._id || p.id] = p; });
    return map;
  }, [products]);

  const effectiveQuickCategories = useMemo(() => {
    const ids = heroConfig.categoryIds || [];
    if (ids.length > 0) {
      const resolved = ids.map((id) => categoryMap[id]).filter(Boolean).map((c) => ({
        id: c._id, name: c.name, image: getQuickCategoryImage(c),
      }));
      if (resolved.length > 0) return resolved;
    }
    return quickCategories;
  }, [heroConfig.categoryIds, categoryMap, quickCategories]);

  // Filter products by active header category
  // Prefer server-fetched categoryProducts when a specific category is active
  const filteredProducts = useMemo(() => {
    const activeCatId = activeCategory?._id || activeCategory?.id;
    if (!activeCatId || activeCatId === "all") return products;

    // Use server-fetched category products if available
    if (categoryProducts !== null) return categoryProducts;

    // Fallback: client-side filter by categoryId parentId
    return products.filter((p) => {
      const productCatId = p.categoryId?._id || p.categoryId || p.category?._id || p.category;
      if (!productCatId) return false;
      const cat = categoryMap[String(productCatId)];
      if (!cat) return false;
      const parentHeaderId = cat.parentId || cat.headerId || cat.parent?._id || cat.header?._id;
      return String(parentHeaderId) === String(activeCatId) || String(productCatId) === String(activeCatId);
    });
  }, [products, categoryProducts, activeCategory, categoryMap]);

  const sectionsForRenderer = (activeCategory && activeCategory._id !== "all") ? headerSections : experienceSections;

  const opacity = useTransform(scrollY, [0, 300], [1, 0.6]);
  const y = useTransform(scrollY, [0, 300], [0, 80]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const pointerEvents = useTransform(scrollY, [0, 100], ["auto", "none"]);

  useEffect(() => {
    if (!pendingReturn?.sectionId) return;
    const allSections = sectionsForRenderer;
    if (!allSections.length) return;
    if (!allSections.some((s) => s._id === pendingReturn.sectionId)) return;

    const el = document.getElementById(`section-${pendingReturn.sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "instant", block: "start" });
      window.sessionStorage.removeItem("experienceReturn");
      setPendingReturn(null);
    }
  }, [sectionsForRenderer, pendingReturn]);

  const renderFloatingElements = (type) => {
    const count = 10;
    const getParticleContent = (index) => {
      switch (type) {
        case "hearts": return <Heart fill="white" size={12 + (index % 5) * 2} className="drop-shadow-sm" />;
        case "snow": return <Snowflake fill="white" size={10 + (index % 4) * 3} className="drop-shadow-sm" />;
        case "stars":
        case "sparkles": return <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="drop-shadow-md"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>;
        default: return <div className="bg-white/40 rounded-full blur-[1px]" style={{ width: 4 + (index % 3) * 3, height: 4 + (index % 3) * 3 }} />;
      }
    };

    return [...Array(count)].map((_, i) => {
      const duration = 15 + Math.random() * 20;
      const delay = Math.random() * -20;
      const depth = 0.5 + Math.random() * 0.5;
      return (
        <motion.div
          key={i} className="absolute pointer-events-none"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.1 * depth, zIndex: Math.floor(depth * 10) }}
          animate={{ x: [0, 50, -50, 0], y: [0, -100, -50, 0], rotate: [0, 360], scale: [depth, depth * 1.2, depth] }}
          transition={{ duration: duration / depth, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <div className="transform-gpu">{getParticleContent(i)}</div>
        </motion.div>
      );
    });
  };

  return (
    <div
      className={cn(
        "bg-[#F5F7F8] dark:bg-background",
        embedded ? "min-h-0 bg-white dark:bg-card pt-0" : "min-h-screen pt-[176px] md:pt-[210px]",
      )}>
      {/* Top Dynamic Gradient Section */}
      <div
        className={cn("contents", isProductDetailOpen && "hidden md:contents")}>
        <MainLocationHeader
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
          embedded={embedded}
          embeddedHeaderColor={embeddedHeaderColor}
          forceHeaderColor={activeCategory?.headerColor || "#800020"}
          showTopContent={!embedded}
          showSearchBar={!embedded}
        />
      </div>

      {isInitialPageLoading ? (
        <QuickHomeLoadingState embedded={embedded} />
      ) : (
        <div className={cn("pt-0", embedded && "pt-0")}>
          {/* Custom Screenshot-matching UI */}
          <div className="w-full bg-white relative">
                       {/* Extended Dynamic Background for Banner */}
            <div className="w-full px-4 pb-4 relative pt-4" style={{ backgroundColor: activeCategory?.headerColor || "#800020" }}>
              {/* Banner Card */}
              <div className="relative w-full h-[120px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-row border border-white/60">
                {/* Decorative elements */}
                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] opacity-90">
                  <img src="https://freepngimg.com/thumb/vegetable/24647-6-vegetable-transparent-background.png" alt="veg" className="w-full h-full object-contain -rotate-12 drop-shadow-sm" />
                </div>
                <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] opacity-90">
                  <img src="https://freepngimg.com/thumb/vegetable/24546-3-vegetable-photos.png" alt="veg" className="w-full h-full object-contain rotate-12 drop-shadow-sm" />
                </div>
                
                {/* Banner Content */}
                <div className="z-10 flex flex-col items-center justify-center w-full text-center mt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-500">UPTO</span>
                    <div className="bg-[#FF5722] text-white rounded-full w-[44px] h-[44px] flex flex-col items-center justify-center shadow-md">
                      <span className="text-[18px] font-black leading-none">50%</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">OFF</span>
                  </div>
                  <h3 className="text-[28px] font-black text-black leading-none tracking-tight font-serif mb-1 mt-1 drop-shadow-sm">Grocery</h3>
                  <p className="text-[10px] font-bold tracking-tight" style={{ color: activeCategory?.headerColor || "#800020" }}>Order your groceries online and easy</p>
                </div>
              </div>
            </div>

            {/* Seamless Tabs Row */}
            <div className="flex w-full h-[40px] relative z-20 mb-0 bg-[#F8F9FA] shadow-[inset_0px_3px_5px_rgba(0,0,0,0.03)] border-b border-gray-200">
              {/* Left Tab: Superfast Food */}
              <button 
                onClick={() => window.location.href = "/food"}
                className="w-[50%] h-full flex items-center justify-center text-center text-[10px] font-extrabold text-gray-500 uppercase tracking-tight cursor-pointer hover:text-[#800020] active:scale-95 transition-all"
                style={{ "--hover-color": activeCategory?.headerColor || "#800020" }}
                onMouseEnter={(e) => e.target.style.color = e.target.style.getPropertyValue('--hover-color')}
                onMouseLeave={(e) => e.target.style.color = ""}
              >
                Aetmad Food
              </button>

              {/* Right Tab: Superfast Mart (Active Dropdown) */}
              <div className="absolute top-0 right-0 w-[50%] h-[40px] rounded-bl-[20px] rounded-br-[20px] flex items-center justify-center shadow-[0_6px_12px_rgba(128,0,32,0.25)] border-t-0 border border-black/10" style={{ backgroundColor: activeCategory?.headerColor || "#800020" }}>
                <span className="text-white text-[10px] font-extrabold uppercase tracking-tight">Aetmad Mart</span>
              </div>
            </div>

                        {/* Dynamic Categories Section */}
            <div className="bg-[#Fcfcf9] rounded-[24px] p-4 mb-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-[#F0F5EC]">
              <div className="flex justify-between items-start mb-4 px-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-[1000] uppercase tracking-wider" style={{ color: activeCategory?.headerColor || "#800020" }}>EXPLORE</span>
                  <h4 className="text-[17px] font-[1000] text-slate-900 leading-tight tracking-tight">What's on your mind?</h4>
                  <p className="text-[9px] text-slate-500 font-bold max-w-[200px] leading-tight">Fresh groceries, snacks, household items and more</p>
                </div>
                <ChevronDown className="-rotate-90 opacity-60 w-5 h-5 mt-3" style={{ color: activeCategory?.headerColor || "#800020" }} />
              </div>
              
              {foodCategories?.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0 bg-white rounded-xl overflow-hidden border border-gray-100">
                  {foodCategories.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      onClick={() => { window.location.href = `/food/user/category/${item.slug || item.id}` }}
                      className="flex flex-col items-center justify-center p-3 border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group"
                    >
                      <img 
                        src={item.image || "https://cdn-icons-png.flaticon.com/128/6024/6024564.png"} 
                        alt={item.name} 
                        className="w-[46px] h-[46px] object-contain mb-2.5 drop-shadow-sm group-hover:scale-110 transition-transform" 
                      />
                      <span className="text-[9px] font-bold text-slate-700 text-center leading-tight tracking-tight group-hover:text-black">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-gray-500 py-4">No categories found</div>
              )}
            </div>

                      </div>
          {/* Lowest Price ever Section  (kept as static for now) */}
          <div
            className={cn(
              "mb-4 md:mb-6",
              embedded ? "mt-4 md:mt-5" : "mt-6 md:mt-10",
            )}>
            <div className="relative overflow-hidden bg-[#e7f3ff] dark:bg-[#1a2c41] pt-6 md:pt-8 pb-0 rounded-none md:rounded-[32px] mx-0 md:mx-8 lg:mx-[50px] shadow-sm">
              <div className="relative z-10 px-4 md:px-8">
                <div className="flex justify-between items-center mb-3 md:mb-5 px-1">
                  <div className="flex flex-col">
                    <h3 className="text-lg md:text-3xl font-[1000] text-[#004b91] dark:text-[#60a5fa] tracking-tighter uppercase leading-none">
                      Lowest Price <span className="text-[#004b91] dark:text-[#60a5fa]">ever</span>
                    </h3>
                    <div className="flex items-center gap-1.5 md:gap-2 mt-1 md:mt-2">
                      <div className="h-1 w-1 md:h-1.5 md:w-1.5 bg-[#004b91] dark:bg-[#60a5fa] rounded-full animate-pulse" />
                      <span className="text-[9px] md:text-[10px] font-black text-[#004b91] dark:text-[#93c5fd] uppercase tracking-wider opacity-80">
                        Unbeatable Savings • Updated hourly
                      </span>
                    </div>
                  </div>
                  <motion.div
                    onClick={() => navigate(getQuickCategoriesPath())}
                    whileHover={{ x: 5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 md:gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-[#004b91] dark:text-[#93c5fd] font-bold text-[9px] md:text-xs cursor-pointer shadow-sm border border-[#004b91]/5 transition-all shrink-0 whitespace-nowrap">
                    See all{" "}
                    <ArrowRightIcon
                      sx={{ fontSize: 10, ml: 0.5 }}
                    />
                  </motion.div>
                </div>

                <div className="relative z-10 flex overflow-x-auto gap-3 md:gap-4 pb-5 md:pb-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scroll-smooth">
                  {isProductsLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="w-[125px] md:w-[155px] lg:w-[175px] h-[220px] shrink-0 bg-white dark:bg-slate-800/60 rounded-[20px] animate-pulse border border-blue-50/50" />
                    ))
                  ) : filteredProducts.slice(0, 12).map((product) => (
                    <div
                      key={product.id || product._id}
                      className="w-[125px] md:w-[155px] lg:w-[175px] shrink-0 snap-start">
                      <ProductCard
                        product={product}
                        className="bg-white rounded-[20px] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] border-blue-50/50 transition-all"
                        compact={true}
                        curvedInfo={true}
                      />
                    </div>
                  ))}
                  {filteredProducts.length === 0 && !isLoading && (
                    <div className="w-full py-10 md:py-20 text-center text-slate-400 font-black italic md:text-xl">
                      {activeCategory && activeCategory._id !== "all"
                        ? `No products found in ${activeCategory.name}`
                        : "Curating the best deals for you..."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Offer Sections (admin-configured: Trending, etc.) – show on Home so user sees them */}
          {offerSections.length > 0 && (
            <div className="w-full px-0 pt-0 pb-2 md:pb-4">
              {[...offerSections]
                .filter(section => {
                  if ((section.title || '').trim().toLowerCase() === 'best sellers') return false;
                  // If a specific category is active, only show sections that match it
                  const activeCatId = activeCategory?._id || activeCategory?.id;
                  if (!activeCatId || activeCatId === "all") return true;
                  const sectionCatIds = (section.categoryIds || []).map(c =>
                    typeof c === "object" ? String(c._id || c.id || "") : String(c)
                  );
                  if (sectionCatIds.length === 0) return true; // no category filter = show always
                  return sectionCatIds.some(id => {
                    if (id === String(activeCatId)) return true;
                    const cat = categoryMap[id];
                    const parentHeaderId = cat?.parentId || cat?.headerId || cat?.parent?._id || cat?.header?._id;
                    return String(parentHeaderId) === String(activeCatId);
                  });
                })
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((section) => {
                  const bgColor = getBackgroundColorByValue(
                    section.backgroundColor,
                  );
                  const sectionProducts = (section.productIds || [])
                    .filter((p) => typeof p === "object" && p !== null)
                    .map((p) => ({
                      id: p._id,
                      _id: p._id,
                      name: p.name,
                      image: resolveQuickImageUrl(p.mainImage || p.image || ""),
                      price:
                        Number(p.salePrice || 0) > 0
                          ? Number(p.salePrice)
                          : Number(p.price || 0),
                      originalPrice: Number(
                        p.originalPrice || p.mrp || p.price || p.salePrice || 0,
                      ),
                      weight: p.weight,
                      deliveryTime: p.deliveryTime,
                    }));
                  return (
                    <motion.div
                      key={section._id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        "mb-4 rounded-none overflow-hidden shadow-[0_10px_25px_rgba(15,23,42,0.1)] border-y border-slate-100/70 dark:border-neutral-800 border-x-0 md:border-x",
                        section.title?.toLowerCase().includes('masala') ? "bg-[#FFF9E7] dark:bg-[#2a261a]" : "bg-white dark:bg-neutral-900"
                      )}>
                      <div
                        className="relative flex items-center justify-between px-5 md:px-8 py-5 md:py-6 text-black dark:text-white"
                        style={{
                          backgroundColor: bgColor,
                          backgroundImage: getBackgroundGradientByValue(
                            section.backgroundColor,
                          ),
                        }}>
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                          <div className="absolute -top-10 -left-10 w-40 h-40 md:w-56 md:h-56 bg-white/20 rounded-full blur-3xl" />
                          <div className="absolute -bottom-10 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
                        </div>
                        <div className="flex-1 pr-4">
                          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-black/60 dark:text-white/60 mb-1">
                            Trending right now
                          </p>
                          <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight drop-shadow-sm">
                            {section.title}
                          </h3>
                          {((section.categoryIds || [])
                            .map((c) =>
                              typeof c === "object" && c?.name ? c.name : null,
                            )
                            .filter(Boolean)
                            .join(", ") ||
                            section.categoryId?.name) && (
                              <p className="text-xs md:text-sm font-semibold text-black/75 dark:text-white/75 mt-1">
                                {(section.categoryIds || [])
                                  .map((c) =>
                                    typeof c === "object" && c?.name ? c.name : null,
                                  )
                                  .filter(Boolean)
                                  .join(", ") || section.categoryId?.name}
                              </p>
                            )}
                        </div>
                        <motion.div
                          whileHover={{ y: -4, rotate: -4, scale: 1.06 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                          }}
                          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex-shrink-0 shadow-[0_16px_30px_rgba(0,0,0,0.25)] border border-black/10 overflow-hidden relative bg-black/10">
                          {/* Product-driven visual if available */}
                          {sectionProducts[0]?.image ? (
                            <>
                              <img
                                src={sectionProducts[0].image}
                                srcSet={getCloudinarySrcSet(sectionProducts[0].image)}
                                sizes="100px"
                                alt={section.title}
                                className="absolute inset-0 w-full h-full object-cover scale-110"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
                              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-amber-400/60 blur-xl mix-blend-screen" />
                            </>
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-red-500 to-rose-500" />
                          )}

                          {/* Top-left pill with items count */}
                          {sectionProducts.length > 0 && (
                            <div className="absolute top-1 left-1 px-2 py-0.5 rounded-full bg-black/70 text-[9px] font-bold text-white/90 tracking-wide flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {sectionProducts.length} items
                            </div>
                          )}

                          <div className="relative z-10 flex items-center justify-center h-full">
                            <Sparkles
                              className="text-amber-200 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                              size={30}
                            />
                          </div>
                        </motion.div>
                      </div>
                      <div className="p-4 md:p-5">
                        <div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 no-scrollbar snap-x snap-mandatory">
                          {sectionProducts.length === 0 ? (
                            <div className="w-full py-6 text-center text-slate-400 text-sm font-bold">
                              No products in this section yet.
                            </div>
                          ) : (
                            sectionProducts.map((product) => (
                              <div
                                key={product.id}
                                className="w-[130px] md:w-[160px] lg:w-[180px] flex-shrink-0 snap-start">
                                <ProductCard
                                  product={product}
                                  className="border border-slate-100 dark:border-white/5 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                                  compact
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {/* Main Content Area – show admin-configured sections (hero/categories already shown above are skipped) */}
          {sectionsForRenderer.length > 0 && (
            <div
              className={cn(
                "container mx-auto px-4 md:px-8 lg:px-[50px] bg-[#F0F9FF] dark:bg-slate-900 rounded-none pt-4 pb-10 mt-[-28px] mb-10 relative z-[1] border-x-2 border-b-2 border-sky-200/50 dark:border-sky-900/50 shadow-sm overflow-hidden",
              )}>
              {/* Animated Top Border Glow */}
              <motion.div
                animate={{
                  x: ["-100%", "100%"],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-sky-400/80 to-transparent"
              />

              <SectionRenderer
                sections={sectionsForRenderer}
                productsById={productsById}
                categoriesById={categoryMap}
                subcategoriesById={subcategoryMap}
              />
            </div>
          )}

          {embedded && (
            <>
              <div className="hidden md:block">
                <Footer />
              </div>
              <div className="md:hidden">
                <MobileFooterMessage />
                <BottomNav />
              </div>
            </>
          )}

          {embedded && (
            <>
              <MiniCart
                linkTo={getQuickCartPath(routePathname)}
              />
              <ProductDetailSheet />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
