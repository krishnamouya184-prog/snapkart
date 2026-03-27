import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  LogOut,
  Menu,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckoutModal } from "./components/CheckoutModal";
import { MyOrders } from "./components/MyOrders";
import { SellerDashboard } from "./components/SellerDashboard";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

// ─── Types ───────────────────────────────────────────────────────────────────
type Category =
  | "All"
  | "Mobiles"
  | "Laptops"
  | "Wearables"
  | "Home & Kitchen"
  | "Fashion"
  | "Beauty"
  | "Books";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: Category;
  originalPrice: number;
  salePrice: number;
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  isFlashDeal?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Review {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

// ─── Products Data ────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  // Mobiles
  {
    id: 1,
    name: "iPhone 17",
    brand: "Apple",
    category: "Mobiles",
    originalPrice: 89999,
    salePrice: 79199,
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
    rating: 4.8,
    reviewCount: 2847,
    description: "5G, 48MP Camera, A18 Bionic",
    isFlashDeal: true,
  },
  {
    id: 2,
    name: "Samsung Galaxy S26 Ultra",
    brand: "Samsung",
    category: "Mobiles",
    originalPrice: 124999,
    salePrice: 106249,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
    rating: 4.7,
    reviewCount: 1923,
    description: "200MP Camera, S Pen, 12GB RAM",
  },
  {
    id: 3,
    name: "Redmi Note 14 Pro 5G",
    brand: "Redmi",
    category: "Mobiles",
    originalPrice: 21999,
    salePrice: 17999,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    rating: 4.5,
    reviewCount: 8432,
    description: "AMOLED Display, 8GB RAM, 5000mAh",
    isFlashDeal: true,
  },
  {
    id: 4,
    name: "Samsung Galaxy A56 5G",
    brand: "Samsung",
    category: "Mobiles",
    originalPrice: 34999,
    salePrice: 31499,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
    rating: 4.4,
    reviewCount: 3241,
    description: "Triple Camera, 5000mAh Battery",
  },
  {
    id: 5,
    name: "POCO X8 Pro",
    brand: "POCO",
    category: "Mobiles",
    originalPrice: 28999,
    salePrice: 23199,
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400",
    rating: 4.3,
    reviewCount: 5621,
    description: "Dimensity 8500, 100W Charging",
  },
  {
    id: 6,
    name: "OnePlus 13",
    brand: "OnePlus",
    category: "Mobiles",
    originalPrice: 69999,
    salePrice: 59499,
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400",
    rating: 4.6,
    reviewCount: 4102,
    description: "Hasselblad Camera, 100W Charging",
    isFlashDeal: true,
  },
  // Laptops
  {
    id: 7,
    name: "Apple MacBook Air M3",
    brand: "Apple",
    category: "Laptops",
    originalPrice: 114900,
    salePrice: 105708,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    rating: 4.9,
    reviewCount: 1204,
    description: "18-hr battery, 8GB RAM, 256GB SSD",
    isFlashDeal: true,
  },
  {
    id: 8,
    name: "Lenovo LOQ Gaming Laptop",
    brand: "Lenovo",
    category: "Laptops",
    originalPrice: 79990,
    salePrice: 62392,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
    rating: 4.5,
    reviewCount: 876,
    description: "RTX 3050, 144Hz Display, 16GB RAM",
  },
  {
    id: 9,
    name: "Samsung Galaxy Book4",
    brand: "Samsung",
    category: "Laptops",
    originalPrice: 89999,
    salePrice: 79199,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    rating: 4.4,
    reviewCount: 542,
    description: "Intel Core Ultra, 16GB RAM, AMOLED",
  },
  {
    id: 10,
    name: "HP Pavilion Gaming Laptop",
    brand: "HP",
    category: "Laptops",
    originalPrice: 65990,
    salePrice: 52792,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400",
    rating: 4.3,
    reviewCount: 1123,
    description: "RTX 4060, i7 13th Gen, 512GB SSD",
  },
  // Wearables
  {
    id: 11,
    name: "OnePlus Watch 2",
    brand: "OnePlus",
    category: "Wearables",
    originalPrice: 24999,
    salePrice: 17499,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    rating: 4.5,
    reviewCount: 3421,
    description: "100hr Battery, Dual GPS, Military Grade",
    isFlashDeal: true,
  },
  {
    id: 12,
    name: "Samsung Galaxy Watch 6",
    brand: "Samsung",
    category: "Wearables",
    originalPrice: 22999,
    salePrice: 17249,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
    rating: 4.4,
    reviewCount: 2891,
    description: "Health Monitoring, BioActive Sensor",
  },
  {
    id: 13,
    name: "boAt Wave Pro 47",
    brand: "boAt",
    category: "Wearables",
    originalPrice: 1999,
    salePrice: 1299,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400",
    rating: 4.2,
    reviewCount: 12847,
    description: "1.69'' Display, SpO2, 7-day battery",
  },
  {
    id: 14,
    name: "Apple AirPods Pro 2",
    brand: "Apple",
    category: "Wearables",
    originalPrice: 24900,
    salePrice: 19920,
    image: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400",
    rating: 4.8,
    reviewCount: 5621,
    description: "ANC, Spatial Audio, H2 Chip",
  },
  // Home & Kitchen
  {
    id: 15,
    name: "Havells Sprint Mixer Grinder",
    brand: "Havells",
    category: "Home & Kitchen",
    originalPrice: 3499,
    salePrice: 2274,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    rating: 4.3,
    reviewCount: 6782,
    description: "500W, 3 Jars, 2-yr Warranty",
  },
  {
    id: 16,
    name: "Prestige Digital Air Fryer",
    brand: "Prestige",
    category: "Home & Kitchen",
    originalPrice: 4999,
    salePrice: 3599,
    image: "https://images.unsplash.com/photo-1648489654774-4d9b02d6d3e8?w=400",
    rating: 4.5,
    reviewCount: 4312,
    description: "4.2L, Digital Panel, Auto Shutoff",
    isFlashDeal: true,
  },
  {
    id: 17,
    name: "Samsung 253L Convertible Fridge",
    brand: "Samsung",
    category: "Home & Kitchen",
    originalPrice: 28990,
    salePrice: 23192,
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400",
    rating: 4.6,
    reviewCount: 2341,
    description: "5-in-1 Convertible, Digital Inverter",
  },
  {
    id: 18,
    name: "Dyson V15 Vacuum Cleaner",
    brand: "Dyson",
    category: "Home & Kitchen",
    originalPrice: 44900,
    salePrice: 38165,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    rating: 4.7,
    reviewCount: 892,
    description: "Laser Detect, 230 AW Suction",
  },
  {
    id: 19,
    name: "Instant Pot Duo 7-in-1",
    brand: "Instant Pot",
    category: "Home & Kitchen",
    originalPrice: 8999,
    salePrice: 5849,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    rating: 4.6,
    reviewCount: 3421,
    description: "Pressure Cooker, Slow Cooker, Rice Cooker",
  },
  // Fashion
  {
    id: 20,
    name: "Levi's 511 Slim Fit Jeans",
    brand: "Levi's",
    category: "Fashion",
    originalPrice: 2999,
    salePrice: 1799,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
    rating: 4.4,
    reviewCount: 8934,
    description: "Stretch Denim, Regular Waist",
    isFlashDeal: true,
  },
  {
    id: 21,
    name: "Allen Solly Formal Shirt",
    brand: "Allen Solly",
    category: "Fashion",
    originalPrice: 1299,
    salePrice: 649,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
    rating: 4.3,
    reviewCount: 5621,
    description: "Cotton, Regular Fit, Multiple Colors",
  },
  {
    id: 22,
    name: "Nike Air Max 270",
    brand: "Nike",
    category: "Fashion",
    originalPrice: 8995,
    salePrice: 6296,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    rating: 4.6,
    reviewCount: 7234,
    description: "Max Air Heel Unit, Lightweight",
  },
  {
    id: 23,
    name: "Zara Floral Summer Dress",
    brand: "Zara",
    category: "Fashion",
    originalPrice: 3490,
    salePrice: 2268,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
    rating: 4.2,
    reviewCount: 2341,
    description: "Cotton Blend, Midi Length",
  },
  {
    id: 24,
    name: "Puma Running Shoes",
    brand: "Puma",
    category: "Fashion",
    originalPrice: 5999,
    salePrice: 3599,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400",
    rating: 4.4,
    reviewCount: 4123,
    description: "EverRide Foam, Breathable Mesh",
  },
  // Beauty
  {
    id: 25,
    name: "Lakme 9to5 Primer Foundation",
    brand: "Lakme",
    category: "Beauty",
    originalPrice: 599,
    salePrice: 449,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    rating: 4.2,
    reviewCount: 9821,
    description: "SPF 20, Full Coverage, 12hr Wear",
  },
  {
    id: 26,
    name: "L'Oreal Revitalift Serum",
    brand: "L'Oreal",
    category: "Beauty",
    originalPrice: 899,
    salePrice: 629,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    rating: 4.5,
    reviewCount: 6732,
    description: "1.5% Pure Hyaluronic Acid, Anti-Aging",
  },
  {
    id: 27,
    name: "Maybelline Fit Me Foundation",
    brand: "Maybelline",
    category: "Beauty",
    originalPrice: 499,
    salePrice: 349,
    image: "https://images.unsplash.com/photo-1631214524020-3c69f2c90897?w=400",
    rating: 4.3,
    reviewCount: 11234,
    description: "Natural Coverage, Oil-Free",
  },
  {
    id: 28,
    name: "The Ordinary Niacinamide",
    brand: "The Ordinary",
    category: "Beauty",
    originalPrice: 799,
    salePrice: 559,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    rating: 4.6,
    reviewCount: 8432,
    description: "10% Niacinamide + 1% Zinc",
  },
  // Books
  {
    id: 29,
    name: "Atomic Habits",
    brand: "James Clear",
    category: "Books",
    originalPrice: 399,
    salePrice: 219,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: 4.8,
    reviewCount: 34521,
    description: "Bestseller, Life-Changing Habits Guide",
    isFlashDeal: true,
  },
  {
    id: 30,
    name: "Rich Dad Poor Dad",
    brand: "Robert Kiyosaki",
    category: "Books",
    originalPrice: 299,
    salePrice: 179,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
    rating: 4.7,
    reviewCount: 28932,
    description: "Personal Finance Classic",
  },
  {
    id: 31,
    name: "The Psychology of Money",
    brand: "Morgan Housel",
    category: "Books",
    originalPrice: 349,
    salePrice: 209,
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
    rating: 4.8,
    reviewCount: 19234,
    description: "Timeless Lessons on Wealth",
  },
  {
    id: 32,
    name: "Ikigai",
    brand: "Hector Garcia",
    category: "Books",
    originalPrice: 249,
    salePrice: 149,
    image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400",
    rating: 4.6,
    reviewCount: 22341,
    description: "Japanese Secret to Long & Happy Life",
  },
];

