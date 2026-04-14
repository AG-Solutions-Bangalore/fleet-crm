import { LOGIN } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { setCredentials } from "@/store/auth/authSlice";
import { setCompanyDetails } from "@/store/auth/companySlice";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoginForm from "./login-form";
import { toast } from "sonner";
import Carousel from "./carousel";
import hero1 from "../../assets/hero1.png";
import hero2 from "../../assets/hero2.jpeg";
import hero3 from "../../assets/hero3.png";

const slides = [
  {
    image: hero1,
    title: "Our Smart Solutions",
    description:
      "Our Smart Home Devices open up a world of endless possibilities. Dive into the extraordinary, where control and customization know no bounds.",
    stat: "500+",
    statLabel: "Clients",
  },
  {
    image: hero2,
    title: "Home Security Camera System",
    description:
      "Unlock the power of seamless control and vigilant monitoring with our Home Security System in Bangalore. Gain peace of mind knowing that your home is secure no matter where you are.",
    stat: "100+",
    statLabel: "Premium Security",
  },
  {
    image: hero3,
    title: "Our LED Solutions",
    description:
      "MAKc Automation's Smart LED lights for Home and innovative lighting solutions. Our commitment to providing exceptional lighting goes beyond mere illumination.",
    stat: "100%",
    statLabel: "Safety Assure",
  },
];

export default function AuthUI() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const emailInputRef = useRef(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { trigger: login, loading: isLoading } = useApiMutation();
  const dispatch = useDispatch();
  const companyImage = useSelector((state) => state.company?.companyImage);

  const loadingMessages = [
    "Setting things up...",
    "Checking credentials...",
    "Preparing dashboard...",
    "Almost there...",
  ];

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both username and password.");
      return;
    }

    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await login({
        url: LOGIN.postLogin,
        method: "post",
        data: formData,
      });

      if (res?.code === 200 || res?.code === 201) {
        const { UserInfo, version, year } = res;

        // Update Redux with latest company details available in login payload (if any)
        if (res.company_detils) {
          dispatch(setCompanyDetails(res.company_detils));
        }

        if (!UserInfo || !UserInfo.token) {
          toast.error("Login Failed: No token received.");
          return;
        }
        dispatch(
          setCredentials({
            token: UserInfo.token,
            user: UserInfo.user,
            version: version?.version_panel,
            currentYear: year?.current_year,
            tokenExpireAt: UserInfo.token_expires_at,
          }),
        );
      } else {
        toast.error(res.message || "Login Failed: Unexpected response.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const current = slides[slideIndex];

  // Get base URL for images from Redux
  const companyImageObj = companyImage?.find(
    (img) => img.image_for === "Company",
  );
  const baseUrl =
    companyImageObj?.image_url ||
    "https://agsdemo.in/macapi/public/assets/images/company_images/";

  // Get fallback "No Image" URL from Redux
  const noImageObj = companyImage?.find((img) => img.image_for === "No Image");
  const fallbackUrl =
    noImageObj?.image_url ||
    "https://agsdemo.in/macapi/public/assets/images/no_image.jpg";

  // Get logo path from the REDUX state
  const logoPath =
    useSelector((state) => state.company?.companyDetails?.company_logo) || "";

  // If we have a logoPath, append it to base URL. If not, use the explicit fallback URL.
  const logoUrl = logoPath ? `${baseUrl}${logoPath}` : fallbackUrl;

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Carousel current={current} slideIndex={slideIndex} slides={slides} />
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 py-12 relative overflow-hidden"
        style={{ background: "hsl(173.4, 18%, 97%)" }}
      >
        <div
          className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top right, hsl(173.4,80.4%,40%,0.13) 0%, transparent 65%)",
          }}
        />

        <div
          className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at bottom left, hsl(173.4,80.4%,40%,0.10) 0%, transparent 65%)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(173.4,50%,60%) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          className="max-w-sm w-full relative z-10 rounded-2xl px-8 py-10"
          style={{
            background: "#ffffff",
            boxShadow:
              "0 4px 6px hsl(173.4,40%,40%,0.04), 0 12px 40px hsl(173.4,40%,40%,0.10), 0 1px 2px hsl(173.4,40%,40%,0.06)",
            border: "1px solid hsl(173.4, 30%, 92%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 flex justify-center"
          >
            <img
              src={logoUrl}
              alt="MAKc Logo"
              className="h-[100px] w-[150px]"
            />
          </motion.div>
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            emailInputRef={emailInputRef}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-5 text-[11px]"
          style={{ color: "hsl(173.4, 25%, 58%)" }}
        >
          © 2026 AG Solutions — All Rights Reserved
        </motion.p>
      </motion.div>
    </div>
  );
}
