import { AnimatePresence, motion } from "framer-motion";

export default function Carousel({ current, slideIndex, slides }) {
  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="hidden lg:flex lg:w-[55%] relative flex-col overflow-hidden"
      style={{ background: "hsl(173.4, 80.4%, 40%)" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slideIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, hsl(173.4,80.4%,20%,0.3) 0%, hsl(173.4,80.4%,15%,0.85) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        viewBox="0 0 600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="hex"
            x="0"
            y="0"
            width="60"
            height="52"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="30,2 58,17 58,47 30,62 2,47 2,17"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="600" height="900" fill="url(#hex)" />
      </svg>

      <div className="relative z-10 p-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white text-sm font-medium tracking-wide">
            MAKc 
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-auto p-10 pb-12">
        <div className="flex gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              className="transition-all duration-300"
              style={{
                width: i === slideIndex ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background:
                  i === slideIndex ? "white" : "rgba(255,255,255,0.35)",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              {current.title}
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-sm mb-8">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Stats row */}
        <div className="flex gap-8">
          {slides.map((s, i) => (
            <motion.div
              key={i}
              animate={{ opacity: i === slideIndex ? 1 : 0.4 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-2xl font-bold text-white">{s.stat}</div>
              <div className="text-white/60 text-xs mt-0.5">{s.statLabel}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