const SAMPLE_REVIEWS: Record<number, Review[]> = {
  1: [
    {
      user: "Arjun Sharma",
      rating: 5,
      comment:
        "Absolutely love this phone! Camera quality is insane, best I've ever used.",
      date: "Mar 15, 2026",
    },
    {
      user: "Priya Singh",
      rating: 5,
      comment:
        "Battery lasts all day, performance is buttery smooth. Worth every rupee!",
      date: "Mar 10, 2026",
    },
    {
      user: "Rahul Kumar",
      rating: 4,
      comment:
        "Great phone overall, though a bit pricey. The display is gorgeous.",
      date: "Feb 28, 2026",
    },
  ],
};

const DEFAULT_REVIEWS: Review[] = [
  {
    user: "Vikram Patel",
    rating: 5,
    comment: "Excellent product! Delivered on time, quality is top-notch.",
    date: "Mar 20, 2026",
  },
  {
    user: "Neha Gupta",
    rating: 4,
    comment: "Very happy with the purchase. Great value for money.",
    date: "Mar 12, 2026",
  },
  {
    user: "Amit Verma",
    rating: 4,
    comment: "Good product, exactly as described. Would recommend.",
    date: "Mar 5, 2026",
  },
  {
    user: "Sunita Rao",
    rating: 5,
    comment: "Superb quality! Fast delivery too. Highly satisfied.",
    date: "Feb 22, 2026",
  },
];

