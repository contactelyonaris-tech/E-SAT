import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { Home, RotateCcw } from "lucide-react";

// Define variant types
type ContainerVariants = Variants & {
  hidden: { opacity: number };
  visible: {
    opacity: number;
    transition: {
      staggerChildren: number;
      delayChildren: number;
    };
  };
};

type ItemVariants = Variants & {
  hidden: { y: number; opacity: number };
  visible: {
    y: number;
    opacity: number;
    transition: {
      type: "spring" | "tween" | "inertia" | "keyframes" | "just" | undefined;
      stiffness?: number;
      damping?: number;
    };
  };
};

type NumberVariants = Variants & {
  initial: { scale: number };
  hover: {
    scale: number[];
    rotate: number[];
    transition: {
      duration: number;
      repeat: number | "infinite" | "reverse" | "mirror";
      repeatType: "loop" | "reverse" | "mirror" | undefined;
    };
  };
};

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const containerVariants: ContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: ItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const numberVariants: NumberVariants = {
    initial: { scale: 1 },
    hover: {
      scale: [1, 1.1, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e0a] via-[#0f4a0f] to-[#0a2e0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-green-400/10"
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center max-w-2xl mx-auto p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-green-500/20 shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-[#d4f4dd] text-9xl font-bold mb-4"
          variants={numberVariants}
          initial="initial"
          animate="hover"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          404
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-[#d4f4dd] mb-6"
          variants={itemVariants}
        >
          Oops! Page Not Found
        </motion.h1>
        
        <motion.p 
          className="text-xl text-[#d4f4dd]/80 mb-8"
          variants={itemVariants}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4"
          variants={itemVariants}
        >
          <Button
            onClick={handleGoBack}
            className="bg-white text-green-700 hover:bg-gray-100 px-6 py-6 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-6 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Button>
        </motion.div>
        
        <motion.div 
          className="mt-8 text-sm text-[#d4f4dd]/50"
          variants={itemVariants}
        >
          Tried to access: <span className="font-mono bg-black/20 px-2 py-1 rounded">{location.pathname}</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
