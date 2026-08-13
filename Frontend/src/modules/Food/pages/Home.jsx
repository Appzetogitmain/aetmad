import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Utensils } from "lucide-react"
import { motion } from "framer-motion"
import { getCachedSettings, loadBusinessSettings } from "@common/utils/businessSettings"

export default function Home({ onComplete }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [logoUrl, setLogoUrl] = useState(() => getCachedSettings()?.logo?.url || null)
  const [companyName, setCompanyName] = useState(() => getCachedSettings()?.companyName || "Aetmad")

  useEffect(() => {
    const loadLogo = async () => {
      const cached = getCachedSettings()
      if (cached) {
        if (cached.logo?.url) setLogoUrl(cached.logo.url)
        if (cached.companyName) setCompanyName(cached.companyName)
      } else {
        const settings = await loadBusinessSettings()
        if (settings) {
          if (settings.logo?.url) setLogoUrl(settings.logo.url)
          if (settings.companyName) setCompanyName(settings.companyName)
        }
      }
    }
    loadLogo()
  }, [])

  // Splash Screen automatic redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate(`/food/user${location.search}`, { replace: true })
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate, location.search]) // Removed onComplete from dependencies to prevent infinite loop

  return (
    <div className="h-[100dvh] w-full bg-[#064e3b] relative overflow-hidden flex flex-col items-center justify-center">
      
      {/* Cartoon-like Animated Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#064e3b] via-[#022c22] to-[#064e3b] opacity-90"></div>
        
        {/* Floating Cartoon Bubbles/Shapes */}
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-20 h-20 bg-emerald-400/20 rounded-full blur-[8px]"
        />
        <motion.div 
          animate={{ y: [0, 40, 0], x: [0, -20, 0], rotate: [0, -15, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[15%] w-32 h-32 bg-emerald-300/10 rounded-full blur-[10px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] right-[10%] w-16 h-16 bg-emerald-500/20 rounded-[40%] blur-[6px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[30%] left-[10%] w-24 h-24 bg-white/5 rounded-3xl blur-[12px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-6">
        
        {/* Pulsing Center Logo */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1.5 
          }}
          className="flex flex-col items-center"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1], boxShadow: ["0px 0px 0px rgba(16,185,129,0)", "0px 0px 50px rgba(16,185,129,0.4)", "0px 0px 0px rgba(16,185,129,0)"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-full flex items-center justify-center p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[4px] border-emerald-400/30 overflow-hidden relative"
          >
            {/* Shimmer effect across the logo container */}
            <motion.div 
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-20"
            />
            
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="w-full h-full object-contain rounded-full relative z-10"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <Utensils className="w-24 h-24 text-emerald-600 relative z-10" />
            )}
          </motion.div>
        </motion.div>

        {/* Loading / Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-12 text-center"
        >
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200 tracking-tight drop-shadow-lg" style={{ fontFamily: 'serif' }}>
            {companyName || "Aetmad"}
          </h2>
          <div className="flex items-center justify-center mt-6 gap-2">
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