const CATEGORIES: { label: Category | "All"; icon: string; color: string }[] = [
  { label: "Mobiles", icon: "📱", color: "bg-blue-100 text-blue-700" },
  { label: "Laptops", icon: "💻", color: "bg-indigo-100 text-indigo-700" },
  { label: "Wearables", icon: "⌚", color: "bg-purple-100 text-purple-700" },
  {
    label: "Home & Kitchen",
    icon: "🏠",
    color: "bg-orange-100 text-orange-700",
  },
  { label: "Fashion", icon: "👗", color: "bg-pink-100 text-pink-700" },
  { label: "Beauty", icon: "💄", color: "bg-rose-100 text-rose-700" },
  { label: "Books", icon: "📚", color: "bg-yellow-100 text-yellow-700" },
];

const BRANDS = [
  { name: "Apple", color: "from-gray-100 to-gray-200", text: "text-gray-700" },
  {
    name: "Samsung",
    color: "from-blue-100 to-blue-200",
    text: "text-blue-700",
  },
  {
    name: "Redmi",
    color: "from-orange-100 to-orange-200",
    text: "text-orange-700",
  },
  { name: "OnePlus", color: "from-red-100 to-red-200", text: "text-red-700" },
  { name: "Lenovo", color: "from-red-100 to-red-200", text: "text-red-600" },
  { name: "Nike", color: "from-gray-800 to-black", text: "text-white" },
  { name: "Levi's", color: "from-blue-900 to-blue-800", text: "text-white" },
  {
    name: "Prestige",
    color: "from-green-100 to-green-200",
    text: "text-green-700",
  },
];

