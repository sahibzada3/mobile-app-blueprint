import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Sparkles, Zap, Users, Trophy, Type, ChevronRight } from "lucide-react";

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  route: string;
  gradient: string;
  iconGlow: string;
}

const features: Feature[] = [
  {
    id: "camera",
    icon: Camera,
    title: "Capture",
    description: "Take cinematic photos with smart filters",
    action: "Open Camera",
    route: "/camera",
    gradient: "from-cyan-500/20 via-cyan-400/10 to-transparent",
    iconGlow: "shadow-[0_0_20px_rgba(6,182,212,0.4)]"
  },
  {
    id: "editor",
    icon: Type,
    title: "Add Words",
    description: "Overlay poetry & quotes on your photos",
    action: "Open Editor",
    route: "/editor",
    gradient: "from-violet-500/20 via-purple-400/10 to-transparent",
    iconGlow: "shadow-[0_0_20px_rgba(139,92,246,0.4)]"
  },
  {
    id: "flare",
    icon: Zap,
    title: "Give Flares",
    description: "Double-tap photos to show appreciation",
    action: "View Feed",
    route: "/feed",
    gradient: "from-orange-500/20 via-amber-400/10 to-transparent",
    iconGlow: "shadow-[0_0_20px_rgba(249,115,22,0.4)]"
  },
  {
    id: "spotlight",
    icon: Users,
    title: "Flare Chains",
    description: "Collaborate with friends on photo chains",
    action: "Start Chain",
    route: "/spotlight",
    gradient: "from-pink-500/20 via-rose-400/10 to-transparent",
    iconGlow: "shadow-[0_0_20px_rgba(236,72,153,0.4)]"
  },
  {
    id: "challenges",
    icon: Trophy,
    title: "Challenges",
    description: "Compete with friends in photo challenges",
    action: "Join Challenge",
    route: "/challenges",
    gradient: "from-emerald-500/20 via-green-400/10 to-transparent",
    iconGlow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

export default function AppFeaturesGuide() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center gap-2"
        variants={itemVariants}
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>
        <h2 className="text-base font-display font-bold text-foreground tracking-tight">
          What You Can Do
        </h2>
      </motion.div>
      
      <motion.div className="grid grid-cols-2 gap-3" variants={containerVariants}>
        {features.slice(0, 4).map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 cursor-pointer group`}
              onClick={() => navigate(feature.route)}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Animated glow on hover */}
              <motion.div 
                className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
              />
              
              <div className="relative z-10 space-y-3">
                <motion.div 
                  className={`w-11 h-11 rounded-xl bg-background/80 backdrop-blur-md flex items-center justify-center ${feature.iconGlow} group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className="w-5 h-5 text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Full-width challenges feature */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-4 cursor-pointer group"
        onClick={() => navigate(features[4].route)}
      >
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${features[4].gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
        
        <div className="relative z-10 flex items-center gap-4">
          <motion.div 
            className={`w-12 h-12 rounded-xl bg-background/80 backdrop-blur-md flex items-center justify-center ${features[4].iconGlow}`}
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity
            }}
          >
            <Trophy className="w-6 h-6 text-primary" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{features[4].title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {features[4].description}
            </p>
          </div>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="w-5 h-5 text-primary/60" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
