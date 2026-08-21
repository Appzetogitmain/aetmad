import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Wallet, Sparkles } from 'lucide-react';

/**
 * OrderSummaryModal - Luxury Dark Emerald Theme.
 * Post-delivery success screen displaying actual driver earnings.
 */
export const OrderSummaryModal = ({ order, onDone }) => {
  const earnings =
    order?.earnings ||
    order?.riderEarning ||
    order?.pricing?.deliveryFee ||
    order?.deliveryFee ||
    order?.expectedEarning ||
    (order?.orderAmount ? order.orderAmount * 0.1 : 0) ||
    25;

  const orderRef = order?.orderId || order?.displayOrderId || 'FOD-Order';

  return (
    <div className="fixed inset-0 z-[160] bg-gradient-to-b from-[#0B3122] via-[#082217] to-[#04120c] overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-sm text-center relative z-10 my-auto"
      >
        {/* Animated Success Badge */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-full h-full bg-white dark:bg-[#141414] rounded-full flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.3)] border-2 border-emerald-400/40">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
          </div>
        </div>
        
        <h1 className="text-white text-4xl sm:text-5xl font-black mb-1.5 tracking-tight drop-shadow-sm">
          Well Done!
        </h1>
        <p className="text-emerald-200/90 text-sm sm:text-base font-medium mb-8">
          Trip completed successfully.
        </p>

        {/* Earnings Card */}
        <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl text-gray-900 dark:text-white border border-white/20 dark:border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <p className="text-gray-400 dark:text-gray-400 text-xs font-black uppercase tracking-[0.18em]">
              Earnings Added
            </p>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          
          <p className="text-gray-950 dark:text-white text-5xl sm:text-6xl font-black my-4 tracking-tight">
            ₹{Number(earnings).toFixed(2)}
          </p>
          
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold border border-emerald-100 dark:border-emerald-800/30">
            <Wallet className="w-4 h-4" />
            <span>Transferred to Rider Wallet</span>
          </div>
        </div>

        {/* Go Back Home Action */}
        <button 
          type="button"
          onClick={onDone}
          className="w-full h-14 sm:h-16 bg-white hover:bg-gray-100 text-emerald-950 font-black text-lg rounded-2xl flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-xl shadow-black/20"
        >
          <span>Go Back Home</span>
          <ArrowRight className="w-5 h-5 text-emerald-700" strokeWidth={2.5} />
        </button>

        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-8">
          Order Reference: {orderRef}
        </p>
      </motion.div>
    </div>
  );
};
