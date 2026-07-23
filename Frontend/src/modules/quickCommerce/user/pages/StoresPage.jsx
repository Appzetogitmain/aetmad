import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../services/customerApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, ArrowRight, Sparkles } from 'lucide-react';

const StoreCard = ({ store }) => {
    return (
        <div className="flex flex-col group w-full cursor-pointer h-full relative isolate rounded-[20px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(178,28,69,0.08)] transition-all duration-500 overflow-hidden border border-black/5 hover:border-[#b21c45]/20">
            {/* Image Container */}
            <div className="w-full aspect-[4/3] relative overflow-hidden bg-[#FAFAFA]">
                {store.image ? (
                    <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30">
                        <Store className="w-10 h-10 text-[#b21c45]" strokeWidth={1} />
                    </div>
                )}
                
                {/* Elegant Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                
                {/* Premium Badge */}
                <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-white/95 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 border border-black/5 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b21c45] shadow-[0_0_8px_#b21c45]"></span>
                    <span className="text-[8px] md:text-[9px] font-bold text-[#b21c45] uppercase tracking-[0.2em]">Open Now</span>
                </div>
                
                {/* Image Bottom Info */}
                <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 flex items-center gap-1.5 opacity-90">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={2} />
                    <span className="text-[10px] md:text-[12px] text-white font-medium tracking-wide drop-shadow-md">Delivery in 10-15 mins</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-3 md:p-5 flex flex-col flex-1 relative z-10 bg-white">
                <h3 className="text-[14px] md:text-[17px] font-bold text-gray-900 line-clamp-1 group-hover:text-[#b21c45] transition-colors duration-300 tracking-wide" style={{ fontFamily: 'serif' }}>
                    {store.name}
                </h3>
                
                {/* Luxury Hover Arrow */}
                <div className="absolute top-1/2 -translate-y-1/2 right-3 md:right-4 w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#b21c45] to-[#8a1535] shadow-[0_4px_15px_rgba(178,28,69,0.3)] flex items-center justify-center translate-x-4 md:translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
            </div>
        </div>
    );
};

const StoresPage = () => {
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStores = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await customerApi.getStores();
            if (res.data && res.data.success) {
                setStores(res.data.results || []);
            }
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    return (
        <div className="min-h-screen bg-[#FDFDFD] transition-colors duration-500 font-sans selection:bg-[#b21c45]/20">
            <div className="max-w-[1400px] mx-auto px-3 md:px-8 pt-6 md:pt-14 pb-24">
                
                {/* Light Luxury Hero Banner - Richer Version */}
                <div className="relative mb-8 md:mb-16 overflow-hidden rounded-[24px] md:rounded-[40px] bg-gradient-to-br from-[#fff0f3] via-white to-[#fcfcfc] border border-[#b21c45]/10 shadow-[0_20px_60px_rgba(178,28,69,0.06)]">
                    {/* Ambient elegant glows */}
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-gradient-to-br from-[#b21c45]/10 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-gradient-to-tl from-[#e0b83e]/15 to-transparent rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')] opacity-[0.35] pointer-events-none mix-blend-multiply"></div>
                    
                    <div className="relative z-10 px-6 py-12 md:p-16 lg:p-24 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                        <div className="text-[#0a0a0a] max-w-2xl text-center md:text-left flex flex-col items-center md:items-start">
                            
                            {/* Premium Bold Pill */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 md:mb-6 rounded-full bg-[#b21c45] shadow-[0_4px_15px_rgba(178,28,69,0.3)] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                                <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                                <span className="text-[9px] md:text-[10px] text-white font-bold uppercase tracking-[0.3em]">Exclusive Selection</span>
                            </div>
                            
                            {/* Luxury Heading */}
                            <h1 className="text-[36px] sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight leading-[1.05]" style={{ fontFamily: 'serif' }}>
                                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535] drop-shadow-md">Aetmad</span> Collection
                            </h1>
                            
                            {/* Elegant Divider (Mobile Only) */}
                            <div className="w-20 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#b21c45]/40 to-transparent mb-5 md:hidden"></div>
                            
                            {/* Refined Subtitle */}
                            <p className="text-[14px] md:text-lg text-gray-700 font-medium leading-relaxed max-w-sm md:max-w-lg mx-auto md:mx-0 tracking-[0.01em]">
                                Experience ultra-fast delivery from the finest curated boutiques and stores in your exclusive neighborhood.
                            </p>
                        </div>
                        
                        <div className="hidden lg:flex items-center justify-center w-56 h-56 rounded-full bg-white border border-[#b21c45]/20 shadow-[0_10px_60px_rgba(178,28,69,0.15)] shrink-0 relative isolate">
                            <div className="absolute inset-0 rounded-full border-[2px] border-[#b21c45]/15 m-3"></div>
                            <Store className="w-24 h-24 text-[#b21c45]" strokeWidth={1} />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode='wait'>
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-64"
                        >
                            <div className="w-16 h-16 border-[3px] border-gray-100 border-t-[#b21c45] rounded-full animate-spin shadow-[0_0_30px_rgba(178,28,69,0.1)]" />
                        </motion.div>
                    ) : stores.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#b21c45]/5 rounded-full blur-[60px]"></div>
                            <div className="relative z-10 w-28 h-28 mb-8 rounded-full bg-[#FAFAFA] border border-gray-100 flex items-center justify-center shadow-lg">
                                <Store className="w-12 h-12 text-gray-300" strokeWidth={1} />
                            </div>
                            <h2 className="relative z-10 text-2xl md:text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'serif' }}>No Boutiques Available</h2>
                            <p className="relative z-10 text-gray-500 font-light max-w-md text-sm md:text-base tracking-wide px-4">Our premium network is currently expanding. Please check back later for exclusive store access in your area.</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-8"
                        >
                            {stores.map((store) => (
                                <Link
                                    key={store.id}
                                    to={`/quick/stores/${store.id}`}
                                    state={{ storeName: store.name }}
                                    className="block h-full"
                                >
                                    <StoreCard store={store} />
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StoresPage;
