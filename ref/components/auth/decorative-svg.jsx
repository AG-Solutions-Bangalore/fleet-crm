import { motion } from "framer-motion";

export default function DecorativeSVG() {
  return (
    <svg
      className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none"
      viewBox="0 0 200 200"
    >
      <defs>
        <linearGradient id="decorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="url(#decorGrad)"
        strokeWidth="1"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}
