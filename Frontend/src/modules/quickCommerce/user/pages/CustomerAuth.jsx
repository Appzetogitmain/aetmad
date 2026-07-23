import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/context/AuthContext';
import { useSettings } from '@core/context/SettingsContext';
import {
    Phone,
    ShieldCheck,
    User,
    ShoppingBag,
    ChevronRight,
    MapPin,
    Zap,
    Utensils,
    Smartphone,
    ShoppingBasket,
    Heart,
    Star,
    ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { customerApi } from '../services/customerApi';

const CATEGORIES = [
    {
        title: "Grocery",
        icon: <ShoppingBasket size={28} />,
        color: "#DCFCE7",
        ring: "#22C55E",
        text: "#15803D",
        theme: "#10B981",
        shadow: "rgba(16, 185, 129, 0.3)",
        img: ""
    },
    {
        title: "Store",
        icon: <Smartphone size={28} />,
        color: "#F0FDFA",
        ring: "#2DD4BF",
        text: "#0F766E",
        theme: "#0D9488",
        shadow: "rgba(13, 148, 136, 0.3)",
        img: ""
    },
    {
        title: "Food",
        icon: <Utensils size={28} />,
        color: "#ECFDF5",
        ring: "#34D399",
        text: "#047857",
        theme: "#059669",
        shadow: "rgba(5, 150, 105, 0.3)",
        img: ""
    },
    {
        title: "Health",
        icon: <ShieldCheck size={28} />,
        color: "#F7FEE7",
        ring: "#A3E635",
        text: "#4D7C0F",
        theme: "#84CC16",
        shadow: "rgba(132, 204, 22, 0.3)",
        img: "" // Hands holding heart visual
    },
];

const CustomerAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [timer, setTimer] = useState(0);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const { login } = useAuth();
    const { settings } = useSettings();
    const appName = settings?.appName || 'App';
    const logoUrl = settings?.logoUrl || '';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: '',
        otp: '',
        name: ''
    });

    const activeCategory = CATEGORIES[carouselIndex];

    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex((prev) => (prev + 1) % CATEGORIES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        if (formData.phone.length !== 10) {
            toast.error('Enter valid 10-digit number');
            return;
        }
        setIsLoading(true);
        try {
            if (isLogin) {
                await customerApi.sendLoginOtp({ phone: formData.phone });
            } else {
                await customerApi.sendSignupOtp({ name: formData.name, phone: formData.phone });
            }
            setShowOtp(true);
            setTimer(30);
            toast.success('OTP sent!');
        } catch (error) {
            toast.error('Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (formData.otp.length !== 4) {
            toast.error('Enter 4-digit code');
            return;
        }
        setIsLoading(true);
        try {
            const response = await customerApi.verifyOtp({ phone: formData.phone, otp: formData.otp });
            const { token, customer } = response.data.result;
            login({ ...customer, token, role: 'customer' });
            toast.success('Successfully Logged In!');
            navigate('/');
        } catch (error) {
            toast.error('Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex font-sans overflow-hidden selection:bg-[#b21c45]/20">
            {/* Desktop Left: Luxury Graphic */}
            <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#fff0f3] via-white to-[#fcfcfc] border-r border-[#b21c45]/10 items-center justify-center p-12">
                <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-gradient-to-br from-[#b21c45]/5 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-gradient-to-tl from-[#e0b83e]/10 to-transparent rounded-full blur-[60px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')] opacity-[0.3] pointer-events-none mix-blend-multiply"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_15px_50px_rgba(178,28,69,0.15)] overflow-hidden border-[2px] border-[#b21c45]/10 p-1 mb-8"
                    >
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <ShoppingBag className="w-16 h-16 text-[#b21c45]" />
                        )}
                    </motion.div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight text-[#1A1C23]" style={{ fontFamily: 'serif' }}>
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">{appName}</span>
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Your premium destination for fast delivery of groceries, food, and essentials.</p>
                </div>
            </div>

            {/* Right/Mobile: Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 relative w-full lg:max-w-xl z-20">
                {/* Mobile-only background blur */}
                <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-[#fff0f3] to-white opacity-80 pointer-events-none"></div>
                <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[50%] lg:hidden bg-[#b21c45]/5 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(178,28,69,0.1)] overflow-hidden border border-[#b21c45]/10 mb-4">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full p-1" />
                            ) : (
                                <ShoppingBag className="w-10 h-10 text-[#b21c45]" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'serif' }}>
                            {appName}
                        </h1>
                    </div>

                    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100 lg:border-transparent lg:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AnimatePresence mode="wait">
                            {!showOtp ? (
                                <motion.div
                                    key="main-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <div className="mb-6 flex bg-[#FAFAFA] rounded-xl p-1.5 border border-gray-100">
                                        <button
                                            onClick={() => setIsLogin(true)}
                                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white shadow-sm text-[#b21c45]' : 'text-gray-400'}`}
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={() => setIsLogin(false)}
                                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white shadow-sm text-[#b21c45]' : 'text-gray-400'}`}
                                        >
                                            Sign Up
                                        </button>
                                    </div>

                                    <div className="mb-8">
                                        <h2 className="text-[26px] font-bold text-[#1A1C23] tracking-tight mb-2" style={{ fontFamily: 'serif' }}>
                                            {isLogin ? 'Welcome Back' : 'Create Account'}
                                        </h2>
                                        <p className="text-sm text-gray-500">Enter your details to continue</p>
                                    </div>

                                    <form onSubmit={handleSendOtp} className="space-y-6">
                                        {!isLogin && (
                                            <div className="flex items-center border border-gray-200 rounded-[14px] p-2 bg-[#FAFAFA] focus-within:border-[#b21c45]/50 focus-within:ring-2 focus-within:ring-[#b21c45]/10 transition-all duration-300">
                                                <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                                                    <User className="w-4 h-4 text-[#b21c45]" />
                                                </div>
                                                <input
                                                    required
                                                    name="name"
                                                    placeholder="Full Name"
                                                    className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center border border-gray-200 rounded-[14px] p-2 bg-[#FAFAFA] focus-within:border-[#b21c45]/50 focus-within:ring-2 focus-within:ring-[#b21c45]/10 transition-all duration-300">
                                            <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                                                <Phone className="w-4 h-4 text-[#b21c45]" />
                                            </div>
                                            <div className="flex items-center px-3 border-r border-gray-200">
                                                <span className="text-sm text-gray-700 font-bold">+91</span>
                                            </div>
                                            <input
                                                required
                                                name="phone"
                                                maxLength={10}
                                                inputMode="numeric"
                                                placeholder="Mobile Number"
                                                value={formData.phone}
                                                className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full py-4 rounded-[14px] font-bold text-base transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                                                !isLoading
                                                ? "bg-[#b21c45] hover:bg-[#8a1535] text-white shadow-[0_10px_30px_rgba(178,28,69,0.3)] hover:shadow-[0_15px_40px_rgba(178,28,69,0.4)] active:scale-[0.98]"
                                                : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                                            }`}
                                        >
                                            {!isLoading && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                                            )}
                                            {isLoading ? 'Sending...' : 'Continue'}
                                            {!isLoading && <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="otp-form"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <button
                                            onClick={() => setShowOtp(false)}
                                            className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div>
                                            <h2 className="text-[22px] font-bold text-[#1A1C23] tracking-tight" style={{ fontFamily: 'serif' }}>Verify Phone</h2>
                                            <p className="text-xs text-gray-500 font-medium mt-1">Code sent to +91 {formData.phone}</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                                        <div className="flex justify-between gap-3">
                                            {[...Array(4)].map((_, i) => (
                                                <input
                                                    key={i}
                                                    type="tel"
                                                    maxLength={1}
                                                    className="w-14 h-16 bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl text-center text-2xl font-black outline-none focus:bg-white focus:border-[#b21c45]/50 focus:ring-4 focus:ring-[#b21c45]/10 transition-all text-[#1A1C23]"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Backspace' && !e.target.value && i > 0) {
                                                            e.target.previousElementSibling.focus();
                                                        }
                                                    }}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val && i < 3) (e.target.nextElementSibling).focus();
                                                        const otpArr = formData.otp.split('');
                                                        otpArr[i] = val;
                                                        setFormData({ ...formData, otp: otpArr.join('') });
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading || formData.otp.length !== 4}
                                                className={`w-full py-4 rounded-[14px] font-bold text-base transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                                                    (!isLoading && formData.otp.length === 4)
                                                    ? "bg-[#b21c45] hover:bg-[#8a1535] text-white shadow-[0_10px_30px_rgba(178,28,69,0.3)] hover:shadow-[0_15px_40px_rgba(178,28,69,0.4)] active:scale-[0.98]"
                                                    : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                                                }`}
                                            >
                                                {!isLoading && formData.otp.length === 4 && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                                                )}
                                                {isLoading ? 'Verifying...' : 'Verify & Enter'}
                                            </button>
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    disabled={timer > 0}
                                                    onClick={handleSendOtp}
                                                    className={`text-[12px] font-bold transition-colors ${timer > 0 ? 'text-gray-400' : 'text-[#b21c45] hover:text-[#8a1535]'}`}
                                                >
                                                    {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400 text-xs font-medium leading-relaxed">
                                By continuing, you agree to our <br />
                                <a href="/terms" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Terms & Conditions</a>
                                , <a href="/privacy" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                            &copy; {new Date().getFullYear()} {appName.toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerAuth;
