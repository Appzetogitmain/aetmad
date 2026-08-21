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
import martHeroVideo from "@/assets/i_want_thiscolor_B_B_D_in_bg.mp4";
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
    <div className={cn("w-full relative min-h-screen", embedded ? "pt-0" : "pt-[176px] md:pt-[210px]")} style={{ backgroundColor: "#B80B3D" }}>
      {/* Skeleton for Hero Banner */}
      <section className="px-4 pt-1 pb-4">
        <div className="w-full flex justify-center mb-4 mt-1">
          <div className="relative w-[96%] max-w-[440px] rounded-[20px] overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.7)] border border-[#D4AF37]/30">
            <Skeleton className="w-full h-[150px] sm:h-[200px] object-cover bg-black/20" />
          </div>
        </div>

        {/* Luxury Decorative Heading Skeleton */}
        <div className="flex items-center justify-center gap-3 mb-3 mt-1">
          <div className="flex items-center gap-1.5 opacity-80">
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#D4AF37]/50"></div>
            <span className="text-[#D4AF37]/50 text-[10px]">✦</span>
          </div>
          <Skeleton className="h-4 w-32 bg-black/20 rounded" />
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="text-[#D4AF37]/50 text-[10px]">✦</span>
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#D4AF37]/50"></div>
          </div>
        </div>

        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-4 px-2 mt-4 relative z-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/20 p-2 shadow-inner border border-white/5">
                <Skeleton className="w-full h-full rounded-xl bg-black/10" />
              </div>
              <Skeleton className="h-2.5 w-12 bg-black/20 rounded-full" />
            </div>
          ))}
        </div>
      </section>
      
      {/* Bottom curved background skeleton area */}
      <div className="relative -mt-4 bg-[#F5F7F8] dark:bg-background rounded-t-[24px] pt-8 px-4 h-full">
         <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48 rounded-md" />
              <div className="flex gap-4 overflow-hidden">
                <Skeleton className="h-32 w-28 rounded-xl shrink-0" />
                <Skeleton className="h-32 w-28 rounded-xl shrink-0" />
                <Skeleton className="h-32 w-28 rounded-xl shrink-0" />
                <Skeleton className="h-32 w-28 rounded-xl shrink-0" />
              </div>
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
  const [secondaryAd, setSecondaryAd] = useState(null);
  const [adsList, setAdsList] = useState([]);

  useEffect(() => {
    customerApi.getCategories().then(res => {
      const list = res?.data?.data?.categories || res?.data?.categories || [];
      const transformed = list.map((cat, idx) => ({
        id: String(cat?.id || cat?._id || cat?.slug || idx),
        name: cat?.name || "",
        slug: cat?.slug || String(cat?.name || "").toLowerCase().replace(/\s+/g, "-"),
        image: cat?.image || cat?.imageUrl || ""
      }));
      setFoodCategories(transformed);
    }).catch(err => console.error(err));

    customerApi.getAds({ position: "home_secondary_banner" }).then(res => {
      const bannerAds = res?.data?.data || [];
      if (bannerAds.length > 0) {
        setSecondaryAd(bannerAds[0]);
      } else {
        setSecondaryAd(null);
      }
    }).catch(err => console.error("Error fetching secondary ad:", err));

    customerApi.getAds().then(res => {
      const fetchedAds = res?.data?.results || res?.data?.result || [];
      setAdsList(Array.isArray(fetchedAds) ? fetchedAds : []);
    }).catch(err => console.error("Error fetching ads:", err));
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

  const sectionsForRenderer = useMemo(() => {
    return (activeCategory && activeCategory._id !== "all") ? headerSections : experienceSections;
  }, [activeCategory, headerSections, experienceSections]);

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
          onCategorySelect={(cat) => navigate(`/quick/categories/${cat.slug || cat.id || cat._id}`)}
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
                exploreMoreHeading={heroConfig?.banners?.items?.[0]?.title || "Categories"}
                showExploreSkeleton={false}
                videoSrc={(() => {
                  const heroBannerUrl = heroConfig?.banners?.items?.[0]?.imageUrl;
                  return heroBannerUrl || martHeroVideo;
                })()}
                badgeText={heroConfig?.banners?.items?.[0]?.subtitle || "✨ Essentials"}
                badgeBgClass="bg-gradient-to-r from-[#B80B3D]/95 to-[#8B0028]/95"
                cardBgClass="bg-gradient-to-b from-[#B80B3D] via-[#8B0028] to-[#3A000E]"
                finalExploreItems={foodCategories.length > 0 ? foodCategories.map(cat => ({
                  id: cat.id || cat._id,
                  label: cat.name,
                  image: cat.image || "https://cdn-icons-png.flaticon.com/128/6024/6024564.png",
                  href: `/quick/categories/${cat.slug || cat.id}`
                })) : [
                  { id: '1', label: 'Fruits & Veg', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&q=80', href: `/quick/categories/6a60b43588bfce2455f6dc0e` },
                  { id: '2', label: 'Bakery & Biscuits', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80', href: `/quick/categories/bakery` },
                  { id: '3', label: 'Dairy Products', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&q=80', href: `/quick/categories/dairy` },
                  { id: '4', label: 'Snacks', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200&q=80', href: `/quick/categories/snacks` },
                  { id: '5', label: 'Instant & Frozen', image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=200&q=80', href: `/quick/categories/frozen` },
                  { id: '6', label: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&q=80', href: `/quick/categories/drinks` }
                ]}
              />
            </React.Suspense>

            {/* TABS CONTAINER */}
            <div className="flex w-full h-[48px] relative z-20 bg-[#F5E6EA] shadow-[inset_0px_3px_5px_rgba(0,0,0,0.03)] border-b border-[#EED8DE]">
              {/* Left Tab: Aetmad Food (Inactive) */}
              <button 
                onClick={() => navigate("/food")}
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
          {secondaryAd && (
            <div className="px-4 pt-4 pb-1">
              <div className="relative w-full h-[120px] bg-gradient-to-br from-[#0B3122] via-[#072417] to-black rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden flex flex-row border border-[#D4AF37]/20">
                {secondaryAd.leftImage && (
                  <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-2 border-[#D4AF37]/40 shadow-[0_8px_20px_rgba(0,0,0,0.4)] overflow-hidden">
                    <img src={secondaryAd.leftImage} alt="left ad img" className="w-full h-full object-cover" />
                  </div>
                )}
                {secondaryAd.rightImage && (
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-2 border-[#D4AF37]/40 shadow-[0_8px_20px_rgba(0,0,0,0.4)] overflow-hidden">
                    <img src={secondaryAd.rightImage} alt="right ad img" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="z-10 flex flex-col items-center justify-center w-full text-center mt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#D4AF37] font-bold text-[10px] tracking-widest uppercase">{secondaryAd.prefixText}</span>
                    <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11] flex flex-col items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/20">
                      <span className="text-[#0B3122] font-black text-[16px] leading-none -mb-0.5">{secondaryAd.discountValue}</span>
                    </div>
                    <span className="text-[#D4AF37] font-bold text-[10px] tracking-widest uppercase">{secondaryAd.suffixText}</span>
                  </div>
                  
                  <h2 className="text-[28px] font-['Playfair_Display',serif] font-black tracking-tight text-white leading-none mb-1 shadow-black drop-shadow-md">
                    {secondaryAd.title}
                  </h2>
                  <p className="text-[10px] text-white/80 font-medium tracking-wide">
                    {secondaryAd.subtitle}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ambient luxury background wrapper for the content below banner */}
          <div className="bg-gradient-to-br from-[#faf9f5] via-[#fdfcfb] to-[#f4f2ec] dark:from-[#0a0a0a] dark:to-[#121212] relative overflow-hidden">
            {/* Soft background glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-40 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Dynamic Ads Section */}
            <div className="relative z-10 px-4 md:px-8 pt-6 pb-2 md:pt-8 md:pb-3">
              <div className="flex justify-between items-end mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-[1000] uppercase tracking-[0.2em] text-[#D4AF37] drop-shadow-sm">OFFERS FOR YOU</span>
                  <h4 className="text-[20px] md:text-[24px] font-['Playfair_Display',serif,sans-serif] font-black text-slate-900 dark:text-white leading-tight tracking-tight">Latest Promotions</h4>
                  <p className="text-[10px] md:text-[11px] text-slate-500 font-medium tracking-wide">Exciting deals you can't miss</p>
                </div>
              </div>
              
              {adsList?.length > 0 ? (
                <div className="flex overflow-x-auto gap-4 md:gap-5 pb-5 pt-1 no-scrollbar px-1 snap-x snap-mandatory scroll-smooth">
                  {adsList.map((ad, idx) => (
                    <div 
                      key={ad._id || idx} 
                      onClick={() => ad.linkUrl ? window.open(ad.linkUrl, '_blank') : null}
                      className={cn(
                        "flex flex-col shrink-0 snap-start rounded-[22px] md:rounded-[28px] overflow-hidden group shadow-lg hover:shadow-2xl border border-slate-200/80 dark:border-white/10 transition-all duration-300 w-[88vw] max-w-[560px] sm:w-[480px] md:w-[560px] h-[185px] sm:h-[220px] md:h-[240px]",
                        ad.linkUrl ? "cursor-pointer" : ""
                      )}
                    >
                      <div className="w-full h-full relative overflow-hidden bg-slate-100">
                        {ad.imageUrl?.toLowerCase().endsWith('.mp4') || ad.imageUrl?.toLowerCase().endsWith('.webm') ? (
                          <video src={ad.imageUrl} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {/* Lowest Price ever Section  (kept as static for now) */}
          <div
            className={cn(
              "mb-4 md:mb-6 relative z-20",
              embedded ? "-mt-2 md:-mt-4" : "-mt-2 md:-mt-4",
            )}>
            <div className="relative overflow-hidden bg-gradient-to-r from-[#990A33] via-[#D3104C] to-[#B80B3D] dark:from-[#4A0418] dark:to-[#7A0627] pt-8 md:pt-10 pb-0 rounded-[24px] md:rounded-[32px] mx-2 md:mx-8 lg:mx-[50px] shadow-[0_15px_40px_-10px_rgba(184,11,61,0.5)] border border-[#FF4D85]/30">
              {/* Vibrant background glows */}
              <div className="absolute top-0 right-10 w-[250px] h-[250px] bg-[#FFD700]/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
              <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-[#FF4D85]/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
              
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

              <div className="relative z-10 px-4 md:px-8">
                <div className="flex justify-between items-center mb-5 md:mb-6 px-1">
                  <div className="flex flex-col group cursor-default">
                    <h3 className="text-2xl md:text-4xl font-['Playfair_Display',serif] font-black tracking-tighter uppercase leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:translate-x-1">
                      Flash <span className="font-sans font-light italic text-[#FFD700]">Sale</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-2 md:mt-3 bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.8)]"></span>
                      </div>
                      <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-100 drop-shadow-sm">
                        Unbeatable Savings • Updated hourly
                      </span>
                    </div>
                  </div>
                  <motion.div
                    onClick={() => navigate("/quick/products")}
                    whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(255,215,0,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-[#FFD700] to-[#F39C12] px-5 py-2.5 md:px-6 md:py-3 rounded-full text-slate-900 font-black text-[10px] md:text-sm cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.2)] transition-all shrink-0 whitespace-nowrap overflow-hidden relative border border-white/20">
                    <span className="relative z-10">View all offers</span>
                    <ArrowRightIcon
                      sx={{ fontSize: 14, ml: 0.5 }}
                      className="relative z-10"
                    />
                    <div className="absolute inset-0 w-full h-full bg-white/30 -translate-x-full hover:animate-[shimmer_1s_infinite]"></div>
                  </motion.div>
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-2 md:gap-4 pb-5 md:pb-6 no-scrollbar">
                  {isProductsLoading ? (
                    Array(9).fill(0).map((_, i) => (
                      <div key={i} className="w-full h-[220px] bg-white dark:bg-slate-800/60 rounded-[20px] animate-pulse border border-blue-50/50" />
                    ))
                  ) : filteredProducts.slice(0, 9).map((product) => (
                    <div
                      key={product.id || product._id}
                      className="w-full">
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
