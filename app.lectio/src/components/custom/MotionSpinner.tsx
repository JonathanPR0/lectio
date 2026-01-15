import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const MotionSpinner = ({ className }: { className?: string }) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(
        "h-4 w-4 border-2 border-primary border-b-transparent rounded-full",
        className,
      )}
    ></motion.div>
  );
};
