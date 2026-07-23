import { useState, useEffect, useRef } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { ShieldCheck, Phone, ArrowRight, Loader2, ConciergeBell, Soup, Utensils, Home } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { deliveryAPI } from "@food/api"
import { clearModuleAuth, isModuleAuthenticated } from "@food/utils/auth"
import { useCompanyName } from "@food/hooks/useCompanyName"
import { toast } from "sonner"
import { motion } from "framer-motion"
import SuperfastLogo from "@/assets/zozomenLogo.png"
import { loadBusinessSettings, getCachedSettings } from "@common/utils/businessSettings"
const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}


// Common country codes
const countryCodes = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
]

export default function DeliverySignIn() {
  const companyName = useCompanyName()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const referralCode = searchParams.get("ref") || ""
  const [formData, setFormData] = useState(() => {
    return {
      phone: sessionStorage.getItem("deliverySignInPhone") || "",
      countryCode: "+91",
    }
  })

  // Pre-fill form from sessionStorage if data exists (e.g., when coming back from OTP)
  useEffect(() => {
    const stored = sessionStorage.getItem("deliveryAuthData")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.phone) {
          // Extract digits after +91
          const phoneDigits = data.phone.replace("+91", "").trim()
          setFormData(prev => ({
            ...prev,
            phone: phoneDigits
          }))
        }
      } catch (err) {
        debugError("Error parsing stored auth data:", err)
      }
    }
  }, [])
  const [error, setError] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [logoUrl, setLogoUrl] = useState(() => getCachedSettings()?.portals?.delivery?.logo?.url || getCachedSettings()?.logo?.url || null)
  const [keyboardInset, setKeyboardInset] = useState(0)

  useEffect(() => {
    if (isModuleAuthenticated("delivery")) {
      navigate("/food/delivery", { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await loadBusinessSettings()
        if (settings?.portals?.delivery?.logo?.url) {
          setLogoUrl(settings.portals.delivery.logo.url)
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



  // Get selected country details dynamically
  const selectedCountry = countryCodes.find(c => c.code === formData.countryCode) || countryCodes[2] // Default to India (+91)

  const validatePhone = (phone, countryCode) => {
    if (!phone || phone.trim() === "") {
      return "Phone number is required"
    }

    const digitsOnly = phone.replace(/\D/g, "")

    if (digitsOnly.length < 7) {
      return "Phone number must be at least 7 digits"
    }

    // India-specific validation
    // India-specific validation (Fixed to +91 only)
    if (digitsOnly.length !== 10) {
      return "Phone number must be exactly 10 digits"
    }

    return ""
  }

  const handleSendOTP = async () => {
    setError("")

    const phoneError = validatePhone(formData.phone, formData.countryCode)
    if (phoneError) {
      setError(phoneError)
      return
    }

    const fullPhone = `${formData.countryCode} ${formData.phone}`.trim()

    try {
      setIsSending(true)
      // Start a fresh login flow and prevent stale-token auto redirects.
      clearModuleAuth("delivery")

      // Call backend to send OTP for delivery login
      await deliveryAPI.sendOTP(fullPhone, "login")

      // Store auth data in sessionStorage for OTP page
      const authData = {
        method: "phone",
        phone: fullPhone,
        isSignUp: false,
        purpose: "login",
        module: "delivery",
      }
      sessionStorage.setItem("deliveryAuthData", JSON.stringify(authData))
      
      if (referralCode) {
        try {
          const existingSignupDetails = JSON.parse(sessionStorage.getItem("deliverySignupDetails") || "{}")
          sessionStorage.setItem("deliverySignupDetails", JSON.stringify({
            ...existingSignupDetails,
            ref: referralCode
          }))
        } catch (e) {}
      }

      // Navigate to OTP page
      navigate("/food/delivery/otp", { replace: true })
    } catch (err) {
      debugError("Send OTP Error:", err)
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send OTP. Please try again."
      toast.error(message)
      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  const handlePhoneChange = (e) => {
    // Only allow digits and limit to 10 digits
    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
    setFormData({
      ...formData,
      phone: value,
    })
    sessionStorage.setItem("deliverySignInPhone", value)
  }

  const handleCountryCodeChange = (value) => {
    setFormData({
      ...formData,
      countryCode: value,
    })
  }

  const isValidPhone = !validatePhone(formData.phone, formData.countryCode)
  const isSubmitDisabled = isSending || !isValidPhone;

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
            <img src={logoUrl || SuperfastLogo} alt="Logo" className="w-full h-full object-cover rounded-full" />
          </motion.div>
          <h1 className="text-5xl font-black mb-4 tracking-tight text-[#1A1C23]" style={{ fontFamily: 'serif' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Delivery</span> Partner
          </h1>
          <p className="text-lg text-gray-500 font-medium">Join our elite delivery fleet. Enjoy flexible hours, great earnings, and a premium experience.</p>
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
               <img src={logoUrl || SuperfastLogo} alt="Logo" className="w-full h-full object-cover rounded-full p-1" />
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'serif' }}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Delivery</span> Partner
            </h1>
          </div>

          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100 lg:border-transparent lg:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-[#1A1C23] tracking-tight mb-2" style={{ fontFamily: 'serif' }}>Welcome Back</h2>
              <p className="text-sm text-gray-500">Enter your phone number to access your deliveries</p>
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
                disabled={isSubmitDisabled}
                className={`w-full py-6 rounded-[14px] font-bold text-base transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                  !isSubmitDisabled
                  ? "bg-[#b21c45] hover:bg-[#8a1535] text-white shadow-[0_10px_30px_rgba(178,28,69,0.3)] hover:shadow-[0_15px_40px_rgba(178,28,69,0.4)] active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                }`}
              >
                {!isSubmitDisabled && (
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
                <Link to="/food/delivery/terms" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Terms & Conditions</Link>
                , <Link to="/food/delivery/privacy" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Privacy Policy</Link>
                {" "}and{" "}
                <Link to="/food/delivery/support" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Support</Link>
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


