import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  emailInputRef,
  handleSubmit,
  isLoading,
  loadingMessage,
}) {
  const teal = "hsl(173.4, 80.4%, 40%)";
  const tealLight = "hsl(173.4, 80.4%, 95%)";
  const tealDark = "hsl(173.4, 80.4%, 28%)";

  const navigate = useNavigate();

  return (
    <div>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h1
          className="text-3xl font-bold mb-1.5"
          style={{ color: "hsl(173.4,50%,12%)", letterSpacing: "-0.02em" }}
        >
          Welcome back
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Username */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label
              className="block text-xs font-semibold mb-2 tracking-wider uppercase"
              style={{ color: "hsl(173.4,30%,40%)" }}
            >
              Username
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="text"
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: "hsl(173.4,30%,97%)",
                  border: "1.5px solid hsl(173.4,30%,88%)",
                  color: "hsl(173.4,50%,12%)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = teal;
                  e.target.style.boxShadow = `0 0 0 3px hsl(173.4,80.4%,40%,0.12)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(173.4,30%,88%)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label
              className="block text-xs font-semibold mb-2 tracking-wider uppercase"
              style={{ color: "hsl(173.4,30%,40%)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: "hsl(173.4,30%,97%)",
                  border: "1.5px solid hsl(173.4,30%,88%)",
                  color: "hsl(173.4,50%,12%)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = teal;
                  e.target.style.boxShadow = `0 0 0 3px hsl(173.4,80.4%,40%,0.12)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(173.4,30%,88%)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                style={{ color: "hsl(173.4,40%,55%)" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          {/* Forgot password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end"
            onClick={() => navigate("/forgot-password")}
          >
            <button
              type="button"
              className="text-xs font-medium transition-colors"
              style={{ color: teal }}
              onMouseEnter={(e) => (e.target.style.color = tealDark)}
              onMouseLeave={(e) => (e.target.style.color = teal)}
            >
              Forgot password?
            </button>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.015 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: isLoading
                  ? "hsl(173.4,80.4%,50%)"
                  : `linear-gradient(135deg, hsl(173.4,80.4%,40%) 0%, hsl(173.4,80.4%,32%) 100%)`,
                color: "white",
                boxShadow: isLoading
                  ? "none"
                  : "0 4px 20px hsl(173.4,80.4%,40%,0.35)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <motion.span
                    key={loadingMessage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {loadingMessage}
                  </motion.span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
