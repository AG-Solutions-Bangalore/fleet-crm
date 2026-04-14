import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function CarouselButtons({ handleCarouselChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex gap-3 justify-center mt-8"
    >
      <motion.button
        onClick={() => handleCarouselChange("left")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center"
      >
        <ArrowLeft size={20} />
      </motion.button>
      <motion.button
        onClick={() => handleCarouselChange("right")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all flex items-center justify-center"
      >
        <ArrowRight size={20} />
      </motion.button>
    </motion.div>
  );
}
