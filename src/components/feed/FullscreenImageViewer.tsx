import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface FullscreenImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  caption?: string | null;
  username?: string;
}

export const FullscreenImageViewer = ({
  isOpen,
  onClose,
  imageUrl,
  caption,
  username,
}: FullscreenImageViewerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onClick={onClose}
        >
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt={caption || "Photo"}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Caption Overlay */}
          {caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white text-sm">
                <span className="font-semibold mr-2">{username}</span>
                <span>{caption}</span>
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
