import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@core/context/AuthContext';
import { useSettings } from '@core/context/SettingsContext';
import { UserRole } from '@core/constants/roles';
import {
    Mail,
    Lock,
    User,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import Lottie from 'lottie-react';
import backendAnimation from '../../../assets/Backend Icon.json';
import { adminApi } from '../services/adminApi';

const AdminAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const appName = settings?.appName || 'App';
    const logoUrl = settings?.logoUrl || '';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        adminCode: '',
        phone: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'password') {
            const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
            setFormData({ ...formData, [name]: cleaned });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pwd = (formData.password || '').trim();
        if (!/^[a-zA-Z0-9]{6}$/.test(pwd)) {
            toast.error('Password must be exactly 6 characters (digits or letters only).');
            return;
        }
        setIsLoading(true);

        try {
            const response = isLogin
                ? await adminApi.login({ email: formData.email, password: formData.password })
                : await adminApi.signup({ name: formData.name, email: formData.email, password: formData.password });

            const { token, refreshToken, admin } = response.data.result;

            const authData = {
                ...admin,
                token,
                refreshToken,
                role: 'admin'
            };

            console.log('Login successful! Auth Data:', authData);

            login(authData);

            toast.success(isLogin ? 'Welcome back, Administrator.' : 'Administrator Account Created.');
            navigate('/admin/quick-commerce');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
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
                            <ShieldCheck className="w-16 h-16 text-[#b21c45]" />
                        )}
                    </motion.div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight text-[#1A1C23]" style={{ fontFamily: 'serif' }}>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Admin</span> Portal
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Manage the entire Aetmad ecosystem with unparalleled control and visibility.</p>
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
                                <ShieldCheck className="w-10 h-10 text-[#b21c45]" />
                            )}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'serif' }}>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Admin</span> Portal
                        </h1>
                    </div>

                    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100 lg:border-transparent lg:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                            >
                                <div className="mb-8 text-center">
                                    <h2 className="text-[26px] font-bold text-[#1A1C23] tracking-tight mb-2" style={{ fontFamily: 'serif' }}>
                                        {isLogin ? 'Welcome Back' : 'Create Account'}
                                    </h2>
                                    <p className="text-sm text-gray-500">Enter your credentials to access the dashboard</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <AnimatePresence mode="popLayout">
                                        {!isLogin && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className="flex items-center border border-gray-200 rounded-[14px] p-2 bg-[#FAFAFA] focus-within:border-[#b21c45]/50 focus-within:ring-2 focus-within:ring-[#b21c45]/10 transition-all duration-300">
                                                    <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                                                        <User className="w-4 h-4 text-[#b21c45]" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        required
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="Full Name"
                                                        className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex items-center border border-gray-200 rounded-[14px] p-2 bg-[#FAFAFA] focus-within:border-[#b21c45]/50 focus-within:ring-2 focus-within:ring-[#b21c45]/10 transition-all duration-300">
                                        <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                                            <Mail className="w-4 h-4 text-[#b21c45]" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Username or email"
                                            className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
                                        />
                                    </div>

                                    <div className="flex items-center border border-gray-200 rounded-[14px] p-2 bg-[#FAFAFA] focus-within:border-[#b21c45]/50 focus-within:ring-2 focus-within:ring-[#b21c45]/10 transition-all duration-300">
                                        <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                                            <Lock className="w-4 h-4 text-[#b21c45]" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            minLength={6}
                                            maxLength={6}
                                            autoComplete="current-password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="6 digit / letter PIN"
                                            className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal tracking-[0.2em]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-4 mt-2 rounded-[14px] font-bold text-base transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                                            !isLoading
                                            ? "bg-[#b21c45] hover:bg-[#8a1535] text-white shadow-[0_10px_30px_rgba(178,28,69,0.3)] hover:shadow-[0_15px_40px_rgba(178,28,69,0.4)] active:scale-[0.98]"
                                            : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                                        }`}
                                    >
                                        {!isLoading && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                                        )}
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                        ) : (
                                            <>
                                                {isLogin ? 'Login Now' : 'Create Account'}
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                            &copy; {new Date().getFullYear()} Protected by {appName.toUpperCase()} Security
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;
