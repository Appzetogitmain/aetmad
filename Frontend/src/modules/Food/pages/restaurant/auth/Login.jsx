import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, Phone, ArrowRight, Loader2, ConciergeBell, Soup, Utensils, Home } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { restaurantAPI } from "@food/api"
import { useCompanyName } from "@food/hooks/useCompanyName"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { loadBusinessSettings, getCachedSettings } from "@common/utils/businessSettings"

const DEFAULT_COUNTRY_CODE = "+91"
const countryCodes = [
  { code: DEFAULT_COUNTRY_CODE, country: "IN", flag: "India" },
]

export default function RestaurantLogin() {
  const companyName = useCompanyName()
  const navigate = useNavigate()
  const phoneInputRef = useRef(null)
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem("restaurantLoginPhone")
    return {
      phone: saved || "",
      countryCode: DEFAULT_COUNTRY_CODE,
    }
  })
  const [error, setError] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [keyboardInset, setKeyboardInset] = useState(0)
  const [logoUrl, setLogoUrl] = useState(() => getCachedSettings()?.portals?.restaurant?.logo?.url || getCachedSettings()?.logo?.url || null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await loadBusinessSettings()
        if (settings?.portals?.restaurant?.logo?.url) {
          setLogoUrl(settings.portals.restaurant.logo.url)
        } else if (settings?.logo?.url) {
          setLogoUrl(settings.logo.url)
        }
      } catch (e) {}
    }
    fetchSettings()
  }, [])


  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return undefined

    const updateKeyboardInset = () => {
      const viewport = window.visualViewport
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      setKeyboardInset(inset > 0 ? inset : 0)
    }

    updateKeyboardInset()
    window.visualViewport.addEventListener("resize", updateKeyboardInset)
    window.visualViewport.addEventListener("scroll", updateKeyboardInset)

    return () => {
      window.visualViewport.removeEventListener("resize", updateKeyboardInset)
      window.visualViewport.removeEventListener("scroll", updateKeyboardInset)
    }
  }, [])

  useEffect(() => {
    if (keyboardInset > 0) {
      ensurePhoneFieldVisible()
    }
  }, [keyboardInset])

  const validatePhone = (phone, countryCode) => {
    if (!phone || phone.trim() === "") return "Phone number is required"

    const digitsOnly = phone.replace(/\D/g, "")
    if (digitsOnly.length < 7) return "Phone number must be at least 7 digits"
    if (digitsOnly.length > 15) return "Phone number is too long"

    if (digitsOnly.length !== 10) return "Indian phone number must be 10 digits"
    if (!["6", "7", "8", "9"].includes(digitsOnly[0])) {
      return "Invalid Indian mobile number"
    }

    return ""
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
    setFormData((prev) => ({ ...prev, phone: value }))
    sessionStorage.setItem("restaurantLoginPhone", value)

    if (error) {
      setError(validatePhone(value, formData.countryCode))
    }
  }

  const ensurePhoneFieldVisible = () => {
    // Wait for keyboard to animate in
    window.setTimeout(() => {
      phoneInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }, 300)
  }

  const handleSendOTP = async () => {
    const phoneError = validatePhone(formData.phone, formData.countryCode)
    setError(phoneError)
    if (phoneError) return

    const fullPhone = `${formData.countryCode || DEFAULT_COUNTRY_CODE} ${formData.phone}`.trim()

    try {
      setIsSending(true)
      await restaurantAPI.sendOTP(fullPhone, "login")

      const authData = {
        method: "phone",
        phone: fullPhone,
        isSignUp: false,
        module: "restaurant",
      }
      sessionStorage.setItem("restaurantAuthData", JSON.stringify(authData))
      navigate("/food/restaurant/otp")
    } catch (apiErr) {
      const message =
        apiErr?.response?.data?.message ||
        apiErr?.response?.data?.error ||
        "Failed to send OTP. Please try again."
      toast.error(message)
      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  const isValidPhone = !validatePhone(formData.phone, formData.countryCode)

  return (
    <div
      className="min-h-screen bg-[#FDFDFD] flex font-sans overflow-hidden selection:bg-[#b21c45]/20"
      style={{ paddingBottom: keyboardInset ? `${keyboardInset}px` : undefined }}
    >
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
              <Utensils className="w-16 h-16 text-[#b21c45]" />
            )}
          </motion.div>
          <h1 className="text-5xl font-black mb-4 tracking-tight text-[#1A1C23]" style={{ fontFamily: 'serif' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Restaurant</span> Partner
          </h1>
          <p className="text-lg text-gray-500 font-medium">Manage your culinary creations, view incoming orders, and delight your customers with Aetmad.</p>
        </div>
      </div>

      {/* Right/Mobile: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative w-full lg:max-w-xl z-20">
        {/* Mobile-only background blur */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-[#fff0f3] to-white opacity-80 pointer-events-none"></div>
        <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[50%] lg:hidden bg-[#b21c45]/5 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10" id="login-content">
          {/* Mobile Logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(178,28,69,0.1)] overflow-hidden border border-[#b21c45]/10 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-full p-1" />
              ) : (
                <Utensils className="w-10 h-10 text-[#b21c45]" />
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'serif' }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Restaurant</span> Partner
            </h1>
          </div>

          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100 lg:border-transparent lg:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-[#1A1C23] tracking-tight mb-2" style={{ fontFamily: 'serif' }}>Welcome Back</h2>
              <p className="text-sm text-gray-500">Enter your phone number to access your restaurant dashboard</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center border border-gray-200 rounded-[14px] p-2 bg-[#FAFAFA] focus-within:border-[#b21c45]/50 focus-within:ring-2 focus-within:ring-[#b21c45]/10 transition-all duration-300">
                  <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                    <Phone className="w-4 h-4 text-[#b21c45]" />
                  </div>
                  <div className="flex items-center px-3 border-r border-gray-200">
                    <span className="text-sm text-gray-700 font-bold">+91</span>
                  </div>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                {error && (
                  <p className="text-[11px] font-semibold text-red-500 px-1">{error}</p>
                )}
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={!isValidPhone || isSending}
                className={`w-full py-6 rounded-[14px] font-bold text-base transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                  isValidPhone && !isSending
                  ? "bg-[#b21c45] hover:bg-[#8a1535] text-white shadow-[0_10px_30px_rgba(178,28,69,0.3)] hover:shadow-[0_15px_40px_rgba(178,28,69,0.4)] active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                }`}
              >
                {isValidPhone && !isSending && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                )}
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-white/70" />
                ) : (
                  <>
                    Get Verification Code
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-xs font-medium leading-relaxed">
                By continuing, you agree to our <br />
                <a href="/food/restaurant/terms" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Terms & Conditions</a>
                , <a href="/food/restaurant/privacy" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Privacy Policy</a>
                {" "}and{" "}
                <a href="/food/restaurant/support" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Support</a>
              </p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
             <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                &copy; {new Date().getFullYear()} {companyName.toUpperCase()}
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