const SALE_DEALS = [
  {
    title: "Mobiles Mega Sale",
    discount: "Up to 25% OFF",
    desc: "Top Smartphones",
    icon: "📱",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Laptop Bonanza",
    discount: "Up to 22% OFF",
    desc: "Gaming & Ultrabooks",
    icon: "💻",
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "Fashion Fiesta",
    discount: "Up to 50% OFF",
    desc: "Brands you love",
    icon: "👗",
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "Kitchen Kings",
    discount: "Up to 35% OFF",
    desc: "Appliances & More",
    icon: "🏠",
    color: "from-orange-500 to-amber-600",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function discountPct(orig: number, sale: number) {
  return Math.round(((orig - sale) / orig) * 100);
}

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function getCategoryColor(cat: Category): string {
  const map: Record<string, string> = {
    Mobiles: "bg-blue-100 text-blue-700",
    Laptops: "bg-indigo-100 text-indigo-700",
    Wearables: "bg-purple-100 text-purple-700",
    "Home & Kitchen": "bg-orange-100 text-orange-700",
    Fashion: "bg-pink-100 text-pink-700",
    Beauty: "bg-rose-100 text-rose-700",
    Books: "bg-yellow-100 text-yellow-700",
  };
  return map[cat] ?? "bg-gray-100 text-gray-700";
}

function StarRating({
  rating,
  size = "sm",
}: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });
  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function TimerBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[52px] text-center">
        <span className="text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-white/80 mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function FlashTimerBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 rounded px-2 py-0.5 min-w-[28px] text-center">
        <span className="text-sm font-bold text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { actor: rawActor } = useActor();
  // Cast to full backend interface (backend.ts only exposes subset)
  const actor = rawActor as unknown as
    | import("./backend.d").backendInterface
    | null;
  const isLoggedIn = loginStatus === "success";

  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [page, setPage] = useState<"store" | "seller" | "orders">("store");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [pwaInstallEvent, setPwaInstallEvent] = useState<Event | null>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setPwaInstallEvent(e);
      setShowPwaBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Check seller status
  useEffect(() => {
    if (!actor || !identity) return;
    actor
      .isSeller()
      .then(setIsSeller)
      .catch(() => {});
  }, [actor, identity]);

  const saleTarget = useRef(new Date(Date.now() + 2 * 24 * 3600 * 1000));
  const flashTarget = useRef(new Date(Date.now() + 6 * 3600 * 1000));
  const saleTimer = useCountdown(saleTarget.current);
  const flashTimer = useCountdown(flashTarget.current);

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice =
      p.salePrice >= priceRange[0] && p.salePrice <= priceRange[1];
    return matchCat && matchSearch && matchPrice;
  });

  const flashDeals = PRODUCTS.filter((p) => p.isFlashDeal);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`, { duration: 2000 });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  }

  function updateQuantity(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === id ? { ...i, quantity: i.quantity + delta } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function toggleWishlist(id: number) {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    );
    const p = PRODUCTS.find((p) => p.id === id);
    if (p)
      toast(
        wishlist.includes(id) ? "Removed from wishlist" : "❤️ Added to wishlist",
        { duration: 1500 },
      );
  }

  const productReviews = selectedProduct
    ? (SAMPLE_REVIEWS[selectedProduct.id] ?? DEFAULT_REVIEWS)
    : [];

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans">
      <Toaster position="top-right" />

      {/* ── PWA Install Banner ──────────────────────────────────────────────── */}
      {showPwaBanner && (
        <div
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-primary text-white rounded-xl shadow-2xl p-4 flex items-center gap-3"
          data-ocid="pwa.toast"
        >
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            🛒
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Install SnapKart App</p>
            <p className="text-xs text-blue-200">Shop faster with our app!</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-white text-primary hover:bg-blue-50 text-xs px-3 h-8"
              onClick={() => {
                if (pwaInstallEvent && "prompt" in pwaInstallEvent) {
                  (pwaInstallEvent as { prompt: () => void }).prompt();
                }
                setShowPwaBanner(false);
              }}
              data-ocid="pwa.primary_button"
            >
              Install
            </Button>
            <button
              type="button"
              onClick={() => setShowPwaBanner(false)}
              className="text-white/70 hover:text-white"
              data-ocid="pwa.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Page Routing ────────────────────────────────────────────────────── */}
      {page === "seller" && (
        <div className="min-h-screen bg-[#f1f3f6]">
          <SellerDashboard onBack={() => setPage("store")} />
        </div>
      )}
      {page === "orders" && (
        <div className="min-h-screen bg-[#f1f3f6]">
          <MyOrders onBack={() => setPage("store")} />
        </div>
      )}

      {/* ── Checkout Modal ──────────────────────────────────────────────────── */}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          cartTotal={cartTotal}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => {
            setCheckoutOpen(false);
            setCart([]);
            toast.success("🎉 Order placed successfully!");
          }}
        />
      )}

      {
        page !== "store" ? null : (
          <>
            {/* ── Navbar ─────────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 bg-primary shadow-navbar">
              <div className="max-w-7xl mx-auto px-3 md:px-6">
                <div className="flex items-center gap-3 h-16">
                  {/* Logo */}
                  <a href="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 bg-flipkart-yellow rounded-lg flex items-center justify-center">
                      <Store className="w-4 h-4 text-primary" />
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-white font-bold text-lg leading-none">
                        SnapKart
                      </span>
                      <span className="block text-[10px] text-yellow-200 italic">
                        Explore Plus ✦
                      </span>
                    </div>
                  </a>

                  {/* Search */}
                  <div className="flex-1 flex items-center bg-white rounded-sm overflow-hidden h-10">
                    <select
                      className="hidden md:block h-full px-2 text-xs text-gray-600 bg-gray-100 border-r border-gray-200 outline-none cursor-pointer"
                      value={activeCategory}
                      onChange={(e) =>
                        setActiveCategory(e.target.value as Category | "All")
                      }
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.label} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className="flex-1 px-3 text-sm text-gray-800 outline-none h-full placeholder:text-gray-400"
                      placeholder="Search for products, brands and more"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-ocid="nav.search_input"
                    />
                    <button
                      type="button"
                      className="bg-primary hover:bg-blue-700 h-full px-4 flex items-center transition-colors"
                      data-ocid="nav.button"
                    >
                      <Search className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Right icons */}
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* Login */}
                    {isLoggedIn ? (
                      <button
                        type="button"
                        onClick={() => clear()}
                        className="hidden sm:flex items-center gap-1.5 bg-white text-primary font-semibold text-sm px-3 py-1.5 rounded-sm hover:bg-blue-50 transition-colors"
                        data-ocid="nav.button"
                      >
                        <User className="w-4 h-4" />
                        <span className="hidden md:inline">Account</span>
                        <LogOut className="w-3 h-3 ml-1 text-gray-400" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setLoginOpen(true)}
                        className="hidden sm:flex items-center gap-1.5 bg-white text-primary font-semibold text-sm px-3 py-1.5 rounded-sm hover:bg-blue-50 transition-colors"
                        data-ocid="nav.button"
                      >
                        <User className="w-4 h-4" />
                        <span>Login</span>
                      </button>
                    )}

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() => setWishlistOpen(true)}
                      className="relative flex items-center gap-1 text-white hover:text-yellow-200 transition-colors px-2 py-2"
                      data-ocid="nav.button"
                    >
                      <Heart className="w-5 h-5" />
                      {wishlist.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {wishlist.length}
                        </span>
                      )}
                      <span className="hidden sm:inline text-sm">Wishlist</span>
                    </button>

                    {/* Cart */}
                    <button
                      type="button"
                      onClick={() => setCartOpen(true)}
                      className="relative flex items-center gap-1 text-white hover:text-yellow-200 transition-colors px-2 py-2"
                      data-ocid="nav.button"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                      <span className="hidden sm:inline text-sm">Cart</span>
                    </button>

                    {/* Navigation Links */}
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => setPage("orders")}
                        className="hidden lg:flex items-center gap-1 text-white text-sm hover:text-yellow-200 transition-colors"
                        data-ocid="nav.link"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Orders</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPage("seller")}
                      className="hidden lg:flex items-center gap-1 text-white text-sm hover:text-yellow-200 transition-colors"
                      data-ocid="nav.link"
                    >
                      <Store className="w-4 h-4" />
                      <span>{isSeller ? "Dashboard" : "Sell"}</span>
                    </button>

                    {/* Mobile menu */}
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="sm:hidden text-white p-1"
                      data-ocid="nav.button"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                  <div className="sm:hidden pb-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="bg-white text-primary text-sm font-semibold px-3 py-1.5 rounded-sm"
                    >
                      {isLoggedIn ? "Account" : "Login"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setWishlistOpen(true)}
                      className="bg-white/20 text-white text-sm px-3 py-1.5 rounded-sm"
                    >
                      Wishlist ({wishlist.length})
                    </button>
                  </div>
                )}
              </div>
            </header>

            {/* ── Deal Banners Strip ──────────────────────────────────────────────── */}
            <div className="bg-primary/90 overflow-x-auto">
              <div className="flex gap-0 max-w-7xl mx-auto">
                {SALE_DEALS.map((deal) => (
                  <button
                    type="button"
                    key={deal.title}
                    className={`flex-1 min-w-[160px] bg-gradient-to-r ${deal.color} py-2 px-4 text-white text-center hover:opacity-90 transition-opacity border-r border-white/10 last:border-0`}
                    data-ocid="nav.tab"
                  >
                    <span className="text-lg">{deal.icon}</span>
                    <span className="block text-xs font-bold">
                      {deal.title}
                    </span>
                    <span className="block text-[10px] text-white/80">
                      {deal.discount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 space-y-6">
              {/* ── Big Saving Days Banner ──────────────────────────────────────── */}
              <section
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700 px-6 md:px-12 py-8 md:py-12"
                data-ocid="sale.section"
              >
                {/* Decorative circles */}
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full" />
                <div className="absolute -right-8 -bottom-12 w-48 h-48 bg-purple-500/20 rounded-full" />
                <div className="absolute right-32 top-4 w-24 h-24 bg-yellow-400/10 rounded-full" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full mb-3">
                      <Zap className="w-3 h-3" /> BIG SAVING DAYS SALE
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                      UP TO <span className="text-yellow-400">80% OFF</span>
                    </h1>
                    <p className="text-blue-200 mt-2 text-sm md:text-base">
                      On Electronics, Fashion, Home & More
                    </p>
                    <Button
                      onClick={() => setActiveCategory("All")}
                      className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-6 py-2.5 rounded-full"
                      data-ocid="sale.primary_button"
                    >
                      Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {/* Countdown */}
                  <div className="shrink-0">
                    <p className="text-white/70 text-xs uppercase tracking-widest mb-3 text-center">
                      Sale Ends In
                    </p>
                    <div className="flex items-start gap-3">
                      <TimerBox value={saleTimer.days} label="Days" />
                      <span className="text-white text-2xl font-bold mt-1">
                        :
                      </span>
                      <TimerBox value={saleTimer.hours} label="Hours" />
                      <span className="text-white text-2xl font-bold mt-1">
                        :
                      </span>
                      <TimerBox value={saleTimer.mins} label="Mins" />
                      <span className="text-white text-2xl font-bold mt-1">
                        :
                      </span>
                      <TimerBox value={saleTimer.secs} label="Secs" />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Category Quick Nav ──────────────────────────────────────────── */}
              <section
                className="bg-white rounded-xl p-4 shadow-card"
                data-ocid="category.section"
              >
                <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("All")}
                    className={`flex flex-col items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-xl transition-all ${
                      activeCategory === "All"
                        ? "bg-primary text-white shadow-md"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                    data-ocid="category.tab"
                  >
                    <span className="text-2xl">🛍️</span>
                    <span className="text-xs font-medium whitespace-nowrap">
                      All
                    </span>
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.label}
                      onClick={() => setActiveCategory(cat.label as Category)}
                      className={`flex flex-col items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-xl transition-all ${
                        activeCategory === cat.label
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                      data-ocid="category.tab"
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs font-medium whitespace-nowrap">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Flash Deals ─────────────────────────────────────────────────── */}
              <section
                className="bg-white rounded-xl shadow-card overflow-hidden"
                data-ocid="flash.section"
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-500 fill-red-500" />
                    <h2 className="text-base font-bold text-gray-900">
                      Flash Deals
                    </h2>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-xs text-gray-500 mr-1">
                        Ending in
                      </span>
                      <FlashTimerBox value={flashTimer.hours} label="hr" />
                      <span className="text-gray-400 text-sm font-bold">:</span>
                      <FlashTimerBox value={flashTimer.mins} label="min" />
                      <span className="text-gray-400 text-sm font-bold">:</span>
                      <FlashTimerBox value={flashTimer.secs} label="sec" />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-primary text-sm font-semibold flex items-center gap-1"
                    data-ocid="flash.button"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex overflow-x-auto gap-3 p-4 scrollbar-none">
                  {flashDeals.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="shrink-0 w-36 text-left group"
                      data-ocid="flash.item.1"
                    >
                      <div className="relative rounded-lg overflow-hidden bg-gray-50 mb-2 h-36">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {discountPct(p.originalPrice, p.salePrice)}% OFF
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-tight">
                        {p.name}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {formatPrice(p.salePrice)}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Trending Brands ─────────────────────────────────────────────── */}
              <section
                className="bg-white rounded-xl p-4 shadow-card"
                data-ocid="brands.section"
              >
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  🔥 Trending Brands
                </h2>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {BRANDS.map((brand) => (
                    <button
                      type="button"
                      key={brand.name}
                      onClick={() => setSearchQuery(brand.name)}
                      className={`bg-gradient-to-br ${brand.color} ${brand.text} rounded-xl py-3 px-2 text-center font-bold text-xs hover:scale-105 transition-transform shadow-sm`}
                      data-ocid="brands.button"
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Products Grid ───────────────────────────────────────────────── */}
              <section data-ocid="products.section">
                {/* Filters */}
                <div className="bg-white rounded-xl p-4 shadow-card mb-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        className="pl-9 h-10 bg-gray-50 border-gray-200"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-ocid="products.search_input"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(
                        ["All", ...CATEGORIES.map((c) => c.label)] as (
                          | Category
                          | "All"
                        )[]
                      ).map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                            activeCategory === cat
                              ? "bg-primary text-white border-primary"
                              : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                          }`}
                          data-ocid="products.tab"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-medium">
                        Price Range
                      </span>
                      <span className="text-xs font-semibold text-primary">
                        {formatPrice(priceRange[0])} –{" "}
                        {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={150000}
                      step={500}
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v)}
                      className="w-full max-w-sm"
                    />
                  </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">
                    Showing <strong>{filteredProducts.length}</strong> products
                    {activeCategory !== "All" && (
                      <span>
                        {" "}
                        in <strong>{activeCategory}</strong>
                      </span>
                    )}
                  </p>
                  {(searchQuery || activeCategory !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("All");
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      data-ocid="products.button"
                    >
                      <X className="w-3 h-3" /> Clear filters
                    </button>
                  )}
                </div>

                {/* Grid */}
                {filteredProducts.length === 0 ? (
                  <div
                    className="bg-white rounded-xl p-12 text-center"
                    data-ocid="products.empty_state"
                  >
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No products found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try changing filters or search query
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredProducts.map((product, idx) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlist.includes(product.id)}
                        onAddToCart={() => addToCart(product)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                        onSelect={() => setSelectedProduct(product)}
                        idx={idx}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* ── Why SnapKart ────────────────────────────────────────────────── */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    icon: <Truck className="w-6 h-6" />,
                    title: "Free Delivery",
                    desc: "On orders above ₹499",
                    color: "text-blue-600",
                  },
                  {
                    icon: <RotateCcw className="w-6 h-6" />,
                    title: "Easy Returns",
                    desc: "10-day return policy",
                    color: "text-green-600",
                  },
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Secure Payments",
                    desc: "100% protected",
                    color: "text-purple-600",
                  },
                  {
                    icon: <Gift className="w-6 h-6" />,
                    title: "Best Offers",
                    desc: "Exclusive deals daily",
                    color: "text-orange-600",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-card"
                  >
                    <div className={item.color}>{item.icon}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </section>
            </main>

            {/* ── Footer ──────────────────────────────────────────────────────────── */}
            <footer className="bg-gray-900 text-gray-400 mt-8">
              <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-flipkart-yellow rounded-lg flex items-center justify-center">
                        <Store className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-white font-bold text-lg">
                        SnapKart
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      India's fastest growing e-commerce platform with the best
                      deals on electronics, fashion, and more.
                    </p>
                  </div>
                  {[
                    {
                      title: "About",
                      links: ["About Us", "Careers", "Press", "Blog"],
                    },
                    {
                      title: "Help",
                      links: ["Payments", "Shipping", "Cancellation", "FAQ"],
                    },
                    {
                      title: "Policy",
                      links: [
                        "Return Policy",
                        "Terms of Use",
                        "Privacy",
                        "Grievance",
                      ],
                    },
                  ].map((col) => (
                    <div key={col.title}>
                      <h4 className="text-white font-semibold text-sm mb-3">
                        {col.title}
                      </h4>
                      <ul className="space-y-1.5">
                        {col.links.map((link) => (
                          <li key={link}>
                            <a
                              href="/"
                              className="text-xs hover:text-white transition-colors"
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                  <p>
                    © {new Date().getFullYear()} SnapKart. All rights reserved.
                  </p>
                  <p>
                    Built with ❤️ using{" "}
                    <a
                      href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                      className="text-blue-400 hover:text-blue-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      caffeine.ai
                    </a>
                  </p>
                </div>
              </div>
            </footer>

            {/* ── Cart Drawer ─────────────────────────────────────────────────────── */}
            {cartOpen && (
              <div className="fixed inset-0 z-50 flex" data-ocid="cart.modal">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Close cart"
                  className="flex-1 bg-black/40"
                  onClick={() => setCartOpen(false)}
                  onKeyDown={(e) => e.key === "Escape" && setCartOpen(false)}
                />
                <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-bold text-lg text-gray-900">
                      My Cart ({cartCount})
                    </h2>
                    <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      data-ocid="cart.close_button"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  {cart.length === 0 ? (
                    <div
                      className="flex-1 flex flex-col items-center justify-center gap-3"
                      data-ocid="cart.empty_state"
                    >
                      <ShoppingCart className="w-16 h-16 text-gray-200" />
                      <p className="text-gray-500 font-medium">
                        Your cart is empty
                      </p>
                      <Button
                        onClick={() => setCartOpen(false)}
                        className="bg-primary"
                        data-ocid="cart.primary_button"
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.map((item, idx) => (
                          <div
                            key={item.product.id}
                            className="flex gap-3 bg-gray-50 rounded-lg p-3"
                            data-ocid={`cart.item.${idx + 1}`}
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.product.brand}
                              </p>
                              <p className="text-sm font-bold text-primary mt-1">
                                {formatPrice(item.product.salePrice)}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(item.product.id, -1)
                                  }
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                  data-ocid="cart.button"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-medium w-5 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(item.product.id, 1)
                                  }
                                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                  data-ocid="cart.button"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(item.product.id)
                                  }
                                  className="ml-auto text-red-400 hover:text-red-600"
                                  data-ocid="cart.delete_button"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t bg-gray-50">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-bold text-gray-900">
                            {formatPrice(cartTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-green-600 mb-3">
                          <span>You save</span>
                          <span className="font-semibold">
                            {formatPrice(
                              cart.reduce(
                                (s, i) =>
                                  s +
                                  (i.product.originalPrice -
                                    i.product.salePrice) *
                                    i.quantity,
                                0,
                              ),
                            )}
                          </span>
                        </div>
                        <Button
                          className="w-full bg-primary hover:bg-blue-700 font-bold"
                          onClick={() => {
                            if (!isLoggedIn) {
                              setCartOpen(false);
                              setLoginOpen(true);
                            } else {
                              setCartOpen(false);
                              setCheckoutOpen(true);
                            }
                          }}
                          data-ocid="cart.submit_button"
                        >
                          <CreditCard className="w-4 h-4 mr-2" /> Place Order —{" "}
                          {formatPrice(cartTotal)}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Wishlist Drawer ──────────────────────────────────────────────────── */}
            {wishlistOpen && (
              <div
                className="fixed inset-0 z-50 flex"
                data-ocid="wishlist.modal"
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Close wishlist"
                  className="flex-1 bg-black/40"
                  onClick={() => setWishlistOpen(false)}
                  onKeyDown={(e) =>
                    e.key === "Escape" && setWishlistOpen(false)
                  }
                />
                <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-bold text-lg text-gray-900">
                      Wishlist ({wishlist.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => setWishlistOpen(false)}
                      data-ocid="wishlist.close_button"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                  {wishlist.length === 0 ? (
                    <div
                      className="flex-1 flex flex-col items-center justify-center gap-3"
                      data-ocid="wishlist.empty_state"
                    >
                      <Heart className="w-16 h-16 text-gray-200" />
                      <p className="text-gray-500 font-medium">
                        Your wishlist is empty
                      </p>
                      <Button
                        onClick={() => setWishlistOpen(false)}
                        className="bg-primary"
                        data-ocid="wishlist.primary_button"
                      >
                        Explore Products
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {wishlist.map((id, idx) => {
                        const p = PRODUCTS.find((pr) => pr.id === id);
                        if (!p) return null;
                        return (
                          <div
                            key={id}
                            className="flex gap-3 bg-gray-50 rounded-lg p-3"
                            data-ocid={`wishlist.item.${idx + 1}`}
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-16 h-16 object-cover rounded-lg shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-500">{p.brand}</p>
                              <p className="text-sm font-bold text-primary mt-1">
                                {formatPrice(p.salePrice)}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  className="bg-primary text-xs h-7 px-3"
                                  onClick={() => {
                                    addToCart(p);
                                    toggleWishlist(id);
                                  }}
                                  data-ocid="wishlist.button"
                                >
                                  Add to Cart
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => toggleWishlist(id)}
                                  className="text-red-400 hover:text-red-600"
                                  data-ocid="wishlist.delete_button"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Product Detail Modal ─────────────────────────────────────────────── */}
            {selectedProduct && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                data-ocid="product.modal"
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Close"
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setSelectedProduct(null)}
                  onKeyDown={(e) =>
                    e.key === "Escape" && setSelectedProduct(null)
                  }
                />
                <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                    data-ocid="product.close_button"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="bg-gray-50 rounded-tl-2xl rounded-bl-2xl overflow-hidden">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <Badge
                        className={`${getCategoryColor(selectedProduct.category)} text-xs mb-2`}
                      >
                        {selectedProduct.category}
                      </Badge>
                      <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        {selectedProduct.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {selectedProduct.brand}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedProduct.description}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <StarRating rating={selectedProduct.rating} size="lg" />
                        <span className="text-sm font-bold text-gray-800">
                          {selectedProduct.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({selectedProduct.reviewCount.toLocaleString()}{" "}
                          reviews)
                        </span>
                      </div>

                      <div className="mt-4 flex items-end gap-3">
                        <span className="text-3xl font-extrabold text-primary">
                          {formatPrice(selectedProduct.salePrice)}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(selectedProduct.originalPrice)}
                        </span>
                        <Badge className="bg-green-100 text-green-700 font-bold">
                          {discountPct(
                            selectedProduct.originalPrice,
                            selectedProduct.salePrice,
                          )}
                          % OFF
                        </Badge>
                      </div>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        You save{" "}
                        {formatPrice(
                          selectedProduct.originalPrice -
                            selectedProduct.salePrice,
                        )}
                        !
                      </p>
                      {selectedProduct.salePrice > 5000 && (
                        <p className="text-xs text-blue-500 mt-1">
                          EMI from ₹999/month
                        </p>
                      )}

                      <div className="flex gap-2 mt-5">
                        <Button
                          className="flex-1 bg-primary hover:bg-blue-700 font-bold"
                          onClick={() => {
                            addToCart(selectedProduct);
                            setSelectedProduct(null);
                          }}
                          data-ocid="product.primary_button"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          className={`px-3 border-2 ${
                            wishlist.includes(selectedProduct.id)
                              ? "border-red-400 text-red-500"
                              : "border-gray-200"
                          }`}
                          onClick={() => toggleWishlist(selectedProduct.id)}
                          data-ocid="product.toggle"
                        >
                          <Heart
                            className={`w-4 h-4 ${wishlist.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : ""}`}
                          />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <Truck className="w-4 h-4" />
                          <span>Free Delivery</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-600">
                          <RotateCcw className="w-4 h-4" />
                          <span>10-day return</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-purple-600">
                          <Shield className="w-4 h-4" />
                          <span>Warranty</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="border-t border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Customer Reviews
                    </h3>
                    <div className="space-y-3">
                      {productReviews.map((rev) => (
                        <div
                          key={rev.user + rev.date}
                          className="bg-gray-50 rounded-xl p-3"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                              {rev.user[0]}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {rev.user}
                            </span>
                            <StarRating rating={rev.rating} />
                            <span className="text-xs text-gray-400 ml-auto">
                              {rev.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{rev.comment}</p>
                        </div>
                      ))}
                    </div>

                    {/* Write review */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">
                        Write a Review
                      </h4>
                      {isLoggedIn ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                type="button"
                                key={s}
                                onClick={() => setNewReviewRating(s)}
                                data-ocid="product.toggle"
                              >
                                <Star
                                  className={`w-5 h-5 ${s <= newReviewRating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none outline-none focus:border-primary"
                            rows={3}
                            placeholder="Share your experience..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            data-ocid="product.textarea"
                          />
                          <Button
                            size="sm"
                            className="bg-primary"
                            onClick={() => {
                              toast.success("Review submitted!");
                              setReviewText("");
                            }}
                            data-ocid="product.submit_button"
                          >
                            Submit Review
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            Login to write a review
                          </p>
                          <Button
                            size="sm"
                            className="bg-primary"
                            onClick={() => setLoginOpen(true)}
                            data-ocid="product.button"
                          >
                            Login
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Login Modal ──────────────────────────────────────────────────────── */}
            {loginOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                data-ocid="login.modal"
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Close login"
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setLoginOpen(false)}
                  onKeyDown={(e) => e.key === "Escape" && setLoginOpen(false)}
                />
                <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
                  <button
                    type="button"
                    onClick={() => setLoginOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    data-ocid="login.close_button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Sign In to SnapKart
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Access your orders, wishlist & exclusive deals
                  </p>
                  <Button
                    className="w-full bg-primary hover:bg-blue-700 font-bold h-12 text-base"
                    onClick={() => {
                      login();
                      setLoginOpen(false);
                    }}
                    disabled={loginStatus === "logging-in"}
                    data-ocid="login.submit_button"
                  >
                    {loginStatus === "logging-in" ? "Signing In..." : "Sign In"}
                  </Button>
                  <p className="text-xs text-gray-400 mt-4">
                    Secure • Private • Fast
                  </p>
                </div>
              </div>
            )}
          </>
        ) /* end page === "store" */
      }
    </div>
  );
}

// ─── ProductCard Component ────────────────────────────────────────────────────
function ProductCard({
  product,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onSelect,
  idx,
}: {
  product: Product;
  isWishlisted: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onSelect: () => void;
  idx: number;
}) {
  const discount = discountPct(product.originalPrice, product.salePrice);
  const savings = product.originalPrice - product.salePrice;

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
      data-ocid={`products.item.${idx + 1}`}
    >
      {/* Image */}
      <button
        type="button"
        className="relative block w-full overflow-hidden bg-gray-50 h-44"
        onClick={onSelect}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Discount badge */}
        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {discount}% OFF
        </div>
        {/* Wishlist */}
        <button
          type="button"
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow transition-colors ${
            isWishlisted ? "bg-red-50" : "bg-white/90 hover:bg-red-50"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          data-ocid="products.toggle"
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`}
          />
        </button>
        {/* Flash deal badge */}
        {product.isFlashDeal && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-yellow-400 text-gray-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            <Zap className="w-2.5 h-2.5" /> FLASH
          </div>
        )}
      </button>

      {/* Content */}
      <div className="p-3">
        {/* Category badge */}
        <span
          className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1.5 ${getCategoryColor(product.category)}`}
        >
          {product.category}
        </span>
        <p className="text-[11px] text-gray-400 font-medium">{product.brand}</p>
        <button
          type="button"
          className="text-sm font-semibold text-gray-900 line-clamp-2 text-left leading-tight mt-0.5 hover:text-primary transition-colors"
          onClick={onSelect}
        >
          {product.name}
        </button>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-1 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {product.rating} <Star className="w-2.5 h-2.5 fill-white" />
          </div>
          <span className="text-[11px] text-gray-400">
            ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-gray-900">
              {formatPrice(product.salePrice)}
            </span>
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          </div>
          <p className="text-xs text-green-600 font-medium">
            Save {formatPrice(savings)}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
            <Truck className="w-3 h-3" /> Free Delivery
          </span>
          {product.salePrice > 5000 && (
            <span className="text-[10px] text-blue-500">• EMI ₹999/mo</span>
          )}
        </div>

        {/* Add to cart */}
        <Button
          size="sm"
          className="w-full bg-primary hover:bg-blue-700 font-semibold text-xs h-8 mt-3 rounded-lg"
          onClick={onAddToCart}
          data-ocid="products.button"
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Add to Cart
        </Button>
      </div>
    </div>
  );
}
