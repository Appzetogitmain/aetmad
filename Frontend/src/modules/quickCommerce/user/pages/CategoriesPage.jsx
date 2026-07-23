import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../services/customerApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LayoutGrid } from 'lucide-react';

const COLORS = [
    "#FDF2F2", "#F2F9F2", "#F2F2FD", "#FDFDF2",
    "#F2FDFD", "#FDF2FD", "#FFF8F0", "#F0FFF8"
];

const CategoryCard = ({ category }) => {
    return (
        <div className="flex flex-col items-center group w-full cursor-pointer h-full relative">
            <div className="w-full aspect-square bg-white shadow-[0_8px_25px_rgba(0,0,0,0.03)] group-hover:shadow-[0_15px_35px_rgba(178,28,69,0.08)] rounded-[20px] md:rounded-[24px] flex items-center justify-center p-3 md:p-5 mb-2 md:mb-3 transition-all duration-500 overflow-hidden border border-black/5 group-hover:border-[#b21c45]/20 group-hover:-translate-y-1 relative isolate">
                {/* Subtle Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAFA] to-white pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-[150%] h-[150%] bg-gradient-to-tl from-[#b21c45]/5 to-transparent rounded-full blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-700 ease-in-out relative z-10"
                />
            </div>
            
            {/* Title */}
            <span className="text-[11px] md:text-[13px] font-bold text-gray-800 text-center leading-tight line-clamp-2 px-1 group-hover:text-[#b21c45] transition-colors duration-300 tracking-wide">
                {category.name}
            </span>
        </div>
    );
};

const CategoriesPage = () => {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await customerApi.getCategories({ tree: true });
            if (res.data.success) {
                const results = res.data.results || res.data.result || [];
                const allCategories = Array.isArray(results) ? results : [];

                const headers = allCategories.filter(cat => !cat.parentId || (cat.children && cat.children.length > 0));

                const formattedGroups = headers
                    .filter((header) => (header.name || '').trim().toLowerCase() !== 'all')
                    .map((header, idx) => {
                        let subs = header.children && header.children.length > 0
                            ? header.children
                            : allCategories.filter(cat => cat.parentId === header._id);

                        if (subs.length === 0) return null;

                        return {
                            id: header._id || idx,
                            title: header.name,
                            categories: subs.map((cat, cIdx) => ({
                                id: cat._id || `${idx}-${cIdx}`,
                                name: cat.name,
                                image: cat.image || "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/layout-engine/2022-11/Slice-1_9.png",
                                color: COLORS[(idx + cIdx) % COLORS.length]
                            }))
                        };
                    }).filter(Boolean);

                setGroups(formattedGroups);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return (
        <div className="min-h-screen bg-[#FDFDFD] transition-colors duration-500 font-sans selection:bg-[#b21c45]/20">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6 md:pt-14 pb-24">
                
                {/* Light Luxury Hero Banner - Richer Version */}
                <div className="relative mb-8 md:mb-16 overflow-hidden rounded-[24px] md:rounded-[40px] bg-gradient-to-br from-[#fff0f3] via-white to-[#fcfcfc] border border-[#b21c45]/10 shadow-[0_20px_60px_rgba(178,28,69,0.06)]">
                    {/* Ambient elegant glows */}
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-gradient-to-br from-[#b21c45]/10 to-transparent rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-gradient-to-tl from-[#e0b83e]/15 to-transparent rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')] opacity-[0.35] pointer-events-none mix-blend-multiply"></div>
                    
                    <div className="relative z-10 px-6 py-10 md:p-16 lg:p-24 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                        <div className="text-[#0a0a0a] max-w-2xl text-center md:text-left flex flex-col items-center md:items-start">
                            
                            {/* Premium Bold Pill */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 md:mb-6 rounded-full bg-[#b21c45] shadow-[0_4px_15px_rgba(178,28,69,0.3)] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                                <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-white" strokeWidth={2.5} />
                                <span className="text-[9px] md:text-[10px] text-white font-bold uppercase tracking-[0.3em]">Exclusive Selection</span>
                            </div>
                            
                            {/* Luxury Heading */}
                            <h1 className="text-[34px] sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 tracking-tight leading-[1.05]" style={{ fontFamily: 'serif' }}>
                                Aetmad <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535] drop-shadow-md">Categories</span>
                            </h1>
                            
                            {/* Elegant Divider (Mobile Only) */}
                            <div className="w-20 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#b21c45]/40 to-transparent mb-5 md:hidden"></div>
                            
                            {/* Refined Subtitle */}
                            <p className="text-[13px] md:text-lg text-gray-700 font-medium leading-relaxed max-w-sm md:max-w-lg mx-auto md:mx-0 tracking-[0.01em]">
                                Explore our finely curated selection of categories to find exactly what you desire.
                            </p>
                        </div>
                        
                        <div className="hidden lg:flex items-center justify-center w-48 h-48 rounded-full bg-white border border-[#b21c45]/20 shadow-[0_10px_60px_rgba(178,28,69,0.15)] shrink-0 relative isolate">
                            <div className="absolute inset-0 rounded-full border-[2px] border-[#b21c45]/15 m-3"></div>
                            <LayoutGrid className="w-20 h-20 text-[#b21c45]" strokeWidth={1.5} />
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
                    ) : (
                        <div className="space-y-12 md:space-y-16">
                            {groups.map((group, groupIdx) => (
                                <motion.section
                                    key={group.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: groupIdx * 0.1, ease: "easeOut" }}
                                    className="space-y-6 md:space-y-8 relative"
                                >
                                    <div className="flex items-center gap-4 mb-4 md:mb-6 pt-2">
                                        <h2 className="text-[24px] md:text-[28px] font-bold text-[#1A1C23] capitalize tracking-tight" style={{ fontFamily: 'serif' }}>
                                            {group.title}
                                        </h2>
                                        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#b21c45]/20 to-transparent"></div>
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-3 gap-y-6 md:gap-x-5 md:gap-y-8">
                                        {group.categories.map((category) => (
                                            <Link
                                                key={category.id}
                                                to={`/quick/categories/${category.id}`}
                                                state={{ categoryName: category.name }}
                                                className="block"
                                            >
                                                <CategoryCard
                                                    category={category}
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                </motion.section>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CategoriesPage;
