import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOffline } from "@/hooks/useOffline";

export function OfflineIndicator() {
  const isOffline = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Viewing cached content.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
