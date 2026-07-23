import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Store, Phone, KeyRound, ArrowLeft, Loader2, ConciergeBell, Soup, Utensils, Home } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@food/components/ui/button";
import { useCompanyName } from "@food/hooks/useCompanyName";
import { setAuthData } from "@food/utils/auth";
import { useAuth } from "@core/context/AuthContext";
import { sellerApi } from "../services/sellerApi";
import { loadBusinessSettings, getCachedSettings } from "@common/utils/businessSettings";
import SuperfastLogo from "@/assets/restaurant_logo.webp";

const DEFAULT_COUNTRY_CODE = "+91";

export default function SellerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const companyName = useCompanyName();
  const [step, setStep] = useState("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState(() => sessionStorage.getItem("sellerAuthPhone") || "");
  const [otp, setOtp] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState(() => getCachedSettings()?.logo?.url || null)
  const [keyboardInset, setKeyboardInset] = useState(0)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await loadBusinessSettings()
        if (settings?.logo?.url) setLogoUrl(settings.logo.url)
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



  const nextSellerPath =
    typeof location.state?.from === "string" &&
    location.state.from.startsWith("/seller")
      ? location.state.from
      : "/seller";

  const maskedPhone = useMemo(() => {
    if (phone.length < 4) return `${DEFAULT_COUNTRY_CODE} ${phone}`;
    return `${DEFAULT_COUNTRY_CODE} ${phone.slice(0, 2)}******${phone.slice(-2)}`;
  }, [phone]);

  const validatePhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length !== 10) return "Enter a valid 10-digit mobile number";
    if (!["6", "7", "8", "9"].includes(digits[0])) return "Enter a valid Indian mobile number";
    return "";
  };

  const handleSendOtp = async () => {

    const validation = validatePhone(phone);
    if (validation) {
      toast.error(validation);
      return;
    }

    try {
      setIsLoading(true);
      const fullPhone = `${DEFAULT_COUNTRY_CODE} ${phone}`.trim();
      const response = await sellerApi.requestOtp(fullPhone);
      const payload = response?.data?.result || response?.data?.data || response?.data || {};
      const devOtp = payload?.otp || null;
      const deliveryMode = payload?.deliveryMode || "sms";
      const resolvedPhone = String(payload?.phone || fullPhone).trim();

      toast.success("OTP sent to your seller number.");
      setOtpPhone(resolvedPhone);
      setOtp("");
      setStep("otp");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = String(otp || "").replace(/\D/g, "").slice(0, 4);
    if (code.length !== 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }

    try {
      setIsLoading(true);
      const verifyPhone = String(otpPhone || `${DEFAULT_COUNTRY_CODE} ${phone}`.trim()).trim();
      const response = await sellerApi.verifyOtp(verifyPhone, code);
      const data = response?.data?.result || response?.data?.data || response?.data || {};
      const accessToken = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken || null;
      const sellerUser = data?.seller || data?.user || data?.data?.seller || data?.data?.user;

      if (!accessToken) {
        throw new Error("Login succeeded but no access token was returned");
      }

      setAuthData("seller", accessToken, sellerUser, refreshToken);

      login({
        ...sellerUser,
        name:
          sellerUser?.name ||
          "Seller",
        shopName:
          sellerUser?.shopName ||
          sellerUser?.name ||
          "Store",
        phone:
          sellerUser?.phone ||
          `${DEFAULT_COUNTRY_CODE} ${phone}`.trim(),
        email: sellerUser?.email || "",
        token: accessToken,
        role: "seller",
      });
      toast.success(
        sellerUser?.approved === false
          ? "OTP verified. Continue your seller setup."
          : "Seller login successful",
      );
      navigate(
        sellerUser?.approved === false && sellerUser?.onboardingSubmitted !== true
          ? "/seller/onboarding"
          : nextSellerPath
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled =
    isLoading ||
    (step === "phone" && phone.length !== 10) ||
    (step === "otp" && otp.length !== 4);

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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Seller</span> Portal
          </h1>
          <p className="text-lg text-gray-500 font-medium">Manage your premium boutique, fulfill orders instantly, and grow your exclusive business with Aetmad.</p>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b21c45] to-[#8a1535]">Seller</span> Portal
            </h1>
          </div>

          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-gray-100 lg:border-transparent lg:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            {step === "phone" ? (
              <>
                <div className="mb-8">
                  <h2 className="text-[26px] font-bold text-[#1A1C23] tracking-tight mb-2" style={{ fontFamily: 'serif' }}>Welcome Back</h2>
                  <p className="text-sm text-gray-500">Enter your phone number to access your dashboard</p>
                </div>

                <div className="space-y-6">
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
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(val);
                        sessionStorage.setItem("sellerAuthPhone", val);
                      }}
                      className="w-full bg-transparent px-3 py-2 text-[15px] text-gray-900 font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>

                  <Button
                    onClick={handleSendOtp}
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
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-white/70" />
                    ) : (
                      <>
                        Get Verification Code
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setOtpPhone("");
                  }}
                  className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#b21c45] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="mb-8">
                  <h2 className="text-[26px] font-bold text-[#1A1C23] tracking-tight mb-2" style={{ fontFamily: 'serif' }}>Verify OTP</h2>
                  <p className="text-sm text-gray-500">
                    Sent to <span className="text-[#b21c45] font-semibold">{maskedPhone}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between gap-3 sm:gap-4 max-w-[280px] mx-auto">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={otp[index] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          let newOtp = otp.split("");
                          newOtp[index] = val;
                          setOtp(newOtp.join("").slice(0, 4));
                          if (val && index < 3) {
                            e.target.nextElementSibling?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[index] && index > 0) {
                            e.target.previousElementSibling?.focus();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
                          if (pastedData) {
                            setOtp(pastedData);
                          }
                        }}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-100 rounded-[14px] bg-[#FAFAFA] focus:bg-white focus:border-[#b21c45] focus:ring-4 focus:ring-[#b21c45]/10 text-gray-900 transition-all outline-none"
                      />
                    ))}
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
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
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-white/70" />
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-xs font-medium leading-relaxed">
                By continuing, you agree to our <br />
                <a href="/seller/terms" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Terms & Conditions</a>
                , <a href="/seller/privacy" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Privacy Policy</a>
                {" "}and{" "}
                <a href="/seller/support" className="text-gray-600 font-semibold hover:text-[#b21c45] transition-colors">Support</a>
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
  );
}




