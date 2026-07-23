import React, { useEffect, useState, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Phone, ArrowRight, ShieldCheck, Loader2, UserRound, Zap, HeadphonesIcon, ShoppingBag, ChevronLeft, ChevronRight, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { authAPI, userAPI } from "@food/api"
import { isModuleAuthenticated, setAuthData } from "@food/utils/auth"
import { useAuth } from "@core/context/AuthContext"
import AuthBrandHeader from "../components/AuthBrandHeader"
import { SUPERFAST_BRAND } from "../constants/brand"

export default function UnifiedOTPFastLogin() {
  const RESEND_COOLDOWN_SECONDS = 60
  const [phoneNumber, setPhoneNumber] = useState(() => sessionStorage.getItem("userLoginPhone") || "")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [showNameInput, setShowNameInput] = useState(false)
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState("")
  const location = useLocation()
  const navigate = useNavigate()
  const { login: globalLogin } = useAuth()
  const submitting = useRef(false)
  const searchParams = new URLSearchParams(location.search)
  const referralCode = searchParams.get("ref") || ""
  const [keyboardInset, setKeyboardInset] = useState(0)

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



  const fromPath = typeof location.state?.from === "string" ? location.state.from : (location.state?.from?.pathname || "/portal")
  const fromSearch = typeof location.state?.from === "object" ? (location.state?.from?.search || "") : ""
  const redirectTo = fromPath + fromSearch

  useEffect(() => {
    if (!isModuleAuthenticated("user")) return
    navigate(redirectTo, { replace: true })
  }, [navigate, redirectTo])

  const clearNameFlow = () => {
    setShowNameInput(false)
    setName("")
    setNameError("")
  }

  const normalizedPhone = () => {
    const digits = String(phoneNumber).replace(/\D/g, "").slice(-10)
    return digits.length === 10 ? digits : ""
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    const phone = normalizedPhone()
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }
    if (submitting.current) return
    submitting.current = true
    setLoading(true)
    try {
      clearNameFlow()
      await authAPI.sendOTP(phoneNumber, "login", null)
      setOtpSent(true)
      setOtp("")
      setStep(2)
      setResendTimer(RESEND_COOLDOWN_SECONDS)
      toast.success("OTP sent! Check your phone.")
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to send OTP."
      toast.error(msg)
    } finally {
      setLoading(false)
      submitting.current = false
    }
  }

  const handleResendOTP = async () => {
    const phone = normalizedPhone()
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }
    if (resendTimer > 0 || submitting.current) return
    submitting.current = true
    setLoading(true)
    try {
      clearNameFlow()
      await authAPI.sendOTP(phoneNumber, "login", null)
      setOtp("")
      setOtpSent(true)
      setResendTimer(RESEND_COOLDOWN_SECONDS)
      toast.success("OTP resent successfully.")
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to resend OTP."
      toast.error(msg)
    } finally {
      setLoading(false)
      submitting.current = false
    }
  }

  const handleEditNumber = () => {
    setStep(1)
    setOtp("")
    setResendTimer(0)
    clearNameFlow()
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const phone = normalizedPhone()
    const otpDigits = String(otp).replace(/\D/g, "").slice(0, 4)
    if (otpDigits.length !== 4) {
      toast.error("Please enter the 4-digit OTP")
      return
    }
    if (submitting.current) return
    submitting.current = true
    setLoading(true)
    try {
      // Try to get FCM token before verifying OTP
      let fcmToken = null;
      let platform = "web";
      try {
        if (typeof window !== "undefined") {
          if (window.flutter_inappwebview) {
            platform = "mobile";
            const handlerNames = ["getFcmToken", "getFCMToken", "getPushToken", "getFirebaseToken"];
            for (const handlerName of handlerNames) {
              try {
                const t = await window.flutter_inappwebview.callHandler(handlerName, { module: "user" });
                if (t && typeof t === "string" && t.length > 20) {
                  fcmToken = t.trim();
                  break;
                }
              } catch (e) { }
            }
          } else {
            fcmToken = localStorage.getItem("fcm_web_registered_token_user") || null;
          }
        }
      } catch (e) {
        console.warn("Failed to get FCM token during login", e);
      }

      const response = await authAPI.verifyOTP(
        phoneNumber,
        otpDigits,
        "login",
        null,
        null,
        "user",
        null,
        referralCode,
        fcmToken,
        platform
      )
      const data = response?.data?.data || response?.data || {}
      const accessToken = data.accessToken
      const refreshToken = data.refreshToken || null
      const user = data.user

      if (!accessToken || !user) {
        throw new Error("Invalid response from server")
      }

      const hasName =
        user.name &&
        String(user.name).trim().length > 0 &&
        String(user.name).toLowerCase() !== "null"
      const needsName = data.isNewUser === true || !hasName

      if (needsName) {
        setAuthData("user", accessToken, user, refreshToken)
        window.dispatchEvent(new Event("userAuthChanged"))
        setShowNameInput(true)
        setLoading(false)
        submitting.current = false
        return
      }

      setAuthData("user", accessToken, user, refreshToken)
      globalLogin({ ...user, token: accessToken, role: 'customer' })
      window.dispatchEvent(new Event("userAuthChanged"))
      toast.success("Login successful!")
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const status = err?.response?.status
      let msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Invalid OTP. Please try again."
      if (status === 401) {
        if (/deactivat(ed|e)/i.test(String(msg))) {
          msg = "Your account is deactivated. Please contact support."
        } else {
          msg = "Invalid or expired code, or account not active."
        }
      }
      toast.error(msg)
    } finally {
      setLoading(false)
      submitting.current = false
    }
  }

  const handleSubmitName = async (e) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError("Please enter your name")
      return
    }

    if (trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters")
      return
    }

    if (submitting.current) return
    submitting.current = true
    setLoading(true)
    setNameError("")

    try {
      const response = await userAPI.updateProfile({ name: trimmedName })
      const updatedUser =
        response?.data?.data?.user ||
        response?.data?.user ||
        response?.data?.data ||
        response?.data
      const storedToken = localStorage.getItem("user_accessToken") || localStorage.getItem("accessToken")
      const storedRefreshToken = localStorage.getItem("user_refreshToken") || null

      if (!storedToken || !updatedUser) {
        throw new Error("Invalid response from server")
      }

      setAuthData("user", storedToken, updatedUser, storedRefreshToken)
      globalLogin({ ...updatedUser, token: storedToken, role: 'customer' })
      window.dispatchEvent(new Event("userAuthChanged"))
      clearNameFlow()
      toast.success("Profile saved successfully!")
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const status = err?.response?.status
      let msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to save your name."
      if (status === 401) {
        msg = "Invalid or expired code, or account not active."
      }
      toast.error(msg)
    } finally {
      setLoading(false)
      submitting.current = false
    }
  }

  useEffect(() => {
    if (step !== 2 || resendTimer <= 0) return
    const intervalId = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [step, resendTimer])

  const formatResendTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const isSubmitDisabled =
    loading ||
    (step === 1 && !showNameInput && phoneNumber.length !== 10) ||
    (showNameInput && name.trim().length === 0) ||
    (step === 2 && !showNameInput && otp.length !== 4)

  return (
    <div 
      className="h-[100dvh] bg-[#FDFDFD] flex font-sans overflow-hidden selection:bg-[#b21c45]/20"
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
            <ShoppingBag className="w-16 h-16 text-[#b21c45]" />
          </motion.div>
          <h1 className="text-5xl font-black mb-4 tracking-tight text-[#1A1C23]" style={{ fontFamily: 'serif' }}>
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Aetmad</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium">Your premium destination for fast delivery of groceries, food, and essentials.</p>
        </div>
      </div>

      {/* Right/Mobile: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative w-full lg:max-w-xl z-20 overflow-y-auto no-scrollbar">
        {/* Mobile-only background blur */}
        <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-[#fff0f3] to-white opacity-80 pointer-events-none"></div>
        <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[50%] lg:hidden bg-[#b21c45]/5 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(178,28,69,0.1)] overflow-hidden border border-[#b21c45]/10 mb-4">
              <ShoppingBag className="w-10 h-10 text-[#b21c45]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#1A1C23] text-center" style={{ fontFamily: 'serif' }}>
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Aetmad</span>
            </h1>
          </div>

          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100 lg:border-transparent lg:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="phone-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="mb-8">
                    <h2 className="text-[26px] font-bold text-[#1A1C23] tracking-tight mb-2" style={{ fontFamily: 'serif' }}>
                      Welcome Back
                    </h2>
                    <p className="text-sm text-gray-500">Login or Signup to continue</p>
                  </div>

                  <form onSubmit={handleSendOTP} className="space-y-6">
                    <div className="flex items-center border border-gray-200 rounded-[14px] p-2 bg-[#FAFAFA] focus-within:border-[#b21c45]/50 focus-within:ring-2 focus-within:ring-[#b21c45]/10 transition-all duration-300">
                      <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                        <Phone className="w-4 h-4 text-[#b21c45]" />
                      </div>
                      <div className="flex items-center px-3 border-r border-gray-200">
                        <span className="text-sm text-gray-700 font-bold">+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        autoFocus
                        maxLength={10}
                        inputMode="numeric"
                        placeholder="Mobile Number"
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setPhoneNumber(val);
                          sessionStorage.setItem("userLoginPhone", val);
                        }}
                        className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>

                    <div className="flex items-start gap-2 pt-1 px-1">
                      <div className="shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-500 leading-tight font-medium">
                        We will send success notifications and order updates via SMS
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className={`w-full py-4 rounded-[14px] font-bold text-base transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                        !isSubmitDisabled
                        ? "bg-[#b21c45] hover:bg-[#8a1535] text-white shadow-[0_10px_30px_rgba(178,28,69,0.3)] hover:shadow-[0_15px_40px_rgba(178,28,69,0.4)] active:scale-[0.98]"
                        : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                      }`}
                    >
                      {!isSubmitDisabled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                      )}
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                      ) : (
                        <>
                          Get Verification Code
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : showNameInput ? (
                <motion.div
                  key="name-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="mb-8">
                    <h2 className="text-[26px] font-bold text-[#1A1C23] tracking-tight mb-2" style={{ fontFamily: 'serif' }}>
                      Create Account
                    </h2>
                    <p className="text-sm text-gray-500">Please provide your full name</p>
                  </div>

                  <form onSubmit={handleSubmitName} className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <div className={`flex items-center border ${nameError ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'} rounded-[14px] p-2 bg-[#FAFAFA] focus-within:border-[#b21c45]/50 focus-within:ring-2 focus-within:ring-[#b21c45]/10 transition-all duration-300`}>
                        <div className="bg-white p-2.5 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                          <User className="w-4 h-4 text-[#b21c45]" />
                        </div>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value)
                            if (nameError) setNameError("")
                          }}
                          placeholder="Full Name"
                          className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
                        />
                      </div>
                      {nameError && (
                        <p className="text-[10px] font-semibold text-red-500 px-2 mt-1">{nameError}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className={`w-full py-4 rounded-[14px] font-bold text-base transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                        !isSubmitDisabled
                        ? "bg-[#b21c45] hover:bg-[#8a1535] text-white shadow-[0_10px_30px_rgba(178,28,69,0.3)] hover:shadow-[0_15px_40px_rgba(178,28,69,0.4)] active:scale-[0.98]"
                        : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                      }`}
                    >
                      {!isSubmitDisabled && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                      )}
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                      ) : (
                        <>
                          Save Name & Continue
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
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
                      onClick={handleEditNumber}
                      className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div>
                      <h2 className="text-[22px] font-bold text-[#1A1C23] tracking-tight" style={{ fontFamily: 'serif' }}>Verify Phone</h2>
                      <p className="text-xs text-gray-500 font-medium mt-1">Code sent to +91 {phoneNumber}</p>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-8">
                    <div className="flex justify-between gap-3">
                      {[0, 1, 2, 3].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="tel"
                          inputMode="numeric"
                          required
                          autoFocus={index === 0}
                          maxLength={1}
                          value={otp[index] || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(-1);
                            if (!val) return;
                            const newOtp = otp.split("");
                            newOtp[index] = val;
                            const combined = newOtp.join("").slice(0, 4);
                            setOtp(combined);
    
                            if (index < 3 && val) {
                              document.getElementById(`otp-${index + 1}`)?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                              if (!otp[index] && index > 0) {
                                document.getElementById(`otp-${index - 1}`)?.focus();
                              } else {
                                const newOtp = otp.split("");
                                newOtp[index] = "";
                                setOtp(newOtp.join(""));
                              }
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
                            if (pasteData) {
                              setOtp(pasteData);
                              document.getElementById(`otp-${Math.min(pasteData.length, 3)}`)?.focus();
                            }
                          }}
                          className="w-14 h-16 bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl text-center text-2xl font-black outline-none focus:bg-white focus:border-[#b21c45]/50 focus:ring-4 focus:ring-[#b21c45]/10 transition-all text-[#1A1C23]"
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className={`w-full py-4 rounded-[14px] font-bold text-base transition-all flex items-center justify-center gap-2 group relative overflow-hidden ${
                          !isSubmitDisabled
                          ? "bg-[#b21c45] hover:bg-[#8a1535] text-white shadow-[0_10px_30px_rgba(178,28,69,0.3)] hover:shadow-[0_15px_40px_rgba(178,28,69,0.4)] active:scale-[0.98]"
                          : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                        }`}
                      >
                        {!isSubmitDisabled && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                        )}
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                        ) : (
                          <>Verify & Continue</>
                        )}
                      </button>
                      <div className="flex justify-center">
                        {resendTimer > 0 ? (
                          <p className="text-[12px] font-bold text-gray-400">
                            Resend code in {formatResendTimer(resendTimer)}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="text-[12px] font-bold text-[#b21c45] hover:text-[#8a1535] transition-colors"
                          >
                            Resend Now
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-xs font-medium leading-relaxed">
                By continuing, you agree to our <br />
                <Link to="/food/user/profile/terms" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Terms & Conditions</Link>
                , <Link to="/food/user/profile/privacy" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              &copy; {new Date().getFullYear()} AETMAD
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
