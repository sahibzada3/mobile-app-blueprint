import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      // Animate from previous to new value
      const diff = value - prevValue;
      const duration = Math.min(Math.abs(diff) * 50, 500); // Max 500ms
      const steps = Math.abs(diff);
      const increment = diff / steps;
      let current = prevValue;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += increment;
        setDisplayValue(Math.round(current));

        if (step >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
          setPrevValue(value);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [value, prevValue]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={displayValue}
        initial={{ scale: 1.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={className}
      >
        {displayValue}
      </motion.span>
    </AnimatePresence>
  );
}
