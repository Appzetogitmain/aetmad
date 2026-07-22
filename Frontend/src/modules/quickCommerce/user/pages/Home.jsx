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
import ExploreMoreSection from "@food/components/user/home/ExploreMoreSection";
import MainLocationHeader from "../components/shared/MainLocationHeader";
import MiniCart from "../components/shared/MiniCart";
import ProductDetailSheet from "../components/shared/ProductDetailSheet";
import Footer from "../components/layout/Footer";
import BottomNav from "../components/layout/BottomNav";

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
  getQuickSearchPath,
  getQuickWishlistPath,
} from "../utils/routes";
import BannerSection from "@food/components/user/home/BannerSection";

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
  headerColor: "#B80B3D",
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
  const [heroBannerIndex, setHeroBannerIndex] = useState(0);
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
          forceHeaderColor={activeCategory?.headerColor || "#B80B3D"}
          showTopContent={!embedded}
          showSearchBar={!embedded}
        />
      </div>

      {isInitialPageLoading ? (
        <QuickHomeLoadingState embedded={embedded} />
      ) : (
        <div className={cn("pt-0", embedded && "pt-0")}>
          {/* Custom Screenshot-matching UI */}
          <div className="w-full relative" style={{ backgroundColor: activeCategory?.headerColor || "#B80B3D" }}>
            {/* Hero Video Banner and Explore More Items */}

            <React.Suspense fallback={null}>
              <ExploreMoreSection
                exploreMoreHeading="Explore More"
                showExploreSkeleton={false}
                finalExploreItems={[
                  { id: '1', label: 'Offers', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80', href: '#' },
                  { id: '2', label: 'Gourmet', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80', href: '#' },
                  { id: '3', label: 'Collections', image: 'https://images.unsplash.com/photo-1573246123716-1b5020bc8b35?w=200&q=80', href: '#' }
                ]}
              />
            </React.Suspense>

            {/* TABS CONTAINER */}
            <div className="flex w-full h-[48px] relative z-20 bg-[#F5E6EA] shadow-[inset_0px_3px_5px_rgba(0,0,0,0.03)] border-b border-[#EED8DE]">
              {/* Left Tab: Aetmad Food (Inactive) */}
              <button 
                onClick={() => window.location.href = "/food"}
                className="w-[50%] h-[48px] flex items-center justify-center bg-transparent text-gray-600 font-bold text-[12px] uppercase tracking-widest transition-all cursor-pointer hover:bg-[#EED8DE] hover:text-gray-800 relative z-0"
              >
                Aetmad Food
              </button>

              {/* Right Tab: Aetmad Mart (Active Dropdown) */}
              <div 
                className="w-[50%] h-[48px] rounded-b-2xl flex items-center justify-center shadow-md relative z-10" 
                style={{ backgroundColor: activeCategory?.headerColor || "#B80B3D" }}
              >
                <span className="text-white text-[12px] font-extrabold uppercase tracking-widest drop-shadow-sm">Aetmad Mart</span>
              </div>
            </div>
          </div>

          {/* UPTO 60% OFF Mart Banner (matching the food page static banner layout) */}
          <div className="px-4 pt-4 pb-1">
            <div className="relative w-full h-[120px] bg-gradient-to-br from-[#0B3122] via-[#072417] to-black rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden flex flex-row border border-[#D4AF37]/20">
              <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-2 border-[#D4AF37]/40 shadow-[0_8px_20px_rgba(0,0,0,0.4)] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" alt="groceries" className="w-full h-full object-cover" />
              </div>
              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-2 border-[#D4AF37]/40 shadow-[0_8px_20px_rgba(0,0,0,0.4)] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573246123716-1b5020bc8b35?w=400&q=80" alt="fresh items" className="w-full h-full object-cover" />
              </div>
              
              <div className="z-10 flex flex-col items-center justify-center w-full text-center mt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#D4AF37] font-bold text-[10px] tracking-widest uppercase">UPTO</span>
                  <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11] flex flex-col items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/20">
                    <span className="text-[#0B3122] font-black text-[16px] leading-none -mb-0.5">60%</span>
                  </div>
                  <span className="text-[#D4AF37] font-bold text-[10px] tracking-widest uppercase">OFF</span>
                </div>
                
                <h2 className="text-[28px] font-['Playfair_Display',serif] font-black tracking-tight text-white leading-none mb-1 shadow-black drop-shadow-md">
                  Mart
                </h2>
                <p className="text-[10px] text-white/80 font-medium tracking-wide">
                  Order your favorite items online and easy
                </p>
              </div>
            </div>
          </div>

          {/* Ambient luxury background wrapper for the content below banner */}
          <div className="bg-gradient-to-br from-[#faf9f5] via-[#fdfcfb] to-[#f4f2ec] dark:from-[#0a0a0a] dark:to-[#121212] relative overflow-hidden">
            {/* Soft background glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-40 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Dynamic Categories Section */}
            <div className="relative z-10 px-4 md:px-8 py-6 md:py-8 mb-2">
              <div className="flex justify-between items-end mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-[1000] uppercase tracking-[0.2em] text-[#D4AF37] drop-shadow-sm">MORE CATEGORIES</span>
                  <h4 className="text-[20px] md:text-[24px] font-['Playfair_Display',serif,sans-serif] font-black text-slate-900 dark:text-white leading-tight tracking-tight">What's on your mind?</h4>
                  <p className="text-[10px] md:text-[11px] text-slate-500 font-medium tracking-wide">Fresh groceries, snacks, household items and more</p>
                </div>
                <div className="hidden md:flex gap-2 mb-1">
                  {/* Optional navigation arrows for desktop */}
                  <button className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:shadow-md transition-all">
                    <ChevronDown className="rotate-90 w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:shadow-md transition-all">
                    <ChevronDown className="-rotate-90 w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {foodCategories?.length > 0 ? (
                <div className="flex overflow-x-auto gap-4 md:gap-5 pb-6 pt-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory scroll-smooth">
                  {foodCategories.map((item, idx) => (
                    <div 
                      key={item.id || idx} 
                      onClick={() => { window.location.href = `/food/user/category/${item.slug || item.id}` }}
                      className="flex flex-col items-center justify-start shrink-0 snap-start w-[85px] md:w-[100px] cursor-pointer group"
                    >
                      <div className="w-[85px] h-[85px] md:w-[100px] md:h-[100px] rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-[0_8px_20px_-8px_rgba(0,0,0,0.08)] border border-white dark:border-slate-700/50 flex items-center justify-center p-3 mb-3 relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)] group-hover:-translate-y-1">
                        {/* Subtle inner hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/0 via-[#D4AF37]/0 to-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <img 
                          src={item.image || "https://cdn-icons-png.flaticon.com/128/6024/6024564.png"} 
                          alt={item.name} 
                          className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 relative z-10" 
                        />
                      </div>
                      <span className="text-[10px] md:text-[11px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-gray-500 py-10">No categories found</div>
              )}
            </div>
          </div>
          {/* Lowest Price ever Section  (kept as static for now) */}
          <div
            className={cn(
              "mb-4 md:mb-6",
              embedded ? "mt-4 md:mt-5" : "mt-6 md:mt-10",
            )}>
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0B1A24] via-[#10293B] to-[#0B1A24] dark:from-[#050B14] dark:to-[#050B14] pt-8 md:pt-10 pb-0 rounded-none md:rounded-[32px] mx-0 md:mx-8 lg:mx-[50px] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)] border border-[#D4AF37]/20">
              {/* Luxury background glows */}
              <div className="absolute top-0 right-10 w-[200px] h-[200px] bg-[#D4AF37]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 px-4 md:px-8">
                <div className="flex justify-between items-center mb-5 md:mb-6 px-1">
                  <div className="flex flex-col">
                    <h3 className="text-xl md:text-3xl font-['Playfair_Display',serif] font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11] drop-shadow-md">
                      Flash <span className="font-sans font-light italic text-[#F3E5AB]">Sale</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F3E5AB] shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] opacity-90 drop-shadow-sm">
                        Unbeatable Savings • Updated hourly
                      </span>
                    </div>
                  </div>
                  <motion.div
                    onClick={() => navigate(getQuickCategoriesPath())}
                    whileHover={{ x: 5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 md:gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[#111] font-bold text-[9px] md:text-xs cursor-pointer shadow-[0_5px_15px_rgba(212,175,55,0.3)] hover:shadow-[0_8px_20px_rgba(212,175,55,0.5)] transition-all shrink-0 whitespace-nowrap">
                    View all offers
                    <ArrowRightIcon
                      sx={{ fontSize: 12, ml: 0.5 }}
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
                      initial={{ opacity: 0, y: 40, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        "mb-8 mx-0 md:mx-4 lg:mx-[50px] rounded-none md:rounded-[32px] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border-y md:border border-slate-100 dark:border-neutral-800/60 bg-white/50 backdrop-blur-md",
                        section.title?.toLowerCase().includes('masala') ? "bg-[#FFF9E7]/80 dark:bg-[#2a261a]/80" : "bg-white/80 dark:bg-neutral-900/80"
                      )}>
                      <div
                        className="relative flex items-center justify-between px-5 md:px-8 py-6 md:py-8 text-black dark:text-white"
                        style={{
                          backgroundColor: bgColor,
                          backgroundImage: getBackgroundGradientByValue(
                            section.backgroundColor,
                          ),
                        }}>
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                          <div className="absolute -top-10 -left-10 w-40 h-40 md:w-64 md:h-64 bg-white/25 rounded-full blur-[60px]" />
                          <div className="absolute -bottom-10 right-0 w-44 h-44 md:w-56 md:h-56 bg-white/15 rounded-full blur-[50px]" />
                        </div>
                        <div className="flex-1 pr-4 relative z-10">
                          <p className="text-[10px] md:text-[11px] font-[1000] uppercase tracking-[0.25em] text-black/50 dark:text-white/50 mb-1.5 drop-shadow-sm">
                            Trending right now
                          </p>
                          <h3 className="text-2xl md:text-[32px] font-['Playfair_Display',serif,sans-serif] font-black tracking-tight leading-tight drop-shadow-md">
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
